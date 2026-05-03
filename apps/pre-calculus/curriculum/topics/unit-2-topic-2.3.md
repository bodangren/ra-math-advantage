# Topic 2.3: Exponential Functions

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.3`
- Learning-objective family: `2.3.A`
- Essential-knowledge family: `2.3.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.3.A: Write limit statements for the end behavior of exponential functions and determine whether an exponential function is increasing or decreasing and concave up or concave down.

## CED Essential Knowledge

- EK 2.3.A.1: The general form of an exponential function is f(x) = a(b)^x, where b > 0, a ≠ 0, and b ≠ 1. The constant a represents the initial amount and b represents the common ratio. Exponential growth occurs when a > 0 and b > 1; exponential decay occurs when a > 0 and 0 < b < 1.
- EK 2.3.A.2: Exponential functions are always increasing or always decreasing — they never switch direction and have no relative (local) extrema. They are always concave up or always concave down — they never switch concavity and have no points of inflection.
- EK 2.3.A.3: End behavior of exponential functions can be described using limit notation: lim_{x→±∞} a·b^x = ∞, or −∞, or 0, depending on the values of a and b.

## Passwater Scaffolding Notes

Passwater positions exponential functions as among the most important in the real world (population growth, interest/debt, radioactive decay, disease spread). The three function families — linear, quadratic, exponential — are introduced as recurring throughout mathematics. Key scaffolding: students first practice writing limit statements for simple functions like f(x) = 2^x, then progress to identifying increasing/decreasing and concave up/down, and finally sketch graphs from end-behavior descriptions. Passwater emphasizes that exponential functions never switch from increasing to decreasing and never switch concavity — these are distinguishing properties. Misconception: students may confuse exponential with quadratic growth rates.

## Guided Practice

**Example 1:** Write limit statements for end behavior:
- a) f(x) = 2^x: lim_{x→−∞} f(x) = 0, lim_{x→∞} f(x) = ∞
- b) g(x) = −3(1/2)^x: lim_{x→−∞} g(x) = −∞, lim_{x→∞} g(x) = 0
- c) g(x) = (2/5)^(3x): lim_{x→−∞} g(x) = ∞, lim_{x→∞} g(x) = 0

**Example 2:** Determine increasing/decreasing and concave up/down:
- a) f(x) = (1/3)^(4x) → Decreasing, Concave Up (0 < 1/3 < 1)
- b) g(x) = −(2/3)^x → Decreasing (negative coefficient), Concave Down
- c) h(x) = (4/3)^(2x) → Increasing, Concave Up (4/3 > 1)

**Example 3:** Selected values: x: 1,6,11,16,21 → f(x): 3,5,9,17,33. Determine type.
- First differences: 2, 4, 8, 16 (not constant — not linear). Second differences: 2, 4, 8 (not constant — not quadratic). Ratios: 5/3, 9/5, 17/9, 33/17 (not constant — not exponential). Pattern suggests none of the three.

**Worksheet A — Problem 11:** Sketch an exponential function where lim_{x→∞} f(x) = −∞ and lim_{x→−∞} f(x) = 0.
- This is an exponential function with negative coefficient and base > 1: e.g., f(x) = −2^x.

**Worksheet B — Problem 6:** k exhibits exponential decay — which could be k?
- (A) k(x) = (2/4)^(3x) = (1/2)^(3x) — Yes, decay
- (B) k(x) = (4/3)^(2x) — No, growth
- (C) k(x) = 4^(−2x+3) = 64 · (1/16)^x — Yes, decay
- (D) k(x) = (1/2)^(4x−3) — Yes, decay

## Independent Practice Description

Students write limit statements for various exponential functions including h(x) = 2^(−3x), k(x) = (3/5)^(8x), m(x) = (3/6)^(−2x), n(x) = (7/4)^(−x) · π. They match graphs to descriptions (increasing+concave up, decreasing+concave up, etc.) and sketch functions from end-behavior descriptions. AP-style multiple choice: given a graph, identify the correct limit statements or equation.

## FRQ Expectations

- FRQ 1 (Function Concepts): Writing limit statements, identifying monotonicity and concavity.
- Subskills: limit notation, increasing/decreasing identification, concavity, graphing from properties.
- AP practices: 1.A (justify), 1.B (interpret), 3.A (connect representations).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Students need to demonstrate understanding of exponential function properties (end behavior, monotonicity, concavity) through multiple representations.
- Calculator requirement: No calculator needed — conceptual understanding of function behavior.
- Graphing needs: Graphing tool to sketch exponential functions with specified end behavior and concavity.
- Phase package daily phases:
  - Warm-Up: "What is lim_{x→∞} 3^x? What is lim_{x→−∞} 3^x?"
  - Topic Introduction: Define exponential growth/decay, present general form f(x) = a(b)^x with conditions on a and b.
  - Scaffolded Examples: Examples 1–2 (limit statements, increasing/decreasing with concavity).
  - Guided Practice: Students classify graphs and write limit statements for functions like h(x) = 2^(−3x).
  - Independent Practice: Worksheet A problems 1–14 (limit statements, matching, sketching), Worksheet B problems 1–9 (AP-style MC).
  - Exit Evidence: "Is f(x) = (1/5)^(2x) increasing or decreasing? Concave up or down? Write the right-hand limit."
  - CAP Reflection: "Why can an exponential function never have a local maximum or minimum?"
