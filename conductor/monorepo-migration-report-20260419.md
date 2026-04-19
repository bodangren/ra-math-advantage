# Monorepo Migration Review — 2026-04-19

## Overview

194 commits over ~48 hours transformed a single-app IM3 repo into a monorepo with:
- **2 apps**: `apps/integrated-math-3/`, `apps/bus-math-v2/`
- **13 shared packages** under `packages/` (plus a `_template`)
- A CI matrix workflow validating packages, boundary guards, and per-app gates

The extraction followed a disciplined Conductor-tracked wave approach (Waves 0–6), with code reviews interspersed. That structure is good. However, several significant issues remain.

---

## Mistakes / Issues Found

### 1. CRITICAL: 1,325 TypeScript errors in IM3

The app has **1,325 TS errors**. Breakdown:
- **813 `TS7006`** — implicit `any` (no type annotations, likely in Convex handlers/tests)
- **462 `TS2307`** — cannot find module. The biggest offenders:
  - `@/convex/_generated/server` (91) and `_generated/dataModel` (67+31) — **Convex codegen has never been run** in the app's new location
  - `@math-platform/*` packages (44 for srs-engine, 21 for teacher-reporting-core, etc.) — **packages are imported but not in `package.json` dependencies**

**Root cause**: IM3's `package.json` lists only 8 of 13 packages. Missing: `ai-tutoring`, `practice-test-engine`, `teacher-reporting-core`, `workbook-pipeline`, `study-hub-core`. Code already imports from all of them.

### 2. CRITICAL: No Convex `_generated/` in IM3

`apps/integrated-math-3/convex/_generated/` does not exist. Without running `npx convex dev` post-move, every Convex import is broken. This means the app **cannot build or type-check**.

### 3. HIGH: `node_modules` tracked in git

`packages/srs-engine/node_modules/.vite/vitest/...results.json` is committed. The `.gitignore` covers `node_modules/` at root but srs-engine's nested one slipped through.

### 4. HIGH: Per-app `package-lock.json` files exist alongside root workspaces

Both `apps/bus-math-v2/package-lock.json` and `apps/integrated-math-3/package-lock.json` exist (~500KB each). With npm workspaces, only the **root** `package-lock.json` should be authoritative. Having per-app lockfiles creates confusion about which dependencies are actually resolved and can cause `npm ci` to fail or install different versions.

### 5. HIGH: CI silently swallows package failures

The CI workflow runs `npm run test` and `npm run lint` for each package with `continue-on-error: true`. A broken package merges without anyone noticing. This is already noted in tech-debt but is actively dangerous.

### 6. HIGH: BM2 CI uses `npm ci --prefix` instead of workspace install

```yaml
- run: npm ci --prefix apps/bus-math-v2
```

This installs BM2 in isolation, ignoring workspace hoisting. The BM2 step should use `npm ci` at root (already done for other jobs) and run tests via workspace. The `--prefix` pattern also explains why BM2 has its own `package-lock.json`.

### 7. MEDIUM: `practice-test-engine` package missing `typecheck` and `lint` scripts

CI runs `typecheck` and `lint` for every package in the matrix, but `practice-test-engine` has neither. CI will fail or silently skip this package.

### 8. MEDIUM: Root `tsconfig.json` has `include: []` and `composite: true`

This combination means `npx tsc --noEmit` at root will always error (`TS18003: No inputs found`). If this is intended as a project-references root, it should have `references` pointing to apps/packages. Currently it serves no purpose.

### 9. MEDIUM: `components.json` (shadcn) uses `@/*` aliases that resolve relative to root

The shadcn config at root points to `apps/integrated-math-3/app/globals.css` but uses `@/components`, `@/lib` aliases. Running `npx shadcn add` from root will put components in the wrong place.

### 10. LOW: Deploy workflow deploys IM3 on every push to master

No staging, no approval gate, no canary. Already noted in tech-debt.

---

## What's Left To Do

### Must-fix (blocking build/CI)

1. **Run Convex codegen** in `apps/integrated-math-3/` to generate `convex/_generated/`
2. **Add missing package deps** to IM3's `package.json`: `@math-platform/ai-tutoring`, `practice-test-engine`, `teacher-reporting-core`, `workbook-pipeline`, `study-hub-core`
3. **Remove per-app `package-lock.json`** files — use only root lockfile with workspaces
4. **Remove tracked `node_modules`** from git: `git rm --cached packages/srs-engine/node_modules/...`
5. **Add `typecheck`/`lint` scripts** to `practice-test-engine`
6. **Fix CI `continue-on-error`** on package test/lint steps — failing packages should fail the build
7. **Fix BM2 CI** to use workspace install instead of `--prefix`

### Should-fix (correctness/health)

8. **Fix root `tsconfig.json`** — either add project references or remove `composite: true` and make `include` meaningful
9. **Fix the 813 `TS7006` implicit-any errors** — these are real type-safety gaps, mostly in Convex handlers where `ctx` and `args` lack annotations
10. **Wire up BM2 to consume** `practice-test-engine`, `teacher-reporting-core`, `workbook-pipeline`, `study-hub-core` packages (currently not declared as deps)
11. **Address BM2's ~296 TS errors** — currently entirely suppressed via `|| true` in CI
12. **Add `**/node_modules/` pattern** to `.gitignore` to prevent future leaks

### Nice-to-have (quality)

13. **Add package-level tests** — currently 0 test files across all 13 packages (tests are only in apps)
14. **Move shadcn `components.json`** into `apps/integrated-math-3/` where it belongs
15. **Add a deploy staging step** before production
16. **Consolidate the 36 items in tech-debt.md** — several are now moot post-migration

---

### Additional Mistakes / Issues Found

### 11. HIGH: Root `npm install` omitted
Workspace symlinks for packages inside `node_modules` were never generated because `npm install` hasn't been run at the monorepo root. This contributes to the widespread module resolution failures.

### 12. HIGH: Invalid `--prefix` option for `tsc`
Root `package.json` uses `npx tsc --noEmit --prefix apps/integrated-math-3` for the `ws:im3:typecheck` script. `tsc` does not support the `--prefix` flag, which causes the command to fail immediately. It should use `--project` or `-p`.

### 13. MEDIUM: Redundant workspace scripts in app `package.json`
`apps/integrated-math-3/package.json` redundantly duplicates the root workspace scripts (`ws:im3:lint`, `ws:im3:test`, etc.), referencing itself circularly.

### 14. MEDIUM: Missing `vitest.config.ts` in extracted packages
Five newly extracted packages (`core-auth`, `core-convex`, `activity-runtime`, `component-approval`, `graphing-core`) are missing `vitest.config.ts` configurations, preventing isolated test-runner execution.

### Additional Must-fix

17. **Run `npm install`** at the repository root to establish workspace symlinks.
18. **Fix root `package.json` typecheck scripts** to use `--project apps/integrated-math-3/tsconfig.json` instead of the unsupported `--prefix` flag.
19. **Remove redundant workspace scripts** (`ws:im3:*`) from `apps/integrated-math-3/package.json`.
20. **Add `vitest.config.ts`** to the 5 newly extracted packages that are missing it.

## Summary

The structural migration is mostly complete — apps are moved, packages are extracted, CI exists. But the monorepo is currently in a **non-building state** due to missing Convex codegen, undeclared package dependencies, missing root workspace installation, and broken `tsc` commands. The CI pipeline masks this by suppressing failures. Fixing the Must-fix items above would get the repo to a genuinely green state.
