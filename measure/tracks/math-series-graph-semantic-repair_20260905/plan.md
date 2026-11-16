# Implementation Plan: Math-Series Graph Semantic Repair

## Status

The original specification and checklist remain below. The user authorized implementation through the Graph Node Practice Program on 2026-09-07. That program owns current bounded execution and independent review. Do not duplicate its completed repairs.

See `../graph-node-practice-program_20260907/plan.md` for verified commits and remaining gaps. IM1 Lesson 7-1 source repair is committed as `0175218e`. Lesson 7-2 source repair is committed as `4f8cafc4`. It adds six draft capabilities and reuses five existing capabilities. Lesson 7-3 source repair is committed as `ec5647ee`. It restores all 49 source problems, adds two draft elimination capabilities, and reuses five existing capabilities. Lesson 7-4 source and graph repair is committed as `d21f39ed`. Its approved-skill count correction is committed as `84872511`. Lesson 7-5 source restoration is committed as `fedfa50e`; graph review is active. Lesson 8-1 source review is active. Source approval and complete three-mode practice remain open. The original checklist is not marked complete from these partial repairs.

Read the [specification](./spec.md) and the
[source review](../mastery-advantage-graph-remediation_20260821/graph-construction-review-2026-09-05.md)
before execution. The parent remediation track retains Business Math and activity
rollout. This plan owns the four-course graph repair. Do not execute overlapping
graph tasks in both plans.

## Execution rules

1. Use one agent. Do not create user-owned tasks or delegate work unless requested.
2. Read `AGENTS.md`, `measure/index.md`, `measure/workflow.md`, and project memory.
3. Read touched source files and trace the real data flow before editing.
4. Run `git status --short` and inspect the exact file diff before each task.
5. Preserve pending work. Do not restore, stage, or commit unrelated files.
6. Mark the selected task `[~]` before work. Record evidence before marking `[x]`.
7. Write a failing behavior test before a production change. Record the Red result.
8. Make the smallest repair. Run the focused Green tests before the next change.
9. Expand each course module into lesson tasks before authoring. Do not use one
   task to rewrite a whole course graph.
10. Use the parent track's clean commit-scope rule for shared pending files.
    Obtain approval of the exact mixed-file commit scope before committing it.
    Follow Measure atomic commits, Git notes, and plan updates after that scope
    is approved. Never stage the full dirty registry or parent plan by default.
11. Run lint and relevant tests before each implementation commit. Run standalone
    TypeScript and builds for affected workspaces. Record commit IDs in this plan.
12. Stop at each manual verification task. A test result cannot supply human
    source approval. Use the phase protocol in `measure/workflow.md`.
13. If Convex handlers need changes, first read the applicable generated AI
    guidelines and Convex skill. Do not deploy or migrate data under this plan.
14. Do not add dependencies, schema fields, registries, manifests, hashes,
    checksums, or a new review interface. The narrow concept endpoint contract
    proposal requires the Phase 1 decision before implementation.

## Required reading and code map

| Area | Existing paths |
|---|---|
| Contract | `measure/knowledge-space.md`; `kst-srs.v3.2/SPECIFICATION.md` |
| Graph rules | `packages/knowledge-space-core/src/{types,schemas,validation,edge-endpoint-rules}.ts` |
| Suggestions | `packages/knowledge-space-core/src/{edge-suggestions,cross-course-equivalence}.ts` |
| Decisions | `packages/knowledge-space-core/src/{weighted-readiness,knowledge-state-engine,placement-engine}.ts`; existing transfer and fringe functions |
| Domain authoring | `packages/math-content/src/knowledge-space/extraction/`; `alignment/`; `cross-course-edges.json` |
| Generators and output | `packages/math-content/src/knowledge-space/generators/registry.ts`; `packages/knowledge-space-practice/src/projections/` |
| Generation scripts | `scripts/{extract-skill-inventory,align-standards,generate-course-edges,generate-cross-course-edges,remediate-concept-blueprints}.ts` |
| Course files | The four existing `apps/<course>/curriculum/skill-graph/` folders |
| IM3 consumer | `apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts` and its callers |
| Review workbench | `apps/bus-math-v2/app/(dev)/blueprint-qa/` |

