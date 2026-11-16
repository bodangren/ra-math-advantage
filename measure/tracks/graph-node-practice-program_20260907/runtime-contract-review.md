# Runtime Contract Review

Date: 2026-09-07

## Decision

Make two small changes to the shared blueprint projection contract.

1. Treat a missing modality spec as no activity for that modality.
2. Do not project a concept blueprint onto child skill nodes.

Keep the current stable activity ID format for skill blueprints:

`<skill-node-id>.<practice-mode>`

Do not add a new registry, adapter, evidence map, or runtime layer.

## Current Flow

The source contract is in `packages/knowledge-space-practice/src/blueprints/types.ts` and `packages/knowledge-space-practice/src/blueprints/schemas.ts`.

`packages/knowledge-space-practice/src/projections/activity-map.ts` converts each blueprint spec into a `ProjectedActivity` row.

The projector currently does these actions:

- It emits `worked_example` when `workedExampleSpec` exists.
- It emits `guided_practice` when `guidedPracticeSpec` exists.
- It emits `independent_practice` when `independentPracticeSpec` exists.
- It expands a concept blueprint to every direct child skill through `contains` edges.
- It gives each expanded row the child skill ID.
- It uses one renderer key for all emitted modes.
- It uses `rendererProps` when the selected spec supplies them.
- It otherwise creates generic props from the selected spec.

The application runtimes use the projected stable activity ID as the activity identity. The server then associates the stored activity with one node. The learning evidence contract stores both `activityId` and `nodeId`. The evidence policy applies eligibility to the stored `nodeId`.

This means a projected child row can grant evidence to that child node. A concept blueprint does not prove that its prompt, answer, or grading rule assesses each child skill. The current fan-out can therefore grant generic evidence to a child skill.

## Renderer Mode Map Finding

The current `rendererModeMap` values are renderer component keys. They are not runtime mode aliases.

Examples include:

- `graphing-explorer`
- `step-by-step-solver`
- `comprehension-quiz`
- `interval-classification`
- `polynomial-end-behavior`
- `im2-question`

IM1, the reviewed IM3 rows, and the reviewed AP Precalculus rows usually repeat the same component key for all supported modes. IM2 has 202 empty maps. Business Math has 89 empty maps.

The existing runtime converts projected modes separately:

- `worked_example` becomes `teaching`.
- `guided_practice` becomes `guided`.
- `independent_practice` becomes `practice`.

Do not interpret `rendererModeMap` values as these runtime modes.

## Smallest Safe Projector Change

Change `projectActivityMap` in `packages/knowledge-space-practice/src/projections/activity-map.ts`.

Apply these rules:

1. Resolve the blueprint node by `blueprint.nodeId`.
2. Emit no rows when the node does not exist.
3. Emit no rows when the node kind is `concept`.
4. Emit rows only when the node kind is `skill`.
5. Emit one row only when the corresponding modality spec exists.
6. Keep `nodeId` equal to `blueprint.nodeId` for every emitted row.
7. Keep the current stable activity ID format.
8. Keep the current `srsEligible` rule.
9. Keep the current prerequisite and standards enrichment for the skill node.

Remove concept fan-out from this projector. Keep `findChildSkills` and `selectSkill` only if another public consumer uses them. Otherwise, delete them with their tests. Do not add a replacement resolution rule.

This change makes the projector fail closed. A child skill must have its own blueprint before it can receive an activity row or learning evidence.

## Empty Spec Rule

The schemas already reject these empty worked-example fields:

- An empty `prompt`.
- An empty `steps` array.
- An empty `explanation`.

The guided and independent schemas still permit empty arrays and empty records in important fields. A structurally present spec can therefore emit a row that has no usable task or grade.

Do not infer content from another modality. Do not copy a worked example into guided practice. Do not copy guided practice into independent practice.

The first repair uses the existing mode schemas at the projection boundary.
It rejects empty objects and missing required fields. It does not add stricter
minimum lengths for hints, checks, grading rules, or answer records. These
fields require a separate content and manual-assessment review. Do not infer
pedagogical completeness from successful schema parsing.

## Renderer Key Selection

Use the key for the emitted modality when it exists:

- Worked uses `rendererModeMap.worked`.
- Guided uses `rendererModeMap.guidedPractice`.
- Independent uses `rendererModeMap.independentPractice`.

Use `rendererKey` as the compatibility fallback for that modality.

Do not fall back from one modality entry to a different modality entry. For example, a worked row must not use `rendererModeMap.independentPractice`.

