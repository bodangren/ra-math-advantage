# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-18, component-approval) When extracting packages with Convex dependencies, use generic interfaces in the package and keep Convex-specific types app-local
- (2026-04-16, srs-integration) Always add `by_student_and_problem_family` index for SRS cards; querying by `problemFamilyId` alone causes cross-student card overwrites
- (2026-04-16, srs-schema) `mapDbCardToContract` must use `card._id` as `cardId`, not `problemFamilyId`
- (2026-04-19, srs-queries) N+1 sequential loops in Convex queries cause timeouts; use `Promise.all` + Map for O(1) lookup
- (2026-04-23, n1-fixes) Batch all phase section lookups via Promise.all; pre-fetch competency standards before objective loops; batch student SRS cards+reviews in parallel
- (2026-04-23, review-18) Convex `.eq()` on multi-entry array index expects single element, NOT array — `q.eq("objectiveIds", string)` not `q.eq("objectiveIds", string[])`. The `as unknown as string[]` cast silently breaks queries returning 0 results
- (2026-04-28, review-23) Independent `.collect()` calls should always be wrapped in `Promise.all` — sequential awaits on independent queries add unnecessary round-trip latency in Convex

## Recurring Gotchas

- (2026-04-23, bm2-deactivated-user-access) Swapping an auth helper in a route requires updating EVERY test file that mocks it — including duplicate `__tests__/api/` and `__tests__/app/api/` test suites
- (2026-04-23, review-17) `requireActive*SessionClaims` returns `SessionClaims | Response`, NOT `SessionClaims | null` — must use `instanceof Response` check
- (2026-04-23, review-17) When extracting modules to packages, grep for ALL import paths (including relative `../../` Convex paths) — not just `@/` app imports
- (2026-04-23, review-14) Never return `error.message` in API error responses — leaks internal details. Return generic message + log server-side
- (2026-04-23, review-14) Server components with `<select>` but no `onChange` are purely cosmetic; use client components with URL search params for stateful UI
- (2026-04-23, review-14) Convex runtime cannot import npm packages — duplicate constants in convex/ files are unavoidable
- (2026-04-19, review-10) Always validate + parse request body BEFORE consuming rate limits — malformed requests burn quota
- (2026-04-19, review-11) When sanitizing LLM prompt inputs, apply sanitization to ALL user-controllable fields including arrays
- (2026-04-19, auth-design) Authorization checks must verify specific resource ownership; ensure seeding or fallback exists — empty auth tables block all access silently
- (2026-04-28, review-23) Rate limiting mutation args must match what routes actually pass — unused required args cause runtime validation failures even when the handler derives the value from auth context
- (2026-04-29, review-25) Converting Convex public mutations to `internalMutation` requires: (1) updating generated `api.d.ts` with new module import, (2) updating ALL test mock setups from `fetchMutation` + `api.*` to `fetchInternalMutation` + `internal.*`, (3) removing stale `Id` imports from modules that no longer use them

## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-16, srs-product-contract) Single canonical contract module with re-exports; downstream imports from one surface
- (2026-04-23, review-14) URL search params + client component selector pattern works well for server-rendered pages needing client interactivity
- (2026-04-28, review-23) `Promise.all` for independent Convex `.collect()` calls reduces sequential round-trips to single parallel batch

## Planning Improvements

- (2026-04-23, review-14) Always wrap API route handlers in try/catch — unhandled errors may leak stack traces or hang connections
- (2026-04-24, phase-6) Runtime validation beats double-casting: `validateWorkbookManifest` replaces `as unknown as WorkbookManifest` with explicit shape checks
- (2026-04-24, ci-cd-hardening) Removing `|| true` from CI steps while keeping job-level `continue-on-error: true` preserves failure visibility
- (2026-04-24, bundle-splitting) Vinext manualChunks with function syntax handles external modules; use `id.includes()` checks instead of module name arrays
- (2026-04-24, registry-cleanup) When replacing placeholder registrations with real implementations, remove keys from the placeholder list — duplicate registrations silently overwrite
- (2026-04-24, package-types) Make local type extensions explicit (`extends PackageType`) rather than relying on structural compatibility
- (2026-04-28, review-23) `Math.max(0, ...)` clamp on `remaining` in rate limit handlers prevents negative values when count exceeds max
- (2026-04-28, review-23) Convex `.unique()` query on non-unique index can throw when concurrent inserts create duplicates — design rate limit upserts defensively
- (2026-04-28, rate-limiting-race) Fix race condition via try/catch upsert: if insert throws duplicate key error, re-query existing record and patch/increment; check error message for "duplicate" or "unique" keywords
- (2026-04-29, review-25) `fetchPublicMutation` uses an unauthenticated Convex client — public mutations requiring `ctx.auth.getUserIdentity()` will ALWAYS throw "Unauthenticated" from Next.js API routes. Use `internalMutation` with explicit `userId` arg instead. Deprecated shim routes (e.g., `activities/complete`) that proxy to canonical endpoints must forward the original `Cookie` header or auth will fail silently in the downstream route
- (2026-04-29, review-26) The try/catch upsert race condition fix applied to apiRateLimits MUST also be applied to rateLimits.ts — identical `.unique()` + `ctx.db.insert` patterns have identical vulnerability. Convex validators duplicated across schema.ts and handler files create maintenance risk — extract shared validators to a common file in convex/ (e.g., `convex/srs/validators.ts`) and import from schema and handlers. IM3 and BM2 rate limiters diverged in visibility (public vs internal) despite identical behavior — keep rate limiters as internalMutation/internalQuery since they are infrastructure, not client-facing
- (2026-04-29, review-27) Login rate limiter was left as public `mutation` during review-25 migration — always grep for ALL `mutation`/`query` exports in Convex files when doing an internalMutation migration. Convex indexes are NOT unique — `.unique()` + `ctx.db.insert` try/catch catches errors that never fire; concurrent inserts create duplicates that break future `.unique()` calls. When changing function args from `v.string()` to `v.id()`, also update all callers that pass `string` values (e.g., `convexReviewLogStore.ts`, test files). SRS `rating` field must be a typed union of the 4 FSRS literals, not `v.string()`
- (2026-04-29) Convex `internalMutation`/`internalQuery` exports are typed as `RegisteredMutation`/`RegisteredQuery` — not directly callable in unit tests; use `as any` type assertion when testing handlers
- (2026-04-29, review-28) `as any` casts on `internal.*` references become stale liabilities — after migrating to `internalMutation`/`internalQuery`, remove them; generated `api.d.ts` provides full typing
- (2026-04-29, saveCards-batch) When batching N independent DB lookups then N writes, use two-phase Promise.all: lookups in parallel first, then writes in parallel. Sequential await loop = 2N DB round trips; two-phase Promise.all = 2 round trips
