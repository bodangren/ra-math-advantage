# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-18, component-approval) When extracting packages with Convex dependencies, use generic interfaces in the package and keep Convex-specific types app-local; this preserves type safety without creating package-to-Convex dependencies
- (2026-04-16, srs-integration) Always add `by_student_and_problem_family` index for SRS cards; querying by `problemFamilyId` alone causes cross-student card overwrites
- (2026-04-16, srs-integration) Use `ctx.scheduler.runAfter(0, ...)` for non-blocking SRS processing; keep error boundaries so SRS failures never block submission
- (2026-04-16, srs-schema) `mapDbCardToContract` must use `card._id` as `cardId`, not `problemFamilyId` — domain IDs are not unique across students
- (2026-04-17, auth-guards) Test request guards by mocking `verifySessionToken` and passing cookie headers directly on Request objects; avoids circular mocks
- (2026-04-19, srs-queries) N+1 sequential loops in Convex queries cause timeouts at scale; use `Promise.all` to parallelize per-entity queries, then batch dependent lookups (e.g., card lookups) with a second `Promise.all` + Map for O(1) lookup

## Recurring Gotchas

- (2026-04-17, code-review) Timer refs reused for wrong-answer flash: clear previous timer before setting new one
- (2026-04-17, session-completion) Always send explicit `sessionId` in completion API calls
- (2026-04-18, code-review) When wiring dashboard aggregators to handler functions, use `.catch(() => [])` to prevent partial failures
- (2026-04-18, srs-contract) When migrating SRS contracts, always add adapter functions at component boundaries; DailyPracticeSession sits between Convex (legacy schema) and processPracticeSubmission (new contract) — both directions need mapping
- (2026-04-19, review-9) When Convex mutations are called via `fetchInternalMutation` (admin auth), `ctx.auth.getUserIdentity()` returns null — always pass userId as an explicit argument
- (2026-04-19, review-9) Retry wrappers must default to non-retryable; only retry on explicit known patterns (HTTP 429/5xx, network errors). Default `return true` silently masks programming errors
- (2026-04-19, review-9) Shared packages must not couple to CSS frameworks — Tailwind class strings in gradebook.ts prevent non-Tailwind consumers from using the package
- (2026-04-19, review-10) Always validate + parse request body BEFORE consuming rate limits — otherwise malformed requests burn the student's quota
- (2026-04-19, review-10) Empty AI responses are transient — always retry them (EmptyResponseError); CSV exports must sanitize formula prefixes (`=`, `+`, `-`, `@`) to prevent injection (CWE-1236)
- (2026-04-19, review-10) When shared functions accept completion status, never use a sentinel value like 'not_started' as a backdoor to bypass status logic — create a dedicated function (e.g. computeMasteryColor) instead
- (2026-04-19, review-11) When sanitizing LLM prompt inputs, apply sanitization to ALL user-controllable fields including arrays (e.g. learningObjectives.map(sanitize)) — missing one field bypasss the entire defense
- (2026-04-19, auth-design) Authorization checks must verify specific resource ownership, not just general enrollment; use join tables (e.g. class_lessons) to establish ownership chains when resources are curriculum-global
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
- (2026-04-18, code-review) `export type { X } from 'mod'` re-exports but doesn't create a local binding
- (2026-04-18, bm2-consume) When migrating imports to packages, vitest mocks must be updated to match new import paths
- (2026-04-19, review-9) When extracting shared packages, audit the full data flow path for auth — admin auth in Convex has no user identity; mutations must accept explicit user IDs
- (2026-04-19, monorepo-ci) When building CI matrices for apps with pre-existing failures, use `continue-on-error: true` with `|| true` fallback to preserve test signal while preventing CI blockage; document the known failures clearly in the job comments
- (2026-04-19, monorepo-docs) Validation scans (rg for stale imports, path references) should run before Phase 3 to confirm Phase 2 cleanup is unnecessary — clean scans mean no shims existed to remove
- (2026-04-19, ai-tutoring) Memoize provider factory functions at module level to avoid recreating expensive objects on every request; AbortSignal chaining should pass through to internal AbortController
