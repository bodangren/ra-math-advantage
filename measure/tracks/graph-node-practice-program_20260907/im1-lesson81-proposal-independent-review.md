# IM1 Lesson 8-1 proposal independent review

## Decision

Revise the capability proposal before implementation.

The source restoration scope and the verified mathematics are correct. The proposed graph split needs two changes. Split the combined feature capability into three observable actions. Keep Problem 16 as a manual composite task. Do not create one mastery node for its coordinated comparison.

The corrected scope has eight new draft capabilities. It reuses the existing 8a capability and the existing 8e capability.

## Source verification

I reviewed both original pages:

- `/tmp/int1_0801_review_20260908/page-1.png`
- `/tmp/int1_0801_review_20260908/page-2.png`

The source groups are correct:

- Example 1 contains Problems 1 through 5.
- Examples 2 and 3 is one joint heading for Problems 6 through 8.
- Mixed Exercises contains Problems 9 through 19.

The DOCX has five source tables and one blank coordinate grid image. Problems 6, 7, and 9 through 14 require graph artifacts. A restored learner source must keep blank graphing surfaces. It must not include plotted points or solved features.

The numerical checks in the proposal are correct. In particular:

- Problem 8 gives `4000(0.87)^5 = 1993.6836828`, which rounds to `$1,994`.
- Problem 15 gives `1038(1.000134)^(-2000) = 793.988532...`, or about `793.99` millibars.
- The table classifications for Problems 1 through 5 are correct.
- The intercepts, mathematical domains, ranges, and asymptotes for Problems 9 through 14 are correct.
- Problem 14 has range `(3, infinity)` and asymptote `y = 3`.

The context limits are also correct. For Problem 6, use `x >= 0` and `y >= 1000` for the stated waste model. For Problem 7, use `x >= 0` and `0 < y <= 50`. Keep these context ranges separate from the full mathematical range.

## Corrected capability boundaries

### Reuse 8a

Reuse:

`math.im1.skill.8.1.identify-exponential-behavior-from-data-using-common-ratios`

Problems 1 through 5 directly assess this operation. Equal input increments need not equal one. Do not replace this node with the Lesson 8-5 geometric-sequence node.

### New 1: determine the initial value or y-intercept

Use one atomic capability for finding and interpreting the initial value or y-intercept from an exponential equation.

Problems 9 through 14 explicitly ask for the y-intercept. Problems 6 and 7 ask for key features and support the same action in context.

Initial value and y-intercept are one observable value when input zero is in the model domain. The evidence can require a coordinate and a context interpretation when applicable.

### New 2: classify growth or decay

Use one atomic capability for classifying exponential growth or decay from an equation and explaining the base condition.

Problems 6 and 7 support this action through their `Identify key features` prompts. Problem 15(c) directly asks how pressure changes as altitude increases. Problems 9 through 14 do not explicitly ask for growth or decay. Do not map their graphing prompt as direct classification evidence.

Negative leading coefficients require careful language. A base greater than one is a growth factor, but a negative output function can decrease. Define the assessed response so that it distinguishes the base factor from the function's direction of change.

### New 3: determine the horizontal asymptote

Use one atomic capability for determining the horizontal asymptote of an exponential function from its equation or graph.

Problems 9 through 14 explicitly ask for the asymptote. Problems 6 and 7 support this action only through the broad key-features request. Vertical shift is a variant. Problem 14 supplies the required shifted case.

### New 4: graph an exponential function from its equation

Retain the proposed graphing capability.

Problems 6, 7, and 9 through 14 directly require a graph. The graph artifact must show the intercept, curve direction, sign, and approach to the correct horizontal asymptote. A feature list does not prove the graphing operation.

### New 5: determine mathematical domain and range

Retain the proposed mathematical domain-and-range capability.

Problems 9 through 14 explicitly assess this action. Positive, negative, and vertically shifted ranges are variants. Keep this separate from context restrictions.

### New 6: determine and interpret context domain and range

Retain the proposed context-domain-and-range capability.

Problems 6 and 7 directly assess relevant domain and range. Problem 15 supplies a bounded domain as a given. It does not directly ask the learner to determine the domain or range.

### New 7: evaluate and interpret an exponential model

Retain the proposed model-evaluation capability.

Problems 8 and 15(b) directly assess substitution, numerical evaluation, units, and required rounding. Problem 15(a) also assesses the initial value, but it is not a separate evaluation capability.

### New 8: justify x-intercept behavior

Retain the proposed x-intercept justification capability.

Problem 18 directly assesses the general claim for `y = ab^x`, with `a != 0`, `b > 0`, and `b != 1`. Evidence must use the fact that `b^x` is positive. One graph is not sufficient evidence.

## Manual composite tasks

Problem 16 is a coordinated manual comparison. It requires tables, graphs, intercepts, symmetry, end behavior, extrema, monotonic intervals, and sign intervals for parameter-dependent functions. These are multiple observable operations. Do not create the proposed single comparison mastery node. Record Problem 16 as a manual composite source task. Map exact child capabilities only when the learner response supplies evidence for those child actions.

Problem 19 is also a manual composite source task. It combines context creation, model construction, graphing, feature analysis, and justification against a linear model. Do not project the full response to one atomic node.

## Existing 8e reuse and nonunique grading

The exact current ID is:

`math.im1.skill.8.3.write-an-exponential-function-given-two-points-on-its-graph`

Its current title and description do not restrict the response to `ab^x`. Problem 17 also does not state that restriction. Therefore, `y = 3(2^x)` is one valid answer, but it is not unique when a vertical shift is allowed. For example, the two points can fit other exponential functions of the form `ab^x + c` for permitted values of `c`.

The source still assesses the operation named by the existing 8e capability. Reuse can be defensible, but the evidence and grading policy must accept the nonunique family or use manual review. Do not encode `y = 3(2^x)` as the only correct answer. Do not add a source restriction that the worksheet does not contain.

## Source identities and relationships

Retain `.001` for Example 1 and `.002` for the joint Examples 2 and 3 source. Preserve `.003` as a rejected inactive historical duplicate with no direct mapping or lesson containment.

Add draft `contains` edges for the eight new capabilities and the one 8e reuse. Preserve the existing 8a containment. Do not add a containment for a new Problem 16 composite node because that node must not be created.

Do not add prerequisite or equivalence edges in this source batch. Keep edge 1264 absent after G37. Do not transfer evidence between 8a and the Lesson 8-5 geometric-sequence capability.

## Corrected bounded inventory

The revised batch has:

- Eight new draft and inactive skill candidates.
- One repaired existing 8a skill.
- One reuse of the existing 8e skill with nonunique grading.
- Two canonical source rows, `.001` and `.002`.
- One rejected inactive historical duplicate, `.003`.
- Nine new draft lesson containments: eight new skills and one 8e reuse.
- One existing 8a containment retained.
- Two manual composite source gaps: Problems 16 and 19.
- No new prerequisite, equivalence, generator, activity, approval, or evidence-transfer row.

## Test corrections

Add these checks to the proposed tests:

1. Verify three separate feature nodes for initial value, growth or decay, and horizontal asymptote.
2. Verify that Problems 9 through 14 map to initial value and asymptote, but do not map as direct growth-or-decay evidence.
3. Verify that no single Problem 16 comparison node exists.
4. Verify that Problem 17 does not have a unique-answer grading claim.
5. Verify that `y = 3(2^x)` remains an accepted example and not the only accepted family.
6. Verify all five source tables and every blank graphing surface.
7. Preserve the proposal's source equations, units, rounding, context-domain limits, source identities, draft lifecycle, and unrelated graph invariants.
