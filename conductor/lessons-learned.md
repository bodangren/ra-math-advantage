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

## Patterns That Worked Well
<!-- Approaches worth repeating -->

- (2026-04-05, setup) Existing `lib/` modules (dashboard.ts, lesson-runtime.ts) are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` and `@/lib/auth/server` at the top of page tests — keeps page tests fast and isolated without needing a live Convex connection
- (2026-04-06, scaffold-pages) Copy shadcn/ui components from bus-math-v2 rather than re-running `npx shadcn add` — same package versions, no new dependencies

## Planning Improvements
<!-- Notes on where estimates were wrong and why -->

