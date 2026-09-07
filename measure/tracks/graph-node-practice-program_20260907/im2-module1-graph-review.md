# Integrated Math 2 Module 1 Graph Review

Date: 2026-09-07.

This review checks the current working tree. It covers Integrated Math 2 (IM2) Module 1 only. All proposed graph changes are candidates. This review does not approve a skill, edge, blueprint, or standard alignment.

## Current source boundary

The current class-period plan has eight instruction periods for seven lessons. It has eight scheduled objective rows. See `apps/integrated-math-2/curriculum/module-1-class-period-plan.md`, lines 17 through 26.

The lesson files contain 28 worked examples. The graph also contains 28 Module 1 example nodes. Each source lesson has four examples. The node titles, example numbers, lesson numbers, and source paths match the lesson files. There are no missing or duplicate worked-example nodes in this boundary.

The graph contains 15 Module 1 skill nodes. Fourteen nodes retain the old `1a` through `1n` objective split. One node is the atomic perpendicular-bisector pilot. The eight-row class-period plan supersedes the old 14-row count for scheduled instruction. The other source capabilities can remain as draft candidates. They are not current scheduled objective rows.

All 28 example nodes have draft lesson containment and context edges. The 14 old objective nodes have draft lesson containment and context edges. Their blueprints have empty `sourceNodeIds` lists. The graph has no example-to-skill mapping for these nodes. Only the atomic pilot blueprint names an example source.

## Source and graph findings

