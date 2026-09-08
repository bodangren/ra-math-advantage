# IM1 Lesson 8-2 source and capability proposal

## Decision

Lesson 8-2 needs a bounded source repair before activity authoring. The current lesson summarizes the worksheet. It omits most of the 50 prompts and all source figures. It also gives answers for several examples. The repair must restore the learner prompts and remove the answers from learner content.

The graph must keep all stable identifiers. It must change the three current source nodes to draft because their titles and source claims will change. It must keep the two legacy skill identifiers. The broad 8c skill must remain draft and inactive as a planning aggregate. The graph-specific 8d skill can remain the stable identifier for one exact atomic operation after source correction.

## Source evidence

I read `Int1_0802_practice.docx`. I rendered and inspected all five pages in `/tmp/int1_0802_review_20260908`. Page 4 is intentionally blank.

The source has these groups:

1. `Examples 1–3, 6–7, 10–12`, Problems 1–12. Students describe transformations from equations.
2. `Examples 4–5, 9`, Problems 13–16. Students write equations from four graphs relative to `y = 2^x`.
3. `Example 8`, Problems 17–20. Students interpret and apply transformations in savings, caffeine, visitors, and depreciation contexts.
4. `Mixed Exercises`, Problems 21–50. Students describe transformations, write equations, use graphs, and complete open reasoning tasks.

### Stable source identities

Preserve these identifiers and correct their content:

- `math.im1.example.8.2.004`: `Examples 1–3, 6–7, and 10–12: Describe exponential transformations from equations`. Use exact source location `Int1_0802_practice.docx (Examples 1–3, 6–7, and 10–12; Problems 1–12)`.
- `math.im1.example.8.2.005`: `Examples 4–5 and 9: Write transformed exponential equations from graphs`. Use exact source location `Int1_0802_practice.docx (Examples 4–5 and 9; Problems 13–16)`.
- `math.im1.example.8.2.006`: `Example 8: Interpret and apply dilations in exponential contexts`. Use exact source location `Int1_0802_practice.docx (Example 8; Problems 17–20)`.

These are three different source groups. Do not reject or merge them. Set all three source rows to `draft` in each node copy. Set `independentPracticeReady` to `false`. The rewritten source requires curriculum review before approval.

## Required source repair

Restore all 50 numbered learner prompts. Preserve all equations, directions, subparts, units, and context data. Do not put verified answers in the learner prompts.

Restore the source figures for Problems 13–16, 20, 37–41, 49, and 50. Use the original embedded images without modification. Add accessible descriptions that state visible axes, scale, points, asymptotes, line style, and curve direction. The descriptions must not state the requested equation or conclusion.

Problems 42 and 43 require space or a blank grid for the student graph. Preserve both equations and the request to describe the transformation.

Problem 49 contains three displayed pairs. Preserve all three pairs. The first pair differs from the other two in horizontal direction. Do not disclose that result in learner content.

Problem 50 shows a decay parent graph. It permits many correct transformed functions. Keep all four open subparts. Do not require one transformed equation.

Remove the current `Review Notes`. Remove source limitations from learner content. Keep verified mathematics in tests and review records.

## Mathematical verification

Use these results only in tests and author review:

- Problem 13 is `y = -2^x`.
- Problem 14 is `y = 2^(x - 3)`.
- Problem 15 is `y = 2^(-x) + 5`. The original graph has y-intercept 6 and horizontal asymptote 5.
- Problem 16 is `y = 2^(x + 3) + 4`.
- Problem 17 is a vertical stretch by 2000 from `1.0125^x`.
- Problem 18 is a vertical compression by `1/4` from the coffee model.
- Problem 19 is a vertical stretch by 20. The first-month wording requires the source interpretation of `x`.
- Problem 20(a) is `h(x) = 20000(0.85)^x`. Problem 20(c) is `8000(0.85)^5`, approximately `3549.64` dollars.
- Problem 37 is `y = 5^x - 2`.
- Problem 38 is `y = -5^x + 3`.
- Problem 39 is `y = 5^(x - 4)`.
- Problem 40 is `y = 5^(2 - x)`. The original graph passes through `(1, 5)` and `(2, 1)`.
- Problem 41 shows a vertical translation of 500 dollars. The antique value is approximately 500 dollars from the graph.
- Problem 44 has intersection `(0, 4)` because `2^x = 5^x` only at `x = 0`.
- Problem 45 compares identical functions because `4^(x + 2) = 16 * 4^x`.
- Problem 46 distinguishes an outside negative factor from a negative exponent factor. The outside factor reflects across the x-axis and scales outputs. The exponent factor reflects across the y-axis and changes horizontal scale.
- In Problem 47, `2(2^x) = 2^(x + 1)`. The graph is the parent shifted left 1 unit, so James is incorrect. Jennifer can be correct if “rises more rapidly” means larger absolute increases over equal input intervals. Both functions have the same multiplicative growth factor. The wording does not specify that metric. Do not require the answer that both claims are false. Use a teacher-reviewed explanation.
- Problem 48 is an open parameter-constraint argument. The vertical shift and equivalent base/exponent representations make a single short answer unsafe without a reviewed rubric.
- Problems 49 and 50 permit multiple justified responses.

