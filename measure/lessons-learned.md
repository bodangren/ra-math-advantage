# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-19, srs-queries) N+1 sequential loops in Convex queries cause timeouts; use Promise.all + Map for O(1) lookup. For teacher-class queries, fetch ALL cards/reviews/submissions broadly then group by studentId in memory — never query per-student in a loop.
- (2026-04-23, review-18) Convex `.eq()` on multi-entry array index expects single element, NOT array — `q.eq("objectiveIds", string)` not `q.eq("objectiveIds", string[])`. The `as unknown as string[]` cast silently breaks queries returning 0 results
- (2026-04-28, review-23) Independent `.collect()` calls should always be wrapped in `Promise.all` — sequential awaits on independent queries add unnecessary round-trip latency in Convex
- (2026-05-03, session-pagination) Convex `.paginate()` returns `{ page, isDone, continueCursor }` — use opaque cursors, not integer offsets. Filter results post-pagination when index can't express the constraint (e.g., completedAt !== undefined).

## Recurring Gotchas

- (2026-04-23, bm2-deactivated-user-access) Swapping an auth helper in a route requires updating EVERY test file that mocks it — including duplicate `__tests__/api/` and `__tests__/app/api/` test suites
- (2026-04-23, review-14) Never return `error.message` in API error responses — leaks internal details. Return generic message + log server-side
- (2026-04-23, review-14) Convex runtime cannot import npm packages — duplicate constants in convex/ files are unavoidable
- (2026-04-19, review-10) Always validate + parse request body BEFORE consuming rate limits — malformed requests burn quota
- (2026-04-29, review-25) Converting Convex public mutations to `internalMutation` requires: (1) updating generated `api.d.ts`, (2) updating ALL test mock setups from `fetchMutation` + `api.*` to `fetchInternalMutation` + `internal.*`, (3) removing stale `Id` imports
- (2026-05-03, vitest-aliases) New monorepo packages need vitest `resolve.alias` entries in each app until `npm install` creates workspace symlinks. Without aliases, imports resolve to nothing and tests fail with opaque transform errors. Once symlink exists, remove aliases immediately — they mask broken workspace resolution.

## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-16, srs-product-contract) Single canonical contract module with re-exports; downstream imports from one surface
- (2026-04-29, saveCards-batch) Two-phase Promise.all: lookups in parallel first, then writes in parallel. Sequential await = 2N DB round trips; two-phase = 2 round trips
- (2026-05-03, rate-limiter-extraction) Extract pure algorithm logic (sliding window check, config constants) to packages; keep Convex-specific handlers thin in apps. 15 package-level tests + per-app handler tests = high confidence without mocking Convex.
- (2026-05-03, governance-tests) BM2 governance tests using `process.cwd()` broke in monorepo. Fix: `const REPO_ROOT = path.resolve(__dirname, '../../..')` for monorepo-root paths, keep `path.resolve(__dirname, '..')` for app-local paths.
- (2026-05-03, vany-typing) Replace `v.any()` with `v.record(v.string(), v.any())` in Convex schemas — validates object shape without constraining properties. Intentionally untyped fields (polymorphic rawAnswer, interactionHistory) are acceptable exceptions.

## Planning Improvements

- (2026-05-09, skill-inventory) When parsing markdown tables that may appear multiple times in a document, always target the specific section heading rather than grabbing the first table found. Class-period plans have budget tables before the instruction table.
- (2026-05-09, skill-inventory) Curriculum files across apps use different naming conventions (Module vs Unit, `lesson.md` subdirectories vs flat files); extraction adapters need lenient heading matching and fallback strategies per course.
- (2026-05-09, knowledge-space) `knowledge-space-core` and `knowledge-space-practice` must stay domain-neutral. Do not put math curriculum maps, Pearson/GSE descriptors, standards catalogs, or generated app activity maps in reusable packages; keep them in app/domain content packages.
- (2026-05-09, knowledge-space-visuals) Student, parent, and teacher graph visualizations should render role-specific projection payloads, not raw graph files or UI-computed graph truth.
- (2026-05-10, skill-graph-pilot) Graph-to-runtime pipeline works end-to-end: nodes → edges → blueprints → generators → projections → practice.v1 parts. But generator coverage and concept-level blueprints need authoring before projections can replace hand-authored activity maps.
- (2026-05-10, skill-graph-pilot) Running pilot graph tests from monorepo root `npx vitest run <path>` naturally resolves workspace package imports. Per-directory vitest configs need resolution aliases for sub-path exports like `@math-platform/math-content/knowledge-space`.
- (2026-04-29, review-30) When handler stores via DB document ID but returns caller-provided ID, downstream consumers get wrong reference. Always return the actual DB ID used for writes
- (2026-04-29, review-31) Reverting N+1 "fix" — full table scans (`.collect()`) replace N indexed queries but are worse for large tables. Use `Promise.all` with per-student `.withIndex()` queries instead. `Array.includes()` → `Set.has()` for O(1) lookup in hot loops
- (2026-05-03, tech-debt-cleanup) After a tech-debt resolution track, prune tech-debt.md aggressively — remove all Resolved items, keep only Open. Historical record lives in git history, not working memory.

## Curriculum Authoring

- (2026-05-01, precalc-depth-remediation) Curriculum artifacts from generic generation are NOT equivalent to source-grounded authoring. Always extract from primary sources (PDFs) before writing curriculum.
- (2026-05-01, precalc-depth-remediation) When spinning up subagents for content extraction, explicitly instruct them to use the Write tool for output files.