Resolve current imports and test paths before running commands. This code map
identifies starting points. It does not authorize editing every listed file.

## Phase 1 — Contract and schema decisions

Deliverable: an agreed source boundary and minimal contract delta. No graph
inventory or production readiness change occurs in this phase.

- [ ] Task 1.1: Refresh the baseline and assign scope.
  - [ ] Record the current commit and pending paths that affect the four graphs.
  - [ ] Rerun the review's direct validators against standalone and embedded inputs.
  - [ ] Reproduce the false geometry equivalence and IM2 prerequisite.
  - [ ] Classify which old findings remain, changed, or were repaired elsewhere.
  - [ ] Record active overlap with the parent plan and assign one owner per change.

- [ ] Task 1.2: Trace canonical authoring and all graph consumers. Covers FR1–FR2.
  - [ ] List existing inputs and outputs in this plan: source, reader, and purpose.
  - [ ] Identify runtime, placement, transfer, planner, seed, and review consumers.
  - [ ] Identify duplicate standard definitions and their existing source authority.
  - [ ] Decide which embedded catalogs can be removed and which must be generated.
  - [ ] Identify existing consumer assumptions that cross-course rows are all equivalence.

- [ ] Task 1.3: Resolve the concept and approval contracts. Covers FR3–FR4.
  - [ ] Compare architecture prose, vendored specification, endpoint rules, and projectors.
  - [ ] Propose the exact `concept -> skill` exception only if a real aggregator needs it.
  - [ ] Record the upstream compatibility decision without modifying vendor provenance.
  - [ ] Select the existing graph boundary for approved learning relationships.
  - [ ] Define how unapproved targets remain unavailable after edge filtering.
  - [ ] Define safe behavior when required foreign-course learner state is unavailable.

- [ ] Task 1.4: Prepare source and identity review rules. Covers FR3, FR8, FR11.
  - [ ] Reconcile the module/unit source list against original PDFs and authored documents.
  - [ ] Define the review-note format: exact ID, capability, source page, disposition,
    proposed relationships, reference impact, and unresolved question.
  - [ ] Use existing graph fields and Measure notes. Do not create a runtime inventory.
  - [ ] Identify node meanings that may need splits, merges, or removal.
  - [ ] Define the read-only reference check before those identity changes.

- [ ] Task 1.5: Measure — User Manual Verification: Contract and schema decisions.
  - [ ] Present exact contract changes, consumer boundary, and source-review method.
  - [ ] Resolve the concept compatibility decision and implementation scope.
  - [ ] Record explicit feedback. Follow the phase checkpoint protocol.

## Phase 2 — Failing contracts and behavior tests

Deliverable: failures that reproduce graph defects and unsafe decision effects.
These tests must not depend on fixed totals from the September review.
Record expected Red results as defect evidence. They are not passing quality
gates. Keep failing implementation tests uncommitted until their paired repair
passes. Do not create an empty or falsely Green phase checkpoint.

- [ ] Task 2.1: Add canonical graph and hierarchy regression tests. Covers AC1–AC4.
  - [ ] Load the exact files used by consumers for all four courses.
  - [ ] Detect conflicting duplicate definitions and missing shared standards.
  - [ ] Detect embedded catalog drift when the embedded copy is still required.
  - [ ] Verify regeneration preserves unrelated approved rows and stable edge IDs.
  - [ ] Assert source-confirmed IM3 Module 1 and AP Precalculus containment paths.
  - [ ] Detect duplicate IDs, duplicate triples, and containment/prerequisite cycles.

- [ ] Task 2.2: Add learning-decision isolation tests. Covers AC5, AC8, AC11.
  - [ ] Show that the false IM2 edge currently changes readiness.
  - [ ] Add draft, reviewed, rejected, and missing-status edge cases at the real boundary.
  - [ ] Assert that removing unapproved edges does not expose an unreviewed target.
  - [ ] Assert that approved positive dependencies still affect the real decision.
  - [ ] Assert that absent foreign learner state produces no inferred mastery or credit.

