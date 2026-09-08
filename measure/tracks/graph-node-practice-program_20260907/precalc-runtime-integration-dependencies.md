# Precalculus Q37 runtime integration dependencies

## Finding

The reviewed Topic 1.1 lesson page and its full-sequence test are both untracked in current main. They are not part of HEAD `dd0cb1d4`.

The page cannot be committed as an independent two-file unit. It imports four untracked components. It also calls pending Convex functions that HEAD does not provide.

## Minimum runtime units

### 1. Selected constants and graph grader

These tracked files contain pending selected Topic 1.1 contracts that the runtime uses:

- `apps/pre-calculus/lib/learning-evidence/precalc-pilot.ts`
- `apps/pre-calculus/lib/practice/topic11-interval-graph.ts`

The integration must preserve the exact stable activity IDs, node ID, component key, source identity, and server grading contract from these files.

### 2. Schema and activity writer

These tracked files contain pending runtime changes:

- `apps/pre-calculus/convex/schema.ts`
- `apps/pre-calculus/convex/activities.ts`

The page requires these activity functions:

- `getApprovedTopic11WorkedSource`
- `getTopic11LearnerDeliveryState`
- `getApprovedPrecalculusPilot`
- `createTopic11DailySubmission`
- `createServerOwnedSubmission`

The schema must include every field and index used by the acknowledgement, graded submission, evidence receipt, and SRS paths. An isolated integration must extract the accepted selected changes from the mixed pending files. It must not copy unrelated later-topic changes without review.

### 3. Evidence module split and Q35 rename

Current main has this pending module state:

- HEAD `convex/learning-evidence.ts` is deleted.
- `convex/selectedLearningEvidence.ts` is untracked.
- `convex/learningEvidence.ts` is untracked.
- `convex/_generated/api.d.ts` is modified.
- `app/api/learning-evidence/precalculus-pilot/route.ts` is modified.

The reviewed page test imports both camel-case modules. `selectedLearningEvidence.ts` also imports `submitPrecalculusLearningEvidenceHandler` from `learningEvidence.ts`. Therefore, the selected rename is not sufficient for the current pending runtime by itself.

The minimum compatible unit is:

- add `apps/pre-calculus/convex/learningEvidence.ts`
- rename or add `apps/pre-calculus/convex/selectedLearningEvidence.ts` under the valid Convex filename
- remove the invalid deployed `apps/pre-calculus/convex/learning-evidence.ts`
- update `apps/pre-calculus/convex/_generated/api.d.ts`
- update `apps/pre-calculus/app/api/learning-evidence/precalculus-pilot/route.ts`
- update the affected direct imports and runtime-name tests

The current selected module does not use the HEAD fingerprint import. The current shared `practice-core` files also have pending fingerprint removal changes. Parent integration must use one coherent accepted evidence version. It must not combine the current selected module with an older shared contract by assumption.

### 4. Lesson and teacher Convex services

These files are untracked:

- `apps/pre-calculus/convex/course.ts`
- `apps/pre-calculus/convex/learningEvidence.ts`

The page requires `course.getLesson`. The teacher flow requires `course.getTopic11TeacherCandidates` and `learningEvidence.submitTopic11TeacherSubmission`.

The full-sequence test uses the real handlers from both files. It also uses the selected evidence handler. These files must enter before the full-sequence test can prove the real flow.

### 5. HTTP routes

These files are required:

- `apps/pre-calculus/app/api/activities/precalculus-topic-1-1/submissions/route.ts` — untracked
- `apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts` — tracked
- `apps/pre-calculus/app/api/learning-evidence/precalculus-pilot/route.ts` — tracked and modified
- `apps/pre-calculus/app/api/teacher/course/route.ts` — untracked

The routes provide the actual Worked acknowledgement, Guided and Independent writer, selected evidence delivery, and teacher confirmation calls.

### 6. Student components

These files are untracked:

- `apps/pre-calculus/components/student/PrecalculusTopic11DailyCurriculumPilot.tsx`
- `apps/pre-calculus/components/student/PrecalculusMasteryAdvantagePilot.tsx`

The first component renders the exact Worked source and sends an empty acknowledgement envelope through the Worked route. The second component submits raw Guided or Independent answers, waits for the server grade, sends the stored submission to the evidence route, and displays the receipt result.

Both components require the existing shared `IntervalClassificationActivity` and its math-content props contract. Parent integration must include the accepted shared package versions that already passed the Q36 local build. No package dependency change is necessary.

### 7. Lesson support components

These files are untracked:

- `apps/pre-calculus/components/course/LessonWrittenResponse.tsx`
- `apps/pre-calculus/components/course/LessonResponse.tsx`

The selected page imports both. `LessonResponse` supplies the ordinary manual phase response. The reviewed Q36 correction hides it only for a one-section phase whose physical activity ID and component key match the validated selected Worked source. Mixed and unrelated phases keep it.

### 8. Teacher UI

These paths are needed for the actual teacher action in the full sequence:

- `apps/pre-calculus/components/course/TeacherCourse.tsx` — untracked
- `apps/pre-calculus/components/course/Topic11ExposureForm.tsx` — tracked and modified
- `apps/pre-calculus/app/teacher/dashboard/page.tsx` — tracked and modified

The untracked teacher course component places the selected candidate form. The dashboard loads the candidate query. The form submits the exact learner, class, and source submission tuple.

### 9. Selected lesson page and composition test

These files are the final composition unit:

- `apps/pre-calculus/app/student/lessons/[topic]/page.tsx` — untracked
- `apps/pre-calculus/__tests__/app/student/topic11-full-sequence.test.tsx` — untracked

The page must enter after the required queries, routes, and components exist. The test must enter with the runtime. It verifies the actual Worked acknowledgement, teacher confirmation, Guided history, Independent mastery evidence, SRS update, receipt replay, and the Q36 generic-form boundary.

## Recommended dependency order

1. Integrate the accepted shared evidence contract and selected constants.
2. Integrate the selected schema and activity-writer changes.
3. Integrate the camel general evidence module and the valid selected evidence module name.
4. Integrate the generated API and both selected evidence routes.
5. Integrate the course query, teacher writer, teacher route, and teacher UI.
6. Integrate the two student activity components and lesson response components.
7. Integrate the selected lesson page and full-sequence test.
8. Run the selected backend, route, teacher, component, and full-sequence suites together. Then run lint, build, and post-build TypeScript.

## Exclusions

Do not copy the complete mixed `activities.ts`, `learningEvidence.ts`, schema, shared package, or dashboard diffs without a selected-scope review. Those files contain later-topic work.

No new registry, table, package, or dependency is required for this integration.
