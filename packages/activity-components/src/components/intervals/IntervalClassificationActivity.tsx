'use client';

import { useId, useRef, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { IntervalClassificationProps } from '../../schemas/interval-classification.schema';

const ANSWER_FIELDS = [
  ['increasingIntervals', 'Increasing intervals'],
  ['decreasingIntervals', 'Decreasing intervals'],
  ['constantIntervals', 'Constant intervals'],
] as const;

type AnswerField = typeof ANSWER_FIELDS[number][0];

const INDEPENDENT_HINTS: Record<AnswerField, string> = {
  increasingIntervals: 'Compare each segment from left to right. Find each segment that rises.',
  decreasingIntervals: 'Compare each segment from left to right. Find each segment that falls.',
  constantIntervals: 'Compare each segment from left to right. Find each segment that stays level.',
};

function emptyCounts(): Record<AnswerField, number> {
  return {
    increasingIntervals: 0,
    decreasingIntervals: 0,
    constantIntervals: 0,
  };
}

export type IntervalClassificationActivityProps = IntervalClassificationProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void | Promise<void>;
  onComplete?: () => void;
};

export function IntervalClassificationActivity(props: IntervalClassificationActivityProps) {
  const {
    activityId,
    mode,
    title,
    prompt,
    domain,
    points,
    presentationMode,
    onSubmit,
    onComplete,
  } = props;
  const instanceId = useId();
  const [answers, setAnswers] = useState({
    increasingIntervals: '',
    decreasingIntervals: '',
    constantIntervals: '',
  });
  const [pending, setPending] = useState(false);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  const [hintsUsed, setHintsUsed] = useState(emptyCounts);
  const [revealStepsSeen, setRevealStepsSeen] = useState(emptyCounts);
  const [changedCount, setChangedCount] = useState(emptyCounts);
  const [submitError, setSubmitError] = useState<string>();
  const graphTitleId = `${instanceId}-graph-title`;
  const graphDescriptionId = `${instanceId}-graph-description`;
  const [domainStart, domainEnd] = domain;
  const values = points.map((point) => point.y);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const ySpan = maxY - minY || 1;
  const width = 320;
  const height = 110;
  const left = 24;
  const right = 10;
  const top = 10;
  const bottom = 22;
  const xScale = (x: number) => left + ((x - domainStart) / (domainEnd - domainStart)) * (width - left - right);
  const yScale = (y: number) => top + ((maxY - y) / ySpan) * (height - top - bottom);
  const graphPoints = points.map((point) => `${xScale(point.x)},${yScale(point.y)}`).join(' ');
  const revealedAnswers: Record<AnswerField, string> = {
    increasingIntervals: '',
    decreasingIntervals: '',
    constantIntervals: '',
  };
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index]!;
    const end = points[index + 1]!;
    const field = end.y > start.y
      ? 'increasingIntervals'
      : end.y < start.y
        ? 'decreasingIntervals'
        : 'constantIntervals';
    const interval = `[${start.x},${end.x}]`;
    revealedAnswers[field] = revealedAnswers[field]
      ? `${revealedAnswers[field]} U ${interval}`
      : interval;
  }
  for (const [field] of ANSWER_FIELDS) {
    revealedAnswers[field] ||= 'none';
  }
  const allAnswersPresent = ANSWER_FIELDS.every(([field]) => answers[field].trim().length > 0);

  const changeAnswer = (field: AnswerField, value: string) => {
    if (lockedRef.current) return;
    setAnswers((current) => ({ ...current, [field]: value }));
    setChangedCount((current) => ({ ...current, [field]: current[field] + 1 }));
  };

  const showHint = (field: AnswerField) => {
    if (lockedRef.current) return;
    setHintsUsed((current) => ({ ...current, [field]: 1 }));
  };

  const revealAnswer = (field: AnswerField) => {
    if (lockedRef.current) return;
    setRevealStepsSeen((current) => ({ ...current, [field]: 1 }));
  };

  const submit = async () => {
    if (lockedRef.current || !allAnswersPresent) return;
    lockedRef.current = true;
    setLocked(true);
    setPending(true);
    setSubmitError(undefined);
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'practice' ? 'independent_practice' : 'guided_practice',
      answers,
      parts: ANSWER_FIELDS.map(([partId]) => ({
        partId,
        rawAnswer: answers[partId],
        hintsUsed: hintsUsed[partId],
        revealStepsSeen: revealStepsSeen[partId],
        changedCount: changedCount[partId],
      })),
    });
    try {
      await onSubmit?.(envelope);
    } catch {
      setSubmitError('Your answer could not be saved. Try again.');
      return;
    } finally {
      setPending(false);
    }
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-6 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">
        {title ?? (mode === 'teaching'
          ? 'Worked Example: Classify Graph Intervals'
          : mode === 'guided'
            ? 'Guided Practice: Classify Graph Intervals'
            : 'Independent Practice: Classify Graph Intervals')}
      </h2>
      <p>{prompt}</p>

      <svg
        role="img"
        aria-labelledby={`${graphTitleId} ${graphDescriptionId}`}
        viewBox={`0 0 ${width} ${height}`}
        className="h-28 w-full"
      >
        <title id={graphTitleId}>Interval graph</title>
        <desc id={graphDescriptionId}>
          {`Domain ${domainStart} to ${domainEnd}. Line segments connect these points from left to right: ${points.map((point) => `(${point.x}, ${point.y})`).join(', ')}.`}
        </desc>
        <path
          d={`M${left - 14} ${height - bottom}H${width - right}M${left} ${height - bottom + 8}V${top}`}
          stroke="currentColor"
          fill="none"
          opacity="0.35"
        />
        <polyline points={graphPoints} stroke="currentColor" strokeWidth="4" fill="none" />
        <g fill="currentColor" fontSize="12" textAnchor="middle">
          {points.map((point) => (
            <text key={point.x} x={xScale(point.x)} y={height - 4}>
              {point.x}
            </text>
          ))}
        </g>
      </svg>

      {!((mode === 'teaching' && presentationMode === 'worked_example')
        || (mode === 'guided' && presentationMode === 'guided_practice')
        || (mode === 'practice' && presentationMode === 'independent_practice')) ? (
        <p role="alert">This activity is unavailable for this presentation mode.</p>
      ) : presentationMode === 'worked_example' ? (
        <>
          <ol className="list-decimal space-y-2 pl-5">
            {props.steps.map((step) => (
              <li key={`${step.description}-${step.expression}`}>
                <p>{step.description}</p>
                <p>{step.expression}</p>
                {step.result && <p>{step.result}</p>}
                {step.explanation && <p>{step.explanation}</p>}
              </li>
            ))}
          </ol>
          <p><strong>Answer:</strong> {props.finalAnswer}</p>
        </>
      ) : presentationMode === 'guided_practice' ? (
        <>
          <ol className="list-decimal space-y-2 pl-5">
            {props.guidedSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <div className="grid gap-4">
            {ANSWER_FIELDS.map(([field, label]) => {
              const helpId = `${instanceId}-${field}-help`;
              return (
                <div key={field} className="grid gap-2">
                  <label className="grid gap-2">
                    <span>{label}</span>
                    <input
                      disabled={locked}
                      aria-describedby={hintsUsed[field] ? helpId : undefined}
                      aria-label={label}
                      value={answers[field]}
                      onChange={(event) => changeAnswer(field, event.target.value)}
                    />
                  </label>
                  <button type="button" disabled={locked || hintsUsed[field] > 0}
                    onClick={() => showHint(field)}>
                    {`Show hint for ${label}`}
                  </button>
                  {hintsUsed[field] > 0 && <p id={helpId}>{props.fieldHelp[field]}</p>}
                  <button type="button" disabled={locked || revealStepsSeen[field] > 0}
                    onClick={() => revealAnswer(field)}>
                    {`Reveal answer for ${label}`}
                  </button>
                  {revealStepsSeen[field] > 0 && <p>{revealedAnswers[field]}</p>}
                </div>
              );
            })}
          </div>
          <button type="button" disabled={locked || !allAnswersPresent} onClick={submit}>
            {pending ? 'Saving answer…' : locked ? 'Answer submitted' : 'Submit answer'}
          </button>
        </>
      ) : (
        <>
          <div className="grid gap-4">
            {ANSWER_FIELDS.map(([field, label]) => (
              <div key={field} className="grid gap-2">
                <label className="grid gap-2">
                  <span>{label}</span>
                  <input disabled={locked} aria-label={label} value={answers[field]}
                    onChange={(event) => changeAnswer(field, event.target.value)} />
                </label>
                <button type="button" disabled={locked || hintsUsed[field] > 0}
                  onClick={() => showHint(field)}>
                  {`Show hint for ${label}`}
                </button>
                {hintsUsed[field] > 0 && <p>{INDEPENDENT_HINTS[field]}</p>}
                <button type="button" disabled={locked || revealStepsSeen[field] > 0}
                  onClick={() => revealAnswer(field)}>
                  {`Reveal answer for ${label}`}
                </button>
                {revealStepsSeen[field] > 0 && <p>{revealedAnswers[field]}</p>}
              </div>
            ))}
          </div>
          <button type="button" disabled={locked || !allAnswersPresent} onClick={submit}>
            {pending ? 'Saving answer…' : locked ? 'Answer submitted' : 'Submit answer'}
          </button>
        </>
      )}
      {submitError && <p role="alert">{submitError}</p>}
    </section>
  );
}
