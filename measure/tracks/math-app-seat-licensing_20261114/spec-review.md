# Spec Review: math-app-seat-licensing_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track adds seat licenses to the unified math app. A license belongs to one organization, one product key, and one academic year, and it has a seat count. `enrollStudent` assigns or reuses a seat at each enrollment and refuses the enrollment when no free seat exists. The course pages of an `active` enrollment need an assigned seat in an `active` license, and an admin page lists the licenses and releases seats with no `active` enrollment.

### How the current system works, per this spec

After the history track, each enrollment write goes through the internal helper `enrollStudent`, and each class has a `courseKey` and an academic year. After the base track, a student opens the pages of a course only with an `active` or `completed` enrollment in a class of that course. The schema has `organizations` and `profiles` with a role and an `organizationId`, and it has no license or seat table. The admin pages are `/admin/dashboard` and, after the history track, `/admin/years`.

### Findings

- F1 [Major] plan.md Phase S3 Implement: The task "Add the no-seat page" names no file, and the seat check task names the student course layout by role, not by path. Rationale: File location is one of the five design kinds the plan must fix; the base track already pins the layout at `apps/math/app/student/[course]/layout.tsx`.
- F2 [Major] plan.md Phase S1/S2 Implement: The plan does not state that the seed creates the demo license before any enrollment write, and it does not state that the demo enrollment count fits the 50 seats of spec D8. Rationale: After the history track, the seed writes each enrollment through `enrollStudent`, and after S2 each enrollment needs a free seat; the Seeds gate catches a failure, but the plan should pin the order.
- F3 [Nit] spec.md Story S2 / D4: The failure message "The organization has no license for 2026-2027" also shows when a cancelled license exists, because the condition is "no `active` license". Rationale: Consider "no active license" so the message matches the condition.
- F4 [Nit] plan.md Phase S3 Contract: The contract names `hasCourseAccess` but not its module file; the test path `__tests__/convex/licensing/access.test.ts` implies `convex/licensing/access.ts`. Rationale: Name the file so the Red task and the Implement task use one location.

### Author Response
- F1: FIX (the S3 Contract and Implement tasks name `apps/math/convex/licensing/access.ts`, `apps/math/components/student/NoSeatNotice.tsx`, and `apps/math/app/student/[course]/layout.tsx`)
- F2: FIX (the S1 Test and Implement tasks write the demo license before the first enrollment write, and check that the demo enrollments use 50 seats or fewer)
- F3: DECLINE
- F4: DECLINE (the F1 fix also names the file)

## Round 2

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track adds seat licenses to the unified math app. A license belongs to one organization, one product key, and one academic year, and it has a seat count. `enrollStudent` assigns or reuses a seat at each enrollment and refuses the enrollment when no free seat exists. The course pages of an `active` enrollment need an assigned seat in an `active` license, and an admin page lists the licenses and releases seats with no `active` enrollment.

### How the current system works, per this spec

After the history track, each enrollment write goes through the internal helper `enrollStudent`, and each class has a `courseKey` and an academic year. After the base track, a student opens the pages of a course only with an `active` or `completed` enrollment in a class of that course. The schema has `organizations` and `profiles` with a role and an `organizationId`, and it has no license or seat table. The admin pages are `/admin/dashboard` and, after the history track, `/admin/years`.

### Findings

- None

### Author Note

After Round 2, the author added a "Closeout" section to plan.md: the Measure closeout and the origin sync of the spec NFR. The change applies finding F1 of `math-app-retire-old-apps_20261114` to each member of the set. It adds no new requirement.

## Accepted Risks

None.
