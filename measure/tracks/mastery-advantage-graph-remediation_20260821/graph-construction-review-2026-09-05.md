# Graph Construction Review: IM1, IM2, IM3, and AP Precalculus

Date: 2026-09-05. Base commit: `106e1cb2`. Scope: current workspace files, including pending changes.

## Summary

The four graphs have construction defects. AP Precalculus has the largest structural gap. Cross-course equivalence links also contain false capability matches. Do not use this review as approval of a mastery inventory.

This review checks graph construction, typed relationships, and stored projections. It does not verify every curriculum PDF example or the deployed student interface. Node-kind counts below describe stored rows. They are not approved mastery totals. No graph or runtime code was changed for this review.

## Verification

The existing `validateKnowledgeSpace` validator ran against two representations for each course: `nodes.json` plus the edges from `edges.json`, and the complete embedded graph in `edges.json`.

| Course | Separate node and edge files | Embedded graph |
|---|---|---|
| IM1 | Pass | Pass |
| IM2 | 938 dangling edges | Pass |
| IM3 | 2 missing generator relationships | 2 missing generator relationships |
| AP Precalculus | 87 missing standard alignments; 18 missing generator relationships | 27 dangling edges; 8 missing standard alignments |

All four courses have unique node IDs and edge IDs. None has duplicate edge triples. No prerequisite cycle exists, including when low-confidence edges are checked. These results do not establish semantic correctness.

- Core suite: 698 passed; 3 failed. All three failures invoke the repository boundary check, directly or through Measure Doctor. That check reports 172 violations. These are current workspace failures; this review does not establish their introduction date.
- Focused extraction, assembly, standards alignment, and cross-course rate cleanup: 69 passed.
- New tests: none. Direct checks used existing validators and temporary commands.
- Browser and deployment checks: not performed. This is a source graph review.
- Build and lint: not run for this documentation-only review. No production code was edited.

## Findings

### 1. High: AP Precalculus skills are absent from the containment and standards graph

All 84 rows labeled `skill` lack an incoming `contains` edge. All 84 also lack an outgoing `aligned_to_standard` edge. Blueprint alignment fields exist for many skills, but these do not create graph edges. The validator reports three additional unaligned worked examples.

The graph has only two prerequisite edges. Thus 82 of its 84 skill rows have no incoming prerequisite. The current readiness function returns full readiness when a node has no prerequisite. This is a graph-level result; it does not mean that the application exposes every node to students.

Four lesson nodes also lack containment: `4.2`, `4.3`, `4.9`, and `4.14`. A traversal from the course root cannot reach these lessons or any skill through containment.

Example: [average-rate skill](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/skill-graph/nodes.json:4189). Its location uses `metadata.unit`. The generic [edge suggester](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/knowledge-space-core/src/edge-suggestions.ts:171) requires `metadata.module` for skill placement and sequencing. This is a construction mismatch. The draft catalog also omits later skill additions. Rerunning the old generator alone will not reconcile the graph.

Repair direction: reconcile the existing source-backed skills, lessons, and standards. Add the required reviewed relationships. Preserve stable IDs. Do not infer mathematical prerequisites from topic order.

### 2. High: Graph copies disagree about node identity and state

The standalone node catalog and the embedded catalog in `edges.json` differ:

| Course | Difference |
|---|---|
| IM1 | 647 shared nodes have different review status. The standalone nodes are approved; embedded copies are draft. |
| IM2 | The standalone catalog omits 77 standard nodes. Its 938 standard edges therefore have missing targets when paired with that catalog. Another 549 shared nodes have different review status. |
| IM3 | 280 shared nodes differ in one or more fields, including titles, source references, generator fields, and readiness. |
| AP Precalculus | The embedded catalog omits 85 standalone nodes. It has 27 dangling edges. Another 67 shared nodes differ. |

Example: [IM2 unresolved standard edge](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/edges.json:12561).

A consumer can receive different graph facts depending on the file it loads. IM3's [runtime loader](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts:28) uses the standalone nodes and the separate edge list. The edge-generation script validates its embedded nodes instead. A passing embedded validation does not validate the runtime file combination.

Repair direction: use the existing canonical node source consistently. Synchronize required generated copies. Validate the exact file combination that each consumer loads.

### 3. High: Cross-course equivalence uses shared standards as capability identity

The cross-course file contains 4,996 `equivalent_to` edges. All are draft. All use the `standard` match rule. Of these, 4,395 link a worked example to a skill; 601 link two skills.

A confirmed false match is [cross-course.edge.1094](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/math-content/src/knowledge-space/cross-course-edges.json:24089):

- IM1: differentiate between synthetic geometry and analytic geometry.
- IM2: find the area and perimeter of parallelograms.

These are different assessable capabilities. A shared standard does not make them equivalent. The [matching algorithm](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/knowledge-space-core/src/cross-course-equivalence.ts:341) produces cross-course pairs from standard overlap without checking capability identity.

Keep these edges as unapproved suggestions. This review does not claim that draft edges currently award transfer credit. The defect is their semantic classification as equivalence candidates and their lack of capability evidence.

Repair direction: review the exact source and target capabilities. Retain equivalence only when the capabilities match. Use shared standards as search evidence, not as proof of identity.

### 4. High: Lesson order creates false and incomplete prerequisite relationships

IM1 has 92 prerequisite edges. IM2 has 81. Every one is draft and low confidence. IM3 has 44 low-confidence draft prerequisite edges plus nine medium- or high-confidence draft edges.

