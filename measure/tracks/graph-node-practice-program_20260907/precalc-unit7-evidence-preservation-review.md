# Precalculus Unit 7 evidence preservation review

## Result

The committed evidence already preserves the Q38 saved-result proof and the Q40 brand-symbol proof byte for byte. The committed Unit 7 evidence also preserves the main state snapshots for the baseline, acknowledgement replay, pending guard, assistance, readiness boundary, teacher date, and layout checks.

Preserve the small live-only set below before removal of `/tmp/precalc-q37-unit7-local-bo06gg5_`. This set keeps the executable browser method and the most useful visual result for each accepted path. It does not copy the live database or authentication material.

## Minimum live-only files to preserve

### Baseline learner and teacher flow

- `run-unit7-browser-positive.cjs`
- `run-unit7-browser-practice.cjs`
- `unit7-practice-unlocked.png`
- `unit7-independent-complete.png`
- `unit7-teacher-candidate.png`

These files preserve the actual browser controls for rows 1 through 6 and the principal visible states. The committed baseline and Independent state snapshots preserve the database evidence. Do not preserve `unit7-browser-after-ack.log`; it contains a superseded harness failure.

### Acknowledgement replay

- `run-unit7-browser-ack-replay-only.cjs`
- `unit7-ack-replay-only-browser.log`
- `unit7-ack-replay-only-success.png`

The committed `precalc-unit7-ack-replay-effects.json` preserves the accepted state result. These three files preserve the actual accepted-response-loss and visible retry method.

### Pending request guard

- `run-unit7-browser-pending-guard.cjs`
- `unit7-pending-guard-browser.log`
- `unit7-pending-guard-success.png`

The compact log records one request during two synchronous clicks and two total requests after the valid retry. The committed pending-guard snapshot preserves the final database state.

### Assistance

- `run-unit7-browser-assistance2.cjs`
- `unit7-browser-assistance2.log`
- `unit7-assisted2-independent-hard.png`

These files preserve the visible hint and reveal operations, the frozen retry tuple, the exact stored counters, and the assisted Independent `Hard` result. The committed assisted-effects snapshot preserves the final rows. Do not preserve the first assistance script, log, or debug screenshot. They contain superseded harness work.

### Teacher date

- `run-unit7-browser-teacher-date-proof.cjs`
- `unit7-browser-teacher-date-proof.log`
- `unit7-teacher-date-clean-after.png`

These files preserve the real server-render and hydration method, the zero-error result, and the corrected visible UTC value. The committed teacher-date state snapshot preserves the related rows. The mismatch screenshot and JSON are useful diagnosis records, but the accepted track report already states the exact mismatch. They are not necessary for the minimum set.

### Readiness and stale-source boundary

- `run-unit7-browser-stale-submit-fixed.cjs`
- `run-unit7-browser-stale-replay-fixed.cjs`

The committed stale-submission and historical-replay JSON files already preserve the result data. The committed banner image preserves the visible unavailable-source state. These two scripts preserve the two-mode rejection and historical replay methods. Do not preserve `run-unit7-browser-stale-submit.cjs` or its unexpected-effects file. They record the defect before the accepted repair.

### Layout

- `run-unit7-browser-layout-fixed.cjs`

The committed layout observation, fixed measurement, and corrected screenshot preserve the results. This script is the only live-only executable measurement method.

## Files already preserved exactly

All 13 files in committed `evidence/precalc-q38-saved-results/` match their live files byte for byte. This includes the three scripts, two result files, two retry state snapshots, and six screenshots.

All three files in committed `evidence/precalc-q40-brand-symbol/` match their live files byte for byte. This includes both corrected screenshots and the result JSON.

Do not copy another version of these 16 files.

## Sensitive or generated files to exclude

Do not preserve these files or directories as evidence:

- `local-admin-key`
- `local-accounts.json`
- all `local-*-account.json`, `local-*-ids.json`, and `local-*-session.json` files
- `local-push.env`, `local-convex-push.env`, and other environment files
- `backend.sqlite3`, `graph.db`, and `local-storage/`
- backend, frontend, push, and setup logs that can contain request or environment details
- `node_modules/`, build output, package overlays, and generated Convex output
- repository source copies and Git metadata from the disposable archive

The recommended browser scripts refer to protected fixture filenames. They do not contain the credential values or the admin key.

## Superseded evidence to exclude

Exclude failed or superseded browser artifacts unless a defect-history appendix explicitly requires them. This includes the first acknowledgement flow, first assistance flow, initial stale-submit success, first saved-retry locator failure, hydration-mismatch artifacts, and pre-fix layout screenshot. The accepted reports already explain these failures.

This review does not authorize deletion. It identifies 20 live-only files for minimum preservation.
