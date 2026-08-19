import { redirect } from 'next/navigation';

import { requireDanielsonSession } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { buildDanielsonGraph } from '@/lib/proficiency/graph';

const SUPERVISOR_ROLES = new Set(['hod', 'coach', 'school_head', 'slt']);

export async function requireObservationSupervisor(path: string) {
  const session = await requireDanielsonSession(path);
  if (!session.account.danielsonRoles.some((role: string) => SUPERVISOR_ROLES.has(role))) {
    redirect('/unauthorized');
  }
  return session;
}

export async function getObservationWorkspace(path: string, draftCursor: string | null = null) {
  const session = await requireObservationSupervisor(path);
  const [queue, drafts] = await Promise.all([
    fetchInternalQuery(internal.observations.readRankedTeacherQueue, {
      actorAccountId: session.claims.sub,
      now: new Date().toISOString(),
    }),
    fetchInternalQuery(internal.observations.listMyObservationDrafts, {
      actorAccountId: session.claims.sub,
      paginationOpts: { cursor: draftCursor, numItems: 20 },
    }),
  ]);
  if (queue.kind !== 'allowed' || drafts.kind !== 'allowed') redirect('/unauthorized');
  const components = buildDanielsonGraph().graph.nodes
    .filter((node) => node.kind === 'instructional_unit')
    .map((node) => ({ value: node.id, label: node.title }))
    .sort((left, right) => left.label.localeCompare(right.label));
  return { session, queue: queue.items, drafts: drafts.page, components };
}

export async function getObservationDraftPage(path: string, draftId: string) {
  const session = await requireObservationSupervisor(path);
  const result = await fetchInternalQuery(internal.observations.readObservationDraft, {
    actorAccountId: session.claims.sub,
    draftId,
  });
  if (result.kind === 'not_found') redirect('/observations');
  if (result.kind !== 'allowed') redirect('/unauthorized');
  return { session, draft: result.draft };
}

export async function getPublishedObservationPage(
  path: string,
  observationId: string,
  amendmentCursor: string | null = null,
) {
  const session = await requireDanielsonSession(path);
  const [result, amendments] = await Promise.all([
    fetchInternalQuery(internal.observations.readPublishedObservation, {
      actorAccountId: session.claims.sub,
      observationId,
    }),
    fetchInternalQuery(internal.observations.listObservationAmendments, {
      actorAccountId: session.claims.sub,
      observationId,
      paginationOpts: { cursor: amendmentCursor, numItems: 20 },
    }),
  ]);
  if (result.kind === 'not_found') redirect('/');
  if (result.kind !== 'allowed' || amendments.kind !== 'allowed') redirect('/unauthorized');
  return { session, ...result, amendmentPage: amendments.page };
}

export async function getMyPublishedObservations(path: string, cursor: string | null = null) {
  const session = await requireDanielsonSession(path);
  const result = await fetchInternalQuery(internal.observations.listMyPublishedObservations, {
    actorAccountId: session.claims.sub,
    paginationOpts: { cursor, numItems: 20 },
  });
  if (result.kind !== 'allowed') redirect('/unauthorized');
  return { session, page: result.page };
}
