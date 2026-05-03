# Topic 1.13: Function Model Selection and Assumption Articulation

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.13`
- Learning-objective family: `1.13.A`
- Essential-knowledge family: `1.13.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.13.A: Select an appropriate function type to model a given data set, justify the selection using characteristics of the data, and articulate the assumptions and limitations of the chosen model.

## CED Essential Knowledge

- EK 1.13.A.1: Model selection depends on the behavior of the data: linear models fit data with approximately constant rates of change; quadratic models fit data with linearly changing rates of change; cubic and higher-degree polynomial models fit data with more complex curvature.
- EK 1.13.A.2: Residuals (actual minus predicted values) measure how well a model fits the data. A residual plot with no pattern suggests a good model fit; a pattern in the residuals suggests the model is inappropriate.
- EK 1.13.A.3: All models have domain restrictions and assumptions. Students must articulate what the model assumes about the context and identify when the model breaks down.

## Passwater Scaffolding Notes

- Topic introduction: Passwater frames modeling as "a major component of the AP Precalculus curriculum and will be revisited throughout the course." In Unit 1, students work with linear, quadratic, cubic, quartic, and rational regression models.
- Key vocabulary (fill-in-the-blank): Regression, model, residual (Actual Value − Predicted Value = y − ŷ), residual plot, interpolation, extrapolation.
- TI-84 procedure (scaffolded): Step 1: Press "stat" → "1: Edit" → enter data in L1 (x) and L2 (y). Step 2: "stat" → "CALC" → select model. Tip: For Store RegEQ, enter Y1.
- Model selection framework: Students must answer "Which function type best models: linear, quadratic, cubic, or rational? Explain." before computing the regression. Justification references the rate-of-change pattern from Topics 1.3–1.4.
- Residual interpretation (fill-in-the-blank): "The difference between an actual value and the value predicted by a model is called a residual." Residual = Actual − Predicted. A positive residual means the model underestimates; a negative residual means the model overestimates.
- Passwater's residual plot procedure: Step 1: "2nd" + "y=" → statplot menu. Step 2: Xlist: L1, Ylist: RESID. Step 3: Zoom → 9: ZoomStat.
- Scaffolding sequence: (1) Examine a data table, (2) compute or estimate successive differences to determine model type, (3) justify the choice in writing, (4) compute the regression on calculator, (5) interpret the residual for a specific data point.

## Guided Practice

- Example 1: t (age in weeks): 4, 5, 6, 8, 12 → W(t) (weight in kg): 4.2, 4.4, 4.8, 5.1, 5.7.
  - a) Linear regression model equation.
  - b) Predicted weight at 10 weeks.
  - c) A sixth baby weighs 5.3 kg. What is the age? (Use the model to solve for t.)
- Example 2: Using the model from Example 1, "What is the residual for the baby that is 5 weeks old? Interpret." W(5)_predicted − W(5)_actual. Interpretation: "The model overestimates/underestimates the weight by ___ kg."
- Example 3: "A baby that was 7.5 weeks old had a residual of −0.7 kg. What was the actual weight?" Actual = Predicted + Residual.
- Example 5: x: 0, 0.4, 0.9, 1.2, 1.7, 2.2, 2.9, 3.4 → y: 5, 10.6, 15.4, 17.1, 18.0, 16.5, 10.2, 2.8.
  - a) Which function type best models? Data rises then falls — suggests quadratic or cubic. Explain using rate-of-change pattern.
  - b) Write the regression model equation.
- Example 6: x: 0.3, 1.6, 3.2, 4.7, 7.1, 8.8, 10.3 → y: 0.9, 3.3, 4.9, 5.7, 6.5, 7.0, 7.1.
  - (i) Using logarithmic regression: f(x) = a + b·ln(x).
  - (ii) Residual plot coordinates of labeled point R.
  - (iii) Does the residual for R indicate the model underestimates or overestimates?

## Independent Practice Description

- AP-style tasks: Students receive real-world data tables and must (a) justify model type, (b) compute regression, (c) use the model to predict, (d) compute and interpret residuals.
- Problem 1 (Justin Tucker kickoff): t: 0.1, 0.5, 0.9, 1.5, 1.9, 2.3, 2.6 → H(t): 1.4, 5.7, 8.4, 9.6, 8.4, 5.6, 2.5. "Linear, quadratic, or cubic? Reason?" (Rise then fall → quadratic.)
- Problem 2 (Amazon stock): t: 0, 1, 13.5, 19, 26.5, 31.5, 35 → A(t): 87.58, 124.15, 164.61, 185.97, 152.60, 122.42, 90.98. "Linear, quadratic, or cubic?" (Rise then fall → cubic or quadratic.)
- Problem 5 (UK female doctors): t: 0, 4, 7, 13, 17, 22, 25 → F(t): 23, 28, 30.5, 36, 42, 47, 50. "Explain why linear regression is appropriate." (Approximately constant rate of change.)
- Emphasis: Justify model selection BEFORE computing regression. Always interpret residuals in context.

## FRQ Expectations

- FRQ 2 (Modeling a Non-Periodic Context): This is the primary FRQ alignment. Students receive a real-world data set and must:
  - (a) Identify the appropriate model type with justification
  - (b) Write the regression equation
  - (c) Use the model to predict or interpret
  - (d) Compute and interpret a residual
  - (e) Discuss model limitations or assumptions
- AP mathematical practices targeted:
  - 1.A: Execute algebraic and statistical procedures (compute regression, calculate residuals).
  - 3.A: Explain the steps and purpose (justify model selection).
  - 3.C: Justify conclusions (interpret residuals and articulate model assumptions).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Topic 1.13 emphasizes justification and interpretation over computation. The comprehension-quiz format presents data tables and asks students to select the best model type and justify — the core AP skill for this topic. Multiple-choice items test model selection; free-response items test justification.
- Calculator requirement: Graphing calculator required for all regression computations and residual plots.
- Graphing needs: Students need to see data plotted with the regression curve overlaid. Residual plots are essential for evaluating model fit.
- Phase package daily phases:
  - Warm-Up: "Here's a table with 5 data points. Looking at the differences, does this look linear or curved?"
  - Topic Introduction: Define regression, residuals, and residual plots. Walk through the TI-84 procedure.
  - Scaffolded Examples: Work through Passwater Example 1 (linear regression, predict, residual) with the class.
  - Guided Practice: Students complete Example 5 (model selection from scatter pattern, compute regression).
  - Independent Practice: Worksheet A Problem 1 (Justin Tucker data — select model, compute, interpret) and Problem 5 (UK doctors — linear justification).
  - Exit Evidence: "Given this data table, which model type is most appropriate? Justify in one sentence."
  - CAP Reflection: "What adaptability move did you make when the scatter plot didn't clearly match one model type?"
