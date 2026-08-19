# Specification: Ranked Walkthroughs and Formal Observations

## Overview

Create the complete observation-to-evidence workflow. Give each authorized
leader a ranked list of teachers within their scope. Give each selected teacher
three prioritized skill targets. Keep a walkthrough within 5–10 minutes.

The workflow also records the two official formal observations. The Q1
observation provides a baseline. The Q4 observation provides the second official
evaluation record. Submitted records are immutable. A correction creates a
dated amendment.

## Observation Types

| Type | Purpose | Expected observer |
|---|---|---|
| Walkthrough | Short, targeted proficiency evidence | Authorized HOD, coach, school head, or SLT member |
| Q1 formal observation | Official baseline evidence | HOD, Primary School coach, school head, or SLT member |
| Q4 formal observation | Official year-end evidence | School head or authorized SLT member |

All observers must also pass the Track 1 organization and scope checks.

## Ranked Queue

The queue is a role-safe projection of Track 2 KST and SRS data. It does not
replace the canonical planner or scheduler. It groups due skill cards by teacher
and gives a visible priority reason.

A teacher needs attention when one or more of these conditions are true:

- A Danielson component is below Proficient.
- Required evidence is overdue.
- An approved improvement plan is off track.

An active improvement plan and a new-teacher track can increase priority after
their source contracts are active. The first release has no manual proficiency
or cadence override.

## Walkthrough Form

The form shows exactly three distinct prioritized skills when three eligible
skills exist. Each target shows its parent Danielson component and priority
reason. The observer records one of these outcomes for each target:

- Danielson rating 1–4.
- `not_enough_evidence`.

An evidence note is optional. The form can contain a draft, but a draft is not
evidence and is not visible to the teacher. Submission publishes the
teacher-visible observation data immediately. There is no approval step.

If every target has `not_enough_evidence`, the application records the visit.
It sends no proficiency or SRS update. The targets remain due.

## Formal Observation Rules

- The Q1 record stores component ratings and acts as the official baseline.
- Track 2 fans each valid Q1 component rating out to all child skills with one
  shared provenance group.
- The Q4 record stores the second official evaluation evidence.
- A formal form can use `not_enough_evidence` for a component that the observer
  cannot rate.
- Formal evidence and walkthrough evidence remain distinct record types.

## Functional Requirements

1. **FR-1 — Scoped teacher queue:** Return only teachers that the authenticated
   observer can access under Track 1.
2. **FR-2 — KST and SRS ranking:** Rank teachers from due and overdue skill
   cards, current proficiency, evidence gaps, and approved priority inputs.
   Return a deterministic reason and tie-break result.
3. **FR-3 — Three skill targets:** Return exactly three distinct prioritized
   skills for a selected teacher when at least three eligible skills exist.
4. **FR-4 — Shortfall behavior:** When fewer than three skills are eligible,
   return all eligible skills and an explicit shortfall. Do not duplicate a
   target.
5. **FR-5 — Five-to-ten-minute form:** Keep the default walkthrough form limited
   to the three targets, their components, outcomes, and optional evidence
   notes.
6. **FR-6 — Recoverable draft:** Save and resume an in-progress form. A draft
   creates no evidence and is visible only to its authorized observer.
7. **FR-7 — Immediate publication:** On submit, finalize the record and publish
   its teacher-visible fields without a second leader approval.
8. **FR-8 — No-evidence visit:** Record a completed visit with three
   `not_enough_evidence` outcomes but create no proficiency or SRS write.
9. **FR-9 — Formal records:** Record Q1 and Q4 formal observations as official
   evidence with their required observer rules.
10. **FR-10 — Immutable submission:** Reject direct update and delete of a
    submitted walkthrough or formal observation.
11. **FR-11 — Append-only amendment:** Store a correction as a new, dated event
    that identifies the original, author, reason, and changed fields.
12. **FR-12 — Corrected evidence:** Supersede the affected evidence through the
    Track 2 adapter without counting the original and amendment twice.
13. **FR-13 — Annual continuity:** Keep evidence, KST state, and SRS schedules
    across school years. A school-year boundary must not reset or clone them.
14. **FR-14 — Idempotent submission:** Prevent retries from creating a second
    visit, rating, amendment, or downstream evidence event.

## Source-Informed Design Notes

The provided Classroom Insights handbook describes unannounced visits,
consistent observers, follow-up within 48 hours, one small action step, practice
during the follow-up, review of the prior action step during the next visit,
mid-year reflection, and final reflection. These practices are useful source
inputs. They are not acceptance criteria in this track because the school has
not yet confirmed them for this application.

The handbook uses 10–15 minute visits and a common monthly or biweekly cadence.
The confirmed local rules take precedence: walkthroughs are 5–10 minutes, and
KST plus SRS set a different cadence for each teacher.

## Non-Functional Requirements

- Keep queue reads bounded, indexed, and free of one-query-per-teacher loops.
- Derive observer identity and scope on the server.
- Preserve event time, author, source version, and provenance.
- Protect drafts and submitted records from cross-organization access.
- Keep all form controls accessible by keyboard and assistive technology.
- Do not require a timetable integration or a new assignment engine.

## Acceptance Criteria

1. An HOD queue contains only teachers in assigned departments.
2. A coach queue contains only assigned teachers.
3. A school head or SLT queue contains all eligible teachers in the
   organization and no teacher from another organization.
4. Each selected teacher receives three distinct targets when three are
   eligible. Each target includes its component and priority reason.
5. Queue results are deterministic for the same clock, evidence, graph, and
   access assignments.
6. A valid rating creates one idempotent Track 2 evidence event for each rated
   target.
7. `not_enough_evidence` creates no proficiency, KST, or SRS update.
8. A visit with no rated target remains recorded and leaves its targets due.
9. A submitted record becomes teacher-visible immediately and cannot be
   updated or deleted.
10. An amendment preserves the complete original record and corrects the
    evidence projection without double counting.
11. Q1 component ratings use the Track 2 shared-provenance fan-out rule.
12. Q1 and Q4 remain separate official records from walkthroughs.
13. A new school year preserves prior evidence and current KST and SRS state.
14. Authorization, idempotency, accessibility, tests, coverage, lint,
    typecheck, build, generated-fact, boundary, and Measure Doctor gates pass.

## Out of Scope

- Manual proficiency and cadence overrides.
- Timetable or calendar integration.
- Required observer-to-teacher follow-up meetings.
- Action-step scripting and coaching-practice records.
- Student surveys and participant-feedback surveys.
- Improvement-plan fields and approval.
- Report presentation, comments, and teacher responses.
