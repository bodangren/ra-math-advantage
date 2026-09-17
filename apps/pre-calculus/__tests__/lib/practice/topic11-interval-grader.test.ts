import { describe, expect, it } from 'vitest';

import {
  gradeTopic11IntervalGraph,
  type Topic11IntervalAnswers,
} from '../../../lib/practice/topic11-interval-graph';
import { generateTopic11IntervalGraph } from '../../../lib/practice/topic11-interval-graph';

const SEED_ZERO_ANSWERS: Topic11IntervalAnswers = {
  increasingIntervals: '[0,3] U [7,9]',
  decreasingIntervals: '[3,7]',
  constantIntervals: 'none',
};

function answersForSeed(seed: number): Topic11IntervalAnswers {
  const variant = generateTopic11IntervalGraph(seed);
  const format = (intervals: readonly (readonly [number, number])[]) => (
    intervals.map(([start, end]) => `(${start},${end})`).reverse().join(' ∪ ')
  );
  return {
    increasingIntervals: format(variant.increasingIntervals),
    decreasingIntervals: format(variant.decreasingIntervals),
    constantIntervals: 'NO INTERVALS',
  };
}

describe('Topic 1.1 interval grader', () => {
  it('gives seed 0 full credit with flexible delimiters, spaces, union, and order', () => {
    const result = gradeTopic11IntervalGraph(0, {
      increasingIntervals: ' (7, 9) ∪ [0, 3] ',
      decreasingIntervals: '[3, 7]',
      constantIntervals: 'No intervals',
    });

    expect(result).toEqual({
      score: 3,
      maxScore: 3,
      parts: [
        {
          partId: 'increasingIntervals',
          rawAnswer: ' (7, 9) ∪ [0, 3] ',
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: 'decreasingIntervals',
          rawAnswer: '[3, 7]',
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: 'constantIntervals',
          rawAnswer: 'No intervals',
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
  });

  it('gives partial credit and rejects malformed, reversed, extra, or empty answers', () => {
    const result = gradeTopic11IntervalGraph(0, {
      increasingIntervals: '[0,3] U [7,9] extra',
      decreasingIntervals: '[7,3]',
      constantIntervals: '',
    });

    expect(result.score).toBe(0);
    expect(result.parts).toEqual([
      expect.objectContaining({ partId: 'increasingIntervals', isCorrect: false, score: 0 }),
      expect.objectContaining({ partId: 'decreasingIntervals', isCorrect: false, score: 0 }),
      expect.objectContaining({ partId: 'constantIntervals', isCorrect: false, score: 0 }),
    ]);

    const partial = gradeTopic11IntervalGraph(0, {
      ...SEED_ZERO_ANSWERS,
      decreasingIntervals: '[7,3]',
    });
    expect(partial.score).toBe(2);
    expect(partial.parts[1]).toMatchObject({
      partId: 'decreasingIntervals',
      isCorrect: false,
      score: 0,
    });

    const wrongEndpoint = gradeTopic11IntervalGraph(0, {
      ...SEED_ZERO_ANSWERS,
      increasingIntervals: '[0,4] U [7,9]',
    });
    expect(wrongEndpoint.score).toBe(2);
    expect(wrongEndpoint.parts[0]).toMatchObject({
      partId: 'increasingIntervals',
      isCorrect: false,
      score: 0,
    });
  });

  it('grades a nonzero seed from its own generated endpoints', () => {
    const generatedAnswers = answersForSeed(1);
    const result = gradeTopic11IntervalGraph(1, generatedAnswers);
    expect(result.score).toBe(3);
    expect(gradeTopic11IntervalGraph(1, SEED_ZERO_ANSWERS).score).toBeLessThan(3);
  });

  it('keeps the generator RangeError for invalid seeds', () => {
    expect(() => gradeTopic11IntervalGraph(-1, SEED_ZERO_ANSWERS)).toThrow(RangeError);
    expect(() => gradeTopic11IntervalGraph(1.5, SEED_ZERO_ANSWERS)).toThrow(RangeError);
  });
});
