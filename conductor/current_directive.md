# Current Directive

> Updated: 2026-04-19 (Code review #8 — audit of practice-test-engine Phase 2, study-hub-core, teacher-reporting-core Phase 1)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-4 complete** — readiness gate, tooling shell, move apps, boundary guards, all 7 packages extracted, app import migration done, BM2 fully consuming core + runtime packages
2. **BM2 SRS contract migration complete** — Convex schema migrated to flat SrsCardState; Phase 4 skipped (adapters no longer needed)
3. **Wave 5 in progress** — practice-test-engine COMPLETE, study-hub-core COMPLETE, teacher-reporting-core Phase 1 COMPLETE
4. **Next: Wire teacher-reporting-core to IM3** — replace local gradebook/reporting logic with package imports
5. **Next: Extract AI Tutoring Package and Adopt in IM3**
6. **Next: Extract Workbook Pipeline Package and Adopt in IM3**
7. **Then: Wave 6** — monorepo CI/CD hardening and docs cleanup
8. **BM2 type health sweep** — ~296 pre-existing errors; defer unless blocking migration gates

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
- [x] Extract practice-test-engine — **COMPLETED (2026-04-19)**
- [x] Extract study-hub-core — **COMPLETED (2026-04-19)**
- [x] Extract teacher-reporting-core Phase 1 — **COMPLETED (2026-04-19)**
- [ ] Wire teacher-reporting-core to IM3/BM2 (Phase 2)
- [ ] Wave 5: AI tutoring and workbook (import/adopt from BM2)
- [ ] Wave 6: CI/CD hardening, docs cleanup
- [ ] BM2 type health sweep (~296 TS errors) — defer unless blocking

## Code Review Summary (2026-04-19 — Review #8)

Audit of 6 phases since review #7: practice-test-engine Phase 2, study-hub-core Phases 1-2, teacher-reporting-core Phase 1, lessons-learned update.

### Verification Results

| Check | Result |
|-------|--------|
| Build (IM3) | PASS |
| Tests (IM3) | 3249/3255 pass (6 aspirational .todo) |
| Tests (BM2) | 2272/2299 pass (27 governance failures — monorepo context) |
| Tests (practice-test-engine) | 21/21 pass |
| Tests (study-hub-core) | 6/6 pass |
| Tests (teacher-reporting-core) | 65/65 pass |
| Typecheck (IM3) | CLEAN |
| Typecheck (all new packages) | CLEAN |
| Lint (IM3) | CLEAN |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| gradebook-export CSV header/data misalignment when includeMasteryLevel=false | High | Conditionally include mastery header columns to match data columns |
| Missing eslint.config.mjs in teacher-reporting-core | Medium | Added eslint config matching study-hub-core pattern |
| Tracked dist/node_modules in git | Medium | Removed from tracking via git rm -r --cached |

### Issues Found But Not Fixed (Tracked in tech-debt.md)

| Issue | Severity | Notes |
|-------|----------|-------|
| gradebook.ts hard-coded isUnitTest=orderIndex===11 | Medium | Fragile; should use explicit flag from data |
| course-overview passes 'not_started' sentinel to computeCellColor | Medium | Works but semantically misleading |
| teacher-reporting-core .js import extension inconsistency | Low | Works but inconsistent with other packages |
| study-hub-core BaseReviewSession untested in-package | Low | Tested via IM3 imports |
| IM3 GlossaryTerm not formally adopted as StudyTerm subtype | Medium | Structural compat works; explicit adoption would be safer |
