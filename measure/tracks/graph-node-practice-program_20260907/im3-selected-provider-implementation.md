# IM3 selected practice provider implementation

Date: 2026-09-07

## Scope

This patch connects the selected quadratic Guided and Independent activity identifiers to `submitIm3PilotActivity`.

The provider requires the exact stable activity identifier, node identifier, `graphing-explorer` component, and SRS eligibility flag. A mismatched card stays on the existing generic path.

The provider creates one idempotency key for each selected response. It keeps that key after a create failure. It keeps the opaque physical submission identifier and known server grade after a progression failure. A retry with the physical identifier does not create a second submission.

The provider does not show feedback or advance the card until the selected helper returns finite scores with `0 <= score <= maxScore` and a positive maximum score. It uses the server score for feedback. It does not use client part grades for the selected activities.

Worked acknowledgement remains on its separate lesson route.

The retry alert uses the existing app color and radius tokens from `DESIGN.md`.

## Verification

The focused provider file had no selected submission connection before this change. The new tests cover both selected modes, server score authority, a missing grade, physical submission retry, create-key retry, and a mismatched generic card.

The focused run passed 19 tests in two provider files. This includes all five existing provider tests and 14 new selected tests. A combined prerequisite run passed 40 tests across the two provider files, the 17-test strict client file, and the four-test Worked composition file.

`npm run lint` passed.

The isolated TypeScript check passed with the scratch `practice-core` source and without the existing missing Cloudflare build artifact. The normal linked-worktree check resolves `practice-core` to the current main source and reports its temporary missing fingerprint export from the evidence prerequisite. This provider patch does not change that package.

The selected card ignores component completion before a server receipt. A pending retry also blocks a second original submission. A failed opaque retry keeps the same pending state.

A synchronous double-submit regression failed before the final lock change. The existing `hasSubmittedRef` now locks the selected request before React rerenders. The regression proves that two synchronous callbacks start one selected helper request.
