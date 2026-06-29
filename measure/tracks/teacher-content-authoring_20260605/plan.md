# Track: Teacher Content Authoring — Implementation Plan

Workflow: Contract-First (authoring model from existing activity schemas), then per-task TDD. >80% on validation/lifecycle.
Boundary rule: reuse activity schemas + approval/hash primitives; teacher UI app-local.
Verification: boundary lints + `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Authoring Model & Schema-Driven Validation

- [~] Task: Define the lesson/phase/section authoring model bound to existing activity prop schemas (Contract-First)
- [~] Task: Schema-driven activity config validation — invalid configs rejected (TDD)
- [~] Task: Sanitization of authored free-text (TDD)
- [b] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) deferred:user

### Phase 1 Red Evidence

Red tests committed for the three Phase 1 behaviors. They import from the intended
implementation modules under `apps/integrated-math-3/lib/teacher/content-authoring/`,
which do not yet exist, so every new Phase 1 test fails for the expected reason.

New test files:
- `apps/integrated-math-3/__tests__/lib/teacher/content-authoring/authoring-model.test.ts`
- `apps/integrated-math-3/__tests__/lib/teacher/content-authoring/activity-config-validation.test.ts`
- `apps/integrated-math-3/__tests__/lib/teacher/content-authoring/sanitize-authored-text.test.ts`

Targeted Phase 1 command (isolated failures):
```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring
```
Result: `Test Files  3 failed (3) | Tests 22 failed (22)`. Every failure is
`Error: Cannot find module '.../content-authoring/{authoring-model,activity-config-validation,sanitize-authored-text}'`.

Required aggregate Red command:
```bash
CI=true npx vitest run apps/integrated-math-3 packages/activity-components
```
Result: `Test Files 277 failed | 112 passed (389) | Tests 625 failed | 1541 passed | 7 skipped (2173)`.
The 3 new Phase 1 test files and 22 new tests are included in the failure set.
The remaining failures are pre-existing in `apps/integrated-math-3` at baseline
(e.g. `__tests__/app/api/student/lesson-chatbot/route.test.ts` cannot resolve
`@/app/api/student/lesson-chatbot/route`) and are outside Phase 1 scope.

## Phase 2 — Draft Lifecycle & Persistence

- [ ] Task: Convex draft lifecycle (draft→submitted→approved/rejected→published), idempotent (TDD)
- [ ] Task: Integrate the approval queue + content hashing for authored content (TDD)
- [ ] Task: Teacher-scoped authorization + assignment/enrollment respect (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Composer UI & Preview

- [ ] Task: Lesson composer UI (phases/sections/activities) with schema-driven forms (TDD on logic)
- [ ] Task: Preview authored content in the existing QA harness
- [ ] Task: Status surfacing incl. edit-after-reject
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Verification

- [ ] Task: End-to-end: author → preview → submit → approve → publish → assignable (tested)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
