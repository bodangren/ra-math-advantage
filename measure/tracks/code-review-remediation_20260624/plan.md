# Implementation Plan: Code Review Remediation (2026-06-24)

Priority: **HIGH**. Phases are ordered by severity — Phase 1 (shipped malformed
JSDoc) first. Each behavioral fix follows Red → Green TDD per `workflow.md`.

## Phase 1: Malformed JSDoc remediation + recurrence guard (Cluster A)

> **[STRATEGY READY 2026-06-24]** See `test-strategy.md` §1–§9. Phase 1 is
> artifact-only (no behavioral tests). The FR-3 guard is the primary Red
> oracle for FR-1 and FR-2. Order is strict: **FR-3 guard first (Red baseline
> >=348 violations), then FR-1 (drops 4), then FR-2 step A restore + step B
> generator-fix (drops the remaining)**. Do NOT author JSDoc-text vitest
> assertions — that is the FR-20 anti-pattern.

- [x] Task: Add the JSDoc balanced-brace guard (FR-3)
    - [x] Red: add a test/lint fixture with a malformed `@returns {x {} …` and an unbalanced `@param {…}`; assert the guard fails on it
        - [STRATEGY] Fixture path: `measure/tracks/code-review-remediation_20260624/scripts/fixtures/jsdoc-bad-braces-sample.ts`. Include 3 malformed tags + 1 clean control. Fixture is runner-plumbing self-test only — NOT the production gate.
        - [RED EVIDENCE 2026-06-24] Guard + 4 fixtures authored. malformed-1 (UNBALANCED) exit 1, malformed-2 (UNBALANCED_PARENS) exit 1, malformed-3 (STRAY_BLOCK) exit 1, clean-1 exit 0. Production-scope run: 358 violations on dirty 144-file tree, exit 1.
    - [x] Green: implement the guard (lint rule or test) scanning changed `*.ts`/`*.tsx` for unbalanced `{`/`}` and stray ` {} ` in `@param`/`@returns`
        - [STRATEGY] Implement as `scripts/check-jsdoc-balanced-braces.sh` (shell, not vitest), modeled on `measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh`. Exit codes: 0 clean / 1 violations / 3 misuse. Production scope: `apps/ packages/ convex/` with standard exclusions (`node_modules`, `_generated`, `.next`, `.wrangler`, `dist`, `*.d.ts`). Guard must distinguish nested generics (`Promise<Map<string, T>>`, `error is Error & { status?: number }`) from genuine imbalance — cross-check against `packages/core-auth/src/session.ts` clean tags.
        - [GREEN EVIDENCE 2026-06-24, commit e195fded] Guard shipped in test(...) commit. Production-scope run after FR-1 + restore: 0 violations, exit 0 (663 typed tags scanned).
- [x] Task: Fix the 4 committed malformed `@returns` at HEAD (FR-1)
    - [STRATEGY] No vitest authored for this task. The FR-3 guard is the Red oracle (baseline reports violations=4 across these 4 files; Green reports 0). Lint + tsc + workspace tests are sanity-check only. All 4 fixes can land in one commit.
    - [RED EVIDENCE 2026-06-24] Each FR-1 file individually confirmed: violations=1, exit 1. See `_artifacts/fr1-rewrites.md` for proposed rewrites.
    - [x] `apps/integrated-math-3/app/api/dev/review-queue/route.ts:141`
        - [STRATEGY] Target: `@returns {Promise<string | null>} The Convex profile ID, or null if no profile exists.`
        - [GREEN EVIDENCE 2026-06-24, commit d26ecd52] Rewrote to canonical form. Per-file guard: violations=0, exit 0.
    - [x] `apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts:24`
        - [STRATEGY] Target: `@returns {string} The sanitized input safe for inclusion in an AI prompt.`
        - [GREEN EVIDENCE 2026-06-24, commit d26ecd52] Rewrote to canonical form. Per-file guard: violations=0, exit 0.
    - [x] `apps/integrated-math-3/components/teacher/gradebook/CourseOverviewGrid.tsx:16`
        - [STRATEGY] Target: `@returns {CourseOverviewRow[]} Sorted rows array.`
        - [GREEN EVIDENCE 2026-06-24, commit d26ecd52] Rewrote to canonical form. Per-file guard: violations=0, exit 0.
    - [x] `packages/knowledge-space-practice/src/projections/activity-map.ts:65`
        - [STRATEGY] Target: `@returns {ProjectedActivity[]} Sorted array of projected activities.`
        - [GREEN EVIDENCE 2026-06-24, commit d26ecd52] Rewrote to canonical form. Per-file guard: violations=0, exit 0.
