import { describe, it, expect } from 'vitest';
import { generateDistractors } from '@/lib/activities/algebraic/distractors';

describe('generateDistractors', () => {
  describe('quadratic expressions', () => {
    it('generates plausible distractors for factoring quadratics', () => {
      const correctAnswer = '(x + 2)(x + 3)';
      const distractors = generateDistractors(correctAnswer, 'factoring');

      expect(distractors).toHaveLength(2);
      expect(distractors).not.toContain(correctAnswer);
      distractors.forEach(d => {
        // Match factored form with optional spaces
        expect(d).toMatch(/\(x\s*[+-]\s*\d+\)\(x\s*[+-]\s*\d+\)/);
      });
    });

    it('generates distractors with sign errors', () => {
      const correctAnswer = '(x + 2)(x + 3)';
      const distractors = generateDistractors(correctAnswer, 'factoring');

      // Should include common sign errors
      const hasSignError = distractors.some(d => 
        (d.includes('-') && !correctAnswer.includes('-')) ||
        (d.includes('+') && !correctAnswer.includes('+'))
      );
      expect(hasSignError).toBe(true);
    });

    it('generates distractors with swapped factors', () => {
      const correctAnswer = '(x + 2)(x + 3)';
      const distractors = generateDistractors(correctAnswer, 'factoring');

      // Should include swapped factor errors when numbers differ
      const hasSwappedError = distractors.some(d => 
        d.includes('(x + 3)(x + 2)')
      );
      expect(hasSwappedError).toBe(true);
    });
  });

  describe('linear expressions', () => {
    it('generates plausible distractors for linear equations', () => {
      const correctAnswer = '2x + 3 = 7';
      const distractors = generateDistractors(correctAnswer, 'linear');

      expect(distractors).toHaveLength(2);
      expect(distractors).not.toContain(correctAnswer);
      distractors.forEach(d => {
        expect(d).toMatch(/x.*=/);
      });
    });

    it('generates distractors with arithmetic errors', () => {
      const correctAnswer = 'x = 2';
      const distractors = generateDistractors(correctAnswer, 'linear');

      // Should include common arithmetic errors
      const hasArithmeticError = distractors.some(d => 
        d !== 'x = 2' && d.includes('x =')
      );
      expect(hasArithmeticError).toBe(true);
    });
  });

  describe('quadratic formula solutions', () => {
    it('generates plausible distractors for quadratic solutions', () => {
      const correctAnswer = 'x = 2, x = -3';
      const distractors = generateDistractors(correctAnswer, 'quadratic_formula');

      expect(distractors).toHaveLength(2);
      expect(distractors).not.toContain(correctAnswer);
      distractors.forEach(d => {
        expect(d).toMatch(/x.*=.*x.*=/);
      });
    });

    it('generates distractors with sign errors in solutions', () => {
      const correctAnswer = 'x = 2, x = -3';
      const distractors = generateDistractors(correctAnswer, 'quadratic_formula');

      // Should include sign errors
      const hasSignError = distractors.some(d => 
        (d.includes('+') && !correctAnswer.includes('+')) ||
        (d.includes('x = 3') || d.includes('x = -2'))
      );
      expect(hasSignError).toBe(true);
    });
  });

  describe('complex numbers', () => {
    it('generates plausible distractors for complex solutions', () => {
      const correctAnswer = 'x = 1 + 2i, x = 1 - 2i';
      const distractors = generateDistractors(correctAnswer, 'complex');

      expect(distractors).toHaveLength(2);
      expect(distractors).not.toContain(correctAnswer);
      distractors.forEach(d => {
        expect(d).toMatch(/[ij]/);
      });
    });

    it('generates distractors with conjugate errors', () => {
      const correctAnswer = 'x = 1 + 2i, x = 1 - 2i';
      const distractors = generateDistractors(correctAnswer, 'complex');

      // Should include errors in conjugate pairs
      const hasConjugateError = distractors.some(d => 
        d.includes('1 + 2i') && d.includes('1 + 2i')
      );
      expect(hasConjugateError).toBe(true);
    });
  });

  describe('fallback to prop-provided distractors', () => {
    it('uses provided distractors when available', () => {
      const correctAnswer = 'x^2 + 5x + 6';
      const providedDistractors = ['x + 5', '2x + 3'];
      const distractors = generateDistractors(correctAnswer, 'factoring', providedDistractors);

      expect(distractors).toEqual(providedDistractors);
    });

    it('generates distractors when not provided', () => {
      const correctAnswer = 'x^2 + 5x + 6';
      const distractors = generateDistractors(correctAnswer, 'factoring');

      expect(distractors).toHaveLength(2);
      expect(distractors).not.toContain(correctAnswer);
    });
  });

  describe('edge cases', () => {
    it('handles empty correct answer', () => {
      const distractors = generateDistractors('', 'factoring');

      expect(distractors).toHaveLength(2);
    });

    it('handles unknown step types gracefully', () => {
      const correctAnswer = 'some expression';
      const distractors = generateDistractors(correctAnswer, 'unknown_type' as unknown as import('@/lib/activities/algebraic/distractors').DistractorType);

      expect(distractors).toHaveLength(2);
    });
  });
});
