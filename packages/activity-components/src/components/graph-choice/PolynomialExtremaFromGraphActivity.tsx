'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { PolynomialExtremaFromGraphProps } from '../../schemas';

export type PolynomialExtremaFromGraphActivityProps = PolynomialExtremaFromGraphProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

type PartId = 'relative_minimum_x' | 'relative_maximum_x' | 'absolute_minimum_x';

const PART_IDS: readonly PartId[] = [
  'relative_minimum_x',
  'relative_maximum_x',
  'absolute_minimum_x',
];

const PART_LABELS: Record<PartId, string> = {
  relative_minimum_x: 'Relative minimum x-value',
  relative_maximum_x: 'Relative maximum x-value',
  absolute_minimum_x: 'Absolute minimum x-value',
};

function expectedPresentationMode(
  mode: PolynomialExtremaFromGraphActivityProps['mode'],
) {
  if (mode === 'teaching') return 'worked_example' as const;
  if (mode === 'guided') return 'guided_practice' as const;
  return 'independent_practice' as const;
}

function formatGraphNumber(value: number): string {
  return String(value);
}

export function PolynomialExtremaFromGraphActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: PolynomialExtremaFromGraphActivityProps) {
  const instanceId = useId();
  const [answers, setAnswers] = useState<Record<PartId, string>>({
    relative_minimum_x: '',
    relative_maximum_x: '',
    absolute_minimum_x: '',
  });
  const expectedMode = expectedPresentationMode(mode);

  if (props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Identify Extrema from a Graph'
    : mode === 'guided'
      ? 'Guided Practice: Identify Extrema from a Graph'
      : 'Independent Practice: Identify Extrema from a Graph');
  const isWorked = props.presentationMode === 'worked_example';
  const canSubmit = !isWorked && PART_IDS.every((partId) => answers[partId].trim().length > 0);
  const [domainStart, domainEnd] = props.domain;
  const yValues = props.points.map((point) => point.y);
  const yMinimum = Math.min(...yValues);
  const yMaximum = Math.max(...yValues);
  const yPadding = Math.max((yMaximum - yMinimum) * 0.1, 1);
  const rangeStart = yMinimum - yPadding;
  const rangeEnd = yMaximum + yPadding;
  const graphWidth = 480;
  const graphHeight = 280;
  const left = 52;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const xScale = (x: number) => left + ((x - domainStart) / (domainEnd - domainStart)) * (graphWidth - left - right);
  const yScale = (y: number) => top + ((rangeEnd - y) / (rangeEnd - rangeStart)) * (graphHeight - top - bottom);
  const polylinePoints = props.points
    .map((point) => `${xScale(point.x)},${yScale(point.y)}`)
    .join(' ');
  const xTicks = Array.from(
    { length: domainEnd - domainStart + 1 },
    (_, index) => domainStart + index,
  );
  const graphTitleId = `${instanceId}-graph-title`;
  const graphDescriptionId = `${instanceId}-graph-description`;
  const fieldHelpId = `${instanceId}-field-help`;

  const submit = () => {
    if (!canSubmit || isWorked) return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      answers: {
        relative_minimum_x: answers.relative_minimum_x,
        relative_maximum_x: answers.relative_maximum_x,
        absolute_minimum_x: answers.absolute_minimum_x,
      },
      parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    });
    onSubmit?.(envelope);
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">{title}</h2>
      <p>{props.prompt}</p>

      <svg
        role="img"
        aria-labelledby={`${graphTitleId} ${graphDescriptionId}`}
        viewBox={`0 0 ${graphWidth} ${graphHeight}`}
        className="h-64 w-full border border-current"
      >
        <title id={graphTitleId}>Graph of polynomial g</title>
        <desc id={graphDescriptionId}>
          {`Graph of polynomial g on the domain ${formatGraphNumber(domainStart)} to ${formatGraphNumber(domainEnd)}.`}
        </desc>
        <line
          x1={left}
          y1={graphHeight - bottom}
          x2={graphWidth - right}
          y2={graphHeight - bottom}
          stroke="currentColor"
          opacity="0.35"
        />
        <line
          x1={left}
          y1={top}
          x2={left}
          y2={graphHeight - bottom}
          stroke="currentColor"
          opacity="0.35"
        />
        <g data-testid="polynomial-extrema-x-ticks">
          {xTicks.map((value) => (
            <text key={value} x={xScale(value)} y={graphHeight - bottom + 20} textAnchor="middle" fill="currentColor">
              {formatGraphNumber(value)}
            </text>
          ))}
        </g>
        <text x={left} y={top} fill="currentColor">{formatGraphNumber(rangeEnd)}</text>
        <text x={left} y={graphHeight - bottom + 36} fill="currentColor">{formatGraphNumber(rangeStart)}</text>
        <polyline
          data-testid="polynomial-extrema-curve"
          points={polylinePoints}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
      </svg>

      <table aria-label="Graph data for polynomial g" className="sr-only">
        <caption>Displayed graph data for polynomial g.</caption>
        <thead>
          <tr><th scope="col">x</th><th scope="col">g(x)</th></tr>
        </thead>
        <tbody>
          {props.points.map((point) => (
            <tr key={`${point.x}-${point.y}`}>
              <td>{formatGraphNumber(point.x)}</td>
              <td>{formatGraphNumber(point.y)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isWorked ? (
        <>
          <dl>
            <div><dt>Relative minimum x-value</dt><dd>{props.correctAnswers.relative_minimum_x}</dd></div>
            <div><dt>Relative maximum x-value</dt><dd>{props.correctAnswers.relative_maximum_x}</dd></div>
            <div><dt>Absolute minimum x-value</dt><dd>{props.correctAnswers.absolute_minimum_x}</dd></div>
          </dl>
          <ol className="list-decimal space-y-2 pl-5">
            {props.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
          </ol>
          <p><strong>Answer:</strong> {props.finalAnswer}</p>
        </>
      ) : (
        <>
          <fieldset aria-describedby={props.presentationMode === 'guided_practice' ? fieldHelpId : undefined}>
            <legend>Identify the extrema.</legend>
            <div className="grid gap-3">
              {PART_IDS.map((partId) => (
                <label key={partId} htmlFor={`${instanceId}-${partId}`}>
                  {PART_LABELS[partId]}
                  <input
                    id={`${instanceId}-${partId}`}
                    type="text"
                    inputMode="decimal"
                    value={answers[partId]}
                    onChange={(event) => setAnswers((current) => ({
                      ...current,
                      [partId]: event.target.value,
                    }))}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          {props.presentationMode === 'guided_practice' ? (
            <>
              <ol className="list-decimal space-y-2 pl-5">
                {props.guidedSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
              </ol>
              <p id={fieldHelpId}>{props.fieldHelp}</p>
            </>
          ) : null}
          <button type="button" onClick={submit} disabled={!canSubmit}>Submit answer</button>
        </>
      )}
    </section>
  );
}
