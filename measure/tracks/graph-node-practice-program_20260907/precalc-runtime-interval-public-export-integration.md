# Precalculus Q37 Interval Public Export Report

## Result

The dependency repair is ready for independent review.

The previous parent build used the true candidate package overlay. It failed because the committed interval component and props schema were not available through their public package barrels. Earlier successful builds borrowed broader uncommitted exports from the main workspace.

This repair makes `math-content` the schema owner. The existing activity-components schema path re-exports the schema and type from `math-content`. The activity-components root exports `IntervalClassificationActivity`, `IntervalClassificationActivityProps`, and `IntervalClassificationProps`. This keeps one schema implementation and preserves the package dependency direction.

Two tests import only public barrels. One renders the actual exported component. One parses actual props through the exported `math-content` schema. Both tests failed before the export repair.

## Files

- `packages/activity-components/src/index.ts`
- `packages/activity-components/src/schemas/index.ts`
- `packages/activity-components/src/schemas/interval-classification.schema.ts`
- `packages/activity-components/src/__tests__/interval-classification-public-export.test.tsx`
- `packages/math-content/src/schemas/index.ts`
- `packages/math-content/src/schemas/interval-classification.schema.ts`
- `packages/math-content/src/schemas/__tests__/interval-classification-public-export.test.ts`

Patch path: See `/tmp/precalc-q37-interval-public-export-patch-path.txt`.

## Gates

- Math-content public export test: 1 passed.
- Activity-components public export, schema, and component tests: 14 passed in 3 files.
- Math-content lint: passed.
- Math-content TypeScript: passed.
- Activity-components lint: passed.
- Activity-components TypeScript: passed.
- Precalculus application build with the true candidate overlay: passed.
- Post-build standalone Precalculus TypeScript with `--incremental false`: passed.
- The patch applied in a temporary index against root `HEAD`.
- All seven staged blobs equal the candidate files byte for byte.

No main file changed. No commit or install ran.
