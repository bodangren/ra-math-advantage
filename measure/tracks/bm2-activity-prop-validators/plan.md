# Implementation Plan: BM2 Activity Prop Validators

## Phase 1: Component Audit

- [ ] Inventory all BM2 component types from seed files and components directory.
- [ ] Document prop shapes for each component type.
- [ ] Prioritize high-usage components.

## Phase 2: Validator Creation

- [ ] Create `convex/activity_prop_validators.ts` with per-component validators.
- [ ] Build the discriminated union for `activities.props`.
- [ ] Build the discriminated union for `phase_sections.content`.

## Phase 3: Schema Migration

- [ ] Update `convex/schema.ts` to use the new unions.
- [ ] Update seed files with typed assertions.
- [ ] Run typecheck and tests.
