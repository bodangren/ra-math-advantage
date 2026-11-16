# Specification: GBF Sequence and TLAC 3.0 Mapping

## Purpose

Use the supplied Get Better Faster (GBF) scope and sequence to organize Teach
Like a Champion 3.0 (TLAC 3.0) skills. Keep Management and Rigor as separate
paths. Use existing Danielson proficiency and due-date data.

This track does not create graph edges. It does not create a release system or
a review workflow.

## Requirements

1. Record the supplied source filenames and visible page counts.
2. Preserve the five GBF phases and the source order of each action step.
3. Keep Management and Rigor as separate paths.
4. Map each action step to one primary TLAC skill.
5. Map related TLAC skills as support skills.
6. Mark each mapping as direct or inferred.
7. Give each inferred mapping a short rationale.
8. Keep the 13 skills without a supported GBF placement as unsequenced skills.
9. Let a school head or Senior Leadership Team (SLT) member assign GBF to a
   teacher in scope.
10. Store the assigned and unsequenced skill lists with the assignment.
11. Return the current assignment when the same assignment is submitted again.
12. Show each path's current phase, proficient skills, due skills, and gaps.
13. Add the current GBF phase to walkthrough priority.
14. Use the existing Spaced Repetition System (SRS) due dates.

## Acceptance Criteria

- The sequence has 5 phases, 12 required Management steps, 13 required Rigor
  steps, and 5 preview steps.
- The mapping has 78 rows and 50 unique TLAC skills.
- Each required action step has one primary skill.
- The 13 unsequenced skills remain valid Danielson skills.
- A repeated assignment does not create a duplicate row.
- Management progress does not block Rigor progress.
- Rating 3 is the minimum passing rating.
- GBF phase priority changes walkthrough order.
- GBF does not change Danielson ratings or SRS due dates.
- Tests, lint, typecheck, build, boundaries, and Measure Doctor pass.

## Out of Scope

- The full GBF or TLAC book.
- GBF prerequisite or support graph edges.
- A graph release registry.
- A source review queue.
- A second scheduler.
- Automatic teacher assignment.
