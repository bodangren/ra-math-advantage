# Specification: IM3 Mastery Advantage Rollout

> **SUPERSEDED 2026-08-21:** Do not implement this specification. Its 96-skill
> and 83-gap contracts use invalid proxy counts. Use
> `mastery-advantage-graph-remediation_20260821`.

## Purpose

Extend the accepted IM3 teacher-first pilot to every mastery-bearing IM3 skill.
Students first attempt each skill in the daily curriculum. Students can then use
supplementary Mastery Advantage work to improve KST proficiency and SRS state.

## Existing Assets to Reuse

- The canonical IM3 graph at
  `apps/integrated-math-3/curriculum/skill-graph/nodes.json` and `edges.json`.
- The graph loader at
  `apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts`.
- The 351-row `practice.v1` projection.
- The 174-row SRS projection.
- The generic student lesson route at `/student/lesson/[lessonSlug]`.
- The existing activity submission routes.
- The existing server-owned submission writer.
- The existing `convex/learningEvidence.ts` consumer.
- The existing KST student query and shared SRS-to-KST bridge.
- The existing SRS queue and planner.
- The accepted pilot node and its tests.

Do not create a second graph, KST bridge, SRS scheduler, lesson route, evidence
contract, or per-skill API route.

## Verified Baseline

- The graph has 574 total nodes.
- The graph has 96 nodes with `kind: skill`.
- Thirteen mastery skills currently have generator-backed practice.
- Eighty-three mastery skills need a generator.
- The generator gap queue has 171 rows because it also contains concept rows.
- Missing mastery-skill generators by module are:

| Module | Missing skill generators |
|--------|--------------------------|
| 1 | 3 |
| 2 | 9 |
| 3 | 7 |
| 4 | 13 |
| 5 | 8 |
| 6 | 7 |
| 7 | 12 |
| 8 | 10 |
| 9 | 14 |

## Rollout Eligibility

A skill is enabled only when all items below are true:

1. The skill exists in the canonical graph.
2. A real daily-curriculum activity maps to the skill.
3. The daily activity creates teacher-led exposure from a stored submission.
4. A server-graded Mastery Advantage generator exists.
5. The generated activity uses the existing `practice.v1` renderer contract.
6. The skill has an SRS projection entry.
7. The evidence consumer can apply the existing KST and SRS path.

Do not mark a skill enabled because a placeholder blueprint or title exists.

## Course-Series Graph Contract

IM1, IM2, IM3, and APPC are one logical course-series graph. Each app keeps an
app-owned graph projection. The 5,024 shared `equivalent_to` edges remain the
cross-course stitch.

`equivalent_to` is transfer policy input. It is not a `prerequisite_for` edge.
The rollout must reuse `computeEquivalenceComponents`, `computeTransferCredit`,
and `flagTransferEligible` from `@math-platform/knowledge-space-core`.

The current IM3 transfer-credit components have no production caller. A real
caller also needs server-owned prior-course learner state. The current separate
Convex deployments do not provide that state to IM3. Do not invent client-owned
transfer evidence. Stop the transfer task until an approved trusted prior-course
state provider exists.

## Trust Boundary

- The browser submits raw answers and an opaque idempotency key.
- The server authenticates the student.
- The server resolves the stable activity and mastery node.
- The server reconstructs or loads the authored activity.
- The server grades the answer.
- The server assigns event time and attempt ordinal.
- The evidence consumer receives only the opaque `submissionId`.
- Teacher-led evidence changes no KST or SRS state.
- Mastery Advantage evidence is rejected before teacher exposure.

## Acceptance Criteria

1. All 96 IM3 skills have a reviewed daily-curriculum source mapping.
2. All 96 IM3 skills have a real teacher-led first attempt.
3. All 96 IM3 skills have server-graded supplementary practice.
4. The 83 current skill generator gaps reach zero.
5. The rollout uses one generic production flow.
6. A same-key retry creates one logical submission and one evidence effect.
7. A same-key different-body request returns HTTP 409.
8. Teacher-led evidence produces no KST or SRS effect.
9. Eligible Mastery Advantage evidence updates the existing KST and SRS path.
10. The daily queue offers only reviewed and enabled rows.
11. Cross-course transfer is not claimed without server-owned prior-course
    learner state and a production caller.
12. Focused tests, full tests, coverage, lint, typecheck, build, package gates,
    generated facts, boundaries, and Measure Doctor pass.

## Out of Scope

- Reauthoring the IM3 graph.
- Changing KST mathematics, thresholds, or SRS parameters.
- Concept-node generator rollout.
- Live-classroom transport.
- A shared Convex deployment.
- A new cross-app learner-data API without separate approval.
- New hashes, checksums, fingerprints, or provenance manifests.
