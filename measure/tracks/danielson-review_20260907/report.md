# Danielson Whole-App Review

Correction status: see [Review corrections](fixes.md). The findings below describe the review baseline.

Date: 2026-09-07.
Scope: `apps/danielson`, its shared contracts, its Measure specifications, and its curriculum sources.
Result: The review found material content errors and workflow defects. The app needs correction before use as a reliable teacher-training and evaluation system.

This report replaces the earlier narrow review. It includes curriculum, teaching content, user workflows, authorization, data integrity, accessibility, operations, tests, and unnecessary complexity. No app source was changed. All findings remain open.

## Main results

- Fourteen training pages need substantial corrections to their technique definition or core method.
- Twenty-seven book-page ranges do not overlap the matching source extracts.
- Twelve of 38 configured videos return 404. Another points to an unrelated song.
- Unsaved observation notes disappear when the observer opens a Learn link.
- Future observation evidence can affect current proficiency and plan progress.
- Several successful mutations leave the displayed data and revision state stale.
- Two earlier findings remain: a plan can postpone overdue evidence, and its list can include a deactivated teacher.
- The training library covers 14 of 22 Danielson components. It does not form a complete training curriculum.

The [curriculum review](curriculum-review.md) contains a separate row for all 63 technique pages. It links each module to its matching source PDF. The [video check results](evidence/video-checks.json) record the metadata checks.

## Confirmed defects

Priority P1 means that the issue should be corrected before teachers rely on the affected instruction. P2 means a material defect in normal use. P3 means a lower-impact usability or maintenance issue. Product decisions and unverified risks appear separately below.

### F01 — P1: Several pages teach a different technique

Locations: `content/learn/techniques/`, especially `art-of-the-sentence.ts:11`, `batch-process.ts:11`, and `brighten-the-lines.ts:11`.

Art of the Sentence teaches the teacher to write a lesson objective. Its source teaches student sentence-level writing. Batch Process teaches administrative batching. Its source teaches a sequence of student contributions before the teacher responds. Brighten the Lines teaches posted behavior expectations. Its source teaches clear starts and ends of activities.

The same review found substantial method errors or omissions in Accountable Independent Reading, All Hands, Board = Paper, Break It Down, Delivery Moves, Front the Writing, Make Expectations Visible, Own and Track, Phrasing Fundamentals, Show Call, and What to Do. The curriculum table states the required correction for each page.

These are instructional errors. A working page and a passing catalog test do not make the guidance accurate. Rewrite these pages from the matching source. Keep school adaptations explicit. Verify the definition, steps, example, and assessment criterion together.

Verification: Read all 63 modules. Compared each technique definition with its matching local Teach Like a Champion 3.0 extract. Read the relevant source sections for the mismatches above.

### F02 — P2: Content loses source distinctions and adds unsupported rules

Locations: `content/learn/techniques/cold-call.ts`, `active-observation.ts`, `radar-be-seen-looking.ts`, `double-plan.ts`, `warm-strict.ts`, and the other annotated rows in the curriculum review.

Cold Call puts the student's name before the pause. The source describes question, pause, then name. Active Observation omits written tracking during observation. Radar gives a blanket instruction not to look at a clipboard. The source applies its scanning instruction to the moment after directions. These pages give conflicting advice.

Other pages turn a limited practice into a universal rule. Examples include a 30-second passive-time limit, continuously moving around the room, and treating a lack of will as the usual cause of student difficulty. Some summaries make causal research claims without a source. Emotional Constancy and Engineer Efficiency also contain accidental mixed-language text.

Correct the specific instructions. Remove unsupported claims. Separate source guidance from local advice. Use short steps with observable outcomes.

### F03 — P2: References and quotation treatment are unreliable

Locations: `components/learn-technique-view.tsx:66`, `:88`, and the literature fields in the technique modules.

Twenty-seven numeric book-page ranges do not overlap the page markers in the corresponding source extract. Four other fields contain a technique or chapter identifier but render under “Pages”. Three modules have no literature entry.

