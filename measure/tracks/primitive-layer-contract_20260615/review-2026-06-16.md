# Code Review — primitive-layer-contract_20260615 — 2026-06-16

## Summary of Changes

Only one commit in the last 24 hours touches this track:

- `b5bc3dff` — `chore(measure): Add new track 'Primitive Layer Contract' + Practice Primitives program`
  - Created the track directory (`measure/tracks/primitive-layer-contract_20260615/`) with `spec.md`, `plan.md`, `metadata.json`, and `index.md`.
  - Added `measure/practice-primitives-roadmap.md` with the P1–P13 taxonomy and T15/T16 reconciliation note.
  - Updated `measure/index.md` and `measure/tracks.md` to register the Practice Primitives & Components Program and T0 track.

No implementation files were added or modified:

- `packages/activity-components/src/primitives/` does **not** exist.
- `packages/activity-components/src/index.ts` was **not** edited to export a primitives barrel.
- `measure/practice-component-contract.md` was **not** updated with a Primitive Layer section or the P1–P13 catalog.
- No `CoordinatePlane.tsx`, no primitive tests, and no boundary test were created.
- `GraphingCanvas.tsx` and its consumers remain untouched (consistent with the "no end-user behavior change" rule, but only because no migration happened).

## Spec Alignment

**Partial / mostly missed.**

| Requirement | Status | Notes |
|-------------|--------|-------|
| FR-1 — primitive directory + barrel | Missed | `packages/activity-components/src/primitives/` does not exist; package root `index.ts` is unchanged. |
| FR-2 — `MathPrimitiveProps<TValue>` contract | Missed | No `primitives/types.ts` file exists. |
| FR-3 — consumption contract docs | Missed | `measure/practice-component-contract.md` has no Primitive Layer section or CoordinatePlane example. |
| FR-4 — reference migration (`CoordinatePlane`) | Missed | No `primitives/coordinate-plane/` directory or component; `GraphingCanvas` remains the only surface. |
| FR-5 — canonical P1–P13 catalog | Partial | Catalog exists in `practice-primitives-roadmap.md` and `tracks.md`, but the spec requires it in `practice-component-contract.md` as well. |
| FR-6 — T15/T16 reconciliation in `tracks.md` | Met | Roadmap and `tracks.md` clearly state T15 folds into C/D and T16 seeds E. |
| FR-7 — boundary enforcement test | Missed | No `primitives/__tests__/boundary.test.ts` exists. |
| NFRs (tsc, lint, tests) | N/A | No new code to validate; existing gates are unaffected. |

The track is still at the **scaffolding/planning** stage. All plan.md tasks remain `[ ]` unchecked.

## Code Quality Observations

- **Strengths:** The spec and plan are well-structured and follow the project's Measure conventions (FR numbering, phase-based TDD plan, explicit out-of-scope list, acceptance criteria). The roadmap cleanly reconciles the overlapping T15/T16 renderer tracks.
- **Issue — file path mismatch:** The spec references `practice-component-contract.md` at the repo root (`Add a "Primitive Layer" section to practice-component-contract.md`), but the actual file lives at `measure/practice-component-contract.md`. The implementer will need to update the correct path.
- **Issue — no progress evidence:** The plan.md has no commit SHAs appended to tasks and no Red/Green evidence blocks, which is expected for a brand-new track but should appear as soon as Phase 1 begins.
- **No drift risk yet:** Because no code was changed, there is no chance of breaking existing components. The risk is the opposite — the track has not actually started implementation.

## Risks / Blockers

1. **Track is implementation-empty.** Tracks A–F depend on T0, so delaying the contract/primitive work blocks the whole Practice Primitives program.
2. **Unclear ownership state.** `metadata.json` status is `"new"` and every plan task is unchecked. The next implementer must treat this as a from-scratch start, not a partially-complete handoff.
3. **Path ambiguity for contract doc.** The spec should explicitly point to `measure/practice-component-contract.md` to avoid a duplicate/misplaced file.

## Recommended Next Actions

1. Begin Phase 1: create `packages/activity-components/src/primitives/types.ts` with `PrimitiveMode` and `MathPrimitiveProps<TValue>`, add the primitives barrel, and export it from the package root.
2. Update `measure/practice-component-contract.md` with the Primitive Layer section, consumption rules, CoordinatePlane example, and the P1–P13 catalog.
3. Move into Phase 2 Red: author the `CoordinatePlane` contract test and the `primitives/__tests__/boundary.test.ts` (modeled on the knowledge-space-core precedent), confirm they fail for the right reasons, then implement the primitive in Phase 3.
4. After the first implementation commit, append SHAs to plan.md tasks per `workflow.md` and record Red/Green evidence blocks.
