# Fix Teacher Dashboard N+1 Queries - Specification

## Context

The `getTeacherSrsDashboardData` query (teacher.ts:1329) has a critical N+1 query problem. For each active student in a class, it makes 3 sequential database queries inside a loop, totaling 30+ sequential DB round-trips per student.

## Problem

In `getTeacherSrsDashboardData` at lines 1389-1459, the handler loops over `activeStudents` and makes:

1. **`srs_cards` query** (line 1390-1393): One `.collect()` per student
2. **`profiles` lookup** (line 1408): One `.get()` per student
3. **`srs_sessions` query** (line 1411-1414): One `.collect()` per student

For a class of 30 students, this is 90+ sequential database operations.

Additionally, the return value has empty arrays for `weakObjectives`, `strugglingStudents`, and `misconceptions` — these are stubbed out with `[]`.

## Approach

1. **Batch all student queries**: Use `Promise.all` over student IDs to fetch all `srs_cards`, `profiles`, and `srs_sessions` in parallel
2. **Remove per-student profile lookup**: We already have student data from `listOrganizationStudents` or enrollments; the extra `.get()` is redundant
3. **Consider index optimization**: The `by_student` index on `srs_cards` and `srs_sessions` is already used, but we could consider a single query per table filtered by multiple student IDs

## Requirements

1. All per-student queries must be batched using `Promise.all`
2. No functional behavior change for existing data flows
3. `npm run typecheck` passes
4. `npm run lint` passes
5. Existing tests pass

## Acceptance Criteria

1. `getTeacherSrsDashboardData` makes O(1) queries per table, not O(n) per student
2. Response shape unchanged (weakObjectives/strugglingStudents/misconceptions remain empty stubs)
3. Build passes