The [suggester](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/knowledge-space-core/src/edge-suggestions.ts:340) sorts skill IDs. It links the last skill in one lesson to the first skill in the next lesson. It does not analyze what the student must know.

A concrete IM2 edge makes writing a quadratic in vertex form a prerequisite for applying reciprocal and quotient trigonometric identities. The current readiness function accepts this draft edge. A direct call with no prior mastery returns `{ score: 0, state: "blocked" }` for the trigonometric skill.

The same method omits dependencies within lessons and most dependencies across lessons. IM1 has 46 skill rows with no prerequisite; IM2 has 68; IM3 has 54. Some roots are valid, but these counts expose the sparse construction method. They do not prove that every root needs an edge.

The generic contract permits sequence-based suggestions. The error is treating such suggestions as a reviewed mathematical dependency graph. [Readiness](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/knowledge-space-core/src/weighted-readiness.ts:50) does not filter by review status or confidence.

Repair direction: author capability-based dependencies. Keep unreviewed suggestions outside the graph used for learning decisions.

### 5. High: IM3 concept rows still appear as practice and SRS targets

IM3 has 103 concept rows. None has a `contains` edge to a child skill. Its blueprints still target 88 concept rows. Stored projections contain 88 concept targets for spaced repetition scheduling (SRS) and 176 concept-targeted activity rows.

Example: [binomial-theorem SRS target](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json:257) and its [blueprint](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/blueprints.json:3699).

All 88 concept SRS rows have `generatorReady: false`. This finding does not claim that they are currently served as independent practice. They still violate the projection taxonomy contract.

The current SRS projector skips concepts. The activity projector resolves concepts through child skills and skips concepts with no child skills. The stored artifacts therefore disagree with those mechanisms.

There is also a contract conflict. [Knowledge Space Architecture](/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/knowledge-space.md:123) requires concept-to-skill containment. The [endpoint rules](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/knowledge-space-core/src/edge-endpoint-rules.ts:32) reject `concept` as a containment source. Resolve that conflict before trying to repair aggregators by adding edges.

Repair direction: review each concept's meaning. Reclassify discrete capabilities only through the approved row review. Keep genuine aggregators out of direct practice targets. Regenerate affected projections after the taxonomy is resolved.

### 6. Medium: IM3 Module 1 examples have no containment relationships

All 52 Module 1 worked-example nodes lack an incoming `contains` edge. The other 208 IM3 example nodes have containment. Example [math.im3.example.1.1.001](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/nodes.json:26) has explicit lesson metadata and a PDF reference, but no lesson-to-example containment edge.

Blueprint source mappings can still locate these examples. A graph traversal through lesson containment cannot. The generic generator excludes Module 1 nodes from new suggestions and preserves pilot edges, so it also preserves this gap.

Repair direction: add source-verified lesson-to-example relationships for the existing IDs. Do not create replacement example nodes.

### 7. Medium: Readiness flags lack required generator relationships

Two IM3 skills are marked `independentPracticeReady: true` but lack the required `generated_by` relationship or documented exception:

- [Identify a quadratic maximum from its graph](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/nodes.json:1369).
- Graph a quadratic from a vertex and y-intercept by using symmetry.

AP Precalculus has the same validation error on 18 skill rows. For example, its average-rate skill has a generator key and a readiness flag, but no generator edge.

A generator implementation may exist. This error concerns the graph relationship required by the existing validator. A string key alone does not satisfy that contract.

Repair direction: verify the actual binding, then add the required graph relationship or clear unsupported readiness. Do not create a second generator registry.

### 8. Medium: Source mappings and support relationships do not establish capability coverage

Every IM1 blueprint has an empty `sourceNodeIds` list: 138 rows. Every IM2 blueprint does too: 149 rows. IM3 has 168 empty mappings among 192 blueprints. AP Precalculus has 62 among 81.

These empty mappings do not prove that curriculum source material is absent. They show that the graph does not record the example-to-skill mapping required for the current source review. The current row counts cannot establish complete curriculum coverage or correct skill granularity.

IM3 also has 922 support edges from the generic same-module rule. For example, binomial-theorem expansion supports every skill in Module 2, including addition and subtraction of polynomials. The algorithm uses module membership alone. This does not establish a specific learning relationship.

Repair direction: verify the many-to-many example-to-capability mappings. Review support edges against the actual source capabilities. Keep missing generator work separate from missing curriculum coverage.

## Disposition

The review is complete. Graph repair and row approval remain open in the parent track. Address canonical graph consistency and invalid learning relationships before broad generator rollout. This report does not approve any graph row, modality, or deployment.

## Whole-Series Semantic Judgment

The current course-series graph does not yet make semantic sense as a complete learning model. It mixes curriculum containment, example evidence, prerequisite knowledge, and cross-course capability identity. The confirmed false equivalence and sequence-derived prerequisite examples are sufficient to reject whole-series semantic acceptance. This does not reject every node or the underlying curriculum.

The cross-course artifact contains equivalence suggestions only. It contains no course-to-course prerequisite relationships. Thus it does not express the progression from IM1 foundation capabilities to IM2, IM3, and AP Precalculus capabilities. Equivalent capabilities, supporting knowledge, and prerequisite knowledge need separate source-backed decisions.

A complete semantic approval still requires capability-level review against the authored curriculum. This review identifies decisive counterexamples; it does not claim an exhaustive PDF-to-graph reconciliation.
