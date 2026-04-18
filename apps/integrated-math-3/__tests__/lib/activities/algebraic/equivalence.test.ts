import { describe, it, expect } from 'vitest';
import { checkEquivalence, normalizeExpression } from '@/lib/activities/algebraic/equivalence';

describe('Expression Equivalence Validator', () => {
  describe('identical strings', () => {
    it('returns true for identical simple expressions', () => {
      expect(checkEquivalence('x^2 + 2x + 1', 'x^2 + 2x + 1')).toBe(true);
    });

    it('returns true for identical complex expressions', () => {
      expect(checkEquivalence('(x + 3)(x - 2)', '(x + 3)(x - 2)')).toBe(true);
    });

    it('returns true for identical expressions with different spacing', () => {
      expect(checkEquivalence('x^2+2x+1', 'x^2 + 2x + 1')).toBe(true);
    });
  });

  describe('algebraic equivalents', () => {
    it('returns true for factored vs expanded form', () => {
      expect(checkEquivalence('(x-3)(x+2)', 'x^2-x-6')).toBe(true);
    });

    it('returns true for expanded vs factored form', () => {
      expect(checkEquivalence('x^2-x-6', '(x-3)(x+2)')).toBe(true);
    });

    it('returns true for equivalent trinomials', () => {
      expect(checkEquivalence('x^2 + 5x + 6', '(x+2)(x+3)')).toBe(true);
    });

    it('returns true for perfect square trinomials', () => {
      expect(checkEquivalence('(x+4)^2', 'x^2 + 8x + 16')).toBe(true);
    });

    it('returns true for difference of squares', () => {
      expect(checkEquivalence('x^2 - 9', '(x-3)(x+3)')).toBe(true);
    });

    it('returns true for expressions with GCF factored out', () => {
      expect(checkEquivalence('2x^2 + 4x', '2x(x+2)')).toBe(true);
    });

    it('returns true for rearranged terms', () => {
      expect(checkEquivalence('x^2 + 2x + 1', '1 + 2x + x^2')).toBe(true);
    });
  });

  describe('wrong answers', () => {
    it('returns false for completely different expressions', () => {
      expect(checkEquivalence('x^2 + 2x + 1', 'x^2 + 5x + 6')).toBe(false);
    });

    it('returns false for expressions with different signs', () => {
      expect(checkEquivalence('x^2 - 4', 'x^2 + 4')).toBe(false);
    });

    it('returns false for expressions with different coefficients', () => {
      expect(checkEquivalence('2x + 4', '3x + 4')).toBe(false);
    });

    it('returns false for expressions with different exponents', () => {
      expect(checkEquivalence('x^2 + 2x', 'x^3 + 2x')).toBe(false);
    });

    it('returns false for expressions with missing terms', () => {
      expect(checkEquivalence('x^2 + 2x + 1', 'x^2 + 2x')).toBe(false);
    });
  });

  describe('complex numbers', () => {
    it('returns true for identical complex numbers', () => {
      expect(checkEquivalence('2 + 3i', '2 + 3i')).toBe(true);
    });

    it('returns true for equivalent complex numbers with different spacing', () => {
      expect(checkEquivalence('2+3i', '2 + 3i')).toBe(true);
    });

    it('returns true for rearranged complex numbers', () => {
      expect(checkEquivalence('2 + 3i', '3i + 2')).toBe(true);
    });

    it('returns false for different complex numbers', () => {
      expect(checkEquivalence('2 + 3i', '2 + 4i')).toBe(false);
    });

    it('returns false for complex vs real numbers', () => {
      expect(checkEquivalence('2 + 3i', '5')).toBe(false);
    });

    it('handles pure imaginary numbers', () => {
      expect(checkEquivalence('3i', '3i')).toBe(true);
    });

    it('handles complex numbers with negative imaginary parts', () => {
      expect(checkEquivalence('2 - 3i', '2 - 3i')).toBe(true);
    });
  });

  describe('fractions', () => {
    it('returns true for identical fractions', () => {
      expect(checkEquivalence('1/2', '1/2')).toBe(true);
    });

    it('returns true for equivalent fractions (reduced)', () => {
      expect(checkEquivalence('2/4', '1/2')).toBe(true);
    });

    it('returns true for equivalent fractions (expanded)', () => {
      expect(checkEquivalence('1/2', '2/4')).toBe(true);
    });

    it('returns true for fractions with common denominators', () => {
      expect(checkEquivalence('1/2 + 1/3', '5/6')).toBe(true);
    });

    it('returns false for different fractions', () => {
      expect(checkEquivalence('1/2', '1/3')).toBe(false);
    });

    it('handles mixed numbers', () => {
      expect(checkEquivalence('1 1/2', '3/2')).toBe(true);
    });

    it('handles fractions in algebraic expressions', () => {
      expect(checkEquivalence('(1/2)x^2 + x', 'x + 0.5x^2')).toBe(true);
    });
  });

  describe('radicals', () => {
    it('returns true for identical radicals', () => {
      expect(checkEquivalence('√4', '√4')).toBe(true);
    });

    it('returns true for equivalent radicals (simplified)', () => {
      expect(checkEquivalence('√4', '2')).toBe(true);
    });

    it('returns true for equivalent radicals (expanded)', () => {
      expect(checkEquivalence('2', '√4')).toBe(true);
    });

    it('returns true for radical expressions with like terms', () => {
      expect(checkEquivalence('2√3 + √3', '3√3')).toBe(true);
    });

    it('returns false for different radicals', () => {
      expect(checkEquivalence('√4', '√9')).toBe(false);
    });

    it('handles cube roots', () => {
      expect(checkEquivalence('³√8', '2')).toBe(true);
    });

    it('handles radicals in algebraic expressions', () => {
      expect(checkEquivalence('x + √2', '√2 + x')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty strings', () => {
      expect(checkEquivalence('', '')).toBe(true);
    });

    it('handles whitespace-only strings', () => {
      expect(checkEquivalence('   ', '')).toBe(true);
    });

    it('handles expressions with only spaces', () => {
      expect(checkEquivalence('x^2 + 2x + 1', '  x^2  +  2x  +  1  ')).toBe(true);
    });

    it('handles negative numbers', () => {
      expect(checkEquivalence('-5', '-5')).toBe(true);
    });

    it('handles zero', () => {
      expect(checkEquivalence('0', '0')).toBe(true);
    });

    it('handles single variables', () => {
      expect(checkEquivalence('x', 'x')).toBe(true);
    });

    it('handles expressions with coefficient 1', () => {
      expect(checkEquivalence('x^2 + x + 1', '1x^2 + 1x + 1')).toBe(true);
    });
  });

  describe('normalizeExpression helper', () => {
    it('converts to lowercase', () => {
      expect(normalizeExpression('X^2 + 2X + 1')).toBe('x^2+2x+1');
    });

    it('removes all whitespace', () => {
      expect(normalizeExpression('x^2 + 2x + 1')).toBe('x^2+2x+1');
    });

    it('standardizes plus signs', () => {
      expect(normalizeExpression('x^2+++2x+++1')).toBe('x^2+2x+1');
    });

    it('standardizes minus signs', () => {
      expect(normalizeExpression('x^2---2x---1')).toBe('x^2-2x-1');
    });

    it('removes multiplication symbols', () => {
      expect(normalizeExpression('2*x + 3*x')).toBe('2x+3x');
    });

    it('handles parentheses with plus', () => {
      expect(normalizeExpression('x+(+2)')).toBe('x+(2)');
    });

    it('handles parentheses with minus', () => {
      expect(normalizeExpression('x+(-2)')).toBe('x+(-2)');
    });
  });
});
