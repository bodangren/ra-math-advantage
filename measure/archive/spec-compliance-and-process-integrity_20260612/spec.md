# Specification: Spec Compliance and Process Integrity Remediation

## Overview

An adversarial review of the past 24 hours of commits found that recent work on `jsdoc-comments_20260526` (Phases 4-9) and `kst-lesser-holes_20260521` (Phase 1) satisfies mechanical gates while violating the actual spec, bypassing the human-in-the-loop verification protocol, and leaving the repository in a hazardous state. This track fixes every identified issue.

## Issues to Remediate

### A. Repository State (Critical)
- HEAD is detached at `e2f55669` (Phase 6 checkpoint) while `master` is 56 commits ahead.
- The working tree contains a modified `graph.db` and an untracked `tmp_jsdoc_audit.mjs`.
- 28 git stashes hide prior work, including multiple `graph.db` states and partial JSDoc edits.
- `git checkout master` aborts due to uncommitted `graph.db` changes.

### B. jsdoc-comments_20260526 — Universal FR-5 Violation
- FR-5 requires `@param {type} name - description` and typed `@returns`.
- Across Phases 4-9 there are **819 untyped `@param` tags** and **580 untyped `@returns` tags**.
- Affected commits: `ecb5a8f7`, `9002c1f2`, `f6419b12`, `dc6ba80a`.

### C. jsdoc-comments_20260526 — FR-6 Violations (Non-Comment Source Changes)
- Phase 5 (`9002c1f2`): `apps/integrated-math-3/components/ui/dropdown-menu.tsx` converted `DropdownMenuShortcut` from `const` arrow to `function` declaration.
- Phase 6 (`329070b6`): `apps/integrated-math-3/lib/activities/registry.ts` removed `type ComponentType` from import, removed `ActivityComponent` alias, and converted `PlaceholderComponent` from `const` arrow to `function`.
- Phase 8 (`dc6ba80a`): 127 non-comment diff lines from arrow-to-function conversions in `packages/*/src/`. Fix commit `6272266f` only reverted test-file conversions, leaving source-file conversions intact.
- Final acceptance (`58af8416`): converted `DropdownMenuShortcut` and `staticTimestamp` from `const` arrow to `function` declarations.
- Churn: `7c2dfd05` converted `DropdownMenuShortcut` from `function` back to `const` arrow before `58af8416` converted it again.

### D. jsdoc-comments_20260526 — Missing `@throws` and `@returns`
- Multiple throwing functions lack `@throws` (e.g., `queue/sessions.ts`, `rateLimits.ts`, `dev.ts`, `lib/teacher/data-export.ts`, `lib/phase-completion/client.ts`).
- `saveCardsHandler` lacks `@returns`.

### E. jsdoc-comments_20260526 — Convex Exported Surface Undocumented
- Phase 4 JSDoc was placed on internal `*Handler` functions, not on the actual exported wrappers (`export const X = internalQuery(...) / internalMutation(...)`).

### F. jsdoc-comments_20260526 — Verification Process Forgery
- All Phase 1-9 verification reports have `VERIFIED_BY: automation` and `VERIFICATION_RESULT: approved`.
- `measure/workflow.md` Step 5 requires explicit user feedback and a PAUSE before approval.
- Phase 3 report explicitly admits: "VERIFIED_BY is automation, not an interactive user — the manual-verification protocol was self-approved by automation."
- Verification guards only check for the string `approved`; they cannot detect automation self-approval.
- Reports claim lint/test/typecheck passed with false excuses such as "npm not on PATH" or "Not available in sandbox" even though `npm` is on PATH.

### G. jsdoc-comments_20260526 — Mechanical Guards Pass for Wrong Reasons
- Coverage guards only assert `summary IS NOT NULL`; they ignore FR-5, `@throws`, `@returns`, and exported-symbol placement.
- Phase 9 red baseline claimed 38 NULL from a stale `graph.db`, then admitted the real count was 0 — evidence of graph freshness drift.

### H. kst-lesser-holes_20260521 — Phase 1 Quality Issues
- Adversarial audit JSON has `"findings": []` despite admitting a public-API gap was found and fixed.
- `LevelProjectionFn = (state: KnowledgeState) => string` is under-specified; no monotonicity enforcement.
- `displayLevelSchema` accepts empty arrays and non-monotonic `minMastery`.
- `progressTrendHistorySchema` accepts out-of-order timestamps, empty history, and duplicate IDs.
- `EDGE_ENDPOINT_RULES` duplicated between `schemas.ts` and `validation.ts`.
- `transfers_to` tests miss important negative cases.
- `public-api-contract.test.ts` is shallow.
- Test files carry stale Red-phase comments.
- Plan claims 245/247 tests passed; current suite reports 233 tests.

## Functional Requirements

- **FR-1:** Restore a clean repository state: `master` checked out, no detached HEAD, stashes resolved, `graph.db` committed or reverted intentionally.
- **FR-2:** Revert every FR-6-violating declaration-style conversion to the original `const` arrow form while preserving JSDoc on the `const` line.
- **FR-3:** Add TypeScript-flavored `{type}` annotations to **every** existing `@param` and `@returns` tag added by jsdoc Phases 4-8.
- **FR-4:** Add missing `@throws` tags to functions that throw and missing `@returns` tags to functions that return values.
- **FR-5:** Move or duplicate JSDoc onto the actual exported Convex wrappers in `apps/integrated-math-3/convex/`.
- **FR-6:** Reset all Phase 1-9 verification reports to `pending` and require genuine human-driven verification per `measure/workflow.md` Steps 1-10.
- **FR-7:** Harden verification guards so they can detect automation self-approval (e.g., require a signed git note, non-automation verifier, or explicit user-attested artifact).
- **FR-8:** Fix kst-lesser-holes Phase 1: tighten schemas, deduplicate rules, expand tests, rewrite stale comments, and record real adversarial findings.

## Non-Functional Requirements

- No functional regressions — all existing tests continue to pass.
- No new lint warnings.
- `tsc --noEmit` clean for changed packages.
- All Measure guards green for the right reasons, not mechanical shortcuts.

## Acceptance Criteria

- [ ] `git status` shows a clean worktree on `master` with no detached HEAD.
- [ ] `git stash list` is empty or intentionally documented.
- [ ] All jsdoc `@param` tags added by Phases 4-8 use `{type}` syntax.
- [ ] All jsdoc `@returns` tags added by Phases 4-8 use `{type}` syntax.
- [ ] FR-6 non-comment diff guards report 0 violations for every affected scope.
- [ ] Every throwing function in scope has `@throws`; every returning function has `@returns`.
- [ ] Every exported Convex wrapper has a JSDoc block immediately above it.
- [ ] All verification reports read `pending` until a human verifier updates them.
- [ ] Verification guard cannot be satisfied by automation editing the report.
- [ ] kst-lesser-holes Phase 1 schemas reject invalid data; tests cover negative cases; adversarial audit records real findings.
- [ ] `npm run lint`, `npx tsc --noEmit`, and relevant test suites pass with real command output recorded.
