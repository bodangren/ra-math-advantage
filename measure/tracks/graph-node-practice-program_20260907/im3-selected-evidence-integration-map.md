# IM3 Selected Evidence Integration Map

## Objective

This map defines the minimum `HEAD` integration for the selected quadratic node. It excludes the later Lesson 1.1 and Lesson 1.2 activity branches that are mixed into the current worktree.

The selected node is `math.im3.skill.1.1.graph-quadratic-functions`. Its Worked, Guided, and Independent stable activity IDs already exist in `HEAD`.

## Functions already in HEAD

The following prerequisites are committed:

- `lib/practice/learning-evidence-pilot.ts` contains the selected node and three stable activity IDs. It contains the one-node teacher-first evaluator adapter.
- `convex/activities.ts` contains the selected server-owned writer and the strict Worked acknowledgement writer.
- `lib/activities/server-grading.ts` contains selected quadratic server grading.
- `convex/seed/seed_lesson_1_1.ts` contains the three selected physical activities and lesson links. Seed state stays unreviewed and SRS-disabled.
- `lib/srs/convexCardStore.ts` and `lib/srs/convexReviewLogStore.ts` implement the existing SRS stores.
- `SubmissionSrsAdapter` and the SRS v3.2 rating mapper exist in the shared package.
- The current `srs_cards` and `srs_review_log` schema and indexes are sufficient. The pending `by_student_objective_and_variant` index is not required for this selected slice.

## Minimum contract change

Change `lib/practice/learning-evidence-pilot.ts` only as follows:

- Add `IM3_LEARNING_EVIDENCE_CONTRACT_VERSION`.
- Add the optional history filters for activity, origin, and occurrence time.
- Let the store append operation accept an optional physical submission ID and return its row ID.
- Pass the history filters from the existing adapter.

Keep `IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS` as the single selected node. Do not copy the pending constants, mappings, or enabled nodes for later capabilities.

## Minimum schema change

Change `convex/schema.ts` only as follows:

- Add optional `submissionId` to `learning_evidence`. It must remain optional for historical rows.
- Add `by_learner_node_origin_occurred_at`.
- Add `by_learner_node_activity_origin_attempt`.
- Add `by_learner_and_submission_id`.
- Add `learning_evidence_receipts` with the current decision fields and `by_learner_and_submission_id`.

The existing `activity_submissions` fields are already in `HEAD`. Do not include their formatting-only reorder. Do not remove the existing required `fingerprint` field. The current mixed implementation removes it. The selected evidence store must continue to populate it with the existing `learningEvidenceFingerprintV1` function.

Do not include pending login, practice-test, SRS-card, or unrelated schema changes.

## Minimum learningEvidence implementation

Rebuild `convex/learningEvidence.ts` from `HEAD`. Do not copy the current 3,000-line file.

The selected slice needs these groups:

1. Publication boundary
   - `Im3GraphPilotPublication`
   - `isIm3GraphPilotPublished`
   - current node and blueprint JSON imports

2. Stored submission boundary
   - `Im3ActivitySubmission`
   - `storedTimestampToIso`
   - one strict selected Worked predicate
   - one strict selected Guided and Independent predicate
   - `buildIm3StoredEvidence` for the three selected IDs only
   - physical learner, activity, node, component, mode, ordinal, timestamp, answer, part, artifact, score, and maximum checks

3. Receipt-first evidence transaction
   - `Im3SubmissionReceipt` and store interfaces
   - `highestAttemptOrdinal`
   - `createIm3SubmissionLearningEvidenceHandler`
   - Convex evidence and receipt stores
   - `createIm3ServerOwnedSubmissionHandler`
   - `submitIm3PublishedEvidenceHandler`
   - registered `submit` mutation

4. Selected SRS bridge
   - reload the physical submission by `submissionId`
   - verify the aggregate grade against the stored graded parts
   - rebuild the envelope from authoritative stored parts and timing
   - pass v3.2 rating input to `SubmissionSrsAdapter`
   - keep one or two hints at `Good` and three or more hints at `Hard`
   - keep unsupported selected reveal telemetry rejected at the writer boundary
   - use only the selected Guided and Independent resolver branches

