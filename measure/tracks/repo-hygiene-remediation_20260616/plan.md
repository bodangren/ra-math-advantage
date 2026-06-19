# Implementation Plan: Repository Hygiene Remediation

## Phase 1: Commit Outstanding Track Work

- [x] Task 1.1: Commit the fix-kst-node-titles parser fix and regenerated curriculum
  - [x] Stage `packages/math-content/src/knowledge-space/extraction/parser.ts` and its test
  - [x] Stage all 93 curriculum files (class-period-packages, activity-map, audit, class-period plans, aleks, lesson submodules)
  - [x] Stage `measure/skill-graph-inventory-audit.md` and `measure/tracks.md`
  - [x] Commit: `fix(parser): split semicolon-separated titles 1:1 with example numbers + regenerate curriculum` (292deda5)
  - [x] Verify `git status --short` returns empty (or only new track files)

## Phase 2: Resolve Remaining Stashes

- [x] Task 2.1: Evaluate each stash
  - [x] stash@{0}: "unrelated: efficacy-core A/B testing" — create WIP branch or drop
  - [x] stash@{1-4}: "learning-efficacy-analytics_20260605" — create WIP branch
  - [x] stash@{5}: "kst-lesser-holes: park spec-compliance Phase 3 dirty paths" — drop (superseded by spec-compliance track)
  - [x] Verify `git stash list` returns empty

## Phase 3: Fix BM2 Pre-existing Test Reds

- [x] Task 3.1: Fix UserMenu test — point mock at the resolved AuthProvider module
  - [x] File: `apps/bus-math-v2/__tests__/components/user-menu.test.tsx`
  - [x] Root cause: `packages/app-shell/src/components/UserMenu.tsx:3` imports `useAuth` via the package-relative path `../auth/AuthProvider`. Mocking `@/components/auth/AuthProvider` (app-level re-export) or `@math-platform/app-shell/auth` (package barrel subpath) does not intercept that module record — the real `useAuth` runs and throws "useAuth must be used within an AuthProvider" in all 9 tests.
  - [x] Fix: compute the absolute path to `packages/app-shell/src/auth/AuthProvider.tsx` inside `vi.hoisted` and pass that to `vi.mock`. Also mock `@math-platform/app-shell/auth` as defense-in-depth for any consumer that imports through the barrel.
  - [x] Verified: `npx vitest run __tests__/components/user-menu.test.tsx` → was 9 failed (all `useAuth must be used within an AuthProvider`); now 5 passed / 4 failed. The 4 remaining failures are unrelated to mock resolution — they assert a Dashboard link not implemented in `UserMenu` (see Task 3.1b).
  - [x] Commit: 540473fa

- [x] Task 3.1b: Implement role-aware Dashboard link in `<UserMenu>` (deferred from Task 3.1)
  - [x] File: `packages/app-shell/src/components/UserMenu.tsx`
  - [x] `UserMenu` already accepts a `dashboardHref` prop (declared on line 13) but never renders a Dashboard link or branches on `profile.role`.
  - [x] Test expectations (see `apps/bus-math-v2/__tests__/components/user-menu.test.tsx` lines 134–177, plus the new Red contract file `apps/bus-math-v2/__tests__/components/user-menu-dashboard-link.test.tsx`):
    - Render a "Dashboard" link inside the dropdown menu when authenticated.
    - `profile.role === 'student'` → href `/student/dashboard`.
    - `profile.role === 'teacher'` or `'admin'` → href `/teacher/dashboard`.
  - [x] Decide: hard-code the role→href mapping, or accept a `dashboardHref` map / `getDashboardHref(profile)` callback. Existing `dashboardHref?: string` prop suggests the latter is more composable; review `apps/bus-math-v2` and other consumers for current call sites before changing the API.
  - [x] Verify: 9/9 tests in `user-menu.test.tsx` pass, plus 4/4 new cases in `user-menu-dashboard-link.test.tsx` turn green.
  - [x] Commit: f07e1253
  - **Red evidence (Mid attempt 2, 2026-06-19):** New test file `user-menu-dashboard-link.test.tsx` was added (3 positive role cases + 1 negative unauthenticated case). By code inspection of `packages/app-shell/src/components/UserMenu.tsx` (rendered body: `Sign in` link in unauthenticated branch, then `displayName`, `email`, `Settings` link, and `Log out` button — no element with text "Dashboard" anywhere in the JSX), the 3 positive cases will throw "Unable to find an element with the text: Dashboard" before reaching the `closest('a')` assertion. The negative case is the only one expected to pass at HEAD. Bounded Red command: `npx vitest run __tests__/components/user-menu-dashboard-link.test.tsx` — expected 3 failed / 1 passed at HEAD. The 4 existing Dashboard cases in `user-menu.test.tsx` (lines 141–183, committed in 540473fa) provide the second Red channel with the same expected failure mode. Live execution deferred to a session with `node` on PATH (none available in this Mid runtime); plan.md records the inspection-based proof so a Green-phase session can re-confirm with a real run.

