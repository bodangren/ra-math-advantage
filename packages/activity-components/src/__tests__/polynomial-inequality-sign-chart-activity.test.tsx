import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  generateTopic15PolynomialInequalityOutput,
} from '@math-platform/math-content/knowledge-space';
import {
  polynomialInequalitySignChartSchema,
  type PolynomialInequalitySignChartProps,
} from '@math-platform/math-content';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import {
  PolynomialInequalitySignChartActivity,
  type PolynomialInequalitySignChartActivityProps,
} from '../index';

const SOURCE_FINAL_ANSWER = 'The solution is (-4, -1) ∪ (3, ∞).';
const GUIDED_STEPS = [
  'Find and sort the distinct real roots.',
  'Test one value in each interval and record the sign.',
  'Use the inequality operator to write the interval union.',
] as const;
const GUIDED_HELP = {
  roots: 'Enter the sorted distinct real roots.',
  intervalSigns: 'Enter one sign for each interval from left to right.',
  solution: 'Write the solution as an interval union.',
} as const;
const AUTHORITY_KEYS = [
  'answer',
  'answerkey',
  'correctanswer',
  'correctanswers',
  'expectedanswer',
  'grading',
  'gradingmetadata',
  'mastery',
  'nodeid',
  'score',
  'solutionsteps',
  'steps',
] as const;

type WorkedProps = Extract<PolynomialInequalitySignChartProps, { presentationMode: 'worked_example' }>;
type GuidedProps = Extract<PolynomialInequalitySignChartProps, { presentationMode: 'guided_practice' }>;
type IndependentProps = Extract<PolynomialInequalitySignChartProps, { presentationMode: 'independent_practice' }>;

function propsFor(seed: number, presentationMode: 'worked_example'): WorkedProps;
function propsFor(seed: number, presentationMode: 'guided_practice'): GuidedProps;
function propsFor(seed: number, presentationMode: 'independent_practice'): IndependentProps;
function propsFor(
  seed: number,
  presentationMode: PolynomialInequalitySignChartProps['presentationMode'],
): PolynomialInequalitySignChartProps {
  const output = generateTopic15PolynomialInequalityOutput(seed);
  const publicProps = output.data.rendererProps as Record<string, unknown>;
  if (presentationMode === 'worked_example') {
    return polynomialInequalitySignChartSchema.parse({
      ...publicProps,
      presentationMode,
      correctAnswers: output.expectedAnswer,
      steps: seed === 0
        ? output.solutionSteps.map((step) => step.description)
        : [
          'Identify the critical points from the factored form.',
          'Test one value in each interval and record the sign.',
          'Apply the inequality and endpoint rules.',
          `Write the solution as ${output.expectedAnswer.solution}.`,
        ],
      finalAnswer: seed === 0 ? SOURCE_FINAL_ANSWER : `The solution is ${output.expectedAnswer.solution}.`,
    }) as WorkedProps;
  }
  if (presentationMode === 'guided_practice') {
    return polynomialInequalitySignChartSchema.parse({
      ...publicProps,
      presentationMode,
      guidedSteps: GUIDED_STEPS,
      fieldHelp: GUIDED_HELP,
    }) as GuidedProps;
  }
  return polynomialInequalitySignChartSchema.parse({
    ...publicProps,
    presentationMode,
  }) as IndependentProps;
}

function renderActivity(
  props: PolynomialInequalitySignChartProps,
  overrides: Partial<PolynomialInequalitySignChartActivityProps> = {},
) {
  const activityProps = {
    activityId: 'topic-1-5.example-3.guided_practice',
    mode: 'guided' as const,
    ...props,
    ...overrides,
  } as PolynomialInequalitySignChartActivityProps;
  return render(<PolynomialInequalitySignChartActivity {...activityProps} />);
}

function expectNoAuthorityAttributes(container: HTMLElement): void {
  const attributes = Array.from(container.querySelectorAll('*')).flatMap((element) =>
    element.getAttributeNames().map((name) => name.toLowerCase()));
  for (const key of AUTHORITY_KEYS) expect(attributes).not.toContain(key);
}

function expectPracticeEnvelope(
  payload: unknown,
  activityId: string,
  mode: 'guided_practice' | 'independent_practice',
  answers: { roots: number[]; intervalSigns: string[]; solution: string },
): void {
  expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
  expect(payload).toEqual({
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: expect.any(String),
    answers,
    parts: [
      { partId: 'roots', rawAnswer: answers.roots },
      { partId: 'intervalSigns', rawAnswer: answers.intervalSigns },
      { partId: 'solution', rawAnswer: answers.solution },
    ],
  });
}

