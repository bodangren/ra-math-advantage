'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ObservationForm } from './observation-form';

type Draft = Parameters<typeof ObservationForm>[0]['draft'];
type SaveCommand = Parameters<Parameters<typeof ObservationForm>[0]['onSave']>[0];
type SubmitCommand = Parameters<Parameters<typeof ObservationForm>[0]['onSubmit']>[0];

export function ObservationDraftClient({ draft }: { draft: Draft }) {
  const router = useRouter();
  const submissionKey = useRef(crypto.randomUUID());
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(command: SaveCommand) {
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/observations/drafts/${encodeURIComponent(draft.draftId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      const result = await response.json() as { draft?: { revision?: number }; error?: string };
      if (!response.ok) {
        setError(result.error ?? 'The draft could not be saved.');
        return {};
      }
      setMessage('Draft saved.');
      return { revision: result.draft?.revision };
    } catch {
      setError('The draft could not be saved.');
      return {};
    }
  }

  async function submit(command: SubmitCommand) {
    try {
      const saved = await save(command);
      if (saved.revision === undefined) return;
      const response = await fetch(`/api/observations/drafts/${encodeURIComponent(draft.draftId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedRevision: saved.revision,
          submissionKey: submissionKey.current,
        }),
      });
      const result = await response.json() as { receipt?: { observationId?: string }; error?: string };
      if (!response.ok || !result.receipt?.observationId) {
        throw new Error(result.error ?? 'The observation could not be submitted.');
      }
      router.push(`/observations/records/${encodeURIComponent(result.receipt.observationId)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The observation could not be submitted.');
    }
  }

  async function discard(command: { expectedRevision: number; confirmed: true }) {
    try {
      const response = await fetch(`/api/observations/drafts/${encodeURIComponent(draft.draftId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        setError(result.error ?? 'The draft could not be discarded.');
        return;
      }
      router.push('/observations');
    } catch {
      setError('The draft could not be discarded.');
    }
  }

  return (
    <>
      {message ? <p className="status-message" role="status">{message}</p> : null}
      {error ? <p className="error-summary" role="alert">{error}</p> : null}
      <ObservationForm draft={draft} onSave={save} onSubmit={submit} onDiscard={discard} />
    </>
  );
}
