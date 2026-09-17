# Danielson admin experience and teacher improvement assessment

Date: 2026-09-07.

## Assessment

The app has a useful foundation for evidence collection and formal improvement plans.
The next priority is to connect observations to feedback, practice, and follow-up.
Leaders should be able to answer four questions from one workspace:

1. Which teacher needs my attention?
2. What evidence explains the need?
3. What action have we agreed?
4. When will we check whether the action helped?

This assessment covers the current source and the completed September review.
It does not include a new browser test, user interviews, or a study of teacher outcomes.
Recommendations are design proposals. They are not measured effects.
No application code or hosted data was changed.

## Current strengths

- The observation workspace ranks teachers and selects up to three targets.
- Observers can save drafts and record insufficient evidence without assigning a low rating.
- Reports link to evidence sources and distinguish official evaluations from current proficiency.
- Teachers can read published evidence and submit responses.
- Formal plans include actions, school support, success criteria, approval, and closure.
- Get Better Faster (GBF) provides named next steps and links to technique instruction.
- Evaluation access remains separate from system administration.

Preserve these functions. Build on their current data and permission rules.

## Priorities

### 1. Make the leadership workspace action-oriented

Current evidence: `apps/danielson/app/page.tsx` shows account details and navigation.
`app/reports/page.tsx` accepts a page cursor but has no search or filter controls.
`components/leadership-portfolio-table.tsx` shows compact status and a plan action.

Start with the existing portfolio and observation queue.
Show the next evidence date, overdue days, plan review urgency, and a direct next action.
The current portfolio projection already includes `nextDueAt`, `maximumOverdueDays`,
`daysRemaining`, and `trackState`. Use these fields before adding stored data.
Add teacher search and filters for department, assigned supervisor, and attention reason.
Apply search and filters across the authorized result set, before pagination.
Do not filter only the visible page.

Later, add feedback and follow-up tasks when those events have a defined data source.
Do not infer that feedback occurred from the existence of a comment.

Success check: a leader can find a named teacher or the next due action without scanning pages.
Measure task completion time before and after the change.

### 2. Add a short routine coaching cycle

Current evidence: `components/improvement-plan-proposal-form.tsx` requires seven narrative fields,
a review date, targets, and a proposal for approval. This is suitable for a formal process.
The reviewed app has no dedicated short routine coaching cycle.

Give routine coaching a small record: one target, an agreed action, school support,
a follow-up date, and links to existing evidence. Let the teacher add a reflection.
Do not copy observation evidence into a second record.
Use the existing formal plan when the school requires formal intervention.
Do not create a second approval process for routine coaching.

Example: agree to check every student's response before independent practice.
The coach models the routine. The teacher rehearses it. The teacher uses it in a lesson.
The next visit checks both the teacher action and the student response.

Success check: each active cycle has a specific action and a scheduled evidence check.

### 3. Improve rating support at the point of observation

Current evidence: `components/observation-form.tsx` shows numeric rating choices,
a generic rating guide, and an evidence text field. The approved component descriptors remain open.

Show the approved component descriptor beside the rating controls.
Show full rating labels without requiring the observer to open the guide.
Use an evidence prompt: “What did the teacher do? What did students do? What happened next?”
Keep observation facts distinct from the observer's interpretation.
Show the previous agreed target and a link to its evidence.
Keep “Not enough evidence” available.

Before implementing rubric content, the school must select the edition and supply approved material.
Do not treat a technique-to-component mapping as proof of complete component proficiency.

Success check: sample records contain specific observed actions and a supported rating.
Check records with a second trained observer.

### 4. Make feedback and teacher response one connected conversation

Current evidence: `components/teacher-report-view.tsx` places evidence history, public comments,
private comments, and teacher responses in separate report sections.
Teacher participation exists. The opportunity is to connect it to the relevant action.

Place published feedback, teacher reflection, and the next action beside the source observation.
Use three prompts: “What worked?”, “What is the next action?”, and “What support is needed?”
Show teacher-visible content clearly before publication.
Keep private leadership comments within their existing access boundary.

Use a short post-observation conversation to agree on one action.
Teacher acknowledgment must not imply agreement with the rating.

Success check: ask teachers to state their current target, next action, and available support.

### 5. Show progress with context

