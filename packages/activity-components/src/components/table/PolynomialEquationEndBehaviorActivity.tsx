'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { PolynomialEquationEndBehaviorProps } from '../../schemas';

type ReadonlyWorkedProps = Omit<Extract<PolynomialEquationEndBehaviorProps, { presentationMode: 'worked_example' }>, 'items' | 'steps'> & {
  items: readonly Extract<PolynomialEquationEndBehaviorProps, { presentationMode: 'worked_example' }>['items'][number][];
  steps: readonly string[];
};
type ReadonlyGuidedProps = Omit<Extract<PolynomialEquationEndBehaviorProps, { presentationMode: 'guided_practice' }>, 'items' | 'guidedSteps'> & {
  items: readonly Extract<PolynomialEquationEndBehaviorProps, { presentationMode: 'guided_practice' }>['items'][number][];
  guidedSteps: readonly string[];
};
type ReadonlyIndependentProps = Omit<Extract<PolynomialEquationEndBehaviorProps, { presentationMode: 'independent_practice' }>, 'items'> & {
  items: readonly Extract<PolynomialEquationEndBehaviorProps, { presentationMode: 'independent_practice' }>['items'][number][];
};
type ActivitySchemaProps = PolynomialEquationEndBehaviorProps
  | ReadonlyWorkedProps
  | ReadonlyGuidedProps
  | ReadonlyIndependentProps;

export type PolynomialEquationEndBehaviorActivityProps = ActivitySchemaProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

type PartId = `${'a' | 'b' | 'c' | 'd' | 'e' | 'f'}_${'leftEnd' | 'rightEnd'}`;
type Direction = 'up' | 'down';

const PART_IDS: readonly PartId[] = [
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

const EMPTY_ANSWERS: Record<PartId, Direction | ''> = {
  a_leftEnd: '',
  a_rightEnd: '',
  b_leftEnd: '',
  b_rightEnd: '',
  c_leftEnd: '',
  c_rightEnd: '',
  d_leftEnd: '',
  d_rightEnd: '',
  e_leftEnd: '',
  e_rightEnd: '',
  f_leftEnd: '',
  f_rightEnd: '',
};

function expectedPresentationMode(
  mode: PolynomialEquationEndBehaviorActivityProps['mode'],
): PolynomialEquationEndBehaviorProps['presentationMode'] | null {
  if (mode === 'teaching') return 'worked_example';
  if (mode === 'guided') return 'guided_practice';
  if (mode === 'practice') return 'independent_practice';
  return null;
}

export function PolynomialEquationEndBehaviorActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: PolynomialEquationEndBehaviorActivityProps) {
  const instanceId = useId();
  const [answers, setAnswers] = useState<Record<PartId, Direction | ''>>(EMPTY_ANSWERS);
  const expectedMode = expectedPresentationMode(mode);

  if (!expectedMode || props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Polynomial Equation End Behavior'
    : mode === 'guided'
      ? 'Guided Practice: Polynomial Equation End Behavior'
      : 'Independent Practice: Polynomial Equation End Behavior');
  const isWorked = props.presentationMode === 'worked_example';
  const canSubmit = !isWorked && PART_IDS.every((partId) => answers[partId] !== '');

  const submit = () => {
    if (!canSubmit || isWorked) return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      answers,
      parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    });
    onSubmit?.(envelope);
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">{title}</h2>
      <p>{props.prompt}</p>

      <div className="grid gap-4">
        {props.items.map((item) => (
          <article key={item.id} className="space-y-2">
            <h3>{item.id}) {item.functionName}</h3>
            <p>{item.expression}</p>

            {isWorked ? (
              <div>
                <p>{`${item.id} Left end: ${props.correctAnswers[`${item.id}_leftEnd` as keyof typeof props.correctAnswers] === 'up' ? 'Up' : 'Down'}`}</p>
                <p>{`${item.id} Right end: ${props.correctAnswers[`${item.id}_rightEnd` as keyof typeof props.correctAnswers] === 'up' ? 'Up' : 'Down'}`}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {(['leftEnd', 'rightEnd'] as const).map((side) => {
                  const partId = `${item.id}_${side}` as PartId;
                  const groupName = `${activityId}-${instanceId}-${partId}`;
                  return (
                    <fieldset key={partId}>
                      <legend>{`${item.id} ${side === 'leftEnd' ? 'Left' : 'Right'} end`}</legend>
                      <div className="flex gap-4">
                        {(['up', 'down'] as const).map((direction) => (
                          <label key={direction} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={groupName}
                              value={direction}
                              aria-label={`${item.id} ${side === 'leftEnd' ? 'Left' : 'Right'} end ${direction === 'up' ? 'Up' : 'Down'}`}
                              checked={answers[partId] === direction}
                              onChange={() => setAnswers((current) => ({ ...current, [partId]: direction }))}
                            />
                            {direction === 'up' ? 'Up' : 'Down'}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>

      {isWorked ? (
        <>
          <ol className="list-decimal space-y-2 pl-5">
            {props.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
          </ol>
          <p><strong>Answer:</strong> {props.finalAnswer}</p>
        </>
      ) : (
        <>
          {props.presentationMode === 'guided_practice' ? (
            <>
              <ol className="list-decimal space-y-2 pl-5">
                {props.guidedSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
              </ol>
              <p>{props.fieldHelp}</p>
            </>
          ) : null}
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
          >
            Submit answer
          </button>
        </>
      )}
    </section>
  );
}
