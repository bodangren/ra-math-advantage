import { describe, it, expect } from 'vitest';
import { formatLinearTerm, formatQuadratic } from '../utils/expression-builder';

describe('formatLinearTerm', () => {
  it('hides a leading coefficient of 1', () => {
    expect(formatLinearTerm(1, 0)).toBe('x');
    expect(formatLinearTerm(1, 2)).toBe('x + 2');
  });

  it('formats a leading coefficient of -1 as "-x"', () => {
    expect(formatLinearTerm(-1, 0)).toBe('-x');
    expect(formatLinearTerm(-1, 2)).toBe('-x + 2');
  });

  it('formats positive coefficients', () => {
    expect(formatLinearTerm(2, 3)).toBe('2x + 3');
  });

  it('formats negative constants without "+ -"', () => {
    expect(formatLinearTerm(2, -3)).toBe('2x - 3');
  });

  it('omits the x term when the coefficient is 0', () => {
    expect(formatLinearTerm(0, 5)).toBe('5');
    expect(formatLinearTerm(0, -5)).toBe('-5');
  });

  it('omits a trailing "+ 0" constant', () => {
    expect(formatLinearTerm(2, 0)).toBe('2x');
    expect(formatLinearTerm(-3, 0)).toBe('-3x');
  });

  it('formats negative linear and negative constant together', () => {
    expect(formatLinearTerm(-3, -4)).toBe('-3x - 4');
  });

  it('never emits forbidden substrings', () => {
    const outputs = [
      formatLinearTerm(1, 0),
      formatLinearTerm(-1, 0),
      formatLinearTerm(2, 3),
      formatLinearTerm(2, -3),
      formatLinearTerm(0, 5),
      formatLinearTerm(0, -5),
      formatLinearTerm(-3, -4),
    ];
    for (const out of outputs) {
      expect(out).not.toMatch(/1x/);
      expect(out).not.toMatch(/-1x/);
      expect(out).not.toMatch(/\+\s*-/);
      expect(out).not.toMatch(/0x/);
      expect(out).not.toMatch(/\+\s*0$/);
      expect(out).not.toMatch(/^\+/);
    }
  });
});

describe('formatQuadratic', () => {
  it('hides a leading coefficient of 1', () => {
    expect(formatQuadratic(1, 0, 0)).toBe('x^2');
    expect(formatQuadratic(1, 2, 3)).toBe('x^2 + 2x + 3');
  });

  it('formats a leading coefficient of -1 as "-x^2"', () => {
    expect(formatQuadratic(-1, 0, 0)).toBe('-x^2');
    expect(formatQuadratic(-1, 2, 3)).toBe('-x^2 + 2x + 3');
  });

  it('omits zero terms', () => {
    expect(formatQuadratic(2, 0, 5)).toBe('2x^2 + 5');
    expect(formatQuadratic(2, 3, 0)).toBe('2x^2 + 3x');
    expect(formatQuadratic(0, 3, 5)).toBe('3x + 5');
  });

  it('normalizes signs without "+ -"', () => {
    expect(formatQuadratic(1, -2, 3)).toBe('x^2 - 2x + 3');
    expect(formatQuadratic(1, 2, -3)).toBe('x^2 + 2x - 3');
    expect(formatQuadratic(1, -2, -3)).toBe('x^2 - 2x - 3');
    expect(formatQuadratic(-2, -3, -4)).toBe('-2x^2 - 3x - 4');
  });

  it('never emits forbidden substrings', () => {
    const outputs = [
      formatQuadratic(1, 0, 0),
      formatQuadratic(-1, 0, 0),
      formatQuadratic(2, 3, 4),
      formatQuadratic(1, -2, 3),
      formatQuadratic(0, -3, 5),
    ];
    for (const out of outputs) {
      expect(out).not.toMatch(/(^|[^0-9])1x/);
      expect(out).not.toMatch(/-1x/);
      expect(out).not.toMatch(/\+\s*-/);
      expect(out).not.toMatch(/0x\^2/);
      expect(out).not.toMatch(/\+\s*0$/);
      expect(out).not.toMatch(/^\+/);
    }
  });
});
