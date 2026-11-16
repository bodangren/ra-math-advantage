# IM3 active credential independent review

## Decision

Accepted.

I found no blocking defect in the frozen three-path patch.

## Scope and source

The patch changes exactly these accepted paths:

1. `apps/integrated-math-3/lib/auth/server.ts`
2. `apps/integrated-math-3/__tests__/lib/auth/server-guards.test.ts`
3. `apps/integrated-math-3/__tests__/lib/auth/server-composition.test.ts`

I reconstructed the three files from baseline `f41c2e9278c5a435e725a8a1c7c54cd31875e87a` and applied `/tmp/im3-active-credential.patch`. Each reconstructed file is byte-equal to the frozen candidate file.

The patch does not change a Convex query, route, schema, session contract, login flow, or credential row.

## Production behavior

`verifyActiveCredential` now calls the existing `internal.auth.getCredentialByUsernameIncludingInactive` query with the session username.

The verifier keeps the strict condition:

```ts
credential !== null && credential.isActive === true
```

This condition accepts an active credential. It rejects a disabled credential and a missing credential. A query failure still propagates to the existing core authentication guard and produces the fail-closed 503 response.

The change reuses the existing query. It does not duplicate the lookup. It does not weaken the guard to credential existence.

## Tests

The guard test calls the actual `getCredentialByUsernameIncludingInactive._handler` with a small synthetic memory query fixture. It verifies the complete returned payload for active and disabled rows. It verifies the `isActive` value in both payloads. It also verifies a missing row returns `null`.

The actual-handler payloads drive the active and disabled guard cases. The tests also cover a missing credential, a query failure, a missing or invalid session, a valid active session, and a valid non-student role.

The student guard retains explicit active, disabled, missing, service-failure, unauthenticated, valid-student, and wrong-role cases.

Both test mocks expose the original query reference and the including-inactive query reference. Existing composition tests remain green.

I independently ran the focused command from the report. It passed 67 tests in four files:

- `server-guards.test.ts`
- `server-composition.test.ts`
- `quadratic-formula/attempt-route.test.ts`
- `quadratic-formula/check-route.test.ts`

The freeze report also records successful app lint, pre-build TypeScript, build, and post-build TypeScript checks.

## Remaining verification

The source repair is accepted. The existing local browser session must still prove that an active learner can pass the QF attempt GET guard and that the existing deactivated demo account is rejected. This runtime check is separate from source acceptance.

## Integration

Commit: `4bdd5b91f`. Parent review accepted the exact three-file patch and passed all 41 auth tests. All three mixed main paths were preserved. Native local verification remains pending.