## Proposed atomic capabilities

Keep the legacy 8c identifier as a broad draft and inactive aggregate:

- `math.im1.skill.8.2.describe-transformations-of-exponential-functions-verbally-a`

Remove its empty mode specifications and renderer claim. Give it a source-only draft blueprint with no exact source node. Do not use it for evidence.

Repair and retain this exact legacy skill:

- `math.im1.skill.8.2.write-equations-for-transformed-exponential-functions-given`
  - Title: `Write an equation for a transformed exponential function from its graph`.
  - Evidence: source `.005`, Problems 13–16. Mixed Problems 37–40 also assess it.
  - Status: draft and inactive.

Add these eight draft and inactive skill candidates:

1. `math.im1.skill.8.2.describe-vertical-translations-of-exponential-functions-from-equations`
   - Direct problems: 1, 6-8, 12, 21, 24, 42, and 43.
   - Source evidence `.004` for Problems 1, 6-8, and 12.
2. `math.im1.skill.8.2.describe-horizontal-translations-of-exponential-functions-from-equations`
   - Direct problems: 5, 11, and 42.
   - Source evidence `.004` for Problems 5 and 11.
3. `math.im1.skill.8.2.describe-reflections-of-exponential-functions-from-equations`
   - Direct problems: 2, 5-8, 23, 25-26, 43, and the two cases in 46.
   - Source evidence `.004` for Problems 2 and 5-8.
4. `math.im1.skill.8.2.describe-vertical-dilations-of-exponential-functions-from-equations`
   - Direct problems: 9-10, 17-19, 20(b), 22-23, 26, 42-43, and the outside-factor case in 46.
   - Source evidence `.004` for Problems 9-10 and `.006` for Problems 17-19 and 20(b).
   - The contextual factor descriptions use this same operation. Do not add a context-only duplicate.
5. `math.im1.skill.8.2.describe-horizontal-dilations-of-exponential-functions-from-equations`
   - Direct problems: 3-4 and the exponent-factor case in 46.
   - Source evidence `.004` for Problems 3-4.
6. `math.im1.skill.8.2.write-a-transformed-exponential-equation-from-a-verbal-description`
   - Direct problems: 20(a) and 27-36.
   - Source evidence `.006` for Problem 20(a). Problems 27-36 are mixed exercises.
   - The changed initial value in Problem 20(a) is a scaling variant of this operation.
7. `math.im1.skill.8.2.justify-equivalent-exponential-transformations-using-properties-of-exponents`
   - Direct problem: 45.
   - This is mixed-only. Use no source example mapping.
   - This capability records an exponent-law argument. It does not create a graph-node equivalence edge.
   - Problem 47 remains a manual explanation because its comparison metric is ambiguous.
8. `math.im1.skill.8.2.determine-and-justify-the-common-point-of-two-exponential-functions`
   - Direct problem: 44.
   - This is mixed-only. Use no source example mapping. Require the coordinate and reasoning.

Do not add a composition capability for a response that assembles the existing transformation descriptions. Check each requested component separately. A correct whole response does not automatically establish every component capability.

Problems 27-36 ask the student to write an equation. Do not cite them as direct evidence for describing a transformation from an equation. Problem 41 uses graphs and remains a manual source task. It is not a dilation task and does not directly assess a description from an equation.

Do not split each sign, direction, or scale factor into another skill. These are variants within the listed operation.

## Exact reuse

Add lesson containment for these existing reviewed boundaries when G38 is present:

- `math.im1.skill.8.1.graph-an-exponential-function-from-its-equation` for Problems 42–43.
- `math.im1.skill.8.1.evaluate-and-interpret-an-exponential-model-at-a-given-input` for Problem 20(c).

