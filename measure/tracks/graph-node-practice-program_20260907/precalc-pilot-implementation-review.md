# Precalculus Pilot Implementation Review

Date: 2026-09-07

## Review boundary

This review checks only this selected node:

`math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs`

The review traces the source, graph, blueprint, generator, generated activities, shared renderer, student clients, server grading, and learning-evidence path. It does not use the current generator count as a completion claim. The other current Precalculus correction-track changes remain outside this review.

## Source and identity

The node, source example, support edge, and blueprint use the selected exact identity. The blueprint source is `math.precalc.example.1.1.002`. The primary reference is `apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=5`.

The stored Example 2 text asks for increasing intervals and gives `[0,3]` and `[7,9]`. The graph itself also shows a decreasing interval `[3,7]` and no constant interval. The Topic 1.1 source notes define increasing, decreasing, and constant behavior as the complete capability. Thus, the selected source supports graph interval classification, but the current Worked presentation states only one of the three required classifications.

The node, source example, support edge, and blueprint are draft. `independentPracticeReady: true` does not approve them. The runtime must not infer approval from that flag.

## Current mode behavior

### Worked Example

The Worked blueprint and generated activity ask only for increasing intervals. The steps observe that the graph falls from `x=3` to `x=7`, but the target, final answer, title, and explanation omit decreasing and constant classifications.

This is incomplete first exposure for the selected node. The exact answer must state:

- Increasing: `[0,3]` and `[7,9]`
- Decreasing: `[3,7]`
- Constant: `none`

The renderer can already show these facts in `steps` and `finalAnswer`. No new Worked component is necessary.

### Guided Practice

Guided Practice asks for all three fields. Its ordered steps and field help give useful guidance. The browser does not receive expected answers.

The shared activity has no hint or reveal interaction. It records no assistance count. The blueprint `hints` and `revealPolicy` do not reach the current `rendererProps`. The generated activity is marked SRS eligible. The current evidence path can therefore treat Guided work as mastery-bearing without server-owned assistance data.

Keep Guided Practice non-mastery-bearing until the runtime records assistance through an enforceable server-owned policy. A browser counter alone must not authorize evidence. If the pilot requires Guided mastery evidence, add the minimum hint interaction and store its assistance result in the canonical submission.

### Independent Practice

Independent Practice asks for all three fields. Its public props contain only the prompt, graph data, mode, domain, and change points. They do not contain `expectedAnswer`, solution steps, or interval answers. The server reads the stored seed and calls `gradeTopic11IntervalGraph`. The client cannot submit a score or expected answer through the accepted envelope.

This private-answer and server-grading boundary is correct.

The current generator always creates an increase-decrease-increase graph. `constantIntervals` is always empty. The schema also rejects every other segment pattern. Thus, Independent Practice never assesses recognition of an actual constant segment. It only assesses entry of `none`.

## Runtime and approval blockers

### P0: Draft content is active without an activity approval check

The dashboard always renders the Worked, Guided, and Independent pilot clients. The seed creates the three activity rows without approval. `createServerOwnedSubmission` checks the stable ID and component key, but it does not require `activity.approval.status === "approved"`. It also does not bind the stored activity to the exact node through a server-owned node field.

This bypasses the current draft graph state and independent activity review. Add a fail-closed activity approval check. Keep the seed unapproved. Clear approval when the seed changes reviewed props, seed, grading configuration, node identity, mode, or component identity.

### P0: Worked first exposure is incomplete

The learner sees only the increasing answer before Guided Practice. The selected node includes increasing, decreasing, and constant classification. Update the one Worked blueprint and its one generated activity row to show all three classifications.

### P1: Constant behavior has no positive variant

The generator type fixes two increasing intervals, one decreasing interval, and zero constant intervals. The schema fixes the same shape with `first.y < second.y > third.y < fourth.y`.

Add a bounded deterministic variant pattern with one constant segment. Keep three segments and the existing three answer parts. Update the schema to validate the segment labels that the generator emits instead of requiring only increase-decrease-increase. Cover at least one seed with a real constant interval and one seed with `constant: none`.

### P1: Guided assistance cannot be enforced

The current static guidance is useful. It is always visible and has no assistance event. The evidence policy cannot distinguish a clean Guided attempt from an assisted attempt.

The minimum safe correction is to exclude Guided Practice from mastery-bearing evidence. Independent Practice can remain eligible after approval and correct server grading. A later bounded hint control can enable a richer Guided evidence policy.

## Exact bounded patch

The minimum pilot patch is:

1. Update only the selected blueprint Worked specification. Include all three classifications in the prompt, target, steps, explanation, title, and final answer.
2. Update only the selected three generated activity rows. Keep exact stable IDs, source node, renderer, and grading parts.
3. Add one constant-segment generator family within `topic11-interval-graph`. Keep the current three-part grader.
4. Relax only the interval-classification segment-shape refinement that currently requires increase-decrease-increase. Keep finite points, ordered change points, and exact domain checks.
5. Require current approved activity state and exact node identity in both submission and evidence entry points.
6. Keep Worked non-SRS. Keep Guided non-mastery-bearing while assistance is not server-owned. Permit Independent evidence only after activity approval and a correct server grade.
7. Keep Independent public props free of expected intervals and solution steps.

