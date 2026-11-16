# IM3 Quadratic Formula local transaction verification scope

## Purpose

Verify the next frozen allocation candidate on a disposable local Convex instance before source integration. Start the local test only after parent structural review and focused checks pass. Independent final acceptance must include these local results. Use real Convex transactions. Do not use a memory database for the acceptance result.

Do not add the fixture to the production commit. After the backend freeze is accepted, use the active candidate at `/tmp/im3-lesson18-recovery-v6l3h06f`. Add one temporary local-only fixture file to that candidate. Record the fixture path and every generated-file change. Remove the fixture and reconcile all generated-file changes before source integration. Do not create another source copy or a Git worktree.

## Local environment

Use the cached backend at `/Users/daniel.bodanske/.cache/convex/binaries/precompiled-2026-08-25-7cce8fb/convex-local-backend`.

Bind the backend to an unused `127.0.0.1` port. Use a separate small `/tmp` directory for the SQLite file, storage, runner, logs, administrator key, and evidence. Refuse a non-loopback URL.

Remove `CONVEX_DEPLOYMENT` and `CONVEX_DEPLOY_KEY` from the runner environment. Set only `CONVEX_SELF_HOSTED_URL` and `CONVEX_SELF_HOSTED_ADMIN_KEY` for CLI calls. Store the local administrator key in a permission-restricted temporary file. Do not print the key. Do not contact or name a cloud deployment.

Push the frozen candidate source to this local instance. Use the full IM3 Convex module set and the current schema. Disable duplicate code generation only if the candidate already contains the matching generated files. Do not disable validation to bypass a module or schema error.

## Temporary fixture

Add one local-only Convex fixture module in the active candidate. Give every registered fixture function argument and return validators.

Create one organization and at least three student profiles. Create one active credential for each student. Keep the profile and credential identity fields exact. Use unique local usernames.

Call `upsertIm3QuadraticFormulaDrafts` with the real mutation context. Use the default committed graph publication. Do not change a graph review status, activity approval, SRS eligibility, lesson publication state, or draft status.

Read the Guided and Independent activity IDs by their exact stable IDs. Assert one activity for each mode. After the initial upsert, assert that each activity has only its canonical variant and item. No future suffix relation can exist before Start needs it.

Use the registered `activities:getQuadraticFormulaAttempt`, `activities:startQuadraticFormulaAttempt`, and `activities:createServerOwnedSubmission` functions for normal verification. These calls exercise the registered validators and the default draft graph authority.

The fixture can import `startQuadraticFormulaAttemptHandler` and `createServerOwnedSubmissionHandler` only for rollback wrappers. Each wrapper must call the real handler with the real mutation context. It must confirm the expected write in that transaction. It must then throw a fixed local-test error. Do not copy allocation or grading logic into the fixture.

Add internal administrator-only inspection functions for the exact synthetic local learners and activities. Confirm these eight effect tables in the current schema: `activities`, `practice_variants`, `practice_items`, `activity_submissions`, `learning_evidence`, `learning_evidence_receipts`, `srs_cards`, and `srs_review_log`.

Return full documents for the relevant activity, variant, item, and submission rows. Keep private variant metadata, `_id`, `_creationTime`, timestamps, retry keys, variant keys, ordinals, submission data, grades, and relation fields. Do not export profile, credential, password hash, password salt, session, or other secret records into evidence.

The installed Convex API supports `ctx.db.system.query("_scheduled_functions").collect()`. Use this exact system-table query in the local-only inspection function. Limit its use to the disposable local database. Capture the full scheduled-function documents before and after each rollback and zero-effect case.

Use stable JSON serialization for before-and-after comparisons. Compare the retained documents byte for byte after canonical key ordering. Do not remove `_creationTime` or another volatile field and call the result a full-byte comparison. If a separate summary omits a field for readability, label it as a partial comparison.

## Runner cases

Run independent CLI calls concurrently from a small runner process in the separate `/tmp` runtime directory. Capture stdout and stderr there. Redact the administrator key and all secret values.

