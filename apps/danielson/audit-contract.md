# Danielson Access Audit Contract

## Purpose

An audit event records one successful account or access-management change. The
event is part of the same Convex transaction as the change.

If the audit insert fails, the change fails. A denied operation does not change
state and does not create a change event.

## Event Shape

| Field | Type | Rule |
|---|---|---|
| `organizationId` | organization ID | Get from the authenticated actor account |
| `requestId` | string | Unique in the organization |
| `actorAccountId` | account ID | Get from the verified server session |
| `action` | action code | Use a fixed code from the action list |
| `targetType` | target code | Use a fixed code from the target list |
| `targetId` | string | Store the changed record ID |
| `occurredAt` | number | Set from server time |
| `before` | snapshot or null | State before the change |
| `after` | snapshot or null | State after the change |

A snapshot is a record of string keys and scalar values. A scalar value is a
string, number, boolean, or null.

The snapshot must not contain a password, password hash, salt, temporary
credential, session token, or secret.

## Actions

- `account.create`
- `account.update`
- `account.activate`
- `account.deactivate`
- `role.assign`
- `role.revoke`
- `department.create`
- `department.update`
- `department.activate`
- `department.deactivate`
- `department_membership.assign`
- `department_membership.revoke`
- `hod_assignment.assign`
- `hod_assignment.revoke`
- `coach_assignment.assign`
- `coach_assignment.revoke`

## Targets

- `account`
- `role_assignment`
- `department`
- `department_membership`
- `hod_assignment`
- `coach_assignment`

## Immutability and Replay

- The application exposes no audit update or delete operation.
- The application permits an audit read only through `access_audit:read`.
- The audit read is organization-scoped and cursor-paginated.
- A repeated `requestId` returns `duplicate_request`.
- A repeated `requestId` creates no second change and no second audit event.
- A failed or denied operation creates no partial state change.

Indexes:

- `by_organizationId_and_requestId`
- `by_organizationId_and_occurredAt`
- `by_organizationId_and_actorAccountId_and_occurredAt`
- `by_organizationId_and_targetType_and_targetId_and_occurredAt`

The server gets the actor and time. The client supplies only the request ID and
the requested change.