Sixty-two modules contain a quotation. A normalized exact-text search found only one in its matching extract. The other 61 need verification. This search does not prove fabrication. The renderer nevertheless presents them as block quotations without a named speaker or passage citation.

Correct the references. Verify direct quotations against the source. Present a paraphrase as a paraphrase. Do not convert an unverified quotation into a claimed source passage. No new citation database is required.

### F04 — P2: Training videos are unavailable or unrelated

Locations: the video fields in the technique modules; `components/learn-technique-view.tsx`.

YouTube oEmbed returned 404 for Active Observation, Break It Down, Emotional Constancy, Engineer Efficiency, Exit Ticket, Firm Calm Finesse, Means of Participation, Phrasing Fundamentals, Replace Self-Report, Retrieval Practice, Silent Solo, and Warm Strict. Threshold and Strong Start points to “Schoolhouse Rock, conjunction junction”.

A valid-looking video ID passes the renderer's check. It does not establish availability or relevance. Replace or remove the affected links. Give users a usable alternative when a video cannot load.

Verification: Checked metadata for all 38 configured demonstrations. Full playback and school-network access were not tested. Twenty-five other pages have no configured video; the current specification allows that.

### F05 — P2: Learn displays incorrect Danielson component names

Location: `components/learn-index.tsx:13-16` and technique alignment fields.

The index derives a component title from the first technique in that group. The live index calls 3e “Using Physical Delivery”. The graph calls it “Responding Flexibly to Student Needs”. Other labels are shortened or use older wording.

Use the existing canonical component title source. Keep the technique mapping separate from the component name. This change needs no new registry.

### F06 — P2: A Learn link discards unsaved observation evidence

Location: `components/observation-form.tsx:71`, `:176`.

The form keeps edits in local component state. Its Learn link navigates in the same tab. It neither saves the draft nor warns about unsaved changes. An observer can type evidence, open the linked training page, return to the draft, and find an empty note.

Verification: Reproduced in Chrome against the local stack as the school head. The note was present before navigation and absent on return. The temporary review draft was discarded successfully with HTTP 200. No submitted observation was created.

Preserve the draft before navigation or prevent accidental navigation until the observer chooses what to do. Include ratings as well as notes in the regression case.

### F07 — P2: Future observations affect present results

Locations: `lib/observations/lifecycle.ts:41-46`, `components/observation-start-form.tsx`, `lib/improvement-plans/progress.ts:67-76`.

The observed date must parse, but it can be in the future. Submission publishes that date as the evidence time. Plan progress checks the approval and end dates but does not exclude evidence later than the current time.

Verification: Submitted a pure draft fixture on September 1 with an observed date of September 20. The lifecycle accepted it. A plan projection evaluated on September 1 treated that evidence as meeting the target and moved the due date to September 27.

Reject future observed dates at submission. Apply the rule on the server. Also prevent future evidence from entering a current-time projection. Test date boundaries and the configured time zone.

### F08 — P2: A plan postpones an existing overdue date

Location: `lib/improvement-plans/progress.ts:36-44`.

The Performance Improvement Plan (PIP) overlay replaces the spaced repetition system (SRS) due date with seven days after approval or the latest rated evidence. It does not compare that date with the existing due date.

Verification: A skill due on August 31 became not due until September 8 after a September 1 plan approval. Its overdue count changed from one to zero. The fixture had no later rated evidence and an October 1 plan end.

Keep the earlier valid due date. The plan's maximum seven-day interval must not remove an existing overdue signal.

### F09 — P2: The plan list includes a deactivated teacher

Locations: `convex/improvementPlans.ts:1458-1467`; `convex/foundation.ts:607-609`.

The list checks the teacher profile's active flag. Account deactivation disables the account and credential but leaves the profile active. The list therefore returns the teacher name and plan metadata. The detail query rejects the same subject with `target_inactive`.

