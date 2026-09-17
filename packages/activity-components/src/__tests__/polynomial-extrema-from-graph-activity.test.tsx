import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  generateTopic14PolynomialExtremaFromGraphOutput,
} from '@math-platform/math-content/knowledge-space';
import {
  polynomialExtremaFromGraphSchema,
  type PolynomialExtremaFromGraphProps,
} from '@math-platform/math-content';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import {
  PolynomialExtremaFromGraphActivity,
  type PolynomialExtremaFromGraphActivityProps,
} from '../index';

const GUIDED_STEPS = [
  'Check the input widths.',
  'Read the graph direction.',
  'Classify the extrema.',
] as const;
const GUIDED_HELP = 'Use the graph direction to identify each turning point.';
const SOURCE_FINAL_ANSWER = 'The absolute minimum is at x = 1.';
const AUTHORITY_KEYS = [
  'answer',
  'answerKey',
  'correctAnswer',
  'correctAnswers',
  'expectedAnswer',
  'grading',
  'gradingMetadata',
  'score',
  'maxScore',
  'isCorrect',
  'normalizedAnswer',
  'authority',
  'solution',
  'solutionSteps',
  'steps',
  'finalAnswer',
];

type PublicProps = Extract<PolynomialExtremaFromGraphProps, { presentationMode: 'independent_practice' }>;

function publicProps(seed: number): PublicProps {
  return polynomialExtremaFromGraphSchema.parse(
    generateTopic14PolynomialExtremaFromGraphOutput(seed).data.rendererProps,
  ) as PublicProps;
}

function workedProps(): Extract<PolynomialExtremaFromGraphProps, { presentationMode: 'worked_example' }> {
  const output = generateTopic14PolynomialExtremaFromGraphOutput(0);
  return polynomialExtremaFromGraphSchema.parse({
    ...publicProps(0),
    presentationMode: 'worked_example',
    correctAnswers: output.expectedAnswer,
    steps: output.solutionSteps.map((step) => step.description),
    finalAnswer: SOURCE_FINAL_ANSWER,
  }) as Extract<PolynomialExtremaFromGraphProps, { presentationMode: 'worked_example' }>;
}

function guidedProps(): Extract<PolynomialExtremaFromGraphProps, { presentationMode: 'guided_practice' }> {
  return polynomialExtremaFromGraphSchema.parse({
    ...publicProps(1),
    presentationMode: 'guided_practice',
    guidedSteps: GUIDED_STEPS,
    fieldHelp: GUIDED_HELP,
  }) as Extract<PolynomialExtremaFromGraphProps, { presentationMode: 'guided_practice' }>;
}

