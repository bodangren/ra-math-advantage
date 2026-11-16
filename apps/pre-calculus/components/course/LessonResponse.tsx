'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function LessonResponse({ phaseId }: { phaseId: string }) {
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  return <form className="mt-6 grid gap-3" onSubmit={async event => {
    event.preventDefault(); if (saving) return; setSaving(true); setStatus('');
    try {
      const result = await fetch('/api/course/response', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phaseId, response }) });
      if (!result.ok) throw new Error('Could not save your response. Try again.');
      setResponse(''); setStatus('Response saved for teacher review.'); router.refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not save.'); }
    finally { setSaving(false); }
  }}>
    <label htmlFor={`response-${phaseId}`}>Your work and explanation</label>
    <textarea id={`response-${phaseId}`} className="input-field min-h-32" required maxLength={10000} value={response} onChange={event => setResponse(event.target.value)} />
    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Submit response'}</button>
    <p role="status">{status}</p>
  </form>;
}
