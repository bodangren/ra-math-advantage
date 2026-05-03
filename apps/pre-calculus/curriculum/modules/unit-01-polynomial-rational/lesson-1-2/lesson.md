# Lesson 1-2 — Rates of Change

Unit: 1
Topic: 1.2
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

A town's population is recorded every 5 years:

| Year | 2000 | 2005 | 2010 | 2015 |
|---|---|---|---|---|
| Population | 12,400 | 15,800 | 18,600 | 20,200 |

How fast is the population growing per year between 2000 and 2005? Between 2010 and 2015? Is the growth rate speeding up or slowing down? This lesson formalizes the "how fast" question into a precise calculation.

## Vocabulary

### Section: text

- **Average rate of change (AROC)**: The ratio [frac{f(b) - f(a)}{b - a}] — measures how fast the output changes per unit of input over the interval [[a, b]].
- **Secant line**: The line passing through [(a, f(a))] and [(b, f(b))] on the graph. Its slope equals the average rate of change.
- **Slope**: The rate of change is essentially the same as slope. Anytime you see "rate of change," think "slope."
- **Numerator**: [f(b) - f(a)] — the total change in output.
- **Denominator**: [b - a] — the total change in input.

## Learn

### Section: text

The **average rate of change** of a function [f] over the interval [[a, b]] is:

\[ frac{f(b) - f(a)}{b - a} \]

This represents the **slope of the secant line** connecting [(a, f(a))] and [(b, f(b))].

Key ideas:
- A **positive** rate of change means the function is **increasing** over the interval.
- A **negative** rate of change means the function is **decreasing** over the interval.
- A **zero** rate of change means the function is **constant** over the interval.
- The units of rate of change are units of **output** divided by units of **input** (e.g., feet per second, dollars per year).

**Roller coaster analogy**: "Going up" = positive rate of change. "Going down" = negative rate of change. At the very top of a peak or bottom of a valley, the rate of change is zero — the instant between going up and going down.

**Important**: In AP Precalculus, we cannot find the exact rate of change *at* a single point (that requires calculus). But we can determine whether the rate of change at a point is positive, negative, or zero by looking at the graph.

**Common mistake**: Computing [f(b) - f(a)] alone gives the *total change*, not the *rate*. Always divide by [b - a].

## Worked Example

### Section: text

**Example 1:** Find the average rate of change of [f(x) = x^2] on [[1, 4]].

**Solution:**
- [f(1) = 1^2 = 1]
- [f(4) = 4^2 = 16]
- AROC = [frac{16 - 1}{4 - 1} = frac{15}{3} = 5]
- Interpretation: "The function increases by an average of 5 units for each 1-unit increase in [x] on the interval [[1, 4]]."

**Example 2:** A population table shows town population at 5-year intervals:

| t (years) | 0 | 5 | 10 | 15 |
|---|---|---|---|---|
| P(t) | 12,400 | 15,800 | 18,600 | 20,200 |

**Solution:**
- AROC on [[0, 5]]: [frac{15800 - 12400}{5} = frac{3400}{5} = 680] people/year
- AROC on [[5, 10]]: [frac{18600 - 15800}{5} = frac{2800}{5} = 560] people/year
- AROC on [[10, 15]]: [frac{20200 - 18600}{5} = frac{1600}{5} = 320] people/year
- The growth rate is slowing — the town is adding fewer people per year each interval.

**Example 3:** Find the average rate of change of [C(t) = 500(1.08)^t] from [t = 2] to [t = 5].

**Solution:**
- [C(2) = 500(1.08)^2 approx 583.20]
- [C(5) = 500(1.08)^5 approx 734.66]
- AROC = [frac{734.66 - 583.20}{3} approx 50.55] dollars per year
- Interpretation: "The cost increases by an average of approximately $50.55 per year from year 2 to year 5."

## Guided Practice

### Section: text

**Problem 1:** Find the average rate of change of [g(x) = 3x - 7] on [[2, 6]].

**Hint:** Evaluate [g(2)] and [g(6)], then apply the formula [frac{g(6) - g(2)}{6 - 2}].

**Problem 2:** The function [h(t)] gives the temperature in degrees Fahrenheit after [t] hours. [h(3) = 72] and [h(7) = 58]. Find the average rate of change and interpret it with units.

**Hint:** The units will be degrees Fahrenheit per hour.

## Independent Practice

### Section: text

**Problem 1:** Find the average rate of change of [f(x) = x^2 + 2x] on [[1, 3]]. Interpret your result.

**Problem 2:** A car's distance from home is modeled by [d(t)] where [t] is in hours. [d(1) = 30] miles and [d(4) = 150] miles. Find the average rate of change and explain what it means in context.

**Problem 3:** The average rate of change of a function [k] on [[2, 5]] is [-4]. If [k(2) = 10], find [k(5)].

## Reflection

### Section: text

**Exit Ticket:** Find the average rate of change of [g(x) = 3x - 7] on [[2, 6]] and state what it means.

**Lesson Summary:** The average rate of change is [frac{f(b) - f(a)}{b - a}] — it equals the slope of the secant line. Positive means increasing, negative means decreasing, zero means constant. Always include units in your interpretation, and remember: rate of change measures *direction of movement*, not *position*.