describe('PolynomialInequalitySignChartActivity', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it('renders the source Worked example without editable controls', () => {
    const output = generateTopic15PolynomialInequalityOutput(0);
    const rendererProps = output.data.rendererProps as { expression: string; operator: string };
    const { container } = renderActivity(propsFor(0, 'worked_example'), {
      activityId: 'topic-1-5.example-3.worked_example',
      mode: 'teaching',
    });

    expect(screen.getByRole('heading', { name: 'Worked Example: Polynomial Inequality Sign Chart' })).toBeTruthy();
    expect(screen.getByText(output.prompt)).toBeTruthy();
    expect(screen.getByText(`${rendererProps.expression} ${rendererProps.operator} 0`, { exact: true })).toBeTruthy();
    for (const step of output.solutionSteps.map((item) => item.description)) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryByRole('spinbutton')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expectNoAuthorityAttributes(container);
  });

  it('renders Guided support and submits the exact three-part envelope', () => {
    const output = generateTopic15PolynomialInequalityOutput(1);
    const activityId = 'topic-1-5.example-3.guided_practice';
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const { container } = renderActivity(propsFor(1, 'guided_practice'), {
      activityId,
      onSubmit,
      onComplete,
    });

    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    for (const help of Object.values(GUIDED_HELP)) expect(screen.getByText(help)).toBeTruthy();
    const roots = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    const signs = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const solution = screen.getByRole('textbox', { name: 'Solution interval union' }) as HTMLInputElement;
    const submit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    const rootsHelp = screen.getByText(GUIDED_HELP.roots);
    const intervalSignsHelp = screen.getByText(GUIDED_HELP.intervalSigns);
    const solutionHelp = screen.getByText(GUIDED_HELP.solution);

    expect(roots).toHaveLength(2);
    expect(signs).toHaveLength(3);
    for (const root of roots) {
      const descriptionId = root.getAttribute('aria-describedby');
      expect(descriptionId).toBeTruthy();
      expect(document.getElementById(descriptionId ?? '')).toBe(rootsHelp);
    }
    for (const sign of signs) {
      const descriptionId = sign.getAttribute('aria-describedby');
      expect(descriptionId).toBeTruthy();
      expect(document.getElementById(descriptionId ?? '')).toBe(intervalSignsHelp);
    }
    const solutionDescriptionId = solution.getAttribute('aria-describedby');
    expect(solutionDescriptionId).toBeTruthy();
    expect(document.getElementById(solutionDescriptionId ?? '')).toBe(solutionHelp);
    expect(signs.every((select) => Array.from(select.options).map((option) => option.value).join('|') === '|+|-')).toBe(true);
    expect(submit.disabled).toBe(true);
    fireEvent.change(roots[0], { target: { value: '5' } });
    fireEvent.change(roots[1], { target: { value: '-2' } });
    expect(screen.getByLabelText('Sign for (-∞, -2)')).toBeTruthy();
    expect(screen.getByLabelText('Sign for (-2, 5)')).toBeTruthy();
    expect(screen.getByLabelText('Sign for (5, ∞)')).toBeTruthy();
    expect(submit.disabled).toBe(true);
    fireEvent.change(signs[0], { target: { value: '-' } });
    fireEvent.change(signs[1], { target: { value: '-' } });
    fireEvent.change(signs[2], { target: { value: '+' } });
    expect(submit.disabled).toBe(true);
    fireEvent.change(solution, { target: { value: '  (-∞, 5]  ' } });
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    expectPracticeEnvelope(onSubmit.mock.calls[0]?.[0], activityId, 'guided_practice', {
      roots: [5, -2],
      intervalSigns: ['-', '-', '+'],
      solution: '  (-∞, 5]  ',
    });
    expectNoAuthorityAttributes(container);
    expect(container.textContent ?? '').not.toContain('correctAnswer');
    expect(container.textContent ?? '').not.toContain('expectedAnswer');
    expect(output.expectedAnswer.solution).toBe('(-∞, 5]');
  });

  it('renders Independent seed 2 without guidance or answer authority', () => {
    const output = generateTopic15PolynomialInequalityOutput(2);
    const activityId = 'topic-1-5.example-3.independent_practice';
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const { container } = renderActivity(propsFor(2, 'independent_practice'), {
      activityId,
      mode: 'practice',
      onSubmit,
      onComplete,
    });

    expect(screen.getByText(output.prompt)).toBeTruthy();
    expect(screen.queryByText(GUIDED_STEPS[0])).toBeNull();
    expect(screen.queryByText(GUIDED_HELP.roots)).toBeNull();
    expect(screen.queryByText('Least possible degree')).toBeNull();
    expectNoAuthorityAttributes(container);

    const roots = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    const signs = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const solution = screen.getByRole('textbox', { name: 'Solution interval union' });
    fireEvent.change(roots[0], { target: { value: '-3' } });
    fireEvent.change(roots[1], { target: { value: '1' } });
    fireEvent.change(roots[2], { target: { value: '2' } });
    for (const [index, value] of ['-', '+', '-', '+'].entries()) {
      fireEvent.change(signs[index], { target: { value } });
    }
    fireEvent.change(solution, { target: { value: '(-∞, -3) ∪ (1, 2)' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    expectPracticeEnvelope(onSubmit.mock.calls[0]?.[0], activityId, 'independent_practice', {
      roots: [-3, 1, 2],
      intervalSigns: ['-', '+', '-', '+'],
      solution: '(-∞, -3) ∪ (1, 2)',
    });
  });

  it('uses unique control IDs across two practice instances', () => {
    render(
      <>
        <PolynomialInequalitySignChartActivity
          {...propsFor(1, 'independent_practice')}
          activityId="same-activity"
          mode="practice"
        />
        <PolynomialInequalitySignChartActivity
          {...propsFor(2, 'independent_practice')}
          activityId="same-activity"
          mode="practice"
        />
      </>,
    );

    const controls = Array.from(document.querySelectorAll('input, select'));
    const ids = controls.map((control) => control.id);
    expect(ids.every((id) => id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('fails closed when runtime and presentation modes do not match', () => {
    const cases: Array<{
      props: PolynomialInequalitySignChartProps;
      mode: 'teaching' | 'guided' | 'practice';
    }> = [
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
