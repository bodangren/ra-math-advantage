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
  | 2026-04-13 | algebraic-examples | StepByStepper guided mode 4 tests failing (in-progress commit) | Medium | Resolved | **Fixed in commit 4cd3ee4:** Added showExplanation state, fixed completion logic, updated tests. All 13 guided mode tests passing. |
  | 2026-04-13 | algebraic-examples | Linting errors in distractors.ts — unused variables from destructuring | Low | Resolved | **Fixed in commit 6d98432:** Replaced `_` with `,` to ignore first element in match arrays and removed unused variables. |
| 2026-04-13 | component-approval | `convex/dev.ts:42` `isStale` assigned `storedHash && ...` — evaluates to `""` when no stored hash; field typed boolean | High | Open | Wrap with `Boolean(...)` or `!!` before assignment to `ReviewQueueItem.isStale`. |
| 2026-04-13 | component-approval | `convex/dev.ts:44` componentKind filter skips activities when kind="practice" incorrectly; practice items live in component_approvals | Medium | Open | Simplify to `if (args.componentKind && args.componentKind !== "activity") continue;`. |
| 2026-04-13 | component-approval | `convex/dev.ts:111` hardcoded placeholder `"todo-hash-for-example-practice"` for non-activity content hashes | High | Open | Implement example/practice hashing before approval UI ships; blocks staleness detection for those kinds. |
| 2026-04-13 | component-approval | `lib/activities/content-hash.ts` imports Node `crypto` — breaks if module ever bundled for edge/browser | Medium | Open | Gate import or use `crypto.subtle` for isomorphic use. |
| 2026-04-13 | component-approval | `submitReview` takes `createdBy` as arg instead of deriving from auth — trust-boundary risk if ever exposed client-side | High | Open | Must remain CLI-only; add comment or assert on internal-only path. |
| 2026-04-13 | bundle | MarkdownRenderer lazy-load may affect TTI on lesson pages if above-the-fold | Low | Open | Verify with lighthouse on a representative lesson page before celebrating bundle win. |
