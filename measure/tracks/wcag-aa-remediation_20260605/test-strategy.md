# Test Strategy — WCAG 2.1 AA Remediation

Track: `wcag-aa-remediation_20260605`
Baseline SHA: `796176c7ecf05a2968c8a434edc98bcda3a74e88`
Role: measure-strategy (track setup)
Authored: 2026-07-04

This strategy is the **falsifiable** contract for every Red/Green cycle in the
track. Every test named below has a stated falsification condition (what makes
it fail). A phase is Green only when its named tests pass AND the closeout gate
commands exit 0. No plan task may claim "violations fixed" unless the axe proof
test for that surface is green (A5/A6 defense).

---

## §0 Scope and Conventions

### Surfaces in scope

| Surface | Owner | Why |
|---------|-------|-----|
| `apps/integrated-math-3/` student + teacher routes | IM3 app | Primary activity + route surface; most violations expected here |
| `packages/activity-components/` shared primitives | Shared package | Remediation here propagates to IM1/IM2/IM3/PreCalc (Practice Primitives Program) |
| `apps/integrated-math-3/e2e/accessibility.spec.ts` | IM3 e2e | Existing Playwright+axe harness — Phase 5 CI wires it, Red/Green does NOT run it (needs dev server) |

**Out of scope:** BM2/IM1/IM2/PreCalc app-level routes (they inherit shared-package
fixes only). Full Playwright crawl of all ~20 IM3 routes. WCAG AAA. New components.

### Representative route set (6 routes, not all)

The Phase 1 route-set constant lists exactly these 6, chosen to cover all four
risk categories (forms, landmarks, activities, color-only state) without
crawling every route:

1. `/auth/login` — unauthenticated form (label, button-name)
2. `/student/dashboard` — landmarks, nav, progress cards
3. `/student/lesson/[lessonSlug]` — activity components + phase nav (highest value)
4. `/student/practice` — daily practice, completion live regions
5. `/teacher/dashboard` — teacher nav, cards
6. `/teacher/gradebook` — heatmap, color-only state (highest-value teacher route)

### axe-core in jsdom (Red/Green), Playwright in CI (Phase 5 only)

- **Red/Green unit tests** use `axe-core` (v4.11.4, hoisted in root `node_modules`
  as a transitive dep of `@axe-core/playwright`) imported directly into vitest
  jsdom tests: `import axe from 'axe-core'` → `axe.run(container, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] } })`.
- **No new npm dependencies.** `@axe-core/playwright`, `@playwright/test`,
  `axe-core`, `vitest`, `@testing-library/react`, `@testing-library/user-event`
  are all already installed.
- **jsdom limitations** (must be respected or tests are vacuous — A4 defense):
  - `color-contrast` does NOT run in jsdom (no real `getComputedStyle`). Phase 4
    contrast tests are **token-math tests** (parse oklch, compute WCAG ratio),
    NOT axe scans.
  - `keyboard` axe rule checks tabindex/role semantics, NOT real key presses.
    Real keyboard operability is tested via `userEvent.tab()` / `.keyboard()`
    in Testing Library.
  - Rules that DO work in jsdom: `label`, `button-name`, `link-name`,
    `image-alt`, `aria-required-attr`, `region`, `heading-order`, `tabindex`,
    `aria-valid-attr`.
- **Playwright `e2e/accessibility.spec.ts`** requires a live Convex+vinext dev
  server (`npm run dev:stack`). This is NOT feasible in autonomous Red/Green.
  It is wired as the Phase 5 CI gate target and proven via a vitest injection
  test, NOT a live crawl.

### Intentionally-red aggregate handling

- The package aggregate `CI=true npx vitest run packages/knowledge-space-core packages/activity-components`
  will pick up new `packages/activity-components/src/__tests__/a11y/*.test.tsx`
  files during Phase 2. **During Phase 2 Red these are intentionally red.**
- The aggregate is run only at **Green** (after remediation), never at Red. Red
  uses targeted file paths only. This prevents the "aggregate is red, mark
  phase blocked" false-negative AND the "exclude the new files to force green"
  A7 over-broad-filter trap.
- No a11y test file is added to a vitest `exclude` glob to make a suite green.
  Any `exclude` must be documented with a reason in the test file header.

### Test style

Vitest + Testing Library (jsdom), matching the existing IM3 pattern
(`__tests__/student/transfer-credit/transfer-credit-card.test.tsx`). Role/name
assertions via `screen.getByRole(..., { name: /.../ })`. Keyboard via
`userEvent.tab()` / `userEvent.keyboard()`. axe via `axe.run(container, ...)`.

