# Phase 1 Red — Polynomial Engine Test Strategy

## Scope
Tests cover three modules that form the polynomial engine foundation:
1. `utils/polynomial.ts` — Pure array convolution (add, subtract, multiply)
2. `polynomial-operations.ts` — Deterministic generator cycling through add/sub/mul
3. `polynomial-division.ts` — Backward generation: Q·D + R = P

## Representation Convention
Polynomials are represented as coefficient arrays in **descending** degree order.
Example: `x² + 5x + 6` → `[1, 5, 6]`. Constant `5` → `[5]`.

## Key Invariants Tested
- **addPoly/subtractPoly**: Handle same-length and different-length arrays (zero-padded).
- **multiplyPoly**: Correct convolution for non-trivial products and zero-polynomial absorption.
- **generatePolynomialOperation**: Correct shape, operator cycling (3 seeds → 3 unique ops), determinism, and mathematical correctness.
- **generatePolynomialDivision**: Correct shape, Q·D + R = P identity, degree constraint on remainder, and determinism.

## Red Command
```bash
npx vitest run polynomial --root packages/math-content
```

## Expected Failure
All tests fail with `Cannot find module` errors because the source modules don't exist yet.
