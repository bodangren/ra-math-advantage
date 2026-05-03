# Lesson 3-6 — Sinusoidal Function Transformations

Unit: 3
Topic: 3.6
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Start with [f(\theta) = \sin \theta]. What happens when you change the equation to [g(\theta) = 3\sin(2\theta) + 1]? The graph still looks like a wave, but it is taller, narrower, and shifted upward. How do the numbers [3], [2], and [1] control the shape?

Every sinusoidal function can be written in the form [h(t) = a\sin(bt + c) + d]. Each constant — [a], [b], [c], [d] — performs a specific transformation on the parent sine function.

## Vocabulary

### Section: text

- **Vertical dilation**: Stretching or compressing the graph vertically by a factor of [|a|]. Controls the amplitude.
- **Horizontal dilation**: Stretching or compressing the graph horizontally by a factor of [1/b]. Controls the period.
- **Phase shift**: A horizontal translation of the graph. For [h(t) = a\sin(bt + c) + d], the phase shift is [-c/b] units.
- **Vertical translation**: Shifting the graph up or down by [d] units. Controls the midline.
- **General sinusoidal form**: [h(t) = a\sin(bt + c) + d] (or equivalently with cosine).

## Learn

### Section: text

The general sinusoidal form [h(t) = a\sin(bt + c) + d] encodes four transformations:

| Parameter | Transformation | Controls |
|---|---|---|
| [a] | Vertical dilation by [|a|] | Amplitude = [|a|] |
| [b] | Horizontal dilation by [1/b] | Period = [2\pi/|b|] |
| [c] | Horizontal translation (phase shift) | Phase shift = [-c/b] |
| [d] | Vertical translation | Midline = [d] |

To determine [a], [b], [c], [d] from a graph or context:
1. **Amplitude** [a = (max - min)/2]
2. **Midline** [d = (max + min)/2]
3. **Period** [P = 2 \times] (horizontal distance from max to min), then [b = 2\pi/P]
4. **Phase shift** [c]: If the graph reaches a maximum at [t = t_0], then [\sin(bt_0 + c) = 1], so [bt_0 + c = \pi/2].

When choosing between sine and cosine: use cosine if the graph starts at a maximum or minimum at [t = 0]; use sine if it starts on the midline.

## Worked Example

### Section: text

**Example 1:** A sinusoidal function [h] has a maximum at [(\pi, 6)] and the next minimum at [(3\pi/2, -4)]. Find [h(t) = a\sin(bt + c) + d].

**Solution:**
- [a = (6 - (-4))/2 = 5], [d = (6 + (-4))/2 = 1]
- Period = [2(3\pi/2 - \pi) = \pi], so [b = 2\pi/\pi = 2]
- Maximum at [t = \pi]: [\sin(2\pi + c) = 1] → [c = \pi/2 - 2\pi = -3\pi/2]
- [h(t) = 5\sin(2t - 3\pi/2) + 1]

**Example 2:** Five labeled points: [F(2, 16)], [G(5, 11)], [J(8, 6)], [K(11, 11)], [P(14, 16)]. Find [h(t) = a\sin(bt + c) + d].

**Solution:**
- [a = (16 - 6)/2 = 5], [d = (16 + 6)/2 = 11]
- Period = [2(5 - 2) \times 3 = 18] (from F to P: [14 - 2 = 12] is [2/3] of a period, so full period is [18]). [b = 2\pi/18 = \pi/9]
- F at [t = 2] is a maximum: [\sin(\frac{\pi}{9} \cdot 2 + c) = 1] → [c = \pi/2 - 2\pi/9 = 5\pi/18]
- [h(t) = 5\sin\left(\frac{\pi}{9}t + \frac{5\pi}{18}\right) + 11]

**Example 3:** Which graph matches [f(\theta) = 3\sin(2\theta) - 1]?

**Solution:** Amplitude [3], period [\pi], midline [y = -1]. The graph oscillates between [2] and [-4] with one cycle every [\pi] units.

## Guided Practice

### Section: text

**Problem 1:** Given [k(x) = 5\cos(2x) + 1], find the amplitude, period, and midline. Verify by checking the maximum and minimum values.

**Hint:** Amplitude = [5], period = [\pi], midline = [y = 1]. Max = [5 + 1 = 6], min = [-5 + 1 = -4].

**Problem 2:** Five points: [F(0, 10)], [G(3, 5)], [J(6, 0)], [K(9, 5)], [P(12, 10)]. Find [h(t) = a\sin(bt + c) + d].

**Hint:** [a = 5], [d = 5], period = [12], [b = \pi/6]. Start at max — consider using cosine, or find [c] for sine.

**Problem 3:** A sinusoidal function has a minimum at [t = 0] with value [2] and a maximum at [t = \pi] with value [10]. Write the equation using cosine.

**Hint:** Since it starts at a minimum, use [-a\cos(bt) + d]. [a = 4], [d = 6], period = [2\pi].

## Independent Practice

### Section: text

**Problem 1:** For each set of five points, find [h(t) = a\sin(bt + c) + d]:
- (a) [F(0, 12), G(5, 9), J(10, 6), K(15, 9), P(20, 12)]
- (b) [F(\pi/2, 6), G(3\pi/4, 1), J(\pi, -4), K(5\pi/4, 1), P(3\pi/2, 6)]

**Problem 2:** Write the equation for a sinusoidal function with amplitude [4], period [6\pi], midline [y = -3], that starts at a maximum at [t = 0].

**Problem 3:** San Diego daylight hours can be modeled by [D(t) = 2.715\cos(0.017(t - c)) + 12.250]. What do the numbers [2.715], [0.017], and [12.250] represent in context?

## Reflection

### Section: text

**Exit Ticket:** Five points: [F(0, 10)], [G(3, 5)], [J(6, 0)], [K(9, 5)], [P(12, 10)]. Find [h(t) = a\sin(bt + c) + d].

**Lesson Summary:** The general sinusoidal form [h(t) = a\sin(bt + c) + d] captures every possible transformation of the sine function. The amplitude is [|a|], the period is [2\pi/|b|], the midline is [y = d], and the phase shift is [-c/b]. To determine these from five labeled points, extract [a] and [d] from the max/min, [b] from the period, and [c] from the location of the first maximum or minimum.