### Task-count reconciliation

The plan has **17 visible `[ ]` checkboxes** (4+4+3+3+3). `metadata.estimated_tasks=18`.
`actual_tasks` is set to 18 per orchestrator instruction; the 17-vs-18 drift is
logged in `metadata.deviation_notes` and reconciled at Phase 1 Task 1 (findings
list). This is an A5 defense: the count is truthful, not rounded to match.

---

## §1 Phase-by-Phase Test Matrix

Each task maps to: Red test file(s), test case groups, FR/AC covered, and
falsification condition.

### Phase 1 — Triage & Gate Harness (4 tasks)

#### Task 1 — Produce prioritized findings list

- **Type:** artifact + structural guard (documentation test, not live behavior).
- **Artifact:** `measure/tracks/wcag-aa-remediation_20260605/findings.md`
- **Red test:** `apps/integrated-math-3/__tests__/a11y/findings-doc.test.ts`
  - Group A — file exists and is non-empty.
  - Group B — has sections per severity (`Critical`, `Serious`, `Moderate`,
    `Minor`) with labeled integer counts (`Critical: N`), parsed as ints (A3 defense).
  - Group C — every surface reference resolves to a real file (route page.tsx
    or component .tsx) via `glob` — no phantom surfaces (A5 defense).
  - Group D — at least one finding sourced from code inspection (e.g.
    `rg -n '<button' components/ | rg -v 'aria-label'` evidence path documented).
- **FR/AC:** FR1, AC1.
- **Falsification:** findings.md missing → fail. Counts not labeled ints → fail
  (A3). A cited surface path that doesn't resolve → fail (A5). Zero code-sourced
  findings → fail (A4 vacuous-pass).
- **Note:** Findings are derived from code inspection + the audit-report.md
  expected-violations table, NOT a live axe scan (no dev server in autonomous).

#### Task 2 — Stand up axe-core a11y assertions in harness (TDD)

- **Type:** live-behavior proof (harness self-test).
- **Red test:** `apps/integrated-math-3/__tests__/a11y/axe-harness.test.tsx`
  - Group A — `axe.run` on a **known-bad fixture** (`<button><Icon /></button>`
    with no accessible name) returns ≥1 `button-name` violation. Proves the
    harness can detect violations.
  - Group B — `axe.run` on a **known-good fixture** (`<button aria-label="Save">Save</button>`)
    returns zero violations. Proves the harness doesn't false-positive.
  - Group C — harness helper `runAxeOnRendered(container)` is exported and
    returns `{ violations, critical, serious }` with typed shape.
- **FR/AC:** FR6 (gate harness), AC5 (proof-test foundation).
- **Falsification:** axe returns 0 violations on the bad fixture → harness is
  broken/not wired → fail. Axe returns violations on the good fixture →
  misconfiguration → fail.
- **Gate:** `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/axe-harness.test.tsx`

#### Task 3 — Define representative route set

- **Type:** artifact (constants) + structural guard.
- **Artifact:** `apps/integrated-math-3/__tests__/a11y/a11y-routes.ts` exporting
  `REPRESENTATIVE_ROUTES: string[]` (6 entries).
- **Red test:** `apps/integrated-math-3/__tests__/a11y/route-set.test.ts`
  - Group A — `REPRESENTATIVE_ROUTES.length === 6` (labeled-integer parse, not
    bare digit — A3).
  - Group B — each route resolves to a real `app/.../page.tsx` (dynamic
    `[lessonSlug]` resolves to the lesson route file).
  - Group C — route set covers all 4 risk categories (one form route, one
    activity route, one color-state route, one landmark route) — documented in
    a comment and asserted by category tags.
- **FR/AC:** FR6 (representative route set), AC2 scope.
- **Falsification:** length ≠ 6 → fail. A route with no page.tsx → fail (A5).
  Missing a risk category → fail (A4 — vacuous coverage).
- **Gate:** `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/route-set.test.ts`

#### Task 4 — Measure User Manual Verification 'Phase 1'

- **Type:** phase-gate checkpoint (no new test file). Orchestrator runs the
  Phase 1 closeout gate matrix (§4) and the manual verification protocol from
  `measure/workflow.md`.
- **Falsification:** any Phase 1 closeout command exits non-zero → phase not
  complete.

### Phase 2 — Shared Activity Components (4 tasks)

All Red tests live under `packages/activity-components/src/__tests__/a11y/`.
Gate runs via package-scoped vitest.

#### Task 5 — Remediate graphing + step-by-step-solver (keyboard, role/name/state)

