# Passwater Unit 1: Polynomial and Rational Functions

Source PDF: `APPC  Unit 1 Passwater.pdf`
Pages: 182
Instructional role: topic introduction, scaffolding, guided practice, independent practice, pacing, and local assessment evidence.
Normalized from: `scripts/extract-curriculum-sources.mjs`, supplemented by full text extraction and per-topic documentation.

## Topic Sequence

| Topic | Title | Notes Pages | Worksheets | Recommended Days |
|-------|-------|------------|------------|-----------------|
| 1.1 | Change in Tandem | 6 | A | 2 |
| 1.2 | Rates of Change | 4 | A, B, C, D, E | 2 |
| 1.3 | Rates of Change in Linear and Quadratic Functions | 6 | A, B, C | 2 |
| 1.4 | Polynomial Functions and Rates of Change | 5 | A, B | 2 |
| 1.5 | Polynomial Functions and Complex Zeros | 6 | A, B, C, D, E | 2–3 |
| 1.6 | Polynomial Functions and End Behavior | 5 | A, B | 1–2 |
| 1.7 | Rational Functions and End Behavior | 5 | A, B | 2–3 |
| 1.8 | Rational Functions and Zeros | 4 | A, B | 1–2 |
| 1.9–1.10 | Rational Functions: Vertical Asymptotes and Holes | 6 | A, B, C | 1–2 each |
| 1.11 | Equivalent Representations of Polynomial and Rational Expressions | 6 | A, B, C | 2–3 |
| 1.12 | Transformations of Functions | 8 | A, B, C, MEGA | 2–3 |
| 1.13 | Function Model Selection and Assumption Articulation | 4 | A, B | 2–3 |
| 1.14 | Function Model Construction and Application | 4 | A, B | 2–3 |

**Total recommended: 24–34 days**

## Unit Guide Structure

The Unit 1 guide (page 1) lists: notes pages, worksheet blanks (A–E per topic), worksheet keys, review station blocks, quizzes, and unit tests. Assessment breaks occur at:
- Topics 1.1–1.3: Review stations + Quiz 1.1–1.3
- Topics 1.1–1.6: Review A–D + Test 1.1–1.6
- Topics 1.7–1.11: Review A–B + Test 1.7–1.11
- Topics 1.1–1.14: Final Unit 1 test

## FRQ Alignment Summary

- FRQ 1 (Function Concepts, calculator required): Topics 1.1–1.12 — interpret graphical/numerical/analytical function information
- FRQ 2 (Modeling a Non-Periodic Context, calculator required): Topics 1.13–1.14 — build and justify polynomial/rational models

---

## Topic 1.1: Change in Tandem

### Notes Content (Pages 3–8, 6 pages)

**Mathematical practices highlighted:** Identify information from multiple representations; construct equivalent representations of functions; describe the characteristics of a function.

**Fill-in-the-blank vocabulary:**
- A **function** is a mathematical relation that maps a set of input values to a set of output values such that each input value is mapped to exactly ___one___ output value.
- The set of input values of a function is called the ___domain___, represented by the ___independent___ variable.
- The set of output values of a function is called the ___range___, represented by the ___dependent___ variable.

**Key conceptual framework:**
- In AP Precalculus, use "Each input has exactly one output" to explain why a relation is a function — do NOT rely solely on the vertical line test.
- A function is **positive** when the graph of f lies above the x-axis (outputs > 0). A function is **negative** when the graph lies below the x-axis (outputs < 0).
- Critical distinction: "f is increasing" is VERY different from "the rate of change of f is increasing."
- Four mathematical representations used throughout the course: graphical, analytical (equations), numerical (tables), and verbal.
- When describing features on graphs, use intervals written with the **input variable** (x).

**Graphical behavior table:**

| Increasing | Decreasing | Concave Up | Concave Down |
|------------|------------|------------|--------------|
| If a < b, then f(a) < f(b) | If a < b, then f(a) > f(b) | The rate of change is increasing | The rate of change is decreasing |

### Worked Examples

- **Example 1:** Empty vase with water pouring in at constant rate. Four graph choices (A–D) for height vs. time. Match real-world scenario to graphical representation.
- **Example 2:** Piecewise function g over [−4, 6]. Identify all intervals where g is increasing.
- **Example 3:** Graph of f with dashed midline, two full cycles, five points A–E labeled. No scale or axes. (i) On interval B to C, which is true about f? Options: positive/negative and increasing/decreasing. (ii) Describe how the rate of change of f is changing. **Key AP note: "On the AP Exam, FRQ3 will appear exactly like this example!"**
- **Example 4:** Same format as Example 3 but on interval A to B.
- **Example 5:** Graph of f on [a, b] with six labeled points A–F. "On which interval is f negative and decreasing?"
- **Example 6–8:** Multiple-choice on rate of change being positive/negative, increasing/decreasing, and concavity on various intervals.

### Worksheet A (Pages 9–12, 4 pages)

