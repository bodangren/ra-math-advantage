# Implementation Plan: Unified Math App: Multi-Year Student History

Track: `math-app-student-history_20261114`
Specification: [spec.md](./spec.md)
Set: [Unified Math App](../../sets/unified-math-app_20261114.md), member 4
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start S1 until `math-app-retire-old-apps_20261114` is closed in `measure/tracks.md`.

### Gate Commands

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=<ws>` for `apps/math`, `packages/knowledge-space-core`, and `packages/math-content` |
| Typecheck | `npm run typecheck --workspace=<ws>` for the same workspaces |
| Test | `CI=true npm run test --workspace=<ws>` for the same workspaces |
| Build | `npm run build --workspace=apps/math` |
| Bundle | `npm run bundle-size:audit --workspace=apps/math` |
| E2E | `npm run test:e2e --workspace=apps/math` |
| Accessibility | `npm run test:a11y --workspace=apps/math` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |

A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table.

### Test Rules

- Convex tests use the mock context helpers in `apps/math/__tests__/convex/_helpers/`.
- Each access test has a positive case and a negative case.
- Tests resolve paths from the test file, never from `process.cwd()`.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

## Phase S1: Enrollment history by academic year
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — define the history model
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Enrollment Writes, Rollover Dry Run, Knowledge State Fixture, Removal List.
    - [ ] Run each gate on the start commit. Record the results under "Baseline".
    - [ ] Write the schema change: `class_enrollments` gets `endedAt: v.optional(v.number())` and the index `by_student_and_status` (`studentId`, `status`).
    - [ ] Write the contract of `apps/math/lib/courses/academic-year.ts` `currentAcademicYear(now: Date): string` (spec D1).
    - [ ] Write the contract of `convex/student/history.ts`: `getStudentHistory({ studentId })` returns rows `{ enrollmentId, academicYear, courseKey, courseTitle, className, status, enrolledAt, endedAt, canWithdraw }`, sorted by year, then by `enrolledAt`.
    - [ ] Record the rule of `canWithdraw` (spec D3b): true only for an `active` row when the caller is the teacher of the class of the row or an admin of the organization of that class. The query reads the class and its teacher profile of each row with `Promise.all`.
    - [ ] Write the contract of one internal helper `enrollStudent(ctx, { classId, studentId })` in `convex/enrollment.ts`. It returns `{ status: 'created' | 'existing', enrollmentId }` or throws the D2 error. When an enrollment of any status exists in the same class, it returns `existing` and writes nothing (spec D2). Each enrollment write uses it.
    - [ ] Record the access rule of spec D5 for `getStudentHistory`: a parent needs a `parent_links` row with `status: "active"`.
    - [ ] Write the contract of `withdrawEnrollment({ enrollmentId })` in `convex/enrollment.ts` (spec D3a): the caller rule, the change of an `active` enrollment to `withdrawn` with `endedAt`, and no write for another status.
    - [ ] Run `git grep -n "insert(['\"]class_enrollments" -- apps/math/convex`. Record each site under "Enrollment Writes".
- [ ] Task: S1 Test (Red) — specify the history
    - [ ] `__tests__/convex/student/history.test.ts`: the two-row fixture of the S1 criteria returns two rows in year order.
    - [ ] Also: the teacher of the IM2 class of the student gets the two rows. A teacher with no class of the student gets no row and an authorization error. A parent with an `active` link and an admin of the organization get the rows. A parent with a `pending` or a `revoked` link gets no row.
    - [ ] `__tests__/convex/enrollment.test.ts`: an enrollment in another class of the same course and year, while an `active` one exists, fails with the message of the spec and writes nothing. An enrollment in the same class, with an existing `withdrawn` enrollment, returns `existing` and writes nothing.
    - [ ] Also: `withdrawEnrollment` by the teacher of the class sets `withdrawn` and `endedAt`. By an admin of the organization, it does the same. By a teacher of another class, it fails with an authorization error and writes nothing. On a `completed` enrollment, it writes nothing.
    - [ ] Also: for the teacher of the IM2 class, the `active` IM2 row has `canWithdraw: true`, and the `completed` IM1 row has `canWithdraw: false`. For an admin of the organization, the `active` row has `canWithdraw: true` (spec D3b).
    - [ ] Also: for the teacher of the IM1 class, the student, and a parent with an `active` link, each row has `canWithdraw: false`.
    - [ ] `__tests__/app/`: `/teacher/students/[studentId]/history` shows the "Withdraw" action on a row with `canWithdraw: true`, and no action on a row with `canWithdraw: false`.
    - [ ] `__tests__/convex/roster-import.test.ts`: a roster row for a student with an `active` class of the same course and year gives a row error, and the import continues with the other rows. A roster row for a student who has a `withdrawn` enrollment in the same class counts as skipped.
    - [ ] `__tests__/app/`: `/student/history` and `/teacher/students/[studentId]/history` render the rows.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S1 Implement — add the history
    - [ ] Change `convex/schema.ts` and regenerate `convex/_generated`.
    - [ ] Implement `currentAcademicYear`, `enrollStudent`, `withdrawEnrollment`, and `getStudentHistory`.
    - [ ] Change each site of "Enrollment Writes" to use `enrollStudent`.
    - [ ] Add the "Withdraw" action to `/teacher/students/[studentId]/history`. Show it only on a row with `canWithdraw: true` (spec D3a, D3b).
    - [ ] Add the pages `/student/history` and `/teacher/students/[studentId]/history`, with links from the student dashboard and the teacher student list.
    - [ ] Commit: `feat(math): add the enrollment history by academic year`.
- [ ] Task: S1 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit the evidence file: `measure(math-app-student-history): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Enrollment history by academic year' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Enrollment history by academic year' as complete`.

## Phase S2: Academic year rollover
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — define the rollover
    - [ ] Write the contract of `convex/admin/years.ts`: `previewRollover({ fromYear, toYear })` (query) and `rolloverAcademicYear({ fromYear, toYear })` (mutation). The organization comes from the session of the admin.
    - [ ] Record the rules: the caller is an admin; `toYear` is the year after `fromYear`; each `active` enrollment of a `fromYear` class becomes `completed` with `endedAt`; each `fromYear` class gets `archived: true`; a second run changes no row.
    - [ ] Record the class selection of spec D4: read the teacher profiles of the admin's organization with `profiles.by_organization`, then their classes with `classes.by_teacher` (`Promise.all`), then keep the classes with `academicYear === fromYear`.
    - [ ] Record the list of evidence tables that the count check reads: `srs_cards`, `srs_review_log`, `student_competency`, `activity_submissions`, `activity_completions`, and `student_progress`.
- [ ] Task: S2 Test (Red) — specify the rollover
    - [ ] `__tests__/convex/admin/years.test.ts`: the S2 fixture rolls over, completes each enrollment, and archives each class. The evidence counts do not change.
    - [ ] Also: a second run changes no row. A teacher gets an authorization error. `2025-2026` to `2027-2028` fails. A `2025-2026` class whose teacher is in another organization does not change.
    - [ ] Also: `previewRollover` returns the counts of enrollments and classes, and writes nothing.
    - [ ] `__tests__/app/`: `/admin/years` shows the preview counts before the confirm action.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S2 Implement — add the rollover
    - [ ] Implement `previewRollover` and `rolloverAcademicYear` with batched reads (`Promise.all`).
    - [ ] Add the page `/admin/years` with the preview and the confirm action.
    - [ ] Commit: `feat(math): add the academic year rollover`.
- [ ] Task: S2 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run the rollover on the dev deployment with the demo data. Record the preview counts and the result under "Rollover Dry Run".
    - [ ] Commit the evidence file: `measure(math-app-student-history): record the S2 results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: Academic year rollover' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: Academic year rollover' as complete`.

## Phase S3: Teacher views by year
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Contract — define the year filter
    - [ ] Write the contract (spec D8): `getTeacherSrsDashboardData` in `convex/teacher.ts` takes an optional `academicYear`. Without it, it uses `currentAcademicYear(now)`. It returns the classes of that year (archived classes too, for a closed year) and the list of years of the teacher's classes.
    - [ ] Record that the page `app/teacher/dashboard/srs/page.tsx` shows the year selector, and that a class of a closed year renders with no edit action. `/teacher/dashboard` does not change.
- [ ] Task: S3 Test (Red) — specify the year filter
    - [ ] `__tests__/lib/courses/academic-year.test.ts`: `currentAcademicYear` returns the three values of the S3 criteria.
    - [ ] `__tests__/convex/`: `getTeacherSrsDashboardData` returns the classes of the selected year and the list of years.
    - [ ] `__tests__/app/`: `/teacher/dashboard/srs` shows the year selector, and an archived class shows no edit action.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S3 Implement — add the year filter
    - [ ] Change `getTeacherSrsDashboardData` and `app/teacher/dashboard/srs/page.tsx`.
    - [ ] Hide the edit actions for an archived class.
    - [ ] Commit: `feat(math): filter the teacher dashboard by academic year`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit the evidence file: `measure(math-app-student-history): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: Teacher views by year' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: Teacher views by year' as complete`.

## Phase S4: Knowledge state from earlier courses
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Contract — define the knowledge state across courses
    - [ ] Write the contract (spec D6): the knowledge state of course C reads `srs_cards` and `srs_review_log` with the `by_student` indexes and no course filter, gives each record to the nodes of `courseView(graph, C)` through `objectiveNodeIds`, and calls no transfer-credit function.
    - [ ] Write the contract of the teacher page (spec D7a, D7b): `earlierCoursesForCompetencies(ctx, { studentId, courseKey, codes })` in the new module `convex/teacher/earlierCourses.ts`. It reads `competency_standards` by `by_code`, `lesson_standards` by `by_standard`, then each lesson version and its lesson.
    - [ ] Also: it returns a map from each code to the lesson course keys that are also course keys of another enrollment of the student, without `courseKey`, in registry `sequence` order. A code with no earlier course gets an empty list.
    - [ ] Also: it reads the enrollments and their classes one time. Each step of the path is one `Promise.all` over all codes or all rows of the earlier step, joined with a `Map`. No step reads in a loop for each code.
    - [ ] Record the call: the competency detail query of the page (`getTeacherStudentCompetencyDetail` today, in its form after the base track) calls the helper one time and returns `earlierCourses`. The page makes no separate call (spec D7b).
    - [ ] Record the target page: `app/teacher/[course]/students/[studentId]/competency/page.tsx`.
    - [ ] Record a fixed fixture under "Knowledge State Fixture": one student with evidence on `HSA-SSE.B.3` from an IM2 class, an IM3 course view that holds that code, and evidence on one code that the IM3 view does not hold.
    - [ ] Record the knowledge state of a student with no earlier course on the start commit, as the regression value.
    - [ ] Run `git grep -l -E "transfer-credit|transfer-eligibility|transfer-skip|transfer-teacher-audit|computeTransferCredit|TransferCredit"`. Record each file under "Removal List" with its planned removal (spec D7).
- [ ] Task: S4 Test (Red) — specify the knowledge state across courses
    - [ ] `__tests__/convex/student/knowledge-state.test.ts`: with the fixture, the IM3 standard node of `HSA-SSE.B.3` has the IM2 evidence.
    - [ ] Also: the evidence on the code outside the IM3 view does not change the IM3 state.
    - [ ] Also: the student with no earlier course gets the regression value.
    - [ ] `__tests__/convex/teacher/earlierCourses.test.ts`: one call of `earlierCoursesForCompetencies` with the fixture codes returns `["im2"]` for `HSA-SSE.B.3` and `[]` for the code with no earlier course. A student with no earlier course gets `[]` for each code.
    - [ ] Also: with three codes, the mock context records one enrollment read for the student, and one `by_code` read and one `by_standard` read for each code. The test fails if a read repeats for a code.
    - [ ] Also: the competency detail query returns `earlierCourses` for each code with evidence, from one call of the helper.
    - [ ] `__tests__/app/`: `app/teacher/[course]/students/[studentId]/competency/page.tsx` shows the earlier course of each competency with evidence.
    - [ ] `scripts/__tests__/transfer-credit-removed.test.ts`: `git grep -n -E "computeTransferCredit|TransferCreditPrompt|TransferCreditAuditPanel|student-skip"` finds no match outside `measure/**`.
    - [ ] Run the app suite and the scripts suite. Confirm that the new cases fail.
- [ ] Task: S4 Implement — use the evidence of earlier courses
    - [ ] Change `convex/student/knowledge-state.ts` as the contract gives. Read the evidence with indexes and `Promise.all`.
    - [ ] Add `convex/teacher/earlierCourses.ts` with `earlierCoursesForCompetencies`. Call it one time from the competency detail query, and return `earlierCourses` (spec D7b).
    - [ ] Show the earlier courses on `app/teacher/[course]/students/[studentId]/competency/page.tsx` from `earlierCourses`.
    - [ ] Commit: `feat(math): use the evidence of earlier courses in the knowledge state`.
- [ ] Task: S4 Implement — remove the transfer-credit code
    - [ ] Delete each app file of "Removal List" and its tests. Remove the entries from `lib/a11y/harness.tsx`.
    - [ ] Delete `transfer-credit.ts`, `transfer-eligibility.ts`, `transfer-skip.ts`, and `transfer-teacher-audit.ts` from `packages/knowledge-space-core/src/`, with their tests and their exports in `index.ts`. Keep `cross-course-equivalence.ts`.
    - [ ] Commit: `refactor(math): remove the transfer-credit code that the merged graph replaces`.
- [ ] Task: S4 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit the evidence file: `measure(math-app-student-history): record the S4 results`.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: Knowledge state from earlier courses' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: Knowledge state from earlier courses' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the set overview status, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
