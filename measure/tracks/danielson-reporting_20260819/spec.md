# Specification: Leadership Portfolio and Teacher Reports

## Overview

Create a compact portfolio for leaders who must review more than 50 teachers.
Lead with small status indicators. Put detailed evidence behind a teacher drill
down.

Create a teacher view of published results and public comments. Permit one
optional teacher response for each submitted observation. Do not create a
conversation thread.

## Portfolio Summary

Each teacher row has this information:

`Teacher | Danielson | IP | GBF | Evidence due`

The default order places teachers who need attention first. The status includes
low Danielson proficiency, overdue evidence, and an improvement plan that is
off track. The interface must show the reason for attention. It must not hide
the reason inside one overall score.

The improvement-plan (IP) and Get Better Faster (GBF) fields use versioned
projection contracts. Before Tracks 5 and 6 provide data, the fields show a
neutral `not_configured` state. The absence of source data must not appear as a
teacher failure.

## Teacher Drill Down

The detailed view separates these facts:

- Official Q1 and Q4 Danielson ratings.
- Current evidence-based proficiency.
- Improvement-plan progress.
- GBF progress.
- Component and skill history.
- Walkthrough and formal-observation records.
- Amendments.
- Evidence due and overdue.
- Public and private comments according to access.
- The optional teacher response.

The report stores raw 1–4 ratings and derives 70–100 points. It does not use an
average to hide a component below Proficient.

## Comment and Response Rules

- A public comment is visible to the teacher and authorized leaders.
- A private comment is visible only on the leadership teacher report.
- HODs and coaches see private comments only for teachers in their scope.
- School heads and SLT members see private comments for teachers in their
  organization.
- A leadership role does not reveal private comments on that person's own
  teacher record.
- A system-administrator role does not reveal comments or reports.
- A comment never changes ratings, points, proficiency, KST, SRS, target rank,
  or due dates.
- A teacher can submit one optional response to a submitted observation.
- The response is visible to that teacher and authorized leaders.
- The response does not change any proficiency or scheduling state.
- No person can reply to the teacher response.

## Functional Requirements

1. **FR-1 — Compact SLT portfolio:** Paginate and display one compact row for
   each teacher with Danielson, IP, GBF, and evidence-due status.
2. **FR-2 — Attention order:** Put teachers with low proficiency, overdue
   evidence, or an off-track IP before teachers with no attention reason. Use a
   deterministic tie break.
3. **FR-3 — Visible reasons:** Show why a teacher needs attention. Do not expose
   only a rank or overall number.
4. **FR-4 — Drill-down separation:** Show official Q1 and Q4 ratings separately
   from the current evidence-based proficiency view.
5. **FR-5 — Component integrity:** Show each component rating and below-standard
   status. Do not allow stronger component ratings to cancel a rating below 3.
6. **FR-6 — Evidence history:** Show target skills, parent components, source
   records, dates, observers, optional evidence notes, and amendments.
7. **FR-7 — Public comments:** Store and display teacher-visible comments with
   their source observation, author, and date.
8. **FR-8 — Private comments:** Store private leadership comments separately and
   return them only in authorized leadership teacher-report projections.
9. **FR-9 — Comment isolation:** Exclude comment text and comment presence from
   all rating, proficiency, KST, SRS, queue, summary, and due-date calculations.
10. **FR-10 — Teacher report:** Permit a teacher to read only their published
    results, public comments, amendments, and response state.
11. **FR-11 — One response:** Permit one final teacher response for each
    submitted observation. Enforce uniqueness during concurrent submissions.
12. **FR-12 — No reply:** Provide no leadership reply and no second teacher
    response.
13. **FR-13 — Role and subject safety:** Apply Track 1 scope rules and the
    private-comment subject exclusion to every report query.
14. **FR-14 — Safe projections:** Ensure teacher, system-administrator, search,
    summary, notification, and export projections do not contain private comment
    text, author identity, or private-comment counts.

## Non-Functional Requirements

- Keep the first screen small enough to scan more than 50 teachers.
- Paginate large collections. Do not use unbounded Convex reads.
- Assemble report projections without one query for each teacher.
- Use text, icons, and accessible labels. Do not use color as the only status
  signal.
- Keep private data out of client payloads before rendering.
- Keep reports read-only with respect to proficiency and scheduling state.

## Acceptance Criteria

1. The default portfolio puts every teacher with an attention reason before a
   teacher without one and shows each reason.
2. Each row shows Danielson, IP, GBF, and evidence-due status in a compact form.
3. A teacher drill down separates official formal ratings from current
   proficiency evidence.
4. Ratings `[4, 4, 4, 2]` retain the component rated 2 as below Proficient even
   when a derived average would be high.
5. Teachers can read only their own published records and public comments.
6. Authorized leaders see private comments only within their scope.
7. A leader cannot see private comments on their own teacher record.
8. A system administrator cannot read a report or comment without a second
   authorized role.
9. Adding or removing any comment leaves rating, points, proficiency, KST, SRS,
   target order, and due dates unchanged.
10. Private comment text, author, and count are absent from every unauthorized
    query and projection.
11. A teacher can submit exactly one final response to an observation. A
    concurrent second submission is rejected without replacing the first.
12. No leadership or teacher reply action exists after the teacher response.
13. Report queries create no observation, evidence, KST, or SRS writes.
14. Authorization, privacy, concurrency, accessibility, pagination, tests,
    coverage, lint, typecheck, build, generated-fact, boundary, and Measure
    Doctor gates pass.

## Out of Scope

- Teacher ranking for retention decisions.
- Culture-fit and teacher-market data.
- Retention recommendations.
- Growth-mindset or attitude scoring.
- Comment discussion threads.
- Editing submitted observations through a report.
- Improvement-plan field definitions.
- GBF source sequencing.
