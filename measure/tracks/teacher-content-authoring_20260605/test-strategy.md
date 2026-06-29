# Test Strategy — teacher-content-authoring_20260605 Phase 2

Role: Measure Strategy. Scope: **Phase 2 — Draft Lifecycle & Persistence** only. No product-source implementation in this pass.

## 1. Required context and inspected surfaces

Read before strategy: `measure/index.md`, `measure/workflow.md`, `measure/tracks.md`, `measure/anti-patterns.md`, this track's `spec.md`, `plan.md`, prior `test-strategy.md`, and `phase-1-acceptance-result.json`.

Phase 1 acceptance/handoff constraints that Phase 2 must preserve:

- Phase 1 targeted tests pass for `normalizeLessonDraft`, `validateActivityConfig`, and `sanitizeLessonDraft`.
- Phase 2 must orchestrate `normalize -> validate every activity -> sanitize -> hash/persist`; it must not persist unsanitized, schema-invalid, or schema-less activity payloads.
- Manual verification remains human-gated: Phase 2 UMV is `[b] ... deferred:user`; automation may prepare evidence but must not self-approve UX.

Code/graph facts that shape Phase 2:

- Convex AI guidelines path requested by the orchestrator, `apps/integrated-math-3/convex/_generated/ai/guidelines.md`, is absent; use existing Convex patterns in source and keep `_generated/` untouched.
- `build-graph stats ./graph.db`: 14,292 nodes / 20,788 edges / 2,082 files. Relevant searches found Phase 1 authoring functions, the approval/hash primitives, teacher auth helpers, and lesson assignment surfaces.
- Phase 1 pure modules live under `apps/integrated-math-3/lib/teacher/content-authoring/`; Phase 2 persistence should call them rather than reimplement validation/sanitization in Convex handlers.
- Existing Convex curriculum tables in `apps/integrated-math-3/convex/schema.ts`: `lessons`, `lesson_versions` (`draft|review|published|archived`), `phase_versions`, `phase_sections`, `activities`, `component_reviews`, `component_approvals`, `classes`, `class_lessons`, and `class_enrollments`.
- Existing approval primitives: `computeComponentContentHash` hashes `{ componentKind, componentKey, props, gradingConfig }`; `assembleReviewQueueItem` and the IM3 adapter derive `example|activity|practice` from phase placement and mark stale when stored/current hashes differ.
- Existing dev approval mutation `convex/dev.ts::submitReviewHandler` writes `component_reviews`, patches activity approval for `activity`, and upserts `component_approvals` for `example|practice`, with hash mismatch protection for existing non-activity approvals.
- Existing teacher assignment helpers in `convex/teacher/lessonAssignment.ts` require teacher-owned classes for assignment/unassignment; student helpers in `convex/student.ts` include `isStudentActivelyEnrolled` and `isStudentEnrolledInClassForLesson`, but default lesson progress queries primarily resolve latest published versions and should not be treated as sufficient proof of assignment/enrollment gating for authored content.

## 2. Phase 2 Red command

Targeted Red gate for every Phase 2 task:

```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring apps/integrated-math-3/__tests__/convex
```

Mid Red should add failing tests under these surfaces, then run the command above and prove failures are attributable to new Phase 2 expectations while existing Phase 1 content-authoring tests remain green.

### Task 2.1 — Convex draft lifecycle, idempotent

Required failing tests:

- New Convex unit tests, preferably `apps/integrated-math-3/__tests__/convex/teacher/content-authoring-drafts.test.ts`, import handler-level functions from a new app-local Convex authoring module.
- Draft creation persists a teacher-scoped authored lesson with normalized phases/sections/activities and a status of `draft`.
- Saving the same draft with the same idempotency key patches the same draft/version rows rather than duplicating lessons, versions, activities, phases, or sections.
- Allowed transitions only: `draft -> submitted`, `submitted -> approved|rejected`, `rejected -> draft` for edit-after-reject, `approved -> published`. Direct `draft -> published`, `submitted -> published`, `rejected -> published`, and edits to `submitted|approved|published` are rejected.
- Rejection records a comment/feedback reason and edit-after-reject preserves prior review provenance while producing a new content hash after sanitized content changes.

Falsification condition: Red is invalid if tests pass before the lifecycle handlers exist, if they assert only TypeScript shape/source text, or if duplicate rows with the same idempotency key still satisfy assertions.

