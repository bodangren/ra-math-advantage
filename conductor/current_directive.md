# Current Directive

> Updated: 2026-04-16 (Code review complete; 4 issues fixed)

## Status Summary

- **Tests**: 2394 passing, 6 known failures (equivalence validator — fraction/radical expressions).
- **Build**: Passing; RSC chunk 750 KB (pre-existing).
- **Lint**: Passing.
- **TypeScript**: 25 pre-existing test-file errors remain (students.test.tsx, dashboard.test.ts). No new TS errors.
- **Module 1-9 Roadmap**: All modules seeded (M1-M9 complete).
- **Practice Timing Telemetry**: All 5 phases complete. Timing bug fixed in this review.
- **Code Review**: 2026-04-16 review found and fixed 4 issues (2 critical, 2 high). 14 medium/low issues documented.

## Current In-Progress Track

- **Track**: Practice Timing Baselines
- **Phase**: 4 — Objective Proficiency and Fluency Signals
- **Goal**: Build timing baselines and time-aware SRS evidence features so practice duration can influence system-derived ratings and objective proficiency only after reliable average-time data exists.

## High-Priority Next Steps

1. **Fix submitReviewHandler componentKind derivation** — derive from placement, not client args; prevents permanent stale mismatches (HIGH, see tech-debt.md)
2. **Practice Timing Baselines** — `practice-timing-baselines` track (depends on stable practice problem-family identifiers)
3. **Add missing CCSS standards for M2/M3** — ~30 of ~50+ standards still undefined
4. **Build lesson_standards seeding pipeline for M1-M5** — only M6-M9 have links
5. **Add tests for error-analysis module** — 8 untested exported functions with aggregation logic
6. **Fix parseAIResponse fragile line-based parsing** — use structured JSON output
7. **Refactor seed-lesson-standards.ts duplication** — extract shared seeder function
8. **Add integration tests for practice-timing** — current hook tests fully mock the accumulator
9. **Fix canApprove gate completeness** — Activity and Practice harnesses have ungated checklist items
10. **Fix seed test tautology** — all modules: tests use inline data, not actual seed files

See `conductor/modules-3-9-roadmap.md` for the module inventory.
See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.
See `conductor/tech-debt.md` for full issue registry.
See `conductor/review-output.log` for latest code review findings.
