# Disposition Plan: Vertical Slice Value Proof

**Status:** Superseded on 2026-08-21

**Implementation instruction:** Do not implement this plan

## Decision

- [x] Apply the Ponytail Rule to the original goal.
- [x] Stop because the original “graph is not wired” premise is no longer true.
- [x] Do not create another IM3 graph loader, KST query, student route, feature
  flag, or submission-to-SRS bridge.

## Evidence

- [x] `apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts` loads the
  canonical IM3 graph.
- [x] `apps/integrated-math-3/convex/student/knowledge_state.ts` runs the
  SRS-to-KST projection.
- [x] `apps/integrated-math-3/app/student/knowledge-state/page.tsx` is the
  production student route.
- [x] The Teacher-Led First Exposure and Mastery Advantage track owns the
  bounded one-node IM3 proof.
- [x] `mastery-advantage-graph-remediation_20260821` owns the graph inventory
  and the replacement vertical slice.
- [x] The former 96-skill and 83-generator-gap claims are withdrawn.

## Remaining Work That Does Not Belong Here

- [x] Stop generator content authoring until
  `mastery-advantage-graph-remediation_20260821` approves the inventory.
- [x] Keep KST+SRS migration narrowing in
  `kst-srs-v3-2-im3-runtime-migration_20260710`.
- [x] Keep the one-node teacher-first practice proof in
  `teacher-led-mastery-advantage_20260819`.
- [x] Keep APPC and Business Math remediation in
  `mastery-advantage-graph-remediation_20260821`.
- [x] Do not use unfinished generator breadth as a reason to duplicate the
  production KST route.

## Closeout

- [x] Mark this track as superseded in `metadata.json`. [8fed657a]
- [x] Mark this track as superseded in `measure/tracks.md`. [5f68dd3a]
- [x] Preserve this plan as the reason that no duplicate implementation should
  be started. [8fed657a]