### Task 2.2 — Approval queue + content hashing integration

Required failing tests:

- Submitting a draft computes real hashes with `computeComponentContentHash` over sanitized, schema-valid activity props and creates/links review queue records using the existing `component_reviews` / `component_approvals` contract; no parallel hash or approval table is accepted unless schema/plan explicitly documents why.
- Hashes are deterministic across object key order but change when sanitized authored text or activity props change.
- Publish is blocked until every placed authored activity's effective approval status is `approved` **and** stored hash equals the current hash for the placement-derived component kind.
- Stale approvals are detected when a rejected/edited draft changes content after review; old approvals cannot publish edited content.
- `needs_changes`/`rejected` decisions require a comment and surface edit-after-reject status to the teacher-facing lifecycle result.

Falsification condition: tests fail the strategy if approval is mocked to always approved, if a local MD5/stringification hash replaces `computeComponentContentHash`, if review queue linkage ignores placement-derived `example|activity|practice`, or if stale hash mismatches still publish.

### Task 2.3 — Teacher-scoped authorization + assignment/enrollment respect

Required failing tests:

- Non-teacher/student/parent users cannot create, save, submit, approve, publish, assign, or read another teacher's drafts.
- A teacher can only mutate drafts they own and can only assign a published authored lesson to classes they own.
- Cross-organization/cross-teacher class assignment is rejected even if the lesson is published.
- Student visibility for authored content requires all three facts: latest authored version is `published`, `class_lessons` assigns it to the student's class, and `class_enrollments.status === "active"` for that student/class.
- Withdrawn/completed/non-enrolled students and students from another organization cannot read or progress through the authored lesson, even if they know the slug/id.

Falsification condition: any test that checks only role (`teacher`) but not ownership/organization/enrollment is insufficient; any student query that returns authored content without active assignment+enrollment fails the Red/Green gate.

## 3. Phase 2 Green and closeout gates

Green gate after each Phase 2 task implementation:

```bash
CI=true npx vitest run apps/integrated-math-3/__tests__/lib/teacher/content-authoring apps/integrated-math-3/__tests__/convex
```

Required Green evidence:

- All new Phase 2 tests pass without `.skip`, `.todo`, vacuous snapshots, or broad mocks of Phase 1 validation/sanitization, Convex auth checks, hashing, or approval derivation.
- Phase 1 content-authoring tests still pass in the same command; Phase 2 may extend but must not weaken model/validation/sanitization assertions.
- Test output records labeled counts when counts matter (for example `draft_insert_count:1`, `activity_hash_count:3`, `approved_activity_count:3`) and compares parsed integer values, not arbitrary digit matches.
- The Green implementation exposes handler-level functions that can be unit-tested with mock Convex contexts and keeps public/internal Convex wrappers thin.

Closeout gate for Phase 2:

```bash
npm run ws:im3:lint
npx tsc --noEmit
CI=true npm run test
```

Closeout is blocked unless these commands are green or the orchestrator records an explicit pre-existing aggregate failure with owner, exact command output, and the targeted Phase 2 gate above green. Do not write “all checks pass” in `plan.md`, `tracks.md`, result JSON, or commit notes unless the cited command exits 0.

Manual verification: Phase 2 UMV is `[b] ... deferred:user`. Automated tests can prove persistence, lifecycle, approval, and access-control behavior; they cannot claim the teacher-facing UX has been manually accepted.

## 4. Fixtures, mocks, and live-behavior proof

Fixtures:

- Minimal valid authored lesson drafts with at least two phases, nested sections, and at least three activities spanning placement-derived component kinds: a `worked_example` example, a `guided_practice` or `independent_practice` practice item, and an `explore`/`learn` activity item.
- Reuse valid activity props from Phase 1 schema tests for canonical keys (`graphing-explorer`, `step-by-step-solver`, `comprehension-quiz`, `fill-in-the-blank`, `rate-of-change-calculator`, `discriminant-analyzer`).
- Invalid fixtures: placeholder/schema-less keys, wrong props for a key, unsafe text (`<script>`, event attributes, `javascript:` URLs), duplicate idempotency keys, stale approval hash, missing rejection comment, direct illegal status transitions, archived teacher class, cross-teacher class, withdrawn enrollment, completed enrollment, and no enrollment.
- Auth fixtures must include at least: owning teacher, other teacher same org, teacher other org, admin if supported by existing auth semantics, student active in assigned class, student withdrawn from assigned class, student in unassigned class, and parent/non-teacher user.