- [x] Task 3.2: Fix GradebookDrillDown flaky timeout
  - [x] File: `apps/bus-math-v2/__tests__/components/teacher/GradebookDrillDown.integration.test.tsx`
  - [x] Test contract: clicking a gradebook cell must open a dialog (`role="dialog"`) showing the mocked student name "Alice Brown" and lesson title "Accounting Equation" inside `getByRole('dialog')` — see existing 5 cases (lines 19–307). The first and fifth cases both gate on `screen.getByRole('dialog')` after `fireEvent.click(gradebookButton)`.
  - [x] Red evidence (Mid attempt 2, 2026-06-19): `apps/bus-math-v2/components/teacher/SubmissionDetailModal.tsx` (the modal `GradebookGrid` opens) renders a `div` with `role="dialog"` at line 800, but only after `loading` flips to `false` — and `loading` starts `true`, then `useEffect → queueMicrotask → loadDetail()` runs the dynamic `import('@/lib/convex/server')` and the mocked `fetchInternalQuery`. The mock is set up via `vi.mock('@/lib/convex/server', …)` at the top of the test file (lines 5–12), so the dynamic import resolves through the mock; the dynamic import itself, however, returns a Promise, so the dialog appears on the next microtask + state-update tick. If the test's `waitFor` default timeout (1000 ms) is exceeded by CI scheduling jitter, the case fails with "Unable to find an element with the role: 'dialog'". Bounded Red command: `npx vitest run __tests__/components/teacher/GradebookDrillDown.integration.test.tsx` — expected flaky-timeout failures in cases that gate on the dialog (1st and 5th). Live execution deferred to a session with `node` on PATH; the existing 5 cases are the Red contract and are owned by Task 3.2 Green.
  - [x] Green fix applied: (a) add `role="dialog"` to loading state + (c) convert dynamic import of `@/lib/convex/server` to static import. Also fixed `vi.mock` hoisting via `vi.hoisted()` and added `beforeAll` pre-import of GradebookGrid to keep first test under default timeout.
  - [x] Verify: 5/5 tests in GradebookDrillDown.integration.test.tsx pass (case 1: 1943ms), plus 14/14 in SubmissionDetailModal.test.tsx and 3/3 in SubmissionDetailModal.integration.test.tsx.
  - [x] Commit: f07e1253

## Phase 4: Fix IM3 React 19 ESLint Violations

- [~] Task 4.1: Fix `react-hooks/set-state-in-effect` violations
  - [ ] Refactor effects that call setState during mount to use lazy initialization or `useSyncExternalStore`
  - [ ] Files: MatchingPageClient, SpeedRoundPageClient, practice-timing, PhaseCompleteButton, MatchingGame, SpeedRoundGame
  - **Red evidence (Mid, 2026-06-19):** Bounded command `npx eslint <file> --rule '{"react-hooks/set-state-in-effect": "error"}'` per listed file. Confirmed 7 violations across 6 files:
    - `components/practice-timing.tsx:103` (`setIsTracking(true)`)
    - `components/student/MatchingGame.tsx:72` (`setCards(shuffleArray(newCards))`), `:79` (`setEndTime(now)` / `setIsComplete(true)`)
    - `components/student/SpeedRoundGame.tsx:93` (`setQuestions(newQuestions)`)
    - `components/lesson/PhaseCompleteButton.tsx:55` (`setStatus(initialStatus)`)
    - `app/student/study/matching/MatchingPageClient.tsx:51`
    - `app/student/study/speed-round/SpeedRoundPageClient.tsx:51`
  - **Regression gate baseline at HEAD:** `practice-timing.test.tsx` (11/11), `MatchingGame.test.tsx` (7/7), `SpeedRoundGame.test.tsx` (10/10), `PhaseCompleteButton.test.tsx` (20/20) — all green; the refactor must keep these greens.

