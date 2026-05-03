# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| internal Convex fns rely on action wrapper for auth | Medium | Open | activities.ts, study.ts, srs/cards.ts, student.ts have no defense-in-depth |
| BM2 activities/complete proxies errorPayload.details | Low | Open | Internal API details exposed to client |
| practice-core: computeBaseRating([]) untested edge case | Low | Open | Empty parts array returns 'Again' — may be unintended |
| 14 v.any() fields remain in IM3 Convex schema | Medium | Open | Metadata bags (7), phase_sections.content, activities.props, spreadsheetData, draftData, fsrsState, preferences |
| 40+ seed lesson tests vacuous | Low | Open | Test hardcoded data against itself; convert to data-driven validator |
| BM2 3 governance tests skip (missing docs/) | Low | Open | infrastructure.test, components-catalog, practice-component-legacy-backfill — docs/ paths removed in monorepo |
| Equivalence checker: 2 .todo tests | Low | Open | Need symbolic math lib |
| StepByStepper hint tracking test flaky | Low | Open | Passes in isolation; timing/ordering issue in full run |
| Seed lesson data integrity validator missing | Medium | Open | No cross-reference between seed data and curriculum source files |
| Bundle size CI gate not wired into GitHub Actions | Low | Open | BM2 audit script exists but not in CI pipeline |
| Rate limiters need `npm install` to link new package | Low | Open | `@math-platform/rate-limiter` package created but workspace symlink not refreshed |
