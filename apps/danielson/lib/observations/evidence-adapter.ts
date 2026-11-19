import type { ObservationOutcome, SubmittedObservation } from "./contracts";

export type ObservationEvidenceCommand = {
  kind: ObservationOutcome["kind"];
  idempotencyKey: string;
  organizationId: string;
  teacherProfileId: string;
  sourceRecordId: string;
  formalObservationId?: string;
  sourceType: SubmittedObservation["observationType"];
  componentId: string;
  targetSkillIds: string[];
  observerAccountId: string;
  eventTime: string;
  sourceVersion: string;
  provenanceGroupId: string;
  outcome: ObservationOutcome;
  scoringEffect: boolean;
};

/** Convert a submitted record into strict Track 2 evidence commands. */
export function buildObservationEvidenceCommands(
  record: SubmittedObservation,
): ObservationEvidenceCommand[] {
  const formal = record.observationType !== "walkthrough";
  const provenanceGroupId = `${record.observationId}:provenance`;
  return record.items.map((item) => {
    if (!item.outcome) throw new Error(`Submitted item ${item.itemId} has no outcome`);
    const targetId = formal ? item.componentId : item.skillId;
    if (!targetId) throw new Error(`Walkthrough item ${item.itemId} has no skill`);
    return {
      kind: item.outcome.kind,
      idempotencyKey: formal
        ? `${record.submissionKey}:component:${item.componentId}`
        : `${record.submissionKey}:skill:${targetId}`,
      organizationId: record.organizationId,
      teacherProfileId: record.teacherProfileId,
      sourceRecordId: record.observationId,
      ...(formal ? { formalObservationId: record.observationId } : {}),
      sourceType: record.observationType,
      componentId: item.componentId,
      targetSkillIds: formal ? [] : [targetId],
      observerAccountId: record.observerAccountId,
      eventTime: record.observedAt,
      sourceVersion: record.sourceVersion,
      provenanceGroupId,
      outcome: { ...item.outcome },
      scoringEffect: item.outcome.kind === "rated",
    };
  });
}