| Lesson | Current scheduled evidence | Current graph finding | Required candidate correction |
| --- | --- | --- | --- |
| 1-1 | Period 1 uses Examples 1 and 2. Example 1 solves an equal-distance equation. Example 2 finds a circumcenter. Period 2 uses Examples 3 and 4. Both find a coordinate circumcenter in a context. See the lesson at lines 41, 51, 61, and 71. | `find-measures-of-segments-and-angles-using-perpendicular-bis` mixes perpendicular bisectors with angle bisectors. Lesson 1 does not teach the angle-bisector theorem. `apply-properties-of-circumcenters-and-perpendicular-bisector` is close to Examples 3 and 4, but those examples do not use the converse or prove either theorem. The period 2 objective says “the theorem and its converse,” while its two worked examples calculate circumcenters. This is a source-plan mismatch. | Keep `math.im2.skill.1.1.perpendicular-bisector-equidistance` and map only Example 1 to it. Do not grant the broader Lesson 1 skill from this pilot. Replace the mixed `1a` meaning with separate perpendicular-bisector measurement and coordinate-circumcenter candidates. Preserve the current broad IDs until the curriculum owner resolves the period 2 objective mismatch. |
| 1-2 | Period 3 uses Examples 1 and 2. Example 1 uses an angle bisector. Example 2 uses equal distances from an incenter. See lines 37 and 47. Examples 3 and 4 are present in the lesson but are not listed as worked examples in the instruction period. | `use-the-angle-bisector-theorem-to-find-angle-and-segment-mea` can cover Example 1. It is too broad for Example 2 unless the node explicitly includes the Incenter Theorem. `solve-real-world-problems-involving-angle-bisectors-and-the` is not the scheduled objective. Example 2 is not a real-world problem. | Map Example 1 to the angle-measure skill. Add or select an atomic incenter-distance skill for Example 2. Keep the real-world skill as a draft supplementary candidate for Example 4 only. |
| 1-3 | Period 4 uses Examples 1 and 2. Example 1 finds centroid segment lengths. Example 2 finds centroid coordinates. See lines 41 and 51. | `find-lengths-of-medians-using-the-centroid-theorem` covers Example 1 but does not cover coordinate averaging in Example 2. `find-the-coordinates-of-the-orthocenter-and-compare-medians` combines two answer contracts. It does not describe Example 2. | Keep the median-length skill for Example 1. Add `math.im2.skill.1.3.find-coordinates-of-the-centroid` as a candidate for Example 2. Split the current mixed orthocenter/comparison row before later use. Keep those split nodes supplementary because Example 4 is not in the scheduled instruction row. |
| 1-4 | Period 6 uses Examples 1 and 2. Example 1 compares stated angle measures. Example 2 orders angles from side lengths. See lines 37 and 47. Examples 3 and 4 also use side-angle relationships. | `order-angles-and-sides-of-a-triangle-from-smallest-to-larges` covers Example 2 and part of the lesson. `apply-triangle-inequality-relationships-in-proofs-and-real-w` is mislabeled. Lesson 1-4 Examples 1 through 4 do not use the sum-of-two-sides Triangle Inequality Theorem. Lesson 1-6 owns that meaning. The mislabeled ID has many live references, including cross-course edges and projections. | Keep the ordering skill. Map Example 2 to it. Treat Example 1 as direct comparison evidence, not as proof of side-angle knowledge. Do not mutate the meaning of the occupied `apply-triangle-inequality...` ID. Add a correctly named side-angle application node if Examples 3 and 4 need a separate capability. Deprecate or redirect the old ID only in a bounded migration after all live references are listed. |
| 1-5 | Period 7 uses Examples 1 and 2. Both write an indirect proof. Example 1 is algebraic. Example 2 is contextual. See lines 47 and 57. | `write-indirect-proofs-of-algebraic-and-geometric-statements` is the scheduled capability, but Example 2 is not geometric. `use-indirect-reasoning-with-integer-properties-and-geometry` overlaps the same proof process and applies to unscheduled Examples 3 and 4. | Map Examples 1 and 2 to the broad indirect-proof skill. Keep the second node as a supplementary candidate. Narrow it to integer and geometry cases before it receives separate mastery evidence. Do not add a prerequisite between the two overlapping rows. |
| 1-6 | Period 9 uses Examples 1 and 2. Example 1 tests triangle feasibility. Example 2 finds the third-side range. See lines 42 and 52. | `determine-whether-three-lengths-can-form-a-triangle-find-the` combines both answer contracts and matches the two worked examples. The scheduled objective names only feasibility, but the worked-example list includes the range task. `apply-the-triangle-inequality-theorem-in-proofs-and-real-wor` is supplementary and fits Examples 3 and 4. | Resolve the objective-text mismatch in the class-period source. If one activity cannot assess both contracts, keep the occupied broad ID as an aggregator and add atomic feasibility and third-side-range children. Keep the proof/application skill supplementary. |
| 1-7 | Period 10 uses Examples 1 and 2. Both apply the direct Hinge Theorem. Example 2 includes a proof. See lines 41 and 51. | `apply-the-hinge-theorem-to-compare-sides-and-angles-in-two-t` matches the scheduled objective. `use-the-hinge-theorem-and-its-converse-to-find-ranges-of-val` fits unscheduled Examples 3 and 4 and is supplementary. | Map Examples 1 and 2 to the direct Hinge skill. Map Examples 3 and 4 to the converse/range candidate only if the course keeps that supplementary capability. |

## Stable identity findings

Keep all 28 example IDs. Their source identities are unique and correct.

Keep `math.im2.skill.1.1.perpendicular-bisector-equidistance`. Runtime evidence already uses this ID. Its boundary is correct. It applies the equidistance theorem to one equation. It does not prove the theorem. It does not cover circumcenter coordinates.

Do not repurpose these occupied IDs:

- `math.im2.skill.1.1.find-measures-of-segments-and-angles-using-perpendicular-bis`
- `math.im2.skill.1.3.find-the-coordinates-of-the-orthocenter-and-compare-medians`
- `math.im2.skill.1.4.apply-triangle-inequality-relationships-in-proofs-and-real-w`
- `math.im2.skill.1.6.determine-whether-three-lengths-can-form-a-triangle-find-the`

Each ID encodes a mixed or incorrect semantic boundary. A title-only edit would silently change stored learner identity. Add atomic candidate IDs first. Then migrate references with an explicit old-to-new map. The exact new IDs, except the centroid candidate above, require the curriculum decisions listed below.

