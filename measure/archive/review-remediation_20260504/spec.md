# Specification: Review Remediation — 2026-05-04 Daily Work

## Background

A Measure review of all commits in the past 24 hours (2026-05-04 00:00–23:15 +08) revealed several quality gaps across three tracks that were marked complete or in-progress during that window:

1. **reliability-contracts_20260504** — Marked complete but contains post-hoc test fixes, code duplication without drift guards, and partial acceptance-criteria compliance in BM2.
2. **accessibility-audit_20260502** — Phase 2 marked complete but 4/8 new keyboard-navigation tests fail.
3. **recent-work-remediation_20260503**, **session-history-pagination_20260503**, **shared-rate-limiter-package_20260503**, **bm2-bundle-optimization_20260503** — Closed as complete; no new issues found.

## Problem Statement

### Issue A: Committed Tests That Fail (High)
`lesson-keyboard-navigation.test.tsx` was committed with the claim "All 139 lesson tests pass" (commit `9a9d263`), but 4 of its 8 tests fail on current `HEAD`:
- `reaches Skip button when phase is skippable`
- `does not show Skip button for non-skippable phases`
- `reverses through interactive elements in reverse order` (×2 assertions)

Root cause: the test assumes a tab-reachable Skip button rendered by `PhaseCompleteButton`, but the rendered tab order does not match expectations (likely `canSkip` evaluation or focus-management issue in the test environment).

### Issue B: `validateSrsTransition` Duplicated Without Drift Guard (Medium)
The canonical `validateSrsTransition` lives in `packages/srs-engine/src/srs/transition-validator.ts`. It was duplicated inline into:
- `apps/integrated-math-3/convex/srs/processReview.ts`
- `apps/integrated-math-3/convex/srs/reviews.ts`
- `apps/bus-math-v2/convex/srs.ts`

While the lessons-learned file documents that "Convex runtime cannot import npm packages," there is **no inline comment or doc link** connecting each copy to the canonical version. If the canonical rules change, the copies will silently drift.

### Issue C: BM2 Schema Partial Compliance with Spec (Medium)
Acceptance criterion FR-1 states: "Use a discriminated union (`v.union()`) that maps exact `componentKey` identifiers to their respective exact prop schemas."

IM3 implemented this fully. BM2 replaced `v.any()` with `v.record(v.string(), v.any())` for `activities.props` and `phase_sections.content` because "validators for 40+ BM2 component types do not yet exist." This is a documented limitation but still violates the spec acceptance criteria.

### Issue D: Seed Files Cast Props to `any` (Medium)
52 IM3 seed files (`seed_lesson_*.ts`) were changed from `props: Record<string, unknown>` to `props: any`. The plan claims "Convex runtime still validates," but the compile-time safety boundary is intentionally broken. The spec intent was hard database boundaries; seed scripts should use type assertions to the specific union member instead of `any`.

### Issue E: Post-Hoc Test Fix Reveals Weak Fixture Data (Medium)
Commit `a062091` (Phase 4) claimed all tests pass, but commit `bce540d` (23 minutes later) had to fix `convexCardStore.test.ts` mock data because `stateAfter.reps` did not satisfy the new `reps + 1` rule and `lapses` decreased. This indicates Phase 4 verification did not run the full test matrix before claiming completion.

### Issue F: Conditional Validation Gap Is Undocumented (Low)
`processReview.ts` and `reviews.ts` skip `validateSrsTransition` when `'action' in evidence` (teacher reset). There is no inline comment explaining why teacher resets are exempt from mathematical transition rules.

## Objectives

- Fix or remove failing accessibility tests so Phase 2 claims are truthful.
- Add drift-prevention comments/docs to duplicated `validateSrsTransition` copies.
- Remediate BM2 schema to strict union where possible, or document explicit deferral with follow-up track.
- Replace `any` casts in seed files with typed assertions.
- Ensure all test fixtures comply with `validateSrsTransition` rules (no post-hoc fixes needed).
- Document the teacher-reset exemption inline.

## Acceptance Criteria
- [ ] `lesson-keyboard-navigation.test.tsx` passes fully (0 failures).
- [ ] Each inline copy of `validateSrsTransition` contains a comment referencing the canonical package file and a warning not to edit without syncing.
- [ ] BM2 `activities.props` either uses a strict union or has a documented deferral track linked in the schema file.
- [ ] Zero `props: any` casts remain in IM3 seed files; use `as ActivityProps` or similar typed assertion.
- [ ] All SRS-related test fixtures across both apps satisfy `validateSrsTransition` invariants without post-hoc fixes.
- [ ] Teacher-reset exemption in `processReview.ts` and `reviews.ts` has an explanatory code comment.
