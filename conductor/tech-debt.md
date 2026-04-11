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
| 2026-04-11 | graphing-components | Quadratic regex duplicated across 3 files (canvas-utils, HintPanel, InterceptIdentification) | Medium | Open | Should extract to shared util; `evaluateFunction` in canvas-utils and `parseQuadratic` in HintPanel use identical regex |
| 2026-04-11 | bundle | Facade RSC entry chunk 687 KB (limit 500 KB) — no code-splitting | High | Open | **Root cause:** `MarkdownRenderer` eagerly imports `react-markdown`+`remark-gfm`+`katex` (~200 KB), `ConvexClientProvider` in root layout ships convex client to every page including auth. **Plan:** (1) Lazy-load `MarkdownRenderer` via `next/dynamic` in `LessonRenderer`+`LessonPageLayout` (~150-200 KB savings). (2) Route-level splitting: lazy-load `LessonRenderer` in lesson page, gradebook components in teacher pages (~100-150 KB). (3) Lazy-load activity registry components instead of eager imports (~50-100 KB). (4) Split root layout — move `ConvexClientProvider` behind dynamic import for auth pages that don't need it (~80-120 KB). Phase 1 alone should get under 500 KB. |
