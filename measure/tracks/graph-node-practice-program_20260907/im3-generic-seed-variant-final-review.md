# IM3 generic seed variant repair independent review

## Result

Accepted.

The frozen patch contains the exact two scoped paths. The baseline paths have not changed between `4f2a7d46a60c640dd81a0f8aa37c9c7f5e61d373` and current HEAD. The frozen production and test content matches the current candidate.

## Production behavior

Both activity-selection branches now store the existing problem-family `seedVariantKey` in `practice_items.variantKey`. This value resolves through `practice_variants.by_variantKey`.

The code preserves the composite `${seedVariantKey}:${activity._id}` value in `practiceItemId`. It also preserves that composite value as the label-counter key. Thus, the repair does not merge physical item identities or change label allocation.

On rerun, the code patches an existing composite variant key only when `legacyProblemFamilyId` equals the current parent family. It does not patch an item owned by another family. It returns the stored item identity and the corrected family key for an owned item. It returns the unchanged stored family key for a foreign item. It does not insert a duplicate when an item already exists.

The change does not create composite `practice_variants` rows. It does not modify the schema, consumers, QF allocation writer, or QF fixed seed path.

## Test proof

The focused handler test calls the actual `seedPracticeItems` handler and imports the real IM3 problem-family list. It covers:

- the indexed standard-selection branch;
- the fallback component-selection branch;
- resolution to exactly one parent variant;
- the same-family legacy repair;
- a second-run row-preservation check;
- returned parent keys; and
- preservation of a cross-family item.

I ran the focused test. All 3 tests passed. The freeze report records 868 related tests and successful lint, build, and post-build TypeScript checks.

No blocking defect was found. The repair establishes reference integrity. It does not establish pedagogical correctness for each family-to-activity selection.

Parent acceptance: commit `d8035d25f`. Parent focused tests passed all three cases. Author related tests passed 868 cases. Lint, build, and separate post-build TypeScript passed. Both clean main paths were updated. The remote row repair remains pending until the next accepted backend deployment.
