# Topic 1.2: Rates of Change

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.2`
- Learning-objective family: `1.2.A`
- Essential-knowledge family: `1.2.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.2.A: Calculate and interpret the average rate of change of a function over a specified interval.

## CED Essential Knowledge

- EK 1.2.A.1: The average rate of change of a function f over the interval [a, b] is (f(b) - f(a)) / (b - a).
- EK 1.2.A.2: The average rate of change can be interpreted as the slope of the secant line connecting the points (a, f(a)) and (b, f(b)) on the graph of f.
- EK 1.2.A.3: The units of the average rate of change are the units of the output divided by the units of the input.
- EK 1.2.A.4: A positive average rate of change indicates the function is increasing over the interval; a negative average rate of change indicates the function is decreasing.

## Passwater Scaffolding Notes

- Topic introduction: Passwater begins by connecting to Topic 1.1's covariation language and formalizing the "how fast" question with a numerical formula. The secant line is introduced geometrically before the formula is given.
- Vocabulary to introduce: average rate of change, secant line, slope, interval, numerator (change in output), denominator (change in input).
- Key statement: "Rate of change essentially means slope. Anytime you see 'rate of change,' replace it with 'slope' mentally."
- Roller coaster analogy: "Going up" = positive rate of change. "Going down" = negative rate of change. At the top of a peak or bottom of a valley, the rate of change is zero — the instant when you change between going up and going down.
- Passwater notes: "In AP Precalculus, we are unable to find the rate of change of a function at a given point (this will require calculus). But we need to determine if the rate of change at a given point is positive, negative, or zero. We will also need to compare the rates of change at two distinct points."
- Scaffolding sequence: (1) Estimate rate of change from a table by looking at consecutive rows, (2) introduce the formula, (3) connect the formula to the secant line on a graph, (4) interpret the result in context.
- Common misconception: Students calculate f(b) - f(a) but forget to divide by (b - a), giving a total change instead of a rate.
- Common misconception: Students confuse "rate of change is positive" with "the function value is positive." Emphasize rate of change describes direction of movement, not position.
- Fun fact from Passwater margin: The fastest roller coaster in the world is the Formula Rossa in Abu Dhabi (149.1 mph), compared to the average speed for the 2008 Indy 500 (143.6 mph).

## Guided Practice

- Passwater worked example 1: f(x) = x^2 on [1, 4]. Step-by-step: f(1) = 1, f(4) = 16, rate of change = (16 - 1) / (4 - 1) = 15/3 = 5. Interpretation: "The function increases by an average of 5 units for each 1-unit increase in x on the interval [1, 4]."
- Passwater worked example 2: A population table shows town population at 5-year intervals. Students compute the average rate of change for each consecutive interval and compare, finding that the growth rate is slowing.
- Scaffolding move: Passwater uses a "rate of change triangle" graphic organizer: input change (horizontal leg), output change (vertical leg), rate of change (slope of hypotenuse).

## Independent Practice Description

- AP-style tasks: Students compute average rate of change from a table, graph, or formula and interpret the result with correct units.
- Typical item: "The function C(t) = 500(1.08)^t models the cost of a commodity in dollars, where t is years since 2010. Calculate the average rate of change of C from t = 2 to t = 5. Interpret the result in context."
- Emphasis: Always include units in the interpretation. "Dollars per year" not just "the rate is 125.97."

## FRQ Expectations

- FRQ 1 (Function Concepts): Students frequently must calculate average rate of change from a table or graph and interpret it. This is a near-guaranteed subskill.
- FRQ 2 (Modeling a Non-Periodic Context): Students may compare average rates of change across intervals to justify model properties (e.g., "the rate of change is increasing, suggesting an exponential model rather than linear").
- AP mathematical practices targeted:
  - 1.A: Execute algebraic procedures (compute the rate of change).
  - 2.A: Identify information presented in mathematical representations.
  - 3.A: Explain the steps and purpose.
  - 3.C: Justify conclusions using mathematical reasoning.

## App-Build Notes

- Recommended componentKey: `rate-of-change-calculator`
- Rationale: This topic centers on computing and interpreting average rate of change from various representations. The rate-of-change-calculator component is designed for exactly this: given a function or data, compute and interpret the rate over a specified interval.
- Calculator requirement: Graphing calculator permitted. Students should verify calculations by graphing the secant line.
- Graphing needs: Students benefit from seeing the secant line on the function graph. The rate-of-change-calculator should display the function, the interval, and the secant line.
- Phase package daily phases:
  - Warm-Up: "From this table, about how fast is y changing per unit of x between x = 2 and x = 5?"
  - Topic Introduction: Derive the formula (f(b) - f(a))/(b - a) from the secant line.
  - Scaffolded Examples: Work through Passwater examples 1 and 2.
  - Guided Practice: Students compute rate of change from a new table with step-by-step guidance.
  - Independent Practice: Students compute and interpret rate of change from a formula in context.
  - Exit Evidence: "Find the average rate of change of g(x) = 3x - 7 on [2, 6] and state what it means."
  - CAP Reflection: "What courage move did you make when the numbers looked messy?"
  - Pacing: 2 class periods. Notes take 1 period; Worksheets A and B take 1 period.
  - Assessment: Included in Quiz 1.1–1.3 and Review 1.1–1.3 station block.
