# Current Directive

> Updated: 2026-04-16 (Code review — Module 9 Phases 5-7 audited; no critical/high findings)

## Status Summary

- **Tests**: 2295 passing, 6 known failures (equivalence validator — fraction/radical expressions).
- **Build**: Passing; RSC chunk warning remains pre-existing (734 KB).
- **Lint**: Passing.
- **TypeScript**: 25 pre-existing test-file errors remain (students.test.tsx, dashboard.test.ts). No new TS errors.
- **Module 1-9 Roadmap**: Complete through Phase 7 (lesson seeds 9-1 through 9-7).
- **Module 9 Seed**: All phases 1-8 complete (Lessons 9-1 through 9-7 with standards and lesson-standard links).
- **Code Review 3** (2026-04-16): Module 9 Phases 5-7 audited. No critical/high findings.
  - Fixed Phase 5 `checkpoint: pending` → `eb337e4` in plan.md.
  - Content accuracy verified against curriculum source for all 3 lessons.
  - Seed.ts orchestration wiring confirmed for lessons 9-5, 9-6, 9-7.
  - No malformed dollar formatting, no wrong componentKey issues.
  - Known tautological test pattern persists (tracked in tech-debt.md).

## Current In-Progress Track

### Practice Timing Telemetry

Track: `conductor/tracks/practice-timing-telemetry_20260415/`

Add canonical wall-clock, active-time, idle-time, and timing-confidence evidence to practice.v1 submissions for future SRS scoring.

- Phase 1: Canonical Contract and Schema Reconciliation — COMPLETE [checkpoint: 790e2f5]
- Phase 2: Reusable Timing Core and React Instrumentation — pending
- Phase 3: Activity Submission Integration — pending
- Phase 4: Persistence and Review Surfaces — pending
- Phase 5: Verification, Documentation, and Handoff — pending

## Planned Upcoming Tracks

1. **Practice Timing Telemetry** — `practice-timing-telemetry_20260415` (Module 9 SRS foundation complete)
2. **Practice Timing Baselines** — `practice-timing-baselines_20260415` (depends on timing telemetry and stable practice problem-family identifiers)

See `conductor/modules-3-9-roadmap.md` for the module inventory and repeated implementation pattern.
See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.

## High-Priority Tech Debt (from code review)

1. **Fix submitReviewHandler componentKind derivation** — derive from placement, not client args; prevents permanent stale mismatches.
2. **Add missing CCSS standards for all modules** — only 25 of ~50+ standards defined; modules 2, 3, 5 have gaps (M9 now has standards).
3. **Build lesson_standards seeding pipeline for all modules** — modules 6-8 have links; modules 1-5 and 9 need them.
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
