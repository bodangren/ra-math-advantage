# Topic 1.6: Polynomial Functions and End Behavior

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.6`
- Learning-objective family: `1.6.A`
- Essential-knowledge family: `1.6.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.6.A: Describe the end behavior of a polynomial function using limit notation and relate it to the degree and leading coefficient.

## CED Essential Knowledge

- EK 1.6.A.1: The end behavior of a function describes how it behaves as x moves infinitely to the right (x → ∞) and infinitely to the left (x → −∞). This behavior is determined by the leading term of the polynomial.
- EK 1.6.A.2: For a polynomial with positive leading coefficient, the right end behavior goes up (f(x) → ∞). For a negative leading coefficient, the right end behavior goes down (f(x) → −∞).
- EK 1.6.A.3: If the degree is even, the left and right ends go in the same direction. If the degree is odd, the left and right ends go in opposite directions.

## Passwater Scaffolding Notes

- Topic introduction: Passwater introduces end behavior verbally and graphically before formalizing with limit notation. Fill-in-the-blank: "The end behavior of a function describes how a function behaves as it moves infinitely to the right and left. In other words, the end behavior is what happens to the values of y as x increases or decreases without bound."
- Key vocabulary (fill-in-the-blank): End behavior, limit notation (lim(x→−∞) f(x), lim(x→∞) f(x)), without bound.
- Passwater's decision rule (fill-in-the-blank): "For polynomial equations, it is easiest to find the end behavior of the RIGHT side first." Right side: "Goes up if the leading coefficient is positive. Goes down if the leading coefficient is negative." Left side: "Goes in the same direction as the right if the degree is even. Goes in the opposite direction as the right if the degree is odd."
- Scaffolding sequence: (1) Describe end behavior from graphs verbally, (2) write limit statements for given graphs, (3) sketch a polynomial given limit statements, (4) determine end behavior algebraically from equations.
- Common misconception: Students try to evaluate the function at large numbers instead of reasoning about the leading term. Passwater emphasizes: "Just look at the leading term."

## Guided Practice

- Example 1: Graphs of two polynomials. For each: write left behavior verbally, left behavior limit statement, right behavior verbally, right behavior limit statement.
- Example 2: Sketch a polynomial with:
  - a) lim(x→−∞) f(x) = −∞ and lim(x→∞) f(x) = −∞ (even degree, negative LC — like an upside-down parabola shape)
  - b) lim(x→−∞) g(x) = −∞ and lim(x→∞) g(x) = +∞ (odd degree, positive LC — like x³ shape)
- Example 3: Determine end behavior:
  - a) f(x) = 4x⁵ → right: up, left: down (odd, positive LC)
  - b) g(x) = ½x⁴ → right: up, left: up (even, positive LC)
  - c) y = −2(x+3)⁶ → right: down, left: down (even, negative LC)
  - d) h(x) = 3 − x⁵ = −x⁵ + 3 → right: down, left: up (odd, negative LC)
  - e) k(x) = 8x² + 4 − x⁵ → leading term −x⁵ → right: down, left: up
  - f) m(x) = 2x(x−1)(6−x) = −2x³ + ⋯ → right: down, left: up (odd, negative LC)
- Example 4: Write limit statements:
  - a) f(x) = −3x⁴ → lim(x→−∞) f(x) = −∞, lim(x→∞) f(x) = −∞
  - b) g(x) = 5x³ + 2x² − 7 → lim(x→−∞) g(x) = −∞, lim(x→∞) g(x) = ∞

## Independent Practice Description

- AP-style tasks: Students determine end behavior from equations, write limit statements, and match graphs to equations based on end behavior.
- Worksheet A Problem 7: f(x) = −4x³ → right: down, left: up. Limit statements: lim(x→−∞) f(x) = ∞, lim(x→∞) f(x) = −∞.
- Worksheet A Problem 11: k(x) = 8x² + 4 − x⁵ → leading term −x⁵ → right: down, left: up.
- Worksheet A Problem 14: Match four graphs to four equations and four limit statement sets — requires applying all rules simultaneously.
- Emphasis: Always start with the leading term. Write limit notation precisely with lim(x→∞) and lim(x→−∞).

## FRQ Expectations

- FRQ 1 (Function Concepts): Students may need to describe end behavior using limit notation, especially when given an equation or graph.
- FRQ 2 (Modeling a Non-Periodic Context): End behavior of a regression model helps justify whether the model is appropriate for long-term predictions.
- AP mathematical practices targeted:
  - 1.A: Execute algebraic procedures (identify leading term).
  - 1.B: Identify information from multiple representations (graph → limit notation, equation → limit notation).
  - 3.C: Justify conclusions (why a model's end behavior makes it inappropriate for long-range prediction).

## App-Build Notes

- Recommended componentKey: `graphing-explorer`
- Rationale: Topic 1.6 requires students to see how polynomials behave as x → ±∞. The graphing-explorer lets students zoom out to observe end behavior and connect it to the algebraic rules for degree and leading coefficient.
- Calculator requirement: Graphing calculator recommended for verifying end behavior on specific functions (Passwater Example 5).
- Graphing needs: Interactive graphing essential. Students need to zoom in and out to observe end behavior on polynomials like f(x) = x² − 3x + 1 and rational functions like g(x) = (2x−3)/(x+1).
- Phase package daily phases:
  - Warm-Up: "As x gets very large, what happens to f(x) = 3x² − 5? Does it go up or down?"
  - Topic Introduction: Define end behavior, introduce limit notation, present the right-side-first rule.
  - Scaffolded Examples: Work through Passwater Examples 3 and 4 (determine end behavior, write limits).
  - Guided Practice: Students determine end behavior for six new polynomials with peer discussion.
  - Independent Practice: Worksheet A Problems 7–13 (end behavior from equations) and Problem 14 (matching).
  - Exit Evidence: "Write limit statements for g(x) = −2x⁴ + x − 3."
  - CAP Reflection: "What persistence move did you make when the leading term was hidden inside a product?"
