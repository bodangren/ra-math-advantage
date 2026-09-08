# Q33 selected practice receipt independent review

## Decision

Reject this revision until the selected acceptance suite is green. The production change is internally consistent. One existing selected acceptance fixture now asserts an invalid Guided Practice receipt. The report also understates the test failures.

## Finding

### P1 — The selected acceptance test supplies an Independent receipt to Guided Practice

`PrecalculusMasteryAdvantagePilot.acceptance.test.tsx` renders the default `guided_practice` mode in `sends all three raw Topic 1.1 classifications...`. Its evidence response uses `reason: "eligible"`, `eligible: true`, `masteryBearing: true`, and `masteryApplied: true`.

The selected evidence contract treats Guided Practice as ungraded participation. A valid Guided receipt uses `reason: "ungraded_evidence"`, `eligible: false`, `masteryBearing: false`, and `masteryApplied: false`. The new client parser correctly rejects the current fixture. The test then fails because the component shows the retry alert instead of a successful status.

Change this fixture to the valid Guided receipt. Keep the test in Guided mode because it checks the default component path and the three submitted classifications. This change must not weaken the parser.

The same acceptance file also has a stale dashboard composition fixture. The candidate report acknowledges a dashboard failure but states that it is the only failure. My focused run found both failures. The final integration must keep the selected acceptance suite green. Update the dashboard query fixture to the current learner-delivery query contract if that change is within the selected integration baseline.

## Verified behavior

- The component requires the exact five create-receipt keys: `submissionId`, `score`, `maxScore`, `attemptOrdinal`, and `feedback`.
- It validates a nonblank submission ID, a finite bounded score, a positive finite maximum score, a positive integer ordinal, and string feedback.
- The component requires the exact five outer evidence keys and the exact five decision keys.
- It rejects arrays and extra keys instead of coercing them into valid receipts.
- It enforces Guided and Independent decision coherence. Guided accepts only `ungraded_evidence`. Independent accepts only `eligible`. The teacher-order response remains `awaiting_teacher_exposure`.
- It checks the emitted `activityId` and mode before it creates the stored submission.
- It freezes the create envelope and idempotency key for create retry.
- It retains only the opaque physical submission ID for evidence retry.
- It does not expose completion or `Start new attempt` after a malformed create or evidence response.
- The synchronous ref lock prevents two create calls before React updates the UI.
- The real composition test calls the actual activity component, create route factory, selected server writer, evidence route factory, routed evidence handler, and in-memory stores. Both Guided and Independent flows pass.
- The real Guided flow creates one submission and one receipt with no SRS card or review.
- The real Independent flow creates one submission, one receipt, one SRS card, and one SRS review.
- Existing evidence-handler tests verify replay returns the stored receipt and does not duplicate evidence or SRS effects.
- The actual composition does not accept a hand-authored client evidence receipt. The receipt comes from the actual evidence route and handler.

## Test evidence

I ran:

`npx vitest run __tests__/components/student/PrecalculusMasteryAdvantagePilot.acceptance.test.tsx __tests__/components/student/PrecalculusMasteryAdvantagePilot-receipts.test.tsx __tests__/components/student/PrecalculusMasteryAdvantagePilot-real-flow.test.tsx __tests__/app/api/learning-evidence/precalculus-pilot/production-route.test.ts`

Result: 36 tests passed and 2 tests failed across 4 files.

- The 11 receipt and concurrency tests passed.
- The 2 real route-to-store composition tests passed.
- The 17 evidence production-route tests passed.
- The acceptance file had the invalid Guided receipt failure and the stale dashboard fixture failure described above.

## Correction disposition

The corrected main workspace resolves both findings.

The default Guided acceptance fixture now uses `ungraded_evidence`, with `eligible`, `masteryBearing`, and `masteryApplied` all false. The dashboard fixture now supplies an exact current Worked source and `ready_for_practice`. It verifies that the dashboard does not show the Worked acknowledgement card. It retains the authenticated knowledge-state query and checks that private raw answer, SRS, graph-edge, and other-node fields do not render.

The component still rejects array responses, extra receipt keys, and activity or mode changes. The actual Guided and Independent composition tests still use the real activity component, create route, writer, evidence route, evidence handler, and stores.

I ran the corrected four-file set. All 30 tests passed. This resolves both blocking findings. I accept Q33 for integration.
