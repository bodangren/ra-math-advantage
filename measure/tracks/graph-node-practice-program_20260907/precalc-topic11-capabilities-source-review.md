# AP Precalculus Topic 1.1 Capability Source Review

## Scope

This review covers AP Precalculus Topic 1.1, Change in Tandem. It does not approve curriculum content, graph rows, generators, or practice readiness.

The review used these sources:

- Original instructional source: `apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf`
- Original Topic 1.1 notes: PDF pages 3 through 8
- Original Topic 1.1 Worksheet A: PDF pages 9 through 12
- Rendered instructional pages: `/tmp/precalc_topic11_render/page-3.png` through `/tmp/precalc_topic11_render/page-12.png`
- Official College Board source: `apps/pre-calculus/curriculum/source/originals/ap-precalculus-course-and-exam-description.pdf`, PDF pages 39 and 40, Course Framework pages 31 and 32
- Local CED overview: `apps/pre-calculus/curriculum/source/college-board/ced.md`
- Topic summary: `apps/pre-calculus/curriculum/topics/unit-1-topic-1.1.md`
- Current lesson: `apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-1/lesson.md`
- Class plan: `apps/pre-calculus/curriculum/unit-1-class-period-plan.md`
- Current graph: `apps/pre-calculus/curriculum/skill-graph`

The Passwater PDF text layer loses mathematical symbols. This review inspected the rendered graphs and labels. The source PDF remains the authority for each figure.

## Official CED scope

The local `ced.md` file is an overview. It does not contain the required Topic 1.1 statements. The official Course and Exam Description (CED) PDF contains the exact required text.

- Learning Objective 1.1.A is: “Describe how the input and output values of a function vary together by comparing function values.”
- Essential Knowledge 1.1.A.1 defines a function, domain, range, independent variable, and dependent variable.
- Essential Knowledge 1.1.A.2 states that input and output values vary in tandem. It permits graphical, numerical, analytical, and verbal function rules.
- Essential Knowledge 1.1.A.3 and 1.1.A.4 define increasing and decreasing behavior on intervals.
- Learning Objective 1.1.B asks learners to construct a graph for two quantities that vary in a context.
- Essential Knowledge 1.1.B.3 links increasing rate of change to concave-up behavior.
- Essential Knowledge 1.1.B.4 links decreasing rate of change to concave-down behavior.
- Essential Knowledge 1.1.B.5 links zeros to graph intersections with the horizontal axis.

At review start, the topic summary misquoted Learning Objective 1.1.A as an identification task. It also omitted Learning Objective 1.1.B. The class plan listed only the `1.1.A` family. The bounded repair corrects these references.

The CED representation list does not create a separate capability for each representation. A graph, table, formula, or verbal description can supply evidence for the same assessed operation.

The CED topic note states that Topic 1.1 is introductory. It does not expect immediate proficiency during the Topic 1.1 instructional days. Keep all new graph candidates draft and inactive.

## Passwater scope

The Passwater source gives these assessable graph tasks:

- Page 4 asks the learner to select a water-height graph for a vase that fills at a constant volume rate.
- Page 5 asks for increasing intervals. It distinguishes function direction from change in rate.
- Pages 6 and 7 ask for function sign, function direction, rate sign, change in rate, and concavity on labeled intervals.
- Page 8 asks for decreasing intervals and combined sign, direction, and concavity conditions.
- Worksheet A on pages 9 through 12 repeats the graph-classification operations with new figures.

Page 3 contains vocabulary fill-ins. It does not contain an applied task that asks the learner to identify the independent and dependent variables in a new context. Example 1 gives those roles in the prompt. Worksheet A does not assess variable-role identification. Defer a variable-role mastery capability until a direct source task supports it.

Worksheet A does not assess a separate operation called “describe covariation.” Its Problems 1 through 12 ask for the same direction, sign, rate-sign, and concavity classifications as the notes. Reuse the existing direction-classification capability. Record table and verbal evidence as a representation-coverage gap.

The source does not ask learners to calculate an average rate of change in Topic 1.1. Numerical average-rate calculation starts in Topic 1.2.

## Solved original examples

Preserve the original givens, graphs, point labels, and answer choices. Use these checked results in the repaired source:

