# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-04-05 | setup | No app/ page files exist — directory structure only | Critical | Resolved | All pages created in scaffold-pages track |
| 2026-04-05 | setup | No components in components/student/, components/teacher/, components/dashboard/ | High | Open | Referenced in architecture but directories empty or missing |
| 2026-04-05 | setup | No seed.ts in convex/ for demo data | Medium | Open | Need seeding script for development |
| 2026-04-05 | setup | Legacy Supabase types in AuthProvider.tsx (snake_case profile fields) | Low | Open | Should migrate to camelCase matching Convex schema |
| 2026-04-06 | scaffold-pages | convex/_generated/ is empty — requires running npx convex dev once to generate types | Critical | Open | Dev server fails without generated API types; run npx convex dev to initialize |
| 2026-04-06 | scaffold-pages | Lesson page shows placeholder content — no LessonRenderer component yet | High | Open | app/student/lesson/[lessonSlug]/page.tsx renders stub; full phase content requires LessonRenderer |
| 2026-04-07 | review | No `npm run typecheck` script in package.json — type errors only surfaced via manual `npx tsc --noEmit` | Medium | Open | Should add typecheck script to match AGENTS.md TDD workflow |
