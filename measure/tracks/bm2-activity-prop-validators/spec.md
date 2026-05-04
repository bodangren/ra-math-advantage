# Specification: BM2 Activity Prop Validators

## Background

BM2 currently uses `v.record(v.string(), v.any())` for `activities.props` and `phase_sections.content` because per-component prop validators do not exist. This was an intentional deferral during the monorepo migration to avoid blocking BM2 adoption.

## Objective

Replace the generic `v.record(v.string(), v.any())` fields with discriminated unions that map exact `componentKey` identifiers to their respective exact prop schemas, matching the pattern established in IM3.

## Acceptance Criteria

- [ ] Audit all 40+ BM2 component types and document their prop shapes.
- [ ] Create Convex validators for each component type (or a meaningful subset).
- [ ] Build a `v.union()` discriminated by `componentKey` for `activities.props`.
- [ ] Build a corresponding union for `phase_sections.content` when `sectionType === 'activity'`.
- [ ] Update seed files to use typed assertions instead of `any`.
- [ ] All BM2 tests pass after migration.
