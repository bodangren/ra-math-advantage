# Test Strategy — Track 4: Next-Skill Planner

Tech Lead notes for the Implementer. Anchor docs: `spec.md`, `plan.md`.
Contract-first then per-task TDD; >80% line coverage on new modules.

## 1. Testing Pyramid by Phase

| Phase | Unit (vitest) | Integration | Contract / Schema | Live-proof gate |
|------|------|------|------|------|
| 1 Contract & Schema | weight-config Zod parse; `PlannerInput`/`Output`/`PriorityScore` type round-trips | none | weights schema + score field shape (no Convex tables — pure types) | `vitest run` in `knowledge-space-practice` |
| 2 Scoring Terms | pure-math unit tests for `unlockValue`, `goalProximity`, `weaknessFit` (incl. property tests on graph traversal) | none — keep core domain-neutral | – | targeted file filters per term |
| 3 Composite + Wire | `priority(B)` weighted-sum unit; `recommendedNext` top-N ordering test against multi-skill ready set | `buildStudentVisualizationV1` end-to-end on a fixture graph | visualization schema unaffected (`StudentVisualizationV1`) | targeted `visualization.test.ts` filter, then pkg suite |
| 4 Docs & Doctor | – | – | spec parity (kst-srs.v2 §7) + boundary lints | `npm run doctor`, root lint, `tsc --noEmit`, `CI=true npm test` |

Bias ~75% effort to **Phase 2 unit tests** (pure math + graph traversal — cheapest, highest leverage). Phase 3 carries the only integration test (visualization wiring); no e2e in this track.

## 2. Shared Fixtures & Mocks

- New file `packages/knowledge-space-practice/src/__tests__/planner-fixtures.ts`:
  - `makePlannerGraph({ depth, branching, goalIds })` — builds reproducible `KnowledgeSpace` with `prerequisite_for` chains for unlockValue/goalProximity tests.
  - `makeReadyNodes(n, { readinessByNode })` — feeds Track 2's readiness scores into planner input without coupling to its internals.
  - `makeMisconceptionLinks([{ skillId, severity }])` — for `weaknessFit` boost tests; **stub** when Track 6 not integrated (returns 0 boost).
  - `defaultPriorityWeights` — `{ a:1, b:1, c:1, d:1 }` baseline; per-test override helper.
- Reuse `packages/knowledge-space-core/src/placement-fixtures.ts` `prereqEdge(sourceId, targetId)` — do **not** fork.
- Reuse `KnowledgeSpaceNode` / `KnowledgeSpaceEdge` from `packages/knowledge-space-core/src/types.ts`.
- Visualization tests extend `packages/knowledge-space-practice/src/__tests__/projections.test.ts` patterns; reuse its node fixtures rather than duplicate.
- **No Convex** in this track — planner is pure. Do not add `convex-test` or `makeMockCtx` here.

## 3. Cross-Phase Edge Cases & Dependencies

- **Track 2 dependency.** Planner consumes `readiness(B) ∈ [0,1]` from Track 2. Pin a `ReadinessByNode` fixture shape in Phase 1 so Phase 2/3 do not silently couple to weighted-readiness internals. If Track 2 not merged, accept readiness as plain input — do not reach into its module.
- **Track 6 stub boundary.** `weaknessFit` returns 0 if no misconception links provided. Explicit test: same priority output with vs. without an empty link list.
- **Empty / single-node graph.** `unlockValue` of a leaf node = 0; `goalProximity` with no goal set = 0; ranker must still return a valid (possibly empty) top-N without throwing.
- **Cycle safety.** `unlockValue` traversal of `prerequisite_for` must terminate on a cyclic graph (defense-in-depth — Track 1 forbids cycles via `getPrerequisiteCycles`, but planner must not assume it). Property test with a seeded cyclic fixture.
- **Precomputation invariant (FR/NFR).** `unlockValue` precomputed once per graph: assert (a) results identical to a per-node recomputation oracle, (b) call count ≤ 1 per top-level invocation (spy/counter test).
- **Determinism.** Two identical inputs → identical ranking, including stable tie-break (extend existing `nodeId.localeCompare` ordering used in `visualization.ts:168`). Property test on shuffled input.
- **Weight tunability.** `priority` with `b=0` must collapse to readiness-only ordering (regression-equivalent to pre-track behavior up to tie-breaks); covers AC2 + a non-trivial sanity check.
- **Top-N truncation.** N=5 default preserves prior behavior; ranker must include `unknown` nodes only after `ready` (matches current `[...ready, ...unknown].slice(0, 5)` semantics) — explicit ordering test.
- **Graph never written.** Negative test: no planner codepath imports from `apps/`, `convex/_generated/`, or any persistence layer.

## 4. Architecture Guardrails

- **Boundary.** All planner logic lives in `packages/knowledge-space-practice/src/planner/` (alongside existing `injection.ts`). **Must not** import from `apps/`, `convex/_generated/`, or any persistence layer. Mirrors `injection.ts`'s pure-function discipline.
- **Pure / deterministic.** No `Date.now()`, no RNG, no I/O. All inputs explicit; all outputs derivable from inputs.
- **Domain-neutral types.** Types live in `packages/knowledge-space-practice/src/planner/types.ts` (or extend existing `projections/types.ts`); no IM3/BM2 imports.
- **Visualization additivity.** `recommendedNext` field shape (`VisualNodeV1[]`) is **unchanged** — only the *content/ordering* changes. `studentVisualizationV1Schema` (`projections/schemas.ts:29`) stays stable. Verify by keeping `projections.test.ts` green.
- **Practice contract unaffected.** No `practice.v1` changes; no activity component changes.
- **TS strict.** `npx tsc --noEmit` after each phase (vinext build does not enforce types — per AGENTS.md).

