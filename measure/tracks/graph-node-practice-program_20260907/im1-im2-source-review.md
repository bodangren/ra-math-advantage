# IM1 and IM2 Source Review: Modules 1 and 2

Status: Initial bounded source audit complete on 2026-09-07.

This review covers Integrated Math 1 (IM1) Modules 1 and 2 and Integrated
Math 2 (IM2) Modules 1 and 2. It compares the canonical class-period plans,
the lesson source files, and the current graph files. The proposed rows and
edges remain candidates until implementation tests and the required curriculum
review accept them.

## Source boundary

The primary sources for this batch are:

- `apps/integrated-math-1/curriculum/module-1-class-period-plan.md`
- `apps/integrated-math-1/curriculum/module-2-class-period-plan.md`
- `apps/integrated-math-1/curriculum/modules/module-1-lesson-*`
- `apps/integrated-math-1/curriculum/modules/module-2-lesson-*`
- `apps/integrated-math-2/curriculum/module-1-class-period-plan.md`
- `apps/integrated-math-2/curriculum/module-2-class-period-plan.md`
- `apps/integrated-math-2/curriculum/modules/module-1-lesson-*`
- `apps/integrated-math-2/curriculum/modules/module-2-lesson-*`

The graph files are each app's `curriculum/skill-graph/nodes.json`,
`edges.json`, and `blueprints.json`. The class-period plan defines the scheduled
objective. The lesson file defines the mathematical action, conditions, worked
examples, and restrictions. A neighboring lesson number is not prerequisite
evidence.

## Coverage summary

| Course group | Source lessons | Current skill rows | Current worked-example rows | Blueprints with a source mapping | Main result |
|---|---:|---:|---:|---:|---|
| IM1 Module 1 | 6 | 6 | 34 | 0 | The graph includes only objectives `1a`, `1c`, `1e`, `1g`, `1i`, and `1k`. It omits six scheduled capabilities. Several example rows duplicate one authored example. |
| IM1 Module 2 | 7 | 8 | 33 | 0 | The graph omits six scheduled capabilities. The `2i` title is truncated. Several source examples are absent or duplicated. |
| IM2 Module 1 | 7 | 15 | 28 | 1 | The 14 course-objective rows cover the listed objectives. One pilot row overlaps objective `1a`. The other 14 blueprints have no source mapping. |
| IM2 Module 2 | 6 | 13 | 28 | 0 | The objective rows cover `2a` through `2m`. All blueprint source mappings are empty. |

This is structural coverage. It does not approve the current row granularity,
blueprints, standards, or learning edges.

## IM1 Module 1 capability deltas

Keep the six current primary-objective skill IDs. Narrow each description to
the stated action. Add one stable skill for each omitted scheduled capability.
Use the existing ID pattern and the full objective text.

| Lesson | Current or proposed capability | Disposition | Worked-example evidence |
|---|---|---|---|
| 1-1 | `math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express` | Keep for `1a`. Map Examples 1, 2, and 3. | The lesson translates simple, grouped, and contextual verbal descriptions. |
| 1-1 | `1b. Evaluate numerical expressions accurately using the order of operations.` | Add a separate skill. | Map Examples 4, 5, 6, 7, and 8. They evaluate powers, nested grouping, fractions, and contextual expressions. |
| 1-2 | `math.im1.skill.1.2.translate-between-algebraic-expressions-and-verbal-expressio` | Keep for `1c`. Include expression modeling in its current objective scope unless the course-objective source separates it later. | Map Examples 1, 2, and 3. |
| 1-2 | `1d. Evaluate algebraic expressions by substituting given values for variables and following the order of operations.` | Add a separate skill. | Map Examples 4, 5, and 6. |
| 1-3 | `math.im1.skill.1.3.identify-and-apply-the-reflexive-symmetric-and-transitive-pr` | Keep for `1e`. | Map Examples 1, 2, and 3. |
| 1-3 | `1f. Use the commutative, associative, identity, and inverse properties to simplify calculations and justify each step.` | Add a separate skill. | Map Examples 4, 5, and 6. Preserve the nonzero restriction for multiplicative inverses. |
| 1-4 | `math.im1.skill.1.4.apply-the-distributive-property-to-rewrite-and-evaluate-nume` | Keep for `1g`. | Map Examples 1 and 2. |
| 1-4 | `1h. Use the Distributive Property to simplify algebraic expressions and combine like terms.` | Add a separate skill. | Map authored Examples 3, 4, 5, and 6. Include negative and fractional coefficients. |
| 1-5 | `math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista` | Keep for `1i`. | Map Example 1. Example 1 uses accuracy as a positive difference. |
| 1-5 | `1j. Evaluate absolute value expressions by substituting given values and simplify correctly.` | Add a separate skill. | Map Examples 2 and 3. |
| 1-6 | `math.im1.skill.1.6.use-ratios-and-percentages-as-metrics-to-model-real-world-si` | Keep for `1k`. | Map Examples 1, 2, and 3. Preserve context-specific rounding as part of the decision. |
| 1-6 | `1l. Determine a reasonable level of accuracy when performing multi-step calculations and evaluate the accuracy of reported data.` | Add a separate skill. | Map Examples 4 and 5. This capability requires judgment about precision and source reliability. |

