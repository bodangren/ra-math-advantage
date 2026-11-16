'use client';

import { useId, useRef, useState } from 'react';
import InlineMath from '@matejmazur/react-katex';
import { buildPracticeSubmissionEnvelope, type PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { QuadraticFormulaActivityPayload as PublicProps } from './quadratic-formula-activity.schema';
import { MathInputField } from './MathInputField';

const FIELDS = [
  ['discriminant', 'Discriminant'],
  ['x1', 'First root'],
  ['x2', 'Second root'],
] as const;
type Field = (typeof FIELDS)[number][0];
type Counts = Record<Field, number>;
const zeroCounts = (): Counts => ({ discriminant: 0, x1: 0, x2: 0 });
const defaultHelp: Record<Field, string> = {
  discriminant: 'Compute b squared minus 4ac.',
  x1: 'Substitute the coefficients in the Quadratic Formula and use one sign.',
  x2: 'Use the other sign. Leave this field blank only for a repeated root.',
};

export type QuadraticFormulaActivityProps = PublicProps & {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void | Promise<void>;
  onComplete?: () => void;
  onCheckDiscriminant?: (rawAnswer: string) => Promise<boolean>;
  attemptOrdinal?: number;
};

export function QuadraticFormulaActivity(props: QuadraticFormulaActivityProps) {
  const { activityId, mode, prompt, equation, onSubmit, onComplete, onCheckDiscriminant } = props;
  const instanceId = useId();
  const [answers, setAnswers] = useState<Record<Field, string>>({ discriminant: '', x1: '', x2: '' });
  const [hintsUsed, setHintsUsed] = useState<Counts>(zeroCounts);
  const [changedCount, setChangedCount] = useState<Counts>(zeroCounts);
  const [locked, setLocked] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const lockedRef = useRef(false);
  const pendingRef = useRef(false);
  const frozenEnvelopeRef = useRef<PracticeSubmissionEnvelope | null>(null);
  const discriminantRevisionRef = useRef(0);
  const discriminantValueRef = useRef('');
  const activeCheckRevisionsRef = useRef(new Set<number>());
  const [checkState, setCheckState] = useState<'idle' | 'pending' | 'correct' | 'incorrect' | 'error'>('idle');

  const expectedPresentationMode = mode === 'teaching' ? 'worked' : mode === 'guided' ? 'guided' : 'independent';
  if (props.presentationMode !== expectedPresentationMode) {
    return <p role="alert">This activity mode is not available.</p>;
  }

  if (mode === 'teaching' && props.presentationMode === 'worked') {
    return (
      <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4">
        <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">{props.title ?? 'Worked Example: Quadratic Formula'}</h2>
        <p>{prompt}</p>
        <p><InlineMath math={equation} /></p>
        <ol aria-label="Worked solution" className="space-y-3">
          {props.workedSteps.map((step, index) => (
            <li key={`${step.description}-${index}`} className="rounded-md border p-3">
              <p>{step.description}</p>
              {step.expression && <p><InlineMath math={step.expression} /></p>}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (!Number.isSafeInteger(props.attemptOrdinal) || (props.attemptOrdinal ?? 0) < 1) {
    return <p role="alert">This activity attempt is not available.</p>;
  }

  const changeAnswer = (field: Field, value: string) => {
    if (lockedRef.current) return;
    if (field === 'discriminant' && mode === 'guided') {
      discriminantRevisionRef.current += 1;
      discriminantValueRef.current = value;
      setCheckState('idle');
      setAnswers((current) => ({ ...current, discriminant: value, x1: '', x2: '' }));
    } else {
      setAnswers((current) => ({ ...current, [field]: value }));
    }
    setChangedCount((current) => ({ ...current, [field]: current[field] + 1 }));
  };

  const checkDiscriminant = async () => {
    const rawAnswer = discriminantValueRef.current;
    if (mode !== 'guided' || !onCheckDiscriminant || !rawAnswer.trim()) return;
    const revision = discriminantRevisionRef.current;
    if (activeCheckRevisionsRef.current.has(revision)) return;
    activeCheckRevisionsRef.current.add(revision);
    setCheckState('pending');
    try {
      const isCorrect = await onCheckDiscriminant(rawAnswer);
      if (revision === discriminantRevisionRef.current && rawAnswer === discriminantValueRef.current) {
        setCheckState(isCorrect ? 'correct' : 'incorrect');
      }
    } catch {
      if (revision === discriminantRevisionRef.current && rawAnswer === discriminantValueRef.current) {
        setCheckState('error');
      }
    } finally {
      activeCheckRevisionsRef.current.delete(revision);
    }
  };

  const showHint = (field: Field) => {
    if (lockedRef.current) return;
    setHintsUsed((current) => ({ ...current, [field]: 1 }));
  };

  const deliver = async (envelope: PracticeSubmissionEnvelope) => {
    const handler = onSubmit;
    if (!handler || pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setSubmitError(undefined);
    try {
      await handler(envelope);
      setSaved(true);
      onComplete?.();
    } catch {
      setSubmitError('Your answer could not be saved. Try again.');
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  const submit = () => {
    if (!onSubmit || lockedRef.current || pendingRef.current) return;
    if (mode === 'guided' && (!onCheckDiscriminant || checkState !== 'correct')) return;
    if (!answers.discriminant.trim() || !answers.x1.trim()) {
      const firstInvalid: Field = !answers.discriminant.trim() ? 'discriminant' : 'x1';
      document.getElementById(`${instanceId}-${firstInvalid}`)?.focus();
      setSubmitError('Enter the discriminant and the first root.');
      return;
    }
    lockedRef.current = true;
    setLocked(true);
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'practice' ? 'independent_practice' : 'guided_practice',
      status: 'submitted',
      attemptNumber: props.attemptOrdinal!,
      answers: { discriminant: answers.discriminant, x1: answers.x1, x2: answers.x2 },
      parts: FIELDS.map(([partId]) => ({
        partId,
        rawAnswer: answers[partId],
        hintsUsed: hintsUsed[partId],
        revealStepsSeen: 0,
        changedCount: changedCount[partId],
      })),
    });
    frozenEnvelopeRef.current = envelope;
    void deliver(envelope);
  };

  const retry = () => {
    if (onSubmit && frozenEnvelopeRef.current) void deliver(frozenEnvelopeRef.current);
  };

  const formatHelpId = `${instanceId}-answer-format`;
  const guidedHelp = props.presentationMode === 'guided' ? props.fieldHelp : undefined;
  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">
        {props.title ?? (mode === 'guided' ? 'Guided Practice: Quadratic Formula' : 'Quadratic Formula Practice')}
      </h2>
      <p>{prompt}</p>
      <p><InlineMath math={equation} /></p>
      <p id={formatHelpId}>Enter each distinct root once. Leave the second root blank for one repeated root. Use sqrt(...) or √ and i. Put a summed numerator in parentheses before division. Do not enter a combined ± expression in one field.</p>
      <form aria-label="Quadratic Formula response" className="space-y-4" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        {FIELDS.map(([field, label]) => {
          const helpId = `${instanceId}-${field}-help`;
          return (
            <div key={field} className="space-y-2">
              <MathInputField inputId={`${instanceId}-${field}`} describedBy={[formatHelpId, hintsUsed[field] ? helpId : undefined].filter(Boolean).join(' ')}
                value={answers[field]} onChange={(value) => changeAnswer(field, value)} label={label}
                disabled={locked || (mode === 'guided' && field !== 'discriminant'
                  && (!onCheckDiscriminant || checkState !== 'correct'))}
                required={field !== 'x2'} placeholder={field === 'x2' ? 'Leave blank for a repeated root' : undefined} />
              {mode === 'guided' && field === 'discriminant' && (
                <div className="space-y-2">
                  <button type="button" disabled={locked || checkState === 'pending' || !answers.discriminant.trim() || !onCheckDiscriminant}
                    onClick={() => void checkDiscriminant()}>
                    {checkState === 'pending' ? 'Checking discriminant…' : 'Check discriminant'}
                  </button>
                  {checkState === 'correct' && onCheckDiscriminant
                    && <p role="status">The discriminant is correct. Enter the roots.</p>}
                  {checkState === 'incorrect' && <p role="alert">The discriminant is not correct. Try again.</p>}
                  {checkState === 'error' && <p role="alert">The discriminant could not be checked. Try again.</p>}
                </div>
              )}
              {mode === 'guided' && (
                <button type="button" disabled={locked || hintsUsed[field] > 0} onClick={() => showHint(field)}>
                  {`Show hint for ${label}`}
                </button>
              )}
              {hintsUsed[field] > 0 && <p id={helpId} aria-live="polite">{guidedHelp?.[field] ?? defaultHelp[field]}</p>}
            </div>
          );
        })}
        <button type="submit" disabled={!onSubmit || locked || pending
          || (mode === 'guided' && (!onCheckDiscriminant || checkState !== 'correct'))}>
          {pending ? 'Saving answer…' : saved ? 'Answer saved' : submitError && locked ? 'Submission failed' : locked ? 'Submission locked' : 'Submit answer'}
        </button>
      </form>
      {submitError && <div className="space-y-2"><p role="alert">{submitError}</p>
        {frozenEnvelopeRef.current && <button type="button" disabled={pending || !onSubmit} onClick={retry}>Try submit again</button>}
      </div>}
    </section>
  );
}
