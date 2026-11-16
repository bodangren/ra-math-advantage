# IM1 G55 Lesson 10-4 final graph authoring scope

## Basis

This scope uses the committed Lesson 10-4 capability-equivalence review and the accepted 54-prompt source inventory. It also inspects the current blueprint, canonical edge, standard edge, spaced-repetition-system (SRS), teacher-evidence, and embedded activity artifacts.

## Source identities

Preserve these four approved worked-example identities and their approval states:

- `math.im1.example.10.4.012`: Example 1, Problems 1–14.
- `math.im1.example.10.4.013`: Example 2, Problems 15–20.
- `math.im1.example.10.4.014`: Example 3, Problems 21–26.
- `math.im1.example.10.4.015`: Example 4, Problems 27–30.

Use `math.im1.lesson.10.4` for Mixed Exercises, Problems 31–54. Do not add a Mixed Exercises worked-example node.

Update each source node in all four node copies with exact DOCX and restored-module references. Keep the existing IDs, row order, Unicode, and approval state.

## Four new draft capability nodes

Use stable IDs derived from these exact bounded names:

1. `math.im1.skill.10.4.determine-whether-two-coordinate-defined-segments-are-congruent-by-comparing-their-lengths`
   - Sources: `.013` and `math.im1.lesson.10.4`.
   - Evidence: Problems 15–20, 43, and 46.
   - Observe each final congruence decision. Treat length calculations as task stages.

2. `math.im1.skill.10.4.find-possible-values-of-one-coordinate-from-a-fixed-coordinate-and-distance`
   - Source: `math.im1.lesson.10.4`.
   - Evidence: Problems 44, 45, and 53.
   - Problems 44–45 require the unordered pair of possible points. Problem 53 requires the explanatory method. It does not add a separate answer field.

3. `math.im1.skill.10.4.determine-and-justify-segment-congruence-from-rectangle-side-lengths-and-midpoints`
   - Source: `math.im1.lesson.10.4`.
   - Evidence: Problem 49 only.
   - Require the decision and a reason that uses the stated lengths and midpoint conditions. Use manual review.

4. `math.im1.skill.10.4.explain-how-the-pythagorean-theorem-produces-the-distance-formula`
   - Source: `math.im1.lesson.10.4`.
   - Evidence: Problem 50 only.
   - Require the coordinate differences, right triangle, and hypotenuse relationship. Use manual review.

Add each node to `nodes.json`, `draft-nodes.json`, the embedded nodes in `edges.json`, and the embedded nodes in `standard-edges.json`. Set `reviewStatus` to `draft`. Set `independentPracticeReady` to false. Add one draft blueprint per node with no mode specification, renderer, activity, alignment, or approval claim. Add only Lesson 10-4 containment edges. Do not add prerequisite or equivalence edges.

## Exact approved reuse bindings

Update source references and blueprint `sourceNodeIds` for these reused skills:

- `math.im1.skill.10.3.find-the-length-of-a-segment-by-reading-coordinates-from-a-n`
  - Add `.012`.
  - Scope: Problems 1–14, each requested number-line segment measure.

- `math.im1.skill.10.4.use-the-distance-formula-to-find-the-distance-between-two-po`
  - Use `.014`, `.015`, and `math.im1.lesson.10.4`.
  - `.014`: Problems 21–26.
  - `.015`: Problem 27 only.
  - Lesson: Problems 31–42, Problem 52, and Problem 54.
  - Problem 52 requires learner-supplied points and a consistent distance.
  - Problem 54 requires a manually reviewed general symbolic method.

- `math.im1.skill.10.4.apply-the-distance-formula-to-solve-real-world-problems`
  - Use `.015` and `math.im1.lesson.10.4`.
  - `.015`: Problems 28–30 only.
  - Lesson: Problems 47–48.
  - Problem 29 also requires a manually reviewed justification.

- `math.im1.skill.10.6.find-the-coordinates-of-a-point-that-divides-a-segment-in-a`
  - Add `math.im1.lesson.10.4`.
  - Scope: Problem 51 only.

Put exact problem ranges in the skill `sourceRefs` and containment-edge rationale. Do not infer separate evidence for hidden calculation stages. Do not put skill IDs in blueprint `sourceNodeIds`.

## Unsupported prerequisite edge

Remove `math.im1.edge.1194` from `edges.json` and both SRS projection arrays. It is a `lesson-sequence-prerequisite-v1` edge from the Lesson 10-3 number-line skill to the Lesson 10-4 contextual Distance Formula skill. The worksheet does not require that source skill for the target problems.

Do not replace edge 1194. Preserve edge 1195 for a later Lesson 10-5 review.

