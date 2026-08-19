# Performance Improvement Plan Contract

## Purpose

This contract defines the school Performance Improvement Plan (PIP) workflow.
It preserves the current form that the user supplied on 2026-08-19.
It connects approved target skills to the existing Danielson evidence system.

The application records professional support and progress.
It does not make a retention, warning, termination, or disciplinary decision.

## Source Contract

Use this source identity:

- Source ID: `school.pip-form.2026-08-19`
- Source version: `1.0.0`
- Canonical SHA-256: `c997419fcc7b922422dc505779c2ca8a145cb679c100606ce01fa9efdfebdbdb`

Calculate the hash from the UTF-8 bytes of the canonical JSON string.
Keep the object keys and array order that the application source defines.
A content change requires a new source version and a new hash.

The source has these display-only school values:

- Courage
- Adaptability
- Persistence

The application does not score these values.
The values do not change proficiency, Knowledge Space Theory (KST), the spaced
repetition system (SRS), cadence, progress, or closure.

Preserve these form fields in each immutable proposal version:

- teacher ID and frozen teacher name
- position
- department ID and frozen department name
- supervisor account ID and frozen supervisor name
- requested plan end date
- review meeting date
- purpose
- areas of concern
- expected standard
- required actions
- evidence of improvement
- school support
- successful completion criteria
- insufficient-improvement consequences
- acknowledgment text

Use this fixed consequences text:

> Failure to demonstrate sustained improvement during this period may result
> in further disciplinary action, which may include additional warnings or
> termination of employment in accordance with school policy.

Use this fixed acknowledgment text:

> This plan is intended to support professional improvement and ensure
> alignment with the instructional standards of the school.

The user cannot edit either fixed text field.

## Product Boundary

Reuse Track 1 authorization.
Reuse the Track 2 graph, ratings, proficiency, evidence, and priority data.
Reuse Track 3 effective evidence after amendments.
Publish progress through the Track 4 `danielson.ip-progress.v1` seam.

Do not add a workflow package, signature service, Human Resources decision
engine, or second scheduler.

## Lifecycle

Use one plan root for one improvement episode.
Use these root states:

- `proposed`
- `active`
- `closed`

Permit only one open root for a teacher.
A closed root does not prevent a later plan.

Each proposal is an immutable version.
A material revision creates the next version.
A revision to an active plan does not replace the active version until Senior
Leadership Team (SLT) approval.

SLT approval starts an approved period.
Approval freezes the version, targets, source references, dates, fixed text,
and form content.

## Authorization

Use these existing capabilities:

- `pip:propose`
- `pip:approve`
- `pip:close`
- `pip_acknowledgment:write`

Add `pip_supervisor_acknowledgment:write`.
Grant it to HOD, coach, school-head, and SLT roles.

Apply these rules on the server:

- An HOD proposes only for a teacher in an assigned active department.
- A coach proposes only for an assigned active teacher.
- A school head or SLT member proposes within the organization.
- Only an SLT member approves or closes a plan.
- A teacher acknowledges only their own approved version.
- Only the frozen supervisor acknowledges the supervisor record.
- A system administrator gets no PIP access from that role.
- A supervisor cannot take a PIP action on their own teacher record.
- A teacher reads only their own approved active or closed plan.
- A supervisor reads only plans in current report scope.
- Proposed content stays leadership-only.

Reload current roles and assignments for every protected operation.
Derive the actor, organization, subject, and server time on the server.

## Persistence

Use these app-owned tables:

### `improvement_plans`

Store the mutable lifecycle projection.
Store organization, teacher, state, revision, version numbers, pending and
active version IDs, approval and closure event IDs, active targets, and times.

Use these indexes:

- organization, teacher, and state
- organization, state, and updated time
- organization, teacher, and created time

### `improvement_plan_versions`

Store each immutable proposal version.
Store all form fields, frozen names, proposer, source identity, fingerprint,
and proposal time.

Use indexes for plan plus version and teacher plus proposal time.

### `improvement_plan_targets`

Store one immutable row for each version target.
Store the plan, version, teacher, ordinal, component snapshot, skill snapshot,
expected rating, expected points, and frozen source references.

Accept only an approved Track 2 skill under its actual parent component.
Accept expected rating 3 or 4.
Default the expected rating to 3 and 90 points.
Limit one version to 63 unique targets.

### `improvement_plan_acknowledgments`

Store one immutable acknowledgment for each approved version and kind.
Use `teacher` and `supervisor` as the kinds.
Store the actor and server time.
Do not store a drawn signature.
Do not claim a legal digital signature.