| Example | Checked result | Mathematical basis |
| --- | --- | --- |
| 1 | Graph D | The height always increases. It increases slowly in wide parts of the vase and quickly in narrow parts. The prompt supplies time as the independent variable and height as the dependent variable. |
| 2 | Increasing from input 0 to 3 and from 7 to 9 | The graph passes through `(0,-2)`, `(3,4)`, `(7,1)`, and `(9,3)`. It decreases from 3 to 7. It has no constant interval. |
| 3 | Positive and decreasing from F to G; rate of change decreasing | The printed points are `F(-6,4)` and `G(-3,0)`. The graph stays above the horizontal axis between them and moves down. The curve gets steeper downward, so its rate becomes more negative. |
| 4 | Negative and increasing from K to P; rate of change decreasing | The printed points are `K(9,-4)` and `P(12,-1)`. The graph stays below the horizontal axis and moves up. It flattens as it approaches P, so its positive rate decreases. |
| 5 | Choice C, interval D to E | The graph is below the horizontal axis and decreases from D to E. |
| 6 | Choice D, rate of change positive from E to F | The graph increases from E to F. |
| 7 | Choice C, rate of change increasing from D to E | The downward slope becomes less negative as the graph approaches the minimum at E. |
| 8 | Choice B, function increasing and concave down from B to C | The function rises while its positive slope decreases toward the local maximum at C. |
| 9 | Decreasing from input `-1` to input `2` | The middle segment falls from `(-1,2)` to `(2,0)`. |
| 10 | Negative and increasing for `-5 < x < -3` | The first segment rises from `(-5,-2)` and crosses the horizontal axis at `x=-3`. The zero is not part of the negative interval. |
| 11 | Decreasing and concave up for `-1 < x < 1` | The graph decreases between its local maximum near `x=-3` and local minimum near `x=1`. It is concave up to the right of the marked change in concavity at `x=-1`. |
| 12 | Rate positive and decreasing for `-5 < x < -3` | The graph increases to the local maximum near `x=-3`. It is concave down to the left of the marked change in concavity at `x=-1`. |

Examples 3 and 4 say that no axes or scale are supplied. The figures still print coordinate labels at F, G, J, K, and P. A repaired source can use those printed labels. It must not invent other coordinates.

The source often states intervals by named points. Use named-point intervals when a figure has no numeric input labels. For numerical graphs, state whether an endpoint with zero value or zero slope is included. Examples 10 through 12 require open endpoints for the strict sign or pointwise rate condition.

## Reviewed baseline graph state

The graph has two Topic 1.1 skills.

### Existing interval skill

ID: `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs`

The title also includes constant behavior. Increasing, decreasing, and constant are the output-direction states on an interval. Keep this capability. Use it for the graph-direction tasks in the notes and Worksheet A.

At review start, the blueprint mapped only `math.precalc.example.1.1.002`. The repair adds `.009` as a direct pilot source. Other original examples support the source-only capability record when direction is explicit. The existing title includes constant behavior, but the reviewed CED pages and Passwater worked examples do not give direct constant-segment support. Treat the constant case as authored extension content.

The node has `reviewStatus: draft` and `independentPracticeReady: true`. The activity and teacher projections make Independent practice unavailable. Set the node field to false while the node remains draft.

### Existing physical-context skill

ID: `math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context`

This capability matches original Example 1. The learner reasons about vessel width and selects the graph with the correct height-change pattern. Keep `math.precalc.example.1.1.001` as its direct source. Do not use `.001` as evidence for variable-role identification because the prompt supplies both roles.

This node is also draft with `independentPracticeReady: true`. Set the field to false until curriculum approval establishes readiness.

## Missing source identities

At review start, the graph preserved only Examples 1 and 2. The original source has 12 numbered examples. The repair preserves `.001` and `.002` and adds these draft source identities:

| Proposed ID | Original source | Exact assessed action |
| --- | --- | --- |
| `math.precalc.example.1.1.003` | PDF page 6, Example 3 | Classify function sign and direction. Describe change in rate on a labeled interval. |
| `math.precalc.example.1.1.004` | PDF page 6, Example 4 | Classify function sign and direction. Describe change in rate on a labeled interval. |
| `math.precalc.example.1.1.005` | PDF page 7, Example 5 | Select an interval where the function is negative and decreasing. |
| `math.precalc.example.1.1.006` | PDF page 7, Example 6 | Select a true statement about the sign of the rate of change. |
| `math.precalc.example.1.1.007` | PDF page 7, Example 7 | Select a true statement about whether the rate of change increases or decreases. |
| `math.precalc.example.1.1.008` | PDF page 7, Example 8 | Select an interval where the function increases and is concave down. |
| `math.precalc.example.1.1.009` | PDF page 8, Example 9 | Identify all decreasing intervals. |
| `math.precalc.example.1.1.010` | PDF page 8, Example 10 | Identify intervals where the function is negative and increasing. |
| `math.precalc.example.1.1.011` | PDF page 8, Example 11 | Identify intervals where the function decreases and is concave up. |
| `math.precalc.example.1.1.012` | PDF page 8, Example 12 | Identify intervals where the rate of change is positive and decreasing. |

