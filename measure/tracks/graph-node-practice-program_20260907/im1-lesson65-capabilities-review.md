# IM1 Lesson 6-5 Capability Source Review

## Scope

This review uses the original `Int1_0605_practice.docx`, its document XML, the rendered worksheet, the current extracted lesson, the Module 6 class-period plan, and the current graph catalogs. It does not approve graph rows or practice readiness.

The source has two content pages. Rendered page 2 is blank. Page 1 contains Problems 1 through 24. Page 3 contains Problems 25 through 32.

## Source headings and stable source rows

The worksheet has these headings:

- `Examples 1 and 2` covers Problems 1 through 12.
- `Example 3` covers Problems 13 and 14.
- `Example 4` covers Problems 15 through 17.
- `Mixed Exercises` covers Problems 18 through 32.

The graph has five source rows, `.022` through `.026`. It represents Example 3 twice. The current titles also combine content from different headings.

Use these source identities:

- Keep `.022` and `.023` for the joint `Examples 1 and 2` source. Give both rows the same complete source body. The source does not divide Problems 1 through 12 between the two example numbers.
- Keep `.024` for `Example 3: Write and Graph Inequalities from Context`.
- Keep `.026` for `Example 4: Graph Special-Case Inequalities`.
- Preserve `.025` as a rejected and inactive duplicate of `.024`. It has current projection references. Remove those false evidence references in the bounded reconciliation. Do not delete or repurpose the stable ID.

This correction preserves stable meanings. It does not assign mixed-practice problems to worked-example rows.

## Current graph problems

The current `6i` row combines three assessable actions:

- graph a two-variable inequality;
- rewrite standard form for graphing;
- make a contextual model.

One score cannot identify which action the learner can do. The row is overbroad for exact-node evidence.

Objective `6j` is absent. The worksheet directly assesses its boundary-line, half-plane, test-point, and ordered-pair work.

The current `6k` row is not supported by this worksheet. The worksheet contains one inequality at a time. It does not ask the learner to write a system from a graph. It does not ask whether a point satisfies a system. The class-period plan calls this a Lesson 6-5 extension toward Module 7. Keep it as a planning-only draft row unless a separate source supports it. Do not map a Lesson 6-5 worksheet example or exact evidence to it.

The existing sequence prerequisite from the broad Lesson 6-4 skill to `6i` has no operation-based source rationale. Solving absolute value inequalities is not required to graph a two-variable linear inequality. Remove that prerequisite in the bounded source repair. The `6k` to Module 7.1 edge is also sequence-only. This worksheet does not support it.

## Proposed atomic capabilities

Add these draft and inactive candidates. Use the repository ID constructor for final IDs.

1. **Graph linear inequalities in slope-intercept form.** Graph the boundary with the correct line type. Shade the correct half-plane. Problems 1 through 4 and 18 through 21 assess this action.
2. **Rewrite and graph linear inequalities from standard form with a positive `y` coefficient.** Isolate `y` when useful. Then graph the result. Problems 5 through 12, 22, and 23 all have a positive `y` coefficient. Reversal during division by a negative `y` coefficient is an authored extension. This worksheet does not directly assess that extension.
3. **Use boundary inclusion and a valid test point to select a solution half-plane.** This is the missing objective `6j` action. Problems 27, 28, 30, and 32 assess the reasoning separately from line construction.
4. **Graph one-variable inequalities as horizontal or vertical half-planes.** Problems 15 through 18 assess horizontal and vertical boundaries after simplification.
5. **Model a contextual constraint with one two-variable linear inequality and state the source-supported variable domain.** Problems 13a, 14, 24a, 25a, 26a, and 31 assess this action. Apps, games, and smoothies are nonnegative integers. Donut boxes are nonnegative integers. The source permits cider gallons to be nonnegative real values unless a teacher adds a whole-gallon policy. The speed domain needs an explicit modeling assumption because the source does not say whether zero is permitted.
6. **Check whether an ordered pair satisfies a two-variable inequality.** Problem 13b directly assesses substitution and strict endpoint logic.
7. **Find and interpret feasible integer solutions to one contextual linear inequality.** Problems 24c and 25c assess feasible combinations after the model and graph exist.
8. **Optimize a discrete integer quantity under one contextual linear inequality.** Problems 24d and 25d assess a greatest affordable equal count or a least total item count.
9. **Analyze a continuous bound and whether an endpoint is attained.** Problem 26c assesses the supremum or maximum bicycle speed under the stated domain assumption. Keep this separate from integer optimization.
10. **Construct a two-variable linear inequality from required solution and nonsolution points.** Problem 29 is a reverse-construction task. It permits more than one correct inequality.
11. **Analyze and explain errors in a graph of a two-variable inequality.** Problems 28 and 30 assess invalid test points, half-plane selection, and explanation.

