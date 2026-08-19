# Danielson Reporting Contract

## Purpose

This contract defines the leadership portfolio and teacher reports.
It uses the current access rules from Track 1.
It uses the proficiency data from Track 2.
It uses submitted observations and amendments from Track 3.

The server gets the actor from the verified session.
The server gets current roles and scope from Convex.
The client cannot supply an actor, organization, role, or access scope.

## Product Boundary

Keep all Danielson reporting logic in `apps/danielson/`.
Do not add a reporting dependency.
The shared `teacher-reporting-core` package contains student gradebook logic.
It does not contain this teacher-evaluation domain.

Reports are read-only for these records:

- observation records
- observation amendments
- proficiency records
- Knowledge Space Theory (KST) state
- spaced repetition system (SRS) cards and reviews
- priority records
- evidence due dates

Only a comment mutation or a teacher-response mutation can write during report
work.
Each mutation writes only its own append-only record.

## Routes

The application adds these protected routes:

| Route | Access | Purpose |
|---|---|---|
| `/reports` | In-scope supervisor | Show the leadership portfolio. |
| `/reports/teachers/[teacherProfileId]` | In-scope supervisor | Show one leadership teacher report. |
| `/my-report` | Teacher | Show the current teacher's published report. |

A system administrator does not get report access from the `sysadmin` role.
An account with `sysadmin` and a supervisor role gets access from the supervisor
role only.

## Leadership Portfolio

### Row Contract

Each row has these fields:

- `teacherProfileId`
- `displayName`
- `danielson`
- `improvementPlan`
- `gbf`
- `evidenceDue`
- `attentionReasons`

The `danielson.state` value is one of these values:

- `below_proficient`
- `proficient`
- `not_enough_evidence`

The projection groups approved skills by their parent Danielson component.
A component is `below_proficient` when one current skill rating is 1 or 2.
A component is `proficient` when every approved child skill has current evidence
and every rating is 3 or 4.
A component is `not_enough_evidence` in all other cases.

The portfolio state is `below_proficient` when one component is below
Proficient.
The portfolio state is `proficient` when all 22 components are Proficient.
The portfolio state is `not_enough_evidence` in all other cases.

Do not average ratings.
Keep the IDs of all below-Proficient components in the projection.

The `evidenceDue.state` value is one of these values:

- `overdue`
- `due`
- `current`

A missing SRS card is due.
A missing SRS card is not overdue.
The projection includes due count, overdue count, maximum overdue days, and the
next known due date.

### Improvement-Plan and GBF Seams

Track 4 does not add an improvement-plan or Get Better Faster (GBF) source
model.
It returns these exact neutral projections:

```ts
{
  contractVersion: 'danielson.ip-progress.v1',
  state: 'not_configured'
}
```

```ts
{
  contractVersion: 'danielson.gbf-progress.v1',
  state: 'not_configured'
}
```

A missing source does not create an attention reason.
Track 5 can replace the improvement-plan projection.
Track 6 can replace the GBF projection.

### Attention and Order

Track 4 can emit these attention reasons:

1. `below_proficient`
2. `overdue_evidence`

Reserve `ip_off_track` for Track 5.
Do not emit it from a neutral projection.

Put every row with an attention reason before a row without one.
Use this deterministic sort tuple:

1. Has an attention reason.
2. First reason in the order above.
3. Maximum overdue days from high to low.
4. Below-Proficient component count from high to low.
5. Normalized display name in ascending order.
6. Teacher profile ID in ascending order.

Show all reasons in the row.
Do not return a hidden overall score.

### Portfolio Scope and Pagination

Apply current role and assignment data before projection.
An HOD sees teachers in assigned active departments.
A coach sees assigned active teachers.
A school head or Senior Leadership Team (SLT) member sees active teachers in the
organization.

The portfolio can include the actor's own teacher row.
The row contains no private leadership data.

Use a default page size of 25.
Use a maximum page size of 50.
Use the last teacher profile ID from the sorted page as the continuation cursor.
Reject a cursor that is not in the filtered result.

Use these source bounds:

- 250 active teacher profiles
- 1,000 active organization accounts
- 2,000 scope rows for each scope source
- 250 attention summaries

Read one extra row for each bound.
Return `portfolio_capacity_exceeded` when a source exceeds its bound.
Do not return a truncated portfolio.

Read each source once.
Group records with maps.
Do not run one query for each teacher.

## Teacher Report

### Official Evaluation Projection

Show the latest submitted Quarter 1 (Q1) formal observation.
Show the latest submitted Quarter 4 (Q4) formal observation.
Keep the school year and observation type on each record.
Apply all effective amendments before projection.
Keep the original observation available through the observation record route.

For each formal component, show these fields:

- component ID and title
- raw Danielson rating, or `not_enough_evidence`
- derived points for a rated outcome
- observed date
- observer
- source observation ID
- amendment count

