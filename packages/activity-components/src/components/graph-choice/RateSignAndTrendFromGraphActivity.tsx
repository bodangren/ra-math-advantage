'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { RateSignAndTrendFromGraphProps } from '../../schemas';

export type RateSignAndTrendFromGraphActivityProps = RateSignAndTrendFromGraphProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

type RateSign = 'positive' | 'negative';
type RateTrend = 'increasing' | 'decreasing';

function expectedPresentationMode(
  mode: RateSignAndTrendFromGraphActivityProps['mode'],
): RateSignAndTrendFromGraphProps['presentationMode'] | null {
  if (mode === 'teaching') return 'worked_example';
  if (mode === 'guided') return 'guided_practice';
  if (mode === 'practice') return 'independent_practice';
  return null;
}

function formatNumber(value: number): string {
  return String(value);
}

export function RateSignAndTrendFromGraphActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: RateSignAndTrendFromGraphActivityProps) {
  const instanceId = useId();
  const [rateSign, setRateSign] = useState<RateSign | ''>('');
  const [rateTrend, setRateTrend] = useState<RateTrend | ''>('');
  const expectedMode = expectedPresentationMode(mode);

  if (!expectedMode || props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Rate Sign and Trend'
    : mode === 'guided'
      ? 'Guided Practice: Rate Sign and Trend'
      : 'Independent Practice: Rate Sign and Trend');
  const isWorked = props.presentationMode === 'worked_example';
  const canSubmit = !isWorked && rateSign !== '' && rateTrend !== '';
  const [domainStart, domainEnd] = props.interval;
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
  const xScale = (x: number) => left
    + ((x - domainStart) / (domainEnd - domainStart)) * (graphWidth - left - right);
  const yScale = (y: number) => top
    + ((rangeEnd - y) / (rangeEnd - rangeStart)) * (graphHeight - top - bottom);
  const polylinePoints = props.points
    .map((point) => `${xScale(point.x)},${yScale(point.y)}`)
    .join(' ');
  const graphTitleId = `${instanceId}-graph-title`;
  const graphDescriptionId = `${instanceId}-graph-description`;
  const fieldHelpId = `${instanceId}-field-help`;

  const submit = () => {
    if (mode === 'teaching' || rateSign === '' || rateTrend === '') return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      answers: { rateSign, rateTrend },
      parts: [
        { partId: 'rateSign', rawAnswer: rateSign },
        { partId: 'rateTrend', rawAnswer: rateTrend },
      ],
    });
    onSubmit?.(envelope);
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">{title}</h2>
      <p>{props.prompt}</p>
      <p>{`Open interval: (${formatNumber(domainStart)}, ${formatNumber(domainEnd)})`}</p>

      <svg
        role="img"
        aria-labelledby={`${graphTitleId} ${graphDescriptionId}`}
        viewBox={`0 0 ${graphWidth} ${graphHeight}`}
        className="h-64 w-full border border-current"
      >
        <title id={graphTitleId}>Graph of h</title>
        <desc id={graphDescriptionId}>
          {`Graph of h on the open interval (${formatNumber(domainStart)}, ${formatNumber(domainEnd)}).`}
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
        <text x={left} y={top} fill="currentColor">{formatNumber(rangeEnd)}</text>
        <text x={left} y={graphHeight - bottom + 20} fill="currentColor">{formatNumber(domainStart)}</text>
        <text x={graphWidth - right} y={graphHeight - bottom + 20} textAnchor="end" fill="currentColor">
          {formatNumber(domainEnd)}
        </text>
        <polyline
          data-testid="rate-sign-and-trend-curve"
          points={polylinePoints}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
      </svg>

      <table aria-label="Graph data for h" className="sr-only">
        <caption>Displayed graph data for h.</caption>
        <thead>
          <tr><th scope="col">x</th><th scope="col">h(x)</th></tr>
        </thead>
        <tbody>
          {props.points.map((point) => (
            <tr key={`${point.x}-${point.y}`}>
              <td>{formatNumber(point.x)}</td>
              <td>{formatNumber(point.y)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isWorked ? (
        <>
          <dl>
            <div><dt>Rate sign</dt><dd>{props.correctAnswers.rateSign}</dd></div>
            <div><dt>Rate trend</dt><dd>{props.correctAnswers.rateTrend}</dd></div>
          </dl>
          <ol className="list-decimal space-y-2 pl-5">
            {props.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
          </ol>
          <p><strong>Answer:</strong> {props.finalAnswer}</p>
        </>
      ) : (
        <>
          <fieldset aria-describedby={props.presentationMode === 'guided_practice' ? fieldHelpId : undefined}>
            <legend>Choose the rate sign.</legend>
            <label htmlFor={`${instanceId}-rate-sign-positive`}>
              <input
                id={`${instanceId}-rate-sign-positive`}
                type="radio"
                name={`${instanceId}-rate-sign`}
                value="positive"
                checked={rateSign === 'positive'}
                onChange={() => setRateSign('positive')}
              />
              Positive rate
            </label>
            <label htmlFor={`${instanceId}-rate-sign-negative`}>
              <input
                id={`${instanceId}-rate-sign-negative`}
                type="radio"
                name={`${instanceId}-rate-sign`}
                value="negative"
                checked={rateSign === 'negative'}
                onChange={() => setRateSign('negative')}
              />
              Negative rate
            </label>
          </fieldset>

          <fieldset aria-describedby={props.presentationMode === 'guided_practice' ? fieldHelpId : undefined}>
            <legend>Choose the rate trend.</legend>
            <label htmlFor={`${instanceId}-rate-trend-increasing`}>
              <input
                id={`${instanceId}-rate-trend-increasing`}
                type="radio"
                name={`${instanceId}-rate-trend`}
                value="increasing"
                checked={rateTrend === 'increasing'}
                onChange={() => setRateTrend('increasing')}
              />
              Increasing rate trend
            </label>
            <label htmlFor={`${instanceId}-rate-trend-decreasing`}>
              <input
                id={`${instanceId}-rate-trend-decreasing`}
                type="radio"
                name={`${instanceId}-rate-trend`}
                value="decreasing"
                checked={rateTrend === 'decreasing'}
                onChange={() => setRateTrend('decreasing')}
              />
              Decreasing rate trend
            </label>
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
