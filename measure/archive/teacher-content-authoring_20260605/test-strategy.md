# Test Strategy — teacher-content-authoring_20260605

Role: Measure Strategy. This document accumulates per-phase strategy. Sections 1–10
below cover **Phase 3 — Composer UI & Preview** (baseline `4a5b4ba257ef8aead49709d5221113e4ede9e6bb`).
Section 11 covers **Phase 4 — Verification** (baseline `11745f948c4b32ee9fe5d0ae63c62920cbf4eb90`).
No product-source implementation happens in a strategy pass.

---

## Phase 3 strategy (sections 1–10)

Role: Measure Strategy. Scope: **Phase 3 — Composer UI & Preview** only. No product-source implementation in this pass. Baseline: `4a5b4ba257ef8aead49709d5221113e4ede9e6bb`.

## 1. Required context and inspected surfaces

Read before strategy: `measure/index.md`, `measure/workflow.md`, `measure/tracks.md`, `measure/anti-patterns.md`, this track's `spec.md`, `plan.md`, prior Phase 2 `test-strategy.md`, `phase-2-acceptance-result.json`, Phase 2 handler DTOs, Phase 1 content-authoring utilities, existing preview/review harnesses, and `apps/integrated-math-3/DESIGN.md`.

Phase 2 constraints Phase 3 must preserve:

- Composer save/submit/edit actions must call the Phase 2 lifecycle boundary (`saveTeacherDraft`, `submitDraftForReview`, `editRejectedDraft`, etc.) through a thin Convex client adapter. Do not introduce a second persistence or lifecycle model in UI state.
- UI status labels must consume the Phase 2 DTO fields `teacherFacingStatus` and `rejectionComment`; the UI must not infer `review -> submitted` or `archived -> rejected` by duplicating the persisted-status mapping.
- Composer validation must reuse the real Phase 1 utilities: `normalizeLessonDraft`, `validateActivityConfig`, and `sanitizeLessonDraft`. It must not create a parallel validator, a local schema registry, or a custom sanitizer.
- Schema-driven forms must derive from the real `getPropsSchema(componentKey)` / `SCHEMA_REGISTRY` re-exported from `apps/integrated-math-3/lib/activities/schemas`; only the six current canonical activity keys are valid. No new activity component types are in Phase 3 scope.
- Preview must render authored activities through the same activity rendering path a student/teacher lesson preview uses (`LessonRenderer` -> `PhaseRenderer` -> `ActivityRenderer` / registered activity components) or a harness wrapper that delegates to that path. The existing dev review harnesses are useful QA surfaces, but their placeholder preview blocks are not sufficient proof by themselves.

Inspected code/graph facts that shape Phase 3:

- `build-graph stats ./graph.db`: 14,368 nodes / 20,875 edges / 2,084 files.
- Relevant graph symbols: `normalizeLessonDraft`, `validateActivityConfig`, `sanitizeLessonDraft`, `SCHEMA_REGISTRY`, `getPropsSchema`, `LessonRenderer`, `PhaseRenderer`, `ActivityRenderer`, and the Phase 2 `toTeacherFacingStatus` DTO mapper.
- `ActivityRenderer` currently delegates by `componentKey` and passes `activityId`, `mode`, and callbacks to the registered activity component. Phase 3 preview tests must prove authored props reach the rendered activity, not just that a component key label appears.
- Existing teacher preview route `/teacher/lesson/[lessonSlug]` uses `LessonRenderer` with `showTeacherPreviewBadge`; Phase 3 should reuse this lesson rendering surface for authored preview rather than building a bespoke preview renderer.
- Existing component-approval review harnesses live under `components/dev/review-harness/`; they test approval-gating interactions but their internal previews are largely placeholder summaries. Phase 3 can reuse their review workflow shell only if live authored preview still delegates to the same activity components as student/teacher lesson rendering.
- `apps/integrated-math-3/DESIGN.md` defines warm academic orange/teal tokens, Lora/DM Sans typography, `card-workbook`, `section-label`, responsive spacing, and accessible form expectations. Phase 3 UI should follow those patterns.

Recommended Phase 3 route for browser review and `PROJECT_DEV_URL`:

- Composer entry: `/teacher/content-authoring`.
- Preview state: same route with the Preview tab/panel active, e.g. `http://localhost:3000/teacher/content-authoring?preview=1` for `PROJECT_DEV_URL` once the IM3 dev server is running. If Green chooses a saved-draft preview route, prefer `/teacher/content-authoring/[lessonId]/preview` and update the result artifact, but do not add both routes unless tests require it.

## 2. Phase 3 Red command and required failing tests

Targeted Phase 3 Red/Green gate:

```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring apps/integrated-math-3/__tests__/convex/teacher/content-authoring-drafts.test.ts apps/integrated-math-3/__tests__/lib/teacher/content-authoring/composer-state.test.ts apps/integrated-math-3/__tests__/components/teacher/content-authoring
```

Mid Red must add the new Phase 3 test files first, run the command above, and show:

- Phase 1 pure content-authoring tests still pass.
- Phase 2 lifecycle tests still pass.
- New Phase 3 failures are attributable to missing composer logic/components/route/preview wiring, not path aliases, skipped assertions, or broad mocks.

### Task 3.1 — Lesson composer UI with schema-driven forms

