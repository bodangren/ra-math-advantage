# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

## Architecture & Design
<!-- Decisions made that future tracks should be aware of -->

- (2026-04-05, setup) Scaffolded from bus-math-v2; architecture.md preserved in conductor/ for reference
- (2026-04-05, setup) Convex internal queries/mutations require server-side admin auth — all data fetching from pages goes through `lib/convex/server.ts` helpers
- (2026-04-12, graphing-components) Activity registry requires wrapper components to adapt component-specific props to ActivityComponentProps

## Recurring Gotchas
<!-- Problems encountered repeatedly; save future tracks from the same pain -->

- (2026-04-05, setup) vinext (Vite-backed Next.js) may have subtle differences from stock Next.js — test builds early
- (2026-04-06, scaffold-pages) `convex/_generated/` is empty until `npx convex dev` is run — dev server fails until initialized
- (2026-04-06, scaffold-pages) Async RSC pages cannot be rendered with `React.createElement(Page)` in tests — await the component call first
- (2026-04-08, setup) Schema porting from bus-math-v2 requires running `npx tsc --noEmit` to catch missing tables
- (2026-04-08, setup) Use `npx convex dev --once` for one-time type generation — faster for CI/autonomous workflows
- (2026-04-10, graphing-components) JavaScript's -0 (negative zero) appears in calculations like -b/(2a) when b=0 — use `Object.is(val, -0)` to detect
- (2026-04-12, submission-schema) Zod 4.x `z.record()` requires explicit key type — use `z.record(z.string(), z.unknown())`, not `z.record(z.unknown())`

## Patterns That Worked Well
<!-- Approaches worth repeating -->

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` and `@/lib/auth/server` at the top of page tests — keeps tests fast and isolated
- (2026-04-08, setup) Add `typecheck` script to package.json early — enables `npm run typecheck` for TDD workflow
- (2026-04-08, scaffold-component-infrastructure) Empty index.ts files need `export {}` to be recognized as TypeScript modules
- (2026-04-09, e-textbook-design) Use Tailwind animate-in classes for smooth transitions — lighter weight than framer-motion
- (2026-04-09, e-textbook-design) Client components with useState should be minimal — keep state logic simple and focused
- (2026-04-10, scaffold-component-infrastructure) Test button elements by their accessible name (aria-label) — buttons with icons rely on aria-label
- (2026-04-11, fix-bundle-size) Use `next/dynamic` with `ssr: true` for heavy components — reduces bundle size without breaking SSR
- (2026-04-09, lesson-rendering) `npm run lint ... 2>&1 | tail -N` swallows the non-zero exit code — always check lint exit code directly before staging
- (2026-04-12, graphing-components) Explicitly type arrays that will be pushed to — prevents TypeScript union type inference errors
- (2026-04-12, graphing-components) Create wrapper components for activity registry to adapt component-specific props

## Planning Improvements
<!-- Notes on where estimates were wrong and why -->

- (2026-04-10, activity-infrastructure) activity_completions schema requires lessonId/phaseNumber not in practice.v1 — future work: pass context or redesign
- (2026-04-10, graphing-components) Canvas coordinate mapping is complex — allocate more time; test transformations thoroughly
- (2026-04-11, graphing-components) Test coordinates must match actual canvas coordinates — verify before writing tests; transformDataToCanvas is source of truth
- (2026-04-11, fix-intercept-tests) Test failures were due to incorrect test coordinates — verify assumptions match implementation before fixing code
- (2026-04-11, extract-quadratic-regex) Regex with optional sign-only captures causes `parseFloat()` to return `NaN` — handle with `isNaN()` check
- (2026-04-12, extract-linear-regex) `parseLinear()` must reject expressions with `x^2` — use early return if `expression.includes('x^2')`
- (2026-04-12, graphing-components) GraphingExplorer submission follows practice.v1 — include answers, parts, artifact, interactionHistory; variant field supports extensibility
 - (2026-04-12, graphing-system) Intersection point coordinates inverted in tests — (x, y) transforms to (canvasX, height - canvasY), not (canvasX, canvasY)
 - (2026-04-12, graphing-components) Zod schema imports can fail in test environment — validate structure manually when needed
 - (2026-04-12, algebraic-examples) Pattern-matching equivalence works for Module 1 scope but has limits for complex cases — 84% test coverage acceptable; symbolic math library needed for full equivalence checking

