# IM1 G41 Lesson 8-4 graph independent review

## Disposition

Accept the bounded G41 graph patch.

## Verified semantic changes

The patch preserves the stable 8g ID, `math.im1.skill.8.4.rewrite-exponential-functions-so-rates-share-the-same-time-u`. It narrows this skill to equivalent-factor rewriting. Its direct source scope is Problems 1(a), 2(a), and 13.

The patch adds two draft and inactive skill candidates:

- effective percent rate for a specified time interval;
- comparison of exponential growth or decay rates across time units.

The comparison candidate includes Problem 16 as an error-analysis input for rate comparison. It does not create a separate diagnostic skill. The patch does not add a table-model skill or reuse containment. Problems 6 and 12 remain manual because their tables require a reviewed estimation contract.

Source row `math.im1.example.8.4.013` remains draft and inactive. The three affected skill blueprints map to this source row. They remain source-only. They have no Worked, Guided, Independent, renderer, generator, evidence, readiness, or approval claim.

The existing Lesson 8-4 containment for stable 8g remains. The patch adds exactly two `math.im1.g41.contains.*` edges for the new candidates. It removes `math.im1.edge.1268`. It removes the three placeholder activities for stable 8g. It does not add a prerequisite or equivalence edge. All three SRS rows remain inactive with `generatorReady: false`.

The repaired rows occur once in each of the four embedded graph catalogs. I found no semantic change to an unrelated retained Lesson 8-4 skill, blueprint, or edge.

## Independent totals

I parsed the candidate artifacts directly.

- Nodes: 978
- Edges: 2,492
- Blueprints: 376
- Practice activities: 372
- SRS planning rows: 205

The node, edge, blueprint, and SRS totals agree with the author report. The activity count reflects removal of the three placeholders from the prior 375 rows. The author report does not state a resulting activity total.

## Test evidence

The focused app test passed: 4 tests.

Command:

`npx vitest run __tests__/curriculum/lesson-8-4-capabilities-source.test.ts`

The command ran from `apps/integrated-math-1`.

## Scope

This review accepts the graph correction only. It does not approve the three draft skills. It does not claim complete practice coverage or active SRS behavior.
