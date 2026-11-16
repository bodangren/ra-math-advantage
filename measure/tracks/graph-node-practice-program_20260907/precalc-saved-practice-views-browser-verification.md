# Saved practice browser verification

## Result

Accepted for the selected Topic 1.1 flow. Runtime commit: `ffca7ea29`.

The actual lesson and student dashboard show saved Guided and Independent attempt 2 with scores of 3/3. The teacher dashboard remains stable after reload. The lesson retains the ordinary written response. All read checks sent zero learner API POST requests. The complete learner effect records remain equal.

When the local source becomes stale, the lesson retains both historical results and hides new-attempt controls. The script restores the exact source title. This does not approve a production source.

The saved-retry check rejects a malformed receipt. Two same-event clicks send one request with the existing submission ID. The next request reaches the real server, then loses its response. The server adds one receipt and one evidence row. It adds no submission. Reload reads the stored receipt and shows delivery without another write.

The learner then starts a blank new attempt. It creates Guided attempt 3 with a new submission ID. The new evidence request uses that ID. A final reload retains the new result. Guided retry and new practice do not change cards or reviews.

## Verification method

The frontend ran at `http://127.0.0.1:43162`. The disposable Convex backend ran at `http://127.0.0.1:43160`. Installed Chrome and JavaScript Playwright drove the actual page controls. The selected real writer and evidence handlers processed accepted requests. Credentials and session files remain outside committed evidence.

The first retry run failed on an overly specific network-error text assertion after the server accepted the request. It did not produce a completed result. The receipt remained intact. A preparation run then created a new pending Guided attempt through the actual browser with an intercepted HTTP 503 evidence response. The corrected complete run records the actual `Failed to fetch` message. Acceptance does not depend on the failed run.

Parent verification passed 114 tests, lint, build, standalone TypeScript, and 21 workspace package resolution checks. Independent implementation review passed 35 focused tests. Independent browser review accepted the scripts, state assertions, and screenshots.

## Evidence

Files are in `evidence/precalc-q38-saved-results/`. They include the browser scripts, result summaries, saved-retry before/after records, and six screenshots. The saved-read script asserts full before/after record equality before it writes its result. The scripts expect the disposable fixture and local session files described in the Unit 7 verification plan.

This result covers the selected physical practice flow. It does not establish course-wide coverage or source approval. The earlier dashboard placeholder and absent saved-score projection in the Row 9 report are superseded by this verification.
