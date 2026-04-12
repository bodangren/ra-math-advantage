# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-04-05 | setup | No seed.ts in convex/ for demo data | Medium | Open | Need seeding script for development |
| 2026-04-05 | setup | Legacy Supabase types in AuthProvider.tsx (snake_case profile fields) | Low | Open | Should migrate to camelCase matching Convex schema |
| 2026-04-09 | lesson-rendering | TypeScript error in PhaseCompleteButton.test.tsx — Promise type mismatch | Medium | Open | Type '(value: CompletePhaseResponse | PromiseLike<CompletePhaseResponse>) => void' not assignable to '(v: unknown) => void' |
| 2026-04-10 | activity-infrastructure | activity_completions table requires lessonId/phaseNumber not available in submission | Medium | Open | Submission mutation can't create completions without lesson context; PhaseActivityTracker handles client-side tracking |
| 2026-04-11 | graphing-components | Quadratic regex duplicated across 3 files (canvas-utils, HintPanel, InterceptIdentification) | Medium | Resolved | **Fixed in track extract-quadratic-regex_20260411:** Extracted to shared `parseQuadratic()` in `lib/activities/graphing/quadratic-parser.ts`. |
| 2026-04-11 | bundle | Facade RSC entry chunk 687 KB (limit 500 KB) — no code-splitting | High | Resolved | **Fixed in track fix-bundle-size_20260411:** Lazy-loaded MarkdownRenderer. Result: 262 KB (62% reduction). |
| 2026-04-12 | graphing-components | Linear regex duplicated in canvas-utils.ts and InterceptIdentification.tsx | Medium | Resolved | **Fixed in track extract-linear-regex_20260412:** Extracted to shared `parseLinear()` in `lib/activities/graphing/linear-parser.ts`. |
 | 2026-04-12 | graphing-components | All graphing variants now fully implemented | Low | Resolved | **Fixed in track graphing-components_20260412:** All 4 variants (plot, compare, find_intercepts, graph_system) complete. |
 | 2026-04-12 | graphing-components | TypeScript errors in GraphingExplorer.test.tsx — comparisonAnswer type | Low | Open | comparisonAnswer prop typed as 'string' in tests but 'first' | 'second' in component; 5 files affected. |
 | 2026-04-12 | graphing-components | Explore mode with parameter sliders not implemented | Low | Open | Deferred to future track - core graphing functionality is complete. |
 | 2026-04-12 | algebraic-examples | Equivalence validator 8/50 tests failing for complex cases | Low | Open | Pattern-matching approach doesn't handle all polynomial/fraction/radical combinations; 42/50 passing (84%) meets 80% target. Consider symbolic math library for production. |
