# Monorepo Convex Dev Stack Startup Fix

## Overview
Repair dev startup regressions introduced during app migration into the monorepo:
- `apps/integrated-math-3` times out waiting for local Convex port even when Convex is ready.
- `apps/pre-calculus` can throw `No address provided to ConvexReactClient` at module evaluation time.
- Dev-stack commands must always execute Convex against each app's own `cwd` and env.

## Acceptance Criteria
- [ ] `npm run dev:stack --workspace=apps/integrated-math-3` no longer fails on `Timeout waiting for port 3210` when Convex reports ready.
- [ ] `apps/pre-calculus` no longer throws `No address provided to ConvexReactClient` during startup.
- [ ] Both app startup scripts launch Convex from the app root deterministically.
- [ ] Changes are verified with startup smoke checks and typecheck/lint for touched apps.