Add worked-example nodes for Lesson 1-1 Examples 3 and 8. The lesson source has
both examples, but the current graph jumps from Example 2 to Example 4 and ends
at Example 7. Use the exact lesson headings and source references.

Merge the duplicate identities for Lesson 1-4 Example 3. Current rows
`math.im1.example.1.4.021` and `math.im1.example.1.4.022` both claim Example 3.
The source has one grouped `Examples 3 and 4` section. Represent each authored
example once. Preserve any referenced ID through an explicit identity
disposition before removal. Apply the same rule to Lesson 1-5 Example 2, which
is duplicated as `.027` and `.028`.

## IM1 Module 2 capability deltas

| Lesson | Current or proposed capability | Disposition | Worked-example evidence |
|---|---|---|---|
| 2-1 | `math.im1.skill.2.1.translate-verbal-sentences-and-real-world-situations-into-al` | Keep for `2a`. | Map Examples 1, 2, and 3. |
| 2-1 | `2b. Translate algebraic equations and formulas into complete verbal sentences and interpret formulas in context.` | Add a separate skill. | Map Examples 4, 5, and 6. |
| 2-2 | `math.im1.skill.2.2.solve-one-step-equations-involving-addition-subtraction-mult` | Keep for `2c`. | Map Examples 1 and 2. |
| 2-2 | `2d. Write and solve one-step equations to model real-world situations and apply the correct Property of Equality to verify solutions.` | Add a separate skill. | Map Examples 3, 4, and 5. |
| 2-3 | `math.im1.skill.2.3.solve-multi-step-linear-equations-using-properties-of-equali` | Keep for `2e`. | Map Examples 1 and 2. |
| 2-3 | `2f. Solve literal equations for a specified variable and solve equations requiring the Distributive Property.` | Add a separate skill. | Map Example 3 for literal equations. Map the applicable distributive equation work from Examples 1 and 2. |
| 2-4 | `math.im1.skill.2.4.solve-linear-equations-that-have-the-variable-on-both-sides` | Keep for `2g`. | Map Examples 1 and 2. |
| 2-4 | `2h. Determine whether an equation has one solution, no solution, or is an identity and apply equations to geometric situations.` | Add a separate skill. | Map Examples 3 and 4. |
| 2-5 | `math.im1.skill.2.5.solve-absolute-value-equations-of-the-form` | Repair the truncated title. Keep the ID only after confirming that stored evidence does not depend on the malformed meaning. The full capability is objective `2i`. | Map Examples 1, 2, and 3. Include the condition that a negative constant gives no solution. |
| 2-5 | `math.im1.skill.2.5.graph-the-solution-set-of-an-absolute-value-equation-on-a-nu` | Keep for `2j`. | Map Examples 3 and 4. Example 3 can support both `2i` and `2j`. |
| 2-6 | `math.im1.skill.2.6.solve-proportions-algebraically-including-those-with-variabl` | Keep for `2k`. | Map Examples 1, 2, and 3. Record nonzero denominator restrictions. |
| 2-6 | `2l. Apply proportions to percent situations, scaling problems, and mixture contexts.` | Add a separate skill. | Map Examples 3 and 4. Example 3 is a valid many-to-many source. |
| 2-7 | `math.im1.skill.2.7.solve-literal-equations-and-formulas-for-a-specified-variabl` | Keep for `2m`. | Map Examples 1 through 4. |
| 2-7 | `2n. Use dimensional analysis to convert between units of measurement and apply formulas to solve real-world problems.` | Add a separate skill. | Map Examples 5 through 7. Preserve units in the answer contract. |

