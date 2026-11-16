# IM1 G33 implementation independent review

## Disposition

The candidate is not ready for integration. The graph inventory is internally consistent. The lesson source restoration is incomplete. The focused tests do not detect this loss.

This review does not approve a node, blueprint, relationship, generator, activity, or standard alignment.

## Blocking findings

### P1. The extracted lesson removes required source prompts

`apps/integrated-math-1/curriculum/modules/module-7-lesson-1` changes from 286 lines to approximately 80 answer-summary lines. It does not restore the complete worksheet content that the accepted proposal requires.

Problems 17 and 18 are the clearest counterexamples. The original DOCX gives the aviation rates, starting altitudes, table capacities, total seats, and table-count relation. It asks the learner to define variables, write systems, and solve. The candidate replaces these prompts with finished equations and answers. This removes the evidence for `write-a-two-equation-system-from-a-context`. It also makes the lesson unusable for that operation.

Problems 30-39 are reduced to one sentence. The original worksheet supplies the individual systems and asks the learner to graph, solve, and classify them. The candidate omits those systems. Similar summaries replace several later prompts and figures. Accessible answer notes can supplement the source. They cannot replace the givens and learner actions.

Minimum correction: restore the complete prompt content for Problems 1-51. Preserve the verified answers and accessible figure descriptions as separate solution or review notes. Extend the source test to assert representative original givens and actions, including Problems 17, 18, 30, and 39.

### P1. The revised example source references are false

All seven worked-example nodes use `module-7-class-period-plan.md (7-1, Example 1)` through `Example 7`. The class-period plan has only two Lesson 7-1 rows. It groups worksheet Examples 1-3 under 7a and Examples 4-7 under 7b. It does not contain the worksheet headings “Examples 1 and 2” through “Example 10.”

This is material for `.004-.007`. For example, `.005` is titled worksheet “Example 8,” but its reference claims class-plan “Example 5.” The `exampleNumber` values also retain 1-7 while the titles claim worksheet groups through Example 10. Historical metadata can retain a legacy number only when it is labeled as historical. It cannot serve as exact current source identity.

Minimum correction: cite the exact DOCX or extracted Lesson 7-1 heading for each node. Do not claim a nonexistent class-plan example. Keep stable node IDs unchanged. Clarify or remove ambiguous legacy `exampleNumber` metadata according to the existing source identity contract.

## Verified graph findings

The 12 proposed capability boundaries and source-node mappings match the accepted proposal. The eight worked-source mappings are exact. The four mixed-only blueprints have empty `sourceNodeIds`.

All 12 new skills are draft and `independentPracticeReady: false` in the four graph catalogs. The seven changed worked examples and the legacy 7a aggregate are draft. The blueprints are source-only and have no mode specification keys.

The candidate adds 13 draft `contains` edges. Twelve edges target the new candidates. One edge reuses the existing line-graphing skill. It adds no prerequisite or equivalence edge for the new candidates. It preserves every prior node ID and graph edge ID.

The standard-edge artifact adds no standard edge. Its 931 alignment edges remain. The candidate removes three legacy placeholder practice activities. It changes no other practice activity. It adds 12 inactive SRS rows and changes only the legacy 7a SRS row to `generatorReady: false`. It adds 12 teacher planning rows.

The reported totals match the candidate structure. These totals do not resolve the source-content blockers.

## Test gap

The new source test checks a few answer substrings, lifecycle states, and counts. It does not check complete learner prompts. It also accepts the incorrect class-plan references because it checks titles only. A passing five-test result is not sufficient evidence of source fidelity.
