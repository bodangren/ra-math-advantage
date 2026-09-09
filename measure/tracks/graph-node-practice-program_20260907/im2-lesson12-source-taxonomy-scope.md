# IM2 Lesson 1.2 source taxonomy scope

## Decision

Add two atomic draft skills for the two scheduled worked examples. Keep the existing `1c` ID as a legacy objective aggregator. Keep the existing `1d` ID as a broad supplementary draft capability. Preserve all existing example IDs, kinds, and pilot evidence.

This scope does not add a generator, renderer mode, standard alignment, prerequisite, approval, or readiness claim.

## Source boundary

The committed Lesson 1.2 file identifies its source as `Int2_0102_practice.docx`. That document is not present in the committed repository. The committed lesson file contains the full text used by this scope. It also states that 18 diagram images could not be fully described.

The class-period plan schedules Lesson 1.2 in period 3. Its objective is: `Find the measures of angles and segments using the Angle Bisector Theorem.` It lists Examples 1 and 2. It does not schedule Examples 3 and 4 for this instruction period.

The native `Module 1 Problem Types.pdf` is an ALEKS problem-type export. It is not the source worksheet named by the lesson file. Page 3 contains one independent incenter problem. It does not contain the two Lesson 1.2 algebraic examples.

## Exact Lesson 1.2 answer demands

### Existing Example 1

ID: `math.im2.example.1.2.005`

Problem body: `BD bisects angle ABC. Angle ABD is (3x + 4) degrees and angle DBC is (5x - 12) degrees. Find angle ABC.`

The learner must use the angle-bisector definition to set the two angle expressions equal. The equation is `3x + 4 = 5x - 12`. It gives `x = 8`. Each half-angle is 28 degrees. The requested final answer is the whole angle: `angle ABC = 56 degrees`.

The exact capability is not “find x.” It is not “find one bisected angle.” It is: solve an equal-angle linear equation and find the whole bisected angle.

### Existing Example 2

ID: `math.im2.example.1.2.006`

Problem body: `I is the incenter of triangle ABC. D and E are the feet of perpendiculars from I to AB and BC. ID = 2x + 1 cm and IE = 5x - 8 cm. Find the inradius.`

The learner must use equal perpendicular distances from the incenter. The equation is `2x + 1 = 5x - 8`. It gives `x = 3`. The requested final answer is the distance: `inradius = 7 cm`.

The exact capability is not “find x.” It is: solve an equal-distance linear equation and find the inradius.

## Native PDF finding and limit

Native page 3 shows Question 7 of 25. The angle bisectors of triangle XYZ meet at incenter G. The problem gives `FG = 18`, `YG = 27`, `m angle DXF = 36 degrees`, and `m angle EYG = 58 degrees`. It asks for `m angle EYD`, `DG`, and `m angle EZG`.

The three answers are 116 degrees, 18, and 14 degrees. The first answer doubles the given half-angle. The second uses equal perpendicular distances from the incenter. The third uses the triangle angle sum and then bisects the angle at Z.

This native problem proves that the problem-type set includes incenter angle and distance measures. It does not prove the equal-angle equation in Example 1. It does not prove the equal-distance equation and inradius calculation in Example 2. Do not use the PDF as the sole source for either new atomic skill. Do not copy Question 7 into an Example 1 or Example 2 record.

## Existing occupied identities

Preserve these existing skill IDs and their `kind: "skill"` values:

- `math.im2.skill.1.2.use-the-angle-bisector-theorem-to-find-angle-and-segment-mea` (`1c`)
- `math.im2.skill.1.2.solve-real-world-problems-involving-angle-bisectors-and-the` (`1d`)

Both IDs occur in `nodes.json`, `draft-nodes.json`, and the embedded node list in `edges.json`. Each has one draft blueprint, one teacher-evidence row, and one spaced repetition system (SRS) input represented in both `srs-input.json` and the nested SRS list in `teacher-evidence-map.json`.

Each existing ID has draft lesson containment and context edges. Each also has two draft standard-alignment edges in `edges.json` and `standard-edges.json`. Both IDs occur in the edge review, generator gap, geometry renderer gap, and standards review queues.

Do not replace either ID. Do not redirect or delete its live references in this source patch. Do not map a worked example directly to either broad row.

Amend the existing nodes only as follows:

- Set the `nodes.json` review status for `1c` and `1d` to `draft`. The other node copies are already draft.
- Add `metadata.taxonomyRole: "legacy_objective_aggregator"` to the three `1c` copies.
- Keep `1d` as a broad supplementary draft capability. Do not add direct example evidence in this patch.
- Preserve their titles, descriptions, source references, kinds, IDs, and all relationships.

This matches the established Lesson 1.1 aggregator treatment. It removes the inconsistent approved source-node claim. It does not approve or reject the existing draft standard edges.

## Proposed atomic IDs

### Equal-angle equation capability

ID: `math.im2.skill.1.2.solve-an-equal-angle-equation-and-find-the-whole-angle`

Kind: `skill`

Title: `Solve an equal-angle equation and find the whole bisected angle`

Description: `Use two equal angle expressions to solve a linear equation and find the measure of the whole bisected angle.`

Source references:

- `apps/integrated-math-2/curriculum/modules/module-1-lesson-2`

Blueprint source node IDs:

- `math.im2.example.1.2.005`

### Incenter-distance capability