Required failing tests:

- Pure reducer/state tests in `apps/integrated-math-3/__tests__/lib/teacher/content-authoring/composer-state.test.ts` for adding/removing/reordering phases, sections, and activities while preserving stable authoring IDs/order for `normalizeLessonDraft`.
  - Falsifies if the reducer only mutates arrays in place, loses nested activity props during reorder, permits empty lessons/sections/activities, or produces a shape `normalizeLessonDraft` rejects.
- Pure field-derivation tests for a planned app-local helper (for example `deriveActivityFormFields(componentKey)`): it must call the real `getPropsSchema(componentKey)` and produce fields for required strings/numbers/booleans/enums/arrays from canonical schemas such as `comprehension-quiz`, `fill-in-the-blank`, and `rate-of-change-calculator`.
  - Falsifies if fields are hard-coded from a local list, `getPropsSchema`/`SCHEMA_REGISTRY` is mocked, unknown/placeholder keys render editable arbitrary JSON, or required nested paths are absent.
- Validation-surfacing tests: invalid props entered in the form call the real `validateActivityConfig`, render structured errors at field/path level (for example `questions.0.prompt`), prevent save/preview/submit, and leave the prior valid draft intact.
  - Falsifies if invalid configs can be saved, if errors are only logged to console, if a generic “invalid” banner replaces field/path errors, or if the UI silently strips invalid fields until the schema passes.
- Sanitization tests: unsafe authored free text (`<script>`, `onerror=`, `javascript:`) is sanitized before preview/save and rendered as inert text without `dangerouslySetInnerHTML`.
  - Falsifies if raw HTML executes/appears as DOM nodes, if `dangerouslySetInnerHTML` is used for authored text, or if math notation/markdown symbols are destroyed by an over-broad sanitizer.
- React/jsdom composer tests in `apps/integrated-math-3/__tests__/components/teacher/content-authoring/LessonComposer.test.tsx`: render labels, controls, keyboard-operable add/remove/reorder actions, responsive/card-workbook layout hooks, disabled save/preview on invalid state, and enabled save when the real schemas validate.
  - Falsifies if assertions are snapshot-only, if controls lack accessible names/labels, if all actions pass with an empty fixture, or if the Convex client boundary is mocked so broadly that validation is bypassed.

### Task 3.2 — Preview authored content in the existing QA/lesson harness

Required failing tests:

- Preview adapter tests in `apps/integrated-math-3/__tests__/components/teacher/content-authoring/AuthoredLessonPreview.test.tsx`: convert a normalized authored draft into `LessonRenderer`/`PhaseRenderer` compatible phases and render the teacher preview badge, authored phase titles, text/callout sections, and activity sections in order.
  - Falsifies if preview output is a custom JSON/summary renderer, omits the `LessonRenderer`/`PhaseRenderer` path, or collapses multiple phases/sections into one preview card.
- Live registered-component test: register a test activity under a canonical key or use an existing registered component, preview a draft with distinctive valid props, and assert the rendered DOM/activity receives those props and emits interaction callbacks through the same path a student component uses.
  - Falsifies if the test only asserts `componentKey` text, relies on placeholders in `ActivityReviewHarness`, snapshots a static shell, or never proves props reach the activity component.
- Mode/placement tests: `worked_example` previews as example/teaching context, guided/independent practice previews as practice context, and activity/explore phases still use registered activity components without introducing a new activity type.
  - Falsifies if placement-derived kinds are ignored, if all activities are rendered in one generic mode, or if preview invents `equation-solver`/`drag-drop-categorization` support.
- Error-state tests: unknown component keys and schema-invalid props produce accessible, non-crashing errors that block submit/publish actions but do not hide the rest of the lesson preview.
  - Falsifies if one bad activity crashes the whole composer, if the error is only visible in console, or if invalid content is previewed as if it were student-ready.

### Task 3.3 — Status surfacing including edit-after-reject

Required failing tests:

- Pure status-badge mapping tests for a planned helper (for example `getTeacherAuthoringStatusView(dto)`): use Phase 2 `teacherFacingStatus` values (`draft`, `submitted`, `approved`, `rejected`, `published`) and `rejectionComment` to produce label/tone/action availability.
  - Falsifies if the UI accepts only persisted statuses (`review`, `archived`), duplicates `toTeacherFacingStatus`, casts unknown statuses to success, or hides rejection comments.
- React/jsdom tests for the composer status strip: draft shows “Draft” and Save/Submit; submitted disables editing/submission; rejected shows the reviewer comment and an “Edit draft” action; approved shows publish-ready messaging; published disables edits and points teachers to assignment.
  - Falsifies if edit-after-reject is unavailable, if submitted/approved/published states remain editable, if rejection comments are not rendered, or if false positive text appears without the corresponding DTO fixture.
- Convex client-boundary tests: status transitions call only the Phase 2 handler wrappers; mock only the client adapter result and assert requests/DTO handling, not Phase 2 handler internals.
  - Falsifies if UI code imports Convex handler internals directly into client components, rewrites lifecycle rules client-side, or mocks `teacherFacingStatus` away by using persisted status strings.

### Task 3.4 — Measure User Manual Verification (human-gated)

Required artifact test/guard:

