# Lesson 1-6 — Polynomial Functions and End Behavior

Unit: 1
Topic: 1.6
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

As [x] gets very large — say [x = 1000] or [x = 1{,}000{,}000] — what happens to [f(x) = 3x^2 - 5]? The [3x^2] term dominates, so [f(x)] grows very large and positive. What about [g(x) = -x^3 + 100x]? The [-x^3] dominates, sending [g(x)] to negative infinity. This lesson formalizes how polynomials behave as [x] moves infinitely far to the left and right — their **end behavior**.

## Vocabulary

### Section: text

- **End behavior**: How a function behaves as [x] moves infinitely to the right ([x to infty]) and infinitely to the left ([x to -infty]).
- **Limit notation**: lim(x to infty) f(x) and lim(x to -infty) f(x) describe the output values that [f] approaches.
- **Without bound**: Moving infinitely far in the positive or negative direction.
- **Leading term**: The term [a_n x^n] — the only term that matters for end behavior.

## Learn

### Section: text

The end behavior of a polynomial is determined entirely by its **leading term** [a_n x^n].

**Step 1 — Determine the RIGHT side** (as [x to infty]):
- If the leading coefficient is **positive**: the right end goes **up** — lim(x to infty) f(x) = infty.
- If the leading coefficient is **negative**: the right end goes **down** — lim(x to infty) f(x) = -infty.

**Step 2 — Determine the LEFT side** (as [x to -infty]):
- If the degree is **even**: the left end goes in the **same direction** as the right.
- If the degree is **odd**: the left end goes in the **opposite direction** from the right.

**Four end behavior patterns:**

| Degree | LC | Left | Right |
|---|---|---|---|
| Even | + | up | up |
| Even | - | down | down |
| Odd | + | down | up |
| Odd | - | up | down |

**Common mistake**: Trying to evaluate [f(x)] at large numbers. Instead, just look at the leading term.

## Worked Example

### Section: text

**Example 1:** Determine end behavior and write limit statements.

a) [f(x) = 4x^5] → Leading term: [4x^5]. Odd degree, positive LC.
   - Right: up. lim(x to infty) f(x) = infty.
   - Left: down (opposite). lim(x to -infty) f(x) = -infty.

b) [g(x) = frac{1}{2}x^4] → Even degree, positive LC.
   - Right: up. lim(x to infty) g(x) = infty.
   - Left: up (same direction). lim(x to -infty) g(x) = infty.

c) [y = -2(x+3)^6] → Leading term: [-2x^6]. Even degree, negative LC.
   - Right: down. lim(x to infty) y = -infty.
   - Left: down (same). lim(x to -infty) y = -infty.

**Example 2:** The leading term may be hidden.

a) [h(x) = 3 - x^5 = -x^5 + 3] → Leading term: [-x^5]. Odd, negative.
   - Right: down. Left: up.
   - lim(x to infty) h(x) = -infty, lim(x to -infty) h(x) = infty.

b) [k(x) = 8x^2 + 4 - x^5] → Leading term: [-x^5]. Odd, negative.
   - Right: down. Left: up.

c) [m(x) = 2x(x - 1)(6 - x)] → Multiply leading terms: [2x cdot x cdot (-x) = -2x^3]. Odd, negative.
   - Right: down. Left: up.

**Example 3:** Write limit statements for [f(x) = -3x^4 + x - 7].
- Even degree, negative LC → both ends down.
- lim(x to -infty) f(x) = -infty, lim(x to infty) f(x) = -infty.

## Guided Practice

### Section: text

**Problem 1:** Write limit statements for [g(x) = -2x^4 + x - 3].

**Hint:** Leading term is [-2x^4]. Even degree, negative LC — both ends go down.

**Problem 2:** Sketch a polynomial where lim(x to -infty) f(x) = -infty and lim(x to infty) f(x) = infty.

**Hint:** This requires an odd degree with positive LC — shape is similar to [x^3].

## Independent Practice

### Section: text

**Problem 1:** Determine end behavior and write limit statements for [f(x) = -4x^3 + 2x - 1].

**Problem 2:** [k(x) = 8x^2 + 4 - x^5]. Find the leading term, determine end behavior, and write limit statements.

**Problem 3:** Match four graphs to four equations based on their end behavior patterns.

## Reflection

### Section: text

**Exit Ticket:** Write limit statements for [g(x) = -2x^4 + x - 3].

**Lesson Summary:** End behavior is controlled entirely by the leading term. Start with the right side: positive LC means up, negative LC means down. Then determine the left side using the degree: even means same direction, odd means opposite. Write end behavior using limit notation: lim(x to infty) and lim(x to -infty).
