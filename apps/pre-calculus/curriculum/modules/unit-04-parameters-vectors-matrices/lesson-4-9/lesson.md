# Lesson 4-9 — Vector-Valued Functions

Unit: 4
Topic: 4.9
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

A drone's position at time [t] is given by [mathbf{r}(t) = langle 4t, -16t^2 + 32trangle]. Instead of separate equations for [x] and [y], we write a single function that outputs a **vector**. This is a vector-valued function — it packages a parametric path into one compact object.

## Vocabulary

### Section: text

- **Vector-valued function**: A function [mathbf{r}(t)] whose output is a vector, typically [mathbf{r}(t) = langle x(t), y(t)rangle].
- **Component functions**: The individual functions [x(t)] and [y(t)] inside [mathbf{r}(t)].
- **Position vector**: A vector-valued function [mathbf{r}(t)] that represents the position of an object at time [t].

## Learn

### Section: text

A **vector-valued function** [mathbf{r}(t) = langle f(t), g(t)rangle] maps a scalar [t] to a vector. This is equivalent to a parametric function [(x(t), y(t))] but uses vector notation.

**Evaluating**: Substitute [t] into both component functions:
\[ mathbf{r}(2) = langle f(2), g(2)rangle \]

**Velocity and displacement**: The vector [mathbf{r}(t_2) - mathbf{r}(t_1)] gives the **displacement** from time [t_1] to [t_2].

**Average rate of change**: [frac{mathbf{r}(t_2) - mathbf{r}(t_1)}{t_2 - t_1}] is a vector whose components are [frac{Delta x}{Delta t}] and [frac{Delta y}{Delta t}] — the average velocity vector.

**Graphing**: Plot [mathbf{r}(t)] for several values of [t]. Each output is a point in the plane. Connecting them traces the path.

## Worked Example

### Section: text

**Example:** Let [mathbf{r}(t) = langle t^2, 2t - 1rangle].

**(a)** Evaluate [mathbf{r}(0)], [mathbf{r}(1)], [mathbf{r}(3)]:
- [mathbf{r}(0) = langle 0, -1rangle]
- [mathbf{r}(1) = langle 1, 1rangle]
- [mathbf{r}(3) = langle 9, 5rangle]

**(b)** Find the displacement from [t = 1] to [t = 3]:
\[ mathbf{r}(3) - mathbf{r}(1) = langle 9 - 1, 5 - 1rangle = langle 8, 4rangle \]

**(c)** Find the average rate of change on [[1, 3]]:
\[ frac{mathbf{r}(3) - mathbf{r}(1)}{3 - 1} = frac{langle 8, 4rangle}{2} = langle 4, 2rangle \]

Interpretation: On average, the object moves 4 units right and 2 units up per unit of [t].

## Guided Practice

### Section: text

**Problem 1:** Let [mathbf{r}(t) = langle 3t + 1, t^2rangle]. Find [mathbf{r}(2)] and [mathbf{r}(5)].

**Hint:** Substitute each value of [t] into both components.

**Problem 2:** For [mathbf{r}(t) = langle 3t + 1, t^2rangle], find the average rate of change on [[2, 5]].

## Independent Practice

### Section: text

**Problem 1:** Let [mathbf{r}(t) = langle cos(t), sin(t)rangle]. Evaluate [mathbf{r}(0)], [mathbf{r}(frac{pi}{2})], [mathbf{r}(pi)]. What curve do these points lie on?

**Problem 2:** For [mathbf{r}(t) = langle t^3 - t, 2t + 1rangle], find the displacement from [t = -1] to [t = 2].

**Problem 3:** Explain how a vector-valued function relates to a parametric function. What is the advantage of vector notation?

## Reflection

### Section: text

**Exit Ticket:** Let [mathbf{r}(t) = langle 5 - t, t^2 - 4rangle]. Find [mathbf{r}(1)] and the average rate of change on [[1, 3]].

**Lesson Summary:** Vector-valued functions package parametric paths into vector outputs. The average rate of change produces a velocity vector. Displacement is the difference of position vectors.
