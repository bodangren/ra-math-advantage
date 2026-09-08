# Selected practice readiness browser verification

The tested runtime includes commit `91bfd0320`. The browser used the retained local backend at 127.0.0.1:43160 and frontend at 127.0.0.1:43162. Chrome used Asia/Shanghai.

## New submissions

The local fixture changed only the Worked source title. The lesson displayed “This worked example is not available.” Guided practice was absent.

Authenticated browser requests submitted a new Guided envelope and a new Independent envelope. Both returned HTTP 409 with the exact safe error “Practice is not available”. Neither request inserted or changed a stored row. The parent compared complete before and after rows, as well as their identities.

## Accepted replay

A second local learner already had accepted Guided and Independent submissions with assistance. The source title was changed again. Browser requests reused each stored submission's idempotency key, canonical answers, assistance counters, and attempt identity.

Both returned HTTP 200 with the original submission ID. Complete persisted rows were unchanged. The source title was restored in each script's finally block.

## Commands and environment

The local push used `convex dev --once --typecheck disable --env-file <protected local file>`. The custom file contained only the loopback self-hosted URL and local admin key. Parent app tests, lint, build, and standalone TypeScript had already passed.

The first push attempt inherited the browser environment's local deploy-key field. The CLI attempted a Convex control-plane lookup and received HTTP 401 before any push. The corrected command used the explicit local environment file and passed. No production code or data changed.

Browser commands were `node run-unit7-browser-stale-submit-fixed.cjs` and `node run-unit7-browser-stale-replay-fixed.cjs` in the retained local checkout. Neither script prints credentials. The source fixture was restored after both runs.

## Evidence and open work

The evidence directory contains both sanitized result records and the inspected unavailable-source banner. Row 8 now passes for both modes. Row 9 remains open for saved-result and dashboard behavior.

The full-page screenshot exposed a separate layout defect. A 1280-pixel viewport had a 6641-pixel document. One SVG measured 6400 pixels wide. The measured values are saved. A root-cause review is in progress. Do not treat the small banner screenshot as full-page layout approval.
