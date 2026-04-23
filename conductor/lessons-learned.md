# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-18, component-approval) When extracting packages with Convex dependencies, use generic interfaces in the package and keep Convex-specific types app-local
- (2026-04-16, srs-integration) Always add `by_student_and_problem_family` index for SRS cards; querying by `problemFamilyId` alone causes cross-student card overwrites
- (2026-04-16, srs-schema) `mapDbCardToContract` must use `card._id` as `cardId`, not `problemFamilyId`
- (2026-04-19, srs-queries) N+1 sequential loops in Convex queries cause timeouts; use `Promise.all` + Map for O(1) lookup
- (2026-04-23, n1-fixes) Batch all phase section lookups via Promise.all; pre-fetch competency standards before objective loops; batch student SRS cards+reviews in parallel

## Recurring Gotchas

- (2026-04-23, review-14) Never return `error.message` in API error responses — leaks internal details (stack traces, schema, env). Return generic message + log server-side
- (2026-04-23, review-14) Server components with `<select>` but no `onChange` are purely cosmetic; use client components with URL search params for stateful UI
- (2026-04-23, review-14) Convex runtime cannot import npm packages — duplicate constants in convex/ files are unavoidable; document derivation with comments
- (2026-04-19, review-9) When Convex mutations are called via `fetchInternalMutation` (admin auth), `ctx.auth.getUserIdentity()` returns null — always pass userId explicitly
- (2026-04-19, review-10) Always validate + parse request body BEFORE consuming rate limits — malformed requests burn quota
- (2026-04-19, review-11) When sanitizing LLM prompt inputs, apply sanitization to ALL user-controllable fields including arrays
- (2026-04-19, auth-design) Authorization checks must verify specific resource ownership; ensure seeding or fallback exists — empty auth tables block all access silently
- (2026-04-19, review-12) Input sanitization must preserve domain notation — stripping `*` and `_` breaks math notation

## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-15, harden-manual-approval) Harness gating: expose canApprove via callback, track in parent, gate approve button
- (2026-04-16, srs-product-contract) Single canonical contract module with re-exports; downstream imports from one surface
- (2026-04-23, review-14) URL search params + client component selector pattern works well for server-rendered pages needing client interactivity

## Planning Improvements

- (2026-04-17, srs-queue-performance) Replace N+1 sequential DB lookups with Promise.all over deduplicated IDs
- (2026-04-18, monorepo-package) Packages under `packages/` need root tsconfig.json; CI/CD paths-ignore after monorepo move must audit `apps/**` blocks
- (2026-04-19, monorepo-ci) CI matrices with pre-existing failures: use `continue-on-error: true` + `|| true` fallback; document known failures
- (2026-04-23, review-14) Always wrap API route handlers in try/catch — unhandled errors may leak stack traces or hang connections
- (2026-04-23, review-14) Seed data must cover all modules, not just first — otherwise features silently break for unseeded content
- (2026-04-23, tech-debt-triage) Many tech debt items are already resolved — always investigate before assuming fix needed; content hash mechanism prevents approval race conditions
