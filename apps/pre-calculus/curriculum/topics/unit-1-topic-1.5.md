# Topic 1.5: Polynomial Functions and Complex Zeros

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.5`
- Learning-objective family: `1.5.A`
- Essential-knowledge family: `1.5.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.5.A: Determine the zeros and the multiplicities of polynomial functions and relate the multiplicity of a zero to the graph of the function.

## CED Essential Knowledge

- EK 1.5.A.1: Given a polynomial function p(x), if p(a) = 0, then a is a zero or root of p(x). If a is real, then (x − a) is a linear factor of p(x).
- EK 1.5.A.2: The multiplicity of a zero is the power of its corresponding factor. A graph is tangent to the x-axis at zeros of even multiplicity and crosses the x-axis at zeros of odd multiplicity.
- EK 1.5.A.3: The Fundamental Theorem of Algebra states that a polynomial of degree n has exactly n complex zeros when counting multiplicities. Complex zeros of polynomials with real coefficients come in conjugate pairs.

## Passwater Scaffolding Notes

- Topic introduction: Passwater introduces zeros and multiplicity through visual graph analysis — the graph of y = −.01(x+4)(x+1)³(x−3)² shows three behaviors: crossing at x = −4 (mult. 1), crossing with inflection at x = −1 (mult. 3), and bouncing off at x = 3 (mult. 2).
- Key vocabulary (fill-in-the-blank): Zero (root), factor, multiplicity, conjugate pairs, Fundamental Theorem of Algebra.
- Multiplicity definition (fill-in-the-blank): "The multiplicity of a zero is the power of its factor." "The graph of a polynomial will always be tangent to the x-axis at any zero with an even multiplicity."
- Complex roots (fill-in-the-blank): "All imaginary roots come in conjugate pairs. If a + bi is a root of f(x), then so is a − bi." "Some polynomials have roots that contain an imaginary number. This means you will never see them on the graph."
- Passwater's 4-step sign chart method for polynomial inequalities: (1) Solve f(x) = 0, (2) Create a sign chart with solutions, (3) Test values in each interval, (4) Interpret the sign chart. "NOTE: Be sure to write your answer in interval notation and think about the endpoints!"
- Even/odd function definitions (fill-in-the-blank): Even functions are symmetric over the y-axis: f(−x) = f(x). Odd functions are symmetric about the origin: g(−x) = −g(x).

## Guided Practice

- Example 1: Determine degree, find all real zeros with multiplicity:
  - a) f(x) = −2x³(x+1)(x−4)² → degree 6, zeros: x = 0 (mult. 3), x = −1 (mult. 1), x = 4 (mult. 2)
  - b) g(x) = 3(x²−4)(x−2)⁴ = 3(x−2)(x+2)(x−2)⁴ → zeros: x = 2 (mult. 5), x = −2 (mult. 1)
  - c) y = (x³−x²−6x)(x²−7x+12) = x(x−3)(x+2)(x−3)(x−4) → zeros: x = 0 (mult. 1), x = 3 (mult. 2), x = −2 (mult. 1), x = 4 (mult. 1)
- Example 2: Conjugate identification:
  - a. 4i → −4i; b. −i → i; c. 2−3i → 2+3i; d. −4+2i → −4−2i
- Example 3: Graph of f shown. x = i√3 is a zero. "If f has degree n, what is the least possible value of n?" → Since i√3 and −i√3 are conjugate pair (2 complex zeros), and the graph shows at least 3 real zeros → least degree = 5.
- Example 4: Solve (x−3)(x+1)(x+4) > 0 → Sign chart with roots at −4, −1, 3. Solution: (−4, −1) ∪ (3, ∞).
- Example 5: Solve (x+2)²(x−5) ≤ 0 → Root at x = −2 (even, tangent) and x = −5. Solution includes x = −2 since inequality is ≤.

## Independent Practice Description

- AP-style tasks: Students find zeros with multiplicity, determine conjugate pairs, solve polynomial inequalities using sign charts, and use successive differences to determine degree from tables.
- Worksheet A Problem 2: g(x) = −2x(x−5)³(x+1)² → zeros: x = 0 (mult. 1), x = 5 (mult. 3), x = −1 (mult. 2).
- Worksheet A Problem 15: x = 3 (mult. 2), x = 3i, x = 4−i → conjugates add x = −3i and x = 4+i → least degree = 2 + 1 + 1 + 1 + 1 = 6.
- Worksheet C Problem 5: (x+3)(x−1)(x−2) < 0 → solution: (−∞, −3) ∪ (1, 2).
- Worksheet E Problem 1: f is odd and decreasing. Table: x: −1, 2, 3, 5; f(x): 5, −4, −6, −11. Find f(−2) = ? (Use odd property: f(−x) = −f(x), and interpolate.)
- Emphasis: Show sign charts with test values. Always state multiplicity when listing zeros.

## FRQ Expectations

- FRQ 1 (Function Concepts): Students may be asked to identify zeros and their multiplicities from a factored polynomial, then describe graph behavior at each zero (cross vs. tangent).
- FRQ 3 (Function Concepts from a Graph): Students may need to determine the least possible degree of a polynomial given graph features and complex zeros.
- AP mathematical practices targeted:
  - 1.A: Execute algebraic procedures (factor, find zeros, build sign charts).
  - 2.A: Identify information from mathematical representations (graph to zeros, zeros to graph behavior).
  - 3.C: Justify conclusions (explain why a zero causes the graph to bounce or cross).

## App-Build Notes

- Recommended componentKey: `discriminant-analyzer`
- Rationale: Topic 1.5 involves analyzing whether zeros are real or complex, understanding multiplicity effects, and applying the Fundamental Theorem of Algebra. The discriminant-analyzer helps students explore the relationship between factors, zeros, and graph behavior.
- Calculator requirement: Not required for most of this topic. Sign charts are done by hand. Optional calculator for verifying inequality solutions.
- Graphing needs: Static graphs showing multiplicity behavior at x-axis. Students benefit from seeing graphs of y = (x−a)ⁿ for various n to internalize the tangent/crossing pattern.
- Phase package daily phases:
  - Warm-Up: "Find the zeros of f(x) = (x−3)(x+1). What does each zero tell us about the graph?"
  - Topic Introduction: Define zeros, multiplicity, and show the −.01(x+4)(x+1)³(x−3)² graph.
  - Scaffolded Examples: Work through Passwater Example 1 (find zeros with multiplicity) and Example 4 (sign chart for inequality).
  - Guided Practice: Students build sign charts for two polynomial inequalities with scaffolding.
  - Independent Practice: Worksheet A Problems 1–8 and Worksheet C Problems 5–10.
  - Exit Evidence: "Find all zeros of f(x) = x³ − 4x with multiplicity. State whether the graph crosses or is tangent at each zero."
  - CAP Reflection: "What courage move did you make when the polynomial required factoring a trinomial first?"
