# Topic 1.8: Rational Functions and Zeros

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.8`
- Learning-objective family: `1.8.A`
- Essential-knowledge family: `1.8.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.8.A: Determine the zeros of a rational function and solve rational inequalities using sign charts that account for both zeros and undefined values.

## CED Essential Knowledge

- EK 1.8.A.1: A rational function f(x) = g(x)/h(x) has zeros where g(x) = 0 and is undefined where h(x) = 0.
- EK 1.8.A.2: When solving rational inequalities, both the zeros and the undefined values must be identified and placed on a sign chart.
- EK 1.8.A.3: Values where the denominator equals zero are excluded from the domain and must never be included in the solution set of a rational inequality.

## Passwater Scaffolding Notes

- Topic introduction: Passwater connects directly to Topic 1.5's polynomial sign chart method, then adds the critical twist: "When solving rational inequalities, we need to identify BOTH the zeros and undefined values!"
- Key vocabulary (fill-in-the-blank): Rational function, zeros (from numerator), undefined values (from denominator), sign chart, domain restriction.
- Two important traits (fill-in-the-blank): "Let f(x) = g(x)/h(x) be a rational function where g(x) and h(x) have no factors in common. Then: (1) f(x) has zeros when g(x) = 0. (2) f(x) is undefined when h(x) = 0."
- Passwater's 7-step method for rational inequalities: (1) Get 0 on one side, (2) Write as single fraction g(x)/h(x), (3) Set g(x) = 0 and h(x) = 0 for sign chart values (factor!), (4) Create sign chart with all values, (5) Mark h(x) = 0 values to NEVER include, (6) Test values in each interval, (7) Interpret the sign chart. "NOTE: Be sure to write your answer in interval notation and think about the endpoints!"
- Scaffolding: Passwater starts with polynomial inequality review (Example 1 mirrors 1.5), then explicitly shows the added step of including denominator zeros on the sign chart.

## Guided Practice

- Example 1: Solve (x−2)/((x+6)(x−3)) ≥ 0
  - Numerator zero: x = 2. Denominator zeros: x = −6, x = 3 (never included).
  - Sign chart: intervals (−∞, −6), (−6, 2), (2, 3), (3, ∞).
  - Solution: (−∞, −6) ∪ [2, 3). Note: x = 3 is excluded (undefined), x = 2 is included (≥).
- Example 2: Solve (x²−4)/(x²−10x+25) < 0 → (x−2)(x+2)/(x−5)² < 0
  - Numerator zeros: x = 2, x = −2. Denominator zero: x = 5 (excluded).
  - Solution: (−2, 2) ∪ (2, 5) ∪ (5, ∞) where expression is negative → (−2, 2).
- Example 5: Solve ((x−1)(x+2)²)/(x−2) ≥ 0
  - Zeros: x = 1, x = −2 (even multiplicity). Undefined: x = 2.
  - At x = −2 (even), expression = 0 (included in ≥). Solution: [−2, 1] ∪ (2, ∞).
- Example 6: Solve 1/(x−1)² ≤ 0
  - The expression is always positive except undefined at x = 1. Solution: no values satisfy ≤ 0. Answer: ∅ (empty set).

## Independent Practice Description

- AP-style tasks: Students solve rational inequalities from equations and from graphs, find zeros of rational functions, and verify solutions with test values.
- Worksheet A Problem 1: y = (3x²+x−2)/((x−1)(x+5)). Find zeros: set numerator = 0 → 3x²+x−2 = (3x−2)(x+1) = 0 → x = 2/3, x = −1. But check: x = 1 makes denominator 0, so it's excluded from domain.
- Worksheet A Problem 5: f(x) = (x²−9)/(x²−2x−15) = (x−3)(x+3)/((x−5)(x+3)). Hole at x = −3, zero at x = 3.
- Worksheet A Problem 10: (2x)/(x+1) < 0 → zeros: x = 0; undefined: x = −1. Solution: (−1, 0).
- Emphasis: Always verify that denominator zeros are excluded. Mark them with open circles on sign charts.

## FRQ Expectations

- FRQ 1 (Function Concepts): Students may need to solve a rational inequality or identify zeros and domain restrictions of a rational function from its equation or graph.
- AP mathematical practices targeted:
  - 1.A: Execute algebraic procedures (factor, build sign chart, test intervals).
  - 2.B: Use appropriate notation (interval notation with correct open/closed endpoints).
  - 3.C: Justify conclusions (explain why an endpoint is included or excluded).

## App-Build Notes

- Recommended componentKey: `step-by-step-solver`
- Rationale: Topic 1.8 involves multi-step sign chart construction where students must factor, identify zeros and undefined values, test intervals, and interpret results. The step-by-step-solver can guide students through each step with feedback, showing where errors occur (e.g., forgetting to exclude denominator zeros).
- Calculator requirement: Not required. Sign charts and interval testing are done by hand.
- Graphing needs: Graphs of rational functions help students verify inequality solutions, but the core task is algebraic sign chart reasoning.
- Phase package daily phases:
  - Warm-Up: "Solve (x−1)(x+3) > 0. What steps did you follow?"
  - Topic Introduction: Connect polynomial sign charts (1.5) to rational inequalities. Highlight the "both zeros and undefined values" rule.
  - Scaffolded Examples: Work through Passwater Example 1 step by step (7-step method).
  - Guided Practice: Students solve two rational inequalities with the 7-step framework (Examples 3 and 4).
  - Independent Practice: Worksheet A Problems 10–15 (rational inequalities).
  - Exit Evidence: "Solve (x+4)/(x−2) ≤ 0. Show your sign chart."
  - CAP Reflection: "What persistence move did you make when the factoring was difficult?"
