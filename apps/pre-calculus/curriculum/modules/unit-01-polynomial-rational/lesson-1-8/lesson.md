# Lesson 1-8 — Rational Functions and Zeros

Unit: 1
Topic: 1.8
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider the rational function [f(x) = (x - 2) / ((x + 6)(x - 3))]. Before doing any algebra, predict: where is this function equal to 0? Where is it undefined? Compare your answers with a partner. Recall from Topic 1.5 how sign charts helped you solve polynomial inequalities. What changes when the expression is a fraction instead of a polynomial?

## Vocabulary

### Section: text

- **Rational function** — A function of the form [f(x) = g(x) / h(x)] where both [g(x)] and [h(x)] are polynomials.
- **Zeros (of a rational function)** — The x-values where [g(x) = 0], making [f(x) = 0].
- **Undefined values** — The x-values where [h(x) = 0], making division by zero; these are excluded from the domain.
- **Sign chart** — A number line diagram that tracks the sign of an expression across intervals determined by critical values.
- **Domain restriction** — Values excluded from the domain because the denominator equals zero.

## Learn

### Section: text

A rational function [f(x) = g(x) / h(x)] has two important traits when [g(x)] and [h(x)] have no factors in common:

1. [f(x)] has **zeros** when [g(x) = 0].
2. [f(x)] is **undefined** when [h(x) = 0].

**EK 1.8.A.1:** Zeros come from the numerator; undefined values come from the denominator.

**EK 1.8.A.2:** When solving rational inequalities, both the zeros and the undefined values must be identified and placed on a sign chart.

**EK 1.8.A.3:** Values where the denominator equals zero are excluded from the domain and must **never** be included in the solution set of a rational inequality.

### Passwater's 7-Step Method for Rational Inequalities

1. Get 0 on one side of the inequality.
2. Write as a single fraction [g(x) / h(x)].
3. Set [g(x) = 0] and [h(x) = 0] to find critical values (factor!).
4. Create a sign chart with all critical values.
5. Mark [h(x) = 0] values — these are **never** included.
6. Test a value in each interval to determine the sign.
7. Interpret the sign chart and write the solution in interval notation.

## Worked Example

### Section: text

**Example 1:** Solve [(x - 2) / ((x + 6)(x - 3)) ≥ 0].

**Step 1:** Numerator zero: [x - 2 = 0], so [x = 2]. Denominator zeros: [x + 6 = 0] gives [x = -6]; [x - 3 = 0] gives [x = 3].

**Step 2:** Build the sign chart with critical values [-6, 2, 3]. Test the intervals:

- [(-∞, -6)]: test [x = -7] → [(-)(-)(-)] = negative
- [(-6, 2)]: test [x = 0] → [(-)(+)(-)] = positive
- [(2, 3)]: test [x = 2.5] → [(+)(+)(-)] = negative
- [(3, ∞)]: test [x = 4] → [(+)(+)(+)] = positive

**Step 3:** Include [x = 2] (numerator zero, satisfies [≥ 0]). Exclude [x = -6] and [x = 3] (undefined). Solution: [(-∞, -6) ∪ [2, 3)].

**Example 2:** Solve [(x² - 4) / (x² - 10x + 25) < 0].

Factor: [(x - 2)(x + 2) / (x - 5)² < 0]. Numerator zeros: [x = -2, 2]. Denominator zero: [x = 5] (excluded).

Sign chart values: [-2, 2, 5]. Testing intervals shows the expression is negative on [(-2, 2)]. Solution: [(-2, 2)].

## Guided Practice

### Section: text

**Problem 1:** Solve [((x - 1)(x + 2)²) / (x - 2) ≥ 0].
*Hint:* Identify numerator zeros at [x = 1] and [x = -2] (even multiplicity). The denominator zero at [x = 2] is never included. At [x = -2], the even multiplicity means the expression equals 0 (included in [≥ 0]).

**Problem 2:** Solve [1 / (x - 1)² ≤ 0].
*Hint:* Is [(x - 1)²] ever negative? What does that tell you about the solution?

**Problem 3:** Find the zeros of [y = (3x² + x - 2) / ((x - 1)(x + 5))].
*Hint:* Factor the numerator: [3x² + x - 2 = (3x - 2)(x + 1)]. Set each factor to zero and check that these values don't make the denominator zero.

## Independent Practice

### Section: text

**Problem 1:** Solve [(2x) / (x + 1) < 0]. Identify all zeros and undefined values, build a sign chart, and write the solution in interval notation.

**Problem 2:** Find the zeros of [f(x) = (x² - 9) / (x² - 2x - 15)]. *Hint:* Factor both numerator and denominator. Watch for factors that cancel.

**Problem 3:** Solve [(x + 4) / (x - 2) ≤ 0]. Show your sign chart and explain why each endpoint is included or excluded.

## Reflection

### Section: text

**Exit Ticket:** Solve [(x + 4) / (x - 2) ≤ 0]. Show your sign chart with all critical values marked.

**Lesson Summary:** Rational functions have zeros where the numerator equals zero and are undefined where the denominator equals zero. When solving rational inequalities, both sets of values go on the sign chart — but undefined values are always excluded from the solution. Use open circles on the sign chart for undefined values and test each interval carefully.