- Phase 3 marker guard must require Tasks 3.1-3.3 to move `[~] -> [x]` as automated work completes, and Task 3.4 to be `[b] Task: Measure - User Manual Verification 'Phase 3' ... deferred:user`. No active Phase 3 task may remain as bare `[ ]` once the orchestrator starts Phase 3.
  - Falsifies if UMV is marked `[x]` by automation, if `deferred` appears only as prose without `[b] deferred:user`, or if a marker guard passes with zero completed automated tasks.

## 3. Green and closeout gates

Green gate after each Phase 3 implementation slice:

```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring apps/integrated-math-3/__tests__/convex/teacher/content-authoring-drafts.test.ts apps/integrated-math-3/__tests__/lib/teacher/content-authoring/composer-state.test.ts apps/integrated-math-3/__tests__/components/teacher/content-authoring
```

Required Green evidence:

- All new Phase 3 tests pass without `.skip`, `.todo`, permissive snapshots, or environment guards that hide UI behavior.
- Existing Phase 1 and Phase 2 content-authoring tests remain green in the same targeted command.
- Logic tests prove reducer/state transitions and schema-field derivation independently from React rendering.
- Component tests prove visible DOM, keyboard/click interactions, validation messages, status badges, and activity preview behavior. Snapshots may supplement but cannot be the only assertions.
- Count assertions use direct array lengths or labeled integers in evidence (`phase3_composer_test_count:n`, `schema_field_count:n`, `preview_activity_render_count:n`) and parse exact labels when shell output is checked.

Closeout gate for Phase 3:

```bash
npm run ws:im3:lint
npx tsc --noEmit
CI=true npm run test
```

Closeout is blocked unless these commands exit 0. If the aggregate suite is already red from baseline infrastructure, the orchestrator must record the exact failing files/counts and owner before acceptance; no artifact may claim “all checks pass” for a non-zero command. Phase 3 acceptance still requires the targeted gate above to be green.

Manual verification: Task 3.4 is human-gated. Automated tests can prove behavior and accessibility mechanics; they cannot self-approve the teacher-facing UX. UX browser review applies because Phase 3 is user-facing and requires `PROJECT_DEV_URL` pointing at `/teacher/content-authoring?preview=1` on the running IM3 dev server.

## 4. Fixtures, mocks, and live-behavior proof

Fixtures:

- Valid draft with at least two phases, at least three sections, and at least three canonical activities spanning `graphing-explorer`, `comprehension-quiz`, and `fill-in-the-blank` or `rate-of-change-calculator`.
- Phase placements covering `explore`/activity, `worked_example`/example, and `guided_practice` or `independent_practice`/practice.
- Valid schema props copied from existing Phase 1 schema tests; do not invent looser props.
- Invalid fixtures: unknown key, placeholder key (`equation-solver`, `drag-drop-categorization`), missing required nested field, wrong type, unsafe text, empty phases/sections/activities, submitted/approved/published DTO states, rejected DTO with comment, rejected DTO without comment.
- Responsive/accessibility fixtures: narrow/mobile container, long labels, multiple nested questions/options, keyboard-only add/reorder/delete flow.

Mocks:

- Mock only the Convex client boundary (for example a `contentAuthoringClient` adapter returning Phase 2 DTOs) and browser APIs that jsdom lacks.
- Do not mock `getPropsSchema`, `SCHEMA_REGISTRY`, `normalizeLessonDraft`, `validateActivityConfig`, `sanitizeLessonDraft`, `LessonRenderer`, `PhaseRenderer`, or `ActivityRenderer` in the core Green path.
- Test-specific registered activity components are allowed only to prove that the preview path invokes the same registry/rendering contract; they must be registered through the real registry and assert received props/callbacks.
- Avoid fake “always valid” schema mocks, fake sanitizer output, or direct import of Convex handler internals into client tests.

Live-behavior proof expectations:

- Composer tests must type/select/click and assert resulting DOM, state, disabled/enabled actions, and error messages.
- Preview tests must assert rendered lesson/phase/activity DOM and at least one interaction/callback outcome through the registered activity component path.
- Status tests must assert teacher-visible labels/actions from Phase 2 DTO fixtures, including `rejectionComment`.
- Sanitization tests must inspect the DOM for absence of executable nodes/attributes, not just source strings.
- Accessibility tests must use accessible queries (`getByRole`, `getByLabelText`) and keyboard interaction where possible.

## 5. Artifact/documentation tests vs live behavior tests

Artifact/documentation tests:

- Marker guard for Phase 3 plan status: Tasks 3.1-3.3 `[~]` while active and `[x]` when complete; Task 3.4 `[b] ... deferred:user`; no bare `[ ]` in the active Phase 3 block.
- Source guards may verify no new activity key registry, no `dangerouslySetInnerHTML` for authored content, no `convex/_generated` edits, and no package-to-app imports.
- Route guard may verify `/teacher/content-authoring` exists and is teacher-protected once implemented.

Live behavior tests:

- Reducer/form tests execute state transitions and real schema validation.
- Composer component tests execute user interactions and visible validation/status behavior.
- Preview tests execute the actual lesson/activity rendering path with registered activity components.
- Client-boundary tests execute calls to the adapter and assert Phase 2 DTO handling.

Falsification condition: artifact/source tests cannot be the only proof for FR1, FR2, FR3, or FR5. If no React render/interaction test executes, Phase 3 is not green.

