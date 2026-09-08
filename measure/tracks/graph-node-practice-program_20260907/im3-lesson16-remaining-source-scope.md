# IM3 Lesson 1.6 remaining source scope

## Verdict

A second source-only batch is required. The five catalogs do not agree for `.039` and `.040`. None of the five Lesson 1.6 Check prompts is preserved in the source records.

Use the existing stable example IDs. The next accepted batch restores only .039 and .040. The Check prompts below are review notes. They are unanswered response demands. Their storage representation requires separate review. Do not add a new metadata field or append Checks to worked-example rawText in this batch.

## Exact source content

The source authority is `apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf`.

### `.036`, page 43

Retain the accepted Example 1 record. The adjacent printed Check reads:

`DIVING A diver jumps from a diving board that is 10 feet high, and she wants to figure out how far from the board she is before she enters the water. Her arc can be modeled by y = -4.9x² + 2.5x + 10, where y is her height in meters and x is time in seconds. Part A Solve 0 = -4.9x² + 2.5x + 10. Part B Interpret the roots. The diver enters the water after approximately ___ seconds.`

The source says that the board is `10 feet` high. The same prompt says that `y` is the height in meters. Preserve this unit conflict. Do not change either unit.

### `.037`, page 44

Retain the accepted Example 2 record. The adjacent printed Check reads:

`Solve 3x² - 5x - 1 = 0 by using the Quadratic Formula.`

### `.038`, page 44

Retain the accepted Example 3 record. The adjacent printed Check reads:

`Solve 9x² - 3x + 18 = 0 by using the Quadratic Formula.`

### `.039`, page 46

Use the title `Example 4 The Discriminant, Real Roots`.

The prompt is:

`Examine 2x² - 10x + 7 = 0. Part A Find the value of the discriminant for 2x² - 10x + 7 = 0. Part B Describe the number and type of roots for the equation.`

Preserve this printed worked sequence:

1. `a = 2, b = -10, c = 7`
2. `b² - 4ac = (-10)² - 4(2)(7)`
3. `= 100 - 56`
4. `= 44`

Preserve this printed interpretation:

`The discriminant is nonzero, so there are two roots. The discriminant is positive and not a perfect square, so the roots are irrational.`

The adjacent unanswered Check reads:

`Examine 2x² + 8x + 8 = 0. Part A Find the value of the discriminant for 2x² + 8x + 8 = 0. b² - 4ac = ___. Part B Describe the number and type of roots for the equation. There is/are ___ root(s).`

The demonstrated capability is: `Use the discriminant to calculate its value and classify two real irrational roots.`

### `.040`, page 46

Use the title `Example 5 The Discriminant, Complex Roots`.

The prompt is:

`Examine -5x² + 10x - 15 = 0. Part A Find the value of the discriminant for -5x² + 10x - 15 = 0. Part B Describe the number and type of roots for the equation.`

Preserve this printed worked sequence:

1. `a = -5, b = 10, c = -15`
2. `b² - 4ac = (10)² - 4(-5)(-15)`
3. `= 100 - 300`
4. `= -200`

Preserve this printed interpretation:

`The discriminant is nonzero, so there are two roots. The discriminant is negative, so the roots are complex.`

The adjacent unanswered Check reads:

`Examine 10x² - 4x + 7 = 0. Part A Find the value of the discriminant for 10x² - 4x + 7 = 0. b² - 4ac = ___. Part B Describe the number and type of roots for the equation. There is/are ___ root(s).`

The demonstrated capability is: `Use the discriminant to calculate its value and classify two complex roots.`

## Current catalog defects

At committed HEAD, all five catalogs retain the correct IDs and `draft` status. Their `.039` and `.040` records still use summary text. Titles also differ between catalogs. Only the canonical, module, and `edges.json` records in the dirty working tree show a prior partial restoration. That dirty state is not the baseline.

The `.039` and `.040` records need the same two source references as `.036` to `.038`. Keep the lesson-plan reference first. Append the verified PDF page 46 reference.

## Minimum implementation scope

Use six paths:

1. `curriculum/skill-graph/nodes.json`
2. `curriculum/skill-graph/module-1/nodes.json`
3. `curriculum/skill-graph/draft-nodes.json`
4. `curriculum/skill-graph/edges.json`
5. `curriculum/skill-graph/standard-edges.json`
6. `__tests__/curriculum/lesson-1-6-worked-source.test.ts`

Update `.039` and `.040` fully in all five catalogs. Preserve .036 through .038 without changes. Do not add Check prompts in this batch. Preserve IDs, status, existing metadata, order, and unrelated serialized bytes. Do not change blueprints, edges, projections, approval, readiness, or runtime seed content.

The app-discovered source test must assert exactly one record per ID and catalog. It must assert the two ordered source references, exact title, prompt, worked sequence, demonstrated capability, and worked interpretation. Check prompt tests belong to a later accepted scope.

## Existing tests

- `apps/integrated-math-3/__tests__/curriculum/lesson-1-6-worked-source.test.ts` covers `.036` to `.038` across all five catalogs. Extend this test.
- `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-6.test.ts` covers the seeded text for `.036` to `.038`. It does not cover catalog parity or Checks. A source-only batch does not need to change it.
- `apps/integrated-math-3/curriculum/skill-graph/__tests__/lesson-1-6-reconciliation.test.ts` contains partial `.039` and `.040` expectations. The app test configuration does not discover this directory. Do not use this excluded test as acceptance evidence. A later graph task can reconcile or remove it within its own scope.

## Parent review

This is a pending source-only scope. Implementation has not started. Parent visual review of native page 46 confirms both worked sequences and interpretations. The source headings have no added colon. The source Check notes do not establish approved practice content.
