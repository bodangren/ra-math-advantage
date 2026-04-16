# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

## Architecture & Design

- (2026-04-05, setup) vinext (Vite-backed Next.js) may have subtle differences from stock Next.js — test builds early
- (2026-04-12, submission-schema) Zod 4.x `z.record()` requires explicit key type — use `z.record(z.string(), z.unknown())`, not `z.record(z.unknown())`
- (2026-04-12, graphing-schema) TypeScript array type inference narrows from first elements — use explicit type annotation when pushing different types

## Recurring Gotchas

- (2026-04-15, code-review) React components calling hooks must follow `use*` naming convention; dual state bugs arise when parent and child both track the same state — extract state to single owner
- (2026-04-15, code-review) Approval gating must include ALL verification checkboxes in canApprove; mode review alone is insufficient for trustworthiness
- (2026-04-15, code-review) Content hashing must use the same componentKind derivation on both write and read paths
- (2026-04-16, code-review) Standard codes referenced in lesson_standards links must exist in seed-standards.ts; missing standards cause silent link failures at seed time with no error visibility
- (2026-04-16, code-review) Explore phase activities must match lesson domain — copy-pasted graphing-explorer in non-graphing lessons is a silent content error
- (2026-04-16, practice-timing) When mixing `performance.now()` and `Date.now()` in React hooks, all internal timing must use one base; serialization is the only safe place to convert

## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` and `@/lib/auth/server` at the top of page tests — keeps tests fast and isolated
- (2026-04-15, harden-manual-approval) Harness gating: expose canApprove via callback, track in parent, gate approve button
- (2026-04-12, graphing-components) Create wrapper components for activity registry to adapt component-specific props
- (2026-04-16, practice-timing) Pure accumulator pattern: isolate timing logic in a browser-free module, inject timestamps from React hook — allows unit testing without DOM
- (2026-04-16, practice-timing-baselines) Keep baseline calculations course-agnostic by accepting a generic `problemFamilyId: string`; defer Convex/React wiring to later phases
- (2026-04-16, srs-rating-adapter) Two-step rating adapter pattern: compute base rating from correctness first, then apply timing as a conservative modifier; this keeps timing from ever overriding correctness and produces a clear audit trail
- (2026-04-16, objective-proficiency) Separate evidenceConfidence (quality signal) from isProficient (policy compliance); this lets reporting surfaces show both the strength of evidence AND whether policy thresholds are met
- (2026-04-16, srs-product-contract) Create a single canonical contract module (`lib/srs/contract.ts`) that re-exports existing types and defines new ones; downstream tracks import from one surface and version the contract explicitly

## Planning Improvements

- (2026-04-10, activity-infrastructure) activity_completions schema requires lessonId/phaseNumber not in practice.v1 — future work: pass context or redesign
- (2026-04-12, algebraic-examples) Pattern-matching equivalence works for Module 1 (88% passing) but has limits; polynomial expansion patterns need unified sign handling
- (2026-04-13, component-approval) Convex queries: use `.withIndex()` not `.filter()`, and `.take(n)` instead of `.collect()` to bound results
- (2026-04-14, code-review) Activity wrappers should inject activityId into submission payloads, not pass it to inner components
- (2026-04-14, code-review) Always guard division by zero in score calculations; NaN propagates silently through analytics
- (2026-04-15, module-6-seed) Build focused lesson_standards seeders per module: query lesson + version + standard by natural keys, then insert idempotently
- (2026-04-15, module-7-seed) Wire seed files into seed.ts orchestration immediately after creation; orphan seed files are dead code
- (2026-04-15, module-7-seed) When adding lesson_standards links, verify every referenced standard code exists in seed-standards.ts first — otherwise links silently fail
- (2026-04-16, module-8-seed) Review previous phase seed.ts integration before starting new phases; missing getLessons() entries cause silent seed skips even when switch cases exist
- (2026-04-16, code-review) Explore phase activities must match lesson domain — copy-pasted graphing-explorer with y=1/x in statistics lessons is a silent content error; always verify componentKey+props relevance
- (2026-04-16, component-kind-fix) When write-path and read-path both compute a derived value (e.g., componentKind from phaseType), derive on both sides — client args on write-path can be stale and cause permanent hash mismatches
- (2026-04-16, code-review) When adding proficiency labels to union types, ensure every label has a production code path; dead union members are misleading
- (2026-04-16, timing-baselines) Double filtering (Convex layer + pure layer) is harmless but signals unclear responsibility boundaries; prefer single filtering point with documented contract
- (2026-04-16, ccss-standards-seeding) When adding lesson_standards links, all referenced standards must exist in seed-standards.ts first — seed order matters; seedStandards before lessonStandards in seed.ts
