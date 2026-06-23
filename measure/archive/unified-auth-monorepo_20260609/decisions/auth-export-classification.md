# Decision: Auth Export Classification (Phase 1 — Contract-First)

Track: `unified-auth-monorepo_20260609`
Phase: 1 — Audit & Classification
Source: 2026-06-09 structural audit; diff of
`apps/bus-math-v2/lib/auth/server.ts` (290 lines, 12 exports) against
`packages/core-auth/src/index.ts` and `apps/integrated-math-3/lib/auth/server.ts`
(239 lines, 11 exports).

## Purpose

Per FR1 of the track spec, classify every BM2 `lib/auth/server.ts` export as:

- **(a) identical-to-package** — the package (`packages/core-auth`) already
  supplies (or, in this audit, will supply during Phase 2) a function with
  identical semantics. The BM2 export becomes a thin re-export.
- **(b) generalizable-into-package** — the BM2 export is a wrapper around
  general-purpose logic that should be promoted into the package, parameterized
  via options/closures (cookie store getter, redirect target, role list,
  active-credential verifier, etc.).
- **(c) bm2-specific** — the export uses BM2-only domain knowledge (e.g., a
  BM2-unique redirect target or role semantics) and stays in the BM2 wrapper.

The classifications are the **contract** for Phase 2 promotion. The package
boundary rule (`packages/*` must not import from `apps/*` or
`next/headers` / `next/navigation` / `next/server` / `convex/_generated/`) is
enforced by how each export is promoted.

## Inventory at HEAD (`e88d19e6`)

| BM2 export                              | Lines | Uses `next/headers` | Uses `next/navigation` | Uses `next/server` (Response) | Uses app Convex helpers |
| --------------------------------------- | ----- | ------------------- | ---------------------- | ----------------------------- | ----------------------- |
| `getServerSessionClaims`                | 12–18 | yes (`cookies()`)   | —                      | —                             | —                       |
| `getRequestSessionClaims`               | 49–54 | —                   | —                      | —                             | —                       |
| `requireRequestSessionClaims`           | 83–93 | —                   | —                      | yes (`NextResponse.json`)     | —                       |
| `requireStudentRequestClaims`           | 98–113 | —                  | —                      | yes                           | —                       |
| `requireAdminRequestClaims`             | 118–133 | —                 | —                      | yes                           | —                       |
| `requireServerSessionClaims`            | 147–156 | —                 | yes (`redirect`)       | —                             | —                       |
| `requireServerRoles`                    | 161–171 | —                 | yes (`redirect`)       | —                             | —                       |
| `requireTeacherSessionClaims`           | 177–183 | —                 | (via helpers)          | —                             | —                       |
| `requireStudentSessionClaims`           | 189–207 | —                 | yes (`redirect`)       | —                             | —                       |
| `requireActiveRequestSessionClaims`     | 218–243 | —                 | —                      | yes                           | yes (`fetchInternalQuery` + `internal.auth.getCredentialByUsername`) |
| `requireActiveStudentRequestClaims`     | 251–266 | —                 | —                      | yes                           | (via `requireActive…`)  |
| `requireActiveTeacherRequestClaims`     | 275–289 | —                 | —                      | yes                           | (via `requireActive…`)  |

`packages/core-auth/src/index.ts` currently exports only constants, the
`SessionClaims`/`UserRole` types, JWT/PBKDF2 primitives
(`signSessionToken`/`verifySessionToken`/`hashPassword`/`verifyPassword`/
`generateRandomPassword`/`generatePasswordSalt`), password-policy helpers, and
`isDemoProvisioningEnabled`. **No server-side guard, role, or active-credential
helpers exist in the package yet.** Every classified (a)/(b) export below
therefore represents a Phase 2 promotion target, not a pre-existing match.

## IM3 parity notes

IM3 already mirrors 9 of the 12 BM2 exports with the same body. The three
differences are:

- IM3 has `requireTeacherRequestClaims` (teacher-or-admin role guard) and
  `requireDeveloperRequestClaims` (admin role guard) where BM2 has
  `requireAdminRequestClaims` only; the BM2 `requireAdminRequestClaims` body
  matches IM3's `requireDeveloperRequestClaims` body byte-for-byte.
- BM2 has `requireActiveStudentRequestClaims` and
  `requireActiveTeacherRequestClaims`; IM3 has neither — its
  `requireActiveRequestSessionClaims` is a leaf helper. The BM2 "active-role"
  helpers are *new* composition over the leaf helper.
