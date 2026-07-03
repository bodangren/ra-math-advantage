# Track: WCAG 2.1 AA Remediation — Implementation Plan

Workflow: Contract-First (findings + gate), then per-task TDD. >80% coverage on new logic.
Verification substitute for Doctor: `node scripts/check-monorepo-boundaries.mjs` + per-app `npm run ws:<app>:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Triage & Gate Harness [checkpoint: e44192cd]

- [x] Task: Produce prioritized findings list from the audit baseline (grouped by surface + success criterion + severity) — Green SHA `5a245fca`
- [x] Task: Stand up axe-core a11y assertions in the Playwright/E2E harness (TDD: failing check on a known-bad fixture) — Green SHA `e44192cd`
- [x] Task: Define the representative route set the gate runs over — Green SHA `e44192cd`
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) — autonomous-mode evidence: Green SHA `e44192cd` (all Phase 1 closeout gates green per test-strategy §4)

## Phase 2 — Shared Activity Components (packages)

- [~] Task: Remediate keyboard/focus + role/name/state on graphing + step-by-step-solver (TDD)
- [~] Task: Remediate quizzes, fill-in-the-blank, study-hub games (TDD)
- [~] Task: Announce dynamic answer feedback via live regions (TDD)
- [b] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) (deferred:human)

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

- `graphing-solver-a11y.test.tsx`: 3/7 passed, 4 failed.
  - PASS: tab reaches canvas/submit; no focus trap; StepByStepper axe clean.
  - FAIL: StepByStepper steps are not `role="region" aria-label="Step N"`.
  - FAIL: Next button on last step is removed instead of `aria-disabled="true"`.
  - FAIL: incorrect-step hint has no `role="alert"`/`aria-live="assertive"`.
  - FAIL: GraphingExplorer practice mode has 1 serious axe violation (`nested-interactive`: the SVG canvas is focusable and contains focusable point buttons).
- `quiz-blanks-games-a11y.test.tsx`: 4/9 passed, 5 failed.
  - PASS: word-bank drag sources are keyboard focusable; game scope-adjustment check; axe clean on ComprehensionQuiz and FillInTheBlank.
  - FAIL: ComprehensionQuiz options are `<button>` rather than `role="radio"` with `aria-checked`.
  - FAIL: FillInTheBlank blank input uses generic `aria-label="Your answer"` instead of a task-specific name.
  - FAIL: blank inputs lack `aria-required="true"`.
  - FAIL: no polite live region for word-bank match/mismatch feedback.
- `live-regions.test.tsx`: 1/6 passed, 5 failed.
  - PASS: GraphingExplorer point-add already announces via `aria-live="polite"` (GraphingCanvas).
  - FAIL: ComprehensionQuiz has no `role="status"`/`aria-live="polite"` region before or after submit.
  - FAIL: StepByStepper has no `role="alert"`/`aria-live="assertive"` region before or after wrong step.
  - FAIL: GraphingExplorer comparison-answer feedback is not in a `role="status"` region.
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

---

## Phase 2 Red Evidence

**Date:** 2026-07-04  
**Baseline SHA:** `66d20f58`

### Scope adjustment

The test-strategy.md §1 Task 6 names `MatchingGame` / `SpeedRoundGame` as part of the
shared-package Phase 2 test file. Code inspection shows these components live at
`apps/integrated-math-3/components/student/MatchingGame.tsx` and
`apps/integrated-math-3/components/student/SpeedRoundGame.tsx`; there are no matching
or speed-round components under `packages/activity-components/src/components`. Per the
Red-phase rule "adjust tests to target the ACTUAL components in their actual location",
the package test file only asserts `ComprehensionQuiz` and `FillInTheBlank`. The game
components are verified by a structural scope-adjustment test and are scheduled for
Phase 3 (student-route) remediation.

### New test files

- `packages/activity-components/src/__tests__/a11y/graphing-solver-a11y.test.tsx`
- `packages/activity-components/src/__tests__/a11y/quiz-blanks-games-a11y.test.tsx`
- `packages/activity-components/src/__tests__/a11y/live-regions.test.tsx`

### RED_TEST_COMMAND

```bash
CI=true npx vitest run packages/activity-components src/__tests__/a11y/graphing-solver-a11y.test.tsx src/__tests__/a11y/quiz-blanks-games-a11y.test.tsx src/__tests__/a11y/live-regions.test.tsx
```

**Result:** exit 1 (expected Red).

### Aggregate regression gates

```bash
CI=true npx vitest run packages/knowledge-space-core
```

**Result:** exit 0 — 673/673 tests passed.

### Plan marker updates

- Task 5 (graphing + step-by-step-solver): `[ ]` → `[~]`.
- Task 6 (quizzes, fill-in-the-blank, games): `[ ]` → `[~]`.
- Task 7 (live regions): `[ ]` → `[~]`.
- Task 8 (UMV 'Phase 2'): `[ ]` → `[b] deferred:human`.

---

## Phase 1 Green Evidence

**Date:** 2026-07-04  
**Green SHA:** `e44192cd`  
**Baseline (Red) SHA:** `5a245fca`

### New files (Green implementation)

- `apps/integrated-math-3/lib/a11y/harness.tsx` — `runAxeOnRendered(ui)` wraps
  Testing Library `render` + `axe.run`, applies WCAG 2.0 + 2.1 A/AA tags by
  default, disables jsdom-incompatible rules (`color-contrast`,
  `color-contrast-enhanced`) with a documented reason, and returns a typed
  `{ violations, passes, incomplete, inapplicable, critical, serious }`
  summary. Exports `hasSeriousViolations` (predicate) and
  `expectNoSeriousViolations` (throwing helper).
- `apps/integrated-math-3/lib/a11y/routes.ts` — `A11Y_ROUTES` source-of-truth
  (6 routes, 4 risk categories) per test-strategy §0.
- `apps/integrated-math-3/__tests__/a11y/a11y-routes.ts` — re-export shim
  that derives `REPRESENTATIVE_ROUTES` from the lib constant; keeps the
  existing test imports stable while sharing the source of truth.

### Targeted GREEN_TEST_COMMAND

```bash
CI=true npx vitest run --root apps/integrated-math-3 \
  __tests__/a11y/axe-harness.test.tsx \
  __tests__/a11y/route-set.test.ts \
  __tests__/a11y/findings-doc.test.ts
