# BM2 Unit 1 remaining source review

Date: 2026-09-07

## Scope

This review covers `math.bm2.skill.1.4` through `math.bm2.skill.1.11`. It compares the pending graph with the canonical Unit 1 source. It does not approve the graph or activate evidence.

## Lesson capability findings

### Lesson 4

The source objectives at `apps/bus-math-v2/lib/curriculum/generated/unit1-authored.ts:1383` require section identification, Current and Non-Current organization, subtotal calculation, and equation verification.

`math.bm2.skill.1.4` is a valid skill. Its title, `Build a classified balance sheet`, combines these steps into one product capability. The two spreadsheet activities can provide a reviewable artifact. Their `autoGrade: false` setting is consistent with teacher review. The mixed exit ticket can support individual parts. Its whole score does not prove the complete build.

### Lesson 5

The source objectives at line 1757 require error identification, missing-entry reasoning, and Conditional Formatting.

`math.bm2.skill.1.5` covers error identification and correction. It omits the spreadsheet rule capability. The mapped quizzes can grade selected error decisions. They do not prove that the learner corrected a ledger or applied Conditional Formatting. Keep whole-activity results away from complete application mastery.

### Lesson 6

The source objectives at line 2138 require an accuracy explanation, a Data Validation list, and zero-blank rules.

`math.bm2.skill.1.6` is a valid spreadsheet skill, but its title covers only the validation-rule build. The Guided fill-in-the-blank and exit ticket can prove selected rule knowledge. They do not prove that the learner configured a spreadsheet. A saved spreadsheet or equivalent configuration artifact is required for application evidence.

### Lesson 7

The source objectives at line 2513 require a clean Balance Sheet, a linked Assets-versus-Liabilities chart, and presentation layout.

`math.bm2.skill.1.7` combines chart creation and explanation. It omits the clean-sheet compilation and page-layout objectives. The spreadsheet activities can contain relevant artifacts, but `autoGrade: true` does not by itself prove linked formulas, print layout, or an explanation. The exit ticket proves only its exact questions.

### Lesson 8

The source objectives at line 2911 require a new-dataset workbook, the foundational build guide, and documented support needs.

`math.bm2.skill.1.8` is a valid product-build skill. Its only mapped activity, `unit-1-lesson-8-activity-1`, is a peer critique form. That form reviews a draft workbook. It does not create or submit the learner's assigned-data workbook. Remove it from exact build evidence unless the submission also binds the reviewed workbook artifact and ownership. A critique response can remain lesson work.

### Lesson 9

The source objectives at line 3051 require workbook polish, visual improvement, and a 60-second script.

`math.bm2.skill.1.9` is a valid revision skill. Its only mapped activity, `unit-1-lesson-9-activity-1`, records a script and reflection. It does not prove workbook revision or visual polish. It can provide exact evidence for the script objective only. Do not use the whole response as proof of model revision.

### Lesson 10

The source objectives at line 3175 require a public presentation, an evidence-based explanation, and a response to a question.

`math.bm2.skill.1.10` is a valid presentation skill. Its only mapped activity, `unit-1-lesson-10-activity-1`, is a debrief after the presentation. A debrief does not prove that the presentation occurred or that the learner answered a question. Teacher observation or a presentation artifact must establish this capability.

### Lesson 11

The source objectives at line 3299 define a multi-standard assessment. `math.bm2.skill.1.11` is an assessment aggregate. It is not one atomic skill. Preserve its ID. A later repair should represent it as a `task_blueprint` if the graph contract supports that kind. Otherwise, keep it as a non-mastery assessment container and map evidence to atomic Unit 1 skills by exact part.

The three tiered assessments contain questions for ACC-1.1 through ACC-1.7. A total score combines different capabilities. It cannot establish each capability or the complete aggregate. Each graded question can support only its named standard and exact response.

`unit-1-lesson-11-application-evidence` contains seven manual prompts. `application-1` explicitly requires a business event before and after it occurs and both equation checks. This prompt can support `math.bm2.skill.1.1.apply-accounting-equation` after teacher review. The whole reflection-journal submission also contains six unrelated prompts. Bind evidence to `application-1`, not to the whole activity result.

## Prerequisite findings

These relationships are source-supported:

- `1.2 -> 1.4`: account classification supports a classified Balance Sheet.
- `1.4 -> 1.5`: a Balance Sheet provides the data structure for error review.
- `1.2 -> 1.6`: category knowledge supports the A/L/E validation list.
- `1.4 -> 1.7`: the Balance Sheet totals supply the chart data.
- `1.7 -> 1.8`: Lesson 8 reuses the Lesson 7 product structure.
- `1.8 -> 1.9`: Lesson 9 revises the Lesson 8 draft.
- `1.9 -> 1.10`: Lesson 10 presents the polished workbook and script.

