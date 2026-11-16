'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { LeastPolynomialDegreeProps } from '../../schemas';

export type LeastPolynomialDegreeActivityProps = LeastPolynomialDegreeProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

function expectedPresentationMode(
  mode: LeastPolynomialDegreeActivityProps['mode'],
): LeastPolynomialDegreeProps['presentationMode'] | null {
  if (mode === 'teaching') return 'worked_example';
  if (mode === 'guided') return 'guided_practice';
  if (mode === 'practice') return 'independent_practice';
  return null;
}

export function LeastPolynomialDegreeActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: LeastPolynomialDegreeActivityProps) {
  const instanceId = useId();
  const [answer, setAnswer] = useState('');
  const expectedMode = expectedPresentationMode(mode);

  if (!expectedMode || props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Least Polynomial Degree'
    : mode === 'guided'
      ? 'Guided Practice: Least Polynomial Degree'
      : 'Independent Practice: Least Polynomial Degree');
  const isWorked = props.presentationMode === 'worked_example';
  const numericAnswer = Number(answer);
  const canSubmit = !isWorked
    && answer.trim().length > 0
    && Number.isSafeInteger(numericAnswer)
    && Number.isFinite(numericAnswer);

  const submit = () => {
    if (!canSubmit || isWorked) return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      answers: { leastDegree: numericAnswer },
      parts: [{ partId: 'leastDegree', rawAnswer: numericAnswer }],
    });
    onSubmit?.(envelope);
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">{title}</h2>
      <p>{props.prompt}</p>
      <p>Given nonreal zero: x = {props.givenNonrealZero}</p>
      <p>Real zeros shown by the graph: At least {props.realZeroCount}</p>

      {props.presentationMode === 'worked_example' ? (
        <>
          <p>Least possible degree: {props.correctAnswer}</p>
          <ol className="list-decimal space-y-2 pl-5">
            {props.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
          </ol>
          <p><strong>Answer:</strong> {props.finalAnswer}</p>
        </>
      ) : (
        <>
          {props.presentationMode === 'guided_practice' ? (
            <ol className="list-decimal space-y-2 pl-5">
              {props.guidedSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
            </ol>
          ) : null}

          <div className="grid gap-2">
            <label htmlFor={`${instanceId}-least-degree`}>Least possible degree</label>
            <input
              id={`${instanceId}-least-degree`}
              name={`${activityId}-${instanceId}-least-degree`}
              type="number"
              step="1"
              value={answer}
              aria-describedby={props.presentationMode === 'guided_practice' ? `${instanceId}-field-help` : undefined}
              onChange={(event) => setAnswer(event.target.value)}
              className="min-w-0 w-full rounded-md border border-border bg-background px-2 py-1 text-foreground"
            />
          </div>

          {props.presentationMode === 'guided_practice' ? (
            <p id={`${instanceId}-field-help`}>{props.fieldHelp}</p>
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
