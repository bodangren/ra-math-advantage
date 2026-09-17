# Specification: Teacher-Led First Exposure and Mastery Advantage Pilots

## Purpose

Prove one teacher-first learning-evidence flow in each course app. The track is
a policy and trust-boundary pilot. It is not a course rollout.

The pilot uses the existing `learning-evidence.v1`, `practice.v1`, Knowledge
Space Theory (KST), and Spaced Repetition System (SRS) code. It must not create
a second KST bridge, scheduler, graph, or submission protocol.

## Course Names

- **IM3** means `apps/integrated-math-3`.
- **APPC** means `apps/pre-calculus`.
- **BC** means `apps/bus-math-v2`.

## Exact Pilot Boundary

| App | Pilot node | Progression in this track |
|-----|------------|---------------------------|
| IM3 | `math.im3.skill.1.1.graph-quadratic-functions` | Existing KST and SRS |
| APPC | `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs` | Existing SRS; receipt has `kstApplied: false` |
| BC | `math.bm2.skill.1.1.apply-accounting-equation` | Existing SRS; receipt has `kstApplied: false` |

The APPC node is part of the single IM1 to IM2 to IM3 to APPC course-series
graph. The BC node is not part of that series graph. BC has no knowledge-space
graph in the repository.

## Evidence Contract

The shared package owns `learning-evidence.v1`. Each app owns authentication,
submission storage, evidence storage, and downstream adapters.

The evidence envelope contains these fields:

| Field | Rule |
|-------|------|
| `contractVersion` | Exact literal `learning-evidence.v1` |
| `nodeId` | Canonical mastery skill ID |
| `activityId` | Stable activity ID |
| `attemptOrdinal` | Positive server-owned ordinal |
| `origin` | `teacher_led` or `mastery_advantage` |
| `mode` | A valid `practice.v1` mode |
| `occurredAt` | Server-owned event time |
| `gradedEvidence` | Optional server-owned outcome |
| `idempotencyKey` | Required opaque key |

Raw answers remain in the stored `practice.v1` submission. Public evidence
consumers accept only the opaque server-owned `submissionId`.

## Required Behavior

1. A real daily-curriculum attempt creates the first `teacher_led` evidence.
2. Teacher-led evidence introduces the node.
3. Teacher-led evidence does not change KST or SRS state.
4. Mastery Advantage is ineligible before teacher-led exposure.
5. A graded Mastery Advantage attempt can update the app's existing
   progression adapter after exposure.
6. IM3 uses its existing KST and SRS path.
7. APPC and BC use their existing SRS path in this pilot.
8. APPC and BC return `kstApplied: false` in this pilot.
9. A same-key replay returns the first logical result.
10. A same-key request with different normalized fields returns a conflict.
11. The browser cannot set learner identity, score, grade, ordinal, event time,
    evidence origin, or stored submission identity.

## Hashing and Scope Rule

This track does not require a content hash, request fingerprint, checksum,
source-tree digest, or provenance manifest. Use the opaque idempotency key and
direct normalized-field comparison. Keep existing password and security hashes
outside this track unchanged.

## Acceptance Criteria

1. Exactly one pilot node is enabled in each app.
2. Each pilot has a real daily-curriculum producer.
3. Each pilot has a supplementary Mastery Advantage producer.
4. Each public route requires a student session.
5. Each create route requires a bounded non-blank `Idempotency-Key`.
6. Each server-owned writer grades and assigns the ordinal on the server.
7. Each evidence retry sends only the cached opaque `submissionId`.
8. Teacher-led evidence produces no KST or SRS effect.
9. IM3 eligible evidence applies KST and SRS.
10. APPC and BC eligible evidence apply SRS and report `kstApplied: false`.
11. Phase completion keeps one logical idempotency key across a retry.
12. Focused gates, app gates, package gates, generated-doc checks, boundaries,
    and Measure Doctor pass or match a recorded pre-track baseline.

## Follow-On Tracks

- `mastery-advantage-graph-remediation_20260821` owns the graph inventory,
  removal-first repair, and three replacement vertical slices.
- The IM3, APPC, and BC rollout tracks from 2026-08-21 are superseded.
- Their 96, 73, and 19 skill totals are withdrawn.

## Out of Scope

- A fourth pilot node.
- Course-wide generator authoring.
- A new KST bridge or SRS scheduler.
- A new graph for IM3 or APPC.
- A BC graph.
- Cross-app learner-data transport.
- New transfer-credit mathematics.
- Live-classroom transport.
- Production deployment.
