# Danielson Foundation Contract

## Identity Rule

The shared signed session proves the account identity. The app does not use a
session role or session organization as a Danielson permission grant.

The server gets the current account, organization, roles, and assignments from
Convex for each protected operation. A grant or revocation takes effect on the
next protected operation.

## Records

### Organization

| Field | Type | Rule |
|---|---|---|
| `slug` | string | Stable and unique |
| `name` | string | Required |
| `isActive` | boolean | Required |
| `activeSysadminCount` | number | Server-maintained count of active system administrators |
| `createdAt` | number | Server time |
| `updatedAt` | number | Server time |

Indexes: `by_slug`, `by_isActive`.

### Account

| Field | Type | Rule |
|---|---|---|
| `organizationId` | organization ID | Required |
| `username` | string | Normalized and unique |
| `displayName` | string | Required |
| `sharedSessionRole` | `teacher` or `admin` | Shared session compatibility only |
| `isActive` | boolean | Required |
| `createdAt` | number | Server time |
| `updatedAt` | number | Server time |

Indexes: `by_username`, `by_organizationId`,
`by_organizationId_and_isActive`.

The app never uses `sharedSessionRole` as a Danielson permission.

### Authentication Credential

| Field | Type | Rule |
|---|---|---|
| `accountId` | account ID | Required and unique |
| `username` | string | Same normalized value as the account |
| `passwordHash` | string | Required |
| `passwordSalt` | string | Required |
| `passwordHashIterations` | number | Required |
| `isActive` | boolean | Must match account access state |
| `mustChangePassword` | boolean | True for a new temporary credential |
| `createdAt` | number | Server time |
| `updatedAt` | number | Server time |

Indexes: `by_accountId`, `by_username`.

### Teacher Profile

| Field | Type | Rule |
|---|---|---|
| `organizationId` | organization ID | Required |
| `accountId` | account ID | Required and unique |
| `position` | string | Optional |
| `isActive` | boolean | Required |
| `createdAt` | number | Server time |
| `updatedAt` | number | Server time |

Indexes: `by_accountId`, `by_organizationId_and_isActive`.

An account can have no teacher profile. A system administrator who does not
teach does not need a teacher profile.

### Department

| Field | Type | Rule |
|---|---|---|
| `organizationId` | organization ID | Required |
| `key` | string | Stable within the organization |
| `name` | string | Required |
| `isActive` | boolean | Required |
| `createdAt` | number | Server time |
| `updatedAt` | number | Server time |

Indexes: `by_organizationId_and_key`,
`by_organizationId_and_isActive`.

### Department Membership

This record connects a teacher profile to a department.

Fields: `organizationId`, `departmentId`, `teacherProfileId`, `status`,
`createdByAccountId`, `createdAt`, `revokedByAccountId`, and `revokedAt`. The
status is `active` or `revoked`.

Indexes:

- `by_org_dept_teacher_status`
- `by_organizationId_and_departmentId_and_status`
- `by_organizationId_and_teacherProfileId_and_status`

### Role Assignment

The role is one of `teacher`, `hod`, `coach`, `school_head`, `slt`, or
`sysadmin`.

Fields: `organizationId`, `accountId`, `role`, `status`, `createdByAccountId`,
`createdAt`, `revokedByAccountId`, and `revokedAt`. The status is `active` or
`revoked`.

Indexes:

- `by_organizationId_and_accountId_and_role_and_status`
- `by_organizationId_and_accountId_and_status`
- `by_organizationId_and_role_and_status`

The mutation rejects a second active role assignment for the same organization,
account, and role. A revocation changes the active row to `revoked`. A later
grant creates a new row. The revoked row remains in history.

The server updates `activeSysadminCount` in the same transaction as an account
status change or a system-administrator role change. The count prevents removal
of the final active system administrator. Organization bootstrap must set this
count to `1` when it creates the first system administrator.

### HOD Assignment

This record connects an HOD account to a department.

Fields: `organizationId`, `accountId`, `departmentId`, `status`,
`createdByAccountId`, `createdAt`, `revokedByAccountId`, and `revokedAt`. The
status is `active` or `revoked`.

Indexes:

- `by_organizationId_and_accountId_and_departmentId_and_status`
- `by_organizationId_and_accountId_and_status`
- `by_organizationId_and_departmentId_and_status`

### Coach Assignment

This record connects a coach account to a teacher profile.

Fields: `organizationId`, `accountId`, `teacherProfileId`, `status`,
`createdByAccountId`, `createdAt`, `revokedByAccountId`, and `revokedAt`. The
status is `active` or `revoked`.

Indexes:

- `by_organizationId_and_accountId_and_teacherProfileId_and_status`
- `by_organizationId_and_accountId_and_status`
- `by_organizationId_and_teacherProfileId_and_status`

### Login Rate Limit

This record limits failed sign-in attempts for one normalized username and one
server-derived network address.

Fields: `key`, `windowStartedAt`, `failureCount`, `blockedUntil`, and
`updatedAt`.

Index: `by_key`.

The server does not accept the network address in the request body.

## Validation Rules

- Trim text input before validation.
- Normalize usernames and stable keys to lower case.
- Reject an empty normalized value.
- Reject a duplicate username.
- Reject a duplicate organization slug.
- Reject a duplicate department key in one organization.
- Reject a duplicate active membership or assignment.
- Limit one teacher profile to 100 active department memberships.
- Reject a relation when its records are in different organizations.
- Reject a relation to an inactive account, teacher profile, or department.
- Do not delete an account when it is deactivated.
- Reject an operation that would deactivate or revoke the final active system
  administrator in an organization.
- Keep a revoked membership or assignment as a historical row.

## Credential Rules

- Use the shared password generator, salt generator, and password hash.
- Create a temporary password for a new account.
- Return the temporary password once in the successful account-creation
  response.
- Do not store, log, or audit the plaintext temporary password.
- Require a password change after the first successful sign-in.
- Use one generic error for an unknown username and a wrong password.
- Limit repeated failed sign-in attempts.
- In production, require a trusted proxy source for the client network address.
- Fail the sign-in request when the trusted network header is not available.
- Set the session cookie as HTTP-only, secure in production, and same-site lax.
- Accept only an app-relative post-sign-in redirect.

## Query Rules

- Use the listed index for every authorization lookup.
- Use `unique()` for unique identity and assignment lookups.
- Use `take(6)` for the active role set.
- Limit one administration list page to 100 records.
- Return a cursor when an administration list has more records.
- Limit scope resolution to 100 active department memberships.
- Reject a 101st active department membership.
- Do not use `.filter()` or an unbounded `.collect()`.
