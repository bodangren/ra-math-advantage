# BM2 event-analysis persistence scope

## Decision

Use the existing assessment route, activity submission table, teacher detail view, and BM2 teacher endpoint.
Do not add a table, ledger, registry framework, or approval workflow.

Keep the three event activities unavailable in the production lesson while the graph node and blueprint are draft.
Use approved test fixtures to verify the future path.
Do not change the current classification activity identifiers or their evidence mapping.

## Current storage fit

The `activities` table can store the component key, stable activity identifier, props, and grading configuration.
The `activity_submissions` table can store the `practice.v1` envelope, idempotency key, attempt number, automatic score, teacher identifier, and teacher time.
The `learning_evidence` and receipt tables already store exact-node evidence and replay results.
No schema field is required for the first implementation.

The manual review state is derivable from three existing values:

- The exact event stable activity identifier
- The stored explanation and event artifact
- The presence or absence of `gradedBy` and `gradedAt`

The teacher rubric is server-owned static policy.
Do not persist a second copy of the rubric in a new field.

## Exact identity boundary

Reserve one stable activity identifier for each mode after content review.
The current `draft-bm2-*` identifiers are preview identifiers.
Do not treat them as published identifiers.

The server must use one static mapping from each reviewed stable activity identifier to:

- `math.bm2.skill.1.1.apply-accounting-equation`
- Its one allowed mode
- The `accounting-equation-event` component key
- Whether the activity can create teacher-reviewed application evidence

The server must reload the stored activity row.
It must verify the stable identifier, component key, and allowed mode.
It must verify the current graph node and blueprint publication before student access or evidence.
A client activity identifier, node identifier, mode, score, or expected answer must not select this mapping.

## Student submission path

Extend `app/api/progress/assessment/route.ts` with an exact event-activity branch.
Place this branch after authentication and request parsing.
Place it before the general `selectActivitySchema` scorer.
The branch must require a nonempty `Idempotency-Key` header.
It must load the activity row and verify the static identity mapping.
It must reject the request while the node or blueprint is draft.

For Guided and Independent modes, call the pure server grader with the raw `practice.v1` envelope.
Return the automatic score, automatic maximum score, and manual-review-required status.
Do not return expected values.
Do not return a browser correctness key that the component can use as an answer source.

For Worked mode, accept only the acknowledgement envelope.
Store no score, maximum score, grade, or teacher exposure.
The existing early check for nonempty answers must move below the exact Worked branch or exempt only this exact acknowledgement.

## Convex writer

Extend `convex/activities.ts` with one exact event branch in `submitAssessment`, or add one adjacent internal mutation if the resulting branch is difficult to review.
Reuse the existing activity and idempotency indexes.
Import and run the pure grader inside the trusted mutation for Guided and Independent modes.
This prevents a route caller from supplying a trusted score.

The writer must replace the client attempt number and time with server values.
It must store the exact physical activity document identifier and stable activity identifier.
It must store the fixed mastery contract version only for modes that can later create evidence.
It must store the raw answers and artifact.
It must store server-generated part grades for the automatic parts.
It must store the explanation as an ungraded part.
It must preserve `hintsUsed` on each Guided part.
It must reject assistance in Independent mode through the pure grader.

The current general writer removes all fields except `partId` and `rawAnswer`.
That behavior would lose Guided assistance and server part scores.
Do not send event submissions through that general branch unchanged.

The idempotency comparison must include mode, answers, parts with hint counts, and artifact.
An identical retry must return the existing submission.
A changed hint count, explanation, amount, direction, or total with the same key must return an idempotency conflict.
Do not compare only answers and artifact for this branch.

## Teacher review path

Reuse `components/teacher/SubmissionDetailModal.tsx` and the existing teacher student-detail query.
The query already returns the stable activity identifier, stored envelope, score, teacher state, and physical submission identifier.
The generic practice view already shows parts and raw answers.
Add an exact event section that shows:

- The event and starting totals
- Account categories, directions, and change amounts
- Ending Assets, Liabilities, and Equity
- The equation difference
- The learner explanation
- The automatic score
- The Guided hint count
- The server-owned manual rubric

Do not use the existing lesson-exposure button for application approval.
Add a separate label such as `Approve application evidence`.
The teacher action must be explicit.
Opening the detail view must not approve the response.

Reuse `app/api/teacher/learning-evidence/bm2-pilot/route.ts` as the authenticated teacher entry point.
The route can derive the action from the stored stable activity identifier.
It must not accept a client node identifier, score, or mode.
Extend the existing internal BM2 handler in `convex/learningEvidence.ts` with an exact event review branch.

The internal handler must recheck:

- Active teacher and learner profiles
- Same organization
- Active enrollment in a nonarchived class that the teacher owns
- Enrollment before the submission
- Published Lesson 1 version and exact phase activity placement
- Learner progress before the submission
- Exact event activity publication
- Exact learner and submission ownership
- Stored server score and all raw response fields

The handler must use a durable teacher request key.
An identical replay must keep the first teacher and time.
It must return the existing evidence and receipt.
A changed submission with the same key must conflict.

## Mastery boundary

A stored automatic score must not create application mastery by itself.
A correct Independent automatic score still has `manual_review_required` until a teacher approves the explanation and complete event model.
A Guided response can support instruction history.
It must not become application mastery.
A Worked acknowledgement must not become teacher-led exposure.

After explicit teacher approval of a correct Independent response, the internal handler can build one exact-node `mastery_advantage` event from the stored submission.
The evidence must use the stored automatic result and teacher approval.
The existing `evaluateLearningEvidenceV1` policy must still run.
The existing SRS bridge can run only when all graph, mode, assistance, correctness, teacher review, and publication gates pass.

