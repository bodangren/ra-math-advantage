# Lesson 1-9 — Rational Functions and Vertical Asymptotes

Unit: 1
Topic: 1.9
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Graph [f(x) = 1/x] on your calculator. What happens to the graph as [x] approaches 0 from the left? From the right? The graph shoots toward infinity — this behavior is called a vertical asymptote. Now consider [g(x) = (x² - 4) / (x - 2)]. What happens at [x = 2]? Is it the same as [f(x)] at [x = 0]? How can we tell the difference between a vertical asymptote and a hole?

## Vocabulary

### Section: text

- **Vertical asymptote (VA)** — A vertical line [x = c] where the function approaches [±∞] as [x] approaches [c].
- **One-sided limit** — The value a function approaches as [x] approaches [c] from the left ([lim(x→c⁻)]) or from the right ([lim(x→c⁺)]).
- **Without bound** — Describes function values increasing or decreasing infinitely ([+∞] or [-∞]).
- **Hole** — A point where the function is undefined but does not diverge to [±∞] (covered in Topic 1.10).

## Learn

### Section: text

**EK 1.9.A.1:** A vertical asymptote occurs at [x = c] when a factor in the denominator of a rational function **cannot cancel** with factors in the numerator. The function is undefined at [x = c] and the graph approaches [±∞] as [x] approaches [c].

**EK 1.9.A.2:** The behavior near a vertical asymptote is described using one-sided limits. As [x] approaches [c] from the left or right, [f(x)] increases or decreases without bound.

**EK 1.9.A.3:** The sign on each side of a VA depends on the signs of the remaining factors evaluated near [c].

### How to Identify Vertical Asymptotes

1. Factor both the numerator and denominator completely.
2. Cancel any common factors.
3. The remaining denominator zeros are vertical asymptotes.
4. Write one-sided limit statements for each VA by testing values on either side.

For example, [f(x) = (x - 3)(x + 2) / (x - 1)] has a VA at [x = 1] because [(x - 1)] does not cancel. Testing: [lim(x→1⁻) f(x) = -∞] and [lim(x→1⁺) f(x) = +∞].

## Worked Example

### Section: text

**Example 1:** Find all VAs of [f(x) = (x - 2)(x + 3) / ((x + 3)(x - 5))].

Factor and cancel [(x + 3)]: simplified form is [(x - 2) / (x - 5)].

The remaining denominator zero is [x = 5], so there is a VA at [x = 5]. The canceled factor [(x + 3)] produces a hole at [x = -3] (not a VA).

**Example 2:** Write one-sided limit statements for [f(x) = (x - 1)(x + 3) / (x - 2)].

VA at [x = 2]. Test values near 2:

- At [x = 1.9]: numerator = [(0.9)(4.9)] > 0, denominator = [-0.1] < 0 → [f(1.9) < 0].
- At [x = 2.1]: numerator = [(1.1)(5.1)] > 0, denominator = [0.1] > 0 → [f(2.1) > 0].

Therefore: [lim(x→2⁻) f(x) = -∞] and [lim(x→2⁺) f(x) = +∞].

**Example 3:** Find VAs of [g(x) = (x - 1)(x + 2) / (x - 1)²].

Cancel one [(x - 1)]: simplified form is [(x + 2) / (x - 1)]. One [(x - 1)] remains in the denominator, so VA at [x = 1].

## Guided Practice

### Section: text

**Problem 1:** Find all vertical asymptotes of [p(x) = (x² - 1) / (x + 1)²].
*Hint:* Factor the numerator as [(x - 1)(x + 1)]. Cancel one [(x + 1)] and check what remains in the denominator.

**Problem 2:** Write one-sided limit statements for [g(x) = (x - 2)(x + 4) / ((x - 2)(x - 3))].
*Hint:* First cancel [(x - 2)] to find the VA. Then test values on either side.

**Problem 3:** Find VAs of [h(x) = 1 / (x³ + 4x)].
*Hint:* Factor the denominator: [x(x² + 4)]. Which factor produces a real zero?

## Independent Practice

### Section: text

**Problem 1:** Find all VAs of [f(x) = (x - 1)(x - 5) / ((x - 5)(x + 2))]. State one-sided limit statements at each VA.

**Problem 2:** Find all VAs of [f(x) = (2x + 6) / (x - 3)] and write [lim(x→3⁻) f(x)] and [lim(x→3⁺) f(x)].

**Problem 3:** Write the equation of a rational function that has a VA at [x = 1] with [lim(x→1⁻) f(x) = -∞] and [lim(x→1⁺) f(x) = +∞], and a hole at [x = 3].

## Reflection

### Section: text

**Exit Ticket:** Find all vertical asymptotes of [g(x) = (x² - 9) / (x² - x - 6)]. Write one-sided limit statements at each VA.

**Lesson Summary:** Vertical asymptotes occur where denominator factors do not cancel with the numerator. To find VAs, factor completely, cancel common factors, then identify remaining denominator zeros. Use test values on either side of each VA to determine whether the function approaches [+∞] or [-∞] from each direction.
