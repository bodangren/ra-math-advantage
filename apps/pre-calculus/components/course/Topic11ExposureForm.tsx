'use client';

import { useRef, useState } from 'react';

type Props = {
  studentId: string;
  studentName: string;
  submissionId: string;
  lessonTitle: string;
  submittedAt: number;
  teacherConfirmed?: boolean;
  classes: { id: string; name: string }[];
};

export function Topic11ExposureForm({ studentId, studentName, submissionId, lessonTitle, submittedAt, classes, teacherConfirmed = false }: Props) {
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef(false);
  return <section className="my-4 rounded-panel border border-subtle p-4">
    <h4>Unit 1 Topic 1.1: {lessonTitle}</h4>
    <p>{studentName}</p>
    <p>Worked example: Intervals of increase and decrease</p>
    <p>Submitted: <time dateTime={new Date(submittedAt).toISOString()}>{new Date(submittedAt).toLocaleString()}</time></p>
    {confirmed || teacherConfirmed ? <p role="status">Classroom introduction confirmed.</p> : <>
      <p>Student acknowledgement saved. Teacher confirmation is pending.</p>
      {classes.length === 0 ? <p>No active class has this lesson assigned.</p> : <form className="mt-3 grid gap-3" onSubmit={async event => {
        event.preventDefault();
        if (pending.current) return;
        const classId = new FormData(event.currentTarget).get('classId');
        pending.current = true;
        setSaving(true);
        setError(false);
        try {
          const response = await fetch('/api/teacher/course', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'recordTopic11Exposure', classId, studentId, submissionId }),
          });
          if (!response.ok) throw new Error('Confirmation failed');
          setConfirmed(true);
        } catch {
          setError(true);
        } finally {
          pending.current = false;
          setSaving(false);
        }
      }}>
        <label>Class<select name="classId" className="input-field w-full" disabled={saving} required>
          {classes.map(classroom => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
        </select></label>
        <p>Confirm only if you taught this skill to this student in the selected class.</p>
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Confirm classroom introduction'}</button>
        {error && <p role="alert">Could not save the confirmation. Try again.</p>}
      </form>}
    </>}
  </section>;
}
