# IM3 Selected Quadratic Seed Patch Review

Date: 2026-09-07

## Scope

The patch adds three selected seed builders to the committed `deb0137e` baseline. The isolated patch also applies to the current integration baseline.

- Worked uses `math.im3.skill.1.1.graph-quadratic-functions.worked_example`.
- Guided uses `math.im3.skill.1.1.graph-quadratic-functions.guided_practice`.
- Independent uses `math.im3.skill.1.1.graph-quadratic-functions.independent_practice`.

Guided and Independent use the registered `quadratic-graph-analysis` generator. The rubric uses `table_values` and `placed_points`. The renderer props do not contain the expected answer.

Each physical activity starts with `approval.status = "unreviewed"`. Each activity also starts with `srsEligible = false`. Curriculum publication does not approve a physical activity.

Worked uses the committed Lesson 1.1 Phase 4 source. It uses `f(x) = x^2`. It has `learningEvidenceMode = "worked_example"`. The main teacher exposure matcher now uses this same equation. The handler also requires an approved physical activity, the latest published lesson version, an exact phase activity link, a class assignment, an active enrollment, and a valid student acknowledgement.

Main integration preserves this source in Phase 4 sequences 1 and 2. A separate domain-range source uses sequences 4 and 5. That later-node integration remains outside this isolated seed patch.

## Test evidence

The focused test was red before the builders existed. It is green after the patch. Five of five tests pass. The tests call the real `seedLesson1` mutation handler. They also call the selected consumer twice. They verify three stable physical activity rows, two variants, two practice items, stable physical IDs, and the exact Phase 4 Worked link. They reject missing source structure and changed approved content.

The tests also accept reordered keys in identical nested content. They clear stale SRS state after changed unreviewed content. They reject draft-only lesson versions, duplicate latest published versions, conflicting practice-item mappings, and a changed Phase 4 activity source. The final independent review reports seed coverage of 97.58% for statements, 92.47% for branches, 96.87% for functions, and 97.43% for lines. A separate seeded-submission test also passes. The combined main integration run passes 186 tests in eight files.

The scratch TypeScript check still reports three baseline errors:

- The committed practice-core package does not export `learningEvidenceFingerprintV1` for two existing files.
- The generated Vinext server output does not exist for `cloudflare/worker.ts`.

The selected seed files add no TypeScript error.

## Integration limit

The existing `seedLesson1` mutation calls the selected consumer after it creates the lesson phases and sections. The consumer verifies the exact Lesson 1.1 version, one Worked Phase 4, the source text, and one sequence-2 activity section. It creates or updates the three activity rows. It creates or updates the Guided and Independent variants and practice items. It links the Worked activity to sequence 2 of Phase 4. The broad seed now selects the highest published lesson version instead of the first indexed version.

The consumer preserves an existing activity approval and SRS state only when reviewed content is identical. It rejects changed approved content. It assigns unreviewed and SRS-disabled values to a new row. It does not approve an activity. The teacher exposure handler still rejects the Worked row until a separate review approves that physical activity.

The patch adds the existing `learningEvidenceMode` field to the committed activity schema. The selected constants patch remains a required dependency because the committed writer already imports these constants from a dirty working-tree file.
