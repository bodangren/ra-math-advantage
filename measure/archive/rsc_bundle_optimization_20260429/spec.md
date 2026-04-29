# RSC Bundle Optimization — Specification

## Problem

The RSC (React Server Component) entry page chunk (`page-*.js`) is **891 KB**, exceeding the 500 KB target. This impacts Time to First Byte (TTFB) and Largest Contentful Paint (LCP).

Current chunk breakdown:
- `page-*.js`: 891.79 KB (TARGET: < 500 KB)
- `vendor-charts-*.js`: 830.03 KB (recharts + d3, already split)
- `vendor-katex-*.js`: 482.20 KB (already split)
- `vendor-markdown-*.js`: 410.52 KB (already split)
- `vendor-dnd-*.js`: 194.79 KB (already split)
- `vendor-convex-*.js`: 167.89 KB (already split)

## Root Cause

The page chunk contains the RSC entry point which statically imports app code. Even though activity components are lazy-loaded, the RSC bundler includes their type definitions and the module graph in the page chunk.

Build warnings indicate:
1. Dynamic imports that are also statically imported cannot be code-split
2. `/lib/convex/server.ts` is dynamically imported by teacher/lessons/page.tsx but statically imported by 20+ other files
3. `teacher/lessons/page.tsx` has the same issue

## Solution Strategy

1. **Analyze**: Run bundle analysis to identify what code is in the page chunk
2. **Extract**: Identify shared utilities/components that can be split into separate chunks
3. **Optimize**: Apply additional manualChunks rules to split large shared code
4. **Verify**: Confirm page chunk is under 500 KB

## Acceptance Criteria

- [ ] Page chunk is under 500 KB
- [ ] All app pages render correctly
- [ ] Build completes without errors
- [ ] TypeScript type checking passes