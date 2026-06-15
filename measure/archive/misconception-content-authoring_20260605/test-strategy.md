# Test Strategy — Misconception Content Authoring

> Track: `misconception-content-authoring_20260605`
> Depends on: `misconception-loop_20260521` (T6 mechanism — all tasks still `[ ]`)

## Build-Graph Findings

| Finding | Implication |
|---|---|
| `misconception-taxonomy.ts` exists only in bus-math-v2 (8 accounting tags) | IM3 needs its own math-focused taxonomy; reuse the `MisconceptionTagDefinition` interface shape but not the tags |
| `misconceptionClusterSchema` in `knowledge-space-practice/projections/schemas.ts` has `label` + `relatedNodeIds` | Schema exists; content-authoring tests must produce valid clusters for it |
| `knowledgeBlueprintSchema.misconceptionTags` is `z.array(z.string()).optional()` | Blueprints already accept tags; tests must verify authored tags round-trip through blueprint validation |
| `genericEvidencePartSchema.misconceptionTags` in `knowledge-space-practice` | Evidence pipeline already carries tags; loop-wiring tests can inject tags here |
| `generateDistractors` in `packages/math-content/src/algebraic/distractors.ts` has 7 type-specific generators | Detection-mapping tests must link misconception tags to specific distractor types (factoring, linear, quadratic_formula, etc.) |
| `error-analysis.test.ts` tests `aggregateMisconceptionTags` | Existing test harness for tag aggregation; new taxonomy tests should integrate here |
| `srs-rating.test.ts` tests `computeBaseRating` | Loop-wiring tests must verify that authored misconceptions trigger the rating-cap path |
| No `remediated_by` edge type exists yet (misconception-loop track is `[ ]`) | Phase 3 loop-wiring tests must mock/fake the T6 mechanism until the dependency track ships |
| `distractors.test.ts` in IM3 tests `generateDistractors` re-export | Detection-mapping tests can extend this file or create a sibling `misconception-mapping.test.ts` |

## Testing Pyramid

```
        ┌──────────┐
        │ E2E (0)  │  No browser tests in this track — all content + wiring is unit/integration
        ├──────────┤
        │ Integ.   │  Phase 3: loop-wiring integration (detection → remediation → resolution)
        │  (1-2)   │  Uses fake T6 harness; smoke-proofed with a bounded non-fake command-construction test
        ├──────────┤
        │  Unit    │  Phase 1: schema validation, taxonomy integrity, detection-mapping
        │ (6-8)    │  Phase 2: content integrity, remediated_by edge integrity
        │          │  Phase 3: authoring-guide doc contract tests
        └──────────┘
```

## Shared Fixtures & Mocks

| Fixture | Location | Purpose |
|---|---|---|
| `makeAlgebraicSubmission(parts)` | `__tests__/lib/practice/misconception-content.fixtures.ts` | Build `practice.v1` envelopes with seeded misconception tags for loop-wiring tests |
| `makeMisconceptionNode(overrides)` | same file | Build valid misconception taxonomy nodes matching the schema from Phase 1 |
| `makeRemediationActivity(nodeId)` | same file | Build a stub remediation activity (worked_example or task_blueprint) for edge-integrity tests |
| `fakeT6Loop` | `__tests__/lib/practice/misconception-loop.fake.ts` | Fake harness: accepts a submission with misconception tags, returns `{active: Misconception[], resolved: Misconception[]}`. **Smoke-proof:** a bounded non-fake command-construction test (`misconception-loop.smoke.test.ts`) verifies the real T6 function signature and import shape without running the full loop. |
| `IM3_M1_SKILL_SET` | `__tests__/lib/practice/misconception-content.fixtures.ts` | Constant: the prioritized skill IDs for IM3 Module 1 + common algebra (FR4) |

## Architecture Guardrails

1. **Domain-neutral vs. app-local boundary:** Schema types and edge-type definitions live in `packages/knowledge-space-core` or `packages/knowledge-space-practice`. Authored misconception content (taxonomy entries, remediation activity references, detection mappings) lives in `apps/integrated-math-3/`. Tests must verify this boundary: no IM3-specific tag slugs in packages, no raw schema definitions in app code.
2. **practice.v1 contract:** All loop-wiring tests must produce valid `PracticeSubmissionEnvelope` objects. Use `practiceSubmissionEnvelopeSchema.parse()` as a gate in integration tests.
3. **No T6 implementation dependency:** Phase 3 tests use `fakeT6Loop` for runner plumbing. The smoke test (`misconception-loop.smoke.test.ts`) imports the real T6 exports to prove the contract shape exists, but does not exercise the full loop. This prevents Phase 3 from silently passing against a fake while the real T6 is broken.
4. **Content validated by schema + integrity check:** Misconception taxonomy entries are validated by Zod schema (Phase 1). Cross-references (detection mappings, remediated_by edges) are validated by an integrity check script (Phase 2). Tests assert the integrity check passes, not individual edge correctness.

## Per-Phase Test Approach

### Phase 1 — Taxonomy Schema & Detection Mapping

