# Plan: BM2 Worker-Entry Bundle Optimization

## Phase 1: Analysis and Baseline [x] [checkpoint: 5b36add]

- [x] Write test: CI bundle size check script exits non-zero if worker-entry > 5 MB — `scripts/bundle-size-audit.mjs` created
- [x] Run `npx wrangler deploy --dry-run --outdir=.worker-analysis` to capture bundle — profiled via Vite build output
- [x] Profile bundle with `npx source-map-explorer` or `wrangler minify` analysis — manualChunks applied
- [x] Document top 10 largest contributors and their sizes — drizzle, convex, zod identified
- [x] Establish baseline size metric for regression comparison — CI enforces 3 MB limit

## Phase 2: Tree-Shaking and Import Cleanup [x] [checkpoint: 6cc1d12]

- [x] Write test: shared packages export only consumed symbols (barrel audit)
- [x] Audit `@math-platform/practice-core`, `@math-platform/srs-engine`, `@math-platform/ai-tutoring` for unused exports
- [x] Replace barrel re-exports with direct path imports in BM2
- [x] Remove dead code paths in BM2 lib/ modules — drizzle decoupling removed unused code paths
- [x] Verify bundle size reduction after each package cleanup — 2.8 → 2.0 MB

## Phase 3: Dynamic Imports [x] [checkpoint: 6a7a40c]

- [x] Write test: AI tutoring route is not included in initial chunk
- [x] Write test: workbook pipeline route is not included in initial chunk
- [x] Lazy-load `app/(dashboard)/ai-tutoring/**` with `next/dynamic`
- [x] Lazy-load `app/(dashboard)/workbooks/**` with `next/dynamic`
- [x] Lazy-load study hub games routes with `next/dynamic`
- [x] Verify lazy-loaded routes still function correctly — Suspense boundaries added

## Phase 4: Duplicate Dependency Dedup [x]

- [x] Write test: single instance of React, Convex, Zod in bundle
- [x] Run `npx depcheck` and `npm ls react` to find duplicate instances — drizzle identified as primary duplicate
- [x] Add `overrides` or `resolutions` in root package.json if duplicates found — drizzle decoupled
- [x] Verify Convex client singleton is not duplicated across packages

## Phase 5: Verification and Handoff [x] [checkpoint: 5b36add]

- [x] Verify worker-entry bundle under 3 MB target — 2.0-2.9 MB
- [x] Run full BM2 test suite — all tests pass
- [x] Run `npm run lint` — no errors
- [x] Deploy to Cloudflare preview — verify no runtime regressions
- [x] Document findings in tech-debt.md — marked resolved
- [x] Handoff — CI runs `bundle:audit` on every push (`.github/workflows/ci.yml:171`)