Mocks:

- Mock Convex `ctx.db` only at the storage boundary; the tests must execute the real handler logic, real Phase 1 normalize/validate/sanitize functions, and real `computeComponentContentHash`.
- Do not mock `getPropsSchema`, `SCHEMA_REGISTRY`, `sanitizeLessonDraft`, `computeComponentContentHash`, `resolveComponentKind`, `assembleReviewQueueItem`, or teacher/class/enrollment predicates.
- Mock time/id generation only through injectable `now` / idempotency inputs or deterministic fixtures; do not assert brittle wall-clock values.

Live-behavior proof (not just artifact proof):

- Tests must inspect resulting rows/returned DTOs after handler execution: one draft/version per idempotent save, persisted sanitized text, persisted activities with schema-valid props, review rows/approval rows with current hashes, and publish gating results.
- Publish tests must mutate content after approval and rerun the publish path to prove stale approval rejection.
- Student access tests must execute the read/visibility handler against assignment+enrollment fixtures; source scans for `class_enrollments` or `class_lessons` are useful guards but do not prove live access behavior.

## 5. Artifact/documentation tests vs live behavior tests

Artifact/documentation tests:

- Phase 2 plan marker guard: automatable Phase 2 tasks are `[~]`; UMV is `[b] ... deferred:user`; no legacy `[ ]` remains in the active Phase 2 block.
- Source guard: no new parallel activity schema registry, no new approval/hash primitive outside existing component-approval adapters, no edits/imports from `convex/_generated/`, and no package import from `apps/`.
- Schema guard: if a new authoring draft table is introduced, it must carry teacher ownership, status, idempotency or natural-key uniqueness support, and hash/review references sufficient for lifecycle tests.

Live behavior tests:

- Lifecycle transitions and idempotent persistence execute against handlers and mock DB rows.
- Approval/hash integration executes real hash and stale-check logic.
- Authorization and assignment/enrollment gates execute with role, organization, class ownership, lesson assignment, and enrollment fixtures.

Falsification condition: artifact/source tests cannot be the only proof for FR4, FR5, or FR6. If handler behavior is not executed, Phase 2 is not green.

## 6. Architecture guardrails and changed-contract risks

Guardrails:

- Keep teacher content-authoring policy app-local to IM3 (`apps/integrated-math-3/...`). Do not put IM3 teacher/class policy into reusable packages.
- Reuse Phase 1 authoring model, validation, and sanitization functions; do not duplicate their contracts in Convex handlers.
- Reuse component-approval hash/review primitives; do not add a parallel approval queue for authored content without an explicit schema/plan amendment.
- Keep Convex public/internal wrappers thin; test exported handler functions with injected `ctx` and deterministic inputs.
- No dependency changes, no generated Convex file edits, and no mutation of shared package boundaries.
- If schema/function signatures/exported symbols change, refresh graph/generated artifacts through the established Measure workflow or explicitly record why graph refresh is deferred.

Changed-contract risks to test:

- `lesson_versions.status` currently has `draft|review|published|archived`, while the product lifecycle says `draft|submitted|approved|rejected|published`. Tests must pin the chosen mapping instead of silently collapsing statuses (for example `submitted` may map to persisted `review`, but teacher-facing status must remain unambiguous).
- `ComponentKind` currently excludes `lesson`; whole-lesson approval must either be decomposed into existing placed `example|activity|practice` approvals or be accompanied by a deliberate contract change. Tests must fail if publishing only checks lesson status while ignoring placed activity approvals/hashes.
- `computeComponentContentHash` ignores lesson metadata; if title/section text affects publish safety, tests must prove the sanitized content that matters is represented in hash inputs or separately guarded by a documented content-hash contract.
- Existing student lesson queries resolve latest published versions and may not enforce assignment/enrollment. Phase 2 student-visibility tests must target the authored-content access path and fail on unassigned/withdrawn fixtures.
- Existing `dev.submitReviewHandler` is dev-route oriented and trusts the Next.js route for auth; teacher content authoring must not expose approval/publish through an internal-only/developer-only trust boundary without tests proving the caller's teacher/admin authorization.

