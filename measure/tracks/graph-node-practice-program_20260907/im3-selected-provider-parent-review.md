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
