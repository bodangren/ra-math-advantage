# IM1 G42 Lesson 8-5 graph independent review

## Disposition

Accept the corrected bounded G42 graph patch.

## Capability and source fit

The patch preserves the stable 8h and 8i IDs. Stable 8h now covers consecutive-ratio classification. Its direct source is the joint Examples 1 and 2, Problems 1–12. It does not claim direct evidence from the composite Problems 32 or 45.

Stable 8i remains a draft, inactive planning aggregate. Its blueprint has no direct source-node mapping. It has no active practice or evidence claim.

The four new draft candidates match the accepted proposal:

- extend a geometric sequence forward or backward;
- evaluate a specified term from an explicit formula;
- write an explicit formula from displayed terms;
- determine an initial term from two nonconsecutive terms.

The initial-term candidate cites only Mixed Exercises Problem 44(b). Its blueprint has an empty `sourceNodeIds` list because this is mixed-only evidence. It does not claim Problem 44(a), the first printed formula, or the full comparison. The node and blueprint add no positive-ratio assumption. Therefore, the source-supported `r=1/4` and `r=-1/4` possibilities remain available to a future response contract.

The formula-writing and evaluation candidates cite Problems 34–38. Their scope permits negative ratios and negative terms as variants. The patch does not create separate sign-based skills.

## Resolved source-boundary defects

1. The initial-term node source reference says only `Mixed Exercises, Problem 44(b)`. It must say that direct evidence is the **second sequence** initial-term response. The first sequence has the unresolved `n` versus `x` notation and is outside this candidate.
2. The evaluation and formula-writing node references each cite whole Problems 34–38. Each reference must identify its own response portion. The formula candidate covers equation writing. The evaluation candidate covers specified-term evaluation.
3. The G38 and G40 reuse containment rationales say only that Lesson 8-5 directly assesses the capability. They do not preserve the accepted subproblem boundaries. Record the exact source subparts in the existing rationale or source-reference fields: model evaluation uses Problems 30(b), 31, and 33(b); contextual model writing uses Problems 30(a) and 33(a). Do not add a new field or schema.

The corrected candidate resolves all three findings in all four catalogs and in the two reuse containment rationales.

## Reuse and exclusions

The patch adds exact Lesson 8-5 containment for the existing model-evaluation skill from G38 and the existing contextual model-writing skill from G40. It does not alter their stable IDs or approval states. It does not add an equivalence edge.

Problems 32 and 45 remain composite or manual. Problem 40 remains manual because part (b) has two real ratio signs. The patch does not map Problem 45 to stable 8h. It does not map the broad 8i aggregate to a direct source example.

## Identity and lifecycle

Source rows `.014`, `.016`, `.017`, and `.018` are draft and inactive in all four graph catalogs. Duplicate `.015` remains present, rejected, and inactive. Its Lesson 8-5 containment is absent. No evidence transfers from it.

The six repaired or new skill rows are draft, inactive, and source-only. Their SRS planning rows have `generatorReady: false`. The six placeholder activities for stable 8h and broad 8i are absent. Edge `math.im1.edge.1269` is absent. The patch adds no prerequisite, equivalence, standard, evidence, renderer, generator, readiness, or approval claim.

I compared the affected records with HEAD. The patch keeps unrelated stable IDs and retained containment relationships. The semantic changes are limited to the reviewed Lesson 8-5 source rows, skills, six new or reused containments, removed duplicate containment, removed sequence prerequisite, removed placeholders, and derived inventory updates.

## Independent totals

I parsed the candidate artifacts directly.

- Nodes: 982
- Edges: 2,496
- Blueprints: 380
- Practice activities: 366
- SRS planning rows: 209

The report also states 384 skill rows, 383 non-rejected skills, 377 gaps, and 121 approved skills. These values are consistent with the candidate's derived inventory.

## Test evidence

The focused app test passed all 4 tests:

`npx vitest run __tests__/curriculum/lesson-8-5-capabilities-source.test.ts`

The command ran from `apps/integrated-math-1`. `git diff --check HEAD` also passed.

The new readable exact-boundary suite protects the accepted taxonomy. It verifies exact titles, source references, blueprint source IDs, P44 second-sequence and both-sign limits, P32/P45 exclusion, exact G38/G40 reuse rationales, and contains-only incident edges for the new candidates.

The original structural suite and the exact-boundary suite pass together: 13 tests. The recorded Red run had 6 failures and 3 passes before the metadata correction. The recorded Green run has 13 passes.

An independent semantic comparison against HEAD found no changed retained edge records. It found exactly six added G42 containment edges and two removed edges: duplicate source containment `math.im1.edge.1043` and sequence prerequisite `math.im1.edge.1269`. The node changes and additions are limited to the accepted Lesson 8-5 source rows and skill IDs. Blueprint changes and additions are limited to stable 8h, aggregate 8i, and the four new candidates.

## Scope

This review accepts the graph correction only. It does not approve the draft candidates or define an automatic grading contract for Problems 40 or 44.
