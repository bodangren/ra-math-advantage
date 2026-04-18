# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-18, component-approval) When extracting packages with Convex dependencies, use generic interfaces in the package and keep Convex-specific types app-local; this preserves type safety without creating package-to-Convex dependencies
- (2026-04-16, srs-integration) Always add `by_student_and_problem_family` index for SRS cards; querying by `problemFamilyId` alone causes cross-student card overwrites
- (2026-04-16, srs-integration) Use `ctx.scheduler.runAfter(0, ...)` for non-blocking SRS processing; keep error boundaries so SRS failures never block submission
- (2026-04-16, srs-schema) `mapDbCardToContract` must use `card._id` as `cardId`, not `problemFamilyId` — domain IDs are not unique across students
- (2026-04-17, auth-guards) Test request guards by mocking `verifySessionToken` and passing cookie headers directly on Request objects; avoids circular mocks of the module under test
- (2026-04-16, sessions) Server-side day-boundary comparisons must use UTC methods; stale sessions must be explicitly closed before creating new ones
- (2026-04-18, monorepo-move) After moving app to `apps/integrated-math-3/`, any code reading from `conductor/` must resolve to `../../conductor/` (monorepo root), not `./conductor/` (app-local). Add a fallback check.

## Recurring Gotchas

- (2026-04-17, code-review) Timer refs reused for wrong-answer flash: clear previous timer with `clearTimeout(wrongTimerRef.current)` before setting new one; otherwise first timer fires and clears state prematurely
- (2026-04-17, session-completion) Always send explicit `sessionId` in completion API calls; looking up "active session by student" at completion time creates race conditions
- (2026-04-17, code-review) Union-type casts like `x as ObjectivePriority` must be runtime-validated; DB corruption silently propagates otherwise
- (2026-04-18, code-review) When wiring dashboard aggregators to handler functions, the handlers may throw; use `.catch(() => [])` to prevent partial failures from breaking the whole dashboard
- (2026-04-18, security) `timingSafeEquals` must never return early on length mismatch — always iterate max length to avoid timing side-channels
- (2026-04-18, security) `byte % alphabet.length` introduces modulo bias; use rejection sampling when 256 is not divisible by alphabet length
- (2026-04-18, security) Password `.trim()` silently modifies user input; reject passwords with leading/trailing spaces explicitly
- (2026-04-18, security) Vercel production deployments must check `VERCEL_ENV === 'production'` explicitly; don't rely solely on `NODE_ENV`
- (2026-04-18, packages) After extracting a package, delete the app-local copy immediately — duplicated code diverges silently and doubles maintenance
## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` at top of page tests — keeps tests fast and isolated
- (2026-04-15, harden-manual-approval) Harness gating: expose canApprove via callback, track in parent, gate approve button
- (2026-04-16, practice-timing) Pure accumulator pattern: isolate timing in browser-free module, inject timestamps from React hook
- (2026-04-16, srs-rating-adapter) Two-step rating: compute base rating from correctness first, then apply timing as conservative modifier
- (2026-04-16, srs-product-contract) Single canonical contract module (`lib/srs/contract.ts`) with re-exports; downstream imports from one surface
- (2026-04-18, dashboard-wiring) Promise.all over independent handler calls with individual .catch() — graceful degradation per panel

## Planning Improvements

- (2026-04-13, component-approval) Convex queries: use `.withIndex()` not `.filter()`, and `.take(n)` instead of `.collect()` to bound results
- (2026-04-16, code-review) New seed mutations must be wired into seed.ts immediately; orphan files silently skip data
- (2026-04-17, srs-queue-performance) Replace N+1 sequential DB lookups with Promise.all over deduplicated IDs; Convex automatically batches parallel independent reads
- (2026-04-17, test-design) Vitest only discovers tests in `__tests__/**/*.test.ts`; place test files there even when stub implementations live in `lib/**/__tests__/`
- (2026-04-17, test-design) Convex query mocks must filter by the actual query args — returning unfiltered data causes incorrect calculations in multi-student scenarios
- (2026-04-18, monorepo-package) Packages under `packages/` need root tsconfig.json; CI/CD paths-ignore after monorepo move must audit `apps/**` blocks
- (2026-04-18, srs-engine) Define types locally in shared packages if dependencies don't export them; ESLint must be scaffolded; migrate local imports to package with updated vitest mocks
- (2026-04-18, code-review) `export type { X } from 'mod'` re-exports but doesn't create a local binding; use `import type { X } from 'mod'; export type { X } from 'mod';` when the type is used locally in the same file
- (2026-04-18, monorepo) Always run `npx tsc --noEmit` in each extracted package independently; root tsc with `include: []` catches nothing
- (2026-04-18, graphing-core) When reconciling BM2 vs extracted package, different coordinate systems (data vs canvas) are valid deltas — don't force merge; document the boundary clearly
- (2026-04-18, bm2-migration) BM2 governance tests (conductor/, docs/, README.md checks) don't apply in monorepo context; exclude these files from copy and skip/remove those tests
- (2026-04-18, bm2-consume) When migrating imports to packages, vitest mocks must be updated to match new import paths; mocks on `@/@lib/X` won't apply when X is imported from `@math-platform/X`

