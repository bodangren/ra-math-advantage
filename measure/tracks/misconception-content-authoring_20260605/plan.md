# Track: Misconception Content Authoring — Implementation Plan

Workflow: Contract-First (taxonomy schema), then source-grounded authoring + TDD on wiring.
Boundary rule: schema/edge types domain-neutral; authored content app-local.
Verification: boundary lints + integrity check + `tsc --noEmit`.

## Phase 1 — Taxonomy Schema & Detection Mapping

- [~] Task: Define misconception node schema + validation (Contract-First) — **RED phase written; awaiting Green implementation**
- [~] Task: Map misconceptions to distractors/answer-pattern detection signals (reuse distractors.ts) (TDD) — **RED phase written; awaiting Green implementation**
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

### Phase 1 — Red Phase Result (2026-06-15)

- Source under test (does not exist yet):
  - `apps/integrated-math-3/lib/practice/misconception-taxonomy.ts`
  - `apps/integrated-math-3/lib/practice/misconception-mapping.ts`
- Tests added:
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-taxonomy.test.ts` (schema/integrity contract test)
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-mapping.test.ts` (live behavior test for `mapDistractorToMisconception`)
  - `apps/integrated-math-3/__tests__/lib/practice/misconception-content.fixtures.ts` (shared fixtures: `IM3_M1_SKILL_SET`, builders)
- Bounded Red command:
  `PATH="/opt/codex-desktop/resources/node-runtime/bin:$PATH" CI=true ./node_modules/.bin/vitest run apps/integrated-math-3/__tests__/lib/practice/misconception-taxonomy.test.ts apps/integrated-math-3/__tests__/lib/practice/misconception-mapping.test.ts`
- Expected failure mode: both files error at module-resolution time (no IM3 taxonomy/mapping source exists). Green phase must ship the source modules + a non-empty IM3 M1 taxonomy with valid detection-signals referencing `DistractorType` from `@math-platform/math-content/algebraic`.
- See commit `test(misconception): add Phase 1 Red tests for taxonomy schema and detection mapping`.

## Phase 2 — Author Prioritized Content

- [ ] Task: Author source-grounded misconceptions for the prioritized skill set (IM3 M1 + common algebra)
- [ ] Task: Author/map remediation activities; link via remediated_by edges; integrity check passes
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Loop Wiring & Verification

- [ ] Task: Verify the T6 loop fires on seeded wrong-answer patterns (detection → remediation → resolution) (TDD)
- [ ] Task: Author the authoring/expansion guide
- [ ] Task: Final verification — boundary lints, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