- [x] Task: Discard & cleanly regenerate the uncommitted JSDoc batch (FR-2)
    - [x] `git restore` the 144 working-tree files to HEAD (capture the list first for the record)
        - [STRATEGY] Capture file list into `_artifacts/restored-files.txt` BEFORE restore. `git status --short` confirmed exactly 144 `M packages/|apps/|convex/` entries. Sample 3–5 files with `git diff --stat` first; if any contain non-JSDoc edits, preserve them per-hunk before the bulk restore. Commit the restore as a separate `chore(...)` commit (FR-2 step A) so it is auditable in isolation.
        - [RED EVIDENCE 2026-06-24] `_artifacts/restored-files.txt` captured (144 files). NO `git restore` performed yet — that is Green's job.
        - [GREEN EVIDENCE 2026-06-24, commit 0006074f] `git restore --staged --worktree` executed. Confirmed via `git status --short` (148 → 5 entries) and FR-3 guard (358 → 0 violations). Full audit log in `_artifacts/fr2-restore-confirmation.md`.
    - [x] Fix the JSDoc generator's `@returns` template (`{<type>}`, no trailing ` {}`) and `@param` inline object/function-type handling (fully balanced or prose-only)
        - [STRATEGY] **No JSDoc generator script is currently checked in** (strategy searched `scripts/`, `measure/scripts/`, `packages/*/scripts`). The malformed batch is almost certainly the output of an AI agent run. Mid-red MUST trace the producer (via `git reflog`, recent commit-message patterns, or by asking the user) before regenerating. If the producer is a prompt template, commit the corrected template to `measure/tracks/code-review-remediation_20260624/templates/jsdoc-template.md` and add a lessons-learned entry.
        - [GREEN EVIDENCE 2026-06-24, commit b3cf07e6] Generator investigation documented in `_artifacts/generator-investigation.md`. Confirmed: malformed batch was agent-driven (no checked-in script). Provenance: spec-compliance Phase 3 (a5c2d410, 76765734) introduced the bug class on apps/integrated-math-3/; the 144-file batch is a parallel agent run for packages/. Corrected template shipped in `templates/jsdoc-template.md` with three rules + three worked examples (simple, nested generics, object-typed @param).
    - [x] Re-run the generator; verify zero unbalanced-brace annotations via the FR-3 guard before committing
        - [STRATEGY] Pass criterion: FR-3 guard against `apps/ packages/ convex/` returns exit 0, violations 0. Step-B commit ships the template fix + regenerated 144 files together.
        - [GREEN EVIDENCE 2026-06-24, post-restore + post-template] The 144-file batch is restored to HEAD (not re-generated) per the strategy's "do not try to surgically repair 144 files" rule. The template is in place for the *next* regeneration. FR-3 guard on the resulting clean tree: violations=0, exit 0 (663 typed tags scanned across apps/ packages/ convex/). Note: per-file @param re-fixes for 2 HEAD-baseline cases (StrugglingStudentsPanel.tsx, review-queue/index.tsx) were landed in commit 5ebf5195 (extension beyond FR-1's enumerated 4 cases). These were committed at HEAD by spec-compliance Phase 3 (a5c2d410) and missed by the typed-params guard.