Do not create worked-example nodes for Worksheet A Problems 1 through 12. They are practice problems.

## Proposed capability inventory

Keep the two existing skills. Add only these three draft and inactive atomic candidates:

1. `math.precalc.skill.1.1.identify-function-sign-on-intervals-from-graphs`
   - Identify intervals where function values are positive or negative.
   - This action uses graph position relative to the horizontal axis.
2. `math.precalc.skill.1.1.determine-rate-of-change-sign-from-graphs`
   - Determine whether the rate of change is positive, negative, or zero from graph direction.
   - This action states a rate sign. It does not calculate a rate value.
3. `math.precalc.skill.1.1.identify-rate-change-and-concavity-on-intervals`
   - Identify where the rate of change increases or decreases and where the graph is concave up or concave down.
   - Essential Knowledge 1.1.B.3 and 1.1.B.4 directly link these descriptions.

Do not add the proposed covariation-description row. Naming an input interval and output direction is the existing interval-direction operation. Graph, table, and verbal prompts change the representation. They do not establish a new atomic capability. Record the lack of reviewed table and verbal evidence as a coverage gap.

Do not add the proposed independent-variable and dependent-variable row. Page 3 supports vocabulary instruction. It does not establish direct applied mastery evidence. Example 1 supplies the roles, and Worksheet A does not test them.

Do not add separate capabilities for combined prompts. A task such as “negative and increasing” uses the function-sign capability and the existing direction capability. A task such as “increasing and concave down” uses the existing direction capability and the rate-change or concavity capability.

## Proposed source mappings

Use these direct worked-source mappings:

- Existing physical-context graph selection -> `.001`
- Existing increasing, decreasing, and constant interval classification -> `.002`, `.003`, `.004`, `.005`, `.008`, `.009`, `.010`, and `.011`
- Function sign on intervals -> `.003`, `.004`, `.005`, and `.010`
- Rate-of-change sign from graphs -> `.006` and `.012`
- Rate change and concavity on intervals -> `.003`, `.004`, `.007`, `.008`, `.011`, and `.012`

Do not map `.001` to a variable-role mastery claim. Do not map `.012` to the direction capability only because positive rate implies increasing behavior. Its explicit requested actions are rate sign and change in rate.

Examples 3, 4, 5, 8, 10, and 11 assess more than one capability. Preserve many-to-many mappings. Keep all new relationships draft.

## Interval-classification pilot review

The selected pilot targets only the existing interval-direction skill. This target is correct.

The Worked and Guided graph uses points `(0,1)`, `(3,7)`, `(7,2)`, and `(9,6)`. It increases on `[0,3]` and `[7,9]`. It decreases on `[3,7]`. It has no constant interval. Original Example 2 has the same change points and direction pattern with points `(0,-2)`, `(3,4)`, `(7,1)`, and `(9,3)`.

The saved Independent example uses `(0,5)`, `(2,8)`, `(4,8)`, and `(8,6)`. It increases on `[0,2]`. It is constant on `[2,4]`. It decreases on `[4,8]`. This variant adds an authored zero-change case. The reviewed CED Topic 1.1 pages do not state constant behavior explicitly. It is authored extension content. It is not a recovered Passwater worked example.

Add original Example 9 to the blueprint because it directly asks for decreasing intervals. Other direct direction examples can support the source-only capability record. They do not have to become pilot mode sources.

The pilot uses closed endpoint notation for adjacent monotonic intervals. This convention can include a shared turning point in both adjacent closed intervals. Keep one explicit convention in the prompt, grader, and worked reasoning.

Learning Objective 1.1.B graph construction remains a coverage gap. The existing source and pilot ask learners to select a graph. They do not establish graph-construction mastery.

The graph remains draft. The generator and three mode specifications do not establish curriculum approval or readiness.

## Relationship review

Add draft `contains` edges from `math.precalc.lesson.1.1` to the two existing skills and the three accepted new candidates. At review start, the graph contained the two worked examples but did not contain either Topic 1.1 skill. The repair adds the five capability containment edges.

Keep the two existing draft `supports` edges:

- `.001` supports physical-context graph selection.
- `.002` supports interval reading.

Add only the source-to-capability support relationships in the source-mapping section. Keep all of them draft.

Keep the reviewed prerequisite from interval classification to `math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs`. A change from increasing to decreasing behavior supplies evidence for a relative extremum.

Do not add a prerequisite from Topic 1.1 to every Topic 1.2 capability. Course order does not prove a hard prerequisite. Do not add equivalence edges among function sign, function direction, rate sign, and rate-change direction.

