import type { KnowledgeSpace } from "@math-platform/knowledge-space-core";

import { getComponentSkillIds } from "./graph";
import { isDanielsonRating, type DanielsonRating } from "./rating";

export type ObservationSourceType = "walkthrough" | "formal_q1" | "formal_q4";

type ObservationEvidenceBase = {
  organizationId: string;
  teacherId: string;
  sourceRecordId: string;
  formalObservationId?: string;
  sourceType: ObservationSourceType;
  componentId: string;
  targetSkillIds: string[];
  observerId: string;
  occurredAt: string;
  sourceVersion: string;
  provenanceGroupId: string;
  idempotencyKey: string;
};

export type RatedObservationEvidence = ObservationEvidenceBase & {
  kind: "rated";
  rating: DanielsonRating;
};

export type NoEvidenceObservation = ObservationEvidenceBase & {
  kind: "not_enough_evidence";
};

export type ObservationEvidence = RatedObservationEvidence | NoEvidenceObservation;

const ALLOWED_FIELDS = new Set([
  "kind",
  "idempotencyKey",
  "organizationId",
  "teacherId",
  "teacherProfileId",
  "sourceRecordId",
  "formalObservationId",
  "sourceType",
  "componentId",
  "targetSkillIds",
  "observerId",
  "observerAccountId",
  "occurredAt",
  "eventTime",
  "sourceVersion",
  "provenanceGroupId",
  "rating",
  "outcome",
]);

