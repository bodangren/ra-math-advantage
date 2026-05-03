# Lesson 2-11 — Logarithmic Functions

Unit: 2
Topic: 2.11
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

The function [f(x) = log(x)] can only accept positive inputs. Try evaluating:
- [log(100) = 2] — works fine
- [log(1) = 0] — works fine
- [log(0)] — undefined! There is no power of 10 that gives 0.
- [log(-5)] — undefined! There is no power of 10 that gives a negative number.

This restriction on the domain mirrors the range of its inverse, [g(x) = 10^x]. Since [10^x] is always positive (range is [(0, infty)]), the inverse [log(x)] can only accept positive inputs (domain is [(0, infty)]).

What about the end behavior? As [x to 0^+] (approaches 0 from the right), [log(x)] plunges to [-infty]. As [x to infty], [log(x)] climbs to [infty]. Write these as limit statements.

## Vocabulary

### Section: text

- **Domain of a logarithmic function**: [(0, infty)] — the argument of the log must be positive.
- **Range of a logarithmic function**: All real numbers, [(-infty, infty)].
- **Vertical asymptote**: The line [x = 0] for the parent function [f(x) = log_b(x)]. The graph approaches but never touches this line.
- **End behavior (limit notation)**: [lim_{x to 0^+} f(x) = -infty] and [lim_{x to infty} f(x = infty] for [f(x) = log(x)].
- **Monotonicity**: Logarithmic functions are always increasing (base > 1) or always decreasing (0 < base < 1) — they never switch direction.
- **Concavity**: Logarithmic functions are always concave down (base > 1, positive coefficient) or always concave up — no inflection points.

## Learn

### Section: text

The general form of a logarithmic function is [f(x) = a log_b(x)], where [b > 0], [b ne 1], and [a ne 0]. Key characteristics:

**Domain and range:**
- Domain: solve the inequality inside the log > 0. For [f(x) = log(x)], domain is [(0, infty)].
- Range: always [(-infty, infty)] for the parent function and most transformations. Vertical shifts do not change the range since [infty + k = infty].

**End behavior using limit notation:**
- Left end behavior: [lim_{x to 0^+} a log_b(x) = pm infty] (sign depends on [a]).
- Right end behavior: [lim_{x to infty} a log_b(x) = pm infty].

**Critical misconception:** The left end behavior is at [x to 0^+], NOT [x to -infty]. The domain does not extend to negative [x].

**Monotonicity and concavity:**
- [f(x) = log_b(x)] with [b > 1]: increasing, concave down.
- [f(x) = -log_b(x)] with [b > 1]: decreasing, concave up.
- The coefficient [a] and the argument's behavior both affect monotonicity.

**Transformed domain/range:** For [g(x) = 5 log(3x - 1) - 2], set [3x - 1 > 0], so [x > 1/3]. Domain: [(1/3, infty)]. Range: [(-infty, infty)].

## Worked Example

### Section: text

**Example 1:** Write limit statements.
- a) [f(x) = log(x)]: [lim_{x to 0^+} f(x) = -infty], [lim_{x to infty} f(x) = infty]
- b) [g(x) = 3 - 2 log(x)]: As [x to 0^+], [-2 log(x) to infty], so [lim_{x to 0^+} g(x) = infty]. As [x to infty], [-2 log(x) to -infty], so [lim_{x to infty} g(x) = -infty].
- c) [h(x) = -log(x)]: [lim_{x to 0^+} h(x) = infty], [lim_{x to infty} h(x) = -infty]

**Example 2:** Determine increasing/decreasing and concave up/down.
- a) [f(x) = log_3(2x)]: Increasing (base > 1, positive argument coefficient), Concave Down.
- b) [g(x) = -log(x)]: Decreasing (negative coefficient), Concave Up.
- c) [h(x) = log_6(4 - x)]: Decreasing (inside [4 - x] is decreasing in [x]), Concave Down.

**Example 3:** Find constant [k] from tables.
- a) x: 1, 2, k, 8, 16 → f(x): 1, 2, 3, 4, 5. Inputs double: [k = 4].
- b) x: 0.3, 3, 30, k, 3000 → f(x): 2, 5, 8, 11, 14. Inputs multiply by 10: [k = 300].

**Example 4:** Find domain and range.
- a) [f(x) = 5 log(3x - 1) - 2]: [3x - 1 > 0 to x > 1/3]. Domain: [(1/3, infty)], Range: [(-infty, infty)].
- b) [h(x) = 8 log(2x + 3)]: [2x + 3 > 0 to x > -3/2]. Domain: [(-3/2, infty)], Range: [(-infty, infty)].

## Guided Practice

### Section: text

**Problem 1:** Write limit statements for [f(x) = 2 log_3(x)].

**Hint:** As [x to 0^+], [2 log_3(x) to -infty]. As [x to infty], [2 log_3(x) to infty].

**Problem 2:** Is [g(x) = -2 log(x)] increasing or decreasing? Concave up or down?

**Hint:** The negative coefficient flips both direction and concavity.

**Problem 3:** Find [k]: x: 3, k, 27, 81 → f(x): 1, 2, 3, 4.

**Hint:** Outputs increase by 1. What multiplicative pattern gives equally-spaced outputs?

**Problem 4:** Find the domain of [h(x) = log(5 - 2x)].

**Hint:** Set [5 - 2x > 0] and solve for [x].

## Independent Practice

### Section: text

**Problem 1:** Write limit statements for [f(x) = 3 log(x)], [g(x) = -log_2(x)], and [h(x) = 4 - log_5(x)].

**Problem 2:** A graph shows [m(x)] increasing and concave down on [(0, infty)] with a vertical asymptote at [x = 0]. Which equation could represent [m]?
- (A) [m(x) = -log(x)]
- (B) [m(x) = log_3(x)]
- (C) [m(x) = -2 log(x)]
- (D) [m(x) = e^x]

**Problem 3:** Find domain and range: [f(x) = log_4(2x + 7)], [g(x) = 3 - 5 log(x - 1)].

**Problem 4:** Find [k]: x: 5, k, 45, 135 → f(x): 0, 3, 6, 9.

## Reflection

### Section: text

**Exit Ticket:** Write the limit statements for [f(x) = -log(x)]. State the domain. Is [f] increasing or decreasing?

**Lesson Summary:** Log functions have domain [(0, infty)] and range [(-infty, infty)], with a vertical asymptote at [x = 0]. Left end behavior is at [x to 0^+], not [x to -infty]. Log functions are always monotonic and always concave in one direction. For [g(x) = a log_b(cx + d) + k], set the argument > 0 to find the domain.
