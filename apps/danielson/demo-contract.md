# Danielson Local Demo Contract

## Purpose

The local demo creates one fictional organization for a sales call. The seed
uses the current Danielson schema. It does not add a demo table, marker row,
fixture registry, seed ledger, hash, or reset mutation.

The seed is local only. It is internal only. It must never target a hosted or
production Convex deployment.

## Stable organization

| Field | Value |
|---|---|
| Slug | `danielson-school` |
| Name | `Haidian Kaiwen Academy` |
| Display name | `HDKWA` |
| Logo | `/brands/hdkwa-logo.png` |
| Primary color | `#003366` |
| Accent color | `#C5A059` |
| Departments | `Mathematics`, `Primary School` |
| Reference time | One value for every generated date in one seed call |

## Demo accounts

All accounts use the password from `DANIELSON_DEMO_PASSWORD`. The seed creates
a unique salt for each account. Every credential sets `mustChangePassword` to
`false`.

| Username | Display name | Roles | Teacher profile |
|---|---|---|---|
| `demo.sysadmin` | Casey Rivera | System administrator | None |
| `demo.slt` | Alex Morgan | Senior Leadership Team, teacher | Experienced dual-role teacher |
| `demo.head` | Robin Taylor | School head | None |
| `demo.hod.math` | Jordan Lee | Head of Department, teacher | Experienced dual-role teacher |
| `demo.coach.primary` | Sam Okafor | Coach | None |
| `demo.teacher.new` | Maya Chen | Teacher | New teacher with limited evidence |
| `demo.teacher.developing` | Noah Williams | Teacher | Developing teacher below Proficient |
| `demo.teacher.experienced` | Sofia Patel | Teacher | Experienced teacher at Proficient |
| `demo.teacher.pip` | Ethan Brooks | Teacher | Active approved Performance Improvement Plan (PIP) |
| `demo.teacher.growth` | Lina Park | Teacher | Successful closed PIP |

## Teacher scenarios

The seed creates these seven teacher profiles: Alex Morgan, Jordan Lee, Maya
Chen, Noah Williams, Sofia Patel, Ethan Brooks, and Lina Park.

| Teacher | Required scenario |
|---|---|
| Alex Morgan | Published evidence. No PIP. Self-view is public. Private leadership comments remain private. |
| Jordan Lee | Experienced. Proficient. Low walkthrough cadence. HOD scope and self-exclusion apply. |
| Maya Chen | New. Many skills with Not Enough Evidence. Get Better Faster (GBF) assignment. Due skills and high walkthrough cadence. |
| Noah Williams | Early career. Ratings 1 and 2. At least two submitted walkthroughs. Three visible walkthrough priorities. |
| Sofia Patel | Experienced. Ratings 3 and 4. Published Q1 and Q4 formal observations. Low observation cadence. |
| Ethan Brooks | Active approved PIP. Two target skills. Current and overdue evidence. Public and private comments. PIP is not complete. |
| Lina Park | Successful closed PIP. Evidence changes one target from rating 2 to rating 3. One teacher response. |

## Scope

The Mathematics HOD owns Mathematics teacher scope. The coach owns Primary
School teacher scope. The SLT member and school head have organization-wide
evaluation access. The system administrator has account access only.

Existing self-access rules apply when the SLT member or HOD views their own
teacher report.

## Seed result contract

The internal seed returns exactly one of these results:

- `created` when the complete demo is inserted.
- `already_seeded` when the expected organization and demo identities exist.
- `conflict` when unrelated or mismatched data uses the stable organization.

The seed checks the stable organization and expected usernames before its first
write. It performs all creation writes in one Convex mutation transaction.

## Reset

Use the native local Convex reset process. Do not add a reset mutation, reset
page, or application-level reset command.

## Persistence boundary

The current schema is sufficient for the demo. It already represents
organizations, accounts, credentials, roles, teachers, departments,
memberships, HOD assignments, coach assignments, observations, comments,
responses, proficiency effects, GBF assignments, and PIP records. No new table
or index is required.
