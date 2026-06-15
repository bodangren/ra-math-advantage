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
- [x] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) [checkpoint: pending]

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

## Phase 3 — Loop Wiring & Verification

- [ ] Task: Verify the T6 loop fires on seeded wrong-answer patterns (detection → remediation → resolution) (TDD)
- [ ] Task: Author the authoring/expansion guide
- [ ] Task: Final verification — boundary lints, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