const COMMENT_FIELDS = new Set([
  "publicComment",
  "privateComment",
  "teacherResponse",
  "evidenceNote",
  "note",
  "comments",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  return requiredString(value, field);
}

function resolveAlias(value: Record<string, unknown>, primary: string, alias: string): unknown {
  const primaryValue = value[primary];
  const aliasValue = value[alias];
  if (primaryValue !== undefined && aliasValue !== undefined && primaryValue !== aliasValue) {
    throw new Error(`${primary} and ${alias} must match when both are supplied`);
  }
  return primaryValue ?? aliasValue;
}

function normalizeTargets(value: unknown, allowEmpty: boolean): string[] {
  if (!Array.isArray(value)) throw new Error("targetSkillIds must be an array");
  const targets = value.map((target) => requiredString(target, "targetSkillIds"));
  const unique = [...new Set(targets)].sort();
  if (!allowEmpty && unique.length === 0) throw new Error("At least one target skill is required");
  return unique;
}

function validateGraphTarget(
  graph: KnowledgeSpace,
  componentId: string,
  targetSkillIds: readonly string[],
): void {
  const component = graph.nodes.find((node) => node.id === componentId);
  if (!component || component.kind !== "instructional_unit") {
    throw new Error(`Unknown Danielson component ${componentId}`);
  }
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const allowed = new Set(getComponentSkillIds(graph, componentId));
  for (const skillId of targetSkillIds) {
    const skill = nodeById.get(skillId);
    if (!skill || skill.kind !== "skill") throw new Error(`Unknown target skill ${skillId}`);
    if (!allowed.has(skillId)) {
      throw new Error(`Target skill ${skillId} is outside component ${componentId}`);
    }
  }
}

/**
 * Normalize and validate the strict app-owned observation contract.
 * Target order is not evidence and therefore does not affect the result.
 */
export function normalizeObservationEvidence(
  input: unknown,
  graph: KnowledgeSpace,
): ObservationEvidence {
  if (!isRecord(input)) throw new Error("Observation evidence must be an object");
  for (const field of Object.keys(input)) {
    if (COMMENT_FIELDS.has(field)) {
      throw new Error(`${field} is not part of the scoring contract`);
    }
    if (!ALLOWED_FIELDS.has(field)) throw new Error(`Unknown observation evidence field ${field}`);
  }

  const nestedOutcome = input.outcome;
  if (nestedOutcome !== undefined && !isRecord(nestedOutcome)) {
    throw new Error("outcome must be an object");
  }
  if (nestedOutcome) {
    for (const field of Object.keys(nestedOutcome)) {
      if (field !== "kind" && field !== "rating") {
        throw new Error(`Unknown observation outcome field ${field}`);
      }
    }
  }
  const nestedKind = nestedOutcome?.kind;
  const kind = input.kind ?? nestedKind;
  if (input.kind !== undefined && nestedKind !== undefined && input.kind !== nestedKind) {
    throw new Error("kind and outcome.kind must match when both are supplied");
  }
  if (kind !== "rated" && kind !== "not_enough_evidence") {
    throw new Error("Observation evidence kind is invalid");
  }
  const sourceType = input.sourceType;
  if (sourceType !== "walkthrough" && sourceType !== "formal_q1" && sourceType !== "formal_q4") {
    throw new Error("Observation sourceType is invalid");
  }
  const componentId = requiredString(input.componentId, "componentId");
  let targetSkillIds = normalizeTargets(
    input.targetSkillIds,
    sourceType === "formal_q1" || sourceType === "formal_q4",
  );
  validateGraphTarget(graph, componentId, targetSkillIds);
  if (sourceType === "formal_q4" && targetSkillIds.length > 0) {
    throw new Error("formal_q4 evidence cannot target skills in Track 2");
  }
  if (sourceType === "formal_q1") {
    targetSkillIds = getComponentSkillIds(graph, componentId);
  }

  const occurredAt = requiredString(resolveAlias(input, "occurredAt", "eventTime"), "occurredAt");
  if (!Number.isFinite(Date.parse(occurredAt)))
    throw new Error("occurredAt must be an ISO timestamp");
  const teacherId = requiredString(
    resolveAlias(input, "teacherId", "teacherProfileId"),
    "teacherId",
  );
  const observerId = requiredString(
    resolveAlias(input, "observerId", "observerAccountId"),
    "observerId",
  );
  const formalObservationId = optionalString(input.formalObservationId, "formalObservationId");
  if (sourceType !== "walkthrough" && !formalObservationId) {
    throw new Error("formalObservationId is required for a formal observation");
  }
  if (sourceType === "walkthrough" && formalObservationId) {
    throw new Error("walkthrough evidence cannot have a formalObservationId");
  }
  if (sourceType === "walkthrough" && targetSkillIds.length === 0) {
    throw new Error("Walkthrough evidence requires a target skill");
  }

  const base: ObservationEvidenceBase = {
    organizationId: requiredString(input.organizationId, "organizationId"),
    teacherId,
    sourceRecordId: requiredString(input.sourceRecordId, "sourceRecordId"),
    ...(formalObservationId ? { formalObservationId } : {}),
    sourceType,
    componentId,
    targetSkillIds,
    observerId,
    occurredAt: new Date(occurredAt).toISOString(),
    sourceVersion: requiredString(input.sourceVersion, "sourceVersion"),
    provenanceGroupId: requiredString(input.provenanceGroupId, "provenanceGroupId"),
    idempotencyKey: requiredString(input.idempotencyKey, "idempotencyKey"),
  };

  const nestedRating = nestedOutcome?.rating;
  if (input.rating !== undefined && nestedRating !== undefined && input.rating !== nestedRating) {
    throw new Error("rating and outcome.rating must match when both are supplied");
  }
  const rating = input.rating ?? nestedRating;
  if (kind === "not_enough_evidence") {
    if (rating !== undefined && rating !== null) {
      throw new Error("not_enough_evidence cannot carry a rating");
    }
    return { kind, ...base };
  }
  if (!isDanielsonRating(rating))
    throw new Error("rated evidence must carry a rating from 1 through 4");
  return { kind, ...base, rating };
}

/** Return the canonical logical content used for idempotency. */
export function observationFingerprint(evidence: ObservationEvidence): string {
  const ordered =
    evidence.kind === "rated"
      ? {
          kind: evidence.kind,
          organizationId: evidence.organizationId,
          teacherId: evidence.teacherId,
          sourceRecordId: evidence.sourceRecordId,
          formalObservationId: evidence.formalObservationId ?? null,
          sourceType: evidence.sourceType,
          componentId: evidence.componentId,
          targetSkillIds: evidence.targetSkillIds,
          observerId: evidence.observerId,
          occurredAt: evidence.occurredAt,
          sourceVersion: evidence.sourceVersion,
          provenanceGroupId: evidence.provenanceGroupId,
          idempotencyKey: evidence.idempotencyKey,
          rating: evidence.rating,
        }
      : {
          kind: evidence.kind,
          organizationId: evidence.organizationId,
          teacherId: evidence.teacherId,
          sourceRecordId: evidence.sourceRecordId,
          formalObservationId: evidence.formalObservationId ?? null,
          sourceType: evidence.sourceType,
          componentId: evidence.componentId,
          targetSkillIds: evidence.targetSkillIds,
          observerId: evidence.observerId,
          occurredAt: evidence.occurredAt,
          sourceVersion: evidence.sourceVersion,
          provenanceGroupId: evidence.provenanceGroupId,
          idempotencyKey: evidence.idempotencyKey,
        };
  return JSON.stringify(ordered);
}
