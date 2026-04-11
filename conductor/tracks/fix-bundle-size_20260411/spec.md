# Specification — Fix Bundle Size (RSC Entry Chunk)

## Track Overview

Reduce the Facade RSC entry chunk from 687 KB to under 500 KB by implementing code-splitting and lazy loading strategies.

## Problem Statement

The Facade RSC entry chunk is 687 KB, exceeding the 500 KB limit. This is causing:
- Slow initial page load
- Poor user experience on slower connections
- Large JavaScript bundles shipped to clients

**Root Causes:**
1. `MarkdownRenderer` eagerly imports `react-markdown`+`remark-gfm`+`katex` (~200 KB)
2. `ConvexClientProvider` in root layout ships convex client to every page including auth
3. No route-level code splitting
4. Activity registry components eagerly imported

## Acceptance Criteria

- [ ] Facade RSC entry chunk < 500 KB
- [ ] `MarkdownRenderer` lazy-loaded via `next/dynamic` in `LessonRenderer`+`LessonPageLayout`
- [ ] `ConvexClientProvider` moved behind dynamic import for auth pages
- [ ] Route-level splitting implemented for lesson and teacher pages
- [ ] Activity registry components lazy-loaded
- [ ] All tests pass after refactoring
- [ ] No functionality regressions

## Dependencies

- Track 3: Lesson Rendering Engine (completed)
- Track 5: Graphing Components (in progress)
- Track 6: Algebraic Worked-Example Components (pending)
- Track 7: Supporting Activity Components (pending)

## Out of Scope

- Changing the Convex architecture or data flow
- Implementing server-side rendering optimizations beyond code-splitting
- Optimizing third-party library bundles (react-markdown, katex, etc.)

## Success Metrics

- Facade RSC entry chunk < 500 KB
- All existing tests pass
- No TypeScript errors
- No user-facing functionality changes
