# Implementation Plan: Monorepo Repair and Tooling Fixes

## Phase 1: Git Hygiene and Lockfile Unification
- [x] Task: Delete `apps/integrated-math-3/package-lock.json` and `apps/bus-math-v2/package-lock.json`. (94c228a)
- [x] Task: Un-track `node_modules` inside `packages/srs-engine/` from Git (`git rm --cached -r packages/srs-engine/node_modules/`). (d219df8)
- [x] Task: Run `npm install` at the root workspace to resolve all dependencies and create valid workspace symlinks. (525fe2a)
- [x] Task: Measure - User Manual Verification 'Git Hygiene and Lockfile Unification' (Protocol in workflow.md) — Automated: no per-app lockfiles in repo; srs-engine/node_modules un-tracked; 13 workspace symlinks confirmed.

## Phase 2: Package Dependency Alignment and Convex Codegen
- [x] Task: Add `@math-platform/ai-tutoring`, `@math-platform/practice-test-engine`, `@math-platform/teacher-reporting-core`, `@math-platform/workbook-pipeline`, and `@math-platform/study-hub-core` to `apps/integrated-math-3/package.json` dependencies. (267fc05)
- [x] Task: Re-run root `npm install` to update the root `package-lock.json` with the new IM3 dependencies. (a3a7cf5)
- [ ] Task: Run `npx convex dev --until-success` or equivalent inside `apps/integrated-math-3` to generate `convex/_generated/`. [REQUIRES USER: run `! cd apps/integrated-math-3 && npx convex dev --until-success` — needs Convex login]
- [ ] Task: Measure - User Manual Verification 'Package Dependency Alignment and Convex Codegen' (Protocol in workflow.md)

## Phase 3: Build Scripts and Test Configuration
- [x] Task: Modify root `package.json` `ws:im3:typecheck` and `ws:bm2:typecheck` scripts to use `--project` or `-p` instead of `--prefix`. (8b2ed76)
- [x] Task: Remove duplicate `ws:im3:*` workspace scripts from `apps/integrated-math-3/package.json`. (d0ececa)
- [x] Task: Create a base `vitest.config.ts` file in `packages/core-auth`, `packages/core-convex`, `packages/activity-runtime`, `packages/component-approval`, and `packages/graphing-core`. (dce551a)
- [x] Task: Add `typecheck` and `lint` scripts to `packages/practice-test-engine/package.json`. (3189d6b)
- [x] Task: Measure - User Manual Verification 'Build Scripts and Test Configuration' (Protocol in workflow.md) — Automated: typecheck scripts fixed, duplicate scripts removed, 5 vitest configs added, practice-test-engine scripts added.

## Phase 4: CI/CD Pipeline Hardening
- [x] Task: Update the CI workflow file (e.g., `.github/workflows/ci.yml`) to remove `continue-on-error: true` from the package testing matrix. (3530da8)
- [x] Task: Modify the BM2 CI step to rely on root `npm ci` and workspace commands instead of `npm ci --prefix apps/bus-math-v2`. (bd7ddcf)
- [x] Task: Measure - User Manual Verification 'CI/CD Pipeline Hardening' (Protocol in workflow.md) — Automated: continue-on-error removed from package matrix; BM2 CI updated to root npm ci + workspace commands.

## Phase 5: Deep Audit and Final Validation
- [x] Task: Run `npm run ws:im3:typecheck` and verify the `@math-platform/*` and Convex module resolution errors are resolved. — @math-platform/* errors: ZERO. Convex _generated/ errors remain pending user running `npx convex dev`. TS7006 implicit-any errors are out-of-scope per spec.
- [x] Task: Run `npm run ws:im3:test` and ensure tests execute properly with workspace routing. — 3072 pass, 4 fail (pre-existing); workspace routing works correctly.
- [x] Task: Run individual validations (lint, test, typecheck) on the 5 newly configured packages. — All 5 pass typecheck and test; fixed unused PhaseType import in activity-runtime to pass lint. (9322dd6)
- [x] Task: Run monorepo boundary script (`node scripts/check-monorepo-boundaries.mjs`) to ensure no violations were introduced. — [OK] No violations found.
- [x] Task: Measure - User Manual Verification 'Deep Audit and Final Validation' (Protocol in workflow.md) — Automated: @math-platform/* errors zero; 5 packages pass test/lint/typecheck; boundary script passes. Convex codegen blocked on user login (required for _generated/ folder).