ID: `math.im2.skill.1.2.find-the-inradius-from-equal-perpendicular-distances`

Kind: `skill`

Title: `Find the inradius from equal perpendicular distances`

Description: `Use equal perpendicular distances from an incenter to solve a linear equation and find the inradius.`

Source references:

- `apps/integrated-math-2/curriculum/modules/module-1-lesson-2`

Blueprint source node IDs:

- `math.im2.example.1.2.006`

Both proposed IDs are unoccupied at committed `a9dd5829f`. Neither string has a live reference.

## Minimum graph relationships

For each new skill, add one draft `contains` edge from `math.im2.lesson.1.2` to the skill. Add one draft `appears_in_context` edge from the skill to its exact worked example. Use the existing direct source-evidence pattern from the Lesson 1.1 and Lesson 1.3 atomic corrections.

Use the Lesson 1.2 source file in each edge `sourceRefs` list. Set `derived: false`. Give each edge a direct rationale that states the exact final quantity.

Suggested edge IDs:

- `math.im2.skill.1.2.solve-an-equal-angle-equation-and-find-the-whole-angle.contains`
- `math.im2.skill.1.2.solve-an-equal-angle-equation-and-find-the-whole-angle.appears_in_context`
- `math.im2.skill.1.2.find-the-inradius-from-equal-perpendicular-distances.contains`
- `math.im2.skill.1.2.find-the-inradius-from-equal-perpendicular-distances.appears_in_context`

Do not add a prerequisite between the two skills. The source does not require one task before the other.

## Blueprint and projection state

Add one source-only draft blueprint for each new skill. Use its exact worked-example ID in `sourceNodeIds`. Use an empty `rendererKey` and an empty `rendererModeMap`. Add the existing generator exception. Set `metadata.implementationStatus` to `unavailable`. Set `metadata.independentPracticeReady` to `false`.

Add one inactive teacher-evidence row for each new skill. It must have no aligned standards and no prerequisites. It must report `generatorStatus: "not_implemented"`, an empty renderer key, and `independentPracticeReady: false`.

Add one inactive SRS input for each new skill. Preserve the established exhaustive-inventory format. It must set `srsEligible: false`, `generatorReady: false`, and `independentPracticeReady: false`.

Do not add an activity row to `projection/practice-v1-activity-map.json`. The prior atomic source-only skills do not create an executable activity projection.

## Candidate path list

1. `apps/integrated-math-2/curriculum/skill-graph/nodes.json`
2. `apps/integrated-math-2/curriculum/skill-graph/draft-nodes.json`
3. `apps/integrated-math-2/curriculum/skill-graph/edges.json`
4. `apps/integrated-math-2/curriculum/skill-graph/blueprints.json`
5. `apps/integrated-math-2/curriculum/skill-graph/projection/srs-input.json`
6. `apps/integrated-math-2/curriculum/skill-graph/projection/teacher-evidence-map.json`
7. `apps/integrated-math-2/__tests__/curriculum/module-1-source-mappings.test.ts`

Do not change `standard-edges.json` or a review queue. Do not change the source lesson, class-period plan, PDF, example identities, or runtime code.

## Behavioral source regression requirements

Extend the existing app-discovered `module-1-source-mappings.test.ts` test.

The test must read the committed Lesson 1.2 text as the source body. It must prove these facts:

- Example `.005` occurs once and keeps `kind: "worked_example"` in all three node catalogs.
- Example `.005` asks for angle ABC. Its complete solution gives `x = 8`, each smaller angle as 28 degrees, and angle ABC as 56 degrees.
- The equal-angle skill occurs once in each node catalog. All copies are equal, draft, and source the Lesson 1.2 file.
- Its blueprint contains only `.005` as source evidence. It has no generator or mode specification.
- Example `.006` occurs once and keeps `kind: "worked_example"` in all three node catalogs.
- Example `.006` asks for the inradius. Its complete solution gives `x = 3` and the inradius as 7 cm.
- The inradius skill occurs once in each node catalog. All copies are equal, draft, and source the Lesson 1.2 file.
- Its blueprint contains only `.006` as source evidence. It has no generator or mode specification.
- Each new skill has exactly one lesson containment edge and exactly one source-evidence context edge.
- The `.005` edge does not target `.006`. The `.006` edge does not target `.005`.
- Existing `1c` and `1d` keep their exact IDs and `kind: "skill"` in all three catalogs.
- Existing `1c` is a draft legacy objective aggregator. Existing `1d` remains a broad supplementary draft capability. Both blueprints keep empty source lists.
- Existing `1c` and `1d` live edges, projection rows, queue references, and draft standard edges remain present.
- Each new teacher row and SRS row is inactive. Neither row claims a standard, prerequisite, generator, renderer, readiness, or SRS eligibility.
- No new skill appears in the executable activity projection.

The test must keep the full problem body separate from the inferred skill title and description. A matching heading alone must not pass the source test.

## Parent review

The parent inspected native PDF page 3 and the committed lesson body. The native incenter problem gives 116 degrees, 18, and 14 degrees. It does not supply the two algebraic examples. The lesson body supplies the exact requests for 56 degrees and 7 cm. This distinction must remain explicit.

The parent accepts the seven-path implementation boundary. All seven candidate paths match committed HEAD before editing. Independent implementation review and application gates remain required. This source correction does not establish student readiness.
