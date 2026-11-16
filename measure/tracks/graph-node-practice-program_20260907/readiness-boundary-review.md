# Integrated Math 3 Readiness Boundary Review

Date: 2026-09-07.

This review traces the current production readiness path. It proposes an application-owned correction. It does not approve a graph node or edge.

## Current production path

`apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts` returns the complete candidate graph. It does not filter `reviewStatus`. The current root artifact has 595 nodes. It has 542 draft nodes, 48 reviewed nodes, and 5 approved renderer nodes. It has no approved skill node. All 10 `prerequisite_for` edges are draft.

`apps/integrated-math-3/convex/student/knowledge_state.ts` is the main readiness consumer. It reads all student SRS cards and review logs. It converts them to a knowledge-state map against the complete graph. It then calls `getOuterFringe(state, graph)`. The fringe calculation accepts every node and every prerequisite edge in the supplied graph. Thus a draft target can become ready. A draft prerequisite can also block or change its readiness score.

The same handler then calls `projectStudentVisualization` with the complete graph. This projection has a second readiness path. It calculates node states from prerequisites. It also ranks `ready` candidates through `getRecommendedNext`. Therefore a correction only around `getOuterFringe` is incomplete.

The active production consumers are:

- `apps/integrated-math-3/app/student/dashboard/page.tsx` calls `student/knowledge_state:getStudentKnowledgeState`. It renders `recommendedNext` through `RecommendedNextPanel`.
- `apps/integrated-math-3/app/student/knowledge-state/page.tsx` calls the same query. It renders mastered, ready, blocked, and review-due results.
- `apps/integrated-math-3/convex/parent/visualization.ts` calls `getStudentKnowledgeStateHandler`. It then reloads the complete graph and calls `buildParentProjectionPayload`. This second graph load can restore draft graph relationships to the parent projection.
- `apps/integrated-math-3/convex/student.ts` has a separate legacy production handler named `getStudentVisualizationHandler`. It converts `placement_results` to learner state and calls `projectStudentVisualization` with the complete graph. Its source comment and `RecommendedNextPanel` identify `internal.student.getStudentVisualization` as a supported dashboard source, although the current dashboard now calls the knowledge-state query.

Direct calls to `getOuterFringe`, `getOuterFringeV3`, and `computeWeightedReadiness` outside these handlers are tests or shared library code. The generic core functions intentionally accept candidate graphs for analysis. Do not change their default behavior.

## Minimum application boundary

Add one pure projection function beside `loadFullCurriculumGraph` in the IM3 curriculum loader. Give it the complete graph. Return a student-readiness graph. Do not add a registry or stored projection.

Use these rules:

1. A readiness target must be a skill node with `reviewStatus === 'approved'`.
2. An accepted prerequisite must have `type === 'prerequisite_for'` and `reviewStatus === 'approved'`.
3. Both endpoints of an accepted prerequisite must exist in the complete node catalog.
4. Both endpoints must be approved skill nodes.
5. A target with an incoming draft or reviewed prerequisite remains ineligible. The relationship is unresolved. Do not turn the target into a synthetic root.
6. Ignore a rejected prerequisite. Rejection is the explicit decision that the relationship must not control readiness.
7. An approved skill with no incoming non-rejected prerequisite is an eligible root.
8. If an approved prerequisite has a missing, non-skill, or non-approved endpoint, keep its target ineligible. This is a malformed approved relationship.

These rules use the existing node and edge fields. They do not infer approval from `independentPracticeReady`, a renderer, a generator, a blueprint, a pilot allow-list, or historical evidence.

Apply this derived graph at all IM3 learning-decision calls:

- Use it for `getOuterFringe` in `student/knowledge_state.ts`.
- Use it for `projectStudentVisualization` in the same handler.
- Use it for the second parent projection in `parent/visualization.ts`.
- Use it in the legacy `getStudentVisualizationHandler` in `convex/student.ts`.

Keep `loadFullCurriculumGraph` unchanged. Existing source inspection, validation, and curriculum tests need the complete candidate graph.

## Evidence preservation

Keep the two `DefaultSrsToKstBridge.convert` calls on the complete graph. Do not remove SRS cards, review logs, proficiency inputs, or prior state entries because their objective is not approved for readiness. This preserves historical learner evidence and hysteresis. The application must filter only the graph that controls readiness and recommendations.

The teacher-led pilot submission and evidence path is separate. `apps/integrated-math-3/convex/activities.ts` and `apps/integrated-math-3/lib/practice/learning-evidence-pilot.ts` own its exact activity mapping, grading, persistence, and SRS delivery. The readiness boundary must not change these files or their allow-list.

The student projection needs an explicit presentation decision for historical evidence on an unapproved node. The safe minimum is to retain that evidence in the computed state and storage, while omitting the unapproved node from ready, blocked, and recommended lists. Do not copy historical mastery into an approved target. If the product must display archived mastery, add a separate read-only history view later. Do not make an unapproved node eligible to preserve display continuity.

## Partial-root behavior

An empty approved graph is a valid result. This is the current result because the artifact has no approved skill node. The dashboard already supports an empty recommendation state. Do not fall back to draft nodes.

An approved skill is a valid root only when the complete candidate graph has no incoming draft, reviewed, or malformed approved prerequisite for it. This distinction prevents a filtered unresolved edge from silently unlocking its target.

An approved root can be ready even when other course modules remain draft. A partial approved graph does not require approval of the complete course. An approved downstream target can use only approved prerequisite paths whose endpoints are present in the same derived graph.

## Required synthetic tests

Add tests for the pure IM3 boundary before handler changes.

- Positive root: an approved skill with no incoming prerequisite remains in the derived graph.
- Negative target: a draft or reviewed skill does not enter the derived graph, even when readiness flags and runtime mappings are present.
- Positive prerequisite: an approved edge between two approved skills remains and controls the target.
- Draft prerequisite: a draft incoming edge does not enter the graph, and its approved target remains ineligible.
- Reviewed prerequisite: a reviewed incoming edge has the same fail-closed result.
- Rejected prerequisite: a rejected incoming edge does not enter the graph and does not prevent an otherwise valid approved root.
- Malformed approved prerequisite: a missing endpoint, non-skill endpoint, or non-approved endpoint makes the target ineligible.
- Partial graph: one valid approved root remains available while an unrelated unresolved target stays absent.
- Empty graph: zero approved skills produces no ready or recommended result. It does not throw.

Add handler tests with synthetic graph injection or a pure orchestration helper. Do not approve production fixtures to make these tests pass.

- Historical evidence: an SRS card for an unapproved node still reaches the bridge state, but the node does not enter `ready` or `recommendedNext`.
- Approved readiness: evidence for an approved prerequisite changes the approved target from blocked to ready.
- Draft isolation: high mastery on a draft source does not unlock an approved target through a draft edge.
- Parent parity: student and parent projections use the same derived readiness graph.
- Legacy parity: the placement-based handler does not recommend an unapproved target.
- Pilot preservation: the teacher-led pilot still accepts the same authorized submission and writes the same evidence and SRS records.

## Safe implementation conclusion

The minimum correction is one pure IM3 graph projection and four application call-site updates. Keep the complete graph for curriculum analysis and learner-state conversion. Use the derived graph only where the application assigns readiness, creates recommendations, or presents prerequisite-driven status.

This boundary will produce no approved IM3 recommendation with the current artifact. That result is correct. A separate curriculum review must approve an exact skill and its prerequisite state before production readiness can include it.
