# Specification: Mastery Advantage Graph Remediation

## Purpose

Repair the Mastery Advantage rollout after the three rollout plans used proxy
counts as curriculum skill counts.

Start with the existing graph and curriculum sources. Remove invalid rollout
layers before new implementation. Restore the ordinary IM3 lesson flow. Preserve
the existing server-authority work as unapproved candidate input until direct
server-grading and exact-node evidence verification support acceptance.

Do not resume broad rollout work until the user approves the skill inventory.

## Required outcomes

1. The IM3, AP Precalculus, and Business Math first-unit graphs must use
   assessable curriculum capabilities with correct node granularity and
   relationships. A Business Math problem family is not a mastery skill.
2. Each approved skill must have algorithmically generated Worked, Guided, and
   Independent activity sets that a student can use. Worked mode is a complete
   demonstration. Guided mode provides real scaffolding. Independent mode
   collects a real answer and uses a real server grader.
3. Each generated Worked example must be substantially similar to every
   authored first-unit curriculum example that it represents. Preserve the
   method, mathematical structure, notation, visual requirements, context, and
   difficulty.
4. Guided and Independent attempts must create valid evidence for the exact
   knowledge-space node. A rendered activity or passing test is not enough.

Completion requires direct student-use verification in the real QA or student
component, server-grading verification, and exact-node evidence verification.
Tests, schema validation, and static gates are supporting evidence only. They
cannot approve a row by themselves. Previous Module 1 pass claims are rejected
historical evidence. Keep all prior work unapproved until it passes this
completion standard again.

## Incident Statement

The superseded plans made three invalid assumptions.

1. The IM3 plan treated only `kind: skill` rows as the mastery inventory.
2. The AP Precalculus plan accepted a mixed topic and subskill graph as a final
   skill inventory.
3. The Business Math plan treated problem generator families as curriculum
   skills.

Those assumptions drove production code, tests, graph artifacts, and Measure
status claims. A Green test that freezes an invalid count does not validate the
curriculum model.

## Canonical Graph Boundary

IM1, IM2, IM3, and AP Precalculus form one logical course-series graph.

The repository stores course-owned node and edge projections in these folders:

- `apps/integrated-math-1/curriculum/skill-graph/`
- `apps/integrated-math-2/curriculum/skill-graph/`
- `apps/integrated-math-3/curriculum/skill-graph/`
- `apps/pre-calculus/curriculum/skill-graph/`

The repository joins those projections with:

- `packages/math-content/src/knowledge-space/cross-course-edges.json`

Do not create a second unified graph file. Use the existing course projections
and the existing cross-course edge file as one graph boundary.

Business Math is outside this course-series graph. Business Math needs its own
curriculum-derived graph. Its problem family registry is a capability catalog.
It is not a skill inventory.

## Verified Evidence Baseline

These numbers describe the current artifacts. They are not approved skill
totals.

### Course-Series Graph

- The four node files contain 2,272 rows and 2,249 unique node IDs.
- The four node files contain 456 `skill` rows.
- The four node files contain 103 `concept` rows.
- The four course edge files contain 8,144 rows.
- The cross-course file contains 5,024 `equivalent_to` edges.
- All 5,024 cross-course edges are `draft` and `medium` confidence.
- Of those edges, 4,420 join a `skill` and a `worked_example`.
- The remaining 604 join two `skill` nodes.

### Current Runtime Projections

| Course | `skill` rows | `concept` rows | SRS projection rows |
|---|---:|---:|---:|
| IM1 | 138 | 0 | 138 |
| IM2 | 149 | 0 | 149 |
| IM3 | 96 | 103 | 174 |
| AP Precalculus | 73 | 0 | 73 |

The IM3 SRS projection targets 86 `skill` rows and 88 `concept` rows. It omits
10 `skill` rows and 15 `concept` rows. This conflicts with the repository rule
that runtime practice projections must not target `concept` nodes.

The IM3 class-period packages contain 100 unique `objectiveCode` values. The
IM3 graph contains 199 `skill` and `concept` rows. These are different
taxonomies. Neither number can replace a reviewed inventory.

AP Precalculus has 58 topic files. Units 1 through 3 contain 44 CED learning
objective IDs and 137 CED essential knowledge IDs. Unit 4 has topic descriptions
but no local learning objective or essential knowledge list. The current graph
has 73 `skill` rows. The graph uses different granularity across units.

### Business Math