## 6. Accessibility, responsive, and design expectations

- Forms must be keyboard-operable: add/remove/reorder/select/save/preview/submit controls reachable by Tab and activatable by keyboard.
- Inputs/selects/textareas must have programmatic labels (`label htmlFor`, `aria-label`, or equivalent) and field errors must be associated via `aria-describedby` or visible text adjacent to the field.
- Use semantic buttons for actions and avoid clickable `div`s. Disabled actions must expose why they are disabled via visible helper text or accessible description.
- Status badges must not rely on color alone; labels such as “Draft”, “Submitted”, “Rejected”, “Approved”, “Published”, and “Needs changes” must be text-visible.
- Responsive layout should follow IM3 design tokens: warm academic palette, `card-workbook`, `section-label`, `rounded-md/lg`, `space-y-*`, and single-column behavior on narrow screens.
- No raw HTML injection for authored text. Use `SanitizedText` or equivalent plain-text rendering for authored free-text fields. If markdown rendering is needed, it must consume sanitized input and be covered by DOM safety tests.
- A separate WCAG track exists, so Phase 3 need not perform a full audit, but it must not regress basic WCAG-relevant mechanics: labels, keyboard operation, focus visibility, status text, and responsive readability.

## 7. Architecture guardrails and changed-contract risks

Guardrails:

- Keep composer and preview code app-local to IM3 (`apps/integrated-math-3/...`). Do not move teacher/class policy into reusable packages.
- Keep shared `packages/` independent from `apps/` and Convex generated files.
- No dependency changes and no new activity component types.
- Prefer pure helpers for composer reducer, schema field derivation, preview DTO mapping, and status view mapping; React components should compose these helpers.
- Keep Convex public/internal wrappers thin and Phase 2 lifecycle rules server-owned.
- If exported symbols/routes/JSX hierarchy change, refresh graph/generated artifacts per Measure or record explicit deferral.

Changed-contract risks to test:

- Current `ActivityRenderer` does not visibly accept authored props in its public props type. Phase 3 preview must either extend the existing renderer contract safely or route props through existing section content in a tested way; otherwise preview may show component shells without authored configuration.
- Current dev review harness preview blocks are placeholders. Reusing their shell without delegating to registered activity components would satisfy artifact tests but fail FR3.
- Zod schema introspection can be brittle across unions/arrays. Field derivation must fail closed with clear unsupported-field messaging rather than falling back to arbitrary JSON that bypasses `validateActivityConfig`.
- Phase 2 status mapping has an unexpected-status cast fallback. Phase 3 status view tests must reject unknown statuses at the UI boundary instead of rendering success by default.
- Edit-after-reject must call the Phase 2 edit handler and surface `rejectionComment`; a client-only “copy draft” flow would break approval provenance and stale-hash defenses.

## 8. Intentionally-red aggregate-suite handling

- Phase 3 introduces no intentionally-red test files after Green. Red is temporary TDD evidence only.
- The targeted command includes Phase 1/2 content-authoring tests plus Phase 3 tests. Mid Red must label new Phase 3 failures and show old content-authoring tests still green.
- Do not hide pre-existing aggregate failures with `.skip`, `.todo`, broad mocks, or test filters. If `CI=true npm run test` is red, record exact command output and do not write “all checks pass”.
- Negative cases belong inside passing tests that assert rejection, disabled UI, null result, or visible error text; they are not permanent red suites.

## 9. Anti-pattern coverage for Phase 3

| Anti-pattern | Phase 3 defense | Falsifies if |
|---|---|---|
| A1 — substring-as-structured-signal | Marker guard requires structured `[b] ... deferred:user` for Task 3.4 only; automated tasks use `[~]`/`[x]`. | Any task is ignored because prose contains “deferred”, or UMV lacks `[b] deferred:user`. |
| A2 — consent-blind publish gate | Publish is not in Phase 3 UI scope except surfacing status; preview/submit controls must not imply publish. If a publish CTA appears, it must require Phase 2 approval/hash DTO proof. | UI flips/claims published from composer without approval+hash proof or labels preview as publish-ready without DTO evidence. |
| A3 — digit-only as labeled count | Evidence uses direct Vitest assertions or labeled counts (`schema_field_count`, `preview_activity_render_count`) rather than `/[0-9]+/` scraping. | Any guard passes by matching arbitrary digits in dates, hashes, or output. |
| A4 — vacuous-pass on nothing-done | Tests require non-empty fixture arrays: >=2 phases, >=3 sections, >=3 activities, at least one invalid field, one rejected status, and one live activity render. Marker guard fails zero-completed automated tasks. | Render tests pass on empty composer/preview; marker check passes with zero `[x]`; interaction tests never fire. |
| A5 — false-claim text vs test reality | Result/plan text may only cite commands with real exit status; aggregate reds must be named as red/pre-existing. | Any artifact says “all checks pass” while the cited command exits non-zero. |
| A6 — registry-note overstatement | `measure/tracks.md` must not claim Teacher Content Authoring is shipped/completed until Phase 3 UX and later E2E/approval phases pass. | Registry/plan copy says composer/preview is complete or publishable before tests/browser review pass. |
| A7 — over-broad filter swallowing hits | Source guards exclude only exact generated/build paths; UI tests query exact labels/statuses instead of filtering broad words like “never”/“do not”. | Unsafe HTML, unknown statuses, or invalid components are hidden by broad text filters. |
| A8 — `[ ]` marker ambiguity | Active Phase 3 block cannot contain bare `[ ]` once started; valid states are `[~]`, `[x]`, `[b]`. | Supervisor/test treats `[ ]` as active/complete or the Phase 3 block retains bare `[ ]` after orchestration starts. |
| A9 — archived track path references | Product tests must not read Measure files. Any marker guard must resolve the current track dir from orchestrator coordinates and not be imported by app code. | App/package tests import/read `measure/tracks/...`, or guards break after archive. |
| A10 — generated-facts drift | Route/component/export changes require graph/generated refresh or explicit deferral. Strategy-only commit makes no product structural change. | New exported helpers/routes land while graph/generated docs are stale and closeout ignores drift. |
| A11 — missing live Measure contract-test suite | Phase 3 strategy does not edit Measure supervisor/tests, but marker guards should be executable if the live Measure guard suite is present; absence is an audit finding, not a product-test substitute. | Acceptance relies solely on manual anti-pattern reading and has no executable guard for marker/status claims. |
| A12 — missing supervisor peer-review rule | No supervisor changes in Phase 3. If any automation-supervisor change is proposed to support markers, it must be a separate peer-reviewed flow per `AGENTS.md`. | Product Phase 3 commit modifies `measure/automation-supervisor.py` opportunistically or without audit. |

