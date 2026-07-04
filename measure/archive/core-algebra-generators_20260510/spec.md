# Architectural Specification: Core Algebra Generators

## Objective
Implement mathematically safe, deterministic generators for core algebra (linear, systems, quadratics).

## 1. Seeded Randomness & Safety Utilities
- **File:** `packages/math-content/src/utils/random.ts`
- **Algorithm:** Implement Mulberry32. Do NOT use `Math.random()`.
  ```typescript
  export function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
  ```
- **Fraction Utility:** Implement or import a minimal `Fraction` class to prevent `0.333333` errors. All math must be done in integers or exact fractions.

## 2. Linear Equation Solver (`linear-equation-solver.ts`)
- **Generation Strategy (Backward Generation):**
  Never generate an equation and hope the answer is clean.
  1. Generate integer `x` (e.g., `x = 4`).
  2. Generate integer coefficients `A` and `B` (e.g., `A = 3`, `B = 2`).
  3. Calculate `C = A * x + B` (e.g., `C = 14`).
  4. Output the prompt: `Solve for x: 3x + 2 = 14`.
- **Step-by-Step Solution Formatting:**
  Must return an array of strings representing the latex/math steps:
  - `3x + 2 = 14`
  - `3x = 12`
  - `x = 4`

## 3. Quadratic Factoring (`quadratic-factoring.ts`)
- **Generation Strategy (Backward Generation):**
  1. Generate roots `r1` and `r2` (e.g., `2` and `-3`).
  2. Generate leading coefficient `a` (1 for easy, >1 for hard).
  3. Expand `a(x - r1)(x - r2)` -> `ax^2 - a(r1+r2)x + a(r1*r2)`.
  4. Example: `(x - 2)(x + 3)` expands to `x^2 + x - 6`.
- **Output:** The expected answer schema must expect a factored expression. The grading metadata must set `ruleType: 'expression_equivalence'` so that `(x+3)(x-2)` is also marked correct.