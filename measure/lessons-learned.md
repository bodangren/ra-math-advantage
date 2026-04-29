# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-19, srs-queries) N+1 sequential loops in Convex queries cause timeouts; use Promise.all + Map for O(1) lookup. For teacher-class queries, fetch ALL cards/reviews/submissions broadly then group by studentId in memory — never query per-student in a loop.
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
- (2026-04-28, review-23) `Promise.all` for independent Convex `.collect()` calls reduces sequential round-trips to single parallel batch
- (2026-04-29, saveCards-batch) Two-phase Promise.all: lookups in parallel first, then writes in parallel. Sequential await = 2N DB round trips; two-phase = 2 round trips

## Planning Improvements

- (2026-04-23, review-14) Always wrap API route handlers in try/catch; never return `error.message` — leaks internal details
- (2026-04-24, bundle-splitting) Vinext manualChunks with function syntax; use `id.includes()` checks instead of module name arrays
- (2026-04-28, review-23) `Math.max(0, ...)` clamp on rate limit `remaining`; Convex `.unique()` on non-unique index throws on concurrent inserts — use try/catch upsert
- (2026-04-29, review-25) `fetchPublicMutation` uses unauthenticated client — use `internalMutation` with explicit `userId` arg instead
- (2026-04-29, review-27) Convex indexes are NOT unique; concurrent inserts create duplicates. Always grep for ALL `mutation`/`query` exports when migrating to internal. SRS `rating` must be typed union of 4 FSRS literals
- (2026-04-29) Convex `internalMutation`/`internalQuery` exports typed as `RegisteredMutation`/`RegisteredQuery` — use `as any` in unit tests. After migration, remove stale `as any` casts on `internal.*` references; generated `api.d.ts` provides full typing
- (2026-04-29, review-29) TypeScript `as` casts are compile-time only — dead code in try/catch. Use `v.id()` validators at arg level. Export handler functions for testing to avoid `as any`. Use `v.union(v.literal(...))` for endpoint names — deny-by-default
- (2026-04-29, prompt-guard) Regex with optional trailing groups (`?`) cause false positives — require both action and target keywords with `.+` between them
- (2026-04-29, review-30) When handler stores via DB document ID but returns caller-provided ID, downstream consumers get wrong reference. Always return the actual DB ID used for writes
- (2026-04-29, review-30) After changing handler deny-by-default behavior, update BOTH the mutation AND the status query, AND all tests — test was the only thing catching the inconsistency
- (2026-04-29, activity-components-extract) When extracting React components to shared packages: use relative imports within package, declare external deps (KaTeX, graphing-core) as peerDependencies, keep app-specific code (equivalence.ts, distractors.ts) local. Package follows @math-platform/ scope with subpath exports, tsc --noEmit build, vitest + jsdom tests.
