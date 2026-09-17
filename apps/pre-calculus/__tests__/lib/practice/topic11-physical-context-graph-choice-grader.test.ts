import { describe, expect, it } from 'vitest';

import { generateTopic11PhysicalContextGraphChoice } from '@math-platform/math-content/knowledge-space';
import {
  gradeTopic11PhysicalContextGraphChoice,
  type Topic11PhysicalContextGraphChoiceAnswers,
} from '../../../lib/practice/topic11-physical-context-graph-choice';

describe('topic11 physical-context graph-choice grader', () => {
  it('gives seed 0 credit only for Graph D', () => {
    const answers = ['A', 'B', 'C', 'D'].map((selectedOptionId) => ({ selectedOptionId }));
    const results = answers.map((answer) => gradeTopic11PhysicalContextGraphChoice(0, answer));

    expect(results.map((result) => result.score)).toEqual([0, 0, 0, 1]);
    expect(results[3]).toEqual({
      score: 1,
      maxScore: 1,
      parts: [{ partId: 'selectedOptionId', rawAnswer: 'D', isCorrect: true, score: 1, maxScore: 1 }],
    });
  });

  it('grades the generated correct ID for a nonzero seed and rejects seed-0 D when it differs', () => {
    const variant = generateTopic11PhysicalContextGraphChoice(1);
    expect(variant.containerProfile).toBe('wide-narrow-wide');
    expect(variant.correctOptionId).toBe('C');
    expect(gradeTopic11PhysicalContextGraphChoice(1, { selectedOptionId: 'C' }).score).toBe(1);
    expect(gradeTopic11PhysicalContextGraphChoice(1, { selectedOptionId: 'D' }).score).toBe(0);
  });

  it('grades blank, lowercase, and unknown IDs as incorrect and preserves raw answers', () => {
    for (const selectedOptionId of ['', 'd', 'Z']) {
      const result = gradeTopic11PhysicalContextGraphChoice(0, { selectedOptionId });
      expect(result.score).toBe(0);
      expect(result.parts[0]).toMatchObject({ partId: 'selectedOptionId', rawAnswer: selectedOptionId, isCorrect: false, score: 0, maxScore: 1 });
    }
  });

  it('throws the generator RangeError for invalid seeds', () => {
    const answers: Topic11PhysicalContextGraphChoiceAnswers = { selectedOptionId: 'D' };
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => gradeTopic11PhysicalContextGraphChoice(seed, answers)).toThrow(RangeError);
    }
  });
});