This change has no effect on current IM1 and reviewed AP Precalculus rows because they repeat the same key. It corrects blueprints that intentionally use different components by mode. It also prevents an incomplete mode map from selecting an unrelated component.

If both the modality entry and `rendererKey` are blank, emit no row. The projector must not emit the synthetic key `default` because no shared runtime registers that key.

## Compatibility Effects

The change preserves valid skill-owned rows and their stable IDs.

The change removes rows in these cases:

- A blueprint targets a concept node.
- A modality spec is structurally present but empty.
- The selected modality has no renderer key and `rendererKey` is blank.

Regenerated projection files will have expected deletions. These deletions are a safety correction. They show that the source lacks a child-owned, usable activity.

IM3 has known concept-targeted blueprints. Their projected child rows must disappear until the graph and blueprint owners create exact skill blueprints.

IM2 has many blank renderer keys. Those rows must remain absent. The one reviewed `im2-question` skill can remain projectable when its three specs and component registration pass the application gates.

Business Math uses an authored implementation activity map that does not match its blueprint triplets. Do not regenerate or replace that map as part of this shared projector repair. Reconcile it in the Business Math course batch.

IM1 has 138 blueprints with three present specs, but only six generator keys. The projector repair does not make those independent rows generator-ready or evidence-ready.

AP Precalculus has 19 generator-backed triplets and 62 lesson-written-response blueprints without independent specs. The missing independent rows must stay missing.

## Behavioral Test Fixtures

Add focused tests beside the projector tests in `packages/knowledge-space-practice/src/__tests__/projections.test.ts` or a small dedicated activity-map test file.

### Fixture 1: Exact skill triplet

Create one skill node and one blueprint with three non-empty specs. Give each mode a different renderer key.

Verify:

- The projector emits three rows.
- Each row keeps the exact skill node ID.
- Each stable activity ID uses the exact skill node ID and mode.
- Each row uses its own modality renderer key.
- Worked is not SRS eligible.
- Guided and independent follow `independentPracticeReady`.

### Fixture 2: Concept with two child skills

Create one concept node, two skill nodes, and two `contains` edges. Give the concept a complete blueprint.

Verify:

- The projector emits zero rows.
- It does not create either child stable activity ID.
- It does not mark either child as SRS eligible.

This fixture replaces the current test that expects concept fan-out.

### Fixture 3: Child-owned blueprint

Use the same concept and child nodes. Add a complete blueprint for only one child skill.

Verify:

- The projector emits rows only for that child.
- It emits no rows for the sibling.
- Every row keeps the child blueprint node ID.

### Fixture 4: Missing modality

Create a valid skill blueprint with only a worked spec.

Verify:

- The projector emits one worked row.
- It emits no guided row.
- It emits no independent row.

### Fixture 5: Structurally empty modalities

Create typed blueprint objects that bypass Zod parsing. Test one empty guided spec and one empty independent spec.

Verify:

- The projector does not emit the empty modality.
- It still emits each non-empty modality.

Verify that existing schema checks reject missing required fields. Do not strengthen unrelated schema rules.

### Fixture 6: Renderer fallback

Create a valid skill blueprint with a non-empty `rendererKey` and an empty `rendererModeMap`.

Verify that each valid spec uses `rendererKey`.

Then set only `rendererModeMap.worked`.

Verify that worked uses the worked key. Verify that guided and independent use `rendererKey`.

Then blank both sources for one blueprint.

Verify that the projector emits no rows.

### Fixture 7: Evidence identity

Use a projected child-owned skill row to create a server-owned activity fixture.

Verify:

- The submission activity ID equals the projected stable activity ID.
- The server resolves the exact projected skill node ID.
- The stored `learning-evidence.v1` record uses that same node ID.
- A sibling node receives no evidence.
- A concept node receives no evidence.

Keep this fixture in the application that owns the server submission path. The shared package must not import an application or Convex runtime.

## Required Follow-up Gates

Run these gates when the source change starts:

1. The shared blueprint schema tests.
2. The shared activity-map projection tests.
3. The IM3 curriculum projection tests.
4. The AP Precalculus projection acceptance tests.
5. The exact-node submission and learning-evidence tests for each course pilot.
6. `npm run lint`.
7. `npx tsc --noEmit` in each changed workspace.
8. The relevant builds.

Review all generated projection deletions before replacement. Do not approve a node because its row is schema-valid. Approval requires the real student component, server grading, and exact-node evidence proof.
