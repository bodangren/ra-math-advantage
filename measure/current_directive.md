# Current Directive — 2026-06-09

## Objective
Remediate fundamental monorepo holes and wire the Knowledge Space Engine (KST) v2 pipeline.

## Strategic Detour (Status — corrected 2026-06-09 after audit verification)
- [x] **Measure Tooling**: Implemented `generate.sh` and `doctor.sh` with real
  architectural fact extraction. Committed `0edad3f5`. Track
  `measure-architecture-tooling_20260605` (manual-verification gates pending).
- [x] **Status Re-classification**: `measure/tracks.md` reflects Skill Graph
  tracks as "Data-Complete" but not "Runtime-Active".
- [~] **Prune BM2 Legacy**: **NOT complete — in progress.** The Drizzle/Postgres
  deletion was half-applied and is **build-breaking**: the deleted
  `lib/db/schema/*` files mixed dead tables with live zod schemas/types that ~15
  files still import. Re-scoped under track `bm2-drizzle-removal_20260609`.

## Priority 1: Finish BM2 Drizzle Removal (unblock BM2 build)
- **Track**: `measure/tracks/bm2-drizzle-removal_20260609/`
- **Goal**: Re-home live schemas off drizzle, rewire importers, drop dead layer; BM2 green.

## Priority 2: Wire KST Pipeline (KST Track 1)
The primary blocker for the Skill Graph value proposition is the "built but not wired" gap.
- **Track**: `measure/tracks/wire-kst-pipeline_20260521/`
- **Goal**: Wire `knowledge-space-core` into an IM3 production route.

## Also opened from the 2026-06-09 audit
- `unified-auth-monorepo_20260609` (PLANNED) — audit #5.
- `im1-practice-readiness_20260609` (PLANNED) — audit #2/#6.

## Known Blockers
- BM2 does not currently typecheck/build (in-flight Drizzle prune). Top priority.