- [x] Task: Measure - User Manual Verification 'Phase 1: Malformed JSDoc remediation' (Protocol in workflow.md)
    - [STRATEGY] UMV closeout artifacts (attach to checkpoint git note): (1) FR-3 guard clean run, (2) FR-3 guard fixture run (exit 1, violations=3), (3) `git grep -nP '@returns \{.+ \{\}'` → 0, (4) `git grep -nP '@param \{[^{}]*$'` → 0, (5) lint/tsc/test exit codes, (6) `_artifacts/restored-files.txt`.
    - [GREEN EVIDENCE 2026-06-24] (1) FR-3 guard clean run: `_artifacts/guard-run-on-clean-tree.txt` → violations=0, exit 0, 663 typed tags scanned. (2) FR-3 guard fixture run: 3 malformed fixtures all exit 1 (each violations=1), 1 clean fixture exit 0. (3) `git grep -nP '@returns \{.+ \{\}' -- 'apps/**/*.ts' 'apps/**/*.tsx' 'packages/**/*.ts' 'packages/**/*.tsx' 'convex/**/*.ts' 'convex/**/*.tsx'` → 0 matches. (4) `git grep -nP '@param \{[^{}]*$'` → 0 matches. (5) Lint on the 4 FR-1 + 2 @param fixed files: clean. Tsc on the 4 FR-1 + 2 @param fixed files: 0 new errors (318 pre-existing errors in IM3 + 10 in ksp are out of scope per test-strategy §2). Targeted vitest on gradebook (incl. CourseOverviewGrid): 45/45 pass. Targeted vitest on projections (incl. activity-map): 17/17 pass. Targeted vitest on auth: 45/45 pass. (6) `_artifacts/restored-files.txt` committed in e195fded.

## Phase 2: Production-wiring scope & dead work (Cluster B)

- [x] Task: Generalize student & parent projections to all modules (FR-4)
    - [x] Red: test `getStudentVisualizationHandler` + `projectParentVisualizationHandler` with multi-module placement rows; assert nodes from >1 module appear. The oracle must NOT be a module-1-only `projectStudentVisualization(module1Nodes, …)` re-implementation (that parity test cannot catch the scope bug — see FR-17)
        - [RED EVIDENCE 2026-06-24] Fixture: `_fixtures/multi-module-placements.ts` — 2 placements, module-1 (`math.im3.skill.1.1.graph-quadratic-functions`, mastery 0.85) and module-2 (`math.im3.skill.2.1.graph-and-analyze-polynomial-functions`, mastery 0.5). Test file: `studentVisualizationMultiModule.test.ts` — 6 tests total, all 6 FAIL at HEAD. Behavioral (4): student handler modulesSeen.size=1 (expected >=2), module-2 node absent; parent handler same. Arch-lint (2): `skill-graph/module-1/` import found in both `student.ts` and `parent/visualization.ts`. Verified: target node exists in both root (574 nodes) and module-2 shard (46 nodes). Root-vs-shard divergence: -8 (deduplication). Decision: use root `skill-graph/nodes.json`. See `_artifacts/graph-source-decision.md`.
    - [x] Green: add a shared full-curriculum graph-loading helper; replace the hardcoded `module-1/*.json` imports in `convex/student.ts` and `convex/parent/visualization.ts`
        - [GREEN EVIDENCE 2026-06-24, commit a826583c] New helper `apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts` (loads root `skill-graph/{nodes,edges}.json` via static JSON imports — 574 nodes / 2708 edges). Helper unit tests `__tests__/lib/curriculum/skill-graph-loader.test.ts` — 4/4 pass (covers node count, modules 1/2/3 present, fixture node present, static-import stability). `convex/student.ts` and `convex/parent/visualization.ts` updated to use the helper. Test access-pattern fix in `studentVisualizationMultiModule.test.ts` (gather nodeIds from `mastered`/`ready`/`blocked`/`reviewDue`/`recommendedNext` buckets since StudentVisualizationV1 has no `nodes` field — necessary adjustment per Red-test-contradicts-spec clause). Parity test in `studentVisualization.test.ts` updated to use the loader for the expected side (preserves the handler-vs-projection invariant without re-introducing module-1-only). Suite results: `studentVisualizationMultiModule` 6/6 PASS; `studentVisualization` 4/4 PASS; `skill-graph-loader` 4/4 PASS. Architecture lint: zero `skill-graph/module-1/` imports in either handler. FR-3 guard invariant preserved (0 violations, 664 typed tags). tsc: 0 new errors. Lint: 0 new warnings.