- `requireActiveRequestSessionClaims` error messages differ between the two apps
  (`'Session revoked'` vs generic `unauthorizedMessage`; `'Credential verification
  temporarily unavailable'` vs `'Service unavailable. Please try again later.'`),
  but their **deactivation behavior is identical**: both apps call the Convex
  `internal.auth.getCredentialByUsername` internalQuery, which for both BM2 and
  IM3 returns `null` when `!credential || !credential.isActive` (BM2 convex/auth.ts
  line 19; IM3 convex/auth.ts line 18). The Convex data-layer already filters out
  inactive credentials, so both server-side checks (`!credential` in BM2 and
  `!credential || !credential.isActive` in IM3) achieve the same 401 result. The
  IM3 server-level `isActive` re-check is redundant (dead code) but harmless.
  Phase 2 parameterization should be driven by error-message customisability,
  not by any deactivation-logic divergence.

## Classification table

| BM2 export                              | Classification                  | Target home (post-Phase 2)                            |
| --------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| `getServerSessionClaims`                | (b) generalizable-into-package  | `packages/core-auth` + BM2 thin wrapper              |
| `getRequestSessionClaims`               | (a) identical-to-package        | `packages/core-auth`; BM2 re-exports                  |
| `requireRequestSessionClaims`           | (b) generalizable-into-package  | `packages/core-auth`; BM2 wraps with response builder |
| `requireStudentRequestClaims`           | (b) generalizable-into-package  | `packages/core-auth`; BM2 wraps with response builder |
| `requireAdminRequestClaims`             | (b) generalizable-into-package  | `packages/core-auth`; BM2 wraps with response builder |
| `requireServerSessionClaims`            | (b) generalizable-into-package  | `packages/core-auth`; BM2 wraps with redirect helper  |
| `requireServerRoles`                    | (b) generalizable-into-package  | `packages/core-auth`; BM2 wraps with redirect helper  |
| `requireTeacherSessionClaims`           | (b) generalizable-into-package  | `packages/core-auth`; BM2 wraps with role list + redirect helper |
| `requireStudentSessionClaims`           | (b) generalizable-into-package  | `packages/core-auth`; BM2 wraps with teacher-dashboard path |
| `requireActiveRequestSessionClaims`     | (b) generalizable-into-package  | `packages/core-auth`; BM2 supplies active-credential verifier |
| `requireActiveStudentRequestClaims`     | (b) generalizable-into-package  | `packages/core-auth`; BM2 wraps with role + active verifier |
| `requireActiveTeacherRequestClaims`     | (b) generalizable-into-package  | `packages/core-auth`; BM2 wraps with role + active verifier |

Tally: **(a) 1, (b) 11, (c) 0.**

The "no (c) entries" outcome is intentional. The original audit noted that
IM3's `server.ts` is "largely a wrapper re-exporting the package"; that
implies the BM2-vs-IM3 differences are parameterization, not app-specific
domain. The only surviving differences after parameterization are error-message
customisability and the IM3 redundant `isActive` re-check at server level;
neither requires a per-app behavioral fork. Both apps' Convex queries already
filter out inactive credentials identically.

## Per-export classification

## getServerSessionClaims

**Classification: (b) generalizable-into-package.**

Body reads `next/headers` `cookies()` to get `SESSION_COOKIE_NAME`, then
verifies the JWT with `verifySessionToken(token, getAuthJwtSecret())`. IM3 has
the same body (lines 13–19) importing the same primitives from
`@math-platform/core-auth`.

The `cookies()` call is a Next.js API and cannot be imported into
`packages/core-auth`. Phase 2 will promote the function to the package with a
`cookieStore` parameter (a `Pick<ReadonlyRequestCookies, 'get'>`-shaped object
that both `next/headers` `cookies()` and a test double can satisfy). BM2's
wrapper will become a one-line binding:

```ts
export const getServerSessionClaims = () =>
  packageGetServerSessionClaims(cookies());
```

## getRequestSessionClaims

**Classification: (a) identical-to-package.**

Body reads `request.headers.get('cookie')`, splits on `;`, decodes the
`SESSION_COOKIE_NAME` value, and calls `verifySessionToken`. Uses only the
Web-standard `Request` type and `verifySessionToken` from `core-auth`. IM3 has
an identical body (lines 45–50). The function is portable as-is; Phase 2
promotes it directly into `core-auth` and BM2's `server.ts` becomes a re-export
of the package symbol.

