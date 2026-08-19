import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import {
  canAmendPublishedObservation,
  getPublishedObservationPage,
} from '@/lib/observations/observation-page';
import { buildDanielsonGraph } from '@/lib/proficiency/graph';

function outcomeLabel(outcome: { kind: string; rating?: number } | null): string {
  if (!outcome) return 'No outcome';
  return outcome.kind === 'rated' ? `Rating ${outcome.rating}` : 'Not enough evidence';
}

export default async function PublishedObservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ recordId: string }>;
  searchParams: Promise<{ amendmentCursor?: string }>;
}) {
  const { recordId } = await params;
  const parameters = await searchParams;
  const result = await getPublishedObservationPage(
    `/observations/records/${encodeURIComponent(recordId)}`,
    recordId,
    parameters.amendmentCursor ?? null,
  );
  const roles = result.session.account.danielsonRoles as string[];
  const titleById = new Map(buildDanielsonGraph().graph.nodes.map((node) => [node.id, node.title]));
  const record = result.record as {
    observationType: string;
    observedAt: string;
    schoolYear: string;
    items: Array<{ itemId: string; componentId: string; skillId?: string; outcome: { kind: string; rating?: number } | null; evidenceNote: string | null }>;
  };
  const canAmend = canAmendPublishedObservation(roles, record.observationType, result.isSelf);
  return (
    <>
      <SiteHeader isAuthenticated showObservations={canAmend} showMyObservations={roles.includes('teacher')} />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Published observation</p>
        <h1>{result.teacherDisplayName}</h1>
        <p className="lede">{record.observationType.replaceAll('_', ' ')} · {record.schoolYear} · {new Date(record.observedAt).toLocaleString()}</p>
        <p>Observer: {result.observerDisplayName}</p>
        <p>Amendments: {result.amendmentCount}</p>
        <div className="record-list">
          {record.items.map((item) => {
            const title = item.skillId ? titleById.get(item.skillId) : titleById.get(item.componentId);
            return (
              <section className="card" key={item.itemId}>
                <h2>{title ?? item.itemId}</h2>
                <p><strong>Outcome:</strong> {outcomeLabel(item.outcome)}</p>
                <p><strong>Evidence note:</strong> {item.evidenceNote ?? 'No note'}</p>
              </section>
            );
          })}
        </div>
        {result.amendmentPage.page.length > 0 ? (
          <section className="card" aria-labelledby="amendment-history-heading">
            <h2 id="amendment-history-heading">Amendment history</h2>
            <ol>
              {result.amendmentPage.page.map((amendment: { amendmentId: string; version: number; reason: string; authorDisplayName: string; occurredAt: number }) => (
                <li key={amendment.amendmentId}>
                  Version {amendment.version} by {amendment.authorDisplayName} on {new Date(amendment.occurredAt).toLocaleString()}: {amendment.reason}
                </li>
              ))}
            </ol>
            {!result.amendmentPage.isDone ? (
              <Link href={`/observations/records/${encodeURIComponent(recordId)}?amendmentCursor=${encodeURIComponent(result.amendmentPage.continueCursor)}`}>
                Next amendment page
              </Link>
            ) : null}
          </section>
        ) : null}
        <div className="observation-actions">
          {canAmend ? <Link className="button" href={`/observations/records/${encodeURIComponent(recordId)}/amend`}>Add amendment</Link> : null}
          <Link className="button secondary" href={canAmend ? '/observations' : '/my-observations'}>Back</Link>
        </div>
      </main>
    </>
  );
}
