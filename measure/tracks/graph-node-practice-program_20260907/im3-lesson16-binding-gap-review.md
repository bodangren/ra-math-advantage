# IM3 Lesson 1.6 binding gap review

## Result

The committed source records are now exact. The executable graph bindings are not ready for a reviewed learner placement.

The Quadratic Formula skill still names `step-by-step-solver`. The accepted runtime uses the distinct `quadratic-formula` generator, component, response contract, and server grader. The discriminant skill remains a separate capability. Its current blueprint does not cite Examples 4 and 5. It contains placeholder prompts and empty grading data.

All affected skills and source records remain `draft`. This review does not change that status.

## Committed evidence

The review used committed HEAD `0140b02b8cdc274a20d877444f9de066d60ec423`.

### Quadratic Formula skill

The skill is `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations`.

- `curriculum/skill-graph/nodes.json` sets `rendererKey` to `step-by-step-solver`.
- Edge `math.im3.edge.m1.077` points to `math.im3.renderer.step-by-step-solver`.
- The committed canonical and module blueprint catalogs have no blueprint for this skill.
- The canonical and module activity projections have no QF activity row or QF SRS input row.
- `packages/math-content/src/knowledge-space/generators/algebra-generators-adapters.ts` maps the `quadratic-formula` generator to this exact skill ID.
- `apps/integrated-math-3/lib/activities/registry.ts` registers the `quadratic-formula` component.
- The accepted server path grades the fixed `discriminant`, `x1`, and `x2` response fields from private generated data.

The old renderer metadata cannot describe this response contract. A `step-by-step-solver` binding must not be used for a real reviewed QF placement.

### Discriminant skill

The skill is `math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol`.

- Its node uses `discriminant-analyzer`.
- Edge `math.im3.edge.m1.078` points to the matching renderer node.
- Its blueprint uses the QF skill ID as `sourceNodeIds`. It does not cite `.039` and `.040`.
- Its Worked and Guided specifications contain `See curriculum` placeholders.
- Its projected activity rows have empty grading parts and `srsEligible: false`.
- Its SRS row has `generatorReady: false`.
- Its teacher row has `independentPracticeReady: false`.

The renderer name is plausible. It does not establish usable grading, publication, or exact-node evidence. The `.039` and `.040` source records observe two different classifications: a positive non-square discriminant and a negative discriminant. They do not cover the zero or positive-square cases.

### Source and prerequisite relations

The QF source set is `.036`, `.037`, and `.038`. The discriminant source set is `.039` and `.040`. These exact sets belong in blueprint `sourceNodeIds`.

The graph has no lesson-containment edges for the five example nodes. Their standard-alignment edges do not replace capability-source bindings.

Two prerequisite edges require a separate semantic correction:

- `math.im3.edge.m1.062` says that completing the square is a prerequisite for applying the Quadratic Formula. The stated rationale is that completing the square derives the formula. The printed Lesson 1.6 task gives the formula directly. Derivation is related knowledge, but the source does not establish it as a necessary prerequisite for formula use.
- `math.im3.edge.m1.063` says that QF solving is a prerequisite for discriminant classification. Examples 4 and 5 require only coefficient identification, calculation of `b² - 4ac`, and classification. They do not require solving with the formula.

Do not use these sequence-derived edges to claim readiness. The minimum graph review should remove them unless another accepted source establishes necessity. It must update both prerequisite projections through the real projector.

## Minimum graph binding batch

Use one bounded graph batch before learner placement.

1. Add a graph renderer identity for the already registered `quadratic-formula` component in each node-bearing catalog that stores renderer nodes.
2. Change the QF skill `rendererKey` and rendered-by edge from `step-by-step-solver` to `quadratic-formula` in each canonical and embedded copy.
3. Add one QF blueprint to both blueprint catalogs. Bind it only to `.036`, `.037`, and `.038`.
4. Represent only the accepted Guided and Independent QF modes. Keep the source Worked examples as inline text. Do not create a physical Worked activity.
5. Keep private generator data out of public props. Use the existing private stored variant and server-owned submission contract.
6. Correct the discriminant blueprint source IDs to exactly `.039` and `.040`.
7. Replace the discriminant placeholder specifications only after a separate response and grading contract is accepted. Until then, remove its placeholder activity rows or keep them explicitly non-executable. Do not claim classification coverage from their presence.
8. Review edges `m1.062` and `m1.063` as necessary dependencies. Remove the sequence-only prerequisites if no accepted source supports necessity.
9. Rebuild the canonical and module activity maps and teacher evidence through the existing projectors. Assert exact parity for the two touched skills.

Required tests must prove the exact source sets, renderer identity, mode set, public-prop privacy, no physical QF Worked mode, no placeholder discriminant execution, and `srsEligible: false`. They must also prove that neither draft binding changes approval, publication, evidence, competency, SRS, or readiness.

## Separate source seed repair

The published seed still has a separate two-path source defect.

`apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts` uses invented content in phases 8 and 9:

- Phase 8 uses `2x² - 3x + 5 = 0` and discriminant `-31`. Source `.039` uses `2x² - 10x + 7 = 0` and discriminant `44`.
- Phase 9 uses `x² - 6x + 9 = 0` and a repeated root. Source `.040` uses `-5x² + 10x - 15 = 0` and discriminant `-200`.
- Both phases include old physical `discriminant-analyzer` activity sections.

Use a separate two-path batch:

1. `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts`
2. `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-6.test.ts`

Replace only phases 8 and 9 with exact `.039` and `.040` inline text. Remove their physical activity sections, as the accepted phase 4 to 6 repair did. Preserve all other phases and seed behavior. This repairs new seeds only. It does not migrate an existing deployed lesson version.

## Parent runtime check

convex/activities.ts builds currentIm3PilotPublication from the canonical node and blueprint files.
The committed canonical blueprint list has no QF entry.
The default strict submission and discriminant check therefore reject the seeded draft QF activities.
The accepted backend tests pass an explicit draft publication fixture.
They prove the server contract under that fixture, not current graph integration.
Add a valid source-bound draft blueprint and test the default publication before any learner-placement claim.
Keep the existing server guard.

The separate phase 8 and 9 seed repair is now implemented in the active candidate and awaits independent review and combined app gates.
