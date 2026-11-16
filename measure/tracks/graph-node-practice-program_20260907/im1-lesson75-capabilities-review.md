# IM1 Lesson 7-5 capability source review

## Disposition

The current lesson does not preserve the complete worksheet. It omits the four source graphs. It summarizes Problems 15 through 28. It also calls the later context work optimization, but the worksheet gives no objective function to optimize.

The source supports seven new draft and inactive capability candidates and repair of the existing 7i capability. It also supports one direct reuse from Lesson 6-4. Values, boundary forms, the number of inequalities, bounded and unbounded regions, and continuous or integer context domains are task variants. They are not separate capabilities.

Keep all decisions in this review at draft status. Do not approve a blueprint, renderer, generator, activity, prerequisite, or evidence transfer in this source batch.

## Source authority

The original source is `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0705_practice.docx`.

The reviewed render is `/tmp/int1_0705_review_20260908_v2/page-1.png` and `/tmp/int1_0705_review_20260908_v2/page-2.png`. The rendered PDF is `/tmp/int1_0705_review_20260908_v2/Int1_0705_practice.pdf`.

The exact source groups are:

- `Examples 1 and 2`: Problems 1 through 12.
- `Example 3`: Problems 13 and 14.
- `Mixed Exercises`: Problems 15 through 28.

The heading `Examples 1 and 2` is one joint worksheet group. The worksheet does not give separate Example 1 and Example 2 bodies.

## Verified source mathematics

### Problems 1 through 12

Each problem asks the learner to graph both inequalities and show their intersection.

| Problem | Verified feasible set |
|---|---|
| 1 | `x + 3 < y < 6`, which requires `x < 3` |
| 2 | `0 <= y <= x - 5`, which requires `x >= 5` |
| 3 | `6x + 2 < y <= x + 10`, which requires `x < 8/5` |
| 4 | No solution because `y >= x + 10` and `y <= x - 3` cannot both hold |
| 5 | No solution because `y < 5x - 5` and `y > 5x + 9` cannot both hold |
| 6 | `3x - 5 <= y < 3x + 4` |
| 7 | `x > -1` and `y <= -3` |
| 8 | `x < -2` and `y > 2` |
| 9 | `x + 3 < y <= -1`, which requires `x < -4` |
| 10 | `x < 2` and `y <= x + 2` |
| 11 | No solution because `x + y <= -1` and `x + y >= 3` cannot both hold |
| 12 | `y > x + 4` and `y > 2 - x` |

Problems 4, 5, and 11 are no-solution variants. Problem 6 is a strip between parallel boundaries. Problems 7 and 8 use one vertical and one horizontal boundary. These features vary the same graph-and-intersection operation.

### Problems 13 and 14

Problem 13 uses miles walked `m` and gym hours `h`. The model is `9 <= m <= 12` and `4.5 <= h <= 6`. Its feasible set is a closed rectangle. The problem asks for a model, a graph, and three viable points.

Problem 14 uses the number `f` of four-dollar stones and the number `s` of six-dollar stones. The model is `f + s >= 4` and `4f + 6s <= 30`, with `f` and `s` nonnegative integers. For example, `(4, 0)`, `(3, 1)`, and `(2, 2)` are viable solutions. A continuous graph alone is not sufficient context evidence because the quantities are counts.

### Problems 15 through 18

The four original figures directly assess writing inequalities from a shaded intersection.

- Problem 15 shows the closed strip `x - 3 <= y <= x + 2`.
- Problem 16 shows the open region above both dashed lines `y = x` and `y = -x`. One valid system is `y > x` and `y > -x`, or `y > |x|`.
- Problem 17 shows `y >= x + 1` and `y < 1`. The sloped boundary is solid. The horizontal boundary is dashed.
- Problem 18 shows the closed trapezoid with vertices `(1, 1)`, `(2, 3)`, `(3, 3)`, and `(4, 1)`. One valid system is `y >= 1`, `y <= 3`, `y <= 2x - 1`, and `y <= -2x + 9`.

Equivalent systems are valid. Future grading must compare boundary lines, inclusion, and the resulting region. It must not require one text order or one algebraic form.

### Problems 19 through 28

Problem 19 gives `(2.5, 1)`. It does not satisfy the system. The first expression is `2(2.5) + 3(1) = 8`, which fails the strict condition `> 8`. The second expression is `4(2.5) - 5(1) = 5`, which satisfies `>= 2`.

Problem 20 uses cats `x` and dogs `y`. The stated system is `x + y <= 20` and `x <= 8`. The context also requires nonnegative integer counts.

