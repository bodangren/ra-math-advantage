# Test Strategy — teacher-content-authoring_20260605 Phase 3

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
