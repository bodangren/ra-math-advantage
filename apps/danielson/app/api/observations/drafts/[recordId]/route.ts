import { fetchInternalMutation, internal } from '@/lib/convex/server';
import { safeObservationMutation } from '@/lib/observations/observation-api';
import { readObservationRequest } from '@/lib/observations/observation-route';

type RouteContext = { params: Promise<{ recordId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const prepared = await readObservationRequest(request);
  if (prepared instanceof Response) return prepared;
  const { recordId } = await context.params;
  return safeObservationMutation(() => fetchInternalMutation(
    internal.observations.saveObservationDraft,
    {
      actorAccountId: prepared.claims.sub,
      draftId: recordId,
      expectedRevision: prepared.command.expectedRevision,
      items: prepared.command.items,
      now: Date.now(),
    },
  ));
}

export async function DELETE(request: Request, context: RouteContext) {
  const prepared = await readObservationRequest(request);
  if (prepared instanceof Response) return prepared;
  const { recordId } = await context.params;
  return safeObservationMutation(() => fetchInternalMutation(
    internal.observations.discardObservationDraft,
    {
      actorAccountId: prepared.claims.sub,
      draftId: recordId,
      expectedRevision: prepared.command.expectedRevision,
      confirmed: prepared.command.confirmed,
    },
  ));
}
