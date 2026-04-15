# Current Directive

> Updated: 2026-04-16 (Code review: Module 7 Phases 6-7, Module 8 Phase 1, seed standards fixes)

## Status Summary

- **Tests**: 2140 passing, 6 known failures (equivalence validator - radicals/fractions, pre-existing).
- **Build**: Passing; RSC chunk warning remains pre-existing (735 KB).
- **Lint**: Passing.
- **TypeScript**: 25 pre-existing test-file errors remain (students.test.tsx, dashboard.test.ts). No new TS errors.
- **Module 1-7 Roadmap**: Complete.
- **Module 8 Seed**: Phase 1 complete (Lesson 8-1). Phases 2-6 pending.
- **Code Review**: Completed 2026-04-16. Fixed 2 issues (HSA-APR.B.2 incorrect description, missing HSF-LE.A.1 and HSA-CED.A.2 standards).

## Current In-Progress Track

### Module 8 Curriculum Seed

Track: `conductor/tracks/module-8-seed_20260415/`

Seed Module 8 inferential statistics lessons (8-1 through 8-5) into Convex database. Phase 1 complete.

## Planned Upcoming Tracks

1. **Module 8 Curriculum Seed** — Phase 2: Lesson 8-2
2. **Module 8 Curriculum Seed** — Phases 3-6: Lessons 8-3 through 8-5 and integration
3. **Module 9 Curriculum Seed** — `module-9-seed_20260415` (7 lessons)
4. **Practice Timing Telemetry** — `practice-timing-telemetry_20260415` (post-Module 9 SRS foundation)
5. **Practice Timing Baselines** — `practice-timing-baselines_20260415` (depends on timing telemetry and stable practice problem-family identifiers)

See `conductor/modules-3-9-roadmap.md` for the module inventory and repeated implementation pattern.
See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.

## High-Priority Tech Debt (from code review)

1. **Fix submitReviewHandler componentKind derivation** — derive from placement, not client args; prevents permanent stale mismatches.
2. **Add missing CCSS standards for all modules** — only 21 of ~50+ standards defined; modules 2, 3, 5, 8-9 have gaps.
3. **Build lesson_standards seeding pipeline for all modules** — modules 6-7 have links; modules 1-5 and 8-9 need them.
4. **Add tests for error-analysis module** — 8 untested exported functions with aggregation logic.
5. **Fix parseAIResponse fragile line-based parsing** — use structured JSON output.
6. **StepByStepSolver schema/component mismatch** — Zod schema step shape diverges from AlgebraicStep interface.
7. **Fix ActivityReviewHarness dead handleError** — render errors silently lost; canApprove gate never blocked.
8. **Refactor seed-lesson-standards.ts duplication** — `seedModule6LessonStandards` and `seedModule7LessonStandards` are 95% identical; extract shared seeder function.

## Medium-Term Tech Debt

1. Fix Convex N+1 queries in teacher/student progress paths.
2. Validate componentKind server-side in submitReviewHandler.
3. Resolve approval race condition.
4. Add student/teacher error boundaries.
5. Validate `timeSpent >= 0` in phase completion.
6. Compute real `nextPhaseUnlocked`.
7. Reduce RSC bundle size.
8. Fix pre-existing TypeScript test errors.
9. Fix equivalence validator for radical/fraction expressions.
10. Fix seed test tautology — tests use inline data, not actual seed files.
11. ActivityRenderer prop forwarding gap — section content props not forwarded to activity components.