Verification: Created a proposed plan in the existing in-memory fixture. Deactivated the teacher account. The list returned it; the detail handler denied it.

Apply the linked-account status check in both organization-wide and assignment-based list paths.

### F10 — P2: Saving a proposal leaves an unusable form state

Location: `components/improvement-plan-proposal-form.tsx:97-109`.

The form reads only an error field from the response. On success it displays a message but retains the original `planId` and `expectedRevision`. It also clears the request ID and permits another save.

A second save on a new proposal still submits a null plan ID. A second save on a revision still submits the old revision. The form cannot continue from the record it just saved. A duplicate or conflict response can result even though the user followed the visible workflow.

Navigate to the saved plan, or adopt the returned identity and revision. Test a successful save followed by the next valid user action.

Verification: Traced the client payload, receipt handling, and backend proposal rules. This review did not create a persistent plan in the demo database.

### F11 — P2: Other successful changes leave the page stale

Locations: `components/account-create-form.tsx:25-30`, `admin-change-form.tsx:53-58`, `improvement-plan-decision-forms.tsx:51`, `teacher-report-view.tsx:80-96`, `report-comment-form.tsx`, and `teacher-response-form.tsx`.

These handlers update a success message or local flag but do not refresh the server data. A newly created account is absent from the directory and role controls. A new department is absent from assignment choices. Plan approval and closure leave the old status visible. Get Better Faster assignment leaves the report data unconfigured until reload. New comments and responses do not appear in the displayed record.

Refresh the affected data after success. Preserve any one-time temporary password while updating the account directory. Use the saved result where that is sufficient. Verify the whole create-to-use workflow, not only the success message.

### F12 — P3: Navigation and controls create avoidable friction

Locations: `components/site-header.tsx`, page-level header props, `components/leadership-portfolio-table.tsx`, and `app/globals.css`.

Role links disappear between sections because each page supplies a different subset. A supervisor must return to Overview to switch between some workflows. The leadership portfolio also offers Start improvement plan on the signed-in teacher's own row, although the backend rejects self-evaluation.

The mobile navigation links measured about 22.3 pixels high. Several graph controls are below the project's 44-pixel target. This is a project usability issue; it is not a claim that every small link violates an accessibility standard.

Use consistent role-aware navigation. Hide unavailable self-actions. Increase touch areas where needed. The tested mobile pages had no horizontal overflow, and graph selection worked by keyboard.

### F13 — P3: Product documentation describes an obsolete scope

Locations: `product.md`, `architecture.md`.

The product document still says later tracks will add observations, reports, plans, and the Get Better Faster sequence. Those features now exist. The architecture document also centers the initial route set.

Update these documents to the current app. Keep historical track specifications as history. Avoid maintaining conflicting descriptions of the current product.

## Product omissions and design risks

These items need explicit product decisions. They are not all violations of the delivered track specifications.

### G01 — High: The reference library is not a complete curriculum

The 63 techniques cover 14 of 22 components. There is no training for 1b, 1d, or 4a–4f. The empty Domain 4 section does not explain that limit. The Learn track intentionally excluded additional techniques, learning progress, and several other features.

The app has no structured sequence of practice, checks for understanding, or feedback. Add the missing content and a small practice structure if the product is intended to train teachers. Do not claim full framework coverage from the current catalog. See the full curriculum table.

### G02 — High: Observers have no rating descriptors at the decision point

`components/observation-form.tsx:187` labels the choices Rating 1 through Rating 4. The app does not provide component performance descriptors or calibrated examples beside those choices. Notes are optional under the existing specification.

Those ratings affect proficiency, SRS, and plans. Supply the school's approved rubric and examples at the rating point. Define what evidence is sufficient. The official framework describes component-level professional practice; technique completion alone does not establish the full component. [Danielson framework](https://danielsongroup.org/the-framework-for-teaching/).

### G03 — High: Published metadata and incomplete formal records lack a correction path

