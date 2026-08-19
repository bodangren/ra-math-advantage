# Danielson Observation Contract

## Purpose

This contract defines ranked walkthroughs and formal observations.
It uses the Track 1 access rules.
It uses the Track 2 graph, proficiency, Knowledge Space Theory (KST), and
spaced repetition system (SRS) data.

The server gets the actor and organization from the current session.
The client cannot supply an actor, role, organization, or access scope.

## Observation Types

The application supports these observation types.

| Type | Record content | Allowed observer |
|---|---|---|
| `walkthrough` | One to three approved skill targets | Head of Department (HOD), coach, school head, or Senior Leadership Team (SLT) member |
| `formal_q1` | One or more distinct Danielson components | HOD, coach, school head, or SLT member |
| `formal_q4` | One or more distinct Danielson components | School head or SLT member |

Track 1 scope and self-evaluation rules apply to each action.
An observer cannot observe themselves.

The application does not require all 22 components on one formal form.
The observer can record only the components for which evidence exists.

## Ranked Queue

The queue contains active teachers in the current observer scope.
It excludes the observer's own teacher profile.
Roles are additive.

- An HOD can access teachers in an assigned department.
- A coach can access assigned teachers.
- A school head can access active teachers in the organization.
- An SLT member can access active teachers in the organization.

The queue uses one derived attention summary for each teacher.
The summary is not canonical evidence.
The application rebuilds it from Track 2 data after each scoring change.
A teacher without a summary has an evidence gap for each approved skill.

The queue uses these reason codes in this order:

1. `below_proficient`
2. `overdue`
3. `evidence_gap`
4. `due`

The values in `approvedPriorityInputs` identify permitted factors.
They do not increase priority by themselves.
Track 5 can later add `approved_plan_priority`.
Track 6 can later add `new_teacher_priority`.

The target sort uses this tuple:

1. Reason order.
2. Raw rating from low to high.
3. A missing rating after a numeric rating for the same reason.
4. Overdue days from high to low.
5. Component ID in ascending order.
6. Skill ID in ascending order.

The application removes duplicate skill IDs before it sorts targets.
A target is eligible when it is below Proficient, overdue, has an evidence
gap, or is due.

The teacher sort uses this tuple:

1. The highest-priority target tuple.
2. Eligible target count from high to low.
3. Normalized display name in ascending order.
4. Teacher profile ID in ascending order.

The queue shows the reason from the highest-priority target.
It does not use a hidden numeric score.

The queue reads at most 250 active teachers.
It reads at most one attention summary for each teacher.
It returns `queue_capacity_exceeded` when a source has more rows than the
declared bound.
It does not truncate a queue without an error.

## Three-Target Result

The selected-teacher query reads the canonical Track 2 cards and proficiency
rows for that teacher.
It creates one candidate for each approved skill.
A missing card or proficiency row creates an evidence-gap candidate.

The result has these fields:

- `requested`: Always `3`.
- `returned`: The number of returned targets.
- `shortfall`: `3 - returned`.
- `shortfallReason`: `fewer_than_three_eligible_skills` when the shortfall is
  greater than zero. Otherwise, it is `null`.
- `targets`: The distinct sorted target records.

The result contains exactly three targets when three eligible skills exist.
The result never repeats a target to fill a shortfall.

## Observation Record

An observation record has these identity fields:

- Organization ID.
- Teacher profile ID.
- Observer account ID.
- Observation type.
- School year in `YYYY-YYYY` format.
- Source version.
- Framework version.

A draft has status `draft`.
A submitted record has status `submitted`.

A walkthrough item contains one approved skill ID, its parent component ID,
and its priority-reason snapshot.
A formal item contains one Danielson component ID.
Each item has an optional outcome and an optional evidence note.

An outcome is one of these values:

- A `rated` outcome with one integer rating from 1 through 4.
- A `not_enough_evidence` outcome with no rating.

