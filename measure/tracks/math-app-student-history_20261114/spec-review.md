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

## Accepted Risks

None.
