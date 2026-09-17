'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { TableAverageRateChoiceProps } from '../../schemas';

export type TableAverageRateChoiceActivityProps = TableAverageRateChoiceProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

function expectedPresentationMode(mode: TableAverageRateChoiceActivityProps['mode']) {
  if (mode === 'teaching') return 'worked_example' as const;
  if (mode === 'guided') return 'guided_practice' as const;
  return 'independent_practice' as const;
}

export function TableAverageRateChoiceActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: TableAverageRateChoiceActivityProps) {
  const instanceId = useId();
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const expectedMode = expectedPresentationMode(mode);
  const isModeMatch = props.presentationMode === expectedMode;
  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Compare Average Rates of Change'
    : mode === 'guided'
      ? 'Guided Practice: Compare Average Rates of Change'
      : 'Independent Practice: Compare Average Rates of Change');

  const submit = () => {
    if (!selectedOptionId || !isModeMatch || mode === 'teaching') return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      answers: { selectedOptionId },
    });
    onSubmit?.(envelope);
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">{title}</h2>
      <p>{props.prompt}</p>

      <table aria-label="Life expectancy table" className="border-collapse">
        <caption className="sr-only">Table of {props.inputLabel} and {props.outputLabel}</caption>
        <thead>
          <tr>
            <th scope="col" className="border px-3 py-2 text-left">{props.inputLabel}</th>
            <th scope="col" className="border px-3 py-2 text-left">{props.outputLabel}</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.input}>
              <td className="border px-3 py-2">{row.input}</td>
              <td className="border px-3 py-2">{row.output}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!isModeMatch ? (
        <p role="alert">This activity is unavailable for this presentation mode.</p>
      ) : (
        <>
          <fieldset
            aria-label="Table interval choices"
            aria-describedby={props.presentationMode === 'guided_practice' ? `${instanceId}-field-help` : undefined}
          >
            <legend>Select an interval.</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {props.options.map((option) => {
                const isWorked = props.presentationMode === 'worked_example';
                const checked = isWorked ? option.id === props.correctOptionId : option.id === selectedOptionId;
                return (
                  <label key={option.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`${activityId}-interval-choice`}
                      value={option.id}
                      checked={checked}
                      disabled={isWorked}
                      onChange={() => setSelectedOptionId(option.id)}
                    />
                    <span>{option.label}</span>
                    <span>{option.startInput} to {option.endInput}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {props.presentationMode === 'worked_example' ? (
            <>
              <ol className="list-decimal space-y-2 pl-5">
                {props.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
              <p><strong>Answer:</strong> {props.finalAnswer}</p>
            </>
          ) : props.presentationMode === 'guided_practice' ? (
            <>
              <ol className="list-decimal space-y-2 pl-5">
                {props.guidedSteps.map((step) => <li key={step}>{step}</li>)}
              </ol>
              <p id={`${instanceId}-field-help`}>{props.fieldHelp}</p>
              <button type="button" onClick={submit} disabled={!selectedOptionId}>Submit answer</button>
            </>
          ) : (
            <button type="button" onClick={submit} disabled={!selectedOptionId}>Submit answer</button>
          )}
        </>
      )}
    </section>
  );
}
