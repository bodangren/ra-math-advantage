import { describe, expect, it } from 'vitest';

import { generateTopic12TableAverageRateChoice } from '@math-platform/math-content/knowledge-space';
import {
  gradeTopic12TableAverageRateChoice,
  type Topic12TableAverageRateChoiceAnswers,
} from '../../../lib/practice/topic12-table-average-rate-choice';

describe('topic12 table average-rate choice grader', () => {
  it('gives seed 0 credit only for option C', () => {
    const results = ['A', 'B', 'C', 'D'].map((selectedOptionId) => (
      gradeTopic12TableAverageRateChoice(0, { selectedOptionId })
    ));

    expect(results.map((result) => result.score)).toEqual([0, 0, 1, 0]);
    expect(results[2]).toEqual({
      score: 1,
      maxScore: 1,
      parts: [{ partId: 'selectedOptionId', rawAnswer: 'C', isCorrect: true, score: 1, maxScore: 1 }],
    });
  });

  it('grades the generated correct option for useful nonzero seeds', () => {
    for (const seed of [1, 2, 3, 17]) {
      const variant = generateTopic12TableAverageRateChoice(seed);
      const result = gradeTopic12TableAverageRateChoice(seed, {
        selectedOptionId: variant.correctOptionId,
      });

      expect(result.score).toBe(1);
      expect(result.parts[0]).toMatchObject({
        rawAnswer: variant.correctOptionId,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      });
    }
  });

  it('keeps wrong, blank, lowercase, and unknown answers raw and incorrect', () => {
    for (const selectedOptionId of ['A', '', 'c', 'Z']) {
      const result = gradeTopic12TableAverageRateChoice(0, { selectedOptionId });

      expect(result.score).toBe(0);
      expect(result.maxScore).toBe(1);
      expect(result.parts[0]).toEqual({
        partId: 'selectedOptionId',
        rawAnswer: selectedOptionId,
        isCorrect: false,
        score: 0,
        maxScore: 1,
      });
    }
  });

  it('throws the generator RangeError for invalid seeds', () => {
    const answers: Topic12TableAverageRateChoiceAnswers = { selectedOptionId: 'C' };
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => gradeTopic12TableAverageRateChoice(seed, answers)).toThrow(RangeError);
    }
  });
});
