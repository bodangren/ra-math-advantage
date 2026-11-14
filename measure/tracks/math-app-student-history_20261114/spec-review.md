# Spec Review: math-app-student-history_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track gives each student one history across the four courses and the academic years in the unified math app (member 4 of the set, after the old apps retire). It adds an optional `endedAt` to `class_enrollments`, a rule of one active enrollment per course and year, and two history pages (`/student/history` and `/teacher/students/[studentId]/history`) with an access rule for the student, the teachers of the student, linked parents, and organization admins. An admin rollover closes a year: it completes each active enrollment of the year, sets `endedAt`, archives the classes, and changes no evidence. The teacher dashboard gets an academic year filter with the current year as the default. The knowledge state of a course uses the evidence of each earlier course of the student through the cross-course edges and the transfer-credit runtime with `TRANSFER_POLICY_DEFAULT`, and each transfer value shows its source course.

### How the current system works, per this spec

Per the spec, a student is one `profiles` row, and after the base track the four courses share one Convex backend. `class_enrollments` holds `classId`, `studentId`, `enrolledAt`, and a status of `active`, `withdrawn`, or `completed`, with the indexes `by_class`, `by_student`, and `by_class_and_student`, and no end date; `convex/onboarding/roster-import.ts:166` and the seeds write enrollments. The evidence tables (`srs_cards`, `srs_review_log`, `student_competency`, and the practice tables) key by `studentId`, and after the base track each objective ID is a namespaced code, so the evidence of each course stays apart. The transfer-credit runtime lives in `packages/knowledge-space-core` (`computeTransferCredit`, `batchComputeTransferCredit`, `TRANSFER_POLICY_DEFAULT`), `apps/math/lib/transfer-credit/student-skip.ts` uses it, and `cross-course-edges.json` joins the course graphs. The spec also states that `/teacher/dashboard` lists the classes of the teacher with no year filter; finding F1 shows this claim is false.

### Findings

- F1 [Blocker] spec.md Current System (Teacher pages) and Story S3, plan.md Phase S3: The claim that `/teacher/dashboard` lists the classes of the teacher is false. The page lists the students of the organization (`apps/integrated-math-3/app/teacher/dashboard/page.tsx`; `getTeacherDashboardData` at `convex/teacher.ts:278` returns no classes), and the class list lives on `/teacher/dashboard/srs` via `getTeacherSrsDashboardData` (`convex/teacher.ts:1493`, classes read at line 1507). The plan step "Change the dashboard query and the dashboard page" names two dashboard queries and leaves the target open. Rationale: a wrong current-system fact plus a file-location choice left to the implementer; the phase can build the year filter on a page that has no class list.
- F2 [Blocker] plan.md Phase S2 Contract: The organization scoping of the rollover is unspecified. `classes` has no `organizationId` (`convex/schema.ts:250-259`), so the plan sentence "The organization comes from the session of the admin" gives no selection rule for the classes and enrollments of that organization. Rationale: the implementer must choose between a global rollover and a traversal through teacher profiles; an API-shape and edge-case design choice left open.
- F3 [Major] spec.md Decision D2 and Story S1 AC4, plan.md Phase S1 Contract and Test: The re-enrollment edge is open. `enrollStudent` behavior for an existing enrollment with status `withdrawn` or `completed` in the same class is not specified, and Story S1 AC4 says "another `im2` class" while the plan test says "same course and year". Today's roster import skips an existing enrollment of any status (`convex/onboarding/roster-import.ts:152-160`). Rationale: an unspecified edge-case behavior; a re-import of the same roster can turn each existing row into an error.
- F4 [Major] spec.md Decision D5, plan.md Phase S1 Test: "Each linked parent" does not say which `parent_links` status grants access. The table has `active`, `revoked`, and `pending` (`convex/schema.ts:272-277`). The plan names only the positive case. Rationale: an access rule that depends on an undefined term; the implementer decides whether pending or revoked links read the history.
- F5 [Major] plan.md Phase S4 Contract: The runtime source of the cross-course edges is not named. No loader symbol exists; only `scripts/generate-cross-course-edges.ts` and a comment in `packages/math-content/src/knowledge-space/generators/algebra-generators-adapters.ts` reference `cross-course-edges.json`. Rationale: the plan decides that `getKnowledgeState` reads the edges but not where the edges enter the Convex runtime (a direct JSON import or an extension of the base track graph loader), so the placement is open.

