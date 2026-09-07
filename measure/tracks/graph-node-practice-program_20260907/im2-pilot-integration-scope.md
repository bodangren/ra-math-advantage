# IM2 Pilot Integration Scope

Date: 2026-09-07

## Purpose

This audit compares the pending Integrated Math 2 (IM2) perpendicular-bisector pilot with `HEAD`. It covers the exact skill `math.im2.skill.1.1.perpendicular-bisector-equidistance`. It does not approve or publish the draft curriculum.

## Current Result

The backend flow remains under integration review. The real catalog stays unavailable because the selected node and blueprint are draft. The seed also keeps all three activity rows unapproved and sets `srsEligible` to false.

The initial focused Convex run passed 19 tests in two files. Later review added regression tests. Use the final integration result for the current count.

Command:

```text
npx vitest run __tests__/convex/perpendicular-bisector-pilot.test.ts __tests__/convex/perpendicular-bisector-pilot-seed.test.ts
```

Result: 2 files passed and 19 tests passed.

## Required Integration Groups

### Group 1: Local Generator, Projector, and Grader

Commit these files together:

- `apps/integrated-math-2/lib/practice/perpendicular-bisector.ts`
- `apps/integrated-math-2/__tests__/lib/perpendicular-bisector.test.ts`

Commit `c2e8813d` adds the three-mode projector and the server grader. Independent props omit the expected answer. Worked props contain the answer and solution steps. Guided props contain prompts, hints, and an `after_attempt` reveal policy.

This group depends only on the existing local question generator and grader. It does not need a new shared package change.

### Group 2: Convex Storage, Publication Gate, Writers, and Seed

Commit these files together:

- `apps/integrated-math-2/convex/schema.ts`
- `apps/integrated-math-2/convex/activities.ts`
- `apps/integrated-math-2/convex/seed/seed_perpendicular_bisector_pilot.ts`
- `apps/integrated-math-2/__tests__/convex/perpendicular-bisector-pilot.test.ts`
- `apps/integrated-math-2/__tests__/convex/perpendicular-bisector-pilot-seed.test.ts`
- `apps/integrated-math-2/convex/_generated/api.d.ts`, regenerated from the final Convex source

The schema adds stable activity identity, mode, generator input, submission retry fields, and the `learning_evidence` table. The activity writer uses the current canonical node and blueprint JSON. It rejects the current draft publication. It also checks the exact approved activity identity before it grades or stores a response.

The student writer uses the authenticated student identifier from its caller. It also checks the active student credential. It stores Worked as an acknowledgement. It stores Guided and Independent as server-graded submissions.

The teacher writer requires all of these conditions:

- The current node and blueprint are approved.
- The source activity is the exact Guided stable activity for the selected node.
- The source activity is approved and uses `im2-question`.
- The source submission belongs to the selected student and has a grade.
- The teacher owns the active class.
- The teacher and student have the same organization.
- The student has an active enrollment.
- The class has the source lesson assignment.
- The Guided submission is not older than the enrollment or assignment.

The replay check uses the exact learner, source submission, node, stable activity, attempt ordinal, origin, mode, and non-mastery status. A conflicting idempotency key fails before a same-source replay. A valid replay returns the existing evidence row.

Independent evidence requires current graph readiness, an approved and SRS-eligible Independent activity, no assistance, and a valid teacher-led source. The code stores the physical submission identifier in the SRS review log. Replay does not add another evidence row, card, review log, or repetition.

The seed creates or updates only the three stable pilot rows. A material seed change clears approval and disables SRS eligibility. The seed does not approve the rows.

### Group 3: Authenticated Student Route and Page

Commit these files after Groups 1 and 2:

- `apps/integrated-math-2/app/api/activities/[activityId]/submissions/route.ts`
- `apps/integrated-math-2/app/student/practice/page.tsx`

The existing `apps/integrated-math-2/components/student/PerpendicularBisectorPilot.tsx` and its existing test are already in `HEAD`. The new page supplies the pending Convex query result to that component.

The route uses the authenticated session subject. It accepts only a student session. It validates a strict response body and an idempotency key. The internal mutation repeats the identity and publication checks.

### Group 4: Teacher Candidate and Trusted Action

Commit these files after Group 2:

- `apps/integrated-math-2/convex/teacher.ts`
- `apps/integrated-math-2/app/api/teacher/perpendicular-bisector-exposure/route.ts`
- `apps/integrated-math-2/components/teacher/PerpendicularBisectorExposureForm.tsx`
- `apps/integrated-math-2/app/teacher/students/[id]/page.tsx`
- `apps/integrated-math-2/__tests__/components/teacher/PerpendicularBisectorExposureForm.test.tsx`

The route gets the teacher identifier from the authenticated session. The browser cannot choose the teacher identifier. The backend mutation remains the authority for organization, class ownership, enrollment, assignment, source, publication, and replay checks.

The teacher query uses `canRecordExposure` as a display hint. Review added the exact activity contract and source timing checks. Review also corrected the answer display to read the stored `rawResponse` before the legacy fallback. The mutation remains the authority.

