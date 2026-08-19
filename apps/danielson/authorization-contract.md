# Danielson Authorization Contract

## Trust Boundary

The verified signed session supplies only the actor account ID. The server gets
the current account, organization, roles, and assignments from Convex for each
protected operation.

The server does not authorize from these client or token values:

- actor role
- actor organization
- actor assignment
- target organization

The server gets the target organization from the target record.

## Capabilities

| Capability | Purpose |
|---|---|
| `published_record:read` | Read published results and public comments |
| `teacher_response:write` | Add the teacher's one permitted response |
| `pip_acknowledgment:write` | Acknowledge the teacher's improvement plan |
| `pip_supervisor_acknowledgment:write` | Record the frozen supervisor's acknowledgment of an approved PIP |
| `teacher_report:read` | Read a leadership teacher report |
| `private_leadership:read` | Read the private leadership section |
| `walkthrough:submit` | Submit a walkthrough |
| `walkthrough:amend` | Add an amendment to a walkthrough |
| `q1_observation:submit` | Submit a Quarter 1 (Q1) formal observation |
| `q1_observation:amend` | Add an amendment to a Q1 formal observation |
| `q4_observation:submit` | Submit a Quarter 4 (Q4) formal observation |
| `q4_observation:amend` | Add an amendment to a Q4 formal observation |
| `pip:propose` | Propose a Performance Improvement Plan (PIP) |
| `pip:approve` | Approve a proposed PIP |
| `pip:close` | Close an approved PIP |
| `gbf:assign` | Assign a versioned Get Better Faster (GBF) track |
| `accounts:manage` | Create, update, activate, or deactivate accounts |
| `departments:manage` | Manage departments and memberships |
| `assignments:manage` | Manage roles, HOD assignments, and coach assignments |
| `access_audit:read` | Read access-management audit events |

Later tracks implement the record, response, evaluation, and PIP capabilities.
Track 1 defines their access boundary.

## Role Matrix

| Role | Scope | Capabilities |
|---|---|---|
| `teacher` | Own teacher profile | `published_record:read`, `teacher_response:write`, `pip_acknowledgment:write` |
| `hod` | Teachers in assigned departments | Report and private read, walkthrough submit and amend, Q1 observation submit and amend, PIP proposal, supervisor PIP acknowledgment |
| `coach` | Assigned teachers | Report and private read, walkthrough submit and amend, Q1 observation submit and amend, PIP proposal, supervisor PIP acknowledgment |
| `school_head` | All teachers in the organization | HOD capabilities plus Q4 observation submit and amend, GBF assignment, and supervisor PIP acknowledgment |
| `slt` | All teachers in the organization | School-head capabilities plus PIP approval, closure, and supervisor PIP acknowledgment |
| `sysadmin` | Account administration in the organization | `accounts:manage`, `departments:manage`, `assignments:manage`, `access_audit:read` |

The named phrases in the role matrix refer to the exact capability codes in the
capability table. The `sysadmin` role does not grant a teacher-report or
evaluation capability.

The leadership teacher report exposes the GBF assignment action to an active
school head or SLT member. The server creates the request ID and release
values. The client supplies no actor, organization, role, or release value.

## Scope Resolution

Roles are additive. The server permits an operation when at least one current
active role grants the capability and its current scope includes the target.

- A teacher scope matches the teacher profile for the actor account.
- An HOD scope matches when the target teacher has an active membership in an
  active department that has an active HOD assignment for the actor.
- A coach scope matches when the actor has an active coach assignment for the
  target teacher.
- A school-head or SLT scope matches each active teacher in the actor's current
  organization.
- A system-administrator scope matches account-administration records in the
  actor's current organization.

The server rejects a cross-organization operation before it reads or changes a
protected record.

## Subject Exclusion

A supervisor role does not permit these operations when the actor is the
subject teacher:

- `private_leadership:read`
- `walkthrough:submit`
- `walkthrough:amend`
- `q1_observation:submit`
- `q1_observation:amend`
- `q4_observation:submit`
- `q4_observation:amend`
- `pip:propose`
- `pip:approve`
- `pip:close`
- `gbf:assign`

The actor can still use these teacher capabilities on their own record:

- `published_record:read`
- `teacher_response:write`
- `pip_acknowledgment:write`

The server applies subject exclusion after it verifies identity and
organization. It applies subject exclusion before it reads or changes protected
evaluation data.

## Decision Reasons

Each denial uses one stable reason:

- `unauthenticated`
- `account_inactive`
- `organization_inactive`
- `cross_organization`
- `capability_not_granted`
- `target_out_of_scope`
- `self_private_denied`
- `self_evaluation_denied`
- `self_pip_denied`
- `target_inactive`
- `final_active_sysadmin`

The client can show a general message for these reasons. The server must not
return protected record data with a denial.
