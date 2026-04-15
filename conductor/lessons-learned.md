# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

## Architecture & Design

- (2026-04-05, setup) vinext (Vite-backed Next.js) may have subtle differences from stock Next.js — test builds early
- (2026-04-12, submission-schema) Zod 4.x `z.record()` requires explicit key type — use `z.record(z.string(), z.unknown())`, not `z.record(z.unknown())`
- (2026-04-12, graphing-schema) TypeScript array type inference narrows from first elements — use explicit type annotation when pushing different types

## Recurring Gotchas

- (2026-04-15, code-review) React components calling hooks must follow `use*` naming convention; dual state bugs arise when parent and child both track the same state — extract state to single owner
- (2026-04-15, code-review) Approval gating must include ALL verification checkboxes in canApprove; mode review alone is insufficient for trustworthiness
- (2026-04-15, code-review) Content hashing must use the same componentKind derivation on both write (submitReview) and read (listReviewQueue) paths — mismatched kinds cause permanent stale flags
- (2026-04-15, code-review) `JSON.stringify` silently drops undefined keys — use explicit null or pre-filter for content hashing determinism
- (2026-04-15, code-review) Seed test tautology: inline test data that never imports actual seed files provides zero regression protection

## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` and `@/lib/auth/server` at the top of page tests — keeps tests fast and isolated
- (2026-04-15, harden-manual-approval) Harness gating: expose canApprove via callback, track in parent, gate approve button. Review queue passes storedProps/steps to harnesses instead of hardcoded data.
- (2026-04-12, graphing-components) Create wrapper components for activity registry to adapt component-specific props
- (2026-04-12, fix-graphing-test-types) Use `as const` on string literals in test props to preserve literal types

## Planning Improvements

- (2026-04-10, activity-infrastructure) activity_completions schema requires lessonId/phaseNumber not in practice.v1 — future work: pass context or redesign
- (2026-04-11, fix-intercept-tests) Test failures were due to incorrect test coordinates — verify assumptions match implementation before fixing code
- (2026-04-12, algebraic-examples) Pattern-matching equivalence works for Module 1 (88% passing) but has limits; polynomial expansion patterns need unified sign handling
- (2026-04-13, algebraic-examples) Problem type implementation is configuration-driven — StepByStepper handles all modes; problem types are step configurations
- (2026-04-13, component-approval) Convex queries: use `.withIndex()` not `.filter()`, and `.take(n)` instead of `.collect()` to bound results
- (2026-04-14, code-review) Activity wrappers should inject activityId into submission payloads, not pass it to inner components
- (2026-04-14, code-review) Always guard division by zero in score calculations; NaN propagates silently through analytics
- (2026-04-14, code-review) Progress counting must include "skipped" alongside "completed" when computing lesson readiness
- (2026-04-15, module-6-seed) Curriculum consistency tests validate seed implementation phase counts/order against source files. Keep multi-part textbook examples within a single worked_example phase unless the curriculum explicitly splits them.
- (2026-04-15, code-review) Module seed tracks need CCSS standards added to seed-standards.ts alongside lesson content; track standards per-module to avoid accumulation of gaps
- (2026-04-15, module-6-seed) Build focused lesson_standards seeders per module: query lesson + version + standard by natural keys, then insert idempotently via `by_lesson_version_and_standard` index
- (2026-04-15, module-7-seed) When harness gating logic changes, update existing tests to simulate the full verification flow (variants + checkboxes)
