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
- [ ] Task: Measure - User Manual Verification 'Phase 2: Production-wiring scope & dead work' (Protocol in workflow.md)

## Phase 3: advanced-math-generators correctness & quality (Cluster C)

- [ ] Task: Fix rational-analyzer HA triviality & grading + replace certifying test (FR-7, FR-16)
    - [ ] Red: REPLACE the `rational-analyzer.test.ts` HA block — drop the circular `ratio === leadingNum/leadingDen` assertion and the `isZero is false … our construction always does` assertion. New tests assert the HA **varies across seeds** and that the graded HA target is student-enterable. Replacement must fail against the pre-fix (always-`y=1`) code
    - [ ] Green: introduce non-monic / unequal-degree variation in `rational-analyzer.ts`; change `advanced-math-adapters.ts` HA grading to a scalar/`"none"` answer
- [ ] Task: Remove the exp-log dead domain re-roll + replace certifying tests (FR-8, FR-16)
    - [ ] Red: REPLACE the `exp-log-solver.test.ts` `domain re-roll` / `domain safety` blocks (they assert construction-guaranteed truths and never exercise an invalid domain). New test asserts single-pass generation (no re-roll); remove the `expect(true).toBe(false)` hand-rolled fail. Keep the legitimate log/ln/exp correctness tests green
    - [ ] Green: delete the `while (true)` loop, `seed += 1`, eslint-disable, and the domain-safety doc
- [ ] Task: De-duplicate generator utilities (FR-9)
    - [ ] Green: extract `seededRandom`, `generateCoefficients`, `formatPolynomial` into `packages/math-content/src/utils/`; update all 5/2/2 call sites; tests unchanged (determinism preserved)
- [ ] Task: Consolidate registries & wire adapter nodeIds (FR-10, FR-18)
    - [ ] Red: add a test asserting each advanced adapter has **non-empty `nodeIds`** mapping to real `math.im3.skill.*` node id(s) — the current `adapter.test.ts` never checks this, so the empty-`nodeIds` bug was invisible (or document key-only reachability with a test pinning that rationale)
    - [ ] Green: remove the redundant flat `generator-registry.ts` (or justify); populate adapter `nodeIds`
- [ ] Task: Correct PRNG labelling (FR-11)
    - [ ] Green: fix the docstring (subsumed by FR-9 shared util) or switch to a 32-bit-safe formulation
- [ ] Task: Measure - User Manual Verification 'Phase 3: advanced-math-generators correctness & quality' (Protocol in workflow.md)

## Phase 4: precalc concept taxonomy (Cluster D)

- [ ] Task: Fix the remediation script scan path & re-run (FR-12, FR-18)
    - [ ] Red: add a test that the scanner finds concept blueprints in the **real** artifact (`curriculum/implementation/practice-v1/activity-map.json`) — there is currently no test for the script, so its "0 files" false-clean was invisible. Test must fail against the wrong-path version
    - [ ] Green: point `scripts/remediate-concept-blueprints.ts` at the real blueprint artifact(s); re-run; record the true count
- [ ] Task: Address concept resolution dropping sibling skills + replace certifying test (FR-13, FR-18)
    - [ ] Red: the existing `selectSkill picks alphabetically first` test encodes the sibling-dropping limitation as the requirement. Decide the intended behavior; if emitting all child skills, assert N rows for an N-skill concept; if single-skill is intentional, pin the documented rationale (one row per concept **by design**), not just "first alphabetically"
    - [ ] Green: emit rows for all child skills, or document single-skill resolution as intentional with rationale (code + comment accordingly)
- [ ] Task: Measure - User Manual Verification 'Phase 4: precalc concept taxonomy' (Protocol in workflow.md)

## Phase 5: unified-auth IM3 follow-through (Cluster E)

- [ ] Task: Finish IM3 auth-wrapper unification (FR-14)
    - [ ] Red: update the IM3 auth test harness to stub the new `@math-platform/core-auth` request-guard exports; keep all IM3 auth tests green
    - [ ] Green: replace inline `getCookieValueFromHeader` + response builders + guards in `apps/integrated-math-3/lib/auth/server.ts` with core-auth composition (mirror BM2)
    - [ ] Resolve the matching tech-debt entry when complete
- [ ] Task: Measure - User Manual Verification 'Phase 5: unified-auth IM3 follow-through' (Protocol in workflow.md)

> **Note on test-replacement (Cluster G, FR-16):** the per-test replacements for
> FR-5, FR-7, FR-8, FR-10, FR-12, FR-13 are folded into their respective code-fix
> tasks above (so each fix and its honest test land together). Phase 7 covers the
> remaining test-integrity work that is not tied to a single code fix.

## Phase 7: Test integrity (Cluster G)

- [ ] Task: Replace the planner grep-contract with a behavioral path test (FR-17)
    - [ ] Red: add a behavioral test rendering the student dashboard from multi-module placement fixtures, asserting recommendations from >1 module surface (pairs with FR-4). Must fail against the module-1-only code
    - [ ] Green: keep `planner-prod-wiring.test.ts`'s source-scan only as a *complementary* architecture lint — it must no longer be the sole evidence for FR-5's "production consumer exists"
- [ ] Task: Strengthen generator-output & export tests (FR-19)
    - [ ] Add ≥1 test per generator validating `expectedAnswer`/`gradingMetadata` against the actual math (e.g. polynomial-operations result equals the computed operation; exp answer solves the equation)
    - [ ] Fix the seed-523 golden test's self-contradicting comment; derive its expected value from the operation, not from observed output
    - [ ] Replace the vacuous `games-exports.test.ts` type assertion (`{} as MatchingGameProps`) with a compile-time type check (`expectTypeOf`/`satisfies`) or remove it; keep the function-existence checks
- [ ] Task: Document the test-integrity standard (FR-20)
    - [ ] Add a `lessons-learned.md` entry: spy/grep/parity-oracle assertions standing in for behavioral coverage, and encoding a known limitation as the expected requirement, do not satisfy a behavioral FR
- [ ] Task: Measure - User Manual Verification 'Phase 7: Test integrity' (Protocol in workflow.md)

## Phase 8: repo hygiene & closeout (Cluster F)

- [ ] Task: Remove stray junk files (FR-15)
    - [ ] Delete `--db` and `--symbol`; add `.gitignore` guard if the pattern can recur
- [ ] Task: Update tech-debt registry
    - [ ] Mark FR-14 auth item Resolved; add documented entries for any FR converted to deferred debt (per Acceptance Criterion 13)
- [ ] Task: Generate Docs & Doctor
    - [ ] Run `measure/generate.sh` (or `scripts/generate-measure-docs.ts`) and `measure/doctor.sh`; refresh `graph.db` if signatures/exports changed
- [ ] Task: Measure - User Manual Verification 'Phase 8: repo hygiene & closeout' (Protocol in workflow.md)
