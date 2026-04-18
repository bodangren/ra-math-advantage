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

- [x] **Task: Audit lib/practice/ vs @math-platform/practice-core**
  - [x] List all files in `apps/integrated-math-3/lib/practice/`
  - [x] Compare with `packages/practice-core/src/`
  - [x] Identify 8 duplicate files mentioned in tech-debt
  - [x] Identify import usages in codebase

- [x] **Task: Delete duplicate practice files and rewire imports**
  - [x] Delete files that exist in `@math-platform/practice-core`
  - [x] Keep app-local business-domain files (objective-proficiency, srs-proficiency, objective-policy)
  - [x] Rewire all imports to `@math-platform/practice-core`
  - [x] Rewire 15+ Convex seed files importing from `lib/practice/`

- [x] **Task: Verify lib/practice/ migration**
  - [x] Run `npx tsc --noEmit` - PASS
  - [x] Verify Convex seed files use correct imports
  - [x] Run `npm run build` - PASS
  - [x] Run `npm run lint -- --max-warnings 0` - PASS

## Phase 3: Audit and Migrate lib/srs/

### Tasks

- [x] **Task: Audit lib/srs/ vs @math-platform/srs-engine**
  - [x] List all files in `apps/integrated-math-3/lib/srs/`
  - [x] Compare with `packages/srs-engine/src/`
  - [x] Identify 6 duplicate files mentioned in tech-debt
  - [x] Identify import usages

- [x] **Task: Delete duplicate srs files and rewire imports**
  - [x] Delete files that exist in `@math-platform/srs-engine`
  - [x] Keep app-local persistence adapters (convexCardStore, convexSessionStore, convexReviewLogStore)
  - [x] Rewire all imports

- [x] **Task: Verify lib/srs/ migration**
  - [x] Run `npx tsc --noEmit`

## Phase 4: Audit and Migrate lib/convex/

### Tasks

- [x] **Task: Audit lib/convex/ vs @math-platform/core-convex**
  - [x] List all files in `apps/integrated-math-3/lib/convex/`
  - [x] Compare with `packages/core-convex/src/`
  - [x] Identify duplicate admin.ts and config.ts

- [x] **Task: Delete duplicate convex files and rewire imports**
  - [x] Delete duplicate admin.ts and config.ts
  - [x] Rewire server.ts imports to `@math-platform/core-convex`

- [x] **Task: Verify lib/convex/ migration**
  - [x] Run `npx tsc --noEmit` - PASS

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
