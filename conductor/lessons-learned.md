# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-18, component-approval) When extracting packages with Convex dependencies, use generic interfaces in the package and keep Convex-specific types app-local; this preserves type safety without creating package-to-Convex dependencies
- (2026-04-16, srs-integration) Always add `by_student_and_problem_family` index for SRS cards; querying by `problemFamilyId` alone causes cross-student card overwrites
- (2026-04-16, srs-integration) Use `ctx.scheduler.runAfter(0, ...)` for non-blocking SRS processing; keep error boundaries so SRS failures never block submission
- (2026-04-16, srs-schema) `mapDbCardToContract` must use `card._id` as `cardId`, not `problemFamilyId` — domain IDs are not unique across students
- (2026-04-17, auth-guards) Test request guards by mocking `verifySessionToken` and passing cookie headers directly on Request objects; avoids circular mocks
- (2026-04-16, sessions) Server-side day-boundary comparisons must use UTC methods; stale sessions must be explicitly closed before creating new ones

## Recurring Gotchas

- (2026-04-17, code-review) Timer refs reused for wrong-answer flash: clear previous timer before setting new one
- (2026-04-17, session-completion) Always send explicit `sessionId` in completion API calls
- (2026-04-17, code-review) Union-type casts like `x as ObjectivePriority` must be runtime-validated
- (2026-04-18, code-review) When wiring dashboard aggregators to handler functions, use `.catch(() => [])` to prevent partial failures
- (2026-04-18, security) `timingSafeEquals` must never return early on length mismatch
- (2026-04-18, security) `byte % alphabet.length` introduces modulo bias; use rejection sampling
- (2026-04-18, srs-contract) When migrating SRS contracts, always add adapter functions at component boundaries; DailyPracticeSession sits between Convex (legacy schema) and processPracticeSubmission (new contract) — both directions need mapping
## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` at top of page tests — keeps tests fast and isolated
- (2026-04-15, harden-manual-approval) Harness gating: expose canApprove via callback, track in parent, gate approve button
- (2026-04-16, srs-rating-adapter) Two-step rating: compute base rating from correctness first, then apply timing as conservative modifier
- (2026-04-16, srs-product-contract) Single canonical contract module with re-exports; downstream imports from one surface

## Planning Improvements

- (2026-04-13, component-approval) Convex queries: use `.withIndex()` not `.filter()`, and `.take(n)` instead of `.collect()` to bound results
- (2026-04-16, code-review) New seed mutations must be wired into seed.ts immediately; orphan files silently skip data
- (2026-04-17, srs-queue-performance) Replace N+1 sequential DB lookups with Promise.all over deduplicated IDs
- (2026-04-17, test-design) Vitest only discovers tests in `__tests__/**/*.test.ts`; place test files there
- (2026-04-18, monorepo-package) Packages under `packages/` need root tsconfig.json; CI/CD paths-ignore after monorepo move must audit `apps/**` blocks
- (2026-04-18, srs-engine) Define types locally in shared packages if dependencies don't export them
- (2026-04-18, code-review) `export type { X } from 'mod'` re-exports but doesn't create a local binding
- (2026-04-18, monorepo) Always run `npx tsc --noEmit` in each extracted package independently
- (2026-04-18, graphing-core) Different coordinate systems (data vs canvas) are valid deltas — document the boundary clearly
- (2026-04-18, bm2-consume) When migrating imports to packages, vitest mocks must be updated to match new import paths
- (2026-04-18, review-6) SRS contract migration must include component-layer adapters; DailyPracticeSession broke because Phase 1-2 migrated lib/ but not components — always audit the full data flow path (Convex → component → lib → Convex)
- (2026-04-18, review-6) FSRS timestamp rounding can cause 1ms boundary flakiness in tests; capture both before/after timestamps and use after for upper bounds
- (2026-04-18, bm2-consume-core) When migrating practice imports to package, update both the import source AND remove local re-exports; local contract.ts dups should stay until audit confirms they're truly local-specific
- (2026-04-18, practice-test-engine) When apps have incompatible phase models (e.g., 3-phase vs 6-phase), extract only shared types and pure utility functions; engine components with divergent state machines must stay app-local
- (2026-04-19, study-hub-adoption) When adopting package components, remove unused props from wrapper components - the local `activityType` prop was accepted by `BaseReviewSession` but never used internally, so it was safely removed during package migration
- (2026-04-19, teacher-reporting-adoption) When package has incompatible wider types (BM2 gradebook has practice/assessment fields), migrate type imports only and keep function imports local until verified; structural type compatibility (CellColor union) enables partial adoption
- (2026-04-19, ai-tutoring-adoption) When migrating from local duplications to package imports, update vitest module mocks to point to new package path; local route files (spreadsheet-feedback.ts, ai-interpretation.ts) should stay app-local but import from package
