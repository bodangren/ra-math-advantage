# Implementation Plan: Primitive Layer Contract (Practice Primitives T0)

Contract-First + TDD. Work top-to-bottom; mark each task `[ ]→[~]→[x]` and append the
7-char commit SHA when done (see `workflow.md`). All paths are relative to repo root.

References for the implementer:
- Contract types & rules: `spec.md` FR-2.
- Boundary test precedent to copy: `packages/knowledge-space-core/src/__tests__/boundary.test.ts`.
- Existing canvas to wrap (do not modify): `packages/activity-components/src/components/graphing/GraphingCanvas.tsx`.
- Package root barrel to extend: `packages/activity-components/src/index.ts`.

> **MID-attempt-3 status: BLOCKED on a supervisor gate defect.**
> After 3 bounded attempts (attempt 1, attempt 2, attempt 3), Mid cannot satisfy
> `gate_mid` because the gate's `non_test_source_changes_since` unions
> `git diff --name-only {pre_head}..HEAD` + **uncommitted worktree changes** +
> staged. The 8 `apps/integrated-math-3/` files dirty at MID start
> (Track 7 `problemFamilyId→variantKey` rename, owned by
> `practice-variant-rename_20260521`) are flagged as "Mid role changed
> non-test/non-Measure files". Mid has no authority to commit or stash
> another track's work (scope tradeoff). See
> `measure/tech-debt.md` "gate_mid conflates pre-existing dirty work" entry
> for full diagnosis. **Resolution requires a remediation track to fix the
> gate logic** — not a Mid-role fix. Valid Phase 1 Red work is preserved
> in commits `b54903f5` and `7fe59d4e` (Measure doc commits). Task 1 source
> code impl was reverted in `29aed40d` and is owned by the Green role
> (or by the remediation track that follows).

## Phase 1 — Contract & Schema Definition

- [~] Task: Define the primitive contract types
    - [ ] Create `packages/activity-components/src/primitives/types.ts` with `PrimitiveMode` and `MathPrimitiveProps<TValue>` exactly as in spec FR-2 (include the JSDoc).
    - [ ] Create `packages/activity-components/src/primitives/index.ts` re-exporting `./types` (primitive subdir barrels are added in Phase 3).
    - [ ] Add `export * from './primitives/index';` (or named re-exports matching local style) to `packages/activity-components/src/index.ts`.
    - [ ] Confirm `npx tsc --noEmit` is clean for the new files.
- [x] Task: Document the consumption contract + catalog (FR-3, FR-5) [b54903f]
    - [x] Add a `## Primitive Layer` section to `practice-component-contract.md`: two-layer split, the FR-2 controlled-component rules, and value→envelope mapping.
    - [x] Add the `### Primitive Catalog (P1–P13)` table (id, name, course/domain, status, owning track); mark P1 `CoordinatePlane` as promoted.
    - [x] Cross-link the catalog to `practice-primitives-roadmap.md` (single source of truth).
- [x] Task: Stub the reference example for FR-3 [7fe59d4]
    - [x] Write the `CoordinatePlane`-based consumption example (prose + code snippet) in the contract doc; it will compile-check against the Phase 3 component.
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Test (Red)

- [ ] Task: Contract test for `CoordinatePlane`
    - [ ] Create `packages/activity-components/src/primitives/__tests__/coordinate-plane.test.tsx`.
    - [ ] Assert: renders given `value.points`; in `mode="interactive"`, a point-add interaction calls `onChange` with the appended point; in `mode="readonly"`/`"static"` or `disabled`, `onChange` is never called.
    - [ ] Run `CI=true npm run test` (in `packages/activity-components`) and confirm it FAILS (component not built yet).
- [ ] Task: Boundary test for `primitives/`
    - [ ] Create `packages/activity-components/src/primitives/__tests__/boundary.test.ts` modeled on the knowledge-space-core precedent; forbidden patterns: `apps/`, `convex/_generated/`, `lib/practice`, practice `contract` envelope import.
    - [ ] Include the positive/negative fixture assertions (catches a bad import; ignores comments/allowed imports).
    - [ ] Confirm it currently passes vacuously (only `types.ts` present) AND fails on a temporarily planted bad import, then remove the planted import.
- [ ] Task: Regression guard
    - [ ] Confirm existing `components.test.tsx`, `registry.test.ts`, `renderer.test.tsx`, `schemas.test.ts`, `types.test.ts` still pass unchanged.
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Implement (Green)

- [ ] Task: Build the `CoordinatePlane` primitive (FR-4)
    - [ ] Create `primitives/coordinate-plane/CoordinatePlane.tsx` with `CoordinatePlaneValue`, `CoordinatePlaneConfig`, `CoordinatePlaneProps` and the behavior mapping from spec FR-4 (wraps existing `GraphingCanvas`; `readonly = mode !== 'interactive' || disabled`; add/remove → `onChange`; no handlers when non-interactive).
    - [ ] Create `primitives/coordinate-plane/index.ts` barrel; register it in `primitives/index.ts`.
- [ ] Task: Make tests green
    - [ ] Run `CI=true npm run test` (activity-components) — contract + boundary + existing suites all pass.
    - [ ] `npx tsc --noEmit` clean; `npm run lint` clean.
- [ ] Task: Verify no behavior change to shipped components
    - [ ] Confirm `GraphingCanvas`/`GraphingExplorer*` files and their tests are unmodified (git diff shows only additive files + the two doc/barrel edits).
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Generate Docs & Doctor

- [ ] Task: Apply T15/T16 reconciliation + program registration in `tracks.md` (FR-6)
    - [ ] Add the **Practice Primitives & Components Program** section (T0 + A–F).
    - [ ] Edit the T15 entry (folded into C/D) and T16 entry (reframed as Track E seed).
- [ ] Task: Run quality gates and Measure doctor
    - [ ] `npx tsc --noEmit` + `npm run lint` + `CI=true npm run test` (activity-components) all green.
    - [ ] Run the Measure doctor workflow (`/measure:doctor`) and resolve any boundary/generated-doc findings. (Note: there is no `measure/generate.sh`/`doctor.sh` script in this repo; use the skill workflow + the gates above.)
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
