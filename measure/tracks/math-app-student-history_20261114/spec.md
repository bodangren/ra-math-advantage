# Track: Unified Math App: Multi-Year Student History

Type: Feature
Spec format: Story-shaped (one story for each phase)
Depends on: `math-app-retire-old-apps_20261114`

## Overview

This track gives each student one history across courses and academic years in the unified
math app. Each enrollment keeps its course and year. An admin closes an academic year with
a rollover. Teachers see their classes by year. The knowledge state of a course uses the
evidence from the earlier courses of the student, through the cross-course edges and the
transfer-credit runtime that exist.

Sprint goal: a student keeps one account and one history from IM1 to AP Precalculus, and
each course uses what the student learned in the earlier courses.

## Track Set

This track is member 4 of the track set [Unified Math App](../../sets/unified-math-app_20261114.md). Depends on: `math-app-retire-old-apps_20261114`. The shared decisions and the start gate in the set overview apply to this track.

## Current System (expected at the start; facts checked 2026-11-14)

- **One account:** a student is one `profiles` row (`organizationId`, `username`, `role`).
  After the base track, the four courses use one Convex backend, so one profile can enroll
  in classes of each course.
- **Classes:** after the base track, `classes` has a required `courseKey` and a required
  `academicYear` (`YYYY-YYYY`), the index `by_course`, and `archived`.
- **Enrollments:** `class_enrollments` has `classId`, `studentId`, `enrolledAt`, `status`
  (`active`, `withdrawn`, `completed`), and the indexes `by_class`, `by_student`, and
  `by_class_and_student`. It has no end date. `convex/onboarding/roster-import.ts:166` and
  the seeds insert enrollments.
- **Evidence:** `srs_cards`, `srs_review_log`, `student_competency`, and the practice tables
  are keyed by `studentId`. After the base track, each objective ID is a namespaced code, so
  the evidence of each course stays apart.
- **Transfer credit:** `packages/knowledge-space-core/src/transfer-credit.ts` has
  `computeTransferCredit`, `batchComputeTransferCredit`, and `TRANSFER_POLICY_DEFAULT`.
  `transfer-eligibility.ts`, `transfer-skip.ts`, and `transfer-teacher-audit.ts` complete
  the runtime. `apps/math/lib/transfer-credit/student-skip.ts` uses it.
- **Cross-course edges:** `packages/math-content/src/knowledge-space/cross-course-edges.json`
  joins the course graphs. No runtime code loads it: only
  `scripts/generate-cross-course-edges.ts` writes it, and the package `exports` of
  `packages/math-content` do not export it. `loadCourseGraph(courseKey)` (base track)
  returns one course graph.
- **Teacher pages:** `/teacher/dashboard` (`getTeacherDashboardData`,
  `convex/teacher.ts:278`) shows the students of the organization, not the classes. The
  class list is on `/teacher/dashboard/srs` (`getTeacherSrsDashboardData`,
  `convex/teacher.ts:1493`). That query reads the classes `by_teacher` (line 1507) and drops
  the archived classes. It has no year filter.
- **Organization of a class:** `classes` has no `organizationId`. The organization of a
  class is the `organizationId` of its teacher profile. `profiles` has the index
  `by_organization`.
- **Roster import:** `convex/onboarding/roster-import.ts` (lines 152 to 160) skips a student
  who has an enrollment of any status in the class, and counts the row as skipped.
- **Parent links:** `parent_links` has the status `active`, `revoked`, or `pending`.

## Decisions (defaults of 2026-11-14)

- **D1 Year boundary:** an academic year starts on July 1. `currentAcademicYear(now)`
  returns `2026-2027` for each date from 2026-07-01 to 2027-06-30.
- **D2 One active class for each course and year:** a student has at most one `active`
  enrollment in the classes of one course and one academic year. A move to another section
  withdraws the old enrollment first. When the student already has an enrollment of any
  status in the same class, `enrollStudent` returns that enrollment and writes nothing; the
  roster import counts the row as skipped, as it does today. A reactivation of a
  `withdrawn` or `completed` enrollment is out of scope.