- The published manifest contains 89 lessons.
- The lessons contain 267 learning objective entries.
- The lessons contain 261 unique learning objective strings.
- The problem family registry contains 19 families.
- The new graph contains 19 `skill` rows.
- All 19 rows use a Unit 1 Lesson 1 node location.

The 19-row graph is a family inventory. It is not a curriculum skill graph.

## Skill Inventory Contract

A mastery node must represent one assessable student capability. It must have
an authored curriculum source. It must have a stable graph identity.

Apply these rules.

1. Start from the existing graph.
2. Use curriculum sources to verify graph coverage and granularity.
3. Do not infer skill status from `kind`, topic count, lesson count, generator
   count, renderer count, or SRS row count alone.
4. Do not treat a standard, topic, lesson, worked example, problem family, or
   renderer as a skill without curriculum evidence.
5. Keep a `concept` as an aggregator only when it groups child `skill` nodes.
6. Do not send a `concept` node directly to SRS or practice.
7. Reclassify a current `concept` row as `skill` when it is a discrete,
   assessable capability and has its own evidence.
8. Preserve a node ID when its meaning remains the same.
9. Change or remove a node ID only after the user approves the exact row.
10. Use `reviewStatus` and existing graph fields. Do not add an eligibility
    schema or a second runtime registry.
11. Reuse approved IM1 and IM2 rows. Do not copy them into a new inventory.
12. Review graph deltas and unresolved rows. Use the current graph files for
    unchanged rows.

The inventory review must keep taxonomy classes separate. It must not add
learning objectives, essential knowledge, topics, and problem families into one
total.

## Curriculum Alignment Review Workbench

Use the existing Business Math development route at `/blueprint-qa`. Do not
create a second review application.

The workbench is a temporary curriculum review tool. It is not a student
route. It is not a graph editor. It is not an approval database.

### Review Order

The workbench must show one course-series graph at a time. It must support
Integrated Math 1, Integrated Math 2, Integrated Math 3, and AP Precalculus.
It must keep Business Math separate until an approved Business Math graph
exists.

The workbench must order content by these fields:

1. Course.
2. Module or unit number.
3. Lesson number.
4. Skill title and stable node ID.
5. Worked-example number.

The workbench must use numeric order for numeric labels. For example, lesson
`1.10` must follow lesson `1.9`.

### Source Panel

The source panel must show the referenced curriculum page. It must use the
original PDF. It must not use a screenshot.

The PDF endpoint must use a fixed allowlist of repository curriculum PDFs. It
can reuse the native development file handler. It must reject arbitrary file
paths. It must return `404` outside development.

A worked-example node can cite an exact page with a repository source
reference that ends in `#page=<positive integer>`. The workbench must open that
page when the reference exists.

The workbench must show an explicit `Page reference missing` state when the
worked-example node has no exact PDF page reference. It can provide a manual
page control for source review. A manual page choice does not modify the graph.

The source panel must also show these existing graph fields:

- Worked-example node ID.
- Worked-example title.
- Source references.
- Existing `metadata.rawText`, when present.

### Skill and Modality Panel

Each approved mastery skill must have one skill-level blueprint with these
three modalities:

1. `workedExampleSpec` for the worked example.
2. `guidedPracticeSpec` for scaffolded guided practice.
3. `independentPracticeSpec` for independent practice.

The three modalities belong to one skill. They are not three mastery skills.
A `worked_example` source node is also not a mastery skill.

The primary modality surface must show the same activity component path that
the target course student runtime uses. It must pass the exact stored activity
projection props and the selected runtime mode to that component. It must
validate the props with the existing component schema before render. If the
target course adds an app-owned wrapper that changes the visible activity, the
workbench must reuse that wrapper or show `Student view unavailable`. A shared
inner component is not exact-view evidence when the wrapper changes the view.

Each modality specification can store an optional `rendererProps` object. This
object contains the candidate props that the assigned student component needs.
The projector must copy this object without parsing, transformation, or
defaults. The review decision approves or rejects these candidate props. The
props do not need prior approval before the workbench displays them.

The workbench must not infer, transform, or default missing component props. It
must show `Student view unavailable` when the activity projection is absent,
the renderer is absent, or the props do not match the component schema. It
must show the exact mismatch. The reviewer cannot approve an unavailable
student view.

The exact stored blueprint fields must remain available in a secondary
inspection panel. The panel must show `Missing` when a modality field is
absent. It must not replace missing content with generated placeholder text.
The existing generator output can remain as a secondary diagnostic for
independent practice. It must not supply or repair the primary student view.

