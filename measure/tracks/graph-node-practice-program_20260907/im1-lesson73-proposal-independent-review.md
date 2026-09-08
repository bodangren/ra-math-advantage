# G35 IM1 Lesson 7-3 proposal independent review

## Result

Revise the proposal before graph authoring. The two new capability boundaries are defensible. The reuse list and legacy-node disposition need corrections.

## New capability boundaries

The operation-choice capability is distinct from execution. It can ask a learner to identify whether addition or subtraction cancels a variable before the learner solves the system. Problem 43(a) directly asks for the first elimination step and its reason. Problem 49 asks when elimination is beneficial. Problems 1 through 27 include both opposite-coefficient and equal-coefficient structures.

The direct-elimination execution capability is also distinct. It requires visible method evidence. A final ordered pair does not prove elimination because graphing, substitution, inspection, and an external solver can produce the same pair.

Do not require two actions that the source does not independently assess:

- Do not require the learner to align terms as separate evidence. The worksheet supplies aligned systems.
- Do not require a check in both original equations as part of this capability. Problems 1 through 27 say only to solve by elimination. A check is a useful instruction or optional verification step. Problem 43(c) separately asks for a graph check.

The minimum required procedure evidence is the equation-combination operation, the resulting one-variable equation, the solved first variable, and substitution for the second variable.

Decimals, fractions, grouped expressions, and preliminary simplification are input variants. They are not separate capabilities.

## Source identity

The four proposed source dispositions are correct.

- `.010` is the one joint `Examples 1, 3` source for Problems 1 through 27.
- `.011` is Example 2 for Problems 28 through 30.
- `.012` is a historical duplicate. Keep it rejected and inactive. Give it no direct source or evidence mapping.
- `.013` is Example 4 for Problems 31 through 32.

Do not split `.010` into invented Example 1 and Example 3 ranges. The DOCX has one joint heading and supplies no boundary.

The checked equations and contextual values in the proposal agree with the DOCX text. The source group also confirms that Problems 1 through 27 are direct-elimination practice.

## Reuse corrections

Do not map Problem 48 to `math.im1.skill.7.2.represent-a-two-digit-number-and-its-digit-reversal-with-lin`. That node requires digit-reversal representation. Problem 48 gives a digit sum and a tens-minus-units condition. It does not use or ask for the reversed number. A mapping would claim evidence for scope that the task does not assess.

Use the existing generic context-system writing and contextual solve-and-interpret capabilities for the supported parts of Problem 48. Record positional digit representation as a remaining gap if the generic nodes do not capture it sufficiently.

Limit `math.im1.skill.7.1.construct-systems-with-a-specified-number-of-solutions` to Problems 44 and 45. Those counterexamples require systems with infinitely many solutions or no solution. It does not cover all of Problems 46 and 47:

- Problem 46 asks for coefficient construction that permits addition and a general rule. It can support the new operation-choice capability.
- Problem 47 requires a second equation with a prescribed common solution and an addition-elimination structure. The existing specified-number-of-solutions node does not express those combined constraints. Keep this as manual mixed work or a recorded coverage gap. Do not claim full-node evidence by title similarity.

The other proposed reuses are defensible when the implementation adds exact draft `contains` edges for each real reuse. Do not list reuse only in the report while omitting it from the graph.

## Legacy 7e disposition and projections

The proposal cannot defer the legacy 7e aggregate while it adds its two atomic replacements. The current copies already conflict:

- canonical `nodes.json` marks the broad 7e node approved;
- the embedded and draft copies mark it draft;
- its blueprint is draft and empty;
- it has three inactive placeholder activity rows;
- it has a standalone SRS planning row.

Make the broad 7e node draft and inactive in all four node catalogs. Keep it as a legacy aggregate. Remove its three empty placeholder activity rows. Keep its SRS projection inactive with `generatorReady: false`, consistent with the G33 and G34 lifecycle.

Review edge `math.im1.edge.1262` explicitly. It connects the broad 7e aggregate to the multiplication-elimination aggregate. The worksheet sequence alone does not prove that broad legacy edge. Do not preserve it automatically under a preserve-all-edges rule. Remove it in this source repair unless a separate semantic review establishes the exact prerequisite scope. Do not replace it with a new prerequisite from either atomic node during this batch.

## Recommended bounded scope

Author two new draft, inactive, source-only capabilities. Map both to `.010`. Add exact Lesson 7-3 `contains` edges for both new nodes and for each valid reused node. Add no new prerequisite, equivalence, alignment, generator, or approval.

Repair all 49 source problems and the four stable source identities. Keep mixed-only tasks available in the lesson even when no exact graph capability covers them. Update the focused test to enforce the corrected method evidence, rejected duplicate, legacy 7e lifecycle, valid reuse edges, and the absence of the unsupported digit-reversal mapping.
