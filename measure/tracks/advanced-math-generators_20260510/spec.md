# Architectural Specification: Advanced Math Generators

## Objective
Implement deterministic generators for advanced mathematics (Polynomials, Exponentials, Rationals).

## 1. Polynomial Division Generator (`polynomial-division.ts`)
- **Mathematical Convolution (Multiplication):**
  To multiply two polynomials $A$ (degree $n$) and $B$ (degree $m$):
  ```typescript
  const multiplyPoly = (A: number[], B: number[]) => {
    const result = new Array(A.length + B.length - 1).fill(0);
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < B.length; j++) {
        result[i + j] += A[i] * B[j];
      }
    }
    return result;
  };
  ```
- **Backward Generation:**
  1. Generate Quotient $Q(x)$ (e.g., `[1, 2]` -> $x + 2$).
  2. Generate Divisor $D(x)$ (e.g., `[1, -3]` -> $x - 3$).
  3. Generate Remainder $R(x)$ (must be degree < $D(x)$, e.g., `[5]`).
  4. Calculate Dividend $P(x) = Q(x)D(x) + R(x)$ using `multiplyPoly` and array addition.
  5. Prompt: "Divide $P(x)$ by $D(x)$". Expected Answer: Quotient $Q(x)$ and Remainder $R(x)$.

## 2. Rational Asymptote Generator (`rational-analyzer.ts`)
- **Architecture:**
  A rational function $f(x) = P(x) / Q(x)$.
  1. Generate roots for holes ($h$).
  2. Generate roots for vertical asymptotes ($v$).
  3. Generate roots for numerator x-intercepts ($z$).
  4. $P(x) = (x-h)(x-z)$. $Q(x) = (x-h)(x-v)$. Expand using `multiplyPoly`.
  5. The expected answer must explicitly extract $x=h$ as a hole and $x=v$ as a vertical asymptote.

## 3. Exponential / Logarithmic Solver (`exp-log-solver.ts`)
- **Domain Constraints:**
  When generating $\log_b(Ax + C) = D$, ensure that for the generated solution $x$, $Ax + C > 0$. Calculate $x$ first, then calculate $D$, check domain validity. If invalid, re-roll the PRNG seed (e.g., `seed + 1`).