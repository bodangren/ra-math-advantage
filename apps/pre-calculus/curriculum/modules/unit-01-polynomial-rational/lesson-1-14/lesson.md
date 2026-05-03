# Lesson 1-14 — Function Model Construction and Application

Unit: 1
Topic: 1.14
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

In Topic 1.13, you learned to select a model type. Now you'll build the model and use it to make predictions. But here's the critical question: is every prediction equally trustworthy? If a model is built from data spanning 2010–2020, can you reliably predict what happens in 2050? Today we explore interpolation vs. extrapolation and learn to critically evaluate when a model's predictions are appropriate.

## Vocabulary

### Section: text

- **Regression equation** — The function obtained by fitting a model to data using technology.
- **Interpolation** — Predicting output values for inputs **within** the data range (generally reliable).
- **Extrapolation** — Predicting output values for inputs **beyond** the data range (less reliable).
- **Model appropriateness** — Whether the model's long-term behavior matches real-world constraints.
- **Domain restriction** — The range of input values where the model is valid.

## Learn

### Section: text

**EK 1.14.A.1:** A regression model constructed from data can predict outputs for inputs within the data range (interpolation) and beyond it (extrapolation).

**EK 1.14.A.2:** Extrapolation carries risk because the model may not continue to behave as the real-world situation does. Assess whether the model's end behavior is consistent with the context.

**EK 1.14.A.3:** A residual plot with random scatter indicates a good fit. Systematic patterns indicate a poor fit or a better model type.

### The Four Components of Every Regression Problem

1. **Select** and justify the model type.
2. **Write** the regression equation.
3. **Predict** using the model (state whether it's interpolation or extrapolation).
4. **Evaluate** appropriateness — especially for extrapolation.

### Extrapolation Warnings

- **Cubic models:** End behavior goes to [±∞]. Unrealistic for bounded quantities like population, stock prices, or weight.
- **Linear models:** Extrapolation is safer when the trend is stable and the prediction is close to the data range.
- **Always ask:** Does the prediction make sense in context?

## Worked Example

### Section: text

**Example 1:** Baby weight: [W(t) = 0.186t + 3.487]. Predict weight at [t = 10] weeks.

[W(10) = 0.186(10) + 3.487 = 5.347] kg.

This is **interpolation** because 10 falls within the data range [4 ≤ t ≤ 12].

**Example 2:** Federal Funds Rate data: [t]: 0, 1, 2, 3, 5 → [R(t)]: 1.5, 2.5, 1.9, 0.5, 4.5.

Cubic regression: [R(t) = at³ + bt² + ct + d].

Predicted rate at [t = 8] (year 2026): extrapolation.

**Is this useful for long-term prediction?** No — cubic end behavior goes to [±∞], but interest rates cannot realistically become arbitrarily large or negative.

**Example 3:** UK female doctors: [F(t) = 1.06t + 23.8]. Predicted percentage for 2021 ([t = 33]):

[F(33) = 1.06(33) + 23.8 = 58.78]%.

This is **extrapolation**, but it's reasonable because the linear trend is stable and the prediction isn't far beyond the data range. Actual value was 55%. Residual = [55 - 58.78 = -3.78]%. The model slightly overestimates.

## Guided Practice

### Section: text

**Problem 1:** Natural gas consumption: [t]: 0, 10, 22, 30, 37 → [N(t)]: 12.4, 21.8, 20.4, 19.3, 22.6. Cubic regression gives [N(t)]. Predict consumption for 1967 ([t = 7]). Is this interpolation or extrapolation?
*Hint:* Check whether [t = 7] falls within the data range.

**Problem 2:** Amazon stock at [t = 16] (April 6, 2021). The data range is [0 ≤ t ≤ 35]. Is this interpolation or extrapolation? The actual price was $168.61. If the model predicts $159.40, compute the residual.
*Hint:* Residual = Actual − Predicted.

**Problem 3:** A cubic model predicts a population will be negative in the year 2080. What does this tell you about the model's appropriateness for long-term prediction?
*Hint:* Can population ever be negative?

## Independent Practice

### Section: text

**Problem 1:** Using the linear regression [W(t) = 0.186t + 3.487] from the baby weight data, predict the weight at [t = 3] weeks. Is this interpolation or extrapolation? Discuss reliability.

**Problem 2:** A model predicts the number of registered voters will be 95,000 in 2035. The original data spans 2000–2020. The model is quadratic. Evaluate whether this extrapolation is reasonable, considering that quadratic functions have unbounded end behavior.

**Problem 3:** For the UK doctors model [F(t) = 1.06t + 23.8], the actual percentage in 2021 was 55%. Compute the residual, interpret it in context, and discuss whether the linear model remains appropriate.

## Reflection

### Section: text

**Exit Ticket:** A cubic model predicts the population will be negative in 2080. What does this tell you about the model's appropriateness?

**Lesson Summary:** Building a regression model is only half the task — you must also evaluate when the model's predictions are trustworthy. Interpolation within the data range is generally reliable. Extrapolation beyond the data range requires critical evaluation of the model's end behavior and real-world constraints. Always state whether a prediction is interpolation or extrapolation, and assess its reliability.
