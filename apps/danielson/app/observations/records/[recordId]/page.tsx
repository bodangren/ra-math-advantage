import Link from 'next/link';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { ReportCommentForm } from '@/components/report-comment-form';
import { TeacherResponseForm } from '@/components/teacher-response-form';
import type { ReportingComment } from '@/lib/reporting/contracts';

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
  searchParams: Promise<{ amendmentCursor?: string; commentCursor?: string }>;
}) {
  const { recordId } = await params;
  const parameters = await searchParams;
  const result = await getPublishedObservationPage(
    `/observations/records/${encodeURIComponent(recordId)}`,
    recordId,
    parameters.amendmentCursor ?? null,
  );
  const conversation = await fetchInternalQuery(internal.reporting.readObservationConversation, {
    actorAccountId: result.session.claims.sub, observationId: recordId, cursor: parameters.commentCursor ?? null,
  });
  if (conversation.kind !== 'allowed') throw new Error('Observation feedback is not available.');
  const roles = result.session.account.danielsonRoles as string[];
  const titleById = new Map(buildDanielsonGraph().graph.nodes.map((node) => [node.id, node.title]));
  const record = result.record as {
    teacherProfileId: string;
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
        <section className="card">
          <h2>Feedback and teacher response</h2>
          <p>Teacher-visible feedback for this observation.</p>
          {(conversation.comments.page as ReportingComment[]).map(comment => <article key={comment.commentId}><p>{comment.content}</p><p>{new Date(comment.createdAt).toLocaleString()}</p></article>)}
          {conversation.comments.page.length === 0 ? <p>No feedback on this page.</p> : null}
          {!conversation.comments.isDone ? <Link href={`?commentCursor=${encodeURIComponent(conversation.comments.continueCursor)}`}>Next feedback page</Link> : null}
          {conversation.response ? <><h3>Teacher response</h3><p>{conversation.response.content}</p><p>{new Date(conversation.response.submittedAt).toLocaleString()}</p></> : null}
          {result.isSelf && !conversation.response ? <TeacherResponseForm observationId={recordId} /> : null}
          {!result.isSelf ? <ReportCommentForm observationId={recordId} commentType="public" /> : null}
          <p>A teacher response does not mean agreement with the rating.</p>
          <Link href={`/coaching/${encodeURIComponent(record.teacherProfileId)}`}>Open agreed coaching actions</Link>
        </section>
        <div className="observation-actions">
          {canAmend ? <Link className="button" href={`/observations/records/${encodeURIComponent(recordId)}/amend`}>Add amendment</Link> : null}
          <Link className="button secondary" href={canAmend ? '/observations' : '/my-observations'}>Back</Link>
        </div>
      </main>
    </>
  );
}
