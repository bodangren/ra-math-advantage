'use client';

import { useRef, useState } from 'react';

import { AccountingEquationLayout } from '@/components/activities/shared/AccountingEquationLayout';
import { SelectionMatrix } from '@/components/activities/shared/SelectionMatrix';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { buildPracticeSubmissionEnvelope, type PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import type { AccountingEquationEventDraft } from '@/lib/practice/drafts/accounting-equation-event';

export interface AccountingEquationEventActivityProps extends AccountingEquationEventDraft {
  onSubmit: (submission: PracticeSubmissionEnvelope) => void | Promise<void>;
  onComplete?: () => void;
}

const directionColumns = [
  { id: 'increase', label: 'Increase' },
  { id: 'decrease', label: 'Decrease' },
  { id: 'no-effect', label: 'No effect' },
];

export function AccountingEquationEventActivity({
  activityId, mode, title, description, cases, onSubmit, onComplete,
}: AccountingEquationEventActivityProps) {
  const [effects, setEffects] = useState<Record<string, Record<string, string | string[]>>>({});
  const [accountAmounts, setAccountAmounts] = useState<Record<string, Record<string, string>>>({});
  const [totals, setTotals] = useState<Record<string, Record<string, string>>>({});
  const [differences, setDifferences] = useState<Record<string, string>>({});
  const [explanation, setExplanation] = useState('');
  const [hintCounts, setHintCounts] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const savingRef = useRef(false);
  const pendingEnvelopeRef = useRef<PracticeSubmissionEnvelope | null>(null);
  const responseIsComplete = mode === 'worked_example' || (
    explanation.trim().length > 0
    && cases.every((eventCase) => {
      const caseEffects = effects[eventCase.id] ?? {};
      const caseAmounts = accountAmounts[eventCase.id] ?? {};
      const caseTotals = totals[eventCase.id] ?? {};
      return eventCase.accountRows.every((row) => typeof caseEffects[row.id] === 'string')
        && eventCase.accountRows.every((row) => {
          const value = caseAmounts[row.id];
          return value !== undefined
            && value.trim() !== ''
            && Number.isFinite(Number(value))
            && Number(value) >= 0;
        })
        && ['assets', 'liabilities', 'equity'].every((term) => {
          const value = caseTotals[term];
          return value !== undefined && value.trim() !== '' && Number.isFinite(Number(value));
        })
        && differences[eventCase.id]?.trim() !== ''
        && Number.isFinite(Number(differences[eventCase.id]));
    })
  );

  const buildEnvelope = () => {
    if (mode === 'worked_example') {
      return buildPracticeSubmissionEnvelope({
        activityId, mode, status: 'submitted', attemptNumber: 1,
        answers: {}, parts: [],
        artifact: { kind: 'accounting-equation-event-acknowledgement' },
      });
    }
    const answers: Record<string, unknown> = {};
    const parts: PracticeSubmissionEnvelope['parts'] = [];
    for (const eventCase of cases) {
      const caseEffects = effects[eventCase.id] ?? {};
      const caseAmounts = accountAmounts[eventCase.id] ?? {};
      const caseTotals = totals[eventCase.id] ?? {};
      const prefix = eventCase.id;
      const values = {
        [`${prefix}.account_effects`]: caseEffects,
        [`${prefix}.account_amounts`]: Object.fromEntries(
          Object.entries(caseAmounts).map(([accountId, amount]) => [accountId, Number(amount)]),
        ),
        [`${prefix}.ending_assets`]: Number(caseTotals.assets),
        [`${prefix}.ending_liabilities`]: Number(caseTotals.liabilities),
        [`${prefix}.ending_equity`]: Number(caseTotals.equity),
        [`${prefix}.equation_difference`]: Number(differences[eventCase.id]),
      };
      Object.assign(answers, values);
      for (const [partId, rawAnswer] of Object.entries(values)) {
        parts.push({
          partId,
          rawAnswer,
          ...(hintCounts[eventCase.id] ? { hintsUsed: hintCounts[eventCase.id] } : {}),
        });
      }
    }
    answers.explanation = explanation;
    parts.push({ partId: 'explanation', rawAnswer: explanation });
    return buildPracticeSubmissionEnvelope({
      activityId, mode, status: 'submitted', attemptNumber: 1,
      answers, parts,
      artifact: {
        kind: 'accounting-equation-event-analysis',
        cases: cases.map((eventCase) => ({
          id: eventCase.id,
          eventNarrative: eventCase.eventNarrative,
          eventAmount: eventCase.eventAmount,
          startingTotals: eventCase.startingTotals,
          accountEffects: effects[eventCase.id] ?? {},
          accountAmounts: accountAmounts[eventCase.id] ?? {},
          endingTotals: totals[eventCase.id] ?? {},
          equationDifference: differences[eventCase.id] ?? '',
        })),
        explanation,
      },
    });
  };

  const save = async () => {
    if (savingRef.current || saved) return;
    const envelope = pendingEnvelopeRef.current ?? buildEnvelope();
    pendingEnvelopeRef.current = envelope;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSubmit(envelope);
      pendingEnvelopeRef.current = null;
      setSaved(true);
      onComplete?.();
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  if (mode === 'worked_example') {
    const eventCase = cases[0]!;
    return (
      <Card className="w-full border-primary/30">
        <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <p>{eventCase.eventNarrative}</p>
          <p className="font-mono">{eventCase.startingTotals.assets} = {eventCase.startingTotals.liabilities} + {eventCase.startingTotals.equity}</p>
          <ul className="space-y-1">
            {eventCase.accountRows.map((row) => (
              <li key={row.id}>
                {row.label}: {eventCase.workedSolution?.accountEffects[row.id]} by {eventCase.eventAmount}
              </li>
            ))}
          </ul>
          <p>{eventCase.workedSolution?.explanation}</p>
          <p className="font-mono">{eventCase.workedSolution?.equation}</p>
          {saveError && <p role="alert" className="text-destructive">Your response could not be saved. Try again.</p>}
          <Button disabled={isSaving || saved} onClick={() => void save()}>{saveError ? 'Try again' : 'Continue'}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2"><h2 className="font-serif text-2xl font-semibold">{title}</h2><p>{description}</p></header>
      {cases.map((eventCase) => {
        const hintCount = hintCounts[eventCase.id] ?? 0;
        return (
          <section key={eventCase.id} className="space-y-4 rounded-lg border bg-card p-4">
            <h3 className="font-serif text-xl font-semibold">{eventCase.eventNarrative}</h3>
            <p className="font-mono text-sm">Event amount: {eventCase.eventAmount}</p>
            <SelectionMatrix
              title="Account effects"
              description="Select the direction for each affected account."
              rows={eventCase.accountRows.map((row) => ({ id: row.id, label: row.label, description: row.category }))}
              columns={directionColumns}
              mode={mode}
              value={effects[eventCase.id] ?? {}}
              readOnly={isSaving || saveError || saved}
              onValueChange={(value) => setEffects((current) => ({ ...current, [eventCase.id]: value }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <p className="text-sm text-muted-foreground sm:col-span-2">
                Enter a positive change amount or zero. Choose the direction separately.
              </p>
              {eventCase.accountRows.map((row) => (
                <label key={row.id} className="block space-y-1 font-medium">
                  {row.label} change amount
                  <Input
                    aria-label={`${eventCase.id} ${row.label} amount`}
                    type="number"
                    min={0}
                    inputMode="decimal"
                    disabled={isSaving || saveError || saved}
                    value={accountAmounts[eventCase.id]?.[row.id] ?? ''}
                    onChange={(event) => setAccountAmounts((current) => ({
                      ...current,
                      [eventCase.id]: { ...current[eventCase.id], [row.id]: event.target.value },
                    }))}
                  />
                </label>
              ))}
            </div>
            <AccountingEquationLayout
              title="Ending accounting equation"
              facts={[
                { id: 'assets', label: 'Starting Assets', value: eventCase.startingTotals.assets },
                { id: 'liabilities', label: 'Starting Liabilities', value: eventCase.startingTotals.liabilities },
                { id: 'equity', label: 'Starting Equity', value: eventCase.startingTotals.equity },
              ]}
              terms={{
                assets: { id: 'assets', label: 'Ending Assets', editable: true },
                liabilities: { id: 'liabilities', label: 'Ending Liabilities', editable: true },
                equity: { id: 'equity', label: 'Ending Equity', editable: true },
              }}
              mode={mode}
              readOnly={isSaving || saveError || saved}
              values={totals[eventCase.id] ?? {}}
              onValueChange={(value) => setTotals((current) => ({ ...current, [eventCase.id]: value }))}
            />
            <label className="block space-y-1 font-medium">
              Equation difference (Assets − Liabilities − Equity)
              <Input
                aria-label={`${eventCase.id} equation difference`}
                inputMode="decimal"
                disabled={isSaving || saveError || saved}
                value={differences[eventCase.id] ?? ''}
                onChange={(event) => setDifferences((current) => ({ ...current, [eventCase.id]: event.target.value }))}
              />
            </label>
            {mode === 'guided_practice' && eventCase.guidedHints && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSaving || saveError || saved || hintCount >= eventCase.guidedHints.length}
                  onClick={() => setHintCounts((current) => ({ ...current, [eventCase.id]: hintCount + 1 }))}
                >Use hint</Button>
                {eventCase.guidedHints.slice(0, hintCount).map((hint) => <p key={hint}>{hint}</p>)}
              </div>
            )}
          </section>
        );
      })}
      <label className="block space-y-1 font-medium">
        Explanation
        <textarea
          aria-label="Explanation"
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2"
          value={explanation}
          disabled={isSaving || saveError || saved}
          onChange={(event) => setExplanation(event.target.value)}
        />
      </label>
      {saveError && <p role="alert" className="text-destructive">Your response could not be saved. Try again.</p>}
      <Button disabled={!responseIsComplete || isSaving || saved} onClick={() => void save()}>
        {saveError ? 'Try again' : 'Submit event analysis'}
      </Button>
    </div>
  );
}
