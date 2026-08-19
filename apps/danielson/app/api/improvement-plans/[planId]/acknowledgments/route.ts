import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  readImprovementPlanRequest,
  safeImprovementPlanMutation,
} from '@/lib/improvement-plans/improvement-plan-route';

export async function POST(request: Request, context: { params: Promise<{ planId: string }> }) {
  const prepared = await readImprovementPlanRequest(request);
  if (prepared instanceof Response) return prepared;
  const { planId } = await context.params;
  return safeImprovementPlanMutation(() => fetchInternalMutation(
    internal.improvementPlans.acknowledgeImprovementPlan,
    { ...prepared.command, planId, actorAccountId: prepared.claims.sub, now: Date.now() },
  ));
}
