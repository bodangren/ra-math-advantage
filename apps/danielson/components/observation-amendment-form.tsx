'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type AmendmentItem = {
  itemId: string;
  label: string;
  evidenceNote: string | null;
};

export function ObservationAmendmentForm({
  observationId,
  expectedVersion,
  items,
}: {
  observationId: string;
  expectedVersion: number;
  items: AmendmentItem[];
}) {
  const router = useRouter();
  const idempotencyKey = useRef(crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const changedItems = items.flatMap((item) => {
      const outcome = String(form.get(`outcome:${item.itemId}`) ?? 'unchanged');
      const changeNote = form.get(`change-note:${item.itemId}`) === 'on';
      if (outcome === 'unchanged' && !changeNote) return [];
      return [{
        itemId: item.itemId,
        ...(outcome === 'unchanged'
          ? {}
          : outcome === 'not_enough_evidence'
            ? { outcome: { kind: 'not_enough_evidence' } }
            : { outcome: { kind: 'rated', rating: Number(outcome) } }),
        ...(changeNote ? { evidenceNote: String(form.get(`note:${item.itemId}`) ?? '').trim() || null } : {}),
      }];
    });
    if (changedItems.length === 0) {
      setError('Select at least one change.');
      return;
    }
    try {
      const response = await fetch(`/api/observations/records/${encodeURIComponent(observationId)}/amend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedVersion,
          idempotencyKey: idempotencyKey.current,
          reason: String(form.get('reason') ?? ''),
          changedItems,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'The amendment could not be saved.');
        return;
      }
      router.push(`/observations/records/${encodeURIComponent(observationId)}`);
      router.refresh();
    } catch {
      setError('The amendment could not be saved.');
    }
  }

  return (
    <form className="form-stack observation-form" onSubmit={submit}>
      {error ? <div className="error-summary" role="alert" tabIndex={-1} ref={errorRef}>{error}</div> : null}
      <div className="field">
        <label htmlFor="amendment-reason">Reason for amendment</label>
        <textarea id="amendment-reason" name="reason" rows={3} required />
      </div>
      {items.map((item) => (
        <fieldset className="card observation-target" key={item.itemId}>
          <legend>{item.label}</legend>
          <div className="field">
            <label htmlFor={`outcome-${item.itemId}`}>Outcome change</label>
            <select id={`outcome-${item.itemId}`} name={`outcome:${item.itemId}`} defaultValue="unchanged">
              <option value="unchanged">No outcome change</option>
              <option value="1">Rating 1</option>
              <option value="2">Rating 2</option>
              <option value="3">Rating 3</option>
              <option value="4">Rating 4</option>
              <option value="not_enough_evidence">Not enough evidence</option>
            </select>
          </div>
          <label className="checkbox-label">
            <input type="checkbox" name={`change-note:${item.itemId}`} /> Replace evidence note
          </label>
          <div className="field">
            <label htmlFor={`note-${item.itemId}`}>Replacement evidence note</label>
            <textarea id={`note-${item.itemId}`} name={`note:${item.itemId}`} rows={3} defaultValue={item.evidenceNote ?? ''} />
          </div>
        </fieldset>
      ))}
      <button type="submit">Save amendment</button>
    </form>
  );
}
