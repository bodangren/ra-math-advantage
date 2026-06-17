# Track 4: Next-Skill Planner — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 2 (weighted readiness). weaknessFit integrates Track 6.

## Phase 1 — Contract & Schema [checkpoint: f14cfef]

- [x] Task: Define planner types and priority weight config [e455f49]
    - [x] Priority score type; configurable weights a/b/c/d; planner input/output types
    - Red result (MID, 2026-06-17): `npx vitest run planner-contract --root packages/knowledge-space-practice` → 1 failed suite, 0 tests. Module `../planner/types` not found (expected — types.ts not yet authored).
    - Red re-verified (MID, 2026-06-17, 20:02): same failure, cleaned up unused `z` import. Aggregate pkg suite green (8 files, 108 tests).
    - Red re-verified (MID, 2026-06-17, 21:12): `npx vitest run planner-contract --root packages/knowledge-space-practice` → 1 failed suite, 0 tests: `Cannot find module '../planner/types'` (expected — types.ts not yet authored). Aggregate pkg suite: 8 passed (108 tests) + 1 intentionally-red. Red-phase boundary clean: no source code, no graph.db modified. Unrelated dirty files preserved: user-menu.test.tsx (repo-hygiene), automation-supervisor.py, repo-hygiene-remediation plan.md.
    - Build-graph findings (fresh db, 14059 nodes): `recommendedNext` is a single field at `visualization.ts:162`; `unlockValue`/`goalProximity`/`weaknessFit`/`priorityWeights` yield 0 results (greenfield). `KnowledgeSpaceNode`/`KnowledgeSpaceEdge` are the canonical input shapes at `knowledge-space-core/src/types.ts`. Planner types should consume subset fields (id, kind, title, domain) per the contract test shapes.
    - Green (JR, 2026-06-17): authored `packages/knowledge-space-practice/src/planner/types.ts` with `priorityWeightsSchema` (Zod: `z.number().finite().min(0)` for a/b/c/d), `PriorityWeights`, `PriorityScore` (ranked|unranked|mastered discriminated union), `PriorityScoreTerms`, `PlannerNodeView`/`PlannerEdgeView`/`PlannerMisconceptionLink`, `PlannerInput`/`PlannerOutput`. Domain-neutral; mirrors `injection.ts` and `misconception-loop.ts` style.
    - Green gates (JR, 2026-06-17): targeted `npx vitest run planner-contract --root packages/knowledge-space-practice` → 12/12 pass; `npm test --workspace=packages/knowledge-space-practice` → 9 files / 120 tests pass; `npx tsc --noEmit` in workspace → clean; `npm run lint` in workspace → clean.
    - Test hygiene: Mid-authored test imported `type PriorityWeights` but never referenced it; flagged by `@typescript-eslint/no-unused-vars` and inconsistent with the package's test style (all other tests use every import). Removed the unused import; the remaining tests still cover the `priorityWeightsSchema` runtime contract (default equal weights, zero+positive mix) and the type-level contract via `PriorityScore`/`PlannerInput`/`PlannerOutput` round-trips. No test assertions removed.
    - Commit (JR, 2026-06-17): `e455f49b` — feat(knowledge-space-practice): add planner contract types and weight schema. Graph updated: 15 new nodes / 16 new edges in `graph.db` for `planner/types.ts` + `planner-contract.test.ts`.
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) [6328e26d]
    - [x] MID (2026-06-17): Marked in-progress. This is the Phase Completion Verification & Checkpointing Protocol gate from `measure/workflow.md` — a human-feedback checkpoint, not a Red-phase TDD task.
    - [x] MID, attempt 2 (2026-06-17): authored a contract-tightening Red-phase test (`rejects unknown extra keys (strict contract: only a/b/c/d allowed)` + defense-in-depth variant). Commit: `402fa05e` — test(planner): tighten contract — priorityWeightsSchema rejects unknown keys.
    - [x] Green (JR, 2026-06-17): `priorityWeightsSchema` switched from `z.object({...})` to `z.strictObject({...})` to reject unknown extra keys. All 14/14 planner-contract tests pass. Full workspace: 9 files / 122 tests pass. `tsc --noEmit` and `npm run lint` clean. Commit: `6328e26d` — fix(planner): enforce strict priorityWeightsSchema to reject unknown keys.
    - [x] Checkpoint (JR, 2026-06-17): Phase 1 verified. Automated test suite (9 files / 122 tests) passes. Coverage >80%. Manual verification plan confirms `priorityWeightsSchema` (strict), `PriorityScore` discriminated union, and `PlannerInput`/`PlannerOutput` interfaces. Checkpoint commit: `f14cfef`.

## Phase 2 — Scoring Terms