Problem 21 uses popcorn tins `p` and peanut tins `n`. The model is `3p + 4n <= 900`, `p + n <= 200`, and `p >= n`, with nonnegative integer counts.

Problem 22 uses workers `x` and units `y`. The model is `100 <= x <= 200` and `y >= 30x`. Both quantities are whole counts. Examples include `(100, 3000)`, `(150, 4500)`, and `(200, 6000)`.

Problem 23 uses build hours `x` and update hours `y`. The model is `25x + 15y >= 100`, `x + y <= 6`, `x >= 0`, and `y >= 0`. The ordered pair `(4, 0)` is one valid response. The source does not require integer hours.

Problem 24 asks for a system equivalent to `|x| <= 4`. The result is `x >= -4` and `x <= 4`.

Problem 25 is sometimes true. Parallel boundaries can produce no intersection, a strip, or one nested half-plane. The boundary relation alone does not determine whether the system has a solution.

Problem 26 is nonunique. For example, adding `3x - y <= 4` to `3x - y > 4` creates a system with no solution. A grader must verify the empty intersection. It must not require one fixed second inequality.

Problem 27 has vertices `(-3, 1)`, `(3, 1)`, and `(0, 4)`. The bounded triangular feasible region has area `9` square units.

Problem 28 reduces to the common boundary `6x - 3y = -5`, or `y = 2x + 5/3`. Every point on this solid line satisfies both non-strict inequalities. No point off the line satisfies both.

## Current source and graph defects

The current lesson gives representative content instead of all 28 source problems. It says that Problems 15 through 18 were unavailable. The original render makes all four graphs available. Restore the actual source graph figures. Add accessible descriptions of boundary points, line styles, and shading. Keep the solved inequality systems in this author report, not in learner prompts.

The current graph has four source IDs for two actual source groups:

- `math.im1.example.7.5.016`
- `math.im1.example.7.5.017`
- `math.im1.example.7.5.018`
- `math.im1.example.7.5.019`

Retain `.016` as the canonical source for the joint `Examples 1 and 2` body. Use the title `Examples 1 and 2: Graph systems of linear inequalities`. Map it to `Examples 1 and 2, Problems 1-12`. Keep it draft and inactive.

Retain `.019` as the canonical source for `Example 3`. Use the title `Example 3: Model, graph, and interpret contextual systems of inequalities`. Map it to `Example 3, Problems 13-14`. Keep it draft and inactive.

Retain `.017` and `.018` as rejected and inactive historical duplicates. Remove their direct source mappings and lesson containment. Do not map one worksheet body to multiple source IDs. Preserve their stable IDs and historical example numbers.

The current 7i node already assesses graph construction and feasible-region identification as one observable graph artifact. Preserve its stable ID. Repair its title and source mapping. Do not add a duplicate graph-system node. Remove its empty three-mode specifications and placeholder readiness claims. Use a source-only blueprint until a source-backed activity exists.

The class plan names a broad 7j objective, but the graph has no 7j skill row. Do not recreate the broad combination. Split its three operations into the exact candidates below.

The current 7k node claims optimization. No worksheet problem gives an objective function, corner-point comparison, maximum, or minimum. Retain its stable ID as rejected and inactive. Remove its source mapping, activity readiness, lesson containment, and blueprint source mappings. Do not remap feasibility work to optimization.

## Selected capability boundaries

### Reuse 7i: graph a system and show its feasible region

Suggested ID:

`math.im1.skill.7.5.graph-systems-of-linear-inequalities-and-identify-the-overla`

Suggested title:

`Graph a system of linear inequalities and show the common feasible region`

Problems 1 through 12 directly assess this operation. Problems 13, 14, 20, 22, and 27 reuse it in context. Boundary form, strictness, parallel lines, horizontal or vertical lines, two or three inequalities, and boundedness are variants. Evidence must preserve every boundary, each solid or dashed decision, each selected half-plane, and the final intersection.

Use `.016` as the direct source node. Keep the node and blueprint draft, source-only, and inactive.

### Write a system from a shaded graph

Suggested ID:

`math.im1.skill.7.5.write-a-system-of-linear-inequalities-from-a-shaded-region`

Suggested title:

`Write a system of linear inequalities from boundary lines and a shaded intersection`

Problems 15 through 18 directly assess this operation. The learner must recover slope or boundary coordinates, boundary inclusion, inequality direction, and the common region. Problem 18 shows that the number of inequalities is a variant.

Use exact node source references to `Mixed Exercises, Problems 15-18`. A source-only blueprint can have an empty `sourceNodeIds` array because the mixed exercises have no worked-example heading.

### Check a point against every inequality

Suggested ID:

