# Topic 2.2: Change in Linear and Exponential Functions

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.2`
- Learning-objective family: `2.2.A`
- Essential-knowledge family: `2.2.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.2.A: Determine from a table of values or a graph whether a function is linear, exponential, or neither, and use two data points to construct linear and exponential models for real-world contexts.

## CED Essential Knowledge

- EK 2.2.A.1: Arithmetic sequences behave like linear functions: over equal-length input intervals, output values change at a constant rate based on addition. Geometric sequences behave like exponential functions: over equal-length input intervals, output values change proportionately based on multiplication.
- EK 2.2.A.2: Given two points, the equations of a linear function, exponential function, arithmetic sequence, or geometric sequence can all be written using the same structural patterns: linear uses slope, exponential uses ratios.
- EK 2.2.A.3: The parallel structure between arithmetic↔linear and geometric↔exponential extends to formulas: a_n = a_0 + d·n corresponds to f(x) = b + mx; g_n = g_0 · r^n corresponds to f(x) = a·b^x.
- EK 2.2.A.4: Given two points, the equations of a linear function, exponential function, arithmetic sequence, or geometric sequence can all be written. The choice depends on whether differences or ratios are constant in the data.

## Passwater Scaffolding Notes

Passwater scaffolds by first reviewing the parallel between arithmetic/linear and geometric/exponential using a comparison table. The key distinction: linear functions have constant rate of change (additive — the change in y is m·Δx), while exponential functions have constant proportional change (multiplicative — the change in y is b^Δx). Students practice identifying function type from tables by computing differences (constant = linear) or ratios (constant = exponential). Common misconception: "neither" is always a valid answer — not all data fits linear or exponential patterns (e.g., quadratic data, Fibonacci). Passwater uses real-world contexts (rumor spreading, theater seats, bald eagles) to motivate constructing models from two data points.

## Guided Practice

**Example 1:** Selected values — determine if linear, exponential, or neither:
- a) x: 0,3,6,9,12 → f(x): 7,5,3,1,−1 → Linear (constant difference of −2 every 3 units, slope = −2/3)
- b) x: 1,2,3,4,5 → g(x): 0,1,4,9,16 → Neither (quadratic pattern)
- c) x: 0,2,4,6,8 → h(x): 1,2,4,8,16 → Exponential (constant ratio of 2)
- d) x: 5,10,15,20,25 → k(x): 80,40,20,10,5 → Exponential (constant ratio of 1/2)

**Example 2:** A rumor spreads — 43 people heard it on day 3, 140 on day 6. Geometric sequence model. How many by day 10?
- g_6 = g_3 · r^3 → 140 = 43 · r^3 → r^3 = 140/43 → r ≈ 1.485
- g_10 = 43 · (140/43)^(7/3) ≈ 1012 people.

**Example 3:** Theater seats — arithmetic sequence. Fifth row: 31 seats, eleventh row: 49 seats. Twenty-fifth row?
- d = (49 − 31)/(11 − 5) = 18/6 = 3. a_25 = 31 + 3(25 − 5) = 31 + 60 = 91 seats.

**Worksheet A — Problem 5:** Meme spreading — hour 3: 2500 people, hour 6: 20,000. Geometric model. How many by hour 10?
- r^3 = 20000/2500 = 8, so r = 2. g_10 = 2500 · 2^(10−3) = 2500 · 128 = 320,000 people.

**Worksheet A — Problem 7:** Bald eagle nesting pairs. 1963 (year 0): 417 pairs. 2019 (year 56): 71,400 pairs. Geometric model. How many in 2000 (year 37)?
- 71400 = 417 · r^56 → r = (71400/417)^(1/56). g_37 = 417 · r^37.

## Independent Practice Description

Students receive tables and must determine function type by computing differences or ratios. Real-world problems require constructing arithmetic or geometric sequence models from two data points and predicting future values. Worksheet A includes: x: 0,2,4,6,8 → f(x): 1/2, 2, 8, 32, 128 (exponential, ratio = 4); x: 1,2,3,4,5 → g(x): −1, 0, 2, 5, 9 (neither); x: 10,20,30,40,50 → h(x): 100, 50, 25, 12.5, 6.25 (exponential, ratio = 1/2); x: 1,6,11,16,21 → k(x): −9, −2, 5, 12, 19 (linear, slope = 7/5). Modeling problems include flights modeled by arithmetic sequence (11,750 at 5AM, 22,250 at 11AM, predict at 6PM with n = 18) and bald eagle nesting pairs (417 in 1963, 71,400 in 2019, predict in 2000). Worksheet B includes rabbits (geometric, month 3: 64, month 6: 343, predict month 11) and calculator watches (arithmetic, after 2 hours: 4306, after 7 hours: 15,071, total by hour 12).

## FRQ Expectations

- FRQ 2 (Modeling Non-Periodic): Constructing function models from data, interpreting predictions.
- FRQ 1 (Function Concepts): Identifying function type from tabular or graphical data.
- Subskills: classifying data as linear/exponential/neither, constructing models from two points, making predictions, interpreting in context.
- AP practices: 1.B (interpret in context), 2.A (calculate), 3.B (justify model choice).

## App-Build Notes

- Recommended componentKey: `rate-of-change-calculator`
- Rationale: Students need to compute constant differences and constant ratios from tables to classify functions.
- Calculator requirement: Calculator allowed for regression and decimal computations.
- Graphing needs: Scatterplot to visualize data points and fitted models. Connecting lines for linear data, curve for exponential data.
- Phase package daily phases:
  - Warm-Up: Compute differences for 1, 3, 5, 7, 9 and ratios for 3, 6, 12, 24, 48.
  - Topic Introduction: Present comparison table (arithmetic ↔ linear, geometric ↔ exponential); fill-in-the-blank on constant rate vs. proportional change.
  - Scaffolded Examples: Example 1 (classify from tables), Example 3 (arithmetic model from two points).
  - Guided Practice: Students classify tables from Worksheet A and construct geometric model for rumor problem.
  - Independent Practice: Worksheet A problems 1–7 (classification and modeling), Worksheet B problems 1–6.
  - Exit Evidence: "x: 10,20,30,40,50 → h(x): 100, 50, 25, 12.5, 6.25. Is this linear, exponential, or neither? Justify."
  - CAP Reflection: "What is the difference between constant rate of change and constant proportional change? Give an example of each."
  - Extension: Students compare two data sets — one linear, one exponential — and articulate why the classification differs based on differences vs. ratios.