1. Run two concurrent Start mutations for the same learner, activity, and mode. Both calls must return the same pending submission ID, retry key, variant props, and ordinal. Exactly one pending row can exist. Exactly one required relation can exist.

2. Prepare two different learners through the real canonical Start and finalization path. Run their next Start mutations concurrently. They must receive different pending submission IDs. They must receive the same suffix-one equation and mode. Inspection must show one shared suffix-one variant and one shared item tied to the fixed activity.

3. Submit the same pending row concurrently with the exact pending handle, retry key, and byte-identical practice.v1 body. One transaction can finalize the row. The other call must return the exact same receipt and grade as replay. Inspection must show one final row and no second submission.

4. Call a rollback wrapper for Start when the required later relation does not exist. The wrapper must call the real Start handler, verify that it created the relation and pending row inside the transaction, and then throw. Compare all effect-table snapshots before and after. They must be byte-equal.

5. Call a rollback wrapper for finalization. The wrapper must call the real writer handler, verify that the pending row became graded inside the transaction, and then throw. Compare all effect-table snapshots before and after. They must be byte-equal. The pending row must remain pending after rollback.

6. Finalize one attempt with a complete valid timing summary. Read it through the registered attempt query. Then Start the next attempt. This proves that valid optional practice.v1 metadata does not make a final row unreadable.

7. Advance one mode through all four scheduled variants. Verify canonical first use, the integer-root later variant, the repeated-root variant, and the complex-root variant. For the repeated-root final result, verify an empty `x2`, `x2.maxScore: 0`, and overall `maxScore: 2`.

8. Call Start after the fourth final attempt. It must return exhausted. Compare snapshots before and after. No row or relation can change.

9. Run `upsertIm3QuadraticFormulaDrafts` again after later allocations. Compare all existing activity, variant, and item records before and after. Their stored bytes must remain equal. The rerun must not add a missing future relation eagerly.

10. After each pending state and each draft finalization, assert zero new learning evidence, evidence receipts, SRS cards, SRS reviews, and scheduled work. The QF draft path must not set `masteryContractVersion`.

Use generator output only to prepare valid learner answers. Do not use generator output as the expected persistence oracle. Assert stored identity, state, relations, receipts, scores, and public response fields independently.

## Required evidence

Record the candidate baseline revision and exact reviewed patch, backend binary path, loopback URL, temporary database path, module push result, fixture seed result, and each runner result. Save the before and after rollback snapshots. Save relation and submission snapshots for both concurrency cases. Save the final reload, repeated-root, exhaustion, seed-rerun, and zero-effect results.

Record backend retry log excerpts that show an optimistic concurrency retry if the local backend emits them. Matching final state and one physical row remain the required proof if the log does not expose retry details.

Stop the disposable backend after evidence collection. Confirm that its loopback port is closed. Remove the temporary fixture from the candidate. Inspect and reconcile generated files against the accepted backend freeze. Keep the separate evidence directory until parent and independent review finish.

## Browser prerequisites

Browser verification is a separate later task. It requires the accepted backend and client batches in the active candidate. It also requires a disposable backend, a loopback frontend, local student sessions, and local lesson sections that reference the two draft QF activities.

The browser fixture must keep the activities unreviewed, the graph draft, and SRS eligibility false. It can create disposable local lesson, version, phase, and section rows so the real `LessonRenderer` receives the activities. It must not mutate draft approval or publish the activities as approved practice.

Browser checks must use the real explicit Start control, Guided check, final submission, reload, details retry, later Start, repeated-root view, and exhaustion view. They must verify no canonical static fallback. They must also verify that a new pending identity resets answers, locks, check state, cached request data, and timing.

Do not start the browser fixture until the backend transaction checks pass and the client integration is accepted.

## Review decision

The memory tests missed eager seed allocation and a storage serialization assumption. Real local verification therefore precedes the backend commit. The test can exercise an unaccepted frozen candidate. It does not approve source content or permit a cloud deployment. Prepare the local fixture and runner outside the candidate first. Add the temporary fixture module to the candidate only after its author has frozen the source.
