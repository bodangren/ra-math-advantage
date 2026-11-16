# Q38 saved practice browser evidence review

## Verdict

Accept.

The final saved read run supports the read-only claims. The final saved retry run supports the retry and new-attempt claims. I found no blocking defect in the scripts, result files, or screenshots.

## Saved read evidence

`run-unit7-browser-saved-read.cjs` starts request tracking before it opens the learner lesson. It counts all learner `POST` requests whose path starts with `/api/`. It also reads the complete learner effect fixture before and after the browser flow. The script requires exact deep equality for those two snapshots.

The run result reports `readOnlyPostCount: 0` and `fullPersistedRowsUnchanged: true`. The script also checks these facts directly before it writes the result file. It checks both Guided and Independent saved attempts. It checks their attempt number, score, and delivered state. It checks the same data after reload and on the student dashboard. It checks that the ordinary mixed-phase response remains visible.

The stale-source case retains both historical results. It hides the new-attempt controls. The script restores the temporary source title in its normal path and its `finally` path. The final full-row equality check shows that this controlled setup left no persistent difference.

The teacher dashboard text is equal before and after reload. The learner page produced no recorded page errors.

The four screenshots agree with the assertions. They show both saved modes on the student dashboard, retained saved results after lesson reload, retained history when the source is unavailable, and a stable teacher dashboard.

## Saved retry evidence

`run-unit7-browser-saved-retry.cjs` selects the latest Guided submission that has no receipt. It verifies that the initial saved result needs delivery. It also verifies that the initial page load sends no submission or evidence request.

The malformed-receipt step sends two same-event clicks. The request listener records one evidence `POST`. The request contains the original submission ID. The malformed body does not show a delivered state. A full backend snapshot remains equal to the initial snapshot.

The accepted-response-loss step sends the original submission ID again. The route sends the request to the real server and then aborts the response. The page shows the captured `Failed to fetch` alert. The backend then contains one new receipt and one new evidence row for the old submission. It contains no new submission. The card and review rows are unchanged. A reload reads the stored receipt and shows the saved result as delivered. The reload sends no additional request and leaves the full backend snapshot unchanged.

The new-attempt step opens blank controls. The submit button is disabled until all required answers are present. The real submission creates Guided attempt 3 after Guided attempt 2. The new submission ID differs from the old ID. The third evidence request contains the new ID. Exactly one submission `POST` occurs in the complete retry run. The final state adds one submission and the two expected receipts. The card and review rows remain unchanged. A final reload sends no request and leaves the full backend snapshot unchanged.

The result file matches these assertions:

- old attempt ordinal: 2
- new attempt ordinal: 3
- submission `POST` count: 1
- evidence `POST` count: 3
- same-event malformed retry count: 1
- accepted response loss recovered by read: true
- fresh attempt used a new submission ID: true
- reload produced no writes: true

The two retry screenshots agree with the asserted states. The malformed receipt screenshot shows attempt 2, the required-delivery state, the retry control, and the failure alert. The final screenshot shows attempt 3 and the delivered state.

## Evidence limits and prior harness failure

The first retry run failed because its locator required a specific alert string. It produced no result or screenshots. That run did persist a receipt. The final run used a new pending Guided attempt that the preparation flow created through the real browser with a simulated 503 response. The final script records the actual alert text. No claim depends on the failed run.

The JSON result is a summary. The script assertions and the before/after fixture snapshots provide the underlying evidence. The saved read run proves full-row invariance. The retry run proves the intended row additions and exact invariance for submissions during retry, and for cards and reviews during the full flow.

## Visual observation

The screenshots show the preexisting literal `\\u222B` text in the AP Precalculus logo. This defect is outside Q38. I found no other material visual defect in these artifacts.
