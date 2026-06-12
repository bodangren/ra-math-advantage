# Track 8 — Lesser Holes: Test Strategy

Scope: three v2 items + FSRS doc — `transfers_to` edge, Level Projection, `progressTrend` time-delta, FSRS per-card doc + `siblingReinforcement` flag. Contract-first, then TDD, >80% coverage on new modules. Independent of T2–T7; runs last.

## 1. Pyramid per Phase

| Phase | Unit | Contract/Schema | Integration | Artifact/Doc |
|------|------|-----------------|-------------|--------------|
| P1 Contract & Schema | type/zod parsers, endpoint-rule lookup | **majority** — Zod accept/reject + `EdgeType` union exhaustiveness + endpoint-pairing rule | `validateKnowledgeSpace` end-to-end with mixed graph | — |
| P2 Level Projection | monotonicity, boundary, CSV-derived instance | function signature contract; presentation-only purity | adapter wiring (IM3 instance importable from app) | — |
| P3 progressTrend Fix | window math, `unknown` threshold, parent viz | parent viz Zod still passes | `projectParentVisualization` history-input integration | snapshot of trend across 3 inputs |
| P4 Docs & Doctor | — | — | `npm run lint`, `tsc --noEmit`, `CI=true npm run test`, `bash measure/scripts/doctor.sh` | **majority** — spec §3.2/§9.4/§12.9/§16 markers exist; boundary linter clean |

## 2. Shared Fixtures / Mocks

- Reuse `packages/knowledge-space-core/src/fixtures.ts` for a minimal cross-domain graph; extend with two new domain seed nodes plus one `transfers_to` edge (kept in fixtures, not test-local, so contract + integration share it).
- New `progressTrendFixtures.ts` (test-only, colocated under `__tests__/`) exposing three timestamped mastery snapshots (improving / flat / insufficient-history).
- Level projection fixture: small in-line knowledge-state object (no real CSV I/O in unit tests); IM3 CSV-derived instance lives in `apps/integrated-math-3/lib/.../level-projection.ts` with its own dedicated unit test reading the CSV table-driven (do not mock filesystem — read the actual checked-in mapping).
- No mocking of `srs-engine`, `zod`, or `validateKnowledgeSpace`; these are pure and cheap.

## 3. Cross-Phase Edge Cases & Dependencies

- **P1 ↔ P2:** Level Projection must reject `equivalent_to` and `transfers_to` as KST/SRS inputs (presentation-only). One negative test in P2 asserts the projection takes only knowledge-state, not edges.
- **P1 endpoint pairing:** `transfers_to` must be distinct from `equivalent_to` — assert both rule presence and that cross-domain endpoints are required (sourceKinds / targetKinds chosen per spec; pairing rule rejects same-domain pair).
- **P3 boundary:** `unknown` produced when history window has fewer than N samples, OR `totalSkillNodes === 0` (existing branch must still pass).
- **P4 doctor:** generated docs (`measure/generated/architecture.json`, `routes.md`) must be regenerated after P1 type changes — failure to run `generate.sh` causes `doctor.sh` to exit 1; treat as P4 Red gate.
- **FSRS doc-only (FR4):** no runtime change; do **not** add a behavioral test for `siblingReinforcement` — only a doc-contract test that the flag name appears in the spec section.

## 4. Architecture Guardrails

- `packages/knowledge-space-core` stays domain-neutral — IM3 level projection lives under `apps/integrated-math-3/`, never imported by `packages/*`.
- No new dependency on `srs-engine` from `knowledge-space-practice` for progressTrend (time-delta is pure on a history array passed in).
- Apps must not import `convex/_generated/*` (existing boundary rule); new code must not deep-import package internals — re-export from each package `index.ts`.
- `boundary.test.ts` in `knowledge-space-core` already enforces forbidden imports; do not weaken its allow-list to accommodate this track.

## 5. Per-Phase Test Approach (notes)

- **P1:** Add `edge-type-transfers-to.test.ts` (union exhaustiveness via TS `assertNever`, zod parse fail on unknown discriminator, endpoint-pairing positive+negative). Update `contract.test.ts` to include `transfers_to` in the enumerated edge types. Verify existing tests still green after enum extension (additive change → blast radius low; only zod consumers must round-trip).
- **P2:** New `level-projection.test.ts` in `knowledge-space-core` for contract + monotonicity property (sorted state vector ⇒ sorted level vector). IM3 instance test in `apps/integrated-math-3/__tests__/level-projection.test.ts` reads the IM3 CSV and asserts the known anchor points.
- **P3:** New `progress-trend.test.ts` adjacent to `visualization.ts` — drive `projectParentVisualization` with synthetic history; assert `improving`/`stable`/`declining`/`unknown`. Delete or replace the existing static-ratio assertion in `projections.test.ts` rather than leaving a stale test (avoid intentionally-red files).
- **P4:** Doc-contract test (`spec-markers.test.ts`) that greps the in-repo `kst-srs.v2/SPECIFICATION.md` for §3.2 / §9.4 / §12.9 / §16 markers + `siblingReinforcement` token — this is an artifact test, not behavior. Doctor + lint are CLI gates, not vitest tests.

## 6. Build-Graph Findings That Shaped This Strategy