## 10. Handoff to Mid Red / Jr Green

Mid Red:

- Mark Task 3.1 `[~]` before adding tests; later tasks follow sequentially. Mark Task 3.4 `[b] ... deferred:user` when Phase 3 automation starts.
- Add `composer-state.test.ts`, `LessonComposer.test.tsx`, and `AuthoredLessonPreview.test.tsx` with failures that prove missing reducer/schema-field derivation/composer/preview/status behavior.
- Run the targeted Red command and capture labeled counts for new failed Phase 3 files while Phase 1/2 tests remain green.

Jr Green:

- Implement the smallest app-local composer logic and UI needed to pass the tests.
- Use a thin Convex client adapter for Phase 2 handler DTOs; do not import Convex handler internals into client components.
- Reuse real schemas, validation, sanitization, and lesson/activity rendering. Do not build a bespoke preview renderer.
- Keep UX-browser-review ready at `/teacher/content-authoring?preview=1` and document any route adjustment in the Phase 3 result artifact.

---

## Phase 4 strategy (section 11)

Role: Measure Strategy. Scope: **Phase 4 — Verification** only. Baseline:
`11745f948c4b32ee9fe5d0ae63c62920cbf4eb90`. Phases 1–3 are complete and committed
(Red→Green→reviews→adversarial→UX→acceptance all passed). Phase 4 adds **one new
end-to-end automated test** that exercises the full lifecycle across the already-shipped
Phase 1/2/3 surfaces, then runs the final verification gate. No new product logic and no
new activity types are in scope. If Phase 4 discovers a defect, that defect is fixed by a
scoped Red→Green loop against the existing surfaces — not by inventing parallel logic.

### 11.1 What the end-to-end automated test must assert

The E2E test proves AC1–AC5 as a single ordered lifecycle, reusing the real modules. It
must **not** re-implement persistence, validation, hashing, approval, or rendering.

Reused surfaces (all already exist at baseline — the test imports them, it does not
shadow them):

- Phase 2 Convex handlers from `apps/integrated-math-3/convex/teacher/content-authoring.ts`:
  `saveTeacherDraftHandler`, `submitDraftForReviewHandler`, `reviewAuthoredLessonHandler`,
  `editRejectedDraftHandler`, `publishAuthoredLessonHandler`, `assignAuthoredLessonHandler`,
  `getAuthoredLessonForStudentHandler`, and the `toTeacherFacingStatus` DTO mapper.
- Phase 2 hashing/approval primitives via `computeComponentContentHash`
  (`lib/activities/content-hash`) and `resolveComponentKind` (`lib/activities/review-queue`).
- Phase 1 pure model: `normalizeLessonDraft`, `validateActivityConfig`,
  `sanitizeLessonDraft`/`sanitizeAuthoringText`.
- Phase 3 composer/preview surfaces: `composer-state` (`createComposerState`,
  `composerReducer`, `canSaveComposerState`, `canPreviewComposerState`,
  `sanitizeComposerState`, `deriveActivityFormFields`),
  `get-teacher-authoring-status-view`, and `AuthoredLessonPreview`.
- The same mock-store harness pattern used by `content-authoring-drafts.test.ts`
  (`makeMutationMockCtx`/`makeQueryMockCtx` chaining handlers over one shared store set)
  is the correct fixture spine for a multi-step lifecycle. The E2E test may factor a
  shared helper but must keep the real handlers un-mocked.

Suggested location: `apps/integrated-math-3/__tests__/app/teacher/content-authoring/content-authoring-e2e.test.ts`
(or `.tsx` if it renders preview). It falls inside the Phase 4 targeted gate path.

The E2E test MUST assert, in one ordered flow over one shared mock store:

