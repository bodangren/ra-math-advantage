# Specification: Math-Series Graph Semantic Repair

## Status and authority

The user requested this specification and plan on 2026-09-05. These documents
are implementation proposals. Writing them does not approve graph rows, change
runtime eligibility, or authorize deployment.

This track owns the four-course graph repairs identified in the
[source review](../mastery-advantage-graph-remediation_20260821/graph-construction-review-2026-09-05.md).
The [parent track](../mastery-advantage-graph-remediation_20260821/spec.md)
retains Business Math, activity modality repairs, and course rollout. Existing
source and activity corrections remain candidate input. This track must inspect
them before reuse. It must not repeat or reverse accepted corrections without
new evidence.

The implementation order is contract, failing tests, repair, source review,
semantic repair, projections, verification, and generated documentation.

## Problem and intended result

The graph currently confuses teaching order with prerequisite knowledge. It
confuses shared standards with equivalent capabilities. Some node catalogs
disagree. Some skills and examples have no containment edges. IM3 concept rows
still appear as practice targets.

The result must be one coherent logical graph for Integrated Math 1 (IM1),
Integrated Math 2 (IM2), Integrated Math 3 (IM3), and AP Precalculus.
Each mastery skill must describe an assessable student capability. Each
relationship must have the meaning defined below. Graph consumers must use
consistent node facts and approved learning relationships.

Two results must remain distinct:

1. **Structural correctness:** References, schemas, copies, and projections agree.
2. **Semantic correctness:** Capabilities and relationships match the curriculum.

A structural pass cannot close the semantic review. A passing generator cannot
establish a skill inventory. Approval of this graph does not make every skill
ready for supplementary practice.

## Evidence baseline

The review used workspace files over commit `106e1cb2`. Pending changes were
present. Recheck this baseline at implementation start. Do not encode these
counts as permanent expected totals.

| Finding | Observed defect | Requirement |
|---|---|---|
| F1 | AP Precalculus: 84 skill rows lack containment and standard edges; four lessons lack containment; only two prerequisite edges exist. | FR3, FR5, FR8 |
| F2 | IM2 standalone nodes omit 77 standards, which leaves 938 dangling edges. Node copies disagree in all four courses. | FR1, FR2 |
| F3 | All 4,996 cross-course equivalence suggestions use shared standards. Many pairs are different capabilities. | FR4, FR7 |
| F4 | IM1, IM2, and much of IM3 use lesson-sequence prerequisites. | FR4, FR6 |
| F5 | IM3 has 88 concept blueprint targets, 88 concept SRS targets, and 176 concept activity rows. The concept containment contracts conflict. | FR3, FR9 |
| F6 | All 52 IM3 Module 1 examples lack lesson containment. | FR5 |
| F7 | Two IM3 and 18 AP Precalculus ready flags lack required generator relationships or exceptions. | FR10 |
| F8 | Many example-to-skill mappings are empty. IM3 has 922 support suggestions based only on module membership. | FR3, FR6, FR8 |

The course graphs have no duplicate node IDs, duplicate edge IDs, duplicate
edge triples, or prerequisite cycles in the reviewed files. Preserve these
properties. The cross-course file contains equivalence suggestions only. It
does not express prerequisite progression between courses.

## Scope and source authority

Use the existing course folders under `apps/<course>/curriculum/skill-graph/`.
Use `packages/math-content/src/knowledge-space/cross-course-edges.json` for
relationships between courses. Do not create a unified graph file or a second
mastery inventory.

Use these source authorities in order:

1. The original curriculum PDF for an authored example and its solution.
2. The official standard or curriculum framework for the meaning of a standard.
3. Authored course documents for objectives, lesson placement, and course scope.
4. Existing graph and blueprint rows as candidates that require reconciliation.

Existing Markdown and optical character recognition can help locate sources.
They cannot override the original PDF. Resolve conflicting sources explicitly.
If a required source is unavailable, record the exact unresolved capability.
Do not invent an example, prerequisite, or source reference.

