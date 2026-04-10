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
| 2026-04-10 | graphing-components | InterceptIdentification has 15/23 failing tests | High | Open | Canvas interaction and snapping logic issues; 8 tests passing (basic rendering, no-intercepts flow) |
