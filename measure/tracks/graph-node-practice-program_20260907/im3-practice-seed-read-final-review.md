# IM3 practice seed read-cap independent review

## Decision

Accept the frozen two-file patch.

Baseline: `5e67142bd040f93bc4ca1f3ae919345bb87f9361`

Artifacts reviewed:

- `/tmp/im3-practice-seed-read.patch`
- `/tmp/im3-practice-seed-read.paths.txt`
- `/tmp/im3-practice-seed-read.report.md`
- `/tmp/im3-lesson18-recovery-v6l3h06f`

## Reconstruction

The path list contains the exact two scoped paths. The patch uses repository-relative `a/` and `b/` headers.

I reconstructed both files from `git show 5e67142bd040f93bc4ca1f3ae919345bb87f9361:<path>`. The patch applied with `patch -p1`. Both reconstructed files are byte-equal to the frozen candidate files.

## Behavior review

The production change adds one handler-local variable before the family loop. It remains `undefined` until a family needs fallback selection. The first fallback executes the unchanged `ctx.db.query("activities").take(200)` read. Later fallback branches reuse that exact ordered array and filter it by the current family component key.

The nullish assignment also caches an empty array. It does not repeat the fallback read when the first result is empty. A new handler invocation creates a new local variable and performs a new read when needed.

The standard branch remains separate. It still uses the first objective ID, the `activities.by_standard` index, the existing limit, and the original component-key filter. A matching standard activity does not initialize the fallback pool.

The patch does not change family order, activity order, the first-200 boundary, item identity, variant parent key, label counter, validation, write fields, ownership check, same-family repair, foreign-family preservation, failure rows, or success rows.

The new actual-handler regression uses two fallback component families. It proves one read per invocation, ordered selection from the first 200 rows, exclusion of row 201, composite identities, parent keys, and labels. It compares the second invocation result with the first result and proves that the invocation-local pool resets. A separate case proves that an empty pool is reused.

The three prior branch and ownership tests remain present. The focused file now has five cases.

## Independent test

I ran:

```text
cd /tmp/im3-lesson18-recovery-v6l3h06f/apps/integrated-math-3
npm test -- --run __tests__/convex/seed/seed-practice-items.test.ts
```

Result: one file and five tests passed.

The author reports 36 focused and related tests, 833 seed tests, lint, pre-build TypeScript, build, and post-build TypeScript passed.

## Boundary

This patch keeps the existing first-200 selection contract. It reduces repeated read bytes only. The scoped local Convex retry remains required to prove that the native 16 MiB failure is removed.

## Integration

Commit: `4294ebb72`. Parent review accepted the exact staged patch and passed all five focused tests. Both clean main paths were updated. Local native verification is in progress.
