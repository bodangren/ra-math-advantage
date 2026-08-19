'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { PIP_SOURCE_CONTRACT } from '@/lib/improvement-plans/source';

type TargetOption = {
  componentId: string;
  componentTitle: string;
  skillId: string;
  skillTitle: string;
};

function requestId() {
  return globalThis.crypto?.randomUUID?.() ?? `pip-${Date.now()}`;
}

export function ImprovementPlanProposalForm({
  teacherProfileId,
  teacherDisplayName,
  position,
  departmentId,
  departmentName,
  departmentOptions,
  targetOptions,
  planId = null,
  expectedRevision = 0,
  initial,
}: {
  teacherProfileId: string;
  teacherDisplayName: string;
  position: string;
  departmentId: string;
  departmentName: string;
  departmentOptions?: Array<{ departmentId: string; departmentName: string }>;
  targetOptions: TargetOption[];
  planId?: string | null;
  expectedRevision?: number;
  initial?: Partial<{
    requestedPlanEndDate: string | null;
    reviewMeetingDate: string;
    purpose: string;
    areasOfConcern: string;
    expectedStandard: string;
    requiredActions: string;
    evidenceOfImprovement: string;
    schoolSupport: string;
    successfulCompletionCriteria: string;
    targets: Array<{ skillId: string; expectedRating: number }>;
  }>;
}) {
  const departments = departmentOptions ?? [{ departmentId, departmentName }];
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(departmentId);
  const [rows, setRows] = useState(initial?.targets ?? [{ skillId: targetOptions[0]?.skillId ?? '', expectedRating: 3 }]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setSaved(false);
    setPending(true);
    const targets = rows.map((row) => {
      const option = targetOptions.find((candidate) => candidate.skillId === row.skillId);
      return {
        componentId: option?.componentId ?? '',
        skillId: row.skillId,
        expectedRating: row.expectedRating,
      };
    });
    try {
      requestIdRef.current ??= requestId();
      const response = await fetch('/api/improvement-plans/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherProfileId,
          planId,
          requestId: requestIdRef.current,
          expectedRevision,
          departmentId: selectedDepartmentId,
          requestedPlanEndDate: form.get('requestedPlanEndDate') || null,
          reviewMeetingDate: form.get('reviewMeetingDate'),
          purpose: form.get('purpose'),
          areasOfConcern: form.get('areasOfConcern'),
          expectedStandard: form.get('expectedStandard'),
          requiredActions: form.get('requiredActions'),
          evidenceOfImprovement: form.get('evidenceOfImprovement'),
          schoolSupport: form.get('schoolSupport'),
          successfulCompletionCriteria: form.get('successfulCompletionCriteria'),
          targets,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        requestIdRef.current = null;
        setError(result.error ?? 'The proposal was not saved.');
        return;
      }
      setSaved(true);
      requestIdRef.current = null;
    } catch {
      setError('The proposal was not saved.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      {error ? <div className="error-summary" role="alert" tabIndex={-1} ref={errorRef}>{error}</div> : null}
      {saved ? <p role="status" className="status-message">Proposal saved for SLT approval.</p> : null}
      <dl className="summary-list">
        <div><dt>Teacher</dt><dd>{teacherDisplayName}</dd></div>
        <div><dt>Position</dt><dd>{position}</dd></div>
        <div><dt>Department</dt><dd>{departments.find((item) => item.departmentId === selectedDepartmentId)?.departmentName ?? departmentName}</dd></div>
      </dl>
      {departments.length > 1 ? (
        <div className="field">
          <label htmlFor="pip-department">Department</label>
          <select id="pip-department" value={selectedDepartmentId} onChange={(event) => setSelectedDepartmentId(event.target.value)}>
            {departments.map((department) => (
              <option value={department.departmentId} key={department.departmentId}>{department.departmentName}</option>
            ))}
          </select>
        </div>
      ) : null}
      <fieldset>
        <legend>School values</legend>
        <p>{PIP_SOURCE_CONTRACT.schoolValues.join(' ')}</p>
        <p className="help-text">These values are not scored.</p>
      </fieldset>
      <div className="field">
        <label htmlFor="pip-end-date">Plan end date</label>
        <input id="pip-end-date" name="requestedPlanEndDate" type="date" defaultValue={initial?.requestedPlanEndDate ?? ''} />
      </div>
      <div className="field">
        <label htmlFor="pip-review-date">Review meeting date</label>
        <input id="pip-review-date" name="reviewMeetingDate" type="date" required defaultValue={initial?.reviewMeetingDate ?? ''} />
      </div>
      {[
        ['purpose', 'Purpose of the plan'],
        ['areasOfConcern', 'Areas of concern'],
        ['expectedStandard', 'Expected standard'],
        ['requiredActions', 'Required actions'],
        ['evidenceOfImprovement', 'Evidence of improvement'],
        ['schoolSupport', 'Support provided by the school'],
        ['successfulCompletionCriteria', 'Successful completion criteria'],
      ].map(([name, label]) => (
        <div className="field" key={name}>
          <label htmlFor={`pip-${name}`}>{label}</label>
          <textarea id={`pip-${name}`} name={name} required maxLength={4_000} rows={4} defaultValue={initial?.[name as keyof typeof initial] as string | undefined} />
        </div>
      ))}
      <fieldset>
        <legend>Danielson targets</legend>
        {rows.map((row, index) => (
          <div className="target-row" key={index}>
            <div className="field">
              <label htmlFor={`pip-target-${index}`}>{index === 0 ? 'Target skill' : `Target skill ${index + 1}`}</label>
              <select
                id={`pip-target-${index}`}
                value={row.skillId}
                required
                onChange={(event) => setRows((current) => current.map((item, itemIndex) => (
                  itemIndex === index ? { ...item, skillId: event.target.value } : item
                )))}
              >
                {targetOptions.map((option) => (
                  <option value={option.skillId} key={option.skillId}>
                    {option.skillTitle} — {option.componentTitle}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`pip-rating-${index}`}>{index === 0 ? 'Expected rating' : `Expected rating ${index + 1}`}</label>
              <select
                id={`pip-rating-${index}`}
                value={row.expectedRating}
                onChange={(event) => setRows((current) => current.map((item, itemIndex) => (
                  itemIndex === index ? { ...item, expectedRating: Number(event.target.value) } : item
                )))}
              >
                <option value={3}>3 — Proficient</option>
                <option value={4}>4 — Distinguished</option>
              </select>
            </div>
            {rows.length > 1 ? (
              <button type="button" className="button secondary" onClick={() => setRows((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                Remove target {index + 1}
              </button>
            ) : null}
          </div>
        ))}
        {rows.length < targetOptions.length && rows.length < 63 ? (
          <button type="button" className="button secondary" onClick={() => setRows((current) => [
            ...current,
            { skillId: targetOptions.find((option) => !current.some((row) => row.skillId === option.skillId))?.skillId ?? '', expectedRating: 3 },
          ])}>
            Add target
          </button>
        ) : null}
      </fieldset>
      <section className="card" aria-labelledby="pip-consequences-heading">
        <h2 id="pip-consequences-heading">Consequences of insufficient improvement</h2>
        <p>{PIP_SOURCE_CONTRACT.fixedText.insufficientImprovementConsequences}</p>
      </section>
      <section className="card" aria-labelledby="pip-acknowledgment-heading">
        <h2 id="pip-acknowledgment-heading">Acknowledgment</h2>
        <p>{PIP_SOURCE_CONTRACT.fixedText.acknowledgmentText}</p>
      </section>
      <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Propose plan'}</button>
    </form>
  );
}
