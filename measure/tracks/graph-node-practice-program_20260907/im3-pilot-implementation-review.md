
## 2026-09-07 teacher-first trust-boundary review

### Blocking findings

- The current graph node is `math.im3.skill.1.1.graph-quadratic-functions`. The node and its blueprint both have `reviewStatus: draft`. The ordinary student route must reject this pilot until both records are approved.
- `createIm3ServerOwnedSubmissionHandler` reads the stored activity and submission. It does not check the current node and blueprint publication state. A previously seeded activity can therefore bypass a later draft or rejected graph record.
- `buildIm3StoredEvidence` maps a student-owned Worked submission to `origin: teacher_led`. The student-authenticated `/api/learning-evidence/im3-pilot` route can therefore create trusted exposure. This violates the canonical teacher-first policy.
- IM3 has no production teacher attestation writer. The teacher student page shows progress and an empty `SubmissionReviewPanel`. It cannot select and attest a source attempt.
- A safe repair needs two evidence rows for one source submission. The student submission keeps its historical row. The teacher action adds a distinct `teacher_led` row. Replay queries must filter by `origin`. Candidate queries must exclude only an existing `teacher_led` row.

### Required bounded contract

1. The student submission handler must check the current graph node and blueprint. Both records must be approved. The node must have kind `skill`.
2. A student Worked acknowledgement must not create `teacher_led` evidence.
3. The teacher candidate query must require a teacher or administrator profile. It must require a teacher-owned active class, an active student enrollment, and the exact assigned Lesson 1.1 source.
4. The source submission time must be on or after both the enrollment time and the lesson assignment time.
5. The source submission must belong to the selected student. It must use the exact published graph Worked activity and exact node.
6. The teacher action must use a server-owned source submission. The request must contain only opaque identifiers and an idempotency key.
7. The teacher action must write a distinct `teacher_led` evidence row. A retry with the same teacher, source submission, and key must return the same result. A different body with the same key must fail.
8. Independent evidence must use the canonical evaluator. Only a prior same-learner, same-node teacher row at or before the graded event can make it eligible.
9. The teacher page must show the class, student, lesson, source attempt time, raw response, and server grade. It must not ask the teacher to type database identifiers.

### Required behavioral fixtures

- Draft node or draft blueprint rejects a stored approved activity.
- A student Worked acknowledgement creates no teacher exposure.
- The correct teacher sees the exact assigned student source attempt.
- A different teacher, class, learner, node, lesson, or source activity cannot use the attempt.
- A submission before enrollment or assignment cannot become a candidate.
- The teacher action preserves the existing student history and adds one teacher row.
- An identical teacher retry returns the same row. A conflicting retry fails.
- Independent evidence before attestation stays ineligible. The same exact-node Independent path after attestation follows its server grade and assistance policy.

### Following batch node identifiers

1. `math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation`
2. `math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph`
3. `math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph`
4. `math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry`
5. `math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions`
6. `math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context`
7. `math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model`
8. `math.im3.skill.1.2.solve-a-quadratic-equation-with-one-real-solution-by-graphing`
9. `math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing`

### Integration status

The review defines the required repair. The current source does not contain the teacher writer, candidate query, route, or usable teacher control. Do not mark the IM3 pilot complete until those production paths and the listed tests exist.

### Implementation resolution

The exact graph pilot now checks the current node and blueprint before the production evidence mutation runs. The real catalog remains draft. The ordinary student path therefore fails closed.

A student Worked acknowledgement no longer becomes `teacher_led` evidence. The teacher student page now reads server-scoped candidates. The query requires the current published graph records, an approved exact Worked activity, a teacher-owned active class, an active enrollment, and the assigned Module 1 Lesson 1 source. It rejects source submissions that predate enrollment or assignment.

The teacher form shows the class, student, lesson, stored response, server grade state, and submission time. It sends opaque identifiers to an authenticated teacher route. It keeps the same idempotency key after an ambiguous failure. It locks the selection during a request.

The attestation mutation rechecks all authorization and source facts. It adds a distinct `teacher_led` row for the source submission. It preserves the student history row. Same-source replay returns the existing teacher row.

Focused verification passed with 318 tests. IM3 lint, standalone TypeScript, and the application build passed. The broader `learningEvidence-submission-authority.red.test.ts` suite still has two obsolete graph seed-2 expectations. Those fixtures treat a synthetic Worked event as trusted exposure. They must use a teacher-attested fixture before this broader suite is green.

### Published lesson attachment and real-flow resolution

The teacher boundary now verifies the activity placement in the assigned lesson. It loads the latest published lesson version. It requires a `worked_example` phase. That phase must contain an activity section with the exact physical activity ID and `graphing-explorer` component key.

A detached approved activity cannot become a candidate. A phase in a draft lesson version cannot become a candidate. The attestation mutation repeats the same checks and rejects both cases.

The positive backend fixture no longer preloads teacher history. It starts with the stored student Worked acknowledgement. That acknowledgement produces no teacher evidence. The teacher mutation then creates the trusted same-node attestation. A later Independent server grade passes through `createIm3SubmissionLearningEvidenceHandler`. The canonical evaluator marks that grade eligible and mastery-bearing. The stored grade remains incorrect in the fixture, which proves that eligibility does not change correctness and that an eligible incorrect review can reach the SRS bridge.

The complete focused set passed 442 tests. IM3 lint, standalone TypeScript, and the application build passed.

The real catalog remains draft. Production access stays closed until curriculum and activity review approve the exact graph pilot records.
