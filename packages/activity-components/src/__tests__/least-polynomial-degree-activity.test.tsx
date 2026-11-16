import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  generateTopic15LeastPolynomialDegreeOutput,
} from '@math-platform/math-content/knowledge-space';
import {
  leastPolynomialDegreeSchema,
  type LeastPolynomialDegreeProps,
} from '@math-platform/math-content';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import {
  LeastPolynomialDegreeActivity,
  type LeastPolynomialDegreeActivityProps,
} from '../index';

const GUIDED_STEPS = [
  'Identify the conjugate zero.',
  'Count the nonreal and real zeros.',
] as const;
const GUIDED_HELP = 'Enter the least possible degree.';
const SOURCE_FINAL_ANSWER = 'The least possible degree is 5.';
const AUTHORITY_KEYS = [
  'answer',
  'answerKey',
  'correctAnswer',
  'expectedAnswer',
  'grading',
  'gradingMetadata',
  'isCorrect',
  'leastDegree',
  'score',
  'solution',
  'solutionSteps',
  'steps',
];

type WorkedProps = Extract<LeastPolynomialDegreeProps, { presentationMode: 'worked_example' }>;
type GuidedProps = Extract<LeastPolynomialDegreeProps, { presentationMode: 'guided_practice' }>;
type IndependentProps = Extract<LeastPolynomialDegreeProps, { presentationMode: 'independent_practice' }>;

function propsFor(seed: number, presentationMode: 'worked_example'): WorkedProps;
function propsFor(seed: number, presentationMode: 'guided_practice'): GuidedProps;
function propsFor(seed: number, presentationMode: 'independent_practice'): IndependentProps;
function propsFor(
  seed: number,
  presentationMode: LeastPolynomialDegreeProps['presentationMode'],
): LeastPolynomialDegreeProps {
  const output = generateTopic15LeastPolynomialDegreeOutput(seed);
  const publicProps = output.data.rendererProps as Record<string, unknown>;
  if (presentationMode === 'worked_example') {
    return leastPolynomialDegreeSchema.parse({
      ...publicProps,
      presentationMode,
      correctAnswer: output.expectedAnswer.leastDegree,
      steps: output.solutionSteps.map((step) => step.description),
      finalAnswer: SOURCE_FINAL_ANSWER,
    }) as WorkedProps;
  }
  if (presentationMode === 'guided_practice') {
    return leastPolynomialDegreeSchema.parse({
      ...publicProps,
      presentationMode,
      guidedSteps: GUIDED_STEPS,
      fieldHelp: GUIDED_HELP,
    }) as GuidedProps;
  }
  return leastPolynomialDegreeSchema.parse({
    ...publicProps,
    presentationMode,
  }) as IndependentProps;
}

function renderActivity(
  props: LeastPolynomialDegreeProps,
  overrides: Partial<LeastPolynomialDegreeActivityProps> = {},
) {
  const activityProps = {
    activityId: 'topic-1-5.example-2.guided_practice',
    mode: 'guided' as const,
    ...props,
    ...overrides,
  } as LeastPolynomialDegreeActivityProps;
  return render(<LeastPolynomialDegreeActivity {...activityProps} />);
}

function expectNoAuthorityAttributes(container: HTMLElement): void {
  const attributes = Array.from(container.querySelectorAll('*')).flatMap((element) => element.getAttributeNames());
  for (const key of AUTHORITY_KEYS) expect(attributes).not.toContain(key);
}

function expectPracticeEnvelope(payload: unknown, activityId: string, mode: 'guided_practice' | 'independent_practice', leastDegree: number): void {
  expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
  expect(payload).toEqual({
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: expect.any(String),
    answers: { leastDegree },
    parts: [{ partId: 'leastDegree', rawAnswer: leastDegree }],
  });
}

