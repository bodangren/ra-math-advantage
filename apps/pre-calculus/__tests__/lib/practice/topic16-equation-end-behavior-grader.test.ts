import { describe, expect, it } from 'vitest';

import { generateTopic16EquationEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';

import {
  gradeTopic16EquationEndBehavior,
  type Topic16EquationEndBehaviorAnswers,
} from '../../../lib/practice/topic16-equation-end-behavior';

const PART_IDS = [
  'a_leftEnd', 'a_rightEnd', 'b_leftEnd', 'b_rightEnd', 'c_leftEnd', 'c_rightEnd',
  'd_leftEnd', 'd_rightEnd', 'e_leftEnd', 'e_rightEnd', 'f_leftEnd', 'f_rightEnd',
] as const;
type PartId = (typeof PART_IDS)[number];

const SOURCE_ANSWERS = {
  a_leftEnd: 'down',
  a_rightEnd: 'up',
  b_leftEnd: 'up',
  b_rightEnd: 'up',
  c_leftEnd: 'down',
  c_rightEnd: 'down',
  d_leftEnd: 'up',
  d_rightEnd: 'down',
  e_leftEnd: 'up',
  e_rightEnd: 'down',
  f_leftEnd: 'up',
  f_rightEnd: 'down',
} as const;

const AUTHORITY_KEYS = [
  'answer', 'answerKey', 'correctAnswer', 'correctAnswers', 'expectedAnswer',
  'grading', 'gradingMetadata', 'normalizedAnswer', 'solution', 'solutionSteps',
  'authority', 'correctness',
] as const;

function makeAnswers(values: Partial<Record<PartId, unknown>>): Topic16EquationEndBehaviorAnswers {
  return values as unknown as Topic16EquationEndBehaviorAnswers;
}

function independentAnswers(seed: number): Topic16EquationEndBehaviorAnswers {
  return generateTopic16EquationEndBehaviorOutput(seed).expectedAnswer as unknown as Topic16EquationEndBehaviorAnswers;
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

function expectExactResultShape(
  result: ReturnType<typeof gradeTopic16EquationEndBehavior>,
): void {
  expect(Object.keys(result).sort()).toEqual(['maxScore', 'parts', 'score']);
  expect(result.parts).toHaveLength(12);
  expect(result.parts.map((part) => part.partId)).toEqual(PART_IDS);
  for (const part of result.parts) {
    expect(Object.keys(part).sort()).toEqual([
      'isCorrect', 'maxScore', 'partId', 'rawAnswer', 'score',
    ]);
  }
  expectNoAuthority(result);
}

describe('topic16 equation end behavior grader', () => {
  it('grades all source answers with the exact 12-part result shape', () => {
    const result = gradeTopic16EquationEndBehavior(0, SOURCE_ANSWERS);

    expect(result).toEqual({
      score: 12,
      maxScore: 12,
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

  it('uses live generator authority across all four end-direction patterns', () => {
    const combinations = new Set<string>();

    for (let seed = 0; seed <= 200; seed += 1) {
      const answers = independentAnswers(seed);
      for (const itemId of ['a', 'b', 'c', 'd', 'e', 'f']) {
        combinations.add(`${answers[`${itemId}_leftEnd` as PartId]}/${answers[`${itemId}_rightEnd` as PartId]}`);
      }
      const result = gradeTopic16EquationEndBehavior(seed, answers);
      expect(result.score).toBe(12);
      expect(result.parts.every((part) => part.isCorrect)).toBe(true);
      expectExactResultShape(result);
    }

    expect(combinations).toEqual(new Set(['up/up', 'up/down', 'down/up', 'down/down']));
  });

  it('awards one point per part and preserves partial raw values', () => {
    const answers = makeAnswers({
      ...SOURCE_ANSWERS,
      e_leftEnd: 'down',
    });
    const result = gradeTopic16EquationEndBehavior(0, answers);

    expect(result.score).toBe(11);
    expect(result.maxScore).toBe(12);
    expect(result.parts.find((part) => part.partId === 'e_leftEnd')).toEqual({
      partId: 'e_leftEnd',
      rawAnswer: 'down',
      isCorrect: false,
      score: 0,
      maxScore: 1,
    });
    expect(result.parts.filter((part) => part.partId !== 'e_leftEnd').every((part) => part.isCorrect)).toBe(true);
    expectExactResultShape(result);
  });

  it('keeps malformed, missing, non-string, and noncanonical values wrong', () => {
    const malformed: unknown[] = [
      '', ' up', 'down ', 'Up', 'UP', 'positive', '1', null, undefined, true, false, 1, [], {},
    ];

    for (const partId of PART_IDS) {
      for (const rawAnswer of malformed) {
        const result = gradeTopic16EquationEndBehavior(0, makeAnswers({
          ...SOURCE_ANSWERS,
          [partId]: rawAnswer,
        }));
        expect(result.score).toBe(11);
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

    const missing = gradeTopic16EquationEndBehavior(0, makeAnswers({ ...SOURCE_ANSWERS, a_leftEnd: undefined }));
    expect(missing.score).toBe(11);
    expect(missing.parts[0]?.rawAnswer).toBeUndefined();
    expectExactResultShape(missing);

    const extra = gradeTopic16EquationEndBehavior(0, {
      ...SOURCE_ANSWERS,
      extra: 'ignored',
    } as Topic16EquationEndBehaviorAnswers & { extra: string });
    expect(extra.score).toBe(12);
    expect(extra.parts.every((part) => part.isCorrect)).toBe(true);
    expectExactResultShape(extra);
  });

  it('is deterministic and passes invalid seeds through the generator', () => {
    expect(gradeTopic16EquationEndBehavior(17, independentAnswers(17))).toEqual(
      gradeTopic16EquationEndBehavior(17, independentAnswers(17)),
    );

    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => gradeTopic16EquationEndBehavior(seed, SOURCE_ANSWERS)).toThrow(RangeError);
    }
  });
});