`math.im1.skill.7.5.check-an-ordered-pair-against-a-system-of-inequalities`

Suggested title:

`Check whether an ordered pair satisfies every inequality in a system`

Problem 19 directly assesses this operation. Evidence must show the result of substitution into each inequality. One true comparison does not make the point a system solution.

Use exact node source references to `Mixed Exercises, Problem 19`. Keep the blueprint source-only with no source node.

### Model contextual constraints as a system

Suggested ID:

`math.im1.skill.7.5.model-contextual-constraints-with-a-system-of-linear-inequalities`

Suggested title:

`Define variables and model contextual constraints with a system of linear inequalities`

Problems 13, 14, 21, and 22 directly assess this operation. Problem 20 supplies the system. Problem 23 requests a viable point without a separate modeling deliverable. Evidence must include variable meanings, all stated constraints, and the source-supported domain. Nonnegative integer counts and continuous hours are variants, not separate capabilities.

Use `.019` as a direct source node for Problems 13 and 14. Add exact node source references for `Mixed Exercises, Problems 21-22`.

### Find and interpret viable contextual points

Suggested ID:

`math.im1.skill.7.5.find-and-interpret-viable-solutions-to-a-contextual-system`

Suggested title:

`Find and interpret points that satisfy a contextual system of inequalities`

Problems 13, 14, 22, and 23 directly assess viable points. The learner must satisfy every inequality and the variable domain. A graph with no interpreted point does not prove this action.

Use `.019` as a direct source node for Problems 13 and 14. Add exact node source references for `Mixed Exercises, Problems 22-23`.

### Classify a feasible set from boundary relationships

Suggested ID:

`math.im1.skill.7.5.classify-a-system-feasible-set-from-boundary-relationships`

Suggested title:

`Classify the feasible set of a linear inequality system from its boundary relationships`

Problems 25 and 28 directly assess this reasoning. The learner must use inequality directions and boundary inclusion. Parallel, coincident, and complementary boundaries are variants. Do not reuse an equation-system solution-count node because an inequality system can have an empty region, a line, a strip, or a two-dimensional region.

Use exact node source references to `Mixed Exercises, Problems 25 and 28`.

### Construct a system with an empty feasible set

Suggested ID:

`math.im1.skill.7.5.construct-a-system-of-linear-inequalities-with-no-solution`

Suggested title:

`Construct a system of linear inequalities with an empty feasible set`

Problem 26 directly assesses this operation. The response is nonunique. Evidence must show that the proposed second inequality has no common point with `3x - y > 4`.

Use exact node source references to `Mixed Exercises, Problem 26`.

### Find the area of a bounded feasible region

Suggested ID:

`math.im1.skill.7.5.find-the-area-of-a-bounded-feasible-region`

Suggested title:

`Find the area of a bounded feasible region for a system of inequalities`

Problem 27 directly assesses this operation. Evidence must identify the vertices and use their geometry to calculate area. Graphing the system is prerequisite evidence, but it does not prove the area calculation.

Use exact node source references to `Mixed Exercises, Problem 27`.

Keep all seven new candidates and the existing 7i capability draft and inactive. Create seven source-only blueprints and repair the existing 7i blueprint. Do not add renderer keys, mode specifications, generator exceptions, or placeholder activities.

## Existing capability reuse

Add one draft Lesson 7-5 `contains` edge for this direct reuse:

| Source work | Existing capability |
|---|---|
| Rewrite `|x| <= 4` as two inequalities in Problem 24 | `math.im1.skill.6.4.rewrite-and-solve-less-than-absolute-value-inequalities` |

The source assesses the rewrite portion of the existing capability. It does not need a duplicate Lesson 7-5 atom.

Do not reuse these broad or different-operation nodes as atomic evidence targets:

- Do not use `math.im1.skill.6.5.write-systems-of-inequalities-that-correspond-to-a-given-gra` as an active mastery target. It conflates graph-to-system writing with ordered-pair checking. Preserve it as a draft and inactive legacy aggregate.
- Do not use equation-system classification or construction nodes from Lesson 7-1 for Problems 25, 26, or 28. Linear inequality feasible sets have different geometry and evidence.
- Do not use the single-constraint context nodes from Lesson 6-5 as proof that a learner can coordinate all constraints in one system.
- Do not use the Lesson 6-5 single-constraint optimization node for this lesson. The worksheet has feasibility tasks and no optimization task.

## Relationship boundaries

Add only draft `contains` edges for the seven new candidates and the one valid reuse. Preserve the existing 7i lesson containment. Preserve source containment for canonical `.016` and `.019`. Do not duplicate existing relations. Remove containment for duplicate `.017`, duplicate `.018`, and unsupported 7k.

