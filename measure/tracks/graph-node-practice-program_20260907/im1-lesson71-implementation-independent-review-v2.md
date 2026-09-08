# IM1 G33 implementation independent review v2

## Disposition

The revised candidate is ready for bounded source-inventory integration. The author corrected both prior P1 findings. I found no remaining source, mapping, lifecycle, or projection blocker.

This disposition does not approve a node, blueprint, relationship, generator, activity, or standard alignment. All new content remains draft and inactive.

## Source fidelity

The extracted Lesson 7-1 now retains the full learner action and complete givens for Problems 1-51. I compared the revised text with `Int1_0701_practice.docx` and the prior source review.

The revised lesson restores the contextual facts and modeling instructions for Problems 17, 18, 28, 29, 41, 43, and 51. Problems 17 and 18 again require variable definition and system construction. The equations and checked solutions remain separate reference content.

Problems 30-39 now include all ten systems. Their pairings match the DOCX table layout. Problems 19-27 retain the requested graphing, exact calculation, and nearest-hundredth actions. Problems 40 and 42 retain the graph-window reasoning. Problems 44-50 retain the three-line, construction, classification, and graph-method reasoning.

The verified mathematics remains correct. This includes the decimal-system solutions, the nonintegral bookstore result, the `(400,481)` hidden intersection, the 600-foot race result, the 20-minute walk and 5-minute bicycle result, and the common solution `(-2,3)`.

## Figure accessibility

The lesson now describes all five source figures.

- Figure 1 identifies four geometric lines, six equation labels, and both coincident pairs.
- Figure 2 identifies the axes, both business lines, and their parallel relation.
- Figure 3 explains the restricted calculator window and hidden intersection.
- Figure 4 lists all four displayed systems and states the defensible “does not belong” result.
- Figure 5 preserves Francisca's and Alan's statements and gives the correct price conditions.

The descriptions support the learner actions. They do not invent a new graph equation or source prompt.

## Source identities

All seven stable worked-example IDs remain unchanged in `nodes.json`, `draft-nodes.json`, `edges.json`, and `standard-edges.json`.

Each node now cites the exact DOCX heading and the matching extracted lesson heading. The titles cover “Examples 1 and 2” through “Example 10.” The old 1-7 catalog positions are now named `historicalExampleNumber`. They no longer claim current worksheet numbering.

All seven changed source nodes are draft in the four catalogs.

## Capability and relationship scope

The 12 capability candidates match the accepted operation boundaries. The eight worked-backed candidates use the approved source-node mapping. The four mixed-only candidates have empty `sourceNodeIds` and exact lesson references.

All 12 candidates are draft and `independentPracticeReady: false`. Their blueprints are source-only. They contain no Worked, Guided, or Independent mode specification.

The graph adds 13 draft `contains` edges. Twelve target the new candidates. One reuses the existing single-line graphing capability. It adds no prerequisite, equivalence, evidence-transfer, or standard edge. It preserves every old node ID and graph edge ID.

## Derived artifacts

The standard-edge artifact keeps its 931 alignment edges. The practice projection removes only the three legacy 7a placeholder activities. It changes no other practice activity.

The SRS projection adds 12 inactive planning rows. It changes only the legacy 7a row to `generatorReady: false`. The teacher projection adds 12 unavailable planning rows. The reported candidate, blueprint, gap, activity, and projection totals match the files.

## Verification

The focused Lesson 7-1 suite passes five tests. I also checked the substantive source content directly because the test suite alone cannot establish worksheet fidelity.

## Final legacy alignment correction

I verified the final correction after the v2 review. The legacy 7a blueprint retains its two pre-existing alignment references:

- `math.standard.ccss.8-ee-c-8`
- `math.standard.ccss.a-rei-d-10`

This is the correct preservation behavior. The source repair does not provide a basis to remove the established broad-node alignments. The correction adds no standard edge and gives no alignment to a new atomic candidate.

The legacy blueprint remains draft and source-only. It has no mode specification or renderer. Its practice activity count is zero. Its SRS row remains `generatorReady: false` with no prerequisites. The retained standards appear only in the inactive SRS planning row and teacher planning row. They do not activate practice, SRS delivery, readiness, equivalence, or evidence transfer.