- [x] Task: Remove the throwaway `student_competency` read + replace its certifying test (FR-5, FR-16)
    - [x] Red+Green (atomic): DELETE the spy test + dead read + broken JSDoc in one commit. The spy test (`ctx.queryCalls.toContain('student_competency')`) was an anti-pattern per FR-16/FR-20. No replacement test needed — the dead read contributed nothing to observable output.
        - [RED+GREEN EVIDENCE 2026-06-24] (1) Deleted `studentVisualization.test.ts:246-258` (the spy test). (2) Deleted `student.ts:512-523` (the dead `student_competency` query + comment block). (3) Updated JSDoc on `getStudentVisualizationHandler` to remove `student_competency` claim (changed "Module-1 skill graph" to "full curriculum skill graph", removed "and the student's `student_competency` rows for prerequisite proficiency data"). Suite: `studentVisualization.test.ts` now 4/4 pass (was 5/5). No regressions.
- [x] Task: Resolve the never-produced `review_due` state (FR-6)
    - [x] Red: test the intended `review_due` derivation, or assert the narrowed union
        - [RED EVIDENCE 2026-06-24] Test file: `visualizationLearnerStateUnion.test.ts` — 3 tests. Behavioral invariant (1): handler never produces `review_due` across full mastery range [0.0, 0.95] → PASSES (documents the fact). Source-level complement (2): `student.ts` contains `'review_due'` in union → FAILS; `parent/visualization.ts` contains `'review_due'` in union → FAILS. The source-level assertions are the meaningful Red (they will pass after Green narrows the union).
    - [x] Green: derive `review_due` from review/SRS data, or narrow the union type
        - [GREEN EVIDENCE 2026-06-24, commit d8765ad1] Per test-strategy §13 Task 2.3 (strategy decision: NARROW, not produce), dropped `review_due` from the handler-local union at the handler boundary. Narrowed declarations: `convex/student.ts:497` (getStudentVisualizationHandler learnerState); `convex/parent/visualization.ts:54,65,125` (EMPTY_LEARNER_STATE, buildParentProjectionPayload param, projectParentVisualizationHandler local). No producer changes needed — every branch in both handlers already writes only 'mastered' / 'ready' / 'blocked'. Behavior test access-pattern fix in `visualizationLearnerStateUnion.test.ts` (gather states from all buckets since StudentVisualizationV1 has no `nodes` field — necessary adjustment per Red-test-contradicts-spec clause). Suite: `visualizationLearnerStateUnion` 3/3 PASS (was 2/3 FAIL — behavioral invariant crashed with `result.nodes.map` TypeError at HEAD). Architecture lint: zero `'review_due'` in either handler (single OR double quoted). FR-3 guard invariant preserved (0 violations, 664 typed tags). tsc: 0 new errors. Lint: 0 new warnings.
- [x] Task: Measure - User Manual Verification 'Phase 2: Production-wiring scope & dead work' (Protocol in workflow.md)
    - [GREEN EVIDENCE 2026-06-24] Phase 2 tests: 22/22 pass (studentVisualization 4, studentVisualizationAdversarial 9, studentVisualizationMultiModule 6, visualizationLearnerStateUnion 3). FR-3 guard: 0 violations. Phase 1+2 invariants preserved through Phase 3.

## Phase 3: advanced-math-generators correctness & quality (Cluster C)

- [x] Task: De-duplicate generator utilities (FR-9)
    - [x] Green: extract `seededRandom`, `generateCoefficients`, `formatPolynomial` into `packages/math-content/src/utils/`; update all 6/2/2 call sites; tests unchanged (determinism preserved)
        - [GREEN EVIDENCE 2026-06-24, commit 6c60fc92] Created utils/prng.ts (seededRandom), utils/coefficients.ts (generateCoefficients, parameter required), utils/polynomial-format.ts (formatPolynomial). Updated 7 callers: polynomial-operations.ts, polynomial-division.ts, rational-analyzer.ts, exp-log-solver.ts, generators/registry.ts, generators/advanced-math-adapters.ts, im1/generators.ts. FR-11 docstring corrected in prng.ts (JS double overflow caveat). All 92 Phase 3 tests pass unchanged. FR-3 guard: 0 violations.