An incorrect response can remain durable graded history.
Teacher approval must not convert an incorrect automatic result into correct mastery.
A rejected explanation must leave `gradedBy` unset and create no mastery evidence.

## Registry and props validation

Before lesson integration, add the exact component key to:

- `lib/schemas/activity-props.ts`
- `lib/activities/registry.ts`

Use a strict Zod props schema for the mode-specific public data.
The Independent schema must reject `workedSolution` and `guidedHints`.
The Guided schema must reject `workedSolution`.
The Worked schema must require its reviewed solution.

`components/lesson/ActivityRenderer.tsx` must pass the durable submission callback and key the component by activity identifier.
It must await the route result.
It must not advance after a save failure.

Add the reviewed activity rows through the existing `convex/seed.ts` lesson seed path only after curriculum approval.
Seed replay must preserve reviewed policy when content is unchanged.
A content or mode change must invalidate the reviewed activity state.
Do not seed these draft rows into the current published lesson.

## Category-response gap found before correction

The initial draft showed `Asset`, `Liability`, or `Equity` in each account row description.
It also supplies the affected account rows.
The learner therefore selects only direction and amount.
The learner does not identify each account category.

The node evidence policy requires teacher review of the model and classification evidence.
The current response does not contain learner classification evidence.
It is insufficient if the application claim includes selecting the A, L, or E category.

The minimum correction is one `account_categories` part for each case.
Use a second `SelectionMatrix` with A, L, and E columns.
Remove the category from the account-row description in Guided and Independent modes.
Keep categories visible in Worked mode.
The server-owned grader must score the exact category choice for each listed account.
The artifact must preserve the submitted categories for teacher review.

If product review decides that the node requires only account effects and equation totals, narrow the evidence description before publication.
Do not claim classification evidence from labels that the activity supplied.

## Minimum behavioral tests

Add tests for these boundaries before publication:

- Draft node or blueprint blocks the student route.
- Stored activity identity, mode, and component key must all match.
- Worked acknowledgement stores no grade and creates no exposure.
- Guided hints survive the route and writer.
- Independent assistance is rejected.
- Client grades and expected answers are rejected or ignored.
- Identical retries keep one submission row.
- A changed request with the same key conflicts.
- Teacher review requires the current class, lesson, progress, and publication checks.
- Teacher replay keeps one teacher stamp, one evidence row, and one receipt.
- Correct Independent work without teacher review creates no mastery or SRS change.
- Explicit teacher approval of correct Independent work creates exact-node evidence once.
- Incorrect Independent work stays incorrect after teacher review.
- Category choices come from learner controls and not from public labels.

## Category-response implementation

The draft component now collects `account_categories` for each case.
It uses the existing `SelectionMatrix` with Asset, Liability, and Equity choices.
Guided and Independent props contain account identifiers and labels only.
They do not contain category answers.
Worked mode shows each category with the reviewed solution.

The `practice.v1` answers, parts, and event artifact preserve the learner category choices.
Guided hint counts also apply to the category part for their case.
The private grader has the literal expected categories.
It rejects missing accounts, extra accounts, and unknown category values.
It scores one point for each correct account category.

The complete Guided response has 20 automatic points.
The complete Independent response has 16 automatic points.
The explanation stays outside the automatic score.
It keeps the `manual_review_required` status.

The three focused test files contain 21 passing tests.
They include a UI-to-grader wrong-category case.
That case preserves the learner response and scores 3 of 4 category points.

## Props schema result

The event draft now has a separate strict Zod schema.
The schema uses the mode as its discriminator.
It accepts the three current drafts.
It rejects `workedSolution`, `guidedHints`, and category answers in Independent props.
It rejects `workedSolution` and category answers in Guided props.
It requires complete account categories and a complete worked solution in Worked props.
It requires exactly one Worked case because the component renders one Worked case.

The schema requires finite, nonnegative event magnitudes.
It requires finite starting totals.
It requires nonempty and unique case identifiers.
It requires nonempty and unique account identifiers in each case.
It requires the Worked account-effect identifiers to match the exact case account identifiers.

The schema is separate from the activity-props union.
Registry integration can import it without a new schema framework.

## Registry result

The existing activity-props map now registers `accounting-equation-event` with the strict event schema.
The existing activity registry now registers `AccountingEquationEventActivity`.
The commit preserves the registry import style in HEAD.
The real `selectActivitySchema` accepts each current mode draft.
The real registry component renders each mode with direct draft props.
The validator rejects Independent answer data before rendering.

This registration does not connect the component to `ActivityRenderer`.
That connection requires the trusted assessment callback boundary.

## Independent integration checks

The parent reviewed the strict schema and the real registry test.
All 42 event tests pass in the app worktree.
Lint, standalone TypeScript, and the production build pass.
The four registration tests also pass with the patch applied to a detached HEAD checkout.
This separate check excludes unrelated registry edits in the shared worktree.
These checks do not establish publication or student-flow acceptance.

## Lesson renderer integration review

The event branch passes direct validated props to the registered component.
It awaits the assessment save and rejects a failed save.
The component retains the same envelope for retry.
The event branch does not use the generic retry action that can complete a phase without a saved assessment.

The Worked exemption requires the renderer activity identifier, Worked mode, submitted status, empty answers, empty parts, and the acknowledgement artifact.
The server must return `acknowledged: true` before the component completes.
Guided and Independent responses require numeric grade fields.
The server remains responsible for exact stored identity, publication, private grading, and manual review.

Four real component tests cover delayed persistence, failed persistence and identical retry, Worked acknowledgement without a score, and a mismatched activity identifier.
The same four tests pass with only the event patch applied to a detached HEAD checkout.
Detached HEAD TypeScript still reports pre-existing shared-package contract errors.
The authoritative app worktree passes TypeScript.
This renderer change does not publish draft activities or implement the remaining server writer.
