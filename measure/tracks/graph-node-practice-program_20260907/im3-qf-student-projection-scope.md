# IM3 Quadratic Formula student projection scope

## Goal

Make the real lesson query project the fixed public Quadratic Formula (QF) identity from an exact unreviewed activity. Keep the stored phase section small. Keep the schema unchanged.

## Production change

Change `apps/integrated-math-3/convex/student.ts` only.

Rename `projectSelectedWorkedSection` to a name that describes both supported projections, such as `projectActivitySection`. Keep its current selected Worked branch and fallback behavior unchanged.

For an activity section, read the physical activity from `content.activityId`. Process the existing selected Worked case first. This preserves its special source-section rule, approved graph guard, sanitization, and public projection.

For all other sections, detect a QF claim from either the stored section or the physical activity. A claim exists when the component key is `quadratic-formula`, the mastery node is the fixed QF node, or the stable activity ID equals one of the two values in `IM3_QF_DRAFT_MAPPINGS`.

Derive the mode from the one exact stable activity ID in `IM3_QF_DRAFT_MAPPINGS`. Do not accept a client or section mode as authority. Accept the physical activity only when all of these conditions are true:

- Exactly one mapping has its stable activity ID.
- `componentKey` is `quadratic-formula`.
- `masteryNodeId` is `IM3_QF_NODE`.
- `srsEligible` is `false`.
- `approval.status` is `unreviewed`.
- Public props equal `quadraticFormulaPublicProps(mode, mapping.seed)` after `convexToJson` conversion on both values.
- `props.presentationMode` equals the mapping presentation mode.

Return the original section fields plus these public fields:

- `componentKey` from the validated activity.
- `stableActivityId` from the validated activity.
- `masteryNodeId` from the validated activity.
- `learningEvidenceMode` from the derived mapping mode.
- `srsEligible` from the validated activity.
- `activityProps` as the validated stored public props.

Do not return an activity approval, seed, schedule, variant key, variant metadata, expected answer, grading configuration, timestamps, or another activity field.

If a section or physical activity claims QF identity but the full check fails, return the section with `componentKey: "unavailable"`. Remove any cached `stableActivityId`, `masteryNodeId`, `learningEvidenceMode`, `srsEligible`, and `activityProps` fields before return. This behavior prevents mixed or stale identity from reaching `getQuadraticFormulaSectionMode`.

Return unrelated activity sections unchanged. Do not add a database query for variants, items, relations, standards, approvals, or evidence. Do not change the activity row, phase section, graph, or approval.

## Tests

Extend `apps/integrated-math-3/__tests__/convex/quadratic-formula-server-writer.test.ts`. Reuse its memory database, seeded QF fixture, and `getLessonProgress` read. Do not create a second query harness.

Add these assertions:

1. An exact Guided activity projects the fixed activity ID, QF component key, stable ID, mastery node, `learningEvidenceMode: "guided_practice"`, `srsEligible: false`, and the exact stored public props.
2. An exact Independent activity projects the same coherent public fields with `learningEvidenceMode: "independent_practice"` and `presentationMode: "independent"`.
3. The query derives each evidence mode from the stable mapping. A section value cannot select or change it.
4. Table-driven mutations reject each incoherent physical field: stable ID, component key, mastery node, SRS flag, approval status, public props, and presentation mode. The result is unavailable and contains no cached QF identity.
5. A mixed identity, such as a Guided stable ID with Independent props, is unavailable.
6. A missing physical activity for a QF section is unavailable.
7. The serialized projection does not contain private seed fields, variant keys, private metadata sentinels, canonical roots, grading configuration, or approval data.
8. A non-QF activity section stays exactly equal at the returned content boundary.

Run `quadratic-formula-server-writer.test.ts` and the existing `selected-worked-lesson-consumer.test.tsx`. Do not change the selected Worked test expectations. They must still prove the approved selected Worked projection, stale identity sanitization, unavailable states, and acknowledgement flow.

## Exact path set

- `apps/integrated-math-3/convex/student.ts`
- `apps/integrated-math-3/__tests__/convex/quadratic-formula-server-writer.test.ts`
- `apps/integrated-math-3/__tests__/convex/selected-worked-lesson-consumer.test.tsx` — database fixture only; keep all existing expectations unchanged.

Do not change `convex/schema.ts`, `PhaseRenderer.tsx`, seed code, graph source, activity approval, or stored phase section content.

## Acceptance criteria

- A stored section with only `activityId` and `componentKey` produces a complete, coherent QF public projection through `getLessonProgress`.
- The projection satisfies every field in `getQuadraticFormulaSectionMode` for its derived mode.
- An incomplete or mixed QF claim becomes unavailable.
- No private generation or answer field reaches the lesson response.
- The selected Worked query behavior is unchanged.
- Both focused test files pass.

## Parent review additions

Keep the selected Worked source-section protection first. A QF activity placed in that protected section must not bypass its existing unavailable result. Include that mixed-source case in the unchanged selected Worked coverage or a new assertion in the owned QF test. Normalize object key order with the existing Convex value conversion. Do not add hashes.

Write failing query regressions before implementation. Run app lint, build, and separate post-build TypeScript before integration. The independent browser run must use this actual production projection and the unchanged section schema.

## Database ID validation

Call the existing `ctx.db.normalizeId` directly before reading a section activity. The production database API is required. Do not make it optional or add a fallback for a test fixture. The existing selected Worked consumer fixture lacks this method. Add only the required method to that fixture and keep its expectations unchanged. This extends the final batch to three paths. The malformed-ID regression must prove the actual lesson handler returns an unavailable QF section instead of throwing.
