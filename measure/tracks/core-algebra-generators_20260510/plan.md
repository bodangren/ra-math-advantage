# Implementation Plan: Core Algebra Generators

- [ ] **Phase 1: PRNG & Fraction Utilities**
  - [ ] Implement `mulberry32` PRNG in `random.ts`.
  - [ ] Create `Fraction.ts` (GCD, simplify, add, multiply).
  - [ ] Build a generic `MathExpressionBuilder` to format `ax + b` without outputting `1x` or `+ -3`.

- [ ] **Phase 2: Linear & Systems**
  - [ ] Implement `linear-equation-solver.ts` using the Backward Generation strategy.
  - [ ] Implement `system-of-equations-solver.ts`. Pick `x, y`. Pick `A1, B1, A2, B2`. Calculate `C1 = A1*x + B1*y` and `C2 = A2*x + B2*y`. Ensure determinant `A1*B2 - A2*B1 !== 0`.

- [ ] **Phase 3: Quadratics**
  - [ ] Implement `quadratic-factoring.ts`. Support generating grouping steps for the `solutionSteps` output.
  - [ ] Implement `quadratic-formula.ts`. If roots are irrational, return the radical representation strings (`x = (-b + \sqrt{D}) / 2a`).

- [ ] **Phase 4: Blueprint Wiring**
  - [ ] Register all generators in `packages/math-content/src/generators/registry.ts`.
  - [ ] Map these keys to the IM1 and IM3 blueprints.