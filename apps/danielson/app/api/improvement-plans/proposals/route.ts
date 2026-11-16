import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  readImprovementPlanRequest,
  safeImprovementPlanMutation,
} from '@/lib/improvement-plans/improvement-plan-route';

export async function POST(request: Request) {
  const prepared = await readImprovementPlanRequest(request);
  if (prepared instanceof Response) return prepared;
  return safeImprovementPlanMutation(() => fetchInternalMutation(
    internal.improvementPlans.createImprovementPlanProposal,
    { ...prepared.command, actorAccountId: prepared.claims.sub, now: Date.now() },
  ));
}
