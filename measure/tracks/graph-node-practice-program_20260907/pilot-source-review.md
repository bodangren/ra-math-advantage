# Pilot Source Review

Date: 2026-09-07.

This review checks the current working tree. It selects exact pilot identities. It does not approve a full course graph. It does not approve draft relationships outside each pilot boundary.

## Selection result

| Course | Pilot node | Decision |
| --- | --- | --- |
| Integrated Math 1 (IM1) | `math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express` | Conditional. Keep this candidate only after a source example is linked. |
| Integrated Math 2 (IM2) | `math.im2.skill.1.1.perpendicular-bisector-equidistance` | Selected. Keep it separate from the broader proof capability. |
| Integrated Math 3 (IM3) | `math.im3.skill.1.1.graph-quadratic-functions` | Selected. Narrow it to graphing a quadratic from an equation by using a table. |
| AP Precalculus | `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs` | Selected. Use the current interval-classification path. |
| Business Math | `math.bm2.skill.1.1.apply-accounting-equation` | Selected with a mapping correction. The current curriculum capability is valid. The old pilot activity does not assess the complete capability by itself. |

## IM1 candidate

The candidate node is `math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express`. The current generator key is `1-1-verbal-to-numerical`. The current renderer key is `step-by-step-solver` for all three modes.

The blueprint has Worked, Guided, and Independent specifications. Its `sourceNodeIds` list is empty. The current graph cannot prove which authored example supports the capability. The generator tests in `packages/math-content/src/problem-families/im1/__tests__/1-1-verbal-to-numerical.test.ts` prove generator behavior. They do not supply curriculum provenance.

The pilot can continue only after review of the Lesson 1.1 source and creation or selection of the exact example node. Keep the node and all activity rows draft. Do not enable spaced repetition from the current placeholder projection.

Allowed pilot paths:

- `apps/integrated-math-1/curriculum/skill-graph/blueprints.json`
- The exact Lesson 1.1 node and required edges in `apps/integrated-math-1/curriculum/skill-graph/`
- `packages/math-content/src/problem-families/im1/generators.ts`
- The IM1 lesson renderer, submission path, and focused tests after source approval

## IM2 pilot

The selected node is `math.im2.skill.1.1.perpendicular-bisector-equidistance`. The source node is `math.im2.example.1.1.001`. The blueprint identifies Lesson 1.1, Example 1. The worked problem states that D lies on the perpendicular bisector of AB, gives `DA = 3x + 2` and `DB = 5x - 6`, and asks for x. The solution uses `DA = DB` and gives `x = 4`.

The generator key is `im2-perpendicular-bisector-equidistance`. The renderer key is `im2-question` for all three modes. The exact answer part is `response`. The current generator implementation is `apps/integrated-math-2/lib/practice/perpendicular-bisector.ts`.

This capability applies the perpendicular-bisector equidistance theorem. It does not prove the perpendicular-bisector theorem. Keep it separate from `math.im2.skill.1.1.apply-properties-of-circumcenters-and-perpendicular-bisector`. The alignment to `math.standard.ccss.g-co-c-9` must remain limited. It cannot award full proof-standard mastery.

The current graph has the required lesson containment, standard alignment, generator, and source-context edges. The blueprint is draft. Its metadata sets `independentPracticeReady` to false and `runtimeStatus` to `not_connected_to_graph_practice`. The stored graph activity projection is empty.

Minimal gaps:

- Connect `im2-question` to the real lesson and practice runtime.
- Store server-owned grades for `response`.
- Store evidence only for the selected node.
- Keep spaced repetition disabled until the runtime and teaching review pass.

Allowed pilot paths:

- `apps/integrated-math-2/lib/practice/perpendicular-bisector.ts`
- The selected blueprint and selected-node edges in `apps/integrated-math-2/curriculum/skill-graph/`
- `apps/integrated-math-2/components/lesson/LearningSession.tsx`
- IM2 activity submission code and focused tests