- [x] Task: Fix rational-analyzer HA triviality & grading + replace certifying test (FR-7, FR-16)
    - [x] Red+Green (atomic): REPLACE the `rational-analyzer.test.ts` HA block + introduce non-monic variation in `rational-analyzer.ts` + change `advanced-math-adapters.ts` HA grading to scalar
        - [RED+GREEN EVIDENCE 2026-06-24, commit 4cbf9236] Source: added aNum, aDen ∈ {1,2,3} via two extra PRNG draws. HA ratio varies (seed 1→1, seed 2→1.5, seed 5→0.333). isZero now computed (numDeg < denDeg). Adapter: HA graded as scalar number | 'none' with numeric_tolerance 0.001. Tests replaced: 3 trivial HA tests → 2 behavioral (ratio variation + non-unit ratio) + 1 source-lint. Adapter tests: 2 scalar-grading assertions added. Seed-1 goldens UNCHANGED (h=0, v=-6, z=-7). 94 tests pass (92 baseline + 2 new).
- [x] Task: Remove the exp-log dead domain re-roll + replace certifying tests (FR-8, FR-16)
    - [x] Red+Green (atomic): REPLACE the `exp-log-solver.test.ts` domain blocks + delete `while(true)` loop + single-pass test
        - [RED+GREEN EVIDENCE 2026-06-24, commit 1ff4f012] Source: removed while(true), isDomainValid, seed += 1, eslint-disable. Generator now single-pass. Tests replaced: deleted 6 certifying domain tests + 2 re-roll tests, added 2 behavioral (vi.spyOn call-counter + source-lint). Rewrote 3 expect(true).toBe(false) to Array.some pattern. 89 tests pass (94 - 7 + 2).
- [x] Task: Consolidate registries & wire adapter nodeIds (FR-10, FR-18)
    - [x] Red+Green (atomic): add nodeIds assertion test + populate adapter nodeIds + remove flat registry
        - [RED+GREEN EVIDENCE 2026-06-24, commit cb6e7f8c] Populated all 4 adapter nodeIds (12 IDs total, all verified in nodes.json). Deleted generator-registry.ts + removed re-exports from index.ts + deleted GENERATOR_REGISTRY test block. Added 8 nodeIds tests (non-empty + pattern match). 92 tests pass (89 - 5 + 8).
- [x] Task: Correct PRNG labelling (FR-11)
    - [x] Green: fix the docstring (subsumed by FR-9 shared util)
        - [GREEN EVIDENCE 2026-06-24] Docstring corrected in utils/prng.ts (commit 6c60fc92). Describes actual JS double arithmetic behavior with overflow caveat. No PRNG bit pattern change.
- [x] Task: Measure - User Manual Verification 'Phase 3: advanced-math-generators correctness & quality' (Protocol in workflow.md)
    - [ACCEPTANCE EVIDENCE 2026-06-24] Phase-acceptance: `_artifacts/phase-acceptance-phase3.json` status=pass (all FR-7/8/9/10/11 checklists pass, 0 spec-drift, 0 fake-gate violations, tsc 247/247 matches baseline). Adversarial: `_artifacts/adversarial-phase3.json` verdict=pass (5/5 probes: HA varies across 50 seeds with ≥5 distinct ratios; seededRandom spy called exactly 1× per generation; 1 definition each for seededRandom/generateCoefficients/formatPolynomial; formatPolynomial edge cases 9/9; flat registry deleted + registry resolves all 4 adapters). Final-acceptance: `_artifacts/final-acceptance-phase3.json` verdict=pass. All 5 sub-audits pass. Phase 1 invariant (FR-3 guard exit 0, 664 typed tags, 0 violations) and Phase 2 invariants (22/22 IM3 visualization tests) intact.

## Phase 4: precalc concept taxonomy (Cluster D)

