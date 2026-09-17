'use client';

import { useId, useState, type ReactNode } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { RealZerosAndMultiplicitiesProps } from '../../schemas';

export type RealZerosAndMultiplicitiesActivityProps = RealZerosAndMultiplicitiesProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

type ItemId = 'a' | 'b';
type AnswerPair = { zero: string; multiplicity: string };
type AnswerRows = Record<ItemId, AnswerPair[]>;

function expectedPresentationMode(
  mode: RealZerosAndMultiplicitiesActivityProps['mode'],
): RealZerosAndMultiplicitiesProps['presentationMode'] | null {
  if (mode === 'teaching') return 'worked_example';
  if (mode === 'guided') return 'guided_practice';
  if (mode === 'practice') return 'independent_practice';
  return null;
}

function emptyRows(): AnswerRows {
  return {
    a: [{ zero: '', multiplicity: '' }, { zero: '', multiplicity: '' }],
    b: [{ zero: '', multiplicity: '' }, { zero: '', multiplicity: '' }],
  };
}

function formatExpression(expression: string): ReactNode {
  return expression.split(/(\^\d+)/).map((part, index) => part.startsWith('^')
    ? <sup key={`${part}-${index}`}>{part.slice(1)}</sup>
    : <span key={`${part}-${index}`}>{part}</span>);
}

function formatPair(pair: { zero: number; multiplicity: number }): string {
  return `x = ${pair.zero} (multiplicity ${pair.multiplicity})`;
}

export function RealZerosAndMultiplicitiesActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: RealZerosAndMultiplicitiesActivityProps) {
  const instanceId = useId();
  const [rows, setRows] = useState<AnswerRows>(emptyRows);
  const expectedMode = expectedPresentationMode(mode);

  if (!expectedMode || props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Real Zeros and Multiplicities'
    : mode === 'guided'
      ? 'Guided Practice: Real Zeros and Multiplicities'
      : 'Independent Practice: Real Zeros and Multiplicities');
  const isWorked = props.presentationMode === 'worked_example';
  const canSubmit = !isWorked && (['a', 'b'] as const).every((id) =>
    rows[id].every((pair) => pair.zero.trim().length > 0 && pair.multiplicity.trim().length > 0));

  const submit = () => {
    if (!canSubmit || isWorked) return;
    const answers = {
      a: rows.a.map((pair) => ({ zero: Number(pair.zero), multiplicity: Number(pair.multiplicity) })),
      b: rows.b.map((pair) => ({ zero: Number(pair.zero), multiplicity: Number(pair.multiplicity) })),
    };
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      answers,
      parts: [
        { partId: 'a', rawAnswer: answers.a },
        { partId: 'b', rawAnswer: answers.b },
      ],
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
            <p aria-label={`${item.functionName}(x) = ${item.expression}`}>
              {item.functionName}(x) = {formatExpression(item.expression)}
            </p>

            {isWorked ? (
              <div>
                {props.correctAnswers[item.id].map((pair) => (
                  <p key={`${item.id}-${pair.zero}-${pair.multiplicity}`}>{formatPair(pair)}</p>
                ))}
              </div>
            ) : (
              <fieldset>
                <legend>{item.functionName}(x) zero and multiplicity</legend>
                <div className="grid gap-3">
                  {rows[item.id].map((pair, index) => (
                    <div key={`${item.id}-${index}`} className="grid gap-3 sm:grid-cols-2">
                      <label htmlFor={`${instanceId}-${item.id}-${index}-zero`} className="flex min-w-0 flex-col gap-1">
                        Zero for {item.functionName} pair {index + 1}
                        <input
                          id={`${instanceId}-${item.id}-${index}-zero`}
                          type="number"
                          step="1"
                          className="min-w-0 w-full rounded-md border border-border bg-background px-2 py-1 text-foreground"
                          value={pair.zero}
                          onChange={(event) => setRows((current) => ({
                            ...current,
                            [item.id]: current[item.id].map((currentPair, currentIndex) => currentIndex === index
                              ? { ...currentPair, zero: event.target.value }
                              : currentPair),
                          }))}
                        />
                      </label>
                      <label htmlFor={`${instanceId}-${item.id}-${index}-multiplicity`} className="flex min-w-0 flex-col gap-1">
                        Multiplicity for {item.functionName} pair {index + 1}
                        <input
                          id={`${instanceId}-${item.id}-${index}-multiplicity`}
                          type="number"
                          step="1"
                          className="min-w-0 w-full rounded-md border border-border bg-background px-2 py-1 text-foreground"
                          value={pair.multiplicity}
                          onChange={(event) => setRows((current) => ({
                            ...current,
                            [item.id]: current[item.id].map((currentPair, currentIndex) => currentIndex === index
                              ? { ...currentPair, multiplicity: event.target.value }
                              : currentPair),
                          }))}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                {rows[item.id].length === 2 ? (
                  <button type="button" onClick={() => setRows((current) => ({
                    ...current,
                    [item.id]: [...current[item.id], { zero: '', multiplicity: '' }],
                  }))}
                    className="mt-2 rounded-md border border-border bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80"
                  >
                    Add third row for {item.functionName}
                  </button>
                ) : (
                  <button type="button" onClick={() => setRows((current) => ({
                    ...current,
                    [item.id]: current[item.id].slice(0, 2),
                  }))}
                    className="mt-2 rounded-md border border-border bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80"
                  >
                    Remove third row for {item.functionName}
                  </button>
                )}
              </fieldset>
            )}
          </article>
        ))}
      </div>

      {props.presentationMode === 'worked_example' ? (
        <>
          <ol className="list-decimal space-y-2 pl-5">
            {props.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
          </ol>
          <p><strong>Answer:</strong> {props.finalAnswer}</p>
        </>
      ) : props.presentationMode === 'guided_practice' ? (
        <>
          <ol className="list-decimal space-y-2 pl-5">
            {props.guidedSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
          </ol>
          <p id={`${instanceId}-field-help`}>{props.fieldHelp}</p>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
          >
            Submit answer
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
        >
          Submit answer
        </button>
      )}
    </section>
  );
}