The Lesson 1-4 mislabeled ID occurs in `nodes.json`, `draft-nodes.json`, `edges.json`, `standard-edges.json`, `blueprints.json`, both graph projections, both gap queues, both review queues, the cross-course edge file, and a historical audit. A later migration must update live graph and projection references. It must keep the historical Measure file unchanged.

## Relationship classification

Use `contains` only for course structure and an approved atomic decomposition. Keep module-to-lesson and lesson-to-example containment. Keep lesson-to-skill containment for retained skills. If the old broad rows remain as objective aggregators, containment can connect each aggregator to its approved atomic skills. Do not use containment as evidence that an example assesses a skill.

Use source mappings for evidence. Add exact example IDs to each blueprint `sourceNodeIds` list. If the graph contract requires an example-to-skill relationship, use the existing source-evidence relationship defined by that contract. Do not use lesson containment as a substitute.

Add only these prerequisite candidates:

- Perpendicular-bisector equidistance is a prerequisite for a task that solves a circumcenter distance equation. It is not a prerequisite for every coordinate circumcenter task.
- Side-angle ordering is a prerequisite for a Hinge task only when the task requires the learner to infer the opposite-side or opposite-angle order first.
- Triangle feasibility is a prerequisite for a third-side range task.
- The direct Hinge Theorem is a prerequisite for a converse/range activity only when that activity also requires the direct comparison method.

Indirect reasoning supports proof construction. It is not a general prerequisite for every geometry skill in the module. Do not add a lesson-order chain.

## Other graph defects in this boundary

The current standard alignments are all draft. Several use broad or unrelated standards for every example in one lesson. For example, Lesson 1-5 aligns indirect-proof examples to `G-CO.A.3`, and Lessons 1-4 and 1-6 align all examples to `G-CO.B.7`. These relationships need a separate standards review. Do not approve them as part of source reconciliation.

The 14 old blueprints have empty source lists. Their renderer keys exist, but this does not prove that the renderer assesses the stated capability. Keep all of them draft. The atomic pilot is the only Module 1 blueprint with an exact source node.

## Required curriculum decisions

1. Decide whether the period 2 objective assesses theorem and converse reasoning or coordinate circumcenter applications. The stated objective and Examples 3 and 4 do not match.
2. Decide whether each old `1a` through `1n` row remains an objective aggregator or becomes an assessable skill.
3. Decide whether period 9 has one combined objective or separate feasibility and third-side-range objectives.
4. Decide whether unscheduled Examples 3 and 4 in Lessons 1-2 through 1-7 define supplementary graph skills.

## Implemented bounded patch

The source-body check reduced the first patch. A worked-example title is not sufficient evidence for a mixed capability. The patch makes these changes:

- Keep all current example IDs.
- Keep the atomic pilot mapped to `math.im2.example.1.1.001`.
- Map Lesson 1-3 Example 1 to the centroid-length skill.
- Add the centroid-coordinate atomic candidate and map Lesson 1-3 Example 2 to it.
- Keep the new capability and its two relationships draft.
- Add no prerequisite, standard alignment, renderer selection, mode specification, generator, approval, or readiness claim. The blueprint keeps the required renderer field empty and marks implementation unavailable.
- Add inactive teacher-evidence and spaced-repetition projection rows to preserve the exhaustive graph inventory. The rows have no prerequisites or standards. They mark the generator unavailable, Independent Practice unavailable, and spaced repetition ineligible.

The patch does not map the other examples. Each current target combines more than the exact example body demonstrates. For example, Lesson 1-2 Example 1 finds angles but not segment measures. Lesson 1-4 Example 2 orders angles but not sides. Lesson 1-5 Examples 1 and 2 do not demonstrate the geometric part of the broad skill. Lesson 1-7 Examples 1 and 2 compare third sides, but they do not use the converse to compare angles.

### Lesson 1-1 continuation

The next bounded patch separates the two source methods in Lesson 1-1.

