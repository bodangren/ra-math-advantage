import { describe, expect, it } from 'vitest';

import {
  getPropsSchema,
  pointwiseRateOrderingSchema,
} from '../schemas';
import {
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
} from '../knowledge-space/generators/topic12-pointwise-rate-ordering';

function baseProps(seed: number) {
  const variant = generateTopic12PointwiseRateOrdering(seed);
  return {
    prompt: variant.prompt,
    domain: variant.domain,
    range: variant.range,
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    graphPoints: variant.graphPoints,
    labeledPoints: variant.labeledPoints,
  };
}

function workedProps(seed = 0) {
  const variant = generateTopic12PointwiseRateOrdering(seed);
  const output = generateTopic12PointwiseRateOrderingOutput(seed);
  return {
    ...baseProps(seed),
    presentationMode: 'worked_example' as const,
    orderedPointIds: (output.expectedAnswer as { orderedPointIds: string[] }).orderedPointIds,
    steps: variant.solutionSteps,
    finalAnswer: 'Point B has the least rate, point C is next, and point A has the greatest rate.',
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
  expect(pointwiseRateOrderingSchema.safeParse(value).success).toBe(false);
}

describe('pointwise-rate-ordering schema', () => {
  it('accepts generator-derived Worked, Guided, and Independent props', () => {
    const worked = workedProps(0);
    expect(worked.orderedPointIds).toEqual(['B', 'C', 'A']);
    expect(pointwiseRateOrderingSchema.safeParse(worked).success).toBe(true);
    expect(pointwiseRateOrderingSchema.safeParse(guidedProps(1)).success).toBe(true);
    expect(pointwiseRateOrderingSchema.safeParse(independentProps(2)).success).toBe(true);
  });

  it('resolves the exact schema through the shared registry', () => {
    expect(getPropsSchema('pointwise-rate-ordering')).toBe(pointwiseRateOrderingSchema);
  });

  it('requires bounded ordered graph geometry and interior labeled references', () => {
    const valid = independentProps();

    expectInvalid({ ...valid, domain: [1, 1] });
    expectInvalid({ ...valid, range: [2, 1] });
    expectInvalid({ ...valid, title: ' ' });
    expectInvalid({ ...valid, graphPoints: valid.graphPoints.slice(0, 5) });
    expectInvalid({
      ...valid,
      graphPoints: valid.graphPoints.map((point, index) => index === 2
        ? { ...point, x: valid.graphPoints[1]!.x }
        : point),
    });
    expectInvalid({
      ...valid,
      graphPoints: valid.graphPoints.map((point, index) => index === 2
        ? { ...point, x: valid.graphPoints[3]!.x + 0.1 }
        : point),
    });
    expectInvalid({
      ...valid,
      graphPoints: valid.graphPoints.map((point, index) => index === 2
        ? { ...point, x: valid.domain[1] + 1 }
        : point),
    });
    expectInvalid({
      ...valid,
      graphPoints: valid.graphPoints.map((point, index) => index === 2
        ? { ...point, y: valid.range[1] + 1 }
        : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, pointIndex: 0 }
        : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, pointIndex: valid.graphPoints.length - 1 }
        : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, pointIndex: point.pointIndex + 0.5 }
        : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 1
        ? { ...point, pointIndex: valid.labeledPoints[0]!.pointIndex }
        : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, x: point.x + 1 }
        : point),
    });
  });

  it('requires exact A-B-C point identities and one valid Worked order permutation', () => {
    const valid = independentProps();

    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, id: 'B' }
        : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, label: 'B' }
        : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, label: 'B' }
        : index === 1 ? { ...point, label: 'A' } : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, id: 'B', label: 'B' }
        : point),
    });
    expectInvalid({
      ...valid,
      labeledPoints: valid.labeledPoints.map((point, index) => index === 0
        ? { ...point, id: 'D', label: 'D' }
        : point),
    });
    expectInvalid({ ...workedProps(), orderedPointIds: ['A', 'A', 'C'] });
    expectInvalid({ ...workedProps(), orderedPointIds: ['A', 'B', 'B'] });
    expectInvalid({ ...workedProps(), orderedPointIds: ['A', 'B', 'D'] });
  });

  it('rejects answer authority and unknown fields outside Worked mode', () => {
    const bannedKeys = [
      'orderedPointIds',
      'correctOptionId',
      'correctAnswer',
      'answer',
      'expectedAnswer',
      'score',
      'isCorrect',
      'gradingMetadata',
      'grading',
      'steps',
      'solutionSteps',
      'solution',
      'finalAnswer',
      'options',
      'order',
      'authority',
      'unknownField',
    ];

    for (const props of [guidedProps(), independentProps()]) {
      for (const key of bannedKeys) {
        expectInvalid({ ...props, [key]: key === 'steps' ? ['answer'] : 'answer' });
      }
    }
    expectInvalid({ ...workedProps(), unknownField: true });
    expectInvalid({
      ...workedProps(),
      correctOptionId: 'A',
    });
  });

  it('requires nonblank text and strict mode-specific fields', () => {
    expectInvalid({ ...independentProps(), prompt: ' ' });
    expectInvalid({ ...independentProps(), xLabel: '' });
    expectInvalid({ ...independentProps(), yLabel: ' ' });
    expectInvalid({ ...workedProps(), steps: ['one'] });
    expectInvalid({ ...workedProps(), finalAnswer: ' ' });
    expectInvalid({
      ...guidedProps(),
      guidedSteps: ['one'],
    });
    expectInvalid({ ...guidedProps(), fieldHelp: '' });
    expectInvalid({ ...independentProps(), presentationMode: 'worked_example' });
  });
});
