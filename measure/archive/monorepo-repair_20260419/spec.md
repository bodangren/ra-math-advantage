# Specification: Monorepo Repair and Tooling Fixes

## Overview
This track addresses critical misconfigurations, missing dependencies, and tooling failures introduced during the monorepo migration. The goal is to return the monorepo to a building, type-safe, and cleanly tested state.

## Functional Requirements
1. **Workspace Symlinking:** Run `npm install` at the root workspace to generate necessary symlinks for all packages.
2. **Build Scripts Fixes:**
   - Modify the root `package.json` typecheck scripts to use the `--project` flag instead of the invalid `--prefix` flag for `tsc`.
   - Remove redundant `ws:im3:*` scripts from `apps/integrated-math-3/package.json`.
3. **Dependency Alignment:**
   - Add missing `@math-platform/*` package dependencies to `apps/integrated-math-3/package.json` (`ai-tutoring`, `practice-test-engine`, `teacher-reporting-core`, `workbook-pipeline`, `study-hub-core`).
4. **Convex Codegen:**
   - Execute Convex codegen in `apps/integrated-math-3` to generate the missing `convex/_generated/` directory.
5. **Git and Lockfile Hygiene:**
   - Delete per-app `package-lock.json` files in `apps/integrated-math-3/` and `apps/bus-math-v2/` to ensure the root workspace lockfile is authoritative.
   - Remove accidentally tracked `node_modules` in `packages/srs-engine/` from Git.
6. **CI/CD Hardening:**
   - Update CI pipeline to fail on package test/lint steps (remove `continue-on-error: true`).
   - Fix BM2 CI to use workspace install instead of `--prefix`.
   - Add `typecheck` and `lint` scripts to `practice-test-engine`.
7. **Test Configuration:**
   - Add standard `vitest.config.ts` files to `core-auth`, `core-convex`, `activity-runtime`, `component-approval`, and `graphing-core`.

## Out of Scope
- Fixing the 813 `TS7006` implicit-any errors in Convex handlers (this will be handled in a separate refactoring track).
- Addressing BM2's ~296 legacy TS errors.
- Adding package-level tests.

## Acceptance Criteria
- [ ] Running `npm run ws:im3:typecheck` at the root succeeds without any `@math-platform/*` missing module errors.
- [ ] Running `npm run ws:im3:test` and `npm run ws:bm2:test` succeeds using workspace tools.
- [ ] `apps/integrated-math-3/convex/_generated/` exists and resolves all Convex internal/public import errors.
- [ ] Only one `package-lock.json` exists in the entire repository (at the root).
- [ ] No `node_modules` directories are tracked in Git.
- [ ] Deep Audit: Individual package validations (lint, test, typecheck) pass successfully, and monorepo boundary script passes.