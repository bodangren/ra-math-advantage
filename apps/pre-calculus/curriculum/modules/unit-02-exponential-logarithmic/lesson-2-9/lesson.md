# Lesson 2-9 — Logarithmic Expressions

Unit: 2
Topic: 2.9
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Every operation has exactly one inverse. Addition is undone by subtraction. Multiplication is undone by division. But what undoes exponentiation?

Consider: If [2^5 = 32], we can ask the question **"2 raised to what power gives 32?"** The answer is 5. That question — *what exponent gives this result?* — is exactly what a logarithm answers.

Write each statement below in two ways — as an exponential equation and as the "question" form:

1. [3^4 = 81] — "3 raised to what power gives 81?" → Answer: 4
2. [5^? = 125] — "5 raised to what power gives 125?" → Answer: 3
3. [10^? = 1000] — Answer: 3

A **logarithm** is the notation that captures this question. Instead of writing "3 raised to what power gives 81?" we write [log_3(81) = 4].

## Vocabulary

### Section: text

- **Logarithm**: The inverse of exponentiation. [log_b(c) = a] means "the exponent [a] that makes [b^a = c]."
- **Exponential form**: An equation written as [b^a = c].
- **Logarithmic form**: An equation written as [log_b(c) = a]. These two forms are interchangeable.
- **Common logarithm**: A logarithm with base 10, written [log(x)] without a subscript. [log(100) = 2] means [10^2 = 100].
- **Natural logarithm**: A logarithm with base [e], written [ln(x)]. [ln(e^3) = 3] means [e^3 = e^3].
- **Change of base**: A formula for evaluating logs with non-standard bases: [log_b(x) = frac{log(x)}{log(b)}].

## Learn

### Section: text

The relationship [b^a = c \leftrightarrow log_b(c) = a] is the foundation of logarithms. Converting between forms does not change the problem — it is just rewriting.

**Converting exponential to logarithmic form:**
- [7^2 = 49] becomes [log_7(49) = 2]
- [e^x = 5] becomes [ln(5) = x]
- [10^3 = 1000] becomes [log(1000) = 3]

**Converting logarithmic to exponential form:**
- [log_2(16) = 4] becomes [2^4 = 16]
- [ln(c) = 4] becomes [e^4 = c]
- [log(y) = 2] becomes [10^2 = y]

**Evaluating without a calculator:** Ask "what exponent gives this result?"
- [log_2(8) = 3] because [2^3 = 8]
- [log_5(1) = 0] because [5^0 = 1]
- [log_9(3) = 1/2] because [9^{1/2} = 3]

**Evaluating with a calculator:** Use the change of base formula [log_b(x) = frac{log(x)}{log(b)}]. For example, [log_2(10) = frac{log(10)}{log(2)} approx 3.3219].

## Worked Example

### Section: text

**Example 1:** Convert to logarithmic form.
- a) [5^3 = 125] → [log_5(125) = 3]
- b) [e^{3x} = y] → [ln(y) = 3x]
- c) [10^x = 6125] → [log(6125) = x]

**Example 2:** Convert to exponential form.
- a) [log_7(x) = 2] → [7^2 = x], so [x = 49]
- b) [ln(c) = 4] → [e^4 = c]
- c) [log(y) = -1] → [10^{-1} = y], so [y = 0.1]

**Example 3:** Evaluate without a calculator.
- a) [log_3(27) = 3] — because [3^3 = 27]
- b) [log_2(1/32) = -5] — because [2^{-5} = 1/32]
- c) [log_{16}(4) = 1/2] — because [16^{1/2} = 4]
- d) [ln(1) = 0] — because [e^0 = 1]

**Example 4:** Evaluate with a calculator.
- a) [log_7(135) = frac{log(135)}{log(7)} approx 2.4957]
- b) [ln(50) approx 3.9120]

## Guided Practice

### Section: text

**Problem 1:** Convert each to logarithmic form: [4^3 = 64], [e^k = m], [10^2 = 100].

**Hint:** The base becomes the log base, the exponent becomes the result, and the result becomes the argument.

**Problem 2:** Evaluate without a calculator: [log_2(64)], [log_5(125)], [log_{81}(3)], [log(10000)].

**Hint:** Ask "what power of the base gives the argument?" For [log_{81}(3)], think fractional exponents.

**Problem 3:** Use a calculator to evaluate [log_3(50)] to four decimal places.

**Hint:** [log_3(50) = frac{log(50)}{log(3)}].

## Independent Practice

### Section: text

**Problem 1:** Convert to logarithmic form: [2^6 = 64], [e^{x+2} = 7], [3^{-2} = 1/9].

**Problem 2:** Convert to exponential form: [log_4(64) = 3], [ln(w) = t], [log(0.01) = -2].

**Problem 3:** Evaluate without a calculator: [log_9(81)], [log_{27}(3)], [log_{1/4}(16)], [log_6(1)].

**Problem 4:** Use a calculator: [log_2(50)] and [ln(125)] to four decimal places.

## Reflection

### Section: text

**Exit Ticket:** Evaluate [log_2(32)] without a calculator. Show your reasoning by converting to exponential form. Then evaluate [log_4(20)] with a calculator using the change of base formula.

**Lesson Summary:** A logarithm is the inverse of exponentiation. The forms [b^a = c] and [log_b(c) = a] are interchangeable — converting between them does not change the problem, it just rewrites it. To evaluate a logarithm without a calculator, ask "what exponent gives this result?" Common logarithms have base 10 (written [log]) and natural logarithms have base [e] (written [ln]). For other bases, use the change of base formula [log_b(x) = frac{log(x)}{log(b)}].
