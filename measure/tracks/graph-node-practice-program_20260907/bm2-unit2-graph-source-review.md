# BM2 Unit 2 graph source review

Date: 2026-09-07

## Scope

This review covers `math.bm2.skill.2.1` through `math.bm2.skill.2.11`. It compares the pending graph with the current authored and published Unit 2 curriculum. It does not approve the graph. It does not activate adaptive updates.

The primary source for Lessons 1 through 7 is `apps/bus-math-v2/lib/curriculum/reviewed-instruction.json`, lines 2 through 100. The project and assessment source is `apps/bus-math-v2/lib/curriculum/generated/wave1-authored.ts`, lines 16 through 159. The published manifest combines these sources into 11 lessons.

## Source inventory

Before the correction below, the graph had 11 Unit 2 nodes. All 11 nodes had kind `skill`. The activity projection had 26 Unit 2 rows. After the correction, Unit 2 has ten skill candidates, one assessment task, and 24 projection rows.

Lessons 1 through 7 each have three mapped activities. Each lesson has one guided numerical question, one assessment numerical question, and one workbook reflection. Lessons 8 through 10 each have one mapped group-project reflection. Lesson 11 has one seven-question assessment and one mini-ledger reflection.

All projected rows have `srsEligible: false`. This prevents direct spaced repetition system eligibility. It does not make a broad activity exact evidence for a broad node.

## Lessons 1 through 7

The seven node titles match the primary objectives in `reviewed-instruction.json`:

- `math.bm2.skill.2.1` matches line 4.
- `math.bm2.skill.2.2` matches line 18.
- `math.bm2.skill.2.3` matches line 32.
- `math.bm2.skill.2.4` matches line 46.
- `math.bm2.skill.2.5` matches line 60.
- `math.bm2.skill.2.6` matches line 74.
- `math.bm2.skill.2.7` matches line 88.

These rows are valid primary capability candidates. They do not represent all assessable work in each lesson. The published lesson also requires a spreadsheet calculation and saved explanation. Keep those products separate from the accounting capability unless a rubric proves the exact accounting action.

The current numerical checks do not prove the complete node claims:

- `math.bm2.skill.2.1`: The questions give the account and debit or credit side. The learner supplies only an amount. This does not prove that the learner can select the debit and credit effects.
- `math.bm2.skill.2.2`: The questions provide a written event. They do not present a source document, ask for its event date, or ask the learner to identify the transaction.
- `math.bm2.skill.2.3`: The questions name the account and ask for one amount or one remaining balance. They do not require a complete balanced journal entry.
- `math.bm2.skill.2.4`: The questions support calculation of ending ledger balances. They do not require posting journal entries or retaining journal references.
- `math.bm2.skill.2.5`: The questions support a missing-credit calculation and the fact that an omitted balanced transaction leaves a zero column difference. They do not require preparation of a trial balance or a written interpretation.
- `math.bm2.skill.2.6`: The questions support the error magnitude and corrected amount. They do not prove source tracing, error location, or a correct posting repair.
- `math.bm2.skill.2.7`: The questions support net-income calculation and exclusion of loan proceeds from revenue. They do not require the learner to explain the profit effect.

The generic workbook prompts require a link, formula, result, input change, and explanation. They do not name the exact required accounting records. A saved workbook proves participation. A teacher can grant exact evidence only when a rubric checks the stated capability in the submitted artifact.

The minimum later repair must keep the physical activities. It must either narrow each mapped evidence claim to the exact numerical part or add atomic candidate nodes for the tested actions. It must not treat the full quiz or generic workbook submission as proof of each broad accounting capability.

## Lessons 8 through 10

The source defines a three-day group project:

- Lesson 8 applies rules to Sarah's data and produces group ledger version 1.0. See `wave1-authored.ts`, lines 108 through 119.
- Lesson 9 performs peer review and produces group ledger version 2.0 with a checklist. See lines 121 through 132.
- Lesson 10 finalizes and presents the group ledger and income statement. See lines 134 through 145.

`math.bm2.skill.2.8`, `math.bm2.skill.2.9`, and `math.bm2.skill.2.10` each combine multiple accounting, spreadsheet, collaboration, and presentation actions. Their current group reflection activities record broad project evidence. They do not prove one atomic skill.

Preserve the stable IDs. Treat these rows as project-stage aggregate candidates. A bounded repair can classify them as `task_blueprint` after the same consumer check used for the Unit 1 assessment aggregate. Remove whole reflection activities from exact mastery projections. Keep the physical project activities in the published lesson. Add exact-part evidence only after a source rubric identifies the assessed atomic skill.

The edges `2.7 -> 2.8`, `2.8 -> 2.9`, and `2.9 -> 2.10` mostly encode schedule order. The Lesson 8 project uses capabilities from across Lessons 1 through 7. Profit explanation alone is not its full prerequisite. Do not replace the current edge with seven readiness gates until project eligibility has a reviewed contract. If the rows become task aggregates, remove workflow-order edges from the skill prerequisite graph.

