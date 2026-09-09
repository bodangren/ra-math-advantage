# IM3 active credential native proof review

## Decision

Accepted as native local proof for the active credential repair.

## Active account

`preflight-browser.mjs` uses a real headless Chrome session against the local frontend. It signs in through the application login page. It then reads the application session endpoint and opens the local Guided QF lesson.

`preflight-auth-fixed.log` reports:

- login success;
- session status 200;
- the Guided Start control is visible;
- zero requests to a Convex cloud or site host.

The frontend log records successful QF attempt GET requests with status 200 after the repair.

## Disabled account

`inactive-guard-check.mts` reads the prepared claims for the existing disabled demo account. It uses the actual `signSessionToken` and `verifySessionToken` functions from `packages/core-auth/src/session.ts`. It sends the signed cookie to the local QF attempt GET route.

The script does not insert, patch, or delete a credential or another database row. It does not change the disabled account.

`inactive-guard-result.json` reports that the synthetic local session token verified and that the QF attempt route returned 401. The frontend log also records the local Guided attempt GET with status 401.

## Boundary

This evidence proves the native local guard behavior for one active demo learner and the existing disabled demo learner. It does not change credential state. It does not make a remote or production authentication claim.
