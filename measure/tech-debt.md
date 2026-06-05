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
| Track 5 P3: returning-student guard vs upsert test conflict | Medium | Resolved | Guard logic implemented in Phase 4 caller `runNewStudentPlacementFlow`; `seedPlacementResultsIntoStore` remains always-upsert. |
| Track 5 P5: plan §11 vs spec §8 for placement documentation | Low | Open | Plan says "Update in-repo kst-srs.v2 spec §11 (Placement)" but `kst-srs.v2/SPECIFICATION.md` §11 is "Lesser Holes (v2 Item 8)" and §8 is "Adaptive Placement (v2 Item 5)". Phase 5 test asserts the placement contract is documented in §8 (where it lives) with the full implemented contract. Green-phase author may keep §8 or relocate Placement into §11 — both are acceptable; test is section-flexible. |
| Track 5 P5: `measure/generate.sh` and `measure/doctor.sh` do not exist | Medium | Open | Plan refers to `measure/generate.sh` and `measure/doctor.sh` but neither file is present. The Doctor workflow runs `npm run generate` / `npm run doctor` instead (see `measure/references/doctor.md`). Phase 5 test substitutes the existing `scripts/check-monorepo-boundaries.mjs` linter and the per-package `npm run lint` / `tsc --noEmit` for doctor verification. |
| Track 5 P5: `schema-placement.test.ts` indexes shape mismatch | Medium | Open | Pre-existing Phase 1 test expects `Record<string, ReadonlyArray<string>>` but Convex `TableDefinition.indexes` is `Array<{ indexDescriptor, fields }>`. Surfaces in Phase 5 final verification when `tsc --noEmit` is rerun. |
