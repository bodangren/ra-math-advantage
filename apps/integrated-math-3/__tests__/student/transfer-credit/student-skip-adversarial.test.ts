// Adversarial tests — Student transfer-credit copy helper.
//
// Coverage map (test-strategy.md §2 + user AD labels):
//   AD7 — Unknown course prefix falls back cleanly to "a previous course"
//   AD9 — Copy helper never returns empty/undefined/NaN/"undefined" for any input
//
// The helper is intentionally fault-tolerant: any malformed or unknown
// source-course id must render "You already mastered this in <fallback>"
// without ever leaking the literal string "undefined", "null", "NaN", or
// the empty string into the rendered student copy.

import { describe, it, expect } from 'vitest';
import { getTransferCreditCopy } from '@/lib/transfer-credit/student-skip';

describe('getTransferCreditCopy — known course labels', () => {
  it('renders IM1 for math.im1', () => {
    expect(getTransferCreditCopy('math.im1')).toBe('You already mastered this in IM1');
  });

  it('renders IM2 for math.im2', () => {
    expect(getTransferCreditCopy('math.im2')).toBe('You already mastered this in IM2');
  });

  it('renders IM3 for math.im3', () => {
    expect(getTransferCreditCopy('math.im3')).toBe('You already mastered this in IM3');
  });

  it('renders AP Precalculus for math.precalc', () => {
    expect(getTransferCreditCopy('math.precalc')).toBe(
      'You already mastered this in AP Precalculus',
    );
  });

  it('renders the IM2 label for a nested math.im2.skill.<x> id', () => {
    // The helper extracts the first two dot-separated segments as the
    // course prefix, so nested ids still resolve to the right label.
    expect(getTransferCreditCopy('math.im2.skill.solve-quadratic')).toBe(
      'You already mastered this in IM2',
    );
  });
});

describe('AD7 — unknown course prefix falls back cleanly', () => {
  const unknownInputs = [
    'math.unknown',
    'math.algebra2',
    'math.geometry',
    'science.biology',
    'english.g9',
  ];

  for (const input of unknownInputs) {
    it(`fallback for "${input}" does not contain "undefined"`, () => {
      const copy = getTransferCreditCopy(input);
      expect(copy).toBeDefined();
      expect(typeof copy).toBe('string');
      expect(copy.length).toBeGreaterThan(0);
      expect(copy).not.toContain('undefined');
      expect(copy).not.toContain('null');
      expect(copy).not.toContain('NaN');
      // The fallback label is "a previous course" — verify it landed.
      expect(copy).toBe('You already mastered this in a previous course');
    });
  }
});

describe('AD9 — copy helper never returns empty/undefined for any input', () => {
  const adversarialInputs: Array<{ input: string; label: string }> = [
    { input: '', label: 'empty string' },
    { input: 'foo', label: 'single segment' },
    { input: 'math', label: 'bare "math"' },
    { input: '.', label: 'only a dot' },
    { input: '..', label: 'two dots' },
    { input: 'math.', label: 'trailing dot' },
    { input: '.im2', label: 'leading dot' },
    { input: 'math.im2.', label: 'math.im2 with trailing dot' },
    { input: 'MATH.IM2', label: 'uppercase course prefix' },
    { input: 'Math.Im2', label: 'mixed case course prefix' },
    { input: 'math.IM2', label: 'lowercase math, uppercase IM2' },
    { input: 'math  .im2', label: 'embedded whitespace' },
    { input: 'math.im2 ', label: 'trailing whitespace' },
    { input: ' math.im2', label: 'leading whitespace' },
    { input: 'math.🧮.im2', label: 'unicode segment' },
    { input: 'math.im2\n', label: 'newline at end' },
    { input: 'math.im2/skill.x', label: 'slash-separated' },
    { input: 'math.im2\x00skill.x', label: 'null character' },
    { input: 'math.im2.skill.' + 'x'.repeat(500), label: 'extremely long skill suffix' },
  ];

  for (const { input, label } of adversarialInputs) {
    it(`"${label}" produces a defined, non-empty, "undefined"-free copy`, () => {
      const copy = getTransferCreditCopy(input);
      expect(copy).toBeDefined();
      expect(typeof copy).toBe('string');
      expect(copy.length).toBeGreaterThan(0);
      expect(copy).not.toContain('undefined');
      expect(copy).not.toContain('null');
      expect(copy).not.toContain('NaN');
      // The copy must always include the trailing subject so the prompt
      // is a complete sentence even on weird input.
      expect(copy).toMatch(/this in /);
    });
  }
});

describe('getTransferCreditCopy — sanity invariants', () => {
  it('every well-known prefix produces a copy that contains the human label', () => {
    // The two well-known prefixes must NOT fall through to the generic
    // fallback (case-sensitive — uppercase variants fail over to fallback,
    // which is itself tested above).
    expect(getTransferCreditCopy('math.im1')).toContain('IM1');
    expect(getTransferCreditCopy('math.im2')).toContain('IM2');
    expect(getTransferCreditCopy('math.im3')).toContain('IM3');
    expect(getTransferCreditCopy('math.precalc')).toContain('AP Precalculus');
  });

  it('the fallback is stable across many calls', () => {
    // Determinism defense: many calls produce the same string for the
    // same input (no Date.now / no random / no closure state).
    const a = getTransferCreditCopy('math.unknown');
    for (let i = 0; i < 100; i += 1) {
      const b = getTransferCreditCopy('math.unknown');
      expect(b).toBe(a);
    }
  });
});