1. **Author (AC1/FR1/FR2).** Start from a Phase 3 composer state (`createComposerState`
   + `composerReducer`) that builds a lesson with **≥2 phases, ≥3 sections, ≥3 activities**
   spanning at least three canonical keys (e.g. `graphing-explorer`, `comprehension-quiz`,
   `fill-in-the-blank`, `step-by-step-solver`). Assert `canSaveComposerState` is true only
   after the real `validateActivityConfig` passes, and that injecting one schema-invalid
   activity flips it false (the composer refuses to save invalid config). Persist via
   `saveTeacherDraftHandler`; assert durable row counts (`lesson_count:1`,
   `phase_count`, `section_count`, `activity_count`) with **direct array lengths**, and
   that `toTeacherFacingStatus(latestVersion.status) === 'draft'`.
2. **Preview (AC2/FR3).** Render `AuthoredLessonPreview` (or its DTO adapter) from the
   same normalized draft and assert authored phase titles, section text, and at least one
   registered activity component receive the authored props through the shared
   `ActivityRenderer` path — reusing the Phase 3 preview assertions, not a JSON summary.
   Assert unsafe authored text is rendered inert (no `<script>` node, no
   `dangerouslySetInnerHTML`).
3. **Submit (AC3/FR5).** `submitDraftForReviewHandler`; assert
   `toTeacherFacingStatus === 'submitted'` and that a publish attempt from `submitted`
   **throws** (no skip-the-queue path).
4. **Approve (AC3/AC4/FR4).** `reviewAuthoredLessonHandler` with an approval decision;
   assert `component_approvals` rows exist for every placed activity, each carrying the
   placement-derived `componentKind` and a `contentHash` equal to
   `computeComponentContentHash` over the **sanitized** props (guards A-hash drift).
   Also assert the reject path: a `reviewAuthoredLessonHandler` reject without a comment
   throws, a reject with a comment surfaces via `rejectionComment` in the status view,
   and `editRejectedDraftHandler` returns the lesson to an editable `draft` state.
5. **Publish (AC3/FR4).** `publishAuthoredLessonHandler` succeeds only when every
   placed activity has a fresh matching approval; assert `toTeacherFacingStatus ===
   'published'`. Assert the stale-hash defense: editing an approved activity then
   publishing **throws** (mixed fresh/stale set must not publish).
6. **Assignable + student visibility (AC3/FR6).** `assignAuthoredLessonHandler` to a
   class the authoring teacher owns creates exactly one `class_lessons` row; assigning an
   unpublished lesson or another teacher's class throws. Then
   `getAuthoredLessonForStudentHandler` returns the lesson **only** for a same-org student
   with an `active` enrollment in the assigned class, and returns `null` for
   (a) not-yet-published, (b) withdrawn/completed enrollment, (c) no `class_lessons`
   assignment, and (d) a different-org student.

Every step asserts a concrete, observable outcome (row count, status string, thrown
rejection, rendered DOM/prop, or `null`). The test carries **labeled counts** in a
comment/console line the evidence parses exactly, e.g.
`e2e_lifecycle_steps:6`, `e2e_activity_count:4`, `e2e_approval_row_count:4`,
`e2e_student_null_cases:4`.

### 11.2 Phase 4 Red / Green targeted gate

```bash
cd apps/integrated-math-3 && CI=true npx vitest run __tests__/lib/teacher/content-authoring __tests__/convex/teacher/content-authoring-drafts.test.ts __tests__/components/teacher/content-authoring __tests__/app/teacher/content-authoring
```

- **Mid Red:** add the E2E test file first; run the gate. Expected: the new E2E test
  fails for a real, attributable reason (a missing assertion helper or a genuine wiring
  gap), while all Phase 1/2/3 files stay green. If every lifecycle step already passes on
  the first write because the handlers are complete, the E2E test must still fail-first on
  a deliberately-strict assertion the current code does not yet satisfy (e.g. a
  labeled-count line or a not-yet-exported adapter) so Red is non-vacuous; otherwise the
  Mid-Red role documents why the behavior is already fully covered and the E2E test is an
  *integration* proof binding existing units. Record exact file/test counts either way.
- **Green:** the same command must exit 0 with every listed file green, including the new
  E2E file, with no `.skip`/`.todo`/permissive snapshot and no broad mock of the reused
  handlers/schemas/renderers.

### 11.3 Final-verification gate commands and expected exit codes

Task "Final verification" runs these in order and records the actual exit code of each:

| Command | Purpose | Expected exit |
|---|---|---|
| Phase 4 targeted gate (§11.2) | E2E + all track tests green | `0` |
| `npm run ws:im3:lint` | boundary + IM3 lint | `0` |
| `npx tsc --noEmit` (repo root) | type check (vinext build does not enforce types) | `0` |
| `CI=true npm run test` | workspace test (`packages/knowledge-space-core`) | `0` |

Rules:

- Each command's real exit code is recorded verbatim in the Phase 4 evidence. A command
  that exits non-zero is reported as non-zero — never described as "all checks pass"
  (A5). Per §3, the track's closeout leans on the **targeted** gate plus explicit,
  named, pre-existing aggregate failures; if `CI=true npm run test` or `tsc` surface
  failures that pre-date and are outside this track, the evidence must name the exact
  failing files/counts and their owner, and must not attribute them to Phase 4.
- No `.next`/`.vinext` build artifacts or generated route typings are committed as part of
  Phase 4 evidence; they are untracked working-tree noise.