The edge `1.5 -> 1.6` is not a necessary prerequisite. Finding an error motivates validation, but the learner can build the validation rule without first completing the error-correction capability. Remove this edge unless a source task explicitly consumes the corrected Lesson 5 artifact.

The edge `1.6 -> 1.7` is a workflow dependency only when Lesson 7 uses the validated ledger. Replace the generic rationale with that exact data dependency. Do not claim that Data Validation is a mathematical prerequisite for chart creation.

The seven direct edges to `1.11` describe assessment coverage. They are not normal learning prerequisites. If `1.11` becomes a task blueprint, use the graph relationship that means the assessment contains or measures these capabilities. Do not use prerequisite edges as an evidence fan-in shortcut.

## One-node-per-lesson limit

Lessons 4 through 10 each contain three objectives. One node compresses product creation, explanation, validation, formatting, or presentation into one label. This loses atomic readiness information. It also makes a whole-activity score appear stronger than it is.

Do not add nodes only to reach a count. Add an atomic skill only when the source has a distinct learner response and the product needs separate readiness or evidence. Preserve all current IDs during that work.

## README corrections

`apps/bus-math-v2/curriculum/skill-graph/README.md` currently says that each of 89 nodes names a capability from reviewed lesson objectives. Replace this claim with a precise statement: the graph has one candidate primary capability for each published lesson, and some lesson objectives still need atomic review.

The README also calls the accounting-equation learning-evidence pilot active. The current publication gate is closed. The selected event content and writer are draft. State that adaptive updates remain disabled and that the selected pilot cannot run until node, blueprint, activity, writer, and teacher-review publication checks pass.

Keep the existing warning about manual review. Clarify that a published lesson activity is not automatically exact-node evidence.

## Next repair scope

1. Keep all existing IDs.
2. Remove or narrow the incorrect Lesson 8, 9, and 10 whole-activity evidence mappings.
3. Bind Lesson 11 evidence by exact part. Start with `application-1` for the selected simple-event skill.
4. Remove `1.5 -> 1.6` unless a direct artifact dependency is found.
5. Replace the `1.6 -> 1.7` rationale with the validated-ledger dependency.
6. Decide whether `1.11` is a task blueprint or a non-mastery assessment container.
7. Review missing atomic objectives in small lesson batches.
8. Correct the README claims after the graph tests state the new boundary.

This review advances Task 3.5. It does not accept the complete 89-row catalog.

## Lesson 8 through 10 implementation result

The bounded repair removes `unit-1-lesson-8-activity-1`, `unit-1-lesson-9-activity-1`, and `unit-1-lesson-10-activity-1` from exact-skill blueprint metadata and the evidence projection. The published curriculum keeps all three physical activities and stable IDs.

The README now describes one candidate primary capability for each lesson. It records that some objectives still need atomic review. It also states that the selected pilot is gated and draft, and that a published activity is not automatically exact-node evidence.

The new project-evidence boundary test first failed three tests. It then passed three tests after the mapping repair. The selected Lesson 1, publication, and capability graph tests also passed. All 12 focused tests passed. The BM2 lint, TypeScript check, and production build passed.

## Parent contract check

The shared `knowledge-space.v1` contract supports `task_blueprint`. Its `contains` rule does not permit a task blueprint as the source. Do not replace assessment prerequisite edges with unsupported `contains` edges. The current contract has no dedicated `measures` relationship.

A future Lesson 11 repair can preserve its stable ID and classify it as a task blueprint. It must remove skill-readiness claims and bind assessed capabilities through the existing exact-part evidence mechanism. This does not require a new graph edge type. The present bounded repair does not change the Lesson 11 kind or add a relationship.

### Lesson 11 assessment aggregate correction

The bounded correction preserves `math.bm2.skill.1.11`. It changes the node kind to `task_blueprint`. The title and description now identify the Unit 1 multi-standard assessment.

The correction removes the seven prerequisite edges that ended at the assessment aggregate. It does not add a `contains` edge or a new edge type. The shared contract does not permit a `task_blueprint` as the source of `contains`.

The correction removes the four whole-activity exact-node mappings from the blueprint metadata and the practice projection. The published Lesson 11 activities remain in the curriculum manifest. Future evidence must identify an exact assessed part and an atomic skill. This correction does not create that mapping.

The graph now has 88 candidate skill nodes and one assessment task for 89 published lessons. This correction does not approve the graph or activate adaptive updates.
