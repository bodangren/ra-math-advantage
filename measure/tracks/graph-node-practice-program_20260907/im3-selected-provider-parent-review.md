# IM3 selected provider parent review

Date: 2026-09-07

## Scope

The parent reviewed `/tmp/im3-selected-provider-head.patch` against committed HEAD `200a0578`. The patch is not integrated. The review covers the selected quadratic Guided and Independent cards.

## Required repairs

1. Block component completion as a progression authority for selected cards. The current `onComplete` calls `advanceCard` when `hasSubmittedRef` is false. That flag is false before submission and after a failed submission. A component callback can therefore advance without a successful server receipt. Add tests for both states.
2. Validate a finite server grade. The current check accepts any JavaScript number and a positive maximum. It does not reject `NaN`, infinity, negative scores, or scores above the maximum. The implementation report incorrectly states that the check requires a finite score.
3. Preserve pending submission ownership. The card remains visible during a retry. The ordinary submission callback creates a new key. Repeated submission can bypass the pending opaque submission or lost-create key. Add a test for the ordinary submit control while retry is pending.
4. Recover from a rejected retry promise. The opaque retry uses `.then` without a rejection handler. A rejection can leave the controls in the submitting state. Keep the same pending identity and permit another retry.

These findings come from code inspection. The author must record the failing regression results before repair. Keep the existing generic activity behavior. Remove unrelated formatting changes from the patch.

## Backend verification

The parent ran the selected backend build in `/tmp/im3-selected-evidence-head/apps/integrated-math-3`. The build passed. The normal standalone TypeScript check then reported only two missing fingerprint export errors. The scratch workspace links to the main package source, where that existing export has pending removal.

A second standalone TypeScript check used the scratch HEAD `practice-core` exports through temporary TypeScript paths. It passed. No source files were excluded from this check. No dependency, deployment, or schema push occurred.

## Final candidate verification

The author added the required regressions and repaired all four findings. A further Red test reproduced two requests from synchronous submission callbacks. The provider now uses its existing submission reference as an immediate lock. The selected card cannot advance through component completion. Pending retries preserve their identity. Server grade checks reject invalid numeric values.

The parent combined the backend, provider, and teacher form patches with committed HEAD `7b87bfda` in `/tmp/im3-final-integration-20260907-2333`. All 118 focused tests, app lint, and build passed. Standalone TypeScript passed with explicit paths to that candidate's practice-core source. No source file was excluded. The normal linked check reports two missing fingerprint export errors from the main worktree's pending package changes.

This verification covers the clean committed candidate. Later-node changes in the shared worktree remain separate pending work. The selected catalog stays draft. Source approval and a real approved student journey remain open.
