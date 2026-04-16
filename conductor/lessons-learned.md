# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

## Architecture & Design

- (2026-04-16, srs-schema) Convex DB stores timestamps as `number` (ms epoch) but `SrsCardState` contract uses ISO strings — convert at adapter boundary; failing to do so causes validator/runtime mismatches
- (2026-04-16, srs-integration) Always add `by_student_and_problem_family` index for SRS cards; querying by `problemFamilyId` alone causes cross-student card overwrites in multi-tenant tables
- (2026-04-16, srs-integration) Use `ctx.scheduler.runAfter(0, internal.srs.processSubmissionSrs, ...)` for non-blocking SRS processing after submission persistence; keep error boundaries so SRS failures never block the primary submission flow
- (2026-04-16, srs-schema) When `convex dev` is blocked by non-interactive prompts (e.g., backend upgrade), manually patch `convex/_generated/api.d.ts` with the module imports and `fullApi` entries as a temporary workaround

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

- (2026-04-12, algebraic-examples) Pattern-matching equivalence works for Module 1 (88% passing) but has limits; polynomial expansion patterns need unified sign handling
- (2026-04-13, component-approval) Convex queries: use `.withIndex()` not `.filter()`, and `.take(n)` instead of `.collect()` to bound results
- (2026-04-14, code-review) Activity wrappers should inject activityId into submission payloads, not pass it to inner components
- (2026-04-14, code-review) Always guard division by zero in score calculations; NaN propagates silently through analytics
- (2026-04-15, module-6-seed) Build focused lesson_standards seeders per module: query lesson + version + standard by natural keys, then insert idempotently
- (2026-04-15, module-7-seed) When adding lesson_standards links, verify every referenced standard code exists in seed-standards.ts first — otherwise links silently fail
- (2026-04-16, code-review) When adding proficiency labels to union types, ensure every label has a production code path; dead union members are misleading
- (2026-04-16, ccss-standards-seeding) When adding lesson_standards links, all referenced standards must exist in seed-standards.ts first — seed order matters; seedStandards before lessonStandards in seed.ts
- (2026-04-16, blueprint-schema) Convex TableDefinition.indexes is private — test table existence via `schema.tables.TableName` and field access via type assertion to avoid internal API reliance
- (2026-04-16, code-review) New seed mutations must be wired into seed.ts immediately; orphan seed files produce no visible error but silently skip data. Dependencies referenced in committed code must be in package.json before the code lands.
- (2026-04-16, code-review) Convex validators strip undeclared fields; mock tests bypass validation. Prefer server-side DB lookups over trusting client-supplied derived fields.
- (2026-04-16, code-review) CCSS standard descriptions must match actual standard text, not cluster headings
- (2026-04-16, srs-schema) SrsCardState contract uses `studentId: string` but Convex schema uses `Id<"profiles">`; type assertions needed at adapter boundary; runtime Convex IDs must be valid profile IDs
- (2026-04-16, srs-schema) ConvexCardStore adapter cannot use QueryCtx for writes (no runMutation); separate MutationCtx needed for save operations
- (2026-04-16, srs-schema) saveCard uses by_problem_family index alone; spec says "studentId+problemFamilyId composite key" but no such index exists; may cause cross-student card collisions
- (2026-04-16, srs-schema) New Convex subdirectories must import `_generated` from the parent `convex/_generated` path, not a local `./_generated` that does not exist
- (2026-04-16, srs-schema) Convex `v.optional(v.string())` produces `string | undefined`, but contract may use `string | null` — normalize at adapter boundary to prevent silent type errors