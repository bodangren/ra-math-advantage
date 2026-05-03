# Topic 1.9: Rational Functions and Vertical Asymptotes

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.9`
- Learning-objective family: `1.9.A`
- Essential-knowledge family: `1.9.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.9.A: Determine the vertical asymptotes of a rational function and describe the function's behavior near them using limit notation.

## CED Essential Knowledge

- EK 1.9.A.1: A vertical asymptote occurs at x = c when a factor in the denominator of a rational function cannot cancel with factors in the numerator. The function is undefined at x = c and the graph approaches ±∞ as x approaches c.
- EK 1.9.A.2: The behavior of a rational function near a vertical asymptote can be described using one-sided limits. As x approaches c from the left or right, f(x) increases or decreases without bound.
- EK 1.9.A.3: The sign of the function on either side of a vertical asymptote depends on the signs of the remaining factors evaluated at values near c.

## Passwater Scaffolding Notes

- Topic introduction: Passwater frames the key question: "How can we distinguish between VAs and holes when working with a rational equation?" The answer: "A vertical asymptote occurs when a factor in the denominator cannot cancel out with factors in the numerator."
- Key vocabulary (fill-in-the-blank): Vertical asymptote, hole, one-sided limits (lim(x→c⁻), lim(x→c⁺)), without bound.
- Recall: "Since we are dividing by a polynomial, rational functions have restrictions on their domain. We know that we cannot divide by 0, so we must consider any x values where g(x) = 0, and restrict them from the domain. These x values will be the location of either a vertical asymptote or a hole in the graph."
- Passwater's examples of VAs vs. holes:
  - VA: f(x) = (x−3)(x+2)/(x−1) → VA at x = 1 (no cancellation)
  - VA: g(x) = (x−1)(x+2)/(x−1)² → VA at x = 1 (one factor cancels, but one remains)
- Scaffolding sequence: (1) Factor numerator and denominator, (2) cancel common factors, (3) remaining denominator zeros are VAs, (4) write one-sided limits for each VA.
- Limit behavior at VAs (fill-in-the-blank): For f(x) = (x−3)(x+2)/(x−1): lim(x→1⁻) f(x) = −∞ and lim(x→1⁺) f(x) = +∞.

## Guided Practice

- Example 1: Determine x-values of holes or VAs:
  - a) f(x) = (x−2)(x+3)/((x+3)(x−5)) → cancel (x+3): hole at x = −3, VA at x = 5
  - b) y = (x+1)(x−2)²/((x−2)(x+1)²) → cancel one (x−2) and one (x+1): hole at x = 2, hole at x = −1. Wait — after cancellation, denominator still has (x+1), so VA at x = −1. Actually: after canceling, remaining denominator is (x+1), so VA at x = −1 and remaining factor (x−2) in numerator with denominator gone → hole at x = 2.
  - c) g(x) = 1/(x³+4x) = 1/(x(x²+4)) → VA at x = 0 (x²+4 has no real zeros).
- Example 2: Write left and right limit statements as x approaches 2:
  - a) f(x) = (x−1)(x+3)/(x−2) → VA at x = 2. Test values near 2: lim(x→2⁻) f(x) = −∞, lim(x→2⁺) f(x) = +∞.
  - b) g(x) = (x−2)(x+4)/((x−2)(x−3)) → cancel (x−2): VA at x = 3. lim(x→3⁻) g(x) = −∞, lim(x→3⁺) g(x) = +∞.
  - c) h(x) = (x−4)(x−2)/((x−2)²(x−1)) → cancel one (x−2): VA at x = 2 (one remains), VA at x = 1.
- Example 3: Write an equation with: lim(x→3⁻) f(x) = 5, lim(x→3⁺) f(x) = 5 (hole at 3), lim(x→1⁻) f(x) = −∞, lim(x→1⁺) f(x) = +∞ (VA at 1). Answer: f(x) = (x−3)(something)/(x−3)(x−1) with appropriate sign.

## Independent Practice Description

- AP-style tasks: Students identify VAs from equations, write one-sided limit statements, and construct rational functions given VA/hole specifications.
- Worksheet A Problem 1: f(x) = (x−1)(x−5)/((x−5)(x+2)) → cancel (x−5): hole at x = 5, VA at x = −2.
- Worksheet A Problem 6: p(x) = (x²−1)/(x+1)² = (x−1)(x+1)/(x+1)² → cancel one (x+1): VA at x = −1.
- Worksheet A Problem 7: f(x) = (2x+6)/(x−3) → VA at x = 3. lim(x→3⁻) = −∞, lim(x→3⁺) = +∞.
- Worksheet A Problem 10: "Write equation with hole at x = 3, VAs at x = 1 and x = −4." Answer: f(x) = (x−3)(...)/(x−3)(x−1)(x+4).
- Emphasis: Always factor first. Cancel completely before identifying VAs.

## FRQ Expectations

- FRQ 1 (Function Concepts): Students may need to identify VAs and holes from an equation, or describe behavior near a VA using limit notation.
- FRQ 3 (Function Concepts from a Graph): Students may interpret a graph showing VAs and write corresponding limit statements.
- AP mathematical practices targeted:
  - 1.A: Execute algebraic procedures (factor, cancel, identify remaining denominator zeros).
  - 2.A: Identify information from mathematical representations (graph → VA locations → limit statements).
  - 3.B: Justify conclusions (why a factor produces a VA rather than a hole).

## App-Build Notes

- Recommended componentKey: `graphing-explorer`
- Rationale: Students need to see vertical asymptotes on graphs and connect them to the algebraic process of factoring and canceling. The graphing-explorer lets students plot rational functions and observe the ±∞ behavior at VAs.
- Calculator requirement: Graphing calculator recommended for verifying VA behavior and sketching.
- Graphing needs: Interactive graphing essential. Students need to zoom near VAs to see the left/right behavior diverging to ±∞.
- Phase package daily phases:
  - Warm-Up: "Factor f(x) = (x²−4)/(x−2). What happens at x = 2?"
  - Topic Introduction: Define vertical asymptotes. Show the VA vs. hole comparison table from Passwater.
  - Scaffolded Examples: Work through Passwater Example 1 (identify VAs and holes from equations).
  - Guided Practice: Students write one-sided limits for three functions (Example 2 format).
  - Independent Practice: Worksheet A Problems 1–6 (identify VAs/holes) and Problems 7–9 (write limits).
  - Exit Evidence: "Find all vertical asymptotes of g(x) = (x²−9)/(x²−x−6). Write one-sided limits at each VA."
  - CAP Reflection: "What courage move did you make when the signs of the limits weren't obvious?"