Focused tests must prove:

- Worked displays increasing, decreasing, and constant results.
- A constant-segment seed produces and grades a non-empty constant interval.
- A no-constant seed still accepts `none`.
- Guided and Independent props contain no answer authority.
- The server rejects an unapproved or wrong-node activity before storage.
- Guided work does not create mastery-bearing evidence under the current assistance model.
- Correct approved Independent work creates exact-node evidence.
- Wrong Independent work remains a stored grade without mastery evidence.
- Identical replay returns the original server result.
- Changed replay data conflicts.

## Baseline distinction

The current Precalculus tree contains many changes from the existing remediation track. The presence of registered generators or generated activity rows does not prove this pilot is approved or complete. This review finds one viable server grader and one safe Independent public projection. It also finds incomplete Worked instruction, no positive constant variant, and an open approval boundary.

## Independent teacher-first production review

Date: 2026-09-07

This review traces the current Topic 1.1 Worked action, its route, its source submission, and its learning-evidence consumer. It also checks the Guided and Independent submission callback.

### P0: A student acknowledgement creates teacher-led exposure

`PrecalculusTopic11DailyCurriculumPilot` runs in the student interface. The learner selects `Mark worked example reviewed`. The component creates the correct interval strings from `generateTopic11IntervalGraph(0)`. It sends those strings to `/api/activities/precalculus-topic-1-1/submissions`.

The route requires a student session. It creates an ungraded Worked submission for that same learner. It then calls `submitTopic11TeacherSubmission`. The consumer changes this student-generated acknowledgement into evidence with `origin: teacher_led`. That evidence sets the learner's exposure state to `introduced`.

No teacher authenticates this action. No teacher owns or verifies the submission. No class, enrollment, lesson delivery, or teacher attestation is present. The stored activity field `props.source: teacher_led` is static metadata. It does not prove a teacher action.

This behavior violates the teacher-first contract in `learning-evidence.ts`. That contract requires accepted teacher exposure before Mastery Advantage evidence can enter the mastery bridge. A learner can currently create that exposure by selecting one button.

Stop the route from calling `submitTopic11TeacherSubmission` for a student acknowledgement. Keep the Worked acknowledgement as non-mastery history if the product needs it. Create `teacher_led` evidence only through an authenticated teacher-owned source event. Apply the same rule to the other Precalculus Worked routes that use this producer pattern.

### P0: The Worked source path bypasses current publication

The current node and blueprint are draft. All three projected activities have `srsEligible: false`.

The dashboard hides Topic 1.1 through `getApprovedPrecalculusPilot`. That query correctly requires approved graph content and approved stored activities. The lesson page renders `PrecalculusTopic11DailyCurriculumPilot` directly when a lesson section has its component key.

`createTopic11DailySubmission` does not call `isPrecalculusPilotPublished`. It does not require activity approval. `submitTopic11TeacherSubmission` also omits both checks. Therefore, the lesson route can create source submissions and teacher-led exposure while the canonical node and blueprint are draft.

Require current node and blueprint publication at both write boundaries. Require the exact stored Worked activity approval. Keep the route inactive while the current catalog is draft.

### P1: The Worked submission does not contain learner work

The Worked component sends generator-derived correct answers. The learner does not enter or select these answers. The submission status is `submitted`, and its parts look like learner responses.

Store an explicit acknowledgement event if review completion is useful. Do not store generated correct answers as raw learner answers. This distinction protects later reporting and evidence analysis.

### Submission and retry behavior that is correct

The Topic 1.1 Worked component waits for the route response before it shows success. It keeps the same idempotency key after an error. A retry can replay the source submission. The evidence consumer derives its idempotency key from the opaque submission ID. This prevents a second evidence row for an identical replay.

`PrecalculusMasteryAdvantagePilot` also waits for source submission storage and evidence delivery. If source storage succeeds and evidence delivery fails, it keeps the opaque submission ID. Its retry sends only that ID to the evidence route. It does not create a second graded submission. These callback and retry boundaries are correct.

### Test result and missing assertion

The focused run passed 34 tests in the Topic 1.1 route, Worked refresh, and Mastery Advantage component files.

The current route acceptance test explicitly expects the student route to produce `teacher_led` evidence. This test codifies the defect. Replace it with an assertion that student acknowledgement cannot create teacher-led exposure. Add draft node, draft blueprint, and unapproved activity rejection tests for the Worked route and both Convex consumers.

## Topic 1.1 recovery resolution

Date: 2026-09-07

The student Worked action now stores an empty acknowledgement. It does not store generated learner answers. It does not create `teacher_led` evidence.

The source writer and teacher consumer require current node and blueprint publication. They also require approved exact activity identity. The teacher course action verifies teacher ownership, active enrollment, assigned Topic 1.1 lesson, source ownership, and event order. Enrollment and lesson assignment must occur before the acknowledgement.

An approved-fixture test proves acknowledgement, trusted teacher attestation, replay, and the change from `awaiting_teacher_exposure` to eligible Independent evidence. Negative tests cover the wrong teacher, wrong class, inactive enrollment, missing assignment, late enrollment, and late assignment.

The focused run passed 37 tests. TypeScript and scoped Oxlint passed. The other Precalculus Worked paths remain outside this recovery.
