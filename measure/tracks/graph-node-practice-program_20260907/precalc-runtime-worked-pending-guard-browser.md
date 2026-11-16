# Q37 Unit 7 Worked Pending Guard Browser Report

## Result

The committed Worked pending guard from `116b0ac6d` passed the real browser check.

The live disposable frontend used the exact committed `PrecalculusTopic11DailyCurriculumPilot.tsx` file. The backend remained on `http://127.0.0.1:43160`. The frontend remained on `http://127.0.0.1:43162`.

A new learner used the real login page and lesson page. The test held the first acknowledgement request pending. Two synchronous clicks produced one POST request during the pending period.

The server accepted that first request. The test then aborted its response. The visible retry control sent a second POST with the same `Idempotency-Key` and the same body. The retry succeeded.

The database contained exactly one acknowledgement submission for this learner. It contained no evidence, receipt, SRS card, SRS review, lesson response, or progress row.

## Evidence

- `unit7-pending-guard-browser.log`
- `unit7-before-pending-guard-effects.json`
- `unit7-after-pending-guard-effects.json`
- `unit7-pending-guard-success.png`

These files are in `/tmp/precalc-q37-unit7-local-bo06gg5_`.

The credential and session files remain protected. No secret was printed. The assistance candidate was not copied into the live browser archive.
