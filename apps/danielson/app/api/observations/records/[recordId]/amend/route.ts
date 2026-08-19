import { fetchInternalMutation, internal } from '@/lib/convex/server';
import { safeObservationMutation } from '@/lib/observations/observation-api';
import { readObservationRequest } from '@/lib/observations/observation-route';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const prepared = await readObservationRequest(request);
  if (prepared instanceof Response) return prepared;
  const { recordId } = await params;
  return safeObservationMutation(() => fetchInternalMutation(
    internal.observations.amendObservation,
    {
      actorAccountId: prepared.claims.sub,
      observationId: recordId,
      expectedVersion: prepared.command.expectedVersion,
      idempotencyKey: prepared.command.idempotencyKey,
      reason: prepared.command.reason,
      changedItems: prepared.command.changedItems,
      now: Date.now(),
    },
  ));
}
