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
| 2026-04-09 | lesson-rendering | TypeScript error in PhaseCompleteButton.test.tsx — Promise type mismatch | Medium | Resolved | **Fixed in track fix-graphing-test-types_20260412:** Added proper type to resolve variable and imported CompletePhaseResponse. |
| 2026-04-10 | activity-infrastructure | activity_completions table requires lessonId/phaseNumber not available in submission | Medium | Open | Submission mutation can't create completions without lesson context; PhaseActivityTracker handles client-side tracking |
| 2026-04-11 | graphing-components | Quadratic regex duplicated across 3 files (canvas-utils, HintPanel, InterceptIdentification) | Medium | Resolved | **Fixed in track extract-quadratic-regex_20260411:** Extracted to shared `parseQuadratic()` in `lib/activities/graphing/quadratic-parser.ts`. |
| 2026-04-12 | submission-schema | TypeScript errors in submission.schema.ts — z.record() incorrect usage | High | Resolved | **Fixed in track fix-submission-schema-types_20260412:** Replaced `z.record(z.unknown())` with `z.record(z.string(), z.unknown())` on lines 25, 27, 33. |
| 2026-04-12 | graphing-schema | TypeScript error in graphing-explorer.schema.ts — parts array type inference | High | Resolved | **Fixed in track fix-graphing-schema-type_20260412:** Annotated parts array as `PracticeSubmissionPart[]` to fix inference issue. |
| 2026-04-11 | bundle | Facade RSC entry chunk 687 KB (limit 500 KB) — no code-splitting | High | Resolved | **Fixed in track fix-bundle-size_20260411:** Lazy-loaded MarkdownRenderer. Result: 262 KB (62% reduction). |
| 2026-04-12 | graphing-components | Linear regex duplicated in canvas-utils.ts and InterceptIdentification.tsx | Medium | Resolved | **Fixed in track extract-linear-regex_20260412:** Extracted to shared `parseLinear()` in `lib/activities/graphing/linear-parser.ts`. |
 | 2026-04-12 | graphing-components | All graphing variants now fully implemented | Low | Resolved | **Fixed in track graphing-components_20260412:** All 4 variants (plot, compare, find_intercepts, graph_system) complete. |
  | 2026-04-12 | graphing-components | TypeScript errors in GraphingExplorer.test.tsx — comparisonAnswer type | Low | Resolved | **Fixed in track fix-graphing-test-types_20260412:** Added 'as const' to comparisonAnswer prop in 11 test fixtures. |
 | 2026-04-12 | graphing-components | Explore mode with parameter sliders not implemented | Low | Open | Deferred to future track - core graphing functionality is complete. |
  | 2026-04-12 | algebraic-examples | Equivalence validator 6/50 tests failing for complex cases | Low | Open | Pattern-matching approach doesn't handle all polynomial/fraction/radical combinations; 44/50 passing (88%) exceeds 80% target. Consider symbolic math library for production. |
