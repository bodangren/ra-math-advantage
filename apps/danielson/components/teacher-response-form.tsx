'use client';

import { useRouter } from 'next/navigation';

import { useEffect, useRef, useState, type FormEvent } from 'react';

export function TeacherResponseForm({ observationId }: { observationId: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError('');
    setPending(true);
    const form = new FormData(formElement);
    try {
      const response = await fetch('/api/reports/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observationId, content: form.get('content') }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'The response was not submitted.');
        return;
      }
      setSubmitted(true);
      router.refresh();
    } catch {
      setError('The response was not submitted.');
    } finally {
      setPending(false);
    }
  }

  if (submitted) return <p className="status-message" role="status">Final response submitted.</p>;
  return (
    <form className="form-stack compact-form" onSubmit={submit}>
      {error ? <div className="error-summary" role="alert" tabIndex={-1} ref={errorRef}>{error}</div> : null}
      <div className="field">
        <label htmlFor={`teacher-response-${encodeURIComponent(observationId)}`}>
          Optional final response
        </label>
        <textarea
          id={`teacher-response-${encodeURIComponent(observationId)}`}
          name="content"
          required
          maxLength={4_000}
          rows={5}
        />
      </div>
      <button type="submit" disabled={pending}>
        {pending ? 'Submitting…' : 'Submit final response'}
      </button>
    </form>
  );
}