## 7. Intentionally-red aggregate-suite handling

- Phase 2 introduces no intentionally-red test files. Red is temporary TDD evidence only.
- The required Red/Green command includes all IM3 Convex tests plus Phase 1 content-authoring tests. Mid Red must label newly failing Phase 2 tests and show Phase 1 tests still pass.
- If pre-existing Convex tests are red in the aggregate command, record exact failing files and counts, then also run the narrower new Phase 2 test file(s) plus Phase 1 content-authoring tests to prove the Phase 2 delta. Do not hide failures with `.skip`, `.todo`, environment guards, or permissive snapshots.
- Synthetic negative cases belong inside passing tests that assert rejection/throw/null result; they are not intentionally-red files after Green.

## 8. Anti-pattern coverage for Phase 2

| Anti-pattern | Phase 2 defense | Falsifies if |
|---|---|---|
| A1 — substring-as-structured-signal | Phase 2 plan uses structured `[b] ... deferred:user` only for UMV; automatable work is `[~]`. Marker guards parse checkbox state and trailing `deferred:user`, not prose. | Any Phase 2 task is ignored because its prose contains “deferred”, or UMV lacks `[b] deferred:user`. |
| A2 — consent-blind publish gate | No student/case-study consent is in scope, but publish tests must be approval-aware: publish requires explicit approved status and matching current hash for every placed authored item. If future authored content contains named student artifacts, tests must require anonymization/consent before publish. | A test or implementation flips a draft to `published` without approval+hash proof, or treats publish as a raw status patch. |
| A3 — digit-only as labeled count | Row-count/idempotency assertions use labeled integers (`draft_insert_count:1`, `review_row_count:n`) or direct array lengths in Vitest, never `/[0-9]+/` log scraping. | Any guard passes by matching arbitrary digits in command output or dates. |
| A4 — vacuous-pass on nothing-done | Lifecycle tests require at least one positive transition and one rejected illegal transition per status; approval tests require at least one approved and one stale item; enrollment tests require active and inactive students. | Fixture arrays are empty, no Phase 2 cases execute, or marker checks report pass with zero completed/active tasks. |
| A5 — false-claim text vs test reality | Plan/result text may only claim commands that were run with their real exit code; broad aggregate reds must be documented as red. | `plan.md`, `tracks.md`, result JSON, or commit note says “all checks pass” while the cited command exits non-zero. |
| A6 — registry-note overstatement | `measure/tracks.md` must not claim Teacher Content Authoring is shipped/resolved/publishable until Phase 2 and later UI/E2E phases are accepted. | Registry copy claims teacher authoring is complete or publishable while Phase 2/UX/E2E gates remain red or pending. |
| A7 — over-broad filter swallowing hits | Source guards may exclude generated/build paths only; tests enumerate exact statuses/roles (`student`, `parent`, `withdrawn`, `completed`) rather than filtering broad English words. | A forbidden status transition, unsafe text, or unauthorized role is excluded by generic prose filters such as “never” or “do not”. |
| A8 — `[ ]` marker ambiguity | Active Phase 2 markers are `[~]`; UMV is `[b]`; no `[ ]` remains in Phase 2. | Supervisor/guard treats `[ ]` as active or Phase 2 block still contains `[ ]`. |
| A9 — archived track path references | Product tests must not read Measure files. Any Measure artifact guard resolves the current track path from the provided id and must not hard-code archived paths. | App/package tests import/read `measure/tracks/...`, or a guard breaks after archive because it lacks a track-dir resolver. |
| A10 — generated-facts drift after structural change | If Phase 2 adds Convex tables/functions or exported handlers, run graph/generated refresh or record explicit deferral; docs-only strategy makes no product structural change. | New schema/functions land while `graph.db`/generated docs are stale and closeout ignores drift. |

## 9. Handoff to Mid Red / Green

Mid Red should add the Phase 2 Convex and content-authoring persistence tests first, run the targeted Red command, and commit failing tests only if the orchestrator allows Red commits. Green should implement the smallest app-local persistence/lifecycle layer that passes those tests while preserving Phase 1 validation/sanitization, existing approval/hash primitives, and teacher/class/enrollment authorization. Keep composer UI and preview UX in Phase 3; keep end-to-end browser/manual acceptance in Phase 4 or UMV.
