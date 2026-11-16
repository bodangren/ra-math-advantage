# IM1 Lesson 8-2 graph candidate independent review

## Decision

Accept this graph candidate. It matches the corrected eight-atom proposal and preserves the inactive source-review lifecycle.

## Verified source and capability scope

The candidate changes the three stable source rows `.004`, `.005`, and `.006` to draft and inactive. Their titles and source references match the three original worksheet groups.

The candidate adds exactly eight draft and inactive skills:

1. Describe vertical translations from equations.
2. Describe horizontal translations from equations.
3. Describe reflections from equations.
4. Describe vertical dilations from equations.
5. Describe horizontal dilations from equations.
6. Write a transformed equation from a verbal description.
7. Justify equivalent transformations with exponent properties.
8. Determine and justify a common point.

All four node copies contain identical selected records. The exact problem references follow the corrected proposal. They keep Problem 11 under horizontal translation and Problem 12 under vertical translation. They do not use Problems 27 through 36 as description evidence. They keep Problem 41 out of the equation-description nodes. They use only Problem 45 for the exponent-property proof node. They keep Problem 47 outside that node.

The legacy 8c node is draft, inactive, and a source-only aggregate. Its blueprint has no mode specification, renderer, or exact source node. The stable 8d node is draft and inactive. Its blueprint maps only to `.005` for the graph-to-equation operation. Historical standard alignments remain unchanged.

## Verified relationships and projections

The candidate adds exactly ten draft `contains` edges. Eight target the new atoms. Two target the exact G38 reuses for graphing from an equation and evaluating a model.

It removes only prerequisite edges `math.im1.edge.1265` and `math.im1.edge.1266`. It removes the corresponding prerequisite values from both SRS projections. It adds no prerequisite or equivalence edge.

It removes exactly six placeholder activities: the three 8c rows and the three 8d rows. It adds no activity or teacher-evidence row.

The eight new SRS planning rows are inactive. Each has no generator, `generatorReady: false`, and no prerequisite. The legacy 8c and repaired 8d rows are also inactive. A planning renderer label remains in the derived SRS rows, but neither blueprint makes a renderer or authored-mode claim.

Problems 20(c), 41, and 46 through 50 receive no false activity or evidence projection. The source-only graph does not claim mastery readiness.

## Semantic preservation and counts

Semantic comparison with the candidate HEAD base found:

- `nodes.json` and `draft-nodes.json`: eight additions and only five intended existing-row changes.
- `edges.json`: ten additions, two intended removals, and no changed retained edge.
- `standard-edges.json`: no edge-array change.
- `blueprints.json`: eight additions and only the intended 8c and 8d changes.
- Activity projection: only the six intended placeholder removals.
- SRS projections: eight additions and only the 8c and compound-interest prerequisite corrections.
- Coverage matrix: eight additions and no changed retained skill record.

The reported totals are correct:

- 971 nodes.
- 373 skills.
- 372 non-rejected skills.
- 126 approved skills.
- 2,483 edges.
- 369 blueprints.
- 366 generator gaps.
- 6 served and 366 gap rows in the coverage matrix.
- 381 activities.
- 198 SRS rows.

The coverage matrix excludes the rejected skill count as required.

## Test evidence

I ran the Lesson 8-2 graph test and the two affected prior-lesson tests:

`npx vitest run __tests__/curriculum/lesson-8-2-capabilities-source.test.ts __tests__/curriculum/lesson-8-1-capabilities-source.test.ts __tests__/curriculum/lesson-7-5-capabilities-source.test.ts`

Result: all 19 tests passed in 3 files.
