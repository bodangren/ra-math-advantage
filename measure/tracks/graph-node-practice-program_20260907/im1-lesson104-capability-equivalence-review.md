# IM1 G55 Lesson 10-4 capability equivalence review

## Verdict

Use four new draft and inactive capabilities. The provisional seven-capability set is too broad. Merge the inverse-distance coordinate tasks. Reuse approved 10g for Problems 52 and 54.

Keep all current approval states. Do not add a Mixed Exercises example node. Do not add a prerequisite or equivalence edge.

## Accepted new capability inventory

1. **Determine whether two coordinate-defined segments are congruent by comparing their lengths.**
   - Evidence: Problems 15–20, 43, and 46.
   - Source IDs: `math.im1.example.10.4.013` and `math.im1.lesson.10.4`.
   - Observe the final congruence decision. The required length calculations are task stages. Do not award separate evidence for them.
   - Problem 46 uses symbolic axis distances. The same comparison capability applies.

2. **Find the possible value or values of one coordinate of a point from a fixed other coordinate and a given distance.**
   - Evidence: Problems 44, 45, and 53.
   - Source ID: `math.im1.lesson.10.4`.
   - Problems 44–45 require the two possible points. Grade the point pair without order dependence.
   - Problem 53 observes the same inverse-distance method through an explanation. Manual review must accept a correct setup, isolation of the squared difference, and both positive and negative square-root branches in the method. The worksheet does not require a separate list of both y-values.
   - Axis membership in Problems 44–45 supplies one fixed coordinate. The fixed x-coordinate in Problem 53 supplies the same mathematical boundary. The response format does not justify a second capability.

3. **Determine and justify segment congruence from stated rectangle side lengths and midpoint conditions.**
   - Evidence: Problem 49 only.
   - Source ID: `math.im1.lesson.10.4`.
   - Require the congruence decision and a valid reason that uses the stated side lengths and midpoint conditions. Use manual review.

4. **Explain how the Pythagorean Theorem produces the Distance Formula.**
   - Evidence: Problem 50 only.
   - Source ID: `math.im1.lesson.10.4`.
   - Require the conceptual relationship between horizontal and vertical coordinate differences, the right triangle, and its hypotenuse. Use manual review.

Each new node must remain draft and inactive. Each blueprint must have no executable modes or activities.

## Approved capability reuse

| Capability | Exact source binding | Observed response stage |
|---|---|---|
| `math.im1.skill.10.3.find-the-length-of-a-segment-by-reading-coordinates-from-a-n` | `.012` | Problems 1–14: each requested number-line segment measure. |
| `math.im1.skill.10.4.use-the-distance-formula-to-find-the-distance-between-two-po` | `.014`, `.015`, and `math.im1.lesson.10.4` | Problems 21–26, Problem 27, Problems 31–42, Problem 52, and Problem 54. Problems 21–27 and 31–42 observe a distance. Problem 52 observes a distance consistent with the learner-supplied points. Problem 54 observes the general symbolic method through a manual explanation. |
| `math.im1.skill.10.4.apply-the-distance-formula-to-solve-real-world-problems` | `.015` and `math.im1.lesson.10.4` | Problems 28–30, 47, and 48: each final contextual distance, comparison, or perimeter. Problem 29 also requires its justification. |
| `math.im1.skill.10.6.find-the-coordinates-of-a-point-that-divides-a-segment-in-a` | `math.im1.lesson.10.4` | Problem 51: the coordinate pair for the point that divides the segment in the stated ratio. |

The `.015` bindings must state their prompt boundaries. Example 4 contains Problems 27–30. It supplies 10g evidence only for Problem 27. It supplies 10h evidence only for Problems 28–30.

## Rejected provisional splits

Do not create a separate capability for Problem 52. The learner authors the two input points and applies the Distance Formula. The assessed mathematical result is exact 10g reuse. The construction format permits many inputs, but it does not create a new mathematical capability. Require an inspectable point pair and a consistent distance.

Do not create a symbolic Distance Formula capability for Problem 54. Approved 10g already requires use of the Distance Formula for two coordinate-plane points. Problem 54 observes that capability at the general symbolic method stage. A numeric application and a symbolic explanation are response variants of the same capability.

Do not separate Problems 44–45 from Problem 53. All three invert the Distance Formula after one coordinate is fixed. The axis constraint is the source of the fixed coordinate in Problems 44–45. It does not change the core capability.

## Source identities

Preserve the four approved example identities:

- `.012`: Example 1, Problems 1–14.
- `.013`: Example 2, Problems 15–20.
- `.014`: Example 3, Problems 21–26.
- `.015`: Example 4, Problems 27–30.

Use `math.im1.lesson.10.4` for Problems 31–54. The worksheet labels this section Mixed Exercises. It does not supply another Example heading.

## Edge 1194

Remove `math.im1.edge.1194` from the canonical graph and both prerequisite projections.

The edge connects the Lesson 10-3 number-line segment-length skill to the Lesson 10-4 real-world Distance Formula skill. Its derivation method is `lesson-sequence-prerequisite-v1`. Its rationale only says that Lesson 10-3 precedes Lesson 10-4. The Lesson 10-4 context problems supply coordinate data and geometry directly. They do not require the learner to read a segment length from a number line. The worksheet gives no prerequisite evidence for this edge.

Do not replace edge 1194. Preserve the valid source containment and response-stage bindings instead.

## Manual review boundaries

Use manual or structured review for Problems 29, 49, 50, 52, 53, and 54. Preserve these boundaries:

- Problem 29 requires a comparison and justification.
- Problem 49 requires a decision and justification.
- Problem 50 requires a conceptual explanation.
- Problem 52 permits many authored point pairs. The distance must agree with the submitted points.
- Problem 53 requires a complete method. Do not add a separate answer field for both y-values.
- Problem 54 accepts algebraically equivalent forms of the symbolic Distance Formula.

This review changes the proposed count from seven new capabilities to four. Counts for graph artifacts must come from the projector after implementation.