### Author Response
- F1: FIX (Current System is corrected; spec D8 puts the year filter on `/teacher/dashboard/srs` through `getTeacherSrsDashboardData`; Story S3, AC4, and the S3 tasks name that page and query)
- F2: FIX (spec D4 and the S2 Contract select the classes through the teacher profiles of the admin's organization; a new criterion and a test cover a class of another organization)
- F3: FIX (spec D2: an enrollment of any status in the same class returns `existing` and writes nothing, and the roster import counts it as skipped; the S1 criteria and tests now say "another class of the same course and year")
- F4: FIX (spec D5: only an `active` parent link gives access; a criterion and a test cover `pending` and `revoked`)
- F5: FIX (spec D7: `packages/math-content` exports `CROSS_COURSE_EDGES`, and `loadCrossCourseEdges(courseKey)` in the app graph loader is the only runtime source; the gates include `packages/math-content`)

### Author Note

The author also added a "Closeout" section to plan.md: the Measure closeout and the origin sync of the spec NFR. The change applies finding F1 of `math-app-retire-old-apps_20261114` to each member of the set.

## Round 2

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track gives each student one history across the four courses and the academic years in the unified math app (member 4 of the set, after the old apps retire). It adds an optional `endedAt` to `class_enrollments`, a rule of one active enrollment per course and year (a re-listing in the same class returns the existing enrollment and writes nothing), and two history pages with an access rule for the student, the teachers of the student, parents with an `active` parent link, and organization admins. An admin rollover closes a year for the organization of the admin through the teacher profiles: it completes each active enrollment of the year, sets `endedAt`, and archives the classes. The year filter goes on `/teacher/dashboard/srs` through `getTeacherSrsDashboardData`, with the current year as the default. The knowledge state of a course uses the evidence of each earlier course through cross-course edges loaded from a `packages/math-content` export, and each transfer value shows its source course.

### How the current system works, per this spec

Per the spec, a student is one `profiles` row, and after the base track the four courses share one Convex backend. `class_enrollments` holds `classId`, `studentId`, `enrolledAt`, and a status of `active`, `withdrawn`, or `completed`, with the indexes `by_class`, `by_student`, and `by_class_and_student`, and no end date; `convex/onboarding/roster-import.ts:166` and the seeds insert enrollments, and the import skips an existing enrollment of any status. After the base track, `classes` has a required `courseKey` and a required `academicYear`, no `organizationId`, and the index `by_teacher`; the organization of a class is the `organizationId` of its teacher profile. The page `/teacher/dashboard` lists the students of the organization, and the class list lives on `/teacher/dashboard/srs` via `getTeacherSrsDashboardData`, which reads the classes `by_teacher` and drops the archived classes. The evidence tables (`srs_cards`, `srs_review_log`, `student_competency`, and the practice tables) key by `studentId`, and after the base track each objective ID is a namespaced code. The transfer-credit runtime lives in `packages/knowledge-space-core`, `apps/math/lib/transfer-credit/student-skip.ts` uses it, and `cross-course-edges.json` has no runtime loader today.

### Findings

- F6 [Blocker] spec.md Decisions D2 and D3, plan.md Phase S1: The withdrawal write path is missing. No mutation writes an enrollment status today (a repository grep finds `withdrawn` only in `convex/schema.ts:266` and `convex/seed/types.ts`), and the plan adds no withdraw mutation, page, or test. D2 says a move to another section withdraws the old enrollment first, and D3 says a change to `withdrawn` sets `endedAt`; Story S1 AC5 tests a `withdrawn` enrollment. The implementer must choose a new API shape (for example a `withdrawEnrollment` mutation and its caller) or make `enrollStudent` auto-withdraw, which contradicts Story S1 AC4. Rationale: an API-shape and edge-case design choice that the plan leaves to the implementer; without a decision, D2 and D3 have no triggering code path.

### Author Response
- F6: FIX (spec D3 names the two status paths; new D3a defines `withdrawEnrollment` in `convex/enrollment.ts`, its callers, its no-write rule, and the "Withdraw" action on `/teacher/students/[studentId]/history`; Story S1 has a criterion, and the S1 tasks have the contract, the tests, and the implementation)

### Author Note

The author also added an "Open Dependencies" section to spec.md: the graph source is mastery-advantage, with the contract pending (Daniel, 2026-11-14). The note adds no task.

Round 2 found a new Blocker. The user rule for this session is: "If a Blocker remains, do not commit." So the author ran one extra round (Round 3), limited to F6, as a documented exception to the rule of one re-review.

## Round 3

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track gives each student one history across the four courses and the academic years in the unified math app (member 4 of the set, after the old apps retire). It adds an optional `endedAt` to `class_enrollments`, a rule of one active enrollment per course and year, and two history pages with an access rule for the student, the teachers of the student, parents with an `active` parent link, and organization admins. An admin rollover closes a year for the organization of the admin through the teacher profiles: it completes each active enrollment of the year, sets `endedAt`, and archives the classes. A new `withdrawEnrollment` mutation in `convex/enrollment.ts` lets the teacher of the class or an admin of the organization withdraw an active enrollment, with a "Withdraw" action on the teacher history page. The year filter goes on `/teacher/dashboard/srs`, and the knowledge state of a course uses the evidence of earlier courses through cross-course edges from a `packages/math-content` export.

### How the current system works, per this spec

Per the spec, a student is one `profiles` row, and after the base track the four courses share one Convex backend. `class_enrollments` holds `classId`, `studentId`, `enrolledAt`, and a status of `active`, `withdrawn`, or `completed`, with the indexes `by_class`, `by_student`, and `by_class_and_student`, and no end date; `convex/onboarding/roster-import.ts:166` and the seeds insert enrollments, the import skips an existing enrollment of any status, and no mutation changes a status today (verified: `withdrawn` appears only in schemas, seed types, and tests). After the base track, `classes` has a required `courseKey` and a required `academicYear`, no `organizationId`, and the index `by_teacher`; the organization of a class is the `organizationId` of its teacher profile. The page `/teacher/dashboard` lists the students of the organization, and the class list lives on `/teacher/dashboard/srs` via `getTeacherSrsDashboardData`. The transfer-credit runtime lives in `packages/knowledge-space-core`, and `cross-course-edges.json` has no runtime loader today.

### Findings

- F6 withdrawn: the withdrawal write path is now defined. Spec D3 names the two status paths and bars all other status writes; D3a fixes the API shape (`withdrawEnrollment({ enrollmentId })` in `convex/enrollment.ts`), the caller rule (teacher of the class or admin of the organization), the no-write rule for a `withdrawn` or `completed` enrollment, and the "Withdraw" action on `/teacher/students/[studentId]/history`. Story S1 has a criterion, and plan S1 Contract, Test (Red), and Implement each carry the mutation, its tests (teacher, admin, other teacher forbidden, `completed` no-write), and the page action.
- F7 [Nit] plan.md Phase S1 Test: the test list names no case for `withdrawEnrollment` on an already `withdrawn` enrollment, though spec D3a defines that it returns the enrollment and writes nothing. Rationale: the `completed` no-write case is named but the parallel `withdrawn` case is not; the implementer still builds the D3a rule, so this changes test coverage, not the design.

### Author Response
- F7: DECLINE

## Round 4

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)
Cause: the revision of 2026-11-14 (the merged graph contract: one graph, no transfer step, removal of the transfer-credit code). The spec and the plan changed after Round 3.

