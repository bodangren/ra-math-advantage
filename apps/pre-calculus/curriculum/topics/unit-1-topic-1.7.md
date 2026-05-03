# Topic 1.7: Rational Functions and End Behavior

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.7`
- Learning-objective family: `1.7.A`
- Essential-knowledge family: `1.7.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.7.A: Describe the end behavior of a rational function by comparing the degrees of the numerator and denominator and determine horizontal or slant asymptotes.

## CED Essential Knowledge

- EK 1.7.A.1: A rational function is the quotient of two polynomials: y = f(x)/g(x) where f(x) and g(x) are polynomials and g(x) ≠ 0.
- EK 1.7.A.2: The end behavior of a rational function is determined by the leading terms of the numerator and denominator. When the degrees of the numerator and denominator are equal, the function has a horizontal asymptote at y = a/b where a and b are the leading coefficients.
- EK 1.7.A.3: When the degree of the numerator is less than the degree of the denominator, the horizontal asymptote is y = 0. When the degree of the numerator exceeds the degree of the denominator by exactly 1, the function has a slant (oblique) asymptote.

## Passwater Scaffolding Notes

- Topic introduction: Passwater frames rational functions as "just fractions of polynomials," building directly on polynomial end behavior from Topic 1.6.
- Key vocabulary (fill-in-the-blank): Rational function, horizontal asymptote, slant (oblique) asymptote.
- Three-case framework (Passwater's organizing structure):
  - Case I: n = d (same degree) → HA: y = a/b
  - Case II: n < d (denominator dominates) → HA: y = 0
  - Case III: n > d (numerator dominates) → end behavior of polynomial y = (a/b)x^(n−d), or slant asymptote if n = d+1
- Passwater note: "If the degree of the numerator is exactly 1 more than the degree of the denominator, then f(x) has a slant (oblique) asymptote."
- Scaffolding sequence: (1) Identify degrees of numerator and denominator, (2) classify which case applies, (3) write the HA or slant equation, (4) write limit statements.
- Common misconception: Students try to divide every term instead of just comparing leading terms. Passwater emphasizes: "It is easiest to find the end behavior of the RIGHT side first."

## Guided Practice

- Example 1: Determine if horizontal asymptote, slant asymptote, or neither:
  - a) f(x) = (3x²+4x−7)/(5x²−3) → n = 2, d = 2 → HA: y = 3/5
  - b) y = (2x−5)/(x²+3x+2) → n = 1, d = 2 → HA: y = 0
  - c) g(x) = (2x²−4)/(5x+9) → n = 2, d = 1 → slant asymptote (n = d+1)
  - d) y = (4x+5)/(8x−1) → n = 1, d = 1 → HA: y = 4/8 = 1/2
  - e) k(x) = 3/(x²+3x−7) → n = 0, d = 2 → HA: y = 0
  - f) p(x) = −4/(2x+1) → n = 0, d = 1 → HA: y = 0
- Example 2: Write limit statements:
  - a) f(x) = (2x³+4x−1)/(6x³−x²+4) → HA: y = 2/6 = 1/3. lim(x→∞) f(x) = 1/3, lim(x→−∞) f(x) = 1/3
  - b) g(x) = (5x²−8x+9)/(2x³+x−1) → HA: y = 0. lim(x→∞) g(x) = 0, lim(x→−∞) g(x) = 0
  - c) h(x) = (−3x⁴−x²+x)/(x³+4x+4) → n > d+1, leading ratio −3x → lim(x→∞) h(x) = −∞, lim(x→−∞) h(x) = ∞
- Example 3: "Which rational function has a slant asymptote parallel to y = ½x?" Answer: Functions III and IV have n = d+1 with a/b = 1/2.

## Independent Practice Description

- AP-style tasks: Students determine asymptote type from equations, write limit statements, and identify which functions have slant asymptotes.
- Worksheet A Problem 1: y = (3x²−1)/(2x²+5x+7) → n = 2, d = 2 → HA: y = 3/2.
- Worksheet A Problem 3: h(x) = (4x²−5x−2)/(x³+6x) → n = 2, d = 3 → HA: y = 0.
- Worksheet A Problem 12: y = (3x²+1)/(x−1) → n = 2, d = 1 → slant asymptote.
- Emphasis: Always compare degrees first. Write HA equations precisely as y = number.

## FRQ Expectations

- FRQ 1 (Function Concepts): Students may need to identify horizontal or slant asymptotes from a rational function equation and write limit statements.
- FRQ 2 (Modeling): If a rational model is used, the horizontal asymptote describes the long-term limiting value — students must interpret this in context.
- AP mathematical practices targeted:
  - 1.A: Execute algebraic procedures (compare degrees, find leading coefficients).
  - 1.B: Identify information from multiple representations (equation → HA → limit notation).
  - 3.C: Justify conclusions (why the HA represents the long-term behavior).

## App-Build Notes

- Recommended componentKey: `graphing-explorer`
- Rationale: Students need to see how rational functions approach horizontal and slant asymptotes as x → ±∞. The graphing-explorer lets students zoom out and observe the asymptotic approach, connecting the three-case algebraic framework to visual behavior.
- Calculator requirement: Graphing calculator recommended for verifying asymptote behavior on specific functions.
- Graphing needs: Interactive graphing essential. Students need to see both the function and its asymptote line simultaneously, and zoom to observe end behavior.
- Phase package daily phases:
  - Warm-Up: "What is the degree of the numerator and denominator of f(x) = (2x−1)/(x²+3)? Which is bigger?"
  - Topic Introduction: Define rational functions, introduce the three-case framework with examples.
  - Scaffolded Examples: Work through Passwater Example 1 (classify HA type for six functions).
  - Guided Practice: Students write limit statements for four rational functions (Example 2 format).
  - Independent Practice: Worksheet A Problems 1–9 (HA determination) and Problems 10–12 (limit statements).
  - Exit Evidence: "Does f(x) = (5x²+3)/(2x²−1) have a horizontal or slant asymptote? Write its equation."
  - CAP Reflection: "What adaptability move did you make when the function didn't fit the simplest case?"
