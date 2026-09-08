# IM3 Lesson 1.6 binding implementation scope

## Decision

Add one draft Quadratic Formula blueprint. Use the existing `quadratic-formula` generator, component, and server-owned writer. Do not change the publication guard.

Keep the discriminant skill separate. Bind it to `.039` and `.040`. Remove its executable placeholder modes until it has an accepted response and grading contract.

The graph stays draft and inactive. This batch does not publish a learner placement.

## Blocking behavior

`currentIm3PilotPublication` reads the canonical `nodes.json` and `blueprints.json` files. `loadQuadraticFormulaAuthority` requires exactly one QF skill node and exactly one QF blueprint. Both records must have `reviewStatus: "draft"`.

The canonical graph has the node. It has no QF blueprint. The real Guided check and server-owned submission therefore reject the seeded draft activities. Keep this fail-closed test. Supply the missing graph record.

## Quadratic Formula blueprint

Use this identity:

- `nodeId`: `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations`
- `sourceNodeIds`: `.036`, `.037`, and `.038`, in that order
- `alignmentNodeIds`: `math.standard.ccss.hsa-rei-b-4`
- `rendererKey`: `quadratic-formula`
- `rendererModeMap`: Guided and Independent only
- `generatorKey`: `quadratic-formula`
- `reviewStatus`: `draft`
- metadata: retain the existing course, module, lesson, and pilot sequence conventions

Do not add `worked` to `rendererModeMap`. Do not add `workedExampleSpec`. The source Worked examples remain inline text.

### Guided specification

Add `guidedPracticeSpec` because the schema requires a specification for the Guided mode.

Use the existing seed-1 public props from `buildIm3QuadraticFormulaDraftDocuments`:

- `prompt`
- generated `equation`
- `presentationMode: "guided"`
- the reviewed `fieldHelp` for `discriminant`, `x1`, and `x2`

Do not include the seed, roots, canonical discriminant, answer patterns, grading decisions, or future Worked steps.

The outer Guided fields can use empty `stepPrompts`, `hints`, and `checksPerStep` arrays. The component owns the accepted help controls in `rendererProps`. Use `revealPolicy: "after_attempt"`. Do not duplicate private answers in the generic blueprint fields.

### Independent specification

Add `independentPracticeSpec` because the schema requires a specification for the Independent mode.

Use the existing seed-2 public props from `buildIm3QuadraticFormulaDraftDocuments`:

- `prompt`
- generated `equation`
- `presentationMode: "independent"`

Use an empty `variantParameters` object. Do not put a seed in public generator constraints. Define only the three public response keys in `answerSchema`: `discriminant`, `x1`, and `x2`. Define one `custom` grading rule with one point for each key. Use `replayPolicy: "any_seed"`, which the existing schema permits and the current fixed variants satisfy. Do not add a second allocation contract in this batch.

Add `gradingSpec` with the same three part IDs and partial credit enabled. Omit optional passingScore and rubric. The server computes each attempt maximum. It uses two points for a repeated root and three points for two distinct roots. The current seed-1 and seed-2 variants both have two distinct roots; each public independent grading rule has a maximum of one point. Do not claim that every later generated attempt has a three-point maximum.

The projected stable IDs must equal the existing stored IDs:

- `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations.guided_practice`
- `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations.independent_practice`

Both projected rows must have `srsEligible: false` while the node and blueprint remain draft.

## Renderer correction

The graph still binds the QF skill to `step-by-step-solver`. Correct this mismatch.

- Add `math.im3.renderer.quadratic-formula` as the renderer node in each applicable node catalog. Use the existing component registry as its source. Keep the renderer node derived and approved, consistent with other registered renderer nodes.
- Set the QF skill `rendererKey` to `quadratic-formula` in every node-bearing copy.
- Change edge `math.im3.edge.m1.077` to target `math.im3.renderer.quadratic-formula`. Update only its renderer-specific rationale and source record.
- Add `quadratic-formula` to `packages/math-content/src/knowledge-space/renderers/registry.ts` with the existing `quadraticFormulaActivitySchema`. This registry change is required by `validateRendererCompatibility`. It is not a new routing layer.

Do not change the app activity registry. It already registers the component.

## Discriminant boundary

Keep this node:

`math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol`

Keep its `discriminant-analyzer` renderer identity and rendered-by edge.

