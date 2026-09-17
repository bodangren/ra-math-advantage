import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { PolynomialEquationEndBehaviorActivity } from '../components/table/PolynomialEquationEndBehaviorActivity';

const SOURCE_PROMPT = 'Determine the end behavior for the following polynomials. Limit notation is not necessary.';
const SOURCE_ITEMS = [
  { id: 'a', functionName: 'f', expression: '4x^5' },
  { id: 'b', functionName: 'g', expression: '(1/2)x^4' },
  { id: 'c', functionName: 'y', expression: '-2(x + 3)^6' },
  { id: 'd', functionName: 'h', expression: '3 - x^5' },
  { id: 'e', functionName: 'k', expression: '8x^2 + 4 - x^5' },
  { id: 'f', functionName: 'm', expression: '2x(x - 1)(6 - x)' },
] as const;
const SOURCE_ANSWERS = {
  a_leftEnd: 'down',
  a_rightEnd: 'up',
  b_leftEnd: 'up',
  b_rightEnd: 'up',
  c_leftEnd: 'down',
  c_rightEnd: 'down',
  d_leftEnd: 'up',
  d_rightEnd: 'down',
  e_leftEnd: 'up',
  e_rightEnd: 'down',
  f_leftEnd: 'up',
  f_rightEnd: 'down',
} as const;
const SOURCE_PARTS = Object.entries(SOURCE_ANSWERS).map(([partId, rawAnswer]) => ({ partId, rawAnswer }));
const SOURCE_STEPS = [
  'a) The leading term is 4x^5. The degree is odd and the leading coefficient is positive, so the left end is down and the right end is up.',
  'b) The leading term is (1/2)x^4. The degree is even and the leading coefficient is positive, so both ends are up.',
  'c) The leading term is -2x^6. The degree is even and the leading coefficient is negative, so both ends are down.',
  'd) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.',
  'e) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.',
  'f) The leading term is -2x^3. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.',
] as const;
const WORKED_PROPS = {
  prompt: SOURCE_PROMPT,
  items: SOURCE_ITEMS,
  presentationMode: 'worked_example',
  correctAnswers: SOURCE_ANSWERS,
  steps: SOURCE_STEPS,
  finalAnswer: 'The six polynomial end behaviors are shown above.',
} as const;
const GUIDED_STEPS = [
  'Identify the leading term for each polynomial.',
  'Use degree parity and the leading coefficient.',
  'Record whether each left and right end goes up or down.',
] as const;
const GUIDED_PROPS = {
  prompt: SOURCE_PROMPT,
  items: SOURCE_ITEMS,
  presentationMode: 'guided_practice',
  guidedSteps: GUIDED_STEPS,
  fieldHelp: 'Choose Up or Down for the left and right end of each polynomial.',
} as const;
const INDEPENDENT_PROPS = {
  prompt: SOURCE_PROMPT,
  items: SOURCE_ITEMS,
  presentationMode: 'independent_practice',
} as const;

