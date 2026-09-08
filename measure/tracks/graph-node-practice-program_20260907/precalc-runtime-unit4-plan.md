# Precalculus Q37 unit 4 plan

## Result

Unit 4 can add the selected Topic 1.1 learner surface after unit 3. It does not need the teacher query, teacher form, or the broad pending evidence module.

The production graph and source remain draft. The new page must therefore fail closed until a separate human review approves every required record.

## Required dependency

Q37 unit 3 is committed as `37617752`. Start from a fresh current HEAD archive. Unit 4 uses these functions from `convex/activities.ts`:

- `getApprovedTopic11WorkedSource`
- `getTopic11LearnerDeliveryState`
- `getApprovedPrecalculusPilot`
- `createTopic11DailySubmission`
- `createServerOwnedSubmission`

Unit 4 also depends on the valid `selectedLearningEvidence.ts` module name from unit 2. The Guided and Independent component posts to the existing selected evidence route. Keep the HEAD fingerprint contract. Do not import the broad pending `learningEvidence.ts` file.

## Minimum production files

### 1. Lesson read and ordinary response service

Add a narrow `apps/pre-calculus/convex/course.ts` file from the current main implementation. Include only:

- the active student profile check;
- `getLessons`;
- `getLesson`;
- `saveResponse`;
- the private published-version helper that these functions use.

Do not include teacher candidates, roster management, grading, later-topic helpers, or broad teacher data.

`getLesson` must return the raw activity section `activityId` and `componentKey`. The pending Q22 seed stores the exact selected physical activity at Topic 1.1, Phase 4, sequence 2. The committed legacy seed does not. Unit 5 must integrate this dependency before a real selected seeded flow can pass. Do not add a second selected identity to the lesson result.

Use explicit argument and return validators. Replace the current `v.any()` result validators with the minimum exact public result validators when this unit is implemented.

### 2. Learner acknowledgement route

Add:

- `apps/pre-calculus/app/api/activities/precalculus-topic-1-1/submissions/route.ts`

Use the reviewed Q25 route without change to its trust boundary. It must preserve opaque key bytes, reject whitespace-only or keys longer than 256 characters, accept only an empty object, build the six-field Worked acknowledgement on the server, validate the three-field public receipt, and map wrapped idempotency conflicts to HTTP 409.

### 3. Selected learner components

Add:

- `apps/pre-calculus/components/student/PrecalculusTopic11DailyCurriculumPilot.tsx`
- `apps/pre-calculus/components/student/PrecalculusMasteryAdvantagePilot.tsx`

The Worked component must receive strict projected props. It must not generate or use fallback Worked content. It must send an empty body. It must keep the same body and idempotency key after an ambiguous failure.

The Guided and Independent component must use the strict `stableActivityId` and projected props from `getApprovedPrecalculusPilot`. It must send the complete raw `practice.v1` envelope to the existing activity route. It must send only the returned submission ID to the selected evidence route. It must show the server score and evidence result. It must keep the saved submission ID for an evidence-only retry.

The current component still has optional generated fallback props. Remove that fallback in this selected-only unit, or make the page-facing props required and keep any legacy wrapper in a separate reviewed unit. The lesson page must never depend on browser-generated answers.

### 4. Ordinary lesson response components and route

Add:

- `apps/pre-calculus/components/course/LessonWrittenResponse.tsx`
- `apps/pre-calculus/components/course/LessonResponse.tsx`
- `apps/pre-calculus/app/api/course/response/route.ts`

These files preserve the existing manual response path for unrelated and mixed phases. The route already exists only in the untracked main surface. Include it with `course.saveResponse` so the new form has a real writer.

Keep the response form out of a pure text renderer. `LessonWrittenResponse` must render text only when the page also renders one phase-level `LessonResponse`. This avoids two response forms if a phase has text and another section.

### 5. Lesson list and selected lesson page

Add:

- `apps/pre-calculus/app/student/lessons/page.tsx`
- `apps/pre-calculus/app/student/lessons/[topic]/page.tsx`

The selected page must query the lesson, strict Worked source, learner delivery state, and approved three-mode pilot in parallel.

Use these state rules:

- `needs_acknowledgement`: render the exact projected Worked component only when the raw section activity ID and component key equal the strict source projection.
- `awaiting_teacher_confirmation`: render the pending teacher message. Do not render practice.
- `ready_for_practice`: render Guided and Independent only from the strict approved projection. Do not render another Worked action.
- missing or invalid strict source: render `This worked example is not available.` Do not render the selected Worked action.

Apply the Q36 form guard. Suppress the generic `LessonResponse` only when the phase has exactly one activity section and its physical activity ID and component key match the non-null strict Worked projection. Keep the generic form for mixed phases, unrelated phases, a null source with an unrelated section, a wrong physical activity ID, and a wrong component key. Always keep historical response display.