Review all curriculum modules or units in the four courses. This includes the
14 current IM1 modules, 13 IM2 modules, nine IM3 modules, and four AP Precalculus
units. Reconcile the source file list before treating this as complete coverage.
Distinguish AP exam scope from the broader local course scope. Do not remove
Unit 4 content solely because its assessment scope differs.

## Relationship contract

| Relationship | Required meaning | Insufficient evidence |
|---|---|---|
| `contains` | The source organizes the target in the authored curriculum or approved concept group. | Shared words or neighboring IDs. |
| `appears_in_context` | The source is used in the target instructional context. | Mastery dependence. |
| `aligned_to_standard` | The capability or example demonstrates the cited part of a standard. | Copying every standard from its lesson. |
| `prerequisite_for` | Knowledge of the source is needed to learn or perform the target at the stated scope. | Earlier lesson number or earlier course. |
| `supports` | The source helps with the target, but is not required in the same way as a prerequisite. | Membership in the same module. |
| `equivalent_to` | Both skill nodes represent the same assessable capability at comparable scope. | Shared standard, renderer, title, or generator family alone. |
| `extends` | The target adds a source-backed demand to the source capability. | A later course label alone. |
| `generated_by` | The existing generator is bound to the exact target capability. | A generator key that only shares a topic. |
| `rendered_by` | The existing renderer can express the required activity and answer shape. | A default renderer assignment. |

Do not add edge types. Do not reverse prerequisites to make the display look
ordered. Do not add reciprocal prerequisite edges to represent equivalence.

## Functional requirements

### FR1 — One authoritative node definition

Use each course's `nodes.json` as its canonical published node catalog. Reconcile
its content against the current reviewed authoring inputs before regeneration.
Document which existing draft, module, and standard files supply each part.
Do not treat the canonical filename as evidence that every row is correct.

Remove an unused embedded node copy if its consumers permit removal. Otherwise,
derive it from the canonical catalog and require deep equality by node ID.
Do not maintain review status, readiness, or source fields independently.
Do not select whichever duplicate appears first in an array.

Shared standard IDs can occur in more than one course catalog. In the combined
graph, resolve each shared ID to its existing authoritative standard definition.
Reject conflicting definitions. Do not require false global uniqueness across
course files or silently discard conflicts during deduplication.

Generation must preserve approved identities and meaning. An edit must not
renumber unrelated edge IDs or overwrite reviewed relationships with suggestions.

### FR2 — Validate actual graph consumers

Identify the exact node, edge, blueprint, and projection inputs used by each
loader, seed path, review tool, and learning-state consumer. Validate those
combinations, including the combined course-series graph.

Check endpoint resolution, duplicate IDs, duplicate triples, endpoint kinds,
standard references, generator references, and cycles. Check containment cycles
as well as prerequisite cycles. Include low-confidence and cross-course edges
when detecting authoring errors. Check approved decision edges separately.

IM2 must resolve its missing standards through the existing standards source.
AP Precalculus must resolve the 27 currently dangling embedded references.
Do not suppress validator errors with a generic exception.

### FR3 — Reconcile skill meaning and taxonomy

For each existing skill or concept, identify the action, mathematical object,
representation, conditions, and expected level of performance. Record these
facts in existing descriptions and review notes. Do not add required fields.

Reuse a stable node when its capability matches. Propose a split only when
separate evidence can distinguish the capabilities. Propose a merge only when
the capabilities are the same. A worked example, lesson, topic, standard,
problem family, or activity mode does not create a mastery skill by itself.

Review every IM3 concept row. Keep a concept only as an organizing node with
approved skill children. Reclassify a discrete capability as a skill after row
approval. Remove concept targets from domain blueprints and practice outputs.
Do not fix taxonomy by deleting capability coverage without a disposition.