- **Red test:** `packages/activity-components/src/__tests__/a11y/graphing-solver-a11y.test.tsx`
  - Group A — `GraphingExplorer` in practice mode: tab reaches every interactive
    control (sliders, buttons, canvas operable region); no element traps focus
    (Tab forward cycles back to first control after last).
  - Group B — `StepByStepper`: each step is a region with an accessible name
    (`role="region" aria-label="Step N"`); the "Next step" button has
    `aria-disabled` when on last step, announced via `aria-live`.
  - Group C — axe on rendered `GraphingExplorer` + `StepByStepper` (teaching +
    practice modes) → zero `critical`/`serious` violations.
- **FR/AC:** FR2, FR3, FR5.
- **Falsification:** tab order skips a control → fail. Focus trapped → fail.
  axe `serious` violation → fail.
- **Gate:** `CI=true npx vitest run packages/activity-components src/__tests__/a11y/graphing-solver-a11y.test.tsx`

#### Task 6 — Remediate quizzes, fill-in-the-blank, study-hub games

- **Red test:** `packages/activity-components/src/__tests__/a11y/quiz-blanks-games-a11y.test.tsx`
  - Group A — `ComprehensionQuiz`: each option is a radio with a label
    associated via `aria-labelledby` or wrapped `<label>`; selected state
    announced.
  - Group B — `FillInTheBlank`: each blank input has an accessible name
    (visible label or `aria-label` referencing the prompt); `aria-required`
    when applicable.
  - Group C — `MatchingGame` / `SpeedRoundGame`: drag sources and drop targets
    are keyboard-operable (arrow keys or tab+enter); live region announces
    matches/mis-matches.
  - Group D — axe on each component → zero `critical`/`serious`.
- **FR/AC:** FR3, FR5.
- **Falsification:** a blank input with no accessible name → fail. A
  drag-and-drop with no keyboard alternative → fail (A4 vacuous if the test
  only checks render, not interaction).
- **Gate:** `CI=true npx vitest run packages/activity-components src/__tests__/a11y/quiz-blanks-games-a11y.test.tsx`

#### Task 7 — Announce dynamic answer feedback via live regions

- **Red test:** `packages/activity-components/src/__tests__/a11y/live-regions.test.tsx`
  - Group A — `ComprehensionQuiz` after submit: a `role="status"` /
    `aria-live="polite"` region updates with "Correct" / "Incorrect" text,
    queryable via `findByText` after `waitFor`.
  - Group B — `StepByStepper` after wrong step: `role="alert"` /
    `aria-live="assertive"` region shows the error.
  - Group C — `GraphingExplorer` after point-add: `aria-live="polite"` announces
    the new coordinates.
  - Group D — assertion that the live region exists in the DOM **before** the
    async update (live region must be present at render, not injected late —
    common axe `aria-atomic`/timing bug).
- **FR/AC:** FR3, FR5.
- **Falsification:** feedback text appears but no `aria-live` ancestor → fail.
  Live region injected only after update (screen readers miss it) → fail.
- **Gate:** `CI=true npx vitest run packages/activity-components src/__tests__/a11y/live-regions.test.tsx`

#### Task 8 — Measure User Manual Verification 'Phase 2'

- **Falsification:** package aggregate red → fail. Closeout gate non-zero → fail.

### Phase 3 — Student Routes (3 tasks)

#### Task 9 — Remediate lesson/phase navigation + dashboard

- **Red test:** `apps/integrated-math-3/__tests__/a11y/student-nav-layout.test.tsx`
  - Group A — `StudentNavigation` renders a skip-to-content link as the first
    focusable element (`<a href="#main" class="skip-link">`); tabbing from the
    top of the page reaches it first.
  - Group B — active nav item has `aria-current="page"`; non-active items do
    not.
  - Group C — `LessonPageLayout` has exactly one `h1`; phase headings are `h2`
    (no `h1 → h3` jumps — axe `heading-order`).
  - Group D — main content is wrapped in `<main id="main">` (or
    `role="main"`); nav is `<nav aria-label="...">`.
  - Group E — phase transition moves focus to the new phase heading (assert
    `document.activeElement` after `userEvent.click(nextPhaseButton)`).
- **FR/AC:** FR2, FR3, AC3.
- **Falsification:** no skip link → fail. No `aria-current` on active → fail.
  Heading jump h1→h3 → fail. Focus not moved on phase transition → fail.
- **Gate:** `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/student-nav-layout.test.tsx`

#### Task 10 — Remediate daily-practice + completion states

