import { fetchInternalMutation, internal } from "@/lib/convex/server";
import { safeObservationMutation } from "@/lib/observations/observation-api";
import { readObservationRequest } from "@/lib/observations/observation-route";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const prepared = await readObservationRequest(request);
  if (prepared instanceof Response) return prepared;
  const { recordId } = await params;
  return safeObservationMutation(() =>
    fetchInternalMutation(internal.observations.submitObservation, {
      actorAccountId: prepared.claims.sub,
      draftId: recordId,
      expectedRevision: prepared.command.expectedRevision,
      submissionKey: prepared.command.submissionKey,
      now: Date.now(),
    }),
  );
}
