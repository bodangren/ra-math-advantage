# Q37 Unit 7 Teacher Date Browser Proof

## Result

The teacher date fix from commit `cd6c8ba5d` passed in a normal Asia/Shanghai browser.

The retained local candidate used the exact committed `Topic11ExposureForm.tsx` file. The browser context used `Asia/Shanghai`. It did not use the prior UTC workaround.

A new learner used the real login and lesson pages. The learner acknowledged the Worked example. The teacher then opened the real dashboard.

- React reported zero hydration errors.
- The page showed no development error overlay.
- The visible timestamp ended with `UTC`.
- The teacher confirmation control remained usable.
- The real teacher confirmation succeeded.

Before confirmation, the learner had one acknowledgement submission and zero evidence rows.

After confirmation, the learner had one acknowledgement submission and one `teacher_led` evidence row. The action created zero receipts, SRS cards, and SRS reviews.

## Evidence

The retained archive contains:

- `unit7-before-teacher-date-proof-effects.json`
- `unit7-after-teacher-date-proof-effects.json`
- `unit7-browser-teacher-date-proof.log`
- `unit7-teacher-date-clean-before.png`
- `unit7-teacher-date-clean-after.png`

The backend and frontend remain live. No production endpoint was used. No main workspace file changed.
