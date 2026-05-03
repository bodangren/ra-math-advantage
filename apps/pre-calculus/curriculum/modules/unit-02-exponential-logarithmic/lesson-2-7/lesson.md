# Lesson 2-7 — Function Composition

Unit: 2
Topic: 2.7
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Suppose [g(3) = 7] and [f(7) = 22]. You first apply [g] to 3, getting 7. Then you feed that 7 into [f], getting 22. What single expression captures this two-step process? What happens if you reverse the order — apply [f] first, then [g]?

## Vocabulary

### Section: text

- **Composite function**: A function created by chaining two or more functions — the output of one becomes the input of another.
- **[f(g(x))]**: Read as "[f] of [g] of [x]." Evaluate [g(x)] first, then use that result as the input to [f].
- **[(f \circ g)(x)]**: The composition notation. Means the same thing as [f(g(x))].
- **Inside-out rule**: Always evaluate the innermost function first, working outward.
- **Order matters**: In general, [f(g(x)) \neq g(f(x))]. The order of composition affects the result.

## Learn

### Section: text

A composite function chains operations: you feed an input into one function, take the output, and feed it into the next function. Two notations express the same idea:

\[f(g(x)) \quad \text{and} \quad (f \circ g)(x)\]

Both mean: first compute [g(x)], then apply [f] to that result.

**Evaluation procedure** (inside-out):
1. Identify the inner function.
2. Evaluate the inner function at the given input.
3. Use that result as the input to the outer function.

This works with equations, graphs, tables, piecewise functions, and verbal descriptions. Triple compositions follow the same rule: [(f \circ g \circ k)(x)] means first [k(x)], then [g] of that result, then [f] of that result.

**Algebraic composition**: To find [f(g(x))] as an expression, replace every [x] in [f] with the entire expression [g(x)], then simplify.

## Worked Example

### Section: text

**Example 1:** Let [f(x) = 3x - 5] and [g(x) = 2x + 1].

Find [f(g(3))].

**Solution:**
\[\text{Step 1: } g(3) = 2(3) + 1 = 7\]
\[\text{Step 2: } f(7) = 3(7) - 5 = 16\]

So [f(g(3)) = 16].

**Example 2:** Find [(f \circ g)(x)] for the same functions.

**Solution:**
\[(f \circ g)(x) = f(g(x)) = 3(2x + 1) - 5 = 6x + 3 - 5 = 6x - 2\]

**Example 3:** Find [(g \circ f)(x)].

**Solution:**
\[(g \circ f)(x) = g(f(x)) = 2(3x - 5) + 1 = 6x - 10 + 1 = 6x - 9\]

Note: [(f \circ g)(x) = 6x - 2] but [(g \circ f)(x) = 6x - 9]. Order matters.

**Example 4:** Find [(k \circ p)(x)] where [k(x) = x^2 + 4x + 5] and [p(x) = \sqrt{3x + 1}].

**Solution:**
\[(k \circ p)(x) = (\sqrt{3x+1})^2 + 4\sqrt{3x+1} + 5 = 3x + 1 + 4\sqrt{3x+1} + 5 = 3x + 6 + 4\sqrt{3x+1}\]

## Guided Practice

### Section: text

**Problem 1:** Let [f(x) = 4x - 5], [g(x) = x^2 - 2x + 4], and [h(x) = 3(2)^x].

a) Find [f(g(1))].

b) Find [h(h(0))].

c) Find [f(g(x))].

**Hint:** For (b), compute [h(0) = 3(2)^0 = 3], then [h(3) = 3(2)^3].

**Problem 2:** Let [k(x) = 3 - 2x]. Find [(f \circ g \circ k)(1)].

**Hint:** Start with [k(1)], then [g] of that result, then [f].

## Independent Practice

### Section: text

**Problem 1:** Let [f(x) = 4x - 5], [g(x) = x^2 - 2x + 4], [h(x) = 3(2)^x].

a) Find [g(f(0))].

b) Find [h(k(2))] where [k(x) = 3 - 2x].

c) Find [f(f(-1))].

**Problem 2:** Find [(g \circ f)(x)] where [f(x) = 4x - 5] and [g(x) = x^2 - 2x + 4].

**Problem 3:** A table gives [f]: 1 \to 3, 3 \to 5, 5 \to 7. A graph shows [g(1) = 3], [g(3) = 1], [g(5) = 3]. Find [f(g(3))] and [g(f(3))].

## Reflection

### Section: text

**Exit Ticket:** Let [f(x) = 3x - 5] and [g(x) = 2x + 1]. Find [f(g(x))].

**Lesson Summary:** Function composition chains operations — the output of one function becomes the input of another. The notation [f(g(x))] and [(f \circ g)(x)] are equivalent. Always work inside-out: evaluate the inner function first. Order matters — [f(g(x))] and [g(f(x))] generally produce different results. Composition works across all representations: equations, graphs, tables, and piecewise functions.
