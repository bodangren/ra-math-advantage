# Test Strategy — Next-Skill Planner Production Wiring

Tech Lead notes for the Implementer. Anchors: `spec.md`, `plan.md`. This is a **wiring** track — planner math is frozen (FR-3); no new planner unit tests. Effort is integration + call-path proof. Contract-first then per-task TDD.

## 1. Testing Pyramid by Phase

| Phase | Unit | Integration | Contract/Artifact | Live-proof gate |
|------|------|------|------|------|
| P1 Caller Discovery | – | – | call-path Red tests (source-scan + internal-API shape) | `vitest run planner-prod-wiring` (red) |
| P2 Backend Exposure | learnerState-assembly pure fn | convex query round-trip via mock-ctx (no `convex-test`) | `internal.*` registration + Zod parse `StudentVisualizationV1` | IM3 convex test filter |
| P3 Student Wiring | component render of recommendations | route fetches `internal.*` + renders non-empty `recommendedNext` | – | IM3 app test filter |
| P4 Closeout | – | – | spec-parity + boundary lint | root `tsc --noEmit` + workspace test gates |

Bias ~60% to P2 integration (the query is the load-bearing seam); P3 is thin once the query exists.

## 2. Shared Fixtures & Mocks

- Reuse `packages/knowledge-space-practice/src/__tests__/planner-fixtures.ts` (`makePlannerGraph`, `defaultPriorityWeights`) — do NOT fork.
- Reuse `projections.test.ts` synthetic node/edge fixtures for the query input shape.
- New `apps/integrated-math-3/__tests__/convex/_fixtures/student-viz-fixture.ts`: frozen `KnowledgeSpaceNode[]`/`Edge[]` pair sliced from `apps/integrated-math-3/curriculum/skill-graph/nodes.json` (4 nodes, 2 edges) so the query test does not couple to the full graph.
- **Mock-ctx harness**: follow `__tests__/convex/misconceptionState.test.ts` mock-ctx pattern (no `convex-test` dep) for the query handler. If the query must join live proficiency tables, scope ONE `convex-test` test (matches `edgeCalibration.test.ts`) — the closeout gate still requires the mock-ctx test to pass.
- **Fake `fetchInternalQuery`** for the P3 route test only — stub returns a frozen `StudentVisualizationV1`. Runner plumbing, not a production gate (see §7).

## 3. Cross-Phase Edge Cases & Dependencies

- **No persisted graph table.** IM3 schema has no `knowledge_space_nodes`/`edges`; nodes/edges are JSON at `curriculum/skill-graph/*.json`. P2 query loads these server-side; decide once, do not duplicate in P3.
- **Learner-state producer missing.** No `getKnowledgeState` wired in IM3 convex. P2 must derive `learnerState` from `student_competency`/`srs_cards`/`objective_policies` OR accept explicit input. Pin the derivation shape in P2 before P3 consumes it.
- **Empty / insufficient data.** FR-3 + plan P3: a student with no proficiency history yields `recommendedNext: []` (or ready/unknown defaults) — never fabricated. Explicit test.
- **Call-path non-test consumer.** P1 Red test must exclude `**/__tests__/**` and `*.test.ts`. A test-only importer does NOT satisfy FR-5.
- **Planner math frozen.** Any P2/P3 ordering assertion MUST match `getRecommendedNext` output (reuse `projections.test.ts:278` parity) — do not invent new priority expectations.
- **Repo-root `convex/` stays empty.** Query lands in `apps/integrated-math-3/convex/`.

## 4. Architecture Guardrails

- **One-way boundary.** `packages/knowledge-space-practice/` stays pure — no imports from `apps/` or `convex/_generated/`. The new convex query imports FROM the package, never the reverse.
- **No planner math changes.** FR-3: `planner/*` and `projectStudentVisualization` bodies are read-only. Shape inputs in the query, not the planner.
- **Internal API seam.** Expose via `internalQuery`/`query` in `apps/integrated-math-3/convex/` (extend `student.ts` or new `studentVisualization.ts`); wire through `lib/convex/server.ts` `internal` — matches `internal.student.getDashboardData` convention.
- **Student route only.** P3 lands in `app/student/dashboard/page.tsx` (or a new panel) — not teacher/parent (out of scope).
- **TS strict.** `npx tsc --noEmit` in IM3 after each phase (vinext build does not enforce types — per AGENTS.md).

## 5. Per-Phase Test Approach