## IM3 pilot

The selected node is `math.im3.skill.1.1.graph-quadratic-functions`. Its current title is “1a: Graph a quadratic function by using a table.” Its description is the correct capability boundary: graph a quadratic function from an equation by using a table.

The source node is `math.im3.example.1.1.001`. The graph links the node to Lesson 1.1. The primary source is `apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=4`. The local lesson text is `apps/integrated-math-3/curriculum/modules/module-1-lesson-1`, under “Example 1 — Graph Quadratic Functions and State Domain and Range.” The local source uses `f(x) = x^2 + 6x + 8`. It finds the vertex `(-3, -1)`, makes a table, graphs the parabola, and states the domain and range.

The current blueprint Worked example uses a different valid quadratic, `f(x) = x^2 + 2x - 3`. It includes graphing, vertex, axis, intercept, direction, domain, and range. The Guided and Independent modes require a five-value table and five plotted points. The stable activity IDs are:

- `math.im3.skill.1.1.graph-quadratic-functions.worked_example`
- `math.im3.skill.1.1.graph-quadratic-functions.guided_practice`
- `math.im3.skill.1.1.graph-quadratic-functions.independent_practice`

The generator key is `quadratic-graph-analysis`. The renderer key is `graphing-explorer`. The graded Independent parts are `table_values` and `placed_points`.

The node is a real current skill. It is not the broad concept `math.im3.skill.1.aleks.quadratic-graph-analysis`. Do not replace it with a concept row. Do not use the broader pilot allow-list as evidence that every listed node is approved.

Minimal graph corrections:

- Change the source reference on the skill node from the general class-period plan to the exact PDF page and Example 1 reference.
- Keep the existing Lesson 1.1 containment edge and Example 1 source mapping.
- Review the three outgoing prerequisite edges separately. Their current draft status cannot control readiness.
- Keep the `supports` edge from the broad ALEKS row out of mastery and evidence decisions.
- Keep `rendered_by` and `generated_by` only after the registered renderer and generator pass the exact props and grading tests.

The three mode definitions exist. The remaining pilot work is runtime verification. Verify Worked display, Guided hints, Independent generation, server grading, submission storage, and exact-node evidence in the real student route.

Allowed pilot paths:

- The selected node, blueprint, and direct edges in `apps/integrated-math-3/curriculum/skill-graph/`
- `packages/math-content/src/knowledge-space/generators/registry.ts` only for the existing `quadratic-graph-analysis` binding
- `apps/integrated-math-3/lib/practice/learning-evidence-pilot.ts`
- The existing IM3 graph renderer, server grader, seed, and focused tests

## AP Precalculus pilot

The selected node is `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs`. Its source node is `math.precalc.example.1.1.002`. Its primary source is `apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=5`.

The topic review at `apps/pre-calculus/curriculum/topics/unit-1-topic-1.1.md` describes Passwater Example 2. Students read a piecewise graph across three intervals and describe how the output changes. This source supports interval classification from a graph. It also supports the node's increasing, decreasing, and constant fields.

The stable activity IDs are the node ID with these suffixes:

- `.worked_example`
- `.guided_practice`
- `.independent_practice`

The generator key is `topic11-interval-graph`. The renderer key is `interval-classification`. The answer parts are `increasingIntervals`, `decreasingIntervals`, and `constantIntervals`. The Worked specification asks only for increasing intervals. The Guided and Independent specifications ask for all three classes. This is acceptable for instruction, but Worked must explicitly show all three classifications before it serves as first exposure for the full node.

The current graph contains a draft Example 2 `supports` edge. It also contains a reviewed prerequisite from this node to `math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs`. Keep the reviewed prerequisite. Add or confirm Lesson 1.1 containment, standard alignment, `rendered_by`, and `generated_by` edges in the canonical graph. The node is marked independently ready while its own review status is draft. Do not use readiness until these direct relationships and the pilot evidence path pass.

