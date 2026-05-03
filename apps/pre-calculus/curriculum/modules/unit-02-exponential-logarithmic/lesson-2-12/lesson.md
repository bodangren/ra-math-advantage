# Lesson 2-12 — Logarithmic Function Manipulation

Unit: 2
Topic: 2.12
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Since logarithmic expressions can be written in exponential form, the properties of exponents translate directly into properties of logarithms.

Recall: [b^m cdot b^n = b^{m+n}]. Now let [x = b^m] and [y = b^n], so [m = log_b(x)] and [n = log_b(y)]. Then [b^m cdot b^n = b^{m+n}] becomes [xy = b^{m+n}], which means [log_b(xy) = m + n = log_b(x) + log_b(y)].

Use the same reasoning with [frac{x}{y} = b^{m-n}] and [x^n = b^{mn}] to derive:
- [log_b(frac{x}{y}) = log_b(x) - log_b(y)]
- [log_b(x^n) = n cdot log_b(x)]

These are the **Product**, **Quotient**, and **Power** properties of logarithms.

## Vocabulary

### Section: text

- **Product Property**: [log_b(xy) = log_b(x) + log_b(y)] — the log of a product equals the sum of the logs.
- **Quotient Property**: [log_b(frac{x}{y}) = log_b(x) - log_b(y)] — the log of a quotient equals the difference of the logs.
- **Power Property**: [log_b(x^n) = n cdot log_b(x)] — the exponent comes out front as a coefficient.
- **Change of Base**: [log_a(x) = frac{log_b(x)}{log_b(a)}] — all logarithmic functions are vertical dilations of each other.
- **Horizontal dilation / vertical translation equivalence**: [log(cx) = log(c) + log(x)] — a horizontal dilation of a log function is equivalent to a vertical translation.

## Learn

### Section: text

**Expanding** a logarithm means writing it as a sum or difference of simpler logarithms. **Condensing** means combining multiple logarithms into a single expression.

**Condensing rules:**
- Sums of logs become logs of products: [log_b(x) + log_b(y) = log_b(xy)]
- Differences of logs become logs of quotients: [log_b(x) - log_b(y) = log_b(frac{x}{y})]
- Coefficients become exponents: [n cdot log_b(x) = log_b(x^n)]

**Common misconceptions:**
- [log(a + b) ne log(a) + log(b)] — you can only split **products**, not sums.
- [log(x^2) = 2 log(x)], NOT [(log x)^2].

**Change of base and vertical dilation:** Since [log_a(x) = frac{log_b(x)}{log_b(a)}], every log function is a vertical scaling of every other. For example, [log_4(x) = frac{log_9(x)}{log_9(4)}], so [log_4] is [log_9] scaled by [frac{1}{log_9(4)} = log_4(9)].

**Horizontal dilation as vertical translation:** [log(6x) = log(6) + log(x)], so the function [f(x) = log(6x)] is just [g(x) = log(x)] shifted up by [log(6) approx 0.778].

## Worked Example

### Section: text

**Example 1:** Condense to a single logarithm.
- a) [log_4(x) + log_4(y) = log_4(xy)]
- b) [log_3(5) - log_3(z) = log_3(frac{5}{z})]
- c) [2 log_2(x) - 3 log_2(y) = log_2(frac{x^2}{y^3})]
- d) [2 log_7(a) - 5 log_7(b) + log_7(4) = log_7(frac{4a^2}{b^5})]
- e) [6 + 2 log(x) = log(10^6 x^2)]

**Example 2:** Which is equivalent to [log_3(frac{x^2}{y})]?
- (A) [log_3(2x) - log_3(y)] — No. [log_3(2x) = log_3(2) + log_3(x)]
- (B) [2(log_3(x) - log_3(y))] — No. This equals [2 log_3(x) - 2 log_3(y)]
- (C) [2 log_3(x) - log_3(y)] — Yes. Power then quotient property.
- (D) [log_3(x) + log_3(2) - log_3(y)] — No.

**Example 3:** Show that [f(x) = log(6x)] is a vertical translation of [g(x) = log(x)].
- [log(6x) = log(6) + log(x) = g(x) + log(6)]. Vertical shift of [log(6) approx 0.778].

**Example 4:** Which is equivalent to [3 ln(x) - 4 ln(y)]?
- (A) [ln(frac{x^3}{y^4})] — Yes.
- (B) [ln(frac{x^3}{4y})] — No.
- (C) [ln(3x - 4y)] — No. You cannot take the log of a difference.
- (D) [ln(3x) - ln(4y)] — No.

## Guided Practice

### Section: text

**Problem 1:** Condense each to a single logarithm.
- a) [log_3(4) + log_3(z)]
- b) [ln(x) - ln(w)]
- c) [4 log_4(6) + 3 log_4(x)]

**Hint:** Product property for sums, quotient for differences, power property for coefficients.

**Problem 2:** Which is equivalent to [log(frac{3x}{5})]?
- (A) [log(3x) - log(5)]
- (B) [log(3) + log(x) - log(5)]
- (C) [frac{log(3x)}{log(5)}]
- (D) Both (A) and (B)

**Hint:** Expand using quotient and product properties. (C) uses change of base, which is different.

**Problem 3:** Explain why [log(4x)] is a vertical translation of [log(x)].

**Hint:** Apply the product property to [log(4 cdot x)].

## Independent Practice

### Section: text

**Problem 1:** Condense each: [5 ln(2) + ln(x) - 2 ln(y) - ln(w)], [log_{10}(3x) - log_{10}(5)], [3 log_3(4) + log_3(z)].

**Problem 2:** Which is NOT equivalent to [2 log(x) - log(y)]?
- (A) [log(frac{x^2}{y})]
- (B) [log(x^2) - log(y)]
- (C) [log(2x - y)]
- (D) [log(x^2/y)]

**Problem 3:** Let [f(x) = ln(x)] and [k(x) = ln(8x)]. Explain the relationship using both a horizontal dilation interpretation and a vertical translation interpretation.

**Problem 4:** Show that [log_4(x)] is a vertical dilation of [log_9(x)]. What is the scale factor?

## Reflection

### Section: text

**Exit Ticket:** Condense [2 log_7(a) - 5 log_7(b) + log_7(4)] to a single logarithm. Why is [log(a + b) neq log(a) + log(b)]?

**Lesson Summary:** Log properties — Product, Quotient, Power — derive from exponent properties. Use them to expand or condense expressions. Change of base shows all log functions are vertical dilations of each other. Key error: [log(a + b) neq log(a) + log(b)].