- **Red test:** `apps/integrated-math-3/__tests__/a11y/daily-practice-completion.test.tsx`
  - Group A — `DailyPracticeCard` progress is `role="progressbar"` with
    `aria-valuenow/min/max` (existing pattern — assert it survives).
  - Group B — `CompletionScreen` announces completion via `role="status"` /
    `aria-live="polite"` when mounted.
  - Group C — `PracticeSessionProvider` session-end moves focus to a
    "Session complete" heading.
  - Group D — axe on rendered daily-practice card + completion → zero
    `critical`/`serious`.
- **FR/AC:** FR2, FR3, FR5, AC3.
- **Falsification:** progressbar missing aria-value* → fail. Completion not
  announced → fail.
- **Gate:** `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/daily-practice-completion.test.tsx`

#### Task 11 — Measure User Manual Verification 'Phase 3'

- **Falsification:** targeted IM3 transfer-credit regression suite red → fail
  (regression guard). Closeout gate non-zero → fail.

### Phase 4 — Teacher Routes & Color/Contrast (3 tasks)

#### Task 12 — Remediate gradebook, heatmaps, dashboards (no color-only; AA tokens)

- **Red test:** `apps/integrated-math-3/__tests__/a11y/gradebook-color-state.test.tsx`
  - Group A — `GradebookGrid` cell color is NOT the only signal: each
    `cellBgClass(cell.color)` cell also has a text label (e.g. "M" / "P" / "L")
    or `aria-label` (e.g. "Mastery: 85%"). Assert via `screen.getByRole` /
    `getByLabelText`.
  - Group B — `CompetencyHeatmapGrid` color cells have an `aria-label`
    describing the value, not just the color.
  - Group C — color tokens used for status (success/warning/destructive) are
    paired with an icon or text (the existing `aria-hidden` icons already
    satisfy this for some — assert coverage).
- **FR/AC:** FR4.
- **Falsification:** a status cell with only `className` color and no text/aria
  → fail. This is the A4 analog for color (vacuous "has className" pass).
- **Gate:** `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/gradebook-color-state.test.tsx`

- **Red test (token math, not axe):** `apps/integrated-math-3/__tests__/a11y/contrast-tokens.test.ts`
  - Group A — parse oklch tokens from `DESIGN.md` frontmatter (or the
    `globals.css` / tailwind config). Compute WCAG contrast ratio for each
    text/background pairing (foreground/background, muted-foreground/background,
    destructive/background, primary/on-primary).
  - Group B — assert each ratio ≥ 4.5:1 (normal text) or ≥ 3:1 (large text /
    non-text). Print the computed ratio on failure (labeled float, not bare
    digit — A3).
  - Group C — assert chart colors (chart-1..5) are distinguishable by a
    non-color channel (luminance rank differs by ≥ 0.15 OR paired with a
    pattern/icon) — defends against color-blind reliance.
- **FR/AC:** FR4.
- **Falsification:** any text/bg pair < 4.5:1 → fail with the labeled ratio
  printed. Color-only chart distinction → fail.
- **Note:** This is a pure-math test (oklch → linear sRGB → relative luminance
  → contrast ratio). No jsdom, no axe. Documented in test header.

#### Task 13 — Remediate forms/dialogs (assignment UI, interventions)

- **Red test:** `apps/integrated-math-3/__tests__/a11y/teacher-forms-dialogs.test.tsx`
  - Group A — `SubmissionDetailModal`: focus is trapped inside the modal while
    open (Tab from last focusable wraps to first); focus returns to the
    triggering button on close (Escape or backdrop click).
  - Group B — `RosterImportWizard` form inputs: each has a `<label htmlFor>` or
    `aria-label` (existing `aria-label="Class name"` etc. — assert all fields
    covered).
  - Group C — `InterventionActions` toggles have `aria-pressed` reflecting
    state; icon-only buttons have `aria-label`.
  - Group D — axe on rendered modal + forms → zero `critical`/`serious`.
- **FR/AC:** FR2, FR3, AC3.
- **Falsification:** focus escapes modal → fail. A form input with no label →
  fail. Icon button with no aria-label → fail.
- **Gate:** `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/teacher-forms-dialogs.test.tsx`

#### Task 14 — Measure User Manual Verification 'Phase 4'

- **Falsification:** any Phase 4 closeout command non-zero → fail.

### Phase 5 — CI Gate & Verification (3 tasks)

#### Task 15 — Wire a11y gate into CI; prove it fails on injected violation