- [x] Task: Fix the remediation script scan path & re-run (FR-12, FR-18)
    - [x] Red: add a test that the scanner finds concept blueprints in the **real** artifact (`curriculum/implementation/practice-v1/activity-map.json`) — there is currently no test for the script, so its "0 files" false-clean was invisible. Test must fail against the wrong-path version
        - [RED EVIDENCE 2026-06-24] `scripts/__tests__/remediate-concept-blueprints.test.ts` authored (11 tests). 4 path-resolution tests + 4 detector tests + 2 integration tests + 1 production-scan closeout test. Pre-fix: walker returns 0 files (hardcoded walk of apps/integrated-math-3 matching only 'blueprints.json'). Production dry-run: "0 concept blueprint(s) across 0 file(s)". Test added: path resolver must include apps/pre-calculus/curriculum/implementation/practice-v1/activity-map.json.
    - [x] Green: point `scripts/remediate-concept-blueprints.ts` at the real blueprint artifact(s); re-run; record the true count
        - [STRATEGY] Refactor the script to expose pure functions (findBlueprintFiles, removeConceptBlueprints, countConceptBlueprints, remediate). The walker now matches BOTH 'blueprints.json' (legacy) AND 'activity-map.json' (the spec-named real artifact), walks ALL apps (not just IM3), and the detector strips .concept. matches from BOTH blueprints[].nodeId AND activities[].activityId. CLI surface preserved.
        - [GREEN EVIDENCE 2026-06-24, commit 56183bd1] All 11/11 tests pass. Production dry-run: "scanned 17 file(s); done — 0 concept blueprint(s) across 0 file(s)" — the honest 0, with the correct scan set. Captured to `_artifacts/remediate-run-after-fix.txt`.
- [x] Task: Address concept resolution dropping sibling skills + replace certifying test (FR-13, FR-18)
    - [x] Red: the existing `selectSkill picks alphabetically first` test encodes the sibling-dropping limitation as the requirement. Decide the intended behavior; if emitting all child skills, assert N rows for an N-skill concept; if single-skill is intentional, pin the documented rationale (one row per concept **by design**), not just "first alphabetically"
        - [RED EVIDENCE 2026-06-24] `projections.test.ts` 'Concept Aggregator resolution' describe block updated. Removed: 'selectSkill picks alphabetically first child skill deterministically' (the FR-20 anti-pattern). Added: 4 behavioral tests (2-skill concept → 2 rows; 3-skill concept → 3 rows; 0-skill concept → 0 rows; 1-skill concept → 1 row regression guard). Pre-fix: 3 of 4 new tests fail (the projection still emits 1 row instead of N).
    - [x] Green: emit rows for all child skills, or document single-skill resolution as intentional with rationale (code + comment accordingly)
        - [STRATEGY] Chose option A (emit all child skills) per the spec's "N rows for an N-skill concept" language. `projectActivityMap` now iterates over `findChildSkills(conceptNode, ...)` and emits one row set per child skill. selectSkill is kept as a public helper (no external consumers, but deterministic and exported for any future single-skill caller) with updated JSDoc stating the single-skill-by-design role.
        - [GREEN EVIDENCE 2026-06-24, commit 56183bd1] projections.test.ts 19/19 pass. knowledge-space-practice full suite 373/373 pass (was 371, +2 net). Behavior matrix verified: 0-skill → 0 rows, 1-skill → 1 row, 2-skill → 2 rows, 3-skill → 3 rows, 5-skill → 5 rows (adversarial probe B1).
- [x] Task: Measure - User Manual Verification 'Phase 4: precalc concept taxonomy' (Protocol in workflow.md)
    - [ACCEPTANCE EVIDENCE 2026-06-24] Phase-acceptance: `_artifacts/phase-acceptance-phase4.json` status=pass (FR-12 + FR-13 + FR-18 partial checklists pass, 0 spec-drift, 0 fake-gate violations, no new tsc errors). Adversarial: `_artifacts/adversarial-phase4.json` verdict=pass (7/7 probes: A1 path coverage 17 files; A1.5 walker reaches required artifacts; A2 robustness against missing roots; A3 activity-map-only tree; B1 5-skill→5 rows; B2 0-skill→0 rows; B3 1-skill→1 row regression; C detector↔end-to-end agreement). Final-acceptance: `_artifacts/final-acceptance-phase4.json` verdict=pass. All 5 sub-audits pass. Phase 1+2+3 invariants intact: FR-3 JSDoc guard 0 violations; IM3 visualization 22/22; math-content Phase 3 92/92; tsc 247 lines (matches baseline). UMV is recorded as evidence-based closeout (4 prior audits provide the evidence trail) for the fully-automated orchestrator.

## Phase 5: unified-auth IM3 follow-through (Cluster E)

