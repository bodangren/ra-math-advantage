# Implementation Plan: Unified Math App: Seat Licensing

Track: `math-app-seat-licensing_20261114`
Specification: [spec.md](./spec.md)
Set: [Unified Math App](../../sets/unified-math-app_20261114.md), member 5
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start S1 until `math-app-student-history_20261114` is closed in `measure/tracks.md`.

### Gate Commands

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=apps/math` |
| Typecheck | `npm run typecheck --workspace=apps/math` |
| Test | `CI=true npm run test --workspace=apps/math` |
| Build | `npm run build --workspace=apps/math` |
| Bundle | `npm run bundle-size:audit --workspace=apps/math` |
| Seeds | `npm run validate:seeds --workspace=apps/math` |
| E2E | `npm run test:e2e --workspace=apps/math` |
| Accessibility | `npm run test:a11y --workspace=apps/math` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |

A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table.

### Test Rules

- Convex tests use the mock context helpers in `apps/math/__tests__/convex/_helpers/`.
- Each access test has a positive case and a negative case.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

## Phase S1: License model
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — define the license model
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Enrollment Paths, Access Checks, Seat Counts.
    - [ ] Run each gate on the start commit. Record the results under "Baseline".
    - [ ] Write the schema: `licenses` (`organizationId`, `productKey`, `academicYear`, `seatCount`, `status` `active` or `cancelled`, `createdAt`, `updatedAt`), index `by_org_product_year`.
    - [ ] Also: `license_seats` (`licenseId`, `organizationId`, `studentId`, `productKey`, `academicYear`, `status` `assigned` or `released`, `assignedAt`, `releasedAt`), indexes `by_license_and_status` and `by_student_product_year`.
    - [ ] Write the contract of `convex/licensing/operator.ts`: `createLicense`, `setSeatCount`, and `cancelLicense` as `internalMutation`, with the rules of S1 and spec D3.
- [ ] Task: S1 Test (Red) — specify the license model
    - [ ] `__tests__/convex/schema-licensing.test.ts`: the two tables have their fields and indexes.
    - [ ] `__tests__/convex/licensing/operator.test.ts`: the three failing calls of S1 write nothing. `setSeatCount` to 9 with 10 assigned seats fails, and to 10 succeeds.
    - [ ] `__tests__/convex/seed/`: the seed writes the demo license of spec D8 before its first enrollment write. The count of demo students with an `active` enrollment in `2026-2027` is 50 or less.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S1 Implement — add the license model
    - [ ] Change `convex/schema.ts` and regenerate `convex/_generated`.
    - [ ] Implement `convex/licensing/operator.ts`.
    - [ ] Add the demo license to the seed. Write it before the first enrollment write of `seedAll`, because each enrollment needs a free seat after S2.
    - [ ] Count the demo students with an `active` enrollment in `2026-2027`. Record the count under "Seat Counts". If the count is more than 50, stop and report.
    - [ ] Commit: `feat(math): add the license model`.
- [ ] Task: S1 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit the evidence file: `measure(math-app-seat-licensing): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: License model' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: License model' as complete`.

## Phase S2: Seat assignment at enrollment
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — define the assignment
    - [ ] Write the contract of `assignSeat(ctx, { organizationId, studentId, productKey, academicYear })` in `convex/licensing/seats.ts`. It returns the seat ID, or a typed failure (`no_license` or `no_free_seat`).
    - [ ] Record that `enrollStudent` calls `assignSeat` in the same mutation, before the enrollment insert, with `productKey: "math"` and the year of the class.
    - [ ] Run `git grep -n "enrollStudent(" -- apps/math/convex`. Record each caller under "Enrollment Paths".
- [ ] Task: S2 Test (Red) — specify the assignment
    - [ ] `__tests__/convex/licensing/seats.test.ts`: the five cases of the S2 criteria, with the exact messages.
    - [ ] Also: two enrollments of one student in two courses of one year use one seat.
    - [ ] `__tests__/convex/roster-import.test.ts`: an import with more students than free seats gives a row error for each extra row.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S2 Implement — assign seats at enrollment
    - [ ] Implement `assignSeat`. Call it from `enrollStudent`.
    - [ ] Show the failure message in each page that enrolls a student.
    - [ ] Commit: `feat(math): assign a seat at enrollment`.
- [ ] Task: S2 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit the evidence file: `measure(math-app-seat-licensing): record the S2 results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: Seat assignment at enrollment' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: Seat assignment at enrollment' as complete`.

## Phase S3: Enforcement on access
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Contract — define the seat check
    - [ ] Write the contract of `hasCourseAccess(ctx, { studentId, courseKey })` in `apps/math/convex/licensing/access.ts`: true for a `completed` enrollment, and true for an `active` enrollment only with an assigned seat in an `active` license of the class year (spec D6, D7).
    - [ ] Write the contract of the no-seat notice: the component `apps/math/components/student/NoSeatNotice.tsx` shows the text of the S3 criteria. The student course layout `apps/math/app/student/[course]/layout.tsx` renders it in place of its children when `hasCourseAccess` is false.
    - [ ] Run `git grep -n -E "notFound|redirect\\(" -- apps/math/app/student`. Record the course access check of the base track under "Access Checks".
- [ ] Task: S3 Test (Red) — specify the seat check
    - [ ] `__tests__/convex/licensing/access.test.ts`: the four cases of the S3 criteria.
    - [ ] `__tests__/app/`: the student course layout shows the page "No seat for this course year. Ask your teacher." with no course content, for the no-seat case.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S3 Implement — enforce the seats
    - [ ] Implement `hasCourseAccess` in `apps/math/convex/licensing/access.ts`. Use it in `apps/math/app/student/[course]/layout.tsx` and in each student course query.
    - [ ] Add `apps/math/components/student/NoSeatNotice.tsx`, and render it from the layout as the S3 Contract gives.
    - [ ] Commit: `feat(math): enforce seats on the student course pages`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit the evidence file: `measure(math-app-seat-licensing): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: Enforcement on access' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: Enforcement on access' as complete`.

## Phase S4: Admin license view
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Contract — define the admin view
    - [ ] Write the contract of `convex/licensing/admin.ts`: `listLicenses` (query), `listSeats({ licenseId })` (query), and `releaseSeat({ seatId })` (mutation). Each checks the admin role and the organization of the session.
    - [ ] Record the release rule of spec D5.
- [ ] Task: S4 Test (Red) — specify the admin view
    - [ ] `__tests__/convex/licensing/admin.test.ts`: `listLicenses` returns the counts of S4. `releaseSeat` fails for a seat with an `active` enrollment and changes nothing. A teacher gets an authorization error.
    - [ ] Also: an admin of another organization gets no row.
    - [ ] `__tests__/app/`: `/admin/licenses` renders the licenses, and the release action shows only for a releasable seat.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S4 Implement — add the admin view
    - [ ] Implement `convex/licensing/admin.ts`.
    - [ ] Add `/admin/licenses` and a link from `/admin/dashboard`.
    - [ ] Commit: `feat(math): add the admin license view`.
- [ ] Task: S4 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Record the demo seat counts under "Seat Counts". Commit the evidence file: `measure(math-app-seat-licensing): record the S4 results`.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: Admin license view' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: Admin license view' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the set overview status, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
