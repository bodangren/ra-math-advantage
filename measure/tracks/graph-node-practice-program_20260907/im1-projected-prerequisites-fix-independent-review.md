# G52 projected prerequisite repair independent review

## Verdict

Accept the frozen six-path candidate.

## Verified behavior

- Both saved SRS projections contain exactly 66 direct prerequisite pairs.
- The two projected pair sets equal the direct, non-rejected canonical `prerequisite_for` pair set.
- All 14 stale lesson-sequence pairs are absent from both projections. These pairs correspond to removed edges `1235` through `1241` and `1270` through `1276`.
- `math.im1.g47.prerequisite.001` keeps its source, target, weight, confidence, rationale, review status, and metadata. Its type changes from `prerequisite` to `prerequisite_for`.
- The valid median-to-five-number-summary pair remains in both projections.
- The canonical graph has no remaining edge of type `prerequisite`.
- A semantic comparison with base `2bfeb9796` confirms that the graph change is only the G47 type normalization. Each projection change is limited to prerequisite arrays. No other JSON value changes.
- The regression compares sets of direct pairs. It checks both projections, all 14 stale pairs, and the retained valid pair. It does not permit transitive reachability as evidence.
- The two affected lesson tests now use the projector contract term.

## Focused verification

Command:

`npm run test -- --run __tests__/curriculum/projected-prerequisites-consistency.test.ts __tests__/curriculum/lesson-9-1-capabilities-source.test.ts __tests__/curriculum/lesson-9-4-capabilities-source.test.ts`

Result: 3 files passed. All 22 tests passed.