Problem 20(c) combines two evaluations and a difference. Keep the full response as a manual composite unless a reviewed multi-part activity can preserve both evaluations and the comparison.

Do not reuse linear, absolute-value, or geometric transformation skills. They share language but do not prove exponential transformation reasoning.

## Manual composite and open tasks

Keep these as manual source tasks until a reviewed rubric exists:

- Problem 20(c): two model evaluations and a value difference.
- Problem 41: graph-based transformation description and extrapolation.
- Problem 46: two transformation cases with justification.
- Problem 47: ambiguous absolute-versus-relative growth explanation.
- Problem 48: parameter constraints for a growing deficit model.
- Problem 49: open visual classification and justification.
- Problem 50: open model creation, transformation description, and graph.

Problems 42 and 43 are assembled tasks. They exercise graphing and several transformation atoms. Do not add a duplicate bundled skill.

## Graph and projection changes

- Preserve all existing stable node and edge identifiers except the two unsupported sequence prerequisite edges listed below.
- Retain the three source containment edges after source correction.
- Retain containment for legacy 8c and repaired 8d.
- Add eight containment edges for the new atomic skills.
- Add two containment edges for the exact reused G38 skills.
- Add no prerequisite or equivalence edge for the new skills.
- Remove `math.im1.edge.1265`. Common-ratio classification is not required to describe a supplied transformation.
- Remove `math.im1.edge.1266`. Writing an equation from a transformed graph is not required to apply the compound-interest formula.
- Recompute every affected downstream SRS prerequisite copy with the existing projector.
- Remove the six placeholder activity rows emitted by the two empty legacy blueprint bundles.
- Preserve inactive SRS planning rows for legacy 8c and repaired 8d.
- Add inactive planning rows for the eight new skills. Set `generatorReady` to `false`.
- Add no activity or exact evidence row. A source example does not prove a reviewed three-mode activity.
- Preserve historical standard alignments. Do not create new standard alignments from this review.

## Required tests

1. Parse all 50 problem sections from the restored lesson.
2. Assert each source equation, table, subpart, unit, and context value.
3. Assert the source assets and accessible descriptions for Problems 13–16, 20, 37–41, 49, and 50.
4. Assert no verified answer appears in learner prompts.
5. Assert the three stable source IDs have the exact corrected groups in all node copies.
6. Assert legacy 8c remains draft, inactive, source-only, and without activity rows.
7. Assert repaired 8d maps only to source `.005` and remains inactive.
8. Assert all eight new skills are draft, inactive, source-only, and have exact problem references in every node copy.
9. Assert exactly one lesson containment for each new and reused skill.
10. Assert Problems 20(c), 41, 46-50 do not receive false exact activity or evidence mappings.
11. Assert edges `1265` and `1266` are absent from the graph and both SRS projections.
12. Run the full curriculum, coverage matrix, audit, lint, build, and post-build TypeScript checks.

## Expected bounded scope

The source batch changes the Lesson 8-2 text, extracted source assets, and one source test. The graph batch changes the four node copies, blueprints, contains/prerequisite edges, the gap queue, coverage matrix, activity projection, SRS projections, rollout audit, and one graph test.

This proposal does not approve the source, add a renderer, claim generator readiness, or activate evidence.

## Parent and independent review corrections

The corrected scope has eight new capabilities, repaired stable 8d, and two G38 reuses. Legacy 8c remains an inactive aggregate. Problem 16 is a graph-to-equation task under 8d. It is not the Lesson 8-1 comparison problem. The initial composition, context-dilation, and changed-initial-value candidates duplicated existing operations in this proposal.

The parent viewed all four nonblank source pages and the original graph assets. Problem 15 uses `image3.png`. Problem 40 uses `image10.png`. The corrected equations above follow those assets. Problem 41 uses `image8.JPG`, while Problem 39 uses `image9.png`. File order does not match problem order.

Problem 11 is a horizontal translation right 3. Problem 12 is a vertical translation down 5. Problem 42 has no reflection or horizontal dilation. Problem 43 has a reflection, vertical dilation, and vertical translation, but no horizontal dilation. For Problem 8, one valid relative description is reflection across the x-axis followed by translation up 5. For Problem 7, one valid description is reflection across the y-axis followed by translation up 4. Preserve equivalent valid descriptions with a stated order.

The parent withdrew the earlier Problem 40 correction after checking the original grid coordinates. The curve crosses the y=1 grid line at x=2. The original proposed exponent `2 - x` is correct.
