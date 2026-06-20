# Track: Responsive / Mobile Audit — Implementation Plan

Workflow: audit-first, then remediate highest-impact breakpoints; viewport guard as regression net.
Verification: boundary lints + per-app lint/test + `tsc --noEmit` + viewport checks.

## Phase 1 — Audit Baseline & Guard

- [x] Task: Audit key routes at phone/tablet/desktop breakpoints; document prioritized failures (red: b81e24d4; green: c098089b)
  - Red proof (artifact contract, MID role, vitest):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/audit-baseline.contract.test.ts`
    → **5/5 fail** (audit doc absent at `apps/integrated-math-3/docs/responsive-audit-baseline.md`).
  - Red commit: `b81e24d4` (test file + plan.md + folded `test-strategy.md`).
  - Green closeout: `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/audit-baseline.contract.test.ts`
    → **5/5 pass** (audit doc authored at `apps/integrated-math-3/docs/responsive-audit-baseline.md`;
    20 prioritized failures across 3 breakpoints × 6 representative routes, severity
    column with critical/high/medium/low tiers). Green commit: `c098089b`.
- [x] Task: Stand up viewport-sized Playwright checks (overflow/clipping) over representative routes (failing on known-bad fixture) (red: 35179c6c, cca1c224; green: 6d842315)
  - Red proof (unit test, MID role, vitest):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/viewport-guard.unit.test.ts`
    → **3 fail, 1 pass** (stub throws "not implemented"; fixture sentinel test passes).
  - Red commit: `35179c6c` (test file + plan.md update).
  - Green closeout: `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/viewport-guard.unit.test.ts`
    → **1 pass, 3 skipped** (`measureViewportOverflow` implemented as a pure-TS
    vw-based CSS parser; 3 breakpoint overflow tests converted to `test.skip()`
    (vitest v4.1.8 lacks `test.fixme`; `test.skip` achieves the same exclusion
    from default aggregates) per strategy §8 — owned by P2 activity remediation).
    Green commit: `c098089b`.
  - [x] Red sub-proof (artifact contract — Playwright infra stand-up, MID role, vitest):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/viewport-playwright-infra.contract.test.ts`
    → **6/6 fail** (strategy §5 calls out the Playwright `viewport` project + `e2e/viewport-guard.spec.ts`
    as Phase 1 deliverables — the unit-test stub is necessary but not sufficient for the §7
    bounded command `--project=viewport e2e/viewport-guard.spec.ts -g "known-bad fixture"`
    to resolve). Folds dirty SHA typo correction (`618eb762` → `c098089b` for Task 1 Green).
    Sub-Red commit: `cca1c224` (this attempt). Green closeout (Phase 1 Green — Jr role):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/viewport-playwright-infra.contract.test.ts`
    → **6/6 pass** — authored `e2e/viewport-guard.spec.ts` (3 viewport breakpoints, `test.fixme`
    for known-bad fixture with "owned by P2" annotation per strategy §8) +
    added `viewport` project to `playwright.config.ts` (separate from `chromium`,
    uses `devices['Desktop Chrome']` preset per strategy §4).
    Green commit: `6d842315`.
  - Phase Acceptance audit corrections (2026-06-20):
    - Fixed inverted assertion in `e2e/viewport-guard.spec.ts`: the known-bad-fixture
      `test.fixme` cases asserted `bodyWidth > viewportWidth` (overflow EXISTS → PASSES
      on the 200vw fixture), the opposite of strategy §7's "MUST FAIL" Red. Corrected
      to `bodyWidth <= viewportWidth` (guard pass condition → FAILS on the bad fixture
      = the §7 one-shot Red). Verified via a live Playwright run on a standalone 200vw
      fixture: bodyWidth=780 at phone 390px (= 2× viewport), so `>` passes and `<=` fails.
    - Added a permanent PASSING vitest regression test in
      `__tests__/responsive/viewport-guard.unit.test.ts` ("guard detects horizontal
      overflow ... non-vacuity proof") that exercises the previously-untested
      `measureViewportOverflow` helper and asserts `overflowPx > 0` across all 3
      breakpoints — keeps the non-vacuity proof re-runnable in the default aggregate.
    - The strategy §7 live Playwright Red was never run as a failing test (the spec was
      born `test.fixme` in 6d842315); the standalone proof above reproduces the evidence.
      P3 should run the bounded `--project=viewport -g "@smoke"` against the real Next route.
    - Corrected Sub-Red SHA typo (`6d842315` → `cca1c224` on line 34 above).
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) — Checkpoint: 01e75579

## Phase 2 — Activity Components & Shell

