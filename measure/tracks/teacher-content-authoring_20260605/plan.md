# Track: Teacher Content Authoring — Implementation Plan

Workflow: Contract-First (authoring model from existing activity schemas), then per-task TDD. >80% on validation/lifecycle.
Boundary rule: reuse activity schemas + approval/hash primitives; teacher UI app-local.
Verification: boundary lints + `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Authoring Model & Schema-Driven Validation

- [x] Task: Define the lesson/phase/section authoring model bound to existing activity prop schemas (Contract-First) — Green commit (see Phase 1 Green Evidence)
- [x] Task: Schema-driven activity config validation — invalid configs rejected (TDD) — Green commit (see Phase 1 Green Evidence)
- [x] Task: Sanitization of authored free-text (TDD) — Green commit (see Phase 1 Green Evidence)
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

### Phase 1 Green Evidence

Green implements three pure, app-local modules under
`apps/integrated-math-3/lib/teacher/content-authoring/`:

- `authoring-model.ts` — `normalizeLessonDraft(input)` produces an ordered
  `AuthoringLesson { phases[] → sections[] → activities[] }` with stable,
  position-derived IDs and a structured error list. Rejects empty phases /
  sections / activities and any `componentKey` not in `SCHEMA_REGISTRY`
  (including the runtime placeholders `equation-solver` and
  `drag-drop-categorization`).
- `activity-config-validation.ts` — `validateActivityConfig(componentKey, props)`
  binds validation to the key via `getPropsSchema(componentKey)` from
  `@math-platform/math-content/schemas`. Cross-key props, missing required
  fields, empty arrays, and unknown / placeholder keys are all rejected with
  `{ componentKey, path: string[], message }` errors. The caller's `props`
  object is never mutated.
- `sanitize-authored-text.ts` — `sanitizeAuthoringText(str)` strips
  `<script>`/`<style>` blocks, event-handler attributes, and `javascript:`
  URLs while preserving math notation (`$`, `**`, `^`) and markdown.
  `sanitizeLessonDraft(draft)` walks the full draft and rewrites every
  string leaf. `SanitizedText` renders sanitized output as a plain text
  node, never via `dangerouslySetInnerHTML`.

Targeted Phase 1 Green command:
```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring
```
Result: `Test Files  3 passed (3) | Tests 22 passed (22)`. Exit code 0.

Required aggregate Green command:
```bash
CI=true npx vitest run apps/integrated-math-3 packages/activity-components
```
Result: `Test Files 274 failed | 115 passed (389) | Tests 603 failed | 1563 passed | 7 skipped (2173)`.
Delta vs Red: +3 passing test files, +22 passing tests, 0 regressions. The
remaining 274 file failures are pre-existing at baseline (e.g. lesson-chatbot
route import resolution) and are outside Phase 1 scope.

Closeout gates:
- `npm run ws:im3:lint` → exit 0.
- `npx tsc --noEmit` → exit 0.
- `CI=true npm run test` (workspace test for `packages/knowledge-space-core`)
  → exit 0, 22 files / 302 tests passed.

Test files were adjusted from the Red draft to use the correct
`../../../../lib/teacher/content-authoring/...` relative path (the test
files live one directory deeper than the existing `__tests__/lib/teacher/`
tests) and to pin the jsdom environment on
`sanitize-authored-text.test.ts` so the root-level
`GREEN_TEST_COMMAND` (`CI=true npx vitest run apps/integrated-math-3/...`)
finds the React render test's environment. No test assertions were
modified.

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
