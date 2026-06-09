# Track: Unified Auth Across the Monorepo

Program: Monorepo Migration Program (cleanup)
Type: Chore
Depends on: extract-core-auth-convex (done), app-import-migration (done)

## Overview

`packages/core-auth` already holds shared auth/session/password/guard helpers,
and `apps/integrated-math-3/lib/auth/server.ts` (234 lines) is largely a wrapper
re-exporting the package. But `apps/bus-math-v2/lib/auth/server.ts` (290 lines)
still contains BM2-local logic (per the BM2 Consume Core Packages track:
"middleware migrated; server.ts remains local"). The 2026-06-09 audit flagged
the divergence: two same-named local files, one a wrapper and one with unique
logic, is a leaky abstraction and drift risk.

Goal: one shared auth surface. Any logic that is genuinely common lives in
`packages/core-auth`; each app keeps only thin, clearly app-specific composition
(and if it's truly identical, it re-exports the package directly).

## Functional Requirements

- FR1 — Diff `apps/bus-math-v2/lib/auth/server.ts` against `packages/core-auth`
  and `apps/integrated-math-3/lib/auth/server.ts`; classify each export as
  (a) identical-to-package, (b) generalizable-into-package, or (c) genuinely BM2-specific.
- FR2 — Promote (a) and (b) into `packages/core-auth` with tests; parameterize
  app differences (cookie names, redirect targets, role maps) via options, not forks.
- FR3 — Reduce BM2 `server.ts` to a thin app-specific composition over the package,
  matching the IM3 pattern; rewire all BM2 importers.
- FR4 — Evaluate whether the wrapper files should re-export the package directly
  (remove indirection) where no app-specific logic remains.
- FR5 — No app imports duplicate the package's auth logic; boundary lint stays green.

## Acceptance Criteria

- AC1 — `packages/core-auth` is the single source of shared auth logic; covered by tests.
- AC2 — BM2 and IM3 `tsc --noEmit` + auth tests + middleware tests green.
- AC3 — No duplicated session/password/guard logic remains in either app's `lib/auth/`.
- AC4 — `npm run doctor` green (no boundary violations).
- AC5 — Auth behavior unchanged (login, session, role checks, deactivation revocation).

## Out of Scope

- New auth features or provider changes.
- Convex auth.config or identity-provider migration.
