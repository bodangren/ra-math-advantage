# Graph program owned working-copy audit

## Result

This review is read-only. It did not change the working tree or the Git index.

The current `HEAD` is `0bbe409ecba42411d620a220440c30b08253b22a`.

Seven paths are safe to materialize from current `HEAD`. Each path was clean in the earlier status snapshot. Each working file now exactly equals its recorded pre-change base. Current `HEAD` contains the integrated replacement.

- `apps/integrated-math-1/__tests__/curriculum/lesson-10-2-capabilities-source.test.ts`
- `apps/integrated-math-1/__tests__/curriculum/lesson-7-4-capabilities-source.test.ts`
- `apps/integrated-math-1/__tests__/curriculum/module-2-graph-source.test.ts`
- `apps/integrated-math-1/curriculum/modules/module-10-lesson-4`
- `packages/math-content/src/quadratic-formula.ts`
- `packages/math-content/src/__tests__/quadratic-formula.test.ts`
- `packages/math-content/src/__tests__/t17-adversarial.test.ts`

Two base-equal paths are not safe to materialize without an owner review. Both paths were already modified in the earlier status snapshot. Their base-equal bytes can be intentional older work.

- `apps/integrated-math-1/curriculum/skill-graph/projection/teacher-evidence-map.json`
- `apps/integrated-math-1/curriculum/modules/module-10-lesson-3`

The following paths contain mixed working content. Their bytes differ from both the applicable pre-change base and current `HEAD`. Preserve them.

- `apps/integrated-math-1/__tests__/curriculum/lesson-7-5-capabilities-source.test.ts`
- `apps/integrated-math-1/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/edges.json`
- `apps/integrated-math-1/curriculum/skill-graph/generator-gap-queue.json`
- `apps/integrated-math-1/curriculum/skill-graph/im1-coverage-matrix.json`
- `apps/integrated-math-1/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/srs-input.json`
- `apps/integrated-math-1/curriculum/skill-graph/standard-edges.json`
- `measure/skill-graph-im1-rollout-audit.md`

## Evidence

I used these recorded bases:

- G53 graph: `7d0557ff7`
- G54 source: `7494e62fb`
- G54 graph: `bdd6303420da2ee483e0adcf1d829d2080442a23`
- G55 source: `6450b4ad6fbc93d9c893e27f7ee31b322b096b29`
- IM3 quadratic-formula generator: `bdd6303420da2ee483e0adcf1d829d2080442a23`

I compared each path with `git cat-file` content from its base and from current `HEAD`. I compared the result with the working-file bytes. I also parsed `/tmp/graph-program-main-status-current.bin` as NUL-delimited porcelain status. That snapshot predates the recent G54, G55, and quadratic-formula integrations.

The G54 source test and its 23 images already equal current `HEAD`. The G54 graph Lesson 10-3 capability test already equals current `HEAD`. The G55 source test and its 15 images already equal current `HEAD`. These paths need no action.

The Lesson 10-2 capability test has two applicable comparisons. It is mixed relative to the older G53 base because that file did not exist at that base. It exactly equals the later G54 graph base. The earlier status snapshot marks it clean. Therefore, the later comparison controls its cleanup disposition.

The machine-readable comparison is `/tmp/graph-program-owned-working-copy-audit.json`.

## Limits

This audit proves byte identity and prior status only. It does not judge the semantics of the two previously dirty base-equal paths. It does not authorize changes to mixed paths.

## Parent result

The parent independently rechecked the earlier status snapshot and exact base bytes for all seven paths. The parent wrote their current committed versions to the working copy. All seven paths now have no diff from HEAD. Previously dirty and mixed paths remain unchanged. This removes reverse differences created by index-only integration. Future integrations must materialize owned paths that were clean before the change, while preserving mixed paths.
