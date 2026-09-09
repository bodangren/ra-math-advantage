# IM2 Lesson 1-4 source repair scope

Date: 2026-09-09

## Decision

Restore Lesson 1-4 from the committed `Int2_0104_practice.docx` student worksheet. Use a six-path source batch. Do not change the graph in this batch.

The current lesson is not a transcription of the worksheet. It replaces the worksheet with four new problems and four supplied solutions. It also adds Triangle Inequality Theorem vocabulary. The worksheet does not teach or assess the sum-of-two-sides Triangle Inequality Theorem.

The source-defined lesson scope is side-angle comparison in one triangle. Preserve that scope. Remove the unrelated Triangle Inequality Theorem definition and any source claim that depends on it.

## Source authority

Use this committed source:

`apps/integrated-math-2/curriculum/source-materials/practice-worksheet-student-bundle/Int2_0104_practice.docx`

The DOCX has four pages and 19 embedded figures. All 19 embedded figure files are byte-identical to these existing public assets:

`apps/integrated-math-2/public/curriculum/module-1-lesson-4/image1.png` through `image19.png`

Reuse those assets. Add no asset.

Use the DOCX XML and its media relationships as the text and figure authority. Plain `w:t` extraction is incomplete. It omits Office Math Markup Language (OMML) triangles and segment overbars. Preserve these visible forms:

- `△ABC`, `\overline{AY}`, and `\overline{BX}` in the instruction for Problems 17 through 19;
- `\overline{XC}` and `\overline{YC}` in Problem 18;
- `△ABQ` in Problem 19;
- `\overline{AB}` and `△ABC` in Problem 37.

Markdown can represent an overbar with a clear segment term such as `segment AY` if the lesson format has no established overbar form. Do not silently reduce a segment to an unqualified pair of points.

## Exact source structure

Use the title `Inequalities in One Triangle — Practice` or the existing normalized lesson title. Preserve these worksheet headings:

- `Example 1`
- `Examples 2 and 3`
- `Example 4`
- `Mixed Exercises`

Do not split `Examples 2 and 3` into two invented examples. Do not add answer keys or solutions. The student worksheet supplies none.

### Example 1

Use the instruction `List all the angles that satisfy the stated condition.` Use `image1.png` for all five prompts.

1. measures are greater than `m∠3`
2. measures are less than `m∠1`
3. measures are greater than `m∠1`
4. measures are less than `m∠7`
5. measures are greater than `m∠2`

### Examples 2 and 3

Use the instruction `List the angles and sides of each triangle in order from smallest to largest.` Preserve the visual task order. The XML media order is not the visual task order.

- Problem 6 uses `image3.png`.
- Problem 7 uses `image2.png`.
- Problem 8 uses `image4.png`.
- Problem 9 uses `image7.png`.
- Problem 10 uses `image6.png`.
- Problem 11 uses `image5.png`.

### Example 4

- Problem 12 starts with `SPORTS`. It asks which tree position has the greatest angle. Use `image8.png`.
- Problem 13 starts with `NEIGHBORHOOD`. It asks how Cain's and Remy's distances from the flagpole compare. The source has no figure for this problem.

### Mixed Exercises

Preserve Problems 14 through 39 in their source order and with their full instructions.

- Problem 14 is the `MAPS` task. Preserve parts a through c. Use `image9.png`.
- Use the `REASONING` instruction for Problems 15 and 16. It asks for angles and sides in order from smallest to largest. Problem 15 uses `image11.png`. Problem 16 uses `image10.png`. The XML media order differs from the visual order.
- Preserve the full instruction and `image12.png` for Problems 17 through 19. Preserve the segment notation for `AY`, `BX`, `XC`, and `YC`. Preserve the triangle notation for `ABC` and `ABQ`.
- Problem 20 is the paragraph-proof task. Preserve `Given: WY > YX` and `Prove: m∠ZWY > m∠YWX`. Use `image13.png`.
- Problem 21 is the `SQUARES` perimeter-order task. Use `image14.png`.
- Use the shared greatest-angle instruction for Problems 22 through 27. Preserve every listed angle set. Use `image15.png`.
- Use the shared angle-measure relationship instruction for Problems 28 through 31. Preserve every listed angle pair. Use `image16.png`.
- Use the shared length relationship instruction for Problems 32 through 35. Preserve every listed segment pair. Use `image17.png`.
- Problem 36 is the ruler construction and justification task. Preserve `m∠A > m∠B > m∠C`.
- Problem 37 is the possible-measure and explanation task. Preserve the segment notation for `AB` and the triangle notation for `ABC`. Use `image18.png`.
- Problem 38 asks whether the base of an isosceles triangle is sometimes, always, or never the longest side. Preserve the justification request.
- Problem 39 asks for numbered angles in order from smallest to largest, given `m∠2 = m∠5`. Preserve the explanation request. Use `image19.png`.

