# Topic 3.9: Inverse Trigonometric Functions

## CED Identity

- Unit: 3
- Unit title: Trigonometric and Polar Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `3.9`
- Learning-objective family: `3.9.A`
- Essential-knowledge family: `3.9.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-3.md`

## CED Learning Objectives

- LO 3.9.A: Evaluate inverse trigonometric functions. Understand domain restrictions required to define inverses of periodic functions.

## CED Essential Knowledge

- EK 3.9.A.1: The inverse of a trigonometric function switches the input and output values. The output value of an inverse trigonometric function is an angle measure.
- EK 3.9.A.2: Because trig functions are periodic, their domains must be restricted to create corresponding inverse functions. sin⁻¹(x): domain [−1, 1], range [−π/2, π/2]. cos⁻¹(x): domain [−1, 1], range [0, π]. tan⁻¹(x): domain all reals, range (−π/2, π/2).
- EK 3.9.A.3: Notation: sin⁻¹(x) or arcsin(x), cos⁻¹(x) or arccos(x), tan⁻¹(x) or arctan(x).

## Passwater Scaffolding Notes

Passwater defines inverse trigonometric functions as inverses: "As with all functions, the inverse of a trigonometric function is the result of switching the input (x) and output (y) values of the function. As a result, the output value of an inverse trigonometric function will be an angle measure." Notation: sin⁻¹(x) or arcsin(x) — "With either notation, we would say 'arcsine of x' when reading it aloud."

The domain restriction is the critical concept: "Because trig functions are periodic, we must restrict their domains to create their corresponding inverse functions." Passwater specifies:
- sin⁻¹(x): restricted to [−π/2, π/2] (output angle in this range)
- cos⁻¹(x): restricted to [0, π] (output angle in this range)
- tan⁻¹(x): restricted to (−π/2, π/2) (output angle in this range)

The note emphasizes: "It is important to always remember and consider the domain restrictions when working with inverse trigonometric functions and values." Common student error: forgetting that sin⁻¹(−√3/2) = −π/3, not 4π/3, because the output must be in [−π/2, π/2].

Scaffolding moves: notation conversion (Example 1: sin⁻¹(1/2) = π/6 → arcsin(1/2) = π/6) → evaluation (Example 2: cos⁻¹(−√2/2), sin⁻¹(−√3/2), tan⁻¹(√3)) → reflection problems (Example 3: identify which reflected point corresponds to given inverse trig expression).

## Guided Practice

**Example 1:** Write sin⁻¹(1/2) = π/6 in arcsine notation. → arcsin(1/2) = π/6.

**Example 2:** Evaluate: a) cos⁻¹(−√2/2) = 3π/4, b) sin⁻¹(−√3/2) = −π/3, c) tan⁻¹(√3) = π/3.

**Example 3:** Angle θ in standard position, terminal ray hits unit circle at P(x,y). Q, R, S are reflections. For each expression, determine which point:
- cos⁻¹(x) → P (x positive, angle in [0, π])
- sin⁻¹(−y) → which point has −y in [−π/2, π/2] range
- cos⁻¹(−x) → Q or R (−x may be positive)
- tan⁻¹(−y/x) → depends on sign

## Independent Practice Description

Worksheet A: 12 problems. Problems 1–6: Evaluate expressions — cos⁻¹(1/2) = π/3, sin⁻¹(−√2/2) = −π/4, tan⁻¹(1) = π/4, cos⁻¹(−√3/2) = 5π/6, sin⁻¹(−1/2) = −π/6, tan⁻¹(−1/√3) = −π/6. Problems 7–10: Solve equations involving inverse trig — sin⁻¹(cos⁻¹(0)) = sin⁻¹(π/2) which is undefined (π/2 > 1), sin⁻¹(1/2) − cos⁻¹(−1/2) = π/6 − 2π/3 = −π/2. Problems 11–12: Reflection problems — given point S or R on unit circle, determine which reflected point corresponds to given inverse trig expressions.

## FRQ Expectations

FRQ 4 (Symbolic Manipulations, NO calculator): Subskills for 3.9: evaluating inverse trig at standard values, understanding domain/range restrictions, composing inverse trig with trig functions. AP practices: 1.A, 1.C, 3.A.

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Inverse trig evaluation requires rapid recall with domain restriction awareness — quiz format reinforces this.
- Calculator requirement: NO calculator — FRQ 4 is NO calculator.
- Graphing needs: Graph of sin⁻¹, cos⁻¹, tan⁻¹ showing restricted domains and ranges.
- Phase package daily phases:
  - Warm-Up: If sin θ = 1/2 and 0 ≤ θ < 2π, what are the possible values of θ? Which one would arcsin return?
  - Topic Introduction: Passwater domain restriction — why we restrict, what each range is.
  - Scaffolded Examples: Examples 1–2 (notation and evaluation).
  - Guided Practice: Worksheet A Problems 1–6 (evaluation).
  - Independent Practice: Worksheet A Problems 7–10 (composition and equations).
  - Exit Evidence: Evaluate cos⁻¹(−√2/2) and sin⁻¹(√3/2). Explain why sin⁻¹(2) is undefined.
  - CAP Reflection: "Why must we restrict the domain of sin to create sin⁻¹? What would go wrong if we didn't?"

## Additional Notes

Common student error: treating sin⁻¹(1/2) as having multiple outputs. While sin(x) = 1/2 has infinitely many solutions, sin⁻¹(1/2) returns exactly one value: π/6. The inverse function must be single-valued, which is why the domain restriction is non-negotiable. When solving sin(x) = 1/2 on [0, 2π), students find x = π/6 and x = 5π/6 — but only π/6 is the arcsin output. This distinction is tested on the AP exam. There is no separate quiz between Topics 3.9 and 3.10.

The restricted ranges — [−π/2, π/2] for arcsin, [0, π] for arccos, (−π/2, π/2) for arctan — must be memorized. They determine which solution the inverse function returns when multiple angles share the same trig value.
