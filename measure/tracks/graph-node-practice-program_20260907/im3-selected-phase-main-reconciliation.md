# IM3 Q16 shared-main reconciliation independent review

Reviewer: graph_inventory
Date: 2026-09-08

## Result

Accepted. I found no open Q16 reconciliation defect after the second repair.

## Verified reconciliation

The main branch keeps the accepted Q16 behavior:

- The current published Lesson 1.1 query enriches the exact Phase 4, sequence-2 activity from the verified physical activity.
- The real renderer receives the physical activity props and shows the Worked calculation.
- The student acknowledgement uses the strict empty-answer Worked envelope.
- Generic graph submission does not replace the acknowledgement.
- First completion requires the exact physical acknowledgement.
- Student completion creates no teacher-led evidence and no SRS effect.
- A completed phase replays before current source withdrawal checks. Replay adds no row.
- Independent evidence still waits for a trusted teacher exposure.

The reconciliation retains the later-node activity, evidence, teacher, and SRS code in main. The Q16 repair is limited to the selected projection, renderer path, acknowledgement guard, and related tests.

## Second repair verification

At `apps/integrated-math-3/convex/student.ts:144-190`, the query now identifies a selected claim from the exact source position, cached stable activity ID, cached pilot node ID, or loaded physical stable activity ID. A missing or invalid physical row becomes the unregistered `unavailable` component. An ordinary unrelated section keeps its original content.

The regression at `apps/integrated-math-3/__tests__/convex/selected-worked-lesson-consumer.test.tsx:158-169` proves that a stale selected claim outside sequence 2 cannot retain cached selected content after its physical row is missing.

At `apps/integrated-math-3/convex/student.ts:311-332`, first completion loads all activity sections in the selected phase. It requires exactly one physical row that satisfies the complete selected Worked predicate. It does not use `find`.

The regression at `selected-worked-lesson-consumer.test.tsx:231-238` adds a second selected physical section. Completion rejects before a progress write.

The `normalizeId` use matches the production Convex database contract. The updated memory fixtures supply this operation. They do not bypass its failure behavior.

## UI and trust boundary

The unavailable component key is not registered. `ActivityRenderer` therefore renders only `This activity is not available.` It does not show the internal key. It does not mount an activity or receive a submission callback.

The exact source context catches a deleted or changed physical row even when the stored section has only its original `componentKey` and `activityId`. Cached selected claims elsewhere also fail closed. Unrelated activities do not become unavailable solely because graph publication is off.

## Evidence reviewed

- Before snapshot: `/tmp/im3-q16-main-before-20260908`
- Second before snapshot: `/tmp/im3-q16-main-second-before-20260908`
- Focused repair tests reported by Maxwell: 16 of 16 passed.
- Parent will use its full test, lint, TypeScript, and build results for integration gates.

## Parent verification and acceptance

Accept the Q16 shared worktree reconciliation. The author reports 107 passing tests in eight files, lint, standalone TypeScript, and a fresh build after the second repair. Parent review inspected both snapshot diffs. Parent verification passes 74 tests in the real selected consumer suite and the later-node lesson submission suite.

The first repair omitted cached selected claims outside sequence 2 and used the first matching section for completion. Red regressions confirmed both defects. The second repair restores the committed guards. It sanitizes invalid selected claims and requires exactly one verified physical Worked activity before first completion.

The main memory database retains normalizeId support. The test retains multi-node assertions. The main worktree keeps pending later-node code and the pending serializer removal. No broad runtime file was staged from main. The selected production repair is commit `0605917c`.

The build changed an existing generated `.next/types/routes.d.ts` file. Its earlier content was not captured in the author snapshot. The parent preserves it rather than restoring an unknown baseline. It is outside this integration commit.

Task Q16 is complete. Source approval and the full signed-in student journey remain open under Task 4.2.