A draft accepts between one and 22 formal components. The official projection summarizes only the submitted items. One component rated 3 can therefore produce a Proficient evaluation status while the other 21 components are absent. The one-record-per-type-and-school-year rule then prevents a second formal record in that slot. Amendments change existing outcomes and notes; they cannot add missing components or correct the teacher, observed date, or school year.

Locations: `lib/observations/lifecycle.ts:80-85`, `lib/reporting/projections.ts:315-359`, and observation amendment handlers.

Decide whether a formal evaluation must contain all 22 components, including explicit insufficient-evidence outcomes. Otherwise label its scope and status as partial. Define a correction or void-and-replace path for wrong metadata. Do not silently rewrite published evidence.

Verification: Code trace of validation, formal uniqueness, amendment shape, and summary logic. The intended policy for partial official evaluations remains a product decision.

### G04 — Medium: Get Better Faster progress is not actionable

`components/teacher-report-view.tsx:116-134` shows phase names and counts. It does not identify the next action steps, due skill names, or gap names within each trajectory. The teacher cannot use this section alone to select the next practice task.

Expose the existing step and skill data with Learn links. Define the supported edition. The repository source contract notes ambiguity in the supplied source's edition. The current official Get Better Faster 2.0 document differs from the supplied sequence. That does not by itself make the approved implementation wrong. [Uncommon Schools sequence](https://uncommonschools.org/wp-content/uploads/2025/04/Get-Better-Faster-Scope-and-Sequence-of-Action-Steps.pdf).

The model also treats a primary skill rating as completion evidence for an action step. Some primary skills occur in more than one step. Formal component evidence can propagate to several child skills. These are existing design choices. Validate the meaning of “complete” with the school before treating it as direct observation of every action step. There is no user-facing unassignment or restart workflow.

### G05 — Medium: Administrators cannot inspect current assignments

The department and coach pages provide assignment and removal forms. They do not list the existing teacher memberships, department-head relationships, or coach-to-teacher relationships. Administrators must already know the relationship they want to remove.

Show the current assignments beside the existing controls. Reuse the authoritative assignment data. Do not create a second assignment record system.

### G06 — High: Account recovery and session invalidation are incomplete

The app issues a temporary password once. Password change requires the current password. There is no administrator reset or forgotten-password workflow. A lost temporary password or failed response after account creation can leave the user unable to sign in without developer intervention.

Password change also does not invalidate other signed session tokens. The shared session lifetime is 12 hours. Current account, credential, role, and scope checks are useful, but a password change is not a session revocation mechanism. Account deactivation blocks access while inactive; reactivation can make an unexpired old session usable again.

Define and implement recovery and revocation behavior. This is a source-traced operational and security gap, not a demonstrated stolen-session incident. No credentials were exposed or changed during this review.

### G07 — Medium: Bounded reads create a capacity ceiling

The report code limits teachers to 250, accounts to 1,000, and several histories to 2,000 rows. The leadership portfolio counts formal records across school years. At 250 teachers and two formal records each year, four years reaches 2,000 records before amendments are considered. Subsequent growth can return a capacity error for the whole portfolio.

Locations: `convex/reporting.ts:51-59`, `:368-387`, and the equivalent guards in `convex/observations.ts`.

Document the supported history and organization size. Test the capacity boundary. Add bounded pagination or a suitable query scope when actual requirements exceed it. Do not remove guards or add caches without a demonstrated need.

## Unnecessary content and complexity

- Shorten repeated descriptions and detailed summaries. On mobile, long introductory prose delays the action steps. Retain the source distinction, an example, and the steps.
- Remove unverifiable quotation decoration. It adds authority without usable attribution.
- Remove incorrect or unavailable media until a suitable replacement is verified.
- Reuse canonical component names. Do not store competing names in each alignment string.
- Remove links to actions that the current subject cannot perform.
- Keep historical plans separate from current product documentation.

