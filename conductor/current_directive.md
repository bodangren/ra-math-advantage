# Current Directive

> Updated: 2026-04-15 (Code review: Harden Manual Approval + Modules 4-6 seeds)

## Status Summary

- **Tests**: 2012 passing, 8 known failures (equivalence validator - radicals/fractions).
- **Build**: Passing; RSC chunk warning remains pre-existing (734 KB).
- **Lint**: Passing.
- **TypeScript**: 25 pre-existing test-file errors remain (students.test.tsx, dashboard.test.ts). No new TS errors.
- **Module 1-5 Roadmap**: Complete.
- **Module 6 Seed**: Phases 1-5 (Lessons 6-1 through 6-5) complete. Phase 6 pending.
- **Code Review**: Completed 2026-04-15. Fixed 3 critical + 2 high issues (dual state bug, approval gating, silent errors).

## Current In-Progress Track

### Module 6 Curriculum Seed

Track: `conductor/tracks/module-6-seed_20260415/`

Seed Module 6 logarithmic functions lessons (6-1 through 6-5) into Convex database.

## Planned Upcoming Tracks

1. **Module 6 Curriculum Seed** — `module-6-seed_20260415` (2 lessons remaining: 6-4 through 6-5)
2. **Module 7 Curriculum Seed** — `module-7-seed_20260415` (6 lessons)
3. **Module 8 Curriculum Seed** — `module-8-seed_20260415` (5 lessons)
4. **Module 9 Curriculum Seed** — `module-9-seed_20260415` (7 lessons)

See `conductor/modules-3-9-roadmap.md` for the module inventory and repeated implementation pattern.

## High-Priority Tech Debt (from code review)

1. **Fix submitReviewHandler componentKind derivation** — derive from placement, not client args; prevents permanent stale mismatches.
2. **Add missing CCSS standards for Modules 5/6** to seed-standards.ts.
3. **Build lesson_standards seeding pipeline** — standards exist but are never linked to lessons.
4. **Add tests for error-analysis module** — 8 untested exported functions with aggregation logic.
5. **Fix parseAIResponse fragile line-based parsing** — use structured JSON output.

## Medium-Term Tech Debt

1. Fix Convex N+1 queries in teacher/student progress paths.
2. Fix incorrect CCSS standard description (HSA-APR.B.2).
3. Validate componentKind server-side in submitReviewHandler.
4. Resolve approval race condition.
5. Add student/teacher error boundaries.
6. Validate `timeSpent >= 0` in phase completion.
7. Compute real `nextPhaseUnlocked`.
8. Reduce RSC bundle size.
9. Fix pre-existing TypeScript test errors.
10. Fix equivalence validator for radical/fraction expressions.
