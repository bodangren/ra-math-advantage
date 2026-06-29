# Test Strategy — teacher-content-authoring_20260605 Phase 1

Role: Measure Strategy. Scope: **Phase 1 — Authoring Model & Schema-Driven Validation** only. No product-source implementation in this pass.

## 1. Required context and implementation surfaces

Read before strategy: `measure/index.md`, `measure/workflow.md`, `measure/tracks.md`, `measure/anti-patterns.md`, this track's `spec.md`, and `plan.md`.

Graph/code inspection that shapes Phase 1:

- Activity runtime registry: `apps/integrated-math-3/lib/activities/registry.ts` registers 6 real activity keys plus placeholder keys (`equation-solver`, `drag-drop-categorization`). Phase 1 authoring must only offer keys with schemas unless it has an explicit schema-missing error state.
- Canonical Zod schema registry: `packages/math-content/src/schemas/index.ts` exports `SCHEMA_REGISTRY` and `getPropsSchema`; IM3 re-exports them from `apps/integrated-math-3/lib/activities/schemas/index.ts`; `packages/activity-components/src/schemas/*` re-export the same canonical schemas. Do **not** create a parallel authoring schema registry.
- Convex DB validator: `apps/integrated-math-3/convex/schema.ts` defines `activityPropsValidator` as a strict union for persisted `activities.props`, but it is not a discriminated union by `componentKey`. Authoring validation must bind `{ componentKey, props }` and validate via `getPropsSchema(componentKey)`, not by trusting the broad Convex union alone.
- Approval/hash primitives exist for later phases: `packages/component-approval/src/content-hash.ts::computeComponentContentHash`, `packages/component-approval/src/review-queue.ts::assembleReviewQueueItem`, and IM3 adapters in `apps/integrated-math-3/lib/activities/{content-hash,review-queue}.ts`. Phase 1 must not change their contract; it should preserve canonical props shape so Phase 2 hashes sanitized, schema-valid payloads.
- Existing preview surfaces are teacher lesson preview (`app/teacher/lesson/[lessonSlug]/page.tsx` + `convex/teacher.ts::getTeacherLessonPreview`) and dev review harness (`components/dev/review-harness/ActivityReviewHarness.tsx`). Phase 1 may add preview-ready normalized models, but must not claim full preview/live approval until Phase 3/Phase 2 respectively.
- `build-graph stats ./graph.db`: 14,254 nodes / 20,750 edges / 2,079 files. Inspected symbols: `getPropsSchema`, `computeComponentContentHash`, `registerActivity`, `LessonRenderer`; `activityPropsValidator` is not graph-indexed as a const, so source/read tests must cover schema-parity risks.

## 2. Phase 1 Red command

Required orchestrator Red gate:

```bash
CI=true npx vitest run apps/integrated-math-3 packages/activity-components
```

Targeted Red expectation inside that aggregate: Mid Red should add failing tests for these Phase 1 behaviors, then run the aggregate above and show failures attributable only to the new Phase 1 tests:

- `apps/integrated-math-3/__tests__/lib/teacher/content-authoring/authoring-model.test.ts`
  - Fails until a pure authoring model accepts ordered lesson → phases → sections → activities with stable IDs/order and rejects schema-less activity keys.
- `apps/integrated-math-3/__tests__/lib/teacher/content-authoring/activity-config-validation.test.ts`
  - Fails until `{ componentKey, props }` validation uses `getPropsSchema(componentKey)` and rejects cross-key props even when another schema in the Convex union might accept them.
- `apps/integrated-math-3/__tests__/lib/teacher/content-authoring/sanitize-authored-text.test.ts`
  - Fails until authored markdown/free-text is sanitized before it can enter normalized sections/activity prompts.
- Optional parity guard in `packages/activity-components/src/__tests__/schemas.test.ts` or IM3 schema tests:
  - Fails if authoring-visible schema keys diverge from canonical `SCHEMA_REGISTRY` without an explicit unsupported-key error.

Falsification condition: the Red gate is invalid if it passes before Phase 1 implementation, if failures come from unrelated legacy tests only, or if new tests are `.skip`/`.todo`/snapshot-only without asserting behavior.

## 3. Phase 1 Green and closeout gates

Green gate after implementation:

```bash
CI=true npx vitest run apps/integrated-math-3 packages/activity-components
```

Required Green evidence:

- All Phase 1 tests above pass without `.skip`, `.todo`, broad mocks of `getPropsSchema`, or fixture-only assertions.
- Valid fixtures for all six canonical activity schemas parse through the authoring validation path.
- Invalid fixtures fail with structured errors that include the failing `componentKey`, field path, and human-actionable message.
- Unknown/placeholder activity keys (`equation-solver`, `drag-drop-categorization`, or any runtime key missing from `SCHEMA_REGISTRY`) are rejected or marked unsupported; they must not save as arbitrary `Record<string, unknown>`.
- Sanitization tests prove hostile text is neutralized in lesson titles, phase titles, section markdown/callouts, quiz prompts, explanations, fill-in templates, hints, and any activity text fields in normalized output.

