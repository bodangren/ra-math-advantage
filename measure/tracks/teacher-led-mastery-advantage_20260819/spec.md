# Specification: Teacher-Led First Exposure and Mastery Advantage Pilots

## Overview

Establish a course-independent evidence seam so each learner's first exposure to
every mastery-bearing graph node is teacher-led, while Mastery Advantage remains
a supplementary KST+SRS progression path after that exposure. The contract is
general for later graph-wide adoption, but this track is deliberately bounded to
exactly one pilot node in each of Integrated Math 3 (IM3), AP Precalculus, and
Business Math 2 (BM2).

This track does not redefine KST mastery mathematics or FSRS scheduling. It
defines which evidence may reach those systems and proves the sequencing policy
through one end-to-end node per app.

## Terminology

- **Graph node:** A mastery-bearing `skill` node eligible for KST/SRS. Structural
  domain, module, lesson, standard, and worked-example nodes are not mastery
  targets for this policy.
- **Teacher-led exposure:** The learner encounters a node through instruction
  controlled by a teacher. It marks the node as introduced, not mastered.
- **Mastery Advantage:** The supplementary guided, independent, assessment, and
  spaced-review progression driven by the repository's KST+SRS packages.
- **Introduced:** At least one accepted `teacher_led` evidence event exists for
  the learner and node.
- **Mastery-bearing evidence:** Graded evidence that is permitted to update KST
  learner state or SRS card state. Only eligible `mastery_advantage` evidence can
  be mastery-bearing.

## Pilot Boundary

The pilot manifest must contain exactly these three node IDs and no implicit
prerequisite, equivalent, or neighboring nodes:

| Lane | App | Pilot node | Source status |
|------|-----|------------|---------------|
| 1 — Shared Contract + IM3 | Integrated Math 3 | `math.im3.skill.1.1.graph-quadratic-functions` | Existing graph node with an existing deterministic generator |
| 2 — AP Precalculus | AP Precalculus | `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs` | Existing graph node |
| 3 — BM2 | Business Math 2 | `math.bm2.skill.1.1.apply-accounting-equation` | New app-owned pilot node derived from Unit 1 Lesson 1 (`A = L + E`) |

The shared behavior is designed for every mastery-bearing node, but expansion
beyond these three IDs requires a separate approved track.

## Shared Contract: `learning-evidence.v1`

The canonical shared package must expose a strict schema and inferred type with
the following envelope. The authenticated app persistence boundary supplies the
learner identity and app/course scope; they are not duplicated in the evidence
payload.

| Field | Requirement |
|-------|-------------|
| `contractVersion` | Required literal `learning-evidence.v1` |
| `nodeId` | Required non-empty canonical graph node ID |
| `activityId` | Required non-empty stable activity ID |
| `attemptOrdinal` | Required positive integer, scoped per learner + node + activity + origin; retries do not increment it |
| `origin` | Required enum: `teacher_led` or `mastery_advantage` |
| `mode` | Required `practice.v1` mode: `worked_example`, `guided_practice`, `independent_practice`, `assessment`, or `teaching` |
| `occurredAt` | Required valid ISO-8601 UTC event timestamp; storage adapters may convert it to an app-native numeric timestamp |
| `gradedEvidence` | Optional object containing `isCorrect?: boolean`, `score?: number`, and `maxScore?: number`; at least one outcome must be present, `score` and `maxScore` are paired, and `0 <= score <= maxScore` |
| `idempotencyKey` | Required non-empty opaque key, unique in the learner's evidence store |

Raw learner answers are not part of `learning-evidence.v1`. They remain in the
existing `practice.v1` submission record and may be joined by `activityId` and
attempt context where authorized.

### Idempotency and ordering

1. Replaying the same normalized payload with the same `idempotencyKey` returns
   the original logical result and creates no duplicate evidence, mastery update,
   or SRS transition.
2. Reusing an `idempotencyKey` with a different normalized payload is rejected.
3. `occurredAt` is the event time, not ingestion time. A Mastery Advantage event
   is eligible only when an accepted teacher-led event for the same learner and
   node occurred at or before it.
4. `attemptOrdinal` is monotonic within its scope. Duplicate delivery preserves
   the original ordinal; concurrent conflicting ordinals are rejected or
   deterministically serialized by the app adapter.

## Sequencing and Mastery Policy

### Teacher-led origin

An accepted event with `origin: teacher_led` may transition a node from
`awaiting_teacher_exposure` to `introduced`. It must not:

- create a proficiency observation;
- change KST mastery probability, mastery state, readiness, or outer fringe;
- create, rate, schedule, reschedule, or advance an SRS card;
- increment mastery-bearing attempt counts; or
- award mastery when `gradedEvidence` is present.

