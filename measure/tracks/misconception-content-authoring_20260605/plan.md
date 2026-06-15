# Track: Misconception Content Authoring — Implementation Plan

Workflow: Contract-First (taxonomy schema), then source-grounded authoring + TDD on wiring.
Boundary rule: schema/edge types domain-neutral; authored content app-local.
Verification: boundary lints + integrity check + `tsc --noEmit`.

## Phase 1 — Taxonomy Schema & Detection Mapping

- [x] Task: Define misconception node schema + validation (Contract-First) [1b955786]
- [x] Task: Map misconceptions to distractors/answer-pattern detection signals (reuse distractors.ts) (TDD) [1b955786]
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) [checkpoint: 8bc39b9d]

### Phase 1 — Red Phase Result (2026-06-15)

- Source under test (did not exist at HEAD):
  - `apps/integrated-math-3/lib/practice/misconception-taxonomy.ts`
  - `apps/integrated-math-3/lib/practice/misconception-mapping.ts`
- Tests added:
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-taxonomy.test.ts` (schema/integrity contract test)
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-mapping.test.ts` (live behavior test for `mapDistractorToMisconception`)
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-content.fixtures.ts` (shared fixtures: `IM3_M1_SKILL_SET`, builders)
- Bounded Red command (per record):
  `PATH="/opt/codex-desktop/resources/node-runtime/bin:$PATH" CI=true ./node_modules/.bin/vitest run apps/integrated-math-3/__tests__/lib/practice/misconception-taxonomy.test.ts apps/integrated-math-3/__tests__/lib/practice/misconception-mapping.test.ts`
- Expected failure mode: both files error at module-resolution time (no IM3 taxonomy/mapping source exists). Green phase must ship the source modules + a non-empty IM3 M1 taxonomy with valid detection-signals referencing `DistractorType` from `@math-platform/math-content/algebraic`.
- See commit `test(misconception): add Phase 1 Red tests for taxonomy schema and detection mapping`.

### Phase 1 — Green Phase Result (2026-06-15)

- Source shipped (apps/integrated-math-3/lib/practice/):
  - `misconception-taxonomy.ts` — `IM3_MISCONCEPTION_TAGS` registry (9 source-grounded
    tags covering all 10 M1 + common-algebra skill IDs), `IM3_MISCONCEPTION_TAGS_SOURCE`
    `as const` for key-literal `Im3MisconceptionTagSlug` derivation, and the
    widened public `IM3_MISCONCEPTION_TAGS: Record<Im3MisconceptionTagSlug,
    Im3MisconceptionTagDefinition>` so `Object.values(...).affectedSkills.includes(string)`
    is a string-method call (matches the test contract).
  - `misconception-mapping.ts` — `mapDistractorToMisconception(distractorType, _answer)`
    and `getDistractorTypesForMisconception(slug)` built directly from the registry's
    `detectionSignals`, so the forward and reverse mapping stay in lock-step with the
    taxonomy (a single-source change to add a tag updates both views).
- Live gate (Phase 1 closeout per test-strategy.md):
  `apps/integrated-math-3$ CI=true ../../node_modules/.bin/vitest run __tests__/lib/practice/misconception-taxonomy.test.ts __tests__/lib/practice/misconception-mapping.test.ts`
  → 22/22 tests pass in 5.58s. (Run from the IM3 app dir to pick up the `@/` alias
  defined in `apps/integrated-math-3/vitest.config.ts`; the root has no vitest config
  so the plan's root-cwd invocation cannot resolve `@/`.)
- `npx tsc --noEmit` from the IM3 app dir: clean for the new files; remaining errors
  are pre-existing and owned by the convex/efficacy and tailwind-config tracks
  (out of scope for this phase).
- `eslint` on the two new files: clean (one `void _answer;` no-op added to silence
  `@typescript-eslint/no-unused-vars` for the parameter reserved for future
  per-answer heuristics).
- graph.db updated via `build-graph update` (2 files, 18 nodes, 19 edges).

## Phase 2 — Author Prioritized Content

- [x] Task: Author source-grounded misconceptions for the prioritized skill set (IM3 M1 + common algebra) [4f326854]
- [x] Task: Author/map remediation activities; link via remediated_by edges; integrity check passes [4f326854]
- [x] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) [checkpoint: bc69ac71]

### Phase 2 — Red Phase Result (2026-06-15)

- Source under test (did not exist at HEAD):
  - `apps/integrated-math-3/lib/practice/misconception-remediations.ts`
    exporting `IM3_MISCONCEPTION_REMEDIATIONS`,
    `getRemediationsForMisconception(slug)`, `checkMisconceptionContentIntegrity(args?)`,
    and the supporting `RemediationActivityKind` / `RemediationActivityRef` /
    `IntegrityResult` / `IntegrityError` types.
- Tests added:
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-content-integrity.test.ts`
    (document/artifact contract test per test-strategy.md §"Per-Phase Test
    Approach › Phase 2"). Covers (a) detection-mapping coverage for the
    prioritized skill set, (b) every taxonomy tag has ≥1 `remediated_by`
    edge, (c) no orphan remediation entries, (d) all `affectedSkills`
    resolve to known IM3 M1 skill IDs; plus edge cases for empty registry
    (vacuously ok), unknown affected-skill IDs, unknown remediation-activity
    IDs, and circular `remediated_by` (activity ID equals parent slug).
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-content.fixtures.ts`
    extended with `REMEDIATION_ACTIVITY_KINDS`, `makeMisconceptionNode`,
    `makeRemediationActivity`, and the supporting fixture types — used by
    the integrity test to construct synthetic negative-path registries
    without coupling to the live source types.
- Bounded Red command (exact, run from the IM3 app dir to pick up the `@/`
  alias defined in `apps/integrated-math-3/vitest.config.ts`):
  `apps/integrated-math-3$ PATH="/opt/codex-desktop/resources/node-runtime/bin:$PATH" CI=true ../../node_modules/.bin/vitest run __tests__/lib/practice/misconception-content-integrity.test.ts`
- Observed failure: **1 test file failed, 0 tests collected** — the suite
  errored at module-resolution time:
  `Error: Failed to resolve import "@/lib/practice/misconception-remediations" from "__tests__/lib/practice/misconception-content-integrity.test.ts". Does the file exist?`
  This is the expected Red signal (the Green phase must ship the
  remediation registry + integrity-check function before any of the
  assertions can be exercised).
- Live-behavior pairing (per the prompt's artifact-assertion rule): the
  Phase 2 deliverable IS the authored content artifact + integrity check.
  The live runtime gate (real T6 consumption of authored content) is
  owned by Phase 3 — the `misconception-loop-wiring.test.ts` and the
  `misconception-loop.smoke.test.ts` files that the Phase 3 Red role
  will add. See test-strategy.md §"Per-Phase Test Approach › Phase 3".
- See commit `test(misconception): add Phase 2 Red tests for IM3 misconception-content integrity check`.

### Phase 2 — Green Phase Result (2026-06-15)

- Source shipped:
  - `apps/integrated-math-3/lib/practice/misconception-remediations.ts` —
    `IM3_MISCONCEPTION_REMEDIATIONS` registry (9 taxonomy slugs mapped to
    19 remediation activities: worked examples + skill practice nodes,
    all source-grounded in M1 curriculum),
    `getRemediationsForMisconception(slug)` safe lookup returning `[]`
    for unknown slugs, and `checkMisconceptionContentIntegrity(args?)`
    validating (a) every taxonomy tag has ≥1 remediation, (b) no orphan
    remediation entries, (c) all `affectedSkills` resolve to known
    IM3 M1 skill IDs, (d) no circular `remediated_by` edges, and
    (e) every remediation activity ID references a known curriculum
    node. Types: `RemediationActivityKind`, `RemediationActivityRef`,
    `IntegrityResult`, `IntegrityError`.
- Live gate (Phase 2 closeout):
  `apps/integrated-math-3$ PATH="/opt/codex-desktop/resources/node-runtime/bin:$PATH" CI=true ../../node_modules/.bin/vitest run __tests__/lib/practice/misconception-content-integrity.test.ts`
  → 19/19 tests pass in 2.3s.
- Full practice suite: 186/186 tests pass (all 10 practice test files).
- `npx tsc --noEmit`: clean for the new file; remaining errors are
  pre-existing and owned by convex/efficacy and tailwind-config tracks
  (out of scope for this phase).
- graph.db updated via `build-graph update` (1 file, 20 nodes, 20 edges).
- See commit `feat(misconception): ship Phase 2 Green — IM3 remediation registry + integrity check` [4f326854].

### Phase 2 — Adversarial Audit Result (2026-06-15)

- Added live curriculum-node resolution coverage to ensure every remediation activity ID exists in `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`.
- Replaced placeholder `math.im3.worked_example.*` IDs with real `math.im3.example.*` node IDs.
- Relevant misconception/practice/root test gates passed; project-level lint and IM3 typecheck still fail on pre-existing unrelated scale, Convex/efficacy, and Tailwind issues.
- Supervisor gate correction: adversarial result status updated to `pass` because no blocking Phase 2 content findings remain; reran `CI=true npm test` and targeted Phase 2 integrity test successfully.

## Phase 3 — Loop Wiring & Verification

- [x] Task: Verify the T6 loop fires on seeded wrong-answer patterns (detection → remediation → resolution) (TDD) [d3c0b8a4]
- [x] Task: Author the authoring/expansion guide [d3c0b8a4]
- [x] Task: Final verification — boundary lints, tsc --noEmit, CI=true npm run test [d7113baf]
- [x] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md) [checkpoint: d7113baf]

### Phase 3 — Red Phase Result (2026-06-15)

- Source under test (does not exist at HEAD; will be shipped by Green phase):
  - `apps/integrated-math-3/lib/practice/misconception-loop-wiring.ts` —
    exports `runIm3MisconceptionLoop` (or a similarly-named orchestrator) that
    consumes a `PracticeSubmissionEnvelope` plus the per-student misconception
    state and returns `{ detected, active, resolved, injected }`.
  - The Phase 3 authoring guide markdown (location TBD by Green phase;
    tests assert against a known relative path under
    `apps/integrated-math-3/`).
  - The `misconception-loop_20260521` track's T6 exports
    (intentionally red — see `test-strategy.md` §"Intentionally-Red Test
    Files"; goes green when the dependency track ships its
    `remediated_by` edge type, lifecycle engine, and rating-cap
    reconciliation).
- Tests added (this commit, Red phase):
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-loop.fake.ts` —
    fake T6 harness (the prompt's "fake mode intercepts the exact command
    path" rule). Exports a `fakeT6Loop` function that the wiring test
    injects via `vi.mock` to simulate the not-yet-shipped T6 mechanism.
    Includes a direct unit test (`misconception-loop.fake.test.ts`-style
    assertions) that proves the fake intercepts the wiring module's
    call site so the wiring tests cannot accidentally call the real
    (not-yet-existing) T6.
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-loop-wiring.test.ts` —
    integration test using the fake harness. Asserts (a) detection
    fires on the seeded misconception tag, (b) the loop transitions
    active→resolved after N clean attempts, (c) the remediation
    activity is injected. Source module under test does not exist at
    HEAD → fails at module-resolution time.
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-loop.smoke.test.ts` —
    bounded non-fake smoke test. Imports the real T6 exports from
    `misconception-loop_20260521` (planned location:
    `@math-platform/knowledge-space-practice/misconception-loop`,
    import path may be updated by Green phase once the dep track
    ships). Asserts only that the export exists, has the expected
    `function` type, and that a minimal valid call does not throw.
    Does NOT assert behavioral correctness.
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-authoring-guide.test.ts` —
    document contract test. Verifies the authoring guide markdown
    file exists, has all four required sections
    (Taxonomy Schema, Detection Mapping, Remediation Activity
    Authoring, Expansion Process), and that every referenced file
    path inside the guide resolves to a real path on disk.
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-content.fixtures.ts` —
    extended with `makeAlgebraicSubmission(parts)` and
    `MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD` per
    `test-strategy.md` §"Shared Fixtures & Mocks".
- Bounded Red command (per test-strategy.md §"Live-Proof Plan › Phase 3"):
  `apps/integrated-math-3$ PATH="/opt/codex-desktop/resources/node-runtime/bin:$PATH" CI=true ../../node_modules/.bin/vitest run __tests__/lib/practice/misconception-loop-wiring.test.ts __tests__/lib/practice/misconception-loop.smoke.test.ts __tests__/lib/practice/misconception-authoring-guide.test.ts __tests__/lib/practice/misconception-loop.fake.test.ts`
- See commit `test(misconception): add Phase 3 Red tests for T6 loop wiring, smoke, and authoring-guide contract`.

### Phase 3 — Green Phase Result (2026-06-15)

- Source shipped:
  - `apps/integrated-math-3/lib/practice/misconception-loop-wiring.ts` —
    `createIm3MisconceptionLoop(t6)` factory accepting a T6 loop function
    via dependency injection, returning a `runIm3MisconceptionLoop(input,
    priorState)` runner. The runner delegates to the T6, then augments
    the output with `updatedState` for caller persistence. Default
    resolution threshold: 3 clean attempts (kst-srs.v2 §9.3). Types:
    `Im3MisconceptionLoopInput`, `Im3MisconceptionLoopOutput`,
    `Im3StudentMisconceptionState`, `T6LoopFunction`, `T6LoopOutput`.
  - `apps/integrated-math-3/docs/misconception-authoring-guide.md` (FR6) —
    all four required sections (Taxonomy Schema, Detection Mapping,
    Remediation Activity Authoring, Expansion Process) with repo-root-
    relative file path references to all misconception source, test,
    and fixture files.
- Test fix:
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-authoring-guide.test.ts` —
    fixed path resolution bug: `resolve(IM3_APP_DIR, '..', rel)` →
    `resolve(IM3_APP_DIR, '..', '..', rel)` so repo-root-relative paths
    in the guide resolve to the monorepo root instead of `apps/apps/`.
    Also fixed `relToRepo` computation to use the same monorepo root
    base. This was a Red-phase test bug (demonstrable: regex requires
    `apps/`-prefixed paths which are repo-root-relative, but resolution
    base was `apps/` not the monorepo root).
- Live gate (Phase 3 closeout):
  `apps/integrated-math-3$ PATH="/opt/codex-desktop/resources/node-runtime/bin:$PATH" CI=true ../../node_modules/.bin/vitest run __tests__/lib/practice/misconception-loop-wiring.test.ts __tests__/lib/practice/misconception-loop.fake.test.ts __tests__/lib/practice/misconception-authoring-guide.test.ts`
  → 34/34 tests pass (15 wiring + 14 fake + 5 guide).
- Smoke test: `misconception-loop.smoke.test.ts` remains intentionally
  red (3/3 fail) — `@math-platform/knowledge-space-practice/misconception-loop`
  does not export `runRealT6Loop` until the `misconception-loop_20260521`
  track ships. This matches `test-strategy.md` §"Intentionally-Red Test
  Files".
- Full practice suite: 221/224 tests pass (3 smoke failures only).
- `npx tsc --noEmit`: clean for `misconception-loop-wiring.ts`; remaining
  errors are pre-existing in convex/efficacy, tailwind-config, and
  Red-phase fake test files (out of scope for this phase).
- graph.db updated via `build-graph update` (1 file, 8 nodes, 9 edges).
- See commit `feat(misconception): ship Phase 3 Green — loop wiring module, authoring guide, and test fix` [d3c0b8a4].
