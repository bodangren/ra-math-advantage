# Lesson 1-10 — Rational Functions and Holes

Unit: 1
Topic: 1.10
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider [f(x) = (x² - 4) / (x - 2)]. Factor the numerator: [(x - 2)(x + 2) / (x - 2)]. After canceling, the simplified form is [x + 2]. But is [f(2)] defined? Try evaluating on your calculator — you get an error. Yet the simplified form gives [2 + 2 = 4]. This "missing point" is called a hole. How is a hole different from the vertical asymptotes we studied in Topic 1.9?

## Vocabulary

### Section: text

- **Hole** — A point on the graph where the function is undefined because a factor canceled, but the graph does not diverge to [±∞]. Both one-sided limits exist and are equal.
- **Simplified form** — The rational function after all common factors between numerator and denominator are canceled.
- **Cancel** — Removing a common factor from both the numerator and denominator of a rational expression.

## Learn

### Section: text

**EK 1.10.A.1:** A hole occurs when a factor in the denominator **cancels completely** with a factor in the numerator. The function is undefined at that x-value, but the graph does not diverge to [±∞].

**EK 1.10.A.2:** At a hole, both one-sided limits exist and are equal. The y-coordinate of the hole is found by evaluating the **simplified** function at the canceled x-value.

**EK 1.10.A.3:** Distinguishing holes from vertical asymptotes requires **fully factoring** both the numerator and denominator and identifying which denominator factors cancel.

### Holes vs. Vertical Asymptotes

| Feature | Hole | Vertical Asymptote |
|---|---|---|
| Denominator factor | Cancels with numerator | Does **not** cancel |
| Limit behavior | Both sides equal (finite) | Sides diverge to [±∞] |
| Graph | Missing point | Graph shoots to infinity |

For [f(x) = (x - 1)(x + 2) / (x - 1)]: cancel [(x - 1)] → hole at [x = 1], [y = 3]. Both limits equal 3.

For [g(x) = (x - 3)(x + 2) / (x - 1)]: no cancellation → VA at [x = 1]. Limits diverge.

## Worked Example

### Section: text

**Example 1:** Classify each denominator zero as a hole or VA for [f(x) = (x - 2)(x + 3) / ((x + 3)(x - 5))].

Factor and cancel [(x + 3)]: simplified form is [(x - 2) / (x - 5)].

- [x = -3]: factor canceled → **hole**. Evaluate simplified form: [f(-3) = (-5) / (-8) = 5/8]. Hole at [(-3, 5/8)].
- [x = 5]: factor remains in denominator → **VA at [x = 5]**.

**Example 2:** Classify denominator zeros for [y = (x + 1)(x - 2)² / ((x - 2)(x + 1)²)].

Cancel one [(x - 2)] and one [(x + 1)]: simplified form is [(x + 1)(x - 2) / (x + 1)]... wait, let's recount.

After canceling: [(x - 2) / (x + 1)].

- [x = 2]: factor fully canceled → **hole**. Simplified value: [(0) / (3)] = 0. Hole at [(2, 0)].
- [x = -1]: [(x + 1)] remains in denominator → **VA at [x = -1]**.

**Example 3:** Construct a function with a hole at [x = 3], VAs at [x = 1] and [x = -4].

Place [(x - 3)] in both numerator and denominator for the hole. Place [(x - 1)] and [(x + 4)] in the denominator only:

[f(x) = (x - 3) / ((x - 3)(x - 1)(x + 4))]

## Guided Practice

### Section: text

**Problem 1:** Find all holes and VAs of [g(x) = (x² - 5x + 6) / (x - 2)].
*Hint:* Factor the numerator. What cancels? What remains?

**Problem 2:** Write one-sided limit statements at [x = 2] for [g(x) = (x - 2)(x + 4) / ((x - 2)(x - 3))].
*Hint:* Cancel [(x - 2)] first. Since it canceled completely, both limits should be equal. Evaluate the simplified form at [x = 2].

**Problem 3:** Sketch a rational function with a hole at [x = 1] and a VA at [x = 4] where [lim(x→4⁻) f(x) = +∞] and [lim(x→4⁺) f(x) = -∞].

## Independent Practice

### Section: text

**Problem 1:** Find all holes and VAs of [f(x) = (x - 1)(x - 5) / ((x - 5)(x + 2))]. Give the coordinates of each hole.

**Problem 2:** Write the equation of a rational function with holes at [x = 2] and [x = 5], a VA at [x = 0], and a zero at [x = 1].

**Problem 3:** How many VAs and holes does [f(x) = (x² - 6x + 3) / ((x² - 2)(x² - 3x - 5)²)] have? *Hint:* Factor and look for common factors.

## Reflection

### Section: text

**Exit Ticket:** Classify each: [f(x) = (x - 3)(x + 1) / (x - 3)] has a ___ at [x = ___]. [g(x) = (x + 2) / (x - 3)] has a ___ at [x = ___].

**Lesson Summary:** Holes and vertical asymptotes both arise from denominator zeros, but they behave differently. A hole occurs when a factor cancels — both sides approach the same finite value. A VA occurs when a factor remains — the function diverges to [±∞]. Always factor completely and cancel before classifying.
