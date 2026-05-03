# Lesson 1-7 — Rational Functions and End Behavior

Unit: 1
Topic: 1.7
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider [f(x) = frac{3x^2 + 4}{x^2 - 1}]. As [x] gets very large, both the numerator and denominator grow like [x^2]. What does the fraction approach? Now consider [g(x) = frac{2x + 1}{x^2 + 3}] — the denominator grows much faster than the numerator. What does [g(x)] approach? Rational functions are "just fractions of polynomials," and their end behavior depends on how the numerator's degree compares to the denominator's degree.

## Vocabulary

### Section: text

- **Rational function**: The quotient of two polynomials: [y = frac{f(x)}{g(x)}] where [f(x)] and [g(x)] are polynomials and [g(x) neq 0].
- **Horizontal asymptote (HA)**: A horizontal line [y = c] that the graph approaches as [x to pm infty].
- **Slant (oblique) asymptote**: A non-horizontal, non-vertical line that the graph approaches as [x to pm infty]. Occurs when the numerator's degree exceeds the denominator's degree by exactly 1.
- **Numerator degree ([n])**: The degree of the polynomial in the numerator.
- **Denominator degree ([d])**: The degree of the polynomial in the denominator.

## Learn

### Section: text

The end behavior of a rational function depends on comparing [n] (numerator degree) and [d] (denominator degree):

**Case I: [n = d]** (same degree) — The horizontal asymptote is [y = frac{a}{b}], where [a] and [b] are the leading coefficients of the numerator and denominator. Both ends approach the same horizontal line.

**Case II: [n < d]** (denominator dominates) — The horizontal asymptote is [y = 0]. The denominator grows faster, so the fraction shrinks toward zero.

**Case III: [n > d]** (numerator dominates) — No horizontal asymptote. If [n = d + 1] exactly, the function has a **slant asymptote**. If [n > d + 1], the end behavior follows a polynomial trend (lim(x to pm infty) goes to [pm infty]).

**Process**: Always start by identifying the degree of the numerator and denominator. Then classify which case applies. Write the HA equation or determine the slant asymptote. Finally, write limit statements.

**Common mistake**: Trying to divide every term instead of just comparing leading terms. Only the leading terms matter for end behavior.

## Worked Example

### Section: text

**Example 1:** Determine asymptote type.

a) [f(x) = frac{3x^2 + 4x - 7}{5x^2 - 3}] → [n = 2], [d = 2]. **Case I**: HA at [y = frac{3}{5}].

b) [y = frac{2x - 5}{x^2 + 3x + 2}] → [n = 1], [d = 2]. **Case II**: HA at [y = 0].

c) [g(x) = frac{2x^2 - 4}{5x + 9}] → [n = 2], [d = 1]. **Case III**: slant asymptote ([n = d + 1]).

d) [k(x) = frac{3}{x^2 + 3x - 7}] → [n = 0], [d = 2]. **Case II**: HA at [y = 0].

**Example 2:** Write limit statements.

a) [f(x) = frac{2x^3 + 4x - 1}{6x^3 - x^2 + 4}] → [n = 3], [d = 3]. HA: [y = frac{2}{6} = frac{1}{3}].
   - lim(x to infty) f(x) = frac{1}{3}, lim(x to -infty) f(x) = frac{1}{3}

b) [g(x) = frac{5x^2 - 8x + 9}{2x^3 + x - 1}] → [n = 2], [d = 3]. HA: [y = 0].
   - lim(x to infty) g(x) = 0, lim(x to -infty) g(x) = 0

c) [h(x) = frac{-3x^4 - x^2 + x}{x^3 + 4x + 4}] → [n = 4], [d = 3]. Since [n > d + 1], the leading ratio is [-3x]. As [x to infty], [h(x) to -infty]. As [x to -infty], [h(x) to infty].

**Example 3:** Which functions have a slant asymptote parallel to [y = frac{1}{2}x]?

**Solution:** Only functions where [n = d + 1] and the leading coefficient ratio [frac{a}{b} = frac{1}{2}] qualify.

## Guided Practice

### Section: text

**Problem 1:** Does [f(x) = frac{5x^2 + 3}{2x^2 - 1}] have a horizontal or slant asymptote? Write its equation.

**Hint:** [n = 2], [d = 2] → same degree → HA at [y = frac{5}{2}].

**Problem 2:** Write limit statements for [g(x) = frac{4x - 7}{8x + 2}].

**Hint:** [n = 1], [d = 1] → HA at [y = frac{4}{8} = frac{1}{2}]. Both limits approach [frac{1}{2}].

## Independent Practice

### Section: text

**Problem 1:** [y = frac{3x^2 - 1}{2x^2 + 5x + 7}]. Find the horizontal asymptote.

**Problem 2:** [h(x) = frac{4x^2 - 5x - 2}{x^3 + 6x}]. Find the horizontal asymptote.

**Problem 3:** [y = frac{3x^2 + 1}{x - 1}]. Does this function have a horizontal or slant asymptote? Explain.

## Reflection

### Section: text

**Exit Ticket:** Does [f(x) = frac{5x^2 + 3}{2x^2 - 1}] have a horizontal or slant asymptote? Write its equation and the corresponding limit statements.

**Lesson Summary:** Rational functions are fractions of polynomials. Their end behavior depends on comparing numerator and denominator degrees: equal degrees give [y = a/b], denominator-dominant gives [y = 0], and numerator-dominant (by exactly 1) gives a slant asymptote. Always start by identifying degrees and leading coefficients — only the leading terms control end behavior.
