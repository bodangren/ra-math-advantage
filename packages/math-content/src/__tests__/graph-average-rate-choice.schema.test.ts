import { describe, expect, it } from 'vitest';

import {
  graphAverageRateChoiceSchema,
  getPropsSchema,
} from '../index';
import { generateTopic12GraphAverageRateChoice } from '../knowledge-space';

const NODE_ID = 'math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change';

function propsFor(seed: number, presentationMode: 'worked_example' | 'guided_practice' | 'independent_practice') {
  const variant = generateTopic12GraphAverageRateChoice(seed);
  const base = {
    prompt: variant.prompt,
    domain: variant.domain,
    range: variant.range,
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    graphPoints: variant.graphPoints,
    options: variant.options,
    presentationMode,
  };

  if (presentationMode === 'worked_example') {
    return {
      ...base,
      correctOptionId: variant.correctOptionId,
      steps: variant.solutionSteps,
      finalAnswer: `Option ${variant.correctOptionId} has the greatest average rate of change.`,
    };
  }
  if (presentationMode === 'guided_practice') {
    return {
      ...base,
      guidedSteps: [
        'Calculate each endpoint rate.',
        'Select the interval with the greatest rate.',
      ],
      fieldHelp: 'Use change in output divided by change in input.',
    };
  }
  return base;
}

describe('graph-average-rate-choice schema', () => {
  it('accepts strict Worked, Guided, and Independent generator-derived props', () => {
    expect(graphAverageRateChoiceSchema.safeParse(propsFor(0, 'worked_example')).success).toBe(true);
    expect(graphAverageRateChoiceSchema.safeParse(propsFor(1, 'guided_practice')).success).toBe(true);
    expect(graphAverageRateChoiceSchema.safeParse(propsFor(2, 'independent_practice')).success).toBe(true);
    expect(getPropsSchema('graph-average-rate-choice')).toBe(graphAverageRateChoiceSchema);
  });

  it('rejects solution and authority fields outside Worked mode', () => {
    for (const mode of ['guided_practice', 'independent_practice'] as const) {
      const props = propsFor(1, mode);
      for (const key of ['correctOptionId', 'steps', 'finalAnswer', 'expectedAnswer', 'gradingMetadata', 'isCorrect', 'correctAnswer']) {
        expect(graphAverageRateChoiceSchema.safeParse({ ...props, [key]: 'leak' }).success).toBe(false);
      }
      expect(graphAverageRateChoiceSchema.safeParse({ ...props, unknownField: true }).success).toBe(false);
    }
    expect(graphAverageRateChoiceSchema.safeParse({ ...propsFor(0, 'worked_example'), unknownField: true }).success).toBe(false);
  });

  it('rejects invalid geometry and option contracts', () => {
    const independent = propsFor(1, 'independent_practice');
    const points = independent.graphPoints;
    const options = independent.options;

    expect(graphAverageRateChoiceSchema.safeParse({
      ...independent,
      graphPoints: points.slice(0, 5),
    }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({
      ...independent,
      graphPoints: points.map((point, index) => index === 2 ? { ...point, x: points[1]!.x } : point),
    }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({
      ...independent,
      graphPoints: points.map((point, index) => index === 2 ? { ...point, x: points[1]!.x - 1 } : point),
    }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({
      ...independent,
      graphPoints: points.map((point, index) => index === 2 ? { ...point, y: 99 } : point),
    }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({ ...independent, domain: [4, 4] }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({ ...independent, range: [11, 0] }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({
      ...independent,
      options: options.map((option, index) => index === 1 ? { ...option, id: options[0]!.id } : option),
    }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({
      ...independent,
      options: options.map((option, index) => index === 0 ? { ...option, startInput: 999 } : option),
    }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({
      ...independent,
      options: options.map((option, index) => index === 0 ? { ...option, endInput: option.startInput } : option),
    }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({ ...independent, options: options.slice(0, 3) }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({
      ...independent,
      graphPoints: points.map((point, index) => index === 0 ? { ...point, x: Number.NaN } : point),
    }).success).toBe(false);
  });

  it('requires a Worked correct option and rejects blank required text', () => {
    const worked = propsFor(0, 'worked_example');

    expect(graphAverageRateChoiceSchema.safeParse({ ...worked, correctOptionId: 'Z' }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({ ...worked, title: ' ' }).success).toBe(false);
    expect(graphAverageRateChoiceSchema.safeParse({ ...worked, prompt: ' ' }).success).toBe(false);
  });
});
