# Implementation Plan: App Import Migration

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section for app-import-migration.

## Phase 1: Audit Duplicate Files in lib/auth/

### Tasks

- [x] **Task: Audit lib/auth/ vs @math-platform/core-auth**
  - [x] List all files in `apps/integrated-math-3/lib/auth/`
  - [x] Compare with `packages/core-auth/src/`
  - [x] Identify which files are duplicates vs app-local
  - [x] Identify import usages in codebase

- [x] **Task: Delete duplicate auth files and rewire imports**
  - [x] Delete files that exist in `@math-platform/core-auth`
  - [x] Keep app-local server.ts and developer.ts (Next.js-specific utilities)
  - [x] Rewire all imports in `apps/integrated-math-3/` to `@math-platform/core-auth`
  - [x] Rewire middleware and route imports

- [x] **Task: Verify lib/auth/ migration**
  - [x] Run `npx tsc --noEmit` - PASS
  - [x] Run `npm run lint -- --max-warnings 0` - PASS
  - [x] Run `npm run build` - PASS

## Phase 2: Audit and Migrate lib/practice/

### Tasks

- [ ] **Task: Audit lib/practice/ vs @math-platform/practice-core**
  - [ ] List all files in `apps/integrated-math-3/lib/practice/`
  - [ ] Compare with `packages/practice-core/src/`
  - [ ] Identify 8 duplicate files mentioned in tech-debt
  - [ ] Identify import usages in codebase

- [ ] **Task: Delete duplicate practice files and rewire imports**
  - [ ] Delete files that exist in `@math-platform/practice-core`
  - [ ] Keep app-local business-domain files (lib/practice/engine, etc.)
  - [ ] Rewire all imports to `@math-platform/practice-core`
  - [ ] Rewire 15+ Convex seed files importing from `lib/practice/`

- [ ] **Task: Verify lib/practice/ migration**
  - [ ] Run `npx tsc --noEmit`
  - [ ] Verify Convex seed files use correct imports

## Phase 3: Audit and Migrate lib/srs/

### Tasks

- [ ] **Task: Audit lib/srs/ vs @math-platform/srs-engine**
  - [ ] List all files in `apps/integrated-math-3/lib/srs/`
  - [ ] Compare with `packages/srs-engine/src/`
  - [ ] Identify 6 duplicate files mentioned in tech-debt
  - [ ] Identify import usages

- [ ] **Task: Delete duplicate srs files and rewire imports**
  - [ ] Delete files that exist in `@math-platform/srs-engine`
  - [ ] Keep app-local persistence adapters (convexCardStore, convexSessionStore, convexReviewLogStore)
  - [ ] Rewire all imports

- [ ] **Task: Verify lib/srs/ migration**
  - [ ] Run `npx tsc --noEmit`

## Phase 4: Audit and Migrate lib/convex/

### Tasks

- [ ] **Task: Audit lib/convex/ vs @math-platform/core-convex**
  - [ ] List all files in `apps/integrated-math-3/lib/convex/`
  - [ ] Compare with `packages/core-convex/src/`
  - [ ] Identify duplicate admin.ts and config.ts

- [ ] **Task: Delete duplicate convex files and rewire imports**
  - [ ] Delete duplicate admin.ts and config.ts
  - [ ] Rewire imports to `@math-platform/core-convex`

- [ ] **Task: Verify lib/convex/ migration**
  - [ ] Run `npx tsc --noEmit`

## Phase 5: Fix package.json Dependencies

### Tasks

- [ ] **Task: Add @math-platform/* dependencies to package.json**
  - [ ] Audit all `@math-platform/*` imports in `apps/integrated-math-3/`
  - [ ] Add missing dependencies to `apps/integrated-math-3/package.json`
  - [ ] Verify with `npm ls` that all packages are properly linked

- [ ] **Task: Verify dependency graph**
  - [ ] Run `npm ls @math-platform/practice-core` and other packages
  - [ ] Ensure no missing peer dependencies

## Phase 6: Final Verification

### Tasks

- [ ] **Task: Run full verification suite**
  - [ ] `npm run build`
  - [ ] `npx tsc --noEmit`
  - [ ] `npm run lint -- --max-warnings 0`
  - [ ] `vitest run`

- [ ] **Task: Update tech-debt.md**
  - [ ] Mark resolved items as resolved
  - [ ] Document any new tech debt discovered

- [ ] **Task: Finalize and handoff**
  - [ ] Commit with model name in commit message
  - [ ] Push phase checkpoint
