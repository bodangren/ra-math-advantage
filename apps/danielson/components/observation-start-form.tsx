'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { ObservationType } from '@/lib/observations/observation-page';

const TYPE_LABELS: Record<ObservationType, string> = {
  walkthrough: 'Walkthrough',
  formal_q1: 'Quarter 1 formal',
  formal_q4: 'Quarter 4 formal',
};

function currentSchoolYear(): string {
  const now = new Date();
  const start = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}-${start + 1}`;
}

export function ObservationStartForm({
  teacherProfileId,
  teachers,
  components,
  permittedTypes,
}: {
  teacherProfileId?: string;
  teachers?: Array<{ teacherProfileId: string; displayName: string }>;
  components: Array<{ value: string; label: string }>;
  permittedTypes: ObservationType[];
}) {
  const router = useRouter();
  const [type, setType] = useState<ObservationType>(permittedTypes[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      const observedAt = String(form.get('observedAt') ?? '');
      const componentIds = form.getAll('componentIds').map(String);
      const selectedTeacherProfileId = teacherProfileId ?? String(form.get('teacherProfileId') ?? '');
      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherProfileId: selectedTeacherProfileId,
          observationType: type,
          schoolYear: String(form.get('schoolYear') ?? ''),
          observedAt: new Date(observedAt).toISOString(),
          ...(type === 'walkthrough' ? {} : { componentIds }),
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
        <label htmlFor={`type-${teacherProfileId ?? 'formal'}`}>Observation type</label>
        <select id={`type-${teacherProfileId ?? 'formal'}`} value={type} onChange={(event) => setType(event.currentTarget.value as typeof type)}>
          {permittedTypes.map((observationType) => (
            <option value={observationType} key={observationType}>{TYPE_LABELS[observationType]}</option>
          ))}
        </select>
      </div>
      {teachers ? (
        <div className="field">
          <label htmlFor="formal-teacher">Teacher</label>
          <select id="formal-teacher" name="teacherProfileId" required>
            {teachers.map((teacher) => (
              <option value={teacher.teacherProfileId} key={teacher.teacherProfileId}>{teacher.displayName}</option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor={`year-${teacherProfileId ?? 'formal'}`}>School year</label>
        <input id={`year-${teacherProfileId ?? 'formal'}`} name="schoolYear" defaultValue={currentSchoolYear()} pattern="\d{4}-\d{4}" required />
      </div>
      <div className="field">
        <label htmlFor={`observed-${teacherProfileId ?? 'formal'}`}>Observation time</label>
        <input id={`observed-${teacherProfileId ?? 'formal'}`} name="observedAt" type="datetime-local" required />
      </div>
      {type !== 'walkthrough' ? (
        <div className="field">
          <label htmlFor={`component-${teacherProfileId ?? 'formal'}`}>Danielson components</label>
          <p className="field-hint" id={`component-${teacherProfileId ?? 'formal'}-hint`}>Select all components that this formal observation covers.</p>
          <select
            id={`component-${teacherProfileId ?? 'formal'}`}
            name="componentIds"
            multiple
            size={6}
            required
            aria-describedby={`component-${teacherProfileId ?? 'formal'}-hint`}
          >
            {components.map((component) => <option value={component.value} key={component.value}>{component.label}</option>)}
          </select>
        </div>
      ) : null}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <button type="submit" disabled={busy}>{busy ? 'Creating draft…' : 'Start observation'}</button>
    </form>
  );
}