Change its blueprint source set to exactly:

- `math.im3.example.1.6.039`
- `math.im3.example.1.6.040`

Remove its placeholder `workedExampleSpec`, `guidedPracticeSpec`, and both mode-map entries. Remove the two projected placeholder activities. Keep the blueprint draft. Keep its SRS row with `generatorReady: false`. Keep its teacher row with `independentPracticeReady: false`.

The exact source covers a positive non-square discriminant and a negative discriminant. It does not cover zero or positive-square classification. Do not claim all discriminant regimes from `.039` and `.040`.

## Prerequisite correction

Remove these two `prerequisite_for` edges from the canonical and module edge catalogs:

- `math.im3.edge.m1.062`: completing the square to QF use
- `math.im3.edge.m1.063`: QF use to discriminant classification

The source gives the Quadratic Formula directly. It does not require the learner to derive it by completing the square. Examples 4 and 5 calculate and classify the discriminant without solving by the formula. The edge rationales describe derivation or lesson sequence. They do not establish a necessary learner dependency.

Rebuild the SRS and teacher prerequisite fields with the real projectors. The removal can make `prerequisitesMet` true. The QF SRS projection will set generatorReady to true because a generator and Independent specification now exist. That field describes generator availability. The unchanged draft skill leaves teacher independentPracticeReady and both projected srsEligible values false. Do not modify the projectors or fabricate false generated values.

## Exact artifact scope

The bounded implementation has these artifact groups:

1. Five node-bearing graph catalogs:
   - `curriculum/skill-graph/nodes.json`
   - `curriculum/skill-graph/module-1/nodes.json`
   - `curriculum/skill-graph/draft-nodes.json`
   - `curriculum/skill-graph/edges.json`
   - `curriculum/skill-graph/standard-edges.json`
2. Two blueprint catalogs:
   - `curriculum/skill-graph/blueprints.json`
   - `curriculum/skill-graph/module-1/blueprints.json`
3. The module edge catalog:
   - `curriculum/skill-graph/module-1/edges.json`
4. Three stored projections:
   - `curriculum/skill-graph/projection/practice-v1-activity-map.json`
   - `curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
   - `curriculum/skill-graph/projection/teacher-evidence-map.json`
5. `packages/math-content/src/knowledge-space/renderers/registry.ts` and a focused `packages/math-content/src/__tests__/quadratic-formula-renderer-registry.test.ts` regression.
6. One app-discovered Lesson 1.6 binding and projection test.

Do not regenerate unrelated catalogs. Preserve record order and unrelated serialized bytes.

## Acceptance tests

The tests must establish these facts:

- Without the canonical QF blueprint, the real writer and Guided check reject the seeded draft activity.
- With the committed blueprint, both handlers accept the exact real stored activity, item, and private variant relation.
- A changed node status, blueprint status, stable ID, mode, public props, generator identity, seed, objective ID, or reverse relation still fails.
- The QF blueprint has exactly `.036` to `.038` as sources.
- It has only Guided and Independent modes. It has no physical Worked specification or projected Worked row.
- Both projected QF rows use `quadratic-formula`, match the existing stable IDs, expose only accepted public props, and remain SRS-ineligible.
- The schema and renderer compatibility validators accept the blueprint.
- The discriminant blueprint has exactly `.039` and `.040` as sources. It emits no placeholder activity row.
- The two removed prerequisite pairs are absent from both stored prerequisite projections.
- Real projector output matches both stored activity maps for the touched rows and matches the stored teacher fields for both skills.
- No skill approval, learner publication, competency, evidence, SRS scheduling, or mastery behavior changes. Assert the exact generatorReady change separately from unchanged learner eligibility.

## Separate work

The phase 8 and 9 source seed repair is a separate two-path batch. Later-attempt seed allocation remains a separate contract. Approval and learner placement remain separate reviewed actions.

## Parent verification and test ownership

The parent executed the existing generator. Seed 1 produces x² + 5x - 5 with discriminant 45 and two distinct roots. Seed 2 produces x² - 2x - 6 with discriminant 28 and two distinct roots. These observations are private test design inputs, not additional public props.

The parent owns the existing quadratic-formula-server-writer.test.ts additions. They must call the default publication without an override, grade both stored variants, and execute the Guided check. Missing and invalid publication fixtures must still reject. The graph author owns the listed graph, registry, and projection tests.
