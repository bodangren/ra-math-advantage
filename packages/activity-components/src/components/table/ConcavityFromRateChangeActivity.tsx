'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { ConcavityFromRateChangeProps } from '../../schemas';

export type ConcavityFromRateChangeActivityProps = ConcavityFromRateChangeProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

type Classification = 'concave_up' | 'concave_down' | 'neither';

const CLASSIFICATIONS: readonly { value: Classification; label: string }[] = [
  { value: 'concave_up', label: 'Concave up' },
  { value: 'concave_down', label: 'Concave down' },
  { value: 'neither', label: 'Neither' },
];

function expectedPresentationMode(mode: ConcavityFromRateChangeActivityProps['mode']) {
  if (mode === 'teaching') return 'worked_example' as const;
  if (mode === 'guided') return 'guided_practice' as const;
  return 'independent_practice' as const;
}

function formatValue(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

export function ConcavityFromRateChangeActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: ConcavityFromRateChangeActivityProps) {
  const instanceId = useId();
  const [selectedClassification, setSelectedClassification] = useState<Classification | ''>('');
  const expectedMode = expectedPresentationMode(mode);

  if (props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Determine Concavity'
    : mode === 'guided'
      ? 'Guided Practice: Determine Concavity'
      : 'Independent Practice: Determine Concavity');
  const isWorked = props.presentationMode === 'worked_example';

  const submit = () => {
    if (!selectedClassification || isWorked) return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      answers: { classification: selectedClassification },
      parts: [{ partId: 'classification', rawAnswer: selectedClassification }],
    });
    onSubmit?.(envelope);
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">{title}</h2>
      <p>{props.prompt}</p>

      <table aria-label={`${props.functionName}(x) values`} className="border-collapse">
        <caption className="sr-only">Values for {props.functionName}(x)</caption>
        <tbody>
          <tr>
            <th scope="row" className="border px-3 py-2 text-left">x</th>
            {props.xValues.map((value, index) => <td key={`x-${index}`} className="border px-3 py-2">{formatValue(value)}</td>)}
          </tr>
          <tr>
            <th scope="row" className="border px-3 py-2 text-left">{props.functionName}(x)</th>
            {props.yValues.map((value, index) => <td key={`y-${index}`} className="border px-3 py-2">{formatValue(value)}</td>)}
          </tr>
        </tbody>
      </table>

      <fieldset aria-label="Concavity classification">
        <legend>Classify the function.</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {CLASSIFICATIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                name={`${activityId}-${instanceId}-classification`}
                value={option.value}
                checked={isWorked ? props.correctClassification === option.value : selectedClassification === option.value}
                disabled={isWorked}
                onChange={() => setSelectedClassification(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

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
          <button type="button" onClick={submit} disabled={!selectedClassification}>Submit answer</button>
        </>
      ) : (
        <button type="button" onClick={submit} disabled={!selectedClassification}>Submit answer</button>
      )}
    </section>
  );
}
