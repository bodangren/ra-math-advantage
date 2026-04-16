# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-16, srs-schema) Convex DB stores timestamps as `number` (ms epoch) but `SrsCardState` contract uses ISO strings — convert at adapter boundary
- (2026-04-16, srs-integration) Always add `by_student_and_problem_family` index for SRS cards; querying by `problemFamilyId` alone causes cross-student card overwrites
- (2026-04-16, srs-integration) Use `ctx.scheduler.runAfter(0, ...)` for non-blocking SRS processing; keep error boundaries so SRS failures never block submission
- (2026-04-16, srs-schema) `mapDbCardToContract` must use `card._id` as `cardId`, not `problemFamilyId` — domain IDs are not unique across students
- (2026-04-16, srs-schema) Adapter-generated IDs (e.g. `reviewId: 'rev_xxx'`) must be stored in a DB column to be recoverable; pass-through args without storage lose the value
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

## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` at top of page tests — keeps tests fast and isolated
- (2026-04-15, harden-manual-approval) Harness gating: expose canApprove via callback, track in parent, gate approve button
- (2026-04-16, practice-timing) Pure accumulator pattern: isolate timing in browser-free module, inject timestamps from React hook
- (2026-04-16, srs-rating-adapter) Two-step rating: compute base rating from correctness first, then apply timing as conservative modifier
- (2026-04-16, srs-product-contract) Single canonical contract module (`lib/srs/contract.ts`) with re-exports; downstream imports from one surface
- (2026-04-16, daily-practice-queue) Keep pure `buildDailyQueue` separate from Convex data fetching for testability
- (2026-04-16, dashboard) Reuse queue resolution for dashboard due count to guarantee consistency with practice page; compute streaks with UTC day-start boundaries

## Planning Improvements

- (2026-04-12, algebraic-examples) Pattern-matching equivalence works for Module 1 (88% passing) but has limits; needs unified sign handling
- (2026-04-13, component-approval) Convex queries: use `.withIndex()` not `.filter()`, and `.take(n)` instead of `.collect()` to bound results
- (2026-04-14, code-review) Activity wrappers should inject activityId into submission payloads, not pass it to inner components
- (2026-04-14, code-review) Always guard division by zero in score calculations; NaN propagates silently through analytics
- (2026-04-16, code-review) New seed mutations must be wired into seed.ts immediately; orphan files silently skip data
- (2026-04-16, code-review) Convex validators strip undeclared fields; mock tests bypass validation. Prefer server-side DB lookups.
- (2026-04-16, srs-schema) SrsCardState contract uses `string` but Convex schema uses `Id<"profiles">`; type assertions needed at adapter boundary
- (2026-04-16, srs-schema) New Convex subdirectories must import `_generated` from parent `convex/_generated`, not local `./_generated`
- (2026-04-16, code-review) When adding proficiency labels to union types, ensure every label has a production code path; dead members are misleading
- (2026-04-16, test-design) Test mocks that conflate internal IDs with domain IDs mask real bugs; always use distinct values for `_id` vs `problemFamilyId`
