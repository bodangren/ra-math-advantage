import { describe, it, expect } from 'vitest';
import { getTransferCreditCopy } from '@/lib/transfer-credit/student-skip';

describe('getTransferCreditCopy', () => {
  it('returns IM2 label for math.im2 source course', () => {
    expect(getTransferCreditCopy('math.im2')).toBe('You already mastered this in IM2');
  });

  it('returns IM1 label for math.im1 source course', () => {
    expect(getTransferCreditCopy('math.im1')).toBe('You already mastered this in IM1');
  });

  it('returns IM3 label for math.im3 source course', () => {
    expect(getTransferCreditCopy('math.im3')).toBe('You already mastered this in IM3');
  });

  it('returns AP Precalculus label for math.precalc source course', () => {
    expect(getTransferCreditCopy('math.precalc')).toBe(
      'You already mastered this in AP Precalculus',
    );
  });

  it('returns a fallback label for an unknown course prefix', () => {
    const copy = getTransferCreditCopy('math.unknown');
    expect(copy).toBeDefined();
    expect(copy).not.toContain('undefined');
    expect(copy.length).toBeGreaterThan(0);
  });

  it('returns a fallback label for a malformed id', () => {
    const copy = getTransferCreditCopy('foo');
    expect(copy).toBeDefined();
    expect(copy).not.toContain('undefined');
    expect(copy.length).toBeGreaterThan(0);
  });
});
