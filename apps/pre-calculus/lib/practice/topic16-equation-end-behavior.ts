import { generateTopic16EquationEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';

export type Topic16EquationEndBehaviorPartId = `${'a' | 'b' | 'c' | 'd' | 'e' | 'f'}_${'leftEnd' | 'rightEnd'}`;
export type Topic16EquationEndBehaviorAnswers = Record<Topic16EquationEndBehaviorPartId, unknown>;

const PART_IDS: readonly Topic16EquationEndBehaviorPartId[] = [
  'a_leftEnd',
  'a_rightEnd',
  'b_leftEnd',
  'b_rightEnd',
  'c_leftEnd',
  'c_rightEnd',
  'd_leftEnd',
  'd_rightEnd',
  'e_leftEnd',
  'e_rightEnd',
  'f_leftEnd',
  'f_rightEnd',
];

function isCanonicalAnswer(rawAnswer: unknown): rawAnswer is 'up' | 'down' {
  return rawAnswer === 'up' || rawAnswer === 'down';
}

export function gradeTopic16EquationEndBehavior(
  seed: number,
  answers: Topic16EquationEndBehaviorAnswers,
) {
  const expected = generateTopic16EquationEndBehaviorOutput(seed).expectedAnswer as Record<
    Topic16EquationEndBehaviorPartId,
    'up' | 'down'
  >;
  const parts = PART_IDS.map((partId) => {
    const rawAnswer = answers[partId];
    const isCorrect = isCanonicalAnswer(rawAnswer) && rawAnswer === expected[partId];
    return {
      partId,
      rawAnswer,
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
    };
  });

  return {
    score: parts.reduce((total, part) => total + part.score, 0),
    maxScore: 12,
    parts,
  };
}
