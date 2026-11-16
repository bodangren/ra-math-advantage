'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { PolynomialEndBehaviorProps } from '../../schemas';

export type PolynomialEndBehaviorActivityProps = PolynomialEndBehaviorProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

type End = 'positive_infinity' | 'negative_infinity';

function expectedPresentationMode(
  mode: PolynomialEndBehaviorActivityProps['mode'],
): PolynomialEndBehaviorProps['presentationMode'] | null {
  if (mode === 'teaching') return 'worked_example';
  if (mode === 'guided') return 'guided_practice';
  if (mode === 'practice') return 'independent_practice';
  return null;
}

function formatEnd(end: End): string {
  return end === 'positive_infinity' ? 'Positive infinity' : 'Negative infinity';
}

function formatLeadingTerm(coefficient: number, exponent: number): string {
  const coefficientText = coefficient === 1 ? '' : coefficient === -1 ? '-' : String(coefficient);
  return `${coefficientText}x^${exponent}`;
}

export function PolynomialEndBehaviorActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: PolynomialEndBehaviorActivityProps) {
  const instanceId = useId();
  const [leftEnd, setLeftEnd] = useState<End | ''>('');
  const [rightEnd, setRightEnd] = useState<End | ''>('');
  const expectedMode = expectedPresentationMode(mode);

  if (!expectedMode || props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Polynomial End Behavior'
    : mode === 'guided'
      ? 'Guided Practice: Polynomial End Behavior'
      : 'Independent Practice: Polynomial End Behavior');
  const isWorked = props.presentationMode === 'worked_example';
  const canSubmit = !isWorked && leftEnd !== '' && rightEnd !== '';
  const leadingTermText = formatLeadingTerm(props.leadingTerm.coefficient, props.leadingTerm.exponent);
  const submit = () => {
    if (!canSubmit) return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      answers: { leftEnd, rightEnd },
      parts: [
        { partId: 'leftEnd', rawAnswer: leftEnd },
        { partId: 'rightEnd', rawAnswer: rightEnd },
      ],
    });
    onSubmit?.(envelope);
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">{title}</h2>
      <p>{props.prompt}</p>
      <p aria-label={`Leading term ${leadingTermText}`}>
        f(x) = {props.leadingTerm.coefficient === 1 || props.leadingTerm.coefficient === -1
          ? props.leadingTerm.coefficient === -1 ? '-' : ''
          : props.leadingTerm.coefficient}
        x<sup>{props.leadingTerm.exponent}</sup>
      </p>

      {isWorked ? (
        <>
          <dl>
            <div><dt>Left end</dt><dd>{formatEnd(props.correctAnswers.leftEnd)}</dd></div>
            <div><dt>Right end</dt><dd>{formatEnd(props.correctAnswers.rightEnd)}</dd></div>
          </dl>
          <ol className="list-decimal space-y-2 pl-5">
            {props.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
          </ol>
          <p><strong>Answer:</strong> {props.finalAnswer}</p>
        </>
      ) : (
        <>
          <fieldset>
            <legend>As x approaches negative infinity, what does f(x) approach?</legend>
            <label className="flex items-center gap-2" htmlFor={`${instanceId}-left-positive`}>
              <input
                id={`${instanceId}-left-positive`}
                type="radio"
                name={`${instanceId}-left-end`}
                value="positive_infinity"
                checked={leftEnd === 'positive_infinity'}
                onChange={() => setLeftEnd('positive_infinity')}
              />
              Positive infinity
            </label>
            <label className="flex items-center gap-2" htmlFor={`${instanceId}-left-negative`}>
              <input
                id={`${instanceId}-left-negative`}
                type="radio"
                name={`${instanceId}-left-end`}
                value="negative_infinity"
                checked={leftEnd === 'negative_infinity'}
                onChange={() => setLeftEnd('negative_infinity')}
              />
              Negative infinity
            </label>
          </fieldset>
          <fieldset>
            <legend>As x approaches positive infinity, what does f(x) approach?</legend>
            <label className="flex items-center gap-2" htmlFor={`${instanceId}-right-positive`}>
              <input
                id={`${instanceId}-right-positive`}
                type="radio"
                name={`${instanceId}-right-end`}
                value="positive_infinity"
                checked={rightEnd === 'positive_infinity'}
                onChange={() => setRightEnd('positive_infinity')}
              />
              Positive infinity
            </label>
            <label className="flex items-center gap-2" htmlFor={`${instanceId}-right-negative`}>
              <input
                id={`${instanceId}-right-negative`}
                type="radio"
                name={`${instanceId}-right-end`}
                value="negative_infinity"
                checked={rightEnd === 'negative_infinity'}
                onChange={() => setRightEnd('negative_infinity')}
              />
              Negative infinity
            </label>
          </fieldset>

          {props.presentationMode === 'guided_practice' ? (
            <>
              <ol className="list-decimal space-y-2 pl-5">
                {props.guidedSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
              </ol>
              <p>{props.fieldHelp}</p>
            </>
          ) : null}
          <button type="button" onClick={submit} disabled={!canSubmit}>Submit answer</button>
        </>
      )}
    </section>
  );
}
