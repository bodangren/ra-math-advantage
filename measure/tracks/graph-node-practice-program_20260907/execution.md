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

## Continued pilot and source work

The previous goal turn recorded the existing objective. It did not change the implementation. This turn rechecked current files and resumed live workers. The Precalculus review found incomplete Worked instruction, no positive constant interval, and an approval bypass. Task 4.3 now covers these fixes. G6 continues with IM2 Lesson 1.1 source distinctions. G7 corrects the IM1 translation catalog, which still asks for numeric evaluation although the new adapter grades expressions. The existing debt registry still presents historical 138-node counts as current. Those statements require correction.

`72eee707`: the shared projector now requires approved exact node and blueprint states plus explicit readiness for SRS eligibility. It retains mode-specific renderer props. The approval regression failed before the repair. All 59 focused tests, package lint, TypeScript, and package build pass.

`fae19087`: IM1 authentication links now use the existing Next Link component. Full app lint, standalone TypeScript, and build pass.

`bf57ae6a`: IM2 now has distinct draft coordinate-circumcenter and coordinate-centroid capabilities. The source review preserves the perpendicular-bisector pilot and both legacy identities. Independent review found no blocking defect. The worker ran 14 focused tests. The parent repeated the four new source tests, app lint, and TypeScript. Whole-course taxonomy remains open.

The IM1 legacy blueprint test still claimed that all Module 1 source candidates had generators. It also treated generic prompt and answerSchema fields as proof of renderer usability. Five assertions failed after the source and renderer fixes. G7 updates that test to distinguish registered bindings from source-only gaps. Exact renderer behavior remains covered by the new catalog and student-flow tests.

`43c0ac98`: the IM1 translation catalog now uses expression-only grading and actual mode props. Guided seed 1110 assesses grouping. Both unsupported direct standard edges are rejected. All three projection consumers discard rejected edges. The saved activity and SRS copies agree. The selected graph node remains draft. Three catalog tests, 46 inventory tests, and 59 shared tests pass.

The IM1 app pilot has 28 passing focused tests. These tests use the actual generated mode props and renderer, the server grading handler, a durable in-memory store, and separate real seed tests. They cover Worked retry, final completion, incorrect-answer correction, current publication, exact readiness, queue preservation, and repeated-visit first exposure. These tests do not prove a deployed Convex or browser session. No process listens on local port 3210.

The boundary check found four IM1 undeclared-import paths and one Precalculus sync-script path. They require three existing workspace dependency declarations. The parent prepared `/tmp/graph-program-workspace-dependencies.patch` and requested explicit approval under AGENTS.md:104. No dependency file has changed. No install or upgrade is proposed. App integration remains open while independent course work continues.

The IM2 three-mode app draft is implemented and awaits independent review. The Precalculus pilot now includes a positive constant segment and current graph publication checks. Its author reports 137 focused tests, lint, TypeScript, and build passing. The parent has not yet integrated or accepted that patch. The IM3 worker selected `math.im3.skill.1.1.graph-quadratic-functions`. The Business Math worker selected `math.bm2.skill.1.1.apply-accounting-equation`. Both workers are tracing the current source and app boundaries.

## Next integration boundary

The parent found that the Precalculus approved-pilot query had no production caller. The dashboard still rendered the selected practice. The author is now connecting the query to the real consumer and regenerating public Independent props. A callable query test cannot prove the student route.

The constant-interval generator initially used a special case for seed 2 only. A new regression tested fresh seeds beyond the pilot. It failed. Constant segments now appear for a recurring set of seeds. All six generator tests pass. Seed 0 and the fixed Independent seed 2 retain their exact expected geometry.

Independent IM2 review found missing teacher-first evidence policy, incomplete Guided interaction, repeat entry, and missing return validators. The author is repairing these findings. The canonical rule is `evaluateLearningEvidenceV1` in practice-core. Student acknowledgement does not establish teacher-led exposure. IM1 currently stores selected graded evidence but does not update SRS or mastery. Its full historical-evidence and teacher-first bridge remains open under Tasks 2.3, 3.6, and 4.4. Incorrect grades must remain available for later learning decisions.

IM3 canonical seed and direct-submission publication checks are now implemented by the worker. The worker is resolving seed TypeScript errors caused by the shared optional-answer display schema. The Convex private-answer requirement must remain intact. Business Math implementation is awaiting independent integration review.

## Durable interval submission and current review findings

The previous goal turn stated the active goal. It did not change implementation. This continuation resumed bounded workers and verified the current files.

`b9e7cb21`: the interval component now awaits its submission callback. It disables input during the save and retains answers after failure. Its accessible graph description lists the actual coordinates. It no longer exposes a fixed classification pattern. Two regressions failed before the repair. All 13 focused component and schema tests pass. Coverage is 100 percent for lines and 91.17 percent for branches. Package lint, standalone TypeScript, and build pass.

The affected Precalculus app checks found two stale dashboard query mocks. They now use actual saved mode props for a hypothetical approved query result. The unavailable publication test remains separate. All 16 affected app tests pass. App integration and live verification remain open.

IM1 now stores every graded Guided and Independent attempt as history. It applies the canonical teacher-first decision to mastery eligibility. The worker added a teacher dashboard action, a trusted exposure route, and an exact-node SRS bridge. The author reports 22 backend tests and 25 backend/route tests passing. Independent review is in progress. This report does not approve the implementation or curriculum.

The Business Math review found two release blockers. The generated three-mode path conflicts with the reviewed blueprint. The Independent component reveals the expected answer before the server grade is saved. The author is repairing publication checks and answer disclosure. Task 4.6 remains open.

G8 found six omitted Module 3 objectives and one omitted source example. The worker restored draft identities and exact source references. Several objectives still combine separate capabilities. Source image review and capability splitting remain open. The parent has not yet accepted G8.
