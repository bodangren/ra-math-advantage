'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { PointwiseLeastRateChoiceProps } from '../../schemas';

export type PointwiseLeastRateChoiceActivityProps = PointwiseLeastRateChoiceProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

function expectedPresentationMode(mode: PointwiseLeastRateChoiceActivityProps['mode']) {
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

export function PointwiseLeastRateChoiceActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: PointwiseLeastRateChoiceActivityProps) {
  const instanceId = useId();
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const expectedMode = expectedPresentationMode(mode);
  const isModeMatch = props.presentationMode === expectedMode;
  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Find the Least Rate of Change'
    : mode === 'guided'
      ? 'Guided Practice: Find the Least Rate of Change'
      : 'Independent Practice: Find the Least Rate of Change');
  const [domainStart, domainEnd] = props.domain;
  const [rangeStart, rangeEnd] = props.range;
  const graphWidth = 360;
  const graphHeight = 180;
  const left = 42;
  const right = 14;
  const top = 14;
  const bottom = 34;
  const xScale = (x: number) => left + ((x - domainStart) / (domainEnd - domainStart)) * (graphWidth - left - right);
  const yScale = (y: number) => top + ((rangeEnd - y) / (rangeEnd - rangeStart)) * (graphHeight - top - bottom);
  const verticalAxisX = domainStart <= 0 && domainEnd >= 0
    ? xScale(0)
    : domainStart > 0 ? left : graphWidth - right;
  const horizontalAxisY = rangeStart <= 0 && rangeEnd >= 0
    ? yScale(0)
    : rangeStart > 0 ? graphHeight - bottom : top;
  const graphPath = buildSmoothGraphPath(props.graphPoints.map((point) => ({ x: xScale(point.x), y: yScale(point.y) })));
  const xTickValues = [...new Set([
    domainStart,
    ...props.labeledPoints.map((point) => point.x),
    domainEnd,
  ])].sort((a, b) => a - b);
  const yTickStep = Math.max(1, Math.ceil((rangeEnd - rangeStart) / 6));
  const yTickValues = [rangeStart];
  for (let value = rangeStart + yTickStep; value < rangeEnd; value += yTickStep) yTickValues.push(value);
  if (yTickValues[yTickValues.length - 1] !== rangeEnd) yTickValues.push(rangeEnd);
  const graphTitleId = `${instanceId}-graph-title`;
  const graphDescriptionId = `${instanceId}-graph-description`;
  const labeledPointDescription = props.labeledPoints
    .map((point) => `${point.label}(${point.x}, ${point.y})`)
    .join(', ');

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
        <title id={graphTitleId}>{`Graph of ${props.yLabel} with four labeled points.`}</title>
        <desc id={graphDescriptionId}>
          {`Graph of ${props.yLabel} on the domain ${domainStart} to ${domainEnd}. Labeled points: ${labeledPointDescription}. Select the point with the least instantaneous rate of change.`}
        </desc>
        <path
          data-testid="pointwise-axes"
          d={`M${left} ${horizontalAxisY}H${graphWidth - right}M${verticalAxisX} ${graphHeight - bottom}V${top}`}
          stroke="currentColor"
          fill="none"
          opacity="0.4"
        />
        <g data-testid="pointwise-y-ticks">
          {yTickValues.map((value) => (
            <g key={value}>
              <line x1={left} y1={yScale(value)} x2={graphWidth - right} y2={yScale(value)} stroke="currentColor" opacity="0.12" />
              <line x1={left - 4} y1={yScale(value)} x2={left} y2={yScale(value)} stroke="currentColor" opacity="0.5" />
              <text x={left - 7} y={yScale(value) + 4} textAnchor="end" fill="currentColor">{value}</text>
            </g>
          ))}
        </g>
        <g data-testid="pointwise-x-ticks">
          {xTickValues.map((value) => (
            <text key={value} x={xScale(value)} y={graphHeight - bottom + 18} textAnchor="middle" fill="currentColor">
              {value}
            </text>
          ))}
        </g>
        <path data-testid="pointwise-graph-curve" d={graphPath} stroke="currentColor" strokeWidth="3" fill="none" />
        <g data-testid="pointwise-labeled-points">
          {props.labeledPoints.map((point) => (
            <text
              key={point.id}
              data-testid={`point-label-${point.label}`}
              data-point-x={point.x}
              data-point-y={point.y}
              x={xScale(point.x)}
              y={yScale(point.y)}
              fill="currentColor"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {point.label}
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
            aria-label="Point choices"
            aria-describedby={props.presentationMode === 'guided_practice' ? `${instanceId}-field-help` : undefined}
          >
            <legend>Select a point.</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {props.options.map((option) => {
                const isWorked = props.presentationMode === 'worked_example';
                const point = props.labeledPoints.find((candidate) => candidate.id === option.id);
                const checked = isWorked ? option.id === props.correctOptionId : option.id === selectedOptionId;
                return (
                  <label key={option.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`${activityId}-point-choice`}
                      value={option.id}
                      checked={checked}
                      disabled={isWorked}
                      onChange={() => setSelectedOptionId(option.id)}
                    />
                    <span>{option.label}</span>
                    <span>({point?.x}, {point?.y})</span>
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
