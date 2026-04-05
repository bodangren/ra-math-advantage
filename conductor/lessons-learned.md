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

## Patterns That Worked Well
<!-- Approaches worth repeating -->

- (2026-04-05, setup) Existing `lib/` modules (dashboard.ts, lesson-runtime.ts) are pure functions with clear types — excellent for testing

## Planning Improvements
<!-- Notes on where estimates were wrong and why -->