The current page implementation already has the non-null `workedSource` check. Preserve it. It prevents `undefined === undefined` from hiding an unrelated response form.

## Required tests

Add focused tests with the production page and components. Do not use the full teacher flow as the unit 4 acceptance boundary.

1. `course-selected-lesson.test.ts`
   - active learner can read the actual seeded phase shape;
   - inactive, wrong-role, mismatched credential, and missing learner reject;
   - draft lesson is absent;
   - phase sections keep physical `activityId` and `componentKey`;
   - another learner cannot read response history;
   - read operations add no evidence, receipt, SRS card, or review.

2. `precalculus-topic-1-1/submissions/route.test.ts`
   - use the real `createTopic11DailySubmission` handler;
   - verify the exact six-field stored acknowledgement;
   - verify no grade, evidence, receipt, card, or review;
   - verify exact-key replay, conflict, authentication, empty body, 256/257 length, and strict receipt behavior.

3. `PrecalculusTopic11DailyCurriculumPilot.test.tsx`
   - render real projected Worked props;
   - prove no text input and no component submit callback;
   - prove empty request body;
   - prove pending lock, malformed receipt, network failure, same-key retry, and success refresh.

4. `PrecalculusMasteryAdvantagePilot.test.tsx`
   - render actual Guided and Independent props;
   - prove the three raw interval answers reach the writer;
   - prove only the submission ID reaches evidence;
   - prove server score display;
   - prove create retry and evidence-only retry;
   - prove Independent has no Guided hints or Worked answer fields.

5. `topic11-selected-lesson-page.test.tsx`
   - use an explicitly hypothetical selected Phase 4 section fixture and the real page; verify the actual selected seed in unit 5;
   - test all three learner states;
   - test source draft, physical withdrawal, wrong physical ID, and wrong component;
   - test the Q36 null-source and missing-field regression;
   - prove the generic response form is absent only for the exact one-section selected Worked phase;
   - prove mixed and unrelated phases keep the generic form;
   - prove historical responses remain visible;
   - prove no selected activity is actionable when source approval is closed.

6. Keep the existing component acceptance tests that cover receipt validation and durable retry. Do not copy the broad `topic11-full-sequence.test.tsx` into unit 4. That test requires the teacher candidate query and teacher writer surface from a later unit.

## Expected patch boundary

The bounded patch should contain these production files:

- `apps/pre-calculus/convex/course.ts`
- `apps/pre-calculus/app/api/course/response/route.ts`
- `apps/pre-calculus/app/api/activities/precalculus-topic-1-1/submissions/route.ts`
- `apps/pre-calculus/components/course/LessonWrittenResponse.tsx`
- `apps/pre-calculus/components/course/LessonResponse.tsx`
- `apps/pre-calculus/components/student/PrecalculusTopic11DailyCurriculumPilot.tsx`
- `apps/pre-calculus/components/student/PrecalculusMasteryAdvantagePilot.tsx`
- `apps/pre-calculus/app/student/lessons/page.tsx`
- `apps/pre-calculus/app/student/lessons/[topic]/page.tsx`
- focused tests for the six boundaries above

The generated Convex API declaration already imports modules by file. Add `course` only if the generated declaration from the unit 2 base does not expose it. Do not copy unrelated generated changes.

## Exclusions

Do not include the student dashboard. The selected lesson URL provides the minimum coherent learner delivery surface. Dashboard placement can be a later bounded unit.

Do not include teacher candidates, teacher routes, teacher UI, unrelated schema changes, seed changes, catalog changes, approval changes, later-topic components, or broad `learningEvidence.ts` changes.

Do not add a registry, unrelated table or index, hash, or dependency. The existing pending `lesson_responses` table and its two indexes are required below.

## Verification order

1. Start a fresh HEAD candidate that includes `37617752`.
2. Run the new tests against that candidate before adding unit 4. Record the missing-module and missing-surface failures.
3. Add the bounded files.
4. Run the selected activity writer, evidence, learner query, route, component, and page suites together.
5. Run lint.
6. Run a fresh build.
7. Run standalone TypeScript after the build with candidate-source package mappings.

The production draft state must remain inaccessible in the final tests. Use hypothetical approved fixtures only inside positive tests.

## Verified persistence prerequisite

Fresh HEAD has no `lesson_responses` table. TypeScript and the ordinary response writer require it. Include the existing pending table definition with learner ID, phase ID, response, creation time, and optional grading fields used by response history. Include its `by_learner` and `by_learner_and_phase` indexes. Parent review confirmed that no existing HEAD table can store these ordinary phase responses without changing its contract. This addition is local integration only. It does not authorize deployment.