- **Type:** gate-proof test (the AC5 proof test).
- **Red test:** `apps/integrated-math-3/__tests__/a11y/ci-gate-proof.test.tsx`
  - Group A — render a **known-bad fixture** (`<button><svg /></button>` with
    no accessible name) through the same `runAxeOnRendered` helper from
    Phase 1 Task 2. Assert the helper returns ≥1 `critical`/`serious`
    violation. This proves the gate would fail CI on a regression.
  - Group B — render a **known-good fixture** through the helper. Assert zero
    violations. This proves the gate passes clean code.
  - Group C — assert that `e2e/accessibility.spec.ts` still exists and
    references `AxeBuilder` with `withTags(['wcag2aa'])` (the CI gate target is
    not silently deleted — A9 defense against archive-move drift).
  - Group D — assert the CI workflow file (`.github/workflows/ci.yml` or
    equivalent) contains a step referencing `test:a11y` or the a11y gate
    script. If wiring is via a new script, assert the script exists in
    `package.json` scripts.
- **FR/AC:** FR6, AC5.
- **Falsification:** helper returns 0 violations on the bad fixture → gate is
  broken → fail (A5 — the proof test IS the A5 defense). Good fixture returns
  violations → misconfig → fail. CI workflow missing the gate step → fail.
- **Gate:** `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/ci-gate-proof.test.tsx`
- **Realistic scope note:** This is a **vitest-based axe injection test**, NOT a
  full Playwright crawl. A live Convex+vinext dev server is not feasible in
  autonomous CI. The proof test demonstrates the gate's failure mode; the
  Playwright spec remains the human-run audit tool.

#### Task 16 — Final verification (boundary lints, per-app lint, tsc, full test)

- **Type:** closeout gate (no new test file). Runs `PROJECT_TESTS`,
  `PROJECT_LINT`, `PROJECT_CHECKS`.
- **Falsification:** any command non-zero → fail.

#### Task 17 — Measure User Manual Verification 'Phase 5'

- **Falsification:** closeout gate non-zero → fail.

---

## §2 Adversarial Test Plan

Beyond the per-task matrix, these cross-cutting adversarial cases must appear
in the named test files. Each has a specific attack it refutes.

| Adversarial case | Test file | Attack refuted | Falsification |
|------------------|-----------|----------------|---------------|
| **Keyboard trap** in activity panel | `graphing-solver-a11y.test.tsx` | "Tab gets stuck inside the graphing controls" | Tab from last control does not reach `document.body` next sibling within 20 tab presses → fail |
| **Color-only meaning** in gradebook | `gradebook-color-state.test.tsx` | "Mastery shown only by green/yellow/red cell" | A cell whose only state signal is `className` color and no text/aria → fail |
| **Icon-only button with no name** | `teacher-forms-dialogs.test.tsx`, `axe-harness.test.tsx` | "Lucide icon button has no aria-label" | `screen.getByRole('button', { name: /.../ })` throws → fail; axe `button-name` violation → fail |
| **Focus not restored on modal close** | `teacher-forms-dialogs.test.tsx` | "Escape closes modal but focus goes to body" | `document.activeElement` after close ≠ triggering button → fail |
| **Heading-level jump** in lesson | `student-nav-layout.test.tsx` | "h1 → h3 in lesson phases" | axe `heading-order` violation → fail |
| **Live region injected late** | `live-regions.test.tsx` | "aria-live div added after async update — screen reader misses it" | Live region not present in initial render → fail |
| **axe strict mode** (no rule disables) | `axe-harness.test.tsx` | "Test disables rules to force green (A7)" | Any `rules: { 'rule-id': { enabled: false } }` in the harness without a documented reason in a comment → fail |
| **Token contrast drift** | `contrast-tokens.test.ts` | "oklch muted-foreground too light on background" | Ratio < 4.5:1 → fail with labeled ratio printed |
| **Proof test can't catch a regression** | `ci-gate-proof.test.tsx` | "Gate passes on injected bad fixture (A5)" | Helper returns 0 violations on bad fixture → fail |
| **Skip link not first** | `student-nav-layout.test.tsx` | "Skip link is in DOM but after the nav, so tab order is wrong" | First focusable element on the page is not the skip link → fail |
| **aria-current misapplied** | `student-nav-layout.test.tsx` | "All nav items get aria-current='page'" | More than one element with `aria-current="page"` → fail |

---

## §3 Anti-Pattern Defenses

Per-phase mapping of A1–A12 (all apply per the orchestrator brief) to the
specific defense in this strategy.

### A1 — Substring-as-structured-signal in supervisor

- **Defense:** Not directly in product code, but the findings-doc guard test
  (`findings-doc.test.ts` Group B) parses labeled integers
  (`Critical:\s+(\d+)`) instead of substring-matching "critical". A digit found
  in a date or year does not satisfy the regex.
