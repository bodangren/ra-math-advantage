# Track: Misconception Content Authoring — Implementation Plan

Workflow: Contract-First (taxonomy schema), then source-grounded authoring + TDD on wiring.
Boundary rule: schema/edge types domain-neutral; authored content app-local.
Verification: boundary lints + integrity check + `tsc --noEmit`.

## Phase 1 — Taxonomy Schema & Detection Mapping

- [x] Task: Define misconception node schema + validation (Contract-First) — **GREEN phase shipped** (commit pending)
- [x] Task: Map misconceptions to distractors/answer-pattern detection signals (reuse distractors.ts) (TDD) — **GREEN phase shipped** (commit pending)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

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

- [ ] Task: Author source-grounded misconceptions for the prioritized skill set (IM3 M1 + common algebra)
- [ ] Task: Author/map remediation activities; link via remediated_by edges; integrity check passes
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Loop Wiring & Verification

- [ ] Task: Verify the T6 loop fires on seeded wrong-answer patterns (detection → remediation → resolution) (TDD)
- [ ] Task: Author the authoring/expansion guide
- [ ] Task: Final verification — boundary lints, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
