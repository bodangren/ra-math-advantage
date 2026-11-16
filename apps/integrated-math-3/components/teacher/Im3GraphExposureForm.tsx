'use client';

import { useRef, useState } from 'react';

export type Im3GraphExposureCandidate = {
  classId: string; studentId: string; submissionId: string;
  className: string; studentName: string; lessonTitle: string;
  response: string; score: number | null; maxScore: number | null; submittedAt: number;
};

export function Im3GraphExposureForm({ candidates }: { candidates: Im3GraphExposureCandidate[] }) {
  const [selectedIdentity, setSelectedIdentity] = useState('');
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const retry = useRef<{ identity: string; key: string } | null>(null);
  const available = candidates.filter((candidate) => !confirmed.includes(candidate.submissionId));
  const candidateIdentity = (candidate: Im3GraphExposureCandidate) => JSON.stringify([candidate.classId, candidate.submissionId]);
  const selected = available.find((candidate) => candidateIdentity(candidate) === selectedIdentity) ?? available[0];

  async function submit() {
    if (!selected || pending) return;
    const body = JSON.stringify({ classId: selected.classId, studentId: selected.studentId, submissionId: selected.submissionId });
    if (retry.current?.identity !== body) retry.current = { identity: body, key: crypto.randomUUID() };
    setPending(true);
    setMessage('');
    try {
      const response = await fetch('/api/teacher/graph-exposure', {
        method: 'POST', headers: { 'content-type': 'application/json', 'Idempotency-Key': retry.current.key }, body,
      });
      if (!response.ok) throw new Error('save_failed');
      const receipt: unknown = await response.json();
      if (!receipt || typeof receipt !== 'object' || typeof (receipt as { evidenceId?: unknown }).evidenceId !== 'string' || (receipt as { evidenceId: string }).evidenceId.length === 0) {
        throw new Error('invalid_receipt');
      }
      retry.current = null;
      setConfirmed((current) => [...current, selected.submissionId]);
      setMessage('Instruction confirmed.');
    } catch {
      setMessage('Instruction could not be saved. Try again.');
    } finally {
      setPending(false);
    }
  }

  return <section className="card-workbook p-6 space-y-3" data-testid="im3-graph-exposure">
    <h3 className="text-lg font-semibold">Confirm graph instruction</h3>
    {selected ? <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="space-y-3">
      <label className="block">Source attempt
        <select className="input-field block" value={candidateIdentity(selected)} disabled={pending} onChange={(event) => { setSelectedIdentity(event.target.value); setMessage(''); }}>
          {available.map((candidate) => <option key={candidateIdentity(candidate)} value={candidateIdentity(candidate)}>{candidate.className}: {candidate.studentName}, {candidate.lessonTitle}</option>)}
        </select>
      </label>
      <p>Source: Graph <span className="font-mono-num">f(x) = x²</span> using a table.</p>
      <p>Submission status: {selected.score === null || selected.maxScore === null ? 'Worked example reviewed' : `${selected.score}/${selected.maxScore}`}</p>
      <p className="text-sm text-muted-foreground">Confirm that you taught this source. This action does not confirm student mastery.</p>
      <p>Submitted: <time dateTime={new Date(selected.submittedAt).toISOString()}>{new Date(selected.submittedAt).toISOString()}</time></p>
      <button type="submit" className="btn-primary" disabled={pending}>{pending ? 'Saving instruction…' : 'Confirm instruction'}</button>
    </form> : <p>No graph submissions are ready for review.</p>}
    <p role="status">{message}</p>
  </section>;
}
