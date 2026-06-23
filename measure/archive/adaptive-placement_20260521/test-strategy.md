# Test Strategy — Adaptive Placement

## 1. Testing pyramid by phase

- **Phase 1 — Contract & Schema:** mostly unit/type tests; small schema-shape tests for Convex table/index declarations; no UI/E2E.
- **Phase 2 — Adaptive Engine:** heavy unit + property tests over synthetic graphs; async/error tests for probe behavior; no app imports.
- **Phase 3 — IM3 Reference:** unit tests for adapter/problem bank plus thin integration tests that run traversal against IM3-shaped graphs.
- **Phase 4 — Production Wiring:** orchestration integration tests with in-memory stores first; Convex handler tests second; browser/manual route smoke last.
- **Phase 5 — Docs & Doctor:** static validation: boundary lint, per-package `tsc --noEmit`, app lint, full test suite, and spec/doc consistency checks.

## 2. Shared fixtures and mocks

- Reuse `apps/integrated-math-3/__tests__/lib/placement/fixtures.ts` for:
  - `IM3_PROBLEM_BANK` with 25 representative node/problem mappings across modules 1–9.
  - `createDeterministicAnswerSource` for pass/fail/partial presets without randomness.
  - `createInMemoryKnowledgeStateStore` as the store double for placement seeding and idempotency tests.
- Engine tests should prefer tiny inline graph builders for chains, diamonds, forks, convergent DAGs, disconnected nodes, and cycles.
- Probe mocks should record call order and count, and support sync result, async result, and thrown/rejected errors.
- Convex tests should mock/authenticate student identity at the handler boundary and avoid importing app UI into core or package tests.

## 3. Cross-phase edge cases and dependencies

- Empty graph returns no results and an `empty-graph` reason.
- `maxProbes <= 0`, bounded traversal, and max-probe non-convergence must remain explicit.
- `partial` follows fail/prerequisite direction and maps to low-confidence mastery.
- Self-loops, diamond DAGs, duplicate queued nodes, non-`prerequisite_for` edges, and disconnected components must not cause infinite traversal.
- Async probe support must preserve deterministic result order and propagate errors.
- Placement seeds must remain low/medium confidence only and must not mutate source `PlacementResult` input.
- Returning-student guard belongs in Phase 4 caller flow, not the seed upsert helper.
- Track is still dependent on Track 1 for final `PlacementResult → getKnowledgeState` integration coverage.
- Known gap: `apps/integrated-math-3/__tests__/convex/schema-placement.test.ts` must expect Convex `indexes` as an array of `{ indexDescriptor, fields }`, not a record.

## 4. Architecture guardrails

- `packages/knowledge-space-core` must stay domain-neutral: no IM3, Convex, app, or curriculum imports.
- `runPlacementTraversal` tests should assert behavior through public contracts, not private helper internals.
- Shared packages must not import from `apps/` or `convex/_generated/`.
- IM3 app code may depend on `@math-platform/knowledge-space-core`; core must not depend on IM3 fixtures.
- Convex persistence tests should stay at handler/store seams; pure placement orchestration should remain testable without a backend.
- Preserve stable dot-separated node IDs (`math.im3...`) in all fixtures and persisted seeds.

## 5. Per-phase test approach notes

- **Phase 1:** Verify `PlacementResult`, `ProbeAdapter`, result guards, schema fields, and index definitions; include `tsc --noEmit` because schema typing catches shape drift.
- **Phase 2:** Build red tests around traversal direction, frontier convergence, bounded probe count, async adapters, thrown probes, and graph pathology termination.
- **Phase 3:** Validate problem-bank coverage (20–30 entries, all modules represented, valid node IDs), adapter lookup failures, deterministic presets, and end-to-end traversal over branchy IM3-like graphs.
- **Phase 4:** Test `runNewStudentPlacementFlow` happy path, persisted seed round-trip, idempotency, returning-student skip, empty graph skip, adapter error propagation, and Convex query/mutation handlers.
- **Phase 5:** Run `node scripts/check-monorepo-boundaries.mjs`, relevant app/package lint, `npx tsc --noEmit`, and `CI=true npm run test`; add focused regressions before fixing any discovered failures.

## 6. Build-graph findings shaping this strategy

- Fresh graph database found at `graph.db` dated 2026-06-05; `build-graph stats ./graph.db` reported 13,029 nodes, 19,614 edges, and 1,956 files.
- Placement symbols concentrate in `packages/knowledge-space-core/src/placement.ts`, `packages/knowledge-space-core/src/placement-engine.ts`, `apps/integrated-math-3/lib/placement/*`, and Convex placement handlers.
- `runPlacementTraversal` is exported from `packages/knowledge-space-core/src/placement-engine.ts` and has no graph-detected callers, so tests are the primary contract protection for engine behavior.
- `ProbeAdapter` and placement result types are exported from core; IM3-specific `createIm3ProbeAdapter` lives only in the IM3 app layer.
- `buildPlacementKnowledgeStateSeed`, `createIm3ProbeAdapter`, and `runNewStudentPlacementFlow` showed no graph-detected callers, reinforcing the need for direct seam tests around each exported function.
- Existing placement tests already include core engine, contract, IM3 flow, Convex placement, and schema coverage; remaining strategy focus is regression hardening and the known schema index-shape gap.
