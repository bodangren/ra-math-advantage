# Get Better Faster Sequence Contract

## Purpose

This contract defines the Get Better Faster (GBF) sequence for the Danielson
application. It maps source action steps to reviewed Teach Like a Champion 3.0
(TLAC 3.0) skills. It does not copy the source books. It does not create a
second scheduler.

## Source Release

Use sequence release `danielson.gbf.sequence.2026-08-19.v1`.
Use graph release `danielson.gbf.graph.2026-08-19.v1`.

The release uses these sources:

| Source ID | File | Use | SHA-256 |
|---|---|---|---|
| `gbf.scope-sequence.2018` | `get-better-faster-scope-sequence.pdf` | Phase, path, action-step, and page order | `cf34c7ed03fd63fb0c89cb378b1fcacde4c6dc5a7238fc1b9cb059ddf733de64` |
| `classroom-insights.2025-2026` | `Classroom-Insights-Handbook_25-26-1.pdf` | Implementation context only | `9de9a26d9acdea6fd134c50fec300822fb652f385cd1fe5cbff6b518ee311828` |
| `sibling.tlac3.modules` | `../hdkwa-danielson/src/data/techniques/` | Stable TLAC skill IDs and Danielson component mappings | `4704ae10511d27c4b3cc7951c0aadfe48558aa86e1148f8ba4f116383fe7cb1b` |

The GBF PDF metadata title is `NSA Leadership Team Agenda`. The visible page
title is `GET BETTER FASTER SCOPE & SEQUENCE`. The PDF author is Paul
Bambrick-Santoyo. The PDF has five pages. The file does not state an edition.
The user identified it as the GBF 2.0 scope and sequence.

The Classroom Insights PDF metadata title is
`Classroom Insights Handbook_25-26`. The PDF has five pages.

The TLAC source is frozen at sibling commit
`4ad319e57022ab8e334a594ee12c84a7a8886be7`. Its hash uses each sorted relative
filename, one null byte, the file bytes, and one null byte. The release contains
63 source modules.

The school has permission to use these sources inside this application. Keep
source data inside the application. Store short names, locations, and
rationales. Do not store long source passages. Do not import the sibling
application at run time.

## Sequence

Keep these phase IDs and source pages:

| Phase ID | Name | Source page |
|---|---|---|
| `phase_1` | Pre-teaching | 1 |
| `phase_2` | Days 1–30 | 2 |
| `phase_3` | Days 31–60 | 3 |
| `phase_4` | Days 61–90 | 4 |
| `stretch_it` | Next steps | 5 |

Keep `management` and `rigor` as separate paths. Use the source order inside
each path. Do not make one path a prerequisite for the other path.

The release contains 12 required Management steps and 13 required Rigor steps.
It also contains five Phase 1 Management previews. A preview does not become a
required mastery step.

Each action step has these fields:

- Stable action-step ID.
- Phase ID.
- Path.
- Path order.
- Source number, when the source gives one.
- Short source name.
- Source page.
- `required` or `preview` status.

## TLAC Mapping

Each mapping has these fields:

- Stable mapping ID.
- Action-step ID.
- Stable Track 2 skill ID.
- `primary` or `support` role.
- `direct` or `inferred` classification.
- Short rationale.
- `low`, `medium`, or `high` confidence.
- Review author.
- Review date.
- Review status.

The release contains 78 mappings. Required steps contain 25 primary mappings
and 46 support mappings. Preview steps contain seven mappings. The release maps
50 unique TLAC skills.

A direct mapping uses a source name or a defining source behavior. An inferred
mapping uses a behavior match when the source does not use the current TLAC 3.0
name. An inferred mapping must keep its rationale. Do not present an inference
as source text.

The release keeps these 13 skills unsequenced:

- `knowledge-organizers`
- `retrieval-practice`
- `standardize-format`
- `culture-of-error`
- `own-and-track`
- `without-apology`
- `board-paper`
- `front-the-writing`
- `art-of-the-sentence`
- `regular-revision`
- `batch-process`
- `threshold-strong-start`
- `habits-of-attention`

