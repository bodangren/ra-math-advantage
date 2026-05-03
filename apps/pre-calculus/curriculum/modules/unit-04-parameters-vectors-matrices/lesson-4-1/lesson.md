# Lesson 4-1 — Parametric Functions

Unit: 4
Topic: 4.1
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

A drone launches from the ground and flies in a straight path. Its horizontal position is [x(t) = 4t] and its vertical position is [y(t) = -16t^2 + 32t], where [t] is time in seconds. Neither equation alone tells the full story — we need *both* to describe the drone's path. This is the power of parametric functions: each output coordinate is its own function of a shared parameter.

## Vocabulary

### Section: text

- **Parametric function**: A pair of equations [x = f(t)] and [y = g(t)] that define both coordinates in terms of a third variable [t], called the **parameter**.
- **Parameter**: The independent variable [t] that controls both [x] and [y] simultaneously. Often represents time, but can represent any quantity.
- **Parametric curve**: The set of all points [(x(t), y(t))] traced as [t] varies over an interval.
- **Eliminate the parameter**: Algebraically combine the two equations to produce a single equation in [x] and [y], removing [t] entirely.

## Learn

### Section: text

A **parametric function** defines a curve using two equations, one for each coordinate:

\[ x = f(t), \quad y = g(t) \]

where [t] is the **parameter**. As [t] changes, both [x] and [y] change, tracing a path through the plane.

**Reading a parametric function**: To plot the curve, create a table of values for [t], compute [x(t)] and [y(t)] for each value, then plot the resulting [(x, y)] points in order.

**Eliminating the parameter**: Solve one equation for [t] and substitute into the other. For example, if [x = t + 1] and [y = t^2], then [t = x - 1], so [y = (x - 1)^2]. This recovers a familiar Cartesian equation but may lose information about the direction or timing of motion.

**Key distinctions from Cartesian functions**:
- Parametric curves can loop, backtrack, and cross themselves — behaviors impossible for [y = f(x)] functions.
- The parameter [t] adds a sense of *process* — the curve is traced over time, not just statically defined.

## Worked Example

### Section: text

**Example 1:** Given [x = 2t + 1] and [y = t^2 - 3], make a table for [t = -1, 0, 1, 2, 3] and plot the points.

| [t] | [x = 2t + 1] | [y = t^2 - 3] | Point |
|-----|--------------|----------------|-------|
| -1 | -1 | -2 | (-1, -2) |
| 0 | 1 | -3 | (1, -3) |
| 1 | 3 | -2 | (3, -2) |
| 2 | 5 | 1 | (5, 1) |
| 3 | 7 | 6 | (7, 6) |

**Example 2:** Eliminate the parameter from [x = 2t + 1] and [y = t^2 - 3].

**Solution:** Solve [x = 2t + 1] for [t]: [t = frac{x - 1}{2}]. Substitute into [y]:

\[ y = left(frac{x - 1}{2}right)^2 - 3 = frac{(x - 1)^2}{4} - 3 \]

This is a parabola with vertex [(1, -3)] opening upward.

## Guided Practice

### Section: text

**Problem 1:** Given [x = 3 - t] and [y = t^2 + 1], find [(x, y)] when [t = -2, 0, 3].

**Hint:** Substitute each value of [t] into both equations.

**Problem 2:** Eliminate the parameter from [x = 3 - t] and [y = t^2 + 1].

**Hint:** Solve the [x] equation for [t], then substitute into the [y] equation.

## Independent Practice

### Section: text

**Problem 1:** Create a table of values and sketch the parametric curve [x = cos(t)], [y = sin(t)] for [t = 0, frac{pi}{2}, pi, frac{3pi}{2}, 2pi]. What shape do the points form?

**Problem 2:** Eliminate the parameter from [x = 5 - 2t] and [y = 3t + 1]. Write the result as a function of [x].

**Problem 3:** Is the curve from Problem 1 a function of [x]? Why or why not?

## Reflection

### Section: text

**Exit Ticket:** Eliminate the parameter from [x = t - 4] and [y = t^2].

**Lesson Summary:** A parametric function uses a parameter [t] to define [x] and [y] separately. By creating tables or eliminating the parameter, we can understand the curve's shape. Parametric curves can represent paths that Cartesian functions [y = f(x)] cannot, including loops and self-intersections.