Resolve the concept containment conflict before implementation. The preferred
minimal contract permits `concept -> skill` containment only when an approved
aggregator needs it. It does not permit arbitrary concept containment. Record
the proposed compatibility change against the vendored specification. Do not
silently edit `kst-srs.v3.2/SPECIFICATION.md` or its provenance files. Update the
local architecture text, endpoint validation, and tests together after approval.
If the upstream contract prevents this change, resolve the conflict before
authoring aggregator edges. Do not weaken validation to bypass it.

### FR4 — Separate authored suggestions from learning decisions

Keep candidate rows available for review through existing graph fields and
review queues. Only approved learning relationships may affect readiness,
mastery inference, transfer, placement closure, or planner priority. Draft,
reviewed-but-unapproved, rejected, and unknown-status relationships must have
no such effect. Confidence and review status remain separate facts.

Apply this rule at the existing course/domain graph boundary used by consumers.
Trace all consumers before selecting the insertion point. Prefer one existing
assembly path over separate filters in UI components. Do not add a release
registry or change the readiness mathematics as part of this repair.

Graph filtering must not convert an unreviewed skill with no approved incoming
edges into a newly available learning target. Target eligibility must still
require approved node meaning, complete prerequisite review, and the existing
exposure and practice policies. Use `reviewStatus` for graph approval. Leave
incomplete nodes unapproved. Do not create a second eligibility field.

Already approved rows require evidence review before their status can be used
as proof of prerequisite completeness. A failing gate must report the missing
approval or relationship. It must not silently return a misleading ready state.

### FR5 — Restore curriculum containment

Every approved lesson, skill, and authored example must be reachable from its
course through the intended containment path. Reference nodes such as standards,
generators, and renderers do not need curriculum containment.

Repair IM3 Module 1 example placement. Repair AP Precalculus skill placement and
lessons `4.2`, `4.3`, `4.9`, and `4.14`. Verify the source before adding an edge.
Keep many-to-many instructional context when the curriculum requires it.

Normalize `metadata.module` and `metadata.unit` through the existing domain
extraction path. Do not rename every stored ID or duplicate metadata solely to
satisfy the generic suggester. Numeric lesson order must handle `1.9` and `1.10`.

### FR6 — Author real prerequisites and support relationships

For each capability, review its prerequisites within and across lessons.
Identify what a learner must already know. Record a short reason and an existing
source reference for each proposed edge. Use existing weight values. Explain
whether the relationship is a hard requirement or support under the existing
readiness contract. Do not assign weights from course order.

Reject the confirmed IM2 vertex-form-to-trigonometric-identities prerequisite.
Review the other sequence-derived edges individually or in source-supported
groups. Stop generating decision edges from lexical skill order.

Review IM3 same-module support edges. Remove or reject those without a specific
support relation. Do not replace them with a different complete module-to-module
mesh. Do not repair graph sparsity by maximizing edge counts.

For a legitimate root capability, record why no prerequisite exists within this
series. For assumed knowledge outside this series, identify that boundary in
existing source/review notes. Do not create an invented foundation node.

### FR7 — Repair equivalence and cross-course progression

Reject the confirmed geometry/parallelogram equivalence. Review the whole
cross-course suggestion set. A worked example can support a skill through an
example mapping; it cannot be an approved cross-course mastery identity.

Retain an approved `equivalent_to` edge only between matching skills. Verify
scope, representations, conditions, and evidence expectations in both courses.
If one capability is broader, use an existing appropriate relationship only
after source review. Otherwise reject the suggestion. Bulk promotion is forbidden.

Add source-backed cross-course prerequisites using the existing cross-course
edge file. Update its existing readers to handle approved edge types explicitly.
Equivalence-specific functions must receive equivalence edges only. No consumer
may assume that every row in that file is an equivalence edge.

Review IM1 -> IM2, IM2 -> IM3, and IM3 -> AP Precalculus transitions. Also check
valid direct dependencies that skip a course. Do not force a single course chain.
Use representative strands: algebraic expressions and equations; functions and
rates; polynomials and quadratics; radicals and rational functions; exponential
and logarithmic functions; geometry and trigonometry; statistics and probability.
Keep independent strands independent when sources support that structure.

