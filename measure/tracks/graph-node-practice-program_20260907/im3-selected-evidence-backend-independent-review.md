# IM3 Selected Evidence Backend Independent Review

## Scope

This review covers `/tmp/im3-selected-evidence-backend-head.patch`. It covers only `math.im3.skill.1.1.graph-quadratic-functions`. It compares the patch with the committed integration map and the selected teacher user interface patch. It does not approve the draft curriculum.

## Blocking findings

### 1. The final evidence boundary does not require the current physical activity approval or mode

`submitIm3PublishedEvidenceHandler` checks the current node and blueprint publication. It then sends the stored row to `exactSelected`.

The Guided and Independent branch of `exactSelected` checks the stable activity ID, node ID, component, SRS flag, submission mode, and stored grade shape. It does not check `activity.learningEvidenceMode`. It does not load or check `activity.approval.status`.

Thus, a stored Guided or Independent submission can still create evidence and update the spaced repetition system (SRS) after the physical activity approval is withdrawn. It can also pass when the physical activity mode no longer matches the stored submission mode. The original create writer checks physical approval. That earlier check does not establish current publication at the later evidence mutation.

This is a blocking integration defect. Require the exact current physical approval and exact mode in the selected evidence consumer. Add regressions that create a valid stored submission, then change the activity approval or mode before evidence delivery. Both cases must produce no evidence, receipt, SRS card, or review log.

### 2. The final evidence boundary does not require the current reviewed grading content

The selected create writer grades from `activity.props` and `activity.gradingConfig`. The evidence consumer later reloads the activity but omits `gradingConfig` from `Im3ActivitySubmission`. Its Guided and Independent identity check does not compare the current props or rubric with the selected seed contract.

Thus, a valid old stored grade can enter the current evidence and SRS path after the same physical activity ID is changed to a different equation, response variant, part list, or rubric. The node and blueprint can remain approved during this change.

This conflicts with the selected source and private-grader identity boundary. Reuse the existing selected seed builders or the existing exact stored-activity comparison. Do not add a hash. Reject changed current content before any evidence or SRS write. Add one regression for changed equation or response variant and one for changed rubric.

## Other finding

The candidate query does not check `activity.stableActivityId` before it returns a teacher candidate. The mutation checks this field and rejects the action. A corrupted activity can therefore appear in the teacher interface but fail when the teacher submits it. Add the exact Worked stable ID to the candidate precondition. This defect does not permit a false teacher evidence write, but it produces an unusable candidate.

The selected evidence parser also relies on the create writer for `submissionData.contractVersion === "practice.v1"`. The final consumer should include this field in its stored identity check when it adds the current physical checks. This keeps corrupted stored rows fail closed.

## Verified behavior

The teacher mutation uses the authenticated teacher identity from the route. It requires a teacher-owned active class, an active student enrollment, the same organization, the assigned Lesson 1.1 source, and a source submission after enrollment and assignment. It validates the exact ungraded `f(x) = x^2` Worked acknowledgement. It stores a separate `teacher_led` event and preserves student history.

The teacher replay checks the canonical node, activity, mode, contract version, attempt ordinal, and source submission. A reused key for another source conflicts. The learner route accepts only an opaque physical submission ID and does not disclose a foreign learner row. The current graph publication check occurs before receipt replay, so a later node or blueprint withdrawal fails closed.

The canonical evaluator requires a same-learner, same-node teacher event that occurred before the graded event. A pre-exposure graded attempt stays ineligible. A later Guided or Independent attempt can become eligible. An eligible incorrect attempt still reaches SRS and can reduce the state. The stored aggregate grade must equal the two canonical part grades. The SRS bridge uses the stored server grade and stored hint counts. Unsupported reveal telemetry fails closed.

The evidence and receipt writes run in the same Convex mutation as the SRS bridge. A failed write rolls back the transaction. Receipt replay prevents a second evidence or SRS write. The patch uses the existing `learningEvidenceFingerprintV1` contract. It adds no fingerprint input.

## Teacher user interface compatibility

The backend candidate fields match the selected teacher user interface type. The teacher route returns `{ evidenceId, replay }`. The revised form requires a nonempty `evidenceId`, so malformed HTTP success responses do not remove a candidate. The form sends the exact class, learner, and submission identities with a durable idempotency key. It does not use the backend `response` string for display. The backend can keep that field for contract compatibility.

## Verification evidence

The isolated focused command discovered all 58 tests. Fifty-one passed. Seven stopped at `learningEvidenceFingerprintV1 is not a function` because the scratch `node_modules` link resolves `@math-platform/practice-core` to the current shared worktree instead of the isolated HEAD package source. This is the dependency-resolution limit recorded by the author. It is not a failure in the tested backend branch.

The author reports 58 passing focused tests when the selected package source is resolved. The parent reports a passing production build at `/tmp/im3-selected-evidence-parent-build.log`. The parent also reports that `tsconfig.parent-source-check.json` maps the practice-core imports to the scratch HEAD source and passes without excluding source files. The normal standalone TypeScript command has only the two shared-link fingerprint export errors after the build.

## Disposition

Do not integrate the patch until the current physical activity approval, mode, props, and grading checks are present at the final evidence boundary. Also add the stable activity ID to the candidate query. After these changes, repeat the focused flow tests with the isolated practice-core source and run lint, standalone TypeScript, and build.
