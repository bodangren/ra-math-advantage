# Teacher-Facing SRS Dashboard — Implementation Plan

## Phase 1: Class Health Queries

- [x] Task: Write `getClassSrsHealth` query tests
  - [x] Test returns total active students count
  - [x] Test returns students who practiced today count
  - [x] Test returns average class retention across all objectives
  - [x] Test handles empty class (no students, no cards)
  - [x] Test handles class with students but no SRS data yet
- [x] Task: Implement `getClassSrsHealth` Convex query
  - [x] Create `convex/teacher/srs-queries.ts`
  - [x] Query `srs_cards` with indexed lookup by class/section
  - [x] Aggregate active students, today's practitioners, average retention
  - [x] Use `srs_sessions` for practice-today count
- [x] Task: Write `getOverdueLoad` query tests
  - [x] Test returns total overdue cards across all students
  - [x] Test returns per-student overdue breakdown
  - [x] Test handles no overdue cards
  - [x] Test correctly identifies overdue (dueDate < now)
- [x] Task: Implement `getOverdueLoad` Convex query
  - [x] Query `srs_cards` filtered by overdue status
  - [x] Aggregate count by student
  - [x] Return total and per-student breakdown
- [x] Task: Write `getPracticeStreaks` query tests
  - [x] Test returns students sorted by streak length descending
  - [x] Test calculates streak from consecutive days in `srs_sessions`
  - [x] Test handles students with no sessions
  - [x] Test caps at top 5
- [x] Task: Implement `getPracticeStreaks` Convex query
  - [x] Query `srs_sessions` grouped by student
  - [x] Calculate consecutive-day streaks
  - [x] Return top 5 with student names and streak lengths
- [x] Task: Conductor - Phase Completion Verification 'Class Health Queries' (Protocol in workflow.md)

## Phase 2: Weak Objectives and Struggling Students

- [x] Task: Write `getWeakObjectives` query tests
  - [x] Test returns only objectives where <50% of class is proficient
  - [x] Test sorts by essential priority first, then proficiency ascending
  - [x] Test includes standard code, description, % proficient, avg retention, struggling student count
  - [x] Test handles all objectives proficient (empty result)
  - [x] Test handles no proficiency data yet
- [x] Task: Implement `getWeakObjectives` Convex query
  - [x] Call `getTeacherClassProficiency` (Track 10) for per-objective data
  - [x] Join with objective metadata for standard codes and descriptions
  - [x] Join with `objective_policies` for priority classification
  - [x] Filter to <50% proficient
  - [x] Sort: essential first, then proficiency ascending
- [x] Task: Write `getStrugglingStudents` query tests
  - [x] Test returns students ranked by urgency (overdue count, then avg retention)
  - [x] Test includes student name, overdue count, avg retention, weakest objective
  - [x] Test handles class with no struggling students
  - [x] Test limits to top 10 students
- [x] Task: Implement `getStrugglingStudents` Convex query
  - [x] Query `srs_cards` aggregated by student
  - [x] Calculate overdue count and average retention per student
  - [x] Identify weakest objective per student
  - [x] Sort by overdue descending, then retention ascending
  - [x] Join with `profiles` for student names
- [x] Task: Conductor - Phase Completion Verification 'Weak Objectives and Struggling Students' (Protocol in workflow.md) [checkpoint: d36e8fa]

## Phase 3: Misconception Diagnostics

- [x] Task: Write `getMisconceptionSummary` query tests
  - [x] Test aggregates misconceptionTags from review logs in last 7 days
  - [x] Test returns tags with frequency count and affected objectives
  - [x] Test sorts by frequency descending
  - [x] Test handles no misconception tags
  - [x] Test respects configurable time window
  - [x] Test deduplicates tags across reviews for same objective
- [x] Task: Implement `getMisconceptionSummary` Convex query
  - [x] Query `srs_review_log` filtered by date range (indexed)
  - [x] Extract and aggregate `misconceptionTags` from log entries
  - [x] Group by tag, count frequency, collect affected objectives
  - [x] Sort by frequency descending
  - [x] Accept `sinceDays` parameter (default 7)
- [x] Task: Conductor - Phase Completion Verification 'Misconception Diagnostics' (Protocol in workflow.md) [checkpoint: 7f8d2a1]

## Phase 4: Intervention Mutations

- [ ] Task: Write `updateObjectivePriority` mutation tests
  - [ ] Test changes essential → triaged in `objective_policies`
  - [ ] Test changes triaged → essential in `objective_policies`
  - [ ] Test validates teacher owns the class
  - [ ] Test rejects invalid priority values
- [ ] Task: Implement `updateObjectivePriority` Convex mutation
  - [ ] Create `convex/teacher/srs-mutations.ts`
  - [ ] Validate teacher identity via `ctx.auth.getUserIdentity()`
  - [ ] Validate teacher owns the class section
  - [ ] Update `objective_policies` priority field
- [ ] Task: Write `resetStudentCards` mutation tests
  - [ ] Test resets card state to new for specified objective and student
  - [ ] Test clears scheduling data (stability, difficulty, dueDate)
  - [ ] Test validates teacher owns the student's class
  - [ ] Test handles card not found (no-op)
