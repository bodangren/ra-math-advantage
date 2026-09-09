# IM3 quadratic-formula browser proof independent review

## Result

Accepted as scoped allocation, retry, recovery, stale-response, timing, and persistence flow proof.

Do not use this result as learner-presentation acceptance or full feature readiness. The browser evidence exposes one concrete learner-presentation defect: every generated quadratic appears as a bare expression, such as `x^2 - 2x + 1`, while the prompt tells the learner to solve an equation. The visible prompt and saved result omit `= 0`. The server must publish the complete equation that the grader uses.

## Evidence reviewed

I reviewed:

- `browser-evidence-resume/result.json`
- `browser-evidence-resume/network.json`
- all 12 screenshots
- `run-browser-resume.mjs`
- `browser-post-run.json`
- the pre-run `resume-baseline.json`

The runner result is `success: true`. It restricts the app URL to loopback HTTP. It aborts Convex cloud requests. It does not reset or seed the database. The pre-run fixture had two activities, two canonical items, two canonical variants, zero submissions, and zero effects. The post-run state retains two activities and has eight items, eight variants, and eight submissions. This is consistent with lazy creation of the six later allocation relations. No evidence, receipt, SRS, or scheduled-work row was created.

## Flow verification

Both modes allocate exactly four physical attempts in order:

- `guided_practice`: ordinals 1, 2, 3, and 4
- `independent_practice`: ordinals 1, 2, 3, and 4

Each mode uses four distinct pending submission IDs. Each persisted submission keeps its expected activity, mode, ordinal, allocated variant, idempotency key, grade, answers, and timing.

The evidence includes ten submission POST requests for eight physical attempts. Attempt 1 in each mode has two POST requests because the runner loses the first response after the application saves it. For each pair, the request body, `Idempotency-Key`, and `X-Pending-Submission-Id` are exactly equal. The database has one final row for each pending identity.

After each lost submission response, the first final-details GET is forced to fail. The page shows the saved-awaiting-details state. The explicit retry obtains the saved final details. The client does not synthesize graded parts.

For attempt 2 in each mode, the runner delays Start and proves the pending form appears only after the response. It then delays the ordinal-2 final GET, forces a later Start failure, retries Start, and obtains ordinal 3. Releasing the old ordinal-2 GET does not replace the ordinal-3 equation, identity, or editable form. It also creates no duplicate submission.

The guided run also delays a GET, changes to the independent activity, releases the old response, and confirms that the selected independent state remains unchanged. After both modes finish, revisiting guided mode still shows its ordinal-4 final result.

The third scheduled attempt in each mode is a repeated-root case. Both final rows contain a blank `x2`, an `x2` score of 0, an `x2` maximum score of 0, and a total score and maximum score of 2. The visible saved result shows `x2: Correct (0 / 0)`.

After ordinal 4, an explicit next Start returns the exhausted state in both modes. The screenshots show the local exhaustion message.

## Public equation and grading evidence

The runner reads each visible KaTeX annotation. It requires that annotation to equal the equation in the public pending response. It derives the submitted discriminant and roots from that rendered public text. All eight rows received full credit. This proves that the displayed public expression and the grader use the same coefficients. It does not correct the missing `= 0` presentation defect.

The public pending responses contain the activity ID, mode, ordinal, pending identity, idempotency key, presentation props, prompt, field help where applicable, and the bare quadratic expression. The captured public responses do not contain generator data, coefficients, answer keys, expected answers, passwords, cookies, or authorization headers. The post-run database snapshot contains internal records for local administrative inspection; it is not a public response.

## Timing

All eight unique submission bodies contain valid timing summaries. Each has positive `activeMs` and `wallClockMs`. Each contains the required counters and confidence value. The eight `startedAt` values are distinct, which proves timing reset for each pending identity. The persisted rows retain the same timing summaries.

## Required follow-up

Use a small separate presentation repair. At the server public-props boundary, publish the generated quadratic as a complete equation with `= 0`. Keep the generator coefficients and grading authority private. Add tests for pending public props, the editable KaTeX prompt, and the saved read-only result. Require all three surfaces to show the same complete equation. Re-run a bounded browser case after that repair.

The completed browser run proves the scoped flow. The missing equality prevents a claim that the learner-facing activity is ready for use.