- **D3 End date:** `class_enrollments` gets an optional `endedAt`. A change of the status to
  `withdrawn` or `completed` sets it. Two code paths change a status: the new mutation
  `withdrawEnrollment({ enrollmentId })` sets `withdrawn`, and the rollover (D4) sets
  `completed`. No other code changes a status.
- **D3a Withdrawal:** `withdrawEnrollment` is in `convex/enrollment.ts`. The caller is the
  teacher of the class of the enrollment, or an admin of the organization of that class.
  It changes only an `active` enrollment; for a `withdrawn` or `completed` enrollment it
  returns the enrollment and writes nothing. The page
  `/teacher/students/[studentId]/history` shows a "Withdraw" action on each `active` row,
  only to these callers. A move to another section is two steps: the withdrawal, then a new
  enrollment. `enrollStudent` never withdraws an enrollment.
- **D4 Rollover:** the rollover sets each `active` enrollment of the closed year to
  `completed`, sets `endedAt`, and archives the classes of the closed year. It makes no new
  class and no new enrollment. It deletes no evidence. The rollover changes only the
  classes of the organization of the admin: the classes whose teacher profile has that
  `organizationId`. It reads the teacher profiles with `by_organization`, then their
  classes with `by_teacher`.
- **D5 Who can see a history:** the student, each teacher of a class of the student in the
  same organization, each parent with an `active` parent link to the student, and each
  admin of the organization. A `pending` or `revoked` link gives no access.
- **D6 Earlier courses:** for course C, an earlier course is each other course in which the
  student has evidence. The knowledge state of course C uses the evidence of each earlier
  course through the cross-course edges, with `TRANSFER_POLICY_DEFAULT`. When a skill of C
  also has direct evidence, the rules of `computeTransferCredit` decide, with no change.
- **D7 Edge source at runtime:** `packages/math-content/src/knowledge-space/index.ts`
  exports `CROSS_COURSE_EDGES` (the content of `cross-course-edges.json`).
  `apps/math/lib/curriculum/skill-graph-loader.ts` gets
  `loadCrossCourseEdges(courseKey)`, which returns the edges whose target node is a node of
  that course. `getKnowledgeState` reads the edges only through this function.
- **D8 Year filter page:** the year filter goes on `/teacher/dashboard/srs`, the page that
  lists the classes, through `getTeacherSrsDashboardData`. `/teacher/dashboard` does not
  change.

## Stories

### Story S1: Enrollment history by academic year
**As a** student or a teacher
**I want** each enrollment to keep its course, its academic year, and its dates
**So that** the history shows which course the student took in which year

**Acceptance Criteria:**
- Given a student with a `completed` IM1 enrollment in `2025-2026` and an `active` IM2 enrollment in `2026-2027`, When the student opens `/student/history`, Then the page shows two rows in year order, with the course title, the class name, the status, and the dates.
- Given a teacher of the IM2 class, When the teacher opens `/teacher/students/[studentId]/history`, Then the page shows the same two rows.
- Given a teacher with no class of the student, When the teacher opens that page, Then the app returns the forbidden response, and the history query returns no row.
- Given a student with an `active` enrollment in an `im2` class of `2026-2027`, When a teacher or a roster import enrolls the student in another `im2` class of `2026-2027`, Then the enrollment fails with the message "The student already has an active class for this course and year", and nothing is written.
- Given a student with a `withdrawn` enrollment in a class, When a roster import lists the student for the same class again, Then the row counts as skipped, and nothing is written.
- Given a parent with a `pending` or `revoked` link to the student, When the parent asks for the history, Then the query returns no row.
- Given an enrollment, When its status changes to `withdrawn` or `completed`, Then `endedAt` is set.
- Given the teacher of the class of an `active` enrollment, When the teacher uses the "Withdraw" action on `/teacher/students/[studentId]/history`, Then the enrollment is `withdrawn` with `endedAt`. Given a teacher of another class, When that teacher calls `withdrawEnrollment`, Then it fails with an authorization error and writes nothing.

**Estimate:** M
**Priority:** Must

### Story S2: Academic year rollover
**As an** admin
**I want** to close an academic year in one action
**So that** the classes and enrollments of the old year become history with no data loss

