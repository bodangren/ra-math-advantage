# First Batch Independent Review

Date: 2026-09-07.

This review checks the proposed shared runtime corrections against the current code and course artifacts. It does not approve curriculum content or graph rows.

## Review decision

The concept projection correction is safe if the projector emits rows only for a blueprint that directly belongs to the emitted skill. The empty-spec and per-mode renderer changes are also safe with the compatibility corrections below.

The proposed equivalence filter needs one design correction before implementation. A course-local projection does not contain the foreign endpoint nodes for cross-course edges. A strict endpoint lookup against only the supplied course nodes will remove all cross-course equivalence data, including future approved edges.

## Finding 1: Concept projection must require a direct skill blueprint

The current working-tree change in `packages/knowledge-space-practice/src/projections/activity-map.ts` skips concept nodes. It keeps the blueprint node ID as the activity node ID. This removes the unsafe concept-to-child fan-out.

This behavior is correct for learning evidence. A concept blueprint does not prove that the prompt and grading rules assess each child skill. A child skill needs its own `KnowledgeBlueprint` with `nodeId` equal to that child skill ID.

The proposed rule and the current code differ on `task_blueprint`. The runtime review says to emit only for a skill in its numbered rules. The current code also emits for `task_blueprint`. Existing public types and comments describe task blueprints as projectable. Removing task-blueprint projection would be a separate compatibility change. Keep `task_blueprint` support unless a source review rejects it. Apply the strict child-owned rule to concepts only.

`findChildSkills` and `selectSkill` are public exports. Do not delete them only because `projectActivityMap` stops using them. Search external package consumers before removal. Their existing tests can remain as structural helper tests. Replace only tests that expect the projector to fan out concept content.

Safe conclusion: emit a concept blueprint as zero activities. Emit a child skill only from that child's exact blueprint. Preserve task-blueprint behavior in this batch.

## Finding 2: Existing Zod parsing is the correct projection boundary

The working-tree projector now calls the existing modality schemas with `safeParse`. This is safer than a second manual definition of “empty.” It also prevents typed callers that bypass top-level blueprint parsing from projecting malformed modality objects.

The current schemas require a non-empty Worked prompt, at least one Worked step, and a non-empty Worked explanation. The Guided and Independent schemas permit empty arrays and records. This is the current contract for this batch.

Reuse the existing sub-schemas without stricter constraints. Do not add new minimum lengths, record refinements, or trimming rules in this correction. Such changes would alter the authoring contract and need separate approval.

The projector should keep `safeParse` as its single structural check. Do not duplicate the Zod rules in local `isEmpty*` functions. A duplicated rule can drift from authoring validation.

Compatibility effect: `safeParse` suppresses only content that fails the existing schema. It does not redefine an empty Guided or Independent specification.

## Finding 3: Per-mode renderer selection is compatible

The current projector previously selected one key for all modes in this order: `rendererKey`, Independent map value, Guided map value, Worked map value, and then `default`. That could assign an Independent component to a Worked row.

The proposed selection is correct:

- Worked uses `rendererModeMap.worked` and then `rendererKey`.
- Guided uses `rendererModeMap.guidedPractice` and then `rendererKey`.
- Independent uses `rendererModeMap.independentPractice` and then `rendererKey`.
- No key means no row.

Do not emit `default`. No shared runtime registration for that synthetic key was found.

The `rendererModeMap` keys are component keys. They are not the application runtime modes `teaching`, `guided`, and `practice`. Preserve the existing application conversion.

One validation gap remains. `validateRendererCompatibility` checks only `rendererKey`. It does not validate renderer keys in `rendererModeMap`. A blueprint can pass this helper and later project an unknown per-mode key. Extend the existing helper or its caller to check every non-empty mode-map value through the same adapter. Do not create another registry.

## Finding 4: Approved equivalence filters need a complete endpoint catalog

`projectSrsInputs` currently includes every incident `equivalent_to` edge. It does not check edge status, endpoint kind, endpoint status, or endpoint presence. `projectTeacherEvidence` does the same for each skill and for connected components.

Requiring all of these conditions is safe:

- `edge.reviewStatus === 'approved'`
- both endpoints exist
- both endpoints have `kind === 'skill'`
- both endpoints have `reviewStatus === 'approved'`

However, the functions receive one `nodes` array. Course callers often supply only the local course graph while equivalence edges can point to a different course. A strict lookup against this local array treats the foreign endpoint as missing. It will remove the equivalence even when the edge and both canonical endpoints are approved elsewhere.

