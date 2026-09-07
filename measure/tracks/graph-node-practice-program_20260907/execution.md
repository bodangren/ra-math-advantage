# Execution record

Implementation authorized: 2026-09-07.

## Baseline

Base commit: `c813afa8905d127cfbe23b85417a9bee349527ae`. Work uses the current working tree because it contains current course corrections. Preserve all pending changes. Do not copy an older checkout over this state.

## Ownership

The parent owns this program, shared integration, and central Measure files. Existing course correction tracks retain their application fixes. The semantic repair track remains the checklist for series graph repairs. All workers receive explicit file ownership before edits.

Initial parallel work: shared runtime contract review; IM1 and IM2 source inventory; IM3, Precalculus, and Business Math source inventory. These tasks read existing implementation. They write only their assigned review notes.

## Baseline checks

- Shared practice: 450 tests passed.
- Shared core: 698 tests passed; 3 failed. All three invoke current repository boundary or Doctor checks. No source change preceded these checks.
- Logs: `/tmp/graph-program-practice-baseline.log` and `/tmp/graph-program-core-baseline.log`.

## First implementation assignment

The runtime worker owns `packages/knowledge-space-practice/src/projections/activity-map.ts` and a new `activity-map-identity.test.ts`. It must preserve pending edits. Contract: validate mode specs with existing schemas; do not project concept work into child evidence; select the renderer for the actual mode with the blueprint renderer as fallback. Do not strengthen unrelated authoring schema constraints.

This repair can proceed while source review continues. It does not approve graph rows, change the upstream graph endpoint contract, or activate new mastery targets.

## Equivalence boundary decision

The parent owns `projections/srs.ts`, `projections/teacher-evidence.ts`, and a new equivalence acceptance test. Draft equivalence suggestions may remain available for source review. They must not appear as accepted SRS identity links or teacher equivalence groups. Accept a relationship in these outputs only when the edge and both skill endpoints are approved. Keep the generic suggestion and component-analysis functions available for review. No new schema, field, or registry is required.

## First repair verification

- Projector and equivalence package: 469 tests passed after the mode-key compatibility correction.
- Equivalence regression: 8 failures before the repair; 8 passed after it.
- Renderer compatibility regression: 2 failures and 1 pass before the repair; all pass after it.
- Full package lint passed. Standalone TypeScript passed for shared practice and math content.
- Wider build stopped at the existing lesson-renderer CSS import typing error. The stylesheet exists and KaTeX is already declared.
- Core baseline failures are the existing undeclared `knowledge-space-practice` import in the Precalculus sync script.
- Full math-content tests had 864 passes and one timeout in the existing 10,000-seed polynomial-extrema test. A separate rerun is pending.

The broad course program and manual review gates remain open. No graph row is approved by these results.

## Committed integration correction

`97b46bfc`: declared the existing KaTeX stylesheet module. Standalone lesson-renderer TypeScript, lint, and both tests pass. No dependency was added.

The polynomial-extrema test passes in isolation: 5 tests, including all 10,000 seeds. The earlier full-suite timeout occurred during concurrent verification.

IM1 full-suite result: 38 passed, one assertion failed, and one suite failed to load. The two failures concern an obsolete CI job name and a source-text assertion about the Convex provider. Neither is in the graph source batch.

`ecedf2b1`: fixed objective extraction and table-cell parsing. All 55 extraction tests, package lint, and standalone TypeScript pass. Catalog integration is a separate task.

## Current continuation

The parent integrates the completed shared boundaries and IM1 Module 1 source repair. The runtime worker reviews the source repair. The inventory worker implements expression input for the IM1 translation pilot. The readiness worker resolves the parent nearly-ready state defect and adds a behavioral test. Each worker has separate file ownership. Other course correction commits continue in the shared checkout.

`b11b5032`: committed the approved-equivalence boundary. All eight focused tests pass. Current standalone shared-practice TypeScript, root lint, and all package builds pass. Earlier shared-practice full-suite result: 469 passed. Other pending SRS generator-readiness changes remain outside this commit.

`8c9bef54`: committed renderer compatibility for all mode overrides. Three focused tests pass. Existing schema changes remain outside the commit.

`67d972dc`: restored six IM1 Module 1 draft capabilities and exact available example links. Independent source review found no source error or accidental activation. Three focused tests and IM1 standalone TypeScript pass. The test uses a partial-object assertion because the JSON type has no readiness field. Module 2 source restoration is now in progress.

`ac4a6a4f`: committed exact-capability activity projection, existing-schema validation, and per-mode renderer choice. The architecture document now states the same identity rule. All 35 focused projection tests, lint, and standalone TypeScript pass. Existing renderer-props, rubric, and SRS changes remain unstaged.

## IM1 application integration finding

The current `PracticeSessionProvider` displays only session and objective IDs. It does not render an activity or submit a response. The queue copies stored activity props. It does not generate the translation prompt or hold private expected answers. The current route test replaces the provider with another identifier-only component. It cannot prove student practice. Task 4.2 must implement the actual activity, server submission, and evidence flow before the pilot is complete. The existing route test remains useful only as a route wiring check.