- Keep `math.im2.skill.1.1.perpendicular-bisector-equidistance` mapped only to Example 1.
- Add `math.im2.skill.1.1.find-coordinates-of-the-circumcenter` as a draft atomic capability.
- Map Examples 2, 3, and 4 to the coordinate-circumcenter capability. All three complete solutions write perpendicular-bisector equations and use their intersection as the circumcenter. Example 4 also calculates a radius. That extra result does not remove its coordinate-circumcenter evidence.
- Mark the two mixed legacy Lesson 1-1 rows as draft objective aggregators. Preserve their IDs. Do not map direct learner evidence to them.
- Keep the new blueprint source-only. Keep its renderer key empty. Add no mode specifications, generator, prerequisite, standard alignment, approval, or readiness claim.
- Add inactive teacher-evidence and spaced-repetition rows. Preserve the exhaustive projection inventory.

This source taxonomy separates an equal-distance algebra equation from a coordinate-geometry construction. The first method equates two endpoint distances. The second method writes at least two perpendicular bisectors and solves for their intersection. Evidence for one method does not establish the other method.

## Proposed taxonomy dispositions for the next batch

These are routine draft dispositions. They do not approve learner evidence.

| Old row | Proposed disposition |
| --- | --- |
| `1a` mixed perpendicular-bisector and angle-bisector measures | Keep as a legacy objective aggregator. Stop direct evidence. Use the atomic perpendicular-bisector pilot for Example 1. Add a coordinate-circumcenter child for Example 2. Do not put angle-bisector content in Lesson 1. |
| `1b` circumcenter and perpendicular-bisector applications | Keep as a legacy aggregator until the period 2 source mismatch is fixed. Add one coordinate-circumcenter application child for Examples 3 and 4. Do not claim theorem-converse proof evidence. |
| `1c` angle and segment measures | Keep as an aggregator. Add one equal-angle equation child for Example 1 and one incenter-distance child for Example 2. |
| `1d` real-world angle-bisector and incenter problems | Keep as a supplementary draft capability. Map Example 4 only after its coordinate-location answer contract is defined. |
| `1e` centroid median lengths | Keep as an assessable atomic skill. Its exact source is Example 1. Keep the new centroid-coordinate skill separate for Example 2. |
| `1f` orthocenter coordinates and line-type comparison | Split it. Use an orthocenter-coordinate child for Example 4. Keep comparison of medians, perpendicular bisectors, and altitudes as a separate source-goal candidate without worked-example evidence. |
| `1g` order angles and sides | Keep as an aggregator. Add direction-specific children for angles from sides and sides from angles. Example 2 supports the first child. Example 3 supports the second child within each triangle. |
| `1h` triangle-inequality proof and context | Deprecate this Lesson 1-4 meaning. Replace it with a side-angle application candidate. Do not redirect the occupied ID until live cross-course and projection references have a bounded migration. |
| `1i` indirect proofs in algebra and geometry | Keep as an objective aggregator. Use separate algebraic, contextual, and geometric evidence children. Examples 1, 2, and 4 support those children respectively. |
| `1j` indirect reasoning with integer properties and geometry | Keep as a supplementary child set. Example 3 supports integer-property proof. Example 4 supports geometric proof. It does not need a prerequisite edge to `1i` because the rows overlap. |
| `1k` triangle feasibility and third-side range | Keep as an aggregator. Add a feasibility child for Example 1 and a strict third-side-range child for Example 2. |
| `1l` Triangle Inequality proof and context | Keep as a supplementary aggregator. Use a contextual range child for Example 3 and a proof child for Example 4. |
| `1m` direct Hinge comparisons | Keep as an aggregator. Add a direct third-side comparison child for Examples 1 and 2. The proof form can use teacher-reviewed evidence on the same atomic theorem application. |
| `1n` Hinge converse and ranges | Split it. Add a parameter-range child for Example 3 and a converse angle-comparison child for Example 4. |

This taxonomy keeps the old IDs stable. It moves exact assessment evidence to atomic draft children. It permits later removal of an aggregator only after all stored learner and graph references have an explicit migration.
