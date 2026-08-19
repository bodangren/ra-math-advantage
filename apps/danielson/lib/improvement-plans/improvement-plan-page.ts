import { redirect } from 'next/navigation';

import { requireDanielsonSession } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import type {
  ImprovementPlanListView,
  ImprovementPlanProgress,
  ImprovementPlanView,
} from './view';

export async function getImprovementPlanList(cursor: string | null) {
  const session = await requireDanielsonSession('/improvement-plans');
  const result = await fetchInternalQuery(internal.improvementPlans.listScopedImprovementPlans, {
    actorAccountId: session.claims.sub,
    paginationOpts: { cursor, numItems: 25 },
    now: Date.now(),
  });
  if (result.kind === 'capacity_exceeded') {
    throw new Error('The improvement plan list exceeded its safe capacity.');
  }
  if (result.kind !== 'allowed') redirect('/unauthorized');
  return {
    session,
    page: result.page as {
      page: ImprovementPlanListView[];
      isDone: boolean;
      continueCursor: string;
    },
  };
}

export async function getImprovementPlanProposalWorkspace(teacherProfileId: string) {
  const path = `/improvement-plans/new?teacherProfileId=${encodeURIComponent(teacherProfileId)}`;
  const session = await requireDanielsonSession(path);
  const result = await fetchInternalQuery(
    internal.improvementPlans.readImprovementPlanProposalWorkspace,
    { actorAccountId: session.claims.sub, teacherProfileId },
  );
  if (result.kind === 'capacity_exceeded') throw new Error('The proposal workspace exceeded its safe capacity.');
  if (result.kind !== 'allowed') redirect('/unauthorized');
  return { session, workspace: result };
}

export async function getImprovementPlan(planId: string) {
  const path = `/improvement-plans/${encodeURIComponent(planId)}`;
  const session = await requireDanielsonSession(path);
  const result = await fetchInternalQuery(internal.improvementPlans.readImprovementPlan, {
    actorAccountId: session.claims.sub,
    planId,
    now: Date.now(),
  });
  if (result.kind === 'capacity_exceeded') throw new Error('The improvement plan exceeded its safe capacity.');
  if (result.kind !== 'allowed') redirect('/unauthorized');
  const progressResult = await fetchInternalQuery(
    internal.improvementPlans.readImprovementPlanReportProjection,
    {
      actorAccountId: session.claims.sub,
      teacherProfileId: result.plan.teacherProfileId,
      planId,
      now: Date.now(),
    },
  );
  if (progressResult.kind === 'capacity_exceeded') throw new Error('The plan evidence exceeded its safe capacity.');
  if (progressResult.kind !== 'allowed') redirect('/unauthorized');
  return {
    session,
    plan: result.plan as ImprovementPlanView,
    viewer: result.viewer as { isSubjectTeacher: boolean; isFrozenSupervisor: boolean },
    progress: progressResult.projection as ImprovementPlanProgress,
  };
}
