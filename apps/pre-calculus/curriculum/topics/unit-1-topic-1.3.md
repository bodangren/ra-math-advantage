# Topic 1.3: Rates of Change in Linear and Quadratic Functions

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.3`
- Learning-objective family: `1.3.A`
- Essential-knowledge family: `1.3.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.3.A: Identify a function as linear or quadratic based on patterns in its average rates of change over equal-length input intervals.

## CED Essential Knowledge

- EK 1.3.A.1: For a linear function, the average rate of change over any equal-length input interval is constant. This constant rate of change is the slope of the line.
- EK 1.3.A.2: For a quadratic function, the average rate of change over equal-length input intervals changes linearly. The successive differences in output values form an arithmetic sequence.
- EK 1.3.A.3: A function is concave up if the average rate of change over equal-length input intervals is increasing. A function is concave down if the average rate of change over equal-length input intervals is decreasing.

## Passwater Scaffolding Notes

- Topic introduction: Passwater opens with a table where x: 1, 2, 4, 8 and f(x): 4, 7, 10, 13. Students explain why this is NOT a linear function — the input intervals are unequal (1, 2, 4), so the constant output differences do not guarantee a linear function.
- Key vocabulary (fill-in-the-blank): "For any linear function, the average rate of change over any length input-value interval is constant." Passwater adds: "We often think of this as the slope of the line."
- Concavity definition (fill-in-the-blank): "Concave Up: The average rate of change over equal-length input-value intervals is increasing for all small length intervals." "Concave Down: The average rate of change over equal-length input-value intervals is decreasing for all small length intervals."
- Scaffolding sequence: (1) Complete a table for g(x) = x² at x = −3, −1, 1, 3, 5 (equal-width intervals of 2), (2) compute AROCs for each consecutive interval, (3) observe that AROCs increase by a constant amount (linear pattern), (4) generalize to concavity definitions.
- Common misconception: Students think constant output differences mean the function is linear. Passwater stresses that input intervals must also be equal length.
- Passwater's key move with g(x) = x²: AROCs over [−3,−1], [−1,1], [1,3], [3,5] are −4, 0, 4, 8 — each increases by 4, confirming quadratic behavior.

## Guided Practice

- Example 3 from Passwater: Three tables — determine if each could be linear, quadratic, or neither:
  - a) x: 1, 2, 3, 4 → f(x): 0, 1, 4, 9 → differences: 1, 3, 5 (increasing by 2) → could be quadratic
  - b) x: 1, 2, 5, 10 → g(x): 0, 1, 4, 9 → differences: 1, 3, 5 but unequal input widths → neither (can't determine from unequal intervals)
  - c) x: 1, 3, 5, 7 → h(x): −1, 1, 2, 2 → differences: 2, 1, 0 (decreasing by 1) → could be quadratic (concave down)
- Example 4 from Passwater: Three tables — determine concavity:
  - a) x: 1, 1.1, 1.2, 1.3 → k(x): 4, 1, −1, −2 → differences: −3, −2, −1 (increasing) → concave up
  - b) x: 1, 1.1, 1.2, 1.3 → m(x): 1, 4, 7, 10 → differences: 3, 3, 3 (constant) → linear (neither concave up nor down)
  - c) x: 1, 1.1, 1.2, 1.3 → p(x): 1, 7, 11, 13 → differences: 6, 4, 2 (decreasing) → concave down
- Worksheet B Problem 7: x: 0, 2, 4, 6, 8 → p(x): 0, 5, 8, 9, k. AROCs: 2.5, 1.5, 0.5, (k−9)/2. The differences in AROCs are −1, −1. So (k−9)/2 − 0.5 = −1, giving k = 8.

## Independent Practice Description

- AP-style tasks: Students receive tables with equal-width input intervals and must determine whether the function could be linear, quadratic, or neither by computing successive differences.
- Typical item: "The table shows values of a function g at selected values of x. Based on the table, could g be a linear function? Justify your answer using differences."
- Worksheet A Problem 1: x: 1, 3, 5, 7, 9 → f(x): −2, −5, −4, 1, 10. Differences: −3, 1, 5, 9 (increasing by 4) → could be quadratic (concave up).
- Worksheet A Problem 5: x: 1, 3, 5, 7, 9 → m(x): −2, −2, −2, −2, −2. Differences: 0, 0, 0, 0 → linear (constant function).
- Emphasis: Justify by showing successive differences and whether they are constant (linear) or change by a constant amount (quadratic).

## FRQ Expectations

- FRQ 1 (Function Concepts): Students may be asked to identify function type from a table by computing differences. Claim-and-explanation format: "The function could be quadratic because the second differences are constant."
- FRQ 2 (Modeling a Non-Periodic Context): When building a regression model, students must justify why a linear or quadratic model fits the data by referencing the rate-of-change pattern.
- AP mathematical practices targeted:
  - 1.A: Identify information presented in mathematical or equivalent forms (tables of differences).
  - 3.A: Explain the steps and purpose of mathematical procedures (computing successive differences).
  - 3.C: Justify conclusions using mathematical reasoning (claim about function type with evidence from differences).

## App-Build Notes

- Recommended componentKey: `rate-of-change-calculator`
- Rationale: Topic 1.3 asks students to compute average rates of change over equal-length intervals and observe patterns. The rate-of-change-calculator can display tables, compute successive differences, and visually distinguish linear (constant differences) from quadratic (linearly changing differences) patterns.
- Calculator requirement: Not required. This topic works with table reasoning and arithmetic.
- Graphing needs: Static graphs can support the concavity discussion, but the core task is table-based. No interactive graphing required.
- Phase package daily phases:
  - Warm-Up: "Given f(x) = 3x − 2, compute the AROC over [1,3] and [4,6]. What do you notice?"
  - Topic Introduction: Walk through g(x) = x² table example from Passwater — compute AROCs, observe the linear increase.
  - Scaffolded Examples: Work through Passwater Example 3 (three tables, linear/quadratic/neither) with the class.
  - Guided Practice: Students complete concavity determination for three new tables (Passwater Example 4 format).
  - Independent Practice: Worksheet A Problems 1–6 (identify function type from tables).
  - Exit Evidence: "Given x: 2, 4, 6, 8 → f(x): 3, 7, 13, 21. Could f be quadratic? Justify using differences."
  - CAP Reflection: "What persistence move did you make when the differences didn't form an obvious pattern?"
