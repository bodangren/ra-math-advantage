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

The current `PracticeSessionProvider` displays only session and objective IDs. It does not render an activity or submit a response. The queue copies stored activity props. It does not generate the translation prompt or hold private expected answers. The current route test replaces the provider with another identifier-only component. It cannot prove student practice. Task 4.4 must implement the actual activity, server submission, and evidence flow before the pilot is complete. The existing route test remains useful only as a route wiring check.

The parent readiness omission is resolved in the working tree. Independent integration review confirmed state preservation. Both new readiness suites pass, with 14 tests. The readiness changes overlap earlier parent evidence-source corrections. They remain uncommitted while the integration owner separates their scope. No file was restored or overwritten.

The IM1 source additions expose frozen inventory assertions in existing coverage tests. Task G5 will correct the reports and tests. Registered generators do not prove complete practice or approved curriculum scope.

`6011c71d`: committed six Module 2 draft capabilities, source-only blueprints, and corrected 2i text on its original ID. The corrected tests check source numbers and capability-specific titles. Ambiguous occurrence links are excluded pending G4. Four tests and IM1 standalone TypeScript pass.

`7d6b7c61`: deduplicated repeated lesson examples in extraction. Two new regressions failed before the change. All 57 extraction tests pass after the change. Math-content lint and standalone TypeScript pass. The occurrence counter still advances for repeated references. Later identifiers therefore remain unchanged for the same input. Saved catalogs were not regenerated. G4 still must restore missing source nodes and reconcile saved duplicate references.

## Active follow-up ownership

The runtime worker implements the single-node IM1 server submission and client flow. The inventory worker reconciles saved Module 1 and Module 2 source examples. The readiness worker corrects the existing IM1 inventory audit and tests. The parent retains integration ownership. The practice component now has explicit Worked reasoning and Guided Check, Hint, and Reveal behavior. The app must use an awaited durable submission callback. Draft rows remain outside ordinary adaptive recommendations.

`6ac498a6`: committed the expression-capable blank renderer and its required contract fields. Worked mode shows reasoning. Guided mode checks before hints and reveals. Independent mode submits raw answers. Save failures preserve the response. Review tests exposed lost reveal assistance after an edit and missing Guided error output. Both are corrected. Eleven interaction tests, component lint, standalone TypeScript, root lint, and all package builds pass. The earlier schema ownership migration remains unstaged.

`64f04ffb`: committed the IM1 expression generator, graph registry binding, mode projector, and private finite-form grader. Ten focused tests, package lint, and standalone TypeScript pass. Independent props have an exact public shape. Source evaluation remains separate from translation evidence.

`3df086f6`: committed all 67 actual Module 1 and Module 2 example identities. Four missing draft examples use source-number IDs. Four confirmed duplicate occurrences redirect to retained identities. Full lesson-body review corrected unsupported shared mappings. The inverse graph-to-equation example remains a distinct source awaiting capability inventory. Ten source tests and IM1 TypeScript pass. No node outside the two modules changed.

`6f595dd4`: committed the current IM1 inventory correction. Current totals are 150 skill candidates and six generator bindings. The 146 blueprint rows contain six schema-valid mode bundles, 132 empty bundles, and eight source-only rows. Four capabilities have no blueprint. None of these counts proves a complete production practice path. All 42 inventory tests and math-content TypeScript pass.