Closeout gate for Phase 1:

```bash
npm run ws:im3:lint
npx tsc --noEmit
CI=true npm run test
```

Closeout is blocked unless the commands above are green or the orchestrator records an explicit pre-existing aggregate failure with owner, command output, and a narrower Phase 1 targeted gate that is green. Do not write “all checks pass” in `plan.md` or `tracks.md` unless the cited command exits 0.

Manual verification: Phase 1 UMV is `[b] ... deferred:user`; automation may prepare a verification script/checklist, but it must not self-approve UX. `UX_REQUIRED=auto` means no browser UX proof is required for Phase 1 unless Green adds visible UI; if UI is touched, require a human screenshot/interaction note at UMV.

## 4. Fixtures, mocks, and live-behavior proof

Fixtures:

- Use minimal valid props already represented in `packages/math-content/src/__tests__/schemas.test.ts` / `packages/activity-components/src/__tests__/schemas.test.ts` for: `graphing-explorer`, `step-by-step-solver`, `comprehension-quiz`, `fill-in-the-blank`, `rate-of-change-calculator`, `discriminant-analyzer`.
- Add malformed fixtures for: missing required fields, empty arrays where schema disallows them, wrong `componentKey` for otherwise-valid props, placeholder/schema-less keys, duplicate phase/section order, and unsafe text payloads (`<script>`, `<img onerror>`, `javascript:`, event-handler attributes, markdown link payloads).
- Fixture count assertions must be labeled integers such as `canonical_schema_count:6` and `authoring_schema_count:6`; never assert with an unlabeled digit-only regex.

Mocks:

- Do not mock `SCHEMA_REGISTRY`, `getPropsSchema`, Zod `safeParse`, or sanitizer behavior in validation unit tests.
- React render tests may mock unrelated layout/Convex/auth boundaries, but not the sanitizer output or schema lookup.
- No fake approval queue/hash mocks are needed in Phase 1; hash/approval behavior is a Phase 2 concern except for preserving normalized props shape.

Live-behavior proof (not just artifact proof):

- Tests must execute the real Zod schemas via `getPropsSchema(componentKey).safeParse`.
- Tests must execute the real sanitizer/normalizer and assert returned data, not only scan source text.
- At least one render-level test must prove sanitized authored text renders as text and does not introduce `dangerouslySetInnerHTML` or executable attributes. A source guard against new `dangerouslySetInnerHTML` in authoring/preview files is useful but is an artifact test, not sufficient by itself.

## 5. Artifact/documentation tests vs live behavior tests

Artifact/documentation tests:

- Plan marker checks: Phase 1 automatable tasks are `[~]`; UMV is `[b] ... deferred:user`; no legacy `[ ]` remains in the active Phase 1 block.
- Source guards: no new authoring schema registry that duplicates `SCHEMA_REGISTRY`; no new `dangerouslySetInnerHTML` in authoring/preview code; no package import from `apps/` or `convex/_generated/`.
- Registry/key parity guard: authoring-visible schema keys are derived from canonical registry or explicitly documented as unsupported.

Live behavior tests:

- Authoring model normalizes and validates real payloads.
- Invalid configs produce failed parses and surfaced errors.
- Sanitizer transforms/strips unsafe text and render tests prove inert output.

Falsification condition: a source/artifact test cannot be used as the only proof for FR2 or sanitization. If behavior is not executed, the gate fails.

## 6. Architecture guardrails and changed-contract risks

Guardrails:

- New Phase 1 authoring logic should be pure and app-local, preferably under `apps/integrated-math-3/lib/teacher/content-authoring/`; do not put IM3 teacher-specific authoring policy into reusable `packages/`.
- Shared packages must not import from `apps/` or `convex/_generated/`.
- No new activity component types and no shadow schemas. Reuse `@math-platform/math-content/schemas` via existing re-exports.
- Do not mutate approval/hash primitives in Phase 1; Phase 1 emits stable sanitized, schema-valid content for Phase 2 to hash/queue.
- Do not alter Convex generated files. If Phase 1 changes exported TypeScript symbols or schema/route shape, update graph/generated artifacts only through the established Measure workflow and record why.

Changed-contract risks to test:

- `activityPropsValidator` is a broad union without `componentKey`; a wrong key + valid props from another component can be persisted unless Phase 1 binds validation to the key.
- Runtime registry contains placeholder keys with no canonical schema; authoring must not treat runtime registration as authorability.
- Sanitization can change hash inputs; define Phase 1 normalized output as the pre-hash source of truth so Phase 2 does not hash unsanitized drafts.
- Existing `ActivityReviewHarness` is a placeholder preview for activities; Phase 1 tests must not claim “student-accurate preview” until Phase 3 wires the existing QA harness.
- Free-text sanitization must preserve math notation and markdown needed for instruction while neutralizing executable HTML/URLs.

