# Lesson 1-11 — Equivalent Representations of Polynomial and Rational Expressions

Unit: 1
Topic: 1.11
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

You can describe a rational function three ways: its **factored form** (revealing zeros, holes, and VAs), its **expanded form** (standard polynomial division), or its **graph**. Given the graph of a rational function, can you reconstruct its factored equation? Given an equation, can you identify all features and sketch the graph? Today we build fluency moving between all three representations — and learn long division to find slant asymptotes.

## Vocabulary

### Section: text

- **Factored form** — A rational expression written as products of linear factors in numerator and denominator.
- **Expanded form** — Polynomials written in standard form with all terms distributed.
- **Long division** — A procedure for dividing polynomials: [f(x) / g(x) = q(x) + r(x) / g(x)], where [q] is the quotient and [r] is the remainder with degree less than [g].
- **Slant asymptote** — A non-vertical, non-horizontal asymptote given by the quotient [q(x)] when the numerator degree exceeds the denominator degree by exactly 1.
- **Binomial Theorem** — [ (a + b)ⁿ = Σ C(n, r) · aⁿ⁻ʳ · bʳ ], providing coefficients from Pascal's Triangle.

## Learn

### Section: text

**EK 1.11.A.1:** A rational function in factored form reveals zeros, holes, and vertical asymptotes. The same function in expanded form or as a graph conveys the same information differently.

**EK 1.11.A.2:** Long division produces [f(x) / g(x) = q(x) + r(x) / g(x)]. The quotient [q(x)] gives the **slant asymptote** when the numerator degree exceeds the denominator degree by exactly 1.

### When Does a Slant Asymptote Exist?

A slant asymptote exists when [deg(numerator) = deg(denominator) + 1]. Perform long division; the quotient [q(x)] (ignoring the remainder) is the slant asymptote.

### The Binomial Theorem and Pascal's Triangle

[ (a + b)⁰ = 1 ]
[ (a + b)¹ = a + b ]
[ (a + b)² = a² + 2ab + b² ]
[ (a + b)³ = a³ + 3a²b + 3ab² + b³ ]

Each row of Pascal's Triangle gives the coefficients. Note: [C(n, r) = n! / (r!(n-r)!)] — you will not need this formula on the AP exam.

## Worked Example

### Section: text

**Example 1:** Analyze [h(x) = (x² - 4) / (x² + 7x + 10)].

Factor: [(x - 2)(x + 2) / ((x + 2)(x + 5))].

- Cancel [(x + 2)] → hole at [x = -2]. Simplified value: [(-4) / (3)].
- VA at [x = -5] (remaining denominator zero).
- Zero at [x = 2] (remaining numerator factor).

**Example 2:** Use long division to find the slant asymptote of [h(x) = (x² + 6x + 5) / (2x + 1)].

Divide [x² + 6x + 5] by [2x + 1]:

- Quotient term 1: [x² / 2x = x/2]. Multiply: [x/2 · (2x + 1) = x² + x/2]. Subtract: [6x - x/2 = 11x/2].
- Quotient term 2: [11x/2 / 2x = 11/4]. Multiply: [11/4 · (2x + 1) = 11x/2 + 11/4]. Subtract: [5 - 11/4 = 9/4].

Result: [h(x) = x/2 + 11/4 + (9/4) / (2x + 1)]. Slant asymptote: [y = x/2 + 11/4].

**Example 3:** Expand [(x + 2)⁵] using Pascal's Triangle.

Row 5: 1, 5, 10, 10, 5, 1.

[(x + 2)⁵ = x⁵ + 5x⁴(2) + 10x³(4) + 10x²(8) + 5x(16) + 32]
[ = x⁵ + 10x⁴ + 40x³ + 80x² + 80x + 32]

## Guided Practice

### Section: text

**Problem 1:** Use long division to find the slant asymptote of [f(x) = (x² - 6x + 7) / (x - 1)].
*Hint:* Divide [x² - 6x + 7] by [x - 1]. The quotient (without remainder) is your slant asymptote.

**Problem 2:** What is the coefficient of the [x⁴] term when [(x + 5)⁶] is expanded?
*Hint:* Use [C(6, 2) · 5²]. The [x⁴] term pairs [a⁴] with [b²].

**Problem 3:** Analyze [d(x) = (2x² + 4x + 1) / (2x - 1)]. Does it have a horizontal asymptote, slant asymptote, or neither? How many VAs? How many holes?
*Hint:* Compare degrees: numerator degree 2, denominator degree 1.

## Independent Practice

### Section: text

**Problem 1:** For [f(x) = (x² + x - 2) / (x² - 2x - 3)], provide: factored form, zeros, holes, VAs, horizontal asymptotes, domain, and a sketch.

**Problem 2:** Use long division to find the slant asymptote of [r(x) = (2x² + 4x + 7) / (6x - 5)].

**Problem 3:** Given a graph of a rational function with a zero at [x = -1], a hole at [x = 3], a VA at [x = 2], and a horizontal asymptote at [y = 1], write a possible equation in factored form.

## Reflection

### Section: text

**Exit Ticket:** Use long division to find the slant asymptote of [f(x) = (2x² + 3x - 1) / (x + 4)].

**Lesson Summary:** Rational functions can be represented in factored form, expanded form, or as a graph. Long division reveals slant asymptotes when the numerator is one degree higher than the denominator. The Binomial Theorem with Pascal's Triangle provides a systematic way to expand binomials. Fluency across all representations is essential for AP Precalculus.
