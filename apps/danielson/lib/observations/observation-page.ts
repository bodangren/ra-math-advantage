import { redirect } from 'next/navigation';

import { requireDanielsonSession } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { buildDanielsonGraph } from '@/lib/proficiency/graph';

const SUPERVISOR_ROLES = new Set(['hod', 'coach', 'school_head', 'slt']);
export type ObservationType = 'walkthrough' | 'formal_q1' | 'formal_q4';

export function permittedObservationTypes(roles: readonly string[]): ObservationType[] {
  const types: ObservationType[] = ['walkthrough', 'formal_q1'];
  if (roles.includes('school_head') || roles.includes('slt')) types.push('formal_q4');
  return types;
}

export function canAmendPublishedObservation(
  roles: readonly string[],
  observationType: string,
  isSelf: boolean,
): boolean {
  if (isSelf) return false;
  if (observationType === 'formal_q4') {
    return roles.includes('school_head') || roles.includes('slt');
  }
  return roles.some((role) => SUPERVISOR_ROLES.has(role));
}

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
  if (queue.kind === 'queue_capacity_exceeded' || drafts.kind === 'queue_capacity_exceeded') {
    throw new Error('The observation queue exceeded its safe capacity.');
  }
  if (queue.kind !== 'allowed' || drafts.kind !== 'allowed') redirect('/unauthorized');
  const components = buildDanielsonGraph().graph.nodes
    .filter((node) => node.kind === 'instructional_unit')
    .map((node) => ({ value: node.id, label: node.title }))
    .sort((left, right) => left.label.localeCompare(right.label));
  return {
    session,
    queue: queue.items,
    formalCandidates: queue.formalCandidates,
    drafts: drafts.page,
    components,
    permittedTypes: permittedObservationTypes(session.account.danielsonRoles),
  };
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
  if (result.kind === 'history_capacity_exceeded') {
    throw new Error('The observation history exceeded its safe capacity.');
  }
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
