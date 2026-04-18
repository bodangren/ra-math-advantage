# Implementation Plan: practice-core Package Testing

## Phase 1: Add package-level tests for practice-core

### Task 1: Write contract.ts tests
- [ ] Create `src/__tests__/contract.test.ts`
- [ ] Write tests for `normalizePracticeValue()` (strings, numbers, booleans, arrays, null, undefined, objects)
- [ ] Write tests for `buildPracticeSubmissionParts()`
- [ ] Write tests for `buildPracticeSubmissionEnvelope()`
- [ ] Write tests for `normalizePracticeSubmissionInput()`
- [ ] Write tests for `isPracticeSubmissionEnvelope()` narrowing guard
- [ ] Write tests for schema validation edge cases
- [ ] Verify all tests pass

### Task 2: Write srs-rating.ts tests
- [ ] Create `src/__tests__/srs-rating.test.ts`
- [ ] Write tests for `computeBaseRating()` correctness priority
- [ ] Write tests for `applyTimingToRating()` modifier logic
- [ ] Write tests for `mapPracticeToSrsRating()` integration
- [ ] Verify all tests pass

### Task 3: Write timing-baseline.ts tests
- [ ] Create `src/__tests__/timing-baseline.test.ts`
- [ ] Write tests for `computeTimingBaseline()` with various inputs
- [ ] Write tests for `deriveTimingFeatures()` with/without baseline
- [ ] Write tests for `computePercentile()` edge cases
- [ ] Write tests for speed band threshold boundaries
- [ ] Verify all tests pass

### Task 4: Final verification
- [ ] Run full test suite for practice-core package
- [ ] Run `npx tsc --noEmit` in package directory
- [ ] Verify tech-debt item updated in conductor/tech-debt.md
- [ ] Update lessons-learned.md if any insights gained