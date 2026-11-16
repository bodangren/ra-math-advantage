'use client';

import { useRouter } from 'next/navigation';

import { useEffect, useRef, useState, type FormEvent } from 'react';

export function ImprovementPlanAcknowledgmentForm({
  planId,
  versionId,
  expectedRevision,
  kind = 'teacher',
}: {
  planId: string;
  versionId: string;
  expectedRevision: number;
  kind?: 'teacher' | 'supervisor';
}) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
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
    try {
      requestIdRef.current ??= globalThis.crypto?.randomUUID?.() ?? `pip-ack-${Date.now()}`;
      const response = await fetch(`/api/improvement-plans/${encodeURIComponent(planId)}/acknowledgments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          versionId,
          expectedRevision,
          kind,
          requestId: requestIdRef.current,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        requestIdRef.current = null;
        setError(result.error ?? 'The acknowledgment was not saved.');
        return;
      }
      setSaved(true);
      router.refresh();
      requestIdRef.current = null;
    } catch {
      setError('The acknowledgment was not saved.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-stack compact-form" onSubmit={submit}>
      {error ? <div className="error-summary" role="alert" tabIndex={-1} ref={errorRef}>{error}</div> : null}
      {saved ? <p role="status">Acknowledgment recorded.</p> : null}
      <p>This acknowledgment records receipt. It is not a legal digital signature.</p>
      <label className="checkbox-row">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
        I confirm that I reviewed this plan.
      </label>
      <button type="submit" disabled={!confirmed || pending || saved}>
        {pending ? 'Saving…' : 'Acknowledge plan'}
      </button>
    </form>
  );
}
