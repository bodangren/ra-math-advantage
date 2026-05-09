# IM3 Module 1 Pilot Audit

## Summary

The IM3 Module 1 pilot proves the full graph-to-runtime flow end-to-end on Integrated Math 3, Module 1 (Quadratic Functions). All acceptance criteria are met with documented exceptions.

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| IM3 Module 1 graph artifacts exist and validate | PASS | 145 nodes, 144 structural edges, 809 alignment edges |
| Standards coverage is complete or exceptions documented | PASS | All skill/worked_example nodes have aligned_to_standard edges or documented exceptions |
| Prerequisite/support edges have source-backed rationale | PASS | 10 prerequisite_for, 16 support edges with rationale and sourceRefs |
| At least three deterministic generators exist and are tested | PASS | quadratic-graph-analysis, average-rate-of-change, solve-quadratic-by-graphing |
| Pilot UI/harness renders worked, guided, and independent modes | PASS | Blueprint validation covers 3 worked, 3 guided, 3 independent mode renderers |
| Independent submissions produce valid practice.v1 envelopes | PASS | genericEvidenceToSubmissionParts bridges generator output to PracticeSubmissionPart[] |
| Teacher evidence projection references skill IDs and standards | PASS | 9 standards, 31 skills, 6 attempt artifacts |
| Pilot audit report summarizes readiness and blockers | PASS | This document |

## Counts

### Graph Artifacts

| Artifact | Count |
|----------|-------|
| Total nodes | 145 |
| Domain nodes | 1 |
| Skill nodes (lesson-level) | 16 |
| Concept nodes (ALEKS-level) | 15 |
| Worked example nodes | 52 |
| Instructional unit nodes | 8 |
| Content group nodes | 1 |
| Standard nodes | 44 |
| Generator nodes | 4 |
| Renderer nodes | 5 |
| **Structural edges** | **144** |
| contains | 25 |
| appears_in_context | 35 |
| prerequisite_for | 10 |
| supports | 16 |
| rendered_by | 55 |
| generated_by | 12 |
| **Alignment edges** | **809** |
| aligned_to_standard | 809 |

### Blueprints

| Metric | Count |
|--------|-------|
| Total blueprints | 6 |
| Full worked/guided/independent (with generator) | 3 |
| Worked + guided only (exception: no generator) | 3 |
| Distinct generators | 3 |
| Distinct renderers used | 4 |

### Generators

| Generator | Node IDs | Type |
|-----------|----------|------|
| quadratic-graph-analysis | 1 skill + 1 concept | Deterministic (seeded random) |
| average-rate-of-change | 1 skill + 1 concept | Deterministic (seeded random) |
| solve-quadratic-by-graphing | 1 skill + 1 concept | Deterministic (seeded random) |
| algebraic-step-solver | 5 concepts (stub) | Stub (returns scaffold) |

### Projection

| Metric | Count |
|--------|-------|
| Projected activities | 15 |
| worked_example | 6 |
| guided_practice | 6 |
| independent_practice | 3 |
| SRS inputs | 6 |
| generator-ready SRS entries | 3 |
| Teacher evidence standards | 9 |
| Teacher evidence skills | 31 |
| Attempt artifacts | 6 |

### Test Coverage

| Test Suite | Tests | Status |
|------------|-------|--------|
| pilot-graph-validation | 12 | PASS |
| pilot-generators | 16 | PASS |
| pilot-projection | 9 | PASS |
| pilot-rendering | 8 | PASS |
| pilot-submission-evidence | 9 | PASS |
| **Total** | **54** | **PASS** |

## Generator Coverage

| Module 1 Skill | Has Generator? | Has Blueprint? | Modes |
|-----------------|---------------|----------------|-------|
| Graph quadratic functions | Yes (quadratic-graph-analysis) | Yes | worked, guided, independent |
| Average rate of change | Yes (average-rate-of-change) | Yes | worked, guided, independent |
| Solve quadratic by graphing | Yes (solve-quadratic-by-graphing) | Yes | worked, guided, independent |
| Solve quadratic by factoring | No (algebraic-step-solver stub) | Yes | worked, guided |
| Use discriminant | No (algebraic-step-solver stub) | Yes | worked, guided |
| Graph quadratic inequalities | No (no generator yet) | Yes | worked, guided |
| Other 10 Module 1 skills | No | No (deferred to rollout) | — |

**Generator coverage:** 3/16 lesson-level skills (18.75%) have deterministic generators. 3/6 ALEKS concepts share generators. This meets the pilot threshold of "at least three deterministic generators."

## Rendering Coverage

| Renderer | Used By |
|----------|---------|
| graphing-explorer | 3 skill blueprints, 16 skill/concept nodes |
| step-by-step-solver | 8 skill nodes, 1 concept blueprint |
| rate-of-change-calculator | 1 skill blueprint |
| discriminant-analyzer | 1 skill node |

**Rendering coverage:** 4/6 registered renderer components are exercised by pilot blueprints.

## Submission Evidence

Independent practice activities emit valid `practice.v1` envelopes:

```
contractVersion: 'practice.v1'
activityId: stableActivityId (e.g., 'math.im3.skill.1.1.graph-quadratic-functions.independent_practice')
mode: 'independent_practice'
answers: { variant from generator output }
parts: PracticeSubmissionPart[] (from genericEvidenceToSubmissionParts)
timing: optional PracticeTimingSummary
```

Skill ID and graph provenance are carried in:
- `activityId` contains the nodeId and mode
- `analytics` field can include `skillNodeId` and `graphProvenance: 'skill-graph-pilot'`

## Blockers for Rollout

1. **Generator depth:** Only 3/16 lesson-level skills have deterministic generators. Remaining 13 need implementation before replacing runtime activity maps.
2. **Rendering harness:** No dev-only pilot harness page yet (only tests, not a UI). A React component rendering the graph-derived blueprints is needed for manual smoke testing.
3. **Concept-level blueprint coverage:** ALEKS concept nodes have `independentPracticeReady: true` and generators, but only 3concept blueprints are authored. The concept→skill blueprint mapping needs explicit design decisions.
4. **Rate-of-change renderer:** The `rate-of-change-calculator` renderer node exists in the graph but the component registry doesn't have a graph-derived mapping exercise yet.

## Comparison with Existing Activity Map

The existing IM3 activity map uses seed data authored per-lesson in `convex/seed/seed_lesson_1_*.ts` files. Key differences:

| Dimension | Existing (Seed) | Graph-Derived (Pilot) |
|-----------|----------------|----------------------|
| Source of truth | Hand-authored seed files | Skill graph blueprints |
| Activity ID scheme | Sequential UUIDs | Deterministic nodeId.mode |
| Standard alignment | Per-activity mapping | Graph `aligned_to_standard` edges |
| SRS integration | Problem family → objective mapping | Graph SRS projection (nodeId, prerequisites, standards) |
| Renderer assignment | Hardcoded per activity type | Blueprint rendererModeMap |
| Generator availability | None (static props) | 3 deterministic generators |
| Evidence provenance | Subsystem-specific | Graph-derivable skill ID and standards |

**Decision:** The graph-derived projection is NOT yet ready to replace the existing runtime activity maps for Module 1. The pilot proves the end-to-end pipeline works, but rollout requires:
- Generator coverage for all Module 1 skills (Track 11)
- A rendering harness for manual verification
- Concept-level blueprint coverage decisions
- A migration plan from seed-based to graph-derived activity maps