# Passwater Unit 2: Exponential and Logarithmic Functions

Source PDF: `APPC  Unit 2 Passwater.pdf`
Pages: 100
Instructional role: topic introduction, scaffolding, guided practice, independent practice, pacing, and local assessment evidence.
Normalized from: `scripts/extract-curriculum-sources.mjs`, supplemented by full text extraction and per-topic documentation.

## Topic Sequence

| Topic | Title | Notes Pages | Worksheets |
|-------|-------|------------|------------|
| 2.1 | Arithmetic and Geometric Sequences | 4 (incl. Part II) | A, B |
| 2.2 | Change in Linear and Exponential Functions | 2 | A, B |
| 2.3 | Exponential Functions | 2 | A, B |
| 2.4 | Exponential Function Manipulation | 2 | A |
| 2.5 | Exponential Function Context and Data Modeling | 3 | A |
| 2.6 | Competing Function Model Validation | 4 | A, B |
| 2.7 | Function Composition | 3 | A, B |
| 2.8 | Inverse Functions | 5 | A, B |
| 2.9 | Logarithmic Expressions | 6 | A, B |
| 2.10 | Inverses of Exponential Functions | 2 | A |
| 2.11 | Logarithmic Functions | 2 | A |
| 2.12 | Logarithmic Function Manipulation | 5 | A, B |
| 2.13 | Exponential and Logarithmic Equations and Inequalities | 3 | A, B |
| 2.14 | Logarithmic Function Context and Data Modeling | 7 | A |
| 2.15 | Semi-log Plots | 2 | A |

## FRQ Alignment Summary

- FRQ 1 (Function Concepts, calculator required): Topics 2.7–2.8 — interpret composed and inverse functions
- FRQ 2 (Modeling a Non-Periodic Context, calculator required): Topics 2.5–2.6, 2.14–2.15 — exponential/logarithmic modeling
- FRQ 4 (Symbolic Manipulations, NO calculator): Topics 2.9, 2.12–2.13 — evaluate/rewrite log expressions, solve equations

---

## Topic 2.1: Arithmetic and Geometric Sequences

### Notes Content (4 pages incl. Part II)

**Fill-in-the-blank vocabulary:** A **sequence** is a function from the ___natural___ numbers to the ___real___ numbers. When graphing a sequence, we have points but cannot "connect" them.

**Conceptual framework:**
- Arithmetic sequences behave like **linear functions** (constant difference = constant slope), except discrete.
- Geometric sequences behave like **exponential functions** (constant ratio = constant proportional change), except discrete.
- Arithmetic: a_n = a_0 + d·n or a_n = a_k + d·(n−k)
- Geometric: g_n = g_0 · r^n or g_n = g_k · r^(n−k)
- Part II procedure for finding geometric sequence from two terms: (1) use both terms in general form with larger k as g_n, (2) solve for r, (3) write general form.

### Worked Examples

- **Example 1:** a_n = 4n − 3. Find a_1 (= 1) and a_7 (= 25).
- **Example 2:** Determine if arithmetic: (a) s_n = 2 − 3n (Yes, d = −3), (b) s_n = 6 − 2^n (No), (c) −7, −2, 3, 8, ... (Yes, d = 5), (d) −1, 2, 3, 4, 5... (No, d not constant).
- **Example 3:** a_n arithmetic, a_3 = 8, d = −3. Find a_n and a_12.
- **Example 4:** a_n arithmetic, a_2 = 7, a_6 = 9. Find a_n and a_24.
- **Example 6:** Determine if geometric: (a) s_n = 2·3^n (Yes, r = 3), (b) s_n = (1/4)·2^(−n) (Yes, r = 1/2), (c) 1, 3, 2, 6, 4, 12... (No), (d) −16, −8, −4, −2, −1... (Yes, r = 1/2).
- **Example 7:** g_n geometric, g_1 = 12, r = 2. g_n = 12·2^(n−1); g_4 = 96.
- **Part II Example 3:** g_n geometric, g_3 = −2, g_6 = 128. Find g_n and g_11.
- **Part II Example 4:** g_n geometric, g_2 = 48, g_7 = 1.5. Find g_n and g_11.