Validate equivalent components for inconsistent scope. Check prerequisite cycles
both on stable nodes and after approved equivalence identities are collapsed.
Detect a prerequisite that becomes a self-dependency through equivalence.

### FR8 — Establish source coverage and standards meaning

Reconcile curriculum PDFs in page and example order. Use one existing or proposed
`worked_example` node per authored example. Preserve page references. Record a
faithful prompt and solution only when extraction is reliable.

Use `KnowledgeBlueprint.sourceNodeIds` for example-to-skill mappings. The mapping
is many-to-many. One example can support zero, one, or multiple skills. A skill
can use multiple examples or another explicit authored source. Empty mappings
need a source-backed explanation; they must not be filled with arbitrary nearby
examples. A review note is documentation, not a second runtime inventory.

For each standard edge, verify the actual skill or example against the standard.
Do not promote lesson-level alignment to high-confidence skill alignment without
checking it. Populate AP Precalculus skill edges from verified mappings. A
blueprint field cannot substitute for a required graph relationship.

Account for every in-scope source capability as represented, deliberately
excluded with a reason, or unresolved. Unresolved required capability coverage
blocks semantic completion. Do not use a fixed skill total as the denominator.

### FR9 — Regenerate consistent projections

Use the existing projectors after approved graph edits. Domain mastery blueprints
must target skills. Preserve existing non-mastery `task_blueprint` uses only if
the contract and consumer require them. No concept, lesson, standard, or worked
example may receive a mastery practice row or SRS target.

Regenerate activity maps, SRS inputs, and teacher evidence for the approved slice.
Resolve each reference against the exact graph inputs. Remove stale concept
targets, stale prerequisites, and unapproved equivalence effects. Check embedded
SRS arrays as well as standalone files. Candidate views may remain in the
development workbench, but they must not become learner eligibility.

Use the current projector field names and schemas. Do not invent a new projection
format to hide the different existing output shapes. Generate each completed
slice once after its source and graph edits settle. Compare a second temporary
generation to prove determinism. Do not add checksums.

### FR10 — Verify readiness and generator bindings

For each currently ready node, verify the generator, renderer, answer shape,
server grader, and exact-node evidence path already exist and match the skill.
Add missing `generated_by` and `rendered_by` relationships to existing reference
nodes when those facts are true. Otherwise clear unsupported readiness through
the approved disposition. A structural exception does not authorize practice.

Do not implement missing generator families in this track. Record their existing
gap-queue ownership. A valid semantic node may remain unavailable for independent
practice. Do not claim course-wide activity coverage from graph completion.

### FR11 — Preserve learner identity and product policy

Before a rename, split, merge, or removal, search static consumers and available
read-only evidence references for the exact ID. Preserve IDs when meaning is
unchanged. For a changed meaning, prepare an explicit old-to-new disposition in
the plan before editing. Never attach old mastery to a new capability silently.

This track does not migrate production learner records. If stored evidence needs
a migration, define a separate bounded migration task and approval boundary.
Keep the affected graph change unavailable until its compatibility path is clear.
Do not delete review history or infer replacement mastery from a shared standard.

Teacher-led evidence must remain separate from supplementary mastery evidence.
Graph approval must not bypass first exposure, authorization, server grading,
idempotency, or the existing knowledge-state and SRS policies.

Missing cross-course learner state must remain unknown. Structural progression
does not authorize new cross-app data access. Use the existing authorized state
interface. If it cannot supply the required state, leave that transition outside
production eligibility and record the runtime limitation. Do not add learner-state
transport in this graph repair.

### FR12 — Prevent regression through behavior tests

Tests must inspect the actual artifacts and call the actual graph consumers.
Include the confirmed false prerequisite and false equivalence as negative cases.
Include approved positive cases after source review. Do not treat the presence of
a symbol, a fixed row count, or a generator's own formula as correctness evidence.

