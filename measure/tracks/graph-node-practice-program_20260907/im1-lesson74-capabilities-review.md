# IM1 Lesson 7-4 capability source review

## Disposition

The current extraction is not sufficient graph evidence. It replaces Problems 1 through 12 with a few representative systems. It omits the data tables in Problems 14 and 19. It also omits the student work in Problem 21. A source repair must restore all 25 problems before graph authoring.

The worksheet supports six new draft and inactive capability candidates. It also supports six existing capabilities from Lessons 7-1, 7-3, and earlier context work. Coefficient values and the need to multiply one equation or both equations are task variants. They are not separate capabilities.

Keep the current source identities and all capability decisions draft. Do not approve a generator, renderer, activity, or evidence policy in this batch.

## Source authority

The original source is `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0704_practice.docx`.

The reviewed render is `/tmp/int1_0704_review_20260908/page-1.png` through `/tmp/int1_0704_review_20260908/page-3.png`.

The three original image assets are in `/tmp/int1_0704_review_20260908/media/`:

- `image1.png` is the firing-clay and polymer-clay purchase table for Problem 14.
- `image2.png` is the pineapple-percentage table for Problem 19.
- `image3.png` is the complete Jason and Daniela work for Problem 21.

The exact source groups are:

- `Examples 1 and 2`: Problems 1 through 12.
- `Example 3`: Problems 13 and 14.
- `Mixed Exercises`: Problems 15 through 25.

The heading `Examples 1 and 2` is one joint worksheet group. The worksheet does not define separate bodies for Example 1 and Example 2.

## Verified source mathematics

Problems 1 through 12 have these solutions:

| Problem | Solution |
|---|---|
| 1 | `(-1, 3)` |
| 2 | `(-2, 6)` |
| 3 | `(-3, 4)` |
| 4 | `(-7, 3)` |
| 5 | `(-2, 3)` |
| 6 | `(0, 2)` |
| 7 | `(3, 5)` |
| 8 | `(2, -4)` |
| 9 | `(1, -5)` |
| 10 | `(-6, -8)` |
| 11 | `(0, 1)` |
| 12 | `(1/2, 1)` |

Problem 13 gives `2m + n = 592.30` and `m + 2n = 691.31`. The costs are `$164.43` for one Major League Baseball game and `$263.44` for one National Basketball Association game for the family of four.

Problem 14 gives these exact rows:

- 5 kg firing clay, 24 kg polymer clay, and `$64.05` total.
- 25 kg firing clay, 8 kg polymer clay, and `$51.45` total.

Firing clay costs `$1.29` per kilogram. Polymer clay costs `$2.40` per kilogram.

Problem 15 has the ordered values `(8, -1)` for the first and second numbers. Problem 16 has `(-3, 2)`. Problem 17 gives `$6` to wash one car and `$2` to vacuum one car.

Problem 18 uses `-2x + 3y = -5` and `3x - 4y = 6`. The solution is `(-2, -3)`. A learner can eliminate `x` by multiplying the first equation by 3 and the second by 2. A learner can eliminate `y` by multiplying the first equation by 4 and the second by 3. Multiplying by 6 and 5 does not make either coefficient pair equal or opposite, so addition does not eliminate a variable.

Problem 19 mixes Tropical Breeze at 20% pineapple juice and Kona Cooler at 50% pineapple juice. The total is 10 quarts at 40%. The system is `t + k = 10` and `0.20t + 0.50k = 4`. The amounts are `10/3` quarts of Tropical Breeze and `20/3` quarts of Kona Cooler. A decimal response needs an explicit rounding rule.

Problem 20 gives 125 bills with a value of `$990`. The solution is 52 five-dollar bills and 73 ten-dollar bills. The bill counts are nonnegative integers.

Problem 21 uses `2r + 7t = 11` and `r - 9t = -7`. Jason is correct. He doubles the second equation to get `2r - 18t = -14`. His written minus sign applies to the complete doubled equation: `(2r + 7t) - (2r - 18t) = 11 - (-14)`, so `25t = 25`, `t = 1`, and `r = 2`. Daniela subtracts the unscaled second equation but drops the `16t` term. The correct combined equation is `r + 16t = 18`, not `r = 18`. Her later substitution uses this invalid value. The task asks the learner to distinguish a valid whole-equation subtraction from an invalid term combination.

Problem 22 is false as written. Equivalent equations can have proportional coefficients instead of identical coefficients. For example, `x + y = 2` and `2x + 2y = 4` have infinitely many solutions. Also, identical variable coefficients with different constants give no solution. Infinitely many solutions require equivalent equations, including compatible constants.