An evidence note is teacher-visible after submission.
It is not a private leadership comment.
Track 4 owns public comments, private comments, and teacher responses.
An evidence note never enters the Track 2 scoring command.

## Draft Lifecycle

The server assigns the targets when it creates a walkthrough draft.
Only the observer who owns a draft can read, save, submit, or discard it.
The observer must also keep current access to the teacher.

A save operation can change only item outcomes and evidence notes.
It must include the expected draft revision.
A stale revision returns `revision_conflict`.

A draft is private.
It creates no Track 2 evidence.
It is not visible to the teacher.

A discard operation requires an explicit confirmation and the expected
revision.
It deletes only the draft.

## Submission

All items must have an outcome before submission.
The server checks the current role and scope again.

The organization ID and submission key identify one submission command.
The application normalizes the content before it creates the fingerprint.
An equal retry returns the first receipt.
A different command with the same key returns `idempotency_conflict`.

Submission changes the draft status to `submitted`.
It sets `submittedAt` and `publishedAt` to the same server time.
It writes the observation and all Track 2 evidence effects in one transaction.
There is no approval state.

The application does not expose an update or delete operation for a submitted
record.

The evidence keys use these forms:

- Walkthrough: `<submissionKey>:skill:<skillId>`.
- Formal observation: `<submissionKey>:component:<componentId>`.

A rated walkthrough item sends one Track 2 command for its target skill.
A rated Q1 component sends one Track 2 command.
Track 2 expands that Q1 command to all direct child skills.
A rated Q4 component stays component-only in this track.
A `not_enough_evidence` item creates an immutable Track 2 outcome.
It creates no proficiency, KST, or SRS change.

If all items have `not_enough_evidence`, the visit is still submitted and
published.
Its targets stay due.

One teacher can have only one submitted Q1 record and one submitted Q4 record
for a school year.
Drafts do not use this uniqueness rule.

## Amendment

An amendment is an append-only event.
It identifies the original submitted record, teacher, author, version,
idempotency key, reason, changed items, and server time.

The author must have the matching Track 1 amend capability and current scope.
The author must supply the expected latest version.
The reason is required.

An amendment can change only an existing item's outcome or evidence note.
It cannot change the teacher, original observer, observation type, school
year, target IDs, source version, or framework version.

The application preserves the original submitted record bytes.
It overlays amendment versions to create the effective published record.
A note-only amendment makes no Track 2 write.

A scoring amendment appends a supersession record for each changed evidence
command.
It can replace rated evidence with rated evidence, rated evidence with
`not_enough_evidence`, or `not_enough_evidence` with rated evidence.

The correction rebuilds the bounded effective event timeline.
It removes the superseded outcome from the effective timeline.
It does not delete the original outcome or SRS review row.
It appends correction revisions when a later SRS transition changes.
The current card, proficiency, KST, and priority must equal a clean replay of
the effective timeline.
The original and replacement cannot count twice.

The amendment and its Track 2 correction commit in one transaction.
An equal amendment retry returns the first receipt.
A changed retry returns `idempotency_conflict`.

## Annual Continuity

The school year is observation metadata.
A new school year does not reset or clone evidence, cards, KST state, SRS
state, or proficiency.

Observation-history queries can cross school years.
They use cursor pagination.
Amendment-history queries use a separate cursor.

## Persistence and Visibility

Convex owns all observation records.
Each read uses an organization-scoped index.
Each list read has a fixed bound or a cursor.
The application does not use `.filter()` or an unbounded `.collect()`.

Teacher-visible submitted fields are available at `publishedAt`.
Drafts are visible only to their observer.
Leadership access uses Track 1 scope.
Private leadership comments are outside this contract.

## Accessibility

Each item uses a `fieldset` and `legend`.
Each outcome uses a labeled radio control.
The evidence note has a visible label.
An inline error references its control with `aria-describedby`.
The error summary receives focus after a failed submission.
Every action is available from the keyboard.
Status uses text and color.
The interface respects reduced-motion preferences.