function renderActivity(
  props: PolynomialExtremaFromGraphProps,
  overrides: Partial<PolynomialExtremaFromGraphActivityProps> = {},
) {
  const activityProps = {
    ...props,
    activityId: 'topic-1-4.example-2.guided_practice',
    mode: 'guided' as const,
    ...overrides,
  } as PolynomialExtremaFromGraphActivityProps;
  return render(
    <PolynomialExtremaFromGraphActivity {...activityProps} />,
  );
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    expect(AUTHORITY_KEYS).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe('PolynomialExtremaFromGraphActivity', () => {
  it('renders the exact source graph, accessible data, Worked answers, and steps', () => {
    const output = generateTopic14PolynomialExtremaFromGraphOutput(0);
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(workedProps(), {
      activityId: 'topic-1-4.example-2.worked_example',
      mode: 'teaching',
      onSubmit,
      onComplete,
    });

    expect(screen.getByRole('heading', { name: 'Worked Example: Identify Extrema from a Graph' })).toBeTruthy();
    expect(screen.getByText('Use the graph of polynomial g to identify its extrema.')).toBeTruthy();
    expect(screen.getByRole('img', { name: /Graph of polynomial g.*domain -1 to 5/ })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Graph data for polynomial g' }).textContent).toContain('1');
    const table = screen.getByRole('table', { name: 'Graph data for polynomial g' });
    const tableRows = screen.getAllByRole('row', { hidden: true }).slice(1);
    const sourceProps = publicProps(0);
    sourceProps.points.forEach((point, index) => {
      expect(tableRows[index]?.textContent).toBe(`${point.x}${point.y}`);
    });
    const tableText = table.textContent ?? '';
    for (const point of sourceProps.points) {
      expect(tableText).toContain(String(point.x));
      expect(tableText).toContain(String(point.y));
    }
    const curve = screen.getByTestId('polynomial-extrema-curve').getAttribute('points') ?? '';
    const plottedPoints = curve.trim().split(' ');
    expect(plottedPoints).toHaveLength(sourceProps.points.length);
    expect(plottedPoints.map((point) => Number(point.split(',')[0]))).toEqual(
      [...plottedPoints.map((point) => Number(point.split(',')[0]))].sort((left, right) => left - right),
    );
    expect(screen.getByText('Relative minimum x-value')).toBeTruthy();
    expect(screen.getAllByText('1', { selector: 'dd' })).toHaveLength(2);
    expect(screen.getByText('4', { selector: 'dd' })).toBeTruthy();
    for (const step of output.solutionSteps.map((item) => item.description)) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('submits the exact raw Guided practice envelope after all fields are filled', () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const props = guidedProps();
    renderActivity(props, { onSubmit, onComplete });
    expect(screen.getByRole('heading', { name: 'Guided Practice: Identify Extrema from a Graph' })).toBeTruthy();
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(GUIDED_HELP)).toBeTruthy();
    const submit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    const rawAnswers = ['1', '4', 'not-sure'];
    screen.getAllByRole('textbox').forEach((input, index) => fireEvent.change(input, { target: { value: rawAnswers[index] } }));
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      activityId: 'topic-1-4.example-2.guided_practice',
      mode: 'guided_practice',
      answers: {
        relative_minimum_x: '1',
        relative_maximum_x: '4',
        absolute_minimum_x: 'not-sure',
      },
      parts: [
        { partId: 'relative_minimum_x', rawAnswer: '1' },
        { partId: 'relative_maximum_x', rawAnswer: '4' },
        { partId: 'absolute_minimum_x', rawAnswer: 'not-sure' },
      ],
    });
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it('submits raw Independent values without Guided or Worked content', () => {
    const onSubmit = vi.fn();
    const props = publicProps(2);
    renderActivity(props, {
      activityId: 'topic-1-4.example-2.independent_practice',
      mode: 'practice',
      onSubmit,
    });
    expect(screen.getByRole('heading', { name: 'Independent Practice: Identify Extrema from a Graph' })).toBeTruthy();
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    expect(screen.queryByText(GUIDED_HELP)).toBeNull();
    expect(screen.queryByText(SOURCE_FINAL_ANSWER)).toBeNull();
    screen.getAllByRole('textbox').forEach((input, index) => fireEvent.change(input, { target: { value: [' 1 ', 'bad', '1.0'][index] } }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      activityId: 'topic-1-4.example-2.independent_practice',
      mode: 'independent_practice',
      answers: { relative_minimum_x: ' 1 ', relative_maximum_x: 'bad', absolute_minimum_x: '1.0' },
    });
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it('keeps instance IDs unique, accepts a custom title, and fails closed on mode mismatch', () => {
    const { unmount } = renderActivity({ ...publicProps(1), title: 'Custom extrema task' }, { mode: 'practice' });
    expect(screen.getByRole('heading', { name: 'Custom extrema task' })).toBeTruthy();
    const firstIds = screen.getAllByRole('textbox').map((input) => input.id);
    unmount();
    const instances = render(
      <>
        <PolynomialExtremaFromGraphActivity {...publicProps(1)} activityId="same" mode="practice" />
        <PolynomialExtremaFromGraphActivity {...publicProps(1)} activityId="same" mode="practice" />
      </>,
    );
    const ids = screen.getAllByRole('textbox').map((input) => input.id);
    expect(new Set([...firstIds, ...ids]).size).toBe(9);
    expect(screen.getAllByRole('heading', { name: 'Independent Practice: Identify Extrema from a Graph' })).toHaveLength(2);
    instances.unmount();
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(publicProps(0), { mode: 'teaching', onSubmit, onComplete });
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryByRole('button')).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
