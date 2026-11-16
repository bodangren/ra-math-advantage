import { describe, expect, it } from 'vitest';

import { generateTopic14RateSignAndTrendOutput } from '@math-platform/math-content/knowledge-space';

import {
  gradeTopic14RateSignAndTrend,
  type Topic14RateSignAndTrendAnswers,
} from '../../../lib/practice/topic14-rate-sign-and-trend';

const PART_IDS = ['rateSign', 'rateTrend'] as const;
type PartId = (typeof PART_IDS)[number];

const SOURCE_ANSWERS = {
  rateSign: 'positive',
  rateTrend: 'decreasing',
} as const;

const AUTHORITY_KEYS = [
  'answer', 'answerKey', 'correctAnswer', 'correctAnswers', 'expectedAnswer',
  'grading', 'gradingMetadata', 'normalizedAnswer', 'solution', 'solutionSteps',
  'authority', 'correctness',
] as const;

function makeAnswers(values: Partial<Record<PartId, unknown>>): Topic14RateSignAndTrendAnswers {
  return values as unknown as Topic14RateSignAndTrendAnswers;
}

function independentAnswers(seed: number): Topic14RateSignAndTrendAnswers {
  const output = generateTopic14RateSignAndTrendOutput(seed);
  return output.expectedAnswer as unknown as Topic14RateSignAndTrendAnswers;
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

function expectExactResultShape(result: ReturnType<typeof gradeTopic14RateSignAndTrend>): void {
  expect(Object.keys(result).sort()).toEqual(['maxScore', 'parts', 'score']);
  expect(result.parts).toHaveLength(2);
  expect(result.parts.map((part) => part.partId)).toEqual(PART_IDS);
  for (const part of result.parts) {
    expect(Object.keys(part).sort()).toEqual([
      'isCorrect', 'maxScore', 'partId', 'rawAnswer', 'score',
    ]);
  }
  expectNoAuthority(result);
}

describe('topic14 rate sign and trend grader', () => {
  it('grades the source answers with exact two-part result shape', () => {
    const result = gradeTopic14RateSignAndTrend(0, SOURCE_ANSWERS);

    expect(result).toEqual({
      score: 2,
      maxScore: 2,
      parts: PART_IDS.map((partId) => ({
        partId,
        rawAnswer: SOURCE_ANSWERS[partId],
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    });
    expectExactResultShape(result);
  });

  it('uses live generator authority across all four answer combinations', () => {
    const combinations = new Set<string>();

    for (let seed = 0; seed <= 100; seed += 1) {
      const answers = independentAnswers(seed);
      combinations.add(`${answers.rateSign}/${answers.rateTrend}`);
      const result = gradeTopic14RateSignAndTrend(seed, answers);
      expect(result.score).toBe(2);
      expect(result.parts.every((part) => part.isCorrect)).toBe(true);
      expectExactResultShape(result);
    }

    expect(combinations).toEqual(new Set([
      'positive/increasing',
      'positive/decreasing',
      'negative/increasing',
      'negative/decreasing',
    ]));
  });

  it('awards independent partial credit and preserves raw values', () => {
    for (const partId of PART_IDS) {
      const answers = { ...SOURCE_ANSWERS, [partId]: 'wrong' };
      const result = gradeTopic14RateSignAndTrend(0, makeAnswers(answers));
      expect(result.score).toBe(1);
      expect(result.parts.find((part) => part.partId === partId)).toEqual({
        partId,
        rawAnswer: 'wrong',
        isCorrect: false,
        score: 0,
        maxScore: 1,
      });
      expect(result.parts.filter((part) => part.partId !== partId).every((part) => part.isCorrect)).toBe(true);
    }

    const zero = gradeTopic14RateSignAndTrend(0, makeAnswers({
      rateSign: 'negative',
      rateTrend: 'increasing',
    }));
    expect(zero.score).toBe(0);
    expect(zero.parts.map((part) => part.rawAnswer)).toEqual(['negative', 'increasing']);
    expectExactResultShape(zero);
  });

  it('rejects malformed and non-string values without erasing other credit', () => {
    const malformed: unknown[] = [
      '', ' Positive', 'positive ', 'Positive', 'positive-ish', '1', null, undefined,
      true, false, 1, [], {},
    ];

    for (const partId of PART_IDS) {
      for (const rawAnswer of malformed) {
        const result = gradeTopic14RateSignAndTrend(0, makeAnswers({
          ...SOURCE_ANSWERS,
          [partId]: rawAnswer,
        }));
        expect(result.score).toBe(1);
        expect(result.parts.find((part) => part.partId === partId)).toEqual({
          partId,
          rawAnswer,
          isCorrect: false,
          score: 0,
          maxScore: 1,
        });
        expect(result.parts.filter((part) => part.partId !== partId).every((part) => part.isCorrect)).toBe(true);
        expectExactResultShape(result);
      }
    }

    const missing = gradeTopic14RateSignAndTrend(0, makeAnswers({ rateSign: SOURCE_ANSWERS.rateSign }));
    expect(missing.score).toBe(1);
    expect(missing.parts[1]?.rawAnswer).toBeUndefined();

    const extra = gradeTopic14RateSignAndTrend(0, {
      ...SOURCE_ANSWERS,
      extra: 'ignored',
    } as Topic14RateSignAndTrendAnswers & { extra: string });
    expect(extra.score).toBe(2);
    expectExactResultShape(extra);
  });

  it('is deterministic and passes invalid seeds through unchanged', () => {
    expect(gradeTopic14RateSignAndTrend(17, independentAnswers(17))).toEqual(
      gradeTopic14RateSignAndTrend(17, independentAnswers(17)),
    );

    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => gradeTopic14RateSignAndTrend(seed, SOURCE_ANSWERS)).toThrow(RangeError);
    }
  });
});