### 11.4 Avoiding A4 (vacuous-pass) and A5 (false-claim) in Phase 4 evidence

- **A4 — vacuous-pass on nothing-done.** The E2E test operates on non-empty fixtures
  (≥2 phases / ≥3 sections / ≥3 activities), and every lifecycle step asserts a positive
  outcome AND at least one negative/rejection case (submit-then-publish throws, stale-hash
  publish throws, four distinct `null` student-visibility cases). The marker guard must
  fail if the Phase 4 block reports "Green" with zero `[x]` automated tasks, and the E2E
  count line must reflect the real number of executed lifecycle steps
  (`e2e_lifecycle_steps:6`) rather than a constant. A render/handler step that never
  executes (no rows created, no DOM asserted) fails the phase.
- **A5 — false-claim text vs test reality.** Every command cited in `plan.md` Phase 4
  evidence must be paired with its actual exit code from a real run. The final-verification
  task copies exit codes from the terminal, not from expectation. Any "all checks pass"
  phrasing is only permitted when the cited command genuinely exits 0; aggregate reds are
  named as red/pre-existing with file+count. `measure/tracks.md` must not mark the track
  shipped until Phase 4 acceptance passes (A6).

### 11.5 Manual verification classification for closeout

The `[b] deferred:user` Measure User Manual Verification tasks for Phases 1–4 use the
structured marker vocabulary the supervisor understands:

- Phases 1–3 UMV tasks are already `[b] Task: Measure - User Manual Verification 'Phase N'
  ... deferred:user`. Phase 4's UMV task (`plan.md` line 484) is currently bare `[ ]` and
  MUST be moved to `[b] Task: Measure - User Manual Verification 'Phase 4' (Protocol in
  workflow.md) deferred:user` when Phase 4 automation starts (Mid Red / orchestrator),
  so no bare `[ ]` remains in the active block (A8).
- Per the marker vocabulary and `is_task_structurally_blocked` in
  `automation-supervisor.py`, a `[b]` checkbox **with** a trailing `deferred:<owner>`
  field is *structurally blocked* and is dropped from the incomplete-task count. These UMV
  tasks therefore do **not** block automated closeout — they are human-gated and are
  resolved by the human running the workflow.md manual protocol, tracked separately.
- Critically (A1): the task is blocked because of the **structured `[b]` + `deferred:user`
  field**, NOT because the word "deferred" appears in its prose. A UMV task written as a
  bare `[ ]` or `[~]` with only prose "deferred" must still count as incomplete. The
  strategy requires the structured form; the marker guard falsifies if closeout treats a
  prose-only "deferred" mention as blocked, or if a `[b]` task lacks the `deferred:user`
  field.

### 11.6 Fixtures, mocks, and live-behavior proof (Phase 4)

Fixtures:

- One canonical valid authored draft reused across the whole lifecycle (the
  `buildAuthoredDraft` shape from `content-authoring-drafts.test.ts` is the reference:
  explore/worked_example/guided_practice phases, ≥4 activities across ≥3 keys).
- One schema-invalid variant (missing required nested field / wrong type) to prove
  save/publish refusal.
- One unsafe-text variant (`<script>`, `onerror=`, `javascript:`) to prove sanitized
  persistence and inert preview rendering.
- Same-org active-enrollment student (visible) plus withdrawn/completed, unassigned, and
  different-org students (all `null`).

Mocks:

- Mock only the Convex `ctx.db` store harness and jsdom-missing browser APIs. Do **not**
  mock `saveTeacherDraftHandler` et al., the schemas, `computeComponentContentHash`,
  `resolveComponentKind`, `sanitizeAuthoringText`, or `AuthoredLessonPreview`'s rendering
  path. A lifecycle "proven" by mocking the handlers is a false E2E and fails FR/AC.

Live-behavior proof:

- The lifecycle transitions are proven by real handler calls mutating a shared store, real
  hash equality, real thrown rejections, and real `null` visibility outcomes.
- The preview step proves authored props reach a registered activity component through the
  student rendering path, and that unsafe text is inert in the DOM.

### 11.7 Artifact/documentation vs live behavior (Phase 4)

- **Artifact/documentation tests:** the Phase 4 marker guard (Tasks move `[~]`→`[x]`
  as automated work completes; UMV is `[b] ... deferred:user`; no bare `[ ]`); source
  guards that no new activity key, no `dangerouslySetInnerHTML`, no `convex/_generated`
  edits, and no package→app imports were introduced.
- **Live behavior tests:** the E2E lifecycle test executing real author→preview→submit→
  approve→publish→assign→student-visibility over real handlers and rendering.
- Falsification: the artifact/marker guard alone cannot satisfy Phase 4. If the E2E
  lifecycle test does not execute all six steps with observable outcomes, Phase 4 is not
  green.

### 11.8 Architecture guardrails and changed-contract risks (Phase 4)

- Phase 4 is verification-only: it must not add product logic, routes, activity types, or
  a second lifecycle/persistence/validation path. Any defect found is fixed against the
  existing Phase 1/2/3 modules via a scoped Red→Green loop.
- Keep composer/preview/E2E code app-local to IM3; keep `packages/` independent of
  `apps/` and `convex/_generated`.
