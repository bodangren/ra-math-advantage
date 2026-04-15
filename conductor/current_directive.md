# Current Directive

> Updated: 2026-04-15 (Module 5 seed complete, Module 6 next)

## Status Summary

- **Tests**: 1966 passing, 6 known failures (equivalence validator - radicals).
- **Build**: Passing; RSC chunk warning remains pre-existing (734 KB).
- **Lint**: Passing.
- **TypeScript**: 25 pre-existing test-file errors remain (students.test.tsx, dashboard.test.ts). No new TS errors.
- **Module 1-4 Roadmap**: Complete.
- **Module 5 Seed**: Complete; all 5 lessons wired into seed.ts with exponential functions and geometric series content.
- **Module 6 Seed**: Next track.

## Current In-Progress Track

### Module 6 Curriculum Seed

Track: `conductor/tracks/module-6-seed_20260415/`

Seed Module 6 logarithmic functions lessons (6-1 through 6-5) into Convex database.

## Planned Upcoming Tracks

1. **Module 6 Curriculum Seed** — `module-6-seed_20260415` (5 lessons)
2. **Module 7 Curriculum Seed** — `module-7-seed_20260415` (6 lessons)
3. **Module 8 Curriculum Seed** — `module-8-seed_20260415` (5 lessons)
4. **Module 9 Curriculum Seed** — `module-9-seed_20260415` (7 lessons)

See `conductor/modules-3-9-roadmap.md` for the module inventory and repeated implementation pattern.

## Medium-Term Tech Debt

1. Fix Convex N+1 queries in teacher/student progress paths.
2. Fix incorrect CCSS standard description (HSA-APR.B.2).
3. Build lesson_standards seeding pipeline.
4. Add missing CCSS standards for M2/M3 (HSA-APR.C.4, HSA-APR.C.5, HSA-REI.D.11).
5. Validate componentKind server-side in submitReviewHandler.
6. Resolve approval race condition.
7. Add student/teacher error boundaries.
8. Validate `timeSpent >= 0` in phase completion.
9. Compute real `nextPhaseUnlocked`.
10. Reduce RSC bundle size.
11. Fix pre-existing TypeScript test errors.
12. Fix equivalence validator for radical expressions.
