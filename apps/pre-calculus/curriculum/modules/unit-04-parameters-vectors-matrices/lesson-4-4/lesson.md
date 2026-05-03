# Lesson 4-4 — Parametrically Defined Circles and Lines

Unit: 4
Topic: 4.4
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

The equation [x^2 + y^2 = 25] describes a circle of radius 5. But how would you write parametric equations for it? If [x = 5cos(t)] and [y = 5sin(t)], then [x^2 + y^2 = 25cos^2(t) + 25sin^2(t) = 25] — it works! Parametric representations of circles and lines unlock powerful tools for describing paths and geometric objects.

## Vocabulary

### Section: text

- **Parametric equation of a line**: Given a point [(x_0, y_0)] and a direction vector [langle a, brangle]: [x = x_0 + at], [y = y_0 + bt].
- **Parametric equation of a circle**: A circle of radius [r] centered at [(h, k)]: [x = h + rcos(t)], [y = k + rsin(t)].
- **Orientation**: The direction the curve is traced as [t] increases (counterclockwise for the standard circle parameterization).

## Learn

### Section: text

**Parametric lines**: A line through [(x_0, y_0)] moving in direction [langle a, brangle] is:

\[ x = x_0 + at, quad y = y_0 + bt \]

As [t] increases, the point moves along the line in the direction of [langle a, brangle]. The slope of the line is [frac{b}{a}] (when [a neq 0]).

**Parametric circles**: A circle of radius [r] centered at [(h, k)]:

\[ x = h + rcos(t), quad y = k + rsin(t) \]

As [t] goes from [0] to [2pi], the point traces the circle once, counterclockwise, starting from [(h + r, k)].

**Eliminating the parameter**: For the circle, [x - h = rcos(t)] and [y - k = rsin(t)], so [(x - h)^2 + (y - k)^2 = r^2cos^2(t) + r^2sin^2(t) = r^2]. This recovers the standard circle equation.

**Why parametric?** A circle cannot be written as a single function [y = f(x)] (it fails the vertical line test). Parametric equations bypass this limitation.

## Worked Example

### Section: text

**Example 1:** Write parametric equations for a circle of radius 3 centered at [(1, -2)].

**Solution:** [x = 1 + 3cos(t)], [y = -2 + 3sin(t)]

**Verification**: [(x - 1)^2 + (y + 2)^2 = 9cos^2(t) + 9sin^2(t) = 9]. ✓

**Example 2:** Write parametric equations for the line through [(2, 3)] with direction [langle -1, 4rangle].

**Solution:** [x = 2 - t], [y = 3 + 4t]

**Verification**: [frac{dy}{dx} = frac{4}{-1} = -4]. The line passes through [(2, 3)] at [t = 0] and has slope [-4]. ✓

## Guided Practice

### Section: text

**Problem 1:** Write parametric equations for a circle of radius 4 centered at the origin.

**Hint:** Use [x = rcos(t)] and [y = rsin(t)] with [r = 4].

**Problem 2:** Write parametric equations for the line through [(5, 1)] and [(8, 7)].

**Hint:** The direction vector is [langle 8 - 5, 7 - 1rangle = langle 3, 6rangle].

## Independent Practice

### Section: text

**Problem 1:** Write parametric equations for the line through [(-1, 4)] with slope [frac{2}{3}].

**Problem 2:** A circle has parametric equations [x = 2cos(t)] and [y = 2sin(t) + 3]. Find its center and radius.

**Problem 3:** Eliminate the parameter from [x = 3 - 2t], [y = 1 + 5t] to find the Cartesian equation of the line.

## Reflection

### Section: text

**Exit Ticket:** Write parametric equations for a circle of radius 6 centered at [(-2, 5)].

**Lesson Summary:** Circles and lines are easily represented in parametric form. Circles use cosine and sine; lines use a point plus a direction vector scaled by [t]. Parametric form overcomes the limitation that circles cannot be written as [y = f(x)].