### Worksheet A

- Problem 1: 12, 7, 2, −3, −8... (Arithmetic, d = −5)
- Problem 2: −5, 10, −20, 40... (Geometric, r = −2)
- Problem 6: 1, 1, 2, 3, 5, 8, 13... (Neither — Fibonacci)
- Problems 7–18: Find a_n or g_n given various conditions (two terms, single term + d/r, etc.)

---

## Topic 2.2: Change in Linear and Exponential Functions

### Notes Content (2 pages)

**Key framework:** Arithmetic sequences behave like ___linear___ functions; geometric sequences behave like ___exponential___ functions.
- Linear: constant additive change (f(x+1) − f(x) = constant)
- Exponential: constant multiplicative change (f(x+1) / f(x) = constant)

### Worked Examples

- **Example 1:** Table with columns for four functions f, g, h, k. For each, determine if the function could be linear, exponential, or neither. Give a reason.

### Worksheet A

- Problems with tables of values — classify each as linear, exponential, or neither based on constant difference or constant ratio.

### Worksheet B

- More classification problems from tables and real-world contexts.

---

## Topic 2.3: Exponential Functions

### Notes Content (2 pages)

**Key framework:**
- f(x) = a·b^x where a ≠ 0, b > 0, b ≠ 1
- Growth (b > 1) vs. decay (0 < b < 1)
- Domain: all reals. Range: (0, ∞) when a > 0.
- End behavior written as limit statements.

### Worked Examples

- **Example 1:** Write limit statements for end behavior of given exponential functions.
- **Example 2:** Identify growth/decay and initial value from various exponential forms.

### Worksheet A

- Sketch graphs of exponential functions with given properties.
- Evaluate exponential functions at given points.

### Worksheet B

- Graph interpretation: given graph of h, answer questions about domain, range, end behavior, increasing/decreasing.
- **Problem 7:** Graph of exponential function has specific end behaviors — find a possible equation.

---

## Topic 2.4: Exponential Function Manipulation

### Notes Content (2 pages)

**Key framework:**
- Exponent properties: product rule, quotient rule, power rule
- Convert between forms: a·b^x, a·(b^k)^x, a·e^(kx)

### Worked Examples

- Rewrite 4·8^x as a·2^x
- Convert 100·e^(0.03x) to a·b^x form

### Worksheet A

- Exponent rule application and form conversion problems.

---

## Topic 2.5: Exponential Function Context and Data Modeling

### Notes Content (3 pages)

**Key framework:**
- Fit exponential models via regression or by identifying growth/decay pattern
- Interpret parameters: initial value, growth rate, doubling time, half-life
- TI-84 ExpReg steps documented

### Worked Examples

- Population data → exponential model → predict future value
- Half-life problem → decay model → find time for given percentage

---

## Topic 2.6: Competing Function Model Validation

### Notes Content (4 pages)

**Key framework:**
- Residuals: actual − predicted
- Residual plot: if random scatter, model is appropriate; if pattern, model is not appropriate
- Model selection criteria: constant difference → linear, constant ratio → exponential, neither → other

### Worksheets A–B

- Table classification problems with residual analysis
- Model justification in context

---

## Topic 2.7: Function Composition

### Notes Content (3 pages)

**Key framework:**
- (f ∘ g)(x) = f(g(x))
- Not commutative: f(g(x)) ≠ g(f(x)) in general
- Domain: output of g must be in domain of f

### Worked Examples

- f(x) = 2x + 3, g(x) = x². (f ∘ g)(x) = 2x² + 3; (g ∘ f)(x) = (2x + 3)²
- Real-world composition: temperature conversion → wind chill

### Worksheets A–B

- Composition computation, domain determination, real-world interpretation.

---

