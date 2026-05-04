# Implementation Plan: Reliability Contracts & DB Boundary Enforcement

## Phase 1: Shared Packages – Branded Types & Test Fixtures

- [x] **Task 1.1: Introduce Branded ID Type** [49a5262]
  - **File:** `packages/practice-core/src/practice/contract.ts`
  - **Action:** Update `practiceSubmissionEnvelopeSchema` to brand the `activityId` (e.g., `z.string().brand<'ConvexId'>()`). Update type exports as necessary.
  - **Validation:** Run `practice-core` unit tests to ensure Zod parsing handles the brand correctly.

- [~] **Task 1.2: Export `createMockPracticeEnvelope` Factory**
  - **File:** `packages/practice-core/src/practice/fixtures.ts` (New file)
  - **Action:** Implement and export `createMockPracticeEnvelope(overrides?)`. Add to `index.ts` exports.

- [ ] **Task 1.3: Export SRS Mock Factories**
  - **File:** `packages/srs-engine/src/srs/fixtures.ts` (New file)
  - **Action:** Implement and export `createMockSrsCard(overrides?)` and `createMockSrsReviewLog(overrides?)` ensuring compliance with `srs.contract.v1`. Add to `index.ts` exports.

- [ ] **Task 1.4: Package Verification**
  - **Action:** Run tests in both packages (`npm run test` inside `packages/practice-core` and `packages/srs-engine`).

## Phase 2: Convex Schema Boundary Enforcement

- [ ] **Task 2.1: Define Strict Activity Props Union**
  - **File:** `packages/math-content/src/schemas/` (or wherever exact schemas are defined) / `convex/schema.ts`
  - **Action:** Create a `v.union()` mapping for all known `componentKey` values (e.g., `graphing-explorer`, `step-by-step-solver`) to their respective `v.object()` schemas.
  
- [ ] **Task 2.2: Apply Strict Types to Curriculum Fields**
  - **File:** `convex/schema.ts`
  - **Action:** Replace `v.any()` on `activities.props` with the new props union. Replace `v.any()` on `phase_sections.content` with a discriminated union for text, activity, callout, video, and image types.

- [ ] **Task 2.3: Define Strict SRS State Schema**
  - **File:** `convex/schema.ts`
  - **Action:** Replace `v.any()` on `srs_review_log.stateBefore`, `srs_review_log.stateAfter`, and `due_reviews.fsrsState` with a strictly typed `v.object()` mirroring `SrsCardState`.

## Phase 3: SRS State Transition Validation

- [ ] **Task 3.1: Implement `validateSrsTransition`**
  - **File:** `packages/srs-engine/src/srs/transition-validator.ts`
  - **Action:** Write pure logic validating that an SRS card state transition is mathematically sound (reps increased, lapses updated correctly if state went to 'relearning', etc.).
  - **Validation:** Write unit tests for `validateSrsTransition` covering standard transitions and invalid regressions.

- [ ] **Task 3.2: Integrate Validation into Convex Mutation**
  - **File:** `convex/srs/reviews.ts` (or the relevant handler file for `srs_review_log` inserts)
  - **Action:** Invoke `validateSrsTransition` prior to calling `ctx.db.insert("srs_review_log", ...)` or `ctx.db.patch("srs_cards", ...)`. Throw an error on invalid transitions.

## Phase 4: App Adoption and Final Verification

- [ ] **Task 4.1: Update App-level Mock Usage (Bus Math V2)**
  - **File:** `apps/bus-math-v2/__tests__/...`
  - **Action:** Incrementally replace manual `practice.v1` mock objects with `createMockPracticeEnvelope()` where applicable, resolving any type errors from the branded ID.

- [ ] **Task 4.2: Update App-level Mock Usage (Integrated Math 3)**
  - **File:** `apps/integrated-math-3/__tests__/...`
  - **Action:** Incrementally replace manual mocks with the factory methods.

- [ ] **Task 4.3: End-to-End Type and Test Verification**
  - **Action:** Run `npm run lint` and `npm run test` from the monorepo root to guarantee zero regressions. Run `npx tsc --noEmit` across all apps.
