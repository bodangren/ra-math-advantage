# Topic 3.14: Polar Function Graphs

## CED Identity

- Unit: 3
- Unit title: Trigonometric and Polar Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `3.14`
- Learning-objective family: `3.14.A`
- Essential-knowledge family: `3.14.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-3.md`

## CED Learning Objectives

- LO 3.14.A: Graph polar functions and identify their key features. Match polar functions to their graphs and determine appropriate domain restrictions.

## CED Essential Knowledge

- EK 3.14.A.1: For polar functions, the inputs are θ (independent variable) and the outputs are r (dependent variable). The graph of r = f(θ) is drawn in the polar coordinate system.
- EK 3.14.A.2: On the AP Precalculus Exam, polar functions appear only in multiple choice questions. Students are NOT required to sketch polar functions by hand. Evaluating the function at several θ values is an effective strategy.
- EK 3.14.A.3: Polar functions commonly display symmetry. Tables of values are a good strategy for analyzing unknown polar functions.

## Passwater Scaffolding Notes

Passwater emphasizes the AP exam constraint: "On the AP Precalculus Exam, polar functions will only appear in multiple choice questions. This means that students will NOT be required to sketch a polar function by hand." The strategy is evaluation-based: "When working with multiple choice questions involving polar functions, it is advantageous to evaluate the function at several values of θ."

Key concepts: "For polar functions, the inputs are given by θ (independent variable), and the outputs are given by r (dependent variable)." Students must understand that r is the distance from the origin along the direction θ, and negative r values plot in the opposite direction.

Graphing strategy: "Creating a table of values is always a good strategy when attempting to graph a new or unknown function." Symmetry is common: "It is very common for polar functions to display symmetry." Functions like r = a sin(nθ) or r = a cos(nθ) produce rose curves with n petals (if n is odd) or 2n petals (if n is even).

AP exam phrasing: "The graph of the polar function r = f(θ) where [expression] is shown in the polar coordinate system for [domain]."

Scaffolding moves: sketch from equation (Example 1: f(θ) = 3 sin(3θ)) → match graph to equation (Examples 2–3) → domain restriction effects (Examples 4–6) → identify which piece remains when domain is restricted.

## Guided Practice

**Example 1:** f(θ) = 3 sin(3θ) for 0 ≤ θ ≤ 2π. Sketch the rose curve with 3 petals.

**Example 2:** Graph shown for 0 ≤ θ ≤ 2π. Which could be f(θ)? Options: 3 sin(3θ), 3 sin(−3θ), 3 cos(3θ), 3 cos(−3θ). Students evaluate at θ = 0 and key angles to distinguish.

**Example 3:** Graph shown. Which could be f(θ)? Options: 2 + 4 sin θ, 2 − 4 sin θ, 2 + 4 cos θ, 2 − 4 cos θ. This is a limaçon — students check whether the loop is on the positive or negative axis.

**Example 4:** f(θ) = −3 sin θ. Domain [a, b] where 0 ≤ a < b ≤ 2π. Which could be a and b? Options: (0, 2π), (π/2, 2π), (0, π), (π, 2π).

**Example 6:** f(θ) = 6 cos(3θ) for 0 ≤ θ ≤ 2π. Points A, B, C, D labeled. Domain restricted to [2π/3, π]. Which describes the other piece? Options: QI from D to B, QI from B to D, QII from B to D, QIII from A to D.

## Independent Practice Description

Worksheet A: 8 problems. Problem 1: Graph shown — which could be f(θ)? Options: 2 + 4 sin θ, 2 − 4 sin θ, 2 + 4 cos θ, 2 − 4 cos θ. Problem 3: Graph shown — which: 6 cos(2θ), 6 cos(4θ), 6 sin(2θ), 6 sin(4θ). Problems 4–6: Domain restriction problems for various functions. Problem 7: f(θ) = 6 cos(2θ), domain [π/2, π], which piece remains? Problem 8: f(θ) = 6 sin(2θ), domain [3π/4, π], which portion?

Worksheet B: 7 problems — "Which of the following is the graph of..." Problem 1: r = −3 sin(3θ), 0 ≤ θ ≤ 2π. Problem 2: f(θ) = −3 cos θ, 0 ≤ θ ≤ 2π. Problem 3: f(θ) = 1 + 2 sin θ. Problem 5: f(θ) = θ (Archimedean spiral), 0 ≤ θ ≤ 3π/2. Problem 6: f(θ) = 6 sin(4θ) (rose with 8 petals). Problem 7: f(θ) = 6 cos(θ²).

## FRQ Expectations

FRQ 4 (Symbolic Manipulations, NO calculator): Subskills for 3.14: matching polar function equations to graphs using evaluation at key angles, identifying domain restrictions, recognizing symmetry patterns (rose curves, limaçons, spirals). AP practices: 1.A, 2.A, 3.A.

## App-Build Notes

- Recommended componentKey: `graphing-explorer`
- Rationale: Polar curve graphing requires interactive visualization — students evaluate at θ values and see how the curve traces out.
- Calculator requirement: NO calculator — evaluate using exact unit circle values.
- Graphing needs: Polar coordinate grid. Ability to animate θ from 0 to 2π showing curve construction. Table of values overlay.
- Phase package daily phases:
  - Warm-Up: If r = 3 cos(2θ), what is r when θ = 0? When θ = π/4? When θ = π/2?
  - Topic Introduction: Passwater polar function conventions — θ is input, r is output. Multiple choice format.
  - Scaffolded Examples: Examples 1–3 (sketch rose curve, match graphs to equations).
  - Guided Practice: Worksheet A Problems 1–3 (graph matching).
  - Independent Practice: Worksheet A Problems 4–8 (domain restrictions) or Worksheet B (graph matching).
  - Exit Evidence: The graph of r = a cos(3θ) for 0 ≤ θ ≤ 2π is a rose with how many petals? How does changing to a sin(3θ) affect the graph?
  - CAP Reflection: "How does evaluating polar functions at key angles help you identify which graph matches? What role does symmetry play in polar curves?"

## Additional Notes

Common polar curve types on the AP exam: rose curves r = a sin(nθ) or r = a cos(nθ) (n petals if n is odd, 2n petals if n is even), limaçons r = a + b sin θ or r = a + b cos θ (with or without inner loops depending on |a| vs |b|), circles r = a, and spirals r = θ. Recognizing the type from the equation structure narrows answer choices quickly.
