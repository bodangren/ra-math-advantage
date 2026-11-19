import { fetchInternalMutation, internal } from "@/lib/convex/server";
import { readReportingRequest, safeReportingMutation } from "@/lib/reporting/reporting-route";

export async function POST(request: Request) {
  const prepared = await readReportingRequest(request);
  if (prepared instanceof Response) return prepared;
  return safeReportingMutation(() =>
    fetchInternalMutation(internal.reporting.addPublicObservationComment, {
      actorAccountId: prepared.claims.sub,
      observationId: prepared.command.observationId,
      content: prepared.command.content,
      now: Date.now(),
    }),
  );
}