Use one of these existing-data options:

1. Call the projection with a merged course-series node catalog when cross-course equivalence data is required.
2. Add an optional complete endpoint catalog parameter to the existing projection functions. Keep the local `nodes` parameter as the rows to project.

Do not approve a foreign endpoint from its ID prefix. Do not accept missing endpoint data. Do not add a second stored equivalence registry.

The filter must run before `projectTeacherEvidence` builds its equivalence adjacency map. Otherwise, a rejected or draft edge can still merge two approved components through a transitive path.

The proposed filter is intentionally strict. Most current cross-course edges and many current skill nodes are draft or reviewed. Their omission is the correct safety result. It will cause large stored-projection deletions. Review these deletions as policy effects.

## Finding 5: Equivalence filtering does not fix draft prerequisites and standards

The SRS projector also copies every `prerequisite_for` and `aligned_to_standard` edge. The teacher projector does the same. The current graph review found draft sequence prerequisites that can be false. Filtering only equivalence edges leaves these draft relationships visible in SRS inputs, teacher skill coverage, standard coverage, and prerequisite gaps.

Do not expand this batch without a stated contract decision. At minimum, tests must show that the new equivalence filter does not imply that all other relationship types are approved. Before these projections control learning decisions, prerequisite edges need their own reviewed or approved policy. Standard reporting also needs an explicit status policy.

## Finding 6: SRS readiness remains independent from modality validity

The current working-tree SRS change sets `generatorReady` only from `node.independentPracticeReady`. This removes the old inference from a present Independent spec or generator key. That is a safe fail-closed change.

The SRS projector does not check that the Independent spec passes Zod, that a generator exists, that `generated_by` exists, or that a renderer exists. Thus `independentPracticeReady: true` remains an asserted graph flag. Do not treat the SRS row as proof that Independent practice works. Pilot acceptance still needs the generator, renderer, server grader, and exact-node evidence checks.

## IM1 source conclusion

The earlier conclusion that the IM1 pilot lacks objective source evidence was too broad. The capability itself has clear authored support:

- `apps/integrated-math-1/curriculum/module-1-class-period-plan.md` assigns objective `1a` to Lesson 1.1, Examples 1 and 2.
- `apps/integrated-math-1/curriculum/modules/module-1-lesson-1` contains “Example 1 — Write Numerical Expressions from Verbal Descriptions” and “Example 2 — Verbal Expressions with Sum, Difference, Product, and Quotient.”
- `apps/integrated-math-1/convex/seed/seed_module_1_lessons.ts` contains the same examples and concrete translations.

The actual defect is graph provenance. The blueprint for `math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express` has an empty `sourceNodeIds` list. The node cites only the general class-period plan. The graph has no exact worked-example mapping for this blueprint.

There is also a canonical-copy conflict. The standalone node is `approved`. The embedded copy in `edges.json` is `draft`. Its standard, containment, context, and lesson-sequence prerequisite edges are draft. The low-confidence lesson-sequence prerequisite must not control readiness.

Safe conclusion: keep the candidate capability. Add exact source-example identity for Lesson 1.1 Examples 1 and 2. Reconcile the node copy status through the canonical graph process. Do not approve the blueprint or runtime from the source text alone.

## IM2 source conclusion

The IM2 pilot has exact source support:

- `apps/integrated-math-2/curriculum/modules/module-1-lesson-1`, Example 1, gives the same D, AB, DA, and DB problem as the blueprint.
- The source states `DA = DB`, `x = 4`, and both distances equal 14 cm.
- `apps/integrated-math-2/curriculum/module-1-class-period-plan.md` assigns this example to the perpendicular-bisector lesson.
- `apps/integrated-math-2/curriculum/source/module-1-problem-types.md` states the equidistance theorem and also contains broader proof material.

The atomic node `math.im2.skill.1.1.perpendicular-bisector-equidistance` correctly limits the activity to solving an equal-distance equation. It must remain separate from `math.im2.skill.1.1.apply-properties-of-circumcenters-and-perpendicular-bisector`, which includes broader application and proof scope.

The source node mapping to `math.im2.example.1.1.001` is present. The open defects are runtime and approval state. The node and blueprint are draft. `independentPracticeReady` is false. The runtime status is `not_connected_to_graph_practice`. The graph projection contains no activity rows.

Safe conclusion: retain the atomic node and exact source mapping. Connect and test its current three-mode bundle. Do not grant full `G-CO.C.9` proof mastery from the numeric response.

