import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  generateTopic12NegativeRateContextChoice,
  generateTopic12NegativeRateContextChoiceOutput,
} from '@math-platform/math-content/knowledge-space';
import type { NegativeRateContextChoiceProps } from '@math-platform/math-content';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { NegativeRateContextChoiceActivity } from '../components/graph-choice/NegativeRateContextChoiceActivity';

const AUTHORITY_KEYS = [
  'correctOptionId',
  'correctAnswer',
  'expectedAnswer',
  'gradingMetadata',
  'solutionSteps',
  'finalAnswer',
  'relationship',
  'score',
  'isCorrect',
];

type WorkedProps = Extract<NegativeRateContextChoiceProps, { presentationMode: 'worked_example' }>;
type GuidedProps = Extract<NegativeRateContextChoiceProps, { presentationMode: 'guided_practice' }>;
type IndependentProps = Extract<NegativeRateContextChoiceProps, { presentationMode: 'independent_practice' }>;

function propsFor(seed: number, presentationMode: 'worked_example'): WorkedProps;
function propsFor(seed: number, presentationMode: 'guided_practice'): GuidedProps;
function propsFor(seed: number, presentationMode: 'independent_practice'): IndependentProps;
function propsFor(
  seed: number,
  presentationMode: NegativeRateContextChoiceProps['presentationMode'],
): NegativeRateContextChoiceProps {
  const variant = generateTopic12NegativeRateContextChoice(seed);
  const output = generateTopic12NegativeRateContextChoiceOutput(seed);
  const base = {
    prompt: variant.prompt,
    options: [...variant.options],
    presentationMode,
  };

  if (presentationMode === 'worked_example') {
    return {
      ...base,
      correctOptionId: output.expectedAnswer.selectedOptionId,
      steps: output.solutionSteps.map((step) => step.description),
      finalAnswer: 'Option B is correct because x increases while y decreases.',
    } as WorkedProps;
  }
  if (presentationMode === 'guided_practice') {
    return {
      ...base,
      guidedSteps: [
        'Determine how y changes as x increases in each option.',
        'Select the option in which y always decreases as x increases.',
      ],
      fieldHelp: 'A negative rate of change means y decreases as x increases.',
    } as GuidedProps;
  }
  return base as IndependentProps;
}

function expectNoAuthority(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const key of AUTHORITY_KEYS) expect(serialized).not.toContain(`"${key}"`);
}

describe('NegativeRateContextChoiceActivity', () => {
  it('renders the exact source prompt, definitions, and Worked answer', () => {
    const variant = generateTopic12NegativeRateContextChoice(0);
    const props = propsFor(0, 'worked_example');
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(
      <NegativeRateContextChoiceActivity
        activityId="topic-1-2.example-4.worked_example"
        mode="teaching"
        onSubmit={onSubmit}
        onComplete={onComplete}
        {...props}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Worked Example: Model a Negative Rate Context' })).toBeTruthy();
    expect(screen.getByText(variant.prompt)).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Select the variable definitions.' })).toBeTruthy();
    for (const option of variant.options) {
      expect(screen.getByText(`x = ${option.xDefinition}`)).toBeTruthy();
      expect(screen.getByText(`y = ${option.yDefinition}`)).toBeTruthy();
    }
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(radios.filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(1);
    expect(screen.getByRole('radio', { name: /^B/ })).toHaveProperty('checked', true);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toHaveProperty('disabled', true);
    for (const step of props.steps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(props.finalAnswer)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('renders the exact Guided scaffold and submits a raw selected option', () => {
    const props = propsFor(1, 'guided_practice');
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(
      <NegativeRateContextChoiceActivity
        activityId="topic-1-2.example-4.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        onComplete={onComplete}
        {...props}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Guided Practice: Model a Negative Rate Context' })).toBeTruthy();
    for (const option of props.options) {
      expect(screen.getByText(`x = ${option.xDefinition}`)).toBeTruthy();
      expect(screen.getByText(`y = ${option.yDefinition}`)).toBeTruthy();
    }
    for (const step of props.guidedSteps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(props.fieldHelp)).toBeTruthy();
    const fieldset = screen.getByRole('group', { name: 'Select the variable definitions.' });
    expect(fieldset.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(fieldset.getAttribute('aria-describedby')!)?.textContent).toBe(props.fieldHelp);
    expect(screen.getByRole('button', { name: 'Submit answer' })).toHaveProperty('disabled', true);

    fireEvent.click(screen.getByRole('radio', { name: /^A/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: 'topic-1-2.example-4.guided_practice',
      mode: 'guided_practice',
      answers: { selectedOptionId: 'A' },
    });
    expect(payload.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: 'A' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expectNoAuthority(payload);
    expectNoAuthority(props);
  });

  it('keeps Independent free of Guided and Worked content and submits raw data', () => {
    const props = propsFor(2, 'independent_practice');
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(
      <NegativeRateContextChoiceActivity
        activityId="topic-1-2.example-4.independent_practice"
        mode="practice"
        onSubmit={onSubmit}
        onComplete={onComplete}
        {...props}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Independent Practice: Model a Negative Rate Context' })).toBeTruthy();
    for (const option of props.options) {
      expect(screen.getByText(`x = ${option.xDefinition}`)).toBeTruthy();
      expect(screen.getByText(`y = ${option.yDefinition}`)).toBeTruthy();
    }
    expect(screen.queryByText(/Determine how y changes/i)).toBeNull();
    expect(screen.queryByText(/negative rate of change means/i)).toBeNull();
    expect(screen.queryByText(/Option B is correct/i)).toBeNull();
    expect(screen.getByRole('button', { name: 'Submit answer' })).toHaveProperty('disabled', true);

    fireEvent.click(screen.getByRole('radio', { name: /^D/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0];
    expect(payload.answers).toEqual({ selectedOptionId: 'D' });
    expect(payload.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: 'D' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expectNoAuthority(payload);
    expectNoAuthority(props);
  });

  it('blocks mismatched runtime and presentation modes', () => {
    const onSubmit = vi.fn();

    render(
      <NegativeRateContextChoiceActivity
        activityId="topic-1-2.example-4.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        {...propsFor(1, 'independent_practice')}
      />,
    );

    expect(screen.getByRole('alert').textContent).toMatch(/unavailable/i);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('supports a custom title and four distinct accessible radios', () => {
    render(
      <NegativeRateContextChoiceActivity
        activityId="topic-1-2.example-4.guided_practice"
        mode="guided"
        {...propsFor(1, 'guided_practice')}
        title="Choose a negative rate context"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Choose a negative rate context' })).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(new Set(radios.map((radio) => radio.getAttribute('aria-label') ?? radio.parentElement?.textContent)).size).toBe(4);
  });
});
