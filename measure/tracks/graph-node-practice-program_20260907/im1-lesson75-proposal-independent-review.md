# IM1 Lesson 7-5 proposal independent review

## Review scope

I reviewed `/tmp/im1-lesson75-capabilities-review.md` against the original `Int1_0705_practice.docx`, the two rendered graph images in `/tmp/int1_0705_review_20260908_v2`, and the current IM1 graph catalogs and projections.

## Disposition

Seven proposed new capability boundaries are suitable after the source mapping corrections below. The proposed graph-system row duplicates the stable legacy `7i` identity and must not be added. The proposal must keep all new rows draft and inactive. It must not add a prerequisite or equivalence edge. The legacy optimization row does not have source support in this lesson.

## Identity correction

Reuse `math.im1.skill.7.5.graph-systems-of-linear-inequalities-and-identify-the-overla` for the graph-system capability. Its title and description already state the same observable operation as the proposed `graph-a-system-of-linear-inequalities-and-show-the-common-feasible-region` row. The class-period plan objective `7i` also states this exact operation. It names graphing a system and identifying the overlapping feasible region. Problems 1 through 12 and Problem 20 assess that operation.

Repair the existing `7i` row. Keep its stable ID. Set its current source-supported title and description. Keep it draft and inactive because the content is newly reviewed and no renderer contract is approved. Replace its placeholder mode specifications with a source-only blueprint. Map the canonical source nodes to it. Do not add a second skill ID for the same operation.

This changes the proposal inventory from eight new skills to seven new skills plus one repaired legacy skill. The total selected Lesson 7-5 capability set remains eight skills for this review scope.

## Required corrections

1. Narrow the exact source mapping for contextual modeling.

   Problems 13, 14, 21, and 22 ask the learner to write a system from a context. Problem 20 supplies the two inequalities and asks the learner to graph or solve the system. Problem 23 already names `x` and `y` and asks for one possible ordered pair. Therefore, do not map Problems 20 and 23 as exact evidence for `define-variables-and-model-contextual-constraints-with-a-system-of-linear-inequalities`. Map Problem 20 to the graph-system capability. Map Problem 23 to the viable-point capability.

2. Preserve graph prompts without answer leakage.

   Problems 15 through 18 give graphs and ask for systems. The lesson source must include the source graphs or faithful graph assets. It must also include accessible descriptions of boundary points, line style, and shading. Those descriptions must describe the given graph. They must not state the resulting inequalities. Keep the solved systems in author verification notes and tests.

3. Keep solved results outside learner prompts.

   Problem 19 asks whether `(2.5, 1)` is a solution. The prompt must not state the pass or fail result. Problem 27 asks for an estimated area. The prompt must not state the vertices or area. Problem 28 asks the learner to describe the intersection. The prompt must not state the resulting line. Tests can verify these results.

4. Correct the legacy-row test name.

   Required test 11 must name legacy `7i` and legacy `7k`. It currently names legacy `6k`. Verify that `7i` is draft, inactive, and source-only. Verify that `7k` is rejected, inactive, and source-free. Also verify that the unrelated legacy `6k` row does not change.

5. Correct the projection file paths in the intended file list.

   Use `skill-graph/projection/srs-input.json` and `skill-graph/projection/practice-v1-activity-map.json`. Do not create root-level `skill-graph/srs-input.json`, `srs-input-canonical.json`, or `activity-map.json` files. Include the existing teacher or evidence projection only if the selected rows currently occur there and the bounded repair removes them.

6. State the edge delta against the current baseline.

   Edge `1263` is already absent after G36. G37 must assert that it remains absent. The new G37 edge removal is `1264`, from unsupported legacy optimization row `math.im1.skill.7.5.use-linear-programming-to-find-the-maximum-or-minimum-value` to the later objective-function row.

## Capability boundary review

- Reuse legacy `7i` for graphing a system and showing its common feasible region. Open and closed boundaries and bounded and unbounded regions are variants. A new graph-system ID would duplicate the same assessable artifact.
- `write-a-system-of-linear-inequalities-from-a-shaded-graph` is the inverse operation. It is distinct from graphing a supplied system.
- `check-an-ordered-pair-against-every-inequality-in-a-system` is verification. It is distinct from finding a viable point.
- `define-variables-and-model-contextual-constraints-with-a-system-of-linear-inequalities` is valid with the narrowed source set above.
- `find-and-interpret-viable-points-for-a-contextual-system-of-linear-inequalities` is valid. Count contexts require integer values. Time contexts can use continuous values unless the prompt adds a count restriction.
- `classify-the-feasible-set-from-linear-inequality-boundary-relationships` correctly joins Problems 25 and 28. Both require reasoning about intersection dimension from boundary relationships. They do not require optimization.
- `construct-a-system-of-linear-inequalities-with-an-empty-feasible-set` is a valid generation task. It is distinct from classifying a supplied system.
- `find-the-area-of-a-bounded-feasible-region` is source-supported by Problem 27. I found no existing IM1 skill row that states this operation. Keep graphing as an instructional dependency only until a source review supports a graph edge.
- Reuse of `math.im1.skill.6.4.rewrite-and-solve-less-than-absolute-value-inequalities` for Problem 24 is defensible. The learner rewrites `|x| <= 4` as an equivalent compound system.

## Source identity review

The proposed identity repair is correct:

- Keep `.016` as the canonical joint Examples 1 and 2 source.
- Keep `.019` as the canonical Example 3 source.
- Preserve `.017` and `.018` as rejected duplicate identities.
- Do not delete or repurpose an existing stable ID.

The source text must preserve the exact problem groups. Examples 1 and 2 contain Problems 1 through 12. Example 3 contains Problems 13 and 14. Mixed Exercises contain Problems 15 through 28.

## Mathematical verification

The proposal math is correct after the source-delivery rules above:

- Problems 1 through 12 have the stated empty, strip, half-plane, and interval intersections.
- Problem 13 forms the stated rectangular feasible region.
- The proposed integer examples for Problem 14 satisfy the souvenir constraints.
- The four rendered source graphs support the proposed author-only systems for Problems 15 through 18.
- `(2.5, 1)` makes the first Problem 19 inequality an equality, so it fails the strict inequality. It satisfies the second inequality.
- Problem 20 has a count domain because it models cats and dogs.
- Problem 22 requires whole-number items and uses `100 <= x <= 200` and `y >= 30x`.
- `(4, 0)` is a valid possible point for Problem 23. The source models hours, so the proposal must not impose an integer domain.
- The Problem 25 statement is sometimes true.
- The Problem 26 example creates contradictory half-planes.
- The Problem 27 feasible triangle has vertices `(-3,1)`, `(3,1)`, and `(0,4)`. Its area is `9` square units.
- The Problem 28 intersection is the boundary line `y = 2x + 5/3`.

## Expected bounded implementation

After the corrections, the implementation can add seven draft, inactive, source-only skill rows, repair legacy `7i` as the eighth selected capability, and add the exact `contains` mappings. It can retain the one reviewed reuse. It can repair `.016` through `.019`, legacy `7i`, legacy `7k`, edge `1264`, and the directly derived projections. It must preserve all unrelated node IDs, edges, standard alignments, review states, and projection rows. It must not publish a renderer, mode specification, activity, evidence mapping, or readiness claim.

## Parent source corrections

The parent checked both worksheet pages and corrected three statements in this review: Example 3 ends at Problem 14, Problem 20 models cats and dogs, and Problem 27 has vertices `(-3,1)`, `(3,1)`, and `(0,4)`. Its area remains 9 square units. These corrections control implementation.
