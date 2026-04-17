# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-16, srs-schema) Convex DB stores timestamps as `number` (ms epoch) but `SrsCardState` contract uses ISO strings — convert at adapter boundary
- (2026-04-16, srs-integration) Always add `by_student_and_problem_family` index for SRS cards; querying by `problemFamilyId` alone causes cross-student card overwrites
- (2026-04-16, srs-integration) Use `ctx.scheduler.runAfter(0, ...)` for non-blocking SRS processing; keep error boundaries so SRS failures never block submission
- (2026-04-16, srs-schema) `mapDbCardToContract` must use `card._id` as `cardId`, not `problemFamilyId` — domain IDs are not unique across students
- (2026-04-17, auth-guards) Test request guards by mocking `verifySessionToken` and passing cookie headers directly on Request objects; avoids circular mocks of the module under test
- (2026-04-16, srs-schema) Convex `v.optional(v.string())` produces `string | undefined`, but contract may use `string | null` — normalize at adapter boundary
- (2026-04-16, sessions) Server-side day-boundary comparisons must use UTC methods (`getUTCFullYear`/`getUTCMonth`/`getUTCDate`), not local TZ methods
- (2026-04-16, sessions) Stale active sessions from prior days must be explicitly closed (`completedAt` patch) before creating new sessions; otherwise index queries return wrong records
- (2026-04-17, srs-proficiency) Review log `submissionId` is synthetic (`activityId-attemptNumber`); parsing it to look up `activity_submissions` timing requires defensive handling of dashes in IDs

## Recurring Gotchas

- (2026-04-16, code-review) When comparing correctness, use `=== true` not `!== false` — `undefined` values must not be treated as correct
- (2026-04-16, code-review) `setTimeout` in React hooks must store timer ID in ref and clear in `useEffect` cleanup to prevent stale callbacks on unmount
- (2026-04-15, code-review) React components calling hooks must follow `use*` naming convention; dual state bugs arise when parent and child both track the same state
- (2026-04-15, code-review) Content hashing must use the same componentKind derivation on both write and read paths
- (2026-04-16, code-review) Standard codes referenced in lesson_standards links must exist in seed-standards.ts; missing standards cause silent link failures
- (2026-04-16, practice-timing) When mixing `performance.now()` and `Date.now()`, all internal timing must use one base; serialization is the only safe place to convert
- (2026-04-17, code-review) `setCurrentCardIndex(currentCardIndex + 1)` captures stale closure; always use functional updater `setCurrentCardIndex((prev) => prev + 1)` in callbacks
- (2026-04-17, code-review) Union-type casts like `x as ObjectivePriority` must be runtime-validated against a set of valid values; DB corruption silently propagates otherwise
- (2026-04-17, code-review) RSC page null checks: both `fetchInternalQuery` and `fetchInternalMutation` can return null; always guard the destructuring
- (2026-04-17, code-review) Multi-card queries: a student can have multiple SRS cards per objective (different problemFamilies); always use `.collect()` not `.first()` when resetting or checking cards
- (2026-04-17, code-review) Native `<dialog>.close()` throws InvalidStateError if already closed; guard with `if (dialog.open)` before calling
- (2026-04-17, code-review) INTEGRATION.md example code must use actual type fields, not related-but-different type fields; verify examples compile against the real types
- (2026-04-17, code-review) New Convex query functions should default to `internalQuery`; only use `query` if client-side Convex hooks need direct access. Unprotected `query` = any-user-reads-any-data
- (2026-04-17, code-review) API route Zod schemas for score/count pairs must include `.refine(score <= questionCount)` — the Convex handler validates but edge validation prevents the round-trip

## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` at top of page tests — keeps tests fast and isolated
- (2026-04-15, harden-manual-approval) Harness gating: expose canApprove via callback, track in parent, gate approve button
- (2026-04-16, practice-timing) Pure accumulator pattern: isolate timing in browser-free module, inject timestamps from React hook
- (2026-04-16, srs-rating-adapter) Two-step rating: compute base rating from correctness first, then apply timing as conservative modifier
- (2026-04-16, srs-product-contract) Single canonical contract module (`lib/srs/contract.ts`) with re-exports; downstream imports from one surface
- (2026-04-16, daily-practice-queue) Keep pure `buildDailyQueue` separate from Convex data fetching for testability
- (2026-04-16, dashboard) Reuse queue resolution for dashboard due count to guarantee consistency with practice page

## Planning Improvements

- (2026-04-13, component-approval) Convex queries: use `.withIndex()` not `.filter()`, and `.take(n)` instead of `.collect()` to bound results
- (2026-04-16, code-review) New seed mutations must be wired into seed.ts immediately; orphan files silently skip data
- (2026-04-16, code-review) Convex validators strip undeclared fields; mock tests bypass validation. Prefer server-side DB lookups.
- (2026-04-17, code-review) Review N+1 patterns at design time: if a loop body makes a DB query, note it in the plan as a known trade-off
- (2026-04-17, test-design) Vitest only discovers tests in `__tests__/**/*.test.ts`; place test files there even when stub implementations live in `lib/**/__tests__/`
- (2026-04-17, test-design) Convex query mocks must filter by the actual query args (studentId, objectiveId) — returning unfiltered data causes incorrect proficiency calculations in multi-student scenarios
- (2026-04-17, code-review) Handler return types with `as` casts for error branches should use discriminated unions; `as` hides type mismatches that callers silently accept
- (2026-04-17, test-design) Test timing should use explicit yesterday/today boundaries, not relative offsets like `now - 2h`; midnight boundary bugs are invisible in local TZ