describe('PolynomialEquationEndBehaviorActivity', () => {
  it('renders the Worked source with all equations, answers, steps, and no submit control', () => {
    const { unmount } = render(
      <PolynomialEquationEndBehaviorActivity
        {...WORKED_PROPS}
        activityId="topic-1-6.example-3.worked_example"
        mode="teaching"
      />,
    );

    expect(screen.getByText(SOURCE_PROMPT)).toBeTruthy();
    for (const item of SOURCE_ITEMS) expect(screen.getByText(item.expression)).toBeTruthy();
    for (const [partId, answer] of Object.entries(SOURCE_ANSWERS)) {
      const [itemId, side] = partId.split('_');
      const end = side === 'leftEnd' ? 'Left' : 'Right';
      const direction = answer === 'up' ? 'Up' : 'Down';
      expect(screen.getByText(`${itemId} ${end} end: ${direction}`)).toBeTruthy();
    }
    for (const step of SOURCE_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(WORKED_PROPS.finalAnswer)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    unmount();
  });

  it('renders Guided controls and submits the exact twelve-part envelope', () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const activityId = 'topic-1-6.example-3.guided_practice';
    const { unmount } = render(
      <PolynomialEquationEndBehaviorActivity
        {...GUIDED_PROPS}
        activityId={activityId}
        mode="guided"
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(GUIDED_PROPS.fieldHelp)).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(24);
    expect(screen.getAllByRole('radio').every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
    for (const partId of Object.keys(SOURCE_ANSWERS)) {
      const [itemId, side] = partId.split('_');
      const end = side === 'leftEnd' ? 'Left' : 'Right';
      expect(screen.getByRole('radio', { name: `${itemId} ${end} end Up` })).toBeTruthy();
      expect(screen.getByRole('radio', { name: `${itemId} ${end} end Down` })).toBeTruthy();
    }
    const submit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    const entries = Object.entries(SOURCE_ANSWERS);
    const [firstPartId, firstAnswer] = entries[0]!;
    const [firstItemId, firstSide] = firstPartId.split('_');
    fireEvent.click(screen.getByRole('radio', {
      name: `${firstItemId} ${firstSide === 'leftEnd' ? 'Left' : 'Right'} end ${firstAnswer === 'up' ? 'Up' : 'Down'}`,
    }));
    expect(submit.disabled).toBe(true);
    for (const [partId, answer] of entries.slice(1)) {
      const [itemId, side] = partId.split('_');
      fireEvent.click(screen.getByRole('radio', {
        name: `${itemId} ${side === 'leftEnd' ? 'Left' : 'Right'} end ${answer === 'up' ? 'Up' : 'Down'}`,
      }));
    }
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toEqual({
      contractVersion: 'practice.v1',
      activityId,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: SOURCE_ANSWERS,
      parts: SOURCE_PARTS,
    });
    unmount();
  });

  it('renders Independent controls, submits its mode, and hides Guided help', () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const activityId = 'topic-1-6.example-3.independent_practice';
    const { unmount } = render(
      <PolynomialEquationEndBehaviorActivity
        {...INDEPENDENT_PROPS}
        activityId={activityId}
        mode="practice"
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    expect(screen.getAllByRole('radio')).toHaveLength(24);
    expect(screen.getAllByRole('radio').every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
    expect(screen.queryByText(GUIDED_STEPS[0])).toBeNull();
    expect(screen.queryByText(GUIDED_PROPS.fieldHelp)).toBeNull();
    for (const partId of Object.keys(SOURCE_ANSWERS)) {
      const [itemId, side] = partId.split('_');
      const end = side === 'leftEnd' ? 'Left' : 'Right';
      expect(screen.getByRole('radio', { name: `${itemId} ${end} end Up` })).toBeTruthy();
      expect(screen.getByRole('radio', { name: `${itemId} ${end} end Down` })).toBeTruthy();
    }
    for (const [partId, answer] of Object.entries(SOURCE_ANSWERS)) {
      const [itemId, side] = partId.split('_');
      fireEvent.click(screen.getByRole('radio', {
        name: `${itemId} ${side === 'leftEnd' ? 'Left' : 'Right'} end ${answer === 'up' ? 'Up' : 'Down'}`,
      }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toEqual({
      contractVersion: 'practice.v1',
      activityId,
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: SOURCE_ANSWERS,
      parts: SOURCE_PARTS,
    });
    unmount();
  });

  it('fails closed for every presentation and runtime mode mismatch', () => {
    const cases = [
      { props: WORKED_PROPS, mode: 'guided' as const },
      { props: GUIDED_PROPS, mode: 'practice' as const },
      { props: INDEPENDENT_PROPS, mode: 'teaching' as const },
    ];
    for (const { props, mode } of cases) {
      const { unmount } = render(
        <PolynomialEquationEndBehaviorActivity
          {...props}
          activityId="topic-1-6.example-3.mismatch"
          mode={mode}
        />,
      );
      expect(screen.getByRole('alert').textContent).toBe('This activity is unavailable for this presentation mode.');
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
      expect(screen.queryByRole('button')).toBeNull();
      unmount();
    }
  });
});