### `improvement_plan_events`

Store the append-only lifecycle audit and idempotency record.
Use these event kinds:

- `proposed`
- `approved`
- `teacher_acknowledged`
- `supervisor_acknowledged`
- `closed`

Store the organization, plan, teacher, version, request ID, fingerprint, actor,
server time, and event payload.

Do not add update or delete functions for versions, targets,
acknowledgments, or events.

## Proposal and Approval

Each mutation accepts a request ID and expected root revision.
An equal request replay returns the first receipt.
A changed replay returns `idempotency_conflict`.

A proposal is inactive.
It does not change proficiency, KST, SRS cards or reviews, priority, due dates,
the walkthrough queue, or the active PIP report projection.

Approval must do these actions in one transaction:

1. Recheck SLT access.
2. Recheck the organization and teacher.
3. Require the latest pending version.
4. Freeze the approved dates and version.
5. Replace the active version projection.
6. Insert the approval event.
7. Advance the root revision.

## Dates

The proposal can include a requested plan end date.
The review meeting date is required.

At approval, set the start time from the server clock.
Use the requested end date when it exists.
Otherwise, set the end date to 30 calendar days after approval.
Reject an end date or review date before approval.

The plan stays active after its end date until SLT closes it.
Return zero days remaining after the end date.

## Active Target Cadence

Do not change the shared SRS scheduler.
Apply one PIP priority overlay at projection time.

For each active target:

- Add `approved_plan_priority` to `approvedPriorityInputs`.
- Set the first evidence due time to the earlier of approval plus seven days or
  the plan end.
- After valid rated evidence, set the next evidence due time to the earlier of
  evidence time plus seven days or the plan end.
- Do not reset the time for `not_enough_evidence`.
- Mark evidence due at the due time.
- Mark evidence overdue only after the due time.

Read active organization plan projections once for a walkthrough queue.
Group the projections by teacher and skill.
Do not run one PIP query for each teacher.

## Progress

Keep current proficiency separate from plan-period progress.
Use effective rated evidence during the approved period.
Exclude `not_enough_evidence`, superseded evidence, comments, responses, and
evidence notes.

Use these target states:

- `no_plan_evidence`
- `below_expected`
- `meets_expected`

An active plan is off track when one target has overdue evidence.
It is also off track when the review date has arrived and one target is below
the approved expected rating.
It is on track in all other active cases.

Freeze target results in the closure event.
Later evidence must not change a closed plan result.

## Reporting Projection

Extend `danielson.ip-progress.v1` with these states:

- `not_configured`
- `pending_approval`
- `active`
- `closed`

The active state includes `on_track` or `off_track`, days remaining, and target
progress.
The closed state includes `successful` or `insufficient_improvement`, closure
time, and frozen target progress.

Emit the Track 4 `ip_off_track` attention reason only for an active off-track
plan.
A pending proposal does not create a teacher failure.

The teacher projection contains only approved active or closed content.
The leadership projection can also contain the pending version.

## Acknowledgment and Closure

Show this statement beside each acknowledgment action:

> This acknowledgment records receipt. It is not a legal digital signature.

Permit one teacher and one frozen-supervisor acknowledgment for each approved
version.
An acknowledgment does not activate, score, close, or change a plan.

Only SLT can close an active plan.
Require one of these outcomes:

- `successful`
- `insufficient_improvement`

Require a non-empty outcome note, expected root revision, and request ID.
Closure records the human decision.
It does not compare the selected outcome with calculated progress.
Keep the free-text closure note in the leadership projection.

## Bounds

Use these limits:

- plan list: 25 by default and 50 maximum
- active organization plans: 250 plus one sentinel
- version targets: 63 plus one sentinel
- lifecycle history: 20 by default and 50 maximum
- Track 2 evidence history: 2,000 plus one sentinel
- acknowledgments: two plus one sentinel

Use cursor pagination for plan and event history.
Return a named capacity result.
Do not truncate silently.
Do not use `.filter()` or unbounded `.collect()` in Convex.

## Interface

Add these protected routes:

- `/improvement-plans`
- `/improvement-plans/new`
- `/improvement-plans/[planId]`
- `/improvement-plans/[planId]/revise`

Add thin API operations for proposal, approval, acknowledgment, and closure.

Use visible labels and native required validation.
Use `fieldset` and `legend` for target and outcome groups.
Move focus to the error summary after a server failure.
Use text with status color.
Keep every action available from the keyboard.
Require explicit confirmation for approval and closure.

Show the fixed consequences and acknowledgment text as read-only content.