- [ ] Task: Implement `resetStudentCards` Convex mutation
  - [ ] Find card in `srs_cards` by studentId + objectiveId
  - [ ] Reset state to "new", clear FSRS scheduling fields
  - [ ] Keep card identity (preserve _id)
  - [ ] Log reset action in `srs_review_log`
- [ ] Task: Write `addExtraCards` mutation tests
  - [ ] Test creates new card for student on specified objective
  - [ ] Test sets card state to new
  - [ ] Test validates teacher owns the student's class
  - [ ] Test rejects if card already exists for that objective
- [ ] Task: Implement `addExtraCards` Convex mutation
  - [ ] Check no existing card for student + objective
  - [ ] Create new `srs_cards` document with state "new"
  - [ ] Link to problem family from objective
  - [ ] Validate teacher authorization
- [ ] Task: Conductor - Phase Completion Verification 'Intervention Mutations' (Protocol in workflow.md)

## Phase 5: Dashboard UI Components

- [ ] Task: Create `SrsDashboardPanel` component
  - [ ] Create `components/teacher/srs/SrsDashboardPanel.tsx`
  - [ ] Render class health overview metrics using shadcn/ui cards
  - [ ] Show active students, avg retention, overdue load, practice streaks
  - [ ] Use recharts for retention trend sparkline
  - [ ] Responsive layout (grid on desktop, stack on tablet)
  - [ ] Accessible labels and ARIA attributes
- [ ] Task: Create `WeakObjectivesPanel` component
  - [ ] Create `components/teacher/srs/WeakObjectivesPanel.tsx`
  - [ ] Render table of weak objectives sorted by priority then proficiency
  - [ ] Show standard code, description, % proficient (color-coded), avg retention, struggling count
  - [ ] Allow click-through to misconception details
  - [ ] Use shadcn/ui Table component
- [ ] Task: Create `StrugglingStudentsPanel` component
  - [ ] Create `components/teacher/srs/StrugglingStudentsPanel.tsx`
  - [ ] Render ranked list of struggling students
  - [ ] Show student name, overdue count (badge), avg retention, weakest objective
  - [ ] Allow click-through to student detail SRS view
  - [ ] Use shadcn/ui Badge and Card components
- [ ] Task: Create `MisconceptionPanel` component
  - [ ] Create `components/teacher/srs/MisconceptionPanel.tsx`
  - [ ] Render bar chart of top misconceptions using recharts
  - [ ] Show frequency count and linked objectives per tag
  - [ ] Time window selector (7d, 14d, 30d)
- [ ] Task: Create intervention action components
  - [ ] Create `components/teacher/srs/InterventionActions.tsx`
  - [ ] Priority toggle button (essential ↔ triaged) per objective
  - [ ] Card reset dialog per student-objective pair
  - [ ] Extra cards dialog with confirmation
  - [ ] Use shadcn/ui Dialog, Button, and AlertDialog components
- [ ] Task: Create student detail SRS section
  - [ ] Create `components/teacher/srs/StudentSrsDetail.tsx`
  - [ ] Show card states per objective in a status grid (new/learning/review/relearning)
  - [ ] Show review history timeline (last 20 reviews)
  - [ ] Show timing patterns per objective
  - [ ] Show proficiency breakdown per objective
  - [ ] Integrate into existing student detail page at `app/teacher/students/`
- [ ] Task: Create SRS dashboard page
  - [ ] Create `app/teacher/dashboard/srs/page.tsx` (or integrate into existing dashboard)
  - [ ] Compose all SRS panels into dashboard layout
  - [ ] Server component with data fetching via Convex queries
  - [ ] Gate with `requireTeacherSessionClaims`
- [ ] Task: Write component tests
  - [ ] Test `SrsDashboardPanel` renders metrics from mock data
  - [ ] Test `WeakObjectivesPanel` renders sorted objective list
  - [ ] Test `StrugglingStudentsPanel` renders ranked students
  - [ ] Test `MisconceptionPanel` renders chart with time window
  - [ ] Test `InterventionActions` fires correct mutation on confirm
  - [ ] Test `StudentSrsDetail` renders card states and review history
- [ ] Task: Conductor - Phase Completion Verification 'Dashboard UI Components' (Protocol in workflow.md)

## Phase 6: Verification and Handoff

- [ ] Task: Run validation commands
  - [ ] Run focused teacher SRS dashboard tests
  - [ ] Run `npm run lint`
  - [ ] Run `npm run typecheck` or document known pre-existing failures
- [ ] Task: Update Conductor planning artifacts
  - [ ] Mark completed tasks and phases in this plan
  - [ ] Update `conductor/tracks.md`
- [ ] Task: Write junior developer handoff notes
  - [ ] Document the Convex query/mutation API surface for teacher SRS
  - [ ] Document component hierarchy and data flow
  - [ ] Document how to extend interventions in future tracks
  - [ ] Document known limitations and future considerations
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