- [ ] Task 2.3: Add taxonomy and generator relationship tests. Covers AC9–AC10.
  - [ ] Detect concept blueprint, activity, and SRS targets in actual course artifacts.
  - [ ] Test the approved concept containment decision with valid and invalid pairings.
  - [ ] Detect ready nodes whose graph relationship or exact-capability binding is absent.
  - [ ] Check standalone and embedded projection arrays.

- [ ] Task 2.4: Add cross-course semantic and closure tests. Covers AC6–AC7.
  - [ ] Reject the known geometry/parallelogram pair as approved equivalence.
  - [ ] Reject worked-example-to-skill mastery identity.
  - [ ] Verify typed routing of prerequisites and equivalence through existing consumers.
  - [ ] Test a cross-course cycle and a cycle created by collapsing equivalent nodes.
  - [ ] Use synthetic fixtures in core; keep proprietary examples in domain/app tests.

- [ ] Task 2.5: Measure — User Manual Verification: Failing tests.
  - [ ] Present the observed failures and the behavior each test protects.
  - [ ] Confirm that tests do not accept blanket removal, mass approval, or empty outputs.
  - [ ] Record explicit feedback. Follow the phase checkpoint protocol.

## Phase 3 — Implement approval isolation and canonical consistency

Deliverable: consumer inputs are consistent, and unapproved graph facts cannot
make learning decisions. Semantic authoring remains pending.

- [ ] Task 3.1: Implement the agreed decision boundary. Covers FR4, FR11.
  - [ ] Reuse the selected graph assembly path and existing approval fields.
  - [ ] Apply node approval and learning-edge approval consistently to all traced consumers.
  - [ ] Preserve candidate review access and existing first-exposure restrictions.
  - [ ] Keep incomplete targets unavailable; retain approved valid behavior.
  - [ ] Run Task 2.2 tests Green. Document any intentional eligibility reduction.

- [ ] Task 3.2: Repair canonical node assembly. Covers FR1–FR2.
  - [ ] Resolve IM2 standards from the existing source without placeholder duplication.
  - [ ] Reconcile current AP Precalculus nodes before repairing embedded endpoints.
  - [ ] Preserve reviewed IM1/IM2 status where it is supported by existing evidence.
  - [ ] Resolve IM3 title, source, binding, and readiness drift by field-level review.
  - [ ] Remove unused copies or regenerate required copies from the agreed source.
  - [ ] Fail on conflicting shared standard definitions in combined assembly.

- [ ] Task 3.3: Repair generation without restoring invalid suggestions. Covers FR1, FR5–FR7.
  - [ ] Handle course unit/module metadata through the existing extraction boundary.
  - [ ] Preserve stable node and edge IDs for unchanged meaning.
  - [ ] Preserve approved relationships when suggestions are refreshed.
  - [ ] Stop emitting sequence and same-module suggestions as approved decision facts.
  - [ ] Stop treating standard overlap as sufficient evidence for equivalence.
  - [ ] Verify deterministic output in a temporary location before updating source artifacts.

- [ ] Task 3.4: Implement the agreed concept endpoint contract. Covers FR3.
  - [ ] Apply only the Phase 1 contract decision.
  - [ ] Keep local documentation, schemas, validators, and projection tests consistent.
  - [ ] Reject unrelated concept source/target pairings and containment cycles.
  - [ ] Do not edit the vendored snapshot or its provenance as a side effect.

- [ ] Task 3.5: Measure — User Manual Verification: Canonical and decision boundaries.
  - [ ] Show before/after consumer behavior and the exact changed paths.
  - [ ] Demonstrate candidate visibility without learner eligibility.
  - [ ] Explain remaining source-authoring failures without calling this semantic completion.
  - [ ] Record explicit feedback. Follow the phase checkpoint protocol.

## Phase 4 — Reconcile course capabilities and relationships

Deliverable: reviewed course graphs with correct containment, taxonomy,
source mappings, standards, prerequisites, and support relationships.

Use this loop for every module or unit. Expand it into named lesson tasks below
the relevant course task before editing production files. Each lesson task must
have its own checkbox, paths, sources, Red result, Green result, and disposition.
Do not mark a course complete from a pilot sample.

