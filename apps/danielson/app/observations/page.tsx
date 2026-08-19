import Link from 'next/link';

import { ObservationStartForm } from '@/components/observation-start-form';
import { SiteHeader } from '@/components/site-header';
import { getObservationWorkspace } from '@/lib/observations/observation-page';

type QueueItem = {
  teacherProfileId: string;
  displayName: string;
  reason: string;
  eligibleTargetCount: number;
  shortfall: number;
  shortfallReason: string | null;
  targets: Array<{ skillId: string; skillTitle: string; componentTitle: string }>;
};

export default async function ObservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ draftCursor?: string }>;
}) {
  const parameters = await searchParams;
  const {
    queue,
    formalCandidates,
    drafts,
    components,
    permittedTypes,
  } = await getObservationWorkspace(
    '/observations',
    parameters.draftCursor ?? null,
  );
  return (
    <>
      <SiteHeader isAuthenticated showObservations />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Observation workspace</p>
        <h1>Prioritized teacher queue</h1>
        <p className="lede">Start with the first teacher. Each walkthrough includes up to three current Danielson targets.</p>

        {drafts.page.length > 0 || !drafts.isDone ? (
          <section className="card" aria-labelledby="drafts-heading">
            <h2 id="drafts-heading">Your drafts</h2>
            {drafts.page.length > 0 ? (
              <ul className="record-list">
                {drafts.page.map((draft: { draftId: string; teacherDisplayName: string; observationType: string; observedAt: string }) => (
                  <li key={draft.draftId}>
                    <Link href={`/observations/drafts/${encodeURIComponent(draft.draftId)}`}>
                      {draft.teacherDisplayName} — {draft.observationType.replaceAll('_', ' ')} — {new Date(draft.observedAt).toLocaleString()}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p>No drafts in your current scope appear on this page.</p>}
            {!drafts.isDone ? <Link href={`/observations?draftCursor=${encodeURIComponent(drafts.continueCursor)}`}>Next draft page</Link> : null}
          </section>
        ) : null}

        <ol className="teacher-queue">
          {(queue as QueueItem[]).map((teacher, index) => (
            <li className="card teacher-queue-item" key={teacher.teacherProfileId}>
              <div>
                <p className="eyebrow">Priority {index + 1}</p>
                <h2>{teacher.displayName}</h2>
                <p><span className="status attention">{teacher.reason.replaceAll('_', ' ')}</span></p>
                <p>{teacher.eligibleTargetCount} eligible targets</p>
                {teacher.shortfall > 0 ? <p className="field-error">Only {3 - teacher.shortfall} eligible targets are available.</p> : null}
                <ul>{teacher.targets.map((target) => (
                  <li key={target.skillId}>{target.skillTitle} <span className="muted">({target.componentTitle})</span></li>
                ))}</ul>
              </div>
              <ObservationStartForm
                teacherProfileId={teacher.teacherProfileId}
                components={components}
                permittedTypes={permittedTypes}
              />
            </li>
          ))}
        </ol>
        {queue.length === 0 ? <p className="card">No teacher is due in your current scope.</p> : null}
        {formalCandidates.length > 0 ? (
          <section className="card" aria-labelledby="formal-observation-heading">
            <h2 id="formal-observation-heading">Start a formal observation</h2>
            <p>Formal observations do not depend on the walkthrough queue.</p>
            <ObservationStartForm
              teachers={formalCandidates}
              components={components}
              permittedTypes={permittedTypes.filter((type) => type !== 'walkthrough')}
            />
          </section>
        ) : null}
      </main>
    </>
  );
}
