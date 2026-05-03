# Topic 3.10: Trigonometric Equations and Inequalities

## CED Identity

- Unit: 3
- Unit title: Trigonometric and Polar Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `3.10`
- Learning-objective family: `3.10.A`
- Essential-knowledge family: `3.10.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-3.md`

## CED Learning Objectives

- LO 3.10.A: Solve trigonometric equations and inequalities using the unit circle, algebraic techniques, and interval analysis.

## CED Essential Knowledge

- EK 3.10.A.1: To solve a trigonometric equation, isolate the trigonometric function, find corresponding angle measures on the unit circle, consider domain restrictions, and write general solutions using period (2π for sin/cos, π for tan).
- EK 3.10.A.2: sin(x) = 1/2 has solutions x = π/6 + 2kπ or x = 5π/6 + 2kπ. cos(x) = 1/2 has x = π/3 + 2kπ or x = 5π/3 + 2kπ. tan(x) = 1 has x = π/4 + kπ.
- EK 3.10.A.3: Trigonometric inequalities use sign charts: set f(x) = 0 and solve, create sign chart with solutions, test intervals, and interpret. The notation sin²x means (sin x)².

## Passwater Scaffolding Notes

Passwater starts with the critical distinction: Equation 1: sin(x) = 1/2 vs. Equation 2: sin⁻¹(1/2) = ? — "Are these two equations equivalent?" No, because domain restrictions on inverse trig give only one solution, while the equation itself has infinitely many. This is a key conceptual point.

The solution process is presented as fill-in-the-blank steps:
1. Isolate the trigonometric function on one side of the equation.
2. Find the corresponding angle measures on the unit circle.
3. Consider any domain restrictions in the problem.
4. Write the solutions and/or the general solutions.

For inequalities, Passwater provides a five-step process:
1. Set f(x) = 0 and solve for x (may need to factor).
2. Create a sign chart with solutions marked.
3. Test a value in one interval.
4. Label remaining intervals as positive or negative.
5. Interpret the sign chart.

The notation sinⁿx means (sin x)ⁿ is explicitly addressed: "We must include parentheses...However, we also have notation that we can use that is both clear and simple: sinⁿx means (sin x)ⁿ."

Scaffolding moves: simple equations (2 cos x = −√2 → Example 1) → compound equations (6 sin(3θ) = 2 → Example 4) → intersection problems (3 cos x + 2 = −2 → Example 5) → zero-finding (3 − 4 sin²x = 0 → Example 6) → factoring (cos²θ = cos θ + 2) → inequalities with unit circle visualization → inequalities with sign charts.

## Guided Practice

**Example 1 (Equations):** Find all solutions to 2 cos x = −√2. cos x = −√2/2. x = 3π/4 + 2kπ or x = 5π/4 + 2kπ.

**Example 4 (Compound):** All values of θ where 6 sin(3θ) = 2. sin(3θ) = 1/3. Students use arcsin for reference angle, then apply period and symmetry.

**Example 5 (Intersection):** f(x) = 3 cos x + 2, g(x) = −2. 3 cos x + 2 = −2 → 3 cos x = −4 → cos x = −4/3. No solution since |−4/3| > 1.

**Example 7 (Factoring):** 2 cos θ = cos θ − 1 → cos θ = −1. θ = π on [0, 2π).

**Example 2 (Inequalities):** Values of θ, 0 ≤ θ < 2π, where sin θ ≥ √2/2. Using unit circle: π/4 ≤ θ ≤ 3π/4.

**Example 5 (Inequalities):** 2 sin²θ + sin θ < 0. Factor: sin θ(2 sin θ + 1) < 0. Zeros at sin θ = 0 and sin θ = −1/2. Sign chart with intervals.

## Independent Practice Description

Worksheet A Part I: 23 problems. Problems 1–6: Find all solutions on [0, 2π): 2 sin x = √2, cos x = 1/2, cos x = 0, tan x = −1, sin x = −1/2, tan x = √3. Problems 7–12: General solutions. Problems 13–14: Shifted arguments — 2 cos(x + 3) = √2, 4 sin(2x − 3) = 1. Problems 15–17: Intersection points. Problem 18: Zeros of 2 − 4 cos x. Problems 19–23: Factored equations and intersections.

Worksheet B Part II: 10 inequality problems. Problem 1: sin θ ≥ √3/2, 0 ≤ θ < 2π. Problem 6: (2 cos θ − 1)(sin θ + 1) < 0. Problem 8: 2 sin²θ − sin θ − 1 < 0.

Worksheets C and D: Additional equation and inequality practice with varied arguments (3x + 1, 5x − 1, etc.).

## FRQ Expectations

FRQ 4 (Symbolic Manipulations, NO calculator): Subskills for 3.10: solving trig equations on a restricted interval, finding all solutions in an interval, solving trig inequalities using sign charts, intersection of two trig functions. AP practices: 1.A, 1.C, 2.A, 3.A, 3.B.

## App-Build Notes

- Recommended componentKey: `step-by-step-solver`
- Rationale: Trig equation solving benefits from step-by-step scaffolding — isolate function, find reference angle, apply symmetry, write general solutions.
- Calculator requirement: NO calculator — FRQ 4 is NO calculator.
- Graphing needs: Unit circle with solutions marked. Sign chart visualization for inequalities.
- Phase package daily phases:
  - Warm-Up: Solve sin x = 1/2 for 0 ≤ x < 2π. How many solutions? Why?
  - Topic Introduction: Passwater four-step equation process and five-step inequality process.
  - Scaffolded Examples: Examples 1–4 (simple equations, compound equations).
  - Guided Practice: Worksheet A Problems 1–6 (solutions on [0, 2π)).
  - Independent Practice: Worksheet A Problems 7–12 (general solutions) or Worksheet B (inequalities).
  - Exit Evidence: Find all solutions of 2 sin x = √3 on [0, 2π).
  - CAP Reflection: "Why does sin(x) = 1/2 have infinitely many solutions? How does the period of the function determine the pattern of solutions?"