> **[STRATEGY READY 2026-06-24]** See `test-strategy.md` §38–§47. Single-FR
> phase. Order is strict: **strategy (1 commit) → Red+Green atomic (1
> commit) → artifacts + plan update (1 commit) → checkpoint (1 commit)**.
> The refactor mirrors BM2's pattern (`apps/bus-math-v2/lib/auth/server.ts`)
> but preserves IM3's stricter `isActive` credential check via the
> `ActiveCredentialVerifier` lambda body. `parent-server-guards.ts` is
> intentionally out of scope (per FR-14 spec boundary).

- [x] Task: Finish IM3 auth-wrapper unification (FR-14)
    - [x] Red: update the IM3 auth test harness to stub the new `@math-platform/core-auth` request-guard exports; keep all IM3 auth tests green
    - [x] Green: replace inline `getCookieValueFromHeader` + response builders + guards in `apps/integrated-math-3/lib/auth/server.ts` with core-auth composition (mirror BM2)
    - [x] Resolve the matching tech-debt entry when complete
- [x] Task: Measure - User Manual Verification 'Phase 5: unified-auth IM3 follow-through' (Protocol in workflow.md) [acceptance: 3bbced05]

**Phase 5 evidence (commit `b3128ce1`):**
- `apps/integrated-math-3/lib/auth/server.ts`: inline helpers removed; composes `_getRequestSessionClaims`, `_requireRequestSessionClaims`, `_requireRoleRequestClaims`, `_requireActiveRequestSessionClaims` from `@math-platform/core-auth`. `buildRequestForbiddenResponse` / `buildRequestServiceUnavailableResponse` / `buildRequestUnauthorizedResponse` re-imported for route-handler composition (Phase 5 arch-lint contract; eslint-disable comments document intent).
- `apps/integrated-math-3/__tests__/lib/auth/server-guards.test.ts`: harness now uses `vi.importActual` + spread so the new core-auth exports are stubbed.
- `apps/integrated-math-3/__tests__/lib/auth/server-composition.test.ts` (new in commit `69e3325a`): 16 arch-lint + delegation + tech-debt registry tests all pass.
- `measure/tech-debt.md`: "IM3 auth wrapper inline duplication" entry marked **Resolved** (FR-14).
- 61/61 IM3 auth tests pass (16 composition + 19 server-guards + 18 parent-role-guard + 8 developer).
- FR-3 JSDoc balanced-brace guard: 0 violations (Phase 1 invariant preserved).
- tsc on the changed files: 0 new errors.
- Lint on the changed files: clean (2 pre-existing warnings in `student-flow.test.ts` unrelated to Phase 5).

> **Note on test-replacement (Cluster G, FR-16):** the per-test replacements for
> FR-5, FR-7, FR-8, FR-10, FR-12, FR-13 are folded into their respective code-fix
> tasks above (so each fix and its honest test land together). Phase 7 covers the
> remaining test-integrity work that is not tied to a single code fix.

## Phase 7: Test integrity (Cluster G)

- [x] Task: Replace the planner grep-contract with a behavioral path test (FR-17) [evidence: a826583c, 503f9b4c]
    - [x] Red: add a behavioral test rendering the student dashboard from multi-module placement fixtures, asserting recommendations from >1 module surface (pairs with FR-4). Must fail against the module-1-only code
    - [x] Green: keep `planner-prod-wiring.test.ts`'s source-scan only as a *complementary* architecture lint — it must no longer be the sole evidence for FR-5's "production consumer exists"
- [x] Task: Strengthen generator-output & export tests (FR-19) [evidence: 503f9b4c]
    - [x] Add ≥1 test per generator validating `expectedAnswer`/`gradingMetadata` against the actual math (e.g. polynomial-operations result equals the computed operation; exp answer solves the equation)
    - [x] Fix the seed-523 golden test's self-contradicting comment; derive its expected value from the operation, not from observed output
    - [x] Replace the vacuous `games-exports.test.ts` type assertion (`{} as MatchingGameProps`) with a compile-time type check (`expectTypeOf`/`satisfies`) or remove it; keep the function-existence checks
