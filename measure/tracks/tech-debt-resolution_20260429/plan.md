# Implementation Plan: Monorepo Tech Debt Resolution

## Phase 1: Critical + High Severity

- [x] Task 1.1: Reduce BM2 worker-entry bundle (Critical)
  - [x] Write bundle size snapshot test for BM2 worker entry
  - [x] Audit BM2 worker-entry imports for tree-shaking opportunities
  - [x] Apply code-splitting (manualChunks) to BM2 vinext config
  - [x] Verify bundle under 3 MB via `npx vinext build`
  - [x] Update tech-debt.md: mark "BM2 worker-entry bundle 5.1 MB" as Resolved

- [x] Task 1.2: Harden rate limit table unique constraints (High)
  - [x] Write concurrent insert tests for apiRateLimits upsert behavior
  - [x] Audit try/catch upsert pattern in all rate limit endpoints (IM3 + BM2)
  - [x] Fix any gaps where concurrent inserts could create duplicates
  - [x] Update tech-debt.md: mark "No unique constraints on rate limit tables" as Resolved

- [x] Task 1.3: Fix prompt guard punctuation bypass (High)
  - [x] Write tests for bypass patterns: `bypass.the.system`, `ignore.rules.here`, period-separated variants
  - [x] Add token-proximity check after punctuation stripping in detectPromptInjection
  - [x] Run full prompt guard test suite (BM2 + IM3)
  - [x] Update tech-debt.md: mark "Prompt guard bypass via punctuation without whitespace" as Resolved

- [x] Task 1.4: Fix SRS CardStore studentId type mismatch (High/Partial)
  - [x] Write type-level tests validating Id<string> ⇔ string bridging
  - [x] Add explicit type narrowing/transformation at package boundary
  - [x] Remove scattered `as` casts; centralize to one adapter function
  - [x] Update tech-debt.md: mark "SRS CardStore: studentId type mismatch" as Resolved

- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Medium — Performance & Queries

- [x] Task 2.1: Schedule stale apiRateLimits cleanup (Medium)
  - [x] Write test for Convex cron job scheduling
  - [x] Create `convex/crons.ts` with periodic cleanup of expired apiRateLimits entries
  - [x] Wire cron into cron job configuration
  - [x] Update tech-debt.md: mark "apiRateLimits no stale entry cleanup" as Resolved

- [x] Task 2.2: Index range query for getDueCards (Medium)
  - [x] Write query test verifying date range filtering via index
  - [x] Add `by_student_and_due` index range query using `.lte("dueDate", asOfDate)`
  - [x] Verify query returns correct results and performance improvement
  - [x] Update tech-debt.md: mark "getDueCards fetches all then filters in-memory" as Resolved

- [ ] Task 2.3: Cursor pagination for session history (Medium)
  - [ ] Write pagination tests: first page, next page, empty page
  - [ ] Implement Convex cursor pagination using `paginate()` or manual cursor
  - [ ] Update session history UI to use paginated queries
  - [ ] Update tech-debt.md: mark "Session history pagination fetches all then slices" as Resolved

- [x] Task 2.4: Fix cards.ts updatedAt inconsistency (Medium)
  - [x] Write test confirming updatedAt uses consistent timestamp source
  - [x] Change updates to use caller-provided timestamp (match insert behavior)
  - [x] Verify all card mutations pass
  - [x] Update tech-debt.md: mark "cards.ts updatedAt inconsistent" as Resolved

- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Medium — Schema, Security & Tests

- [x] Task 3.1: Add BM2 login input length limits (Medium)
  - [x] Write tests for oversized login payloads
  - [x] Add max length validation on username/password fields in BM2 login route
  - [x] Verify rejections return 400 with safe error message
  - [x] Update tech-debt.md: mark "BM2 login endpoint has no input length limits" as Resolved

- [ ] Task 3.2: Extract shared rate limiter package (Medium)
  - [ ] Write package-level tests for @math-platform/rate-limiter
  - [ ] Extract common rate limiter logic to `packages/rate-limiter/`
  - [ ] Adopt in IM3 and BM2; remove duplicated code
  - [ ] Update tech-debt.md: mark "Rate limiters duplicated across IM3/BM2" as Resolved
  - [ ] Update tech-debt.md: mark "IM3/BM2 rate limiter test coverage missing" as Resolved

- [x] Task 3.3: Defense-in-depth auth for internal Convex functions (Medium)
  - [x] Audited activities.ts, student.ts, srs/cards.ts — all functions are internalQuery/internalMutation (not exposed to client)
  - [x] No public query/mutation functions exist to add auth checks to
  - [x] Update tech-debt.md: mark "internal Convex fns rely on action wrapper for auth" as Resolved