- `build-graph callers ./graph.db EdgeType` → 0 callers indexed; the union is consumed only via the colocated zod enum in `schemas.ts` (`contains` edge). Adding `transfers_to` is **additive**, blast radius low — covered by existing `contract.test.ts` plus one new test.
- `build-graph search ./graph.db "progressTrend"` → 1 field on `parentVisualizationV1Schema`, 1 producer (`projections/visualization.ts:239–244`), 0 unrelated consumers. Safe to rework the producer without ripple; assert via `projectParentVisualization` not via internal helper.
- `build-graph inspect ./graph.db EdgeType` confirms it lives at `packages/knowledge-space-core/src/types.ts:16–27` — single source of truth; no duplicate type in `apps/`.
- No nodes named `LevelProjection` / `levelProjection` exist — greenfield; choose names per Naming styleguide (`projectDisplayLevel`, `LevelProjectionFn`).
- No `*.test.ts` files currently use `it.skip`/`it.todo` in `knowledge-space-core`/`knowledge-space-practice` — **no pre-existing intentionally-red files** will be picked up by aggregate suites. If any phase adds a `[~]` task with a not-yet-passing test, that test MUST be `it.todo` (vitest reports as pending, never as failure) and the `[~]` task in `plan.md` must own it.

## 7. Live-Proof Plan (per-phase Red + Green gates)

Red = the exact failing test command BEFORE writing impl. Green = the exact passing command at task close. Aggregate suites are listed only at phase boundaries.

| Phase | Red (targeted) | Green/Closeout |
|------|---------------|----------------|
| P1 | `npx vitest run packages/knowledge-space-core/src/__tests__/edge-type-transfers-to.test.ts` | `npm run test --workspace=packages/knowledge-space-core` + `npx tsc --noEmit -p packages/knowledge-space-core` |
| P2 (core) | `npx vitest run packages/knowledge-space-core/src/__tests__/level-projection.test.ts` | `npm run test --workspace=packages/knowledge-space-core` |
| P2 (IM3 instance) | `npx vitest run -t "IM3 level projection" --root apps/integrated-math-3` | `npm run ws:im3:test` + `npm run ws:im3:typecheck` |
| P3 | `npx vitest run packages/knowledge-space-practice/src/__tests__/progress-trend.test.ts` | `npm run test --workspace=packages/knowledge-space-practice` |
| P4 (doc contract) | `npx vitest run packages/knowledge-space-core/src/__tests__/spec-markers.test.ts` (live grep of `kst-srs.v2/SPECIFICATION.md` — fails until §3.2/§9.4/§12.9/§16 markers + `siblingReinforcement` exist) | `npm run generate && npm run doctor && npm run lint && npx tsc --noEmit && CI=true npm run test` |

### Live-behavior vs artifact tests

- **Live behavior:** P1 zod parse/endpoint-pairing, P2 monotonicity + IM3 anchor points, P3 trend math against `projectParentVisualization`. All run real production code paths.
- **Artifact/doc contract:** P4 `spec-markers.test.ts` (greps a checked-in markdown file) and any P2 test reading the IM3 CSV. These are doc/data contract tests — they prove the artifact exists and is well-formed, NOT that downstream behavior consumes it. Each is explicitly named `*-contract.test.ts` or carries a top-of-file comment `// artifact contract — not a behavioral test`.
- **Fake harnesses:** none required. If P4 introduces a wrapper around `doctor.sh` for vitest reporting, the wrapper must shell out to the real script (bounded by 30 s timeout) — no stubbed exit code. The phase-closeout command in the table above invokes the real `npm run doctor`, which cannot be satisfied by a fake harness.

### Aggregate-suite safety

- The closing phase command for each phase runs the real workspace `test` script. No `it.skip` / `it.todo` should remain when a task is marked `[x]`. Any `it.todo` introduced mid-phase must be owned by a still-`[~]` task in `plan.md` and referenced by `// owner: Phase N Task M` so reviewers can grep it.

MEASURE_AGENT_RESULT
role: strategy
status: complete
track: kst-lesser-holes_20260521
phase: track setup
commits: none
tests_run: build-graph stats ./graph.db (pass: 13879 nodes, 20482 edges, fresh ~7 min); build-graph inspect EdgeType (pass: 0 outgoing, 1 incoming); build-graph search transfers_to (pass: 0 results — greenfield); build-graph search progressTrend (pass: 1 producer + 1 schema field); build-graph callers EdgeType (pass: 0 — additive change safe)
files_changed: measure/tracks/kst-lesser-holes_20260521/test-strategy.md (new)
plan_updates: none — strategy is advisory; plan.md unchanged
known_failures: none
handoff: Implementer should follow §7 per-phase Red commands BEFORE writing code. P4 `spec-markers.test.ts` doubles as the FR4 acceptance criterion (FSRS doc + siblingReinforcement flag). IM3 level-projection CSV is not yet checked in under apps/integrated-math-3 — P2 IM3 task must add it (Phase 2 dependency on a real CSV file at apps/integrated-math-3/lib/level-projection/gse-to-im3-advantage.csv). No pre-existing intentionally-red tests; aggregate `CI=true npm run test` is safe to run at any time.
END_MEASURE_AGENT_RESULT
