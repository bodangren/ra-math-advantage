# Activity Map Integration Review

Date: 2026-09-07.

This review separates the exact-node correction from other working-tree changes. It compares the current files with Git `HEAD` and these saved integration bases:

- `/tmp/component-runtime-activity-map.ts.before`
- `/tmp/component-runtime-projections.test.ts.before-final`

## Integration decision

Use the saved `/tmp` files as the base for the owned delta. Do not create the integration patch from `git diff HEAD`. The `HEAD` diff also contains earlier renderer-props, grading-rubric, and SRS-eligibility changes.

The current activity-map implementation has the required behavior:

- It imports and uses the existing Worked, Guided, and Independent Zod sub-schemas.
- It validates each present modality with `safeParse`.
- It projects only `skill` and `task_blueprint` owners.
- It emits no row for a `concept` blueprint.
- It uses the exact blueprint owner for `nodeId` and `stableActivityId`.
- It selects `rendererModeMap.worked`, `rendererModeMap.guidedPractice`, or `rendererModeMap.independentPractice` for the matching mode.
- It uses `rendererKey` only as the fallback for that mode.
- It emits no row when the selected mode has no renderer key.

## Exact activity-map delta to integrate

Apply only these differences between `/tmp/component-runtime-activity-map.ts.before` and the current `packages/knowledge-space-practice/src/projections/activity-map.ts`:

1. Add the three schema value imports from `../blueprints`.
2. Add `rendererModeKey` to `SPEC_TO_MODE` and map each modality to its exact renderer-map key.
3. Add the `SPEC_SCHEMAS` constant that references the existing sub-schemas.
4. Update the `findChildSkills`, `selectSkill`, and `projectActivityMap` comments to state that concept structure helpers do not control activity identity.
5. Replace concept resolution and child iteration with an exact owner check. Permit only `skill` and `task_blueprint`.
6. Remove the single renderer selection that searches other modality keys and falls back to `default`.
7. In the modality loop, reject a missing spec or a spec that fails its existing schema.
8. Select only the matching mode key. Then use the base `rendererKey` fallback. Skip the row if both are absent.
9. Build `stableActivityId` and `nodeId` from `blueprintNode.id`.

Preserve these lines from `/tmp/component-runtime-activity-map.ts.before` when the parent constructs the patch:

- The `spec.rendererProps` branch and its fallback prop construction.
- The conditional `gradingSpec.rubric` spread.
- The mode-specific `srsEligible` expression based only on `independentPracticeReady`.
- Existing source and alignment enrichment.
- The exported `findChildSkills` and `selectSkill` helpers.

These preserved lines are valid current behavior, but they are not part of the exact-node integration delta.

## Exact projection-test delta to integrate

Apply only the concept-test differences between `/tmp/component-runtime-projections.test.ts.before-final` and the current `packages/knowledge-space-practice/src/__tests__/projections.test.ts`:

- Change the two-child concept case to expect no rows.
- Change the three-child fan-out case to use a blueprint owned by `skillA`. Require exactly one row with the `skillA` node and stable activity ID.
- Keep the no-child concept case at zero rows.
- Change the one-child concept case to expect no rows.

Do not capture other `HEAD` differences in this test file. The renderer-props tests, grading tests, and SRS tests existed in the saved `/tmp` base before the final concept correction.

Keep `packages/knowledge-space-practice/src/__tests__/activity-map-identity.test.ts` with the integration. It directly covers concept rejection, exact child identity, task-blueprint compatibility, schema rejection, per-mode renderer selection, base fallback, and missing-renderer omission.

## Suggested patch procedure

1. Restore neither file from `HEAD`.
2. Create a temporary copy from each saved `/tmp` base.
3. Apply only the numbered activity-map and concept-test edits to those temporary copies.
4. Diff each temporary result against its saved `/tmp` base.
5. Apply that narrow diff to the current working tree.
6. Inspect the staged or proposed diff against the current working tree before commit. Confirm that no renderer-props, rubric, or SRS line changes.
7. Run the activity identity test and the projection test together.

Safe conclusion: the current runtime behavior is correct. The integration risk is patch scope. A `HEAD`-based patch will mix independently owned behavior into this commit.
