# IM1 Lesson 7-4 proposal independent review

## Disposition

The proposal is suitable for bounded authoring after one required naming correction. The six new capability boundaries are distinct. The six reuse mappings use existing operations and do not create duplicate capabilities.

The proposal correctly keeps all new rows draft and inactive. It also limits the change to source-only blueprints and draft `contains` edges. It does not infer prerequisite, equivalence, alignment, renderer, generator, or evidence-transfer approval.

## Required correction

Revise the Problem 24 capability name and description. The worksheet does not give a fully known solution. It gives `(3, a)`. Thus, the learner knows the `x` coordinate and must find the missing `y` coordinate before the learner can find parameter `b`.

Use a title such as `Determine a missing solution coordinate and equation parameter from a partially specified system solution`. State the two required operations in the evidence boundary:

1. Substitute `x = 3` into `4x + 5y = 2` to find `a = -2`.
2. Substitute `(3, -2)` into `6x - 2y = b` to find `b = 22`.

Do not describe `(3, a)` as a known solution without the qualifier `partially specified`. The current suggested title can imply that both coordinates are known.

## Capability boundaries

The following new boundaries are source-supported:

- Scale-factor selection is separate from equation execution. Problems 1-12 and 18 require the learner to choose factors that make coefficients equal or opposite.
- Scaled elimination execution requires transformed equations, equation combination, a one-variable result, and back-substitution. This is more specific than a final ordered pair.
- Problem 21 supports a separate equation-combination diagnostic. Jason correctly subtracts the complete doubled equation. Daniela drops the `16t` term. The proposed correction accurately identifies this error.
- Problem 25 supports method selection and justification. The existing Lesson 7-2 node selects an expression after substitution is already selected. It does not duplicate this method-choice action.
- Problem 23 supports construction for a specified multiplier. Its answer is nonunique. The proposed structural evidence boundary is necessary.
- Problem 24 supports the corrected missing-coordinate-and-parameter boundary described above.

The six reuse mappings are also defensible. Context writing and interpretation apply to Problems 13-17, 19, and 20. Problem 22 can support both solution-set classification and equation-structure analysis. These are two observable operations, but a future evidence design must not award two mastery outcomes from one undifferentiated response. Direct equation combination and back-substitution remain valid Lesson 7-3 reuse after the new scale-factor step.

Problem 23 does not currently justify reuse of the Lesson 7-3 Problem 46 construction work. Problem 46 asks for a system that permits direct addition and asks for a general rule. Problem 23 gives a specific `-3` multiplier constraint. Keep the proposed new Problem 23 capability separate unless a later review broadens one capability with explicit evidence for both tasks.

## Source identity and legacy repair

The source has three groups: joint `Examples 1 and 2` for Problems 1-12, `Example 3` for Problems 13-14, and `Mixed Exercises` for Problems 15-25.

The current graph incorrectly uses `.014` and `.015` for the one joint `Examples 1 and 2` body. Retain `.014` as the joint source. Retain `.015` as a rejected and inactive historical identity. Remove its lesson containment and evidence mappings. Add `.source-003` for the missing `Example 3` body. This preserves stable IDs and removes duplicate source authority.

The legacy 7g node combines scale-factor selection and procedure execution. The proposed draft and inactive status is correct. Its source-only blueprint can retain `.014` and `.source-003` as source evidence. Its empty mode specifications and three placeholder activities do not prove a usable activity and must be removed. Its inactive planning row can remain.

Edge `math.im1.edge.1263` only encodes lesson order. Scaled elimination is not a required operation for graphing systems of inequalities. Remove this edge and reconcile both stored SRS prerequisite copies for the Lesson 7-5 target.

## Verified source facts

The proposal matches the original worksheet text for the reviewed critical items:

- Problem 18 asks for two valid elimination approaches, an explanation of why factors 6 and 5 are not useful, and a solution.
- Problem 21 asks whether Jason or Daniela is correct. Jason's whole-equation subtraction is valid. Daniela's term combination is invalid.
- Problem 22 requires a truth classification and justification about infinitely many solutions.
- Problem 23 requires a nonunique system for multiplication by `-3` followed by addition.
- Problem 24 gives `4x + 5y = 2`, `6x - 2y = b`, and the partial solution `(3, a)`.
- Problem 25 requires an explanation of when substitution or elimination is more helpful.

The numeric results in the proposal are consistent with the source. Problem 19 has exact amounts `10/3` and `20/3` quarts. A future decimal activity must define its rounding rule.

## Authoring boundary

The proposed count is six new draft skill nodes, six new source-only blueprints, and 12 draft lesson containment edges for six new skills and six reuses. The source repair also needs one new Example 3 source node and the retained rejected duplicate `.015`. These source-node containment changes are separate from the count of 12 skill containment edges.

The implementation test must compare old IDs and unrelated edges. It must also verify that `.015` has no blueprint or teacher evidence mapping. It must verify that the Lesson 7-5 SRS rows do not retain the removed 7g prerequisite.

Source review does not approve the repaired lesson content, graph nodes, activities, or readiness. A later review must approve those items separately.
