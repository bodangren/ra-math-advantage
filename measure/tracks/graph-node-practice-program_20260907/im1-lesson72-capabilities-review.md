# IM1 Lesson 7-2 revised capability source proposal

## Scope

This proposal uses the original `Int1_0702_practice.docx`, its two rendered pages, the extracted text, the class-period plan, the extracted lesson, and the current IM1 graph and projections.

This revision applies the parent review and the independent proposal review. It does not approve a source, node, blueprint, renderer, generator, or practice mode. It does not change a catalog.

## Source groups

The worksheet has two worked groups and one mixed group.

- `Examples 1-3` contains Problems 1-15. It includes one-solution, no-solution, and infinitely-many-solutions systems.
- `Example 4` contains Problems 16-17. It writes, solves, and interprets contextual systems.
- `Mixed Exercises` contains Problems 18-29. It includes coefficient variants, research, geometry, place value, data modeling, error analysis, ratios, method comparison, construction, and explanation.

Preserve the two source IDs.

- `math.im1.example.7.2.008`: `Examples 1-3: Solve Systems by Substitution`. Map it to Problems 1-15.
- `math.im1.example.7.2.009`: `Example 4: Model and Solve Systems by Substitution`. Map it to Problems 16-17.

Add the original worksheet and extracted lesson references. Set the changed source rows to `draft` in all four catalog copies. The changed content is a new review subject. Do not retain the canonical `approved` value.

Do not assign Mixed Exercises to `.008` or `.009`. Use direct worksheet problem references for mixed-only nodes and manual tasks.

## Current graph defects

The graph has one Lesson 7-2 aggregate skill:

`math.im1.skill.7.2.solve-systems-of-linear-equations-using-the-substitution-met`

Keep this stable ID. Make the row draft and inactive in all copies. Its source-only blueprint can retain `.008` and `.009`. Remove `graphing-explorer`, the mode map, the three empty specifications, and the generator exception. Preserve its inactive SRS planning row.

Objective `7d` requires decimal and fractional examples. These values are input variants of substitution. They do not define a separate learner operation.

Remove prerequisite edges `math.im1.edge.1260` and `math.im1.edge.1261`. They encode lesson order. Graphing is not required before substitution. A complete substitution skill is not required before elimination. Recompute the affected Lesson 7-2 and Lesson 7-3 SRS rows. Add no prerequisite or equivalence edge.

## Existing rewrite capability

Reuse this Lesson 4-3 capability:

`math.im1.skill.4.3.rewrite-standard-form-equations-in-slope-intercept-form`

Problems 5, 6, 13, and 14 require the learner to isolate a variable before substitution. In each problem, the learner can rewrite one equation into `y = mx + b` form. This is the operation that the existing capability describes. Do not add a second isolation capability.

The subsequent substitution and ordered-pair solution are separate learner actions. A future multipart activity must use distinct part identities before one response can update both skills.

## Six proposed draft capabilities

Use the repository ID constructor for final IDs. Verify all generated IDs before implementation.

### 1. Substitute an isolated expression to solve a one-solution linear system

Expected ID: `math.im1.skill.7.2.substitute-an-isolated-expression-to-solve-a-one-solution-li`

Problems 1-4, 10, 11, and 18-20 assess this operation directly. The learner substitutes the isolated expression, solves the resulting equation, and back-substitutes to obtain an ordered pair. Decimal and fractional coefficients remain variants of this capability.

Problems 5, 6, 13, and 14 also require this operation after the separate Lesson 4-3 rewrite operation. Do not grant both skill results from one undivided answer.

Source-node mapping: `.008` only. Cite Problems 18-20 directly.

### 2. Recognize no solution or infinitely many solutions during substitution

Expected ID: `math.im1.skill.7.2.recognize-no-solution-or-infinitely-many-solutions-during-su`

Problems 7, 8, and 15 reduce to identities. Problems 9 and 12 reduce to contradictions. The learner must classify the solution set instead of reporting an ordered pair.

Source-node mapping: `.008`.

### 3. Represent a two-digit number and its digit reversal with linear equations

Expected ID: `math.im1.skill.7.2.represent-a-two-digit-number-and-its-digit-reversal-with-lin`

Problem 23 assesses the place-value forms `10t + u` and `10u + t`. This operation is distinct from solving and interpreting the resulting system.

