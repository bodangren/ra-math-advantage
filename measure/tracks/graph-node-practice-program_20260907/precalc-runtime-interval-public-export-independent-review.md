# Q37 interval public export independent review

## Decision

Accept the frozen seven-file dependency patch.

The patch adds only the required public exports and regression tests. It does not copy a broad pending barrel.

- `@math-platform/activity-components` exports `IntervalClassificationActivity`, `IntervalClassificationActivityProps`, and `IntervalClassificationProps` from its root.
- `@math-platform/math-content/schemas` exports `intervalClassificationSchema` and `IntervalClassificationProps`.
- `math-content` owns the existing schema implementation.
- The former activity-components schema module re-exports the schema and type. It does not keep a second implementation.
- The dependency direction remains from activity-components to math-content.
- The public-import tests use only the package public barrels that the teacher surface needs.

The patch has seven paths. Five paths implement the export move. Two paths test the public imports. I found no unrelated export or runtime scope.

## Verification

The candidate root overlay contains 21 `@math-platform` package links. The `math-content` and `activity-components` links both resolve to this candidate.

I ran the math-content public export test. It passed 1 test.

I ran the activity-components public export, schema, and activity tests. They passed 14 tests in 3 files.

No candidate or main file was changed during this review.
