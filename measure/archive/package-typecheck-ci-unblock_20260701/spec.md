# Spec — Unblock CI package typecheck

## Problem

The shared CI matrix (`.github/workflows/ci.yml`) has been red in **Phase 1
`Validate Packages` → `Run package typecheck`** since the 2026-04-18 monorepo
move. The step runs `npm run typecheck --workspace=packages/<pkg>` (`tsc
--noEmit`) and fails for four packages:

| Package | Errors (2026-07-01) | Cause |
|---------|---------------------|-------|
| `practice-core` | 7 (2 files) | test files use `node:fs`/`node:path`/`node:url` (TS2591) + 1 cascaded implicit-any (TS7006) |
| `core-convex` | 11 (2 files) | `src/admin.ts`/`config.ts` use `node:fs/promises`/`path`/`os`/`process` (TS2591) + cascaded implicit-anys |
| `core-auth` | 5 (3 files) | `process` / `Buffer` node globals (TS2591) |
| `ai-tutoring` | 19 (2 files) | `process` node global in `providers.ts` + test (TS2591) |

Root cause: each package `tsconfig.json` extends the root config but does **not
declare the `node` ambient types**. `@types/node` is hoisted at the repo root
(`node_modules/@types/node` v25.9.2) but is not picked up, so all node globals
are unresolved. The TS7006 implicit-anys are downstream of the missing node
types (values typed `any` because their node-typed source was unresolved), not
independent defects.

## Blast radius (why this matters)

CI's `deploy` job chains `needs: [im3, bm2]` → `needs: [packages,
boundary-check]`. A package typecheck red halts the run before the Phase 6
Cloudflare deploy job executes. Result: **IM3's CI deploy has never landed** and
both live workers are pre-monorepo standalone builds. Fixing this Phase 1 gate is
the prerequisite for any deploy-from-monorepo.

## Functional Requirements

- **FR-1**: `npm run typecheck --workspace=packages/<pkg>` exits 0 for all four
  packages: `practice-core`, `core-convex`, `core-auth`, `ai-tutoring`.
- **FR-2**: The fix declares node ambient types in each package's TypeScript
  config without regressing vitest ambient globals (`scripts/vitest.config.ts`
  sets `globals: true`, so `vitest/globals` types must remain in scope for the
  `src/**/__tests__` files compiled by the package tsconfig).
- **FR-3**: No production/source behavior change — **config-only**. No
  dependency-manifest or lockfile change (per AGENTS.md guardrail): `@types/node`
  is already hoisted at the repo root and resolvable under `npm ci` in CI, so the
  `types` field alone is sufficient. (Declaring `@types/node` in each package's
  `devDependencies` is the more explicit long-term hygiene move but is a
  dependency change requiring separate approval — logged as a follow-up, not done
  here.)
- **FR-4**: Package unit-test suites remain green (no test behavior change).

## Non-goals

- Actually triggering/observing a green CI run (cannot run remote CI from here);
  this track lands the fix that unblocks it. The deploy landing is verified
  separately once CI runs on push.
- The `math-content` package lint gate + standalone `tsc` red (separate
  tech-debt rows, same class but out of scope here).
- BM2 manual-only deploy wiring.

## Acceptance Criteria

- [ ] All four `npm run typecheck --workspace=packages/<pkg>` commands exit 0.
- [ ] Each package `tsconfig.json` sets `compilerOptions.types` including `node`
      (and `vitest/globals` where test files are compiled).
- [ ] Package test suites still pass.
- [ ] tech-debt.md line 35 updated to reflect the Phase 1 typecheck root cause
      resolved (deploy pending a CI run).
