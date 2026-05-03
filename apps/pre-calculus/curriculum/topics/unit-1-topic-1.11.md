# Topic 1.11: Equivalent Representations of Polynomial and Rational Expressions

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.11`
- Learning-objective family: `1.11.A`
- Essential-knowledge family: `1.11.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.11.A: Convert between equivalent representations of polynomial and rational functions — factored form, expanded form, and graph — and use long division to identify slant asymptotes.

## CED Essential Knowledge

- EK 1.11.A.1: A rational function can be written in factored form to reveal zeros, holes, and vertical asymptotes. The same function can be written in expanded form or represented as a graph.
- EK 1.11.A.2: Long division of polynomials produces f(x)/g(x) = q(x) + r(x)/g(x), where q is the quotient and r is the remainder with degree less than the degree of g. The quotient q(x) gives the slant asymptote when the numerator degree exceeds the denominator degree by exactly 1.
- EK 1.11.A.3: The Binomial Theorem provides a method for expanding (a+b)ⁿ using coefficients from Pascal's Triangle.

## Passwater Scaffolding Notes

- Topic introduction: Passwater frames this as "graph-to-equation and equation-to-graph fluency" — the culmination of the rational function unit. Students must move fluidly between all representations.
- Key vocabulary (fill-in-the-blank): Factored form, expanded form, long division, quotient, remainder, slant asymptote, Binomial Theorem, Pascal's Triangle.
- Long division definition (fill-in-the-blank): "If f(x) and g(x) are polynomials, then f(x)/g(x) = g(x)q(x) + r(x), where q is the quotient, r is the remainder, and the degree of r is less than the degree of g."
- Passwater's long division example: k(x) = (x³−x²+x−1)/(x²−x−1) = x + 2/(x²−x−1) — has hole at x = 2, VA at x = −1, slant asymptote y = x + 1.
- Binomial Theorem (fill-in-the-blank): "(a+b)ⁿ = Σ C(n,r) aⁿ⁻ʳ bʳ." Passwater notes: "a begins with degree n; b begins with degree 0. Degree of a decreases by 1 each term; degree of b increases by 1."
- Combination notation: "The notation nCr represents a combination, where nCr = n!/(r!(n−r)!). You will NOT need to know this formula for the AP Precalculus Exam!"
- Scaffolding sequence: (1) Factor and find features (1.9–1.10 skills), (2) use long division for slant asymptotes, (3) use Pascal's Triangle for binomial expansion, (4) connect graph features to equation form.

## Guided Practice

- Example 1: h(x) = (x²−4)/(x²+7x+10) = (x−2)(x+2)/((x+2)(x+5)). Factored form reveals: hole at x = −2, VA at x = −5, zero at x = 2.
- Example 3: k(x) = (x²−3x−12)/(x³+2x²−x−20). Students find: (a) factored form, (b) zeros, (c) holes, (d) VAs, (e) HAs, (f) domain, (g) sketch using calculator.
- Example 6: h(x) = (x²+6x+5)/(2x+1). Long division: quotient = ½x + 11/4, remainder = 9/4. Slant asymptote: y = ½x + 11/4.
- Example 8: d(x) = (2x²+4x+1)/(2x−1). "Which statement is correct?" Answer: (d) One slant asymptote, no holes, one VA. (numerator degree 2 = denominator degree 1 + 1 → slant; no common factors → no holes; denominator zero at x = 1/2 → VA.)
- Example 10: Expand (x+2)⁵ using Pascal's Triangle → 1, 5, 10, 10, 5, 1 → x⁵ + 10x⁴ + 40x³ + 80x² + 80x + 32.
- Example 12: "What is the coefficient of the x⁴ term when (x+5)⁶ is expanded?" → C(6,2) · 5² = 15 · 25 = 375.

## Independent Practice Description

- AP-style tasks: Students convert between factored and expanded forms, perform long division, find slant asymptotes, and expand binomials using Pascal's Triangle.
- Worksheet A Problem 1: f(x) = (x²+x−2)/(x²−2x−3). Students provide: factored form, zeros, holes, VAs, HAs, domain, sketch.
- Worksheet B Problem 2: r(x) = (2x²+4x+7)/(6x−5) → determine: horizontal, slant, or neither? n = 2, d = 1 → slant.
- Worksheet B Problem 7: f(x) = (x²−6x+7)/(x−1). Long division: quotient = x − 5, remainder = 2. Slant asymptote: y = x − 5.
- Example 4 (graph-to-equation): Graph of rational function f shown. "Write an equation, in factored form, for f(x)." Students read zeros, holes, VAs, and HA from the graph and construct the factored expression.
- Example 5 (graph-to-equation): Graph of rational function g shown. "Write an equation, in factored form, for g(x)." Same skill with a different graph.
- Emphasis: Show all steps of long division. Connect the quotient to the slant asymptote equation.

## FRQ Expectations

- FRQ 1 (Function Concepts): Students may need to convert a rational function to factored form to identify features, or use long division to find a slant asymptote.
- FRQ 2 (Modeling): If a rational regression model is used, students may need to interpret the slant asymptote in context.
- AP mathematical practices targeted:
  - 1.A: Execute algebraic procedures (factor, long division, binomial expansion).
  - 1.B: Identify information from multiple representations (equation ↔ graph ↔ factored form).
  - 3.A: Explain the steps and purpose of mathematical procedures (long division → slant asymptote).

## App-Build Notes

- Recommended componentKey: `step-by-step-solver`
- Rationale: Topic 1.11 centers on converting between representations — factoring, long division, and binomial expansion. The step-by-step-solver can guide students through long division and factoring procedures with intermediate steps shown.
- Calculator requirement: Graphing calculator required for sketching and verifying (Example 3 part g).
- Graphing needs: Students benefit from graphing their factored functions to verify zeros, holes, VAs, and slant asymptotes match the equation.
- Phase package daily phases:
  - Warm-Up: "Factor x² − 5x + 6. Now sketch the graph. What features can you read from the factored form?"
  - Topic Introduction: Review factoring for features (1.9–1.10). Introduce long division and its connection to slant asymptotes.
  - Scaffolded Examples: Work through Passwater Examples 1 and 6 (factored form analysis and long division).
  - Guided Practice: Students perform long division for two rational functions and identify slant asymptotes.
  - Independent Practice: Worksheet A Problems 1–4 (full feature analysis from equations) and Worksheet B Problems 7–10 (long division).
  - Exit Evidence: "Use long division to find the slant asymptote of f(x) = (2x²+3x−1)/(x+4)."
  - CAP Reflection: "What persistence move did you make when the long division had messy fractions?"
