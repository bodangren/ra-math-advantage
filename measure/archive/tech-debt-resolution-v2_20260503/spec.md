# Spec: Tech Debt Resolution v2

## Overview

Resolve the 11 remaining open tech debt items from the registry. These are lower-severity items deferred from the v1 resolution cycle — primarily missing test coverage, schema hardening, CI integration, and accepted limitations that need documentation.

## Functional Requirements

### Phase 1: Medium Severity — Auth & Schema
- **FR-1.1**: Add defense-in-depth auth checks to internal Convex functions (activities.ts, study.ts, srs/cards.ts, student.ts)
- **FR-1.2**: Type remaining 14 `v.any()` fields — prioritize phase_sections.content and activities.props discriminated unions
- **FR-1.3**: Wire BM2 bundle audit script into GitHub Actions CI pipeline

### Phase 2: Low Severity — Test Coverage
- **FR-2.1**: Fix BM2 activities/complete errorPayload.details leak to client
- **FR-2.2**: Add test for practice-core computeBaseRating([]) edge case and document expected behavior
- **FR-2.3**: Fix flaky StepByStepper hint tracking test (timing/ordering)
- **FR-2.4**: Add seed lesson data integrity validator (cross-reference seed data vs curriculum source)

### Phase 3: Low Severity — Cleanup
- **FR-3.1**: Resolve or remove 3 BM2 governance tests referencing missing docs/ paths
- **FR-3.2**: Document equivalence checker .todo tests as accepted limitation (require symbolic math lib)
- **FR-3.3**: Run `npm install` to refresh workspace symlinks for @math-platform/rate-limiter

## Non-Functional Requirements
- Existing test suites must not regress
- TypeScript must pass: `npx tsc --noEmit` in all affected apps/packages
- tech-debt.md must stay under 50 lines

## Acceptance Criteria
- [ ] All 11 tech debt items resolved, documented, or explicitly deferred
- [ ] tech-debt.md under 50 lines with only genuinely open items
- [ ] BM2 bundle audit in CI
- [ ] All test suites pass

## Out of Scope
- New features unrelated to tech debt
- Architecture redesigns
