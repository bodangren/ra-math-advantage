# Topic 2.8: Inverse Functions

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.8`
- Learning-objective family: `2.8.A`
- Essential-knowledge family: `2.8.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.8.A: Find inverse relations numerically, graphically, and analytically; verify two functions are inverses using composition; and sketch inverse graphs by reflecting over y = x.

## CED Essential Knowledge

- EK 2.8.A.1: An inverse relation undoes a given relation. Every inverse is found by switching each x and y value. The graphs of inverses are reflections over the line y = x.
- EK 2.8.A.2: Two functions f and g are inverses if and only if f(g(x)) = x and g(f(x)) = x. The inverse of f(x) is written f⁻¹(x). Domain of f = Range of f⁻¹; Range of f = Domain of f⁻¹.
- EK 2.8.A.3: A continuous function has an inverse function only if it is strictly increasing or strictly decreasing. Restricted domains may be needed. Finding inverse equations involves three steps: switch x and y, solve for y, write as f⁻¹(x).

## Passwater Scaffolding Notes

Passwater builds inverses through three representations: numerical (tables), graphical (reflections), and analytical (equations). Key vocabulary: inverse relation, reflection over y = x, f⁻¹(x) notation. Scaffolding: (1) find inverse of a table by switching x and y values — discuss why the inverse may not be a function, (2) sketch inverses by reflecting over y = x, (3) find inverse equations using 3-step procedure, (4) 6-step procedure for rational functions, (5) verify inverses by showing f(g(x)) = x and g(f(x)) = x. Passwater includes graph-based evaluation: given graph of k on [−4, 11], find min of k⁻¹, k⁻¹(6), k⁻¹(4). Misconception: f⁻¹(x) ≠ 1/f(x) — inverse is not reciprocal.

## Guided Practice

**Example 1 (Numerical):** Table: x: 1,3,4,6 → y: −1,2,0,2. Inverse: x: −1,2,0,2 → y: 1,3,4,6. Original IS a function; inverse is NOT (x = 2 maps to both 3 and 4).

**Example 3 (Analytical):** f(x) = 3x − 7 → f⁻¹(x) = (x + 7)/3.

**Example 4:** Rational function inverses using 6-step procedure:
- a) f(x) = (x − 2)/(x + 3): Switch: x = (y − 2)/(y + 3). Multiply: x(y + 3) = y − 2. xy + 3x = y − 2. xy − y = −2 − 3x. y(x − 1) = −2 − 3x. y = (−2 − 3x)/(x − 1) = (3x + 2)/(1 − x).

**Example 6:** Are f(x) = 2x − 3 and g(x) = (1/2)x + 3/2 inverses?
- f(g(x)) = 2((1/2)x + 3/2) − 3 = x + 3 − 3 = x ✓
- g(f(x)) = (1/2)(2x − 3) + 3/2 = x − 3/2 + 3/2 = x ✓

**Example 8:** Show n(x) = 6/(x − 4) and p(x) = 6/x + 4 are inverses.
- n(p(x)) = 6/((6/x + 4) − 4) = 6/(6/x) = x ✓
- p(n(x)) = 6/(6/(x−4)) + 4 = (x − 4) + 4 = x ✓

**Part II — Example 1:** Table: x: −3,−2,0,1,4,6 → f(x): 6,3,1,−1,−3,−7. g = f⁻¹.
- a) f(f(0)) = f(1) = −1
- b) g(−3) = 4 (since f(4) = −3)
- c) g(6) = −3 (since f(−3) = 6)
- d) (f⁻¹∘f)(−2) = −2
- e) f⁻¹(−3) = 4

## Independent Practice Description

Students find inverse relations from tables and graphs, sketch inverses on the same axes, find inverse equations analytically (f(x) = 3x + 5, y = −2x + 7, k(x) = (2/3)x − 1), and find inverses of rational functions (f(x) = (x−3)/(x+2), h(x) = (4x−1)/(2x+3), y = (x+4)/(x−5), g(x) = (2x+1)/(3x+7)). Graph-based problems ask for max/min of f⁻¹, f⁻¹(4), domain/range of f⁻¹.

## FRQ Expectations

- FRQ 1 (Function Concepts): Evaluating inverse functions from graphs and tables.
- Subskills: numerical inverse finding, analytical inverse computation, verifying inverses via composition, domain/range swap.
- AP practices: 1.A (justify), 2.A (calculate), 3.A (connect representations).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Students must demonstrate understanding across three representations — tables, graphs, equations — and verify inverses via composition.
- Calculator requirement: No calculator needed for most inverse computations.
- Graphing needs: Coordinate plane to sketch reflections over y = x; graphs of original functions for evaluation.
- Phase package daily phases:
  - Warm-Up: "Switch x and y in the table: x: 2,5,7 → y: 3,1,4."
  - Topic Introduction: Define inverse relation, reflection property, f⁻¹ notation, domain/range swap.
  - Scaffolded Examples: Examples 1, 3, 6 (table inverse, analytical inverse, verification).
  - Guided Practice: Students find inverses of f(x) = 3x + 5 and rational functions, verify with composition.
  - Independent Practice: Worksheet A problems 1–11 (tables, graphs, equations, rational functions).
  - Exit Evidence: "Find the inverse of f(x) = 2x − 3. Verify it is correct."
  - CAP Reflection: "Why doesn't every relation have an inverse that is a function? What determines whether the inverse is a function?"
