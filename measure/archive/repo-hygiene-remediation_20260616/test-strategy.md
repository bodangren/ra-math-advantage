# Test Strategy: Repository Hygiene Remediation

Multi-phase cleanup. Phases 1–2 are git-state ops; Phases 3–4 fix code with
behavioral contracts; Phase 5 is aggregate verification.

## 1. Testing Pyramid Per Phase

| Phase | Unit | Component / Integration | E2E / Aggregate Gate |
|-------|------|-------------------------|----------------------|
| 1 (commit outstanding) | none | none | `git status --short` empty (artifact) |
| 2 (resolve stashes) | none | none | `git stash list` empty (artifact) |
| 3.1b (UserMenu Dashboard link) | role→href mapping pure fn (if extracted) | `user-menu.test.tsx` 9/9 (component, RTL) | BM2 vitest workspace run |
| 3.2 (Gradebook timeout) | none | `GradebookDrillDown.integration.test.tsx` (deflake) | BM2 vitest workspace run |
| 4.1–4.4 (React 19 lint fixes) | targeted vitest reruns of affected components | `ActivityRenderer`, `PracticeTestEngine`, `MatchingGame`, `SpeedRoundGame`, `PhaseCompleteButton` existing test files | IM3 vitest workspace run |
| 4.5 (re-enable rules) | n/a | n/a | `npm run lint --workspace=apps/integrated-math-3` exits 0 |
| 5 (verification) | n/a | n/a | tsc + lint + vitest across IM3 & BM2 |

Rule of thumb: do not invent new units for Phase 4 refactors when an existing
component test already covers the render path. Add a unit only when extracting
a pure helper (e.g., `getDashboardHref(profile)`).

## 2. Shared Fixtures / Mocks

- **`vi.hoisted` + absolute-path mock** for `packages/app-shell/src/auth/AuthProvider.tsx`
  is established in `user-menu.test.tsx:18-30`. Reuse for any new test that
  consumes `useAuth` from `@math-platform/app-shell` — graph confirms `UserMenu`
  imports via the relative `../auth/AuthProvider`, so the barrel mock alone
  does not intercept.
- **`mockProfile` factory** (`role: student|teacher|admin`) lives inline in
  `user-menu.test.tsx`; promote to a fixture only if Phase 4 needs it.
- **`fetchInternalQuery` mock** at `GradebookDrillDown.integration.test.tsx:4-12`
  is the canonical Convex server-action mock for BM2 teacher tests.
- No new mocks for Phase 1, 2, or 4.5.

## 3. Cross-Phase Edge Cases & Dependencies

- Phase 3.1b adds a Dashboard link rendered inside the dropdown — verify it
  does not regress the existing 5 passing UserMenu tests (logout, initials,
  display name, avatar, settings link). Run the full file, not just new cases.
- Phase 4 lint fixes can change render output (e.g., moving `Date.now()` out
  of render breaks snapshot equality). Re-run the full IM3 component suite,
  not just the touched file.
- Phase 4.4 (`static-components`) extractions change React identity: subtree
  remount on parent re-render. If `ActivityRenderer` / `LessonStepper` tests
  assert on stable refs, that surfaces a real bug — triage, do not paper over.
- Phase 5 must run **after** Phase 4.5 — re-enabling rules without first
  fixing 4.1–4.4 will fail AC-3.

## 4. Architecture Guardrails

- No new imports from `apps/` into `packages/` (AGENTS.md scope rule). Phase 3.1b
  edits `packages/app-shell/src/components/UserMenu.tsx`; the role→href logic
  must stay package-local, not import from any app.
- No imports from `convex/_generated/` into `packages/`.
- Phase 4 refactors must not cross the practice contract (`practice.v1`) —
  affected files are renderer/UI, not engines.
- Do not modify `eslint.config.mjs` rule levels in any phase except 4.5.
- `npx tsc --noEmit` must be run in addition to `npm run build` (AGENTS.md).

## 5. Per-Phase Test Approach

- **Phase 1 / 2:** complete; AC verified via `git status` / `git stash list`.
- **Phase 3.1b:** TDD. Read failing assertions in `user-menu.test.tsx:134-177`;
  let the 4 reds drive `UserMenu.tsx`. Decide API shape (role-map vs
  `getDashboardHref` callback) before coding; check call sites in BM2/IM3/IM1/IM2/Pre-calc
  layouts via `build-graph callers UserMenu` to avoid breaking consumers.
- **Phase 3.2:** Reproduce the timeout locally before bumping it. Prefer
  mocking the slow call over enlarging the budget — `mockFetchInternalQuery`
  already returns instantly, so investigate what is actually awaiting (likely
  a `waitFor` polling on async render).
- **Phase 4.1–4.4:** Pre-edit, capture the green baseline of the affected
  component test. Refactor. Re-run; tests stay green *before* re-enabling
  rules. Lint rule = contract test for the refactor; component test = regression gate.