### What this track proposes

This track gives each student one account and one enrollment history across the four courses and the academic years in the unified math app (member 4 of the set, after the old apps retire). It adds an optional `endedAt` to `class_enrollments`, a rule of one active enrollment per course and year, a `withdrawEnrollment` mutation, two history pages with an access rule, an admin rollover that completes the enrollments and archives the classes of the closed year, and a year filter on `/teacher/dashboard/srs`. The knowledge state of a course reads all evidence of the student through the one merged graph and `objectiveNodeIds`, with no transfer step. The track also deletes the transfer-credit code and shows the earlier courses of each competency on the teacher competency page.

### How the current system works, per this spec

Per the spec, a student is one `profiles` row, and after the base track the four courses share one Convex backend. After the base track, `classes` has a required `courseKey` and a required `academicYear`, and `class_enrollments` holds `classId`, `studentId`, `enrolledAt`, and a status of `active`, `withdrawn`, or `completed`, with no end date; the roster import and the seeds insert enrollments, and the import skips an existing enrollment of any status. The evidence tables (`srs_cards`, `srs_review_log`, `student_competency`, and the practice tables) key by `studentId`, and after the base track each objective ID is a canonical CCSS code, so one evidence record serves each course that teaches the competency. After the base track, `loadMathGraph()` returns one merged graph and `courseView(graph, courseKey)` returns the view of one course. The transfer-credit runtime lives in `packages/knowledge-space-core` with three app files and no page users, and `cross-course-edges.json` has no runtime loader. `/teacher/dashboard` lists the students of the organization; the class list lives on `/teacher/dashboard/srs` with no year filter, and a class has no `organizationId` — the organization comes from the teacher profile.

