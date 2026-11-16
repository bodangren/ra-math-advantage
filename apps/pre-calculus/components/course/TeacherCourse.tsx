'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topic11ExposureForm } from './Topic11ExposureForm';

type Classroom = { _id: string; name: string };
type Student = { id: string; name: string; username: string; responses: { _id: string; response: string; phaseTitle: string; lessonTitle: string; score?: number; maxScore?: number; feedback?: string }[]; competencies: { _id: string; standardId: string; masteryLevel: number }[]; submissions: { _id: string; score?: number; maxScore?: number; feedback?: string; stableActivityId?: string; submittedAt: number; topic11TeacherConfirmed?: boolean }[] };
export type Topic11TeacherCandidate = { learnerId: string; learnerName: string; submissionId: string; acknowledgedAt: number; lessonLabel: string; classChoices: { classId: string; className: string }[] };
export type TeacherData = { standards: { _id: string; code: string; description: string }[]; enrollments: { _id: string; classId: string; studentId: string; status: string; enrolledAt: number }[]; classes: Classroom[]; students: Student[]; lessons: { _id: string; title: string; unitNumber: number; orderIndex: number }[]; assignments: { _id: string; classId: string; lessonId: string; assignedAt: number }[] };
function ActionForm({ action, children }: { action: string; children: React.ReactNode }) {
  const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false); const router = useRouter();
  return <form className="grid gap-3 my-4" onSubmit={async event => {
    event.preventDefault(); if (saving) return; setSaving(true); setMessage('');
    const body: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget)); body.action = action;
    if (action === 'recordCompetency') body.masteryLevel = Number(body.masteryLevel);
    if (action === 'gradeResponse') { body.score = Number(body.score); body.maxScore = Number(body.maxScore); }
    try { const response = await fetch('/api/teacher/course', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error((await response.json()).error ?? 'Could not save.'); setMessage('Saved.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save.'); } finally { setSaving(false); }
  }}>{children}<button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button><p role="status">{message}</p></form>;
}
export function TeacherCourse({ data, topic11Candidates, gradebook = false }: { data: TeacherData; topic11Candidates: Topic11TeacherCandidate[]; gradebook?: boolean }) {
  const classSelect = <label>Class<select aria-label="Class" name="classId" className="input-field w-full" required>{data.classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>;
  return <div className="grid gap-6">
    <section><h2>Topic 1.1 classroom introductions</h2>
      {topic11Candidates.length === 0 && <p>No Topic 1.1 classroom introductions are waiting for confirmation.</p>}
      {topic11Candidates.map(candidate => <Topic11ExposureForm key={candidate.submissionId} studentId={candidate.learnerId} studentName={candidate.learnerName}
        submissionId={candidate.submissionId} lessonTitle={candidate.lessonLabel} submittedAt={candidate.acknowledgedAt}
        classes={candidate.classChoices.map(classroom => ({ id: classroom.classId, name: classroom.className }))} />)}
    </section>
    {!gradebook && <>
      <section><h2>Create a class</h2><ActionForm action="createClass"><label>Class name<input className="input-field w-full" name="name" required maxLength={100} /></label></ActionForm></section>
      {data.classes.length > 0 && <>
        <section><h2>Enroll a student</h2><p>Enter an existing student username in your organization.</p><ActionForm action="enrollStudent">{classSelect}<label>Student username<input className="input-field w-full" name="username" required maxLength={255} /></label></ActionForm></section>
        <section><h2>Assign a lesson</h2><ActionForm action="assignLesson">{classSelect}<label>Lesson<select aria-label="Lesson" className="input-field w-full" name="lessonId" required>{data.lessons.map(l => <option key={l._id} value={l._id}>{l.unitNumber}.{l.orderIndex} {l.title}</option>)}</select></label></ActionForm>
          <ul>{data.assignments.map(a => <li key={a._id}>{data.classes.find(c => c._id === a.classId)?.name}: {data.lessons.find(l => l._id === a.lessonId)?.title}</li>)}</ul>
        </section>
      </>}
    </>}
    <section><h2>{gradebook ? 'Student work and grades' : 'Class roster'}</h2>
      {data.students.length === 0 && <p>No students are enrolled in your active classes.</p>}
      {data.students.map(student => <details key={student.id} className="border border-subtle rounded-panel p-4 my-3"><summary>{student.name} ({student.username}) — {student.responses.length} lesson responses</summary>
        {student.responses.map(response => <article key={response._id} className="border-t border-subtle mt-4 pt-4"><h3>{response.lessonTitle}: {response.phaseTitle}</h3><p className="whitespace-pre-wrap">{response.response}</p>
          <p>{response.score === undefined ? 'Awaiting review' : `Score: ${response.score}/${response.maxScore}`}</p>
          <ActionForm action="gradeResponse"><input type="hidden" name="responseId" value={response._id} />
            <label>Score<input className="input-field w-full" name="score" type="number" min="0" step="any" defaultValue={response.score ?? 0} required /></label>
            <label>Maximum score<input className="input-field w-full" name="maxScore" type="number" min="0.01" step="any" defaultValue={response.maxScore ?? 4} required /></label>
            <label>Feedback<textarea className="input-field w-full" name="feedback" maxLength={5000} defaultValue={response.feedback ?? ''} /></label>
          </ActionForm>
        </article>)}
        <h3 className="mt-4">Class enrollment</h3>
        {data.enrollments.filter(e => e.studentId === student.id).map(enrollment => <ActionForm key={enrollment._id} action="setEnrollmentStatus">
          <p>{data.classes.find(c => c._id === enrollment.classId)?.name}</p><input type="hidden" name="enrollmentId" value={enrollment._id} />
          <label>Enrollment status<select aria-label="Enrollment status" className="input-field w-full" name="status" defaultValue={enrollment.status}><option value="active">Active</option><option value="withdrawn">Withdrawn</option></select></label>
        </ActionForm>)}
        <h3 className="mt-4">Competency review</h3>
        <ul>{student.competencies.map(c => <li key={c._id}>{data.standards.find(s => s._id === c.standardId)?.code}: {c.masteryLevel}/4</li>)}</ul>
        <ActionForm action="recordCompetency"><input type="hidden" name="studentId" value={student.id} />
          <label>Standard<select aria-label="Standard" className="input-field w-full" name="standardId" required>{data.standards.map(s => <option key={s._id} value={s._id}>{s.code}: {s.description}</option>)}</select></label>
          <label>Mastery level (0 to 4)<input className="input-field w-full" type="number" name="masteryLevel" min="0" max="4" step="1" required /></label>
        </ActionForm>
        <h3 className="mt-4">Practice results</h3><ul>{student.submissions.map(s => <li key={s._id}>{s.stableActivityId ?? 'Practice'}: {s.score ?? 'Ungraded'}/{s.maxScore ?? '—'} {s.feedback}</li>)}</ul>
        <p className="text-sm mt-4">Shows the latest 100 lesson responses and 100 practice submissions.</p>
      </details>)}
    </section>
  </div>;
}
