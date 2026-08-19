# Danielson Application Boundary

## Ownership

`apps/danielson/` owns these surfaces:

- Next.js routes and server actions
- the app authentication wrapper
- the Convex schema and functions
- Danielson accounts, roles, scopes, and audit events
- the design system and domain components
- all later Danielson rubric and evidence content

The app has no public package entry point. Other apps and shared packages must
not import it.

## Shared Dependencies

The app can import these shared packages:

- `@math-platform/core-auth`
- `@math-platform/core-convex`
- `@math-platform/app-shell`
- `@math-platform/knowledge-space-core`
- `@math-platform/srs-engine`

The app must not copy code from these packages. A new shared dependency needs
an approved architecture change.

## Initial Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Authenticated account | Show the role-aware landing page |
| `/auth/login` | Public | Sign in |
| `/unauthorized` | Public | Explain an access denial |
| `/admin` | System administrator | Show the administration landing page |
| `/admin/accounts` | System administrator | Manage accounts and role assignments |
| `/admin/departments` | System administrator | Manage departments and HOD assignments |
| `/admin/coaches` | System administrator | Manage coach assignments |
| `/api/auth/login` | Public POST | Create a shared signed session |
| `/api/auth/logout` | Authenticated POST | Clear the session |
| `/api/auth/session` | Authenticated GET | Return the current app access context |

Later tracks can add evaluation routes. Track 1 reserves no evaluation data
shape.

## Convex Boundary

The Convex boundary owns account, organization, department, teacher-profile,
role-assignment, department-membership, HOD-assignment, coach-assignment, and
audit-event tables.

Next.js server code calls internal Convex functions with the existing admin
transport. Each protected operation verifies the session first. The Convex
operation then resolves the current account and access grants. Client input does
not supply the actor ID, actor organization, or actor roles.

All Convex functions use argument and return validators. All authorization
lookups use indexes and bounded queries. The server denies cross-organization
access before it reads teacher scope records. It limits a teacher to 100 active
department memberships. Administration directories use cursor pages with no
more than 100 records. Each paginated list uses a separate Convex query.

The Danielson app owns its rubric graph, evidence commands, and persistence.
It uses the shared knowledge-space packages for graph validation and KST
projection. It uses the shared SRS package for card scheduling. It does not use
the student learning-evidence contract for teacher observations.