- **Problem 1:** Graph of f with dashed midline, two full cycles, five points A–E. (i) Multiple-choice on f being positive/negative and increasing/decreasing on interval C to D. (ii) Describe rate of change on interval C to D.
- **Problem 2:** Same graph format, interval D to E.
- **Problem 3:** Same graph format, interval A to B with different question angle.
- **Problems 4–8:** Graph of function f on [a, b] with six points. Identify intervals where f is negative and decreasing, rate of change statements, concavity questions, intervals where f is increasing and concave down.
- **Problem 9:** Blank graph — student must sketch a function that is (a) positive and increasing, (b) negative and decreasing, (c) has a point where rate of change is zero.

### Pacing

2 class periods recommended. Topic 1.1 notes take 1 period; Worksheet A takes 1 period.

---

## Topic 1.2: Rates of Change

### Notes Content (Pages 13–16, 4 pages)

**Mathematical practices highlighted:** Identify information from multiple representations; describe the characteristics of a function.

**Key conceptual framework (the "roller coaster" analogy):**
- "Rate of change" essentially means "slope." Mentally replace "rate of change" with "slope" whenever you see it.
- In AP Precalculus, we cannot find the rate of change at a given point (that requires calculus). But we must determine if the rate of change at a point is positive, negative, or zero, and compare rates of change at two distinct points.
- Roller coaster analogy: "Going up" = positive rate of change. "Going down" = negative rate of change. At the top of a peak or bottom of a valley, you are changing between going up and down — at that instant, the rate of change is **zero**.
- At a maximum: rate of change of f is positive to the left, zero at the peak, negative to the right.

**Average rate of change formula introduced:** (f(b) − f(a)) / (b − a). Passwater connects this to the secant line before giving the formula.

### Worked Examples

- **Example 1:** Graph of function f in the coordinate plane with three labeled points A, B, C. Determine sign of rate of change at each point.
- **Example 2:** The concept of secant line introduced: "the average rate of change over an interval [a, b] equals the slope of the line connecting (a, f(a)) and (b, f(b))."
- **Example 3:** Compute average rate of change from a table of values.
- **Example 4:** Graph of f always has negative rate of change. Which statement is true?
- **Example 5:** Compare rates of change at two distinct points on a curve — which point has a greater rate of change?
- **Example 6:** Table gives life expectancy of US females at 50-year intervals. "Over which interval is the average rate of change in life expectancy the greatest?" Options: (A) 1800–1850, (B) 1850–1900, (C) 1900–1950, (D) 1950–2000.

### Worksheet A (Pages 17–18, 2 pages)

- **Problems 1–7:** Find average rate of change of given functions over specified intervals. Functions include polynomials and quadratics.
- **Problem 8:** Let n(x) = x² − 4. Average rate of change over [a, b]. Compute and interpret.

### Worksheet B (Pages 19–20, 2 pages)

- **Problems 1–4:** Real-world scenarios — determine if two variables have a positive or negative rate of change. Examples: (1) money in vending machine vs. items remaining, (2) days since flu season vs. people who caught flu, (3) years since 2000 vs. Teslas on the road, (4) miles driven vs. gas remaining.
- **Problem 5:** Let g(x) = 3x³ − 2x + 5. (a) Find g-values at x = 0.5, 0.8, 0.9, 0.99, 1.01, 1.1, 1.2, 1.5 using calculator. (b) Compute average rate of change over [0.5, 1.5], [0.8, 1.2], [0.9, 1.1], [0.99, 1.01]. (c) Based on these, what is the rate of change when x = 1? Give a reason.
- **Problem 6:** Graph of f with four points A, B, C, D. Compare rates of change at each point and rank from least to greatest.

### Worksheets C, D, E

Additional practice with rate of change calculations, comparisons, and interpretations from graphs and tables.

---

## Topic 1.3: Rates of Change in Linear and Quadratic Functions

### Notes Content (Pages 29–34, 6 pages)

**Key conceptual framework:**
- Linear functions: constant rate of change (slope is the same everywhere). The rate of change of the rate of change is zero.
- Quadratic functions: the rate of change itself changes linearly. If you compute average rate of change over equal-width intervals, the differences between successive rates are constant.
- Concavity connection: concave up = rate of change is increasing. Concave down = rate of change is decreasing.

### Worked Examples

- **Example 1:** f(x) = 3x + 7. Show that average rate of change over any interval equals 3 (the slope).
- **Example 2:** g(x) = x². Compute average rate of change over [0,1], [1,2], [2,3], [3,4]. Show the rates are 1, 3, 5, 7 — a linear sequence.
- **Example 3:** Compare graphs of linear and quadratic functions side by side. Identify where each has positive, negative, and zero rate of change.

### Worksheet A (Pages 35–38, 4 pages)

Linear vs. quadratic rate comparison problems. Tables where students compute average rate of change and determine function type.

### Worksheets B–C

Additional comparison and computation practice.

---

## Topic 1.4: Polynomial Functions and Rates of Change

### Notes Content (Pages 39–43, 5 pages)

