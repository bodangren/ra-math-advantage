'use client';

import { useId, useState } from 'react';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { PhysicalContextGraphChoiceProps } from '../../schemas';

export type PhysicalContextGraphChoiceActivityProps = PhysicalContextGraphChoiceProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

const SHAPE_POINTS = {
  'linear-increasing': '12,76 148,24',
  'slope-increases-then-decreases': '12,76 52,68 96,30 148,22',
  'rise-fall-rise': '12,72 52,28 94,72 148,34',
  'steep-gentle-steep': '12,82 42,30 118,26 148,10',
} as const;

const CONTAINER_PROFILES = {
  'constant-width': {
    path: 'M25 25H95V155H25Z',
    description: 'A straight-sided container with constant width.',
  },
  'wide-narrow-wide': {
    path: 'M15 20H105L78 80V120L105 160H15L42 120V80Z',
    description: 'A vessel that is wide at the bottom, narrow in the middle, and wide at the top.',
  },
  'narrow-wide-narrow': {
    path: 'M47 18Q60 12 73 18L72 42Q72 52 88 62Q108 76 104 104Q100 132 84 150H36Q20 132 16 104Q12 76 32 62Q48 52 48 42Z',
    description: 'A vase with a narrow base, a wide rounded middle, and a narrow neck.',
  },
} as const;

function expectedPresentationMode(mode: PhysicalContextGraphChoiceActivityProps['mode']) {
  if (mode === 'teaching') return 'worked_example' as const;
  if (mode === 'guided') return 'guided_practice' as const;
  return 'independent_practice' as const;
}

export function PhysicalContextGraphChoiceActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: PhysicalContextGraphChoiceActivityProps) {
  const instanceId = useId();
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const expectedMode = expectedPresentationMode(mode);
  const isModeMatch = props.presentationMode === expectedMode;
  const title = props.title ?? (mode === 'teaching'
    ? 'Worked Example: Select a Physical-Context Graph'
    : mode === 'guided'
      ? 'Guided Practice: Select a Physical-Context Graph'
      : 'Independent Practice: Select a Physical-Context Graph');

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
      <p>{props.contextDescription}</p>
      <p>{props.xLabel} and {props.yLabel}</p>

      {!isModeMatch ? (
        <p role="alert">This activity is unavailable for this presentation mode.</p>
      ) : (
        <>
          <svg
            role="img"
            data-container-profile={props.containerProfile}
            aria-label={CONTAINER_PROFILES[props.containerProfile].description}
            viewBox="0 0 120 180"
            className="h-44 w-32 border border-current"
          >
            <path d={CONTAINER_PROFILES[props.containerProfile].path} stroke="currentColor" strokeWidth="3" fill="none" />
          </svg>

          <fieldset
            aria-label="Graph choices"
            aria-describedby={props.presentationMode === 'guided_practice' ? `${instanceId}-field-help` : undefined}
          >
            <legend>Select a graph.</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {props.options.map((option) => {
                const isWorked = props.presentationMode === 'worked_example';
                const checked = isWorked ? option.id === props.correctOptionId : option.id === selectedOptionId;
                return (
                  <label key={option.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`${activityId}-graph-choice`}
                      value={option.id}
                      checked={checked}
                      disabled={isWorked}
                      onChange={() => setSelectedOptionId(option.id)}
                    />
                    <span>{option.label}</span>
                    <svg
                      role="img"
                      aria-label={option.accessibleDescription}
                      viewBox="0 0 160 100"
                      className="h-24 w-36 border border-current"
                    >
                      <path d="M8 82H152M18 92V8" stroke="currentColor" fill="none" opacity="0.35" />
                      <polyline points={SHAPE_POINTS[option.shape]} stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
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
              <button
                type="button"
                onClick={submit}
                disabled={!selectedOptionId}
              >
                Submit answer
              </button>
            </>
          ) : (
            <button type="button" onClick={submit} disabled={!selectedOptionId}>Submit answer</button>
          )}
        </>
      )}
    </section>
  );
}
