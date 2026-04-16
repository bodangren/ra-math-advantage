# Current Directive

> Updated: 2026-04-17 (Code review: Security & Auth Hardening, CI/CD Hardening, Cross-Course Extraction)

## Status Summary

- **Tests**: 3094 total, 6 known failures (equivalence validator — fraction/radical expressions). All others passing.
- **Build**: Passing.
- **Lint**: 22 pre-existing `any` errors in test files (not from reviewed tracks).
- **TypeScript**: No new TS errors.
- **Module 1-9 Roadmap**: All modules seeded (M1-M9 complete). CCSS standards and lesson_standards links for M1-M5 seeded.
- **SRS Waves**: Waves 0-5 complete (all tracks done through Wave 5 Track 12).
- **BM2 Alignment**: Wave A tracks complete (Security, CI/CD). Wave B (Practice Test, Gradebook) pending.

## Code Review: Security & Auth Hardening, CI/CD Hardening, Cross-Course Extraction (2026-04-17)

### Scope

Reviewed commits `3810aed..5f63d30` covering:
- **Security & Auth Hardening** (3 phases: Fail-Closed API Route Guards, Convex-Layer Authorization, Middleware and Dev Route Protection)
- **CI/CD Hardening** (2 phases: Cloudflare Worker Configuration, GitHub Actions Workflow)
- **Cross-Course Extraction** finalization

### Fixes Applied

1. **CRITICAL: Dev review queue GET params not validated** — Replaced unsafe `as` casts on `componentKind` and `status` query params with Zod schema validation. Arbitrary strings could bypass the type system.
2. **HIGH: Change-password route ignores mutation failure** — `changeOwnPassword` returns `{ ok: false, reason: ... }` on failure but route always returned `{ ok: true }` to client. Now checks return value and surfaces errors.
3. **HIGH: Phase completion accepts negative timeSpent** — Added `.nonnegative()` to Zod validator for `timeSpent` in phase completion route.
4. **MEDIUM: Cookie parser duplication undocumented** — Added comment explaining `getCookieValueFromHeader` is intentionally duplicated in middleware.ts due to Edge Runtime constraints.
5. **MEDIUM: Cloudflare worker silently swallows errors** — Added `console.error` to catch block before falling back to static assets.

### No Issues Found In

- Cloudflare worker handler caching pattern: correct
- GitHub Actions workflow: proper concurrency control, lint/test/build gates
- Convex-layer authorization helpers: fail-closed pattern, org scoping
- Middleware admin guard: correct JWT extraction and role check
- Security test suite: comprehensive coverage of auth scenarios

### Issues Logged (tracked in tech-debt.md)

- Dev review queue POST has no input length limits (High)
- `as any` cast on `internal.student.skipPhase` (Medium — may mask generated API issues)
- Worker deploys directly to production on every push (Medium — no staging step)
- `as never` cast masks Convex index type mismatch in teacher.ts (Medium)
- N+1 query pattern in `getTeacherLessonPreview` (Low — documented in tech-debt)
- Pre-existing equivalence validator 6/50 tests failing (Low)

## High-Priority Next Steps

1. **Practice Test Engine (BM2 Wave B)** — Port 6-phase test runner, question banks for M1-M9, score persistence
2. **SRS queue: batch resolution** — Replace N+1 per-card reads with bulk reads (Critical perf, tracked in tech-debt.md)
3. **PracticeSessionProvider: send sessionId with completion** — Prevents wrong-session completion (High, tracked in tech-debt.md)
4. **Wire combined dashboard query** — Replace empty array stubs in getTeacherSrsDashboardData with actual data from individual queries
5. **Fix `stability` → `avgRetention` semantic mismatch** — Convert FSRS stability to actual retention percentage in dashboard and proficiency views
6. **timing.ts: guard addEvent after pagehide** — Prevent wall-clock corruption from post-pagehide events
7. **Teacher Gradebook & Competency Heatmaps (BM2 Wave B)** — Port course overview grid, unit gradebook, competency heatmaps
8. **Address pre-existing lint `any` errors in test files** — 22 `@typescript-eslint/no-explicit-any` violations in test files

See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.
See `conductor/tech-debt.md` for full issue registry.