**Acceptance Criteria:**
- Given `active` enrollments in classes of `2025-2026`, When an admin runs the rollover from `2025-2026` to `2026-2027`, Then each of these enrollments is `completed` with `endedAt`, and each class of `2025-2026` of the admin's organization is archived.
- Given a class of `2025-2026` whose teacher is in another organization, When the admin runs the rollover, Then that class and its enrollments do not change.
- Given the rollover is complete, When the evidence tables are counted, Then each count equals its count before the rollover.
- Given the rollover is complete, When the admin runs it again, Then it changes no row.
- Given a teacher, When the teacher calls the rollover, Then it is forbidden and changes no row.
- Given the years `2025-2026` and `2027-2028`, When an admin calls the rollover, Then it fails, because the second year is not the next year.
- Given the admin page `/admin/years`, When the admin selects a year to close, Then the page shows the counts of the dry run before the admin confirms.

**Estimate:** M
**Priority:** Must

### Story S3: Teacher views by year
**As a** teacher
**I want** my classes filtered by academic year
**So that** I see the work of this year first and the old years as history

**Acceptance Criteria:**
- Given classes in `2025-2026` and `2026-2027`, When the teacher opens `/teacher/dashboard/srs` on 2026-11-14, Then it shows the classes of `2026-2027`, and the year selector lists both years.
- Given the teacher selects `2025-2026`, When the page renders, Then it shows the archived classes of that year with no edit action.
- Given `currentAcademicYear`, When it gets 2026-11-14, 2027-06-30, and 2027-07-01, Then it returns `2026-2027`, `2026-2027`, and `2027-2028`.

**Estimate:** S
**Priority:** Should

### Story S4: Knowledge state from earlier courses
**As a** student in a later course
**I want** my mastery from earlier courses to count in the new course
**So that** I do not practice again the skills that I know

**Acceptance Criteria:**
- Given a student with mastery of an IM1 skill that has an `equivalent_to` edge to an IM2 skill, When the IM2 knowledge state loads, Then the IM2 skill shows the transfer mastery that `computeTransferCredit` gives with `TRANSFER_POLICY_DEFAULT`, with the source course IM1.
- Given an IM1 skill with no cross-course edge to IM2, When the IM2 knowledge state loads, Then the IM1 mastery does not change the IM2 state.
- Given a student with no earlier course, When the knowledge state of a course loads, Then it equals the state before this story (regression test with a fixed fixture).
- Given a teacher of the IM2 class, When the teacher opens the competency page of the student, Then each transfer value shows its source course.

**Estimate:** L
**Priority:** Must

## Non-Functional Requirements

- No data migration (set decision of 2026-11-14). The new field `endedAt` is optional.
- History queries use indexes (`by_student`, and a new `by_student_and_status` when a query
  needs it). They do not read a full table, and they make no query in a loop for each
  student (`measure/lessons-learned.md`).
- Each new query checks the access rule of D5 on the server.
- `packages/knowledge-space-core` stays domain-neutral. The course order and the course
  graphs stay in `apps/math` and `packages/math-content`.
- Tests are behavioral (`measure/lessons-learned.md`, 2026-06-24).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: `/student/history` and `/teacher/students/[studentId]/history` show the enrollment
  history in year order, with the access rule of D5.
- AC2: A student has at most one `active` enrollment for each course and year.
- AC3: The admin rollover completes the enrollments and archives the classes of the closed
  year, changes no evidence, and is idempotent.
- AC4: `/teacher/dashboard/srs` filters classes by year, with the current year as the
  default.
- AC5: The knowledge state of a course uses the evidence of earlier courses through the
  cross-course edges and `TRANSFER_POLICY_DEFAULT`, and shows the source course.
- AC6: Each gate passes.

## Open Dependencies

- **Graph source: mastery-advantage, contract pending (2026-11-14).** D7 and the S4 tasks
  read the cross-course edges that exist today. This track adds no graph authoring task.
  When the contract arrives, the orchestrator amends these tasks.

## Out of Scope

- A copy of classes or rosters into the new year.
- Licenses and seats (`math-app-seat-licensing_20261114`).
- New cross-course edges or a new transfer policy.
- BM2.
