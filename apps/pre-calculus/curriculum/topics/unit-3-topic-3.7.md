# Topic 3.7: Sinusoidal Function Context and Data Modeling

## CED Identity

- Unit: 3
- Unit title: Trigonometric and Polar Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `3.7`
- Learning-objective family: `3.7.A`
- Essential-knowledge family: `3.7.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-3.md`

## CED Learning Objectives

- LO 3.7.A: Construct sinusoidal models from verbal descriptions, graphical displays, numerical data tables, and algebraic properties. Interpret parameters in context.

## CED Essential Knowledge

- EK 3.7.A.1: To construct a sinusoidal model, connect information given verbally, graphically, numerically, and algebraically to the properties of a sinusoidal function graph.
- EK 3.7.A.2: Sinusoidal regression can be used to fit a model to periodic data. Parameters (amplitude, period, phase shift, midline) have contextual meaning.
- EK 3.7.A.3: Real-world sinusoidal models include daylight hours, temperature cycles, tidal patterns, population cycles, and rotational motion.

## Passwater Scaffolding Notes

Passwater introduces Topic 3.7 with the "Four Representations Framework": "To construct a model, we will need to connect information that is given **verbally, graphically, numerically, and algebraically** to the properties of a sinusoidal function graph." This framework is the organizing principle — every problem in this topic involves translating between representations.

The worked examples demonstrate all four types: graphical (Example 1: read period from graph; Example 2: determine c from a reflected graph), verbal (Example 3: yo-yo on 30-inch string, 20 rotations in 5 seconds, choose appropriate function — answer: 30 sin(8πt)), verbal/graphical (Example 4: clock minute hand, h(t) = a sin(bt + c) + d, max at (0, 70), min at (30, 52), find a and d), analytical (Example 5: temperature model T(m) = 25.7 sin(π(m − 4)/6) + 61.2, interpret min/max), and numerical (Example 6: nighttime hours table with sinusoidal regression).

The pencil sharpener FRQ (Worksheet A Problem 23) is a capstone: handle 2 inches from center, 2 rotations per second, t = 0 directly below, center 3 inches above surface. Part (A): determine coordinates for F, G, J, K, P. Part (B): find a, b, c, d for h(t) = a sin(bt + c) + d. Part (C): interval analysis.

## Guided Practice

**Example 3 (Verbal):** "Yo-yo on a 30-inch string rotated at constant rate. At t = 0 starts rotating, at t = 5 completed 20 rotations. Sinusoidal function models x-coordinate. Which is appropriate?" Options: 30 sin(4πt), 30 sin(2πt/5), 30 sin(8πt). Period = 5/20 = 1/4. Angular frequency b = 2π/(1/4) = 8π. Answer: 30 sin(8πt).

**Example 4 (Verbal/Graphical):** Clock minute hand. h(t) = a sin(bt + c) + d. Max at (0, 70), min at (30, 52). a = (70 − 52)/2 = 9, d = (70 + 52)/2 = 61.

**Example 5 (Analytical):** T(m) = 25.7 sin(π(m − 4)/6) + 61.2. Max = 61.2 + 25.7 = 86.9°F. Min = 61.2 − 25.7 = 35.5°F. Max at m = 10 (October), min at m = 4 (April). Which statement is true? Answer: (C) Minimum temperature is 35.5°F.

**Example 6 (Numerical):** Table: t = 1, 3, 4, 6, 7, 8, 11, 12; N(t) = 11.4, 9.7, 8.2, 5.2, 5.0, 6.2, 10.5, 11.3. Sinusoidal regression with 16 iterations. Maximum predicted is 12 (approximately — end of cycle).

## Independent Practice Description

Worksheet A: 23 problems. Problems 1–8: Graphs — find period/amplitude or match expressions. Problems 9–12: Interpret context models (San Diego daylight, California snowpack, tides, trout population). Problem 13: f(x) = a sin(b(x − c)) + d, min at (4, 1), max at (8, 5), find a and d. Problem 17: Gear — P is 6 inches from center, directly below at t = 0, 4 inches above surface, clockwise, 1 revolution in 2 seconds. Answer: h(t) = 6 − 4 cos(πt). Problems 18–20: Spinner contexts with various rotation rates. Problem 21: Table with F(t) values, sinusoidal regression, find F(6). Problem 23: Pencil sharpener FRQ.

Worksheet B: 6 problems. Problem 5: F(4,64), G(7,50), J(10,36), K(13,50), P(16,64) — find a, b, c, d for h(t) = a cos(bt + c) + d. Problem 6: F(0, −2), G(π, 6), J(2π, 10), K(3π, 6), P(4π, −2) — find a, b, c, d.

## FRQ Expectations

FRQ 3 (NO calculator): Subskills for 3.7: translating verbal context into sinusoidal equation, interpreting parameters in context (amplitude = radius/height variation, period = rotation time, midline = center height, phase shift = starting position). Part (A) coordinates, Part (B) find a/b/c/d, Part (C) interval behavior. AP practices: 1.A, 1.B, 2.A, 2.B, 3.A, 3.B, 3.C.

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Context and data modeling problems test comprehension — students must interpret verbal, graphical, and numerical information to construct sinusoidal equations.
- Calculator requirement: NO calculator for FRQ 3 practice. Calculator may be used for sinusoidal regression in non-FRQ problems.
- Graphing needs: Given data table, overlay sinusoidal curve. Annotate max/min points. Show one complete period.
- Phase package daily phases:
  - Warm-Up: Describe a real-world situation that can be modeled by a sinusoidal function. What are the period and amplitude in your example?
  - Topic Introduction: Passwater four-representations framework — verbal, graphical, numerical, algebraic.
  - Scaffolded Examples: Examples 3–5 (verbal → equation, interpret model).
  - Guided Practice: Worksheet A Problems 9–12 (interpret context models).
  - Independent Practice: Worksheet A Problem 17 (gear), Problem 21 (table regression), or Problem 23 (pencil sharpener FRQ).
  - Exit Evidence: A spinner has radius 10 feet and completes 4 rotations in 8 seconds. Write a sinusoidal function for the x-coordinate.
  - CAP Reflection: "When given a word problem, how do you decide whether to use sine or cosine? What do each of the four parameters a, b, c, d represent in context?"

## Additional Notes

The pencil sharpener FRQ is the capstone for this topic: handle 2 inches from center, 2 rotations per second, t = 0 directly below, center 3 inches above surface. The full solution: amplitude a = 2, period = 1/2 so b = 4π, midline d = 3 + 2 = 5 (center height plus radius), and since it starts directly below (minimum position), h(t) = −2 cos(4πt) + 5 or equivalently h(t) = 2 sin(4πt − π/2) + 5. Part (C) asks for an interval where h is both increasing and concave down — this requires students to combine monotonicity and concavity analysis from Topic 3.4.

The gear problem (Worksheet A Problem 17) is a common error trap: point P starts directly below the center, so the initial height is center minus radius. The correct model is h(t) = 6 − 4 cos(πt), not h(t) = 6 + 4 cos(πt). The negative cosine captures the downward starting position. Students who choose 10 − 6 cos(πt) confuse the amplitude and midline calculations.

Sinusoidal regression in Problem 21 uses a calculator with 16 iterations to fit a sinusoidal curve to data: F(t) values at t = 1, 3, 4, 7, 9, 11. Students find F(6) by evaluating the regression equation. This connects to AP exam expectations for data modeling.

The quiz after Topics 3.6–3.7 tests both transformation identification and context-based modeling, combining all skills from the sinusoidal function unit.