### Findings

- F8 [Major] spec.md D7a, plan.md Phase S4 Contract, Test, and Implement: the target page of "the teacher competency page" is not named, and two competency pages exist: `apps/integrated-math-3/app/teacher/competency/page.tsx` (class heatmap) and `apps/integrated-math-3/app/teacher/students/[studentId]/competency/page.tsx` (per student). D7a says "the earlier courses of the student", which reads as the per-student page, but the plan never commits to the file. Rationale: a file-location choice the plan leaves to the implementer; the two pages have different data shapes, and the wrong choice reworks the phase.
- F9 [Major] spec.md D7a, plan.md Phase S4 Contract: the data path of "lessons link to that competency" is unnamed. `earlierCoursesForCompetency(studentId, code, courseKey)` must find the lessons of an earlier course that link to the code, but no source is recorded; two viable sources exist: the `lesson_standards` table joined to `competency_standards` (`convex/schema.ts:406`), or the graph (`courseView` lesson container nodes that reach a standard node of the code). Rationale: an implementer must choose the source and the traversal, and the two sources can disagree.
- F10 [Major] spec.md D6, plan.md Phase S4 Contract: "each evidence record of the student" does not name the table set. The knowledge state reads only `srs_cards` and `srs_review_log` today (`apps/integrated-math-3/convex/student/knowledge-state.ts`), while the Current System lists `srs_cards`, `srs_review_log`, `student_competency`, and the practice tables as evidence. Rationale: the implementer must choose between "keep the current table set and drop the course filter" and "add reads of `student_competency` and the practice tables"; the two readings change the scope of the S4 Implement task.
- F11 [Major] plan.md Phase S1 Test: the teacher positive access case is not named. The Test Rules require a positive case and a negative case for each access test; the list names the negative teacher case (no class of the student gets no row and an error) and positive cases for a parent with an `active` link and an admin, but no case where the teacher of a class of the student gets the rows of Story S1 AC2. Rationale: a phase test list that names no normal case for one arm of the D5 access rule.
- F12 [Nit] spec.md Current System (Transfer credit) and D7, plan.md Phase S4 removal: the claim that `lib/a11y/harness.tsx` imports the transfer-credit files is inaccurate. The file holds no import of them; line 13 is a comment that names a transfer-credit test path, so the plan step "Remove the entries from `lib/a11y/harness.tsx`" finds no entries. Rationale: wording only; the implementer cleans up a comment, not entries, and the design does not change.
- F13 [Nit] spec.md Current System (Teacher pages): the line references drifted. `convex/teacher.ts:278` is now line 281 (`getTeacherDashboardData`), `:1493` is now 1496 (`getTeacherSrsDashboardData`), and line 1507 (`by_teacher`) is now 1509 (verified on HEAD 0bf1900). Rationale: the symbols still resolve; only the line numbers changed.
- F14 [Nit] plan.md Phase S4 Test: the removal-check grep pattern misses residual transfer-credit symbols. The pattern `computeTransferCredit|TransferCreditPrompt|TransferCreditAuditPanel|student-skip` does not match `TRANSFER_POLICY_DEFAULT`, `transfer-eligibility`, `transfer-skip.ts`, `transfer-teacher-audit`, or `buildTransferCreditAuditView`, so a residual reference can pass the test. Rationale: the lint, typecheck, and build gates catch a residual import; this changes the backstop, not the design.

