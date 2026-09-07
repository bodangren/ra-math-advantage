# Verification report

## Implemented

- Priority 1: Teacher and department search, attention filters, own-assignment filter, evidence urgency, plan urgency, coaching follow-ups, and direct actions.
- Priority 2: Routine coaching creation, revision, teacher reflection, and completion with source evidence.
- Priority 3: Full rating labels and evidence prompts. Approved component descriptors remain pending.
- Priority 4: Source observation feedback, teacher response, and a link to agreed coaching actions. Private comments remain protected.
- Priority 5: Baseline and follow-up evidence comparisons with dates, notes, current amendments, and source links.
- Priority 6: Supervisor calibration protocol and a local comparison exercise. School evaluation policy remains unchanged.
- Priority 7: Full-directory account search, selected-account actions, current values, roles, assignment changes, assignment gaps, and coach workload count.
- AI coaching brief: Recorded as a possible feature. No AI implementation.

## Checks

- 432 tests passed in 66 files.
- App lint passed.
- App and Convex TypeScript checks passed.
- Production build passed.
- Local Convex schema and function push passed.
- Statement coverage: 85.46%. Branch coverage: 74.92%. Line coverage: 90.56%.
- Coaching backend statement coverage: 89.85%. Branch coverage: 85.36%. Line coverage: 100%.
- Coverage does not include every route file. These percentages do not establish complete app coverage.

New failing tests were observed before portfolio search, coaching persistence,
calibration, rating-label changes, observation conversation, account search,
coaching urgency, and coaching start-time validation were implemented.
Additional tests cover request identity, stable errors, input preservation, and revision behavior.

## Local browser checks

Used installed Chrome through Playwright against the local app on port 3014.
Used fictional school-head, teacher, and system-administrator accounts.

Passed: teacher search, coaching creation, evidence display, teacher reflection,
supervisor revision, source feedback, calibration comparison, account search,
current account values, current assignments, canceled deactivation, and mobile width.
The check did not publish an observation, comment, or formal evaluation.
A single fictional coaching cycle was created for the check and removed after verification.
Backend tests verify cycle completion and rejection of old or mismatched evidence.

## Manual verification

1. Open Reports as a supervisor. Search for a teacher. Check urgency and coaching links.
2. Open Coaching. Select a target with published baseline evidence. Save one action and its support.
3. Sign in as that teacher. Add a reflection. Confirm that supervisor-only actions are absent.
4. Return as a supervisor. Revise the action. Collect a later observation of that target.
5. Complete the review with that observation. Confirm that the baseline and follow-up remain linked.
6. Open the source observation. Check public feedback and the teacher response.
7. Open Observer calibration. Compare two ratings. Confirm that no teacher record changes.
8. Open an account as a system administrator. Check current values and assignments. Cancel deactivation.

## Remaining dependency

The school must identify or supply its approved rubric edition and descriptor source.
No generic text was labeled as school-approved. Formal coverage and metadata correction policy remain school decisions.
No hosted deployment changed. No dependencies were installed.

## Repository-wide check limit

Measure generation completed. Measure Doctor failed on five undeclared dependency imports
in Integrated Math 1 and AP Precalculus. It reported no Danielson boundary violation.
These failures are outside this change. The existing generated route report uses the repository
knowledge graph and does not contain the new Danielson routes. App-owned architecture documentation
lists the new routes. No unrelated generated-file changes are included in the implementation commits.