Do not add separate capabilities for money, income, fundraising, smoothies, gift cards, or triathlon data. These contexts do not change the mathematical action.

Candidate 3 assesses the learner’s own boundary and test-point decision. Candidate 11 assesses a supplied flawed method. Problem 28 can supply one response to Candidate 11 or separate evidence to Candidate 3, but one response must not update both nodes. Problem 30 supports Candidate 3 when the learner explains the rule without diagnosing a named student.

Problem 27 is evidence for Candidate 3. It does not need a separate “determine the sign of `c`” skill. Problem 32 is evidence for Candidate 3 and the complete graphing procedure. It does not need a separate recall skill.

## Reusable graph capabilities

Reuse these current atomic nodes where the operation is unchanged:

- `math.im1.skill.4.3.rewrite-standard-form-equations-in-slope-intercept-form` for the boundary equation rewrite in Problems 5 through 12, 22, and 23.
- `math.im1.skill.4.3.graph-linear-functions-from-slope-intercept-or-standard-form` for drawing the boundary line. The Lesson 6-5 candidates still own boundary inclusion and half-plane shading.
- `math.im1.skill.6.1.interpret-inequality-solutions-in-context` for interpreting feasible values in Problems 24 through 26.
- `math.im1.skill.6.1.diagnose-inequality-solving-errors` only as a reuse if its reviewed contract accepts graphing errors. If it is limited to algebraic solving, keep Candidate 11 separate and do not broaden the old node.

Do not reuse `math.im1.skill.7.5.graph-systems-of-linear-inequalities-and-identify-the-overla` or the Module 7 optimization node. Lesson 6-5 has one inequality and contextual domain restrictions. It does not have an intersection of independently graphed inequalities in the instructional source.

Do not create equivalence edges between the reusable line skills and the new graph-inequality skills. A boundary line is only one part of the inequality graph.

## Proposed source mappings

Use only worked headings as `sourceNodeIds`:

- Candidate 1 -> `.022`, `.023`
- Candidate 2 -> `.022`, `.023`
- Candidate 3 -> `.022`, `.023`, `.026`
- Candidate 4 -> `.026`
- Candidate 5 -> `.024`
- Candidate 6 -> `.024`
- Candidates 7 through 11 -> no worked-example source ID
- Reused standard-form rewrite -> `.022`, `.023`
- Reused boundary-line graphing -> `.022`, `.023`, `.026`
- Reused contextual interpretation -> no worked-example source ID, because its direct evidence is in Mixed Exercises

Keep `.025` rejected and inactive. Do not map both `.024` and `.025` as if they were different evidence. They have the same Example 3 source.

Add draft Lesson 6-5 containment for each new candidate and each accepted reuse. Preserve the original ownership metadata of reused nodes.

## Independently verified mathematics

Problems 1 through 4 are already in slope-intercept form. Problems 5 through 12 give:

- 5: `y > -2x + 4`
- 6: `y < -x + 9`
- 7: `y > -5x + 10`
- 8: `y < -2x - 3`
- 9: `y >= 2x - 4`
- 10: `y <= -8x + 6`
- 11: `y <= -5x + 7`
- 12: `y >= 3x - 6`

The last four retain closed boundaries. Division by the positive `y` coefficient does not reverse their symbols.

Problem 13a gives `y < 48200 + 1240x`, with `x >= 0` for years after 2006. For Problem 13b, the thresholds are 50,680; 58,120; 54,400; and 60,600. Only `(5, 50000)` satisfies the strict inequality. `(10, 61000)` does not satisfy it.