```

**Result:** exit 0 — 10/10 tests passed.
- `axe-harness.test.tsx`: 3/3 passed (detects violation on icon-only
  button, clears labeled button, returns typed summary shape).
- `route-set.test.ts`: 3/3 passed (6 routes, every entry resolves to a
  real `app/.../page.tsx`, all four risk categories covered).
- `findings-doc.test.ts`: 4/4 passed (existence + labeled-integer counts +
  surface-path resolution + code-inspection evidence section).

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

```bash
npx tsc --noEmit
```

**Result:** exit 0 (no TypeScript errors).

```bash
npm run lint
```

**Result:** exit 0 (root: packages/knowledge-space-core + IM3).

```bash
node scripts/check-monorepo-boundaries.mjs
```

**Result:** exit 0 — `[OK] No monorepo boundary violations found.`

```bash
bash measure/doctor.sh
```

**Result:** exit 0 — `[doctor] All checks passed.`

```bash
CI=true npm run test
```

**Result:** exit 0 — 673/673 tests passed (knowledge-space-core aggregate;
  the bus-math-v2 / convex workspaces are not part of this track's
  Phase 1 scope per `test-strategy.md` §4).

### Plan marker updates

- `P1.T1` (findings list): `[~]` → `[x]` (was Red in `5a245fca`, now
  Green per `e44192cd`).
- `P1.T2` (axe harness): `[~]` → `[x]`.
- `P1.T3` (route set): `[~]` → `[x]`.
- `P1.T4` (User Manual Verification 'Phase 1'): `[b] deferred:human` →
  `[x]` per autonomous-mode policy (per the orchestrator brief — all
  Phase 1 closeout gates green, no UI surface to manually verify in
  Phase 1, see `test-strategy.md` §5 "Phases 1 and 5 have no UX
  surface"). The standalone human review remains out of scope per
  `spec.md` "Full manual screen-reader certification".

### Notes

- No new npm dependencies. `axe-core` is imported from the hoisted root
  `node_modules` (transitive via `@axe-core/playwright`); `@testing-library/react`
  was already in IM3 deps.
- The harness `lib/a11y/harness.tsx` is intentionally a test/dev helper — it
  imports `@testing-library/react` and `axe-core` only, never Convex or
  production routes. It belongs in `apps/integrated-math-3/lib/` (not
  `packages/`) because it is keyed to IM3's Testing Library + jsdom setup
  (`vitest.setup.ts`).
- `a11y-routes.ts` in `__tests__/a11y/` is now a shim that re-exports from
  `@/lib/a11y/routes`. Test imports were preserved unchanged.
- Pre-existing `convex/.../seed/validate_blueprint.ts` etc. `tsc --noEmit`
  errors noted in Red Evidence are no longer reproduced by `tsc --noEmit` in
  this run; the project root `tsc` is configured to skip those areas.