Problem 23 is nonunique. A valid response must create a system in which multiplying one complete equation by `-3` makes one coefficient opposite to the corresponding coefficient in the other equation. The grader must inspect the learner's equations and the stated operation. It must not use one fixed answer.

Problem 24 gives `(3, a)` as the solution of `4x + 5y = 2` and `6x - 2y = b`. The values are `a = -2` and `b = 22`.

Problem 25 is an explanation task. Substitution is usually efficient when an equation already isolates a variable or can isolate it with little work. Elimination is usually efficient when coefficients are already equal or opposite, or can become equal or opposite with simple scale factors. More than one justified answer can be valid.

## Current graph defects

The current graph has two source IDs for the joint `Examples 1 and 2` heading:

- `math.im1.example.7.4.014`
- `math.im1.example.7.4.015`

Retain `.014` as the canonical joint source. Rename it to `Examples 1 and 2: Solve systems by elimination after scaling equations`. Map it to the DOCX and repaired module at `Examples 1 and 2, Problems 1-12`. Keep it draft.

Retain `.015` as a rejected and inactive historical duplicate. Remove its direct source mapping and lesson containment. Do not assign Problems 1 through 12 to two source IDs. Preserve the ID and its historical example number.

Add one deterministic source identity for the missing source group:

`math.im1.example.7.4.016`

Use the title `Example 3: Model and solve contextual systems by scaled elimination`. Map it to `Example 3, Problems 13-14`. Keep it draft and inactive. The mixed exercises do not need a worked-example node.

The legacy 7g node is broad:

`math.im1.skill.7.4.solve-systems-of-linear-equations-using-elimination-when-mul`

It combines multiplier selection with procedure execution. Change it to draft and inactive in all four node catalogs. Convert its blueprint to a source-only blueprint that references `.014` and `.source-003`. Remove its three placeholder activities. Preserve an inactive SRS planning row.

Remove `math.im1.edge.1263`. Worksheet order does not make scaled elimination a prerequisite for graphing systems of inequalities in Lesson 7-5. Remove this prerequisite from both stored SRS copies for the Lesson 7-5 target.

## New atomic capability candidates

### Select scale factors for elimination

Suggested ID:

`math.im1.skill.7.4.select-equation-scale-factors-for-elimination`

Suggested title:

`Select one or two equation scale factors that create equal or opposite coefficients`

The learner must select a variable and multiply one complete equation or both complete equations so that addition or subtraction can eliminate the variable. Problems 1 through 12 and Problem 18 support this action. The evidence must include the chosen factors or the correctly transformed equations.

Multiplying one equation and multiplying both equations are variants of the same operation. Decimal, fractional, positive, and negative coefficients are also variants.

### Execute scaled elimination

Suggested ID:

`math.im1.skill.7.4.solve-one-solution-systems-by-scaled-elimination`

Suggested title:

`Solve a one-solution linear system by scaling equations and elimination`

The minimum evidence is the correctly scaled equation or equations, the equation-combination step, the resulting one-variable equation, and substitution for the second variable. Problems 1 through 12 supply repeated direct evidence. A final ordered pair alone does not prove this method.

### Diagnose an equation-combination error in elimination

Suggested ID:

`math.im1.skill.7.4.diagnose-equation-combination-errors-in-elimination`

Suggested title:

`Diagnose and correct equation-combination errors in an elimination solution`

Problem 21 directly assesses this action. The observable error is Daniela's failed subtraction of corresponding terms. Jason's scaling and whole-equation subtraction are valid. Keep this capability separate from the Lesson 7-2 substitution-error capability because the learner must analyze an elimination combination step.

### Choose between substitution and elimination

Suggested ID:

`math.im1.skill.7.4.choose-between-substitution-and-elimination`

Suggested title:

`Choose substitution or elimination for a linear system and justify the choice`

Problem 25 directly assesses method selection. Do not map it to the Lesson 7-2 node for choosing an isolated expression. That node assumes substitution has already been selected.

### Construct a system for a specified elimination multiplier

Suggested ID:

`math.im1.skill.7.4.construct-a-system-for-a-specified-elimination-multiplier`

Suggested title:

`Construct a linear system that supports a specified elimination multiplier`

Problem 23 directly assesses this action. The task is nonunique. A grader must verify the relationship between the two learner-written equations and the specified multiplier. This task does not ask for a specified number of solutions, so do not map it to the Lesson 7-1 solution-count construction node.

