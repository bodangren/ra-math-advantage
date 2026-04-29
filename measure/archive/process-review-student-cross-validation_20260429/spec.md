# Spec: Process Review studentId Cross-Validation

## Problem

The `processReviewHandler` in `convex/srs/processReview.ts` accepts `cardState.studentId` and `reviewEntry.studentId` as independent inputs without validating that they match. A mismatch would create corrupt data:
- An SRS card updated for one student
- A review log entry attributed to a different student

This breaks data integrity and could cause incorrect SRS scheduling, wrong student analytics, and misleading teacher dashboards.

## Solution

Add a validation check at the start of `processReviewHandler` that throws a descriptive error if `cardState.studentId !== reviewEntry.studentId`.

## Acceptance Criteria

1. Handler throws error when studentIds don't match
2. Error message is descriptive (no internal details exposed)
3. Existing tests continue to pass (they use matching studentIds)
4. New test added specifically for the cross-validation case
5. No performance impact on the happy path

## Files Affected

- `apps/integrated-math-3/convex/srs/processReview.ts` — add validation
- `apps/integrated-math-3/__tests__/convex/srs/processReview.test.ts` — add test
