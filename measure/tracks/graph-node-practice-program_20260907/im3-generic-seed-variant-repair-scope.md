# IM3 generic seed variant reference repair scope

## Decision

Use a two-path repair. Store the parent problem-family key in `practice_items.variantKey`. Keep the activity-specific composite value in `practiceItemId`.

## Contract evidence

`practice_variants.variantKey` is the unique family identity. `practice_items.variantKey` is its logical foreign key.

The existing blueprint validator rejects a practice item when its `variantKey` is absent from `practice_variants`. `lookupVariantForScheduling` reads an item by physical `activityId`, then resolves its family through an exact `practice_variants.by_variantKey` lookup. Queue, submission-to-SRS, objective-proficiency, and timing paths use the same family identity.

`practiceItemId` is the item identity. It can remain `<family variant key>:<physical activity ID>`. This keeps each item unique when one family can map to more than one activity.

## Defect

`seed_practice_items.ts` currently computes:

```ts
const variantKey = `${seedVariantKey}:${activity._id}`;
const practiceItemId = `${seedVariantKey}:${activity._id}`;
```

`seed_problem_families.ts` creates only `seedVariantKey` in `practice_variants`. Thus the inserted item cannot resolve its family.

The remote finding confirms this behavior. Its activity ID is a valid physical Convex ID. Its composite item `variantKey` is missing from `practice_variants`.

## Exact path scope

1. `apps/integrated-math-3/convex/seed/seed_practice_items.ts`
2. `apps/integrated-math-3/__tests__/convex/seed/seed-practice-items.test.ts`

The second path is a new focused handler test. Do not change the schema, shared packages, consumers, validators, lesson seeds, or the seed orchestrator.

## Minimum production change

In both activity-selection branches:

- Set `variantKey` to `seedVariantKey`.
- Keep `practiceItemId` as `${seedVariantKey}:${activity._id}`.
- Keep `legacyProblemFamilyId` as `seedVariantKey`.
- Keep the physical Convex activity ID in `activityId`.

A simple insert-only change does not repair the row already stored in the replacement deployment. On an existing item found by `activityId`, patch `variantKey` only when both conditions are true:

- `existing.legacyProblemFamilyId === seedVariantKey`
- `existing.variantKey !== seedVariantKey`

Return the stored item identity and corrected parent variant key. If an existing item belongs to a different parent family, preserve it. This guard prevents later families with the same component key from repeatedly reassigning one activity.

Do not create a composite `practice_variants` row. That would duplicate family metadata and create a second family identity.

## Test-first proof

Create a small in-memory Convex handler fixture for the real `seedPracticeItems._handler`. Import the real `IM3_PROBLEM_FAMILIES` list. Support only the tables and indexes that the handler uses.

Add these cases:

1. A new matching activity produces an item whose `activityId` is the physical activity ID, whose `variantKey` equals the existing parent family key, and whose `practiceItemId` remains the composite unique identity.
2. Every created item resolves to exactly one stored `practice_variants.variantKey`.
3. A legacy composite item with matching `legacyProblemFamilyId` is patched to its parent family key on rerun. No duplicate item is inserted.
4. An existing item owned by a different family is not reassigned when another family shares its component key.
5. A second run preserves all rows and produces no duplicate item.
6. Returned successful rows report the stored parent `variantKey`.

The red test must show the current composite `variantKey` and the failed family resolution.

## Verification

Run the new focused handler test. Run existing seed and blueprint validation tests. Run queue and submission-SRS tests because they consume this relation. Run lint, build, and a separate TypeScript check.

After integration, run only `seed/seed_practice_items:seedPracticeItems` on the replacement test deployment. Preserve existing demo credentials and progress. Confirm that all `practice_items.activityId` values resolve to physical activities and all `practice_items.variantKey` values resolve to one practice variant. Confirm that the existing broken row is repaired without a duplicate.

No source or remote data changed during this review.

Keep the existing variant-label counter keyed by the composite item identity. The foreign-key repair must not change label allocation. Verify both selection branches. A resolving family key alone does not prove that the family is pedagogically correct for the activity; broader source mapping remains open.