## Reviewed baseline source defects

At review start, the lesson had vocabulary errors. An independent variable is not a domain. A dependent variable is not a range. The domain is the set of input values. The range is the set of output values.

At review start, the extracted lesson introduced a ball-height table, a table for `g`, a temperature table, and an Independent table for `p`. These items do not occur in the original Topic 1.1 pages. The repair labels them as authored practice.

The ball table gives a negative height at 3 seconds. For a physical height above the ground, restrict the model to the time before the ball reaches the ground. The table fits `h(t)=-24t^2+60t+6`, which reaches height zero at `t=(5+sqrt(29))/4`, approximately `2.60` seconds. Alternatively, define height relative to another reference level. Do not imply that the physical ball travels below the ground.

The repair preserves the baseline warning that a finite table gives sampled values and does not prove behavior between entries.

The repair restores the 12 original example identities and complete accessible graph descriptions. Preserve the exact distinctions among function sign, function direction, rate sign, rate-change direction, and concavity.

## Authorized bounded repair

1. Preserve the two existing skill IDs and source IDs `.001` and `.002`.
2. Restore draft source identities `.003` through `.012` from original Examples 3 through 12.
3. Add the three accepted candidates as draft and inactive nodes.
4. Add source-only draft blueprints for the three candidates. Do not add placeholder mode specifications.
5. Add five draft lesson containment relationships and the exact draft support relationships in this review.
6. Add `.009` to the selected interval-classification blueprint. Keep broader direct source mappings in the source-only record.
7. Set `independentPracticeReady` to false on both draft Topic 1.1 skills.
8. Correct the CED objective references, vocabulary definitions, authored-content labels, ball model domain, and recovered example content.
9. Keep the current pilot draft and unavailable. Add no approval, generator, prerequisite, equivalence, or readiness claim.

## Author repair result

The bounded repair adds three draft and inactive capability rows. It restores worked-example identities `.003` through `.012`. It adds exact draft source support and lesson containment. It keeps the reviewed interval-to-extrema prerequisite unchanged.

The repair adds source-only blueprints for the three new capabilities. These blueprints have no mode specifications and produce no activity or SRS projection. The graph integrity test now treats this as a valid draft lifecycle. It still rejects a source-only blueprint when the blueprint is reviewed, the node is ready, a source identity is missing, or an authored mode specification is empty.

The repair sets both existing Topic 1.1 nodes to `independentPracticeReady: false`. Their existing generators and mode content remain in the catalog. Their stored SRS rows now record `generatorReady: false`. The activity rows remain unavailable for SRS.

The repair corrects the lesson vocabulary. It labels the added tables as authored practice. It adds the physical domain limit for the ball model. It restores the original givens and checked solutions for Examples 1 through 12.

Learning Objective 1.1.B graph construction remains a coverage gap. The current source asks the learner to select a graph. It does not provide direct construction evidence. The constant interval in the Independent pilot is an authored zero-change case. The reviewed CED pages and Passwater examples do not give direct constant-segment support.

## G31 legacy identity and lifecycle correction

The repair restores `math.precalc.skill.1.1.describe-covariation-in-tandem-change` as a rejected historical identity. The row preserves the original title, description, source references, metadata, and renderer key. It sets `independentPracticeReady` to false. Its exception states that the action duplicates interval-direction classification and has no distinct source task.

The rejected row has no blueprint, edge, activity, active SRS row, or teacher-evidence row. The projector retains one inactive SRS planning row with `generatorReady: false`. Evidence does not transfer from the rejected identity to the physical-context or interval-direction skills.

A source-only draft blueprint can produce an inactive SRS planning row. This row is valid when `generatorReady` is false. It must not produce an activity row. The lifecycle test now checks the projected SRS rows from the canonical nodes, edges, and blueprints. It rejects reviewed source-only blueprints, ready source-only nodes, active source-only SRS rows, missing sources, and incomplete authored mode specifications.

## G31 SRS projection synchronization

The stored combined and standalone SRS projections previously contained two Topic 1.1 rows: interval classification and physical-context graph selection. The synchronized projection contains six Topic 1.1 rows. It includes the rejected legacy identity, the three source-only draft candidates, and the two existing draft skills. All six rows have `generatorReady: false`.

The repair derives these six rows through `projectSrsInputs`. It changes no other-topic SRS row. It adds no activity for a source-only or rejected node. It adds no teacher evidence.

The accessible source description now states that Examples 2 and 9 use straight segments. The descriptions for Examples 11 and 12 now state the source-derived concavity arcs. These details make the interval conclusions follow from the described figure.
