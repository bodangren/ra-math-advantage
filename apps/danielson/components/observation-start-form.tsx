'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

function currentSchoolYear(): string {
  const now = new Date();
  const start = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}-${start + 1}`;
}

export function ObservationStartForm({
  teacherProfileId,
  components,
}: {
  teacherProfileId: string;
  components: Array<{ value: string; label: string }>;
}) {
  const router = useRouter();
  const [type, setType] = useState<'walkthrough' | 'formal_q1' | 'formal_q4'>('walkthrough');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      const observedAt = String(form.get('observedAt') ?? '');
      const componentId = String(form.get('componentId') ?? '');
      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherProfileId,
          observationType: type,
          schoolYear: String(form.get('schoolYear') ?? ''),
          observedAt: new Date(observedAt).toISOString(),
          ...(type === 'walkthrough' ? {} : { componentIds: [componentId] }),
        }),
      });
      const result = await response.json() as { draft?: { draftId?: string }; error?: string };
      if (!response.ok || !result.draft?.draftId) {
        setError(result.error ?? 'The draft could not be created.');
        setBusy(false);
        return;
      }
      router.push(`/observations/drafts/${encodeURIComponent(result.draft.draftId)}`);
    } catch {
      setError('The draft could not be created.');
      setBusy(false);
    }
  }

  return (
    <form className="form-stack compact-form" onSubmit={submit}>
      <div className="field">
        <label htmlFor={`type-${teacherProfileId}`}>Observation type</label>
        <select id={`type-${teacherProfileId}`} value={type} onChange={(event) => setType(event.currentTarget.value as typeof type)}>
          <option value="walkthrough">Walkthrough</option>
          <option value="formal_q1">Quarter 1 formal</option>
          <option value="formal_q4">Quarter 4 formal</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor={`year-${teacherProfileId}`}>School year</label>
        <input id={`year-${teacherProfileId}`} name="schoolYear" defaultValue={currentSchoolYear()} pattern="\d{4}-\d{4}" required />
      </div>
      <div className="field">
        <label htmlFor={`observed-${teacherProfileId}`}>Observation time</label>
        <input id={`observed-${teacherProfileId}`} name="observedAt" type="datetime-local" required />
      </div>
      {type !== 'walkthrough' ? (
        <div className="field">
          <label htmlFor={`component-${teacherProfileId}`}>Danielson component</label>
          <select id={`component-${teacherProfileId}`} name="componentId" required>
            {components.map((component) => <option value={component.value} key={component.value}>{component.label}</option>)}
          </select>
        </div>
      ) : null}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <button type="submit" disabled={busy}>{busy ? 'Creating draft…' : 'Start observation'}</button>
    </form>
  );
}
