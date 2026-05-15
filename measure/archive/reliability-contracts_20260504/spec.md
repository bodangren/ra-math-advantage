# Specification: Reliability Contracts & DB Boundary Enforcement

## Problem Statement

Historically, the project has successfully leveraged packages like `@math-platform/practice-core` and `@math-platform/srs-engine` to enforce strict TypeScript contracts on the frontend. However, lessons learned and a recent schema audit (April 24) reveal critical gaps where these contracts fail at the database boundary:

1. **Curriculum Authoring Loophole (`v.any()`)**: Core fields like `activities.props` and `phase_sections.content` are currently typed as `v.any()` in Convex. Malformed data introduced by generative scripts or authoring errors will bypass validation and crash the React renderers at runtime (documented in `precalc-depth-remediation`).
2. **Unvalidated SRS State Transitions**: The massive effort to migrate `bus-math-v2` to strict `SrsCardState` left Convex schema types for `srs_review_log.stateBefore/stateAfter` and `due_reviews.fsrsState` as `v.any()`. There is no mathematical DB-level enforcement that SRS state transitions (e.g., `reps` incrementing, `dueDate` advancing) are valid.
3. **ID Reference Bugs**: The system historically suffered from handlers returning caller-provided UUIDs instead of actual database IDs (documented in review-30). `PracticeSubmissionEnvelope` loosely types `activityId` as `z.string()`, failing to differentiate between transient and canonical Convex IDs.
4. **Fragmented Test Fixtures**: App-level tests manually mock contract envelopes. When the contract changes, duplicate tests across `bus-math-v2` and `integrated-math-3` break and require manual, error-prone updates.

## Objectives

This track fortifies the system's reliability by turning loose schema contracts into **hard database boundaries** and **compiler-enforced guarantees**.

## Requirements

### FR-1: Eliminate Critical `v.any()` Usage in Curriculum Data
- In the Convex schema, replace `v.any()` on `activities.props` and `phase_sections.content`.
- Use a discriminated union (`v.union()`) that maps exact `componentKey` identifiers to their respective exact prop schemas.
- Ensure that any attempt to insert a misconfigured activity prop payload is rejected by the database.

### FR-2: Enforce SRS State Transitions at the Database Level
- Replace `v.any()` on `srs_review_log.stateBefore`, `srs_review_log.stateAfter`, and `due_reviews.fsrsState` with a strict `v.object()` definition mirroring `SrsCardState`.
- Implement a pure function `validateSrsTransition(stateBefore, stateAfter)` that throws if the transition violates SRS mathematical rules (e.g., `reps` must increase by 1 if a review occurred).
- Integrate this validation into the Convex mutation that writes to `srs_review_log`.

### FR-3: Introduce Branded Types for Canonical IDs
- Update `practiceSubmissionEnvelopeSchema` in `@math-platform/practice-core/contract` to type `activityId` as a Branded Type (e.g., `z.string().brand<'ConvexId'>()`).
- Ensure the compiler flags instances where a handler might return a raw string UUID instead of the validated database ID.

### FR-4: Export Canonical Test Fixtures
- Add `createMockPracticeEnvelope()` to `@math-platform/practice-core`.
- Add `createMockSrsCard()` and `createMockSrsReviewLog()` to `@math-platform/srs-engine`.
- These factory functions must always emit valid data compliant with the current contract version, allowing apps to import them in tests rather than manually mocking the envelopes.

## Acceptance Criteria
- [ ] No `v.any()` fields remain for `activities.props`, `phase_sections.content`, or SRS states in `convex/schema.ts`.
- [ ] `validateSrsTransition` is covered by unit tests validating both valid and invalid FSRS state changes.
- [ ] The `activityId` field in the practice contract prevents assignment of primitive unbranded strings without a cast/parse.
- [ ] App-level tests can successfully import and use `createMockPracticeEnvelope()`.