The following are mathematically plausible prerequisite relations:

- `math.im1.skill.6.5.graph-linear-inequalities-in-slope-intercept-form` precedes graphing a system.
- `math.im1.skill.6.5.use-boundary-inclusion-and-a-valid-test-point-to-select-a-so` precedes graphing a system and writing a system from a graph.
- `math.im1.skill.6.5.graph-one-variable-inequalities-as-horizontal-or-vertical-ha` precedes the horizontal and vertical variants.
- The repaired 7i graph-system capability precedes finding the area of a bounded feasible region.

Do not add these prerequisite edges in the source batch. They require a separate edge review and approved endpoints.

G36 already removed `math.im1.edge.1263` and its two SRS dependencies. Assert that they remain absent. Do not count this as a new G37 removal.

Remove `math.im1.edge.1264`. Feasibility work in Lesson 7-5 is not a prerequisite for identifying exponential behavior from common ratios in Lesson 8-1. This edge records sequence only. Remove the matching dependency from both stored SRS planning copies for the Lesson 8-1 target.

Do not add equivalence or evidence-transfer edges between the legacy 6k aggregate and the new atomic nodes. Shared words do not establish equivalent evidence.

Preserve the current standards alignment on legacy rows as historical graph data. Do not copy alignments to new nodes without a standards review.

## Bounded implementation files

The source and graph correction can stay within these files:

- `apps/integrated-math-1/curriculum/modules/module-7-lesson-5`
- `apps/integrated-math-1/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/edges.json`
- `apps/integrated-math-1/curriculum/skill-graph/standard-edges.json`
- `apps/integrated-math-1/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-1/curriculum/skill-graph/generator-gap-queue.json`
- `apps/integrated-math-1/curriculum/skill-graph/im1-coverage-matrix.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/srs-input.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `measure/skill-graph-im1-rollout-audit.md`
- One new focused Lesson 7-5 source and graph test
- One author source note under the active graph-node practice track

Do not change an app renderer, generator, runtime approval, or evidence policy in this batch.

## Required tests

The focused test must check these facts:

1. The repaired lesson contains Problems 1 through 28 with each exact inequality, context condition, and prompt.
2. Problems 15 through 18 have complete accessible graph descriptions with the verified coordinates, line styles, and shaded intersections.
3. Author mathematical checks verify Problem 19 strict-boundary failure, Problem 27 area `9`, and Problem 28 line `y = 2x + 5/3`. Source tests must ensure these answers are not added to learner prompts.
4. `.016` is the only source node for the joint `Examples 1 and 2` body.
5. `.017` and `.018` remain present, rejected, inactive, and absent from blueprint, activity, and teacher-evidence mappings.
6. `.019` maps only to `Example 3, Problems 13-14`.
7. All seven new capability rows and the repaired 7i row are draft and inactive in all four node catalogs.
8. All seven new blueprints and the repaired 7i blueprint are source-only. Only graph-system uses `.016`. Context modeling and viable-solution interpretation use `.019`.
9. The lesson adds eight capability `contains` relations: seven new candidates and one reuse. It preserves the existing 7i containment.
10. No new prerequisite, equivalence, alignment, or evidence-transfer edge touches a new node.
11. The repaired 7i stays draft and inactive with a source-only blueprint. The unrelated legacy 6k node remains unchanged.
12. Legacy 7k remains present, rejected, inactive, and absent from direct source, activity, and lesson containment.
13. Sequence edges `math.im1.edge.1263` and `math.im1.edge.1264` are absent. Both SRS copies omit the corresponding dependencies.
14. Every previous stable node ID and every unrelated edge ID remains present.
15. The queue, coverage matrix, SRS projections, activity map, and rollout audit agree with the current graph arrays and lifecycle states.

## Remaining limits

The worksheet is practice. It does not contain the textbook Worked Example explanations. A repaired lesson can state verified general methods. Keep authored problem answers out of learner prompts. It must not label invented teaching prose as recovered textbook text.

Problems 15 through 18, 25, and 26 permit equivalent or nonunique answers. Future grading needs structural graph or rubric checks. A fixed text answer is not sufficient.

The worksheet supports feasibility. It does not support the current optimization claim. A separate source is required before the product can add a linear-programming objective.

The source does not establish a production renderer or generator. All new rows must remain source-only, draft, and inactive.

## Parent acceptance conditions

The parent viewed both source pages. Use the seven-new-plus-existing-7i identity decision above. Copy the four original graph assets or reproduce their visual content faithfully. Do not replace them with solved systems. Preserve all 28 prompts and subparts. Keep numerical answers and nonunique examples in author verification only.