Current evidence: the teacher report contains current proficiency, a graph, and evidence history.
The portfolio compresses this information into status categories.

Add a simple target view: baseline evidence, recent evidence, dates, and next review.
Distinguish direct component evidence from mapped technique evidence.
Keep evidence coverage and recency visible beside proficiency.
Show unresolved gaps as gaps, not failure.
Avoid teacher league tables or an unexplained overall numerical average.
Do not treat more observations or higher ratings alone as proof of improvement.

Success check: a reviewer can identify the evidence behind each claimed improvement.

### 6. Establish observer calibration and formal evaluation rules

The existing review leaves rubric selection, complete formal coverage, and published metadata
correction policy open. Resolve these before expanding formal evaluation automation.

Run calibration meetings with a common lesson example.
Observers record evidence and rate independently. They then compare evidence and descriptors.
Discuss disagreements before using the example as guidance.
Start with a manual process. Build calibration software only if repeated use requires it.
Use evidence from more than one occasion when making a formal judgment.
Include planning, student work, and professional evidence where the approved rubric requires them.
A short classroom visit cannot establish all 22 components.

Success check: track exact rating agreement and disagreements greater than one level.
Also review the quality of the evidence and rationale. Agreement alone does not prove accuracy.

### 7. Reduce account and assignment work

Current evidence: `app/admin/accounts/page.tsx` builds action selectors from the current account page.
It shows account IDs and separate forms. `app/admin/relationships/page.tsx` displays assignments,
but sends the administrator to another page to manage them.

Add account search and row actions. Open the selected account with current values.
Remove single-option “Action” selectors from task-specific forms.
Put role, department, and coach assignments together in the account detail view.
Show assignment gaps and supervisor workload where current records can supply them.
Keep account IDs in an optional details view.
Preserve deactivation confirmation and the separation of administrative and evaluation access.

Success check: test account creation, role change, coach reassignment, and password reset.
Measure time and wrong-account selections with realistic directory sizes.

## Suggested pilot

Use one department for six weeks. These durations and thresholds are proposed pilot settings.
They are not research-established requirements.

- Week 1: record baseline task times and review a sample of observation records.
- Weeks 2–5: use one coaching target per teacher. Provide feedback within two working days.
  Schedule a follow-up within ten teaching days where timetables permit.
- Week 6: review repeated evidence, teacher feedback, and administrator workload.

Track these measures:

| Measure | Definition |
|---|---|
| Admin effort | Median time to find a teacher, start an observation, and update an assignment. |
| Feedback delay | Working days from observation to teacher-visible feedback. Record the event explicitly. |
| Follow-up completion | Due coaching cycles with a completed evidence check divided by all cycles due. |
| Teacher clarity | Share of teachers who can identify their agreed action and school support. |
| Observed improvement | Targets with supported improvement at follow-up divided by targets reviewed. Report missing follow-up separately. |
| Evidence quality | Sampled ratings with specific evidence and a matching descriptor divided by ratings sampled. |
| Calibration | Exact agreement and large disagreements on common examples. |

Record the baseline before setting improvement targets.
Compare similar contexts. Do not claim that the app caused a change in student outcomes from this pilot alone.
Use a small manual worksheet for the pilot before building an analytics system.

## Delivery order

1. Display existing urgency fields and direct actions. Add teacher and account search.
2. Agree on the rubric, coaching protocol, and formal evaluation rules.
3. Add the small coaching cycle and connected feedback view.
4. Add target progress views after the pilot identifies the information leaders use.

The first increment needs no new dashboard framework or duplicated status tables.
The coaching cycle needs a separate implementation specification for ownership, visibility,
completion, and the minimum new fields. This assessment does not authorize unresolved school policies.

## Research basis

The Danielson Group describes reflection, feedback, and collaborative inquiry as uses of the
Framework for Teaching. It connects reflection to evidence of student learning and changes in practice.
This supports the proposed connection between evidence, teacher reflection, and the next action.
Source: https://danielsongroup.org/the-framework-for-teaching/

The Education Endowment Foundation's Effective Professional Development guidance addresses
professional development design and teacher time pressures. It provides planning and reflection tools.
This supports piloting a focused process and measuring workload. It does not validate this app.
Source: https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/effective-professional-development

Sources checked on 2026-09-07.
