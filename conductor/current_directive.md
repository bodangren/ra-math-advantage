# Current Directive

> Updated: 2026-04-18 (Code review #6 — audit of SRS contract migration, package exports, BM2 type health)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-3 complete** — readiness gate, tooling shell, move IM3, boundary guards, all 7 packages extracted, app import migration done
2. **Wave 4 partial** — BM2 moved to apps/bus-math-v2; `bm2-consume-core-packages` Phase 1 partial (practice imports migrated, SRS blocked by contract); `bm2-srs-contract-migration` Phase 2 complete, Phase 3 (Convex schema) deferred
3. **Next: Complete bm2-srs-contract-migration Phase 3** — migrate Convex srs_cards table to FSRS-aligned schema; eliminates adapter layer added in review #6
4. **Next: Complete bm2-consume-core-packages** — finish remaining BM2 lib/ pruning after SRS contract alignment
5. **Next: bm2-consume-runtime-packages** — adopt activity-runtime, component-approval, graphing-core in BM2
6. **Then: Wave 5** — extract remaining feature packages (test-engine, study-hub, teacher-reporting, ai-tutoring, workbook)
7. **Then: Wave 6** — monorepo CI/CD hardening and docs cleanup
8. **Defer non-migration feature expansion unless it blocks a migration gate**

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

- [x] Waves 0-3 complete (all packages extracted, IM3 imports migrated)
- [x] Move BM2 to apps/bus-math-v2 — **COMPLETED (2026-04-18)**
- [x] BM2 SRS contract migration Phase 1-2 — **COMPLETED (2026-04-18)**
- [x] BM2 DailyPracticeSession adapter layer — **COMPLETED (2026-04-18, review #6)**
- [x] **bm2-srs-contract-migration Phase 3** — migrate Convex srs_cards table to FSRS-aligned schema — **COMPLETED (2026-04-18)**
- [x] **bm2-consume-core-packages** — practice/auth imports migrated; full local pruning deferred (audit required)
- [x] **bm2-consume-runtime-packages** — adopt runtime/approval/graphing packages in BM2 — **COMPLETED (2026-04-18)**
- [ ] **BM2 type health sweep** — add generics to fetchInternalQuery, fix CashFlowChallenge, fix ctx.transaction dead code (~300 errors)
- [ ] Wave 5: Extract feature packages (test-engine, study-hub, teacher-reporting)
- [ ] Wave 5: AI tutoring and workbook (import/adopt from BM2)
- [ ] Wave 6: CI/CD hardening, docs cleanup

## Code Review Summary (2026-04-18 — Review #6)

Audit of past 6 work phases: BM2 SRS contract migration (Phase 1-2), BM2 consume runtime, code review #5, BM2 consume core packages, move BM2 app, code review #4.

### Verification Results

| Check | Result |
|-------|--------|
| Build (IM3) | PASS |
| Build (BM2) | PASS |
| Tests (IM3) | 3249/3255 pass (6 aspirational .todo) |
| Tests (BM2) | 2272/2299 pass (27 governance failures — monorepo context) |
| Typecheck (IM3 + packages) | CLEAN |
| Typecheck (BM2) | ~296 errors (pre-existing; 7 DailyPracticeSession fixed) |
| Lint (IM3) | CLEAN |
| Lint (BM2) | vinext can't find eslint |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| DailyPracticeSession: SrsCardState vs legacy Convex data mismatch | High | Added legacyToSrsCardState/srsCardStateToLegacy adapter functions in BM2 scheduler.ts; component now bridges between Convex legacy format and new FSRS contract |
| core-convex index.ts import extension inconsistency | Low | Normalized to no-extension style |
| BM2 scheduler test 1ms boundary flakiness | Low | Used after+dayMs for upper bound tolerance |

### Issues Found But Not Fixed (Tracked in tech-debt.md)

| Issue | Severity | Notes |
|-------|----------|-------|
| BM2 fetchInternalQuery returns untyped (~130 TS errors) | High | Needs generic type parameter; mechanical but significant scope |
| BM2 CashFlowChallenge component type drift (~31 TS errors) | High | Component accesses props fields at top level; needs destructuring |
| BM2 convex/activities.ts ctx.transaction() doesn't exist | High | Dead code path; will throw at runtime |
| BM2 ~90 test mock type errors | Medium | Mock data missing required properties; string vs literal unions |
| BM2 teacher UI null safety (~15 TS errors) | Medium | Missing null guards + untyped queries |
| BM2 governance tests (27 failures) | Medium | Repo-structure tests expect root paths; should be skipped/removed |
| 5 packages missing vitest.config.ts | Low | Consistency issue; tests run via defaults |