1. Read original examples and authored objectives in source order.
2. Compare each demonstrated capability with existing course-series skills.
3. Record reuse, correction, split, merge, exclusion, or unresolved disposition.
4. Map examples many-to-many through existing blueprint source fields.
5. Propose containment, standards, prerequisites, support, and root explanations.
6. Inspect stable-ID references and the impact on existing evidence.
7. Obtain source and graph-delta approval for that bounded group.
8. Write source-backed negative and positive tests. Confirm the intended Red result.
9. Apply the minimum approved graph edits. Keep unresolved rows unavailable.
10. Run Green validation and reference checks. Record the exact outcome.

- [ ] Task 4.1: Expand and repair IM1 Modules 1–7. Covers FR3, FR5–FR8.
  - [ ] Add lesson task rows before work; follow the source-review loop.
  - [ ] Review sequence prerequisites and source mappings; preserve valid node identities.
  - [ ] Record root assumptions and dependencies that will be reused in later courses.

- [ ] Task 4.2: Expand and repair IM1 Modules 8–14. Covers FR3, FR5–FR8.
  - [ ] Add lesson task rows before work; follow the source-review loop.
  - [ ] Check geometry capabilities against their actual standards and evidence demands.
  - [ ] Account for all IM1 source capabilities and unresolved decisions.

- [ ] Task 4.3: Expand and repair IM2 Modules 1–7. Covers FR3, FR5–FR8.
  - [ ] Add lesson task rows before work; follow the source-review loop.
  - [ ] Reuse matching IM1 capability identities through reviewed relationships.
  - [ ] Verify geometry source mappings without inferring identity from standards.

- [ ] Task 4.4: Expand and repair IM2 Modules 8–13. Covers FR3, FR5–FR8.
  - [ ] Add lesson task rows before work; follow the source-review loop.
  - [ ] Reject the false quadratic-vertex-form prerequisite for trigonometric identities.
  - [ ] Review actual algebra, quadratic, radical, and trigonometric dependencies.
  - [ ] Account for all IM2 source capabilities and unresolved decisions.

- [ ] Task 4.5: Expand and repair IM3 Module 1. Covers FR3, FR5, FR8, FR10.
  - [ ] Reuse current candidate corrections only after checking their source and tests.
  - [ ] Restore source-confirmed containment for all authored Module 1 examples.
  - [ ] Review each concept and its relationship to the existing lesson skills.
  - [ ] Resolve the two missing generator relationships through the binding review.
  - [ ] Keep modality authoring in the parent track; do not repeat activity repairs here.

- [ ] Task 4.6: Expand and repair IM3 Modules 2–9. Covers FR3, FR5–FR8.
  - [ ] Add lesson task rows before work; follow the source-review loop.
  - [ ] Complete disposition of all remaining concept rows and concept blueprints.
  - [ ] Review every same-module support suggestion and sequence prerequisite.
  - [ ] Account for all IM3 source capabilities and unresolved decisions.

- [~] Task 4.7: Expand and repair AP Precalculus Unit 1. Covers FR3, FR5–FR8, FR10.
  - [ ] Reconcile current subskill additions with original PDF examples and existing IDs.
  Topic 1.1 source repair is committed as `f464484c`. It preserves the legacy ID as rejected and keeps five source-supported candidates draft and inactive. All 12 numbered examples are restored. Full Unit 1 coverage and source approval remain open.
  - [ ] Restore skill containment and capability-level standard relationships.
  - [ ] Review polynomial/rational capabilities and prerequisite scope across topics.
  - [ ] Review all current readiness bindings; do not infer them from a pilot's success.

- [ ] Task 4.8: Expand and repair AP Precalculus Units 2–4. Covers FR3, FR5–FR8.
  - [ ] Add topic task rows before work; follow the source-review loop.
  - [ ] Restore the four missing Unit 4 lesson containment paths after source verification.
  - [ ] Reconcile broad topic rows with assessable capabilities without forced splitting.
  - [ ] Keep local Unit 4 scope explicit and separate from exam scope.
  - [ ] Account for all AP Precalculus source capabilities and unresolved decisions.

