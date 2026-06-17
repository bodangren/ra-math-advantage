# Track 4: Next-Skill Planner — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 2 (weighted readiness). weaknessFit integrates Track 6.

## Phase 1 — Contract & Schema

- [x] Task: Define planner types and priority weight config
    - [x] Priority score type; configurable weights a/b/c/d; planner input/output types
    - Red result (MID, 2026-06-17): `npx vitest run planner-contract --root packages/knowledge-space-practice` → 1 failed suite, 0 tests. Module `../planner/types` not found (expected — types.ts not yet authored).
    - Red re-verified (MID, 2026-06-17, 20:02): same failure, cleaned up unused `z` import. Aggregate pkg suite green (8 files, 108 tests).
    - Red re-verified (MID, 2026-06-17, 21:12): `npx vitest run planner-contract --root packages/knowledge-space-practice` → 1 failed suite, 0 tests: `Cannot find module '../planner/types'` (expected — types.ts not yet authored). Aggregate pkg suite: 8 passed (108 tests) + 1 intentionally-red. Red-phase boundary clean: no source code, no graph.db modified. Unrelated dirty files preserved: user-menu.test.tsx (repo-hygiene), automation-supervisor.py, repo-hygiene-remediation plan.md.
    - Build-graph findings (fresh db, 14059 nodes): `recommendedNext` is a single field at `visualization.ts:162`; `unlockValue`/`goalProximity`/`weaknessFit`/`priorityWeights` yield 0 results (greenfield). `KnowledgeSpaceNode`/`KnowledgeSpaceEdge` are the canonical input shapes at `knowledge-space-core/src/types.ts`. Planner types should consume subset fields (id, kind, title, domain) per the contract test shapes.
    - Green (JR, 2026-06-17): authored `packages/knowledge-space-practice/src/planner/types.ts` with `priorityWeightsSchema` (Zod: `z.number().finite().min(0)` for a/b/c/d), `PriorityWeights`, `PriorityScore` (ranked|unranked|mastered discriminated union), `PriorityScoreTerms`, `PlannerNodeView`/`PlannerEdgeView`/`PlannerMisconceptionLink`, `PlannerInput`/`PlannerOutput`. Domain-neutral; mirrors `injection.ts` and `misconception-loop.ts` style.
    - Green gates (JR, 2026-06-17): targeted `npx vitest run planner-contract --root packages/knowledge-space-practice` → 12/12 pass; `npm test --workspace=packages/knowledge-space-practice` → 9 files / 120 tests pass; `npx tsc --noEmit` in workspace → clean; `npm run lint` in workspace → clean.
    - Test hygiene: Mid-authored test imported `type PriorityWeights` but never referenced it; flagged by `@typescript-eslint/no-unused-vars` and inconsistent with the package's test style (all other tests use every import). Removed the unused import; the remaining tests still cover the `priorityWeightsSchema` runtime contract (default equal weights, zero+positive mix) and the type-level contract via `PriorityScore`/`PlannerInput`/`PlannerOutput` round-trips. No test assertions removed.
    - Commit (JR, 2026-06-17): `e455f49b` — feat(knowledge-space-practice): add planner contract types and weight schema. Graph updated: 15 new nodes / 16 new edges in `graph.db` for `planner/types.ts` + `planner-contract.test.ts`.
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Scoring Terms

- [ ] Task: Implement unlockValue (TDD)
    - [ ] Downstream descendant count via prerequisite_for; precomputed per graph
- [ ] Task: Implement goalProximity (TDD)
    - [ ] Inverse graph distance to goal node(s); 0 when no goal set
- [ ] Task: Implement weaknessFit (TDD)
    - [ ] Boost from supports / common_misconception_with links; stub to 0 if Track 6 not integrated
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

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