- **P1.** Two Red tests in `apps/integrated-math-3/__tests__/planner-prod-wiring.test.ts`: (a) source-scan asserts ≥1 non-test file imports `projectStudentVisualization` or calls the new `internal.*` query; (b) `internal.student.getStudentVisualization` (or chosen name) is a defined function ref (non-throw). Both red at HEAD. (a) is artifact/source-contract; (b) is live API-shape.
- **P2.** Red→green `__tests__/convex/studentVisualization.test.ts`: query loads fixture nodes/edges + learnerState, calls `projectStudentVisualization`, returns `StudentVisualizationV1` that Zod-parses. Assert `recommendedNext` matches the planner's ranked output (parity with `projections.test.ts`). **Live behavior** via mock-ctx.
- **P3.** Red→green `__tests__/student/dashboard-planner.test.tsx`: route (or extracted component) renders ≥1 recommendation from a stubbed `StudentVisualizationV1`; empty-state variant renders a no-recommendations message without crashing. **Live behavior**.
- **P4.** No new tests; run gates + boundary lint.

## 6. Build-Graph Findings That Shaped Strategy

`build-graph stats` (fresh `graph.db`, 14,181 nodes / 20,644 edges, mtime 2.6h) + targeted queries:

- **`projectStudentVisualization` has ZERO callers** (`build-graph callers` → no matches) — confirms the audit finding. P1 Red anchor.
- **`getRecommendedNext` shows no graph callers** despite being imported by `visualization.ts:12` — the graph's call-edge capture has gaps. **Do not rely on `build-graph callers` alone for the production-caller check**; use a source-level import scan in the P1 test.
- **No planner/visualization/knowledge convex function exists** in IM3 (`build-graph query` on `package_id='convex'` → none match). Greenfield wiring.
- **Repo-root `convex/` is empty** (only `_generated/`); per-app `apps/integrated-math-3/convex/` is the real surface (77 functions). P2 lands here.
- **Student dashboard already uses `internal.student.getDashboardData`** (`app/student/dashboard/page.tsx:28`) via `fetchInternalQuery` — canonical P3 seam.
- **No `knowledge_space_*` table** in `apps/integrated-math-3/convex/schema.ts` (40 tables, none graph-shaped) — nodes/edges load from JSON (drives §3).

## 7. Live-Proof Plan (per phase)

| Phase | Red command (targeted, must fail before code) | Green / closeout gate (live) |
|------|------|------|
| P1 | `npx vitest run planner-prod-wiring --root apps/integrated-math-3` (both assertions red) | same filter green + `build-graph callers ./graph.db projectStudentVisualization` shows ≥1 caller post-impl |
| P2 | `npx vitest run studentVisualization --root apps/integrated-math-3` (module-resolution red) | same filter green + `npx tsc --noEmit` (IM3) |
| P3 | `npx vitest run dashboard-planner --root apps/integrated-math-3` (red) | same filter green + `npx vitest run projections --root packages/knowledge-space-practice` stays green (planner math untouched) |
| P4 | (no red) | `npm run --workspace=apps/integrated-math-3 lint && CI=true npm run --workspace=apps/integrated-math-3 test && npx tsc --noEmit` — **the production gate** |

### Artifact vs. live-behavior tests
- **Artifact/contract**: P1(a) source-scan (proves a non-test importer exists — a structure contract); P2 Zod-parse of `StudentVisualizationV1` (schema contract). Prove structure, not runtime.
- **Live behavior**: P1(b) internal-API ref check, P2 query round-trip, P3 component render, P4 root aggregate suite. Prove the chain executes.

### Fake harness boundary
- P3 `fetchInternalQuery` stub is **runner plumbing only**. Its covered production gate (`internal.student.getStudentVisualization` existing as a callable ref) has a **bounded non-fake smoke proof**: P1(b) imports `internal` from `@/convex/_generated/api` and asserts the ref is a function — a single synchronous import + typeof check scoped to the P1 file, cannot fall through into the full suite.
- If a `convex-test` harness is added in P2, it is bounded to one test file with a fixed fixture; the closeout gate still requires the mock-ctx (non-`convex-test`) test to pass, so the gate cannot be satisfied by the harness alone.

### Intentionally-red files owned by `[~]` tasks
- `__tests__/planner-prod-wiring.test.ts` (P1) is red at HEAD and discoverable by `npm run --workspace=apps/integrated-math-3 test`. **Exclusion policy: none — do not `test.skip`.** Per `workflow.md` §3 Red→Green, leave it red and keep its P1 task `[~]`; the P4 closeout gate MUST NOT run until P2/P3 green it.
- `__tests__/convex/studentVisualization.test.ts` (P2) and `__tests__/student/dashboard-planner.test.tsx` (P3) are authored red within their `[~]` tasks and turned green in the same task; not left red across sessions. If a session pauses mid-phase, scope the red file to the task in flight (do not author P3's file until P2 greens).