- [ ] Task 4.9: Measure — User Manual Verification: Course capability review.
  - [ ] Present each course's coverage disposition and approved graph deltas.
  - [ ] Verify that every required source capability is represented or explicitly resolved.
  - [ ] Verify root explanations and rejected prerequisite/support examples.
  - [ ] Do not close this phase while required taxonomy or source coverage is unresolved.
  - [ ] Record explicit feedback. Follow the phase checkpoint protocol.

## Phase 5 — Repair the combined math-series graph

Deliverable: reviewed cross-course identity and prerequisite relationships.
This phase depends on the relevant endpoint capabilities from Phase 4.

- [ ] Task 5.1: Review and disposition cross-course equivalence candidates. Covers FR7.
  - [ ] Group candidates by source capability for review; do not approve groups by count.
  - [ ] Reject worked-example mastery identities and the known geometry false match.
  - [ ] Compare scope, representations, conditions, and evidence demands on both endpoints.
  - [ ] Retain, reject, or replace each candidate only with a source-supported decision.
  - [ ] Record exact identity impacts; preserve unrelated approved references.

- [ ] Task 5.2: Author course-to-course prerequisite coverage. Covers FR6–FR8.
  - [ ] Review each strand listed in FR7 across all four courses.
  - [ ] Identify prerequisites for IM1 -> IM2, IM2 -> IM3, and IM3 -> AP Precalculus.
  - [ ] Check direct dependencies that skip a course and valid independent strands.
  - [ ] Obtain approval of exact endpoints, direction, weight, and capability reason.
  - [ ] Store approved relationships in the existing cross-course file.

- [ ] Task 5.3: Integrate typed cross-course edges. Covers FR2, FR7, FR11.
  - [ ] Update existing readers that assumed all cross-course rows were equivalence.
  - [ ] Keep equivalence-only algorithms restricted to equivalent edges.
  - [ ] Assemble complete referenced graph endpoints through the existing domain path.
  - [ ] Verify missing foreign learner state cannot become mastery or transfer credit.
  - [ ] Leave runtime transport gaps outside production eligibility and report them.

- [ ] Task 5.4: Verify combined semantic consistency. Covers AC5–AC7, AC11.
  - [ ] Check stable-node cycles and equivalence-collapsed prerequisite cycles.
  - [ ] Test approved dependency paths using independent learner states.
  - [ ] Test legitimate independent branches without adding artificial course chains.
  - [ ] Confirm that rejected shared-standard pairs cannot grant transfer or remove work.
  - [ ] Ensure no required cross-course coverage decision remains unresolved.

- [ ] Task 5.5: Measure — User Manual Verification: Whole-series semantics.
  - [ ] Present source-backed paths for every strand and all course transitions.
  - [ ] Show capability identity, prerequisite, support, and context as different relations.
  - [ ] Review equivalence components with mixed scope or multiple course representations.
  - [ ] Record explicit feedback. Follow the phase checkpoint protocol.

## Phase 6 — Repair bindings and regenerate projections

Deliverable: graph-consistent artifacts with no concept mastery targets or
unsupported readiness claims. This is not a course-wide generator rollout.

- [ ] Task 6.1: Complete existing readiness binding checks. Covers FR10–FR11.
  - [ ] Check every retained ready node against its generator, renderer, and answer schema.
  - [ ] Verify exact-node server grading and evidence for existing eligible slices.
  - [ ] Add required relationships to existing reference nodes where justified.
  - [ ] Clear unsupported flags through approved dispositions; retain gap ownership.
  - [ ] Do not implement missing generators to meet a numeric coverage target.

- [ ] Task 6.2: Regenerate course artifacts through the existing projectors. Covers FR9.
  - [ ] Complete source and graph edits for a bounded slice before generation.
  - [ ] Remove concept targets from domain blueprints and mastery projections.
  - [ ] Update activity, SRS, and teacher evidence arrays, including embedded arrays.
  - [ ] Validate every generated reference against the exact consumer graph.
  - [ ] Preserve candidate QA views without enabling supplementary practice.