## Topic 2.8: Inverse Functions

### Notes Content (5 pages)

**Key framework:**
- f⁻¹(x) undoes f(x). f(f⁻¹(x)) = x and f⁻¹(f(x)) = x
- Horizontal line test: one-to-one functions have inverses
- Find inverse: swap x and y, solve for y
- Graph: reflection across y = x
- Domain and range swap

### Worked Examples

- Find inverse of f(x) = 3x − 7 → f⁻¹(x) = (x + 7)/3
- Show f(x) = x² (x ≥ 0) has inverse f⁻¹(x) = √x
- Verify inverses by composition

### Worksheets A–B

- Finding inverses, verifying by composition, domain/range swap, graphing inverse from graph of f.

---

## Topic 2.9: Logarithmic Expressions

### Notes Content (6 pages)

**Key framework:**
- log_b(x) = y means b^y = x
- Common log (log = log₁₀), natural log (ln = log_e)
- Convert between exponential and logarithmic forms
- Evaluate logs without calculator when possible

### Worked Examples

- log₂(8) = 3, log₃(1/9) = −2, log₁₀(1000) = 3
- Convert: 5³ = 125 ↔ log₅(125) = 3

### Worksheets A–B

- Evaluation, conversion, and conceptual problems.

---

## Topic 2.10: Inverses of Exponential Functions

### Notes Content (2 pages)

- Inverse of f(x) = b^x is f⁻¹(x) = log_b(x)
- Graph both on same axes: reflection across y = x
- Domain/range swap: domain of b^x is all reals → range of log is all reals

---

## Topic 2.11: Logarithmic Functions

### Notes Content (2 pages)

- f(x) = log_b(x): domain (0, ∞), range all reals, vertical asymptote x = 0, x-intercept (1, 0)
- Transformations: shifts, stretches, reflections of parent log function

---

## Topic 2.12: Logarithmic Function Manipulation

### Notes Content (5 pages)

**Properties:**
- log_b(MN) = log_b(M) + log_b(N)
- log_b(M/N) = log_b(M) − log_b(N)
- log_b(M^p) = p · log_b(M)
- Change of base formula

**Common misconception:** Rules apply to products, quotients, and powers only — NOT to log(M + N).

### Worked Examples

- Expand log₂(8x³/y) = 3 + 3log₂(x) − log₂(y)
- Condense 3log(x) − log(y) + 2log(z) = log(x³z²/y)

### Worksheets A–B

- Expansion and condensation problems.

---

## Topic 2.13: Exponential and Logarithmic Equations and Inequalities

### Notes Content (3 pages)

**Key framework:**
- Exponential equations: use logs to bring down exponents
- Logarithmic equations: use exponentiation to eliminate logs
- Always check for extraneous solutions (log arguments must be positive)

### Worked Examples

- Solve 3^(2x−1) = 81 → 2x − 1 = 4 → x = 5/2
- Solve log₂(x + 3) + log₂(x − 1) = 5 → (x+3)(x−1) = 32 → x² + 2x − 35 = 0 → x = 5 or x = −7. Check: x = −7 makes log arguments negative → extraneous. Solution: x = 5.

### Worksheets A–B

- Equation solving with extraneous solution checking.

---

## Topic 2.14: Logarithmic Function Context and Data Modeling

### Notes Content (7 pages)

**Real-world contexts:** Sound (decibels), earthquakes (Richter scale), pH, learning curves.
- TI-84 LnReg steps documented

### Worksheet A

- Modeling problems from data tables.

---

## Topic 2.15: Semi-log Plots

### Notes Content (2 pages)

- Semi-log (y-axis log): exponential data appears as a straight line
- Slope on semi-log plot = growth/decay rate
- Used to validate whether data is exponential

---

## Extraction limitations

- Diagrams and graphs require manual review against the PDF.
- Page references are approximate.
- Some pages (10, 12, 20, 38, 44, 58, 78, 84, 94, 100) were blank or graphical in extraction.
