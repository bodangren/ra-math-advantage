# Precalculus Q18 evidence integration plan review

Reviewer: `graph_inventory`
Date: 2026-09-08

## Result

Revise the plan before implementation. The opaque submission boundary and one-mutation design are correct. Five contract corrections are necessary.

## Required corrections

### P1 — Define the teacher-exposure time rule correctly

`evaluateLearningEvidenceV1` requires teacher-led evidence for the same node with `teacher.occurredAt <= practice.occurredAt`. A teacher action that occurs after a Guided or Independent submission cannot qualify that submission when the teacher evidence uses the action time.

The pending Topic 1.1 teacher function uses the learner's Worked acknowledgement time as `occurredAt`. A later teacher attestation can therefore qualify an earlier practice submission only when the verified Worked source time is at or before the practice time. The plan must state this condition.

Add both cases:

- A later teacher action verifies a Worked source event that occurred before the practice submission. A retry can become eligible.
- Teacher evidence has an occurrence time after the practice submission. The old submission stays ineligible. The learner must make a fresh submission.

Do not describe all later teacher actions as retroactive exposure.

### P1 — The trusted teacher producer is a separate prerequisite

HEAD contains `apps/pre-calculus/convex/learning-evidence.ts`. Extend this committed hyphenated module for the selected consumer. Do not replace it with the pending camel-case `learningEvidence.ts` file.

HEAD does not contain the selected teacher action, teacher course route, teacher form, or course projection. These items exist only in the pending main worktree. The plan must not describe them as a committed existing producer.

Integrate and verify the selected teacher path as a separate prerequisite. It includes:

- the learner-owned Topic 1.1 Worked acknowledgement writer,
- `submitTopic11TeacherSubmission`,
- the authenticated teacher course route,
- the class and learner selection user interface,
- the durable confirmed projection.

The pending function at `apps/pre-calculus/convex/learningEvidence.ts:2838-2944` has a bounded-read defect. It calls `take(20)` on lesson versions without descending order. It then selects the largest version only from those rows. It also limits phases to 20 and sections to 50. A valid latest published source can be outside these slices. The prerequisite must use the current canonical lesson-version lookup and a source lookup that cannot silently classify a truncated result as absent.

The teacher action must retain its active teacher and learner credentials, organization, class ownership, active enrollment, assignment, source-time, source identity, and publication checks. A student acknowledgement must never create `teacher_led` evidence by itself.

### P1 — Authenticate the active learner before receipt replay

The plan says to validate the learner ID before the receipt lookup. An ID shape check is insufficient. The internal mutation must load the profile and active credential first. It must verify profile ID, username, role, and organization consistency. Only then can it return a stored receipt.

This rule prevents a disabled or mismatched account from replaying an evidence receipt. Add disabled-credential and credential-profile mismatch replay tests.

### Superseded — use ungraded Guided participation evidence

The corrected repository plan resolves the initial ambiguity. Build Guided learning evidence without `gradedEvidence`. Preserve the server grade in the physical submission only. After valid exposure, the shared evaluator returns `ungraded_evidence` with `masteryBearing: false`. Persist this participation evidence. Do not update SRS.

Use graded evidence only for Independent practice. Do not implement the earlier alternative that persisted graded Guided evidence and suppressed its effects outside the evaluator.

### P2 — A Convex index is not a uniqueness constraint

`by_learner_and_submission_id` is an ordinary Convex index. It does not enforce uniqueness in the schema. The implementation can use `.unique()` to fail when damaged data contains duplicates. A mutation that reads the indexed range and then inserts is protected by Convex transaction conflict detection and retry behavior. State this behavior accurately.

Use the compound index for the receipt lookup. Test duplicate stored receipts as a fail-closed condition. Test the create race through `convex-test` or an equivalent real Convex transaction test. A memory store cannot prove transaction conflict behavior.

## Additional plan corrections

- HEAD has a generic client-authored evidence route, library runtime, and the committed `apps/pre-calculus/convex/learning-evidence.ts` module. Replace the route request contract. Extend the existing hyphenated Convex module with the selected consumer. Do not copy the large pending camel-case module.
- Query node history without excluding `teacher_led` rows. The evaluator must receive teacher evidence for the selected node. A same-activity or same-origin history filter would make teacher-first evaluation fail.
- Keep an awaiting decision receipt-free only when a later valid state change can alter the result. Do not write evidence or SRS for this result.
- Define an attempt conflict precisely. A new physical submission with a higher valid ordinal is a new attempt. It must not conflict with the earlier submission key. A stale or duplicate ordinal for the same selected activity must fail before effects.
- Type the receipt fields and decision in the Convex schema. Do not store an unrestricted decision object.
- Keep the existing fingerprint field unchanged. Compute it from the canonical server-owned evidence. Do not use it as the receipt identity.

## Accepted plan parts

- The browser sends only an opaque physical submission ID.
- The route derives learner identity from the session.
- The writer-owned physical submission supplies answers, grades, assistance, mode, ordinal, and time.
- A valid receipt replay occurs before current publication checks and causes no new effects.
- A new evidence transaction requires current selected publication and exact physical activity approval.
- Evidence, SRS, and receipt writes occur in one Convex mutation. A thrown operation rolls back the mutation.
- Evidence without its required receipt fails closed. It must not synthesize a receipt or repeat SRS.
- Incorrect Independent work remains evidence. The server-owned grade and assistance determine the SRS rating.

## Corrected repository plan comparison

The parent draft at `measure/tracks/graph-node-practice-program_20260907/precalc-selected-evidence-integration-plan.md` resolves the findings in this review.

It states the event-time rule correctly. It separates the uncommitted teacher producer and user interface as prerequisites. It requires active credential validation before receipt replay. It distinguishes an indexed lookup from a database uniqueness constraint. It also requires transactional rollback and concurrent-delivery tests.

The Guided policy is now coherent with the shared evaluator. The evidence consumer can omit `gradedEvidence` from Guided learning evidence, preserve the grade only in the physical submission, persist the resulting `ungraded_evidence` decision after exposure, and skip SRS. Independent evidence remains graded and can update SRS.

The corrected repository plan is ready to guide the bounded implementation. The implementation must still repair and verify the pending teacher producer's bounded latest-version and source-section lookup before it can serve as the trusted exposure prerequisite.
