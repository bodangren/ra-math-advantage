# BM2 Unit 3 graph source review

Date: 2026-09-07

## Scope

This review covers `math.bm2.skill.3.1` through `math.bm2.skill.3.11`. It compares the pending graph with the current reviewed instruction, Wave 1 source, and published curriculum. It does not approve the graph or activate adaptive updates.

The reviewed numerical source is `apps/bus-math-v2/lib/curriculum/reviewed-instruction.json`, lines 102 through 200. The project source is `apps/bus-math-v2/lib/curriculum/generated/wave1-authored.ts`, lines 161 through 304.

## Inventory

The graph has 11 Unit 3 nodes. All 11 nodes have kind `skill`. The activity projection has 26 Unit 3 rows.

Lessons 1 through 7 each have a guided numerical check, an assessment numerical check, and a workbook reflection. Lessons 8 through 10 each have one group-project reflection. Lesson 11 has a seven-question assessment and a model-proof reflection.

All 26 rows have `srsEligible: false`. This blocks direct spaced repetition eligibility. It does not make a broad activity exact evidence for a broad node.

## Source authority conflict

The reviewed instruction and Wave 1 source do not define the same Lesson 1 through 7 sequence.

- Wave 1 Lesson 1 connects Income Statement and Balance Sheet concepts. The reviewed source narrows this to profit and retained earnings.
- Wave 1 Lesson 2 reviews temporary and permanent accounts and the closing process. The reviewed source instead builds an income statement.
- Wave 1 Lesson 3 builds linked Balance Sheet and Income Statement worksheets. The reviewed source instead calculates ending retained earnings.
- Wave 1 Lesson 4 links net income to retained earnings. The reviewed source instead reconciles operating profit with operating cash.
- Wave 1 Lesson 5 builds an operating cash summary. The reviewed source instead checks statement balance consistency.
- Wave 1 Lesson 6 analyzes cash effects of key accounts. The reviewed source instead repairs a broken statement link.
- Wave 1 Lesson 7 troubleshoots linked statements. The reviewed source instead supports a financial explanation with statement evidence.

The published manifest uses the reviewed numerical objectives and checks for Lessons 1 through 7. It keeps Wave 1 lesson titles and project structure. The graph titles therefore match the current published manifest, but they do not prove that Wave 1 objectives received a source review.

Resolve this source authority before catalog approval. Do not silently treat the reviewed numerical sequence as a review of the different Wave 1 objectives. Preserve both sources in the review record and choose which source controls lesson identity.

## Numerical evidence boundaries

The current checks prove narrower actions than the node titles:

- `math.bm2.skill.3.1`: The checks calculate net income and ending retained earnings. They support the numerical link. They do not prove date consistency or a complete Balance Sheet link.
- `math.bm2.skill.3.2`: The checks calculate gross profit and net income. They do not require a complete income statement or account selection.
- `math.bm2.skill.3.3`: The checks calculate ending retained earnings and update it after an income change. They do not prove a live spreadsheet link.
- `math.bm2.skill.3.4`: The checks calculate operating cash from stated adjustments. They support a numerical reconciliation. They do not require explanation of the adjustment signs.
- `math.bm2.skill.3.5`: The checks calculate required ending cash and an absolute difference. They do not inspect two actual statement links or locate the cause of a difference.
- `math.bm2.skill.3.6`: The checks calculate net income before and after an expense change. They do not require repair of a broken formula or linked cell.
- `math.bm2.skill.3.7`: The checks calculate operating cash. They do not require a financial explanation, evidence citation, or recommendation.

The workbook prompts ask for a link, formulas, values, an input change, and an explanation. They use generic text. A saved response proves participation. A teacher must inspect the exact workbook cells and explanation before granting the broad node evidence.

A later repair must map each automatic question to its exact numerical action. It can add atomic candidate nodes or narrow the evidence claim. It must not use the complete quiz score as proof of spreadsheet construction, link repair, or explanation quality.

## Project aggregates

Wave 1 defines a three-day group project:

