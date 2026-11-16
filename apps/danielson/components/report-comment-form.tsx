'use client';

import { useRouter } from 'next/navigation';

import { useEffect, useRef, useState, type FormEvent } from 'react';

export function ReportCommentForm({
  observationId,
  commentType,
}: {
  observationId: string;
  commentType: 'public' | 'private';
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const label = commentType === 'public' ? 'Public comment' : 'Private comment';
  const fieldId = `${commentType}-comment-${encodeURIComponent(observationId)}`;

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError('');
    setSaved(false);
    setPending(true);
    const form = new FormData(formElement);
    try {
      const response = await fetch(`/api/reports/comments/${commentType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observationId, content: form.get('content') }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'The comment was not saved.');
        return;
      }
      formElement.reset();
      setSaved(true);
      router.refresh();
    } catch {
      setError('The comment was not saved.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-stack compact-form" onSubmit={submit}>
      {error ? <div className="error-summary" role="alert" tabIndex={-1} ref={errorRef}>{error}</div> : null}
      {saved ? <p className="status-message" role="status">Comment added.</p> : null}
      <p>{commentType === 'public' ? 'The teacher can read this feedback. Describe what worked, the next action, and the support needed.' : 'Only authorized leadership can read this comment.'}</p>
      <div className="field">
        <label htmlFor={fieldId}>{label}</label>
        <textarea id={fieldId} name="content" required maxLength={4_000} rows={4} />
      </div>
      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : `Add ${commentType} comment`}
      </button>
    </form>
  );
}
