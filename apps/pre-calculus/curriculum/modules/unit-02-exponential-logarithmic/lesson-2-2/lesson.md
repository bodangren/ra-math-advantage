# Lesson 2-2 — Change in Linear and Exponential Functions

Unit: 2
Topic: 2.2
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

A biologist tracks a rumor spreading through a prairie dog colony. On day 3, 43 animals have heard it. By day 6, 140 know. Is this population growing by a constant number each day, or by a constant percentage? How would each type of growth change your prediction for day 10?

## Vocabulary

### Section: text

- **Constant rate of change**: A fixed amount added per unit of input change. Characteristic of linear functions — if [x] increases by 1, [y] increases by the same amount every time.
- **Constant proportional change**: A fixed multiplier applied per unit of input change. Characteristic of exponential functions — if [x] increases by 1, [y] is multiplied by the same factor every time.
- **Linear model**: A function of the form [f(x) = mx + b] where [m] is the slope (constant rate of change).
- **Exponential model**: A function of the form [f(x) = a \cdot b^x] where [b] is the growth/decay factor.

## Learn

### Section: text

Linear and exponential functions are the continuous counterparts of arithmetic and geometric sequences. The parallel structure is:

| Sequence type | Continuous counterpart | Formula | What is constant? |
|---|---|---|---|
| Arithmetic | Linear | [f(x) = b + mx] | Difference ([y_2 - y_1 = m \cdot \Delta x]) |
| Geometric | Exponential | [f(x) = a \cdot b^x] | Ratio ([y_2 / y_1 = b^{\Delta x}]) |

To determine function type from a table: compute the differences between outputs over equal-length input intervals. If differences are constant, the data is linear. If not, compute ratios. If ratios are constant, the data is exponential. If neither is constant, the data fits neither model — and "neither" is always a valid answer.

To construct a model from two data points:
- **Linear**: Use [m = (y_2 - y_1)/(x_2 - x_1)] and write [f(x) = m(x - x_1) + y_1].
- **Exponential**: Use [b^{(x_2 - x_1)} = y_2 / y_1] to solve for [b], then write [f(x) = y_1 \cdot b^{(x - x_1)}].

## Worked Example

### Section: text

**Example 1:** A theater adds a constant number of seats per row. Row 5 has 31 seats; row 11 has 49 seats. How many seats in row 25?

**Solution:**
This is an arithmetic sequence (linear model).
\[d = \frac{49 - 31}{11 - 5} = \frac{18}{6} = 3 \text{ seats per row}\]
\[a_{25} = 31 + 3(25 - 5) = 31 + 60 = 91 \text{ seats}\]

**Example 2:** A rumor reaches 43 people on day 3 and 140 people on day 6. Model with a geometric sequence and predict day 10.

**Solution:**
\[r^3 = \frac{140}{43} \implies r = \left(\frac{140}{43}\right)^{1/3} \approx 1.485\]
\[g_{10} = 43 \cdot r^{(10-3)} = 43 \cdot \left(\frac{140}{43}\right)^{7/3} \approx 1012 \text{ people}\]

## Guided Practice

### Section: text

**Problem 1:** Determine if each data set is linear, exponential, or neither.

a) [x]: 0, 3, 6, 9, 12 \quad [f(x)]: 7, 5, 3, 1, -1

b) [x]: 1, 2, 3, 4, 5 \quad [g(x)]: 0, 1, 4, 9, 16

c) [x]: 0, 2, 4, 6, 8 \quad [h(x)]: 1, 2, 4, 8, 16

**Hint:** Compute differences first. If constant, it is linear. If not, compute ratios. If constant, it is exponential. If neither is constant, classify as "neither."

**Problem 2:** A meme is viewed by 2,500 people at hour 3 and 20,000 at hour 6. Using a geometric model, how many people will have viewed it by hour 10?

**Hint:** Find [r^3 = 20000/2500 = 8], so [r = 2]. Then [g_{10} = 2500 \cdot 2^7].

## Independent Practice

### Section: text

**Problem 1:** Classify as linear, exponential, or neither:

a) [x]: 0, 2, 4, 6, 8 \quad [f(x)]: 1/2, 2, 8, 32, 128

b) [x]: 1, 2, 3, 4, 5 \quad [g(x)]: -1, 0, 2, 5, 9

c) [x]: 10, 20, 30, 40, 50 \quad [h(x)]: 100, 50, 25, 12.5, 6.25

**Problem 2:** Airport flights are modeled by an arithmetic sequence. At 5 AM (hour 5), 11,750 passengers have been processed. At 11 AM, 22,250 have been processed. Predict passengers processed by 6 PM (hour 18).

**Problem 3:** Bald eagle nesting pairs: 417 pairs in 1963 (year 0) and 71,400 pairs in 2019 (year 56). Using a geometric model, estimate nesting pairs in the year 2000.

## Reflection

### Section: text

**Exit Ticket:** Given [x]: 10, 20, 30, 40, 50 and [h(x)]: 100, 50, 25, 12.5, 6.25 — is this linear, exponential, or neither? Justify with calculations.

**Lesson Summary:** Linear functions have constant additive change; exponential functions have constant proportional change. From a table, compute differences to test for linearity or ratios to test for exponentiality. Given two data points, you can construct either model — the choice depends on which quantity stays constant in the data. Not all real-world data fits either model.
