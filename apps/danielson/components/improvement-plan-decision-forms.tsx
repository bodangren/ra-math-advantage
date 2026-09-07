'use client';

import { useRouter } from 'next/navigation';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';

function newRequestId(prefix: string) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}`;
}

function DecisionForm({
  action,
  children,
  confirmed,
  setConfirmed,
  disabled,
  command,
}: {
  action: 'Approve' | 'Close';
  children: ReactNode;
  confirmed: boolean;
  setConfirmed: (value: boolean) => void;
  disabled?: boolean;
  command: (requestId: string) => { path: string; body: Record<string, unknown> };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    requestIdRef.current ??= newRequestId(`pip-${action.toLowerCase()}`);
    const request = command(requestIdRef.current);
    try {
      const response = await fetch(request.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        requestIdRef.current = null;
        setError(result.error ?? `The plan ${action.toLowerCase()} action failed.`);
        return;
      }
      setSaved(true);
      router.refresh();
      requestIdRef.current = null;
    } catch {
      setError(`The plan ${action.toLowerCase()} action failed.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-stack compact-form" onSubmit={submit}>
      {error ? <div className="error-summary" role="alert" tabIndex={-1} ref={errorRef}>{error}</div> : null}
      {saved ? <p role="status">Plan {action.toLowerCase()} action recorded.</p> : null}
      {children}
      <label className="checkbox-row">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
        {action === 'Approve'
          ? 'I confirm that this plan can start.'
          : 'I confirm this closure outcome.'}
      </label>
      <button type="submit" disabled={!confirmed || pending || disabled || saved}>
        {pending ? `${action}…` : `${action} plan`}
      </button>
    </form>
  );
}

export function ImprovementPlanDecisionForms({
  planId,
  versionId,
  revision,
  state,
  canApprove,
  canClose,
}: {
  planId: string;
  versionId: string;
  revision: number;
  state: 'proposed' | 'active' | 'closed';
  canApprove: boolean;
  canClose: boolean;
}) {
  const [approveConfirmed, setApproveConfirmed] = useState(false);
  const [closeConfirmed, setCloseConfirmed] = useState(false);
  const [outcome, setOutcome] = useState<'successful' | 'insufficient_improvement'>('successful');
  const [note, setNote] = useState('');
  return (
    <div className="decision-grid">
      {state === 'proposed' && canApprove ? (
        <section className="card" aria-labelledby="pip-approval-heading">
          <h2 id="pip-approval-heading">SLT approval</h2>
          <p>Approval starts the plan and freezes this version.</p>
          <DecisionForm
            action="Approve"
            confirmed={approveConfirmed}
            setConfirmed={setApproveConfirmed}
            command={(requestId) => ({
              path: `/api/improvement-plans/${encodeURIComponent(planId)}/approval`,
              body: {
                planId,
                versionId,
                expectedRevision: revision,
                requestId,
              },
            })}
          >
            <p>No proficiency score changes until approval succeeds.</p>
          </DecisionForm>
        </section>
      ) : null}
      {state === 'active' && canClose ? (
        <section className="card" aria-labelledby="pip-closure-heading">
          <h2 id="pip-closure-heading">SLT closure</h2>
          <DecisionForm
            action="Close"
            confirmed={closeConfirmed}
            setConfirmed={setCloseConfirmed}
            disabled={note.trim().length === 0}
            command={(requestId) => ({
              path: `/api/improvement-plans/${encodeURIComponent(planId)}/closure`,
              body: {
                planId,
                expectedRevision: revision,
                requestId,
                outcome,
                note,
              },
            })}
          >
            <fieldset>
              <legend>Closure outcome</legend>
              <label><input type="radio" name={`pip-outcome-${planId}`} checked={outcome === 'successful'} onChange={() => setOutcome('successful')} /> Successful</label>
              <label><input type="radio" name={`pip-outcome-${planId}`} checked={outcome === 'insufficient_improvement'} onChange={() => setOutcome('insufficient_improvement')} /> Insufficient improvement</label>
            </fieldset>
            <div className="field">
              <label htmlFor={`pip-closure-note-${planId}`}>Closure note</label>
              <textarea id={`pip-closure-note-${planId}`} value={note} required maxLength={4_000} rows={4} onChange={(event) => setNote(event.target.value)} />
            </div>
          </DecisionForm>
        </section>
      ) : null}
    </div>
  );
}
