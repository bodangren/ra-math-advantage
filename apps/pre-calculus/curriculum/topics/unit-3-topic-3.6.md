# Topic 3.6: Sinusoidal Function Transformations

## CED Identity

- Unit: 3
- Unit title: Trigonometric and Polar Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `3.6`
- Learning-objective family: `3.6.A`
- Essential-knowledge family: `3.6.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-3.md`

## CED Learning Objectives

- LO 3.6.A: Write equations for sinusoidal functions using transformations. Identify the parameters a, b, c, d in h(t) = a sin(bt + c) + d from graphs and contextual information.

## CED Essential Knowledge

- EK 3.6.A.1: A vertical dilation by |a| corresponds to the amplitude. A vertical translation of d units gives the midline. A horizontal dilation by 1/b gives the period P = 2π/|b|.
- EK 3.6.A.2: A horizontal translation of a sinusoidal function is called a phase shift. The graph of g(x) = sin(x + c) is a phase shift of sin x by −c units.
- EK 3.6.A.3: The general sinusoidal form h(t) = a sin(bt + c) + d (or equivalently with cosine) captures all four transformations: vertical dilation, horizontal dilation, horizontal translation (phase shift), and vertical translation.

## Passwater Scaffolding Notes

Passwater connects transformations from Unit 1 directly: "The midline of a sinusoidal function is simply a vertical translation." "The amplitude of a sinusoidal function is the vertical dilation." "The period of a sinusoidal function is the result of a horizontal dilation." This anchoring helps students transfer transformation knowledge to trig.

The general form f(θ) = a sin(bθ) + d or k(θ) = a cos(bθ) + d is introduced with three properties:
1. Vertical dilation by |a| (amplitude = |a|)
2. Vertical translation of d units (midline = d)
3. Horizontal dilation by 1/b (period = 2π/b)

Phase shift is added separately: "A horizontal translation of a sinusoidal function is called a **phase shift**." "The graph of g(x) = sin(x + c) is a phase shift of sin x by −c units." The full form h(t) = a sin(bt + c) + d includes all constants.

Scaffolding moves: find a, b, d from a labeled graph (Example 1) → write expression from graph (Example 2) → multiple choice on period/amplitude (Examples 3–4) → match graph to equation (Examples 5–7) → find all four constants from five labeled points (Example 8: F(2,16), G(5,11), J(8,6), K(11,11), P(14,16)). The five-point method is the capstone skill: a = (max − min)/2, d = (max + min)/2, period from horizontal span, c from phase offset.

## Guided Practice

**Example 1:** Graph of sinusoidal h with amplitude, midline, period labeled. h(θ) = a sin(bθ) + d. Students read a from amplitude, b from period (b = 2π/P), d from midline.

**Example 4:** "k has a maximum at (0, 6). Next minimum at (π/2, −4). Which could be k(x)?" a = (6 − (−4))/2 = 5, d = (6 + (−4))/2 = 1, period = 2(π/2 − 0) = π, b = 2π/π = 2. Answer: k(x) = 5 cos(2x) + 1.

**Example 5:** f(θ) = 3 sin(2θ) − 1. Which graph matches? Students identify amplitude 3, period π, midline −1.

**Example 8:** Five points: F(2, 16), G(5, 11), J(8, 6), K(11, 11), P(14, 16). h(t) = a sin(bt + c) + d.
- a = (16 − 6)/2 = 5, d = (16 + 6)/2 = 11
- Period = 2(11 − 2) = 18, b = 2π/18 = π/9
- F is at t = 2 (max of sine), so phase: sin(π/9 · 2 + c) = 1 → 2π/9 + c = π/2 → c = 5π/18

## Independent Practice Description

Worksheet A: 14 problems. Problems 1–3: Graphs with h = a sin(bθ) + d, f = a cos(bθ) + d — find constants. Problem 4: MC on period/amplitude. Problems 5–7: k has max/min at given points, find expression. Problem 8: San Diego daylight — D(t) = 2.715 cos(0.017(t − ?)) + 12.250. Problems 12–14: Five labeled points, find a, b, c, d.

Worksheet B: 14 problems — same structure. Problem 8: Seattle daylight hours model. Problems 12–14: Five points with different coordinates.

Worksheet C: 15 problems. Problem 12: F(0,12), G(5,9), J(10,6), K(15,9), P(20,12) — find h(t) = a sin(bt + c) + d. Problem 13: F(π/2, 6), G(3π/4, 1), J(π, −4), K(5π/4, 1), P(3π/2, 6). Problem 14: F(π, 40), G(2π, 30), J(3π, 20), K(4π, 30), P(5π, 40) — form with cos. Problem 15: F(0, 12), G(1/100, 7), J(1/50, 2), K(3/100, 7), P(1/25, 12).

## FRQ Expectations

FRQ 3 (NO calculator): Subskills for 3.6: writing h(t) = a sin(bt + c) + d from five labeled points, determining amplitude/period/midline/phase shift from graph or context. Part (C) interval behavior. AP practices: 1.A, 2.A, 2.B, 3.A, 3.C.

## App-Build Notes

- Recommended componentKey: `graphing-explorer`
- Rationale: Transformation graphing is inherently visual — students need to see how changing a, b, c, d affects the sinusoidal graph.
- Calculator requirement: NO calculator for FRQ 3 practice.
- Graphing needs: Interactive sliders for a, b, c, d in a sin(bx + c) + d. Five-point annotation. Period/amplitude/midline overlay.
- Phase package daily phases:
  - Warm-Up: What does changing "a" in f(x) = a sin(x) do? What about changing "d"?
  - Topic Introduction: Passwater transformation framework — connect Unit 1 transformations to sinusoidal form.
  - Scaffolded Examples: Examples 1–4 (find a, b, d from graph; MC on period/amplitude).
  - Guided Practice: Examples 5–7 (match graph to equation).
  - Independent Practice: Example 8 type — five points, find a, b, c, d (Worksheet A Problems 12–14 or C Problems 12–15).
  - Exit Evidence: Given five points F(0, 10), G(3, 5), J(6, 0), K(9, 5), P(12, 10), find h(t) = a sin(bt + c) + d.
  - CAP Reflection: "How do you determine the phase shift from a graph? Why might sine or cosine be the better base function depending on where the graph starts?"