- Lesson 8 finalizes a two-statement workbook. See lines 253 through 264.
- Lesson 9 integrates visuals and commentary. See lines 266 through 277.
- Lesson 10 presents the results and collects peer feedback. See lines 279 through 290.

`math.bm2.skill.3.8`, `math.bm2.skill.3.9`, and `math.bm2.skill.3.10` each combine accounting, spreadsheet, collaboration, and communication work. They are project-stage aggregates. Preserve their stable IDs. Review them as `task_blueprint` candidates.

Their reflection activities record broad project evidence. They do not prove one atomic skill. Remove whole reflection activities from exact mastery mappings in a bounded correction. Preserve the physical project activities. Add exact-part evidence only when a teacher rubric identifies a specific assessed skill.

The edges `3.7 -> 3.8`, `3.8 -> 3.9`, and `3.9 -> 3.10` encode workflow order. Lesson 8 uses several earlier capabilities, not only financial explanation. If these rows become task aggregates, remove the workflow-order edges from the skill prerequisite graph. Do not replace them with a new edge type.

## Lesson 11 assessment aggregate

Wave 1 calls Lesson 11 an individual post-assessment. It includes a linked-statement mastery check, a short repair exercise, and a reflection. See lines 292 through 303.

`math.bm2.skill.3.11` is an assessment aggregate. It is not one atomic skill. Preserve its stable ID. Change its kind to `task_blueprint` after the current consumer check.

The seven automatic questions repeat the final numerical checks from Lessons 1 through 7. Each result can support only its exact numerical action. The whole assessment does not prove one aggregate skill. The model-proof reflection requires teacher review and exact-part attribution.

Remove the seven incoming prerequisite edges to `math.bm2.skill.3.11`. These edges encode assessment coverage or eligibility. They do not encode a learned capability dependency. Remove `unit-3-lesson-11-mastery` and `unit-3-lesson-11-model-proof` from the aggregate blueprint and projection mappings. Preserve both published activities.

Do not add a `contains` edge from a task blueprint. The graph contract does not permit that source kind for `contains`. The contract has no `measures` edge.

## Prerequisite findings

The edge `2.5 -> 3.1` needs source proof. The Wave 1 launch reviews the Unit 2 ledger, but the reviewed `3.1` calculation uses revenue, expenses, retained earnings, and distributions. Preparation of a complete trial balance is not shown as the exact prerequisite.

The edge `3.1 -> 3.2` appears to encode lesson order. A learner can build an income statement before linking profit to the Balance Sheet. Reverse or remove this edge after source authority is resolved.

The edge `3.2 -> 3.3` is defensible. Net income from the Income Statement is an input to ending retained earnings.

The edge `3.3 -> 3.4` is weak. Operating cash reconciliation starts from net income, but it does not require the equity distribution calculation. A dependency from an exact net-income capability would be more accurate.

The edges `3.4 -> 3.5`, `3.5 -> 3.6`, and `3.6 -> 3.7` reflect the reviewed sequence. Their current broad node titles make the dependency stronger than the numerical evidence. Keep them pending atomic review.

The cross-unit edge `3.4 -> 7.1` is plausible because both sources distinguish financing cash from revenue or operating cash. Its destination source must confirm that operating-cash reconciliation is required, rather than only transaction classification.

The cross-unit edges `3.6 -> 8.1` and `3.6 -> 9.1` are not proved by Unit 3. Repairing one broken statement link is not a demonstrated prerequisite for defining all model inputs and outputs or defending a complete recommendation. Review the destination sources before keeping them.

## Minimum next repair

1. Correct Lesson 11 first. Preserve its ID. Change it to `task_blueprint`. Remove seven incoming prerequisite edges and two whole-activity mappings. Preserve the physical assessment activities.
2. Review Lessons 8 through 10 as project aggregates. Preserve their IDs. Remove broad reflection mappings from exact mastery. Decide their kinds after a consumer test.
3. Resolve the reviewed-instruction and Wave 1 source conflict for Lessons 1 through 7.
4. Review one lesson at a time. Separate exact numerical evidence from spreadsheet construction, link behavior, and teacher-reviewed explanations.

Do not rewrite all Unit 3 rows in one batch.
