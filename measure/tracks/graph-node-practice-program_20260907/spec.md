# Graph Node Practice Program Specification

Status: Implementation authorized on 2026-09-07.

## Objective

Correct the knowledge space graphs and provide worked examples, guided practice, and independent practice for all required instructional capabilities in IM1, IM2, IM3, AP Precalculus, and Business Math. Use gpt-5.6-sol with low reasoning effort for bounded agent tasks. The parent agent controls scope, integration, and acceptance.

## Role of the graph

The graph is the canonical model for learning capabilities and their relationships. Learner evidence and practice history support a time-dependent knowledge state. The graph constrains readiness and the next eligible capabilities. The planner ranks eligible work. The spaced repetition system determines review timing. Activity maps, component props, evidence maps, and role-specific progress views derive from this model.

A graph correction must be tested at the learning-decision boundary. Passing a JSON schema or removing a graph cycle is insufficient. False prerequisites, false equivalence, and incorrect evidence targets can change what students receive and what teachers believe they know.

## Scope rules

1. Account for every graph node. Give each node a source-supported disposition.
2. Give each approved assessable capability all three instructional modes.
3. Use worked-example nodes as source examples. Preserve many-to-many source mappings where required.
4. Use domain, unit, group, standard, renderer, and generator nodes for their existing structural purpose. Do not create three exercises for each structural node.
5. Resolve concept nodes through the existing graph semantic repair track before assigning mastery targets.
6. Treat present JSON fields, reviewed labels, passing schemas, and generated activity counts as structural evidence only.
7. Reuse existing components and generators when they assess the exact capability. Create a new component only when the required interaction is absent.

## Functional requirements

- Worked example: show complete givens, a clear target, valid figures, ordered reasoning, and a correct result. Preserve the source capability and conditions.
- Guided practice: require student work. Provide step checks and useful hints. Control answer reveal. Record assistance in the existing submission contract.
- Independent practice: provide fresh valid variants. Conceal solutions before submission. Define valid inputs, answer equivalence, units, rounding, and retry behavior.
- Use deterministic generators where the task permits automatic variants. For explanations, models, proofs, and business artifacts, use an explicit rubric and teacher review when automatic grading cannot establish correctness.
- Keep activity IDs, part IDs, generator bindings, and graph node IDs consistent through projection, rendering, submission, grading, and evidence.
- Preserve practice.v1 and learning-evidence.v1. Preserve teacher-led first exposure and the existing knowledge-state and spaced repetition policies.
- Use server-owned grading for automatic evidence. Do not trust a browser correctness flag or treat a saved artifact as demonstrated mastery.
- Use each app's design system. Support keyboard use, readable mathematics, mobile layouts, and accessible figures.
- Keep source content in its existing app or math-domain package. Shared packages must not import from apps or generated Convex modules.

## Acceptance criteria

- Correct graph identity, taxonomy, sources, and relationships across all five courses. Verify their effects on readiness, transfer, evidence, and learner-facing projections.
- Every required source capability has an explicit disposition. Required unresolved capabilities prevent course completion.
- Each accepted capability has a usable Worked, Guided, and Independent activity. All three measure the same approved capability.
- The real app registry accepts each projected activity. The rendered component behaves correctly in each mode.
- Generator tests use independent mathematical examples and invalid-input cases. Tests cover boundary values and multiple seeds.
- Correct, incorrect, assisted, revealed, and repeated submissions produce the required observable result. Evidence names the exact node.
- Each course passes a signed-in student journey through all three modes. Review preview alone is insufficient.
- Relevant tests, lint, standalone TypeScript, build, architecture boundaries, and Measure Doctor pass. Record existing unrelated failures separately.
- A second agent reviews each authoring batch. The parent resolves findings. Required human curriculum and phase approvals remain explicit.

## Dependencies and exclusions

Graph correction is part of this program, as explicitly requested by the user. Execute the detailed IM1, IM2, IM3, and Precalculus graph tasks through the existing math-series graph semantic repair track. Execute remaining Business Math graph decisions through the Mastery Advantage remediation track. Course review correction plans retain their runtime fixes. This parent program coordinates those tasks through completion. It must not wait for an unspecified external owner or duplicate their implementation. Assign each overlapping change to one track before implementation.

This program does not authorize deployment, production seeding, database migration, new dependencies, a new review system, or new audit hashes. It does not require a separate React component per node or per mode. Estimates and the final capability count follow inventory review and pilot measurements.
