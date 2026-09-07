# Danielson Application Boundary

## Ownership

`apps/danielson/` owns these surfaces:

- Next.js routes and server actions
- the app authentication wrapper
- the Convex schema and functions
- Danielson accounts, roles, and scopes
- the design system and domain components
- Danielson rubric, training, and evidence content

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

## Routes

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

| `/auth/change-password` | Authenticated account | Replace the current password |
| `/learn` and `/learn/[slug]` | Authenticated account | Read technique guidance |
| `/observations` | Scoped supervisor | Select a teacher and start an observation |
| `/observations/drafts/[recordId]` | Authorized draft owner | Save or submit evidence |
| `/observations/records/[recordId]` | Authorized reader | Read published evidence |
| `/observations/records/[recordId]/amend` | Authorized supervisor | Correct outcomes and notes |
| `/my-observations` and `/my-report` | Teacher | Read own published evidence |
| `/reports` and `/reports/teachers/[teacherProfileId]` | Scoped supervisor | Review proficiency and priorities |
| `/improvement-plans` and plan detail, new, and revise routes | Authorized participant | Manage improvement work |
| `/admin/relationships` | System administrator | Inspect current assignments |

Observation, reporting, and plan API routes use the same current authorization
checks as their page workflows. Successful client mutations refresh their server
data. Training links from a draft open separately to preserve unsaved evidence.

Signed sessions carry the existing credential change time. Protected requests
compare that value with the current credential. Password changes, resets, and
account status changes invalidate older sessions. No separate session ledger is
stored.

## Convex Boundary

The Convex boundary owns account, organization, department, teacher-profile,
role-assignment, department-membership, HOD-assignment, coach-assignment, and
domain tables.

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

## Routine coaching

`coaching_cycles` stores one small coaching record per cycle.
It references baseline and follow-up observation IDs. It does not copy evidence.
`/coaching/[teacherProfileId]` serves the current teacher or an authorized supervisor.
`/api/coaching` gets the actor from the verified session.
Internal mutations reuse the existing current scope checks and require a revision for updates.
A teacher can write only their own reflection. Supervisors cannot write a teacher reflection.
Completed cycles cannot change. No new approval or rating process is added.

`/calibration` is supervisor-only. Its exercise values remain in browser memory.
`/admin/accounts/[accountId]` is system-administrator-only and returns no evaluation data.
