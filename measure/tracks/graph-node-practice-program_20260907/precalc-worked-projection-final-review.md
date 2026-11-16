# Q24 Topic 1.1 Worked projection final independent review

## Decision

Accept `/tmp/precalc-q24-parent-final-main.patch` for parent integration.

The final patch resolves both findings in `/tmp/precalc-q24-independent-review.md`. It enforces the selected physical source ownership contract. It also proves that the dashboard obtains Worked content from the strict Worked projection.

## Exact source ownership

`hasCurrentTopic11Source` now requires one current highest published lesson version. It requires exactly one Phase 4 row. That phase must have type `worked_example`.

The function scans all phases in the current lesson version. It requires exactly one link to the selected physical activity. It also requires exactly one Phase 4 section at sequence 2. The selected link and the sequence 2 section must be the same stored object. The section must have the activity type, exact component key, finite creation time, and valid temporal order.

This logic rejects these states before projection or teacher evidence:

- The selected physical activity is linked from another phase.
- The current version has a second Phase 4 row.
- Phase 4 has a second sequence 2 occupant.
- The selected link is moved from Phase 4 or sequence 2.
- The physical activity or selected source identity is duplicated.

The final patch adds the same ownership cases to the real acknowledgement writer and teacher writer test fixture. Thus, the tests verify projection and trusted teacher evidence. They do not test only a local predicate.

## Projection identity

`getApprovedTopic11WorkedSourceHandler` has no generated or stored-props fallback. It first requires the full selected graph publication predicate. It then requires exactly one matching blueprint with the exact reviewed Worked specification.

The handler requires one approved physical activity with the exact stable ID, component key, display name, description, node, mode, source marker, and variant seed. It also requires the exact current lesson source ownership described above.

The returned UI props come from the exact reviewed blueprint `rendererProps`. The returned physical ID and component key come from the validated activity. The handler returns `null` when any graph, blueprint, physical activity, lesson version, phase, section, or source identity check fails.

The projection remains closed for the current draft catalog. Tests use hypothetical approval. The patch does not approve production content.

## Student consumers

The lesson page compares both the physical activity ID and component key before it renders the Worked component. If the strict projection is absent or does not match the lesson section, the page shows the unavailable message. It does not create generated Worked props.

`PrecalculusTopic11DailyCurriculumPilot` now requires `stableActivityId` and `activityProps`. It no longer supplies a default stable ID or a generated Worked graph. This removes the client fallback.

The dashboard now reads Worked content through `getApprovedTopic11WorkedSource`. It reads Guided and Independent content through `getApprovedPrecalculusPilot`. Its corrected test makes the broad query return only Guided and Independent rows. The strict Worked query returns a different marker ID. The assertion proves that the dashboard passes the strict Worked result to the component.

## Test and patch review

The final patch contains nine files. Its production and test changes match the corrected candidate scope. It includes the three parent ownership regressions that were absent from the rejected patch.

I ran these focused files in `/tmp/precalc-q24-candidate-20260908/apps/pre-calculus`:

- `topic11-worked-projection.test.ts`
- `topic11-selected-teacher-backend.test.ts`
- `PrecalculusTopic11DailyCurriculumPilot.red.test.tsx`

The result was 47 passing tests in three files. The parent also reports 43 passing projection and teacher tests for the final patch review set.

## Remaining boundary

This review accepts the strict Worked projection and consumer wiring. Source approval remains a separate human decision. Guided and Independent publication and evidence rules remain outside this patch unless their existing tests cover them separately.
