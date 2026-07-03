# Track: WCAG 2.1 AA Remediation — Implementation Plan

Workflow: Contract-First (findings + gate), then per-task TDD. >80% coverage on new logic.
Verification substitute for Doctor: `node scripts/check-monorepo-boundaries.mjs` + per-app `npm run ws:<app>:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Triage & Gate Harness

- [~] Task: Produce prioritized findings list from the audit baseline (grouped by surface + success criterion + severity)
- [~] Task: Stand up axe-core a11y assertions in the Playwright/E2E harness (TDD: failing check on a known-bad fixture)
- [~] Task: Define the representative route set the gate runs over
- [b] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) (deferred:human)

## Phase 2 — Shared Activity Components (packages)

- [ ] Task: Remediate keyboard/focus + role/name/state on graphing + step-by-step-solver (TDD)
- [ ] Task: Remediate quizzes, fill-in-the-blank, study-hub games (TDD)
- [ ] Task: Announce dynamic answer feedback via live regions (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Student Routes

- [ ] Task: Remediate lesson/phase navigation + dashboard (keyboard, landmarks, headings) (TDD where logic exists)
- [ ] Task: Remediate daily-practice + completion states
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Teacher Routes & Color/Contrast

- [ ] Task: Remediate gradebook, heatmaps, dashboards — no color-only meaning; AA contrast tokens (TDD on tokens)
- [ ] Task: Remediate forms/dialogs (assignment UI, interventions)
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5 — CI Gate & Verification

- [ ] Task: Wire the a11y gate into CI; prove it fails on an injected serious violation
- [ ] Task: Final verification — boundary lints, per-app lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)

---

## Phase 1 Red Evidence

**Date:** 2026-07-04  
**Baseline SHA:** `790c3028`

### New test files

- `apps/integrated-math-3/__tests__/a11y/findings-doc.test.ts`
- `apps/integrated-math-3/__tests__/a11y/axe-harness.test.tsx`
- `apps/integrated-math-3/__tests__/a11y/route-set.test.ts`
- `apps/integrated-math-3/__tests__/a11y/a11y-routes.ts` (test data module)
- `measure/tracks/wcag-aa-remediation_20260605/findings.md` (documentation artifact)

### RED_TEST_COMMAND

```bash
CI=true npx vitest run --root apps/integrated-math-3 \
  __tests__/a11y/axe-harness.test.tsx \
  __tests__/a11y/route-set.test.ts \
  __tests__/a11y/findings-doc.test.ts
```

**Result:** exit 1 (expected Red).  
- `findings-doc.test.ts`: 4/4 passed.
- `route-set.test.ts`: 3/3 passed.
- `axe-harness.test.tsx`: failed to resolve `@/lib/a11y/harness` — the harness helper does not exist yet, which is the intended TDD seam.

### Aggregate regression gates

```bash
CI=true npx vitest run packages/knowledge-space-core
```

**Result:** exit 0 — 673/673 tests passed.

```bash
CI=true npx vitest run --root apps/integrated-math-3 \
  __tests__/student/transfer-credit __tests__/teacher/transfer-credit
```

**Result:** exit 0 — 64/64 tests passed.

### Lint

```bash
npm run lint
```

**Result:** exit 0 (run from `apps/integrated-math-3`).

### Notes

- `npx tsc --noEmit` shows pre-existing errors in `convex/seed/validate_blueprint.ts`, `convex/teacher/content-authoring.ts`, `convex/teacher/srs_mutations.ts`, `lib/srs/__tests__/rest-adapter-stub.ts`, `lib/teacher/content-authoring/*`, and `tailwind.config.ts`. No new errors were introduced by the Phase 1 test files.
- Task 4 (User Manual Verification 'Phase 1') is structurally blocked and deferred to human review per the autonomous-mode UX plan in `test-strategy.md` §5.
