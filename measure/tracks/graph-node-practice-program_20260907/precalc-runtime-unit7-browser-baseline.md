# Precalculus Q37 Unit 7 Browser Verification Report

## Status

Partial. The real browser flow found two blocking runtime failures and one missing user-interface feature. I did not bypass them.

## Environment

The run used the disposable archive at `/tmp/precalc-q37-unit7-local-bo06gg5_`.

The frontend used `http://127.0.0.1:43162`. The local Convex backend used `http://127.0.0.1:43160`. The browser used the stored local teacher and learner sessions. No production endpoint or source approval was used.

## Completed checks

### Real lesson and mixed phase

The authenticated learner opened `/student/lessons/1.1`.

- The page showed seven phase links from the real seed.
- The Worked graph description contained the exact points `(0, 1)`, `(3, 7)`, `(7, 2)`, and `(9, 6)`.
- The ordinary Worked text was visible separately from the physical acknowledgement activity.
- The Worked phase exposed the ordinary `Your work and explanation` response form.
- The learner submitted that response through the browser.
- The database stored one `lesson_responses` row.

### Worked acknowledgement and teacher confirmation

The learner submitted the canonical empty Worked acknowledgement through the browser. The first request committed one physical submission. The page then showed the waiting state. Guided and Independent practice were absent.

The teacher opened the real dashboard. The exact local learner and class choice were visible. The teacher used the real confirmation form and route. The dashboard removed the candidate after reload. The learner used the real `Check lesson status` link. Guided and Independent practice became visible.

The persisted state after teacher confirmation had:

- one exact `teacher_led` evidence row,
- zero learning-evidence receipts from the teacher action,
- zero SRS cards,
- zero SRS reviews,
- zero student competency effects.

### Wrong Guided attempt

The learner submitted `wrong` for all three Guided parts through the visible form.

- The server stored score `0/3`.
- The stored physical activity was the exact Guided activity.
- The attempt ordinal was 1.
- The evidence row linked to the physical submission.
- The receipt had `persisted: true`.
- The receipt had `masteryApplied: false`.
- The decision reason was `ungraded_evidence`.
- No SRS card or review was created.

### Stale source

The local fixture changed only the disposable source title. A fresh authenticated learner page showed `This worked example is not available.` Guided and Independent practice were absent. A screenshot records the locked state. The fixture then restored the exact original title through an explicit local mutation.

The stale-source check did not add an evidence, receipt, card, review, response, or submission row.

## Blocking failures

### Worked ambiguous retry returns 409

The browser intercepted the first acknowledgement response only after the real server accepted the request. It then exposed the real visible retry control. The retry sent the same captured `Idempotency-Key` and the same empty request body.

The server returned HTTP 409. The database still had one Worked submission and no duplicate effect.

Code inspection found the defect in `createTopic11DailySubmission`. Its replay branch calls `sameRecord(data, args.submissionData)`. That helper compares nested `answers` and `parts` values by reference. The stored JSON values are deserialized objects and arrays. They cannot equal the new request objects by reference. The existing recursive `sameJson` helper is suitable for this comparison. Root owns the correction and regression test.

This failure leaves the successful visible ambiguous-response replay and duplicate-pending-click checks open.

### Corrected Guided attempt returns 500

A fresh lesson page submitted the exact Guided answers with the union symbol. The browser route returned HTTP 500 before it created a second Guided physical submission. The public route returned only its safe generic error. Temporary local logging exposed only the Convex request identifier and `Server Error`. I restored that instrumentation.

The database remained at one wrong Guided submission. Corrected Guided behavior remains open. Independent wrong and correct attempts also remain open because this failure stopped the ordered practice script.

### Hint and reveal controls are absent

`IntervalClassificationActivity` renders answer fields and one submit button. It does not render a hint control or a reveal control. The required browser assistance matrix cannot run against this candidate.

The expected contract distinction remains:

- Guided evidence is non-mastery-bearing by mode.
- Hints and reveals do not by themselves make Independent evidence ineligible.
- A correct assisted Independent answer can receive the SRS rating `Hard`.
- A wrong part produces `Again` behavior.

No browser claim is made for these unavailable controls.

## Final partial state

`unit7-final-partial-effects.json` contains the complete indexed learner state.

- lesson responses: 1
- physical submissions: 2
- evidence rows: 2
- receipts: 1
- SRS cards: 0
- SRS reviews: 0
- progress rows: 0

The two submissions are Worked attempt 1 and wrong Guided attempt 1. The two evidence rows are the teacher-led Worked event and the non-mastery Guided event.

## Evidence files

- `unit7-after-failed-worked-replay-effects.json`
- `unit7-after-teacher-effects.json`
- `unit7-current-effects.json`
- `unit7-final-partial-effects.json`
- `unit7-learner-waiting.png`
- `unit7-teacher-candidate.png`
- `unit7-practice-unlocked.png`
- `unit7-stale-source-locked.png`
- `unit7-browser-positive.log`
- `unit7-browser-after-ack.log`
- `unit7-browser-practice.log`
- `unit7-browser-stale-source.log`

All evidence files are inside the disposable archive. They contain no plaintext credential or admin key.

I did not edit the main workspace. I did not install a dependency or create a commit. I did not stop the backend or frontend.

## Preserved baseline evidence

The parent inspected the unlocked and stale-source screenshots. The screenshots show the seven ordinary phases and the selected practice area. They do not prove successful correct-answer submission. The complete final partial database state is preserved in `evidence/precalc-unit7-baseline-effects.json`. All identities are disposable local records. No credential, token, or admin key is included. The runtime export and teacher files match commits `c8358384` and `9de80ba8`.
