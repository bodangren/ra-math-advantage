# Topic 2.11: Logarithmic Functions

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.11`
- Learning-objective family: `2.11.A`
- Essential-knowledge family: `2.11.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.11.A: Write limit statements for the end behavior of logarithmic functions, determine increasing/decreasing and concave up/down, and find domain and range including transformations.

## CED Essential Knowledge

- EK 2.11.A.1: The general form is f(x) = a log_b(x), where b > 0, a ≠ 0, and b ≠ 1. Domain: (0, ∞) — log is only defined for positive inputs. Range: (−∞, ∞) — all real numbers. Logarithmic functions are vertically asymptotic to x = 0.
- EK 2.11.A.2: Logarithmic and exponential functions have inverse relationships for key characteristics: always increasing or always decreasing (never switch, no local extrema), always concave up or always concave down (no inflection points).
- EK 2.11.A.3: End behavior uses limit notation: lim_{x→0⁺} a log_b(x) = ±∞ and lim_{x→∞} a log_b(x) = ±∞. Left end behavior occurs as x → 0⁺, not x → −∞.

## Passwater Scaffolding Notes

Passwater presents logarithmic functions as having inverse relationships with exponential functions for their key characteristics. Scaffolding: (1) write limit statements for basic log functions like f(x) = log(x), then more complex forms like g(x) = 3 − 2 log(x), (2) determine increasing/decreasing and concave up/down for functions like f(x) = log₃(2x) and h(x) = log₆(4 − x), (3) find constant k from logarithmic function tables (e.g., f: x: 1,2,k,8,16 → f(x): 1,2,3,4,5 where k = 4 since inputs double), (4) find domain and range including transformed functions like g(x) = 5 log(3x − 1) − 2. Misconception: left end behavior is at x → 0⁺ (not x → −∞); domain of log is always restricted.

## Guided Practice

**Example 1:** Write limit statements:
- a) f(x) = log(x): lim_{x→0⁺} f(x) = −∞, lim_{x→∞} f(x) = ∞
- b) g(x) = 3 − 2 log(x): lim_{x→0⁺} g(x) = ∞ (since −2 log(x) → ∞), lim_{x→∞} g(x) = −∞
- c) h(x) = log₃(2x): lim_{x→0⁺} h(x) = −∞, lim_{x→∞} h(x) = ∞

**Example 2:** Determine increasing/decreasing and concave up/down:
- a) f(x) = log₃(2x) → Increasing, Concave Down (log base > 1, coefficient > 0)
- b) g(x) = −log(x) → Decreasing, Concave Up (negative coefficient flips direction and concavity)
- c) h(x) = log₆(4 − x) → Decreasing (inside is decreasing), Concave Down

**Example 3:** Find constant k from tables:
- a) f: x: 1,2,k,8,16 → f(x): 1,2,3,4,5 → k = 4 (inputs double: 1, 2, 4, 8, 16)
- b) g: x: k,6,18,54,162 → g(x): 0,5,10,15,20 → k = 2 (inputs triple: 2, 6, 18, 54, 162)
- c) h: x: 4,5,7,k,19 → h(x): 10,0,−10,−20,−30 → k = 11 (differences in x increase: 1, 2, 4, 8)
- d) l: x: e^(π/7), e^(14), k, e^(28), e^(π/5·35) → l(x): 7,14,21,28,35 → k = e^(21) (inputs are e raised to multiples of 7)

**Example 4:** Find domain and range:
- a) f(x) = 3 log₂(x): Domain (0, ∞), Range (−∞, ∞)
- b) g(x) = 5 log(3x − 1) − 2: 3x − 1 > 0 → x > 1/3. Domain (1/3, ∞), Range (−∞, ∞)
- c) h(x) = 8 log(2x + 3): 2x + 3 > 0 → x > −3/2. Domain (−3/2, ∞), Range (−∞, ∞)

**Worksheet A — Problem 16:** f(x) = 5 log₃(4 + x).
- (a) Domain: 4 + x > 0 → x > −4, so (−4, ∞). Range: (−∞, ∞).
- (b) g(x) = f(x−2) − 3: Domain: x − 2 > −4 → x > −2, so (−2, ∞). Range: (−∞, ∞) (vertical shift doesn't change all-reals range).
- (c) k(x) = f(x) + 7: Domain: (−4, ∞). Range: (−∞, ∞).

## Independent Practice Description

Students write limit statements for functions like f(x) = 2 log₃(x), g(x) = −2 log(x), h(x) = 3 log_π(4x). Multiple choice problems ask about graphs of k and m: increasing/decreasing at increasing/decreasing rate, limit statements, which equation could represent the function, which could be the inverse. Table problems require finding k: f: x: 0.3, 3, 30, k, 3000 → f(x): 2, 5, 8, 11, 14 (k = 300 since inputs multiply by 10).

## FRQ Expectations

- FRQ 1 (Function Concepts): Writing limit statements, identifying domain and range with transformations.
- Subskills: end behavior in limit notation, monotonicity, concavity, domain/range determination.
- AP practices: 1.A (justify), 2.A (calculate domain), 3.B (connect to inverse relationship).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Students must understand logarithmic function properties — end behavior, domain restrictions, monotonicity, concavity — and how transformations affect them.
- Calculator requirement: No calculator needed for limit statements and domain/range.
- Graphing needs: Graphing tool to visualize log functions, asymptotes, and transformations.
- Phase package daily phases:
  - Warm-Up: "What is the domain of f(x) = log(x)? Why is it restricted?"
  - Topic Introduction: Define log function properties — domain (0,∞), range (−∞,∞), asymptote at x = 0.
  - Scaffolded Examples: Examples 1–2 (limit statements, increasing/decreasing with concavity).
  - Guided Practice: Students find domain/range of g(x) = 5 log(3x − 1) − 2 and find k from tables.
  - Independent Practice: Worksheet A problems 1–16 (limit statements, MC, table problems, domain/range).
  - Exit Evidence: "Write the limit statements for f(x) = −log(x). State the domain."
  - CAP Reflection: "Why is the left end behavior of a log function at x → 0⁺ rather than x → −∞?"
