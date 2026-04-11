# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

## Architecture & Design
<!-- Decisions made that future tracks should be aware of -->

- (2026-04-05, setup) Scaffolded from bus-math-v2; architecture.md and tech-specs.md preserved as-is in conductor/ for reference
- (2026-04-05, setup) Convex internal queries/mutations require server-side admin auth — all data fetching from pages goes through `lib/convex/server.ts` helpers
- (2026-04-05, setup) No app/ page files currently exist — pages are represented by directory structure but need to be created

## Recurring Gotchas
<!-- Problems encountered repeatedly; save future tracks from the same pain -->

- (2026-04-05, setup) vinext (Vite-backed Next.js) may have subtle differences from stock Next.js — test builds early
- (2026-04-06, scaffold-pages) `convex/_generated/` is empty until `npx convex dev` is run — dev server fails with "Cannot find module '@/convex/_generated/api'" until initialized
- (2026-04-06, scaffold-pages) Async RSC pages cannot be rendered with `React.createElement(Page)` in tests — await the component call first: `const jsx = await PageComponent(props); render(jsx)`
- (2026-04-06, scaffold-pages) Test files do not need `import React from 'react'` with the new JSX transform — importing it causes `@typescript-eslint/no-unused-vars` lint errors; use JSX syntax directly
- (2026-04-08, fix-spreadsheet-table) Schema porting from bus-math-v2 requires running `npx tsc --noEmit` to catch missing tables — TypeScript errors only surface when tables referenced in functions are not defined in schema
- (2026-04-08, setup) Use `npx convex dev --once` for one-time type generation without starting the dev server — faster than running full dev server and suitable for CI/autonomous workflows
- (2026-04-10, graphing-components) JavaScript's -0 (negative zero) appears in calculations like -b/(2a) when b=0 — use `Object.is(val, -0)` to detect and convert to 0

## Patterns That Worked Well
<!-- Approaches worth repeating -->

- (2026-04-05, setup) Existing `lib/` modules (dashboard.ts, lesson-runtime.ts) are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` and `@/lib/auth/server` at the top of page tests — keeps page tests fast and isolated without needing a live Convex connection
- (2026-04-06, scaffold-pages) Copy shadcn/ui components from bus-math-v2 rather than re-running `npx shadcn add` — same package versions, no new dependencies
- (2026-04-08, setup) Add `typecheck` script to package.json early in project setup — enables `npm run typecheck` for TDD workflow matching AGENTS.md requirements
- (2026-04-08, scaffold-component-infrastructure) Empty index.ts files need `export {}` to be recognized as TypeScript modules — otherwise import tests fail with "File is not a module" error
- (2026-04-09, e-textbook-design) Use Tailwind animate-in classes for smooth transitions instead of installing framer-motion — lighter weight, no new dependencies
- (2026-04-09, e-textbook-design) Client components with useState should be minimal — keep state logic simple and focused; complex state can be extracted to custom hooks if needed
- (2026-04-10, scaffold-component-infrastructure) Test button elements by their accessible name (aria-label) rather than just visual text — buttons with icons rely on aria-label for screen readers
- (2026-04-10, scaffold-component-infrastructure) Use color-coded backgrounds and icons for visual hierarchy in dashboard cards — helps users quickly identify different metric types

- (2026-04-09, lesson-rendering) `npm run lint ... 2>&1 | tail -N` swallows the non-zero exit code — lint errors are silently ignored and commits proceed; always check lint exit code directly before staging
- (2026-04-09, lesson-rendering) bus-math-v2 components that depend on `Card` from shadcn/ui must be rewritten with plain Tailwind divs — IM3 only has button/dropdown-menu/avatar/badge; check available components before porting
- (2026-04-09, lesson-rendering) Convex `getLessonProgress` fetches sections in a per-phase loop (N queries); acceptable for lesson sizes but worth noting for large phase counts
- (2026-04-09, lesson-rendering) `useEffect` keydown listeners on `document` work well for global keyboard shortcuts — clean up with return function; include `activePhaseNumber` in dep array so the handler always sees fresh state

## Planning Improvements
<!-- Notes on where estimates were wrong and why -->

- (2026-04-10, activity-infrastructure) activity_completions schema requires lessonId/phaseNumber which aren't available in practice.v1 envelope — future work should either pass context separately or redesign completion tracking
- (2026-04-10, activity-infrastructure) Union types in TypeScript require type guards for safe property access — use if/else checks on discriminant (e.g., success boolean) before accessing variant-specific properties
- (2026-04-10, activity-infrastructure) PhaseActivityTracker provides in-memory completion tracking for UI gating — persistence to Convex deferred until lesson context is available
- (2026-04-10, graphing-components) Canvas coordinate mapping is complex — allocate more time for interactive components with SVG/canvas; test coordinate transformations thoroughly
- (2026-04-11, graphing-components) Test coordinates must match actual canvas coordinates — verify coordinate transformations before writing tests; component's transformDataToCanvas is the source of truth
- (2026-04-11, fix-intercept-tests) Test failures were due to incorrect test coordinates, not component logic — always verify test assumptions match implementation before fixing component code