## 5. Per-Phase Test Approach

- **P1.** Author types + weight-config in `planner/types.ts`; write `planner-contract.test.ts` asserting (a) Zod parse of `priorityWeights` rejects negatives/NaN, (b) `PriorityScore` discriminated-union exhaustiveness via TS switch (compiler enforces). Document tests assert the *artifact*, not runtime.
- **P2.** Red-first per term, **one test file per source file**:
  1. `unlock-value.test.ts` — leaf=0; chain depth-N=N-1; cycle terminates; precompute idempotent.
  2. `goal-proximity.test.ts` — no goal=0; same-node=1; unreachable=0; inverse-distance monotonic.
  3. `weakness-fit.test.ts` — empty links=0; severity scaling; Track-6 stub flag.
  Live behavior; pure functions only.
- **P3.** `priority.test.ts` — weighted-sum table over `(a,b,c,d)` settings + tie-break stability. `recommended-next.test.ts` — top-N over a multi-skill ready set including `unknown` ordering. Extend `projections.test.ts` with one ranked-output assertion (integration). Live behavior.
- **P4.** No new test files; confirm spec text matches implementation (artifact-level), then run full live suite.

## 6. Build-Graph Findings That Shaped Strategy

Ran `build-graph stats` (fresh `graph.db`, 14,059 nodes / 20,533 edges, mtime today) and targeted searches:

- **`recommendedNext` is a single field** at `packages/knowledge-space-practice/src/projections/visualization.ts:162` (`field:studentVisualizationV1Schema.recommendedNext`). Slice-of-five placeholder lives at L162; planner replaces this expression. **Low blast radius** — one file, one expression, one test in `projections.test.ts:148`.
- **No prior planner symbols.** `build-graph search` for `unlockValue`, `goalProximity`, `weaknessFit` → 0 results. Greenfield naming inside `packages/knowledge-space-practice/src/planner/` (already exists for `injection.ts`).
- **`prerequisite_for` traversal pattern already exists** in `packages/knowledge-space-core/src/placement-engine.ts:buildAdjacency` and `validation.ts:getPrerequisiteCycles`. Reuse `buildAdjacency` for `unlockValue` BFS rather than re-implement; ensures consistent edge-direction semantics.
- **`KnowledgeSpaceNode`/`Edge` types** in `knowledge-space-core/src/types.ts` are the canonical input shape — planner consumes, never mutates. No graph writes anywhere in this track.
- **`StudentVisualizationV1Schema`** (`projections/schemas.ts`) — only `recommendedNext`'s *content* changes; schema untouched. Confirms additive risk profile.
- **No Convex coupling.** `build-graph callers` on visualization.ts shows pure consumption from projection callers; no Convex handler lives in this dependency arm. Track stays in `packages/`, no app/convex changes required (except spec doc edits in P4).
- **Track 6 surface (`weaknessFit`)** — `runRealT6Loop` from `@math-platform/knowledge-space-practice/misconception-loop` is the integration point if/when Track 6 lands. Until then, accept misconception links as a plain input parameter; do not import T6 directly (avoids circular pkg coupling within `knowledge-space-practice`).

## 7. Live-Proof Plan (per phase)

| Phase | Red command (targeted, must fail before code) | Green / closeout gate (live) |
|------|------|------|
| P1 | `npx vitest run planner-contract --root packages/knowledge-space-practice` | `npm test --workspace=packages/knowledge-space-practice` + `npx tsc --noEmit` (workspace) |
| P2 | `npx vitest run unlock-value --root packages/knowledge-space-practice` then `goal-proximity`, then `weakness-fit` (each red before its impl) | `npm test --workspace=packages/knowledge-space-practice` (full pkg suite) |
| P3 | `npx vitest run priority --root packages/knowledge-space-practice` **and** `npx vitest run recommended-next --root packages/knowledge-space-practice` (must fail against current slice-of-5) | pkg suite + `npx vitest run projections --root packages/knowledge-space-practice` (visualization wiring stays green with new ordering) |
| P4 | `npm run doctor` (expect lint failure if spec text not updated for §7) | `npm run lint && CI=true npm test && npx tsc --noEmit` at repo root — **the production gate** |

### Artifact tests vs. live-behavior tests

- **Artifact / contract**: P1 weight-config schema parse + P4 kst-srs.v2 spec-parity. Prove the *document/type* matches intent — not runtime behavior.
- **Live behavior**: P2 per-term math, P3 composite ordering + visualization wiring, P4 root aggregate suite (`CI=true npm test`).

### Fake harness boundary

This track introduces **no fake harnesses**. The `weaknessFit` Track-6 stub is a plain function-input default (zero boost when no links provided), not a fake module — it cannot fall through to a real T6 import because T6 is not imported at all. The bounded non-fake proof is the `weakness-fit.test.ts` assertion `weaknessFit({ links: [] }) === 0` plus a boundary-lint check that `planner/` does not import `misconception-loop`. If a future iteration wires real T6, add a smoke test mirroring `misconception-loop.smoke.test.ts` (bounded import + arity + non-throw) before any aggregate gate consumes it.

## 8. Intentionally-Red Files Owned by `[~]` Tasks

This track introduces **no intentionally-red aggregate-discoverable files**. Each P2/P3 test file is authored red and turned green within the same `[~]` task (per `workflow.md` §3 Red→Green). Do **not** add `test.skip` or vitest excludes; if a task pauses, leave the test red and keep its task `[~]` so reviewers see the live signal.

If the Implementer needs to land Phase 2 across multiple sessions, scope the red file to the task in flight only (e.g., do not author `goal-proximity.test.ts` until starting that task). Aggregate suites must stay green between tasks.
