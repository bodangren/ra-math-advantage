import type {
  ObservationAmendment,
  ObservationType,
  SubmittedObservation,
} from "../observations/contracts";
import { projectEffectiveObservation } from "../observations/amendments";
import type { ComponentEvidence } from "./projections";

type FormalObservation = {
  record: SubmittedObservation;
  amendments: readonly ObservationAmendment[];
};

function schoolYearStart(schoolYear: string): number {
  const match = /^(\d{4})-/.exec(schoolYear);
  return match ? Number(match[1]) : 0;
}

/** Compare formal records by school year, then by the event that produced the evidence. */
export function compareFormalRecords(
  left: SubmittedObservation,
  right: SubmittedObservation,
): number {
  const schoolYear = schoolYearStart(left.schoolYear) - schoolYearStart(right.schoolYear);
  if (schoolYear !== 0) return schoolYear;
  const observedAt = Date.parse(left.observedAt) - Date.parse(right.observedAt);
  if (observedAt !== 0) return observedAt;
  const submittedAt = left.submittedAt - right.submittedAt;
  if (submittedAt !== 0) return submittedAt;
  return left.observationId.localeCompare(right.observationId);
}

export function latestFormalRecord(
  records: readonly SubmittedObservation[],
  observationType: Extract<ObservationType, "formal_q1" | "formal_q4">,
) {
  return records
    .filter((record) => record.observationType === observationType)
    .sort((left, right) => compareFormalRecords(right, left))[0];
}

/** Select the latest effective rated evidence for each Danielson component. */
export function projectLatestFormalComponentEvidence(
  observations: readonly FormalObservation[],
): ComponentEvidence[] {
  const latestByComponent = new Map<
    string,
    {
      evidence: ComponentEvidence;
      record: SubmittedObservation;
      itemId: string;
    }
  >();
  for (const { record, amendments } of observations) {
    if (record.observationType !== "formal_q1" && record.observationType !== "formal_q4") continue;
    const effective = projectEffectiveObservation(record, amendments);
    for (const item of effective.items) {
      if (item.outcome?.kind !== "rated") continue;
      const candidate = {
        evidence: {
          componentId: item.componentId,
          rawRating: item.outcome.rating,
          sourceRecordId: record.observationId,
        },
        record,
        itemId: item.itemId,
      } satisfies {
        evidence: ComponentEvidence;
        record: SubmittedObservation;
        itemId: string;
      };
      const current = latestByComponent.get(item.componentId);
      const comparison = current
        ? compareFormalRecords(record, current.record) || item.itemId.localeCompare(current.itemId)
        : 1;
      if (!current || comparison > 0) latestByComponent.set(item.componentId, candidate);
    }
  }
  return [...latestByComponent.values()]
    .map(({ evidence }) => evidence)
    .sort((left, right) => left.componentId.localeCompare(right.componentId));
}
