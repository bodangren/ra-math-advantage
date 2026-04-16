# Current Directive

> Updated: 2026-04-16 (Code Review — Practice Item Blueprint + SRS Core Library)

## Status Summary

- **Tests**: 2636 passing, 6 known failures (equivalence validator — fraction/radical expressions).
- **Build**: Passing; RSC chunk 746 KB (pre-existing).
- **Lint**: Passing.
- **TypeScript**: Pre-existing test-file errors remain. No new TS errors.
- **Module 1-9 Roadmap**: All modules seeded (M1-M9 complete).
- **Practice Item Blueprint**: Phases 1-6 complete (types, Convex schema, objective policies, seed data M1-M9, validation, handoff).
- **SRS Core Library**: Phase 1 complete (FSRS scheduler wrapper with ts-fsrs v4 API). Phase 2 complete (review processor).
- **ts-fsrs**: Installed and scheduler updated to v4 API (was a build blocker).
- **seedObjectivePolicies**: Now wired into seed.ts orchestration.
- **Code Review**: 2026-04-16 review found 0 critical, 3 high (all fixed), 1 medium (fixed), 2 low issues.

## Fixes Applied This Review

1. **Installed ts-fsrs** — was missing from package.json despite being imported by scheduler.ts
2. **Updated scheduler.ts to ts-fsrs v4 API** — parameter names (`request_retention`, `maximum_interval`), Card fields (`stability`, `difficulty`, `lapses`, `scheduled_days`), 3-arg `next()` signature
3. **Wired seedObjectivePolicies into seed.ts** — seeder existed but was orphaned
4. **Deduplicated ObjectivePriority type** — seed file now imports from lib
5. **Fixed scheduler test mock** — updated to ts-fsrs v4 Card shape and API

## Current In-Progress Track

- **Track**: Reusable SRS Core Library — Phase 3 complete, Phase 4 (adapter interfaces) pending.
- **Next**: Phase 4: Adapter Interfaces

## High-Priority Next Steps

1. **SRS Core Library Phase 3: Queue Primitives** — build `buildDailyQueue` with priority ordering
2. **SRS Core Library Phase 4: Adapter Interfaces** — define `CardStore`/`ReviewLogStore` with in-memory implementations
3. **Build lesson_standards seeding pipeline for M1-M5** — only M6-M9 have links
4. **Fix parseAIResponse fragile line-based parsing** — use structured JSON output
5. **Refactor seed-lesson-standards.ts duplication** — extract shared seeder function
6. **Add integration tests for practice-timing** — current hook tests fully mock the accumulator
7. **Fix canApprove gate completeness** — Activity and Practice harnesses have ungated checklist items
8. **Fix seed test tautology** — all modules: tests use inline data, not actual seed files
9. **Wire proficiency views into actual progress surfaces** — ObjectiveProficiencyBadge and TeacherObjectiveDiagnosticCard are built but not yet rendered in any page
10. **Address collectEligibleTimings N+1** — batch queries for production baseline recomputation

See `conductor/modules-3-9-roadmap.md` for the module inventory.
See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.
See `conductor/tech-debt.md` for full issue registry.