## 7. Intentionally-red aggregate-suite handling

- Phase 1 introduces **no intentionally-red test files**. Red is temporary TDD evidence only.
- The required aggregate Red/Green command is broad. Mid Red must label newly failing Phase 1 tests in output and must not hide failures with `.skip`, `.todo`, permissive snapshots, or environment guards.
- If `CI=true npm run test` is red at closeout for unrelated pre-existing reasons, record the exact failing test files, owner/track if known, and the narrower Phase 1 green command. Do not mark the phase complete or write “all tests pass” unless the command cited actually exits 0.
- Synthetic negative cases belong inside passing tests (asserting `safeParse(...).success === false`); they are not intentionally-red files.

## 8. Anti-pattern coverage for Phase 1

| Anti-pattern | Phase 1 defense | Falsifies if |
|---|---|---|
| A1 — substring-as-structured-signal | Plan uses structured `[b] ... deferred:user` only for UMV; automatable tasks are `[~]`. Artifact marker check should parse markers, not prose. | Any active Phase 1 task is skipped because its prose contains “deferred”, or UMV lacks `[b] deferred:user`. |
| A2 — consent-blind publish gate | Phase 1 must not implement or assert publish approval. Tests that mention publish must assert it is out of scope until Phase 2/4 gates. | A Phase 1 test flips/claims `published` or approval without consent/approval gate coverage. |
| A3 — digit-only labeled count | Schema/key parity tests emit and parse labeled integers (`canonical_schema_count:6`, `unsupported_key_count:n`). | A test passes by matching any digit (`[0-9]+`) in arbitrary output. |
| A4 — vacuous-pass on nothing-done | Red suite requires at least one valid and one invalid case per validation path plus sanitizer hostile fixtures. Marker checks require `>=1` completed/active assertion, not zero-case pass. | Tests pass with empty fixture arrays or no Phase 1 cases executed. |
| A5 — false-claim text vs test reality | Plan/result text may only claim commands that were run and exited 0/expected-red. | `plan.md`, result JSON, or strategy says “all checks pass” while the cited command exits non-zero. |
| A6 — registry-note overstatement | `measure/tracks.md` must remain honest: no “complete/resolved/publishable” wording until Phase 1 Green/closeout evidence exists. | Registry copy claims authoring is shipped/resolved while Phase 1 tests or closeout are red. |
| A7 — over-broad filter swallowing hits | Source guards exclude paths only (`.next`, `_generated`, fixtures), not English words like “never” or “do not”; unsupported-key checks enumerate exact keys. | A banned `dangerouslySetInnerHTML`, unsupported key, or unsafe text case is filtered out by generic prose filters. |
| A8 — `[ ]` marker ambiguity | Phase 1 active markers are `[~]`; UMV is `[b]`; no `[ ]` remains in Phase 1 block. | Supervisor/guard treats `[ ]` as in-progress or Phase 1 still contains `[ ]`. |
| A9 — archived track path references | Phase 1 product tests must not read Measure track files. Any Measure artifact guard must resolve the current path from the provided track id and must not hard-code archived paths. | A test references `measure/tracks/<id>` after archive without resolver, or package/app tests import Measure docs. |
| A10 — generated-facts drift | Docs-only strategy does not rescan graph. If implementation changes exported symbols, routes, schemas, or JSX hierarchy, run the project's generated-facts/graph refresh protocol before closeout. | Structural changes land while `graph.db` / generated docs are stale and the closeout ignores the drift. |

## 9. Handoff to Mid Red / Green

Mid Red should add Phase 1 tests first, run the required Red command, and commit failing tests only if the orchestrator allows Red commits. Green should implement the smallest pure validation/sanitization/model layer to pass those tests, then run the Green and closeout gates. Keep Phase 1 separate from lifecycle persistence, approval queue submission, and composer UI beyond any minimal render proof needed for sanitization.

MEASURE_AGENT_RESULT
role: strategy
status: complete
track: teacher-content-authoring_20260605
phase: Phase 1 — Authoring Model & Schema-Driven Validation
commits: pending
commands: build-graph stats/search/inspect for activity schemas, registry, approval hash, review queue, lesson preview, and renderer surfaces
files_changed: measure/tracks/teacher-content-authoring_20260605/test-strategy.md; measure/tracks/teacher-content-authoring_20260605/plan.md
plan_updates: Phase 1 automatable tasks marked [~]; Phase 1 manual verification marked [b] deferred:user
known_failures: none introduced; untracked _add_types.py and _add_types.ts preserved out of scope
handoff: Add failing Phase 1 tests under IM3 teacher content-authoring tests and schema parity tests, then implement pure app-local model/validation/sanitization using canonical getPropsSchema/SCHEMA_REGISTRY; do not implement persistence, approval, publishing, or full composer UI in Phase 1.
END_MEASURE_AGENT_RESULT