- [ ] Task 3.4: Fix 16 v.any() fields in IM3 Convex schema (Medium/Partial)
  - [ ] Write schema validation tests for typed validators
  - [ ] Replace remaining v.any() fields with typed validators
  - [ ] Run `npx convex dev --typecheck` to verify schema
  - [ ] Update tech-debt.md: mark "16 v.any() fields in IM3 Convex schema" as Resolved

- [x] Task 3.5: BM2 rateLimits.ts handler test coverage (Medium)
  - [x] Write tests for getRateLimitStatus, checkAndIncrementRateLimit, cleanupStaleRateLimits (18 tests)
  - [x] Run full BM2 test suite
  - [x] Update tech-debt.md: mark "BM2 rate limiter handler test coverage still missing" as Resolved

- [ ] Task 3.6: Fix BM2 governance test suites (Medium)
  - [ ] Diagnose each of the 9 skipped test suites
  - [ ] Fix monorepo-aware paths (imports, mocks, fixtures)
  - [ ] Re-enable suites; verify all pass
  - [ ] Update tech-debt.md: mark "BM2 9 governance test suites permanently skipped" as Resolved

- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Medium — Migration

- [ ] Task 4.1: Migrate IM3 to @math-platform/activity-components (Medium)
  - [ ] Audit current IM3 local registry vs package exports
  - [ ] Replace local registry imports with package imports
  - [ ] Verify all activity components render correctly
  - [ ] Update tech-debt.md: mark "IM3 still uses local activity component imports" as Resolved

- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Low Severity

- [x] Task 5.1: Resolve unused srs_review_log index (Low)
  - [x] Either wire a query to use by_reviewed_at index, or remove the index definition
  - [x] Update tech-debt.md: mark "srs_review_log by_reviewed_at index unused" as Resolved

- [x] Task 5.2: Fix BM2 errorPayload.details leak (Low)
  - [x] Updated test to assert details is undefined
  - [x] Stripped errorPayload.details from BM2 activities/complete error responses
  - [x] Update tech-debt.md: mark "BM2 activities/complete proxies errorPayload.details" as Resolved

- [x] Task 5.3: computeBaseRating empty array test (Low)
  - [x] Added computeBaseRating([]) test to BM2 and IM3 app-level test files
  - [x] Confirmed returns 'Again' (matches package-level behavior)
  - [x] Update tech-debt.md: mark "practice-core: computeBaseRating([]) untested" as Resolved

- [ ] Task 5.4: Fix flaky StepByStepper hint tracking test (Low)
  - [ ] Investigate root cause (timing/ordering)
  - [ ] Apply fix (e.g., waitFor, stable selectors, mock stabilization)
  - [ ] Run test 10x to confirm stability
  - [ ] Update tech-debt.md: mark "StepByStepper-guided hint tracking test flaky" as Resolved

- [ ] Task 5.5: Data-driven seed lesson validator (Low)
  - [ ] Write validator that checks seed data against curriculum source data
  - [ ] Replace 40+ self-referential test assertions with validator assertions
  - [ ] Update tech-debt.md: mark "40+ seed lesson tests vacuous" as Resolved

- [ ] Task 5.6: Fix equivalence checker .todo tests (Low)
  - [ ] Evaluate whether tests are fixable or require symbolic math lib
  - [ ] Fix what's feasible; document remaining as accepted limitation
  - [ ] Update tech-debt.md: mark "Equivalence checker: 2 aspirational .todo tests" as Resolved

- [ ] Task 5.7: Wire srs_reviews by_student index for date-range (Low)
  - [ ] Write query test for date-range filtering via index
  - [ ] Add `by_student_and_reviewed_at` index and wire getReviewsByStudent
  - [ ] Update tech-debt.md: mark "srs_reviews by_student index unused for date range" as Resolved

- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)

## Phase 6: Metrics, Monitoring & Guardrails

- [ ] Task 6.1: Bundle size CI monitoring
  - [ ] Write bundle size baseline file for each app
  - [ ] Add CI step that compares build output against baselines
  - [ ] Configure threshold (warn on >5% increase, fail on >10%)

- [ ] Task 6.2: Convex cron for stale apiRateLimits cleanup
  - [ ] Write cron job test
  - [ ] Implement `convex/crons.ts` cleanup job (if not done in Task 2.1)
  - [ ] Wire into Convex cron configuration

- [ ] Task 6.3: Seed lesson data integrity validator
  - [ ] Write validator script that cross-references seed data with curriculum source files
  - [ ] Add to CI or pre-commit hook
  - [ ] Generate actionable report on mismatches

- [ ] Task 6.4: Prompt guard bypass test suite
  - [ ] Write comprehensive test suite covering all known bypass patterns
  - [ ] Include punctuation-without-whitespace, Unicode normalization, fullwidth variants
  - [ ] Add to CI test suite

- [ ] Task: Measure - User Manual Verification 'Phase 6' (Protocol in workflow.md)