- If the E2E work exposes a missing export or a genuine wiring gap, adding a thin exported
  adapter is allowed, but any exported-symbol/route change requires a graph/generated
  refresh or an explicit recorded deferral (A10).
- Changed-contract risk: the E2E test binds Phase 3 composer output to Phase 2 handler
  input. If the composer's normalized-draft shape and the handler's expected input have
  drifted, the E2E test is where that drift surfaces — it must fail loudly rather than be
  papered over with a reshaping mock.

### 11.9 Intentionally-red aggregate-suite handling (Phase 4)

- Phase 4 introduces no permanently-red test files. The E2E Red state is transient TDD
  evidence only.
- The known pre-existing aggregate failures (documented in Phase 2/3 evidence:
  roster-import wrappers, schema-vany-audit, practice/problem-families seeds,
  proficiency, existing `ActivityRenderer-graphing-explorer`) remain out of this track's
  scope. Phase 4 evidence names them by file+count and confirms the E2E test adds none of
  them. Do not hide them with `.skip`/`.todo`/broad filters (A7).

### 11.10 Anti-pattern coverage for Phase 4

| Anti-pattern | Phase 4 defense | Falsifies if |
|---|---|---|
| A1 — substring-as-structured-signal | Phase 4 UMV task must be `[b] ... deferred:user` (structured field), not prose "deferred". Closeout treats it as blocked only via the structured field. | A prose-only "deferred" is treated as blocked, or a `[b]` UMV task lacks `deferred:user`. |
| A2 — consent-blind publish gate | The E2E publish step requires fresh matching `component_approvals` + hash equality for every placed activity; publish from `submitted` and publish-after-edit both throw. | Publish succeeds without an approval row, with a stale hash, or by skipping the queue. |
| A3 — digit-only as labeled count | Evidence uses direct array-length assertions and exact labeled counts (`e2e_lifecycle_steps:`, `e2e_approval_row_count:`) parsed by label, never `[0-9]+` scraping. | A count guard passes by matching arbitrary digits in a date, hash, or duration. |
| A4 — vacuous-pass on nothing-done | Non-empty fixtures (≥2 phases/≥3 sections/≥3 activities); every step asserts a positive AND a negative outcome; marker guard fails a "Green" phase with zero `[x]`. | The E2E test passes with empty stores, an unexecuted step, or a phase reporting Green with no completed automated task. |
| A5 — false-claim text vs test reality | Every cited command in Phase 4 evidence is paired with its real exit code; aggregate reds are named red/pre-existing. | Any Phase 4 artifact says "all checks pass" while a cited command exits non-zero. |
| A6 — registry-note overstatement | `measure/tracks.md` stays "in progress" until Phase 4 acceptance passes; no "shipped/complete" until E2E + gates are green and UMV protocol is defined for the human. | Registry copy claims Teacher Content Authoring is shipped before Phase 4 acceptance. |
| A7 — over-broad filter swallowing hits | Pre-existing-failure accounting names exact files/paths; source guards exclude only exact generated/build paths, not bare English words. | A real regression is hidden inside a broad "pre-existing" bucket or a coarse text filter. |
| A8 — `[ ]` marker ambiguity | The active Phase 4 block must contain only `[~]`/`[x]`/`[b]` once started; the bare `[ ]` UMV task is converted to `[b] ... deferred:user`. | The Phase 4 block retains a bare `[ ]`, or a `[ ]` is treated as active/complete. |
| A9 — archived track path references | The E2E test lives under `apps/integrated-math-3/__tests__/...` and reads no `measure/` files; any marker guard resolves the track dir from orchestrator coordinates and is not imported by app code. | App/package tests read `measure/tracks/...`, or a guard breaks after archive. |
| A10 — generated-facts drift | Verification-only: no product structural change expected. If a thin adapter/export is added to close a gap, graph/generated artifacts are refreshed or deferral is recorded. | A new export/route lands while `graph.db`/generated docs are stale and closeout ignores it. |
| A11 — missing live Measure contract-test suite | Phase 4 does not substitute app tests for the Measure guard suite; the absent root `tests/*.sh` guard remains an audit finding, not something Phase 4 product tests satisfy. | Phase 4 evidence claims the Measure contract-test suite is covered by the app E2E test. |
| A12 — missing supervisor peer-review rule | Phase 4 makes no `automation-supervisor.py` change. Any marker-handling change is a separate peer-reviewed flow per `AGENTS.md`. | A Phase 4 product commit modifies `measure/automation-supervisor.py`. |

### 11.11 Handoff to Mid Red / Jr Green

Mid Red:

- Move Phase 4 Task 1 (`End-to-end ...`) to `[~]`, Task 3 (UMV) to
  `[b] ... deferred:user`; leave Task 2 (`Final verification`) `[ ]`→`[~]` when it starts.
  Ensure no bare `[ ]` remains in the active Phase 4 block.
- Add the E2E test file importing the real Phase 1/2/3 surfaces; run the §11.2 gate and
  capture labeled counts, showing the new test fails-first for a real reason while all
  existing track files stay green.

Jr Green:

- Make the E2E test pass by binding existing surfaces (thin adapters only if a genuine
  gap exists); do not add parallel logic or new activity types.
- Run the §11.3 final-verification commands, record each real exit code, and name any
  pre-existing aggregate failures by file+count. Do not write "all checks pass" for a
  non-zero command.
