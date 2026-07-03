# Implementation Plan: Live Classroom Presentation

**Track type:** feature
**Spec mode:** story
**Created:** 2026-07-03
**Spec ref:** [./spec.md](./spec.md)

## Architecture Decisions

- **Transport:** Convex reactive queries/mutations over a new `live_sessions` table
  (and a `live_annotations` table for S5). Teacher mutations update the row; enrolled
  students subscribe by `classId`. No websockets/extra infra (Lessons: Convex runtime
  cannot import npm packages — keep validators in `convex/` and mirror types in `lib/`).
- **Contract:** Single canonical `lib/live-session/contract.ts` zod schema for session
  state (lessonId, phaseNumber, stepId, revealLevel, status) + annotations. Downstream
  imports from one surface (Lesson: single canonical contract module).
- **Query discipline:** Use `Promise.all` + `Map` for any class-roster lookups; never
  per-student sequential loops (Lessons: N+1 in Convex causes timeouts). Independent
  `.collect()` calls wrapped in `Promise.all`.
- **Auth:** Reuse `lib/auth` role guards. Teacher-only mutations verify the caller is on
  the class roster; student query verifies the student's class matches the session.
- **Path resolution in tests:** Resolve from the test file via `fileURLToPath`, never
  `process.cwd()` (Lesson: monorepo cwd != app dir).
- **Annotations:** Stored as a separate `live_annotations` table keyed by sessionId +
  stepId, cleared on step advance (S5 AC3). Keeps the session row small.

## Phase S1: Teacher starts a live session
_Story ref: spec.md#story-s1-teacher-starts-a-live-session_

- [ ] Task: Define live session contract & schema
    - [ ] Create `lib/live-session/contract.ts` with zod schemas for `LiveSessionState` (sessionId, classId, teacherId, lessonId, phaseNumber, stepId, revealLevel, status, startedAt, lastActivityAt, endedAt) and `SessionStatus` enum (`active | ended`)
    - [ ] Add `live_sessions` table to `convex/schema.ts` with indexes on `classId` (student lookup) and `teacherId` (teacher resume)
    - [ ] Export shared types from `lib/live-session/contract.ts`
- [ ] Task: Write tests for session-start contract and auth
    - [ ] Test zod schema accepts valid initial state and rejects missing/invalid fields
    - [ ] Test that startSession mutation rejects a caller not on the class roster
    - [ ] Test that startSession rejects when an active session already exists for the class
- [ ] Task: Implement startSession mutation and teacher presenter entry
    - [ ] Implement `convex/live-session.ts` `startSession` mutation (creates row with initial state, returns sessionId)
    - [ ] Implement `lib/live-session/server.ts` `startLiveSession` wrapper with admin auth
    - [ ] Add presenter route `app/teacher/lessons/[lessonSlug]/live/page.tsx` that calls startSession on mount and renders presenter shell at phase 1 / step 0 / revealLevel 0
    - [ ] Add "Start Live Lesson" entry button on `app/teacher/lessons/page.tsx` class selector
- [ ] Task: Generate Docs & Doctor
    - [ ] Run `measure/generate.sh` to refresh generated architecture facts
    - [ ] Run `measure/doctor.sh` and resolve any boundary violations
    - [ ] Verify `npm run lint` and `npx tsc --noEmit` pass
- [ ] Task: Measure - User Manual Verification 'Phase S1: Teacher starts a live session' (Protocol in workflow.md)

## Phase S2: Students auto-join and follow the teacher
_Story ref: spec.md#story-s2-students-auto-join-and-follow-the-teacher_

- [ ] Task: Define student subscription contract
    - [ ] Add `LiveSessionFollowerView` zod schema (the projection a student subscribes to: phaseNumber, stepId, revealLevel, status, teacherName, lessonTitle)
    - [ ] Define the reactive query shape: `getLiveSessionForClass(classId)`
- [ ] Task: Write tests for student join and follow
    - [ ] Test that a student with a class that has an active session receives the session state via the reactive query
    - [ ] Test that a student whose class has no active session receives null
    - [ ] Test reconnection: a rejoining student lands on the teacher's current phase/step/reveal
    - [ ] Test that updates propagate within the 2s latency budget (mock time-advance assertion)
