# Lesson 1-13 — Function Model Selection and Assumption Articulation

Unit: 1
Topic: 1.13
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

You're given a table of data showing the weight of a baby at various ages. How do you decide whether to fit a linear, quadratic, or cubic model? Look at the **successive differences** in the data: if the first differences are roughly constant, the data is linear. If the second differences are roughly constant, it's quadratic. Today we learn how to select the right model and check our choice using residuals.

## Vocabulary

### Section: text

- **Regression** — A statistical method for fitting a function to a set of data points.
- **Residual** — The difference between an actual value and the predicted value: [Residual = y - ŷ]. Positive means the model underestimates; negative means it overestimates.
- **Residual plot** — A scatter plot of x-values vs. residuals. No pattern suggests a good fit; a pattern suggests a poor fit.
- **Interpolation** — Using the model to predict within the data's range.
- **Extrapolation** — Using the model to predict beyond the data's range (less reliable).

## Learn

### Section: text

**EK 1.13.A.1:** Model selection depends on data behavior:
- **Linear** models fit data with approximately constant rates of change.
- **Quadratic** models fit data with linearly changing rates of change.
- **Cubic and higher** models fit data with more complex curvature.

**EK 1.13.A.2:** Residuals measure model fit. A residual plot with **no pattern** suggests a good fit; a **pattern** suggests the model is inappropriate.

**EK 1.13.A.3:** All models have domain restrictions and assumptions. You must articulate what the model assumes and identify where it breaks down.

### Model Selection Framework

Before computing a regression, answer these questions:
1. What pattern does the scatter plot show? (Rising, falling, curving?)
2. What do the successive differences reveal?
3. Which function type matches this pattern?
4. **Justify your choice in writing.**

## Worked Example

### Section: text

**Example 1:** Baby weight data: [t] (weeks): 4, 5, 6, 8, 12 → [W(t)] (kg): 4.2, 4.4, 4.8, 5.1, 5.7.

First differences: 0.2, 0.4, 0.3, 0.6. These are approximately constant → **linear model is appropriate**.

**(a)** Linear regression: [W(t) = 0.186t + 3.487].

**(b)** Predicted weight at 10 weeks: [W(10) = 0.186(10) + 3.487 = 5.347] kg.

**(c)** Residual for the 5-week-old baby (actual weight 4.4 kg): [ŷ = 0.186(5) + 3.487 = 4.417]. Residual = [4.4 - 4.417 = -0.017] kg. "The model slightly overestimates."

**Example 2:** Data: [x]: 0, 0.4, 0.9, 1.2, 1.7, 2.2, 2.9, 3.4 → [y]: 5, 10.6, 15.4, 17.1, 18.0, 16.5, 10.2, 2.8.

The data rises then falls. First differences go positive then negative → **quadratic or cubic model** is appropriate. A quadratic model captures the single turning point well.

## Guided Practice

### Section: text

**Problem 1:** A baby that was 7.5 weeks old had a residual of -0.7 kg. The model is [W(t) = 0.186t + 3.487]. What was the actual weight?
*Hint:* Actual = Predicted + Residual. First compute [W(7.5)].

**Problem 2:** Justin Kickoff data: [t]: 0.1, 0.5, 0.9, 1.5, 1.9, 2.3, 2.6 → [H(t)]: 1.4, 5.7, 8.4, 9.6, 8.4, 5.6, 2.5. Is linear, quadratic, or cubic most appropriate? Explain using the shape of the data.
*Hint:* The data rises to a peak then falls symmetrically.

**Problem 3:** UK female doctors: [t]: 0, 4, 7, 13, 17, 22, 25 → [F(t)]: 23, 28, 30.5, 36, 42, 47, 50. Why is linear regression appropriate here?
*Hint:* Compute first differences and check if they're approximately constant.

## Independent Practice

### Section: text

**Problem 1:** Amazon stock: [t]: 0, 1, 13.5, 19, 26.5, 31.5, 35 → [A(t)]: 87.58, 124.15, 164.61, 185.97, 152.60, 122.42, 90.98. Is linear, quadratic, or cubic most appropriate? Justify by examining the rate of change pattern.

**Problem 2:** A residual plot shows points curving upward then downward. What does this suggest about the model type?

**Problem 3:** A model predicts a value of 42.5 for a data point where the actual value is 39.8. Compute the residual and interpret: does the model overestimate or underestimate?

## Reflection

### Section: text

**Exit Ticket:** Given a data table, which model type is most appropriate? Justify in one sentence using evidence from the data pattern.

**Lesson Summary:** Model selection starts with examining the data's pattern through successive differences and scatter shape. Linear fits constant rates, quadratic fits linearly changing rates, and cubic fits more complex curves. Residuals — the gap between actual and predicted — tell you how well the model fits. Always justify your model choice before computing the regression.
