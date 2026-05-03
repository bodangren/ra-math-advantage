# Lesson 3-15 — Rates of Change in Polar Functions

Unit: 3
Topic: 3.15
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

For [r = 3cos(theta)], when [theta = 0] we get [r = 3] and when [theta = pi/2] we get [r = 0]. The radius decreased. But what if [r] were negative? If [r = -2] and increases to [r = -1], the actual distance from the origin *decreases* — the point moves closer. How does the sign of [r] change the relationship between the direction of [r] and the distance from the origin?

## Vocabulary

### Section: text

- **Signed radius**: [r] can be positive or negative. When [r < 0], the point plots in the opposite direction from [theta], but the **distance** from the origin is [|r|].
- **Distance-from-origin behavior**: Determined by both the sign and the monotonicity (increasing/decreasing) of [r].
- **Average rate of change**: [frac{f(b) - f(a)}{b - a}] over the interval [[a, b]] — the rate at which [r] changes per radian of [theta].
- **Relative extremum**: Where [r] changes from increasing to decreasing (relative max) or decreasing to increasing (relative min), corresponding to a point farthest from or closest to the origin.

## Learn

### Section: text

Given a polar function [r = f(theta)], the value [r] is a **signed radius**. The actual distance from the origin is [|r|]. This means the sign of [r] affects how we interpret increasing and decreasing behavior:

| [r] behavior | Distance to origin |
|---|---|
| [r] positive and increasing | Distance increasing |
| [r] positive and decreasing | Distance decreasing |
| [r] negative and increasing | Distance **decreasing** |
| [r] negative and decreasing | Distance **increasing** |

The key insight: when [r] is negative, increasing [r] means moving *toward* zero (closer to the origin), and decreasing [r] means moving *away from* zero (farther from the origin).

**Relative extrema**: If [r] changes from increasing to decreasing (or vice versa), the function has a relative extremum — a point closest to or farthest from the origin.

**Average rate of change** of [r] with respect to [theta] over [[a, b]]:

\[ frac{f(b) - f(a)}{b - a} \]

This measures the rate at which the radius changes per radian. It can estimate [f(theta)] within the interval using point-slope form: [r - r_1 = text{(avg rate)}(theta - theta_1)].

**AP exam tip**: It often helps to sketch [r = f(theta)] in rectangular coordinates (with [theta] on the horizontal axis and [r] on the vertical axis) to visualize sign and monotonicity.

## Worked Example

### Section: text

**Example 1:** For a polar function, [r] is positive and increasing on [[0, pi/2]]. What happens to the distance from the origin?

**Solution:**
- [r] positive: distance equals [r].
- [r] increasing: distance is **increasing**. The point moves away from the origin.

**Example 2:** [r] is negative and increasing on [[pi, 3pi/2]]. What happens to the distance?

**Solution:**
- [r] negative: distance equals [-r].
- [r] increasing (becoming less negative): [-r] is **decreasing**.
- Distance is **decreasing**. The point moves closer to the origin.

**Example 3:** For a polar function, [f(pi/6) = 2] and [f(pi/3) = 5]. Find the average rate of change on [[pi/6, pi/3]].

**Solution:**
- [frac{5 - 2}{pi/3 - pi/6} = frac{3}{pi/6} = frac{18}{pi}]
- The radius increases by [18/pi] units per radian on this interval.

**Example 4:** Using Example 3, estimate [f(pi/4)].

**Solution:**
- Point-slope from [theta_1 = pi/6], [r_1 = 2]:
- [r - 2 = frac{18}{pi}(pi/4 - pi/6) = frac{18}{pi} cdot frac{pi}{12} = frac{3}{2}]
- [r approx 2 + 1.5 = 3.5]

## Guided Practice

### Section: text

**Problem 1:** [r] is negative and decreasing on [[pi, 3pi/2]]. Is the distance from the origin increasing or decreasing?

**Hint:** If [r] is negative, distance is [-r]. A decreasing [r] (more negative) means [-r] is increasing.

**Problem 2:** [f(0) = 3] and [f(pi/2) = 0]. Find the average rate of change on [[0, pi/2]].

**Hint:** Apply [frac{f(b) - f(a)}{b - a}].

**Problem 3:** On which interval is the average rate of change equal to zero: [[0, pi/4]], [[pi/4, pi/2]], [[pi/2, 3pi/4]]? You are given that [f(0) = 2], [f(pi/4) = 4], [f(pi/2) = 4], [f(3pi/4) = 2].

**Hint:** Zero average rate of change means [f(b) = f(a)].

## Independent Practice

### Section: text

**Problem 1:** For a polar function [r = f(theta)], complete the table:

| Interval | [r] positive/negative? | [r] increasing/decreasing? | Distance behavior |
|---|---|---|---|
| [[0, pi/4]] | positive | increasing | ? |
| [[pi/4, pi/2]] | positive | decreasing | ? |
| [[pi/2, 3pi/4]] | negative | increasing | ? |
| [[3pi/4, pi]] | negative | decreasing | ? |

**Problem 2:** A polar function has [f(pi/8) = 4] and [f(pi/4) = 7]. Estimate [f(3pi/16)] using the average rate of change.

**Problem 3:** On which interval is the average rate of change least: [[0, pi/3]], [[pi/3, 2pi/3]], [[2pi/3, pi]]? Given [f(0) = 6], [f(pi/3) = 3], [f(2pi/3) = -1], [f(pi) = -4].

**Hint:** Compute the average rate of change for each interval and compare.

## Reflection

### Section: text

**Exit Ticket:** For a polar function, [r = 2] when [theta = 0] and [r = 5] when [theta = pi/4]. What is the average rate of change? Estimate [r] when [theta = pi/8].

**Lesson Summary:** The signed radius [r] can be positive or negative, which reverses the distance interpretation when [r < 0]. When [r] is negative and increasing, the distance from the origin is actually decreasing. The average rate of change [frac{f(b) - f(a)}{b - a}] measures how fast the radius changes per radian and enables estimation via point-slope form. Sketching [r = f(theta)] in rectangular coordinates helps visualize sign and monotonicity behavior.
