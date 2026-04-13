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
| 2026-04-10 | activity-infrastructure | activity_completions table requires lessonId/phaseNumber not available in submission | Medium | Open | Submission mutation can't create completions without lesson context; PhaseActivityTracker handles client-side tracking |
| 2026-04-12 | graphing-components | Explore mode with parameter sliders not implemented | Low | Open | Deferred to future track - core graphing functionality is complete. |
| 2026-04-12 | algebraic-examples | Equivalence validator 6/50 tests failing for complex cases | Low | Open | Pattern-matching approach doesn't handle all polynomial/fraction/radical combinations; 44/50 passing (88%) exceeds 80% target. Consider symbolic math library for production. |
| 2026-04-13 | component-approval | Placeholder hash for example/practice components in submitReview | Medium | Open | `convex/dev.ts:111` uses static string; needs computeComponentContentHash call when example/practice component data is available |
| 2026-04-13 | component-approval | No auth checks in convex/dev.ts internal functions | Medium | Open | Route guard implemented (Phase 3); Convex function auth deferred to future work |
| 2026-04-13 | component-approval | createdBy accepted as function arg not derived from ctx.auth | Medium | Open | Acceptable for internal mutations but must verify at public API boundaries |
| 2026-04-13 | content-hash | undefined values silently dropped by JSON.stringify | Low | Open | `{a: undefined}` hashes identically to `{}`; no regression test. Low risk for current usage |
| 2026-04-13 | algebraic-examples | Algebraic test coverage is structurally weak | Medium | Open | Tests named "all steps" check only 20-50%; guided/practice modes near no-ops; distractors/isKeyStep untested |
| 2026-04-13 | content-hash | Node.js crypto in V8 runtime | Low | Open | Works today (V8 polyfill) but could break with runtime changes; consider pure-JS alternative if needed |
