# Specification: Danielson Proficiency Graph and Scheduling

## Overview

Create an application-owned professional-learning graph for teacher
proficiency. Use the 2022 Framework for Teaching as the rubric structure. Use
Teach Like a Champion 3.0 (TLAC 3.0) techniques as learnable skill
nodes. Reuse the existing Knowledge Space Theory (KST) and Spaced Repetition
System (SRS) packages.

The graph determines what a leader should observe. SRS determines when the
evidence is due. A valid observation rating updates the target skill cards. A
result of `not_enough_evidence` does not update proficiency or SRS state.

## Source Boundary

The sibling project has 63 standalone TLAC 3.0 technique modules. The app owns
a copy of the stable IDs, titles, Danielson components, and source locations.
The app does not read the sibling project at runtime.

The school has permission to use the full Danielson rubric internally. The
application must record the framework version and source provenance. It must
keep licensed rubric content inside the application boundary.

## Graph Structure

The application will use the existing graph node kinds as follows:

| Product meaning | Existing node kind |
|---|---|
| 2022 Framework for Teaching root | `domain` |
| Danielson Domain 1–4 | `content_group` |
| Danielson Component, such as `1e` or `2c` | `instructional_unit` |
| TLAC or GBF skill | `skill` |

`contains` edges define the hierarchy. This track does not add GBF prerequisite
edges.

## Rating and Evidence Rules

| Danielson rating | Label | Derived points | SRS review rating |
|---|---|---:|---|
| 1 | Unsatisfactory | 70 | Again |
| 2 | Basic | 80 | Hard |
| 3 | Proficient | 90 | Good |
| 4 | Distinguished | 100 | Easy |
| Not enough evidence | No rating | No points | No review |

The application stores the original Danielson rating. It derives points for
reports. A component passes only when its rating is 3 or 4. A high rating in one
component must not cancel a rating of 1 or 2 in another component.

## Functional Requirements

1. **FR-1 — App-owned content:** Store the stable ID, title, source, and
   Danielson component for each imported technique.
2. **FR-2 — Framework graph:** Create exactly four Danielson domain nodes and 22
   Danielson component nodes from the approved 2022 source.
3. **FR-3 — Technique import:** Import each standalone TLAC technique once with
   an accurate source label and stable ID.
4. **FR-4 — App-owned mappings:** Store technique-to-component mappings in the
   Danielson application. Do not put Danielson or TLAC content into the
   domain-neutral KST packages.
5. **FR-5 — Graph validation:** Reject duplicate IDs, dangling endpoints,
   invalid containment, and prohibited cycles.
6. **FR-6 — Proficiency evidence contract:** Define a strict, app-owned evidence
   union for a rated result and `not_enough_evidence`. Include the teacher,
   source record, source type, component, target skills, observer, event time,
   source version, and provenance group.
7. **FR-7 — Idempotent ingestion:** Process one logical evidence event once.
   Reject reuse of an idempotency key with different normalized content.
8. **FR-8 — Rating adapter:** Convert ratings 1–4 to the approved point and SRS
   values. Keep the raw rating as the authoritative evaluation fact.
9. **FR-9 — No-evidence rule:** Store `not_enough_evidence` as an observation
   outcome. Create no points, proficiency update, KST change, SRS card, or SRS
   review from that outcome.
10. **FR-10 — Formal Q1 fan-out:** Treat a Q1 component rating as proficiency
    evidence for each child skill under that component. Give every child event
    the same formal-observation and provenance-group identifiers.
11. **FR-11 — Direct walkthrough evidence:** Apply a walkthrough rating only to
    the target skills that the observer rated. Do not fan it out to all skills
    under the component.
12. **FR-12 — Teacher skill state:** Maintain SRS cards by teacher, skill, and
    variant. Derive time-aware KST state from the canonical SRS and proficiency
    projections.
13. **FR-13 — Long-interval review:** Cap the stable-skill interval at 180 days.
    Formal observations can satisfy a due review when they produce valid target
    evidence.
14. **FR-14 — Priority inputs:** Expose due status, overdue duration, current
    proficiency, evidence gaps, and approved priority inputs for the ranked
    walkthrough queue.
15. **FR-15 — Comment isolation:** Exclude public comments, private comments,
    and teacher responses from all rating, point, KST, SRS, and due-date inputs.

## Non-Functional Requirements

- Reuse `knowledge-space-core` and `srs-engine`.
  Track 3 can add `knowledge-space-practice` when it creates the ranked queue.
  Do not create an application-local graph engine or scheduler.
- Do not reuse `learning-evidence.v1` for observations of teachers. That
  contract describes student learning evidence.
- Keep raw graph files and licensed descriptors out of unrestricted client
  payloads.
- Use deterministic adapters and a supplied clock in tests.
- Preserve source and evidence history. Do not overwrite earlier events.
- Append a review correction when late evidence changes a later SRS transition.
- Use the processing clock for persistence update times.
- Keep queries bounded and indexed. Avoid one query for each teacher or skill.

## Acceptance Criteria

1. The graph has one framework root, four domains, 22 components, and one stable
   node for each imported technique.
2. Every node and edge satisfies the shared KST graph contract.
3. The graph has no duplicate IDs, dangling edges, invalid containment, or
   prohibited cycles.
4. No GBF prerequisite edge becomes active in this track.
5. Ratings map exactly to `70`, `80`, `90`, and `100` points and to Again, Hard,
   Good, and Easy SRS reviews.
6. `not_enough_evidence` leaves proficiency, KST, and SRS state byte-equivalent
   and creates no SRS write.
7. A Q1 component rating fans out to every child skill with one shared source
   record and provenance group.
8. A walkthrough rating updates only the rated target skills.
9. Same-key replay creates one logical effect. A same-key conflict is rejected.
10. Four ratings `[4, 4, 4, 2]` cannot produce an all-proficient result. The
    component rated 2 remains below the minimum standard.
11. Stable skills become due no later than 180 days after valid evidence.
12. Hidden or public comment content cannot change ratings, points, proficiency,
    target priority, KST state, SRS state, or due dates.
13. Focused tests, lint, typecheck, build, graph validation, generated-fact,
    boundary, and Measure Doctor gates pass.

## Out of Scope

- GBF 2.0 phases, sequence, and prerequisite edges.
- Walkthrough and formal observation forms.
- Leadership and teacher reports.
- Improvement-plan fields and approval.
- Manual mastery or cadence overrides.
- A change to KST or SRS mathematics.