## requireRequestSessionClaims

**Classification: (b) generalizable-into-package.**

Body calls `getRequestSessionClaims`; on `null` it returns
`NextResponse.json({ error: unauthorizedMessage }, { status: 401 })`. IM3 has
the same body (lines 65–75). `NextResponse` is a `next/server` API, so the
package cannot construct the response. Phase 2 will promote the function as a
discriminated-union return (e.g., `{ ok: true; claims } | { ok: false; status:
401; message }`); the BM2 wrapper maps the union to a `NextResponse.json` for
parity with the current public return type (`SessionClaims | Response`).

## requireStudentRequestClaims

**Classification: (b) generalizable-into-package.**

Body is `requireRequestSessionClaims` + a role check for `'student'`, returning
`NextResponse.json({ error: forbiddenMessage }, { status: 403 })` on mismatch.
IM3 has an identical body (lines 80–95). After Phase 2 promotion, the package
exposes a generic role-gated guard parameterized by the allowed role(s); BM2
binds the role to `'student'` and the wrapper maps the discriminated union to
the `Response` shape.

## requireAdminRequestClaims

**Classification: (b) generalizable-into-package.**

Body is `requireRequestSessionClaims` + a role check for `'admin'`. IM3 has an
**identical body** under a different name — `requireDeveloperRequestClaims`
(lines 167–182) checks `claims.role !== 'admin'` and returns 403. Phase 2
promotion will express both as a single `requireRole(...)` helper in the
package parameterized by the allowed role(s); BM2 and IM3 wrappers each
specify `['admin']` and the explicit name (`requireAdminRequestClaims` vs
`requireDeveloperRequestClaims`).

## requireServerSessionClaims

**Classification: (b) generalizable-into-package.**

Body reads server-side session claims and, on `null`, calls
`redirect(\`/auth/login?redirect=${loginRedirectPath}\`)`. `redirect` is a
`next/navigation` API. IM3 has an identical body (lines 126–135). Phase 2
promotes the function to the package as a "verify-or-fail" helper that throws
a typed error or returns a discriminated union; the BM2 wrapper catches the
union/throws and invokes `next/navigation`'s `redirect` with the login URL.
The login URL itself is **not** a per-app divergence — both apps use
`/auth/login?redirect=${path}` — so the URL pattern is built by the package;
the wrapper only passes `loginRedirectPath`.

## requireServerRoles

**Classification: (b) generalizable-into-package.**

Body takes claims + allowed roles + a redirect target; on mismatch, calls
`redirect(unauthorizedRedirectPath)`. `redirect` is `next/navigation`. IM3 has
an identical body (lines 140–150). Phase 2 promotes the function with the
same "verify-or-fail" shape used by `requireServerSessionClaims`; the BM2
wrapper invokes `next/navigation`'s `redirect`. No app-specific knowledge
remains in the package surface.

## requireTeacherSessionClaims

**Classification: (b) generalizable-into-package.**

Body is `requireServerSessionClaims(loginRedirectPath)` + `requireServerRoles(..., ['teacher', 'admin'], unauthorizedRedirectPath)`. Default
`unauthorizedRedirectPath` is `'/student/dashboard'`. IM3 has an identical
body (lines 156–162) including the same default. Phase 2 promotes the function
unchanged; the BM2 wrapper supplies the login/unauthorized paths. The default
`'student/dashboard'` is not BM2-specific — IM3 also defaults to it — so the
default lives in the package and BM2 just imports it.

## requireStudentSessionClaims

**Classification: (b) generalizable-into-package.**

