# Lesson 2-10 — Inverses of Exponential Functions

Unit: 2
Topic: 2.10
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider the function [f(x) = 2^x]. Its table of values shows a clear pattern:

| x | -1 | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| f(x) | 1/2 | 1 | 2 | 4 | 8 |

The inputs change by **+1** each step (additive), and the outputs **multiply by 2** each step (multiplicative).

Now swap the columns — reverse the roles of input and output:

| x | 1/2 | 1 | 2 | 4 | 8 |
|---|---|---|---|---|---|
| g(x) | -1 | 0 | 1 | 2 | 3 |

What pattern do you see in the new table? The inputs **multiply by 2** (or divide), while the outputs **change by +1** (additive). This reversed pattern is the signature of a **logarithmic function** — the inverse of an exponential function.

## Vocabulary

### Section: text

- **Logarithmic function**: A function of the form [f(x) = a log_b(x)], where [b > 0], [b ne 1], and [a ne 0]. Logarithmic functions are the inverses of exponential functions.
- **Input/output swap**: Exponential functions have additive inputs and multiplicative outputs. Logarithmic functions reverse this: multiplicative inputs and additive (equally spaced) outputs.
- **Reflection over [y = x]**: The graph of [f^{-1}] is the reflection of the graph of [f] across the line [y = x]. If [(x_1, y_1)] is on [f], then [(y_1, x_1)] is on [f^{-1}].
- **Composition verification**: Functions [f] and [g] are inverses if [f(g(x)) = x] and [g(f(x)) = x] for all [x] in the appropriate domains.

## Learn

### Section: text

Exponential and logarithmic functions are inverses. This means their key behaviors reverse:

| Exponential [f(x) = b^x] | Logarithmic [g(x) = log_b(x)] |
|---|---|
| Domain: all reals | Domain: [(0, infty)] |
| Range: [(0, infty)] | Range: all reals |
| Input changes additively | Input changes multiplicatively |
| Output changes multiplicatively | Output changes additively |

**Recognizing logarithmic functions from tables:** If inputs multiply by a constant factor and outputs change by a constant amount, the function is logarithmic.

**Verifying inverses by composition:** If [f(x) = b^x] and [g(x) = log_b(x)], then:
- [f(g(x)) = b^{log_b(x)} = x]
- [g(f(x)) = log_b(b^x) = x]

**Sketching inverse graphs:** Reflect key points of the exponential graph over the line [y = x]. The point [(a, b)] on [f] becomes [(b, a)] on [f^{-1}].

## Worked Example

### Section: text

**Example 1:** Classify each table as logarithmic, exponential, or neither.

| x | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| h(x) | 16 | 8 | 4 | 2 |

**Solution:** Exponential. Outputs halve (constant ratio [1/2]).

| x | 10 | 30 | 90 | 270 |
|---|---|---|---|---|
| k(x) | 10 | 20 | 30 | 40 |

**Solution:** Logarithmic. Inputs multiply by 3; outputs increase by 10.

**Example 2:** Let [f(x) = 3^x] and [g(x) = log_3(x)]. Verify they are inverses.
- [f(g(x)) = 3^{log_3(x)} = x]
- [g(f(x)) = log_3(3^x) = x]

**Example 3:** The graph of [f(x) = 2^x] passes through [(0, 1), (1, 2), (2, 4), (-1, 0.5)]. Sketch [f^{-1}(x) = log_2(x)] by reflecting over [y = x].

**Solution:** Reflect each point: [(0, 1) to (1, 0)], [(1, 2) to (2, 1)], [(2, 4) to (4, 2)], [(-1, 0.5) to (0.5, -1)].

**Example 4:** [h(x) = a^x] contains [(2, 3)] and [(6, 27)]. Find the average rate of change of [y = log_a(x)] over [[3, 27]]. Since the inverse has points [(3, 2)] and [(27, 6)], the rate = [frac{6-2}{27-3} = frac{1}{6}].

## Guided Practice

### Section: text

**Problem 1:** Classify each as logarithmic, exponential, or neither.
- a) x: 0, 3, 6, 9 → f(x): 1, 4, 9, 16
- b) x: 0, 1, 2, 3 → g(x): 1, 4, 16, 64
- c) x: 40, 20, 10, 5 → k(x): -1, -2, -3, -4

**Hint:** Constant ratio in outputs → exponential. Inputs multiply with additive outputs → logarithmic.

**Problem 2:** The graph of [y = 5^x] passes through [(0, 1), (1, 5), (2, 25)]. Reflect each point over [y = x] and sketch [y = log_5(x)].

**Problem 3:** Given [f(x) = a^x] passes through [(3, 8)], find the average rate of change of [log_a(x)] from [x = 2] to [x = 16].

**Hint:** [a^3 = 8] gives [a = 2]. Then [log_2(2) = 1] and [log_2(16) = 4].

## Independent Practice

### Section: text

**Problem 1:** Classify each table.
- a) x: 0, 1, 2, 3 → f(x): 1, 4, 9, 16
- b) x: 1, 2, 4, 8 → h(x): 1, 3, 5, 7
- c) x: 0, 1, 2, 3 → g(x): 1, 4, 16, 64

**Problem 2:** The graph of [y = 4^x] passes through [(0, 1), (1, 4), (2, 16), (-1, 0.25)]. Reflect each point over [y = x] to sketch [y = log_4(x)].

**Problem 3:** [f(x) = a^x] contains [(1, 3)] and [(5, 243)]. Find the average rate of change of [log_a(x)] over [[3, 27]].

## Reflection

### Section: text

**Exit Ticket:** x: 5, 50, 500, 5000 → p(x): 1, 2, 3, 4. Is [p] logarithmic, exponential, or neither? Justify.

**Lesson Summary:** Logarithmic functions are inverses of exponential functions. Exponential has additive inputs and multiplicative outputs; logarithmic reverses this. Verify via composition: [f(f^{-1}(x)) = x].
