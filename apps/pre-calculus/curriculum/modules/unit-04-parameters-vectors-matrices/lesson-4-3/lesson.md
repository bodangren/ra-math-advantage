# Lesson 4-3 — Parametric Functions and Rates of Change

Unit: 4
Topic: 4.3
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

A particle moves along the path [x(t) = t^2] and [y(t) = 2t + 1]. Between [t = 1] and [t = 3], how fast does the particle move horizontally? Vertically? How fast is it approaching the point [(9, 7)]? Rates of change in parametric functions require us to look at each coordinate independently.

## Vocabulary

### Section: text

- **Average rate of change of a parametric function**: The change in each coordinate divided by the change in [t]: [frac{Delta x}{Delta t}] and [frac{Delta y}{Delta t}].
- **Instantaneous rate of change**: The rate at a single value of [t], approximated by shrinking the interval around that value.
- **[frac{dy}{dx}]**: The slope of the parametric curve at a point, found by dividing the rate of change in [y] by the rate of change in [x]: [frac{dy/dt}{dx/dt}].

## Learn

### Section: text

For a parametric function [(x(t), y(t))], the **average rate of change** over [[t_1, t_2]] is computed separately for each coordinate:

\[ frac{Delta x}{Delta t} = frac{x(t_2) - x(t_1)}{t_2 - t_1}, quad frac{Delta y}{Delta t} = frac{y(t_2) - y(t_1)}{t_2 - t_1} \]

These tell you how fast [x] and [y] are changing per unit of [t].

**Slope of the parametric curve**: The slope of the curve in the [xy]-plane is:

\[ frac{dy}{dx} = frac{Delta y / Delta t}{Delta x / Delta t} \]

This ratio removes [t] and gives the rate at which [y] changes relative to [x]. When [frac{Delta x}{Delta t} = 0], the tangent is vertical (undefined slope).

**Interpreting signs**:
- [frac{Delta x}{Delta t} > 0]: moving right. [frac{Delta x}{Delta t} < 0]: moving left.
- [frac{Delta y}{Delta t} > 0]: moving up. [frac{Delta y}{Delta t} < 0]: moving down.

## Worked Example

### Section: text

**Example:** Given [x(t) = t^2] and [y(t) = 2t + 1].

**(a)** Find the average rate of change of [x] and [y] on [[1, 3]].
- [frac{Delta x}{Delta t} = frac{x(3) - x(1)}{3 - 1} = frac{9 - 1}{2} = 4]
- [frac{Delta y}{Delta t} = frac{y(3) - y(1)}{3 - 1} = frac{7 - 3}{2} = 2]

**(b)** Find the slope of the curve at [t = 3] (using the interval [[2, 3]] for approximation):
- [frac{Delta x}{Delta t} = frac{9 - 4}{1} = 5], [frac{Delta y}{Delta t} = frac{7 - 5}{1} = 2]
- [frac{dy}{dx} = frac{2}{5} = 0.4]

**(c)** Interpret: At [t = 3], the particle moves rightward 5 units per second and upward 2 units per second. The path has a slope of [frac{2}{5}].

## Guided Practice

### Section: text

**Problem 1:** For [x(t) = 3t - 1] and [y(t) = t^2], find [frac{Delta x}{Delta t}] and [frac{Delta y}{Delta t}] on [[0, 2]].

**Hint:** Compute [x(2) - x(0)] and [y(2) - y(0)], each divided by 2.

**Problem 2:** Using the results from Problem 1, find [frac{dy}{dx}] over this interval.

## Independent Practice

### Section: text

**Problem 1:** For [x(t) = cos(t)] and [y(t) = sin(t)], compute [frac{Delta x}{Delta t}] and [frac{Delta y}{Delta t}] on [[0, frac{pi}{2}]]. What is [frac{dy}{dx}] over this interval?

**Problem 2:** A particle has [x(t) = t^3 - t] and [y(t) = t^2]. Find [frac{dy}{dx}] at [t = 2] by computing [frac{Delta y}{Delta t}] and [frac{Delta x}{Delta t}] on [[1.5, 2]].

**Problem 3:** At what [t] values would the tangent line to a parametric curve be horizontal?

## Reflection

### Section: text

**Exit Ticket:** For [x(t) = 4t] and [y(t) = t^2 - 3], find [frac{dy}{dx}] on [[1, 3]].

**Lesson Summary:** Rates of change in parametric functions are computed per-coordinate. The slope [frac{dy}{dx} = frac{Delta y / Delta t}{Delta x / Delta t}] describes how the curve rises relative to how it runs in the [xy]-plane.