The three mode implementations exist. The minimal gap is the Worked scope correction and exact-node acceptance through the student route.

Allowed pilot paths:

- The selected node, blueprint, and direct edges in `apps/pre-calculus/curriculum/skill-graph/`
- `packages/math-content/src/knowledge-space/generators/topic11-interval-graph.ts`
- `packages/activity-components/src/components/intervals/IntervalClassificationActivity.tsx`
- `apps/pre-calculus/lib/learning-evidence/precalc-pilot.ts`
- The existing Precalculus pilot clients, server submission route, and focused tests

## Business Math pilot

The old pilot node is still a current curriculum capability. Its ID is `math.bm2.skill.1.1.apply-accounting-equation`. The current graph title is “Apply the accounting equation to a business event.” The node is reviewed. It belongs to `unit-1-lesson-1` and aligns to `ACC-1.1`.

The current source files are `apps/bus-math-v2/lib/curriculum/generated/unit1-authored.ts` and `apps/bus-math-v2/lib/curriculum/published-manifest.ts`. Lesson 1 teaches `Assets = Liabilities + Equity`. The current graph blueprint refers to these published activity keys:

- `unit-1-lesson-1-activity-1`
- `unit-1-lesson-1-activity-2`
- `unit-1-lesson-1-activity-3`

The old learning-evidence pilot binds the node to physical activity ID `d6b57545-65f6-4c39-80d5-000100001002`, activity key `unit-1-lesson-1-activity-1`, and legacy variant key `accounting-equation`. The physical activity is “The Notebook Organizer.” It asks students to classify six items. Its embedded generated question asks students to compute equity from assets and liabilities.

This creates a semantic mismatch. The old pilot treats one Guided activity as both the source exposure and the basis for later Mastery Advantage evidence. The activity combines account classification with one missing-term calculation. It does not by itself assess how a business event changes both sides of the accounting equation. It also does not assess a saved model or explanation.

The approved current policy is in `apps/bus-math-v2/curriculum/skill-graph/README.md` and the node metadata. A submitted artifact proves participation. Automatic quiz grades prove only their numerical items. A teacher must review model and explanation evidence before application mastery. Adaptive graph updates remain disabled outside the bounded accounting-equation pilot. `kstApplied: false` remains correct until runtime integration verifies the prerequisite model and evidence policy.

Keep the node. Correct the activity mapping:

- Use the authored Worked explanation as first exposure.
- Use `unit-1-lesson-1-activity-1` as Guided evidence for classification and the generated missing-term calculation only.
- Use the applicable published independent or assessment activity for numerical evidence. Do not use the legacy variant name as a physical activity ID.
- Require teacher review before evidence can establish the complete “apply to a business event” capability.
- If no Lesson 1 activity requires a student to trace a business event, narrow the pilot evidence claim to “solve a missing term in the accounting equation.” Do not rename the reviewed graph node until the full 89-node source review decides whether that narrower capability needs a separate node.

The current blueprint has Worked and Independent specifications. It has no Guided specification and an empty `rendererModeMap`. Its renderer key is `notebook-organizer`. Add one explicit Guided specification for the published activity. Do not generate a new problem family. Preserve the three published activity identities.

Allowed pilot paths:

- The selected node and blueprint in `apps/bus-math-v2/curriculum/skill-graph/`
- `apps/bus-math-v2/lib/learning-evidence/bm2-pilot.ts`
- The three published Lesson 1 activity definitions and their existing renderer paths
- Business Math submission, teacher-review, and focused evidence tests

## Pilot boundary

Each pilot can edit its exact node, direct source mapping, direct renderer and generator relationships, three mode specifications, and exact evidence allow-list. It cannot approve neighboring nodes, draft prerequisites, cross-course equivalence, or a full standard. A pilot must not regenerate a complete course projection until its direct graph changes pass independent review.
