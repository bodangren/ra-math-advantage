# Current Directive — 2026-06-09

## Objective
Remediate fundamental monorepo holes and wire the Knowledge Space Engine (KST) v2 pipeline.

## Strategic Detour (Status — corrected 2026-06-09 after audit verification)
- [x] **Measure Tooling**: Implemented `generate.sh` and `doctor.sh` with real
  architectural fact extraction. Committed `0edad3f5`. Track
  `measure-architecture-tooling_20260605` (manual-verification gates pending).
- [x] **Status Re-classification**: `measure/tracks.md` reflects Skill Graph
  tracks as "Data-Complete" but not "Runtime-Active".
- [x] **Prune BM2 Legacy**: **COMPLETE.** Live zod schemas re-homed to
  `lib/schemas/`, ~15 importers rewired, `lib/db/` and drizzle deps fully
  removed. BM2 typechecks, lints, builds, and passes `npm run doctor`.
  Track `bm2-drizzle-removal_20260609` closed.

## Priority 2: Wire KST Pipeline (KST Track 1)
The primary blocker for the Skill Graph value proposition is the "built but not wired" gap.
- **Track**: `measure/tracks/wire-kst-pipeline_20260521/`
- **Goal**: Wire `knowledge-space-core` into an IM3 production route.

## Also opened from the 2026-06-09 audit
- `unified-auth-monorepo_20260609` (PLANNED) — audit #5.
- `im1-practice-readiness_20260609` (PLANNED) — audit #2/#6.

## Known Blockers
- BM2 does not currently typecheck/build (in-flight Drizzle prune). Top priority.