The student view must use the existing application background and foreground
tokens together. The review controls and diagnostics must use readable text
and background pairs. A light review panel must not contain text that uses the
dark-theme foreground token.

### Review Decisions

The reviewer must make one decision for each of these elements:

- Source alignment.
- Worked example.
- Guided practice.
- Independent practice.

Each decision is `Approved` or `Needs fix`. A `Needs fix` decision requires a
short note. The skill is complete only when all four elements are approved.

The first implementation must use browser `localStorage` to resume the review.
It must use the browser download API to export the decisions as JSON. It must
not add a database, schema field, approval ledger, hash, checksum, manifest, or
provenance record.

The exported review is an implementation input. It does not change graph
`reviewStatus`. A developer must apply an approved graph delta through the
normal tested source-edit workflow.

### Workbench Acceptance Criteria

1. The route is unavailable outside development.
2. The course selector loads the existing graph files.
3. The navigator uses module, lesson, skill, and example order.
4. The source panel uses an allowlisted original PDF.
5. An exact `#page=` source reference opens that PDF page.
6. A missing page reference is visible and does not become an inferred fact.
7. Each modality uses the registered student activity component when its
   stored activity projection is valid.
8. The preview uses the exact stored activity props and selected runtime mode.
9. Missing or invalid runtime props show `Student view unavailable` and cannot
   receive an `Approved` decision.
10. Review decisions resume in the same browser.
11. The exported JSON contains stable node IDs, element decisions, and notes.
12. The feature adds no source mutation, dependency, hash, manifest, or
    approval database.
13. All three exact blueprint modality fields remain visible in a secondary
    raw-data panel.
14. The preview adds no fallback equation, question, answer, or activity prop.
15. The student view uses the application theme background with its foreground
    color. Review diagnostics remain readable on the review background.
16. The first IM3 skill copies its three explicit `rendererProps` objects into
    its three projection rows.
17. The first IM3 independent-practice preview uses the IM3 student wrapper.
18. IM3 source `1-1-1` uses the source equation
    `f(x) = x^2 + 2x - 3`. Its Worked view shows the analysis, completed table,
    completed graph, domain, and range. It renders mathematics as mathematics.
    The Worked view does not present a read-only graph as an input task.

## PDF Example to Skill Candidate Contract

Use each authored example in an approved curriculum PDF as a source item. Each
source item must have one `worked_example` node in the existing course graph.

Do not assume that the current worked-example inventory is complete or
correct. Reconcile it against the PDFs in page order.

### Worked-Example Node Rule

Each worked-example node must have:

- One stable node ID.
- Course, module or unit, lesson, and example number.
- The authored example title or a short faithful title.
- The original PDF repository path with an exact `#page=` reference.
- The authored prompt and solution text when extraction is reliable.
- `reviewStatus: draft` until a human reviews the source alignment.

The PDF page is the source of truth. Optical character recognition (OCR) and
existing Markdown can assist extraction. They cannot override the PDF.

### Skill Candidate Rule

For each worked example, identify the assessable student capabilities that the
example teaches or demonstrates.

Before a new skill candidate is created, compare the capability with the
existing skills in the same course-series graph. Reuse an existing skill when
its meaning matches. Create a candidate only when no existing source-backed
skill represents the capability.

The mapping is many-to-many:

- One example can support zero, one, or many skills.
- One skill can use zero, one, or many worked examples.
- A worked example does not create a skill by itself.
- A generator family does not create a skill by itself.

Use `KnowledgeBlueprint.sourceNodeIds` for the reviewed example-to-skill
mapping. Add graph edges only when the existing edge contract requires them.
Do not invent a new edge type.

### Candidate Review and Runtime Rule

Keep every new or changed skill as a proposal until the user approves its
source capability and granularity.

After approval, create or repair the one skill-level blueprint. The blueprint
must contain the worked-example, guided-practice, and independent-practice
specifications. A skill must remain unavailable for supplementary practice
until its independent modality has a valid generator, renderer, answer schema,
and server grading path.

PDF extraction does not authorize runtime rollout. User review, graph tests,
and one verified vertical slice remain required.

## Removal-First Contract

Use a hunk-level disposition review before production edits.

Classify each changed path or hunk as one of these values:

- `preserve`: The behavior is required and passes an independent test.
- `rework`: The behavior is useful but depends on an invalid skill model.
- `remove`: The behavior exists only to support a proxy count or fabricated
  mapping.
- `unresolved`: The current evidence does not support a safe decision.

The user must approve the disposition review before removal starts.

The first review must include these presumptive dispositions.