The rendered page bottoms crop parts of Problems 15 and 16 on page 2 and Problems 26 and 27 on page 3. Use the DOCX XML and the original media for those tasks. Do not transcribe from a cropped render.

## Allowed paths

Change only these six paths:

1. `apps/integrated-math-2/curriculum/modules/module-1-lesson-4`
2. `apps/integrated-math-2/__tests__/curriculum/module-1-source-mappings.test.ts`
3. `apps/integrated-math-2/curriculum/lessons.json`
4. `apps/integrated-math-2/curriculum/calendar.json`
5. `apps/integrated-math-2/curriculum/implementation/class-period-packages/unit-1.json`
6. `apps/integrated-math-2/curriculum/module-1-class-period-plan.md`

Preserve all unrelated bytes in the test file. Add one bounded Lesson 1-4 source regression section.

## Test requirements

Write the regression before the source repair. The initial test must fail against the committed synthetic lesson.

The regression must check these conditions:

- The source has exactly the three worked-example headings `Example 1`, `Examples 2 and 3`, and `Example 4`.
- The source has one `Mixed Exercises` heading.
- The source includes every numbered prompt from 1 through 39 exactly once.
- The source preserves Problems 14a through 14c.
- The source uses the exact figure mapping for Problems 6 through 11 and Problems 15 through 16.
- The source references each existing asset from `image1.png` through `image19.png` in the correct task group.
- Each referenced asset exists.
- The source preserves the OMML-dependent segment and triangle terms for Problems 17 through 19 and Problem 37.
- The source preserves the full shared instructions and all listed angle or segment sets for Problems 22 through 35.
- The source contains no supplied solution or answer section.
- The source does not contain the four synthetic problem bodies about `35, 65, and 80 degrees`, side lengths `7 cm`, `9 cm`, and `5 cm`, the two invented angle-only triangles, or the `300 m`, `500 m`, and `400 m` path triangle.
- The source does not define the Triangle Inequality Theorem as the sum of two side lengths.

Run this focused source regression for the batch:

```text
npx vitest run __tests__/curriculum/module-1-source-mappings.test.ts
```

The implementation report must record the failing result before repair and the passing result after repair. Root must also run app lint, build, and separate post-build TypeScript before integration.

## Graph boundary

Keep these occupied worked-example IDs unchanged:

- `math.im2.example.1.4.013`
- `math.im2.example.1.4.014`
- `math.im2.example.1.4.015`
- `math.im2.example.1.4.016`

Do not add or change a source mapping in this batch. The shared `Examples 2 and 3` heading needs a separate identity decision after the source is restored.

Keep both occupied Lesson 1-4 skill IDs unchanged. Do not repurpose the incorrect `apply-triangle-inequality-relationships-in-proofs-and-real-w` ID. It has graph, projection, queue, standard, and cross-course references.

Add no node, edge, blueprint, standard alignment, prerequisite, generator, activity, approval, readiness claim, learner evidence, or spaced repetition system eligibility.

Preserve the existing Lesson 1-1 perpendicular-bisector pilot authority and all of its evidence.

## Required generated lesson update

The parent build found that the existing prebuild contract rejects a stale `curriculum/lessons.json`. Run `node scripts/build-curriculum.mjs` after source restoration. Compare the result with committed HEAD. Only the Lesson 1.4 record may change. Preserve every other lesson record and its order. The script also writes `curriculum/implementation/practice-v1/activity-map.json`; verify that file remains byte-identical and do not include it in the patch. Do not edit the generator or add a new generation layer. The original two-path freeze is not accepted without the required lesson bundle update.

## Required calendar update

The second prebuild check also validates the generated calendar. Its existing generator reads the first entry in Today’s Goals as the instruction objective. Preserve the original `## Today's Goals` section with its three supported entries. Remove only the unsupported entry about triangle inequality relationships. The retained entries ask for angle comparisons, angle and side order, and real-world side-angle relationships. These are lesson goals, not extra worksheet prompts or answers.

Run the existing curriculum and calendar generators after this correction. The required additional outputs are `calendar.json`, `implementation/class-period-packages/unit-1.json`, and `module-1-class-period-plan.md`. Preserve the 180-period course budget, all period identities and order, and all unrelated period values. The changed Lesson 1.4 instruction must cite the actual combined Examples 2 and 3 heading. No new scheduling rule is added. Verify every other unit package and module plan is byte-identical. Do not edit a generator. If regeneration changes an unrelated record, stop and report it.

The final source regression must check retained goals, the restored prompt sequence, and the corresponding generated Lesson 1.4 and calendar entry. Existing generation checks remain the authority for output freshness. The three-path freeze is superseded by this complete existing dependency scope.
