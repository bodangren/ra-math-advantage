# Lesson 2-1 — Change in Arithmetic and Geometric Sequences

Unit: 2
Topic: 2.1
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider these two sequences of values:

**Sequence A:** 3, 7, 11, 15, 19, ...

**Sequence B:** 3, 6, 12, 24, 48, ...

For each sequence, compute the difference between consecutive terms and the ratio of consecutive terms. What patterns do you notice? How would you predict the next two terms in each sequence?

## Vocabulary

### Section: text

- **Sequence**: A function whose domain is a subset of the integers. Each term is identified by its position index [n].
- **Arithmetic sequence**: A sequence with a constant difference [d] between consecutive terms. The change is additive.
- **Geometric sequence**: A sequence with a constant ratio [r] between consecutive terms. The change is multiplicative.
- **Common difference** ([d]): The constant value added to each term to get the next term in an arithmetic sequence. Found by [d = a_{n+1} - a_n].
- **Common ratio** ([r]): The constant value each term is multiplied by to get the next term in a geometric sequence. Found by [r = g_{n+1} / g_n].
- **Explicit formula**: A formula that directly computes the [n]th term from the index, without needing previous terms.

## Learn

### Section: text

A **sequence** is a function from the natural numbers to the real numbers. The inputs are whole-number positions only — this means when graphing a sequence, you plot discrete points, never connecting them with lines or curves.

**Arithmetic sequences** model constant additive change and behave like linear functions. The explicit formula is:

\[a_n = a_0 + d \cdot n \quad \text{or} \quad a_n = a_k + d(n - k)\]

**Geometric sequences** model constant multiplicative change and behave like exponential functions. The explicit formula is:

\[g_n = g_0 \cdot r^n \quad \text{or} \quad g_n = g_k \cdot r^{(n-k)}\]

To classify a sequence: compute the differences between consecutive terms. If constant, the sequence is arithmetic with [d] equal to that constant. If differences are not constant, compute ratios. If constant, the sequence is geometric with [r] equal to that constant. If neither is constant, the sequence is neither arithmetic nor geometric.

When writing a geometric formula from two given terms, use [g_n = g_k \cdot r^{(n-k)}] with the larger index as the [g_n] term to avoid fractional exponents.

## Worked Example

### Section: text

**Example 1:** Let [a_n] be arithmetic with [a_3 = 8] and [d = -3]. Find [a_n] and [a_{12}].

**Solution:**
\[a_n = a_3 + d(n - 3) = 8 + (-3)(n - 3) = 8 - 3n + 9 = 17 - 3n\]

Checking: [a_3 = 17 - 9 = 8] \checkmark

\[a_{12} = 17 - 3(12) = 17 - 36 = -19\]

**Example 2:** Let [g_n] be geometric with [g_3 = -2] and [g_6 = 128]. Find [g_n] and [g_{11}].

**Solution:**
\[128 = -2 \cdot r^{(6-3)} \implies 128 = -2r^3 \implies r^3 = -64 \implies r = -4\]

\[g_n = -2 \cdot (-4)^{(n-3)}\]

\[g_{11} = -2 \cdot (-4)^8 = -2 \cdot 65536 = -131072\]

## Guided Practice

### Section: text

**Problem 1:** Classify each sequence as arithmetic, geometric, or neither. If arithmetic, state [d]. If geometric, state [r].

a) 12, 7, 2, -3, -8, ...

b) -5, 10, -20, 40, ...

c) 1, 3, 2, 6, 4, 12, ...

**Hint:** For each, first compute consecutive differences. If not constant, compute consecutive ratios.

**Problem 2:** Let [a_n] be arithmetic with [a_2 = 7] and [a_6 = 9]. Find [a_n] and [a_{24}].

**Hint:** Use [d = (a_6 - a_2)/(6 - 2)] to find the common difference, then write the formula using [a_n = a_2 + d(n - 2)].

## Independent Practice

### Section: text

**Problem 1:** Classify and write the explicit formula for: -16, -8, -4, -2, -1, ...

**Problem 2:** Let [g_n] be geometric with [g_1 = 5] and [r = -2]. Find [g_n] and [g_6].

**Problem 3:** Let [g_n] be geometric with [g_2 = 48] and [g_7 = 1.5]. Find [g_n] and [g_{10}].

**Problem 4:** Classify as arithmetic, geometric, or neither: [s_n = 2 \cdot 3^n]. If it fits a type, state the common difference or ratio.

**Problem 5:** Let [a_n] be arithmetic with [a_5 = 7] and [a_3 = -9]. Find [a_n] and [a_{20}].

## Reflection

### Section: text

**Exit Ticket:** Let [a_n] be arithmetic with [a_5 = 7] and [a_3 = -9]. Find the explicit formula [a_n].

**Lesson Summary:** Arithmetic sequences have constant additive change (common difference [d]) and behave like linear functions. Geometric sequences have constant multiplicative change (common ratio [r]) and behave like exponential functions. Both are discrete — their graphs consist of unconnected points, not curves. The explicit formulas [a_n = a_k + d(n - k)] and [g_n = g_k \cdot r^{(n-k)}] allow direct computation of any term.
