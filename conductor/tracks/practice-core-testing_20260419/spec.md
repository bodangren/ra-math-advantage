# Specification: practice-core Package Testing

## Overview

Add comprehensive package-level unit tests to `packages/practice-core` for the three untested core modules: `contract.ts`, `srs-rating.ts`, and `timing-baseline.ts`.

## Background

Tech-debt item: "practice-core has only 1 test file in-package" (Medium severity). The package has `timing.test.ts` but `contract.ts`, `srs-rating.ts`, and `timing-baseline.ts` lack in-package tests. Tests exist via IM3 imports but not at the package level itself.

## Functional Requirements

### contract.ts Tests
- Test `normalizePracticeValue()` for all input types: strings, numbers, booleans, arrays, null/undefined, objects
- Test `buildPracticeSubmissionParts()` with various answer shapes
- Test `buildPracticeSubmissionEnvelope()` with complete and partial inputs
- Test `normalizePracticeSubmissionInput()` with malformed/missing fields
- Test `isPracticeSubmissionEnvelope()` narrowing guard
- Test schema validation edge cases (empty strings, negative attempt numbers, etc.)

### srs-rating.ts Tests
- Test `computeBaseRating()` with correctness priority: incorrect → Again, misconceptions → Again, hints/reveals → Hard, all correct → Good
- Test `applyTimingToRating()` modifier logic: Again/Hard stay fixed, Good can upgrade to Easy (fast) or downgrade to Hard (slow)
- Test `mapPracticeToSrsRating()` integration with various timing features

### timing-baseline.ts Tests
- Test `computeTimingBaseline()` with various sample sizes and confidences
- Test `deriveTimingFeatures()` with baseline and without baseline
- Test `computePercentile()` edge cases (empty, single element, interpolation)
- Test speed band thresholds (fast < 0.5, expected <= 1.5, slow <= 2.5, very_slow > 2.5)

## Non-Functional Requirements

- All tests use Vitest (consistent with existing timing.test.ts)
- Tests are colocated in `src/__tests__/` following existing convention
- Tests achieve >80% coverage for the three target modules
- No new dependencies introduced

## Acceptance Criteria

1. `contract.test.ts` exists with tests for all exported functions
2. `srs-rating.test.ts` exists with tests for all exported functions
3. `timing-baseline.test.ts` exists with tests for all exported functions
4. All tests pass: `npm test -- --filter practice-core`
5. TypeScript compiles without errors: `npx tsc --noEmit` in package directory
6. Build passes: `npm run build` in package directory (if applicable)

## Out of Scope

- Changes to source code implementation (only tests added)
- Integration tests with Convex or full app
- Changes to other packages