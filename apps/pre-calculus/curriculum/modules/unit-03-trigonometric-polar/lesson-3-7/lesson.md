# Lesson 3-7 — Sinusoidal Function Context and Data Modeling

Unit: 3
Topic: 3.7
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Average monthly temperatures in a city are given:

| Month | 1 | 3 | 5 | 7 | 9 | 11 |
|---|---|---|---|---|---|---|
| Temp (°F) | 38 | 48 | 65 | 78 | 72 | 52 |

The data clearly rises and falls in a yearly cycle. Can you fit a sinusoidal function to this data? What would the amplitude, period, and midline tell you about the climate?

## Vocabulary

### Section: text

- **Four Representations Framework**: Constructing models by connecting information given verbally, graphically, numerically, and algebraically to the properties of a sinusoidal graph.
- **Sinusoidal regression**: A calculator or computational method that fits a sinusoidal function to a data set by adjusting amplitude, period, phase shift, and midline.
- **Contextual parameters**: In a real-world model, each parameter has a physical meaning — amplitude describes the size of variation, period describes the cycle time, midline describes the average value, and phase shift describes where the cycle begins.

## Learn

### Section: text

To build a sinusoidal model from context, translate the given information into the four parameters of [h(t) = a\sin(bt + c) + d]:

1. **Amplitude [a]**: Half the total variation. If the maximum is [M] and minimum is [m], then [a = (M - m)/2].
2. **Period [P]**: The time for one full cycle. Then [b = 2\pi/P].
3. **Midline [d]**: The average value. [d = (M + m)/2].
4. **Phase shift [c]**: Determined by the starting position. If [t = 0] corresponds to a maximum, use cosine; if it corresponds to the midline going up, use sine.

**From verbal descriptions:** Extract the rotation rate, radius, center height, and starting position. For example: "A yo-yo on a 30-inch string completes 20 rotations in 5 seconds" gives amplitude [30], period [5/20 = 1/4] second, and [b = 2\pi/(1/4) = 8\pi].

**From numerical data:** Use sinusoidal regression on a calculator (typically with 16 iterations) to fit the curve. Read the parameters from the regression equation.

**From analytical descriptions:** Interpret existing equations. For [T(m) = 25.7\sin(\pi(m - 4)/6) + 61.2], the maximum temperature is [61.2 + 25.7 = 86.9°F] and the minimum is [61.2 - 25.7 = 35.5°F].

## Worked Example

### Section: text

**Example 1:** A gear has a point [P] that is 6 inches from the center, starts directly below at [t = 0], the center is 4 inches above a surface, the gear turns clockwise, and completes one revolution in 2 seconds. Write [h(t)].

**Solution:** Amplitude [a = 6]. Period [P = 2], so [b = \pi]. Midline: center is [4 + 6 = 10] inches above the surface (center height plus radius). Starting directly below means the initial value is a minimum: [h(t) = -6\cos(\pi t) + 10].

**Example 2:** The model [T(m) = 25.7\sin(\pi(m - 4)/6) + 61.2] gives monthly temperature. Find the maximum temperature and the month it occurs.

**Solution:** Maximum = [61.2 + 25.7 = 86.9°F]. The maximum of sine occurs when the argument equals [\pi/2]: [\pi(m - 4)/6 = \pi/2] → [m - 4 = 3] → [m = 7] (July).

**Example 3:** A table gives nighttime hours [N(t)] at [t = 1, 3, 4, 6, 7, 8, 11, 12] with values [11.4, 9.7, 8.2, 5.2, 5.0, 6.2, 10.5, 11.3]. Use sinusoidal regression to predict [N(6)].

**Solution:** After regression with 16 iterations, the fitted curve predicts approximately [N(6) \approx 5.5] hours.

## Guided Practice

### Section: text

**Problem 1:** A point on a rotating wheel has radius 10 feet and the wheel completes 4 rotations in 8 seconds. Write a sinusoidal function for the [x]-coordinate if [t = 0] corresponds to the point being at its rightmost position.

**Hint:** Period = [8/4 = 2] seconds, [b = \pi], amplitude = [10]. Rightmost at [t = 0] means maximum — use cosine.

**Problem 2:** A clock's minute hand is modeled by [h(t) = a\sin(bt + c) + d] with a maximum at [(0, 70)] and minimum at [(30, 52)]. Find [a] and [d].

**Hint:** [a = (70 - 52)/2 = 9], [d = (70 + 52)/2 = 61].

**Problem 3:** In the temperature model [T(m) = 25.7\sin(\pi(m - 4)/6) + 61.2], what is the minimum temperature and in which month does it occur?

**Hint:** Minimum = [61.2 - 25.7]. The minimum of sine occurs when the argument equals [-\pi/2].

## Independent Practice

### Section: text

**Problem 1:** A pencil sharpener handle is 2 inches from the center, completes 2 rotations per second, starts directly below at [t = 0], and the center is 3 inches above the surface. Write [h(t) = a\sin(bt + c) + d].

**Problem 2:** San Diego daylight hours follow [D(t) = 2.715\cos(0.017(t - 172)) + 12.250] where [t] is the day of the year. Find the maximum and minimum daylight hours and the approximate days they occur.

**Problem 3:** A data table gives values [F(1) = 11.4], [F(3) = 9.7], [F(6) = 5.2], [F(8) = 6.2], [F(11) = 10.5]. After sinusoidal regression, the equation is [F(t) \approx 3.2\sin(0.52(t - 4)) + 8.3]. What do the values [3.2], [0.52], and [8.3] represent?

## Reflection

### Section: text

**Exit Ticket:** A spinner has radius 10 feet and completes 4 rotations in 8 seconds. Write a sinusoidal function for the height above ground if the center is 15 feet up and [t = 0] is the highest point.

**Lesson Summary:** Sinusoidal modeling requires connecting four representations — verbal, graphical, numerical, and algebraic — to the four parameters [a], [b], [c], [d]. In context, amplitude describes variation size, period describes cycle time, midline describes the average, and phase shift describes where the cycle begins. Whether the starting position is a maximum, minimum, or midline crossing determines whether to use sine or cosine.