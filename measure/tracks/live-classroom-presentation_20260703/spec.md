# Specification: Live Classroom Presentation

**Track type:** feature
**Spec mode:** story
**Created:** 2026-07-03

## Overview

Enable a teacher to present a lesson to their class with every student's screen
synchronized to the teacher's current phase, step, and activity reveal level in
real time. Students follow along but can still interact with the activity on the
current step locally. The teacher can navigate, control solution reveals, and
broadcast inline annotations. Sessions end explicitly or after an idle period.

**Sprint Goal:** A teacher can present lesson phases/steps to the whole class and
every student's screen stays synchronized to the teacher's current step in real time.

## Architecture Summary

- **Transport:** Convex reactive queries/mutations. A `live_sessions` table holds
  the authoritative session state (classId, teacherId, lessonId, current phase,
  current step, reveal level, status, timestamps). Enrolled students subscribe via
  a reactive query keyed by their class; teacher mutations update the row and all
  subscribers re-render automatically. Annotations stored as a related table or
  JSON field on the session.
- **Auth/authorization:** Teacher-only mutations (start/navigate/reveal/annotate/end)
  guarded by existing `lib/auth` role checks. Students read the session for their
  own class only.
- **Student autonomy:** Students render the shared phase/step/reveal from the
  subscribed session; local activity interaction (answers, drags, exploration) is
  captured and autosaved per-student without mutating the shared session state.
  When the teacher advances, the student follows, preserving in-flight input.

## Stories

### Story S1: Teacher starts a live session
**As a** teacher
**I want** to start a live presentation session for one of my classes and select a lesson
**So that** my students can join a synchronized view of the lesson I am presenting.

**Acceptance Criteria:**
- Given a teacher who is on the roster of a class, When they click "Start Live Lesson" and pick a lesson, Then a `live_sessions` row is created for that class, the teacher enters presenter mode at the lesson's first phase/step, and enrolled students see a "join live session" prompt.
- Given a lesson is selected, When the session starts, Then the initial state (lessonId, phaseNumber, stepId, revealLevel=0, status=active, startedAt, lastActivityAt) is broadcast via Convex.
- Given an active session already exists for a class, When the teacher tries to start another, Then the attempt is rejected and the teacher is offered to resume the existing session.

**Estimate:** M
**Priority:** Must

### Story S2: Students auto-join and follow the teacher
**As a** student
**I want** to automatically join my teacher's live lesson and see the same phase/step as the teacher
**So that** I can follow along with the classroom presentation without navigating myself.

**Acceptance Criteria:**
- Given an active live session for the student's class, When the student opens the app, Then they see a "Your teacher started a live lesson" prompt and can join.
- Given a student has joined, When the teacher advances phase/step, Then the student's view updates to the new phase/step within 2 seconds.
- Given a student disconnects and reconnects, When they rejoin, Then they land on the teacher's current phase/step/reveal level.
- Given a student is viewing the live session, When the teacher ends the session, Then the student sees a "session ended" state within 2 seconds.

**Estimate:** L
**Priority:** Must

### Story S3: Teacher navigates and controls activity reveal
**As a** teacher
**I want** to advance through phases and steps and reveal solution steps one at a time
**So that** I can pace the lesson and control what the class sees.

**Acceptance Criteria:**
- Given presenter mode, When the teacher clicks Next/Previous, Then the phase/step advances and all followers update within 2 seconds.
- Given the current step is a multi-step activity (e.g., worked example), When the teacher clicks "Reveal next step", Then the next solution/intermediate step becomes visible to all followers and the reveal level increments.
- Given any step in the current lesson, When the teacher clicks a phase dot to jump, Then all followers jump to that phase's first step.
- Given a reveal has been advanced, When the teacher clicks "Hide steps", Then the reveal level resets to 0 for all followers.

**Estimate:** L
**Priority:** Must

### Story S4: Students locally interact while synced
**As a** student
**I want** to answer and interact with the activity on the current step while still following the teacher
**So that** I can practice without disrupting the synchronized presentation.

**Acceptance Criteria:**
- Given the teacher is on a step with an interactive activity, When the student interacts (answer, drag, explore), Then the interaction is captured locally and does NOT advance the teacher's reveal level or shared state.
- Given the teacher advances while the student's local activity is in progress, When the student follows, Then the student's in-flight input is preserved/autosaved and the student lands on the teacher's new step.
- Given a student submits an answer locally, When the teacher is still on that step, Then the submission is recorded against the student's own progress without disrupting sync for others.

**Estimate:** M
**Priority:** Should

### Story S5: Teacher broadcasts inline annotations
**As a** teacher
**I want** to draw and highlight on the shared content
**So that** I can point out key parts of the lesson to the whole class.

**Acceptance Criteria:**
- Given presenter mode, When the teacher draws or highlights on the shared content, Then the annotation is broadcast and rendered on all students' screens within 2 seconds.
- Given an annotation exists, When the teacher clears it, Then the annotation is removed from all screens within 2 seconds.
- Given the teacher advances to a new step, When annotations are step-scoped, Then previous step annotations are cleared and new-step annotation state begins clean.

**Estimate:** M
**Priority:** Should

### Story S6: Session end (explicit and idle)
**As a** teacher
**I want** to end a live session explicitly and have idle sessions auto-end
**So that** students return to their normal workflow and orphaned sessions do not linger.

**Acceptance Criteria:**
- Given an active session, When the teacher clicks "End Session", Then the session is marked ended and all students see a "session ended" state and return to their dashboard/lesson view within 2 seconds.
- Given an active session with no teacher navigation/annotation activity for the configured idle period, When the idle timeout fires, Then the session auto-ends with the same end behavior as an explicit end.
- Given a session has ended, When a student attempts to rejoin, Then they see "session has ended" and are routed to their normal view.

**Estimate:** M
**Priority:** Must

## Non-Functional Requirements

- **Latency:** Phase/step/reveal/annotation updates propagate to followers within 2 seconds under normal classroom load (<=40 concurrent students per session).
- **Authorization:** All session-state mutations require the authenticated teacher to be on the roster of the target class; students can only read the session for their own class.
- **Resilience:** Disconnected students can rejoin and resync to the current state; the session survives transient teacher disconnects and resumes on reconnect.
- **Observability:** Session lifecycle events (start, navigate, reveal, annotate, end, idle-end) are logged for teacher review.
- **Accessibility:** Presenter and follower views conform to the app's existing WCAG commitments (see `wcag-aa-remediation` track).

## Acceptance Criteria (track-level)

- A teacher can start, present, navigate, reveal, annotate, and end a live session for a class.
- Enrolled students auto-join and stay synchronized to the teacher's current phase/step/reveal within 2 seconds.
- Students can locally interact with the current step's activity without breaking sync.
- Sessions end explicitly or via idle timeout, returning students to their normal workflow.
- All new code passes `npm run lint`, `npx tsc --noEmit`, and the new vitest suite; existing tests remain green.

## Out of Scope

- Cross-class or cross-teacher presentation (one session = one class).
- Student-to-student collaboration or shared whiteboards.
- Audio/video streaming of the teacher.
- Polling/quizzing features built into the presentation (students' local submissions are captured per S4, but the teacher does not get a live aggregate view of student responses in this track).
- Reuse of the sync engine beyond IM3 lesson presentation.
- Offline-first replay of a past session.
