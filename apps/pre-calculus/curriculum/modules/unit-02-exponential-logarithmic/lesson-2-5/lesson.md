# Lesson 2-5 — Exponential Function Context and Data Modeling

Unit: 2
Topic: 2.5
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

A bacteria culture starts with 17 bacteria and grows at 31% per hour. But what if the data does not look proportional at first glance — what if each output is always 3 more than a doubling pattern? How would you detect and correct for this hidden offset to reveal the exponential growth underneath?

## Vocabulary

### Section: text

- **Initial value** ([a]): The output when [x = 0] in [f(x) = a \cdot b^x].
- **Growth factor** ([b]): The multiplier per unit of input. If [b > 1], the function models growth. If [0 < b < 1], it models decay.
- **Vertical translation**: A constant added to or subtracted from all output values. If subtracting a constant from the data reveals proportional growth, the original function has the form [f(x) = a \cdot b^x + c].
- **Natural base** ([e]): The constant [e \approx 2.718], often used as the base in exponential models of continuous real-world phenomena.
- **Exponential regression** (ExpReg): A calculator procedure that fits [y = a \cdot b^x] to data points.

## Learn

### Section: text

Exponential models in real-world contexts are built from data. Three key skills are required:

**1. Detecting hidden proportionality.** Sometimes data appears non-proportional because of a vertical translation. If subtracting (or adding) a constant reveals a constant ratio, the data is exponential with a vertical shift. For example, [f(x)]: 7, 13, 25, 49, 97 becomes proportional after subtracting 1: 6, 12, 24, 48, 96 (ratio = 2).

**2. Constructing models from two data points.** Given [f(x_1) = y_1] and [f(x_2) = y_2] with [f(x) = a \cdot b^x]:
\[b^{(x_2 - x_1)} = \frac{y_2}{y_1} \implies b = \left(\frac{y_2}{y_1}\right)^{1/(x_2 - x_1)}\]
Then [a = y_1 / b^{x_1}].

**3. Converting between time units.** If an annual growth factor is [b], the monthly growth factor is [b^{1/12}]. This is NOT dividing time by 12 — the base must be recalculated. For a 13% annual increase: [b = 1.13], monthly base [k = 1.13^{1/12} \approx 1.0102].

The natural base [e] arises in continuous growth models. For example, [B(t) = 17e^{0.31t}] is equivalent to [B(t) = 17 \cdot (e^{0.31})^t = 17 \cdot (1.363)^t].

## Worked Example

### Section: text

**Example 1:** Find the constant that reveals proportional growth.

[x]: 0, 1, 2, 3, 4 \quad [h(x)]: 63, 31, 15, 7, 3

**Solution:**
Add 1 to each value: 64, 32, 16, 8, 4. Each value is half the previous — ratio = 1/2. So [h(x) = 64 \cdot (1/2)^x - 1].

**Example 2:** A bacteria model is [B(t) = 17e^{0.31t}]. Rewrite in the form [A(t) = a \cdot b^t].

**Solution:**
\[A(t) = 17 \cdot (e^{0.31})^t = 17 \cdot (1.363)^t\]
So [a = 17] and [b = e^{0.31} \approx 1.363].

**Example 3:** A deer population starts at 50 and grows 13% per year. Find the monthly growth factor.

**Solution:**
Annual: [D(t) = 50 \cdot (1.13)^t]. Monthly: [D(m) = 50 \cdot (1.13)^{m/12}].
New base: [k = 1.13^{1/12} \approx 1.0102].

## Guided Practice

### Section: text

**Problem 1:** Find the constant that reveals proportional growth: [x]: 0, 1, 2, 3, 4 \quad [f(x)]: 7, 13, 25, 49, 97.

**Hint:** Try subtracting small integers from each output until the ratios become constant.

**Problem 2:** A stadium has 47 fans at [t = 2] minutes and 2,602 fans at [t = 20] minutes. Write two equations for [F(t) = a \cdot b^t] and solve for [b].

**Hint:** [47 = a \cdot b^2] and [2602 = a \cdot b^{18}]. Divide to eliminate [a].

## Independent Practice

### Section: text

**Problem 1:** A video goes viral. Viewership is modeled by [y = 1391(1.07)^m] where [m] is minutes. Find the viewers after 2 hours and convert the model to seconds.

**Problem 2:** A MINI Cooper costs $39,645 and depreciates 17% per year. Write [V(t) = a \cdot b^t], then convert to a monthly depreciation model.

**Problem 3:** A bacteria culture has 200 bacteria at [t = 1] and 1,600 at [t = 4]. Write two equations for [B(t) = a \cdot b^t] and solve for [a] and [b].

## Reflection

### Section: text

**Exit Ticket:** A bacteria culture has 200 bacteria at [t = 1] and 1,600 at [t = 4]. Write two equations for [B(t) = a \cdot b^t].

**Lesson Summary:** Real-world exponential modeling requires three skills: detecting hidden vertical translations that mask proportionality, constructing models from two data points by solving a system of equations, and converting between time units by recalculating the base — not simply dividing. The natural base [e] connects continuous and discrete exponential forms.
