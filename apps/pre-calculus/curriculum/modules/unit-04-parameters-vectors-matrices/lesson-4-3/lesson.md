# Lesson 4-3 — Parametric Functions and Rates of Change

Unit: 4
Topic: 4.3
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

A particle moves along the path $x(t) = t^2$ and $y(t) = 2t + 1$. Between $t = 1$ and $t = 3$, how fast does the particle move horizontally? Vertically? How fast is it approaching the point $(9, 7)$? Rates of change in parametric functions require us to look at each coordinate independently.

## Vocabulary

### Section: text

- **Average rate of change of a parametric function**: The change in each coordinate divided by the change in $t$: $\frac{\Delta x}{\Delta t}$ and $\frac{\Delta y}{\Delta t}$.
- **Instantaneous rate of change**: The rate at a single value of $t$, approximated by shrinking the interval around that value.
- **$\frac{\Delta y}{\Delta x}$**: The secant slope between two positions, found by dividing the change in $y$ by the change in $x$.

## Learn

### Section: text

For a parametric function $(x(t), y(t))$, the **average rate of change** over $[t_1, t_2]$ is computed separately for each coordinate:

$$\frac{\Delta x}{\Delta t} = \frac{x(t_2) - x(t_1)}{t_2 - t_1}, \quad \frac{\Delta y}{\Delta t} = \frac{y(t_2) - y(t_1)}{t_2 - t_1}$$

These tell you how fast $x$ and $y$ are changing per unit of $t$.

**Secant slope**: The slope between the two positions in the $xy$-plane is:

$$\frac{\Delta y}{\Delta x} = \frac{\Delta y / \Delta t}{\Delta x / \Delta t}$$

This ratio removes $t$ and gives the rate at which $y$ changes relative to $x$. When $\Delta x = 0$ and $\Delta y ≠ 0$, the secant is vertical. If both changes are zero, the two positions do not determine a secant line.

**Interpreting signs**:
- $\frac{\Delta x}{\Delta t} > 0$: net movement to the right. $\frac{\Delta x}{\Delta t} < 0$: net movement to the left.
- $\frac{\Delta y}{\Delta t} > 0$: net upward movement. $\frac{\Delta y}{\Delta t} < 0$: net downward movement.

## Worked Example

### Section: text

**Example:** Given $x(t) = t^2$ and $y(t) = 2t + 1$.

**(a)** Find the average rate of change of $x$ and $y$ on $[1, 3]$.
- $\frac{\Delta x}{\Delta t} = \frac{x(3) - x(1)}{3 - 1} = \frac{9 - 1}{2} = 4$
- $\frac{\Delta y}{\Delta t} = \frac{y(3) - y(1)}{3 - 1} = \frac{7 - 3}{2} = 2$

**(b)** Estimate the slope near $t = 3$ with the secant over $[2, 3]$:
- $\frac{\Delta x}{\Delta t} = \frac{9 - 4}{1} = 5$, $\frac{\Delta y}{\Delta t} = \frac{7 - 5}{1} = 2$
- $\frac{\Delta y}{\Delta x} = \frac{2}{5} = 0.4$

**(c)** Interpret: On $[2, 3]$, the average horizontal rate is 5 units per second and the average vertical rate is 2 units per second. The secant slope is $2/5$. These are interval averages, not exact instantaneous rates at $t = 3$.

## Guided Practice

### Section: text

**Problem 1:** For $x(t) = 3t - 1$ and $y(t) = t^2$, find $\frac{\Delta x}{\Delta t}$ and $\frac{\Delta y}{\Delta t}$ on $[0, 2]$.

**Hint:** Compute $x(2) - x(0)$ and $y(2) - y(0)$, each divided by 2.

**Problem 2:** Using the results from Problem 1, find $\frac{\Delta y}{\Delta x}$ over this interval.

## Independent Practice

### Section: text

**Problem 1:** For $x(t) = \cos(t)$ and $y(t) = \sin(t)$, compute $\frac{\Delta x}{\Delta t}$ and $\frac{\Delta y}{\Delta t}$ on $[0, \frac{\pi}{2}]$. What is $\frac{\Delta y}{\Delta x}$ over this interval?

**Problem 2:** A particle has $x(t) = t^3 - t$ and $y(t) = t^2$. Estimate the slope near $t = 2$ by computing $\frac{\Delta y}{\Delta t}$ and $\frac{\Delta x}{\Delta t}$ on $[1.5, 2]$.

**Problem 3:** When is a secant horizontal? Explain why $\Delta y = 0$ also requires $\Delta x ≠ 0$.

## Reflection

### Section: text

**Exit Ticket:** For $x(t) = 4t$ and $y(t) = t^2 - 3$, find $\frac{\Delta y}{\Delta x}$ on $[1, 3]$.

**Lesson Summary:** Rates of change in parametric functions are computed per-coordinate. The slope $\frac{\Delta y}{\Delta x} = \frac{\Delta y / \Delta t}{\Delta x / \Delta t}$ describes how the curve rises relative to how it runs in the $xy$-plane.