## Lesson 11

The source calls Lesson 11 an individual mastery check with a quiz and mini build. It covers classification, posting, formulas, and a mini ledger. See `wave1-authored.ts`, lines 147 through 158.

`math.bm2.skill.2.11` is an assessment aggregate. It is not one atomic skill. Preserve its stable ID. Change its kind to `task_blueprint` in a bounded repair if current consumers continue to support that kind.

The seven numerical questions repeat the final numerical checks from Lessons 1 through 7. Each question can support only its exact calculation. The full assessment result cannot prove one `math.bm2.skill.2.11` skill. The mini-ledger reflection requires teacher review and exact-part attribution.

Remove the seven incoming prerequisite edges from Unit 2 skills to `math.bm2.skill.2.11`. They encode assessment coverage or eligibility, not a learned capability dependency. Do not add a `contains` edge from the task blueprint. The current graph contract does not permit that source kind for `contains`. The contract has no `measures` edge.

Remove `unit-2-lesson-11-mastery` and `unit-2-lesson-11-model-proof` from exact aggregate projection and blueprint activity mappings. Preserve both physical assessment activities. A later exact-part mapping can connect each question or reviewed mini-ledger part to its atomic skill.

## Other prerequisite findings

The edge `math.bm2.skill.2.1 -> math.bm2.skill.2.2` is not supported as a capability dependency. A learner can identify an event and its date from a source document before the learner assigns debit and credit effects. Remove this sequence edge.

The edge `math.bm2.skill.1.2 -> math.bm2.skill.2.1` is incomplete. The Unit 1 node covers asset, liability, and equity classification. The Unit 2 source also requires revenue and expense normal-balance rules. Do not use the current edge as proof that all DEA LER classification readiness exists. Review an atomic normal-balance capability before this edge becomes a readiness gate.

The edges `2.1 -> 2.3`, `2.2 -> 2.3`, `2.3 -> 2.4`, and `2.4 -> 2.5` have a defensible accounting dependency. Debit and credit rules plus event identification support journal entry preparation. Journal entries support ledger posting. Ledger balances support trial-balance preparation.

The edge `2.5 -> 2.6` has limited support. An unequal trial balance can signal some posting errors, but a balanced trial balance does not prove that postings are correct. Keep this edge only if its rationale states detection support and does not claim complete error coverage.

The edges `2.3 -> 2.7` and `2.5 -> 2.7` are plausible. Profit calculation uses revenue and expense entries and their ledger totals. Their current rationales need this specific source basis.

The cross-unit edges `2.3 -> 4.1` and `2.3 -> 6.1` are not supported by the reviewed Unit 2 source. Journal-entry preparation is not a demonstrated prerequisite for identifying payroll values or reconciling inventory units. Review the destination sources before keeping these edges. The edge `2.5 -> 3.1` also needs destination-source proof. Unit 3 starts from the prior ledger, but connecting profit to equity does not necessarily require preparation of a complete trial balance.

## Minimum next repair

Use two bounded changes:

1. Correct Lesson 11 first. Preserve its ID. Change it to `task_blueprint`. Remove the seven incoming prerequisite edges and the two whole-activity exact mappings. Add a source regression test. Do not create a new edge type.
2. Review Lessons 8 through 10 as project aggregates. Preserve their IDs and physical activities. Remove broad project reflections from exact mastery mappings. Decide their node kinds after a consumer test. Keep exact-part mapping pending a teacher rubric.

After these changes, review Lessons 1 through 7 one lesson at a time. Separate the broad accounting objective from each narrow numerical check. Do not rewrite all Unit 2 rows in one batch.

## Unit 2 Lesson 11 correction disposition

The bounded correction preserves `math.bm2.skill.2.11`. It changes the node kind to `task_blueprint`. The title and description now identify the transaction-flow mastery check and its classification, posting, formula, and mini-ledger scope.

The correction removes the seven prerequisite edges that ended at the assessment aggregate. It adds no replacement edge. The correction also removes `unit-2-lesson-11-mastery` and `unit-2-lesson-11-model-proof` from the blueprint activity list and exact-node projection.

Both physical assessment activities remain in the published curriculum. Future evidence must identify an exact question or reviewed mini-ledger part and an atomic skill. This correction does not add that mapping. It does not approve the graph or activate adaptive updates.

The parent checked the original generated lesson source at lines 147 through 158 and compared the correction with the exact before-copies. Only the assessment node and its blueprint changed. Exactly seven edges and two projections were removed. No new edge or projection was added. The pending full catalog still contains unreviewed semantic claims in other units. This bounded review does not authorize catalog-wide acceptance.

Verification: the author passed 107 related tests, full app lint, and standalone TypeScript. The parent passed eleven tests for both assessment aggregates and the published-curriculum projection consumer. No production build was run for this bounded catalog repair. The catalog files and new tests remain pending integration with the complete catalog review.
