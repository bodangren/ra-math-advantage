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

Fields: `organizationId`, `departmentId`, `teacherProfileId`, `isActive`,
`createdAt`, and `updatedAt`.

Indexes:

- `by_organizationId_and_departmentId_and_teacherProfileId`
- `by_organizationId_and_departmentId_and_isActive`
- `by_organizationId_and_teacherProfileId_and_isActive`

### Role Assignment

The role is one of `teacher`, `hod`, `coach`, `school_head`, `slt`, or
`sysadmin`.

Fields: `organizationId`, `accountId`, `role`, `isActive`, `createdByAccountId`,
`createdAt`, `updatedByAccountId`, and `updatedAt`.

Indexes:

- `by_organizationId_and_accountId_and_role`
- `by_organizationId_and_accountId_and_isActive`
- `by_organizationId_and_role_and_isActive`

The mutation reactivates an existing role-assignment record. It does not create
a duplicate record for the same organization, account, and role.

### HOD Assignment

This record connects an HOD account to a department.

Fields: `organizationId`, `accountId`, `departmentId`, `isActive`,
`createdByAccountId`, `createdAt`, `updatedByAccountId`, and `updatedAt`.

Indexes:

- `by_organizationId_and_accountId_and_departmentId`
- `by_organizationId_and_accountId_and_isActive`
- `by_organizationId_and_departmentId_and_isActive`

### Coach Assignment

This record connects a coach account to a teacher profile.

Fields: `organizationId`, `accountId`, `teacherProfileId`, `isActive`,
`createdByAccountId`, `createdAt`, `updatedByAccountId`, and `updatedAt`.

Indexes:

- `by_organizationId_and_accountId_and_teacherProfileId`
- `by_organizationId_and_accountId_and_isActive`
- `by_organizationId_and_teacherProfileId_and_isActive`

## Validation Rules

- Trim text input before validation.
- Normalize usernames and stable keys to lower case.
- Reject an empty normalized value.
- Reject a duplicate username.
- Reject a duplicate organization slug.
- Reject a duplicate department key in one organization.
- Reject a duplicate active membership or assignment.
- Reject a relation when its records are in different organizations.
- Reject a relation to an inactive account, teacher profile, or department.
- Do not delete an account when it is deactivated.

## Query Rules

- Use the listed index for every authorization lookup.
- Use `unique()` for unique identity and assignment lookups.
- Use `take(6)` for the active role set.
- Use `take(100)` for one administration list page.
- Use cursor pagination when a list can exceed 100 records.
- Do not use `.filter()` or an unbounded `.collect()`.
