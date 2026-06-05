# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`
>
> **Latest structural audit:** [`measure/reports/structural-audit_20260526.md`](./reports/structural-audit_20260526.md)

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Basic glob in `scripts/extract-skill-inventory.ts` | Low | Open | Simple wildcard glob; replace with `fast-glob` for robustness and `**` support. |
| PreCalc skill extraction incomplete | Medium | Open | PreCalc uses a different lesson format without explicit objective headings; needs dedicated adapter in T12 rollout. |
| IM1 missing seed_standards.ts (77 placeholder std nodes) | Medium | Open | IM1 has no competency standard definitions; 77 placeholder standard nodes created without descriptions. |
| IM2 standards gap (41 missing definitions) | Medium | Open | IM2 seed_standards.ts has 48 definitions but lesson-standards reference 91 unique codes. |
| IM3 M1 generator coverage (3/16 skills = 18.75%) | Medium | Open | Only 3 lesson-level skills have deterministic generators. Remaining 13 need implementation. |
| IM3 M1 concept-level blueprint coverage incomplete | Medium | Open | ALEKS concept nodes have independentPracticeReady and generators but no blueprints authored. |
| math-content package lint gate missing | Medium | Open | `npm run lint --workspace=packages/math-content` fails; no ESLint flat config. 23 pre-existing violations. |
| PreCalc standards alignment missing | Medium | Open | PreCalc was out of scope for T4 (standards alignment). 158 worked_example nodes have no aligned_to_standard edges. |
| SRS contract type drift (ISO string vs v.number()) | High | Open | Intentional adapter pattern: contract uses ISO string, Convex stores number. Schema alignment deferred. |
| Track 5 P1: `PlacementResult → getKnowledgeState` integration test deferred | Low | Open | Blocked on Track 1 `getKnowledgeState` definition. |
| Track 5 P1: `schema-placement.test.ts` indexes shape mismatch | Medium | Open | Test expects `Record<string, ReadonlyArray<string>>` but Convex `TableDefinition.indexes` is `Array<{ indexDescriptor, fields }>`. |
| Track 5 P3: returning-student guard vs upsert test conflict | Medium | Open | `seedPlacementResultsIntoStore` cannot satisfy both the "upsert semantics" test (expects 2nd call to overwrite) and the "returning-student guard" test (expects 2nd call to skip) without a `force` flag distinction. Implemented always-upsert; guard test skipped. Resolve by adding `force: false` option to the guard test or moving guard logic to Phase 4 caller. |
| Track 5 P4: Red-phase tests for production wiring (placement-flow + convex/placement) | Low | Open | Two new Red-phase test files added in `__tests__/lib/placement/placement-flow.test.ts` and `__tests__/convex/placement.test.ts`. Both fail with "Cannot find module" as expected (production modules do not exist yet). Guard logic lives in the orchestrator (per P3 resolution); the seed function remains always-upsert. Green-phase implementer creates `apps/integrated-math-3/lib/placement/placement-flow.ts` (exporting `runNewStudentPlacementFlow` + `PlacementFlowOutcome`) and `apps/integrated-math-3/convex/placement.ts` (exporting `seedPlacementResultsHandler`, `hasPlacementResultsHandler`, `getStudentPlacementResultsHandler`). |