Test that unapproved edges cannot alter decisions. Test that filtering them does
not unlock unreviewed targets. Test both directions of equivalent identity where
the existing transfer contract requires it. Test missing foreign learner state.
Prove that graph copies and projections cannot disagree silently.

### FR13 — Complete review with bounded source changes

Use one agent. Expand one course module or unit into small lesson tasks before
implementation. Each task must identify exact paths, sources, expected graph
changes, tests, and reference impact. Complete and verify that task before the
next one. Do not combine curriculum authoring, new generators, UI repair, and
evidence migration into one large task.

Use existing review fields, workbench, queues, and Measure notes. Do not add a
database, registry, audit ledger, manifest, hash, checksum, or review application.
Keep reusable packages domain-neutral. Do not add dependencies.

## Acceptance criteria

| ID | Required result | Verification |
|---|---|---|
| AC1 | Canonical and required embedded node definitions agree. Shared standard IDs resolve without conflict. | Deep comparison and consumer-loading tests. |
| AC2 | All four actual graph inputs and the combined graph pass structural checks. | Existing validator plus containment and combined-graph tests. |
| AC3 | Each approved skill has source-backed scope and an approved taxonomy. | Complete source disposition review; no fixed count assertion. |
| AC4 | Approved lessons, skills, and examples have correct containment. | Course-root traversal and source spot checks. |
| AC5 | Approved prerequisites and support edges have capability reasons. Known false pairs are absent from decisions. | Negative regressions and approved positive cases. |
| AC6 | Approved equivalence connects matching skills only. No shared-standard rule can auto-approve identity. | Whole-file review and behavioral transfer tests. |
| AC7 | All course transitions have reviewed prerequisite coverage or explicit source-backed independence. | Strand review, combined closure, and cycle tests. |
| AC8 | No unapproved graph fact affects learning decisions or creates new target eligibility. | Readiness, placement, inference, and planner tests. |
| AC9 | No concept receives a domain mastery blueprint, practice target, or SRS target. | Taxonomy and regenerated projection checks. |
| AC10 | Every retained ready flag has a valid exact-skill binding and the required graph relationships. | Existing generator/renderer/schema/grader checks. |
| AC11 | Stable identity and learner history remain valid. No cross-course state is fabricated. | Reference checks and compatibility tests. |
| AC12 | Every in-scope source capability has a reviewed disposition. No required coverage remains unresolved. | Course-by-course source review and final human acceptance. |
| AC13 | Generated artifacts are deterministic. All required quality gates pass. | Focused and full tests, lint, standalone TypeScript, build, generation, and Doctor. |

## Completion and quality gates

Refresh the review's baseline before implementation. The recorded core result
was 698 passed and three repository-boundary failures. The focused source and
alignment result was 69 passed. These are historical evidence only.

Run focused tests after each change. Run `npm run lint` and relevant tests before
each implementation commit. Run standalone `npx tsc --noEmit` for every affected
workspace in addition to its build. Run broader package and app gates before
closeout. Target greater than 80 percent coverage for changed mechanisms.

Record unrelated failures with an owner and reproduction command. Do not weaken
tests or call a failing required gate a pass. A remaining required gate prevents
final track completion. Keep structural, semantic, and runtime results separate.

Manual review must inspect the authored source and proposed graph delta. It must
not approve a row from a screenshot count, schema pass, or successful render.
Use the existing workbench for available source and activity views. Use graph
tests and review notes for relationships that the workbench does not display.

## Out of scope

- Business Math and Danielson graph construction.
- A complete new prerequisite curriculum below IM1.
- Course-wide generator authoring or activity redesign.
- Changes to readiness formulas, transfer formulas, or SRS scheduling mathematics.
- New cross-course learner-state transport or production data migrations.
- Production deployment or broad supplementary-practice enablement.
- Unrelated dependency, architecture, UI, or authentication cleanup.
- Changes to `measure/automation-supervisor.py`.

Graph completion can permit a later rollout review. It cannot substitute for it.