### Author Response

- F8: FIX (D7a, the S4 criterion, and the S4 Contract, Test, and Implement tasks name `app/teacher/[course]/students/[studentId]/competency/page.tsx`; the class page does not change)
- F9: FIX (D7a and the S4 Contract give the database path: `competency_standards` by `by_code`, `lesson_standards` by `by_standard`, then each lesson version and its lesson)
- F10: FIX (D6 and the S4 Contract name `srs_cards` and `srs_review_log` with `by_student` and no course filter)
- F11: FIX (the S1 Test task has the positive case for the teacher of the IM2 class)
- F12: DECLINE
- F13: DECLINE
- F14: DECLINE

## Round 5

Date: 2026-11-14
Reviewer: measure-spec-review (volcengine-agent-plan/glm-latest#high; substitute for kimi-code-plan-cn/kimi-for-coding#high, Kimi weekly quota 98.27%)
Cause: the re-review of the Round 4 fixes F8 to F11 (Author Response of Round 4). The spec and the plan changed after Round 4.

### What this track proposes

This track gives each student one account and one enrollment history across the four courses and the academic years of the unified math app (member 4 of the set, after the old apps retire). It adds an optional `endedAt` to `class_enrollments`, the rule of one active enrollment per course and year, a `withdrawEnrollment` mutation, and two history pages with the access rule of D5. An admin rollover closes a year: it completes each active enrollment, sets `endedAt`, and archives the classes of the closed year; the teacher class list gets a year filter. The knowledge state of a course reads `srs_cards` and `srs_review_log` by student, and gives each record to the nodes of `courseView(graph, C)` through `objectiveNodeIds`, with no transfer step. The track also deletes the transfer-credit code, and the per-student competency page `app/teacher/[course]/students/[studentId]/competency/page.tsx` shows the earlier courses of each competency with evidence.

### How the current system works, per this spec

Per the spec, a student is one `profiles` row, and the four courses share one Convex backend after the base track. `class_enrollments` holds `classId`, `studentId`, `enrolledAt`, and a status of `active`, `withdrawn`, or `completed`, with no end date; the roster import and the seeds insert enrollments, and the import skips an existing enrollment of any status (`convex/onboarding/roster-import.ts`, skip at lines 151 to 161, insert at line 166). The knowledge state reads `srs_cards` and `srs_review_log` with the `by_student` index today (`apps/integrated-math-3/convex/student/knowledge-state.ts:108-117`), and after the base track `loadMathGraph()` returns one merged graph and `courseView(graph, courseKey)` returns the view of one course. The transfer-credit runtime lives in `packages/knowledge-space-core` with three app files (`lib/transfer-credit/student-skip.ts`, `TransferCreditPrompt.tsx`, `TransferCreditAuditPanel.tsx`), and no page uses them; `cross-course-edges.json` has no runtime loader. `/teacher/dashboard` lists the students of the organization, the class list lives on `/teacher/dashboard/srs` with no year filter, and a class has no `organizationId` — the organization of a class comes from the teacher profile.

### Fix check

- F8: FIXED. spec.md D7a (lines 117 to 121) names the page `app/teacher/[course]/students/[studentId]/competency/page.tsx` and its route, and plan.md lines 150, 159, and 164 name the same page; the class page `/teacher/[course]/competency` does not change (spec.md line 121). The base track route table confirms the route move (`math-app-base_20261114/plan.md`, line 313).
- F9: FIXED. spec.md D7a (lines 122 to 126) gives the database path: `competency_standards` by `by_code` (index at `convex/schema.ts:404`), then `lesson_standards` by `by_standard` (index at `convex/schema.ts:413`), then each `lesson_versions` row and its `lessons` row, which gives the `courseKey` after the base track (a required `courseKey` on `lessons`, base track spec). plan.md line 149 repeats the path.
- F10: FIXED. spec.md D6 (lines 98 to 101) names `srs_cards` and `srs_review_log` with the `by_student` index and no course filter, and keeps `student_competency` and the practice tables outside the knowledge state; plan.md line 148 repeats it. The current reader matches: `apps/integrated-math-3/convex/student/knowledge-state.ts` reads only these two tables with `by_student` (lines 108 to 117).
- F11: FIXED. plan.md line 60 adds the positive case: the teacher of the IM2 class of the student gets the two rows.

### Findings

- F15 [Major] plan.md Phase S4 Contract and Implement, spec.md D7a: the plan names no Convex module for `earlierCoursesForCompetency` and no call pattern for the page. The signature takes one `code` (plan.md line 149), but D7a needs the earlier courses of each competency with evidence, so the implementer must choose the source file (a new module in `convex/teacher/` or `convex/teacher.ts`; the plan names only the test folder `__tests__/convex/teacher/`) and the call form: one internal query per competency, `Promise.all` over the codes, or an unnamed batch query. Rationale: an API-shape and file-location choice that the plan leaves to the implementer; the per-competency reading puts a query loop on the page, against `measure/lessons-learned.md` (2026-04-19).
- F16 [Major] plan.md Phase S1 Contract and Test, spec.md D3a: the history rows carry no data for the "Withdraw" visibility rule. `getStudentHistory` returns `{ academicYear, courseKey, courseTitle, className, status, enrolledAt, endedAt }` (plan.md line 53), D3a limits the action to the teacher of the class of the enrollment or an admin of the organization of that class (spec.md lines 81 to 87), and the S1 app test hides the action for a teacher of another class of the student (plan.md line 63), but the contract names no capability field and no second check. Rationale: an API-shape choice that the plan leaves to the implementer; the page cannot derive the caller's right per row from the named row shape.

### Author Note on Round 5

The permission system stopped the reviewer from writing this file. The author copied the Round 5 section above with no change from `measure/runs/math-app-student-history/spec-review-fd6ee47.log`.

### Author Response

- F15: FIX (new D7b: the module `convex/teacher/earlierCourses.ts` holds one batch helper `earlierCoursesForCompetencies(ctx, { studentId, courseKey, codes })`. It reads all codes of the page in parallel batches, with no read loop for each code. The competency detail query of the page calls it one time and returns `earlierCourses` for each code. The helper is not a separate page call, because DA9 of the base track forbids a deploy-key call that reads user data. A new S4 criterion and the S4 Contract, Test, and Implement tasks name the module, the helper, and the batch check.)
- F16: FIX (new D3b: each row of `getStudentHistory` has `enrollmentId` and `canWithdraw`. The query computes `canWithdraw` from D3a for each row and the caller. The page shows the "Withdraw" action only when `canWithdraw` is true, and `withdrawEnrollment` checks the caller again. The S1 Contract and the S1 Test tasks name the field and its cases, and a new S1 criterion gives the rule.)

## Accepted Risks

- F15 and F16 (Round 5, Major): fixed after the last review round, with no re-review of the fixes. The PM machine load rule of 2026-11-14 allows one review role at a time. Each fix names a module, a function, or a row field, and adds tests; neither fix adds a feature.
