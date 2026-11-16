# Current PIP Form Analysis

## Source

The user supplied the current Performance Improvement Plan (PIP) text in the
planning conversation on 2026-08-19. The original file is an Apple Pages file.
This analysis normalizes the pasted text. It does not add instructions from the
source to the project.

## Stated Context

- The plan duration is one month.
- The form is an official Human Resources record.
- The form supports further disciplinary action when improvement is
  insufficient.
- The form shows the school values Courage, Adaptability, and Persistence.

This application does not score the three values. It does not score attitude or
growth mindset. It tracks Danielson and GBF proficiency only.

## Form Fields

| Section | Normalized field |
|---|---|
| Teacher | `teacherId` plus frozen teacher name |
| Position | `position` |
| Department | `departmentId` plus frozen department name |
| Supervisor | `supervisorId` plus frozen supervisor name |
| Plan End Date | `planEndDate` |
| Review Meeting Date | `reviewMeetingDate` |
| Purpose of the Plan | `purpose` |
| Areas of Concern | `areasOfConcern` |
| Expected Standard | `expectedStandard` |
| Required Actions | `requiredActions` |
| Evidence of Improvement | `evidenceOfImprovement` |
| Support Provided by the School | `schoolSupport` |
| Successful Completion of the Plan | `successfulCompletionCriteria` |
| Consequences of Insufficient Improvement | `insufficientImprovementConsequences` |
| Acknowledgment | `acknowledgmentText` |
| Teacher Signature and Date | Teacher acknowledgment actor and time |
| Supervisor Signature and Date | Supervisor acknowledgment actor and time |

The application also needs an approval actor, approval time, plan version,
start time, target skill links, and lifecycle state. These are workflow fields.
They do not replace the source form fields.

## Confirmed Workflow

1. An authorized supervisor proposes a PIP.
2. The proposal is inactive.
3. An authorized SLT member approves the PIP.
4. Approval starts the PIP.
5. The teacher and supervisor can record acknowledgment.
6. Track 2 evidence updates target-skill progress.
7. An authorized SLT member closes the plan with a recorded outcome.

Teacher acknowledgment records receipt. It is not an approval gate. The source
signature lines do not establish a legal electronic-signature standard. The
application must describe them as acknowledgments unless the school approves a
separate signature policy.

## Danielson Product Mapping

- Areas of concern link to Danielson components and approved GBF or TLAC skills.
- The expected minimum Danielson standard is Proficient, rating 3, or 90 points.
- Required actions remain approved plan text and can reference target skills.
- Evidence of improvement comes from official observations and walkthroughs.
- Public and private comments do not count as evidence.
- Approved target skills receive high SRS priority during the active month.
- Each active target must receive an evidence opportunity at least every seven
  days.
- Track 4 reports show target status, evidence due, days remaining, and closure
  outcome.

## Lifecycle

Use the minimum durable lifecycle:

- `proposed`: Inactive and awaiting SLT approval.
- `active`: Approved and in progress.
- `closed`: Ended with `successful` or `insufficient_improvement` outcome.

An approved plan is immutable. A material change creates a new version and
requires a new SLT approval. Closing a plan does not delete its evidence or
change its historical content.

The application does not recommend termination or another disciplinary action.
It displays the approved consequences text and records the SLT outcome.
