# Topic 1.14: Function Model Construction and Application

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.14`
- Learning-objective family: `1.14.A`
- Essential-knowledge family: `1.14.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.14.A: Construct a function model from real-world data, use it to make predictions, and evaluate the appropriateness of the model for interpolation and extrapolation within and beyond the data's domain.

## CED Essential Knowledge

- EK 1.14.A.1: A regression model can be constructed from a data set using technology. The model's equation can be used to predict output values for input values within the range of the data (interpolation) and beyond it (extrapolation).
- EK 1.14.A.2: Extrapolation beyond the data's domain carries risk because the model may not continue to behave as the real-world situation does. Students must assess whether the model's long-term behavior (end behavior) is consistent with the context.
- EK 1.14.A.3: The residual plot reveals whether a model captures the data's pattern. A random scatter in the residual plot indicates a good fit; systematic patterns indicate a poor fit or a better model type.

## Passwater Scaffolding Notes

- Topic introduction: Passwater teaches Topics 1.13 and 1.14 together as a pair. Topic 1.13 focuses on selection and justification; Topic 1.14 focuses on construction, application, and extrapolation assessment.
- Key vocabulary (fill-in-the-blank): Interpolation, extrapolation, regression equation, prediction, model appropriateness, domain restriction.
- Passwater's approach: Every regression problem includes four components: (1) select and justify model type, (2) write the regression equation, (3) use the model to predict or interpret, (4) assess extrapolation reliability.
- Cubic regression emphasis: Problems 3 and 4 use cubic regression with explicit extrapolation warnings. "Is the cubic model useful for long-term prediction? Explain." Answer: "No, because cubic functions have end behavior of ±∞, which is unrealistic for most real-world quantities."
- Linear regression context: Problem 5 (UK doctors) demonstrates a case where extrapolation is reasonable because the trend is approximately linear and the prediction falls within a reasonable range.
- Scaffolding sequence: (1) Build the regression model from data, (2) use it for interpolation (predict within the data range), (3) use it for extrapolation (predict beyond the data range), (4) critically evaluate whether the extrapolation is reasonable.

## Guided Practice

- Example 1 (baby weight): t: 4, 5, 6, 8, 12 → W(t): 4.2, 4.4, 4.8, 5.1, 5.7.
  - a) Linear regression: W(t) = 0.186t + 3.487.
  - b) Predicted weight at 10 weeks: W(10) = 0.186(10) + 3.487 = 5.347 kg. (Interpolation — 10 is within [4, 12].)
  - c) A sixth baby weighs 5.3 kg. Age: 5.3 = 0.186t + 3.487 → t ≈ 9.7 weeks.
- Example 2: Residual for the 5-week-old baby: W(5)_actual = 4.4, W(5)_predicted = 0.186(5) + 3.487 = 4.417. Residual = 4.4 − 4.417 = −0.017 kg. "The model slightly overestimates the weight."
- Example 3: Baby at 7.5 weeks with residual of −0.7 kg: Predicted = 0.186(7.5) + 3.487 = 4.882. Actual = 4.882 + (−0.7) = 4.182 kg.
- Problem 3 (Federal Funds Rate): t: 0, 1, 2, 3, 5 → R(t): 1.5, 2.5, 1.9, 0.5, 4.5.
  - a) Cubic regression: R(t) = at³ + bt² + ct + d.
  - b) Predicted rate for 2026 (t = 8): extrapolation.
  - c) "Is the cubic model useful for long-term prediction?" No — cubic end behavior is unbounded, but interest rates cannot go to ±∞.
- Problem 4 (Natural gas): t: 0, 10, 22, 30, 37 → N(t): 12.4, 21.8, 20.4, 19.3, 22.6.
  - a) Cubic regression function.
  - b) Predicted consumption for 1967 (t = 7): interpolation.
- Problem 5 (UK female doctors): t: 0, 4, 7, 13, 17, 22, 25 → F(t): 23, 28, 30.5, 36, 42, 47, 50.
  - a) Linear regression is appropriate (approximately constant rate of change).
  - b) Linear regression model.
  - c) Predicted percentage for 2021 (t = 33): extrapolation — reasonable because linear trend continues.
  - d) Actual was 55%. Residual = 55 − predicted. "The model underestimates."

## Independent Practice Description

- AP-style tasks: Students construct regression models from data tables, make predictions (both interpolation and extrapolation), compute residuals, and critically evaluate model appropriateness for long-term use.
- Problem 2 (Amazon stock): t: 0, 1, 13.5, 19, 26.5, 31.5, 35 → A(t): 87.58, 124.15, 164.61, 185.97, 152.60, 122.42, 90.98.
  - c) Predicted price at t = 16 (April 6, 2021): interpolation.
  - d) Actual price was $168.61. Residual = 168.61 − predicted.
- Emphasis: Always state whether a prediction is interpolation or extrapolation. Discuss reliability for extrapolation. Units matter.

## FRQ Expectations

- FRQ 2 (Modeling a Non-Periodic Context): The primary FRQ model for this topic. Full task sequence:
  - (a) Select model type with justification
  - (b) Write regression equation
  - (c) Use model to predict (state interpolation vs. extrapolation)
  - (d) Compute residual and interpret
  - (e) Evaluate model appropriateness — discuss end behavior, domain restrictions, and extrapolation reliability
- AP mathematical practices targeted:
  - 1.A: Execute algebraic and statistical procedures (regression, prediction, residual calculation).
  - 3.A: Explain the steps and purpose (justify interpolation vs. extrapolation).
  - 3.C: Justify conclusions (evaluate model appropriateness, interpret residuals in context).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Topic 1.14 emphasizes interpretation, prediction, and critical evaluation — the "so what?" of modeling. The comprehension-quiz format presents completed regression analyses and asks students to interpret predictions, evaluate extrapolation reliability, and identify model limitations. This mirrors the FRQ 2 task structure.
- Calculator requirement: Graphing calculator required for all regression computations, predictions, and residual plot generation.
- Graphing needs: Students need to see the data scatter plot with the regression curve, residual plot, and prediction point marked. Static or interactive graphs both work.
- Phase package daily phases:
  - Warm-Up: "The model predicts 5.3 kg at 10 weeks. Is this interpolation or extrapolation? How do you know?"
  - Topic Introduction: Define interpolation vs. extrapolation. Discuss when extrapolation is reliable vs. risky.
  - Scaffolded Examples: Work through Passwater Problem 3 (Federal Funds Rate — cubic regression with extrapolation warning).
  - Guided Practice: Students complete Problem 4 (Natural gas — cubic regression, interpolation prediction).
  - Independent Practice: Worksheet A Problem 2 (Amazon stock — full model construction and interpretation) and Problem 5 (UK doctors — linear regression with extrapolation).
  - Exit Evidence: "A cubic model predicts the population will be negative in 2080. What does this tell you about the model's appropriateness?"
  - CAP Reflection: "What persistence move did you make when the residual plot revealed a pattern?"