Problem 14 gives `1.25d + 2.50c >= 100`. The item concerns sold boxes and gallons. Both variables are nonnegative. The worksheet does not state that cider gallons can only be whole numbers. Assessment content must not add an integer constraint without a policy.

Problems 15 through 17 simplify to `y >= -3`, `x < 4`, and `x > -1`. The first graph has a solid horizontal boundary. The other two have dashed vertical boundaries.

Problems 18 through 23 give `y < -1`, `y >= x - 5`, `y > 3x`, `y <= 2x + 4`, `y > -x + 3`, and `y >= x + 1`.

Problem 24 gives `1.25a + 2.50g <= 50`, where `a` and `g` are nonnegative integers. If `a = g = n`, then `3.75n <= 50`. The greatest integer is 13. Kumiko buys 13 apps and 13 games. She spends $48.75 and has $1.25 left.

Problem 25 gives `2.25p + 2b > 90`, where `p` and `b` are nonnegative integers. If `p = 20`, then `b > 22.5`, so at least 23 berry smoothies were sold. Peach smoothies have the greater unit profit. The minimum total count is 41. For 41 smoothies, each integer mix with 33 through 41 peach smoothies meets the goal. Forty smoothies can produce at most $90, which does not meet the strict goal. Thus 41 peach smoothies is valid, but it is not unique.

Problem 26 gives `2x + 2y + 2 <= 30`, or `x + y <= 14`, with nonnegative speeds. If the model explicitly permits `x = 0`, the greatest bicycle speed is 14 mph. This is an added domain assumption, not a source fact. The phrase “jogged” can imply `x > 0`. Under that domain, bicycle speeds can approach 14 mph but have no attained greatest value. Future assessment content must state the assumption before it grades this part.

Problem 27 gives `c > 0`. Substitution of `(0,0)` gives `0 < c`.

Problem 28 shows `4y <= (8/3)x`, which is `y <= (2/3)x`. Reiko is correct. Reiko uses `(1,1)`, finds the statement false, and shades the opposite half-plane below the solid boundary. Kristin uses `(0,0)`, which lies on the boundary. Her test cannot choose a half-plane, and her shading is above the line.

For Problem 29, `y <= -x + 1` is one valid answer. The first three points lie on its boundary. `(1,1)` does not satisfy it. The item is nonunique and needs structural grading or manual review.

Problem 30 requires a point outside the boundary. Every boundary point satisfies the boundary equation, so it cannot distinguish the two open half-planes. For a strict inequality it makes the substituted statement false regardless of the correct shaded side.

Problem 31 is open-ended. It needs model, domain, range, and explanation review. Problem 32 requires the boundary equation, solid or dashed line, a test point off the boundary, and shading of the satisfying half-plane.

## Projection and queue reconciliation

The current practice projection has six false placeholder activities. It has three modes for broad `6i` and three modes for unsupported `6k`. Remove the empty mode specifications from the two blueprints. Then run the existing activity projector. It must remove all six activity rows.

Preserve the `6i` and `6k` SRS-input rows. They have `generatorReady: false`. They are inactive planning inputs. The existing `projectSrsInputs` helper emits a planning row for each skill with a source-only blueprint. It must also emit one inactive planning row for each of the eleven new skill candidates. The `6i` row must no longer name the false Lesson 6-4 prerequisite.

Keep `6i` and `6k` in the teacher skill inventory as draft and inactive graph rows. Remove their false exact activity or evidence references. Preserve their standards alignment unless a separate standards review changes it. Remove rejected duplicate `.025` only from false exact evidence references. Do not remove the physical source row or its stable identity.

Append one generator-gap row for each of the eleven new atomic candidates. Preserve the current queue order and all unrelated rows. Keep the two legacy gap rows. Change only their selected reason fields so `6i` states that it is an aggregate capability and `6k` states that this worksheet does not support it. These rows record unresolved source boundaries. They do not require standalone generators. Follow the current queue format, but do not treat its renderer classification as an approved renderer contract. Do not write a renderer or a mode specification into a source-only blueprint.