- [ ] Task: Implement student follower view and join prompt
    - [ ] Implement `getLiveSessionForClass` query in `convex/live-session.ts` (indexed by classId, returns follower projection)
    - [ ] Implement `components/live-session/FollowerView.tsx` that subscribes via `useQuery` and renders the shared phase/step/reveal
    - [ ] Implement `components/live-session/LiveSessionPrompt.tsx` ("Your teacher started a live lesson" join prompt) surfaced from the student dashboard
    - [ ] Wire student dashboard to show the prompt when `getLiveSessionForClass` returns an active session
- [ ] Task: Generate Docs & Doctor
    - [ ] Run `measure/generate.sh`
    - [ ] Run `measure/doctor.sh`
    - [ ] Verify `npm run lint` and `npx tsc --noEmit` pass
- [ ] Task: Measure - User Manual Verification 'Phase S2: Students auto-join and follow the teacher' (Protocol in workflow.md)

## Phase S3: Teacher navigates and controls activity reveal
_Story ref: spec.md#story-s3-teacher-navigates-and-controls-activity-reveal_

- [ ] Task: Define navigation & reveal contract
    - [ ] Extend `LiveSessionState` with `revealLevel` and step model (derive max reveal per activity type)
    - [ ] Add zod schemas for `navigateToPhase`, `navigateToStep`, `revealNext`, `hideSteps` mutation inputs
- [ ] Task: Write tests for navigation and reveal mutations
    - [ ] Test `navigateToPhase` updates phaseNumber/stepId and resets revealLevel to 0
    - [ ] Test `revealNext` increments revealLevel up to the activity's max and is idempotent at max
    - [ ] Test `hideSteps` resets revealLevel to 0
    - [ ] Test that only the session's teacher can call these mutations (auth guard)
    - [ ] Test that `lastActivityAt` is bumped on every navigation/reveal mutation
- [ ] Task: Implement presenter navigation controls
    - [ ] Implement `navigateToPhase`, `navigateToStep`, `revealNext`, `hideSteps` mutations in `convex/live-session.ts`
    - [ ] Implement `components/live-session/PresenterControls.tsx` (Next/Prev/Jump-to-phase/Reveal next/Hide steps)
    - [ ] Wire `PresenterControls` into the presenter route; reflect current phase/step/reveal in `LessonStepper`
    - [ ] Update `FollowerView` to honor `revealLevel` (render only the first N solution steps)
- [ ] Task: Generate Docs & Doctor
    - [ ] Run `measure/generate.sh`
    - [ ] Run `measure/doctor.sh`
    - [ ] Verify `npm run lint` and `npx tsc --noEmit` pass
- [ ] Task: Measure - User Manual Verification 'Phase S3: Teacher navigates and controls activity reveal' (Protocol in workflow.md)

## Phase S4: Students locally interact while synced
_Story ref: spec.md#story-s4-students-locally-interact-while-synced_

- [ ] Task: Define local-interaction preservation contract
    - [ ] Document the rule: local activity state is per-student, never written to `live_sessions`
    - [ ] Define an autosave hook signature that persists in-flight student input to the existing submission/progress tables on teacher-advance
- [ ] Task: Write tests for local interaction preservation
    - [ ] Test that a student's local answer does not mutate the shared session's revealLevel or stepId
    - [ ] Test that when the teacher advances, the student's in-flight input is autosaved before the view switches
    - [ ] Test that a locally submitted answer is recorded against the student's progress without affecting other followers
- [ ] Task: Implement local interaction preservation in FollowerView
    - [ ] Add local activity state to `FollowerView` (isolated from subscribed session state)
    - [ ] Add an effect that autosaves in-flight input when the subscribed phase/step changes (use a ref to capture pending input)
    - [ ] Wire local submissions through the existing practice.v1 submission pipeline (`lib/practice/contract.ts`)
    - [ ] Ensure local interaction UI (answer input, drag) is enabled on the current step's activity
