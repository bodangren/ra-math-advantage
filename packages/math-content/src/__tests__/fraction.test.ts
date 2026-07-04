import { describe, it, expect } from 'vitest';
import { Fraction, gcd } from '../utils/fraction';

describe('Fraction', () => {
  it('stores numerator and denominator in reduced form with positive denominator', () => {
    const f = new Fraction(4, 8);
    expect(f.numerator).toBe(1);
    expect(f.denominator).toBe(2);
  });

  it('normalizes sign to the numerator', () => {
    const f1 = new Fraction(3, -4);
    expect(f1.numerator).toBe(-3);
    expect(f1.denominator).toBe(4);

    const f2 = new Fraction(-3, -4);
    expect(f2.numerator).toBe(3);
    expect(f2.denominator).toBe(4);
  });

  it('reduces integers to denominator 1', () => {
    const f = new Fraction(6, 3);
    expect(f.numerator).toBe(2);
    expect(f.denominator).toBe(1);
  });

  it('represents zero as 0/1', () => {
    const f = new Fraction(0, 5);
    expect(f.numerator).toBe(0);
    expect(f.denominator).toBe(1);
  });

  it('adds fractions exactly', () => {
    const result = new Fraction(1, 3).add(new Fraction(1, 6));
    expect(result.numerator).toBe(1);
    expect(result.denominator).toBe(2);
  });

  it('subtracts fractions exactly', () => {
    const result = new Fraction(1, 2).subtract(new Fraction(1, 3));
    expect(result.numerator).toBe(1);
    expect(result.denominator).toBe(6);
  });

  it('multiplies fractions exactly', () => {
    const result = new Fraction(2, 3).multiply(new Fraction(3, 4));
    expect(result.numerator).toBe(1);
    expect(result.denominator).toBe(2);
  });

  it('divides fractions exactly', () => {
    const result = new Fraction(1, 2).divide(new Fraction(1, 4));
    expect(result.numerator).toBe(2);
    expect(result.denominator).toBe(1);
  });

  it('throws on division by zero', () => {
    expect(() => new Fraction(1, 0)).toThrow();
    expect(() => new Fraction(1, 2).divide(new Fraction(0, 1))).toThrow();
  });

  it('valueOf returns the numeric value', () => {
    expect(Number(new Fraction(1, 2))).toBe(0.5);
    expect(Number(new Fraction(5, 1))).toBe(5);
    expect(Number(new Fraction(-3, 4))).toBe(-0.75);
  });

  it('toString formats as "a/b" or "a" when denominator is 1', () => {
    expect(new Fraction(3, 4).toString()).toBe('3/4');
    expect(new Fraction(5, 1).toString()).toBe('5');
    expect(new Fraction(0, 1).toString()).toBe('0');
    expect(new Fraction(-2, 3).toString()).toBe('-2/3');
  });

  it('Fraction.fromDecimal converts small decimals exactly', () => {
    const f = Fraction.fromDecimal(0.5);
    expect(f.numerator).toBe(1);
    expect(f.denominator).toBe(2);
  });

  it('equals compares reduced values', () => {
    expect(new Fraction(1, 2).equals(new Fraction(2, 4))).toBe(true);
    expect(new Fraction(1, 2).equals(new Fraction(1, 3))).toBe(false);
  });
});

describe('gcd helper', () => {
  it('computes gcd for positive integers', () => {
    expect(gcd(12, 8)).toBe(4);
  });

  it('computes gcd with negative inputs', () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
    expect(gcd(-12, -8)).toBe(4);
  });

  it('computes gcd with zero', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(5, 0)).toBe(5);
    expect(gcd(0, 0)).toBe(0);
  });
});
