# Implementation Plan: Tech Debt Resolution v2

## Phase 1: Medium Severity — Auth & Schema

- [ ] Task 1.1: Defense-in-depth auth for internal Convex functions (Medium)
  - [ ] Audit activities.ts, study.ts, srs/cards.ts, student.ts for public-facing entry points
  - [ ] Add userId validation at handler start for any functions reachable from routes
  - [ ] Update tech-debt.md: mark "internal Convex fns rely on action wrapper for auth" as Resolved

- [ ] Task 1.2: Type remaining v.any() fields (Medium)
  - [ ] Add discriminated union for phase_sections.content by sectionType
  - [ ] Type activities.props as v.record(v.string(), v.any()) minimum
  - [ ] Type remaining metadata bags as v.optional(v.record(v.string(), v.any()))
  - [ ] Update schema-vany-audit.test.ts to reflect new count
  - [ ] Update tech-debt.md: mark as Resolved

- [ ] Task 1.3: Wire BM2 bundle audit into CI (Low)
  - [ ] Add bundle:audit step to .github/workflows/ci.yml or cloudflare-deploy.yml
  - [ ] Verify audit passes in CI environment
  - [ ] Update tech-debt.md: mark "Bundle size CI gate not wired" as Resolved

## Phase 2: Low Severity — Test Coverage

- [ ] Task 2.1: Fix BM2 errorPayload.details leak (Low)
  - [ ] Strip errorPayload.details from activities/complete error responses
  - [ ] Update test to assert details is undefined
  - [ ] Update tech-debt.md: mark as Resolved

- [ ] Task 2.2: computeBaseRating([]) edge case (Low)
  - [ ] Test existing behavior: empty array returns 'Again'
  - [ ] Document as expected behavior or fix if unintended
  - [ ] Update tech-debt.md: mark as Resolved

- [ ] Task 2.3: Fix flaky StepByStepper hint test (Low)
  - [ ] Investigate timing/ordering root cause
  - [ ] Apply fix (waitFor, stable selectors, mock stabilization)
  - [ ] Run test 10x to confirm stability
  - [ ] Update tech-debt.md: mark as Resolved

- [ ] Task 2.4: Seed lesson data integrity validator (Medium)
  - [ ] Write validator that cross-references seed data with curriculum source files
  - [ ] Generate actionable report on mismatches
  - [ ] Update tech-debt.md: mark as Resolved

## Phase 3: Low Severity — Cleanup

- [ ] Task 3.1: Resolve BM2 governance test docs/ references (Low)
  - [ ] Either create stub docs/ files or remove/relocate the 3 tests
  - [ ] Update tech-debt.md: mark as Resolved

- [ ] Task 3.2: Document equivalence checker limitations (Low)
  - [ ] Add .skip with descriptive reason to the 2 .todo tests
  - [ ] Update tech-debt.md: mark as Resolved

- [ ] Task 3.3: Refresh workspace symlinks (Low)
  - [ ] Run npm install at monorepo root to create @math-platform/rate-limiter symlink
  - [ ] Remove vitest resolve aliases for rate-limiter from IM3 and BM2
  - [ ] Verify tests still pass without aliases
  - [ ] Update tech-debt.md: mark as Resolved

- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
