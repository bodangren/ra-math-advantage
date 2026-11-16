# IM3 selected lesson consumer review

Date: 2026-09-07

Scope: committed `HEAD` `f5eec7ac` and the selected graph node `math.im3.skill.1.1.graph-quadratic-functions`.

## Result

The committed lesson path is not a complete selected three-mode path.

The seed stores the selected Worked activity in Module 1 Lesson 1 Phase 4. It stores only `componentKey` and `activityId` in the phase section. The Guided and Independent activities are practice items. The seed does not put them in lesson phases.

The selected Worked writer is strict. The route authenticates the student. It validates `practice.v1`. It accepts an empty Worked acknowledgement. It uses an idempotency key. The Convex writer validates the approved physical activity and the exact selected source.

The real lesson page cannot reach this writer from the committed section data. `student.getLessonProgress` returns `phase_sections.content` without activity enrichment. `LessonRenderer` detects the selected Worked source only when the section also contains `stableActivityId`, `masteryNodeId`, `learningEvidenceMode`, and `srsEligible`. The seed does not store these fields. The composition test supplies these fields by hand. Thus, the test does not prove the production query-to-renderer path.

## Blocking findings

### 1. The production Worked action is not available

Files:

- `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts`
- `apps/integrated-math-3/convex/student.ts`
- `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`
- `apps/integrated-math-3/__tests__/components/lesson/im3-worked-review-action-composition.test.tsx`

The phase section has only the activity reference. The student query does not join the activity document. The renderer requires joined activity identity fields. `selectedWorkedSource` is therefore `null` for the real page.

Use the existing activity document as the source of truth. Enrich activity sections in `getLessonProgress` with the minimum public activity fields and `activityProps`. Do not copy reviewed props into a second seed record. Add one query-to-real-renderer test that starts with the actual seeded section shape.

### 2. Student phase completion creates false teacher evidence

File: `apps/integrated-math-3/convex/student.ts`

`completePhase` treats Module 1 Lesson 1 Phase 4 as teacher led. It constructs `origin: "teacher_led"` after a student completes the phase. This bypasses the verified teacher attestation path in `recordIm3GraphTeacherExposureHandler`.

Remove this evidence write. Phase completion can record progress only. The existing teacher route must create teacher evidence after it verifies the teacher, class, enrollment, assignment, source acknowledgement, and publication.

Add a regression test. A student Worked acknowledgement followed by phase completion must not add `teacher_led` evidence. A later Independent attempt must remain in `awaiting_teacher_exposure` until the teacher attests the source.

### 3. A future lesson Guided or Independent section would use the generic writer

Files:

- `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`
- `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx`
- `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx`
- `apps/integrated-math-3/components/activities/graphing/GraphingExplorerActivity.tsx`

`LessonRenderer.handleActivitySubmit` calls `submitActivity`. It does not call `submitIm3PilotActivity`. The generic path does not require the selected evidence receipt before it marks the activity complete. The committed callback types also return `void`. `GraphingExplorerActivity` calls `onComplete` immediately after it calls `onSubmit` and does not await the save.

The current selected Guided and Independent activities are not lesson sections. This defect does not affect their current daily-practice placement. It blocks any plan to add them to lesson phases.

Reuse the strict selected client helper if these activities become lesson sections. Make the callback return and await `Promise<void>`. Mark the activity complete only after the server returns a valid grade and accepted evidence receipt. Keep the same request body and idempotency key for an ambiguous retry.

### 4. Phase completion trusts the client activity gate

File: `apps/integrated-math-3/convex/student.ts`

The client disables the phase button until its local activity set is complete. The `completePhase` mutation does not verify the required activity submission. A direct authenticated request can complete the selected phase without a Worked acknowledgement.

For selected Phase 4, require the existing authenticated acknowledgement lookup before completion. Do not use phase completion as evidence. Keep the check limited to this selected phase.

## Data and assistance behavior

`ActivityRenderer` can add timing to a valid envelope. The committed `PhaseRenderer` does not pass `activityProps`. It also does not select the component mode from the phase type. The pending worktree version passes `activityProps`, maps `guided_practice` to `guided`, and returns the submission promise. These are useful existing changes, but they do not select the strict pilot client helper.

The strict create route preserves `answers`, `parts`, and timing in the `practice.v1` envelope. The selected Guided writer rejects nonzero reveal telemetry because the component has no reveal control. Hints remain learner telemetry. The lesson path does not currently prove this behavior because no selected Guided phase link exists.

## Minimum reuse plan

1. Join the referenced activity in `student.getLessonProgress` for activity sections. Return the public renderer props and the selected identity fields.
2. Remove the Phase 4 student-to-`teacher_led` evidence conversion.
3. Require the stored selected Worked acknowledgement before `completePhase` accepts Phase 4.
4. Keep Guided and Independent in daily practice unless the product explicitly adds lesson phase links.
5. If lesson phase links are added, route the two exact stable IDs through `submitIm3PilotActivity`. Await the result. Require a finite server grade and an accepted evidence receipt before local completion.
6. Add one production-composition test for seed section to student query to real renderer to strict route. Add one phase-completion trust test.

The daily queue and graph wrapper are outside this review. No source approval is implied.