Use the Track 2 point map.
Rating 1 maps to 70 points.
Rating 2 maps to 80 points.
Rating 3 maps to 90 points.
Rating 4 maps to 100 points.

Do not average component ratings.
A rating below 3 stays visible and keeps the official record below Proficient.

### Current Proficiency Projection

Build current proficiency from the current Track 2 skill projections.
Do not build it from comments, responses, or evidence notes.

Show these levels:

- Danielson domain
- Danielson component
- approved skill

Each skill shows its raw rating, points, proficiency state, due state, due date,
and source record.
Each component and domain uses the same no-average rule as the portfolio.

Keep official evaluation data separate from current proficiency data.
Do not replace an official rating with a later walkthrough rating.

### Evidence History

Use cursor pagination for submitted observation history.
Use a default page size of 20.
Use a maximum page size of 50.

Each history item identifies these facts:

- source observation
- observation type
- school year
- observed date
- observer
- target skill or component
- raw outcome
- optional evidence note
- amendment state
- teacher-response state

Link each history item to the effective submitted observation.
Use the existing amendment history on that route.

## Comment Contract

### Storage

Store public and private comments in separate tables.
Do not store visibility as a mutable field.

Use these tables:

- `observation_public_comments`
- `observation_private_comments`

Each comment stores these fields:

- organization ID
- submitted source observation ID
- subject teacher profile ID
- author account ID
- immutable content
- server creation time

Trim comment content.
Reject empty content.
Reject content longer than 4,000 characters.

Do not add update or delete functions for a comment.

### Comment Access

Add the `observation_comment:write` capability.
Grant it to HOD, coach, school head, and SLT roles.
Apply current organization and teacher scope before a write.
Reject a supervisor comment on the supervisor's own teacher record.

A public comment is visible to the subject teacher and authorized supervisors.
A private comment is visible only in an authorized leadership teacher report.

An HOD or coach reads private comments only in current assigned scope.
A school head or SLT member reads private comments only in the current
organization.
A system administrator cannot read a private comment by use of that role.

When a supervisor opens their own teacher report, return the public projection.
Do not return a `privateComments` field.
Do not return a private-comment presence flag or count.

Use separate return validators for public and private projections.
Build the public projection first.
Do not create a private projection and remove fields after authorization.

## Teacher-Response Contract

Use the `teacher_observation_responses` table.
Each response stores these fields:

- organization ID
- submitted source observation ID
- subject teacher profile ID
- author account ID
- immutable content
- server submission time

Trim response content.
Reject empty content.
Reject content longer than 4,000 characters.

The subject teacher can submit one response to a submitted observation.
Derive the subject teacher from the observation record.
Do not accept a teacher, organization, or author from client input.

Read the organization and observation index before insert.
Return `response_exists` when a response already exists.
Convex transaction retry and the indexed read enforce one response under
concurrent submissions.
Keep the first response unchanged.

The response is visible to the subject teacher and authorized supervisors.
Do not add update, delete, second-response, or reply functions.

## Safe Projection Contract

These projections must not contain private comment text, author identity,
presence, or count:

- teacher report
- leadership portfolio
- portfolio filter result
- portfolio summary
- denied response
- search result
- notification data
- export data

Track 4 does not add search, notification, or export features.
Do not add placeholder functions for them.
All future features must use the same safe projection rule.

Return a stable denial without protected record data.
Do not include internal error text in an API response.

## Non-Interference Contract

Adding or removing a comment must not change these values:

- raw rating
- derived points
- component or domain status
- KST state
- SRS card or review
- target order
- evidence due date
- observation or amendment bytes

Adding a teacher response must not change the same values.

Reporting queries create no database writes.
Comment and response modules do not import or call proficiency processing,
replay, scheduling, or observation amendment writers.

## Convex Indexes and Bounds

Add an index for the latest submitted observation by organization, teacher,
observation type, status, and submission time.

Add organization, teacher, observation, and time indexes to both comment
tables.
Add an organization and observation index to the response table.
Add an organization, teacher, and submission-time index to the response table.

Use these teacher-report bounds:

- 200 SRS cards
- 200 proficiency rows
- 200 priority rows
- 2,000 observation or amendment history rows when a bounded snapshot needs
  full effective history

Read one extra row before a capacity decision.
Return a specific capacity result.
Do not truncate without a result state.

Use cursor pagination for comment and observation-history lists.
Use indexed reads for one source observation or one response.

## Interface Contract

Keep the portfolio compact.
Show `Teacher | Danielson | IP | GBF | Evidence due` as labeled columns.
Show attention reasons as text.
Do not use color as the only status signal.

Put summary sections before detail sections on a teacher report.
Use native disclosure controls when detail can start collapsed.
Keep each comment and response form focused on one action.
Put a visible label on each control.
Use native required validation.
Move focus to the error summary after a server failure.
Keep all actions available from the keyboard.