### Determine a missing coordinate and equation parameter

Suggested ID:

`math.im1.skill.7.4.find-a-missing-solution-coordinate-and-equation-parameter`

Suggested title:

`Find a missing solution coordinate and equation parameter from a partially specified solution`

Problem 24 gives the partially specified solution `(3, a)`. The learner must first use `x = 3` in the first equation to find `a = -2`. The learner then uses both coordinates in the second equation to find `b = 22`. Evidence must preserve this dependency. The full solution is not known at the start. This operation is distinct from solving an unknown system by elimination.

Keep all six nodes draft and inactive. Create source-only blueprints. Use `.014` only for multiplier selection and scaled-elimination execution. The other four capabilities occur only in Mixed Exercises, so their source-only blueprints can have empty `sourceNodeIds` and exact Lesson 7-4 source references on the nodes.

## Existing capability reuse

Add draft Lesson 7-4 `contains` edges for these exact reuses:

| Source work | Existing capability |
|---|---|
| Write systems in Problems 13-17, 19, and 20 | `math.im1.skill.7.1.write-a-two-equation-system-from-a-context` |
| Solve and interpret Problems 13-17, 19, and 20 | `math.im1.skill.7.1.solve-and-interpret-a-contextual-system` |
| Classify the statement and counterexample in Problem 22 | `math.im1.skill.7.1.classify-a-linear-system-by-its-solution-set` |
| Determine solution count from equal left sides and different or compatible constants in Problem 22 | `math.im1.skill.7.1.determine-the-number-of-solutions-from-equation-structure` |
| Choose addition or subtraction after scaling in Problems 1-12 and 18 | `math.im1.skill.7.3.choose-addition-or-subtraction-for-direct-elimination` |
| Perform the equation-combination and back-substitution portion after scaling | `math.im1.skill.7.3.solve-one-solution-systems-by-direct-elimination` |

Append `.source-003` to the source-only blueprints for the two context capabilities because Problems 13 and 14 directly assess them. Do not add `.015` anywhere.

Do not reuse these nodes:

- Do not reuse the Lesson 7-2 substitution-error node for the elimination error in Problem 21.
- Do not reuse the Lesson 7-2 efficient-substitution-expression node for the method comparison in Problem 25.
- Do not reuse the specified-solution-count construction node for Problem 23.

## Relationship boundaries

Add only draft `contains` edges for the six new candidates and six valid reuses. Do not add prerequisite, equivalence, alignment, or evidence-transfer edges.

The new multiplier-selection capability can be a plausible prerequisite for scaled-elimination execution. The Lesson 7-3 direct-elimination steps can also be plausible prerequisites. The worksheet sequence alone does not approve these relations. Defer them to a separate edge review.

Preserve the existing A-REI.C.5 alignment for the legacy aggregate as historical graph data. Do not copy this alignment to the new atomic nodes without a standards review.

## Bounded implementation tests

Add one focused source and graph test. It must check these facts:

1. The repaired lesson contains all Problems 1 through 25 with the exact equations and prompts.
2. The test checks the three source tables or student-work figures through complete accessible descriptions.
3. The test checks the independently solved values above, including exact fractions for Problem 19.
4. `.014` is the only source node for the joint `Examples 1 and 2` body.
5. `.015` remains present, rejected, inactive, and absent from blueprint and teacher evidence mappings.
6. `.source-003` uses the exact Example 3 heading and Problems 13-14.
7. All six new capabilities are draft and inactive in all four node catalogs.
8. All six new blueprints are source-only. Only the first two use `.014`.
9. The graph has exactly 12 new Lesson 7-4 `contains` relations for the six new nodes and six reuses.
10. No new prerequisite, equivalence, or alignment edge touches a new node.
11. The legacy 7g node and blueprint are draft and inactive. Its three placeholder activities are absent.
12. Edge `math.im1.edge.1263` is absent. Both SRS copies for the Lesson 7-5 target omit the legacy 7g prerequisite.
13. Every previous node ID and every unrelated edge ID remains present.
14. The queue, coverage matrix, projections, and rollout audit agree with the current graph arrays and draft lifecycle.

## Remaining limits

The worksheet is practice. It does not contain the textbook Worked Example bodies. The repaired lesson can include accurate method instruction and verified solutions. It must not identify invented steps as recovered textbook prose.

Problem 23, Problem 25, and some multiplier choices are nonunique. Future mode specifications need structural or rubric grading. A fixed final-answer list is not sufficient.

The source does not establish a production renderer or generator. All new rows must remain source-only, draft, and inactive.
