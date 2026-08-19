# Danielson Proficiency Contract

## Source Boundary

The school has permission to use the Danielson rubric in this application.
Licensed Danielson descriptors stay in `apps/danielson/`.
The app does not send licensed descriptors in an unrestricted client payload.

The internal 2022 summary import comes from sibling commit
`4ad319e57022ab8e334a594ee12c84a7a8886be7`.
The source file is `src/data/danielson.ts`.
Its SHA-256 hash is
`5c45ed005347e5ba6e951c406a05d1cca927f81be970031d5186d7eca4f6e853`.
This file is an approved internal import artifact.
It is not a vendor source file.

The sibling project has two technique sources.

| Source ID | Records | SHA-256 hash | Import rule |
|---|---:|---|---|
| `sibling.tlac3.modules` | 63 | `4704ae10511d27c4b3cc7951c0aadfe48558aa86e1148f8ba4f116383fe7cb1b` | Import each reviewed module once. |
| `sibling.runtime.techniques` | 63 | `9cecd83e24dfba10bcc6e765ae9b0a5a9083d08aff8b5e16c0b67b8b4220e705` | Keep runtime-only records in the review queue. |

The module hash is path stable.
Sort the module filenames.
For each file, hash its filename, a null byte, its bytes, and a null byte.
Use one SHA-256 digest for the complete sequence.

The two technique sources have 23 matching IDs.
Each source has 40 IDs that are not in the other source.
The app imports the 63 standalone TLAC modules as reviewed skills.
It keeps the 40 runtime-only records in the review queue.
It preserves the original source label for each queued record.
It does not infer a semantic alias.

## Graph Contract

The graph uses these stable ID patterns.

| Record | ID pattern | Node kind |
|---|---|---|
| Framework root | `danielson.framework.2022` | `domain` |
| Domain | `danielson.domain.<number>` | `content_group` |
| Component | `danielson.component.<code>` | `instructional_unit` |
| TLAC skill | `tlac3.skill.<source-id>` | `skill` |

The graph has one root, four domains, and 22 components.
Each imported skill has one parent component.
Each hierarchy edge has type `contains`.
Each node and edge has provenance and a review status.
Each skill has an alignment exception because the graph does not use
`standard` nodes.

The app calls the canonical knowledge-space schema and validator.
The app also validates the fixed Danielson hierarchy.
The app rejects a containment cycle.
The app rejects every active `prerequisite_for` edge in Track 2.
Track 6 owns GBF prerequisite review and activation.

## Evidence Contract

The evidence contract has two outcomes.

- A `rated` outcome has one raw Danielson rating from 1 through 4.
- A `not_enough_evidence` outcome has no rating, points, or SRS review.

Each command has these fields:

- `idempotencyKey`
- `organizationId`
- `teacherProfileId`
- `observerAccountId`
- `sourceRecordId`
- `sourceType`
- `componentId`
- `targetSkillIds`
- `eventTime`
- `sourceVersion`
- `provenanceGroupId`
- `outcome`

`sourceType` is `walkthrough`, `formal_q1`, or `formal_q4`.
The app sorts and de-duplicates target IDs before it creates the content hash.
The app rejects an unknown skill.
The app rejects a skill outside the selected component.
The evidence record does not accept a public comment, private comment, teacher
response, or evidence note.

The latest effective rated evidence for a skill is its current Danielson
proficiency rating.
Rating 3 is the minimum proficient rating.
The app does not average component ratings.
One rating below 3 keeps that component below the standard.

The application uses this rating map.

| Raw rating | Points | SRS rating |
|---:|---:|---|
| 1 | 70 | `Again` |
| 2 | 80 | `Hard` |
| 3 | 90 | `Good` |
| 4 | 100 | `Easy` |

For `formal_q1`, the app expands one component rating to each direct child
skill.
Each expanded event keeps the same source record and provenance group.
For a walkthrough, the app updates only the rated target skills.
The app keeps `formal_q4` as direct component evidence until Track 3 defines
its target projection.

## Idempotency Rule

The organization ID and idempotency key identify one logical command.
An equal normalized command returns the first result.
A different normalized command with the same key returns
`idempotency_conflict`.
The mutation writes the outcome, skill effects, cards, and review logs in one
transaction.

A `not_enough_evidence` command stores only the immutable observation outcome.
It creates no proficiency effect, KST change, SRS card, or SRS review.

## KST and SRS Rule

The app uses `@math-platform/srs-engine` to create and schedule cards.
The app uses one stable variant key: `danielson.proficiency.v1`.
It maps the teacher profile ID to the canonical card `studentId` field at the
package boundary.
It does not change the shared package.

The app calls `scheduleReview` with a maximum interval of 180 days.
It stores the canonical card fields and the canonical review-log fields.
The app keeps full observation provenance in the app-owned evidence record.

The app uses the canonical SRS-to-KST bridge.
It supplies an app-owned proficiency result for each skill.
The result uses the latest effective raw rating.
The app does not use the student practice-evidence contract.

## Priority Projection

The Track 2 priority projection has these fields:

- teacher profile ID
- skill ID
- component ID
- due status
- whole overdue days
- current raw rating
- current points
- proficiency status
- evidence gap
- approved priority inputs

Comments, responses, and notes cannot change this projection.
Track 3 owns the ranked teacher queue and its tie-break rules.

## Persistence Rule

Convex owns the app records.
All reads use an organization-scoped index.
All list reads have a fixed bound or a cursor.
The app does not use `.filter()` or an unbounded `.collect()`.
The server derives the actor and organization from the authenticated session.