**Key conceptual framework:**
- Polynomial function: f(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀ where n is a non-negative integer.
- Degree n polynomial has at most n − 1 turning points.
- Leading term aₙxⁿ determines end behavior.

### Worked Examples

- **Example 1:** Given f(x) = 2x⁴ − 3x² + x − 5, identify degree, leading coefficient, and predicted number of turning points.
- **Example 2:** Graph of a cubic function. Describe intervals of increase/decrease and identify local extrema.

### Worksheets A–B

Polynomial feature identification from graphs and equations.

---

## Topic 1.5: Polynomial Functions and Complex Zeros

### Notes Content (Pages 47–52, 6 pages)

**Key conceptual framework:**
- Fundamental Theorem of Algebra: degree n polynomial has exactly n zeros (counting multiplicity, including complex).
- Complex Conjugate Zeros Theorem: if a + bi is a zero, then a − bi is also a zero.
- Rational Root Theorem: possible rational zeros = factors of constant term / factors of leading coefficient.

**Fill-in-the-blank vocabulary:** ___complex___ zeros, ___imaginary___ unit i, ___conjugate___ pairs, ___multiplicity___.

### Worked Examples

- **Example 1:** Given that 2 + i is a zero of f(x) = x³ − 6x² + 13x − 10, find all zeros.
- **Example 2:** Use graphing calculator to verify a cubic with one real zero has two complex zeros.
- **Example 3:** Factor a polynomial completely using known complex zeros.

### Worksheets A–E (5 worksheets)

Extensive practice with complex zeros, conjugate pairs, Fundamental Theorem of Algebra, and polynomial factoring.

---

## Topic 1.6: Polynomial Functions and End Behavior

### Notes Content (Pages 53–57, 5 pages)

**Key conceptual framework:**
- End behavior determined solely by the leading term aₙxⁿ.
- Even degree: both ends same direction. Odd degree: ends opposite directions.
- Positive leading coefficient: right end up. Negative: right end down.

**Fill-in-the-blank:** ___even___/___odd___ degree, ___positive___/___negative___ leading coefficient.

### Worked Examples

- **Example 1:** Describe end behavior of f(x) = −3x⁵ + 2x³ − x + 1 without graphing.
- **Example 2:** Match four polynomial functions to graphs based on end behavior analysis.

### Worksheets A–B

End behavior classification and graph matching.

---

## Topics 1.7–1.10: Rational Functions

### Notes Content (Pages 63–96, ~20 pages across 4 topics)

**Topic 1.7 — End Behavior:**
- Compare degrees of numerator and denominator.
- deg(num) < deg(den): horizontal asymptote y = 0
- deg(num) = deg(den): horizontal asymptote y = ratio of leading coefficients
- deg(num) > deg(den): no horizontal asymptote (oblique asymptote possible)

**Topic 1.8 — Zeros:**
- Zeros occur where numerator = 0 AND denominator ≠ 0.

**Topic 1.9 — Vertical Asymptotes:**
- Occur where denominator = 0 AND numerator ≠ 0.

**Topic 1.10 — Holes:**
- Occur when a factor cancels in numerator and denominator.
- x-coordinate: value making cancelled factor zero.
- y-coordinate: evaluate simplified function at that value.

### Worksheets

- Topic 1.7: Worksheets A–B (end behavior, horizontal asymptote identification)
- Topic 1.8: Worksheets A–B (zero identification with domain restrictions)
- Topics 1.9–1.10: Worksheets A–C (vertical asymptotes, holes, solving rational inequalities)

---

## Topic 1.11: Equivalent Representations

### Notes Content (Pages 69–74, 6 pages)

Polynomial and rational expressions in factored, expanded, and simplified forms. Each representation highlights different features.

### Worksheets A–C

Converting between representations and identifying features from each form.

---

## Topic 1.12: Transformations of Functions

### Notes Content (Pages 77–84, 8 pages)

General form: a · f(b(x − h)) + k. Transformation table with specific rules for vertical/horizontal shifts, stretches, compressions, and reflections.

### Worksheets A–C + MEGA Worksheet

Extensive practice with transformation identification and graphing. The MEGA worksheet (11 pages) covers transformations across all function types studied so far.

---

## Topics 1.13–1.14: Function Modeling

### Notes Content (Pages 85–92, 8 pages)

**TI-84 regression steps documented:**
- How to enter data in lists
- How to run ExpReg, QuadReg, CubicReg, etc.
- How to interpret r² values
- How to graph the regression equation over the data

**Real-world modeling contexts used:**
- Justin Tucker field goal data (quadratic model)
- Amazon stock prices (exponential model)
- Federal Funds Rate (logarithmic model)
- Natural gas production (polynomial model)
- UK doctors per capita (rational function model)

### Worksheets A–B

- **Problem 5 (Worksheet B):** Aligns with FRQ Task Model 2 (Non-Periodic Modeling). Students must construct a model, state assumptions, use the model to predict, and interpret limitations.

---

## Extraction limitations

- Diagrams, graphs, handwritten or embedded mathematical layouts, and some formulas may require manual review against the PDF.
- Page references are approximate and should be verified during lesson authoring.
- This artifact preserves source structure with per-topic instructional detail extracted from the Passwater PDF.
