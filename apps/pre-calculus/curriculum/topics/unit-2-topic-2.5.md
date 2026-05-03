# Topic 2.5: Exponential Function Context and Data Modeling

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.5`
- Learning-objective family: `2.5.A`
- Essential-knowledge family: `2.5.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.5.A: Create exponential models from contextual data using two input-output pairs or regression, convert between time units in exponential models, and work with the natural base e.

## CED Essential Knowledge

- EK 2.5.A.1: An exponential model can be constructed from the common ratio and initial value, or from two input-output pairs. If data does not display proportional growth, adding or subtracting a constant from output values may reveal proportional growth, indicating an exponential model with vertical translation.
- EK 2.5.A.2: The natural number e ≈ 2.718 is often used as the base in exponential models of real-world phenomena. Exponential regression (ExpReg) on a graphing calculator produces a model of the form y = a · b^x.
- EK 2.5.A.3: Converting between time units requires recalculating the base of the exponential model. For example, an annual growth rate of 13% yields monthly growth factor b^(1/12).

## Passwater Scaffolding Notes

Passwater introduces the concept that sometimes exponential data doesn't look proportional because of a vertical translation — if subtracting a constant reveals proportional growth, the original function was exponential. Scaffolding moves: (1) tables with non-proportional growth where students find the constant, (2) writing two equations from two data points, (3) solving the system for a and b, (4) TI-84 ExpReg procedure, (5) converting between time units. Passwater uses real-world contexts: stadium fans entering, bacteria growth with natural base e, deer population growth, child malaria deaths, MySpace visitors, TikTok followers, MINI Cooper depreciation. Misconception: converting time units (years to months) is not simply dividing — the base must be recalculated.

## Guided Practice

**Example 1:** Find constants revealing proportional growth:
- a) x: 0,1,2,3,4 → f(x): 7,13,25,49,97. Subtract 1: 6,12,24,48,96 — ratios of 2. Exponential.
- b) x: 0,1,2,3,4 → g(x): 2,10,34,106,322. Subtract 2: 0,8,32,104,320 — ratios of ~4. Exponential.
- c) x: 0,1,2,3,4 → h(x): 63,31,15,7,3. Add 1: 64,32,16,8,4 — ratios of 1/2. Exponential decay.

**Example 2:** Stadium fans — F(t) = a · b^t. 47 fans at t = 2 min, 2602 fans at t = 20 min.
- Equations: 47 = a · b^2 and 2602 = a · b^18. Divide: 2602/47 = b^16 → b = (2602/47)^(1/16).

**Example 4:** Bacteria: B(t) = 17e^(0.31t).
- (a) A(t) = a · b^t is equivalent — b = e^0.31 ≈ 1.363.
- (b) Average rate of change from t = 1 to t = 7: [B(7) − B(1)] / 6.
- (c) Bacteria after 15 hours: B(15) = 17e^(0.31·15).

**Example 5:** Deer population — 50 deer, increases 13% each year. D(t) = a · b^t.
- (a) a = 50, b = 1.13.
- (b) D(6) = 50 · (1.13)^6 ≈ 103.8 deer.
- (c) Monthly: D(m) = 50 · (1.13)^(m/12), so new base k = 1.13^(1/12) ≈ 1.0102.

**Worksheet A — Problem 3:** Alien video: y = 1391(1.07)^m where m is minutes.
- (a) After 2 hours (120 min): y = 1391(1.07)^120.
- (b) Convert to seconds: y = 1391 · b^s. Since 1 min = 60 sec, b^(60) = 1.07, so b = 1.07^(1/60).

## Independent Practice Description

Students create exponential regression models from data tables (child malaria deaths 2006–2018, MySpace daily visitors 2009–2012), predict future values, and convert between time units. Problems require writing two equations from two data points, finding a and b, and converting annual models to monthly or second-based models. Worksheet includes MINI Cooper depreciation ($39,645, depreciates 17%/year) with conversion to monthly model.

## FRQ Expectations

- FRQ 2 (Modeling Non-Periodic): Constructing exponential models from data, interpreting predictions in context.
- Subskills: two-point model construction, time unit conversion, regression interpretation.
- AP practices: 1.B (interpret in context), 2.A (calculate), 3.B (justify model).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Students must understand when and how to apply exponential modeling, including vertical translation detection and time unit conversion.
- Calculator requirement: Calculator allowed for ExpReg and numerical computation.
- Graphing needs: Scatterplot with exponential curve overlay; semi-log transformation visualization.
- Phase package daily phases:
  - Warm-Up: "A population of 100 grows 5% per year. Write D(t) = a · b^t."
  - Topic Introduction: Show tables with non-proportional growth; find constants that reveal proportional growth.
  - Scaffolded Examples: Examples 1–2 (reveal proportional growth, write two equations from two points).
  - Guided Practice: Students create model for stadium fans problem and convert deer model to months.
  - Independent Practice: Worksheet A problems 1–11 (regression, time conversion, vertical translation detection).
  - Exit Evidence: "A bacteria culture has 200 bacteria at t = 1 and 1600 at t = 4. Write two equations for B(t) = a · b^t."
  - CAP Reflection: "Why does converting from years to months require recalculating the base, not just dividing time by 12?"
