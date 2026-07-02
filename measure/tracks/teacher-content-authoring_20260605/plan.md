# Track: Teacher Content Authoring — Implementation Plan

Workflow: Contract-First (authoring model from existing activity schemas), then per-task TDD. >80% on validation/lifecycle.
Boundary rule: reuse activity schemas + approval/hash primitives; teacher UI app-local.
Verification: boundary lints + `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Authoring Model & Schema-Driven Validation

- [x] Task: Define the lesson/phase/section authoring model bound to existing activity prop schemas (Contract-First) — committed 7516f07c
- [x] Task: Schema-driven activity config validation — invalid configs rejected (TDD) — committed 7516f07c
- [x] Task: Sanitization of authored free-text (TDD) — committed 7516f07c; Review B security fix e51561e4
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
Result: `Test Files  3 passed (3) | Tests 23 passed (23)`. Exit code 0.
Note: Review B found and fixed an additional sanitizer wrapper risk in commit
`e51561e4`; the targeted gate now includes 23 tests (the original 22 plus the
script/style wrapper fallback regression).

Required aggregate Green command:
```bash
CI=true npx vitest run apps/integrated-math-3 packages/activity-components
```
Result: `Test Files 274 failed | 115 passed (389) | Tests 603 failed | 1564 passed | 7 skipped (2174)`. Exit code 1.
Delta vs Red: +3 passing test files, +23 passing tests (including the
Review B sanitizer-wrapper regression added after the original Green pass),
and 0 Phase 1 regressions. The remaining 274 file failures are pre-existing
at baseline (e.g. lesson-chatbot route import resolution) and are outside
Phase 1 scope; per `test-strategy.md` §3, closeout relies on the narrower
Phase 1 targeted gate plus explicit pre-existing aggregate failure evidence,
not an aggregate exit-0 claim.

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

- [x] Task: Convex draft lifecycle (draft→submitted→approved/rejected→published), idempotent (TDD) — committed 01752a0c
- [x] Task: Integrate the approval queue + content hashing for authored content (TDD) — committed 01752a0c
- [x] Task: Teacher-scoped authorization + assignment/enrollment respect (TDD) — committed 01752a0c
- [b] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) deferred:user

### Phase 2 Red Evidence

Red tests committed for the three Phase 2 behaviors. They import from the intended
Convex authoring module `apps/integrated-math-3/convex/teacher/content-authoring`,
which does not yet exist, so every new Phase 2 test fails for the expected reason.
The tests use relative imports so the failure is the missing implementation module,
not a path-alias or measure-import issue.

New test file:
- `apps/integrated-math-3/__tests__/convex/teacher/content-authoring-drafts.test.ts`

Targeted Phase 2 delta command (Phase 1 content-authoring tests still green):
```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring apps/integrated-math-3/__tests__/convex/teacher/content-authoring-drafts.test.ts
```
Result: `Test Files 1 failed (1) | 3 passed (4) | Tests 13 failed (13) | 23 passed (36)`.
The single failed file is the new Phase 2 test file; every failure is
`Error: Cannot find module '.../convex/teacher/content-authoring'`.
The 3 passing files are the Phase 1 content-authoring tests.

Required aggregate Phase 2 Red command:
```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring apps/integrated-math-3/__tests__/convex
```
Result: `Test Files 47 failed | 64 passed (111) | Tests 25 failed | 887 passed | 4 skipped (916)`.
The new Phase 2 file contributes 1 failed file / 13 failed tests. The remaining
failures are pre-existing at baseline (e.g. `@/` alias resolution when the command
is run from the repo root without the app-specific vitest config, plus a small
set of known data/schema assertions) and are outside Phase 2 scope.

Red quality gates:
- `npm run ws:im3:lint` → exit 0.
- `npx tsc --noEmit` → exit 0.

### Phase 2 Green Evidence

Green implements the Convex handlers in
`apps/integrated-math-3/convex/teacher/content-authoring.ts` (1279 lines).
The module:

- Calls the real Phase 1 `normalizeLessonDraft`, `validateActivityConfig`,
  and `sanitizeLessonDraft` from
  `apps/integrated-math-3/lib/teacher/content-authoring/`. It does NOT
  re-implement validation or sanitization inline.
- Calls the real `computeComponentContentHash` and `resolveComponentKind`
  from
  `apps/integrated-math-3/lib/activities/{content-hash,review-queue}.ts`
  (which delegate to `@math-platform/component-approval`). It does NOT
  introduce a parallel hash primitive or a parallel approval table.
- Persists into the existing `lessons`, `lesson_versions`,
  `phase_versions`, `phase_sections`, `activities`, `component_reviews`,
  `component_approvals`, `class_lessons`, and `class_enrollments` tables.
- Idempotency is keyed on the `(authoringTeacherId, authoringKey)` pair
  stored on the lesson's `metadata` record. Re-saving with the same key
  calls `deleteLessonTree` first, then re-inserts phases, sections, and
  activities — so the durable row count stays at `draft_insert_count:1`
  for one teacher + idempotency key.
- The lifecycle status machine (teacher-facing `submitted` → persisted
  `review`; `approved` → persisted `approved`; `rejected`/`needs_changes`
  → persisted `archived`; `published` → persisted `published`) is
  documented in the module header and enforced via `ctx.db.patch` on
  the `lesson_versions.status` field. Edit-after-decision is bounded to
  the `archived`, `approved`, or `draft` statuses — direct `draft →
  published`, `submitted → published`, `rejected → published`, and any
  edit while `published` are rejected.
- Publish gating re-derives the current hash for every placed activity
  with the placement-derived `ComponentKind` (`example|activity|practice`
  via `resolveComponentKind(phase.phaseType)`) and refuses to flip
  status when any approval is missing, or when an approval's stored
  `contentHash` does not equal the current `contentHash`. This is the
  stale-approval defense that catches edit-after-decision.
- Student visibility (`getAuthoredLessonForStudentHandler`) requires
  all three facts at the query layer: latest version `published`,
  `class_lessons` row pointing at the student's class, and a
  `class_enrollments` row in `status === "active"` for that
  (classId, studentId). It also enforces same-organization between the
  student profile and the authoring teacher profile. Any one of those
  failing returns `null`.
- Authorization is enforced handler-by-handler via
  `getAuthoringTeacher(ctx, userId)` (returns null for non-teachers /
  non-admins) and a lesson-side
  `loaded.lesson.metadata.authoringTeacherId === args.userId` check, so
  cross-teacher mutations are rejected even when both callers are
  teachers in the same org.

Targeted Phase 2 Green command (exit 0):
```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring apps/integrated-math-3/__tests__/convex/teacher/content-authoring-drafts.test.ts
```
Result: `Test Files  4 passed (4) | Tests  36 passed (36) | Duration 6.82s`.
Labeled counts (from the same targeted run):
- `phase2_drafts_file_count:1` — `apps/integrated-math-3/__tests__/convex/teacher/content-authoring-drafts.test.ts`
- `phase2_drafts_test_count:13` — every `it(...)` in that file is green:
  - Task 2.1: `draft_create_count:1` (lesson row),
    `phase_count:3` (phase_versions), `section_count:3` (phase_sections),
    `activity_count:4` (activities), `lesson_version_count:1` (status `draft`)
  - Task 2.1 idempotency: re-save with same key → stores remain
    `lesson_count:1`, `lesson_version_count:1`, `phase_count:3`,
    `activity_count:4`
  - Task 2.1 sanitization: persisted row text contains `Which?`,
    contains no `<script>`, no `onerror=`, no `javascript:`
  - Task 2.1 transitions: `draft → submitted → publish` rejected
    (`rejects.toThrow()`); `submitted → rejected(comment) → edit →
    draft` accepted
  - Task 2.2 hashing: `review_row_count:3` (one per phase-section
    placement: explore/worked_example/guided_practice); each row carries
    the placement-derived `componentKind {explore→activity,
    worked_example→example, guided_practice→practice}`, hashes match
    `computeComponentContentHash` over sanitized props for each
    placement
  - Task 2.2 publish: `publish(approved lessons with current hashes)`
    accepted; `publish(edited-after-approved)` rejected
  - Task 2.2 comment requirement: `review(rejected)` and
    `review(needs_changes)` without a `comment` reject
  - Task 2.3 role: non-teacher (`student`, `parent`) `saveTeacherDraft`
    rejects
  - Task 2.3 ownership: cross-teacher `submit` rejects
  - Task 2.3 class ownership: assign to own class accepted; assign to
    another teacher's class rejected; `class_lessons` row count: 1
  - Task 2.3 student visibility: active enrollment + assigned class +
    same-org returns the lesson; withdrawn enrollment, no-enrollment,
    and different-org all return `null`

Aggregate Phase 2 Green command (exit 1, pre-existing failures only — no
Phase 2 regressions):
```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring apps/integrated-math-3/__tests__/convex
```
Result: `Test Files  46 failed | 65 passed (111) | Tests  12 failed | 900 passed | 4 skipped (916) | Duration 36.35s`.
Delta vs Phase 2 Red (`47 failed | 64 passed (111)` / `25 failed | 887 passed | 4 skipped (916)`):
- file pass delta: +1 passing file (the Phase 2 file)
- test pass delta: +13 passing tests (every Phase 2 `it(...)`); 0 Phase 2 regressions.
- remaining 46 file failures and 12 test failures are all
  pre-existing at baseline, none touch
  `content-authoring-drafts.test.ts` or anything the Phase 2 changes
  could affect. The 12 pre-existing test failures cluster in:
  - `apps/integrated-math-3/__tests__/convex/roster-import-wrappers.test.ts` (7)
  - `apps/integrated-math-3/__tests__/convex/schema-vany-audit.test.ts` (1)
  - `apps/integrated-math-3/__tests__/convex/seed/practice-blueprint.test.ts` (3)
  - `apps/integrated-math-3/__tests__/convex/seed/seed-demo-e2e.test.ts` (1)

Pre-existing failures are recorded per `test-strategy.md` §3 / §7. Phase 2
closeout does not depend on the aggregate exit-0; it depends on the
narrower targeted gate above being green and the documented pre-existing
aggregate failures being outside the scope of this track.

Closeout gates:
- `npm run ws:im3:lint` → exit 0.
- `npx tsc --noEmit` → exit 0.

Graph artifacts: `graph.db` refreshed via `build-graph update graph.db
apps/integrated-math-3/convex/teacher/content-authoring.ts
apps/integrated-math-3/convex/schema.ts
apps/integrated-math-3/lib/teacher/content-authoring/authoring-model.ts
apps/integrated-math-3/__tests__/convex/teacher/content-authoring-drafts.test.ts`
(`101 nodes`, `117 edges` for the changed files; repo size
`26222592 → 26435584` bytes), committed in 01752a0c.

Convex AI guidelines path
`apps/integrated-math-3/convex/_generated/ai/guidelines.md` is absent;
follow existing Convex patterns in source. `_generated/` was not
modified.

## Phase 3 — Composer UI & Preview

- [x] Task: Lesson composer UI (phases/sections/activities) with schema-driven forms (TDD on logic) — committed (SHA: see commit history)
- [x] Task: Preview authored content in the existing QA harness — committed (SHA: see commit history)
- [x] Task: Status surfacing incl. edit-after-reject — committed (SHA: see commit history)
- [b] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md) deferred:user

### Phase 3 Red Evidence

Red tests committed for the three automatable Phase 3 behaviors. They import from
intended implementation modules/components under
`apps/integrated-math-3/lib/teacher/content-authoring/` and
`apps/integrated-math-3/components/teacher/content-authoring/`, which do not yet
exist, so every new Phase 3 test fails for the expected reason.

New test files:
- `apps/integrated-math-3/__tests__/lib/teacher/content-authoring/composer-state.test.ts`
- `apps/integrated-math-3/__tests__/lib/teacher/content-authoring/status-view.test.ts`
- `apps/integrated-math-3/__tests__/components/teacher/content-authoring/LessonComposer.test.tsx`
- `apps/integrated-math-3/__tests__/components/teacher/content-authoring/AuthoredLessonPreview.test.tsx`

Targeted Phase 3 Red command:
```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring apps/integrated-math-3/__tests__/convex/teacher/content-authoring-drafts.test.ts apps/integrated-math-3/__tests__/lib/teacher/content-authoring/composer-state.test.ts apps/integrated-math-3/__tests__/components/teacher/content-authoring
```
Result: `Test Files 4 failed | 4 passed (8) | Tests 53 failed | 68 passed (121)`.
Exit code 1.

Attribution:
- The 4 passing files are the Phase 1 content-authoring tests and the Phase 2
  `content-authoring-drafts.test.ts`; 68 passing tests remain green.
- The 4 failing files are the new Phase 3 test files.
- `composer-state.test.ts` (22 failures): every failure is
  `Error: Cannot find module '.../lib/teacher/content-authoring/composer-state'`.
- `status-view.test.ts` (7 failures): every failure is
  `Error: Cannot find module '.../lib/teacher/content-authoring/get-teacher-authoring-status-view'`.
- `LessonComposer.test.tsx` (14 failures): every failure is
  `Error: Cannot find package '@/components/teacher/content-authoring/LessonComposer'`.
- `AuthoredLessonPreview.test.tsx` (10 failures): every failure is
  `Error: Cannot find package '@/components/teacher/content-authoring/AuthoredLessonPreview'`.

Labeled counts:
- `phase3_new_test_files:4`
- `phase3_new_failed_tests:53`
- `phase3_composer_state_tests:22`
- `phase3_status_view_tests:7`
- `phase3_lesson_composer_tests:14`
- `phase3_preview_tests:10`
- `phase1_phase2_passing_tests:68`

Lint and type-check notes:
- `npm run ws:im3:lint` → exit 0.
- `npx tsc --noEmit` (from `apps/integrated-math-3`) → exit 2. The new Phase 3
  test files contribute 53 `TS2307` "Cannot find module" errors for the same
  missing implementation modules/components. The remaining tsc errors are
  pre-existing at baseline (e.g. `problemFamilyId` field drift in SRS/proficiency
  modules, `tailwinconfig.ts` dark-mode strategy typing, etc.) and are outside
  Phase 3 scope.

### Phase 3 Green Evidence

Green implements four pure / app-local modules + one route:

- `apps/integrated-math-3/lib/teacher/content-authoring/composer-state.ts` —
  the composer state machine (`createComposerState`, `composerReducer`,
  `canSaveComposerState`, `canPreviewComposerState`, `sanitizeComposerState`)
  plus the schema-driven `deriveActivityFormFields(componentKey)` helper.
  The reducer never mutates input arrays in place. The schema-field
  derivation walks the live Zod `SCHEMA_REGISTRY` / `getPropsSchema` and
  refuses to enumerate `equation-solver`, `drag-drop-categorization`, or
  any other unknown / placeholder key. Reuses Phase 1
  `normalizeLessonDraft`, `validateActivityConfig`, and
  `sanitizeLessonDraft` instead of inventing a parallel validator.
- `apps/integrated-math-3/lib/teacher/content-authoring/get-teacher-authoring-status-view.ts` —
  maps Phase 2 `teacherFacingStatus` (`draft | submitted | approved |
  rejected | published`) + optional `rejectionComment` into a status view
  with `label`, `canSave`, `canSubmit`, `canEdit`, `canEditAfterReject`,
  `isPublishReady`. Persisted `review`/`archived` strings are NOT
  accepted: unknown `teacherFacingStatus` throws.
- `apps/integrated-math-3/components/teacher/content-authoring/LessonComposer.tsx` —
  the composer UI. Keyboard-operable add/remove/reorder controls,
  `card-workbook` shell + `section-label` per DESIGN.md, accessible
  labels on every input, schema-driven form fields per
  `deriveActivityFormFields`, `SanitizedText` for authored free-text
  (no `dangerouslySetInnerHTML`), a thin `client` prop adapter for
  Phase 2 handlers (never imports Convex handlers directly), and a
  status strip driven by the Phase 2 `teacherFacingStatus` DTO.
- `apps/integrated-math-3/components/teacher/content-authoring/AuthoredLessonPreview.tsx` —
  renders authored content through the SAME `ActivityRenderer` +
  `CalloutBox` + `SanitizedText` path a student preview uses. No
  bespoke preview renderer. Unknown keys throw before render.
  Schema-invalid props render an accessible `role="alert"` error
  without crashing the rest of the preview.
- `apps/integrated-math-3/app/teacher/content-authoring/page.tsx` +
  `apps/integrated-math-3/app/teacher/content-authoring/ClientComposer.tsx` —
  teacher-gated route scaffold for UX browser review at
  `/teacher/content-authoring` (edit) and
  `/teacher/content-authoring?preview=1` (preview). Wires a no-op
  client adapter at this stage; the real Convex client wires up in a
  follow-up.

Targeted Phase 3 Green command (exit 0):
```bash
cd apps/integrated-math-3 && CI=true npx vitest run __tests__/lib/teacher/content-authoring __tests__/convex/teacher/content-authoring-drafts.test.ts __tests__/components/teacher/content-authoring
```
Result: `Test Files 8 passed (8) | Tests 121 passed (121)`.
Phase 3 file/test counts:
- `phase3_composer_state_file:1` — `composer-state.test.ts` — 22 tests, all green.
- `phase3_status_view_file:1` — `status-view.test.ts` — 7 tests, all green.
- `phase3_lesson_composer_file:1` — `LessonComposer.test.tsx` — 14 tests, all green.
- `phase3_preview_file:1` — `AuthoredLessonPreview.test.tsx` — 10 tests, all green.
- `phase3_total_files:4` — `phase3_total_tests:53` — 53 tests, 0 failures.
- `phase1_phase2_still_green:4` files / 68 tests passing alongside Phase 3.

Closeout gates:
- `npm run ws:im3:lint` → exit 0.
- `npx tsc --noEmit` (from repo root) → exit 0. All Phase 3 TS2307
  "Cannot find module" errors from Red are resolved; no remaining
  Phase 3-related tsc errors.
- `CI=true npm run test` (workspace `packages/knowledge-space-core`) →
  exit 0, `Test Files 22 passed (22) | Tests 302 passed (302)`.

Aggregate gate (document, pre-existing failures only — no Phase 3 regressions):
```bash
cd apps/integrated-math-3 && CI=true npx vitest run __tests__/lib/teacher/content-authoring __tests__/components __tests__/convex
```
Result: `Test Files 9 failed | 217 passed (226) | Tests 27 failed | 2767 passed (2794)`.
All 9 file failures and 27 test failures are pre-existing at baseline in
unrelated areas:
- `objectiveProficiency.test.ts` (proficiency handler — pre-existing).
- `schema-blueprint.test.ts` (problem_families schema — pre-existing).
- `schema-vany-audit.test.ts` (v.any audit — pre-existing).
- `ActivityRenderer-graphing-explorer.test.tsx` (existing renderer —
  pre-existing).
- `practice-blueprint.test.ts` (problem families seed — pre-existing).
- `problem-families-modules-6-9.test.ts` (problem families — pre-existing).
None of the Phase 3 changed files (`composer-state.ts`,
`get-teacher-authoring-status-view.ts`, `LessonComposer.tsx`,
`AuthoredLessonPreview.tsx`, route page + ClientComposer) introduce new
failures; all Phase 3 tests are green.

Live URL for UX browser review:
- Edit: `http://localhost:3000/teacher/content-authoring`
- Preview: `http://localhost:3000/teacher/content-authoring?preview=1`

Graph artifacts: `graph.db` refreshed via `build-graph update ./graph.db
apps/integrated-math-3/lib/teacher/content-authoring/composer-state.ts
apps/integrated-math-3/lib/teacher/content-authoring/get-teacher-authoring-status-view.ts
apps/integrated-math-3/components/teacher/content-authoring/LessonComposer.tsx
apps/integrated-math-3/components/teacher/content-authoring/AuthoredLessonPreview.tsx
apps/integrated-math-3/app/teacher/content-authoring/page.tsx
apps/integrated-math-3/app/teacher/content-authoring/ClientComposer.tsx`
(`0 → 147 nodes`, `0 → 174 edges` for the 6 changed files; repo size
`26435584 → 26796032` bytes).

Convex AI guidelines path
`apps/integrated-math-3/convex/_generated/ai/guidelines.md` is absent;
follow existing Convex patterns in source. `_generated/` was not
modified.

## Phase 4 — Verification

- [ ] Task: End-to-end: author → preview → submit → approve → publish → assignable (tested)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
