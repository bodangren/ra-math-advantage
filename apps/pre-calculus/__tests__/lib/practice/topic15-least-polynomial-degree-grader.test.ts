import { describe, expect, it } from 'vitest';

import { generateTopic15LeastPolynomialDegreeOutput } from '@math-platform/math-content/knowledge-space';

import {
  gradeTopic15LeastPolynomialDegree,
  type Topic15LeastPolynomialDegreeAnswers,
} from '../../../lib/practice/topic15-least-polynomial-degree';

const SOURCE_ANSWER = { leastDegree: 5 } as const;
const AUTHORITY_KEYS = [
  'answer', 'answerKey', 'correctAnswer', 'correctAnswers', 'expectedAnswer',
  'grading', 'gradingMetadata', 'normalizedAnswer', 'solution', 'solutionSteps',
  'authority', 'correctness',
] as const;

function makeAnswers(value: unknown): Topic15LeastPolynomialDegreeAnswers {
  return { leastDegree: value } as unknown as Topic15LeastPolynomialDegreeAnswers;
}

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectObjectKeys(item, keys));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, nested]) => {
    keys.push(key);
    collectObjectKeys(nested, keys);
  });
  return keys;
}

function expectNoAuthority(value: unknown): void {
  const keys = collectObjectKeys(value);
  for (const key of AUTHORITY_KEYS) expect(keys).not.toContain(key);
}

function expectExactResultShape(result: ReturnType<typeof gradeTopic15LeastPolynomialDegree>): void {
  expect(Object.keys(result).sort()).toEqual(['maxScore', 'parts', 'score']);
  expect(result.score === 0 || result.score === 1).toBe(true);
  expect(result.maxScore).toBe(1);
  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toBeDefined();
  expect(Object.keys(result.parts[0] ?? {}).sort()).toEqual([
    'isCorrect', 'maxScore', 'partId', 'rawAnswer', 'score',
  ]);
  expect(result.parts[0]?.partId).toBe('leastDegree');
  expect(result.parts[0]?.maxScore).toBe(1);
  expect(result.parts[0]?.score === 0 || result.parts[0]?.score === 1).toBe(true);
  expectNoAuthority(result);
}

describe('topic15 least polynomial degree grader', () => {
  it('grades the literal source answer with the exact result shape', () => {
    const result = gradeTopic15LeastPolynomialDegree(0, SOURCE_ANSWER);

    expect(result).toEqual({
      score: 1,
      maxScore: 1,
      parts: [{
        partId: 'leastDegree',
        rawAnswer: 5,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
    });
    expectExactResultShape(result);
  });

  it('uses live generator authority for seeds 0 through 200', () => {
    for (let seed = 0; seed <= 200; seed += 1) {
      const expected = generateTopic15LeastPolynomialDegreeOutput(seed).expectedAnswer.leastDegree as number;
      const result = gradeTopic15LeastPolynomialDegree(seed, { leastDegree: expected });
      expect(result.score).toBe(1);
      expect(result.parts[0]?.isCorrect).toBe(true);
      expectExactResultShape(result);
    }
  });

  it('scores a finite wrong integer as zero and preserves the raw value', () => {
    const result = gradeTopic15LeastPolynomialDegree(0, SOURCE_ANSWER);
    const wrong = gradeTopic15LeastPolynomialDegree(0, makeAnswers(4));

    expect(result.score).toBe(1);
    expect(wrong).toEqual({
      score: 0,
      maxScore: 1,
      parts: [{
        partId: 'leastDegree',
        rawAnswer: 4,
        isCorrect: false,
        score: 0,
        maxScore: 1,
      }],
    });
    expectExactResultShape(wrong);
  });

  it('rejects malformed values without throwing or erasing raw values', () => {
    const malformed: unknown[] = [
      null,
      undefined,
      '5',
      4.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
      [],
      {},
      true,
      false,
    ];

    for (const rawAnswer of malformed) {
      const result = gradeTopic15LeastPolynomialDegree(0, makeAnswers(rawAnswer));
      expect(result.score).toBe(0);
      expect(result.parts[0]?.rawAnswer).toBe(rawAnswer);
      expect(result.parts[0]?.isCorrect).toBe(false);
      expectExactResultShape(result);
    }

    const missing = gradeTopic15LeastPolynomialDegree(0, {} as Topic15LeastPolynomialDegreeAnswers);
    expect(missing.parts[0]?.rawAnswer).toBeUndefined();
    expect(missing.score).toBe(0);
    expectExactResultShape(missing);

    const extra = gradeTopic15LeastPolynomialDegree(0, {
      ...SOURCE_ANSWER,
      extra: 'ignored',
    } as Topic15LeastPolynomialDegreeAnswers & { extra: string });
    expect(extra.score).toBe(1);
    expectExactResultShape(extra);
  });

  it('is deterministic and propagates invalid seeds', () => {
    const first = gradeTopic15LeastPolynomialDegree(17, makeAnswers(4));
    expect(first).toEqual(gradeTopic15LeastPolynomialDegree(17, makeAnswers(4)));

    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => gradeTopic15LeastPolynomialDegree(seed, SOURCE_ANSWER)).toThrow(RangeError);
    }
  });
});
