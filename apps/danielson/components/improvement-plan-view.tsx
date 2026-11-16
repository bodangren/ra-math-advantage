import Link from 'next/link';

import { ImprovementPlanAcknowledgmentForm } from './improvement-plan-acknowledgment-form';
import { ImprovementPlanDecisionForms } from './improvement-plan-decision-forms';
import type {
  ImprovementPlanProgress,
  ImprovementPlanVersionView,
  ImprovementPlanView as PlanView,
} from '@/lib/improvement-plans/view';
import { learnHref } from '@/lib/learn/href';

function dateLabel(value: number | null) {
  return value === null
    ? 'Not set'
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(value);
}

function stateLabel(value: string) {
  return value.replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function VersionDetails({ version, heading }: { version: ImprovementPlanVersionView; heading: string }) {
  return (
    <section className="card report-stack" aria-labelledby={`pip-version-${version.version}`}>
      <h2 id={`pip-version-${version.version}`}>{heading}</h2>
      <dl className="summary-grid">
        <div><dt>Teacher</dt><dd>{version.teacherName}</dd></div>
        <div><dt>Position</dt><dd>{version.position}</dd></div>
        <div><dt>Department</dt><dd>{version.departmentName}</dd></div>
        <div><dt>Supervisor</dt><dd>{version.supervisorName}</dd></div>
        <div><dt>Plan end date</dt><dd>{version.requestedPlanEndDate ?? '30 days after approval'}</dd></div>
        <div><dt>Review meeting date</dt><dd>{version.reviewMeetingDate}</dd></div>
      </dl>
      {[
        ['Purpose of the plan', version.purpose],
        ['Areas of concern', version.areasOfConcern],
        ['Expected standard', version.expectedStandard],
        ['Required actions', version.requiredActions],
        ['Evidence of improvement', version.evidenceOfImprovement],
        ['Support provided by the school', version.schoolSupport],
        ['Successful completion criteria', version.successfulCompletionCriteria],
      ].map(([label, value]) => (
        <section key={label}><h3>{label}</h3><p>{value}</p></section>
      ))}
      <section>
        <h3>Targets</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th scope="col">Skill</th><th scope="col">Parent component</th><th scope="col">Expected rating</th></tr></thead>
            <tbody>{version.targets.map((target) => (
              <tr key={target.targetId}>
                <th scope="row">
                  {target.skillTitle}<br />
                  <Link href={learnHref(target.skillId)}>Learn {target.skillTitle}</Link>
                </th>
                <td>{target.componentTitle}</td>
                <td>{target.expectedRating} · {target.expectedPoints} points</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <section><h3>Consequences of insufficient improvement</h3><p>{version.insufficientImprovementConsequences}</p></section>
      <section><h3>Acknowledgment</h3><p>{version.acknowledgmentText}</p></section>
      <p className="muted">Source {version.sourceId} · version {version.sourceVersion}</p>
    </section>
  );
}

export function ImprovementPlanView({
  plan,
  progress,
  viewer,
  roles,
}: {
  plan: PlanView;
  progress: ImprovementPlanProgress;
  viewer: { isSubjectTeacher: boolean; isFrozenSupervisor: boolean };
  roles: string[];
}) {
  const active = plan.activeVersion;
  const pending = plan.state === 'closed' ? null : plan.pendingVersion;
  const canApprove = !viewer.isSubjectTeacher && roles.includes('slt');
  const canClose = !viewer.isSubjectTeacher && roles.includes('slt');
  const canRevise = !viewer.isSubjectTeacher
    && roles.some((role) => ['hod', 'coach', 'school_head', 'slt'].includes(role));
  const teacherAcknowledged = plan.acknowledgments.some((item) => item.kind === 'teacher');
  const supervisorAcknowledged = plan.acknowledgments.some((item) => item.kind === 'supervisor');
  const targetTitleBySkill = new Map(
    [...(active?.targets ?? []), ...(pending?.targets ?? [])]
      .map((target) => [target.skillId, target.skillTitle]),
  );
  return (
    <div className="report-stack">
      <section className="report-summary" aria-labelledby="pip-summary-heading">
        <h2 id="pip-summary-heading">Plan summary</h2>
        <dl className="summary-grid">
          <div><dt>Status</dt><dd>{stateLabel(plan.state)}</dd></div>
          <div><dt>Approved</dt><dd>{dateLabel(plan.approvedAt)}</dd></div>
          <div><dt>Plan end</dt><dd>{dateLabel(plan.planEndAt)}</dd></div>
          <div><dt>Review meeting</dt><dd>{dateLabel(plan.reviewMeetingAt)}</dd></div>
          {'trackState' in progress ? <div><dt>Progress</dt><dd>{stateLabel(progress.trackState ?? progress.state)}</dd></div> : null}
          {'daysRemaining' in progress ? <div><dt>Days remaining</dt><dd>{progress.daysRemaining}</dd></div> : null}
        </dl>
        {plan.state !== 'closed' && canRevise ? (
          <p><Link href={`/improvement-plans/${encodeURIComponent(plan.planId)}/revise`}>Create a revised proposal</Link></p>
        ) : null}
      </section>

      {active ? <VersionDetails version={active} heading={`Approved version ${active.version}`} /> : null}
      {pending ? <VersionDetails version={pending} heading={`Pending version ${pending.version}`} /> : null}

      {'targets' in progress ? (
        <section className="card" aria-labelledby="pip-progress-heading">
          <h2 id="pip-progress-heading">Target progress</h2>
          <ul className="record-list">{progress.targets.map((target) => (
            <li key={target.skillId}>
              <code>{target.skillId}</code>: {stateLabel(target.state)}. Current rating: {target.currentRating ?? 'No rated plan evidence'}. Evidence {target.evidenceOverdue ? 'overdue' : target.evidenceDue ? 'due' : 'current'}. Evidence due at: {dateLabel(target.evidenceDueAt)}.{target.sourceRecordId ? <span>Source record: {target.sourceRecordId}</span> : null}{target.evidenceIdempotencyKey ? <span>Evidence key: {target.evidenceIdempotencyKey}</span> : null}
              {' '}<Link href={learnHref(target.skillId)}>Learn {targetTitleBySkill.get(target.skillId) ?? 'target skill'}</Link>
            </li>
          ))}</ul>
        </section>
      ) : null}

      <section className="card" aria-labelledby="pip-history-heading">
        <h2 id="pip-history-heading">Lifecycle history</h2>
        {plan.history.events.length === 0 ? <p>No lifecycle events are available.</p> : (
          <ul className="record-list">{plan.history.events.map((event) => (
            <li key={event.eventId}>
              {stateLabel(event.kind)} · version {event.version} · {dateLabel(event.occurredAt)}
              {event.payload.outcome ? ` · ${stateLabel(event.payload.outcome)}` : ''}
              {event.payload.note ? ` · ${event.payload.note}` : ''}
            </li>
          ))}</ul>
        )}
      </section>

      <section className="card" aria-labelledby="pip-prior-approved-heading">
        <h2 id="pip-prior-approved-heading">Prior approved versions</h2>
        {plan.history.priorApprovedVersions.length === 0 ? <p>No prior approved versions.</p> : (
          <ul className="record-list">{plan.history.priorApprovedVersions.map((version) => (
            <li key={version.versionId}>Version {version.version}: <span>{version.purpose}</span></li>
          ))}</ul>
        )}
      </section>

      {active && viewer.isSubjectTeacher && !teacherAcknowledged ? (
        <section className="card" aria-labelledby="teacher-pip-ack-heading">
          <h2 id="teacher-pip-ack-heading">Teacher acknowledgment</h2>
          <ImprovementPlanAcknowledgmentForm
            planId={plan.planId}
            versionId={active.versionId}
            expectedRevision={plan.revision}
          />
        </section>
      ) : null}
      {active && viewer.isFrozenSupervisor && !supervisorAcknowledged ? (
        <section className="card" aria-labelledby="supervisor-pip-ack-heading">
          <h2 id="supervisor-pip-ack-heading">Supervisor acknowledgment</h2>
          <ImprovementPlanAcknowledgmentForm
            planId={plan.planId}
            versionId={active.versionId}
            expectedRevision={plan.revision}
            kind="supervisor"
          />
        </section>
      ) : null}

      {pending ? (
        <ImprovementPlanDecisionForms
          planId={plan.planId}
          versionId={pending.versionId}
          revision={plan.revision}
          state="proposed"
          canApprove={canApprove}
          canClose={false}
        />
      ) : null}
      {active && plan.state === 'active' ? (
        <ImprovementPlanDecisionForms
          planId={plan.planId}
          versionId={active.versionId}
          revision={plan.revision}
          state="active"
          canApprove={false}
          canClose={canClose}
        />
      ) : null}

      {plan.state === 'closed' ? (
        <section className="card" aria-labelledby="pip-outcome-heading">
          <h2 id="pip-outcome-heading">Closure outcome</h2>
          <p>{stateLabel(plan.closureOutcome ?? 'closed')}</p>
          <p>Closed {dateLabel(plan.closedAt)}.</p>
          {plan.closureNote ? <p>{plan.closureNote}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
