# Test Strategy — Responsive / Mobile Audit

> Tech Lead strategy for `responsive-mobile-audit_20260605`. Planning only — no
> implementation here. Distinguishes **artifact contract tests** (prove a doc/file has
> the required shape) from **live-behavior tests** (prove rendered/running code).

## 1. Testing Pyramid per Phase

- **Phase 1 (Audit + Guard):** Artifact base (audit doc) + narrow e2e apex (viewport
  guard infra). Almost no unit tests — this phase produces evidence and a net, not
  fixes. Intentionally artifact-heavy.
- **Phase 2 (Activities + Shell):** Unit (extracted layout-logic helpers) + component
  (hit-target / no-overflow) middle; e2e (guard on activity routes) apex.
- **Phase 3 (Teacher views + CI):** Component (responsive degradation) middle; e2e
  (teacher routes) apex; CI runner-plumbing tests. Unit only for pure helpers.

## 2. Shared Fixtures & Mocks

- `VIEWPORTS`: phone 390×844, tablet 768×1024, desktop 1280×800 (shared constant).
- `REPRESENTATIVE_ROUTES` per app — student: dashboard/lesson/activity; teacher:
  gradebook/heatmap/dashboard. Per-app registry, NOT in packages (boundary).
- **Known-bad fixture:** standalone page with deliberate `w-[200vw]` overflow, used
  only to prove the guard is non-vacuous (one-shot, see §7).
- Reuse IM3 `e2e/fixtures.ts` + `e2e/selectors.ts` (auth/seed); extend for viewport.
- Hit-target helper: query interactive els, assert bbox ≥ 44×44 (threshold shared
  with `wcag-aa-remediation_20260605`).
- Component tests mock Convex/auth via existing Testing Library patterns; Playwright
  uses the demo seed env.

## 3. Cross-Phase Edge Cases & Dependencies

- Phase 2 depends on Phase 1 audit prioritization + guard infra (project/config).
- Phase 3 depends on Phase 2 shell/nav fixes — teacher nav must be responsive before
  the dashboard guard is meaningful.
- Shared hit-target/token changes overlap the WCAG track; coordinate to avoid
  divergent token edits in `packages/app-shell` + `packages/activity-components`.
- BM2 has a `playwright.config.ts` but **no e2e dir** — Phase 1 must seed BM2's
  minimal viewport spec; BM2 standing reds excluded (see §8).
- Playwright `webServer` runs full `npm run dev:stack` (Convex) — heavy; bounded
  smoke must prefer a static/fixture route to avoid spinning the full stack.
- `graph.db` is mutated by `build-graph` read commands (stats/search/inspect) — use a
  scratch copy or `git restore graph.db`; pre-commit blocks modified `graph.db`.

## 4. Architecture Guardrails

- Token-level fixes in `packages/` (app-shell, activity-components,
  teacher-reporting-core); apps adopt. No app route lists in packages.
- Keep runners separate: viewport guard is **Playwright**, never imported into
  Vitest (`npm run test`). Add a new `viewport` project (3 device presets); do NOT
  fold into the existing `chromium` Desktop-Chrome a11y/flow project.
- No `npm install` / dep changes without approval. Playwright + @axe-core/playwright
  already present in IM3.
- Resolve paths from the test file (`fileURLToPath(import.meta.url)`), never cwd
  (lessons-learned 2026-05-03).
- `forbidOnly: !!process.env.CI` is set — never use `test.only`/`.only` in CI proofs.

## 5. Per-Phase Test Approach

- **P1:** Write the audit doc (FR1/AC1) + an **artifact contract test** asserting it
  has a prioritized failures table with severity across the 3 breakpoints and
  representative routes. Stand up the `viewport` Playwright project + guard spec;
  prove it catches overflow on the known-bad fixture (Red), then keep real-route
  cases excluded from aggregates until P3 (§7/§8).
- **P2:** TDD any layout helper (hit-target/overflow math) with unit tests; add
  component tests asserting min hit-target + no horizontal overflow at phone/tablet
  for GraphingCanvas, solver, quiz, dialog, LessonStepper, nav. Run the guard on
  remediated activity/shell routes (bounded).
- **P3:** Component tests asserting gradebook/heatmap stack-or-scroll at tablet; wire
  the `viewport` guard into CI with a bounded non-fake smoke + command-construction
  proof (§7). Final gate = AC5.

## 6. Build-Graph Findings That Shaped This Strategy

- `build-graph stats`: 14,179 nodes / 2,067 files; packages `app-shell` (12),
  `activity-components` (38), `teacher-reporting-core` (9) — the token-level fix
  homes. graph.db fresh (2026-06-20); `build-graph audit` hung (avoid in CI proofs).
- **Zero** nodes for `viewport`/`mobile`/`breakpoint` → greenfield guard; no existing
  responsive test infra to extend, build from scratch.
