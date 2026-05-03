# Topic 2.7: Function Composition

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.7`
- Learning-objective family: `2.7.A`
- Essential-knowledge family: `2.7.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.7.A: Evaluate composite functions numerically, graphically, and algebraically, and find composite function expressions using f(g(x)) and (f∘g)(x) notation.

## CED Essential Knowledge

- EK 2.7.A.1: A composite function chains operations: the output of one function becomes the input of another. When evaluating f(g(x)), work from the inside out — evaluate g(x) first, then use that result as the input to f.
- EK 2.7.A.2: Two notations represent composition: f(g(x)) and (f∘g)(x) mean the same thing. Order matters — f(g(x)) ≠ g(f(x)) in general.
- EK 2.7.A.3: Composite functions can be evaluated from equations, graphs, tables, piecewise functions, and verbal descriptions. Triple and higher-order compositions follow the same inside-out procedure.

## Passwater Scaffolding Notes

Passwater introduces composition by "plugging an output of one function back into another." The key scaffold: always start on the inside (right). If given f(g(x)): (1) evaluate g(x) first, (2) use the answer and plug it into f. Two notations are presented: f(g(x)) and (f∘g)(x), both read as "f composed with g of x" or "f of g of x." Scaffolding progresses from simple numerical evaluation (f(g(3))) to algebraic expressions (f(g(x)) = 6x − 2) to mixed representations (graphs, tables, piecewise, verbal descriptions). Worksheet A uses f(x) = 4x − 5, g(x) = x² − 2x + 4, h(x) = 3(2)^x, k(x) = 3 − 2x. Misconception: f(g(x)) ≠ g(f(x)) — order matters.

## Guided Practice

**Example 1:** g(x) = 3x + 1. Let g(2) = c. Find g(c).
- g(2) = 7 = c; g(7) = 22.

**Example 2:** f(x) = 3x − 5 and g(x) = 2x + 1.
- a) f(g(3)) = f(7) = 3(7) − 5 = 16
- b) g(f(3)) = g(4) = 2(4) + 1 = 9
- c) f(f(4)) = f(7) = 16

**Example 3:** Find expressions:
- a) f(g(x)) = 3(2x + 1) − 5 = 6x − 2
- b) g(f(x)) = 2(3x − 5) + 1 = 6x − 9

**Example 4:** h(x) = 2x − 3, k(x) = x² + 4x + 5, p(x) = √(3x + 1), m(x) = 3x + 2.
- a) k(h(2)) = k(1) = 1 + 4 + 5 = 10
- b) (h∘m)(−1) = h(m(−1)) = h(−1) = −5
- c) (k∘p)(x) = k(p(x)) = (√(3x+1))² + 4√(3x+1) + 5 = 3x + 1 + 4√(3x+1) + 5 = 3x + 6 + 4√(3x+1)

**Worksheet A — Problem 10:** f(g(x)) where f(x) = 4x − 5, g(x) = x² − 2x + 4.
- f(g(x)) = 4(x² − 2x + 4) − 5 = 4x² − 8x + 16 − 5 = 4x² − 8x + 11.

**Worksheet A — Problem 13:** (f∘g∘k)(1) where f(x) = 4x − 5, g(x) = x² − 2x + 4, k(x) = 3 − 2x.
- k(1) = 1; g(1) = 1 − 2 + 4 = 3; f(3) = 12 − 5 = 7.

## Independent Practice Description

Students evaluate compositions numerically (f(g(1)), g(f(0)), h(k(2)), f(f(−1))), find algebraic expressions (f(g(x)), (g∘f)(x), k(f(x))), and perform triple compositions ((f∘g∘k)(1)). Problems include compositions with exponential functions: h(x) = 3(2)^x, so h(h(0)) = h(3) = 3(2)^3 = 24. Continued problems use graphs, tables, piecewise functions, and transformation descriptions.

## FRQ Expectations

- FRQ 1 (Function Concepts): Evaluating composite functions from graphs and tables.
- Subskills: numerical evaluation, algebraic expression, working from inside out, mixed representations.
- AP practices: 1.A (justify), 2.A (calculate), 3.A (connect representations).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Students must demonstrate fluency with inside-out evaluation across multiple representations.
- Calculator requirement: No calculator needed for most problems; calculator allowed for exponential evaluations.
- Graphing needs: Graphs of f, g, h for graphical composition evaluation.
- Phase package daily phases:
  - Warm-Up: "If g(3) = 7 and f(7) = 22, what is f(g(3))?"
  - Topic Introduction: Define composite function, two notations, inside-out rule.
  - Scaffolded Examples: Examples 1–3 (numerical evaluation, expression finding).
  - Guided Practice: Students evaluate f(g(1)), g(f(0)), h(k(2)) using f(x) = 4x − 5, g(x) = x² − 2x + 4, h(x) = 3(2)^x.
  - Independent Practice: Worksheet A problems 1–15 (numerical and algebraic compositions).
  - Exit Evidence: "Let f(x) = 3x − 5 and g(x) = 2x + 1. Find f(g(x))."
  - CAP Reflection: "Why does order matter in function composition? Give an example where f(g(x)) ≠ g(f(x))."