- **Phase 4.5:** Atomic config commit. The lint command **is** the test.
- **Phase 5:** No new tests. Aggregate proof per AC-3..AC-8.

## 6. Build-Graph Findings That Shaped Strategy

`graph.db` fresh (mtime today, 14179 nodes, 2067 files, IM3 & BM2 packages indexed).

- `UserMenu` lives only in `packages/app-shell/src/components/UserMenu.tsx`
  (one canonical function node). Confirms the package-relative
  `../auth/AuthProvider` import — Phase 3.1b must not add app-level branches.
- `useAuth` has zero `references` edges in the graph (param flow not tracked
  for hook calls); `build-graph callers useAuth` is not authoritative — treat
  test mock setup as the source of truth for hook consumers.
- `AuthProvider` is duplicated across 5 apps + 1 package; only the package
  copy is the runtime target for `UserMenu`'s import. Do not mock app-level
  copies in `user-menu.test.tsx`.
- `PracticeTestEngine`, `ActivityRenderer`, `PhaseCompleteButton` each have
  IM3 component-test files already present — Phase 4 fixes regress against
  those greens; no new test scaffolding needed.
- `ActivityRenderer.tsx` exists in three packages (`packages/activity-components`,
  IM3, BM2). Phase 4.4 task scopes IM3 only — keep edits in
  `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx`.

## 7. Live-Proof Plan

Each phase has a **Red command** (must fail before work) and a **Green/closeout
gate** (must pass at task close). Artifact = git/config state proof; Live =
real behavior or real lint/test invocation.

| Phase / Task | Red command (targeted) | Green / closeout gate | Kind |
|--------------|------------------------|------------------------|------|
| 1 | `git status --short` shows tracked dirty files | `git status --short` empty | Artifact |
| 2 | `git stash list` non-empty | `git stash list` empty | Artifact |
| 3.1b | `npx vitest run __tests__/components/user-menu.test.tsx` → 4 fail | same command → 9/9 pass | Live (component) |
| 3.2 | `npx vitest run __tests__/components/teacher/GradebookDrillDown.integration.test.tsx` → timeout fail | same command → pass under default 5s timeout | Live (integration) |
| 4.1 | `npm run lint --workspace=apps/integrated-math-3 -- --rule 'react-hooks/set-state-in-effect: error'` → violations | same → 0 violations **and** affected component vitest files green | Live (lint + component) |
| 4.2 | `… --rule 'react-hooks/purity: error'` → violations | same → 0 violations + affected component tests green | Live (lint + component) |
| 4.3 | `… --rule 'react-hooks/refs: error'` → violations | same → 0 violations + `PracticeTestEngine.test.tsx`, `PhaseCompleteButton.test.tsx` green | Live (lint + component) |
| 4.4 | `… --rule 'react-hooks/static-components: error'` → violations | same → 0 + `ActivityRenderer.test.tsx`, lesson stepper tests green | Live (lint + component) |
| 4.5 | `npm run lint --workspace=apps/integrated-math-3` (config edit reverted) → red | `npm run lint --workspace=apps/integrated-math-3` exits 0 | Artifact (config) + Live (full lint) |
| 5.1 | n/a (verification) | `npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json` & BM2 same → exit 0 | Live |
| 5.2 | n/a | `npm run lint --workspace=apps/integrated-math-3` & BM2 → exit 0 | Live |
| 5.3 | n/a | `CI=true npm run test --workspace=apps/integrated-math-3` & BM2 → exit 0 | Live (full suite) |
| 5.4 | n/a | `git status --short` & `git stash list` empty | Artifact |

**Targeted vs aggregate:** Per-phase Red/Green commands above are bounded to
one file or one rule. Phase 5.3 `CI=true npm run test` is the only aggregate
run and is reserved for verification — never use it as the Red signal for an
individual task (slow, masks ownership).

**Fake harnesses:** None. Production lint and vitest commands are the gates
directly; the `--rule` flag on lint is a real ESLint invocation. No risk of
fall-through into a full suite because each Red command names a single file
or single rule.

## 8. Intentionally-Red Tests

- Task 3.1b is `[ ]` (pending). The 4 currently-failing assertions in
  `apps/bus-math-v2/__tests__/components/user-menu.test.tsx` (Dashboard link
  cases, lines 134–177) are **owned by Task 3.1b** and will be discovered by
  the BM2 aggregate vitest run in Phase 5.3. Not excluded — finishing 3.1b
  is the prerequisite for AC-8.
- IM3 React 19 violations are not test files; they are lint failures Phase 4.5
  re-enables. Until 4.5 commits, the rules remain `off` and lint is
  intentionally green; no test exclusion needed.
- No `.skip` or `.only` should be introduced. If 3.2 cannot be fixed in
  scope, mark `[~]` and document in `tech-debt.md`; do not skip silently.