Body is `requireServerSessionClaims(loginRedirectPath)` plus role
discrimination: `student` → return claims; `teacher` or `admin` →
`redirect('/teacher')`; otherwise → `redirect(buildLoginRedirect(loginRedirectPath))`. IM3 has an identical body (lines 221–238). The `/teacher` path
is *currently* the same in both apps, but per `test-strategy.md` §4 ("parameterize app differences (cookie names, redirect targets, role maps) via
options, not forks") it is treated as a per-app option. Phase 2 promotes the
function to the package parameterized by a `teacherDashboardPath` option
(defaulting to the BM2/IM3 value); the BM2 wrapper binds the option. This
keeps the package honest for any future app with a non-`/teacher` teacher
dashboard without an app-level fork.

## requireActiveRequestSessionClaims

**Classification: (b) generalizable-into-package.**

Body calls `getRequestSessionClaims`; on success, calls
`fetchInternalQuery(internal.auth.getCredentialByUsername, { username })` to
verify the credential is still present; on `credential === null` returns
`buildRequestUnauthorizedResponse('Session revoked')`; on a thrown
`fetchInternalQuery` error returns
`buildRequestServiceUnavailableResponse('Credential verification temporarily unavailable')`. The Convex call and the `internal.auth.getCredentialByUsername`
reference are app-specific (and `convex/_generated/` is on the package
boundary's "must not import" list). IM3 has the same shape but also has a
redundant `credential.isActive` re-check (lines 207–209) that is dead code
because both apps' `getCredentialByUsername` Convex queries already return
`null` for inactive credentials. The actual differences are custom error
strings: BM2 uses `'Session revoked'` / `'Credential verification temporarily unavailable'`; IM3 uses the parameterised `unauthorizedMessage` /
`'Service unavailable. Please try again later.'`.

Phase 2 promotes the function to the package with a
`verifyActiveCredential: (claims) => Promise<{ ok: true } | { ok: false; reason: 'revoked' | 'unavailable' }>` callback (or an equivalent options object).
BM2 supplies a callback that calls its Convex `getCredentialByUsername` and
produces BM2's exact error strings; IM3 supplies a callback that calls its own
Convex `getCredentialByUsername` and produces IM3's error strings. Deactivation
behaviour is identical across apps because both Convex queries already filter
by `isActive`. The package's logic — "verify JWT → if claims ok, run
active-check → map revoked to 401, unavailable to 503, ok to claims" — is
shared; the credential lookup is supplied per app.

## requireActiveStudentRequestClaims

**Classification: (b) generalizable-into-package.**

Body is `requireActiveRequestSessionClaims` + a role check for `'student'`.
IM3 has no equivalent. The function is a straightforward composition of the
generalized active-credential guard and a role guard; Phase 2 promotion
exposes it as a parameterized helper in the package (active verifier +
allowed role). BM2 binds both options to its current values.

## requireActiveTeacherRequestClaims

**Classification: (b) generalizable-into-package.**

Body is `requireActiveRequestSessionClaims` + a role check for `['teacher',
'admin']`. IM3 has no equivalent. Same promotion shape as
`requireActiveStudentRequestClaims`: package exposes the parameterized
helper; BM2 binds the role list.

## Cross-cutting design notes for Phase 2

- **Return types.** The package functions that previously returned
  `SessionClaims | Response` or `Promise<SessionClaims | Response>` (BM2 lines
  83, 98, 118, 218, 251, 275) will return discriminated unions
  (`{ ok: true; claims } | { ok: false; status: 401 | 403 | 503; message }`)
  to keep `next/server` and `next/navigation` out of the package. Each BM2
  wrapper re-maps the union to `NextResponse.json(...)` to preserve the
  current public return type.
- **Server-side redirects** (`requireServerSessionClaims`, `requireServerRoles`,
  `requireStudentSessionClaims`) become discriminated unions or thrown
  typed errors. The BM2 wrapper catches the failure and calls
  `next/navigation`'s `redirect`, preserving the existing behavior.
- **Server-cookie access** (`getServerSessionClaims`) takes a cookie store
  with a `get(name)` method, supplied by the BM2 wrapper as `cookies()`.
- **Active-credential verification** uses a callback supplied per app to
  keep the Convex backend out of the package.
- **Role-gated guards** (`requireStudentRequestClaims`, `requireAdminRequestClaims`,
  the two active-role guards) all use the same
  `requireRole(claims, allowedRoles, options)` shape under the hood, with
  BM2/IM3 wrappers binding the role list and the response builder.
- **No app code imports the package's internal helpers directly during
  Phase 2.** All promotion goes through the package's public `index.ts`
  re-exports to satisfy the boundary lint (`measure doctor`).

## Acceptance link

This doc satisfies FR1 (classification) and is the input to FR2 (promotion).
FR3 (thin the wrappers) and FR5 (no duplicate app imports) are downstream;
their implementation in Phases 3 and 4 is checked against this classification
table.

## Sign-off

- Author: Phase 1 Green subagent (`measure-jr-green`).
- Date: 2026-06-23.
- Status: contract — frozen at the end of Phase 1; any change requires a
  Phase 1 Red → Green re-run with the new classification table.
