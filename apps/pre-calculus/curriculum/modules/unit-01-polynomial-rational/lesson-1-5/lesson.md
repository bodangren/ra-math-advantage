# Lesson 1-5 — Polynomial Functions and Complex Zeros

Unit: 1
Topic: 1.5
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Look at the graph of [y = -0.01(x+4)(x+1)^3(x-3)^2]. At [x = -4], the graph crosses straight through the x-axis. At [x = -1], it crosses but with an S-shape (inflection). At [x = 3], it touches the x-axis and bounces back. Why does the same polynomial show three different behaviors at its zeros? The answer lies in the **multiplicity** of each factor.

## Vocabulary

### Section: text

- **Zero (root)**: A value [a] where [p(a) = 0]. If [a] is real, then [(x - a)] is a linear factor of [p(x)].
- **Factor**: An expression of the form [(x - a)] corresponding to a zero.
- **Multiplicity**: The power of a factor. If [(x - a)^k] is a factor, the zero [a] has multiplicity [k].
- **Conjugate pairs**: Complex zeros of polynomials with real coefficients always come in pairs: if [a + bi] is a root, then [a - bi] is also a root.
- **Fundamental Theorem of Algebra**: A polynomial of degree [n] has exactly [n] complex zeros, counting multiplicities.
- **Sign chart**: A number-line diagram used to solve polynomial inequalities.
- **Even function**: Symmetric over the y-axis: [f(-x) = f(x)].
- **Odd function**: Symmetric about the origin: [f(-x) = -f(x)].

## Learn

### Section: text

**Multiplicity and graph behavior:**
- **Odd multiplicity** (1, 3, 5, ...): The graph **crosses** the x-axis at the zero.
  - Multiplicity 1: crosses cleanly.
  - Multiplicity 3 (or higher odd): crosses with an inflection (S-shape).
- **Even multiplicity** (2, 4, 6, ...): The graph is **tangent** to the x-axis — it touches and bounces back.

**Complex zeros**: Some polynomials have zeros containing imaginary numbers. These never appear on the graph. All imaginary roots come in **conjugate pairs**: if [a + bi] is a root, so is [a - bi].

**Fundamental Theorem of Algebra**: A polynomial of degree [n] has exactly [n] complex zeros when counting multiplicities.

**Sign chart method** (4 steps):
1. Solve [f(x) = 0] to find all real zeros.
2. Place zeros on a number line, creating intervals.
3. Test a value in each interval to determine the sign of [f(x)].
4. Write the solution in interval notation, checking whether endpoints are included.

## Worked Example

### Section: text

**Example 1:** Find all real zeros with multiplicity.

a) [f(x) = -2x^3(x+1)(x-4)^2] → Degree: [3 + 1 + 2 = 6]. Zeros: [x = 0] (mult. 3), [x = -1] (mult. 1), [x = 4] (mult. 2).

b) [g(x) = 3(x^2 - 4)(x - 2)^4 = 3(x-2)(x+2)(x-2)^4] → Zeros: [x = 2] (mult. 5), [x = -2] (mult. 1).

**Example 2:** The zero [x = isqrt{3}] is given for polynomial [f]. Since complex zeros come in conjugate pairs, [x = -isqrt{3}] is also a zero. The graph shows at least 3 real zeros. So: 2 complex + 3 real = least degree 5.

**Example 3:** Solve [(x - 3)(x + 1)(x + 4) > 0].

Roots: [x = -4], [x = -1], [x = 3]. Test intervals:
- [(-infty, -4)]: test [x = -5] → [(-)(-)(-) = -]. Not part of solution.
- [(-4, -1)]: test [x = -2] → [(-)(+)(-) = +]. **Solution.**
- [(-1, 3)]: test [x = 0] → [(-)(+)(+) = -]. Not part of solution.
- [(3, infty)]: test [x = 4] → [(+)(+)(+) = +]. **Solution.**

Solution: [(-4, -1) cup (3, infty)].

## Guided Practice

### Section: text

**Problem 1:** [f(x) = x^3 - 4x]. Factor completely, find all zeros with multiplicity, and state whether the graph crosses or is tangent at each zero.

**Hint:** Factor: [x(x^2 - 4) = x(x-2)(x+2)]. All zeros have multiplicity 1 (odd), so the graph crosses at every zero.

**Problem 2:** Solve [(x+2)^2(x-5) leq 0].

**Hint:** Root at [x = -2] (even — tangent) and [x = 5] (odd — crosses). Use a sign chart. Since the inequality is [leq], include endpoints where [f(x) = 0].

## Independent Practice

### Section: text

**Problem 1:** [g(x) = -2x(x-5)^3(x+1)^2]. Find all zeros with multiplicity and describe the graph behavior at each.

**Problem 2:** A polynomial has zeros [x = 3] (mult. 2), [x = 3i], and [x = 4 - i]. What is the least possible degree?

**Problem 3:** Solve [(x+3)(x-1)(x-2) < 0].

## Reflection

### Section: text

**Exit Ticket:** Find all zeros of [f(x) = x^3 - 4x] with multiplicity. State whether the graph crosses or is tangent at each zero.

**Lesson Summary:** The multiplicity of a zero determines how the graph behaves at the x-axis: odd multiplicities cause crossing, even multiplicities cause tangency. The Fundamental Theorem of Algebra guarantees [n] complex zeros for a degree-[n] polynomial. Complex zeros come in conjugate pairs. Sign charts solve polynomial inequalities by testing intervals between real zeros.
