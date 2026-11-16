'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { GraphAverageRateChoiceProps } from '../../schemas';

export type GraphAverageRateChoiceActivityProps = GraphAverageRateChoiceProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

function expectedPresentationMode(mode: GraphAverageRateChoiceActivityProps['mode']) {
  if (mode === 'teaching') return 'worked_example' as const;
  if (mode === 'guided') return 'guided_practice' as const;
  return 'independent_practice' as const;
}

function buildSmoothGraphPath(points: Array<{ x: number; y: number }>) {
  const [first] = points;
  if (!first) return '';

  let path = `M${first.x} ${first.y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const start = points[index]!;
    const end = points[index + 1]!;
    const next = points[index + 2] ?? end;
    const control1 = {
      x: start.x + (end.x - previous.x) / 6,
      y: start.y + (end.y - previous.y) / 6,
    };
    const control2 = {
      x: end.x - (next.x - start.x) / 6,
      y: end.y - (next.y - start.y) / 6,
    };
    path += ` C${control1.x} ${control1.y} ${control2.x} ${control2.y} ${end.x} ${end.y}`;
  }
  return path;
}

export function GraphAverageRateChoiceActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: GraphAverageRateChoiceActivityProps) {
  const instanceId = useId();
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const expectedMode = expectedPresentationMode(mode);
  const isModeMatch = props.presentationMode === expectedMode;
  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Compare Average Rates of Change'
    : mode === 'guided'
      ? 'Guided Practice: Compare Average Rates of Change'
      : 'Independent Practice: Compare Average Rates of Change');
  const [domainStart, domainEnd] = props.domain;
  const [rangeStart, rangeEnd] = props.range;
  const graphWidth = 360;
  const graphHeight = 180;
  const left = 38;
  const right = 14;
  const top = 14;
  const bottom = 34;
  const xScale = (x: number) => left + ((x - domainStart) / (domainEnd - domainStart)) * (graphWidth - left - right);
  const yScale = (y: number) => top + ((rangeEnd - y) / (rangeEnd - rangeStart)) * (graphHeight - top - bottom);
  const graphPath = buildSmoothGraphPath(props.graphPoints.map((point) => ({ x: xScale(point.x), y: yScale(point.y) })));
  const optionEndpoints = [...new Set(props.options.flatMap((option) => [option.startInput, option.endInput]))].sort((a, b) => a - b);
  const yTickStep = Math.max(1, Math.ceil((rangeEnd - rangeStart) / 6));
  const yTickValues = [rangeStart];
  for (let value = rangeStart + yTickStep; value < rangeEnd; value += yTickStep) yTickValues.push(value);
  if (yTickValues.at(-1) !== rangeEnd) yTickValues.push(rangeEnd);
  const graphFunctionLabel = props.yLabel.endsWith('(x)') ? props.yLabel.slice(0, -3) : props.yLabel;
  const endpointValues = optionEndpoints.map((endpoint) => {
    const point = props.graphPoints.find((candidate) => candidate.x === endpoint);
    return `${graphFunctionLabel}(${endpoint})=${point?.y ?? 'unknown'}`;
  }).join(', ');
  const graphTitleId = `${instanceId}-graph-title`;
  const graphDescriptionId = `${instanceId}-graph-description`;

  const submit = () => {
    if (!selectedOptionId || !isModeMatch || mode === 'teaching') return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      answers: { selectedOptionId },
      parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
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
        className="h-44 w-full border border-current"
      >
        <title id={graphTitleId}>{`Graph of y = ${props.yLabel}`}</title>
        <desc id={graphDescriptionId}>
          {`Graph of ${props.yLabel} on the domain ${domainStart} to ${domainEnd}. Endpoint values: ${endpointValues}. Select the interval with the greatest average rate of change.`}
        </desc>
        <path
          d={`M${left} ${graphHeight - bottom}H${graphWidth - right}M${left} ${graphHeight - bottom}V${top}`}
          stroke="currentColor"
          fill="none"
          opacity="0.4"
        />
        <g data-testid="graph-y-ticks">
          {yTickValues.map((value) => (
            <g key={value}>
              <line x1={left} y1={yScale(value)} x2={graphWidth - right} y2={yScale(value)} stroke="currentColor" opacity="0.12" />
              <line x1={left - 4} y1={yScale(value)} x2={left} y2={yScale(value)} stroke="currentColor" opacity="0.5" />
              <text x={left - 7} y={yScale(value) + 4} textAnchor="end" fill="currentColor">{value}</text>
            </g>
          ))}
        </g>
        <path data-testid="graph-curve" d={graphPath} stroke="currentColor" strokeWidth="3" fill="none" />
        <g data-testid="graph-x-ticks" aria-hidden="true">
          {optionEndpoints.map((endpoint) => (
            <text key={endpoint} x={xScale(endpoint)} y={graphHeight - bottom + 18} textAnchor="middle" fill="currentColor">
              {endpoint}
            </text>
          ))}
        </g>
        <text x={graphWidth - right} y={graphHeight - 8} textAnchor="end" fill="currentColor">{props.xLabel}</text>
        <text x={12} y={top} textAnchor="middle" fill="currentColor">{props.yLabel}</text>
      </svg>

      {!isModeMatch ? (
        <p role="alert">This activity is unavailable for this presentation mode.</p>
      ) : (
        <>
          <fieldset
            aria-label="Interval choices"
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