The review did not establish a safe list of unused runtime modules to delete. Similar-looking domain code can enforce different authorization or evidence rules. Do not remove validators, scope checks, concurrency controls, or audit history as cosmetic cleanup. No new registry, hash, cache, or manifest is needed for the corrections above.

## Coverage and verification

| Area | Review performed | Result or remaining limit |
|---|---|---|
| Routes and requirements | Inventoried page and API routes; compared active feature specifications | Findings and policy gaps above |
| Curriculum | Read all 63 modules; matched local source extracts | Separate 63-row review |
| Media | Checked all 38 configured demo metadata endpoints | 12 unavailable; one unrelated; playback not certified |
| Authentication and authorization | Traced current account, credential, organization, role, subject, and assignment checks | No additional cross-organization or private-comment disclosure found in reviewed paths; F09 remains |
| Role behavior | Browser checks for eight demo accounts across admin, leadership, coach, HOD, and teacher paths | Expected access or denial in tested routes; no captured page errors |
| Observation lifecycle | Traced create, draft save/discard, submit, reads, and amendments; tested draft navigation | F06, F07, G03 |
| Evidence and reporting | Reviewed projections, SRS integration, provenance, comments, responses, and formal summaries | F08, F11, G02–G04 |
| Improvement plans | Reviewed proposal, approval, acknowledgment, revision, closure, priority, and scope | F08–F10; no persistent browser plan created |
| Administration | Read account, role, department, and coach controls; opened admin routes | F11 and G05–G06; no user accounts changed |
| Graph and mobile layout | Tested graph zoom, fit, keyboard selection, and 390-pixel layouts | No horizontal overflow in checked pages; small touch targets remain |
| Operations | Reviewed scripts, local configuration flow, bounded reads, and documentation | G07; hosted deployment and disaster recovery not exercised |
| Maintainability | Reviewed repeated labels, stale docs, renderer use, and tests | Targeted simplification list; no speculative deletion list |

All app quality commands passed:

- `CI=true npm run test --workspace=apps/danielson -- --maxWorkers=2`: 59 files and 378 tests.
- `npm run lint --workspace=apps/danielson`.
- `npx tsc --noEmit --project apps/danielson/tsconfig.json`.
- `npx tsc --noEmit --project apps/danielson/convex/tsconfig.json`.
- `npm run build --workspace=apps/danielson`.
- An additional coverage run passed the same 378 tests. It reported 85.30% statements, 74.83% branches, 91.93% functions, and 90.43% lines. The configuration does not explicitly include every source file in coverage. These percentages are not a whole-app completeness claim.

The current tests do not prevent the confirmed content mismatches or the reproduced workflow defects. Add focused regressions for F06–F11. Verify corrected curriculum against the sources. Do not write a test that merely repeats incorrect content constants.

## Review limits

This is a whole-app review by area, not a proof that all possible issues are absent. It combines source inspection, existing tests, targeted fixtures, source comparison, and local browser checks. It is not a line-by-line audit of every dependency.

The browser used fictional local demo data. The local backend was started with an already installed matching binary. No hosted deployment was changed. One temporary draft was created and then discarded. No accounts, plans, ratings, comments, or teacher responses were published by the browser checks.

Not performed: production penetration testing, school-network video playback, full video viewing, screen-reader testing, exhaustive browser/device coverage, load testing at the documented ceilings, backup restoration, hosted deployment verification, or an independent teacher calibration study. Research claims and source quotations need further verification where marked. The supplied source extracts establish the technique comparisons; they do not resolve the school's intended framework edition or evaluation policy.

## Recommended correction order

1. Correct the fourteen substantially inaccurate lessons. Repair references, quotations, and media.
2. Protect unsaved observations. Reject future evidence. Preserve earlier due dates.
3. Correct plan list scope and successful-mutation state handling.
4. Define formal evaluation completeness, metadata correction, rubric support, and account recovery.
5. Make training progress actionable. Add missing curriculum coverage through an explicit scope decision.
6. Improve assignment visibility, navigation, touch targets, current documentation, and capacity handling.
