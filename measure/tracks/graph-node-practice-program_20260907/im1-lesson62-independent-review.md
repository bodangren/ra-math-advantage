# IM1 Lesson 6-2 Independent Review

## Scope

This review compares the current Lesson 6-2 source and graph changes with the original worksheet.

Sources reviewed:

- `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0602_practice.docx`
- `/tmp/int1_0602_review_20260907/render/page-1.png` through `page-6.png`
- `apps/integrated-math-1/curriculum/modules/module-6-lesson-2`
- `apps/integrated-math-1/curriculum/module-6-class-period-plan.md`
- the four graph catalogs, blueprints, edges, and generator gap queue
- `im1-lesson62-capabilities-review.md`

This review does not approve a node or activity.

## Finding

### P2: The error-diagnosis reuse does not have direct Lesson 6-2 worksheet support

The repair adds Lesson 6-2 containment for `math.im1.skill.6.1.diagnose-inequality-solving-errors`.

The worksheet does not show an incorrect solution for the student to diagnose. Problems 22 through 27 say, "Check your solution." Problems 41 and 48 ask for an explanation of a valid method. These tasks can reveal an error, but they do not directly assess diagnosis of a supplied error.

The class plan assigns error analysis to the later jigsaw period. This schedule note is weaker than direct Lesson 6-2 worksheet evidence.

Keep the node and its Lesson 6-1 ownership. Remove the new Lesson 6-2 containment edge, or document the jigsaw as the exact source before the edge enters an approved graph. The empty Lesson 6-2 blueprint mapping is correct and must remain empty.

## Verified source boundaries

The seven new draft candidates have distinct source support:

1. Problems 1 through 44 require multi-step simplification and collection of terms.
2. Problems 16, 26, and 27 include negative distribution.
3. Problems 18, 19, and 42 require classification after variable terms cancel.
4. Problem 3 asks for a parameterized unit-interval model.
5. Problem 45 asks for a constructed inequality with a specified solution set and specified operations.
6. Problems 41, 42, 48, 49, and 51 require explanations or justifications.
7. Problems 40 and 44 require dependent geometric constraints.

The source-only blueprint mappings are conservative. Examples `.008`, `.009`, and `.010` contain the mapped actions. Candidates 5 through 7 correctly have no worked-example mapping.

Seven of the eight reused Lesson 6-1 boundaries have sufficient support:

- Example 1 requires contextual writing, solving, and interpretation.
- Example 2 requires verbal translation and number-line graphs.
- Examples 2 and 3 require the same final number-line graph action as Lesson 6-1.
- "Check your solution" supports solution checking, but it does not supply exact worked-example evidence.
- Problems 46 and 52 require coefficient-sign cases.

The graph correctly leaves the checking and unknown-sign blueprint additions empty. It also leaves the error-diagnosis addition empty.

## Verified mathematical results

- Problem 2 gives `x > 19`. It gives a lower bound. It gives no maximum age.
- Problem 3 uses discrete fifth-mile units. The generalized count needs a positive unit parameter and a whole segment count.
- Problem 18 has no solution. Problem 19 has all real numbers as solutions.
- Problem 42 has no solution for `<` and all real numbers for `>=`.
- Problem 40 gives `w <= 22` and `l <= 60 - w`. It does not give one width or one maximum length.
- Problem 44 gives `2 < a <= 14/3`. The lower bound comes from the triangle inequality.
- Problems 45 and 51 accept more than one valid construction.
- Problem 46 needs the cases `a > 0`, `a = 0`, and `a < 0`.
- Problem 52 needs separate cases for `a > 0` and `a < 0`.

The recovered source text also correctly records the medicine label, carpet diagram, number-line graph, and Problem 50 expressions.

## Identity and graph comparison

The repair preserves all existing IDs.

- It changes only the five existing Lesson 6-2 example records in the node catalogs.
- It adds seven new node IDs.
- It preserves every existing edge exactly and adds 15 draft containment edges.
- It preserves every existing generator gap queue row and adds seven rows for the new candidates.
- It changes five existing Lesson 6-1 blueprints only by adding the reviewed Lesson 6-2 example IDs.
- It adds seven source-only draft blueprints.
- It does not map schedule occurrences `.011` or `.012` into a blueprint.
- It does not add a prerequisite, equivalence, or standards edge.
- Each new candidate remains `draft` with `independentPracticeReady: false`.

The example titles now distinguish the three actual worksheet headings from the two schedule repeats. IDs `.008`, `.009`, and `.010` are actual source examples. IDs `.011` and `.012` are schedule occurrences.

## Disposition

The seven new capability boundaries, source corrections, example identity corrections, and conservative blueprint mappings agree with the rendered worksheet.

The repair needs one decision for the error-diagnosis containment edge. This issue does not affect the other 14 new containment edges. It does not justify approval or practice activation.

## Author disposition

The author accepted the review finding. The repair removes only the Lesson 6-2 containment edge to `math.im1.skill.6.1.diagnose-inequality-solving-errors`. It preserves the Lesson 6-1 node and its ownership. The final Lesson 6-2 repair has seven new candidates, seven reused capabilities, and 14 new containment edges.

## Integration verification

The integration owner checked the rendered final worksheet page. Problem 44 requires `2 < a <= 14/3`. Problem 46 requires three coefficient-sign cases. The final graph preserves all 2,366 prior edges and adds only 14 containment edges. The unsupported error-diagnosis edge is absent. The final app build passes. Source approval and practice activation remain open.
