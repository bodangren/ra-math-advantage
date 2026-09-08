# IM3 Lesson 1.8 recovery independent scope review

## Verdict

The source recovery is valid. The implementation scope in the committed proposal is incomplete.

The proposal incorrectly says that empty mode maps produce no spaced-repetition row. `projectSrsInputs` emits one row for every skill or task-blueprint node. A blueprint with no executable specification still produces an inactive row with `generatorReady: false`.

The proposal also relies on tests that do not exist in committed `HEAD`. At review commit `5dd54dc09b97e0a8e2fe063c46e9fe74484d3496`, the skill-graph test directory contains only these five pilot tests:

- `pilot-generators.test.ts`
- `pilot-graph-validation.test.ts`
- `pilot-projection.test.ts`
- `pilot-rendering.test.ts`
- `pilot-submission-evidence.test.ts`

Committed `HEAD` does not contain `lesson-1-8-reconciliation.test.ts` or `module-1-integration.test.ts`. Those files in the main working tree are not the baseline for this recovery.

## Source records

Commit `0b5392a36` changes seven existing worked-example records. It does not add node identities. The records `.046` through `.052` keep `reviewStatus: draft`, the existing class-period-plan reference, and `rawText`. The commit corrects the authored titles and adds the verified PDF page reference, `pdfPage`, `authoredTitle`, `prompt`, and `demonstratedCapability` fields.

Apply each corrected object to every committed catalog that embeds these node records:

1. `module-1/nodes.json`
2. `nodes.json`
3. `draft-nodes.json`
4. `edges.json` under its embedded `nodes` array
5. `standard-edges.json` under its embedded `nodes` array

Do not change any edge object. The existing containment, source-to-skill, standard-alignment, prerequisite, and renderer edges already reference the stable node and skill identities. No node count changes because all nine identities already exist.

## Blueprint records

Add the two exact draft blueprints from `0b5392a36` to both blueprint catalogs:

1. `module-1/blueprints.json`
2. `blueprints.json`

Keep the accepted source partitions `.046`–`.049` and `.050`–`.052`. Keep `rendererModeMap: {}`. Do not add a mode specification, generator, grader, activity, approval, or readiness claim.

## Required projection synchronization

The generated state must follow the current projectors.

### Spaced-repetition rows

Add two inactive rows to each stored SRS projection:

- `module-1/projection/practice-v1-activity-map.json` in `srsInputs`
- `projection/practice-v1-activity-map.json` in `srsInputs`
- `projection/srs-input.json`

Each row must equal the current `projectSrsInputs` result. The blueprint ID changes to `<skill-id>.blueprint` because the blueprint now exists. Each row has the current HSA-REI-C-7 standard, the current prerequisite list, difficulty, and `generatorReady: false`. It has no executable generator claim.

### Teacher rows

The module projection already contains the two Lesson 1.8 skill-coverage rows. The course projection and standalone teacher projection contain neither skill row. Add the two derived skill rows to:

- `projection/practice-v1-activity-map.json` in `teacherEvidence.skills`
- `projection/teacher-evidence-map.json` in `skills`

The seven worked examples already exist in the node catalogs, but all three stored teacher projections lack their attempt-artifact rows. Add the seven derived attempt artifacts to:

- `module-1/projection/practice-v1-activity-map.json` in `teacherEvidence.attemptArtifacts`
- `projection/practice-v1-activity-map.json` in `teacherEvidence.attemptArtifacts`
- `projection/teacher-evidence-map.json` in `attemptArtifacts`

Keep the module's two existing skill rows byte-equivalent. Keep all unrelated teacher rows unchanged. The Lesson 1.8 skill rows remain `independentPracticeReady: false`.

### Activity rows

Do not add an activity row. `projectActivityMap` has no mode to emit from either empty `rendererModeMap`.

## Minimum changed paths

The corrected bounded implementation has 12 expected paths:

1. `apps/integrated-math-3/__tests__/curriculum/lesson-1-8-reconciliation.test.ts`
2. `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
3. `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
4. `apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json`
5. `apps/integrated-math-3/curriculum/skill-graph/edges.json`
6. `apps/integrated-math-3/curriculum/skill-graph/standard-edges.json`
7. `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
8. `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
9. `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
10. `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
11. `apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json`
12. `apps/integrated-math-3/curriculum/skill-graph/projection/teacher-evidence-map.json`

No module edge file, module standard-edge file, queue, runtime, schema, or package file needs a change.

## Minimum regression contract

Create one focused Lesson 1.8 test in the app-discovered curriculum test path. It must verify all of these conditions:

1. The seven source objects have exact parity across all five node catalogs.
2. The seven source objects match the verified commit fields and remain draft.
3. The two blueprints have exact parity across the module and course catalogs.
4. The two blueprints have the accepted source partitions and no executable specifications.
5. Fresh `projectActivityMap` output contains no row for either skill.
6. Fresh `projectSrsInputs` output contains both skills as inactive rows.
7. Both embedded SRS arrays and the standalone SRS array contain those exact derived rows.
8. Fresh `projectTeacherEvidence` output contains both skill rows and all seven attempt artifacts.
9. The module, course, and standalone teacher projections contain the applicable exact derived rows.
10. Unrelated records in every touched aggregate are unchanged from committed `HEAD`.

Run the five committed pilot tests and the new focused test. Also run the applicable knowledge-space projection tests. Do not name the absent `module-1-integration.test.ts` as a required baseline gate unless this bounded change creates that file and owns its complete contract.

## Correction to the committed proposal

Replace “no SRS input” with “two inactive SRS inventory rows.” Replace “the existing teacher-evidence rows can remain” with the exact module-versus-course synchronization above. Expand the expected catalog scope from the module and root source files to all five node-bearing catalogs. Keep the recovery object-level and preserve all unrelated aggregate records and their order.

## Parent clarification

The default app Vitest configuration excludes the legacy graph test directory. The new recovery test is under `__tests__/curriculum/`. The legacy `rawText` field differs between the module and other committed catalogs. Preserve each original `rawText` value. Compare the corrected source fields and all remaining node fields across catalogs. This recovery does not rewrite historical extraction text.
