# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

## Architecture & Design
<!-- Decisions made that future tracks should be aware of -->

- (2026-04-05, setup) Scaffolded from bus-math-v2; architecture.md preserved in conductor/ for reference
- (2026-04-05, setup) Convex internal queries/mutations require server-side admin auth — all data fetching from pages goes through `lib/convex/server.ts` helpers
- (2026-04-12, graphing-components) Activity registry requires wrapper components to adapt component-specific props to ActivityComponentProps

## Recurring Gotchas
<!-- Problems encountered repeatedly; save future tracks from the same pain -->

- (2026-04-05, setup) vinext (Vite-backed Next.js) may have subtle differences from stock Next.js — test builds early
- (2026-04-08, setup) Schema porting from bus-math-v2 requires `npx tsc --noEmit` to catch missing tables; use `npx convex dev --once` for one-time type generation (faster for CI)
- (2026-04-13, review) Known-failing tests landed with tech-debt notes (equivalence 44/50, InterceptIdentification 8/23) accumulate risk — enforce green baseline or scope the API down to what passes
- (2026-04-12, submission-schema) Zod 4.x `z.record()` requires explicit key type — use `z.record(z.string(), z.unknown())`, not `z.record(z.unknown())`
- (2026-04-12, graphing-schema) TypeScript array type inference narrows from first elements — use explicit type annotation when pushing different types
- (2026-04-10, graphing-components) JavaScript's -0 (negative zero) appears in calculations like -b/(2a) when b=0 — use `Object.is(val, -0)` to detect

## Patterns That Worked Well
<!-- Approaches worth repeating -->

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` and `@/lib/auth/server` at the top of page tests — keeps tests fast and isolated
- (2026-04-09, e-textbook-design) Use Tailwind animate-in classes for smooth transitions — lighter weight than framer-motion
- (2026-04-11, fix-bundle-size) Use `next/dynamic` with `ssr: true` for heavy components — reduces bundle size without breaking SSR
- (2026-04-12, graphing-components) Create wrapper components for activity registry to adapt component-specific props
- (2026-04-12, fix-graphing-test-types) Use `as const` on string literals in test props to preserve literal types

## Planning Improvements
<!-- Notes on where estimates were wrong and why -->

- (2026-04-10, activity-infrastructure) activity_completions schema requires lessonId/phaseNumber not in practice.v1 — future work: pass context or redesign
- (2026-04-11, fix-intercept-tests) Test failures were due to incorrect test coordinates — verify assumptions match implementation before fixing code
- (2026-04-12, algebraic-examples) Pattern-matching equivalence works for Module 1 (88% passing) but has limits — consider symbolic math library for production
- (2026-04-12, algebraic-examples) Polynomial expansion patterns need unified handling of all sign combinations; coefficient formatting must omit 1 (e.g., -1x -> -x)
- (2026-04-13, algebraic-examples) Algebraic component testing requires KaTeX-aware assertions — text matching fails with KaTeX HTML; use specific assertions and avoid regex on rendered math
- (2026-04-13, algebraic-examples) Problem type implementation is configuration-driven — StepByStepper component handles all modes; problem types are just step configurations with expressions, explanations, hints, and distractors
- (2026-04-13, algebraic-examples) Rate of change problems support multiple input types — equation, table, and graph readout all use same step sequence with different data sources
- (2026-04-13, distractors) ESLint unused variable warnings for destructuring — use `,` instead of `_` to ignore elements, or use eslint-disable comments
- (2026-04-13, review) Conductor autonomous runs produce ~60% bookkeeping commits (`Mark X complete`, output-log updates) — squash into phase-completion commits so `git log` stays navigable
- (2026-04-13, review) Convex `internalMutation` args should not accept identity (e.g. `createdBy: v.id("profiles")`) — derive from auth context or clearly mark CLI-only to avoid a trust-boundary bug if ever exposed
- (2026-04-13, component-approval) Convex queries must use `.withIndex()` not `.filter()` — always define an index in schema and use it
- (2026-04-13, component-approval) Use `.take(n)` instead of `.collect()` to bound query results and avoid transaction size limits
- (2026-04-13, content-hash) Node.js `crypto` module not available in V8/edge runtimes — use Web Crypto API (`crypto.subtle.digest`)
- (2026-04-14, supporting-activities) Activity wrapper pattern: wrapper calls onSubmit, inner component calls onComplete — never both in wrapper AND inner component (double-onComplete bug)
- (2026-04-14, supporting-activities) Zod schemas must be written to match actual component props, not an idealized API — write component first, then schema, not vice versa
- (2026-04-14, roc) Table data lookups must use indexOf for x-value matching, not direct array indexing — x-values aren't guaranteed sequential
- (2026-04-14, roc) Normalize -0 to 0 before comparison; Object.is(-0, 0) returns false which breaks zero-boundary point matching
