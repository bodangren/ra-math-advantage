# Lesson 2-8 — Inverse Functions

Unit: 2
Topic: 2.8
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider the function represented by this table:

| x | -3 | -2 | 0 | 1 | 4 | 6 |
|---|---|---|---|---|---|---|
| f(x) | 6 | 3 | 1 | -1 | -3 | -7 |

If you switch every [x] and [y] value, does the resulting relation still pass the vertical line test? What happens to the domain and range?

## Vocabulary

### Section: text

- **Inverse relation**: A relation formed by switching every [x] and [y] value in the original. The graph of an inverse is a reflection over the line [y = x].
- **Inverse function** ([f^{-1}(x)]): The inverse is itself a function only if the original is strictly increasing or strictly decreasing on its entire domain. Note: [f^{-1}(x)] does NOT mean [1/f(x)].
- **Verification by composition**: Functions [f] and [g] are inverses if and only if [f(g(x)) = x] and [g(f(x)) = x] for all [x] in the appropriate domains.
- **Domain-range swap**: The domain of [f] equals the range of [f^{-1}], and the range of [f] equals the domain of [f^{-1}].

## Learn

### Section: text

An inverse undoes a function's operation. Three ways to find and verify inverses:

**Numerical:** Switch each [x]-[y] pair. If any [x]-value repeats in the inverse, the inverse is a relation, not a function.

**Graphical:** Reflect the graph over the line [y = x]. A function has a function inverse only if it is strictly increasing or strictly decreasing everywhere — a horizontal line test.

**Analytical (3-step procedure):**
1. Replace [f(x)] with [y].
2. Switch [x] and [y].
3. Solve for [y] and write as [f^{-1}(x)].

For rational functions like [f(x) = (x - 2)/(x + 3)], the procedure requires multiplying both sides to clear denominators and factoring to isolate [y].

**Verification**: Show both [f(f^{-1}(x)) = x] and [f^{-1}(f(x)) = x]. Proving only one direction is insufficient.

## Worked Example

### Section: text

**Example 1:** Find [f^{-1}(x)] for [f(x) = 3x - 7].

**Solution:**
\[y = 3x - 7\]
\[\text{Switch: } x = 3y - 7\]
\[x + 7 = 3y\]
\[y = \frac{x + 7}{3}\]
\[f^{-1}(x) = \frac{x + 7}{3}\]

**Verification:**
\[f(f^{-1}(x)) = 3\left(\frac{x+7}{3}\right) - 7 = x + 7 - 7 = x \quad \checkmark\]

**Example 2:** Find the inverse of [f(x) = (x - 2)/(x + 3)].

**Solution:**
\[y = \frac{x - 2}{x + 3}\]
\[\text{Switch: } x = \frac{y - 2}{y + 3}\]
\[x(y + 3) = y - 2\]
\[xy + 3x = y - 2\]
\[xy - y = -2 - 3x\]
\[y(x - 1) = -2 - 3x\]
\[y = \frac{-2 - 3x}{x - 1} = \frac{3x + 2}{1 - x}\]

**Example 3:** Are [f(x) = 2x - 3] and [g(x) = \frac{1}{2}x + \frac{3}{2}] inverses?

**Solution:**
\[f(g(x)) = 2\left(\frac{1}{2}x + \frac{3}{2}\right) - 3 = x + 3 - 3 = x \quad \checkmark\]
\[g(f(x)) = \frac{1}{2}(2x - 3) + \frac{3}{2} = x - \frac{3}{2} + \frac{3}{2} = x \quad \checkmark\]

Yes, they are inverses.

## Guided Practice

### Section: text

**Problem 1:** Find the inverse of [f(x) = 3x + 5]. Verify your answer by composition.

**Hint:** Follow the 3-step procedure: write as [y], switch [x] and [y], solve for [y].

**Problem 2:** A table gives [f]: -3 \to 6, -2 \to 3, 0 \to 1, 1 \to -1, 4 \to -3, 6 \to -7. Let [g = f^{-1}].

a) Find [g(-3)].

b) Find [g(6)].

c) Find [(f^{-1} \circ f)(-2)].

**Hint:** For (a), find which input of [f] produces output -3. For (c), [f^{-1}(f(x)) = x] always.

## Independent Practice

### Section: text

**Problem 1:** Find the inverse of [y = -2x + 7].

**Problem 2:** Find the inverse of [f(x) = (x - 3)/(x + 2)].

**Problem 3:** Show that [n(x) = 6/(x - 4)] and [p(x) = 6/x + 4] are inverses by verifying both compositions.

**Problem 4:** A graph of [k] on [[-4, 11]] has minimum value -2 and maximum value 8. What are the domain and range of [k^{-1}]?

## Reflection

### Section: text

**Exit Ticket:** Find the inverse of [f(x) = 2x - 3]. Verify it is correct.

**Lesson Summary:** Inverse functions undo each other — [f(f^{-1}(x)) = x] and [f^{-1}(f(x)) = x]. Finding an inverse means switching [x] and [y] and solving for [y]. Graphically, inverses are reflections over [y = x]. A function has a function inverse only if it passes the horizontal line test (strictly increasing or strictly decreasing). The domain of [f] becomes the range of [f^{-1}] and vice versa. Note: [f^{-1}(x)] is not a reciprocal — it is a completely different function.