- [ ] Task: Generate Docs & Doctor
    - [ ] Run `measure/generate.sh`
    - [ ] Run `measure/doctor.sh`
    - [ ] Verify `npm run lint` and `npx tsc --noEmit` pass
- [ ] Task: Measure - User Manual Verification 'Phase S4: Students locally interact while synced' (Protocol in workflow.md)

## Phase S5: Teacher broadcasts inline annotations
_Story ref: spec.md#story-s5-teacher-broadcasts-inline-annotations_

- [ ] Task: Define annotation contract & schema
    - [ ] Add `live_annotations` table to `convex/schema.ts` (sessionId, stepId, annotation payload, createdAt, clearedAt)
    - [ ] Add zod schema for `LiveAnnotation` (poly shape: path points, highlight rect, text) in `lib/live-session/contract.ts`
    - [ ] Define `addAnnotation`, `clearAnnotations` mutation input schemas
- [ ] Task: Write tests for annotation broadcast and lifecycle
    - [ ] Test that `addAnnotation` creates a row visible to all followers of the session
    - [ ] Test that `clearAnnotations` sets `clearedAt` and followers no longer render it
    - [ ] Test that advancing to a new step clears that step's annotations (S5 AC3) — verify via a step-advance hook
    - [ ] Test auth: only the session's teacher can add/clear annotations
- [ ] Task: Implement annotation layer and broadcast
    - [ ] Implement `addAnnotation`, `clearAnnotations`, `getAnnotationsForSession` in `convex/live-session.ts`
    - [ ] Implement `components/live-session/AnnotationLayer.tsx` (canvas/SVG overlay rendering annotations from the reactive query)
    - [ ] Add teacher drawing controls in `PresenterControls` (draw/highlight/clear) writing via `addAnnotation`/`clearAnnotations`
    - [ ] Render `AnnotationLayer` in both presenter and follower views, scoped to the current step
    - [ ] Add a navigation hook in `navigateToPhase`/`navigateToStep` that clears the prior step's annotations
- [ ] Task: Generate Docs & Doctor
    - [ ] Run `measure/generate.sh`
    - [ ] Run `measure/doctor.sh`
    - [ ] Verify `npm run lint` and `npx tsc --noEmit` pass
- [ ] Task: Measure - User Manual Verification 'Phase S5: Teacher broadcasts inline annotations' (Protocol in workflow.md)

## Phase S6: Session end (explicit and idle)
_Story ref: spec.md#story-s6-session-end-explicit-and-idle_

- [ ] Task: Define session-end contract
    - [ ] Extend `SessionStatus` with `ended`; add `endedAt` and `endReason` (`explicit | idle`) to `LiveSessionState`
    - [ ] Define `endSession` mutation input schema and the idle-timeout configuration (env or constant)
- [ ] Task: Write tests for explicit and idle end
    - [ ] Test that `endSession` sets status=ended, endedAt, endReason=explicit and all followers see ended state
    - [ ] Test that a scheduled idle check ends a session whose `lastActivityAt` is older than the idle period
    - [ ] Test that a session with recent activity is NOT ended by the idle check
    - [ ] Test that a student attempting to rejoin an ended session sees "session has ended" and is routed to their normal view
    - [ ] Test auth: only the session's teacher can call `endSession`
- [ ] Task: Implement session end and idle cleanup
    - [ ] Implement `endSession` mutation in `convex/live-session.ts`
    - [ ] Implement an idle-end scheduled mutation (Convex cron) that scans active sessions and ends those past the idle threshold
    - [ ] Add "End Session" control to `PresenterControls`
    - [ ] Update `FollowerView` to render the "session ended" state and route the student back to their dashboard/lesson
    - [ ] Update `LiveSessionPrompt` to show "session has ended" for ended sessions
    - [ ] Register the idle-end cron in `convex/crons.ts`
- [ ] Task: Generate Docs & Doctor
    - [ ] Run `measure/generate.sh`
    - [ ] Run `measure/doctor.sh`
    - [ ] Verify `npm run lint` and `npx tsc --noEmit` pass
- [ ] Task: Measure - User Manual Verification 'Phase S6: Session end (explicit and idle)' (Protocol in workflow.md)
