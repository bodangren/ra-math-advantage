# Precalculus Q37 unit 6 teacher query integration

Parent and independent review accept the two-path teacher query candidate.

The internal query returns canonical Topic 1.1 Worked acknowledgements that the teacher can confirm. It requires active matching teacher and learner credentials, the same organization, an exact current approved source, and a valid acknowledgement. It checks unique active enrollment and assignment records that existed when the learner acknowledged the source. Invalid enrollment and assignment timestamps fail closed. It omits an acknowledgement only when exact teacher confirmation exists.

The query returns six public fields. Class choices contain only class identity and name. It uses indexed reads and the committed source, acknowledgement, and teacher-confirmation helpers. It preserves the committed learner course handlers.

The valid baseline had 21 failures because the handler was absent. The first publication fixture was incomplete and did not establish that baseline. The corrected complete hypothetical fixture established the valid Red run. The final query suite passes 23 tests, including NaN enrollment and infinite assignment timestamps.

The candidate passed 203 Topic 1.1 tests. Independent review and parent verification each passed 140 authority tests in four files. These include real acknowledgement creation, candidate retrieval, the selectedLearningEvidence teacher writer, and removal of the confirmed candidate. Parent lint, fresh build, and post-build standalone TypeScript passed.

Parent test command: `CI=true npm test -- __tests__/convex/topic11-teacher-candidates.test.ts __tests__/convex/topic11-selected-teacher-backend.test.ts __tests__/convex/selected-topic11-submission-writer.test.ts __tests__/convex/course-selected-lesson.test.ts`. Parent gates: `npm run lint`, `npm run build`, and `npx tsc --noEmit -p tsconfig.parent-check.json`. The temporary configuration disabled incremental compilation and mapped practice-core to candidate source. It was removed after verification.

Each staged path matches the tested candidate. The route, form, dashboard, and composed seed flow remain open. This integration does not approve content, deploy, change dependencies, or claim full unit 6 completion.