**Red command:** `CI=true npx vitest run __tests__/lib/practice/misconception-taxonomy.test.ts __tests__/lib/practice/misconception-mapping.test.ts`
**Green/closeout gate:** Both files pass; `tsc --noEmit` clean.

- `misconception-taxonomy.test.ts` (new): Tests the IM3 misconception taxonomy schema — validates that every tag entry has required fields (slug, label, description, category, affectedSkills, detectionSignals), that slugs are unique, that categories are from a closed set, that detection signals reference valid distractor types from `packages/math-content/src/algebraic/distractors.ts`. **This is a document/artifact contract test** — it proves the taxonomy file is well-formed, not that the runtime consumes it.
- `misconception-mapping.test.ts` (new): Tests that each misconception maps to at least one distractor type and that the mapping function `mapDistractorToMisconception(distractorType, answer)` returns valid tag slugs. **Live behavior test** — exercises the mapping logic.
- Existing `distractors.test.ts`: No changes needed; already tests the distractor generators.

### Phase 2 — Author Prioritized Content

**Red command:** `CI=true npx vitest run __tests__/lib/practice/misconception-content-integrity.test.ts`
**Green/closeout gate:** Integrity test passes; `tsc --noEmit` clean.

- `misconception-content-integrity.test.ts` (new): **Document/artifact contract test.** Loads the authored taxonomy and remediation activities, verifies: (a) every misconception in the prioritized skill set (IM3 M1 + common algebra) has a detection mapping, (b) every misconception has at least one `remediated_by` edge pointing to a valid remediation activity, (c) no orphan remediation activities exist, (d) all skill references resolve to known IM3 M1 skill IDs.
- No live-behavior tests in this phase — content authoring is data, not logic.

### Phase 3 — Loop Wiring & Verification

**Red command:** `CI=true npx vitest run __tests__/lib/practice/misconception-loop-wiring.test.ts __tests__/lib/practice/misconception-loop.smoke.test.ts`
**Green/closeout gate:** Both pass; `CI=true npm run test` (full suite) passes; `npm run lint` clean; `tsc --noEmit` clean.

- `misconception-loop-wiring.test.ts` (new): **Integration test with fake harness.** Uses `fakeT6Loop` to simulate the T6 mechanism. Seeds a `PracticeSubmissionEnvelope` with misconception tags matching authored detection patterns. Asserts: (a) detection fires and returns the correct misconception, (b) the fake loop transitions active→resolved after N clean attempts, (c) the remediation activity is injected. **Fake harness covers runner plumbing only.**
- `misconception-loop.smoke.test.ts` (new): **Bounded non-fake smoke test.** Imports the real T6 function(s) from the misconception-loop track's exports. Verifies: (a) the function exists and has the expected signature, (b) calling it with a minimal valid input does not throw. Does NOT assert behavioral correctness — that belongs to the misconception-loop track. **Prevents the fake harness from masking a broken real T6.**
- `misconception-authoring-guide.test.ts` (new): **Document contract test.** Verifies the authoring guide markdown file exists, has required sections (Taxonomy Schema, Detection Mapping, Remediation Activity Authoring, Expansion Process), and that every referenced file path in the guide resolves.

## Intentionally-Red Test Files

| File | Why Red | Exclusion |
|---|---|---|
| `misconception-loop.smoke.test.ts` | Depends on `misconception-loop_20260521` exports that may not exist yet. This test is owned by Phase 3 task "Verify the T6 loop fires" and will go green when the dependency track ships its exports. | Excluded from Phase 1 and Phase 2 aggregate runs via `--project` filter or explicit file list. Not excluded from `CI=true npm run test` in Phase 3 — it must pass before closeout. |

## Cross-Phase Edge Cases

1. **Empty taxonomy:** Phase 1 schema tests must handle an empty taxonomy (0 tags) gracefully — schema valid, integrity check passes vacuously.
2. **Duplicate slugs:** Phase 1 must reject duplicate misconception slugs.
3. **Circular remediated_by:** Phase 2 integrity check must detect if a remediation activity points back to the misconception (self-loop).
4. **Missing dependency track:** Phase 3 wiring tests must not import from `misconception-loop_20260521` directly — use the fake harness. Only the smoke test imports the real exports.
5. **Taxonomy drift:** If bus-math-v2's `misconception-taxonomy.ts` changes its interface, IM3's taxonomy must stay compatible. The Phase 1 schema test should import and validate against the shared `MisconceptionTagDefinition` interface shape.

## Live-Proof Plan

| Phase | Red Command (exact) | Green/Closeout Gate |
|---|---|---|
| 1 | `CI=true npx vitest run __tests__/lib/practice/misconception-taxonomy.test.ts __tests__/lib/practice/misconception-mapping.test.ts` | Both pass + `tsc --noEmit` clean |
| 2 | `CI=true npx vitest run __tests__/lib/practice/misconception-content-integrity.test.ts` | Passes + `tsc --noEmit` clean |
| 3 | `CI=true npx vitest run __tests__/lib/practice/misconception-loop-wiring.test.ts __tests__/lib/practice/misconception-loop.smoke.test.ts` | Both pass + `CI=true npm run test` passes + `npm run lint` clean + `tsc --noEmit` clean |
