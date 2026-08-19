'use client';

import { useState } from 'react';
import Link from 'next/link';

import { ReportCommentForm } from '@/components/report-comment-form';
import { TeacherResponseForm } from '@/components/teacher-response-form';
import type {
  PrivateTeacherReport,
  PublicTeacherReport,
  ReportingState,
} from '@/lib/reporting/contracts';

function stateLabel(state: ReportingState) {
  if (state === 'below_proficient') return 'Below Proficient';
  if (state === 'not_enough_evidence') return 'Not enough evidence';
  return 'Proficient';
}

function outcomeLabel(outcome: { kind: string; rating?: number } | null) {
  if (!outcome || outcome.kind === 'not_enough_evidence') return 'Not enough evidence';
  return `Rating ${outcome.rating}`;
}

function dueLabel(skill: { due: boolean; dueAt: string | null; overdueDays: number }) {
  const dueAt = skill.dueAt === null ? Number.NaN : Date.parse(skill.dueAt);
  const date = Number.isFinite(dueAt)
    ? new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
        year: 'numeric',
      }).format(dueAt)
    : null;
  if (skill.due) {
    const state = skill.overdueDays > 0
      ? `Overdue by ${skill.overdueDays} days.`
      : 'Due.';
    return date ? `${state} Due on ${date}.` : `${state} No due date is available.`;
  }
  return date ? `Current. Due on ${date}.` : 'Current. No due date is available.';
}

function gbfStateLabel(state: PublicTeacherReport['gbf']['state']) {
  if (state === 'not_configured') return 'Not configured';
  if (state === 'in_progress') return 'In progress';
  return 'Proficient';
}

function gbfPhaseLabel(value: string) {
  if (value === 'complete') return 'Complete';
  return value.replace('_', ' ').replace(/^./, (first) => first.toUpperCase());
}

