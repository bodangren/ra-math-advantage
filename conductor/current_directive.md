# Current Directive

> Updated: 2026-04-18 (Code review #5 — full 6-phase audit of monorepo extraction, post-#4 fixes)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-3 complete** — readiness gate, tooling shell, move IM3, boundary guards, all 7 packages extracted, app import migration done
2. **Wave 4 partial** — BM2 moved to apps/bus-math-v2; `bm2-consume-core-packages` Phase 1 partial (practice/auth imports started, SRS blocked by contract incompatibility)
3. **Next: Complete bm2-consume-core-packages** — finish practice/auth migration in BM2, plan SRS contract migration track
4. **Next: bm2-consume-runtime-packages** — adopt activity-runtime, component-approval, graphing-core in BM2
5. **Then: Wave 5** — extract remaining feature packages (test-engine, study-hub, teacher-reporting, ai-tutoring, workbook)
6. **Then: Wave 6** — monorepo CI/CD hardening and docs cleanup
7. **Defer non-migration feature expansion unless it blocks a migration gate**

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
- [ ] **bm2-consume-core-packages** — finish practice/auth import migration, plan SRS contract track
- [ ] **bm2-consume-runtime-packages** — adopt runtime/approval/graphing packages in BM2
- [ ] Wave 5: Extract feature packages (test-engine, study-hub, teacher-reporting)
- [ ] Wave 5: AI tutoring and workbook (import/adopt from BM2)
- [ ] Wave 6: CI/CD hardening, docs cleanup

## Code Review Summary (2026-04-18 — Review #5)

Comprehensive audit of all monorepo extraction phases (Waves 2-4), BM2 integration, shared packages, and IM3 import migration.

### Verification Results

| Check | Result |
|-------|--------|
| Build (vinext build) | PASS |
| Tests (vitest run) | 3249/3255 pass (6 aspirational .todo tests) |
| Typecheck (tsc — IM3 + packages) | CLEAN |
| Lint (eslint —max-warnings 0) | CLEAN |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| BM2 timingSafeEquals timing side-channel | Critical | Fixed to use Math.max + XOR padding (BM2 lib/auth/session.ts) |
| BM2 generateRandomPassword modulo bias | High | Fixed with rejection sampling (BM2 lib/auth/session.ts) |
| practice-core submission.schema.ts weaker than contract.ts | Medium | Aligned partId/hintsUsed/revealStepsSeen/changedCount constraints |
| practice-core missing PracticeSubmissionInput type export | Medium | Added to src/index.ts |
| srs-engine non-top-level import | Medium | Moved import type to file top (submission-srs-adapter.ts) |
| ObjectivePriority local type duplication in IM3 | Medium | Replaced with import from @math-platform/srs-engine |

### Issues Found But Not Fixed (Tracked in tech-debt.md)

| Issue | Severity | Notes |
|-------|----------|-------|
| Misconception summary query N+1 | Critical | 30x100 sequential reads; will timeout at scale |
| BM2 lib/auth/ ~250 lines duplicated | High | timingSafeEquals/generatePassword fixed but still diverges (JWT warning, demo-provisioning logic) |
| BM2 lib/practice/ ~1305 lines duplicated | High | 73 local imports vs 12 package imports; engine/ subtree is BM2-specific |
| BM2 lib/srs/ complete architecture divergence | High | Different data models; 0 package imports; needs dedicated migration track |
| practice-core dual schema files | Medium | submission.schema.ts still exists as parallel surface; consolidate with contract.ts |
| 5 packages missing vitest configs | Low | core-auth, core-convex, activity-runtime, component-approval, graphing-core |
| RSC entry chunk 750 KB | Medium | Code-splitting regressed; need dynamic imports |

### Key Architectural Findings

1. **BM2 SRS is not duplicating the package** — it uses a fundamentally different data model (card:Record, numeric timestamps) vs the FSRS-aligned package types. A dedicated migration track is needed, not a simple import swap.
2. **BM2 `lib/auth/server.ts` is app-specific** — it wraps package functions with Next.js cookie/redirect logic. This is correct; it should NOT be in the shared package.
3. **BM2 `lib/practice/engine/` is BM2-domain logic** — 26 family files for accounting exercises. Not duplicated from the package; this is business-domain code that stays app-local per AGENTS.md scope.
4. **IM3 `lib/practice/objective-proficiency.ts` is NOT duplicated from packages** — it contains 456 lines of original proficiency computation logic not in any package. Only the `ObjectivePriority` type was duplicated (fixed in this review).
