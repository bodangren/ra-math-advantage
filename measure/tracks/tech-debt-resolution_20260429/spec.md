# Spec: Monorepo Tech Debt Resolution

## Overview

Resolve all 24 open/partial tech debt items in the registry, add missing test coverage flagged by those items, and implement metrics/monitoring guardrails to prevent recurrence. Auto-trim the registry by removing items as they are fixed.

## Functional Requirements

### Phase 1 — Critical + High Severity (4 items)
- **FR-1.1**: Reduce BM2 worker-entry bundle from 5.1 MB to under ~3 MB via code-splitting and tree-shaking audit
- **FR-1.2**: Add unique constraint handling to rate limit tables (Convex indexes aren't unique; verify try/catch upsert handles all concurrent scenarios)
- **FR-1.3**: Fix prompt guard bypass via punctuation without whitespace (e.g. `bypass.the.system`)
- **FR-1.4**: Resolve SRS CardStore studentId type mismatch (package uses `string`, Convex uses `Id<...>`)

### Phase 2 — Medium Severity: Performance & Queries (4 items)
- **FR-2.1**: Add stale entry cleanup scheduling for apiRateLimits table (mutations exist, just not scheduled)
- **FR-2.2**: Use index range query for getDueCards instead of fetch-all + in-memory filter
- **FR-2.3**: Implement Convex cursor pagination for session history (replace fetch-all + slice)
- **FR-2.4**: Fix cards.ts updatedAt inconsistency (uses Date.now() for updates but caller timestamp for inserts)

### Phase 3 — Medium Severity: Schema, Security & Tests (7 items)
- **FR-3.1**: Add input length limits to BM2 login endpoint
- **FR-3.2**: Extract shared rate limiter logic from IM3/BM2 to a shared package
- **FR-3.3**: Add defense-in-depth auth checks to internal Convex functions (activities.ts, study.ts, srs/cards.ts, student.ts)
- **FR-3.4**: Fix 16 v.any() fields in IM3 Convex schema with typed validators
- **FR-3.5**: Write test coverage for BM2 rateLimits.ts handler
- **FR-3.6**: Fix BM2 9 governance test suites (monorepo-aware path fixes)
- **FR-3.7**: Add rate limiter test coverage in shared package

### Phase 4 — Medium Severity: Migration (1 item)
- **FR-4.1**: Migrate IM3 to @math-platform/activity-components package (replace local registry imports)

### Phase 5 — Low Severity (7 items)
- **FR-5.1**: Remove unused srs_review_log by_reviewed_at index, or wire a query to use it
- **FR-5.2**: Fix BM2 activities/complete endpoint exposing errorPayload.details to client
- **FR-5.3**: Add test for computeBaseRating([]) empty array edge case
- **FR-5.4**: Investigate/fix StepByStepper-guided hint tracking test flaky
- **FR-5.5**: Convert 40+ seed lesson tests to data-driven validator
- **FR-5.6**: Fix equivalence checker 2 aspirational .todo tests (or document as accepted limitation)
- **FR-5.7**: Wire srs_reviews by_student index for date-range queries instead of JS filtering

### Phase 6 — Metrics, Monitoring & Guardrails
- **FR-6.1**: Add bundle size monitoring (CI gate or dashboard) to catch regressions
- **FR-6.2**: Schedule stale apiRateLimits cleanup via Convex cron job
- **FR-6.3**: Add seed lesson data integrity validator
- **FR-6.4**: Add prompt guard test suite covering punctuation-without-whitespace bypass patterns

## Non-Functional Requirements
- Existing test suites must not regress (IM3: 267 pass, BM2: Convex tests pass)
- Bundle size reduction must be verified with `npx vinext build` output
- TypeScript must pass: `npx tsc --noEmit` in all affected apps/packages

## Acceptance Criteria
- [ ] All 24 tech debt items resolved or documented as accepted limitations
- [ ] Tech-debt.md under 50 lines with only unresolved/minimal items
- [ ] BM2 worker bundle under 3 MB
- [ ] Shared rate limiter package with tests for both IM3 and BM2
- [ ] Prompt guard tests cover all bypass patterns from tech-debt.md
- [ ] Seed lesson validator produces actionable output (not self-referential)
- [ ] All test suites pass; no new CI failures

## Out of Scope
- Architecture redesigns not flagged in tech debt
- New features unrelated to existing tech debt items
