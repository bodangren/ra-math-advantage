# Implementation Plan: Review Remediation — 2026-05-04 Daily Work

## Phase 1: Fix Failing Accessibility Tests

- [x] **Task 1.1: Diagnose Skip button tab-order failure**
  - Run `lesson-keyboard-navigation.test.tsx` in isolation and capture exact DOM state at failure point.
  - Determine whether `PhaseCompleteButton` renders Skip button in test env (`canSkip` evaluation, `isSkippable` import resolution).
  - Document root cause.

- [x] **Task 1.2: Fix or adjust test expectations**
  - If Skip button is genuinely missing due to test-env import issue: mock `isSkippable` explicitly or fix module resolution.
  - If Skip button exists but tab order differs: update test to match actual DOM tab order.
  - If test expectation is wrong (e.g., Skip is not focusable): adjust test or component.

- [x] **Task 1.3: Verify all lesson tests pass**
  - Run full lesson test suite.
  - Run targeted accessibility tests.

## Phase 2: Harden `validateSrsTransition` Against Drift

- [x] **Task 2.1: Add canonical reference comments to inline copies**
  - `apps/integrated-math-3/convex/srs/processReview.ts`
  - `apps/integrated-math-3/convex/srs/reviews.ts`
  - `apps/bus-math-v2/convex/srs.ts`
  - Comment template: `// COPIED from packages/srs-engine/src/srs/transition-validator.ts — DO NOT EDIT WITHOUT SYNCING`

- [x] **Task 2.2: Add unit-test parity check (optional but recommended)**
  - Add a lightweight test in each app that imports the canonical validator and asserts its logic hash matches a known value, OR
  - Add a CI script that diffs the inline functions against the canonical version and warns on mismatch.
  - If CI script is too heavy, document in `tech-debt.md` instead.

## Phase 3: BM2 Schema Compliance

- [ ] **Task 3.1: Audit which BM2 component types have existing validators**
  - Check `bus-math-v2/convex/schema.ts` and `component_approval_validators.ts` for existing prop shapes.
  - Count how many of the 40+ BM2 component types already have Convex validators.

- [ ] **Task 3.2: Implement strict union for BM2 activities.props**
  - For component types WITH existing validators: add to a BM2 `activityPropsValidator` union.
  - For component types WITHOUT validators: keep in a fallback `v.record(v.string(), v.any())` branch with a typed comment linking to a follow-up track.
  - Update `phase_sections.content` similarly.

- [ ] **Task 3.3: Document deferral or close gap**
  - If the fallback branch covers >10% of components, create a follow-up track and link it in BM2 schema file.
  - If <10%, complete the union inline.

## Phase 4: Seed File Type Safety

- [ ] **Task 4.1: Replace `any` with typed assertions in all 52 seed files**
  - Define a helper type or cast function in a shared seed utility (e.g., `apps/integrated-math-3/convex/seed/types.ts`).
  - Replace `props: any` with `props: unknown as ActivityProps` or a seed-specific `asSeedActivityProps()` helper.
  - Ensure `npx tsc --noEmit` still passes.

- [ ] **Task 4.2: Verify seed compilation**
  - Run IM3 typecheck.
  - Run a sample seed file through `tsc` to confirm no `any` remains.

## Phase 5: Test Fixture Robustness

- [ ] **Task 5.1: Audit all SRS test fixtures for transition validity**
  - Search both apps for `stateBefore:` and `stateAfter:` in test files.
  - Ensure every pair satisfies: `reps_after === reps_before + 1`, `lapses_after >= lapses_before`, `state_after` is in allowed transitions.
  - Fix any violations.

- [ ] **Task 5.2: Add fixture validation to mock factories**
  - In `createMockSrsReviewLog` (packages/srs-engine), optionally assert that `stateAfter` is mathematically valid relative to `stateBefore` when both are provided.
  - This prevents future invalid fixtures at the factory level.

## Phase 6: Document Validation Gaps

- [ ] **Task 6.1: Add inline comments for teacher-reset exemption**
  - In `apps/integrated-math-3/convex/srs/processReview.ts` and `reviews.ts`, add comment above the `if (!('action' in evidence))` guard explaining that teacher resets bypass SRS transition validation because they are administrative overrides, not learner reviews.

- [ ] **Task 6.2: Final verification**
  - Run IM3 tests: target 0 failures.
  - Run BM2 tests: target 0 failures.
  - Run package tests: target 0 failures.
  - Run `npx tsc --noEmit` in both apps and all packages.
  - Update this plan with results.