- [ ] Task 6.3: Verify determinism and semantic projection parity. Covers AC1, AC9–AC10.
  - [ ] Generate again in a temporary location and compare content without hashes.
  - [ ] Assert approved prerequisites and standards match source graph relationships.
  - [ ] Assert unapproved equivalence creates no decision effect in projected inputs.
  - [ ] Check actual schemas for all four courses, including IM2 stub blueprints.
  - [ ] Keep unusable stubs unavailable. Record generator work in its existing owner track.

- [ ] Task 6.4: Measure — User Manual Verification: Projections and readiness.
  - [ ] Show valid graph targets, retained unavailable targets, and the reason for each.
  - [ ] Inspect existing student components for changed active slices in the workbench.
  - [ ] Verify exact skill and source identity across available Worked, Guided, and Independent views.
  - [ ] Record explicit feedback. Follow the phase checkpoint protocol.

## Phase 7 — Verify consumers and preserve learner history

Deliverable: changed consumers use the repaired graph without corrupting
identity, exposure policy, or learning evidence.

- [ ] Task 7.1: Verify actual learning-decision consumers. Covers FR4, FR11–FR12.
  - [ ] Exercise readiness, mastery inference, placement closure, transfer, and planner ranking.
  - [ ] Compare draft, rejected, approved, missing-state, and valid-root cases.
  - [ ] Prove that graph filtering does not falsely unlock incomplete targets.
  - [ ] Verify parent, teacher, and student displays use the same approved graph facts.
  - [ ] Do not add UI-derived graph truth or new data access paths.

- [ ] Task 7.2: Verify identity compatibility and exact-node evidence. Covers FR11.
  - [ ] Review every changed or retired ID and all discovered static references.
  - [ ] Use read-only record checks when an existing local test deployment is available.
  - [ ] Prove unchanged IDs preserve their meaning and existing evidence attachment.
  - [ ] Keep meaning-changing IDs unavailable until an explicit compatibility path exists.
  - [ ] Verify teacher-led evidence, grading, replay safety, and first-exposure policy remain intact.

- [ ] Task 7.3: Run regression suites and classify failures. Covers FR12–FR13.
  - [ ] Run the affected course graph suites and shared graph, practice, and domain suites.
  - [ ] Run full affected app suites before closure; capture test names for failures.
  - [ ] Run changed-mechanism coverage and address uncovered decision behavior.
  - [ ] Assign unrelated failures to an existing owner without expanding this graph task.
  - [ ] Keep required failing gates open; do not suppress tests or replace behavior assertions.

- [ ] Task 7.4: Measure — User Manual Verification: Consumer behavior and identity.
  - [ ] Demonstrate the corrected false-prerequisite and false-equivalence cases.
  - [ ] Demonstrate one existing approved positive slice per course where a runtime exists.
  - [ ] Use domain consumer tests for scaffolded courses; state the absence of live proof.
  - [ ] Record runtime transport and deployment limits without claiming course rollout.
  - [ ] Record explicit feedback. Follow the phase checkpoint protocol.

## Phase 8 — Generate documentation and run Doctor

Deliverable: current source documentation, deterministic generated facts, and
passing required quality gates.

- [ ] Task 8.1: Update owned documentation and parent-track handoff. Covers FR13.
  - [ ] Update `measure/knowledge-space.md` with the implemented contract and source flow.
  - [ ] Correct stale graph audit claims without rewriting historical evidence as current.
  - [ ] Update relevant tech-debt rows with verified outcomes and remaining generator ownership.
  - [ ] Record which parent graph tasks this track completed and which rollout tasks remain.
  - [ ] Keep project memory bounded. Do not add a second permanent review ledger.

- [ ] Task 8.2: Run generation and repository checks. Covers AC13.
  - [ ] Run `npm run generate` through the existing configured workflow.
  - [ ] Run `npm run doctor` and the boundary and quality-parity checks.
  - [ ] Run root lint and full package tests; run affected app lint and tests separately.
  - [ ] Run standalone TypeScript and builds for every affected workspace.
  - [ ] Inspect generated diffs and `git diff --check`. Preserve unrelated pending changes.
  - [ ] Record any remaining failed gate and its owner. Do not mark this task complete on failure.

