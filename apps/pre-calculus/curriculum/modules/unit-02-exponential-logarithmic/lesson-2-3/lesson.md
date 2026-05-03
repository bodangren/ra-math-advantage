# Lesson 2-3 — Exponential Functions

Unit: 2
Topic: 2.3
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider the functions [f(x) = 2^x] and [g(x) = (1/2)^x]. As [x] gets very large, what does each function approach? As [x] gets very negative? Do either function ever turn around and start going the other direction — could [2^x] ever start decreasing?

## Vocabulary

### Section: text

- **Exponential growth**: Occurs when [a > 0] and [b > 1] in [f(x) = a \cdot b^x]. The function is increasing — output values get larger as [x] increases.
- **Exponential decay**: Occurs when [a > 0] and [0 < b < 1]. The function is decreasing — output values get smaller as [x] increases.
- **End behavior**: Described using limit notation: [\lim_{x \to \infty} f(x)] and [\lim_{x \to -\infty} f(x)].
- **Concavity**: Whether the graph curves upward (concave up) or downward (concave down). Exponential functions always have the same concavity.
- **Increasing/Decreasing**: Whether outputs rise or fall as inputs increase. Exponential functions are always one or the other — they never switch.

## Learn

### Section: text

An exponential function has the form [f(x) = a \cdot b^x], where [b > 0], [a \neq 0], and [b \neq 1].

Three critical properties distinguish exponential functions:

1. **Always increasing or always decreasing** — they never change direction and have no local maxima or minima.
2. **Always concave up or always concave down** — they never switch concavity and have no inflection points.
3. **End behavior is governed by limits**:

For exponential growth ([a > 0], [b > 1]):
\[\lim_{x \to -\infty} f(x) = 0 \quad \text{and} \quad \lim_{x \to \infty} f(x) = \infty\]

For exponential decay ([a > 0], [0 < b < 1]):
\[\lim_{x \to \infty} f(x) = 0 \quad \text{and} \quad \lim_{x \to -\infty} f(x) = \infty\]

When [a < 0], the graph is reflected over the x-axis, flipping both increasing/decreasing behavior and concavity.

## Worked Example

### Section: text

**Example 1:** Write limit statements for [f(x) = 2^x].

**Solution:**
Since [b = 2 > 1] and [a = 1 > 0], this is exponential growth.
\[\lim_{x \to -\infty} 2^x = 0 \quad \text{and} \quad \lim_{x \to \infty} 2^x = \infty\]

**Example 2:** Determine whether [g(x) = -3(1/2)^x] is increasing or decreasing and concave up or down.

**Solution:**
Since [a = -3 < 0], the negative coefficient reflects the decay curve over the x-axis. The function [-(1/2)^x] is **increasing** (as [x] increases, a negative value getting closer to 0 means the output rises) and **concave down**.

\[\lim_{x \to -\infty} g(x) = -\infty \quad \text{and} \quad \lim_{x \to \infty} g(x) = 0\]

**Example 3:** Write limit statements for [h(x) = (2/5)^{3x}].

**Solution:**
Rewrite: [(2/5)^{3x} = ((2/5)^3)^x = (8/125)^x]. Since [0 < 8/125 < 1], this is decreasing, concave up.
\[\lim_{x \to \infty} h(x) = 0 \quad \text{and} \quad \lim_{x \to -\infty} h(x) = \infty\]

## Guided Practice

### Section: text

**Problem 1:** Write limit statements for each function.

a) [h(x) = 2^{-3x}]

b) [k(x) = (3/5)^{8x}]

**Hint:** Determine whether the effective base is greater than 1 or between 0 and 1.

**Problem 2:** Classify each as increasing or decreasing, and concave up or concave down.

a) [f(x) = (1/3)^{4x}]

b) [h(x) = (4/3)^{2x}]

**Hint:** Remember: if [0 < b < 1], the function is decreasing and concave up. If [b > 1], it is increasing and concave up (assuming [a > 0]).

## Independent Practice

### Section: text

**Problem 1:** Write limit statements for [m(x) = (3/6)^{-2x}].

**Problem 2:** Write limit statements for [n(x) = (7/4)^{-x} \cdot \pi].

**Problem 3:** Which of the following is an exponential decay function?

(A) [k(x) = (4/3)^{2x}] \quad (B) [k(x) = 4^{-2x+3}] \quad (C) [k(x) = (1/2)^{4x-3}] \quad (D) Both B and C

**Problem 4:** Sketch the graph of an exponential function where [\lim_{x \to \infty} f(x) = -\infty] and [\lim_{x \to -\infty} f(x) = 0]. Write a possible equation.

## Reflection

### Section: text

**Exit Ticket:** Is [f(x) = (1/5)^{2x}] increasing or decreasing? Concave up or down? Write the right-hand limit.

**Lesson Summary:** Exponential functions [f(x) = a \cdot b^x] are always monotonic (only increasing or only decreasing) and always maintain one concavity. They never have local extrema or inflection points. Limit statements describe their end behavior — exponential functions either approach 0 or shoot off to [\pm \infty] as [x \to \pm \infty]. The sign of [a] determines whether the graph is above or below the x-axis.