Add Lesson 2-5 worked-example nodes for Examples 1 and 2. The current graph has
only Examples 3 and 4. Reconcile duplicate rows for Lesson 2-3 Example 2
(`.013` and `.014`) and Lesson 2-6 Example 3 (`.024` and `.025`). One authored
example can map to two skills. It must not have two graph identities because it
appears in two class periods.

## IM1 edge corrections

Reject these sequence-only prerequisite edges:

- Module 1 ratio metrics to Module 2 equation translation.
- Equality-property identification to numerical distribution.
- Numerical distribution to absolute-value modeling.
- Absolute-value modeling to ratio metrics.
- Equations with variables on both sides to absolute-value graphing.
- Absolute-value equation solving to proportions.
- Proportions to literal equations.

Replace them only with capability dependencies that the lesson operations use:

- Numerical translation supports algebraic translation. Do not require it when
  the learner can already interpret the algebraic notation.
- Order-of-operations evaluation is prerequisite for algebraic substitution.
- Algebraic translation is prerequisite for equation translation from words.
- Equality properties are prerequisite for one-step equation solving.
- One-step equation solving is prerequisite for multi-step equation solving.
- Distribution and combining like terms are prerequisites for the applicable
  multi-step and variables-on-both-sides cases.
- Multi-step equation solving is prerequisite for variables on both sides and
  for literal-equation rearrangement at the stated scope.
- Absolute-value evaluation is prerequisite for solving absolute-value
  equations. Solving the equation is prerequisite for graphing its solution
  set and reconstructing an equation from a graph.
- One-step equation solving supports proportion solving. It is a prerequisite
  only when the task requires solving the cross-product equation.

Do not create one chain through all Module 1 and Module 2 skills. Accuracy,
ratio modeling, equation solving, and expression properties form related but
partly independent strands.

## IM2 Module 1 source mappings and deltas

The 14 objective rows match objectives `1a` through `1n`. Keep them as the
course-objective layer. Add the following many-to-many source mappings:

| Lesson | Objective mapping |
|---|---|
| 1-1 | Map Examples 1 and 2 to `find-measures-of-segments-and-angles-using-perpendicular-bis`. Map Examples 3 and 4 to `apply-properties-of-circumcenters-and-perpendicular-bisector`. |
| 1-2 | Map Examples 1 and 3 to `use-the-angle-bisector-theorem-to-find-angle-and-segment-mea`. Map Examples 2 and 4 to `solve-real-world-problems-involving-angle-bisectors-and-the`. Example 2 can support both because it calculates measures with the incenter. |
| 1-3 | Map Examples 1 and 2 to `find-lengths-of-medians-using-the-centroid-theorem`. Map Examples 3 and 4 to `find-the-coordinates-of-the-orthocenter-and-compare-medians`. Example 3 also supports centroid application. |
| 1-4 | Map Examples 1, 2, and 3 to `order-angles-and-sides-of-a-triangle-from-smallest-to-larges`. Map Example 4 to `apply-triangle-inequality-relationships-in-proofs-and-real-w`. Verify whether that row means side-angle inequality or triangle inequality before approval. Its current title conflicts with Lesson 1-6 terminology. |
| 1-5 | Map Examples 1 and 4 to `write-indirect-proofs-of-algebraic-and-geometric-statements`. Map Examples 2 and 3 to `use-indirect-reasoning-with-integer-properties-and-geometry`. Allow overlap when an example both selects and writes the indirect argument. |
| 1-6 | Map Examples 1 and 2 to `determine-whether-three-lengths-can-form-a-triangle-find-the`. Map Examples 3 and 4 to `apply-the-triangle-inequality-theorem-in-proofs-and-real-wor`. |
| 1-7 | Map Examples 1 and 2 to `apply-the-hinge-theorem-to-compare-sides-and-angles-in-two-t`. Map Examples 3 and 4 to `use-the-hinge-theorem-and-its-converse-to-find-ranges-of-val`. |

The pilot node `math.im2.skill.1.1.perpendicular-bisector-equidistance` is an
atomic equation-solving capability from Example 1. It overlaps the broad `1a`
row. Keep the pilot ID because runtime evidence can reference it. Decide whether
the broad row stays as an objective aggregator or splits into atomic skills.
Do not award mastery of all `1a` from the pilot equation. This is an unresolved
curriculum and learner-identity decision.