5. Teacher attestation
   - `isExactIm3GraphWorkedAcknowledgement`
   - exact Worked props and grading configuration
   - published lesson activity lookup
   - class, teacher, learner, organization, enrollment, assignment, and timestamp checks
   - candidate query and teacher mutation
   - replay checks against the physical source

Exclude every equation-rate, domain-range, maximum-reading, symmetry, solution-count, comparison, and profit-model helper. Exclude their imports and resolver branches.

## Required application routes

Add the current selected-only routes:

- `app/api/learning-evidence/im3-pilot/route.ts`
- `app/api/teacher/graph-exposure/route.ts`

The first route accepts only an authenticated learner and an opaque physical submission ID. The second route accepts only a teacher session, class ID, learner ID, physical Worked submission ID, and idempotency key.

The pending selected activity creation client calls the evidence route after a Guided or Independent create. The Q12 Worked client must remain create-only. It must not call the evidence route.

## Teacher user interface dependency

The backend teacher candidate query and mutation are not sufficient for a usable teacher action. The current worktree adds `components/teacher/Im3GraphExposureForm.tsx` and changes `app/teacher/students/page.tsx`.

Extract only the selected candidate list and form placement. Preserve all unrelated teacher-page changes. The form must send the server-derived class, learner, and submission IDs to the teacher route. The server must revalidate all hidden IDs.

This user interface can be a second commit after the backend slice. The backend commit must still include its route and behavior tests.

## Integration order

1. Add the minimum pilot store contract and evidence contract constant.
2. Add only the evidence schema fields, indexes, and receipt table.
3. Add the selected-only stored submission and receipt transaction.
4. Add the selected SRS adapter bridge and authoritative grade-part parity.
5. Add the selected teacher candidate and attestation handlers.
6. Add the learner and teacher routes.
7. Add the teacher candidate form and page placement.
8. Regenerate Convex types only after the final schema and function set is stable.

Each step must keep the graph publication fail closed. Tests can pass an approved publication fixture. Production must use the current catalog state.

## Minimum tests

Use these current tests as extraction sources. Remove cases for later nodes before the selected integration commit.

- `learningEvidence-production-factory.red.test.ts`
- the selected cases from `learningEvidence-submission-authority.red.test.ts`
- `im3-graph-real-production-flow.test.ts`
- `im3-graph-teacher-exposure.test.ts`
- `im3-guided-assisted-evidence.test.ts`
- `app/api/learning-evidence/im3-pilot/route.test.ts`
- `app/api/teacher/graph-exposure-route.test.ts`
- the selected cases from `lib/activities/submission-progress-authority.test.ts`

The required behavior set is:

- draft publication rejects without evidence or SRS writes;
- a foreign physical submission returns the same result as a missing submission;
- a strict Worked acknowledgement stays non-mastery evidence;
- an explicit verified teacher action creates one replay-safe teacher event;
- Guided and Independent evidence before teacher exposure do not update SRS;
- evidence after teacher exposure uses the stored server grade;
- stored part and aggregate mismatches create no SRS state;
- two hints cap at `Good`;
- three hints cap at `Hard`;
- identical replay keeps one evidence receipt, one evidence event, one SRS card, and one review log;
- route tests reject forged learner identity and extra body fields.

Run the focused tests first. Then run app lint, `npx tsc --noEmit`, and the app build.

## Main risk

The current mixed `learningEvidence.ts` is structured around all pending IM3 capabilities. A line-range extraction will retain hidden imports and resolver branches. A selected-only rebuild from `HEAD` is safer and smaller.

The current mixed `lib/practice/learning-evidence-pilot.ts` expands the enabled-node allow-list. Do not include that expansion in this commit. It would activate evidence policy for uncommitted activities.

No curriculum approval belongs in this integration. The production path must continue to return `unpublished_curriculum` while the selected node or blueprint is not approved.

## Integration owner contract check

The owner checked the existing HEAD schema and serializer. `learning_evidence.fingerprint` is already required. `learningEvidenceFingerprintV1` serializes the normalized learning-evidence fields with `JSON.stringify`. It does not compute a cryptographic hash. The selected patch must preserve this exact existing contract without adding fields or expanding its input.

Q12 caller and lookup integration is committed as `be52b841`. Preserve that code when the evidence writer guard is integrated. The teacher predicate must also enforce the existing eight-field Worked acknowledgement contract. Two main regressions proved that unsupported artifact and timing fields previously passed teacher attestation.
