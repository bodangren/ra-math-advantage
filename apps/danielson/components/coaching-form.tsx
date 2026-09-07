'use client';
import { useState, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { CoachingCycle, CoachingEvidence } from '@/lib/coaching/contracts';

export function CoachingForm({ teacherProfileId, cycle, isSelf = false, evidence, skills }: {
  teacherProfileId: string; cycle?: CoachingCycle; isSelf?: boolean;
  evidence: CoachingEvidence[]; skills: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [mode, setMode] = useState(cycle ? isSelf ? 'reflect' : 'revise' : 'create');
  const [skillId, setSkillId] = useState(cycle?.skillId ?? skills[0]?.id ?? '');
  const prefix = cycle?._id ?? 'new-cycle';
  const candidates = evidence.filter(row => row.items.some(item => item.skillId === skillId)
    && (mode !== 'complete' || (row.observationId !== cycle?.baselineObservationId && Date.parse(row.observedAt) > (cycle?.createdAt ?? 0))));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    const fields = Object.fromEntries(form.entries());
    try {
      const response = await fetch('/api/coaching', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, kind: mode, teacherProfileId, skillId,
          ...(cycle ? { cycleId: cycle._id, expectedRevision: cycle.revision } : {}) }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error ?? 'The cycle was not saved.'); setTimeout(() => errorRef.current?.focus(), 0); }
      else { setSaved(true); router.refresh(); }
    } catch { setMessage('The cycle was not saved. Check the connection and try again.'); }
    finally { setBusy(false); }
  }
  if (saved) return <p role="status">Coaching change saved. <button type="button" onClick={() => { setSaved(false); router.refresh(); }}>Continue</button></p>;
  return <form className="form-stack" onSubmit={submit}>
    <p>These coaching fields are visible to the teacher and authorized supervisors.</p>
    {message ? <p role="alert" tabIndex={-1} ref={errorRef}>{message}</p> : null}
    {cycle && !isSelf ? <><label htmlFor={`${prefix}-mode`}>Coaching action</label>
      <select id={`${prefix}-mode`} value={mode} onChange={e => setMode(e.target.value)}><option value="revise">Revise action and support</option><option value="complete">Complete evidence review</option></select></> : null}
    {mode === 'create' ? <><label htmlFor={`${prefix}-target`}>Target skill</label><select id={`${prefix}-target`} value={skillId} onChange={e => setSkillId(e.target.value)} required>
      {skills.map(skill => <option key={skill.id} value={skill.id}>{skill.title}</option>)}
    </select></> : null}
    {mode === 'create' || mode === 'revise' ? <>
      <label htmlFor={`${prefix}-action`}>Agreed teaching action</label><textarea id={`${prefix}-action`} name="action" defaultValue={cycle?.action} required maxLength={4000} />
      <label htmlFor={`${prefix}-support`}>School support and rehearsal</label><textarea id={`${prefix}-support`} name="support" defaultValue={cycle?.support} required maxLength={4000} />
      <label htmlFor={`${prefix}-date`}>Follow-up date</label><input id={`${prefix}-date`} name="followUpDate" type="date" defaultValue={cycle?.followUpDate} required />
    </> : null}
    {mode === 'create' || mode === 'complete' ? <>
      <label htmlFor={`${prefix}-evidence`}>{mode === 'create' ? 'Baseline observation' : 'Follow-up observation'}</label>
      <select id={`${prefix}-evidence`} name={mode === 'create' ? 'baselineObservationId' : 'followUpObservationId'} required defaultValue="">
        <option value="">Select evidence</option>{candidates.map(row => <option key={row.observationId} value={row.observationId}>{new Date(row.observedAt).toLocaleString()}</option>)}
      </select><p>Options use the evidence page below. Follow-up evidence must be collected after this cycle starts. Open the next evidence page if needed.</p>
    </> : null}
    {mode === 'reflect' ? <><label htmlFor={`${prefix}-reflection`}>Teacher reflection</label><textarea id={`${prefix}-reflection`} name="reflection" defaultValue={cycle?.reflection} required maxLength={4000} /><p>A reflection does not mean agreement with a rating.</p></> : null}
    {mode === 'complete' ? <><label htmlFor={`${prefix}-conclusion`}>Evidence review and next action</label><textarea id={`${prefix}-conclusion`} name="conclusion" required maxLength={4000} /><p>Describe the change and remaining gaps. Completion does not assign a proficiency rating.</p></> : null}
    {(mode === 'create' || mode === 'complete') && candidates.length === 0 ? <p>No eligible evidence on this page. Collect evidence for this target or open another evidence page.</p> : null}
    <button disabled={busy || ((mode === 'create' || mode === 'complete') && candidates.length === 0)}>{busy ? 'Saving…' : 'Save coaching cycle'}</button>
  </form>;
}
