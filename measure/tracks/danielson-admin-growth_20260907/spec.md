# Danielson admin and coaching improvements

Implement priorities 1–7 from the admin effectiveness assessment.
The user authorized implementation on 2026-09-07.

## Requirements

1. Show existing urgency data and direct actions. Search and filter the full authorized portfolio before pagination.
2. Add a routine coaching cycle with one target, action, support, baseline observation, follow-up date, teacher reflection, and a follow-up observation. Reuse published evidence. Enforce current scope and revision checks. Do not add an approval process.
3. Show full rating labels and specific evidence prompts. Use school-approved descriptors only when the school provides its source. Preserve insufficient evidence.
4. Connect feedback, teacher response, and coaching actions to source observations. Preserve private comment access boundaries.
5. Show baseline and follow-up evidence, dates, and source links for coaching targets. Do not calculate teacher rankings or automatic improvement decisions.
6. Provide an observer calibration protocol and a local comparison exercise for common examples. Do not publish exercise ratings as teacher evidence. Formal evaluation policy remains a school decision.
7. Add full-directory account search, selected-account actions with existing values, and an account assignment view. Preserve existing permission and deactivation rules.

## Acceptance

Test unauthorized access, cross-teacher evidence references, stale coaching changes, completion without follow-up evidence, search beyond the first page, connected teacher responses, and usable form labels.
Run app tests, lint, app and Convex type checks, build, and local browser verification.
No dependency changes. No hosted deployment. No AI implementation.

## Policy dependency

The user selected Danielson FFT. Retain the existing 2022 edition. The school
supplied descriptors for all 22 components and four rating levels on 2026-09-17.
Show the component-specific descriptors with the observation rating controls.
Keep the official reference link.

## Coaching contract details

An authorized supervisor can start, revise, or complete a routine cycle.
Only the subject teacher can write its reflection.
The teacher and currently authorized supervisors can read it.
Each update requires the current revision. Completed cycles cannot change.
A completion needs a later published observation of the same technique for the same teacher.
The follow-up must occur after the cycle starts. Completion records a human review, not a rating.
The portfolio derives coaching urgency from active cycles. It stops with a capacity error above 2,000 active cycles.
