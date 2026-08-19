# Specification: Performance Improvement Plans

## Overview

Create a one-month Performance Improvement Plan (PIP) workflow from the current
school form. Any authorized supervisor can propose a plan. An authorized Senior
Leadership Team (SLT) member must approve the plan before it starts.

The plan links areas of concern and required actions to Danielson components and
approved GBF or TLAC skills. Observation evidence updates progress. Comments do
not update progress. The application records the plan and its outcome. It does
not make a disciplinary or retention decision.

## Roles

- HODs can propose a PIP for teachers in their departments.
- Coaches can propose a PIP for assigned teachers.
- School heads and SLT members can propose a PIP for teachers in their
  organization.
- An SLT member approves and closes a PIP.
- A system administrator cannot propose, approve, close, or view a PIP unless
  the same account has the required supervisor role.
- A teacher can view and acknowledge their own approved PIP.

## Functional Requirements

1. **FR-1 — Source contract:** Preserve every field in the current form and the
   normalized mapping in `pip-form-analysis.md`.
2. **FR-2 — Danielson scope:** Link structured targets only to Danielson
   components and approved GBF or TLAC skills. Do not score culture fit, market
   availability, Courage, Adaptability, Persistence, attitude, or growth
   mindset.
3. **FR-3 — Supervisor proposal:** Permit any authorized supervisor to submit a
   complete, versioned proposal for a teacher within scope.
4. **FR-4 — Inactive proposal:** Keep a proposed plan inactive. It must not
   change KST, SRS, due dates, queue priority, or reports as an active PIP.
5. **FR-5 — SLT approval:** Require an authenticated SLT approval event before
   the plan starts.
6. **FR-6 — One-month period:** Default the end date to 30 calendar days after
   approval. Permit the proposer to set the end date and review meeting date
   before approval.
7. **FR-7 — Immutable approval:** Freeze the approved form, targets, source
   links, consequences text, and dates. A material change creates a new proposal
   version and new approval.
8. **FR-8 — Acknowledgment:** Record teacher and supervisor acknowledgment actor
   and time. Do not represent the record as a legal digital signature.
9. **FR-9 — Target priority:** Give each active target skill high SRS priority
   and a maximum seven-day evidence interval during the plan.
10. **FR-10 — Evidence progress:** Derive target progress from Track 2 rated
    evidence. Exclude `not_enough_evidence`, comments, and teacher responses.
11. **FR-11 — On-track status:** Mark an active plan off track when target
    evidence is overdue. Also mark it off track at the review date when a target
    remains below the approved expected standard.
12. **FR-12 — Report projection:** Give Track 4 the plan state, days remaining,
    target proficiency, evidence due, support, completion criteria, and outcome.
13. **FR-13 — Audited closure:** Require an SLT member to close a plan with
    `successful` or `insufficient_improvement`, an outcome note, actor, and time.
14. **FR-14 — No automated discipline:** Do not create a termination,
    retention, warning, or other disciplinary recommendation.
15. **FR-15 — History:** Keep every proposal, approval, acknowledgment, version,
    evidence link, and closure event across school years.

## Non-Functional Requirements

- Treat PIP data as restricted personnel data.
- Apply Track 1 organization, role, scope, and self-subject rules on the server.
- Keep approved records and lifecycle events append-only.
- Keep target evidence references stable when graph or source releases change.
- Use bounded, indexed queries for plan lists and evidence history.
- Make the plan form, acknowledgment, and progress view accessible.

## Acceptance Criteria

1. Every field from the current PIP form is present in the approved record.
2. An HOD, coach, school head, or SLT member can propose a PIP only within scope.
3. A proposal makes no proficiency, KST, SRS, queue-priority, or active-plan
   change before SLT approval.
4. An SLT approval starts the plan and freezes its version.
5. The active plan gives each target a maximum seven-day evidence interval.
6. Rated evidence updates target progress. `not_enough_evidence`, comments, and
   responses do not update progress.
7. The approved plan shows the teacher the full plan and permits one teacher and
   one supervisor acknowledgment record.
8. A material change creates a new proposal version. It does not modify the
   approved version.
9. Track 4 shows plan status, days remaining, target progress, evidence due, and
   closure outcome.
10. An SLT member can close the plan with one of the two approved outcomes and a
    dated note.
11. The application does not produce a retention or disciplinary recommendation.
12. Courage, Adaptability, and Persistence can appear as school values but have
    no score and no effect on teacher proficiency.
13. Cross-organization, out-of-scope, system-administrator-only, and
    unauthenticated requests return no protected PIP data.
14. Authorization, audit, immutability, accessibility, tests, coverage, lint,
    typecheck, build, generated-fact, boundary, and Measure Doctor gates pass.

## Out of Scope

- Culture-fit scoring.
- Teacher-market or subject-shortage data.
- Growth-mindset or attitude scoring.
- Automatic retention, warning, termination, or disciplinary decisions.
- A legal digital-signature service.
- Comments that change plan progress.
- More than one active PIP for the same teacher.