describe('LeastPolynomialDegreeActivity', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it('renders the exact source Worked content without editable controls', () => {
    const output = generateTopic15LeastPolynomialDegreeOutput(0);
    const props = propsFor(0, 'worked_example');
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(props, {
      activityId: 'topic-1-5.example-2.worked_example',
      mode: 'teaching',
      onSubmit,
      onComplete,
    });

    expect(screen.getByRole('heading', { name: 'Worked Example: Least Polynomial Degree' })).toBeTruthy();
    expect(screen.getByText('The zero x = i√3 is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?')).toBeTruthy();
    expect(screen.getByText('Given nonreal zero: x = i√3')).toBeTruthy();
    expect(screen.getByText('Real zeros shown by the graph: At least 3')).toBeTruthy();
    expect(screen.getByText('Least possible degree: 5')).toBeTruthy();
    for (const step of output.solutionSteps.map((item) => item.description)) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText('Answer:')).toBeTruthy();
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryByRole('spinbutton')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('submits a finite wrong Guided integer in the exact practice envelope', () => {
    const activityId = 'topic-1-5.example-2.guided_practice';
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(propsFor(1, 'guided_practice'), { activityId, onSubmit, onComplete });

    expect(screen.getByRole('heading', { name: 'Guided Practice: Least Polynomial Degree' })).toBeTruthy();
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    const input = screen.getByRole('spinbutton', { name: 'Least possible degree' }) as HTMLInputElement;
    expect(screen.getByText(GUIDED_HELP)).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(input, { target: { value: '4.5' } });
    expect((screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(input, { target: { value: '4' } });
    expect((screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    expectPracticeEnvelope(onSubmit.mock.calls[0]?.[0], activityId, 'guided_practice', 4);
    expectNoAuthorityAttributes(document.body);
  });

  it('submits the exact Independent envelope without Guided content', () => {
    const activityId = 'topic-1-5.example-2.independent_practice';
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(propsFor(2, 'independent_practice'), { activityId, mode: 'practice', onSubmit, onComplete });

    expect(screen.getByRole('heading', { name: 'Independent Practice: Least Polynomial Degree' })).toBeTruthy();
    expect(screen.queryByText(GUIDED_HELP)).toBeNull();
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    const input = screen.getByRole('spinbutton', { name: 'Least possible degree' });
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    expectPracticeEnvelope(onSubmit.mock.calls[0]?.[0], activityId, 'independent_practice', 7);
    expectNoAuthorityAttributes(document.body);
  });

  it('uses unique input IDs across two instances and honors a custom title', () => {
    render(
      <>
        <LeastPolynomialDegreeActivity
          {...propsFor(1, 'independent_practice')}
          activityId="same-activity"
          mode="practice"
          title="Custom degree task"
        />
        <LeastPolynomialDegreeActivity
          {...propsFor(2, 'independent_practice')}
          activityId="same-activity"
          mode="practice"
        />
      </>,
    );

    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    expect(inputs).toHaveLength(2);
    expect(new Set(inputs.map((input) => input.id)).size).toBe(2);
    expect(inputs.every((input) => input.id.length > 0)).toBe(true);
    expect(screen.getByRole('heading', { name: 'Custom degree task' })).toBeTruthy();
    expect(screen.getAllByText('Least possible degree')).toHaveLength(2);
  });

  it('fails closed when runtime and presentation modes do not match', () => {
    const cases: Array<{ props: LeastPolynomialDegreeProps; mode: 'teaching' | 'guided' | 'practice' }> = [
      { props: propsFor(0, 'independent_practice'), mode: 'teaching' },
      { props: propsFor(1, 'worked_example'), mode: 'guided' },
      { props: propsFor(2, 'guided_practice'), mode: 'practice' },
    ];

    for (const { props, mode } of cases) {
      const { unmount } = renderActivity(props, { mode });
      expect(screen.getByRole('alert').textContent).toBe('This activity is unavailable for this presentation mode.');
      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.queryByRole('button')).toBeNull();
      unmount();
    }
  });
});