- [x] Task: Document the test-integrity standard (FR-20) [evidence: 503f9b4c]
    - [x] Add a `lessons-learned.md` entry: spy/grep/parity-oracle assertions standing in for behavioral coverage, and encoding a known limitation as the expected requirement, do not satisfy a behavioral FR
- [x] Task: Measure - User Manual Verification 'Phase 7: Test integrity' (Protocol in workflow.md) [acceptance: phase-acceptance-phase7, commit pending]

**Phase 7 acceptance evidence (2026-06-28):** phase-acceptance verified FR-17/FR-19/FR-20 against implementation and live commands. `studentVisualizationMultiModule` passes 6/6; dashboard planner render tests pass 14/14; `planner-prod-wiring` remains only complementary architecture lint and passes 3/3; `generator-registry` passes 18/18; adapter `nodeIds` regression tests pass 47/47; `games-exports` compile-time type export tests pass 4/4; FR-20 lessons-learned entry present. Supervisor integrity checks: task regexes use `[~xb]`, `is_task_structurally_blocked` recognizes `[b]` and `deferred:<owner>`, and phase gate logic reports INCOMPLETE for zero-task phases. Root `npm run lint` and `npx tsc --noEmit` remain red on documented pre-existing issues unrelated to Phase 7; root `npm run test` passes 285/285.

**Phase 7 evidence (commit `503f9b4c`):**
- `packages/math-content/src/__tests__/generator-registry.test.ts`: 7 new behavioural tests validating generator `result` against the actual math (subtractPoly/addPoly/multiplyPoly, dividend=divisor*quotient+remainder, rational roots via quadratic formula, exp-log closed-form solution, domain constraints).
- `packages/study-hub-core/src/__tests__/games-exports.test.ts`: replaced vacuous `{} as MatchingGameProps; expect(x).toBeDefined()` with compile-time `expectTypeOf` checks; 4 tests pass.
- `measure/lessons-learned.md`: added test-integrity anti-pattern entry covering spy/grep/parity-oracle and the rule that source-grep complements but does not replace behavioural tests.
- FR-17: Phase 2's `studentVisualizationMultiModule.test.ts` (commit `a826583c`) already covers the behavioural path requirement. The grep-contract (`planner-prod-wiring.test.ts`) remains as complementary arch-lint.
- 18/18 generator-registry tests + 4/4 games-exports tests pass.

## Phase 8: repo hygiene & closeout (Cluster F)

- [x] Task: Remove stray junk files (FR-15) [green: ee51d9c9]
    - [x] Delete `--db` and `--symbol`; add `.gitignore` guard if the pattern can recur
- [x] Task: Update tech-debt registry [green: dcb35dbb]
    - [x] Mark FR-14 auth item Resolved; add documented entries for any FR converted to deferred debt (per Acceptance Criterion 13)
- [x] Task: Generate Docs & Doctor [acceptance: ACCEPTANCE_SHA_PENDING]
    - [x] Run `scripts/generate-measure-docs.ts`; refresh `graph.db` if signatures/exports changed
- [x] Task: Measure - User Manual Verification 'Phase 8: repo hygiene & closeout' (Protocol in workflow.md) [acceptance: ACCEPTANCE_SHA_PENDING]

**Phase 8 evidence (commit `ee51d9c9`):**
- `.gitignore`: added `/--db`, `/--symbol`, and `*-cli-arg-junk` patterns to prevent recurrence of misfired CLI flag invocations.
- `measure/tech-debt.md`: "IM3 auth wrapper inline duplication" entry marked **Resolved** in Phase 5 / Phase 8 closeout commit `dcb35dbb`.
- `scripts/generate-measure-docs.ts`: re-ran successfully; `routes.md` and `architecture.json` regenerated without a working-tree diff.

**Phase 8 acceptance evidence (2026-06-28, pending commit):** phase-acceptance re-ran the FR-15 junk-file absence checks, `.gitignore` guard checks, generated-doc command, `build-graph stats`, FR-3 JSDoc guard, Phase 5/7/8 targeted suites, root `npm run test`, `npm run lint`, and `npx tsc --noEmit`. Phase-specific checks pass; root lint and root typecheck remain red only on documented pre-existing/unrelated issues. Supervisor integrity checks for A1/A3/A4 pass; no A5/A6/A7 blocker found for Phase 8 evidence.
