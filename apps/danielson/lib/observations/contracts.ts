import type { DanielsonRating } from '../proficiency/rating';

export const OBSERVATION_TYPES = [
  'walkthrough',
  'formal_q1',
  'formal_q4',
] as const;

export type ObservationType = (typeof OBSERVATION_TYPES)[number];
export type ObservationPriorityReason =
  | 'below_proficient'
  | 'overdue'
  | 'evidence_gap'
  | 'due';

export type ObservationOutcome =
  | { kind: 'rated'; rating: DanielsonRating }
  | { kind: 'not_enough_evidence' };

export type ObservationItem = {
  itemId: string;
  componentId: string;
  skillId?: string;
  priorityReason?: ObservationPriorityReason;
  outcome: ObservationOutcome | null;
  evidenceNote: string | null;
};

export type ObservationDraft = {
  draftId: string;
  organizationId: string;
  teacherProfileId: string;
  observerAccountId: string;
  observationType: ObservationType;
  schoolYear: string;
  sourceVersion: string;
  frameworkVersion: string;
  observedAt: string;
  status: 'draft';
  revision: number;
  createdAt: number;
  updatedAt: number;
  items: ObservationItem[];
};

export type SubmittedObservation = Omit<ObservationDraft, 'status'> & {
  observationId: string;
  status: 'submitted';
  submissionKey: string;
  submissionFingerprint: string;
  submittedAt: number;
  publishedAt: number;
};

export type ObservationReceipt = {
  observationId: string;
  submissionKey: string;
  submittedAt: number;
  publishedAt: number;
  fingerprint: string;
};

export type ObservationItemChange = {
  itemId: string;
  outcome?: ObservationOutcome;
  evidenceNote?: string | null;
};

export type ObservationAmendment = {
  amendmentId: string;
  observationId: string;
  organizationId: string;
  teacherProfileId: string;
  authorAccountId: string;
  idempotencyKey: string;
  fingerprint: string;
  version: number;
  reason: string;
  changedItems: ObservationItemChange[];
  occurredAt: number;
};

export type EvidenceSupersession = {
  supersessionId: string;
  observationId: string;
  amendmentId: string;
  teacherProfileId: string;
  itemId: string;
  supersededEvidenceKey: string;
  replacementEvidenceKey: string;
  replacementOutcome: ObservationOutcome;
  occurredAt: number;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

export function requireTimestamp(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${field} must be a finite timestamp`);
  }
  return value;
}

export function normalizeEvidenceNote(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw new Error('evidenceNote must be text');
  const note = value.trim();
  if (note.length > 4_000) throw new Error('evidenceNote is too long');
  return note.length > 0 ? note : null;
}

export function normalizeObservationOutcome(
  value: unknown,
  options: { allowNull?: boolean } = {},
): ObservationOutcome | null {
  if (value === null && options.allowNull) return null;
  if (!isRecord(value)) throw new Error('outcome is required');
  if (value.kind === 'not_enough_evidence') {
    if (value.rating !== undefined && value.rating !== null) {
      throw new Error('not_enough_evidence cannot have a rating');
    }
    return { kind: 'not_enough_evidence' };
  }
  if (
    value.kind === 'rated'
    && (value.rating === 1 || value.rating === 2 || value.rating === 3 || value.rating === 4)
  ) {
    return { kind: 'rated', rating: value.rating };
  }
  throw new Error('A rated outcome must have a rating from 1 through 4');
}

export function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

export function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
