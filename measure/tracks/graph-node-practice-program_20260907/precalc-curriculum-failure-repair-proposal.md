# Precalculus curriculum failure repair proposal

Date: 2026-09-08

## Scope

This review covers the four curriculum failures in `/tmp/precalc-q20-parent-main-tests.log`. It also classifies the seven additional failures in `/tmp/precalc-q20-parent-main-additional.log`.

Task Q21 in the active graph-node practice track owns the four curriculum failures. Task Q18 owns the selected writer and evidence flow failures. The accepted Q20 dispatcher change does not own either group.

## Topic 1.1 source tests

The current Topic 1.1 file has 63 lines. The line count is not a curriculum requirement. The file contains the reviewed source scope, both official Course and Exam Description (CED) learning objectives, the required essential knowledge, the five separate capability targets, source limits, application requirements, and open coverage gaps. Adding filler to reach 80 lines would reduce source accuracy.

Remove the universal 80-line assertion from `apps/pre-calculus/__tests__/curriculum/curriculum-depth.test.ts`. Replace it with structure and content checks. The existing `topic11-source-repair.test.ts` already checks the exact Learning Objective 1.1.A text, Learning Objective 1.1.B, and the graph-construction gap. Add checks there for the `Source instruction`, `Worked and practice content`, and `Application requirements and remaining gaps` headings if the test needs stronger document coverage. Do not lower the numeric threshold to another arbitrary value.

The old phrase `Learning-objective family: 1.1.A` is obsolete template text. The current file uses the exact official statement for Learning Objective 1.1.A and also restores Learning Objective 1.1.B. Change only the Topic 1.1 assertion in `planning-structure.test.ts`. Require both objective identifiers or the exact objective text. Keep the title and Passwater-source assertions. Do not restore the old family phrase.

The per-topic `FRQ expectations or AP exam alignment signals` check is also an old text heuristic. The removed text asserted a specific “FRQ 1 task model” and calculator status without source support. The accepted G30/G31 source review identifies CED pages 39 and 40 as authority. It states that Topic 1.1 is introductory and does not require immediate proficiency. The current file accurately identifies AP Precalculus, CED objectives, essential knowledge, and an assessment coverage gap.

Do not restore the old FRQ claim. For Topic 1.1, replace the heuristic with source-backed checks for the official CED reference and explicit learning objectives. A broader cleanup can replace the same regex for all 58 topics later. That broader cleanup is outside this repair.

These changes preserve meaningful Advanced Placement (AP) requirements. They remove only line-count and keyword proxies. The source-backed requirements remain in `topic11-source-repair.test.ts` and `topic11-source-integration.test.ts`.

## Projection mismatch

The stored and current projections have equal row counts:

- activity rows: 181 stored and 181 current;
- standalone SRS planning rows: 88 stored and 88 current.

The standalone SRS projection matches the current projector exactly. The activity projection has 32 differences. Every difference is only the `srsEligible` field. The stored value is `true`. The current projector value is `false`.

The 32 rows are the Guided and Independent rows for these 16 draft skills:

- six Topic 1.2 skills;
- two Topic 1.3 skills;
- four Topic 1.4 skills;
- three Topic 1.5 skills;
- `math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations`.

The exact Topic 1.2 skill suffixes are `compare-pointwise-rates-of-change-from-graphs`, `compare-rates-of-change-across-intervals`, `compute-and-interpret-average-rate-of-change`, `determine-negative-rate-intervals-for-quadratics`, `identify-least-pointwise-rate-of-change-from-graphs`, and `model-negative-rate-contexts`.

The Topic 1.3 suffixes are `classify-linear-vs-quadratic-from-rate-patterns` and `determine-concavity-from-rate-of-change`. The Topic 1.4 suffixes are `describe-rate-of-change-behavior-on-intervals`, `determine-end-behavior-from-leading-term`, `identify-polynomial-degree-and-leading-coefficient`, and `identify-relative-and-absolute-extrema-from-graphs`. The Topic 1.5 suffixes are `determine-least-polynomial-degree-from-zeros-and-conjugate-pairs`, `find-real-zeros-and-multiplicities-from-factored-form`, and `solve-polynomial-inequalities-using-sign-charts`.

Each listed node is `draft`. Each listed blueprint is `draft`. A generator binding and complete-looking mode specifications do not approve either record. The current projector requires an approved node, an approved blueprint, `independentPracticeReady: true`, and Guided or Independent mode before it sets `srsEligible: true`. This is the approved shared safety contract in `packages/knowledge-space-practice/src/projections/activity-map.ts`.

Regenerate only `apps/pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json` with the existing projection script after review of the 32 field changes. The correct generated result changes those 32 values to `false`. It must not remove the 181 activity planning rows or change their props, grading, IDs, or source links. It must not approve any graph row. The current `srs-input.json` already matches `projectSrsInputs`; do not rewrite it for this failure. If the sync script rewrites both files, verify that the standalone SRS bytes have no semantic change.

Add a focused regression that selects the 32 draft activity rows and requires `srsEligible: false`. Keep the full projector equality test. This guards against a later blind artifact update that restores active SRS status.

The Topic 1.1 G31 projection is not the cause. Its six planning rows are inactive with `generatorReady: false`. Its source-only blueprints produce no activity rows. The rejected legacy identity has no blueprint, activity, edge, or evidence transfer. Keep this behavior.

## Additional broader failures

The four failures in `learning-evidence-production-flow.red.test.ts` stop at the existing inactive selected identity in `activities.ts`. They are meaningful production-flow tests. Keep them visible under Task Q18. Do not weaken them or classify them as Q20 regressions.

The three failures in `learning-evidence-bounded-authority.red.test.ts` call the old camel-case evidence handler with a legacy fixture and receive `submission_not_found`. Their bounded-read and temporal-authority goals remain meaningful. Update their fixture and entry point under the later-node evidence task so they exercise the intended current handler. Do not delete the tests or bypass the physical submission requirement.

## Minimum change set

1. Update the two stale Topic 1.1 assertions in `curriculum-depth.test.ts`.
2. Update the one stale Topic 1.1 boilerplate assertion in `planning-structure.test.ts`.
3. Strengthen `topic11-source-repair.test.ts` only if the replacement assertions need explicit source headings.
4. Update only the 32 `srsEligible` values in `projection/practice-v1-activity-map.json` through the existing projector.
5. Add a focused draft-activity eligibility regression or extend `graph-integrity.test.ts` with that exact assertion.

Do not change the Topic 1.1 source file, graph approval states, generator helpers, or SRS projector. Do not include Q20 route work in this correction.
