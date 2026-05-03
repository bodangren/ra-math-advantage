# Lesson 2-6 — Competing Function Model Validation

Unit: 2
Topic: 2.6
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

You fit a linear model to world population data from 1950 to 2020. The model predicts well at the endpoints but consistently overestimates in the middle years. How can you determine whether the linear model is truly appropriate or whether a different model would fit better? What diagnostic tool reveals what the raw scatterplot might hide?

## Vocabulary

### Section: text

- **Residual**: The difference between the actual output and the predicted output: [e_i = y_i - \hat{y}_i]. Positive residuals mean the model underestimates; negative residuals mean it overestimates.
- **Residual plot**: A scatterplot of input values versus residuals. If the model is appropriate, the plot shows no pattern — points are scattered randomly around zero.
- **Constant rate of change**: Data whose successive differences are approximately equal — a signature of a **linear** model.
- **Constant proportional change**: Data whose successive ratios are approximately equal — a signature of an **exponential** model.
- **U-shaped pattern**: A quadratic signature — residuals alternate sign in a systematic way, indicating the model misses the curvature.

## Learn

### Section: text

Choosing the right model type is essential for accurate predictions. Three model types and their data signatures:

| Model | Formula | Data signature |
|---|---|---|
| Linear | [f(x) = mx + b] | Constant differences in [y] over equal [x]-intervals |
| Quadratic | [f(x) = ax^2 + bx + c] | Rates of change increase or decrease at a constant rate |
| Exponential | [f(x) = a \cdot b^x] | Successive outputs are roughly proportional |

**Residual analysis** is the primary validation tool. Steps:
1. Fit a model to the data.
2. Compute the residual at each point: [e_i = y_i - \hat{y}_i].
3. Plot residuals versus input values.
4. If the residual plot shows no pattern (random scatter), the model is appropriate.
5. If there is a clear pattern (U-shape, trend, fan shape), the model is inappropriate.

**Context matters**: Sometimes one direction of error is more costly. For example, when estimating paint for a mural, underestimating means running out of paint — so the model should underestimate (slightly negative residuals are preferred).

## Worked Example

### Section: text

**Example 1:** Determine the best model type from a scatterplot.

a) [x]: 0, 2, 4, 6, 8 \quad [f(x)]: 11, 8.2, 5, 2.3, -1
**Linear** — differences are approximately -1.5 per 2 units.

b) [x]: -1, 1.5, 4, 6.5, 9 \quad [g(x)]: 2, 5.5, 10.5, 5.75, 2.25
**Quadratic** — values rise then fall in a U-shape.

c) [x]: 1, 3, 5, 7, 9 \quad [h(x)]: 10, 5.2, 2.4, 1.3, 0.7
**Exponential** — ratios are approximately 0.5.

**Example 2:** A linear model for baby weight gives [\hat{W}(2.5) = 5.6] kg. The actual weight is 5.5 kg.

**Solution:**
Residual = [5.5 - 5.6 = -0.1] kg. The model overestimates by 0.1 kg.

## Guided Practice

### Section: text

**Problem 1:** A residual plot for an exponential model shows a clear U-shaped pattern. What does this tell you about the model?

**Hint:** A pattern in residuals means the systematic variation is not captured by the model.

**Problem 2:** Classify each as linear, quadratic, exponential, or neither:

a) [x]: 1, 3, 5, 7, 9 \quad [h(x)]: 9, 7.1, 1, 7.2, 9.1

b) A mutual fund grows approximately 10.4% per year.

**Hint:** For (a), check whether the values follow a U-shape. For (b), proportional growth indicates exponential.

## Independent Practice

### Section: text

**Problem 1:** World population data (1950–2020) is fit with a linear model. At year 1990, the model predicts 5.2 billion but the actual population is 5.3 billion. Compute the residual and interpret its meaning.

**Problem 2:** A scatterplot shows residuals that are all positive for low [x]-values and all negative for high [x]-values, with a smooth transition. What does this pattern suggest about the linear model that was used?

**Problem 3:** After creating an exponential model for a data set, what should the residual plot look like if the model is appropriate?

## Reflection

### Section: text

**Exit Ticket:** A residual plot for an exponential model shows a clear U-shaped pattern. What does this tell you?

**Lesson Summary:** Residuals diagnose model fit. A residual equals actual minus predicted. If the residual plot shows no pattern, the model captures the systematic variation in the data. Patterns — U-shapes, trends, fan shapes — indicate the wrong model type. Linear fits constant differences, exponential fits proportional growth, and quadratic fits data with consistent curvature in rates of change. Context can make one direction of error more meaningful than the other.
