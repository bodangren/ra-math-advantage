import { describe, expect, it } from 'vitest';

import { getPropsSchema } from '../schemas';
import { pointwiseLeastRateChoiceSchema } from '../schemas/pointwise-least-rate-choice.schema';
import { generateTopic12PointwiseLeastRateChoice } from '../knowledge-space/generators/topic12-pointwise-least-rate-choice';

const labels = ['A', 'B', 'C', 'D'] as const;

function baseProps(seed: number) {
  const variant = generateTopic12PointwiseLeastRateChoice(seed);
  return {
    prompt: variant.prompt,
    domain: variant.domain,
    range: variant.range,
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    graphPoints: variant.graphPoints,
    labeledPoints: variant.labeledPoints,
    options: variant.options,
  };
}

function workedProps(seed = 0) {
  const variant = generateTopic12PointwiseLeastRateChoice(seed);
  return {
    ...baseProps(seed),
    presentationMode: 'worked_example' as const,
    correctOptionId: variant.correctOptionId,
    steps: variant.solutionSteps,
    finalAnswer: 'Point D has the least rate of change (option D).',
  };
}

function guidedProps(seed = 1) {
  return {
    ...baseProps(seed),
    presentationMode: 'guided_practice' as const,
    guidedSteps: [
      'Compare whether the graph is rising or falling at each labeled point.',
      'Among the falling points, compare steepness and select the most negative rate.',
    ],
    fieldHelp: 'A steeper downward graph has a smaller rate of change.',
  };
}

function independentProps(seed = 2) {
  return {
    ...baseProps(seed),
    presentationMode: 'independent_practice' as const,
  };
}

function expectInvalid(value: unknown) {
  expect(pointwiseLeastRateChoiceSchema.safeParse(value).success).toBe(false);
}

describe('pointwise-least-rate-choice schema', () => {
  it('accepts generator-derived Worked, Guided, and Independent props', () => {
    expect(pointwiseLeastRateChoiceSchema.safeParse(workedProps(0)).success).toBe(true);
    expect(pointwiseLeastRateChoiceSchema.safeParse(guidedProps(1)).success).toBe(true);
    expect(pointwiseLeastRateChoiceSchema.safeParse(independentProps(2)).success).toBe(true);
  });

  it('resolves the exact schema through the shared registry', () => {
    expect(getPropsSchema('pointwise-least-rate-choice')).toBe(pointwiseLeastRateChoiceSchema);
  });

  it('rejects invalid graph bounds, points, and required text', () => {
    const valid = independentProps();

    expectInvalid({ ...valid, domain: [1, 1] });
    expectInvalid({ ...valid, domain: [2, 1] });
    expectInvalid({ ...valid, range: [1, 1] });
    expectInvalid({ ...valid, range: [2, 1] });
    expectInvalid({ ...valid, graphPoints: valid.graphPoints.slice(0, 5) });
    expectInvalid({ ...valid, graphPoints: valid.graphPoints.map((point, index) => index === 2 ? { ...point, x: valid.graphPoints[1]!.x } : point) });
    expectInvalid({ ...valid, graphPoints: valid.graphPoints.map((point, index) => index === 2 ? { ...point, x: valid.graphPoints[3]!.x + 0.1 } : point) });
    expectInvalid({ ...valid, graphPoints: valid.graphPoints.map((point, index) => index === 5 ? { ...point, x: valid.domain[1] + 1 } : point) });
    expectInvalid({ ...valid, graphPoints: valid.graphPoints.map((point, index) => index === 5 ? { ...point, y: valid.range[1] + 1 } : point) });
    expectInvalid({ ...valid, graphPoints: valid.graphPoints.map((point, index) => index === 2 ? { ...point, y: Number.NaN } : point) });
    expectInvalid({ ...valid, graphPoints: valid.graphPoints.map((point, index) => index === 2 ? { ...point, x: Number.POSITIVE_INFINITY } : point) });
    expectInvalid({ ...valid, prompt: ' ' });
    expectInvalid({ ...valid, xLabel: '' });
    expectInvalid({ ...valid, yLabel: ' ' });
  });

  it('requires exact A-D labeled point and option identities', () => {
    const valid = independentProps();

    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0 ? { ...point, id: 'E' } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 1 ? { ...point, id: 'A' } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0 ? { ...point, label: 'E' } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 1 ? { ...point, label: 'A' } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, label: 'B' }
        : index === 1 ? { ...point, label: 'A' } : point),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0 ? { ...option, id: 'E' } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 1 ? { ...option, id: 'A' } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0 ? { ...option, label: 'E' } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 1 ? { ...option, label: 'A' } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0
        ? { ...option, label: 'B' }
        : index === 1 ? { ...option, label: 'A' } : option),
    });
    expect(new Set(valid.labeledPoints.map((point) => point.id))).toEqual(new Set(labels));
    expect(new Set(valid.labeledPoints.map((point) => point.label))).toEqual(new Set(labels));
    expect(new Set(valid.options.map((option) => option.id))).toEqual(new Set(labels));
    expect(new Set(valid.options.map((option) => option.label))).toEqual(new Set(labels));
  });

  it('requires valid interior point references and matching coordinates', () => {
    const valid = independentProps();

    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0 ? { ...point, pointIndex: 0 } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0 ? { ...point, pointIndex: valid.graphPoints.length - 1 } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0 ? { ...point, pointIndex: point.pointIndex + 0.5 } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 1 ? { ...point, pointIndex: valid.labeledPoints[0]!.pointIndex } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0 ? { ...point, pointIndex: 1, x: valid.graphPoints[1]!.x, y: valid.graphPoints[1]!.y } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0 ? { ...point, x: point.x + 1 } : point),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0 ? { ...option, pointIndex: 0 } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0 ? { ...option, pointIndex: valid.graphPoints.length - 1 } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0 ? { ...option, pointIndex: option.pointIndex + 0.5 } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 1 ? { ...option, pointIndex: valid.options[0]!.pointIndex } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0 ? { ...option, label: 'B' } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0 ? { ...option, pointIndex: valid.options[1]!.pointIndex } : option),
    });
  });

  it('requires Worked correctOptionId membership and rejects non-Worked answer fields', () => {
    expectInvalid({ ...workedProps(), correctOptionId: 'E' });

    for (const modeProps of [guidedProps(), independentProps()]) {
      for (const key of [
        'correctOptionId',
        'steps',
        'finalAnswer',
        'expectedAnswer',
        'gradingMetadata',
        'isCorrect',
        'correctAnswer',
        'score',
        'answer',
        'solution',
      ]) {
        expectInvalid({ ...modeProps, [key]: key === 'steps' ? ['Answer'] : 'Answer' });
      }
    }
  });

  it('rejects unknown fields in every presentation mode', () => {
    for (const modeProps of [workedProps(), guidedProps(), independentProps()]) {
      expectInvalid({ ...modeProps, unknownField: true });
    }
  });
});