## Standard alignment scope

Preserve only these two supported canonical alignments:

- `math.alignment.im1-example-10-4-015-to-ccss-g-mg-a-1`
- `math.alignment.im1-skill-10-4-apply-the-distance-formula-to-solve-real-world-problems-to-ccss-g-mg-a-1`

Use exact rationales. Example 4 models contextual geometric measures in Problems 27–30. The 10h skill models real-world distances and perimeter in Problems 28–30, 47, and 48.

Remove the other 10 canonical Lesson 10-4 alignment edges. Remove every G-GPE.B.4 edge. Example 2 requests only yes/no congruence decisions and does not observe an algebraic coordinate proof. Also remove G-MG.A.1 from Examples 1–3 and from 10g because those rows do not observe geometric modeling.

The `standard-edges.json` catalog contains all twelve reviewed source and skill alignments. Remove the same ten rows as the canonical edge catalog. Keep the Example 4 and 10h G-MG.A.1 rows. Set the 10g blueprint `alignmentNodeIds` to an empty array. Set the 10h blueprint array to only `math.standard.ccss.g-mg-a-1`. Update only affected teacher and SRS standard fields. Preserve all standard nodes.

G-GPE.B.7 is a closer candidate for coordinate distance and perimeter, but this task has no accepted replacement-alignment review. Add no replacement alignment in G55.

Official scope references:

- G-GPE.B.4: https://www.thecorestandards.org/Math/Content/HSG/GPE/B/4/
- G-MG.A.1: https://www.thecorestandards.org/Math/Content/HSG/MG/A/1/

## Bounded placeholder cleanup

Both current Lesson 10-4 skill blueprints have genuinely empty `workedExampleSpec`, `guidedPracticeSpec`, and `independentPracticeSpec` objects. Their six projected activities contain placeholder text, empty steps or rules, zero passing scores, and `srsEligible: false`. Remove these six specification fields and six activity rows:

- `math.im1.skill.10.4.apply-the-distance-formula-to-solve-real-world-problems.worked_example`
- `math.im1.skill.10.4.apply-the-distance-formula-to-solve-real-world-problems.guided_practice`
- `math.im1.skill.10.4.apply-the-distance-formula-to-solve-real-world-problems.independent_practice`
- `math.im1.skill.10.4.use-the-distance-formula-to-find-the-distance-between-two-po.worked_example`
- `math.im1.skill.10.4.use-the-distance-formula-to-find-the-distance-between-two-po.guided_practice`
- `math.im1.skill.10.4.use-the-distance-formula-to-find-the-distance-between-two-po.independent_practice`

Keep both approved skill identities and blueprint review states. Keep their existing generator exceptions unless the projector contract removes an exception with the empty specifications. Do not clean the 10e or 10k modes in this task. They are reused source bindings, not reviewed Lesson 10-4 placeholder rows.

## Derived artifacts

Use the real projectors. Update only affected rows in:

- `apps/integrated-math-1/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/srs-input.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/teacher-evidence-map.json`
- `apps/integrated-math-1/curriculum/skill-graph/generator-gap-queue.json`
- `apps/integrated-math-1/curriculum/skill-graph/im1-coverage-matrix.json`

The four new skills must appear as inactive generator gaps, SRS inputs, and teacher evidence. Remove edge 1194 from both prerequisite arrays. Remove the six reviewed placeholder activities. Update the two touched existing skill rows for source and standard changes. Preserve all unrelated projection rows byte-for-byte and in their current order.

## Tests and documentation

Add one readable Lesson 10-4 graph contract test. It must check:

- four approved source identities and exact prompt boundaries;
- four new draft inactive nodes and exact sources;
- the four reuse bindings and response-stage limits;
- no Mixed Exercises example node;
- edge 1194 removal from canonical and both projections;
- edge 1195 preservation;
- the 10 alignment removals and two retained G-MG.A.1 alignments;
- the cleared 10g alignment array and the single retained G-MG.A.1 alignment for 10h;
- the six exact placeholder activity removals;
- projector parity for all affected rows;
- no new prerequisite or equivalence edge;
- derived counts against actual arrays.

Update only count tests and the rollout audit that the derived graph changes require. Derive all totals after projection. Do not predict or force counts. Preserve unrelated test text, row order, and Unicode.

Expected graph paths are the four node catalogs, blueprint catalog, canonical edge catalog, standard edge catalog, three projection files, generator gap queue, coverage matrix, one new G55 graph test, affected count or scope tests, and the IM1 rollout audit. Do not change source, runtime code, dependencies, approvals, hashes, or manifests.
