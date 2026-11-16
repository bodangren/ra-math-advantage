import { describe, expect, it } from 'vitest';
import { intervalClassificationSchema } from '../schemas/interval-classification.schema';

const geometry = {
  prompt: 'Classify each interval.',
  domain: [0, 8],
  changePoints: [2, 4],
  points: [{ x: 0, y: 5 }, { x: 2, y: 8 }, { x: 4, y: 8 }, { x: 8, y: 6 }],
};
const independent = { ...geometry, presentationMode: 'independent_practice' };

describe('interval classification public contract', () => {
  it('accepts all three modes and a constant segment', () => {
    expect(intervalClassificationSchema.safeParse(independent).success).toBe(true);
    expect(intervalClassificationSchema.safeParse({ ...geometry, presentationMode: 'worked_example',
      steps: [{ description: 'Compare the endpoint heights.', expression: '8 = 8' }],
      finalAnswer: 'The graph is constant on [2,4].' }).success).toBe(true);
    expect(intervalClassificationSchema.safeParse({ ...geometry, presentationMode: 'guided_practice',
      guidedSteps: ['Compare the heights from left to right.'],
      fieldHelp: { increasingIntervals: 'Find rising segments.', decreasingIntervals: 'Find falling segments.',
        constantIntervals: 'Find equal heights.' } }).success).toBe(true);
  });

  it.each(['finalAnswer', 'answer', 'solution', 'steps'])('rejects Independent solution field %s', (field) => {
    expect(intervalClassificationSchema.safeParse({ ...independent, [field]: 'private answer' }).success).toBe(false);
  });

  it('rejects unordered, inconsistent, nonfinite, missing, and all-constant geometry', () => {
    for (const invalid of [
      { domain: [8, 0] }, { changePoints: [4, 2] }, { changePoints: [0, 4] },
      { points: geometry.points.slice(0, 3) },
      { points: geometry.points.map((point) => ({ ...point, x: point.x + 1 })) },
      { points: geometry.points.map((point) => ({ ...point, y: NaN })) },
      { points: geometry.points.map((point) => ({ ...point, y: 8 })) },
    ]) expect(intervalClassificationSchema.safeParse({ ...independent, ...invalid }).success).toBe(false);
  });
});
