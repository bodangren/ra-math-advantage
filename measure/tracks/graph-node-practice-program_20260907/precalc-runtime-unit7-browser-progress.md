# Precalculus Q37 Unit 7 Browser Verification Report

## Status

The baseline browser matrix is complete except for assistance controls. The candidate does not contain hint or reveal controls.

The real browser also found a pending double-click defect. The recursive acknowledgement replay fix passed its separate browser check.

## Environment

The run used `/tmp/precalc-q37-unit7-local-bo06gg5_`.

The frontend used `http://127.0.0.1:43162`. The local Convex backend used `http://127.0.0.1:43160`. All users and data were disposable. No production endpoint was used.

## Lesson and teacher flow

The authenticated learner opened `/student/lessons/1.1`.

- The page showed seven phases.
- The Worked graph contained `(0, 1)`, `(3, 7)`, `(7, 2)`, and `(9, 6)`.
- The ordinary Worked text and the physical acknowledgement were separate.
- The browser saved one ordinary lesson response.
- The learner acknowledgement locked Guided and Independent practice.
- The teacher dashboard showed the exact candidate.
- The teacher confirmation removed the candidate and unlocked practice.
- The teacher action created one `teacher_led` evidence row.
- The teacher action created no receipt, SRS card, SRS review, or mastery effect.

## Practice flow

The browser used the real fields, buttons, routes, and backend mutations.

- Wrong Guided stored submission `jd79r2f99v63bcfce7ywapg8qn8e1q9p`. It had score `0/3` and ordinal 1.
- Correct Guided stored submission `jd729ths0n13sd5572kgxvfr458e09v3`. It had score `3/3` and ordinal 2.
- Both Guided receipts had reason `ungraded_evidence`. Both had `masteryApplied: false`.
- Wrong Independent stored submission `jd706sjnmqfpjm4twszap0p1an8e1kb7`. It had score `0/3` and ordinal 1. Its SRS review rating was `Again`.
- Correct Independent stored submission `jd7aketj5djedc7yyg14de5x4s8e1gf4`. It had score `3/3` and ordinal 2. Its SRS review rating was `Good`.
- Both Independent receipts were eligible and mastery-bearing.
- The final SRS state had card `nn75wjj9sbp8bs39wfdte0ph898e07p1`, state `review`, and `reps: 2`.

The lesson reload preserved all five submission IDs, five evidence IDs, four receipt IDs, one card ID, and two review IDs.

## Corrected Guided diagnosis

The earlier HTTP 500 was a browser harness timing defect. The script filled server-rendered fields before React hydration finished.

The failed request contained the correct keys and part IDs. Its three answer values were empty strings. The backend rejected the request in `activities:createServerOwnedSubmission` at `canonical`. It did not call the evidence bridge.

The script now waits for `networkidle` before it fills the fields. The post-hydration request contained the entered values. The corrected Guided and Independent sequence then passed.

No production change was required for this HTTP 500.

## Stale source

The local fixture changed only the source title. The browser showed `This worked example is not available.` Practice remained locked. The fixture restored the exact source title. This check created no learner effect.

## Acknowledgement replay

The local backend received the exact `activities.ts` from commit `097d16a01`.

A new learner sent an acknowledgement through the visible browser control. The browser let the server accept the first request and then aborted the response. The visible retry used the same `Idempotency-Key` and body. The retry succeeded. Exactly one acknowledgement submission persisted. It created no evidence, receipt, card, or review.

A different new learner tested two synchronous clicks while the first request remained pending. The page issued two POST requests. One acknowledgement persisted. This is a separate user-interface in-flight guard defect. The test did not bypass or fake the route.

## Assistance gap

`IntervalClassificationActivity` has no hint or reveal control. The assistance matrix cannot run on this candidate.

The stored baseline attempts have zero assistance counters. Guided evidence is non-mastery-bearing because Guided mode overrides mastery. The wrong Independent attempt received `Again`. The correct unassisted Independent attempt received `Good`. No browser claim is made for an assisted `Hard` rating.

## Evidence

The disposable archive contains the JSON snapshots, browser logs, and screenshots. Key files are:

- `unit7-guided-request-shape.json`
- `unit7-after-independent-effects.json`
- `unit7-after-lesson-reload-effects.json`
- `unit7-before-ack-replay-only-effects.json`
- `unit7-after-ack-replay-only-effects.json`
- `unit7-after-pending-double-click-failure-effects.json`
- `unit7-ack-replay-only-browser.log`
- `unit7-ack-replay-browser.log`
- `unit7-ack-replay-only-success.png`

The run did not edit the main workspace. It did not install a dependency or create a commit. The backend and frontend remain live.
