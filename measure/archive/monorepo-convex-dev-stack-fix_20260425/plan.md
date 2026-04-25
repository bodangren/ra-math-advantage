# Monorepo Convex Dev Stack Startup Fix - Implementation Plan

## Phase 1: Diagnose
- [x] Reproduce and capture failing IM3 `dev:stack` logs.
- [x] Validate AP Precalculus Convex client startup failure signal.
- [x] Confirm likely monorepo causes (readiness probe + env/cwd assumptions).

## Phase 2: Implementation
- [x] Patch IM3 and AP Precalculus `scripts/dev-stack.mjs` to use output-based Convex readiness and app-root `cwd`.
- [x] Remove shell-true child-process invocation pattern causing `DEP0190` warnings.
- [x] Patch IM3 and AP Precalculus `ConvexClientProvider.tsx` to use shared `getConvexUrl()` fallback behavior.

## Phase 3: Verification and Closure
- [x] Smoke test IM3 and AP Precalculus `dev:stack` startup behavior.
- [x] Run lint/typecheck for touched app workspaces.
- [x] Mark track complete and update `measure/tracks.md`.

## Verification Notes
- 2026-04-25: Focused setup tests pass for IM3 and AP Precalculus: `CI=true npx vitest run __tests__/setup/dev-stack-script.test.ts __tests__/setup/convex-provider.test.ts`.
- 2026-04-25: Smoke checks reached Convex readiness and frontend readiness for both app workspaces before the expected `timeout 45s` stop.
- 2026-04-25: `npm run build --workspace=apps/integrated-math-3` and `npm run build --workspace=apps/pre-calculus` pass.
- 2026-04-25: `npm run lint --workspace=apps/pre-calculus`, `npx tsc --noEmit` in `apps/pre-calculus`, and focused ESLint for touched files in both apps pass.
- 2026-04-25: Full IM3 lint/typecheck remain blocked by pre-existing untracked `apps/integrated-math-3/__tests__/convex/srs/dashboard.test.ts` errors: unused `queueItems`, missing `getDayStart`, and missing `calculateStreak` exports from `@/convex/srs/dashboard`.
- 2026-04-25: Manual IM3 smoke check exposed Vinext RSC runtime errors from server-side `next/dynamic` wrappers around client components. Replaced dynamic wrappers in `app/layout.tsx` and `app/teacher/dashboard/srs/page.tsx` with direct client component imports; focused regression tests pass and bounded IM3 `dev:stack` stays ready without the client-reference error.
- 2026-04-25: Manual BM2 smoke check exposed Convex module path validation failure for `convex/srs-validators.ts`. Renamed it to `convex/srs_validators.ts` and updated imports/tests; focused validator test passes and bounded BM2 `dev:stack` reaches Convex readiness plus Vinext startup.