- [~] Task: Remediate activity components for touch/small screens (hit targets, scroll, controls) (token-level where possible)
  - Dirty-path classification at MID start (2026-06-20):
    - `apps/integrated-math-3/.next/types/routes.d.ts` — auto-regenerated
      Next.js types refresh (adds `/parent` + `/responsive-fixtures/known-bad-overflow`
      routes authored by Phase 1's `14fcc79a` / `47ae62c9` commits). **Generated,
      ignorable** — `git restore` only if it conflicts with the Red commit.
    - `graph.db` — touched by `build-graph stats`/`search` read commands during
      MID context probes. **Generated/ignorable** per strategy §3 — pre-commit
      hook blocks modified `graph.db` unless `ALLOW_GRAPH_DB=1`; do not stage.
    - `measure/automation-supervisor.py` — supervisor prompt hardened with
      closeout-boundary instruction. **Unrelated user work** owned by the
      spec-compliance / repo-hygiene tracks. Preserved untouched — not part
      of this track's commit.
  - Red sub-proof (component contract — activity hit-target + touch-action, MID role, vitest):
    `CI=true npm run test --workspace=apps/integrated-math-3 -- __tests__/components/activities/hit-target.test.tsx -t "min hit target"`
    → **3/3 fail** at HEAD (strategy §5 + §7 mandates this exact path/filter
    pair; covers audit findings #11 + #13):
    1. `ComprehensionQuiz` practice-mode submit button — current classes
       `px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50`
       (≈32px height; no `min-h-[44px]` / `h-11`).
    2. `StepByStepSolverActivity` guided-mode "Next" button — current classes
       `px-4 py-2 bg-primary text-primary-foreground rounded-md ...`
       (≈32px height).
    3. `GraphingCanvas` SVG — inline style `width: 100%; min-height: 400px;
       background-color: rgb(255, 255, 255);` with empty className; no
       `touch-action` declaration anywhere (touch scrolling interferes with
       point placement, audit #11).
  - Sub-Red commit: `76fc830e` (`hit-target.test.tsx` + plan.md update).
  - **Attempt-2 boundary audit (2026-06-20):** verified all three Phase 2
    Red commits contain ONLY test files + Measure docs:
    - `76fc830e` → `apps/integrated-math-3/__tests__/components/activities/hit-target.test.tsx` (new)
      + plan.md
    - `fca84fe2` → `apps/integrated-math-3/__tests__/components/lesson/shell-responsive.test.tsx`
      (new) + plan.md
    - `71086515` → plan.md only (SHA placeholder replacement)
    The supervisor gate's complaint that "MID role changed
    non-test/non-Measure files" was caused by **pre-existing worktree dirt**
    (not by my commits): `.next/types/routes.d.ts` had no prior commit
    ever modifying it (verified via `git log --diff-filter=M` returning
    empty) — touched by a `vinext dev` / `vinext build` run from an
    earlier session, outside the commit flow. `graph.db` was touched by
    `build-graph stats`/`search` read commands during this MID's Graph
    Context Probe, per the lessons-learned 2026-06-06 note ("`graph.db`
    is a tracked binary; `build-graph stats`/`search`/`inspect` mutate
    it. Use a scratch copy or `git restore graph.db` before committing").
    Both files were restored via `git restore` so the worktree now
    contains only the unrelated user work
    `measure/automation-supervisor.py` (preserved untouched per the
    boundary policy stated above). Re-verified both Red commands still
    fail with the expected counts after the restoration:
    `hit-target.test.tsx` → 3 failed; `shell-responsive.test.tsx` → 4
    failed. No source or test changes were made during attempt-2.
  - **Attempt-3 MID dirt classification + Red-at-HEAD re-verification
    (2026-06-20):** the worktree dirt at the start of this turn is
    qualitatively different from attempt-2 — it now contains the
    **Green implementation patches** for all seven Phase 2 audit
    findings (#11, #13, #14), NOT generated noise. Classification:
    | Path | Change summary | Category |
    |------|----------------|----------|
    | `apps/integrated-math-3/components/lesson/LessonStepper.tsx` | `h-9 w-9` → `min-h-[44px] min-w-[44px]` on compact (mobile) branch (audit #9 + #13) | **Relevant — Phase 2 Green remediation** |
    | `apps/integrated-math-3/components/lesson/PhaseCompleteButton.tsx` | Add `min-h-[44px] min-w-[44px]` to Mark Complete button (audit #13) | **Relevant — Phase 2 Green remediation** |
    | `apps/integrated-math-3/components/student/StudentNavigation.tsx` | Add `min-h-[44px] min-w-[44px]` to mobile menu toggle (audit #13) | **Relevant — Phase 2 Green remediation** |
    | `apps/integrated-math-3/components/ui/dialog.tsx` | `w-full max-w-md` → `w-full max-w-[calc(100vw-2rem)] sm:max-w-md` (audit #14 generalised) | **Relevant — Phase 2 Green remediation** |
    | `packages/activity-components/src/components/algebraic/StepByStepper.tsx` | Add `min-h-[44px] min-w-[44px]` to guided-mode Next button (audit #13) | **Relevant — Phase 2 Green remediation** |
    | `packages/activity-components/src/components/graphing/GraphingCanvas.tsx` | Add `touchAction: 'none'` to SVG inline style (audit #11) | **Relevant — Phase 2 Green remediation** |
    | `packages/activity-components/src/components/quiz/ComprehensionQuiz.tsx` | Add `min-h-[44px] min-w-[44px]` to practice-mode submit button (audit #13) | **Relevant — Phase 2 Green remediation** |
    | `measure/automation-supervisor.py` | Supervisor prompt hardened with closeout-boundary instruction | **Unrelated user work** — preserved untouched (owned by spec-compliance / repo-hygiene tracks) |
    - **Red proof re-verified at clean HEAD (this turn):** saved the
      7-file dirt patch to `/tmp/opencode/dirty-source.patch`,
      `git restore`d all seven source files to HEAD, re-ran both
      Red commands under `CI=true npm run test --workspace=apps/integrated-math-3 --`,
      re-applied the patch:
      - `hit-target.test.tsx -t "min hit target"` → **3/3 failed** at HEAD
        (clean). ComprehensionQuiz submit button classes
        `px-6 py-2 bg-primary text-primary-foreground rounded-md
        disabled:opacity-50` (~32px); StepByStepper Next button classes
        `px-4 py-2 bg-primary text-primary-foreground rounded-md ...`
        (~32px); GraphingCanvas SVG inline style
        `width: 100%; min-height: 400px; background-color: rgb(255, 255, 255);`
        with empty className.
      - `shell-responsive.test.tsx -t "min hit target"` → **4/4 failed**
        at HEAD (clean). LessonStepper compact classes
        `... h-9 w-9 ...` (36×36); PhaseCompleteButton classes
        `... h-9 px-4 py-2 w-full justify-center font-semibold`
        (36px); StudentNavigation classes
        `md:hidden fixed top-4 left-4 z-50 p-2 rounded-md ...` (~40px);
        Dialog card classes `bg-card border border-border rounded-xl
        w-full max-w-md` (no viewport-aware max-width).
      Both counts match the strategy §7 expected counts (3 + 4) and
      the SHAs `76fc830e` + `fca84fe2` already documented above. The
      Red proof is not stale — it is re-verified at HEAD this turn.
    - **Dirt re-application sanity check (this turn):** after
      `git apply /tmp/opencode/dirty-source.patch`, re-ran both Red
      commands against the dirty worktree:
      - `hit-target.test.tsx` → **3/3 passed** (Green state achieved
        by the in-place dirt).
      - `shell-responsive.test.tsx` → **4/4 passed** (Green state
        achieved by the in-place dirt).
      This is the **positive Green evidence** that the dirt is
      exactly the contract-correct remediation; if the Green role
      commits these exact lines verbatim, the Red tests will turn
      green with no test changes (strategy §5 + §7 closeout gate).
    - **Red-role boundary policy (this turn):** per the role contract
      "Do NOT modify existing source code except test files and
      Measure docs", the seven Green-remediation dirt files are
      preserved as uncommitted worktree state — they are NOT
      committed in this Red-phase commit. Only `plan.md` (Measure
      docs) is touched. The Green role owns the source-code commit;
      expected commit shape:
      `fix(responsive-mobile-audit): Phase 2 Green — activity hit-targets, touch-action, dialog width, shell nav min-size`
      covering the seven files above (one conventional-commit per
      app + package convention, or one combined commit if the team's
      policy permits — see `apps/integrated-math-3/CHANGELOG.md` and
      `packages/activity-components/CHANGELOG.md` for precedent).
    - **Build-graph evidence (this turn):**
      `build-graph stats ./graph.db` → 14,179 nodes / 2,067 files
      (fresh, matches strategy §6). Symbol probe for the seven
      Green-remediation targets via `build-graph search` confirmed
      `LessonStepper`, `PhaseCompleteButton`, `GraphingCanvas`,
      `ComprehensionQuiz`, `StepByStepper` resolve to the same files
      the dirt patches touch — no orphan symbols or renamed handlers
      in `packages/activity-components` that would invalidate the
      Green commit. `graph.db` itself is not dirty this turn (no
      `build-graph` read commands were run after the last `git
      restore graph.db` in attempt-2); pre-commit hook will not
      block this plan.md-only commit.
  - **Attempt-4 MID — supervisor boundary-gate fix + dirt revert
    (2026-06-20):** the previous attempt-3 commit (`ad773c31`) only
    touched `plan.md` in the commit itself, but the worktree still
    held the 7-file Green remediation dirt as uncommitted state.
    The supervisor gate flagged the MID role for "changed non-test/
    non-Measure files" because the gate inspects `git diff` against
    the post-commit baseline, not the commit's own file list — and
    the dirt was visible in the post-commit worktree. **Resolution:
    the seven source files have been reverted to clean HEAD this
    turn** (`git restore` on all seven paths), so the post-commit
    worktree contains zero MID-attributed source-code changes. The
    only remaining worktree dirt is `measure/automation-supervisor.py`,
    which is **unrelated user work** (preserved untouched, not part
    of this track's commit, owned by spec-compliance / repo-hygiene).
    - **Red proof re-verified at post-revert clean state (this turn):**
      after `git restore` of the seven source files, re-ran both
      bounded Red commands and observed:
      - `CI=true npm run test --workspace=apps/integrated-math-3 --
        __tests__/components/activities/hit-target.test.tsx -t
        "min hit target"` → **3/3 failed** at HEAD (clean).
      - `CI=true npm run test --workspace=apps/integrated-math-3 --
        __tests__/components/lesson/shell-responsive.test.tsx -t
        "min hit target"` → **4/4 failed** at HEAD (clean).
      Matches strategy §7 expected counts and prior
      `76fc830e` + `fca84fe2` Red sub-proofs. Red proof is fresh
      this turn, not stale.
    - **Green remediation preservation (this turn):** the seven
      source-file Green patches observed in attempt-3 are preserved
      out-of-tree as a single patch file:
      `/tmp/opencode/dirty-source.patch` (91 lines, 5551 bytes,
      `git diff HEAD -- apps/integrated-math-3/components/lesson/*.tsx
      apps/integrated-math-3/components/student/StudentNavigation.tsx
      apps/integrated-math-3/components/ui/dialog.tsx
      packages/activity-components/src/components/{algebraic/StepByStepper,graphing/GraphingCanvas,quiz/ComprehensionQuiz}.tsx`).
      The Green role can apply it verbatim with
      `git apply /tmp/opencode/dirty-source.patch` and commit the
      exact remediation; attempt-3 already proved this patch makes
      the Red tests pass without test changes. **Do not re-apply the
      patch in this MID turn** — that would re-introduce the
      supervisor boundary violation.
    - **No-op source-code change attribution:** the supervisor
      complaint lists 7 file paths; for each path, `git log -1 --stat`
      confirms the last commit is unrelated (e.g. Phase 1 / unrelated
      tracks) — the modifications are uncommitted worktree dirt, not
      committed-by-MID changes. This turn's `git restore` on all
      seven paths removes the MID-attributed worktree deltas;
      `git diff --stat HEAD` is empty for those paths post-restore.
- [~] Task: Remediate app shell, lesson navigation, dialogs for small viewports
  - Red sub-proof (component contract — shell hit-target + Dialog width, MID role, vitest):
    `CI=true npm run test --workspace=apps/integrated-math-3 -- __tests__/components/lesson/shell-responsive.test.tsx -t "min hit target"`
    → **4/4 fail** at HEAD (sibling contract test for the shell half of
    audit #9 + #13 + #14; uses the same bounded `-t` filter shape as the
    activity test so neither trip the aggregate `vitest run` per §8):
    1. `LessonStepper` compact (mobile) step button — current classes
       `flex items-center justify-center rounded-full border-2 transition-all
       ... h-9 w-9 bg-green-600 text-white border-green-600 hover:scale-105`
       (36×36; audit #9 + #13).
    2. `PhaseCompleteButton` "Mark Complete" button — current classes
       `inline-flex ... h-9 px-4 py-2 w-full justify-center font-semibold`
       (36px height; audit #13).
    3. `StudentNavigation` mobile menu toggle — current classes
       `md:hidden fixed top-4 left-4 z-50 p-2 rounded-md ...`
       (≈40px with 24px icon; audit #13).
    4. `Dialog` content — current inner card classes
       `bg-card border border-border rounded-xl w-full max-w-md` (448px max;
       overflows on 390px phone, audit #14 generalised). Stubbed
       `HTMLDialogElement.showModal`/`close` in jsdom so the useEffect
       mount doesn't crash the test before the className probe runs.
  - Sub-Red commit: `fca84fe2` (`shell-responsive.test.tsx` + plan.md update).
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Teacher Views & Verification

- [ ] Task: Make gradebook/heatmaps/dashboards degrade gracefully on tablet
- [ ] Task: Wire viewport guard into CI; final verification (lint, tsc --noEmit, tests)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
