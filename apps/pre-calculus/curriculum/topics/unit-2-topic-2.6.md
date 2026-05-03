# Topic 2.6: Competing Function Model Validation

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.6`
- Learning-objective family: `2.6.A`
- Essential-knowledge family: `2.6.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.6.A: Determine whether a linear, quadratic, or exponential model is most appropriate for a set of data by calculating and interpreting residuals and reading residual plots.

## CED Essential Knowledge

- EK 2.6.A.1: A residual equals the actual output value minus the predicted output value. If a model is appropriate, the residual plot should appear without pattern. A clear pattern in the residual plot indicates the model is not appropriate.
- EK 2.6.A.2: Linear models are appropriate when data reveals a relatively constant rate of change. Quadratic models fit when rates of change increase or decrease at a constant rate (U-shaped pattern). Exponential models fit when output values are roughly proportional and successive outputs result from repeated multiplication.
- EK 2.6.A.3: Context matters — sometimes one direction of error (overestimate or underestimate) is more costly or meaningful than the other.

## Passwater Scaffolding Notes

Passwater introduces residual = Actual − Predicted as the key diagnostic tool. Students learn to: (1) sketch scatterplots and determine model type from the pattern, (2) compute residuals for a linear model, (3) interpret residual plots (no pattern = appropriate; pattern = inappropriate). Scaffolding moves: first classify data visually from scatterplots, then compute residuals numerically, then interpret residual plots. Passwater uses real-world contexts: newborn baby weight (linear), world population (linear), Mr. Passwater's mural (quadratic — area = πr²), mutual fund growth (exponential, ~10.4%/year). Misconception: not every dataset fits neatly into one category — "neither" is valid.

## Guided Practice

**Example 1:** Sketch scatterplots and determine model:
- a) x: 0,2,4,6,8 → f(x): 11,8.2,5,2.3,−1 → Linear (constant difference ~−1.5 per 2 units)
- b) x: −1,1.5,4,6.5,9 → g(x): 2,5.5,10.5,5.75,2.25 → Quadratic (U-shape)
- c) x: 1,3,5,7,9 → h(x): 10,5.2,2.4,1.3,0.7 → Exponential (proportional decrease)
- d) x: −2,1,4,7,10 → k(x): 2,3,4.5,6.75,10.25 → Exponential (ratio ≈ 1.5)

**Example 2:** Newborn baby weight — linear model. t: 0,1,2,3,4 → W(t): 3.2,4.2,5.1,5.8,6.4.
- (a) Linear regression: y = a + bx
- (b) Predict at t = 2.5 months
- (c) Actual = 5.5 kg. Residual = 5.5 − predicted. If predicted > 5.5, residual is negative (overestimate); if predicted < 5.5, residual is positive (underestimate).

**Example 4:** Three residual plots (linear, quadratic, exponential). Which model most appropriate?
- Answer: the residual plot showing no pattern indicates the appropriate model.

**Example 5:** Mr. Passwater's mural — circles of radius r, paint needed in quarts.
- (a) Quadratic model (paint proportional to area = πr²).
- (b) Model should underestimate — safer to have extra paint than not enough.

**Worksheet A — Problem 3:** x: 1,3,5,7,9 → h(x): 9,7.1,1,7.2,9.1 → Quadratic (U-shape pattern).

**Worksheet A — Problem 10:** Mutual fund grows ~10.4%/year → Exponential (proportional growth).

## Independent Practice Description

Students classify data from tables as linear, quadratic, exponential, or neither, compute residuals, and interpret residual plots. Worksheet A includes: world population 1950–2020 with linear regression, residual computation, and interpretation; scatterplots paired with residual plots to determine which model was used and whether it is appropriate. Problem 11 asks: after creating an exponential model, what should the residual plot show?

## FRQ Expectations

- FRQ 2 (Modeling Non-Periodic): Selecting appropriate model type, computing and interpreting residuals.
- Subskills: residual calculation, residual plot interpretation, model justification based on context.
- AP practices: 1.B (interpret residuals), 3.B (justify model choice), 3.C (connect residual pattern to model appropriateness).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Students must demonstrate conceptual understanding of when each model type is appropriate and how to read residual plots.
- Calculator requirement: Calculator allowed for regression and residual computation.
- Graphing needs: Scatterplot with fitted curve; residual plot display.
- Phase package daily phases:
  - Warm-Up: "What is a residual? If actual = 5.5 and predicted = 5.2, what is the residual?"
  - Topic Introduction: Define residual, present the three model types with their data signatures.
  - Scaffolded Examples: Examples 1–2 (classify from scatterplot, compute residuals for linear model).
  - Guided Practice: Students classify data from Worksheet A problems 1–4 and interpret residual plots.
  - Independent Practice: Worksheet A problems 1–11 (classification, regression, residual interpretation).
  - Exit Evidence: "A residual plot for an exponential model shows a clear U-shaped pattern. What does this tell you?"
  - CAP Reflection: "Why does a pattern in the residual plot indicate the model is inappropriate?"