Source-node mapping: none. Cite Problem 23 directly.

### 4. Diagnose and correct an algebraic substitution error

Expected ID: `math.im1.skill.7.2.diagnose-and-correct-an-algebraic-substitution-error`

Problem 25 assesses Guillermo's algebra. Guillermo changes `a + b = 7` into the incorrect expression `b = a + 7`. The learner must correct it to `b = 7 - a`.

This node does not include Cara's contextual error. Reuse the contextual interpretation capability for Cara. Use manual review until a reviewed error-analysis rubric exists.

Source-node mapping: none. Cite Problem 25 directly.

### 5. Choose an efficient substitution expression and justify the choice

Expected ID: `math.im1.skill.7.2.choose-an-efficient-substitution-expression-and-justify-the`

Problem 29 asks the learner to explain what to substitute. A correct response selects an expression that is already isolated. If no expression is isolated, it selects a variable that can be isolated with simple coefficients. The explanation must preserve equation equivalence.

This capability does not prove that the learner solved the system. Use manual review until a reviewed rubric exists.

Source-node mapping: none. Cite Problem 29 directly.

### 6. Generalize a complementary-angle sum-and-difference system

Expected ID: `math.im1.skill.7.2.generalize-a-complementary-angle-sum-and-difference-system`

Problem 22 asks the learner to generalize the method. If the absolute difference is `d`, the measures are the unordered pair `{(90 + d) / 2, (90 - d) / 2}`. For `d = 20`, the answer is the unordered pair `{55 degrees, 35 degrees}`.

The source does not state which named angle is larger. Do not require one labeled assignment. This symbolic generalization is distinct from writing and solving one contextual instance. Use manual or symbolic review.

Source-node mapping: none. Cite Problem 22 directly.

All six candidates must be `draft` and `independentPracticeReady:false`. Give each candidate a source-only blueprint. Do not add a renderer key, mode map, empty specification, generator exception, prerequisite, equivalence, or standard alignment.

## Five reused capabilities

Add draft Lesson 7-2 containment and source references for these skills. Do not change their original ownership metadata.

1. `math.im1.skill.4.3.rewrite-standard-form-equations-in-slope-intercept-form`
   - Problems 5, 6, 13, and 14.
   - Source-node mapping: `.008`.
2. `math.im1.skill.7.1.write-a-two-equation-system-from-a-context`
   - Problems 16, 17, 22, 24, and 28.
   - Source-node mapping: `.009` for Problems 16-17 only.
3. `math.im1.skill.7.1.solve-and-interpret-a-contextual-system`
   - Problems 16, 17, 22, 23, 24, 25, and 26.
   - Source-node mapping: `.009` for Problems 16-17 only.
   - For Problem 25, this applies only to Cara's contextual statement.
4. `math.im1.skill.7.1.construct-systems-with-a-specified-number-of-solutions`
   - Problem 28.
   - Source-node mapping: none.
5. `math.im1.skill.7.1.explain-the-limits-of-graphing-as-a-system-solving-method`
   - Problem 27.
   - Source-node mapping: none.

One response must not update multiple nodes without reviewed part identities. This applies to Problems 22, 23, 25, and 28.

## Manual source tasks without new capability nodes

### Problem 21: data-dependent population model

Retain Problem 21 in the source inventory. The learner must research population trends, select two countries, state assumptions, write a system, solve it, and interpret the prediction. The worksheet supplies no dataset or fixed answer. Do not create a fixed-answer activity. Do not omit the task.

Record it as a data-dependent manual task with a direct Problem 21 reference. A later reviewed dataset and rubric can define exact part-level evidence. This proposal does not create a graph node for the full research task.

### Problem 27: compare two representations of the same solution

Retain the complete assessment. It asks the learner to compare the solution obtained by graphing with the solution obtained by substitution. Both methods identify the common solution. A graph shows or approximates the intersection. Substitution can give an exact algebraic value.

Reuse the existing graphing-limit capability for the graph precision part. Treat the full comparison as a manual task assembled from the graph solution, substitution solution, and graphing-limit results. Do not create a general strategy-choice capability. Do not remove the explicit comparison from the extracted lesson or source inventory.

## Verified source mathematics

