# IM1 Lesson 8-2 proposal independent review

## Decision

Revise the proposal before implementation. The source repair boundary is correct. The graph proposal has source math errors, duplicate capability candidates, and incorrect direct evidence references.

## P1 findings

### Correct the equations for Problems 15 and 40

Problem 15 has horizontal asymptote `y = 5` and y-intercept `6`. Its equation is `y = 2^(-x) + 5`. The proposal gives `+4`.

Problem 40 passes through `(1, 1)` and `(0, 5)`. Its equation is `y = 5^(1 - x)`. The proposal gives `5^(2 - x)`.

Use the original graph assets as authority. Add exact graph-point and asymptote assertions. A title or visual-shape assertion is insufficient.

### Do not state that both claims in Problem 47 are wrong

`g(x) = 2(2^x) = 2^(x + 1)`. James is wrong because the horizontal shift is left 1 unit, not left 2 units. Jennifer's statement can be correct if “rises more rapidly” means absolute output increase or absolute rate of change. The multiplicative growth factor remains 2. A reviewed answer must state the metric. It must not require “neither is correct.”

### Remove Problem 16 from the manual-composite list

Problem 16 asks the same graph-to-equation operation as Problems 13 through 15. It does not ask for a broad table comparison. Keep it in the repaired 8d source scope.

## Capability boundary corrections

Use eight new atomic candidates, not eleven.

Keep these five equation-to-description atoms:

1. Describe vertical translations.
2. Describe horizontal translations.
3. Describe reflections.
4. Describe vertical dilations.
5. Describe horizontal dilations.

Keep these three other operations:

6. Write a transformed exponential equation from a verbal description.
7. Justify equivalent exponential transformations with exponent properties.
8. Determine and justify the common point of two exponential functions.

Remove the proposed composition candidate. Problems 5 through 8, 12, 42, and 43 assemble the listed atomic operations. The source does not assess a separate ordered-composition method. Keep the complete response as a manual composite while its component atoms retain their source evidence.

Remove the proposed context-dilation candidate. Problems 17 through 20 ask the learner to describe or apply the same vertical factor operation. Context and units change the representation. They do not create a new assessed operation. Map `.006` to the vertical-dilation atom.

Remove the proposed changed-initial-value candidate. Problem 20(a) asks the learner to write a transformed equation from a verbal context. This is a direct instance of the verbal-description-to-equation capability. Map `.006` to that capability and preserve Problem 20(a) as exact source evidence.

The repaired legacy 8d skill remains a separate stable operation: write an equation from a graph. The broad legacy 8c row can remain a draft inactive aggregate with no evidence role.

## Correct direct source scopes

Use these direct scopes for the five description atoms:

- Vertical translation: Problems 1, 6–8, 12, 21, 24, and 42–43. Problem 11 is not a vertical translation.
- Horizontal translation: Problems 5, 11, 42–43, 45, and 47.
- Reflection: Problems 2, 5–8, 23, 25–26, 42–43, and 46.
- Vertical dilation: Problems 9–10, 17–20, 22–23, 26, 42–43, and 46. Exclude Problem 41. Its two curves differ by a vertical translation of about 500 dollars.
- Horizontal dilation: Problems 3–4, 35–36 only when they are used as verbal input to the equation-writing operation, plus 42–43 and 46 for description. Problems 35–36 do not directly assess description.

Problems 27 through 36 explicitly ask students to write equations. Do not cite Problems 27 through 36 as direct evidence for the description atoms. Cite them only for the verbal-description-to-equation skill. Problem 20(a) also supports that skill.

Problem 12 is a vertical translation down 5. It is not direct evidence of a composition. Problem 11 is a horizontal translation right 3.

Map `.004` to the five equation-description atoms. Map `.005` only to repaired 8d. Map `.006` to vertical dilation and verbal-description-to-equation. Mixed-only atoms can use exact problem references without a false worked-example mapping.

## Existing capability reuse

The two proposed G38 reuses are defensible:

- `math.im1.skill.8.1.graph-an-exponential-function-from-its-equation` for Problems 42–43.
- `math.im1.skill.8.1.evaluate-and-interpret-an-exponential-model-at-a-given-input` for Problem 20(c).

Problem 20(c) remains a manual composite because it requires two evaluations and a difference.

Do not reuse 8e. Lesson 8-2 does not ask the learner to determine an exponential function from two supplied points.

## Graph relationships and lifecycle

The proposed removal of `math.im1.edge.1265` and `math.im1.edge.1266` is defensible. Both are low-confidence sequence-derived prerequisites. Neither relation is required by the source operation.

For the revised scope, add eight new capability containments and the two valid G38 reuse containments. Preserve existing source and legacy containments after their exact corrections. Add no new prerequisite or equivalence edge.

Keep all changed source rows, repaired legacy rows, and new rows draft and inactive. Remove only the six placeholder activity rows from the two legacy empty bundles. Add inactive planning SRS rows with `generatorReady: false`. Add no evidence row.

## Source restoration requirements

Restore all 50 prompts and all listed figures. Preserve the complete Problem 20 context and subparts. Preserve all three pairs in Problem 49 and all four open subparts in Problem 50. Do not include the verified answers in learner content.

Page 4 is blank in the rendered source. The content continues on page 5. Tests must use the original problem numbers and source assets rather than sequential embedded-image order assumptions.

## Bounded implementation summary

- Three corrected draft source rows: `.004`, `.005`, and `.006`.
- Legacy 8c becomes draft, inactive, and source-only.
- Legacy 8d becomes draft and inactive with exact `.005` evidence.
- Eight new draft inactive skills.
- Two existing G38 reuses.
- Ten new lesson capability containments: eight new and two reused.
- No new prerequisites, equivalence claims, activities, or evidence mappings.
- Remove prerequisite edges `1265` and `1266` and their derived SRS copies.
- Keep Problems 20(c), 41, 46, 48, 49, and 50 as manual composite or open tasks. Problem 16 is not in this list.

## Final revision disposition

The revised proposal resolves all prior findings. I accept the eight-new-atom scope for graph authoring.

The direct references now match the assessed operations:

- Problem 11 supports only horizontal translation right 3.
- Problem 12 supports only vertical translation down 5.
- Problem 42 supports horizontal and vertical translation plus vertical dilation. It does not support reflection or horizontal dilation.
- Problem 43 supports x-axis and y-axis reflections, vertical dilation, and vertical translation. It does not support horizontal dilation.
- Problems 27 through 36 support equation writing only.
- Problem 41 remains a manual graph task.
- Problem 45 alone directly supports the exponent-property equivalence capability.
- Problem 47 remains a manual explanation because its comparison metric is ambiguous.

The relative descriptions for Problems 7 and 8 are correct. Problem 7 can be described as reflection across the y-axis followed by translation up 4. Problem 8 can be described as reflection across the x-axis followed by translation up 5. The source repair must permit equivalent valid orders when the transformations commute or when the learner states the reference function clearly.

Problem 20(a) correctly maps `.006` to the verbal-description-to-equation skill. Problems 17 through 19 and 20(b) map `.006` to the vertical-dilation skill. No composition, context-only dilation, or changed-initial-value duplicate remains.

The corrected equations for Problems 15 and 40 remain in the proposal. The final lifecycle and relationship scope also remain correct: eight new draft inactive skills, repaired 8d, two G38 reuses, no new prerequisite or equivalence edge, and removal of edges `1265` and `1266`.
