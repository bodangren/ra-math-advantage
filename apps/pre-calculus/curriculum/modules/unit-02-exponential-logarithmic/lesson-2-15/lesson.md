# Lesson 2-15 — Semi-log Plots

Unit: 2
Topic: 2.15
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Exponential data can span many orders of magnitude — from 1 to 1000 to 1,000,000. On a standard linear plot, small values get crushed along the axis while large values dominate. What if we could "flatten" the exponential curve into a straight line?

Consider this data:

| x | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| f(x) | 40 | 60 | 90 | 135 | 203 |

Check the ratios: [60/40 = 1.5], [90/60 = 1.5], [135/90 = 1.5], [203/135 approx 1.5]. The constant ratio confirms exponential behavior.

Now imagine plotting this on a graph where the y-axis is **logarithmically scaled** — the marks read 10, 100, 1000 with equal spacing. On this "semi-log" plot, the exponential data would form a straight line. This is because [log(a cdot b^x) = log(a) + x cdot log(b)], which is linear in [x].

## Vocabulary

### Section: text

- **Semi-log plot**: A graph where one axis (typically the y-axis) uses a logarithmic scale and the other uses a linear scale.
- **Logarithmic scale**: A scale where equal distances represent multiplicative (not additive) steps. Marks at equal intervals might read 1, 10, 100, 1000.
- **Linearity on semi-log**: Exponential data appears as a straight line on a semi-log plot. This is the diagnostic test for exponential behavior.
- **Semi-log linear model**: On a semi-log plot, the linear model is [log_n(y) = log_n(a) + x cdot log_n(b)], where slope = [log_n(b)] and y-intercept = [log_n(a)].
- **Model conversion**: From the semi-log linear model, recover the exponential model [y = a cdot b^x] by computing [b = n^{slope}] and [a = n^{ytext{-intercept}}].

## Learn

### Section: text

**Why exponential data becomes linear on semi-log:**

Given [y = a cdot b^x], take [log_n] of both sides:
\[ log_n(y) = log_n(a cdot b^x) = log_n(a) + x cdot log_n(b) \]

This is a linear equation in [x] with slope [m = log_n(b)] and intercept [c = log_n(a)]. So when we plot [x] vs. [log_n(y)], we get a straight line.

**Key insight:** Logarithmically scaling the y-axis does NOT change the data values — only how they are displayed. Equally-spaced marks on a log-scaled axis represent **multiplicative** (not additive) steps.

**Reading a semi-log plot:**
- If the points fall on a straight line, the data is exponential.
- The steeper the line, the larger the growth rate.
- A downward-sloping line indicates exponential decay.

**Building the exponential model from a semi-log plot:**
1. Find the line of best fit on the semi-log plot: [log(y) = c + mx].
2. Convert: [a = 10^c] and [b = 10^m].
3. Write the exponential model: [y = a cdot b^x].

## Worked Example

### Section: text

**Example 1:** Table: x: 1, 2, 3, 4, 5 → f(x): 40, 60, 90, 135, 203. Confirm exponential and write the model.

Constant ratio: [60/40 = 1.5], [90/60 = 1.5], [135/90 = 1.5]. Confirmed exponential with [b = 1.5].

Semi-log linear model using points (1, 40) and (5, 203):
- Slope = [frac{log(203) - log(40)}{5 - 1} = frac{log(203/40)}{4} = frac{log(5.075)}{4} approx frac{0.705}{4} approx 0.176]
- y-intercept = [log(40) - 0.176(1) = 1.602 - 0.176 = 1.426]
- Convert: [b = 10^{0.176} approx 1.5], [a = 10^{1.426} approx 26.7]
- Exponential model: [y approx 26.7 cdot 1.5^x]

**Example 2:** Which function would appear linear on a semi-log plot?
- (A) [P(t) = 2 + 2t] — No (linear function curves on semi-log)
- (B) [P(t) = 2 + 2^t] — Approximately (exponential with vertical shift)
- (C) [P(t) = 2 + 2 log(t)] — No (log function curves on semi-log)
- (D) [P(t) = 2 cdot 2^t] — Yes (pure exponential, perfectly linear on semi-log)

**Example 3:** Table: x: 10, 20, 30, 40, 50 → g(x): 30, 90, 270, 810, 2430.

Ratios: [90/30 = 3], [270/90 = 3], [810/270 = 3]. Constant ratio [b = 3] — exponential — linear on semi-log.

## Guided Practice

### Section: text

**Problem 1:** Plot the points A(0, 200), B(1, 25), C(2, 7), D(3.2, 800), E(4.6, 1.5) on semi-log axes.

**Hint:** On the log-scaled y-axis, position each point at its [log(y)]-value. For instance, 200 is between 100 and 1000, closer to 100.

**Problem 2:** Table: x: 0, 1, 2, 3, 4 → f(x): 5, 15, 45, 135, 405. Is this exponential? Would it appear linear on a semi-log plot?

**Hint:** Check for a constant ratio between consecutive output values.

**Problem 3:** A semi-log plot shows data points forming a line through (1, 10) and (4, 800). Write the linear model [log(y) = c + mx], then convert to [y = a cdot b^x].

**Hint:** Slope = [frac{log(800) - log(10)}{4 - 1} = frac{log(80)}{3}]. Then [b = 10^m] and [a = 10^c].

## Independent Practice

### Section: text

**Problem 1:** Which dataset would appear linear on a semi-log plot?
- a) x: 1, 2, 3, 4 → y: 3, 6, 12, 24
- b) x: 1, 2, 3, 4 → y: 2, 5, 10, 17
- c) x: 1, 2, 3, 4 → y: 100, 50, 25, 12.5

**Problem 2:** A semi-log plot of data forms a line through (0, 5) and (3, 40). Write the linear model, then find the exponential model [y = a cdot b^x].

**Problem 3:** Table: x: 1, 3, 5, 7, 9 → f(x): 2, 18, 162, 1458, 13122.
- a) Confirm this is exponential by checking ratios.
- b) Write the semi-log linear model.
- c) Convert to [y = a cdot b^x].

**Problem 4:** Explain why equally-spaced marks on a logarithmic y-axis represent multiplicative steps. If the marks read 1, 10, 100, 1000, what is the multiplicative factor between consecutive marks?

## Reflection

### Section: text

**Exit Ticket:** The table x: 10, 20, 30, 40, 50 → g(x): 30, 90, 270, 810, 2430 shows a constant ratio of 3. Would this data appear linear on a semi-log plot? Why? Write the exponential model.

**Lesson Summary:** A semi-log plot uses a logarithmically scaled y-axis. Exponential data [y = a cdot b^x] appears as a straight line on semi-log because [log(y) = log(a) + x cdot log(b)] is linear. Equally-spaced marks on the log axis represent multiplicative (not additive) steps. To build an exponential model from semi-log data: find the linear model [log(y) = c + mx], then convert using [a = 10^c] and [b = 10^m]. Semi-log plots are a powerful diagnostic tool for identifying exponential behavior in real-world data.
