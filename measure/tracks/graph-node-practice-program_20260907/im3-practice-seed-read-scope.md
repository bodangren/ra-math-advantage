# IM3 practice seed read-cap repair scope

## Result

Use a lazy per-invocation cache for the existing unindexed fallback activity read. Change only these two files:

1. `apps/integrated-math-3/convex/seed/seed_practice_items.ts`
2. `apps/integrated-math-3/__tests__/convex/seed/seed-practice-items.test.ts`

Do not change a schema, index, problem family, activity, practice item identity, variant label, repair rule, or seed order.

## Observed failure

The fresh local `seedAll` run reached the native Convex 16 MiB read limit. The direct helper retry failed at the repeated fallback query:

```ts
ctx.db.query("activities").take(200)
```

The handler runs this same unindexed read inside the loop over 87 catalog problem families. A family uses this fallback when its standard lookup has no matching activity with the required component key. The local verification result has 388 activities and 91 stored practice variants. The 91 variants consist of 87 catalog families plus four seeded quadratic-formula variants. Re-reading those same activity documents for multiple families makes the transaction exceed 16,777,216 read bytes.

## Minimum implementation

Add one local cache variable before the family loop. Leave it undefined until the first fallback is necessary. On the first fallback, run the existing query exactly once:

```ts
ctx.db.query("activities").take(200)
```

Store that ordered result for the remainder of this handler invocation. Each later fallback filters the cached result by `family.componentKey`.

This preserves the current first-200 boundary and database order. It preserves family iteration order. It preserves activity iteration order within each family. It also preserves the standard-index branch. Do not merge the standard and fallback branches.

Keep these behaviors unchanged:

- Use the first objective ID for the standard lookup.
- Prefer matching activities from `activities.by_standard`.
- Use the fallback only when that branch has no component-key match.
- Create the same composite `practiceItemId`.
- Store the family `variantKey` as the parent key.
- Keep `legacyProblemFamilyId`, `migrationVersion`, and source timestamp behavior.
- Keep the per-family/activity label counter and `Set A`, `Set B`, and later labels.
- Repair `variantKey` only when the existing item belongs to the same legacy family.
- Preserve a foreign-family item without reassignment.
- Return the same success and failure records.

Do not add pagination in this repair. Pagination would change the existing first-200 selection contract and expand the seed result. Do not add a new index only to avoid this repeated identical read.

## Other reads and output

The handler also performs indexed reads for one practice variant, one competency standard, standard activities, and an existing practice item. These reads are selective. Some objective codes can repeat across families, but the reported failure identifies the repeated unindexed fallback scan. The local population is 388 activities and 91 stored practice variants. The catalog loop contains 87 families. One fallback scan remains bounded to the existing first 200 activity documents. The current database has more than 200 activities, so the preexisting selection truncation remains outside this repair. The counts 44 and 79 refer to competency standards and lesson-standard mappings. They are not activity or family counts.

The result can contain one row for each selected family/activity pair plus one failure row for a family without a match. This repair does not increase that set. It therefore does not increase result size or write count. If a later dataset makes the indexed reads or unchanged result exceed a native limit, that is a separate measured defect. Do not add speculative caches or output truncation in this repair.

## Test change

Extend the existing memory fixture with a counter for unindexed `activities.take(...)` calls. Do not count `activities.by_standard.take(...)` as a fallback scan.

Add an actual-handler regression with multiple families that require fallback selection. Require:

- the unindexed fallback query runs exactly once in one invocation;
- each family filters the same ordered first-200 result by its own component key;
- the selected activity order is unchanged;
- each inserted item keeps its composite identity, family parent key, and expected label;
- same-family legacy repair still occurs;
- a foreign-family item is not reassigned;
- returned success and failure records are unchanged for the fixture.

Keep the three existing branch and repair tests. Their existing assertions remain required.

## Verification

Run the focused actual-handler test. Run the related seed aggregate tests. Run app lint, build, and `npx tsc --noEmit`.

After integration, run only `seedPracticeItems` once against the fresh local database. Require completion without the 16 MiB read error. Compare the result counts and stored practice-item identities with the pre-failure expectations. Do not run a remote deployment.