## Integration findings

The teacher mutation now rejects a submission from a different source lesson. A regression test confirms that this rejection creates no evidence row.

The pilot query and writers now reuse `activeAccount`. Disabled teacher and learner regressions reject new evidence. A credential/profile mismatch rejects student access. The focused pilot file passes 22 tests before the readiness correction.

The query now closes completed practice only after a correct Independent physical submission has exact accepted evidence. A real writer sequence verifies that early correct work remains available before teacher confirmation and that a later valid attempt can create evidence. Malformed evidence does not close the practice.

## Excluded Files

Do not commit these generated build artifacts:

- `apps/integrated-math-2/.next/types/routes.d.ts`
- `apps/integrated-math-2/.vinext/`

Do not include unrelated curriculum or app changes in these groups.

## Shared Dependency Decision

The shared evidence fingerprint removal is not required for this pilot. IM2 stores evidence directly with the normalized `learning-evidence.v1` fields. It does not read or write an evidence fingerprint.

The pending shared SRS adapter change is also not required for this pilot. IM2 calls the existing `processReview` function directly. It stores the physical `activity_submissions` identifier in `srs_review_log.submissionId`.

The required shared packages are already declared dependencies of the IM2 app:

- `@math-platform/practice-core`
- `@math-platform/srs-engine`

## Behavioral Blockers

No verified backend logic blocker remains in the reviewed flow. The 18 main backend tests cover current draft rejection, current publication withdrawal, authentication data, organization scope, class ownership, active enrollment, assignment time, exact activity identity, server grading, canonical teacher replay, conflicting keys, Independent evidence, SRS writes, and SRS replay.

Two verification gaps remain before this pilot is ready for a production release:

1. The new student and teacher API routes have no direct route tests. Add tests for role rejection, session-owned identifiers, strict request validation, conflict status, and backend failure status.
2. The teacher page has no integration test for candidate display. Add a test that proves only an eligible Guided source shows the action. Also prove that the page handles a backend rejection without a false success message.

These gaps do not require a new framework. Use the existing route and component test patterns in the app.

## Approval and Browser Acceptance

Curriculum approval is separate from code integration. Keep the selected node, blueprint, and activities inactive in the local commit. A reviewer must approve the curriculum and activity rows before the real route returns the pilot.

Browser acceptance is also pending. Test the direct `/student/practice` page, Guided hint timing, durable retry, teacher confirmation, and Independent completion after the code groups compile together. The current navigation does not link to `/student/practice`. Treat route discovery as a product integration decision, not as a backend security defect.

The IM2 front end currently listens on port 3002. No IM2 Convex backend listens on the ports 3222 or 3223 that `scripts/dev-stack.mjs` expects. The service on ports 3210 and 3211 belongs to `apps/danielson`. Do not use that service for IM2 acceptance. This missing IM2 backend is the current browser acceptance blocker. This audit did not write to a live backend.

## Verification Order

Run these checks after each group that changes its inputs:

1. Run the local generator test.
2. Run the current production-flow file and the seed file.
3. Run the student component and teacher form tests.
4. Run the new route and page integration tests.
5. Run `npm run lint`.
6. Run `npm run typecheck` and `npm run typecheck:backend`.
7. Run `npm run build`.

## Verification Gap Resolution

The bounded follow-up added direct handler tests for both new API routes. It also added a direct teacher-query test for candidate display.

The first candidate test found a real display defect. The query showed the teacher action for an approved and graded row that had the correct stable activity identifier but the wrong node, mode, and component. The mutation rejected the same row. The query now checks the same exact activity identity fields. It also checks the source lesson and requires the source submission time to be on or after the active enrollment and lesson assignment times.

The first teacher-route validation tests found two defects. The route accepted unknown request fields and an idempotency key longer than 80 characters. The route now uses the existing strict Zod pattern. It rejects unknown fields, blank identifiers, and keys longer than 80 characters. It still gets the teacher identifier from the authenticated session.

Both routes now map a retry conflict to HTTP 409. They map known request and publication failures to HTTP 400. They map known authorization failures to HTTP 403. They map unknown backend failures to HTTP 503. The responses do not include private backend messages.

Changed production files:

- `apps/integrated-math-2/convex/teacher.ts`
- `apps/integrated-math-2/app/api/teacher/perpendicular-bisector-exposure/route.ts`

New test files:

- `apps/integrated-math-2/__tests__/app/api/activities/submissions-route.test.ts`
- `apps/integrated-math-2/__tests__/app/api/teacher/perpendicular-bisector-exposure-route.test.ts`
- `apps/integrated-math-2/__tests__/convex/perpendicular-bisector-teacher-candidate.test.ts`

Verification results:

- Focused pilot and route set: 8 files passed and 60 tests passed.
- Lint passed.
- Convex TypeScript check passed.
- Production build passed.

The parent corrected the concurrent projector assertion. The current 65 focused tests, app lint, app TypeScript, Convex TypeScript, and production build pass.

The browser acceptance blocker remains. No IM2 Convex backend listens on ports 3222 or 3223.
