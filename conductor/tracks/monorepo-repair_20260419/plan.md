# Implementation Plan: Monorepo Repair and Tooling Fixes

## Phase 1: Git Hygiene and Lockfile Unification
- [x] Task: Delete `apps/integrated-math-3/package-lock.json` and `apps/bus-math-v2/package-lock.json`. (94c228a)
- [x] Task: Un-track `node_modules` inside `packages/srs-engine/` from Git (`git rm --cached -r packages/srs-engine/node_modules/`). (d219df8)
- [ ] Task: Run `npm install` at the root workspace to resolve all dependencies and create valid workspace symlinks.
- [ ] Task: Conductor - User Manual Verification 'Git Hygiene and Lockfile Unification' (Protocol in workflow.md)

## Phase 2: Package Dependency Alignment and Convex Codegen
- [ ] Task: Add `@math-platform/ai-tutoring`, `@math-platform/practice-test-engine`, `@math-platform/teacher-reporting-core`, `@math-platform/workbook-pipeline`, and `@math-platform/study-hub-core` to `apps/integrated-math-3/package.json` dependencies.
- [ ] Task: Re-run root `npm install` to update the root `package-lock.json` with the new IM3 dependencies.
- [ ] Task: Run `npx convex dev --until-success` or equivalent inside `apps/integrated-math-3` to generate `convex/_generated/`.
- [ ] Task: Conductor - User Manual Verification 'Package Dependency Alignment and Convex Codegen' (Protocol in workflow.md)

## Phase 3: Build Scripts and Test Configuration
- [ ] Task: Modify root `package.json` `ws:im3:typecheck` and `ws:bm2:typecheck` scripts to use `--project` or `-p` instead of `--prefix`.
- [ ] Task: Remove duplicate `ws:im3:*` workspace scripts from `apps/integrated-math-3/package.json`.
- [ ] Task: Create a base `vitest.config.ts` file in `packages/core-auth`, `packages/core-convex`, `packages/activity-runtime`, `packages/component-approval`, and `packages/graphing-core`.
- [ ] Task: Add `typecheck` and `lint` scripts to `packages/practice-test-engine/package.json`.
- [ ] Task: Conductor - User Manual Verification 'Build Scripts and Test Configuration' (Protocol in workflow.md)

## Phase 4: CI/CD Pipeline Hardening
- [ ] Task: Update the CI workflow file (e.g., `.github/workflows/ci.yml`) to remove `continue-on-error: true` from the package testing matrix.
- [ ] Task: Modify the BM2 CI step to rely on root `npm ci` and workspace commands instead of `npm ci --prefix apps/bus-math-v2`.
- [ ] Task: Conductor - User Manual Verification 'CI/CD Pipeline Hardening' (Protocol in workflow.md)

## Phase 5: Deep Audit and Final Validation
- [ ] Task: Run `npm run ws:im3:typecheck` and verify the `@math-platform/*` and Convex module resolution errors are resolved.
- [ ] Task: Run `npm run ws:im3:test` and ensure tests execute properly with workspace routing.
- [ ] Task: Run individual validations (lint, test, typecheck) on the 5 newly configured packages.
- [ ] Task: Run monorepo boundary script (`node scripts/check-monorepo-boundaries.mjs`) to ensure no violations were introduced.
- [ ] Task: Conductor - User Manual Verification 'Deep Audit and Final Validation' (Protocol in workflow.md)