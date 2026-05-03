# Topic 2.14: Logarithmic Function Context and Data Modeling

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.14`
- Learning-objective family: `2.14.A`
- Essential-knowledge family: `2.14.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.14.A: Create logarithmic models from contextual data using two points or calculator regression, interpret logarithmic models in context, and convert between equivalent forms.

## CED Essential Knowledge

- EK 14.A.1: A logarithmic model is appropriate when input values change proportionally over equal-length output-value intervals. A logarithmic function model has the form y = a + b ln(x) or y = a + b log(x), where a and b are constants and b ≠ 0.
- EK 14.A.2: Many real-world scenarios follow logarithmic patterns — earthquake measurement (Richter scale), sound (decibels), acidity (pH), salaries vs. experience. Logarithmic models show large initial rates of change that gradually decrease.
- EK 14.A.3: Logarithmic models can be constructed by writing two equations from two data points and solving the system, or by using calculator regression (LnReg or LogReg).

## Passwater Scaffolding Notes

Passwater uses real-world contexts to motivate logarithmic modeling: pastor salaries increase as church size increases, but the rate of increase slows. Sound intensity in decibels follows a logarithmic scale. The Lillie Empirical Formula connects earthquake magnitude to displacement. Scaffolding: (1) write two equations from two data points for L(x) = a + b ln x (e.g., x = 2 → L = 3, x = 5 → L = 7), (2) solve the system for a and b, (3) use regression on real data (church size vs. salary), (4) interpret predictions in context. Misconception: logarithmic growth is the opposite of exponential — fast initial growth that slows. Using regression vs. solving the system of two equations — both valid approaches.

## Guided Practice

**Example 1:** L(x) = a + b ln x. Table: x = 2 → L = 3, x = 5 → L = 7.
- (a) Two equations: 3 = a + b ln(2) and 7 = a + b ln(5)
- (b) Subtract: 4 = b(ln 5 − ln 2) = b ln(5/2). So b = 4/ln(5/2) ≈ 4/0.916 ≈ 4.366. Then a = 3 − b ln 2 ≈ 3 − 4.366(0.693) ≈ −0.026.

**Example 2:** Church size vs. pastor salary data: 75→42, 120→58, 250→70, 300→79, 450→88, 650→95, 900→110, 1500→125, 2500→138, 5000→175.
- (a) Logarithmic regression: S(p) = a + b ln(p).
- (b) Predicted salary for church size 500: S(500) = a + b ln(500).

**Example 3:** Sound intensity (decibels): β(I) = a + b log(I).
- Traffic: I = 5 × 10⁻⁵ → β = 70 dB. Concert: I = 1 → β = 120 dB.
- (a) Two equations: 70 = a + b log(5 × 10⁻⁵) and 120 = a + b log(1)
- (b) Since log(1) = 0: 120 = a. Then 70 = 120 + b log(5 × 10⁻⁵) → b = −50/log(5 × 10⁻⁵) = −50/(log 5 + log 10⁻⁵) = −50/(0.699 − 5) = −50/(−4.301) ≈ 11.626.
- (c) Predict decibels for I = 10⁴: β(10⁴) = 120 + 11.626 · log(10⁴) = 120 + 11.626 · 4 = 120 + 46.5 = 166.5 dB.

**Worksheet A — Problem 1:** f(x) = a + b ln x. Table: x = 1 → 2, x = 6 → 10.
- 2 = a + b ln(1) = a + 0 → a = 2. Then 10 = 2 + b ln(6) → b = 8/ln(6) ≈ 4.463.

**Worksheet A — Problem 5:** Lillie Empirical Formula — earthquake magnitude.
- Magnitude 9.5 → displacement 21 microns; magnitude 7.0 → displacement 180 microns.
- (a) Two equations: 9.5 = a + b ln(21) and 7.0 = a + b ln(180)
- (b) Subtract: 2.5 = b(ln 21 − ln 180) = b ln(21/180) = b ln(7/60). b = 2.5/ln(7/60) ≈ 2.5/(−2.14) ≈ −1.168. a = 9.5 − b ln 21.
- (c) Displacement 300,000,000 microns: M = a + b ln(3 × 10⁸).

## Independent Practice Description

Students create logarithmic models from two data points: f(x) = a + b ln x with x = 1 → 2, x = 6 → 10; g(x) = a + b ln x with x = 3 → 11, x = 10 → 14.5; h(x) = a + b log x with x = 1 → −2, x = 16 → 3. They use regression for real datasets (downloads, earthquake data) and interpret predictions. The Lillie Empirical Formula problem requires predicting magnitude for the largest recorded earthquake (displacement 300,000,000 microns).

## FRQ Expectations

- FRQ 2 (Modeling Non-Periodic): Constructing logarithmic models from data, interpreting predictions in context.
- Subskills: two-point model construction, regression, contextual interpretation, equivalent form conversion.
- AP practices: 1.B (interpret in context), 2.A (calculate), 3.B (justify model choice).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Students must understand when a logarithmic model is appropriate and how to construct/interpret one.
- Calculator requirement: Calculator allowed for LnReg/LogReg and solving systems.
- Graphing needs: Scatterplot with logarithmic curve overlay.
- Phase package daily phases:
  - Warm-Up: "If salaries increase quickly at first then slow down, is this exponential or logarithmic growth?"
  - Topic Introduction: Present logarithmic model form y = a + b ln(x); show real-world examples (sound, earthquakes, salaries).
  - Scaffolded Examples: Examples 1–3 (two-point construction, regression, sound intensity).
  - Guided Practice: Students create model for L(x) = a + b ln x with x = 2 → L = 3, x = 5 → L = 7.
  - Independent Practice: Worksheet A problems 1–5 (two-point models, regression, Lillie formula).
  - Exit Evidence: "f(x) = a + b ln x. Given f(1) = 2 and f(6) = 10, write two equations and find a."
  - CAP Reflection: "How does logarithmic growth differ from exponential growth? Give a real-world example of each."
