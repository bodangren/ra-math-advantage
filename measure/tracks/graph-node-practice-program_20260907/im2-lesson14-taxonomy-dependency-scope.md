# IM2 Lesson 1.4 taxonomy dependency review

Date: 2026-09-09

## Decision

The parent and independent reviewer accept this expansion. Expand the frozen taxonomy batch before integration. Do not change only `graph.test.ts`. That change would leave three false `worked_example` values in the generated lesson bundle.

## Baseline failures

The parent graph run has two failures:

- The Lesson 1.4 instructional-unit title is stale in every graph catalog.
- The graph has 403 legacy worked-example nodes, while the current bundle has 402 `worked_example` phases.

A separate read-only run found one related existing failure:

`npx vitest run __tests__/curriculum/curriculum-depth.test.ts`

Result: 1 of 99 tests failed. The test expects 403 `worked_example` phases, but the bundle has 402. If only the fixed count is corrected, the same test then rejects the three Lesson 1.4 sections because they have no `### Solution` body.

## Lesson title dependency

The current lesson title is `Inequalities in One Triangle — Practice`.

The Lesson 1.4 instructional-unit title is `Inequalities in One Triangle` in these four catalogs:

- `curriculum/skill-graph/nodes.json`
- `curriculum/skill-graph/draft-nodes.json`
- `curriculum/skill-graph/edges.json`
- `curriculum/skill-graph/standard-edges.json`

Update the one lesson-node copy in each catalog. The first three paths are already in the frozen taxonomy scope. Add `standard-edges.json`. Preserve every other node and edge field.

## Worked-example distinction

Lesson 1.4 has three headings named `Example 1`, `Examples 2 and 3`, and `Example 4`. All three sections contain unanswered prompts. None contains a demonstrated solution.

The four graph IDs `.013` through `.016` are legacy draft records. Preserve all four. Their count does not define the number of current demonstrated source examples.

The current bundle generator classifies every `Example` heading as `worked_example`. Change the existing classification so an Example section is `worked_example` only when its body contains an exact `### Solution` heading. Classify an unanswered Example section as `learn`. This general rule changes only the three Lesson 1.4 phases in the current 96-lesson source set.

Regenerate the existing dependent outputs. The Lesson 1.4 phase sequence and content stay the same. Only the three phase types and derived calendar distribution change.

Update `graph.test.ts` to map current demonstrated solutions. Select generated phases that have `phaseType: "worked_example"` and exact Problem and Solution headings. Do not compare their count with every legacy graph node. Keep the per-source identity, title, and source-path checks. Add an explicit assertion that the four Lesson 1.4 legacy IDs remain present and draft in all four catalogs.

Update `curriculum-depth.test.ts` to remove the hard-coded worked-example count. Keep the rule that every phase classified as `worked_example` has exact Problem and Solution headings. Add an assertion that the three unanswered Lesson 1.4 Example sections are `learn` and contain no Solution heading.

With the corrected classification, the current bundle has 399 demonstrated `worked_example` phases. This count is verification data. It is not source authority.

## Required path expansion

Keep the seven frozen taxonomy paths. Add these eight paths:

1. `apps/integrated-math-2/curriculum/skill-graph/standard-edges.json`
2. `apps/integrated-math-2/__tests__/curriculum/graph.test.ts`
3. `apps/integrated-math-2/__tests__/curriculum/curriculum-depth.test.ts`
4. `apps/integrated-math-2/scripts/build-curriculum.mjs`
5. `apps/integrated-math-2/curriculum/lessons.json`
6. `apps/integrated-math-2/curriculum/calendar.json`
7. `apps/integrated-math-2/curriculum/implementation/class-period-packages/unit-1.json`
8. `apps/integrated-math-2/curriculum/module-1-class-period-plan.md`

The full corrected freeze has 15 paths.

The four generated output paths are existing dependencies of `build-curriculum.mjs` and `build-calendar.mjs`. No new file or runtime abstraction is required.

## Required proof

Before integration, require:

- The original nine source-mapping tests pass.
- All six graph tests pass.
- All 99 curriculum-depth tests pass.
- `npm run curriculum:check` passes.
- Lint, build, and post-build TypeScript pass.
- All unrelated graph rows, source lessons, generated lesson records, and calendar records remain unchanged.

This investigation was read-only. The seven frozen taxonomy paths remain unchanged.
