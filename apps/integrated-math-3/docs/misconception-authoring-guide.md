# IM3 Misconception Content Authoring Guide

This guide explains how to author, validate, and expand the misconception
content for Integrated Math 3. The misconception system detects common
student errors, maps them to taxonomy tags, and routes remediation
activities to the student.

## Taxonomy Schema

The misconception taxonomy lives in
`apps/integrated-math-3/lib/practice/misconception-taxonomy.ts`.

Each misconception entry has the following fields:

- `slug` — canonical identifier used in `misconceptionTags` arrays
  (e.g., `sign-error-in-factored-form`).
- `label` — human-readable name for teacher dashboards.
- `description` — short description of the error pattern.
- `category` — semantic category for UI grouping: `mechanics`,
  `classification`, `computation`, or `completeness`.
- `affectedSkills` — IM3 skill IDs the misconception manifests on.
- `detectionSignals` — algebraic distractor types whose generated
  wrong-answer patterns are diagnostic of this error.

The taxonomy is source-grounded in the IM3 Module 1 curriculum
(`apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`,
`kind: "skill"` rows).

### Validation

Run the schema integrity test to verify the taxonomy is well-formed:

```
apps/integrated-math-3/__tests__/lib/practice/misconception-taxonomy.test.ts
```

## Detection Mapping

The detection-mapping layer bridges the algebraic distractor generators
(`packages/math-content/src/algebraic/distractors.ts`) to the IM3
taxonomy. It lives in
`apps/integrated-math-3/lib/practice/misconception-mapping.ts`.

Two functions provide the forward and reverse mapping:

- `mapDistractorToMisconception(distractorType, answer)` — maps a
  distractor type to one or more taxonomy slugs.
- `getDistractorTypesForMisconception(slug)` — returns the distractor
  types that can surface a given misconception.

Both functions are built directly from the taxonomy's
`detectionSignals` so adding a tag is a single-source change.

### Validation

Run the mapping test to verify forward/reverse coherence:

```
apps/integrated-math-3/__tests__/lib/practice/misconception-mapping.test.ts
```

## Remediation Activity Authoring

Remediation activities are authored in
`apps/integrated-math-3/lib/practice/misconception-remediations.ts`.

Each misconception slug maps to one or more `RemediationActivityRef`
entries:

- `activityId` — identifier of the target curriculum node (worked
  example, skill, or task blueprint).
- `activityKind` — `worked_example`, `task_blueprint`, or `skill`.
- `label` — human-readable description of the remediation.
- `sourceRef` — traceability reference to the curriculum source.

Activity IDs must reference real curriculum nodes in
`apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`.

### Integrity Check

Run the integrity test to verify remediation coherence:

```
apps/integrated-math-3/__tests__/lib/practice/misconception-content-integrity.test.ts
```

The `checkMisconceptionContentIntegrity()` function validates:
(a) every taxonomy tag has at least one remediation,
(b) no orphan remediation entries exist,
(c) all `affectedSkills` resolve to known skill IDs,
(d) no circular `remediated_by` edges,
(e) every activity ID references a known curriculum node.

### Shared Fixtures

Test fixtures are maintained in
`apps/integrated-math-3/__tests__/lib/practice/misconception-content.fixtures.ts`.
Use `makeAlgebraicSubmission()` to build seeded submission envelopes
for loop-wiring tests.

## Loop Wiring

The loop wiring module bridges the practice.v1 submission envelope
into the T6 misconception lifecycle mechanism. It lives in
`apps/integrated-math-3/lib/practice/misconception-loop-wiring.ts`.

The `createIm3MisconceptionLoop(t6)` factory accepts a T6 loop
function via dependency injection and returns a runner that:

1. Delegates detection, transition, resolution, and injection to the
   T6 mechanism.
2. Augments the output with `updatedState` for the caller to persist.
3. Uses the IM3 default resolution threshold (3 clean attempts).

### Validation

Run the wiring test to verify the loop contract:

```
apps/integrated-math-3/__tests__/lib/practice/misconception-loop-wiring.test.ts
```

## Expansion Process

To add a new misconception to the IM3 taxonomy:

1. **Research the error pattern.** Ground it in curriculum analysis
   or observed student work. Do not invent patterns at the keyboard.

2. **Add a taxonomy entry.** Edit
   `apps/integrated-math-3/lib/practice/misconception-taxonomy.ts`
   and add a new key to `IM3_MISCONCEPTION_TAGS_SOURCE` with the
   required fields (`slug`, `label`, `description`, `category`,
   `affectedSkills`, `detectionSignals`).

3. **Verify detection mapping.** The forward and reverse mapping in
   `apps/integrated-math-3/lib/practice/misconception-mapping.ts`
   is built automatically from `detectionSignals`. No separate
   mapping edit is needed.

4. **Author remediation activities.** Edit
   `apps/integrated-math-3/lib/practice/misconception-remediations.ts`
   and add at least one `RemediationActivityRef` for the new slug.
   Activity IDs must reference real curriculum nodes.

5. **Run integrity checks.** Execute the taxonomy, mapping, and
   integrity tests to verify the new entry is coherent:

   ```
   apps/integrated-math-3/__tests__/lib/practice/misconception-taxonomy.test.ts
   apps/integrated-math-3/__tests__/lib/practice/misconception-mapping.test.ts
   apps/integrated-math-3/__tests__/lib/practice/misconception-content-integrity.test.ts
   ```

6. **Update the loop-wiring fixtures.** If the new slug should be
   exercised in loop-wiring tests, add it to the test fixtures in
   `apps/integrated-math-3/__tests__/lib/practice/misconception-content.fixtures.ts`.

7. **Run the full practice test suite** from the IM3 app directory to
   confirm no regressions.