| Area | Presumptive disposition | Reason |
|---|---|---|
| IM3 `lib/practice/im3-rollout.ts` and its 96/83 tests | Remove | It freezes the invalid `kind: skill` count. |
| IM3 phase-completion mastery branch | Rework | Phase completion must not create teacher evidence in place of a real activity attempt. |
| AP Precalculus regenerated edges and review queue | Rework or restore | They were generated from the unapproved 73-row inventory. |
| Business Math 19-row graph, rollout map, and graph loader | Remove | They derive graph identity from generator families. |
| Business Math KST read tied to the 19-row graph | Rework | It can reuse the shared bridge after the graph is valid. |
| Generic answer input work | Rework | It removes auto-answer behavior but does not yet support every authored answer shape. |
| Opaque submission IDs, server grading, role checks, idempotency, and retry behavior | Preserve and retest | These trust-boundary behaviors do not require the proxy counts. |
| Shared KST and SRS packages | Preserve | They are the existing implementation. Do not duplicate them. |

Do not use `git reset`, `git checkout`, or a whole-file replacement to remove
mixed work. Use `git diff HEAD -- <path>` and edit only approved hunks.

## Correct Product Flow

Each approved mastery node has two student flows.

### Daily Curriculum

1. The student submits a real raw answer in the normal lesson flow.
2. The server stores the source submission.
3. The server assigns the learner, activity, node, time, and ordinal.
4. A trusted consumer loads the source by opaque `submissionId`.
5. The consumer records `teacher_led` evidence.
6. Teacher-led evidence changes no KST or SRS state.

Completing a phase is not a substitute for the source activity attempt.

### Supplementary Mastery Advantage

1. The queue selects only an approved and exposed mastery node.
2. The student submits raw answers.
3. The server reconstructs or loads the approved activity.
4. The server grades the submission.
5. The evidence consumer receives only the opaque `submissionId`.
6. The consumer reuses the existing SRS and KST bridge.
7. A replay creates no duplicate effect.

## Cost and Scope Controls

1. Use one agent only unless the user changes this rule in writing.
2. Stop after the inventory review and wait for user approval.
3. Stop after the removal disposition and wait for user approval.
4. Prove one vertical slice in each app before any course-wide generator work.
5. Expand one approved curriculum group at a time.
6. Do not start a generator wave from a numeric gap count.
7. Do not add a dependency, schema field, route family, graph registry, cache,
   wrapper, or adapter unless existing code cannot support the approved slice.
8. Stop and explain the exact need before any scope increase.

## Hashing and Provenance

This remediation needs no new hash, checksum, fingerprint, source-tree digest,
or provenance manifest.

Use Git commit and tree identity for repository provenance. Use behavior tests
for correctness. Do not regenerate unrelated hash or generated artifacts.

## Acceptance Criteria

1. The three superseded rollout plans cannot direct more implementation.
2. The user approves the graph-delta inventory and taxonomy decisions.
3. No final skill total comes from a proxy count.
4. The course-series graph remains one logical graph.
5. No runtime practice or SRS row targets a `concept` node.
6. The Business Math graph derives from approved curriculum capabilities.
7. Business Math families map to zero, one, or many approved skills as needed.
8. IM3 ordinary phase completion works without Mastery Advantage side effects.
9. Daily teacher evidence requires a real stored source attempt.
10. One approved vertical slice works in IM3, AP Precalculus, and Business Math.
11. Each vertical slice reuses the existing KST and SRS implementation.
12. Proxy-only production code, tests, and metadata are removed.
13. Accepted trust-boundary behavior remains Green.
14. No unauthorized hash, dependency, schema, manifest, or audit system is
    added.
15. Focused tests, typecheck, lint, build, generated facts, boundaries, Measure
    Doctor, and `git diff --check` pass.
16. Draft cross-course equivalence edges affect no mastery, readiness, or
    transfer decision.

The four required outcomes above are the acceptance contract. The prior
Module 1 test and schema results do not satisfy this contract.

## Out of Scope

- Authoring all missing generators.
- Enabling all graph nodes for practice.
- Reviewing all 5,024 draft cross-course edges.
- Implementing cross-course learner-state transport.
- Changing KST mathematics or SRS scheduling.
- Creating a new graph package or unified graph file.
- Rewriting valid pilot authority code only for style.
- Improving auditability or provenance.

Implementation must use small slices in this order: source alignment, graph
identity and relationships, modality behavior, server grading, and exact-node
evidence. Do not create a large implementation task that combines these
boundaries.