- [~] Task 4.2: Fix `react-hooks/purity` violations
  - [ ] Remove `Date.now()`, `Math.random()` from render paths
  - [ ] Files: teacher dashboard, PracticeTestPageClient, ExportPanel, VocabularyHighlight
  - **Red evidence (Mid, 2026-06-19):** Bounded command `npx eslint <file> --rule '{"react-hooks/purity": "error"}'` per listed file. Confirmed 6 violations across 6 files (one per file):
    - `app/teacher/dashboard/page.tsx:69`
    - `components/lesson/PhaseCompleteButton.tsx:47` (`useRef<number>(Date.now())` initializer)
    - `components/student/PracticeTestPageClient.tsx:20`
    - `components/student/SpeedRoundGame.tsx:177`
    - `components/teacher/exports/ExportPanel.tsx:49`
    - `components/textbook/VocabularyHighlight.tsx:21`
  - **Regression gate baseline at HEAD:** `VocabularyHighlight.test.tsx` (22/22), `ExportPanel.test.tsx` (10/10) — both green.

- [~] Task 4.3: Fix `react-hooks/refs` violations
  - [ ] Refactor ref access during render to use `useRef` initializers
  - [ ] Files: PracticeTestEngine, PhaseCompleteButton
  - **Red evidence (Mid, 2026-06-19):** Bounded command `npx eslint <file> --rule '{"react-hooks/refs": "error"}'` per listed file. Confirmed 3 violations in 1 file:
    - `components/student/PracticeTestEngine.tsx:303`, `:307`, `:317` (three `Cannot access refs during render` errors)
    - `components/lesson/PhaseCompleteButton.tsx` — 0 violations (the `Date.now()` initializer at line 47 is captured by Task 4.2 purity, not by Task 4.3 refs; no refs-during-render issue remains here).
  - **Regression gate baseline at HEAD:** `PracticeTestEngine.test.tsx` (12/12) — green.

- [~] Task 4.4: Fix `react-hooks/static-components` violations
  - [ ] Move sub-component definitions outside render functions
  - [ ] Files: ActivityRenderer, LessonStepper
  - **Red evidence (Mid, 2026-06-19):** Bounded command `npx eslint <file> --rule '{"react-hooks/static-components": "error"}'` per listed file. Confirmed 2 violations across 2 files:
    - `components/lesson/ActivityRenderer.tsx:56/71` — `const ActivityComponent = getActivityComponent(componentKey)` then `<ActivityComponent … />` inside render.
    - `components/lesson/LessonStepper.tsx:105/135` — `const StepIcon = () => { switch … }` defined inside `PhaseStepper` render, then `<StepIcon />` rendered.
  - **Regression gate baseline at HEAD:** `ActivityRenderer.test.tsx` (9/9), `LessonStepper.test.tsx` (8/8) — both green. **Pre-existing flake (NOT Phase 4):** `ActivityRenderer-graphing-explorer.test.tsx` has 2 cases that hang on "Loading activity…" (dynamic `import()` for `GraphingExplorer` does not resolve under jsdom). These failures are unrelated to React 19 lint refactors and exist at HEAD before any Phase 4 edit; Phase 5 verification will track them but the Phase 4 Green gate does not require their fix. Documented here so the next role does not mis-attribute them.

- [~] Task 4.5: Re-enable React 19 eslint rules
  - [ ] File: `apps/integrated-math-3/eslint.config.mjs`
  - [ ] Remove the disabled rules
  - [ ] Verify lint passes with zero errors
  - **Red evidence (Mid, 2026-06-19):** `eslint.config.mjs` lines 37–42 currently set all four `react-hooks/{set-state-in-effect,purity,refs,static-components}` rules to `"off"` (with a comment cross-referencing `tech-debt.md`). The Phase 4.5 config-edit Red proof is mechanical: temporarily reverting the config and running `npm run lint --workspace=apps/integrated-math-3 --max-warnings 0` would surface every Phase 4.1–4.4 unresolved violation as a hard error. Deferred to Phase 4.5 Green — running it now is destructive (would lock the working tree against any partial commit). The 18 individual violations captured in Tasks 4.1–4.4 are the durable Red record.

## Phase 5: Verification

- [ ] Task 5.1: Run TypeScript compilation
  - [ ] `npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json`
  - [ ] `npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json`
  - [ ] Record results

- [ ] Task 5.2: Run lint
  - [ ] `npm run lint --workspace=apps/integrated-math-3`
  - [ ] `npm run lint --workspace=apps/bus-math-v2`
  - [ ] Record results

- [ ] Task 5.3: Run tests
  - [ ] `CI=true npm run test --workspace=apps/integrated-math-3`
  - [ ] `CI=true npm run test --workspace=apps/bus-math-v2`
  - [ ] Record results

- [ ] Task 5.4: Final state check
  - [ ] `git status --short` returns empty
  - [ ] `git stash list` returns empty
  - [ ] All acceptance criteria met