- **Phase:** 1 (Task 1).

### A2 — Consent-blind publish gate

- **Defense (analog):** The CI gate must not "publish" a route as accessible
  without an axe scan. The `ci-gate-proof.test.tsx` Group A proves the gate
  fails on un-scanned bad code. The gate cannot pass by stub — it must execute
  `axe.run`.
- **Phase:** 5 (Task 15).

### A3 — Digit-only as a "labeled count"

- **Defense:** All count assertions in findings-doc and route-set tests use
  labeled-integer regex parses, never bare `expect(count).toBeGreaterThan(0)`
  on an unverified digit. Contrast tests print labeled floats
  (`ratio=4.2:1`), not bare numbers.
- **Phase:** 1 (Task 1, Task 3), 4 (Task 12).

### A4 — Vacuous-pass on nothing-done

- **Defense:** Each phase's Green gate requires ≥1 a11y test file that asserts
  a **positive behavior** (role present, keyboard event reached target, live
  region updated), not just "component renders without throwing". The
  "markers consistent" analog: a phase reporting Green with zero `[x]`
  remediation commits is INCOMPLETE — the closeout gate runs the named test
  files, which fail if no remediation landed.
- **Phase:** all.

### A5 — False-claim text vs test reality (HIGH RISK)

- **Defense:** This is the central risk of an a11y track ("all violations
  fixed" with no scan). The `ci-gate-proof.test.tsx` is the executable A5
  guard: it injects a known-bad fixture and asserts the gate catches it. No
  plan task may say "zero violations" unless the corresponding axe test is
  green. The strategy explicitly forbids writing "all checks pass" in plan
  text until the named test exits 0.
- **Phase:** 1 (Task 2 harness), 5 (Task 15 proof).

### A6 — Registry-note overstatement

- **Defense:** `measure/tracks.md` and `plan.md` must not say "WCAG AA
  compliant" or "resolved" until the Phase 5 proof test is green. The
  strategy's closeout checklist (§6) requires the proof test green as a
  prerequisite for any compliance claim.
- **Phase:** 5 (closeout).

### A7 — Over-broad filter swallowing real hits

- **Defense:** No a11y test file is added to a vitest `exclude` glob. Any axe
  rule disable (`rules: { 'color-contrast': { enabled: false } }`) must be
  documented with a reason in a comment; the `axe-harness.test.tsx` Group C
  asserts no undocumented disables. The aggregate-suite handling (§0) forbids
  excluding new files to force green.
- **Phase:** 1 (Task 2), 2 (aggregate).

### A8 — `[ ]` (space) marker ambiguity

- **Defense:** The strategy uses only `[ ]` (pending), `[~]` (in progress),
  `[x]` (completed) markers per the workflow. No `[b]` (blocked) markers are
  introduced by this strategy. The supervisor regex `r"^- \[([~xb])\] (.+)"`
  is not modified (A12 peer-review rule).
- **Phase:** all (plan hygiene).

### A9 — Pre-existing test references archived track paths

- **Defense:** The findings-doc guard references
  `measure/tracks/wcag-aa-remediation_20260605/findings.md` (the LIVE track
  dir), NOT `measure/archive/accessibility-audit_20260502/audit-report.md`
  (the archived template). The archive template is read as a reference input
  only. The `ci-gate-proof.test.tsx` Group C asserts
  `e2e/accessibility.spec.ts` still exists at its live path (not archived).
- **Phase:** 1 (Task 1), 5 (Task 15).

### A10 — Generated-facts drift after structural change

- **Defense:** This track adds no generated docs. The route-set constant
  (`a11y-routes.ts`) is hand-maintained and guarded by `route-set.test.ts`
  Group B (each route resolves to a real page.tsx). If a route is added/removed
  later, the guard fails until the constant is updated — no auto-generation
  drift.
- **Phase:** 1 (Task 3).

### A11 — Missing live Measure contract-test suite

- **Defense:** The track contributes live guard tests under
  `apps/integrated-math-3/__tests__/a11y/` (vitest) and does not delete the
  existing `e2e/accessibility.spec.ts`. The `ci-gate-proof.test.tsx` is the
  executable guard suite entry point. If the suite is deleted, Phase 5 closeout
  fails (the proof test is a closeout prerequisite).
- **Phase:** 1 (Task 2), 5 (Task 15).

### A12 — Missing supervisor peer-review rule in AGENTS.md

- **Defense:** This strategy does NOT modify `measure/automation-supervisor.py`
  or `AGENTS.md`. The peer-reviewed-component rule is respected by reference.
  No product-track work touches the supervisor.
- **Phase:** all (governance).

---

## §4 Gate Command Matrix per Phase

| Phase | Red command (expect FAIL) | Green command (expect PASS) | Closeout gate |
|-------|---------------------------|-----------------------------|---------------|
| **1** | `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/axe-harness.test.tsx __tests__/a11y/route-set.test.ts __tests__/a11y/findings-doc.test.ts` | same (expect PASS) | `npm run lint` + `npx tsc --noEmit` + `node scripts/check-monorepo-boundaries.mjs` |
| **2** | `CI=true npx vitest run packages/activity-components src/__tests__/a11y/graphing-solver-a11y.test.tsx src/__tests__/a11y/quiz-blanks-games-a11y.test.tsx src/__tests__/a11y/live-regions.test.tsx` | same + package aggregate `CI=true npx vitest run packages/knowledge-space-core packages/activity-components` | `npm run lint` + `npx tsc --noEmit` + `node scripts/check-monorepo-boundaries.mjs` |
| **3** | `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/student-nav-layout.test.tsx __tests__/a11y/daily-practice-completion.test.tsx` | same + regression guard `CI=true npx vitest run --root apps/integrated-math-3 __tests__/student/transfer-credit __tests__/teacher/transfer-credit` | `npm run lint` + `npx tsc --noEmit` + `node scripts/check-monorepo-boundaries.mjs` |
| **4** | `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/gradebook-color-state.test.tsx __tests__/a11y/contrast-tokens.test.ts __tests__/a11y/teacher-forms-dialogs.test.tsx` | same (expect PASS) | `npm run lint` + `npx tsc --noEmit` + `node scripts/check-monorepo-boundaries.mjs` |
| **5** | `CI=true npx vitest run --root apps/integrated-math-3 __tests__/a11y/ci-gate-proof.test.tsx` | same (expect PASS — gate catches injection) | `PROJECT_TESTS`: `CI=true npm run test && CI=true npx vitest run --root apps/integrated-math-3 __tests__/student/transfer-credit __tests__/teacher/transfer-credit` + `npm run lint` + `npx tsc --noEmit` + `node scripts/check-monorepo-boundaries.mjs` |

**Notes:**
- Red commands target only the new a11y test files for that phase. They MUST
  fail (tests not yet satisfied). If a Red command passes, the test is vacuous
  (A4) — stop and rewrite the test.
- Green commands add the aggregate / regression guard to catch collateral
  damage.
- Closeout gates are the same `PROJECT_CHECKS` (`npx tsc --noEmit && node
  scripts/check-monorepo-boundaries.mjs`) + `PROJECT_LINT` at every phase;
  Phase 5 adds the full `PROJECT_TESTS`.
- The full `npm run ws:im3:test` is NOT a gate (times out at 180s per prior
  track convention). Targeted IM3 subsets are the gate.

---

## §5 UX Review Plan

`UX_REQUIRED=auto`. Phases 1 and 5 have no UX surface (Phase 1 is harness +
findings; Phase 5 is the automated CI gate proof). Phases 2–4 modify UI.

### Phase 2 UX (activity components)

- **Scope:** keyboard-operability proof for graphing, solver, quiz, blanks,
  matching/speed-round.
- **Method:** Testing Library `userEvent.tab()` / `.keyboard()` sequences
  embedded in the a11y test files (§1 Tasks 5–7). No separate UX artifact.
- **Falsification:** a control that renders but cannot be reached/operated by
  keyboard → the test fails.

### Phase 3 UX (student routes)

- **Scope:** keyboard walkthrough of one full lesson flow: dashboard → lesson
  card → lesson page → phase nav → activity → completion.
- **Method:** `student-nav-layout.test.tsx` Group E (focus moves on phase
  transition) + `daily-practice-completion.test.tsx` Group B/C (completion
  announced + focus moved). The "one full lesson" walkthrough is represented
  by the composite of these tests, not a single mega-test (mega-tests are
  fragile and hide which step failed).
- **Falsification:** any step in the flow where focus is lost, a control is
  unreachable, or a state change is unannounced → the corresponding test
  fails.

### Phase 4 UX (teacher routes)

- **Scope:** keyboard walkthrough of teacher dashboard → gradebook → student
  detail modal (open, interact, close, focus restored).
- **Method:** `teacher-forms-dialogs.test.tsx` Group A (focus trap + restore)
  + `gradebook-color-state.test.tsx` Group A (color not the only signal).
- **Falsification:** focus escapes the modal, or a gradebook cell is
  color-only → fail.

### Phase 5 UX

- **None.** Phase 5 is the automated CI gate proof test. No manual UX review
  in autonomous mode. A real human screen-reader walkthrough is documented in
  `findings.md` as a deferred follow-up (out of autonomous scope per the spec's
  Out of Scope: "Full manual screen-reader certification across every route").

### UX review artifact

Because this is autonomous mode (`UX_REQUIRED=auto`), the "manual verification"
tasks (Tasks 4, 8, 11, 14, 17) are satisfied by: (a) the Green gate passing,
(b) the adversarial keyboard tests in §2 passing, and (c) a one-paragraph
summary appended to the plan checkpoint commit message documenting which flows
were covered by tests. No separate UX report file is produced unless the
orchestrator requests one.

---

## §6 Closeout Evidence Checklist

The track may closeout only when ALL of the following are true. Each item is
falsifiable (has a command or file whose absence/emptiness fails it).

- [ ] `measure/tracks/wcag-aa-remediation_20260605/findings.md` exists, is
  non-empty, has labeled-integer severity counts, and every cited surface
  resolves to a real file. (Guard: `findings-doc.test.ts`)
- [ ] `apps/integrated-math-3/__tests__/a11y/axe-harness.test.tsx` green —
  harness detects a known-bad fixture and clears a known-good fixture.
- [ ] `apps/integrated-math-3/__tests__/a11y/route-set.test.ts` green — 6
  routes, all resolve, cover 4 risk categories.
- [ ] All Phase 2 a11y tests green in `packages/activity-components`.
- [ ] All Phase 3 a11y tests green in `apps/integrated-math-3`.
- [ ] All Phase 4 a11y tests green, including `contrast-tokens.test.ts`
  (labeled ratios ≥ 4.5:1).
- [ ] `ci-gate-proof.test.tsx` green — the gate FAILS on an injected
  serious violation (AC5). This is the A5 defense and the AC2 evidence.
- [ ] `PROJECT_TESTS` green: `CI=true npm run test` + targeted IM3
  transfer-credit regression.
- [ ] `PROJECT_LINT` green: `npm run lint`.
- [ ] `PROJECT_CHECKS` green: `npx tsc --noEmit` + `node scripts/check-monorepo-boundaries.mjs`.
- [ ] `plan.md` all tasks `[x]` with commit SHAs; no `[~]` or `[ ]` remaining.
- [ ] `measure/tracks.md` entry updated to reflect completion (no "resolved" /
  "WCAG compliant" language until the proof test above is green — A6).
- [ ] No new npm dependencies added (AGENTS guardrail). Verify `git diff
  package.json package-lock.json` shows no dep additions for this track.
- [ ] No modifications to `measure/automation-supervisor.py` or `AGENTS.md`
  (A12).

---

## §7 Realistic Scope Notes

1. **No live dev server in autonomous CI.** The Playwright
   `e2e/accessibility.spec.ts` is the human-run audit tool, NOT the autonomous
   gate. The autonomous gate is the vitest axe-injection proof test
   (`ci-gate-proof.test.tsx`). This is a deliberate scope boundary, not a
   shortcut; it is documented in `findings.md` and tech-debt if the team later
   wants a live crawl.
2. **6 representative routes, not all ~20.** Crawling every route would
   multiply test maintenance without proportional coverage gain. The 6 routes
   cover all 4 risk categories. Additional routes can be added to
   `a11y-routes.ts` later without strategy change.
3. **jsdom axe limitations.** `color-contrast` and visual-layout rules do not
   run in jsdom. Contrast is covered by the pure-math `contrast-tokens.test.ts`.
   Visual layout (reflow, target-size) is out of scope for autonomous mode and
   noted as deferred.
4. **Shared-package fixes propagate.** Phase 2 fixes in
   `packages/activity-components` benefit IM1/IM2/IM3/PreCalc. App-level
   routes in IM1/IM2/PreCalc are NOT remediated in this track (out of scope);
   they inherit only the shared-component fixes.
5. **No new dependencies.** `axe-core` is imported from the hoisted root
   `node_modules` (transitive via `@axe-core/playwright`). If a future phase
   needs `eslint-plugin-jsx-a11y` (currently in package-lock but NOT wired
   into `eslint.config.mjs`), that requires explicit approval per AGENTS
   guardrails and is out of scope for this track.
6. **Task count reconciliation.** Plan has 17 visible checkboxes (4+4+3+3+3).
   `actual_tasks=18` per orchestrator instruction; the 17-vs-18 drift is
   logged in `metadata.deviation_notes` and reconciled at Phase 1 Task 1. This
   is an A5 defense (truthful counts).
