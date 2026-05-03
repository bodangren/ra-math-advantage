# Lesson 2-14 — Logarithmic Function Context and Data Modeling

Unit: 2
Topic: 2.14
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Some real-world quantities grow quickly at first, then slow down. Consider how a pastor's salary relates to church size: doubling the congregation from 100 to 200 may increase salary by [\$20{,}000], but doubling from 10{,}000 to 20{,}000 adds far less. This pattern — large initial growth that tapers off — is characteristic of **logarithmic growth**.

Compare to exponential growth:
- **Exponential**: slow start, then rapid acceleration (population growth, compound interest).
- **Logarithmic**: rapid start, then gradual leveling off (salary vs. experience, sound vs. intensity).

The Richter scale for earthquakes, decibels for sound, and pH for acidity all use logarithmic models because the underlying data spans many orders of magnitude.

A logarithmic model has the form [y = a + b ln(x)] or [y = a + b log(x)], where [a] and [b] are constants and [b ne 0].

## Vocabulary

### Section: text

- **Logarithmic model**: A function of the form [y = a + b ln(x)] or [y = a + b log(x)] that fits data with large initial rates of change that gradually decrease.
- **Two-point model construction**: Given two data points, write two equations in [a] and [b], then solve the system.
- **Regression (LnReg / LogReg)**: A calculator method for finding the best-fit logarithmic model from a dataset.
- **Logarithmic scale**: A measurement scale where each equal interval represents a multiplicative change (e.g., Richter, decibels, pH).

## Learn

### Section: text

**Constructing a logarithmic model from two points:**

Given [L(x) = a + b ln(x)] and two data points, create a system of two equations and solve for [a] and [b]:
1. Substitute each point into the model.
2. Subtract one equation from the other to eliminate [a].
3. Solve for [b], then back-substitute for [a].

**Using regression:** Enter data into two lists, then use LnReg (or LogReg) to find the best-fit model. The calculator returns [a] and [b] for [y = a + b ln(x)].

**Interpreting in context:**
- [a] is the predicted value when [x = 1] (since [ln(1) = 0]).
- [b] controls the rate of growth. Positive [b] means increasing; negative [b] means decreasing.
- Predictions use the model equation — substitute the [x]-value and compute.

**Real-world logarithmic contexts:**
- Sound: [beta(I) = a + b log(I)] where [beta] is decibels and [I] is intensity.
- Earthquakes: The Lillie Empirical Formula [M = a + b ln(d)] relates magnitude [M] to displacement [d].
- Salary vs. experience, learning curves, information theory.

## Worked Example

### Section: text

**Example 1:** [L(x) = a + b ln(x)]. Data: [x = 2 rightarrow L = 3], [x = 5 rightarrow L = 7].
- Two equations: [3 = a + b ln(2)] and [7 = a + b ln(5)]
- Subtract: [4 = b(ln 5 - ln 2) = b ln(frac{5}{2})]
- [b = frac{4}{ln(5/2)} approx frac{4}{0.916} approx 4.366]
- [a = 3 - b ln(2) approx 3 - 4.366(0.693) approx -0.026]

**Example 2:** Sound intensity. Traffic: [I = 5 times 10^{-5}], [beta = 70] dB. Concert: [I = 1], [beta = 120] dB. Model: [beta(I) = a + b log(I)].
- Since [log(1) = 0]: [120 = a + b(0) to a = 120].
- [70 = 120 + b log(5 times 10^{-5})] → [b = frac{-50}{log(5 times 10^{-5})} = frac{-50}{log 5 - 5} approx frac{-50}{-4.301} approx 11.63]
- Predict for [I = 10^4]: [beta = 120 + 11.63 times 4 = 166.5] dB.

**Example 3:** [f(x) = a + b ln(x)]. Data: [x = 1 rightarrow f = 2], [x = 6 rightarrow f = 10].
- [2 = a + b ln(1) = a + 0 to a = 2]
- [10 = 2 + b ln(6) to b = frac{8}{ln(6)} approx 4.463]

## Guided Practice

### Section: text

**Problem 1:** [g(x) = a + b ln(x)]. Data: [x = 3 rightarrow g = 11], [x = 10 rightarrow g = 14.5]. Find [a] and [b].

**Hint:** Write two equations, subtract to eliminate [a], solve for [b] using [b = frac{14.5 - 11}{ln(10) - ln(3)}].

**Problem 2:** The Richter scale uses [M = a + b log(frac{A}{A_0})]. If an earthquake with displacement 21 microns registers magnitude 9.5, and one with 180 microns registers 7.0, set up the system to find [a] and [b].

**Hint:** Write two equations using [M = a + b ln(d)], then subtract to solve.

**Problem 3:** A logarithmic model [S(p) = 25 + 18 ln(p)] predicts salary in thousands from congregation size. Predict the salary for a church of 500 members.

**Hint:** Substitute [p = 500] and evaluate [S(500) = 25 + 18 ln(500)].

## Independent Practice

### Section: text

**Problem 1:** [f(x) = a + b ln(x)]. Data: [x = 1 rightarrow f = -2], [x = 16 rightarrow f = 3]. Find [a] and [b].

**Problem 2:** [h(x) = a + b log(x)]. Data: [x = 2 rightarrow h = 5], [x = 20 rightarrow h = 12]. Find [a] and [b]. Then predict [h(100)].

**Problem 3:** A learning model [L(t) = a + b ln(t)] gives proficiency score from hours of practice. Given [L(5) = 40] and [L(30) = 72], find the model and predict [L(100)].

**Problem 4:** The Lillie Empirical Formula [M = a + b ln(d)] uses displacement in microns. Given [M = 9.5] when [d = 21] and [M = 7.0] when [d = 180], find the model. Predict the magnitude for a displacement of 300,000,000 microns (the largest recorded earthquake).

## Reflection

### Section: text

**Exit Ticket:** [f(x) = a + b ln(x)]. Given [f(1) = 2] and [f(6) = 10], write two equations and find [a]. How does logarithmic growth differ from exponential growth? Give one real-world example of each.

**Lesson Summary:** Logarithmic models fit data that grows rapidly at first then levels off. The model [y = a + b ln(x)] is constructed from two data points by writing a system of equations, or from a full dataset using regression. Real-world applications include sound intensity (decibels), earthquake magnitude (Richter scale), acidity (pH), and salary vs. experience. When interpreting predictions, always connect the numerical result back to the context.
