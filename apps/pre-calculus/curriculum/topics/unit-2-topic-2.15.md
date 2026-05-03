# Topic 2.15: Semi-log Plots

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.15`
- Learning-objective family: `2.15.A`
- Essential-knowledge family: `2.15.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.15.A: Plot points on semi-log graphs, interpret semi-log plots, create linear models for semi-log plots, and convert between linear semi-log models and exponential models.

## CED Essential Knowledge

- EK 15.A.1: In a semi-log plot, the vertical (y) axis is logarithmically scaled. With a semi-log plot where the y-axis is logarithmically scaled, exponential functions will appear linear. Equally-spaced values on a log-scaled y-axis are proportional (not linear).
- EK 15.A.2: When we "logarithmically scale" the vertical axis, we are NOT changing the actual y-values of the data — only how they are displayed.
- EK 15.A.3: Given exponential model y = a · b^x, the linear model for the semi-log plot is log_n(y) = log_n(a) + x · log_n(b), where slope = log_n(b) and y-intercept = log_n(a). The base n corresponds to the base used for vertical axis scaling.

## Passwater Scaffolding Notes

Passwater introduces semi-log plots as a tool for visualizing exponential data that spans many orders of magnitude. Key insight: exponential data that curves on a normal plot becomes a straight line on a semi-log plot. Scaffolding: (1) plot points on semi-log axes (understanding that y-axis marks are proportional — e.g., 1, 10, 100, 1000), (2) identify which data is exponential by checking linearity on semi-log, (3) write linear models for semi-log plots of the form log_n(y) = log_n(a) + x · log_n(b), (4) convert back to exponential model y = a · b^x. Passwater uses contexts: English American population, Mr. Passwater's joke spreading. Misconception: equally-spaced marks on a log-scaled axis represent multiplicative (not additive) steps; the actual y-values don't change.

## Guided Practice

**Example 1:** English American population on semi-log plot — justify why exponential model is appropriate.
- The plot appears linear on the semi-log scale, which is the signature of exponential data.

**Example 2:** Mr. Passwater's joke spreading — P(t) graphed on semi-log. Which function could model P?
- (A) P(t) = 2 + 2t (linear) — would NOT appear linear on semi-log
- (B) P(t) = 2 + 2^t (exponential with translation) — would appear approximately linear
- (C) P(t) = 2 + 2 log(t) (logarithmic) — would curve on semi-log
- (D) P(t) = 2 · 2^t (exponential) — would appear perfectly linear on semi-log ✓

**Example 3:** Table: x: 1,2,3,4,5 → f(x): 40,60,90,135,203. Which graph on semi-log?
- Ratios: 60/40 = 1.5, 90/60 = 1.5, 135/90 = 1.5, 203/135 ≈ 1.5. Constant ratio → exponential → linear on semi-log.

**Example 4:** Plot on semi-log: A(0,200), B(1,25), C(2,7), D(3.2,800), E(4.6,1.5).
- On the log-scaled y-axis, plot each point at its x-coordinate and at the log-scaled position of its y-value.

**Example 5:** Semi-log plot for Example 3 data:
- (a) Linear model: log(y) = log(a) + x · log(b). Using two points (1, 40) and (5, 203): slope = (log 203 − log 40)/(5 − 1) = log(203/40)/4 = log(5.075)/4. y-intercept = log 40 − slope · 1.
- (b) Convert: b = 10^slope, a = 10^y-intercept. So y = a · b^x.

**Worksheet A — Problem 3:** Table: x: 10,20,30,40,50 → g(x): 30,90,270,810,2430. Which graph on semi-log?
- Ratios: 90/30 = 3, 270/90 = 3, 810/270 = 3, 2430/810 = 3. Constant ratio → exponential → linear on semi-log.

**Worksheet A — Problem 9:** Semi-log plot for g from Problem 3:
- (a) Linear model: log(y) = log(a) + x · log(3). With x = 10, y = 30: log(30) = log(a) + 10 log(3). So log(a) = log(30) − 10 log(3) = log(30/3^10) = log(30/59049). a = 30/59049.
- (b) Exponential model: y = a · 3^x where a = 30/3^10 = 30/59049.

## Independent Practice Description

Students plot points on semi-log axes (A(0,5), B(1,300), C(2,20), D(3,150), E(4,100)), identify which data appears linear on semi-log (indicating exponential data), read coordinates from log-scaled axes, write linear models for semi-log plots, and convert to exponential models. Problem 10 asks about residual plots for exponential regression from semi-log data.

## FRQ Expectations

- FRQ 2 (Modeling Non-Periodic): Reading values from semi-log plots, constructing exponential models from semi-log linear models.
- FRQ 1 (Function Concepts): Interpreting semi-log displays.
- Subskills: plotting on log-scaled axes, identifying exponential data from semi-log linearity, model conversion.
- AP practices: 1.B (interpret semi-log display), 2.A (calculate from log-scaled axes), 3.A (connect normal and semi-log representations).

## App-Build Notes

- Recommended componentKey: `fill-in-the-blank`
- Rationale: Semi-log plot interpretation requires filling in log-scaled coordinates and completing the conversion formula log_n(y) = log_n(a) + x · log_n(b).
- Calculator requirement: Calculator allowed for log computations and regression.
- Graphing needs: Semi-log coordinate plane (logarithmically scaled y-axis) for plotting and interpreting.
- Phase package daily phases:
  - Warm-Up: "What does it mean to 'logarithmically scale' an axis? Does it change the data values?"
  - Topic Introduction: Define semi-log plot; show that exponential data appears linear; equally-spaced marks are proportional.
  - Scaffolded Examples: Examples 1–3 (justify exponential from semi-log, identify exponential data, plot points).
  - Guided Practice: Students plot on semi-log, write linear model for Example 3 data, convert to exponential.
  - Independent Practice: Worksheet A problems 1–10 (plotting, identification, model writing, conversion, residuals).
  - Exit Evidence: "x: 10,20,30,40,50 → g(x): 30,90,270,810,2430. Would this data appear linear on a semi-log plot? Why?"
  - CAP Reflection: "Why does exponential data appear linear on a semi-log plot? What happens to the y-values when you use a log scale?"
