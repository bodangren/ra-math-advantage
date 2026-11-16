# Precalculus Q37 unit 6 teacher surface plan

The committed teacher dashboard is a placeholder. The selected confirmation writer already exists in `convex/selectedLearningEvidence.ts`. The pending teacher route incorrectly references the broader uncommitted `learningEvidence.ts` module for this integration baseline. Reuse the committed selected writer.

## Required implementation

Add only the reviewed `getTopic11TeacherCandidates` query and its necessary helpers to committed `convex/course.ts`. Preserve the unit 4 learner query and public section projection. Do not copy the complete pending course module.

The query must require an active teacher credential. It must derive candidates from the strict current Worked source, canonical learner acknowledgements, the teacher's active classes, active enrollment, and assignments that precede the acknowledgement. Exclude other organizations, stale or malformed acknowledgements, duplicate contexts, and already confirmed submissions. Return only the exact public candidate fields.

Add the selected `recordTopic11Exposure` branch at `/api/teacher/course`. Use the existing strict request and receipt contracts. Call `internal.selectedLearningEvidence.submitTopic11TeacherSubmission`. The route must accept only the selected action in this unit. Do not include unrelated class creation, grading, enrollment, or competency mutations from the pending route.

Integrate the existing `Topic11ExposureForm` retry correction. Preserve the exact class, learner, and submission tuple after an ambiguous failure. Validate the public receipt before showing success. Prevent duplicate pending requests.

Replace the committed teacher dashboard placeholder with the selected candidate list. Require a teacher session. Render the actual exposure form with the query's exact candidate and class choices. Preserve the existing curriculum and home links. Do not import the pending broad `TeacherCourse` component or `getTeacherData` query merely to place this form. Those include separate class and grading work.

## Verification

Start from a fresh committed candidate after unit 5. Run focused query, route, form, and page tests before implementation. Use the real selected writer in the route composition test. Prove exact teacher authorization, class and learner ownership, source publication timing, canonical acknowledgement identity, replay, and zero mastery or SRS effects from teacher confirmation.

Verify that pending teacher candidates disappear after confirmation. Verify that a fresh learner query changes from waiting to ready only after the real writer succeeds. Keep source approval closed in production data. Use explicitly hypothetical approved fixtures for positive tests.

Run the unit 4 and unit 5 suites with the selected backend suites. Run lint, a fresh build, and post-build standalone TypeScript with candidate source mappings. Obtain independent review before integration.

The next verification unit must compose the real seed, learner acknowledgement, teacher page and route, learner refresh, Guided submission, Independent submission, and persisted evidence. Repeat the signed-in browser sequence against an isolated local backend. Include wrong answers, hints or reveal effects, changed source, and ambiguous-network retries. No deployment or source approval is part of this plan.
