# Implementation Plan: Reliability Contracts & DB Boundary Enforcement

## Phase 1: Shared Packages – Branded Types & Test Fixtures [checkpoint: eaf6fe8]

- [x] **Task 1.1: Introduce Branded ID Type** [49a5262]
  - **File:** `packages/practice-core/src/practice/contract.ts`
  - **Action:** Update `practiceSubmissionEnvelopeSchema` to brand the `activityId` (e.g., `z.string().brand<'ConvexId'>()`). Update type exports as necessary.
  - **Validation:** Run `practice-core` unit tests to ensure Zod parsing handles the brand correctly.

- [x] **Task 1.2: Export `createMockPracticeEnvelope` Factory** [8980232]
  - **File:** `packages/practice-core/src/practice/fixtures.ts` (New file)
  - **Action:** Implement and export `createMockPracticeEnvelope(overrides?)`. Add to `index.ts` exports.

- [x] **Task 1.3: Export SRS Mock Factories** [3a13a6c]
  - **File:** `packages/srs-engine/src/srs/fixtures.ts` (New file)
  - **Action:** Implement and export `createMockSrsCard(overrides?)` and `createMockSrsReviewLog(overrides?)` ensuring compliance with `srs.contract.v1`. Add to `index.ts` exports.

- [x] **Task 1.4: Package Verification** [0dcc576]
  - **Action:** Run tests in both packages (`npm run test` inside `packages/practice-core` and `packages/srs-engine`).

## Phase 2: Convex Schema Boundary Enforcement [checkpoint: e2366a8]

- [x] **Task 2.1: Define Strict Activity Props Union** [7ce486e]
  - **File:** `apps/integrated-math-3/convex/schema.ts`
  - **Action:** Create a `v.union()` mapping for all known `componentKey` values (e.g., `graphing-explorer`, `step-by-step-solver`) to their respective `v.object()` schemas.
  - **BM2:** Replace `v.any()` with `v.record(v.string(), v.any())` for `activities.props` and `phase_sections.content` (validators for 40+ BM2 component types do not yet exist as Convex validators).

- [x] **Task 2.2: Apply Strict Types to Curriculum Fields** [7ce486e]
  - **File:** `convex/schema.ts`
  - **Action:** Replace `v.any()` on `activities.props` with the new props union. Replace `v.any()` on `phase_sections.content` with a discriminated union for text, activity, callout, video, and image types.

- [x] **Task 2.3: Define Strict SRS State Schema** [7ce486e]
  - **File:** `convex/schema.ts`
  - **Action:** Replace `v.any()` on `srs_review_log.stateBefore`, `srs_review_log.stateAfter`, and `due_reviews.fsrsState` with a strictly typed `v.object()` mirroring `SrsCardState`.

## Phase 3: SRS State Transition Validation

- [x] **Task 3.1: Implement `validateSrsTransition`** [a2db1ae]
  - **File:** `packages/srs-engine/src/srs/transition-validator.ts`
  - **Action:** Write pure logic validating that an SRS card state transition is mathematically sound (reps increased, lapses updated correctly if state went to 'relearning', etc.).
  - **Validation:** Write unit tests for `validateSrsTransition` covering standard transitions and invalid regressions.

- [x] **Task 3.2: Integrate Validation into Convex Mutation**
  - **File:** `convex/srs/reviews.ts` (or the relevant handler file for `srs_review_log` inserts)
  - **Action:** Invoke `validateSrsTransition` prior to calling `ctx.db.insert("srs_review_log", ...)` or `ctx.db.patch("srs_cards", ...)`. Throw an error on invalid transitions.
  - **Key Changes:**
    - Updated `validateSrsTransition` in `packages/srs-engine` to match actual ts-fsrs behavior: `new` → `learning` or `review`; `learning` → `learning` or `review`; `review` → `learning` or `review`. Removed overly strict stability-decrease check because ts-fsrs legitimately decreases stability on Again ratings.
    - Duplicated updated validator logic inline in three Convex handler files (Convex runtime cannot reliably import npm packages):
      - `apps/integrated-math-3/convex/srs/processReview.ts`
      - `apps/integrated-math-3/convex/srs/reviews.ts`
      - `apps/bus-math-v2/convex/srs.ts`
    - Fixed discriminated-union type narrowing for `evidence.action` using `'action' in evidence` instead of direct property access.
    - Added BM2 `SerializedCardState` type and `serializeCard`/`deserializeCard` helpers in `lib/study/srs.ts` to bridge ts-fsrs `Card` ↔ DB-serialized shape.
    - Fixed IM3 `convex/study.ts` `ProcessReviewArgs.fsrsState` type to match strict schema.
    - Fixed IM3 `__tests__/convex/study.test.ts` mock data to include complete fsrsState objects.
    - Fixed BM2 `lib/study/srs.ts` `learning_steps` default (`0` instead of `undefined`).
  - **Test Results:**
    - IM3 SRS tests: 65/65 pass
    - BM2 SRS tests: 23/23 pass
    - srs-engine package tests: 108/108 pass
    - practice-core package tests: 101/101 pass

## Known Issues / Phase 4 Prerequisites

The following TypeScript errors were revealed by `npx tsc --noEmit` and belong to Phase 4 or are pre-existing:

1. **Branded ID type mismatches** (`string` not assignable to `string & $brand<"ConvexId">`):
   - Affected: Test files in both apps (`error-analysis.test.ts`, `review-processor.test.ts`, `adapters.test.ts`, `submission-srs-adapter.test.ts`, `PracticeSessionProvider.test.tsx`, `mock-factories.ts`, `GraphingExplorer.tsx`)
   - Resolution: Replace manual mock objects with `createMockPracticeEnvelope()` factory; cast or use branded ID constructor.

2. **IM3 seed file type errors** (`Record<string, unknown>` not assignable to strict props union):
   - Affected: All `convex/seed/seed_lesson_*.ts` files (52 files)
   - Resolution: Cast seed props to their specific union member type, or add `as any` at seed boundaries (seed scripts run outside normal type safety).

3. **Pre-existing SVG casting errors** in `GraphingCanvas.test.tsx`.

## Phase 4: App Adoption and Final Verification

- [ ] **Task 4.1: Update App-level Mock Usage (Bus Math V2)**
  - **File:** `apps/bus-math-v2/__tests__/...`
  - **Action:** Incrementally replace manual `practice.v1` mock objects with `createMockPracticeEnvelope()` where applicable, resolving any type errors from the branded ID.

- [ ] **Task 4.2: Update App-level Mock Usage (Integrated Math 3)**
  - **File:** `apps/integrated-math-3/__tests__/...`
  - **Action:** Incrementally replace manual mocks with the factory methods.

- [ ] **Task 4.3: End-to-End Type and Test Verification**
  - **Action:** Run `npm run lint` and `npm run test` from the monorepo root to guarantee zero regressions. Run `npx tsc --noEmit` across all apps.
