# IM2 Lesson 1.4 graph scope review

## Decision

Add two atomic draft skills from the explicit native prompts. Keep the four existing example IDs as legacy draft records. Keep their kinds and edges unchanged. Downgrade the two unsupported approved broad skill rows in `nodes.json` to draft.

This first change is source taxonomy only. It does not claim a demonstrated solution, generator, renderer mode, standard alignment, prerequisite, approval, activity, or readiness.

## Source authority

The committed source is `apps/integrated-math-2/curriculum/modules/module-1-lesson-4`. It identifies `Int2_0104_practice.docx` as its source. The restored text contains 39 unanswered practice prompts.

The source has one combined heading named `Examples 2 and 3`. It gives one instruction for Problems 6 through 11: list triangle angles and sides from smallest to largest. It does not divide those prompts into separate Example 2 and Example 3 solution records.

The KST-SRS v3.2 specification defines `worked_example` as a demonstrated solution. The worksheet does not contain demonstrated solutions. Do not use its headings as proof of four worked solutions.

Problems 6, 8, and 11 give three side lengths. They require the learner to order the opposite angles. Problems 7, 9, and 10 give angle measures. They require the learner to order the opposite sides. These are two separate and assessable capabilities.

## Existing occupied identities

Preserve these IDs and `kind: "worked_example"` values in `nodes.json`, `draft-nodes.json`, and the embedded node catalog in `edges.json`:

- `math.im2.example.1.4.013`
- `math.im2.example.1.4.014`
- `math.im2.example.1.4.015`
- `math.im2.example.1.4.016`

Preserve their existing standard alignment, lesson context, and lesson containment edges. Do not use `.014` and `.015` as separate source evidence for the combined prompt group. Do not change their titles, kinds, IDs, or relationships in this source patch. They remain draft and absent from active projections.

Preserve these broad skill IDs and kinds:

- `math.im2.skill.1.4.order-angles-and-sides-of-a-triangle-from-smallest-to-larges` (`1g`)
- `math.im2.skill.1.4.apply-triangle-inequality-relationships-in-proofs-and-real-w` (`1h`)

Set the `nodes.json` review status for both rows to `draft`. Their other node copies are already draft. Add `metadata.taxonomyRole: "legacy_objective_aggregator"` to all three `1g` copies. Keep `1h` as a broad supplementary draft capability. Preserve their titles, descriptions, source references, kinds, IDs, blueprints, projections, queues, and edges.

This correction removes unsupported approved source authority. It does not change a standard-edge review decision.

## New atomic skills

### Order angles from side lengths

ID: `math.im2.skill.1.4.order-triangle-angles-from-side-lengths`

Title: `Order triangle angles from side lengths`

Description: `Use the side-angle relationship to order the angles of a triangle when three side lengths are given.`

Source: Lesson 1.4, combined `Examples 2 and 3`, Problems 6, 8, and 11.

### Order sides from angle measures

ID: `math.im2.skill.1.4.order-triangle-sides-from-angle-measures`

Title: `Order triangle sides from angle measures`

Description: `Use the side-angle relationship to order the sides of a triangle when angle measures are given.`

Source: Lesson 1.4, combined `Examples 2 and 3`, Problems 7, 9, and 10.

Both IDs must be unoccupied before implementation. Add each skill to `nodes.json`, `draft-nodes.json`, and the embedded node catalog in `edges.json`. Keep all copies equal and draft. Use only the committed Lesson 1.4 file in `sourceRefs`.

## Minimum relationships and projections

Add one direct draft `contains` edge from `math.im2.lesson.1.4` to each new skill. Use the Lesson 1.4 source file in `sourceRefs`. Set `derived: false`. State the exact input and requested ordering in each rationale.

Do not add an `appears_in_context` edge to `.014` or `.015`. Those legacy records do not identify the two prompt sets. Do not add a prerequisite between the new skills.

Add one source-only draft blueprint for each new skill. Use an empty `sourceNodeIds` array because no demonstrated solution exists. Use an empty renderer key and mode map. Add the existing generator exception. Set implementation status to unavailable and Independent practice readiness to false.

Add one inactive teacher-evidence row and one inactive spaced repetition system (SRS) row for each new skill. Do not claim a standard, prerequisite, generator, renderer, readiness, or SRS eligibility. Do not add either skill to the executable practice activity map.

## Exact implementation paths

1. `apps/integrated-math-2/curriculum/skill-graph/nodes.json`
2. `apps/integrated-math-2/curriculum/skill-graph/draft-nodes.json`
3. `apps/integrated-math-2/curriculum/skill-graph/edges.json`
4. `apps/integrated-math-2/curriculum/skill-graph/blueprints.json`
5. `apps/integrated-math-2/curriculum/skill-graph/projection/srs-input.json`
6. `apps/integrated-math-2/curriculum/skill-graph/projection/teacher-evidence-map.json`
7. `apps/integrated-math-2/__tests__/curriculum/module-1-source-mappings.test.ts`

Do not change the source lesson, `standard-edges.json`, review queues, gap queues, runtime code, or the executable activity map.

## Source tests

Extend `module-1-source-mappings.test.ts` to prove these facts:

- The source has exactly the headings `Example 1`, `Examples 2 and 3`, and `Example 4`.
- The combined group contains Problems 6 through 11 under one instruction.
- Problems 6, 8, and 11 provide three side lengths and request angle ordering.
- Problems 7, 9, and 10 provide angle measures and request side ordering.
- No separate native `Example 2` or `Example 3` heading exists.
- Each new skill occurs once in all three node catalogs. All copies are equal, draft, and source the Lesson 1.4 file.
- Each new blueprint has an empty source-node list and no generator or supported mode.
- Each new skill has exactly one direct lesson containment edge and no edge to `.014` or `.015`.
- `1g` remains the same skill ID and becomes a draft legacy objective aggregator in all three catalogs.
- `1h` remains the same broad supplementary skill ID and is draft in all three catalogs.
- All existing IDs, kinds, and edge IDs for `.013` through `.016`, `1g`, and `1h` remain present.
- The new teacher and SRS rows are inactive. Neither new skill appears in the executable activity map.
- Derived projection counts and metadata equal the actual arrays. Counts do not imply assessability or readiness.

## Later authored activity boundaries

The user has authorized authored solutions. Add them in a later, separate scope after this taxonomy is stable.

Create new worked-solution identities. Do not reuse `.013` through `.016`. One authored Worked activity can teach ordering angles from side lengths. A second authored Worked activity can teach ordering sides from angle measures. Each solution must show the side-angle correspondence and the final ordered list.

Add Guided practice only after each authored solution has a validated response contract, hints, grading, and deterministic replay. Add Independent practice only after it has distinct items, complete solutions, scoring, and failure recovery. Keep SRS eligibility false until the Independent contract and evidence path are accepted.

The authored content can use Problems 6 and 7 as source prompts. It must cite a separate authored-solution artifact for the demonstrated steps. Do not edit the restored native source to make it appear that the source included answers.

## Remaining uncertainty

The image descriptions give enough data to define the two capabilities. Exact answer order should be verified from the native figures before authored solutions or graders are accepted. This does not block the source-only atomic skill records.

## Independent count clarification

Derive edges.json metadata from its arrays. The existing actual totals are 793 nodes and 2026 edges. Existing metadata is stale at 789 and 2015. After adding the two atomic nodes and their two containment edges, require 795 nodes and 2028 edges. Do not increment stale metadata. Require 209 canonical skill, blueprint, teacher, and SRS records, 59 teacher standards gaps, one ready generator, and zero SRS-eligible skills. These are inventory totals. They do not establish readiness.