An unsequenced skill remains in the Danielson graph. It has no GBF phase. It
gets no GBF prerequisite edge. Track 2 can still make it due through the normal
spaced repetition system (SRS).

## Edge Candidates

Create one `supports` candidate from each support mapping to its primary skill.
The release has 46 support candidates.

Create one `prerequisite_for` candidate between primary skills in consecutive
required steps of one path. The release has 23 prerequisite candidates.

Each candidate has these fields:

- Stable edge ID.
- Edge type.
- Source and target skill IDs.
- Source action-step IDs.
- Path.
- Short rationale.
- Confidence.
- Weight.
- Review author and date.
- Review status.
- Activation state.

Use a weight below `1`. Do not create a hard gate by default. Keep a candidate
inactive until its review status is `approved`. A `draft`, `reviewed`, or
`rejected` candidate has no KST, SRS, assignment, or report effect.

Reject these four prerequisite candidates:

1. Phase 1 Rigor step 1 to step 2. Both steps map to `double-plan`.
2. Phase 2 Management step 1 to step 2. This edge creates a Routine Building
   cycle.
3. Phase 3 Management step 9 to Phase 4 Management step 10. This edge creates
   a Means of Participation cycle.
4. Phase 4 Rigor step 11 to Stretch It Rigor step 12. This edge creates a
   Break It Down cycle.

Validate prerequisite cycles with `includeLowConfidence: true`. Reject a
duplicate edge ID, duplicate edge tuple, dangling endpoint, self-edge,
unreviewed activation, cross-path prerequisite, or cycle.

## Graph Release

Build an assigned graph from the Track 2 Danielson graph and one immutable GBF
graph release. Add only approved and active prerequisite edges. Do not add
draft or support edges to KST readiness. Keep approved support edges as release
metadata only.

An assignment keeps its graph release ID. A later graph release does not change
an earlier assignment. Do not change Track 2 node IDs or raw ratings.

## Teacher Assignment

Store one immutable assignment row for each assignment event. The row has these
fields:

- Organization ID.
- Teacher profile ID.
- Sequence release ID.
- Graph release ID.
- Assigned skill IDs.
- Unsequenced gap skill IDs.
- Actor account ID.
- Assignment time.

Only an active school head or SLT member in the same organization can create
the assignment. A system administrator role alone cannot assign a professional
learning track. The teacher account and profile must be active. The assignment
mutation is idempotent by organization and request ID. An equal retry returns
the first assignment. Changed content returns `idempotency_conflict`.

Do not update or delete an assignment. A later release creates a new assignment
row. Read the latest assignment for current progress. Keep the earlier row for
history.

## Progress

Project progress from one assignment and current Track 2 priority rows. Do not
change proficiency, KST, SRS cards, or due dates.

Return these fields for each path:

- Current phase ID.
- Assigned primary skill IDs.
- Proficient primary skill IDs.
- Due primary skill IDs.
- Required action-step IDs.
- Completed action-step IDs.

A required step is complete when its primary skill has a current raw Danielson
rating of 3 or 4. A path current phase is the first phase with an incomplete
required step. A complete path has current phase `complete`. The two paths are
independent.

Also return the assignment ID, sequence release ID, graph release ID, assigned
skill IDs, proficient skill IDs, due skill IDs, and unresolved gap skill IDs.
An unsequenced gap is unresolved by definition. Do not count preview mappings
as required progress.

Use this public contract version:

```ts
{
  contractVersion: 'danielson.gbf-progress.v1'
}
```

Use `not_configured` when no assignment exists. Use `in_progress` when at least
one required step is incomplete. Use `proficient` when both paths are complete.

The leadership portfolio gets only the state and the two current phase IDs.
The teacher report gets the full safe progress projection. Both leadership and
the teacher can see the same GBF progress. The projection contains no private
comment or disciplinary recommendation.

## Bounds

Read at most 100 assignment rows for one teacher. Return a capacity error
instead of truncation. Read at most 251 current organization assignments for a
250-teacher portfolio. Return `portfolio_capacity_exceeded` on overflow.

Keep release data in static application-owned modules. Do not add release
tables, a mapping editor, an assignment page, or a second scheduler.