Problems 1-15 give these results: `(1,6)`, `(2,13)`, `(29,53)`, `(-3,-11)`, `(1,1)`, `(-1,0)`, infinitely many, infinitely many, no solution, `(2,3)`, `(0,1)`, no solution, `(2,5)`, `(2,0)`, and infinitely many.

Problem 9 has `x = y - 1`, so `-x + y = 1`. The second equation is `-x + y = -1`. The system is inconsistent.

Problems 16 and 17 give two one-dollar bills and four five-dollar bills, and 4.5 mL from Beaker A and 0.5 mL from Beaker B.

Problem 18 gives `(1.6, 7.02)`. Problem 19 is `y = (1/4)x - 1/2` and `8x + 12y = -1/2`; its solution is `(1/2, -3/8)`. Problem 20 gives `(-0.2, -4.8)`.

Problem 22 gives the unordered pair `{35 degrees, 55 degrees}`. Problem 23 gives 72. Problem 24 gives 255 Big Cats adults, 845 Petting Zoo children, 2,145 visitors in part c, and 3,980 visitors in part d. Problem 25 gives four pounds of apples and three pounds of bananas. Problem 26 gives 35 boys and 25 girls. Problems 21, 27, 28, and 29 require data, explanation, construction, or manual review as stated above.

## Extracted lesson corrections

- Use the exact joint heading `Examples 1-3` for Problems 1-15.
- Use the exact heading `Example 4` for Problems 16-17.
- Preserve the complete systems and all solution-set results for Problems 1-15.
- Correct Problem 19 to `y = (1/4)x - 1/2` and `8x + 12y = -1/2`.
- Include the four Problem 24 table cells and all questions.
- Include Guillermo's and Cara's shown work for Problem 25.
- State Problem 22 as an unordered result and include the generalization instruction.
- Keep Problem 21 as a data-dependent manual task.
- Keep the full Problem 27 comparison prompt and manual evidence boundary.

## Projection and queue effects

Run the existing projectors after the source repair.

- Removing the three empty mode specifications from broad `7c` removes three placeholder activity rows.
- Preserve broad `7c` as an inactive SRS planning row with `generatorReady:false`.
- Add six inactive SRS planning rows for the six source-only capability blueprints.
- Remove `7a -> 7c` from the selected `7c` SRS row.
- Remove `7c -> 7e` from the Lesson 7-3 SRS row.
- Recompute the embedded SRS copy in `practice-v1-activity-map.json`.
- Recompute teacher skill inventory and standard summaries with the existing helper.
- Preserve physical source activities. Remove only the false activity rows from empty mode specifications.
- Change only the broad `7c` generator-gap reason. State that it is an aggregate substitution objective without a reviewed standalone generator.
- Append six generator-gap rows for the new capabilities.
- Update the coverage matrix with `buildCoverageMatrix`.

Expected bounded deltas before helper-dependent summaries:

- graph nodes: `+6`
- blueprints: `+6`
- projected activities: `-3`
- standalone SRS inputs: `+6`
- embedded SRS inputs: `+6`
- teacher skill inventory: `+6`
- generator-gap rows: `+6`
- prerequisite edges: `-2`
- Lesson 7-2 containment edges: `+11` for six new nodes and five reused nodes

The exact teacher-standard summary delta depends on the projector and reviewed standard alignments. Add no standard alignment in this source-only repair.

## Minimum later implementation scope

1. Correct `curriculum/modules/module-7-lesson-2` with complete source givens, tasks, and results.
2. Correct source rows `.008` and `.009` in all four graph copies. Preserve both IDs. Set changed content to draft.
3. Keep broad `7c`. Make it draft and inactive. Replace its placeholder blueprint with a source-only blueprint.
4. Add six draft inactive capabilities and six source-only blueprints.
5. Add eleven Lesson 7-2 containment edges for the six new and five reused capabilities.
6. Remove only prerequisite edges `1260` and `1261`.
7. Regenerate affected activity, SRS, teacher, gap, and coverage rows with existing helpers.
8. Add a bounded source regression test. Assert exact headings, math, manual-task retention, mappings, draft status, inactive readiness, stable IDs, no placeholder modes, and no sequence prerequisites.

Do not add an activity component, generator, runtime mode, standard alignment, source approval, SRS activation, equivalence, dataset, or fixed answer for a manual source task.
