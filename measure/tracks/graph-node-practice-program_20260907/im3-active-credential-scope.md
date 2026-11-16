# IM3 active credential verification repair scope

## Decision

Change one production path and two existing test paths:

1. `apps/integrated-math-3/lib/auth/server.ts`
2. `apps/integrated-math-3/__tests__/lib/auth/server-guards.test.ts`
3. `apps/integrated-math-3/__tests__/lib/auth/server-composition.test.ts`

Do not change either Convex credential query, the session token contract, a route, the database schema, login behavior, or credential data.

## Defect

`verifyActiveCredential` calls `internal.auth.getCredentialByUsername`. That query filters out inactive credentials, but its active result does not include `isActive`. The verifier then requires `credential.isActive === true`. Therefore, it rejects every valid active credential. A browser session can be valid while an API that uses the active guard returns 401.

The existing `getCredentialByUsernameIncludingInactive` query returns the same credential payload plus the real `isActive` field. The login route already uses this query and then checks the flag explicitly.

## Minimum repair

In `verifyActiveCredential`, replace only the internal query reference with:

```ts
internal.auth.getCredentialByUsernameIncludingInactive
```

Keep the explicit verifier expression:

```ts
credential !== null && credential.isActive === true
```

This preserves fail-closed behavior. A missing credential returns false. A disabled credential returns false. An active credential returns true. A query failure still propagates to the existing core-auth guard, which returns 503.

Do not weaken the check to credential existence. Do not add `isActive` to the active-only query in this repair. Do not duplicate the credential lookup or create a new query.

## Test requirements

In `server-guards.test.ts`, call the actual `getCredentialByUsernameIncludingInactive._handler` with a small memory query fixture for `auth_credentials.by_username`. Use synthetic values only. Require the exact returned payload for an active row and a disabled row. Require the real `isActive` boolean to be present in both results. Require a missing username to return null. Feed these actual-handler payloads into the mocked server query for the active and disabled guard cases. Do not repeat a manually reduced payload shape.

Update the mocked `internal.auth` object in both auth test files so it contains both existing query references. Require the active guard to call `auth:getCredentialByUsernameIncludingInactive` with the session username. Keep explicit cases for:

- active payload returns the session claims;
- disabled payload returns 401;
- missing payload returns 401;
- query failure returns 503;
- invalid or missing session token returns 401.

Use the actual query payload fields in active and disabled guard fixtures. Do not reduce these fixtures to `{ isActive }`. This connects the guard expectation to the actual-handler result contract.

Keep the existing student-role checks. `requireStudentRequestClaims` uses the same verifier and must continue to accept an active student, reject disabled and missing credentials, return 503 for a query failure, and return 403 for a valid non-student role.

## Verification

Run the two changed auth test files. Run the QF route tests that use the active guard. Run app lint and TypeScript. Wait until the local frontend stops before the app build. Then run the app build and a separate post-build TypeScript check.

After integration, use the existing local browser session. Require the QF attempt GET to pass the active credential guard. Use the existing deactivated demo account for the inactive-account check. Do not change a credential to create that case. Do not reset the local database. Do not access a remote deployment.