- [ ] Task 8.3: Measure — User Manual Verification: Documentation and quality gates.
  - [ ] Present gate results and the exact graph-source flow now in use.
  - [ ] Confirm no unauthorized dependency, schema field, hash, or runtime registry was added.
  - [ ] Record explicit feedback. Follow the phase checkpoint protocol.

## Phase 9 — Final semantic acceptance

Deliverable: explicit acceptance of the repaired graph, separate from production
rollout and generator coverage.

- [ ] Task 9.1: Close every finding against evidence.
  - [ ] Map F1–F8 to exact changes, tests, source decisions, and remaining limitations.
  - [ ] Map AC1–AC13 to completed tasks. No criterion can pass from a row count alone.
  - [ ] Confirm complete four-course source disposition and reviewed course transitions.
  - [ ] Confirm valid roots, independent strands, and equivalent capability scope.
  - [ ] Confirm no unresolved required semantic defect remains.

- [ ] Task 9.2: Measure — User Manual Verification: Final graph acceptance.
  - [ ] Present the repaired whole-series graph meaning and representative source-backed paths.
  - [ ] State structural, semantic, runtime, and deployment results separately.
  - [ ] Obtain explicit graph acceptance. Do not infer it from earlier phase approvals.
  - [ ] Record the final checkpoint and update track metadata and `measure/tracks.md`.
  - [ ] Leave Business Math, missing generators, and production rollout with their existing owners.

## Verification commands

Run commands from the repository root unless the command specifies a workspace.
Use installed dependencies only. Resolve app test filters from their actual
configuration before running them.

```sh
CI=true npm run test --workspace=@math-platform/knowledge-space-core
CI=true npm run test --workspace=@math-platform/knowledge-space-practice
CI=true npm run test --workspace=@math-platform/math-content
CI=true npm run test --workspace=@math-platform/srs-engine
npm run lint
CI=true npm run test
npm run typecheck
npm run build
npm run generate
npm run doctor
node scripts/check-monorepo-boundaries.mjs
node scripts/architecture/check-quality-parity.mjs
git diff --check
```

For each affected app or package, also run its own lint and tests. Run
`npx tsc --noEmit --project <workspace>/tsconfig.json` in addition to its build.
A Vinext build does not establish TypeScript correctness.

Do not regenerate every course after each lesson edit. Run focused source and
graph checks during authoring. Regenerate the completed approved slice when its
inputs are stable. Broaden testing when an interface or dependency changes.

## Finding-to-phase map

| Finding | Contract and tests | Repair | Acceptance |
|---|---|---|---|
| F1: AP graph gaps | 1.2, 1.4, 2.1 | 3.2–3.3, 4.7–4.8 | 4.9, 6.3, 9.1 |
| F2: Catalog drift | 1.2, 2.1 | 3.2–3.3 | 3.5, 6.3 |
| F3: False equivalence | 1.3, 2.4 | 3.1, 3.3, 5.1–5.4 | 5.5, 7.1 |
| F4: False prerequisites | 1.3, 2.2 | 3.1, 3.3, 4.1–4.8, 5.2 | 4.9, 5.5, 7.1 |
| F5: Concept targets | 1.3, 2.3 | 3.4, 4.5–4.6, 6.2 | 6.3–6.4 |
| F6: IM3 examples | 1.4, 2.1 | 3.3, 4.5 | 4.9, 6.3 |
| F7: Binding gaps | 1.2, 2.3 | 4.5, 4.7, 6.1 | 6.3–6.4, 7.2 |
| F8: Source/support gaps | 1.4, 2.2 | 3.3, 4.1–4.8, 5.2 | 4.9, 5.5, 9.1 |

## Current risks and open decisions

- The approved concept representation must reconcile the local and vendored contracts.
- Existing approved node flags may predate real prerequisite or capability review.
- Production evidence references may prevent an immediate node split or merge.
- Cross-course runtime state may be unavailable even after structural repair.
- Source PDFs may expose missing capabilities beyond the current graph inventory.
- Existing repository-boundary failures can prevent final quality-gate completion.

Resolve these through the explicit tasks above. Do not create a speculative
framework to manage them.