Teacher-led graded evidence may remain available for teacher reporting, but the
KST/SRS bridge must ignore it for mastery.

### Mastery Advantage origin

Mastery Advantage may offer or process a node only after prior teacher-led
exposure for that learner and node. Before exposure, the planner/adapter returns
an explicit `awaiting_teacher_exposure` ineligibility reason and performs no KST
or SRS write. After exposure:

- ungraded Mastery Advantage evidence is telemetry only;
- graded Mastery Advantage evidence may enter the existing KST evidence and SRS
  rating/scheduling pipeline; and
- the existing KST+SRS algorithms remain authoritative for progression.

## Functional Requirements

1. **FR-1 — Shared versioned evidence:** Define and export
   `learning-evidence.v1` once from a domain-neutral shared package, with the
   exact required fields and validation semantics above.
2. **FR-2 — Teacher-first gate:** For each learner/node pair, reject or withhold
   Mastery Advantage progression until accepted teacher-led exposure exists.
3. **FR-3 — No teacher-awarded mastery:** Ensure `teacher_led` evidence cannot
   mutate KST mastery or SRS state, including when it carries graded evidence.
4. **FR-4 — Supplementary progression:** After exposure, allow graded
   `mastery_advantage` evidence to flow through the existing KST+SRS bridge.
5. **FR-5 — Replay safety:** Enforce idempotency, conflict detection, timestamp
   ordering, and attempt-ordinal semantics at shared and app persistence seams.
6. **FR-6 — Three app adapters:** Map IM3, Precalculus, and BM2 activity/submission
   data to the shared contract without app imports from shared packages.
7. **FR-7 — Exact pilot bounds:** Enable only the three manifest node IDs. Tests
   must fail if a fourth node becomes eligible in this track.
8. **FR-8 — Observable decisions:** Expose deterministic eligibility/rejection
   reasons suitable for tests and authorized diagnostics without logging raw
   answers or sensitive learner data.
9. **FR-9 — Existing-contract compatibility:** Preserve `practice.v1`, the v3.2
   KST/SRS contract surfaces, and each app's authenticated persistence model.

## Non-Functional Requirements

- Shared code remains domain-neutral and imports no app code or
  `convex/_generated` modules.
- Contract logic is pure and deterministic; app-specific persistence and auth
  stay in app adapters.
- ISO contract timestamps and numeric Convex timestamps are bridged explicitly;
  neither representation silently changes the shared contract.
- Evidence writes and downstream effects are transactionally idempotent or use
  an equivalent tested exactly-once logical guarantee.
- Focused new-code coverage targets at least 80%, with behavioral tests rather
  than source-presence assertions.
- No dependency or package-manifest changes occur without the repository's
  required explicit approval.

## Dependencies and Coordination

- The IM3 lane must target the post-migration v3.2 interfaces owned by
  `kst-srs-v3-2-im3-runtime-migration_20260710`. Contract and Red tests may be
  prepared in parallel, but overlapping IM3 runtime files require a boundary
  review before implementation.
- `live-classroom-presentation_20260703` owns real-time lesson synchronization.
  This track owns evidence and eligibility semantics and must not absorb live
  session transport, presenter controls, or annotation scope.
- The existing `practice.v1` contract remains the source for `mode` and activity
  submission semantics.

## Acceptance Criteria

1. The shared schema accepts every valid required field, rejects malformed
   values, and round-trips all five `practice.v1` modes.
2. A first valid teacher-led event marks each pilot node introduced exactly once.
3. Teacher-led evidence leaves all KST mastery and SRS card state byte-equivalent
   before versus after processing, even when `gradedEvidence` is correct/full
   score.
4. Mastery Advantage is ineligible before exposure with the deterministic reason
   `awaiting_teacher_exposure` and creates no KST/SRS writes.
5. After exposure, one graded Mastery Advantage attempt per pilot can traverse
   the existing KST+SRS progression path.
6. Same-key retries create one logical evidence record and one downstream effect;
   same-key/different-payload conflicts are rejected.
7. Pilot-conformance tests prove exactly one enabled node in each app and exactly
   three enabled node IDs repository-wide for this track.
8. Focused tests, lint, relevant app/package typechecks, builds, generated-doc
   freshness, boundary checks, and Measure Doctor pass or expose only explicitly
   documented pre-existing baselines without weakening gates.

## Out of Scope

- Enabling every graph node or any node beyond the three pilot IDs.
- Changing mastery thresholds, evidence weighting, KST graph algorithms, FSRS
  parameters, calibration, placement, or transfer-credit policy.
- Full BM2 graph extraction or full Precalculus/IM3 runtime rollout.
- Live-classroom synchronization, teacher presentation UI, or annotations.
- Production deployment, broad backfill, or destructive schema narrowing.
- Treating teacher-led grades as mastery evidence.
