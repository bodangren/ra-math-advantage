# IM1 G40 Lesson 8-3 graph independent review

## Disposition

Accept the bounded G40 graph patch.

## Verified findings

The candidate adds five new draft skill candidates. It adds eleven Lesson 8-3 `contains` edges. Five edges target the new candidates. Six edges reuse existing skills.

Stable skill 8e keeps its ID. Its blueprint maps only to `math.im1.example.8.3.007`. Stable skill 8f keeps its ID. Its blueprint maps only to `math.im1.example.8.3.010`. Its direct source text names Problems 16 and 20. It does not name Problem 18.

The existing Lesson 8-2 graph-to-equation skill keeps its ID. Its source scope adds `.008`, Example 2, Problems 7–10. The patch does not map Problem 25 to model writing. It does not map Problem 28(b) to the combined domain-and-range skill.

The four canonical source rows `.007` through `.010` remain draft and inactive. Historical duplicate rows `.011` and `.012` remain present with rejected status. Their Lesson 8-3 containment edges are removed. The patch does not transfer evidence from either rejected identity.

Edges `math.im1.edge.1267`, `math.im1.edge.1036`, and `math.im1.edge.1037` exist in HEAD and are absent from the candidate. The candidate adds no prerequisite or equivalence edge for the new skills. Both affected SRS projections no longer claim the removed sequence prerequisite. Six placeholder activity rows are removed. The seven repaired or new skill rows remain inactive SRS planning rows with `generatorReady: false`.

The four graph catalogs contain the repaired rows once. The new blueprints are source-only. They do not contain renderer, generator, mode-specification, evidence, readiness, or approval claims.

## Independent totals

I parsed the candidate artifacts directly.

- Nodes: 976
- Edges: 2,491
- Blueprints: 374
- Practice activities: 375
- SRS planning rows: 203

These totals agree with the rollout audit and author report. The author report also gives 378 skill nodes, 377 non-rejected skill candidates, and 124 approved skills. The node artifact uses its established node-kind field rather than a plain `type: "skill"` field, so a naive `type` count is invalid.

## Test evidence

The focused Lesson 8-3 suite passed: 6 tests.

Command:

`npx vitest run __tests__/curriculum/lesson-8-3-capabilities-source.test.ts`

An initial repository-root `npm test -- --run ...` invocation selected the activity-components workspace and found two unrelated existing schema-test failures. That command did not execute the requested app test. The direct app Vitest command above executed the correct file and passed.

## Scope

This review accepts the graph and inventory correction only. It does not approve the draft skills. It does not claim usable practice content or active SRS behavior.
