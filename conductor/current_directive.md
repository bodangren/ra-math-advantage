# Current Directive

> Updated: 2026-04-18 (Code review #7 — audit of SRS Phase 3, consume-core, practice-test-engine extraction)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-4 complete** — readiness gate, tooling shell, move apps, boundary guards, all 7 packages extracted, app import migration done, BM2 fully consuming core + runtime packages
2. **BM2 SRS contract migration complete** — Convex schema migrated to flat SrsCardState; Phase 4 skipped (adapters no longer needed)
3. **Wave 5 in progress** — practice-test-engine Phase 1 complete; remaining: study-hub, teacher-reporting, ai-tutoring, workbook
4. **Next: Extract Study Hub Core Package** — flashcard/review/game core primitives
5. **Next: Extract Teacher Reporting Core Package** — pure gradebook/reporting logic
6. **Next: Extract AI Tutoring Package and Adopt in IM3**
7. **Next: Extract Workbook Pipeline Package and Adopt in IM3**
8. **Then: Wave 6** — monorepo CI/CD hardening and docs cleanup
9. **BM2 type health sweep** — ~296 pre-existing errors; defer unless blocking migration gates

## Non-Negotiable Rules

1. AI tutoring and workbook work in IM3 must be completed via BM2-derived package adoption
2. No dependency manager/install changes without explicit approval
3. Shared packages must not import from `apps/*` or app `convex/_generated/*`
4. BM2 business-domain code/assets remain app-local
5. Always run `npx tsc --noEmit` alongside `npm run build` — vinext build does not enforce TypeScript types
6. After extracting a package, **delete the app-local copy immediately** and rewire imports — duplicated code diverges silently

## Required Source Documents

- `conductor/monorepo-plan.md` — Roadmap and strategy
- `conductor/tracks.md` — Track registry and dependency order
- `conductor/monorepo-track-playbook.md` — Execution workflow
- `conductor/monorepo-jr-execution-spec.md` — Junior step-by-step packets
- `conductor/tech-debt.md` — Tech debt backlog
- `conductor/workflow.md` — Core Conductor protocol

## Immediate Next Actions Checklist

- [x] Waves 0-4 complete (all packages extracted, IM3+BM2 imports migrated)
- [x] BM2 SRS contract migration Phases 1-3 — **COMPLETED (2026-04-18)**
- [x] BM2 consume-core-packages — **COMPLETED (2026-04-18)**
- [x] BM2 consume-runtime-packages — **COMPLETED (2026-04-18)**
- [x] Extract practice-test-engine Phase 1 — **COMPLETED (2026-04-18)**
- [ ] Wave 5: Extract study-hub-core, teacher-reporting-core
- [ ] Wave 5: AI tutoring and workbook (import/adopt from BM2)
- [ ] Wave 6: CI/CD hardening, docs cleanup
- [ ] BM2 type health sweep (~296 TS errors) — defer unless blocking

## Code Review Summary (2026-04-18 — Review #7)

Audit of 6 phases since review #6: SRS Phase 3 (Convex schema), bm2-srs docs, consume-core redirect, Wave 4 docs, practice-test-engine extraction Phase 1, docs.

### Verification Results

| Check | Result |
|-------|--------|
| Build (IM3) | PASS |
| Build (BM2) | PASS |
| Tests (IM3) | 3249/3255 pass (6 aspirational .todo) |
| Tests (BM2) | 2272/2299 pass (27 governance failures — monorepo context) |
| Tests (practice-test-engine) | 20/20 pass |
| Typecheck (IM3) | CLEAN |
| Typecheck (BM2) | ~296 errors (pre-existing, not from this phase) |
| Lint (IM3) | CLEAN |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| Dead code: legacyToSrsCardState/srsCardStateToLegacy no longer imported | Low | Removed from lib/srs/scheduler.ts |

### Issues Found But Not Fixed (Tracked in tech-debt.md)

| Issue | Severity | Notes |
|-------|----------|-------|
| BM2 fetchInternalQuery returns untyped (~130 TS errors) | High | Needs generic type parameter |
| BM2 CashFlowChallenge component type drift (~31 TS errors) | High | Needs destructuring |
| BM2 convex/activities.ts ctx.transaction() dead code | High | Will throw at runtime |
| BM2 governance tests (27 failures) | Medium | Repo-structure tests; skip/remove in monorepo |
| BM2 ~90 test mock type errors | Medium | Missing required properties |
| TOCTOU race condition docs removed from srs.ts handlers | Low | Architectural notes stripped during Phase 3; acceptable tradeoff
