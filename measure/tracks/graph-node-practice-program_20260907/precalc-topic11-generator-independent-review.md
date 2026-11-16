# Precalculus Q18 Topic 1.1 generator and grader independent review

Reviewer: graph_inventory
Date: 2026-09-08
Base: `dc57eb14`

## Result

Accepted as the generator and server-grader prerequisite. I found no blocker in this patch.

This acceptance does not activate the Topic 1.1 node, blueprint, or activity. The current graph stays draft. The later projector must build the Guided presentation props because this generator returns an Independent presentation shape.

## Source and mathematics verification

Seed 0 is an authored pilot graph. It preserves the source Example 2 domain and change behavior, but it does not copy the Passwater vertical coordinates:

- Points: `(0,1)`, `(3,7)`, `(7,2)`, `(9,6)`.
- Increasing segments: `[0,3]` and `[7,9]`.
- Decreasing segment: `[3,7]`.
- Constant segments: none.

Seed 2 is an authored constant-behavior extension:

- Points: `(0,5)`, `(2,8)`, `(4,8)`, `(8,6)`.
- Increasing segment: `[0,2]`.
- Constant segment: `[2,4]`.
- Decreasing segment: `[4,8]`.

I independently solved additional generated cases:

- Seed 1 gives `(0,5)`, `(2,7)`, `(5,3)`, `(9,6)`. Its sequence is increasing, decreasing, increasing.
- Seed 5 gives `(0,5)`, `(3,11)`, `(5,11)`, `(8,9)`. Its sequence is increasing, constant, decreasing.
- Seed 17 gives `(0,3)`, `(3,6)`, `(5,6)`, `(7,4)`. Its sequence is increasing, constant, decreasing.
- Seed 18 gives `(0,3)`, `(3,7)`, `(7,4)`, `(9,6)`. Its sequence is increasing, decreasing, increasing.

The generated interval arrays match these direct comparisons. Domain endpoints and change points are strictly ordered. Each graph has four source points and three connected line segments.

## Prompt, solution, and grading verification

The prompt tells the learner to classify all three behaviors and to give endpoint x-values. It states the accepted parentheses-or-brackets convention. The solution reads the graph from left to right, classifies each segment, and gives all three final classifications.

The displayed multi-interval answer uses `∪`. The grader accepts `∪` directly. It also accepts `U`, either union order, spaces, and either accepted endpoint delimiter. It rejects a scalar, an incomplete union, wrong overlapping intervals, and an omitted constant interval.

The generator keeps expected intervals in `expectedAnswer` and `gradingMetadata`. It does not put them in `rendererProps`. The grader derives its expected intervals from the selected seed and assigns one server-owned point to each exact field.

The accepted convention intentionally treats parentheses and brackets as equivalent for this pilot. This review does not claim exact endpoint-set notation grading.

## Registry and export scope

The patch adds only `topic11-interval-graph` to the existing generator registry. Its `nodeIds` list contains only `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs`. Existing generator entries keep their order and implementation.

The knowledge-space index exports only the new generator functions, node constant, and related types. The Precalculus app adapter imports this public package path and contains the grader. No later Topic 1 node is added or changed.

There is no production call site outside the new registry and grader in this patch. Therefore, the patch does not activate a graph node or publish practice.

## Integration boundary

`generateTopic11IntervalGraphOutput` returns `presentationMode: "independent_practice"`. This shape is valid for the existing interval-classification schema. A later Guided projector must use the same seed geometry and add `presentationMode: "guided_practice"`, `guidedSteps`, and `fieldHelp`. This prerequisite patch must not be described as a complete Guided renderer integration.

## Attribution correction

The prerequisite author report must not say that seed 0 matches the source graph. Passwater Example 2 uses `(0,-2)`, `(3,4)`, `(7,1)`, and `(9,3)`. Seed 0 uses different vertical values. It preserves the same domain, change points, and increasing/decreasing sequence. Both seed 0 and seed 2 are authored pilot variants. Seed 2 adds the constant segment.
