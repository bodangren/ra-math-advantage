# IM3 pilot SRS eligibility baseline review

## Finding

The pilot test expectation is obsolete. The current projector is correct. The stored Module 1 and course activity projections are stale for three Independent activities.

`projectActivityMap` marks Guided and Independent rows as SRS eligible only when all three conditions are true:

- the node has `independentPracticeReady: true`;
- the node has `reviewStatus: approved`;
- the blueprint has `reviewStatus: approved`.

The package projection tests verify this rule. They also verify that an executable specification or generator key does not make an unapproved row eligible.

The failing pilot test assumes that every Independent row is eligible. Fresh Module 1 projection produces three Independent rows with `srsEligible: false`:

- `math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change.independent_practice`;
- `math.im3.skill.1.1.graph-quadratic-functions.independent_practice`;
- `math.im3.skill.1.2.solve-quadratic-equations-by-graphing.independent_practice`.

Each node has `independentPracticeReady: true`, but each node and blueprint has `reviewStatus: draft`. The false result prevents draft content from contributing SRS or mastery evidence. Changing the projector or approving these records would weaken the current review gate without content review.

The stored Module 1 and course activity maps mark these rows as eligible. Source search finds no application runtime import of either stored activity map. Only graph tests import the Module 1 map. Thus, the stale rows are a generated-artifact consistency defect. They are not evidence that the live runtime bypasses the projector gate.

## Minimum correction

Change only `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-projection.test.ts` for the baseline test repair. Replace the universal Independent eligibility assertion with a fresh-projector policy assertion:

- rows for approved, ready nodes and approved blueprints can be eligible;
- rows for a draft node or draft blueprint must be ineligible;
- the three current draft pilot rows must be ineligible.

Do not change node or blueprint review status in this repair. Do not make all Independent rows eligible.

Track stored projection synchronization as a separate bounded repair. That repair should regenerate or replace only rows whose values differ from fresh projector output. It must review all field differences before changing the stored artifacts. It must not use the Lesson 1-8 recovery to update unrelated pilot rows.

## Evidence

- Fresh Module 1 projection: three Independent rows are ineligible.
- Both stored activity maps: zero Independent rows are ineligible.
- `packages/knowledge-space-practice/src/__tests__/projections.test.ts`: 26 tests pass and enforce the approval gate.
- The current pilot suite has 53 passing tests. Its only failure is the obsolete universal eligibility assertion.