- Responsive-aware components already present: `HeaderSimple`, `LessonStepper`,
  `StudentNavigation`, `TeacherNavigation`, `ChartContainer` (Recharts
  ResponsiveContainer) — remediation targets + guard-covered routes.
- `GraphingCanvas` lives in `packages/activity-components` (shared) with an IM3 test
  mirror → fix at the package, mirror the test.
- Gradebook/heatmap **logic** is in `packages/teacher-reporting-core` (already
  unit-tested); P3 tests target the **UI** layer (`GradebookGrid.tsx`,
  `CompetencyHeatmapGrid.tsx`), not re-test pure logic.
- IM3 `e2e/` has 13 specs + `fixtures.ts`/`selectors.ts` (pattern to extend); BM2 has
  config only — needs a minimal spec seeded.

## 7. Live-Proof Plan (targeted Red → Green/closeout gate)

Each Red is a **bounded** command (single file/project/grep), not the full suite.
Artifact tests ≠ live tests; both labeled.

- **Phase 1 — Red (live):**
  `CI=true npx playwright test --config=apps/integrated-math-3/playwright.config.ts --project=viewport e2e/viewport-guard.spec.ts -g "known-bad fixture"`
  → MUST FAIL (overflow detected on the deliberately-bad fixture). Proves the guard
  is non-vacuous.
  **Green/closeout (artifact + plumbing):** audit doc committed + artifact contract
  test green — `CI=true npm run test --workspace=apps/integrated-math-3 -- __tests__/responsive/audit-baseline.contract.test.ts`;
  plus `CI=true npx tsc --noEmit --project apps/integrated-math-3/tsconfig.json &&
  npm run lint --workspace=apps/integrated-math-3` clean. Guard stays excluded from
  `test:e2e`/`test:a11y` (separate `viewport` project) until P3.

- **Phase 2 — Red (live):**
  `CI=true npm run test --workspace=apps/integrated-math-3 -- __tests__/components/activities/hit-target.test.tsx -t "min hit target"`
  → MUST FAIL (interactive control renders < 44px) before remediation.
  **Green/closeout (live):** that test passes +
  `CI=true npm run test --workspace=apps/integrated-math-3` (full Vitest green, no new
  reds) + tsc + lint clean + bounded guard green on remediated activity/shell routes
  (`--project=viewport -g "activity|shell"`).

- **Phase 3 — Red (live):**
  `CI=true npm run test --workspace=apps/integrated-math-3 -- __tests__/components/teacher/gradebook-responsive.test.tsx -t "tablet"`
  → MUST FAIL (gradebook overflows at tablet) before remediation.
  **Green/closeout (AC5, live + plumbing):** that test passes; viewport guard wired
  into CI. CI wiring may use a **fake harness for runner plumbing only** (stub action
  asserting the job invokes the bounded viewport command + fails on non-zero exit),
  BUT the production gate also has a **bounded non-fake smoke** that cannot fall
  through into the full suite:
  `CI=true npx playwright test --config=apps/integrated-math-3/playwright.config.ts --project=viewport e2e/viewport-guard.spec.ts -g "@smoke"`
  (single route/viewport, `--workers 1`), PLUS a **command-construction unit test**
  asserting the CI step's command string is the bounded `--project=viewport -g "@smoke"`
  invocation — NOT unbounded `npx playwright test`. Final gate: lint + `tsc --noEmit` + `npm run test --workspace=apps/integrated-math-3` + bounded smoke green.

## 8. Intentionally-Red / Standing-Red Files & Exclusion

- **Phase 1 known-bad-fixture case:** if committed in `e2e/viewport-guard.spec.ts` it
  would be red in `test:e2e`/`test:a11y`. Rule: the known-bad assertion is a
  **one-shot Red** captured in the P1 task commit note (run, observe fail, tag), then
  committed as `test.fixme(..., 'owned by P2 [~] activity remediation')` — never a
  permanently-red aggregate case; the `viewport` project stays excluded from default
  e2e/a11y aggregates until P3 CI wiring.
- **BM2 standing reds (pre-existing, NOT this track):** `__tests__/components/user-menu.test.tsx`
  (9, missing AuthProvider) + `__tests__/components/teacher/GradebookDrillDown.integration.test.tsx`
  (1, flaky timeout) — owned by `repo-hygiene-remediation_20260616` [~]. Do NOT mask (no `.skip`) or "fix" them; BM2 audit runs a bounded subset excluding these.
- **IM3 React-19 eslint rules** disabled in `apps/integrated-math-3/eslint.config.mjs`
  (20 errors/14 files) — owned by a future React-19-compliance track; do not re-enable, only avoid NEW lint violations.
- Any new helper test Red before its implementation is owned by its [~] task, scoped to a single file/grep so it cannot trip the aggregate `vitest run`.
