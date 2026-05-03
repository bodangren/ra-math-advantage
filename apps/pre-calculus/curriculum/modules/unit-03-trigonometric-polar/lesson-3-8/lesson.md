# Lesson 3-8 — The Tangent Function

Unit: 3
Topic: 3.8
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Recall that [\tan \theta = \sin \theta / \cos \theta] and also [\tan \theta] equals the slope of the terminal ray. As [\theta] increases from [0] toward [\pi/2], what happens to the slope of the terminal ray? What happens as [\theta] passes through [\pi/2]?

Trace the slope of the terminal ray for one full revolution from [0] to [2\pi]. The pattern you discover is the graph of the tangent function — and it looks very different from sine and cosine.

## Vocabulary

### Section: text

- **Tangent function**: Defined as [\tan \theta = \sin \theta / \cos \theta], or equivalently the slope of the terminal ray. Range: all real numbers.
- **Vertical asymptote**: A vertical line where the function is undefined and the graph approaches [\pm\infty]. For [\tan \theta], vertical asymptotes occur at [\theta = \pi/2 + k\pi] where [\cos \theta = 0].
- **Period of tangent**: The tangent function has period [\pi] (not [2\pi] like sine and cosine), because the slope pattern repeats every half-rotation.

## Learn

### Section: text

The tangent function [\tan \theta = \sin \theta / \cos \theta] has fundamentally different behavior from sine and cosine:

- **Domain**: All real numbers except [\theta = \pi/2 + k\pi] (where [\cos \theta = 0]).
- **Range**: All real numbers — tangent is unbounded, so it has **no amplitude** in the traditional sense.
- **Period**: [\pi] — the pattern repeats every half-rotation, not a full rotation.
- **Vertical asymptotes**: At [\theta = \pi/2 + k\pi] for every integer [k].

Between consecutive asymptotes, the tangent function increases from [-\infty] to [+\infty]. On [(-\pi/2, \pi/2)]: [\tan \theta] goes from [-\infty] (at the left asymptote) through [0] (at [\theta = 0]) to [+\infty] (at the right asymptote).

**Transformed tangent:** For [f(\theta) = a\tan(b(\theta - c)) + d]:
- Vertical stretch by [|a|] (no amplitude — the range is still all reals)
- Period = [\pi/|b|]
- Phase shift of [c] units
- Vertical translation of [d] units (this becomes the midline of the oscillation between asymptotes)

**Exact values** derive from [\tan \theta = \sin \theta / \cos \theta]:
[\tan(\pi/6) = \frac{\sqrt{3}}{3}], [\tan(\pi/4) = 1], [\tan(\pi/3) = \sqrt{3}], [\tan(\pi/2) = \text{undefined}]

## Worked Example

### Section: text

**Example 1:** Find the period of [h(x) = 7\tan(3x) - 4].

**Solution:** Period = [\pi/|b| = \pi/3].

**Example 2:** Find the vertical asymptotes of [j(\theta) = \tan(2\theta)].

**Solution:** Asymptotes occur where [2\theta = \pi/2 + k\pi], so [\theta = \pi/4 + k\pi/2]. The asymptotes are at [\ldots, -\pi/4, \pi/4, 3\pi/4, 5\pi/4, \ldots]

**Example 3:** Find the vertical asymptotes of [g(\theta) = 2\tan(\theta - 1/3)].

**Solution:** Start with the standard asymptotes at [\theta = \pi/2 + k\pi], then shift right by [1/3]: [\theta = \pi/2 + k\pi + 1/3].

**Example 4:** Find exact values: [\tan(5\pi/6)], [\tan(4\pi/3)], [\tan(7\pi/4)].

**Solution:**
- [\tan(5\pi/6) = \sin(5\pi/6)/\cos(5\pi/6) = (1/2)/(-\sqrt{3}/2) = -\frac{\sqrt{3}}{3}]
- [\tan(4\pi/3) = \sin(4\pi/3)/\cos(4\pi/3) = (-\sqrt{3}/2)/(-1/2) = \sqrt{3}]
- [\tan(7\pi/4) = \sin(7\pi/4)/\cos(7\pi/4) = (-\sqrt{2}/2)/(\sqrt{2}/2) = -1]

## Guided Practice

### Section: text

**Problem 1:** Find the period and vertical asymptotes of [f(\theta) = 3\tan(2\theta - \pi)].

**Hint:** Period = [\pi/2]. Asymptotes where [2\theta - \pi = \pi/2 + k\pi].

**Problem 2:** Find [\tan(\pi/6)], [\tan(\pi/4)], and [\tan(\pi/3)] using [\tan \theta = \sin \theta / \cos \theta].

**Hint:** Use the known unit circle values for sine and cosine, then divide.

**Problem 3:** Explain why [\tan(3\pi/2)] is undefined.

**Hint:** [\tan(3\pi/2) = \sin(3\pi/2)/\cos(3\pi/2) = (-1)/0]. Division by zero is undefined.

## Independent Practice

### Section: text

**Problem 1:** Find the periods: (a) [f(\theta) = \tan(3\theta)], (b) [g(\theta) = 5\tan(\theta/4) - 2], (c) [h(\theta) = \tan(\pi\theta)].

**Problem 2:** Find all vertical asymptotes on [[0, 2\pi]]: (a) [j(\theta) = \tan(2\theta)], (b) [f(\theta) = \tan(\theta/2)].

**Problem 3:** Find exact values without a calculator: [\tan(17\pi/6)], [\tan(3\pi/4)], [\tan(2\pi/3)], [\tan(5\pi/3)], [\tan(11\pi/6)], [\tan(\pi)].

## Reflection

### Section: text

**Exit Ticket:** Find the period and vertical asymptotes of [f(\theta) = 3\tan(2\theta - \pi)].

**Lesson Summary:** The tangent function differs from sine and cosine in three key ways: its period is [\pi] (not [2\pi]), it has vertical asymptotes wherever [\cos \theta = 0], and its range is all real numbers (no amplitude). The tangent graph rises from [-\infty] to [+\infty] between consecutive asymptotes. Transformed tangent [a\tan(b(\theta - c)) + d] has period [\pi/|b|], asymptotes shifted by [c], and a midline at [y = d]. Exact tangent values come from dividing known sine and cosine values.