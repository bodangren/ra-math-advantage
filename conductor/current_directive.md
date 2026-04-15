# Current Directive

> Updated: 2026-04-15 (Code review: Modules 4-7 seeds + approval hardening + StepByStepSolver)

## Status Summary

- **Tests**: 2070 passing, 6 known failures (equivalence validator - radicals/fractions), 1 unhandled teardown error.
- **Build**: Passing; RSC chunk warning remains pre-existing (734 KB).
- **Lint**: Passing.
- **TypeScript**: 25 pre-existing test-file errors remain (students.test.tsx, dashboard.test.ts). No new TS errors.
- **Module 1-6 Roadmap**: Complete.
- **Module 7 Seed**: In progress — Lessons 7-1 and 7-2 seeded, wired into seed.ts orchestration. Lessons 7-3 through 7-6 pending.
- **Code Review**: Completed 2026-04-15. Fixed 3 critical issues (harness hook gating, hardcoded submissions, dead seed code).

## Current In-Progress Track

### Module 7 Curriculum Seed

Track: `conductor/tracks/module-7-seed_20260415/`

Seed Module 7 rational functions and equations lessons (7-1 through 7-6) into Convex database. Phases 1-5 complete; Phase 6 pending.

## Planned Upcoming Tracks

1. **Module 7 Curriculum Seed** — Phases 3-6: Lessons 7-3 through 7-6
2. **Module 7 Curriculum Seed** — Phase 7: Module integration, CCSS standards, lesson-standard links
3. **Module 8 Curriculum Seed** — `module-8-seed_20260415` (5 lessons)
4. **Module 9 Curriculum Seed** — `module-9-seed_20260415` (7 lessons)
5. **Practice Timing Telemetry** — `practice-timing-telemetry_20260415` (post-Module 9 SRS foundation)
6. **Practice Timing Baselines** — `practice-timing-baselines_20260415` (depends on timing telemetry and stable practice problem-family identifiers)

See `conductor/modules-3-9-roadmap.md` for the module inventory and repeated implementation pattern.
See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.

## High-Priority Tech Debt (from code review)

1. **Fix submitReviewHandler componentKind derivation** — derive from placement, not client args; prevents permanent stale mismatches.
2. **Add missing CCSS standards for all modules** — only 17 of ~50+ standards defined; modules 2, 3, 5, 7-9 have gaps.
3. **Build lesson_standards seeding pipeline for all modules** — only module 6 has links; 44+ lessons have no standards.
4. **Add tests for error-analysis module** — 8 untested exported functions with aggregation logic.
5. **Fix parseAIResponse fragile line-based parsing** — use structured JSON output.
6. **StepByStepSolver schema/component mismatch** — Zod schema step shape diverges from AlgebraicStep interface.
7. **Fix ActivityReviewHarness dead handleError** — render errors silently lost; canApprove gate never blocked.

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
11. Fix seed test tautology — tests use inline data, not actual seed files.
12. ActivityRenderer prop forwarding gap — section content props not forwarded to activity components.
