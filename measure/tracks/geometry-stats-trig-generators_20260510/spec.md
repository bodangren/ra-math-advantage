# Architectural Specification: Geometry, Stats, & Trig Generators

## Objective
Implement generators specifically formatted to feed the SVG components built in Tracks 15 and 16.

## 1. Statistics Generator (`stats-distribution-generator.ts`)
- **Algorithm (Box-Muller Transform):**
  If generating a random scatter of data points around a normal distribution, use Box-Muller on the seeded PRNG:
  ```typescript
  function randomNormal(prng, mu, sigma) {
    let u1 = prng();
    let u2 = prng();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * sigma + mu;
  }
  ```
- **Output:** Must precisely match `StatsDistributionPlotterProps.data`.

## 2. Geometry Diagram Generator (`geometry-diagram-generator.ts`)
- **Triangle Generation Algorithm:**
  1. Pick side lengths $a, b, c$ such that $a+b>c$, $a+c>b$, $b+c>a$.
  2. Use Law of Cosines to find angles: $\cos(C) = (a^2+b^2-c^2)/(2ab)$.
  3. Assign vertex coordinates:
     - $V_1 = (0,0)$
     - $V_2 = (c, 0)$
     - $V_3 = (b \cdot \cos(A), b \cdot \sin(A))$
- **Output:** Returns exact coordinate points `{x, y}` array to be injected directly into the `<GeometryDiagramExplorer>`.

## 3. Trigonometric Generators (`trig-generators.ts`)
- **Sinusoidal Graph Output:**
  - Generate clean fractions of pi for phase shifts (e.g., $C = \pi / 2$).
  - Expected output must match `TrigGraphBuilderProps.data`: `{ A, B, C, D }`.
- **Unit Circle Output:**
  - Generate a multiplier $k$ from $[1, 23]$ where $k \neq 12, 24$. Angle is $k \cdot \pi/12$.
  - Output expected string (e.g., $-\sqrt{2}/2$).