'use client';

import { useRef, useState } from 'react';

type Candidate = {
  classId: string;
  studentId: string;
  submissionId: string;
  className: string;
  studentName: string;
  lessonTitle: string;
  answer: string;
  score: number;
  maxScore: number;
  submittedAt: number;
};

export function TranslationExposureForm({ candidates }: { candidates: Candidate[] }) {
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const requestKey = useRef<{ identity: string; value: string } | null>(null);
  const [pending, setPending] = useState(false);
  const available = candidates.filter(candidate => !confirmedIds.includes(candidate.submissionId));
  const selected = available.find(candidate => candidate.submissionId === selectedId) ?? available[0];

  async function submit() {
    if (pending || !selected) return;
    const body = JSON.stringify({
      classId: selected.classId,
      studentId: selected.studentId,
      submissionId: selected.submissionId,
    });
    if (requestKey.current?.identity !== body) {
      requestKey.current = { identity: body, value: crypto.randomUUID() };
    }
    setPending(true);
    setMessage('');
    try {
      const response = await fetch('/api/teacher/translation-exposure', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'Idempotency-Key': requestKey.current.value },
        body,
      });
      if (!response.ok) throw new Error('Save failed');
      requestKey.current = null;
      setConfirmedIds(current => [...current, selected.submissionId]);
      setMessage('Instruction confirmed.');
    } catch {
      setMessage('Instruction could not be saved. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-8 space-y-3">
      <h2 className="text-xl font-display">Confirm guided instruction</h2>
      {selected ? (
        <form onSubmit={event => { event.preventDefault(); void submit(); }} className="space-y-3">
          <p>Confirm only if you taught this skill to the selected student.</p>
          <label className="block">
            Guided submission
            <select
              className="input-field block"
              value={selected.submissionId}
              disabled={pending}
              onChange={event => {
                setSelectedId(event.target.value);
                setMessage('');
              }}
            >
              {available.map(candidate => (
                <option key={`${candidate.classId}-${candidate.submissionId}`} value={candidate.submissionId}>
                  {candidate.className}: {candidate.studentName}, {candidate.lessonTitle}
                </option>
              ))}
            </select>
          </label>
          <p>Student answer: {selected.answer}</p>
          <p>Score: {selected.score}/{selected.maxScore}</p>
          <p>Submitted: <time dateTime={new Date(selected.submittedAt).toISOString()}>{new Date(selected.submittedAt).toISOString()}</time></p>
          <button className="btn-primary" type="submit" disabled={pending}>
            {pending ? 'Saving instruction…' : 'Confirm instruction'}
          </button>
        </form>
      ) : <p>No Guided submissions are ready for review.</p>}
      <p role="status">{message}</p>
    </section>
  );
}