The Lesson 1-4 row named `apply-triangle-inequality-relationships-in-proofs-and-real-w`
must not share meaning with the Lesson 1-6 Triangle Inequality Theorem row.
Lesson 1-4 concerns side-angle relationships within a triangle. Rename or split
it after an exact ID usage check.

## IM2 Module 2 source mappings and deltas

| Lesson | Objective mapping |
|---|---|
| 2-1 | Map Examples 1 through 4 to the interior-angle skill. Map Example 5 to the exterior-angle skill. Example 2 supports contextual interior-angle use. |
| 2-2 | Map Examples 1 through 3 to the parallelogram-properties skill. Map Example 4 to the area-and-perimeter skill. Map proof examples only to the property skill unless they calculate area or perimeter. |
| 2-3 | Map Examples 1 and 2 to the parallelogram-test skill. Map Examples 3 and 4 to the coordinate-verification skill. |
| 2-4 | Map Examples 1, 2, and 3 to the rectangle-properties skill. Map Example 4 to the coordinate-rectangle skill. Example 3 requires the inherited parallelogram properties and SSS congruence. |
| 2-5 | Map Examples 1 and 2 to the rhombus-and-square measures skill. Map Example 3 to the proof-and-classification skill. Map Example 5 to the classification skill. Keep Example 4 with the measures skill, but record its measurement-tolerance restriction. |
| 2-6 | Map Examples 1, 3, and 4 to the trapezoid-properties and midsegment skill. Map Examples 5 and 6 to the kite-properties skill. Map Examples 2 and the lesson classification exercises to the compare-and-classify skill. Example 2 can also support trapezoid properties. |

The current source supports the 13 rows, but some rows combine distinct answer
contracts. In particular, Lesson 2-6 combines trapezoid angle properties and
midsegment calculation. Split only if one activity cannot assess both without
granting false mastery. Lesson 2-5 combines proof and classification. Preserve
teacher review for proof evidence.

## IM2 edge corrections

The current root graph has no broad Module 1 or Module 2 prerequisite edges.
Do not restore the prior lesson-order chain. Add only these source-supported
candidate relationships after endpoint and standards repair:

- The basic perpendicular-bisector equidistance capability is prerequisite for
  the applicable circumcenter distance equations. It does not establish every
  coordinate circumcenter capability.
- Side-angle ordering is prerequisite for direct Hinge Theorem comparisons.
- Triangle-inequality feasibility is prerequisite for third-side range tasks.
- Indirect-reasoning structure supports indirect geometric proofs. It does not
  become a prerequisite for all later geometry.
- Parallelogram properties are prerequisite for rectangle, rhombus, and square
  property tasks that explicitly inherit those properties.
- Parallelogram tests support coordinate verification. Slope, distance, and
  midpoint skills from the earlier course-series graph are also required for
  coordinate proofs. Resolve these through approved cross-course edges.
- Rectangle and rhombus properties support square classification. Do not model
  the class hierarchy as reciprocal prerequisites.
- Midpoint and distance capabilities are prerequisites for the coordinate
  trapezoid midsegment task. Parallel-line angle facts support trapezoid angle
  tasks. Keep kite work independent unless a task uses shared diagonal facts.

## Acceptance blockers in this batch

1. IM1 has 12 missing scheduled capability rows across these two modules.
2. IM1 has missing and duplicate worked-example identities.
3. All 14 current IM1 blueprints in these modules have empty source mappings.
4. Fourteen of 15 IM2 Module 1 blueprints and all 13 IM2 Module 2 blueprints
   have empty source mappings.
5. The IM2 canonical node file still omits standard nodes used by graph edges.
   Graph endpoint repair must precede semantic acceptance.
6. The IM2 pilot skill overlaps broad objective `1a`. Learner identity needs an
   explicit aggregation decision.
7. IM1 sequence-derived prerequisite edges do not establish mathematical need.
8. Diagram-dependent geometry examples require inspection of the original
   worksheet images before the final activity specification. The extracted
   lesson text explicitly reports missing visual detail.

## Next bounded source batches

Continue with IM1 Modules 3 and 4 as one batch. Then review IM1 Modules 5 and 6.
Continue with IM2 Modules 3 and 4 as one batch. Then review IM2 Modules 5 and 6.
Keep each batch at no more than two modules. For each batch, first reconcile
worked-example identity and source images. Then decide capability granularity.
Then author source mappings and semantic edges. Do not author the three practice
modes until the graph identities for that batch are stable.
