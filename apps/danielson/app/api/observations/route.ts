import { fetchInternalMutation, internal } from "@/lib/convex/server";
import { safeObservationMutation } from "@/lib/observations/observation-api";
import { readObservationRequest } from "@/lib/observations/observation-route";

export async function POST(request: Request) {
  const prepared = await readObservationRequest(request);
  if (prepared instanceof Response) return prepared;
  return safeObservationMutation(() =>
    fetchInternalMutation(internal.observations.createObservationDraft, {
      actorAccountId: prepared.claims.sub,
      teacherProfileId: prepared.command.teacherProfileId,
      observationType: prepared.command.observationType,
      schoolYear: prepared.command.schoolYear,
      observedAt: prepared.command.observedAt,
      componentIds: prepared.command.componentIds,
      sourceVersion: "danielson-observation.v1",
      frameworkVersion: "danielson-2022",
      now: Date.now(),
    }),
  );
}