## Required tests before integration

- A concept blueprint emits no activity.
- A direct child blueprint emits only the child's rows and identity.
- A task-blueprint fixture preserves its current projectable behavior.
- Each present modality passes its current shared sub-schema before projection.
- Each mode selects only its own renderer-map key or the base renderer fallback.
- An unknown per-mode renderer key fails compatibility validation.
- Draft, reviewed, rejected, missing-endpoint, concept-endpoint, and non-approved-skill equivalence cases are excluded.
- An approved cross-course edge survives when the complete endpoint catalog is supplied.
- Teacher equivalence components cannot connect through a filtered edge.
- IM1 source mapping uses exact Lesson 1.1 examples.
- IM2 evidence stays on the atomic equidistance node.

These conclusions approve only the implementation direction. Curriculum approval still requires independent source and mathematical review for each row.

## Review of the first source changes

The review compared the current files with these saved baselines:

- `/tmp/component-runtime-activity-map.ts.before`
- `/tmp/graph-program-before-srs.ts`
- `/tmp/graph-program-before-teacher-evidence.ts`

The equivalence source changes implement the requested edge and endpoint status filters. The activity projector implements concept skipping, exact node identity, per-mode renderer selection, and schema-based modality skipping.

Three actionable gaps remain before commit.

### A. The new activity fixture is valid but weak

`packages/knowledge-space-practice/src/__tests__/activity-map-identity.test.ts` creates its normal blueprint with empty Guided arrays, an empty Independent `answerSchema`, and empty Independent `gradingRules`. The first test expects all three rows.

This fixture is valid under the approved current schemas. No stricter Zod constraints are part of this batch. The test therefore supports the implemented projection rule.

For stronger test evidence, add one step prompt, hint, check, answer key, and matching grading rule to the normal fixture. This is test-quality advice. It is not a correctness blocker.

### B. Existing concept fan-out tests still assert the rejected behavior

`packages/knowledge-space-practice/src/__tests__/projections.test.ts` still contains the FR-13 fan-out tests, including the one-child and multiple-child cases near lines 666 through 899. These tests contradict the new exact-blueprint rule. They must be replaced or rewritten before the package suite can be Green.

Do not keep both behaviors behind fixture-specific conditions. The projector must have one rule: a concept blueprint emits no rows.

### C. The equivalence implementation is correct only for a complete supplied catalog

The new code builds `acceptedSkillIds` from the supplied `nodes` array. The last test includes a missing foreign target node. Thus it covers a course-local node array plus an edge whose foreign target is absent.

Under the current signature, the safe result for a missing endpoint is exclusion. Keep that behavior. Add a separate missing-source case with an approved target if symmetric endpoint behavior needs direct regression coverage. The implementation checks both endpoint IDs through the same accepted-skill set, so this extra case is useful but is not a correctness blocker.

Also record the caller contract: a consumer that needs approved cross-course equivalence must supply the complete endpoint catalog. If current course projection callers supply only local nodes, their equivalence lists will intentionally be empty. Do not present this as proof that no approved cross-course relationship exists.

No correctness defect was found in the new filtering order. `projectTeacherEvidence` filters before it builds adjacency. A draft bridge cannot merge two approved equivalence components.

## Parser change review

`packages/math-content/src/knowledge-space/extraction/parser.ts` now splits a table only on a pipe with whitespace on both sides. This preserves bare absolute-value bars such as `|expression|` and `|x - a|` inside a cell.

The shared table parser serves only the `Period-by-Period Plan` and ALEKS `Registry` sections. I checked the current Integrated Math 1, Integrated Math 2, Integrated Math 3, Precalculus class-period plans, and the ALEKS registry. Their header and data delimiters use spaces around each pipe. Some cells contain compact absolute-value bars. I found no compact header or data row such as `|a|b|` in these consumed sources.

Compact separator rows such as `|---|---|` remain compatible. The parser detects and skips a separator before it splits cells. The new regression fixture uses this compact separator form and spaced header and data delimiters.

The objective update also matches the current Integrated Math 1 source. In `apps/integrated-math-1/curriculum/module-1-class-period-plan.md`, row 37 first adds `1b` as an embedded objective without a description. Row 38 then supplies the full primary description. The change fills only a blank description. It does not replace an existing full description.

Safe conclusion: keep the narrow whitespace-delimiter change for the current source corpus. Do not add generalized compact-table handling without a consumed source that needs it. The two regression tests cover the actual repeated-objective and absolute-value failures.