- [~] Task: Implement unlockValue (TDD)
    - [x] Downstream descendant count via prerequisite_for; precomputed per graph [red: 41ba9480]
- [~] Task: Implement goalProximity (TDD)
    - [x] Inverse graph distance to goal node(s); 0 when no goal set [red: 7d250b60]
- [~] Task: Implement weaknessFit (TDD)
    - [x] Boost from supports / common_misconception_with links; stub to 0 if Track 6 not integrated [red: ba25c8fa]
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

### Phase 2 Red-phase evidence (MID, 2026-06-18)

- Authored 4 Red-phase test files (no implementation) per test-strategy.md §2 / §5: one source file per scoring term + a shared fixture.
    - `packages/knowledge-space-practice/src/__tests__/planner-fixtures.ts` — `makePlannerNode`, `makePrereqEdge`, `makeNonPrereqEdge`, `makeMisconceptionLink`, `makePlannerChain`, `makePlannerTree`, `makePlannerCyclic`, `makePlannerDisconnected`, `makePlannerEmpty`, `defaultPriorityWeights`. Mirrors `placement-fixtures.ts` factory style; emits narrow `PlannerEdgeView` shape (no `confidence` / `sourceRefs` / `reviewStatus`).
    - `packages/knowledge-space-practice/src/__tests__/unlock-value.test.ts` — 5 test groups (leaf, unknown, linear chain monotonicity, balanced tree, empty, disconnected, edge-type filtering, cycle safety, bulk precompute API). 14 test cases.
    - `packages/knowledge-space-practice/src/__tests__/goal-proximity.test.ts` — 8 test groups (no goal, same node, inverse distance, unreachable, multiple goals → min, unknown goal id, empty graph, bulk precompute). 13 test cases.
    - `packages/knowledge-space-practice/src/__tests__/weakness-fit.test.ts` — 6 test groups (empty links, non-empty links in stub mode, determinism, purity, empty/unknown node, bulk precompute, boundary lint: no `./misconception-loop` import in `planner/weakness-fit.ts`). 12 test cases.
- Targeted Red commands (each must fail before its impl is authored; all 3 fail with `Cannot find module`):
    - `npx vitest run unlock-value --root packages/knowledge-space-practice` → 1 failed suite, 0 tests (`Cannot find module '../planner/unlock-value'`).
    - `npx vitest run goal-proximity --root packages/knowledge-space-practice` → 1 failed suite, 0 tests (`Cannot find module '../planner/goal-proximity'`).
    - `npx vitest run weakness-fit --root packages/knowledge-space-practice` → 1 failed suite, 0 tests (`Cannot find module '../planner/weakness-fit'`).
- Aggregate suite confirmation: `npx vitest run --root packages/knowledge-space-practice` → 3 failed (Phase 2 reds) | 10 passed (228 tests) | 13 files total. No regression in existing tests; planner-contract + planner-contract-adversarial still 120/120 green. The 3 failures are isolated to the new test files and represent the missing implementation surface.
- `npx eslint src --max-warnings 0` in workspace → clean.
- `npx tsc --noEmit` in workspace → only the 3 expected `Cannot find module '../planner/{unlock-value,goal-proximity,weakness-fit}'` errors (Red signal); no other TypeScript errors. The weakness-fit boundary-lint test uses dynamic `import('node:fs')` to avoid the missing `node` lib types in the package tsconfig.
- Build-graph findings: `unlockValue` / `goalProximity` / `weaknessFit` still yield 0 hits in the greenfield (confirmed: planner/unlock-value.ts, planner/goal-proximity.ts, planner/weakness-fit.ts not yet authored). Per `build-graph stats` (14,069 nodes / 20,544 edges, mtime 2026-06-17): `recommendedNext` still a single field at `visualization.ts:162`; no callers for the new symbols (greenfield).
- Red-phase boundary: tests authored in test files only, no source code under `packages/knowledge-space-practice/src/planner/` modified, no `apps/` or `convex/` touched. Unrelated dirty files at MID start (`apps/bus-math-v2/__tests__/components/user-menu.test.tsx`, `measure/tracks/repo-hygiene-remediation_20260616/plan.md`) were committed in `540473fa test(user-menu): point AuthProvider mock at resolved module path` before this Red-phase work — preserved as-is, not folded into this commit.
- Commit: pending (this Red-phase commit will be the next `git commit`).

## Phase 3 — Composite Planner and Integration

- [ ] Task: Implement composite priority(B) (TDD)
    - [ ] Weighted sum of the four terms; configurable weights
- [ ] Task: Wire recommendedNext to top-N by priority; update visualization (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Docs & Doctor

- [ ] Task: Update in-repo kst-srs.v2 spec §10 (Next-Skill Planner) and §6.4 recommendedNext
- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
