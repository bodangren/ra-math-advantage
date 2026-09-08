# Precalculus Q20 main reconciliation final independent review

## Disposition

The Q20 dispatcher and selected evidence reconciliation are ready for bounded main integration. The author corrected both prior P1 findings. I found no remaining behavior defect in this scope.

Q19 teacher backend integration remains separate.

## Durable selected dispatch

`submitRoutedEvidenceHandler` now queries `learning_evidence` by the existing learner and submission index before it reads the physical submission. Evidence with either exact Topic 1.1 Guided or Independent activity ID selects `submitSelectedEvidenceHandler`.

This preserves the accepted replay boundary. A valid selected transaction stores selected evidence before its receipt. The dispatcher therefore keeps a valid selected replay on the selected handler when the physical submission is deleted or its stable activity ID is damaged. The selected handler authenticates the active learner before it returns the durable receipt.

The two real regressions first create a selected submission, selected evidence, and receipt. They then delete or damage the physical row and deactivate the credential. Both replay attempts reject. Evidence, receipt, and SRS row counts remain unchanged.

For new delivery, the dispatcher still uses the current physical stable activity ID. The two selected IDs go to the strict selected handler. Other activities go to the existing camel-case handler. A duplicate durable evidence row causes the indexed `unique()` query to fail closed.

## Real Topic 1.2 path

The revised real-flow test does not mock the camel-case handler. It inserts a stored Topic 1.2 Guided submission and an earlier teacher event. It calls the real `submitRoutedEvidenceHandler`, which calls the real `submitPrecalculusLearningEvidenceHandler` and its existing stores.

The test verifies the Topic 1.2 evidence row, durable receipt, SRS review, replay result, and stable row counts. This resolves the prior stub-only verification gap. The broader 126-case suite remains the negative authority coverage for the later-topic handler.

## Shared main contracts

The selected reconciliation uses the current broad receipt schema. It writes the required `updatedAt` field and preserves `kstApplied: boolean` for later topics. The selected public route still projects only the accepted safe result and requires `kstApplied: false` for this selected route.

The patch does not restore the removed fingerprint column or serializer. It does not modify the existing camel-case later-topic implementation. It does not include or claim Q19 teacher behavior.

## Verification

I reran the real selected and Topic 1.2 composition file. All nine tests pass.

The author reports 197 passing combined tests in nine files, plus lint, TypeScript before and after build, and the production build.

## Patch handling note

`/tmp/precalc-q20-main-reconciliation.patch` uses paths such as `apps/pre-calculus/...` without `a/` and `b/` prefixes. Default `git apply` strips the first path component and fails. Apply it with `git apply -p0`, or regenerate it with standard Git prefixes before integration. This is an artifact-format issue. It is not a runtime defect.
