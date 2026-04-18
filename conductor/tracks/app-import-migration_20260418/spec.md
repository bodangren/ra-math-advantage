# Specification: App Import Migration

> CRITICAL: This migration deletes duplicate code in `apps/integrated-math-3/lib/` and rewires all imports to extracted `@math-platform/*` packages.

## Problem Statement

After Wave 1-3 package extraction, `apps/integrated-math-3/` still contains **byte-copy duplicates** of code now in packages:

| Location | Duplicate Files | Canonical Package |
|----------|----------------|-------------------|
| `lib/auth/` | 6 files | `@math-platform/core-auth` |
| `lib/srs/` | 6 files | `@math-platform/srs-engine` |
| `lib/practice/` | 8 files | `@math-platform/practice-core` |
| `lib/convex/` | 3 files | `@math-platform/core-convex` |

**Critical bugs in lib/auth/ copies** (vs core-auth package):
- `timingSafeEquals` leaks length via early return
- `generateRandomPassword` has modulo bias (25% skew)
- Missing `VERCEL_ENV === 'production'` guard in demo provisioning
- Password validation silently trims leading/trailing spaces

**Additional issues**:
- `apps/integrated-math-3/package.json` has 77+ imports from `@math-platform/*` but declares **zero** package dependencies
- 15+ Convex/seed files import from old `lib/practice/` paths instead of `@math-platform/practice-core`

## Scope

### In Scope

1. **lib/auth/ migration**
   - Delete duplicate files that are now in `@math-platform/core-auth`
   - Rewire all imports in `apps/integrated-math-3/` to use `@math-platform/core-auth`
   - Convex files importing from `lib/auth/` must also migrate

2. **lib/srs/ migration**
   - Delete duplicate files that are now in `@math-platform/srs-engine`
   - Rewire all imports in `apps/integrated-math-3/` to use `@math-platform/srs-engine`

3. **lib/practice/ migration**
   - Delete duplicate files that are now in `@math-platform/practice-core`
   - Rewire all imports in `apps/integrated-math-3/` (including Convex seed files) to use `@math-platform/practice-core`

4. **lib/convex/ migration**
   - Delete duplicate `admin.ts` and `config.ts` that are now in `@math-platform/core-convex`
   - Rewire imports

5. **package.json dependency cleanup**
   - Add all `@math-platform/*` packages as explicit dependencies in `apps/integrated-math-3/package.json`

### Out of Scope

- BM2 business-domain code (spreadsheets, simulations, `lib/practice/engine`, `resources/`, `public/workbooks/`)
- Any code in `apps/integrated-math-3/ convex/_generated/`
- Changes to package source code (only app-side rewiring)

## Success Criteria

1. All duplicate files in `lib/auth/`, `lib/srs/`, `lib/practice/`, `lib/convex/` are deleted
2. All imports in `apps/integrated-math-3/` resolve to `@math-platform/*` packages
3. All Convex seed files import from `@math-platform/practice-core` not `../../lib/practice/`
4. `apps/integrated-math-3/package.json` declares all `@math-platform/*` dependencies
5. `npm run build` passes (vinext build)
6. `npx tsc --noEmit` passes
7. `npm run lint -- --max-warnings 0` passes
8. `vitest run` passes (no new test failures)

## Non-Negotiable Rules

- After extracting a package, delete the app-local copy immediately — duplicated code diverges silently
- Run `npx tsc --noEmit` alongside `npm run build` — vinext build does not enforce TypeScript types
- BM2 business-domain code remains app-local
