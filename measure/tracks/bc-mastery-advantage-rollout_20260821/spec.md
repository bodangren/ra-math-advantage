# Specification: BC Mastery Advantage Rollout

> **SUPERSEDED 2026-08-21:** Do not implement this specification. Its 19-skill
> contract treats generator families as curriculum skills. Use
> `mastery-advantage-graph-remediation_20260821`.

## Purpose

Create the minimum Business Math knowledge space that supports the existing
curriculum and deterministic practice engine. Students first attempt a mapped
skill in the daily lesson. Students can then use supplementary Mastery
Advantage work to improve SRS and KST proficiency.

## Course Boundary

Business Math is outside the IM1 to IM2 to IM3 to APPC course-series graph. It
needs an app-owned graph. Git history contains no prior Business Math graph to
restore.

The first graph has one mastery skill for each registered deterministic problem
family. It does not create one node for every lesson objective.

## Existing Assets to Reuse

- The 19-family registry in
  `apps/bus-math-v2/lib/practice/engine/family-registry.ts`.
- The six existing problem-part kinds.
- The existing shared accounting input components.
- The 89-lesson published curriculum manifest.
- The current student lesson route.
- The current `/api/progress/assessment` route.
- The existing server-owned accounting-equation writer.
- The existing `learning-evidence.v1` consumer and SRS adapter.
- The existing `/student/practice` page and `DailyPracticeSession`.
- The installed knowledge-space packages.

Do not create a second practice engine, SRS scheduler, evidence contract, or
lesson route.

## Verified Baseline

- The problem-family registry has 19 keys.
- All 19 families generate deterministically from a numeric seed.
- All 19 families accept the server-owned mode `independent_practice`.
- Every generated activity ID contains its family key and seed.
- The registry has three real student answer inputs: `accounting-equation`,
  `normal-balance`, and `classification`.
- The other 16 families use a fallback that calls `solve()` and submits the
  correct response. That fallback is not a student attempt.
- The published curriculum manifest has 89 lessons.
- The manifest does not identify a problem family in activity props.
- Git history has no Business Math graph artifact.
- `MathCourse` currently accepts only `im1`, `im2`, `im3`, and `precalc`.

## Graph Contract

The graph has exactly 19 mastery skill nodes in its first release. Each node
maps to exactly one registered family. Each registered family maps to exactly
one node.

The app-owned rollout map must also contain a reviewed daily source lesson and
stable activity. A curriculum owner must approve this mapping because it cannot
be derived from the current manifest.

The accounting-equation pilot keeps its current node ID:
`math.bm2.skill.1.1.apply-accounting-equation`.

## Server-Owned Practice Contract

1. The browser receives a generated definition and submits a raw answer.
2. The route resolves the family from the registered family prefix.
3. The route extracts the numeric seed from the generated activity ID.
4. The server regenerates the family with `{ mode: 'independent_practice' }`.
5. The regenerated activity ID must equal the submitted activity ID.
6. The server grades the raw answer with the family.
7. The server assigns learner, node, ordinal, event time, score, and status.
8. The evidence consumer receives only the opaque stored `submissionId`.

No new challenge store is required because every family is deterministically
reconstructable. Do not trust client part scores or client mode.

## Answer Input Contract

The student must provide an actual answer. The app must not use `family.solve()`
as the student response.

Reuse the six existing problem-part kinds and the shared accounting controls.
Add one generic part-input adapter for uncovered families. Keep the three
specialized inputs where they provide a better interaction. Add another
family-specific component only when the generic adapter cannot represent its
authored response.

## KST and SRS Contract

- Teacher-led evidence changes neither KST nor SRS.
- Mastery Advantage is unavailable before teacher-led exposure.
- Eligible evidence updates the existing SRS card and review path.
- The BC KST read derives state from SRS and the 19-node graph with the shared
  bridge.
- The app does not create a second KST implementation.
- New SRS cards use the graph node ID as `objectiveId` and the family key in the
  existing legacy `problemFamilyId` field.

## Acceptance Criteria

1. The graph has exactly 19 mastery skill nodes.
2. The graph and family registry form an exact bijection.
3. Every node has a curriculum-owner-approved daily source mapping.
4. Every daily source uses the real lesson and assessment flow.
5. Every family collects an actual raw student response.
6. Every family is reconstructed and graded on the server.
7. Teacher-led evidence changes no KST or SRS state.
8. Eligible Mastery Advantage evidence updates SRS.
9. The shared bridge returns KST state for all 19 nodes.
10. The queue excludes skills before teacher exposure.
11. Replay, conflict, role, and opaque retry behavior match the pilot contract.
12. Focused tests, full tests, coverage, lint, TypeScript, build, package gates,
    generated facts, boundaries, and Measure Doctor pass.

## Out of Scope

- A node for every one of the 89 lessons.
- An inferred family-to-lesson mapping without curriculum review.
- A new challenge protocol.
- A second KST bridge or SRS scheduler.
- Cross-course equivalence with IM1 to APPC.
- Live-classroom transport.
- New hashes, checksums, fingerprints, or provenance manifests.