Update `im1-coverage-matrix.json` with eleven new source-only rows. Run the existing projection helpers instead of editing counts by hand. The expected bounded deltas are:

- graph nodes: `+11`;
- blueprints: `+11`;
- projected activities: `-6`;
- standalone SRS inputs: `+11` because both legacy planning rows remain;
- embedded SRS inputs in `practice-v1-activity-map.json`: `+11` for the same reason;
- teacher skill inventory rows: `+11`;
- generator-gap rows: `+11` because both legacy rows remain.

The helper must recompute affected standards and teacher-evidence summaries after it removes false evidence references. Do not hand-author a projection that disagrees with the projector. The selected legacy gap reasons can change, so tests must preserve the unrelated queue prefix rather than claim that the complete prefix is byte-identical.

## Extracted lesson corrections

The extracted lesson is mostly faithful. Make these source corrections before it is used as reviewed evidence:

- Replace the false Problem 28 note. The figure is readable. Reiko is correct for the reasons above.
- Preserve the exact joint `Examples 1 and 2` heading. Do not present separate unavailable source bodies.
- State the domain ambiguity for Problem 14 gallons and Problem 26 zero speed. Do not invent a stricter domain.
- Keep Problems 29 and 31 open-ended. Do not assign one fixed response.

## Minimum bounded graph repair

Change only the Lesson 6-5 source and capability boundary:

1. Correct the four actual worked headings while preserving the stable retained IDs. Keep `.025` as a rejected and inactive duplicate. Remove its exact evidence projection references.
2. Add the eleven candidates as draft, inactive skill nodes in `nodes.json`, `draft-nodes.json`, and the embedded node copies.
3. Add source-only draft blueprints with the mappings above. Do not add renderer modes or empty specifications as evidence of readiness.
4. Add draft Lesson 6-5 containment edges for the new candidates and accepted reused nodes.
5. Keep broad `6i` and unsupported `6k` as stable draft and inactive rows. Give each a source-only blueprint. Remove `rendererKey`, `rendererModeMap`, all three empty mode specifications, and the generator exception. Do not project either row as an activity or as exact teacher evidence.
6. Do not infer a system skill from the single-inequality mixed exercises.
7. Remove the two sequence-only prerequisite edges identified above. Add no prerequisite or equivalence edge in this repair.
8. Correct the extracted Problem 28 note and retain all source expressions and domain limits.

Suggested implementation paths are:

- `apps/integrated-math-1/curriculum/modules/module-6-lesson-5`
- `apps/integrated-math-1/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/edges.json`
- `apps/integrated-math-1/curriculum/skill-graph/standard-edges.json`
- `apps/integrated-math-1/curriculum/skill-graph/blueprints.json`
- a new bounded Lesson 6-5 source test under `apps/integrated-math-1/__tests__/curriculum/`

The test must preserve all prior IDs and unrelated edges. It must assert the exact source headings, the duplicate disposition, the eleven atomic rows, draft status, `independentPracticeReady: false`, exact source mappings, no `6k` worksheet mapping, and no new prerequisite or equivalence edge.

## Parent source review and authoring decision

The parent inspected all three rendered DOCX pages, including the blank middle page, the document XML, and the original Problem 28 image. The parent independently checked the inequality solutions, strict income tests, integer gift-card count, all 41-item smoothie mixtures, and the conditional bicycle-speed bound.

Accept the revised 11-capability proposal for draft source authoring. This is not curriculum approval. Preserve all existing node IDs. Keep duplicate example .025 rejected and inactive. Keep the two broad legacy skill rows draft and inactive. Remove the two unsupported sequence prerequisites. Add no equivalence or prerequisite edge.

Use the existing projection helpers. Inactive SRS planning rows are not active practice cards. Preserve the two legacy planning rows and add the new inactive rows. Remove the six placeholder activity rows. Preserve unrelated projection records. Change only the selected legacy generator-gap reasons and append the new gaps.

Before integration, verify all source mappings, exact delta counts, reference preservation, actual helper output, and required checks. The implementation remains open under G32.
