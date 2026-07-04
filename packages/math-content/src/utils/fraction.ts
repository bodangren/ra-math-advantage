/**
 * Immutable rational-number utility used by generator code for exact
 * integer arithmetic without IEEE-754 rounding error.
 *
 * Invariants (preserved by every public constructor and operation):
 *   1. `denominator > 0`. Sign is carried on the numerator.
 *   2. The fraction is stored in lowest terms:
 *        gcd(|numerator|, denominator) === 1
 *      The single exception is `0/1`, where gcd(0, 1) === 1 trivially.
 *   3. Zero is stored as `0/1`.
 *
 * These invariants are checked by the `fraction.test.ts` class guard
 * (A3), and every arithmetic operation returns a new immutable
 * `Fraction` rather than mutating the receiver.
 */
export class Fraction {
  public readonly numerator: number;
  public readonly denominator: number;

  constructor(n: number | Fraction, d?: number) {
    let num: number;
    let den: number;
    if (n instanceof Fraction) {
      num = n.numerator;
      den = n.denominator;
    } else {
      if (typeof n !== 'number' || !Number.isFinite(n)) {
        throw new Error('Fraction: numerator must be a finite number');
      }
      num = n;
      den = d ?? 1;
    }
    if (typeof den !== 'number' || !Number.isFinite(den)) {
      throw new Error('Fraction: denominator must be a finite number');
    }
    if (den === 0) {
      throw new Error('Fraction: denominator cannot be zero');
    }
    // Normalize sign to the numerator: if den < 0, flip both signs.
    if (den < 0) {
      num = -num;
      den = -den;
    }
    // Reduce to lowest terms.
    if (num === 0) {
      this.numerator = 0;
      this.denominator = 1;
    } else {
      const g = gcd(Math.abs(num), den);
      this.numerator = num / g;
      this.denominator = den / g;
    }
  }

  /** Alias getter: `f.numer()` returns the same as `f.numerator`. */
  get numer(): number {
    return this.numerator;
  }

  /** Alias getter: `f.denom()` returns the same as `f.denominator`. */
  get denom(): number {
    return this.denominator;
  }

  static gcd(a: number, b: number): number {
    return gcd(a, b);
  }

  static lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / gcd(Math.abs(a), Math.abs(b));
  }

  add(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.denominator + other.numerator * this.denominator,
      this.denominator * other.denominator,
    );
  }

  subtract(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.denominator - other.numerator * this.denominator,
      this.denominator * other.denominator,
    );
  }

  /** Alias for `subtract` to match the spec's `sub(other)` naming. */
  sub(other: Fraction): Fraction {
    return this.subtract(other);
  }

  multiply(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.numerator,
      this.denominator * other.denominator,
    );
  }

  /** Alias for `multiply` to match the spec's `mul(other)` naming. */
  mul(other: Fraction): Fraction {
    return this.multiply(other);
  }

  divide(other: Fraction): Fraction {
    if (other.numerator === 0) {
      throw new Error('Fraction: divide by zero');
    }
    return new Fraction(
      this.numerator * other.denominator,
      this.denominator * other.numerator,
    );
  }

  /** Alias for `divide` to match the spec's `div(other)` naming. */
  div(other: Fraction): Fraction {
    return this.divide(other);
  }

  equals(other: Fraction): boolean {
    return (
      this.numerator === other.numerator && this.denominator === other.denominator
    );
  }

  /** Implicit numeric conversion (enables `Number(f)` and `+f`). */
  valueOf(): number {
    return this.numerator / this.denominator;
  }

  toNumber(): number {
    return this.numerator / this.denominator;
  }

  toString(): string {
    if (this.denominator === 1) return String(this.numerator);
    return `${this.numerator}/${this.denominator}`;
  }

  /**
   * Approximate a decimal `x` as a `Fraction` using continued fractions,
   * bounded by `maxDenom` (default 1000). Suitable for terminating binary
   * fractions (e.g. `0.5 → 1/2`) and simple repeating decimals (e.g.
   * `0.333... → 333/1000` within `maxDenom`). Repeating decimals like
   * `1/3` may not be recovered exactly under tight `maxDenom` budgets;
   * callers needing exact rationals should pass them in directly via the
   * `(n, d)` constructor.
   */
  static fromDecimal(x: number, maxDenom: number = 1000): Fraction {
    if (typeof x !== 'number' || !Number.isFinite(x)) {
      throw new Error('Fraction.fromDecimal: x must be a finite number');
    }
    const sign = x < 0 ? -1 : 1;
    const value = Math.abs(x);
    const whole = Math.floor(value);
    let frac = value - whole;
    if (frac === 0) return new Fraction(sign * whole, 1);

    // Continued-fraction convergents (h0/k0 = current, h1/k1 = previous).
    let h0 = whole;
    let k0 = 1;
    let h1 = 1;
    let k1 = 0;
    let iterations = 0;
    const TOL = 1e-12;
    while (frac > TOL && iterations++ < 64) {
      const inv = 1 / frac;
      const a = Math.floor(inv);
      frac = inv - a;
      const h2 = a * h0 + h1;
      const k2 = a * k0 + k1;
      if (k2 > maxDenom) break;
      h1 = h0;
      k1 = k0;
      h0 = h2;
      k0 = k2;
      if (frac < TOL) break;
    }
    return new Fraction(sign * h0, k0);
  }
}

/**
 * Greatest common divisor (Euclidean algorithm).
 *
 * Always returns a non-negative integer. Inputs are accepted as any JS
 * number; non-integer and negative values are coerced via `Math.trunc`
 * and `Math.abs` so callers can pass raw coefficients safely.
 * `gcd(0, 0) === 0`.
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a;
}