export function TeacherReportView({
  report,
  canComment,
  canRespond,
  canAssignGbf = false,
  evidenceHistoryNextHref = null,
  publicCommentsNextHref = null,
  privateCommentsNextHref = null,
}: {
  report: PublicTeacherReport | PrivateTeacherReport;
  canComment: boolean;
  canRespond: boolean;
  canAssignGbf?: boolean;
  evidenceHistoryNextHref?: string | null;
  publicCommentsNextHref?: string | null;
  privateCommentsNextHref?: string | null;
}) {
  const privateComments = 'privateComments' in report ? report.privateComments : [];
  const [gbfAssignmentState, setGbfAssignmentState] = useState<'idle' | 'submitting' | 'assigned' | 'error'>('idle');
  async function assignGbf() {
    setGbfAssignmentState('submitting');
    try {
      const response = await fetch(
        `/api/reports/teachers/${encodeURIComponent(report.teacherProfileId)}/gbf-assignment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        },
      );
      setGbfAssignmentState(response.ok ? 'assigned' : 'error');
    } catch {
      setGbfAssignmentState('error');
    }
  }
  return (
    <>
      <section className="report-summary" aria-labelledby="report-summary-heading">
        <h2 id="report-summary-heading">Current summary</h2>
        <dl className="summary-grid">
          <div><dt>Danielson</dt><dd>{stateLabel(report.danielsonState)}</dd></div>
          <div>
            <dt>Improvement plan</dt>
            <dd>
              {report.improvementPlan.state.replaceAll('_', ' ')}
              {'planId' in report.improvementPlan && report.improvementPlan.planId
                ? <> · <Link href={`/improvement-plans/${encodeURIComponent(report.improvementPlan.planId)}`}>Open plan</Link></>
                : null}
            </dd>
          </div>
          <div><dt>Get Better Faster (GBF)</dt><dd>{gbfStateLabel(report.gbf.state)}</dd></div>
        </dl>
      </section>

      {report.gbf.state !== 'not_configured' ? (
        <section className="card" aria-labelledby="gbf-progress-heading">
          <h2 id="gbf-progress-heading">Get Better Faster (GBF) progress</h2>
          <p>Progress</p>
          <dl className="summary-grid">
            <div>
              <dt>Management phase</dt>
              <dd>{gbfPhaseLabel(report.gbf.trajectories.management.currentPhaseId)}</dd>
            </div>
            <div>
              <dt>Rigor phase</dt>
              <dd>{gbfPhaseLabel(report.gbf.trajectories.rigor.currentPhaseId)}</dd>
            </div>
            <div><dt>Assigned skills</dt><dd>{report.gbf.assignedSkillIds.length}</dd></div>
            <div><dt>Proficient skills</dt><dd>{report.gbf.proficientSkillIds.length}</dd></div>
            <div><dt>Due skills</dt><dd>{report.gbf.dueSkillIds.length}</dd></div>
            <div><dt>Unresolved gaps</dt><dd>{report.gbf.unresolvedGapSkillIds.length}</dd></div>
          </dl>
        </section>
      ) : canAssignGbf ? (
        <section className="card" aria-labelledby="gbf-progress-heading">
          <h2 id="gbf-progress-heading">Get Better Faster (GBF) progress</h2>
          <p>There is no assigned track.</p>
          <button
            type="button"
            onClick={assignGbf}
            disabled={gbfAssignmentState === 'submitting' || gbfAssignmentState === 'assigned'}
          >
            {gbfAssignmentState === 'submitting' ? 'Assigning…' : 'Assign Get Better Faster'}
          </button>
          {gbfAssignmentState === 'assigned' ? <p role="status">Track assigned.</p> : null}
          {gbfAssignmentState === 'error' ? <p role="alert">The track could not be assigned.</p> : null}
        </section>
      ) : null}

      {report.improvementPlan.state === 'active' || report.improvementPlan.state === 'closed' ? (
        <section className="card" aria-labelledby="improvement-plan-progress-heading">
          <h2 id="improvement-plan-progress-heading">Improvement plan progress</h2>
          {'trackState' in report.improvementPlan && report.improvementPlan.trackState
            ? <p>Status: {report.improvementPlan.trackState.replaceAll('_', ' ')}.</p>
            : null}
          <p>Days remaining: {report.improvementPlan.daysRemaining}.</p>
          {report.improvementPlan.schoolSupport ? <p>School support: {report.improvementPlan.schoolSupport}</p> : null}
          {report.improvementPlan.successfulCompletionCriteria ? <p>Successful completion: {report.improvementPlan.successfulCompletionCriteria}</p> : null}
          <ul>{report.improvementPlan.targets.map((target) => (
            <li key={target.skillId}>
              <code>{target.skillId}</code>: {target.state.replaceAll('_', ' ')}. Current rating: {target.currentRating ?? 'No rated plan evidence'}. Evidence {target.evidenceOverdue ? 'overdue' : target.evidenceDue ? 'due' : 'current'}.
            </li>
          ))}</ul>
          {report.improvementPlan.closureNote ? <p>Leadership closure note: {report.improvementPlan.closureNote}</p> : null}
          <p><Link href={`/improvement-plans/${encodeURIComponent(report.improvementPlan.planId)}`}>Open full improvement plan</Link></p>
        </section>
      ) : null}

      <section className="card" aria-labelledby="official-heading">
        <h2 id="official-heading">Official evaluations</h2>
        {report.officialEvaluations.length === 0 ? <p>No formal evaluation is published.</p> : (
          <div className="record-list">
            {report.officialEvaluations.map((evaluation) => (
              <details key={evaluation.observationId}>
                <summary>
                  {evaluation.observationType === 'formal_q1' ? 'Q1' : 'Q4'} · {evaluation.schoolYear} · {stateLabel(evaluation.status)}
                </summary>
                <p>Observed {new Date(evaluation.observedAt).toLocaleDateString()} by {evaluation.observerDisplayName}.</p>
                <p>Amendments: {evaluation.amendmentCount}</p>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th scope="col">Component</th><th scope="col">Rating</th><th scope="col">Points</th></tr></thead>
                    <tbody>{evaluation.components.map((component) => (
                      <tr key={component.componentId}>
                        <th scope="row">{component.title}</th>
                        <td>{component.rawRating ?? 'Not enough evidence'}</td>
                        <td>{component.points ?? '—'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <p><Link href={`/observations/records/${encodeURIComponent(evaluation.observationId)}`}>Open source observation</Link></p>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="proficiency-heading">
        <h2 id="proficiency-heading">Current proficiency</h2>
        <p>{stateLabel(report.currentProficiency.state)}</p>
        <div className="record-list">
          {report.currentProficiency.domains.map((domain) => (
            <details key={domain.domainId}>
              <summary>{domain.title} · {stateLabel(domain.state)}</summary>
              {domain.components.map((component) => (
                <section className="report-component" key={component.componentId}>
                  <h3>{component.title}</h3>
                  <p>{stateLabel(component.state)}</p>
                  <ul>{component.skills.map((skill) => (
                    <li key={skill.skillId}>
                      <span>{skill.title}: {skill.rawRating === null ? 'Not enough evidence' : `Rating ${skill.rawRating} · ${skill.points} points`}</span>
                      <span> · {dueLabel(skill)}</span>
                      {skill.sourceRecordId ? (
                        <> · <Link href={`/observations/records/${encodeURIComponent(skill.sourceRecordId)}`}>Open skill evidence source</Link></>
                      ) : null}
                    </li>
                  ))}</ul>
                </section>
              ))}
            </details>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="history-heading">
        <h2 id="history-heading">Evidence history</h2>
        {report.evidenceHistory.length === 0 ? <p>No published evidence is available.</p> : (
          <div className="record-list">
            {report.evidenceHistory.map((record) => (
              <details key={record.observationId}>
                <summary>{record.observationType.replaceAll('_', ' ')} · {new Date(record.observedAt).toLocaleDateString()}</summary>
                <p>Observer: {record.observerDisplayName}</p>
                <p>Amendments: {record.amendmentCount}</p>
                <ul>{record.items.map((item) => (
                  <li key={item.itemId}>
                    {item.skillId ? (
                      <>
                        <code>{item.skillId}</code>
                        {' · '}
                        <span>Parent component: {item.componentId}</span>
                      </>
                    ) : <code>{item.componentId}</code>}
                    : {outcomeLabel(item.outcome)}
                    {item.evidenceNote ? ` · ${item.evidenceNote}` : ''}
                  </li>
                ))}</ul>
                <p><Link href={`/observations/records/${encodeURIComponent(record.observationId)}`}>Open observation and amendments</Link></p>
                {canComment ? (
                  <div className="comment-form-grid">
                    <ReportCommentForm observationId={record.observationId} commentType="public" />
                    <ReportCommentForm observationId={record.observationId} commentType="private" />
                  </div>
                ) : null}
                {canRespond && record.teacherResponseState === 'not_submitted' ? (
                  <TeacherResponseForm observationId={record.observationId} />
                ) : null}
              </details>
            ))}
          </div>
        )}
        {evidenceHistoryNextHref ? <p><Link href={evidenceHistoryNextHref}>Next evidence page</Link></p> : null}
      </section>

      <section className="card" aria-labelledby="comments-heading">
        <h2 id="comments-heading">Public comments</h2>
        {report.publicComments.length === 0 ? <p>No public comments.</p> : (
          <ul className="record-list">{report.publicComments.map((comment) => (
            <li key={comment.commentId}>
              <p>{comment.content}</p>
              <p className="muted">Author account: {comment.authorAccountId} · {new Date(comment.createdAt).toLocaleString()} · <Link href={`/observations/records/${encodeURIComponent(comment.observationId)}`}>Source observation</Link></p>
            </li>
          ))}</ul>
        )}
        {publicCommentsNextHref ? <p><Link href={publicCommentsNextHref}>Next public comments page</Link></p> : null}
      </section>

      {privateComments.length > 0 || privateCommentsNextHref ? (
        <section className="card" aria-labelledby="private-comments-heading">
          <h2 id="private-comments-heading">Private leadership comments</h2>
          {privateComments.length === 0 ? <p>No private comments.</p> : (
            <ul className="record-list">{privateComments.map((comment) => (
              <li key={comment.commentId}>
                <p>{comment.content}</p>
                <p className="muted">Author account: {comment.authorAccountId} · {new Date(comment.createdAt).toLocaleString()} · <Link href={`/observations/records/${encodeURIComponent(comment.observationId)}`}>Source observation</Link></p>
              </li>
            ))}</ul>
          )}
          {privateCommentsNextHref ? <p><Link href={privateCommentsNextHref}>Next private comments page</Link></p> : null}
        </section>
      ) : null}

      {report.responses.length > 0 ? (
        <section className="card" aria-labelledby="responses-heading">
          <h2 id="responses-heading">Teacher responses</h2>
          <ul className="record-list">{report.responses.map((response) => (
            <li key={response.responseId}>
              <p>{response.content}</p>
              <p className="muted">Final response submitted {new Date(response.submittedAt).toLocaleString()}.</p>
            </li>
          ))}</ul>
        </section>
      ) : null}
    </>
  );
}
