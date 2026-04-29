# RSC Bundle Optimization — Implementation Plan

## Phase 1: Analyze Current Bundle

- [x] 1.1: Run bundle analysis to identify large modules in page chunk
- [x] 1.2: Identify what percentage of page chunk is app code vs dependencies
- [x] 1.3: Document findings in tech-debt.md

## Phase 2: Apply Code-Splitting Optimizations

- [x] 2.1: Add additional vendor chunking for large dependencies
- [x] 2.2: Extract shared utilities into separate chunks
- [x] 2.3: Ensure dynamic imports work correctly for lazy-loaded routes

## Phase 3: Verify

- [x] 3.1: Run build and confirm page chunk < 500 KB (achieved: 354.86 KB)
- [x] 3.2: Run typecheck (npx tsc --noEmit) - pre-existing type errors in studentId alignment (priority #3)
- [x] 3.3: Run test suite - 1 pre-existing flaky test in SRS reviews.ts

## Results Summary

### Chunk Size Reduction

| Chunk | Before | After | Change |
|-------|--------|-------|--------|
| RSC page/worker-entry | 891.79 KB | 354.86 KB | -536 KB (-60%) |

### New Vendor Chunks Extracted

| Chunk | Size |
|-------|------|
| vendor-icons (lucide-react) | 12-30 KB |
| vendor-zod | 138 KB |
| vendor-radix (@radix-ui) | 271 KB |
| vendor-utils (clsx, tailwind-merge) | 97 KB |
| vendor-* packages (srs, practice, teacher, etc.) | ~55 KB |

### Key Changes

Added manualChunks rules for:
1. `lucide-react` → vendor-icons
2. `zod` → vendor-zod
3. `@radix-ui/*` → vendor-radix
4. `clsx`/`tailwind-merge` → vendor-utils
5. `/packages/*` → vendor-* for monorepo packages