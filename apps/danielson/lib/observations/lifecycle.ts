import {
  OBSERVATION_TYPES,
  cloneValue,
  compareText,
  isRecord,
  normalizeEvidenceNote,
  normalizeObservationOutcome,
  requireNonEmptyString,
  requireTimestamp,
  type ObservationDraft,
  type ObservationItem,
  type ObservationPriorityReason,
  type ObservationReceipt,
  type ObservationType,
  type SubmittedObservation,
} from './contracts';

const PRIORITY_REASONS = new Set<ObservationPriorityReason>([
  'below_proficient',
  'approved_plan_priority',
  'gbf_phase_priority',
  'overdue',
  'evidence_gap',
  'due',
]);

function isObservationType(value: unknown): value is ObservationType {
  return OBSERVATION_TYPES.some((type) => type === value);
}

function normalizeSchoolYear(value: unknown): string {
  const schoolYear = requireNonEmptyString(value, 'schoolYear');
  const match = /^(\d{4})-(\d{4})$/.exec(schoolYear);
  if (!match || Number(match[2]) !== Number(match[1]) + 1) {
    throw new Error('schoolYear must use consecutive YYYY-YYYY years');
  }
  return schoolYear;
}

function normalizeObservedAt(value: unknown): string {
  const observedAt = requireNonEmptyString(value, 'observedAt');
  const timestamp = Date.parse(observedAt);
  if (!Number.isFinite(timestamp)) throw new Error('observedAt must be an ISO timestamp');
  return new Date(timestamp).toISOString();
}

function normalizeDraftItem(value: unknown, observationType: ObservationType): ObservationItem {
  if (!isRecord(value)) throw new Error('Observation item must be an object');
  const itemId = requireNonEmptyString(value.itemId, 'itemId');
  const componentId = requireNonEmptyString(value.componentId, 'componentId');
  const outcome = normalizeObservationOutcome(value.outcome ?? null, { allowNull: true });
  const evidenceNote = normalizeEvidenceNote(value.evidenceNote);

  if (observationType === 'walkthrough') {
    const skillId = requireNonEmptyString(value.skillId, 'skillId');
    if (!PRIORITY_REASONS.has(value.priorityReason as ObservationPriorityReason)) {
      throw new Error('priorityReason is invalid');
    }
    return {
      itemId,
      skillId,
      componentId,
      priorityReason: value.priorityReason as ObservationPriorityReason,
      outcome,
      evidenceNote,
    };
  }
  return { itemId, componentId, outcome, evidenceNote };
}

export function normalizeObservationDraft(value: unknown): ObservationDraft {
  if (!isRecord(value)) throw new Error('Observation draft must be an object');
  if (!isObservationType(value.observationType)) throw new Error('observationType is invalid');
  if (value.status !== 'draft') throw new Error('Only a draft can use the draft lifecycle');
  if (!Number.isInteger(value.revision) || Number(value.revision) < 0) {
    throw new Error('revision must be a non-negative integer');
  }
  if (!Array.isArray(value.items)) throw new Error('items must be an array');
  const items = value.items.map((item) => normalizeDraftItem(item, value.observationType as ObservationType));
  const maximumItems = value.observationType === 'walkthrough' ? 3 : 22;
  if (items.length < 1 || items.length > maximumItems) {
    throw new Error(`items must contain between 1 and ${maximumItems} records`);
  }
  if (new Set(items.map((item) => item.itemId)).size !== items.length) {
    throw new Error('itemId values must be distinct');
  }
  if (value.observationType === 'walkthrough'
    && new Set(items.map((item) => item.skillId)).size !== items.length) {
    throw new Error('Walkthrough skillId values must be distinct');
  }
  return {
    draftId: requireNonEmptyString(value.draftId, 'draftId'),
    organizationId: requireNonEmptyString(value.organizationId, 'organizationId'),
    teacherProfileId: requireNonEmptyString(value.teacherProfileId, 'teacherProfileId'),
    observerAccountId: requireNonEmptyString(value.observerAccountId, 'observerAccountId'),
    observationType: value.observationType,
    schoolYear: normalizeSchoolYear(value.schoolYear),
    sourceVersion: requireNonEmptyString(value.sourceVersion, 'sourceVersion'),
    frameworkVersion: requireNonEmptyString(value.frameworkVersion, 'frameworkVersion'),
    observedAt: normalizeObservedAt(value.observedAt),
    status: 'draft',
    revision: Number(value.revision),
    createdAt: requireTimestamp(value.createdAt, 'createdAt'),
    updatedAt: requireTimestamp(value.updatedAt, 'updatedAt'),
    items,
  };
}

type SaveItem = {
  itemId: string;
  outcome?: unknown;
  evidenceNote?: unknown;
};

function normalizeSaveItems(value: unknown, current: readonly ObservationItem[]): Map<string, SaveItem> {
  if (!Array.isArray(value)) throw new Error('items must be an array');
  if (value.length !== current.length) throw new Error('A save must include each draft item');
  const currentIds = new Set(current.map((item) => item.itemId));
  const updates = new Map<string, SaveItem>();
  for (const raw of value) {
    if (!isRecord(raw)) throw new Error('A saved item must be an object');
    for (const field of Object.keys(raw)) {
      if (field !== 'itemId' && field !== 'outcome' && field !== 'evidenceNote') {
        throw new Error(`A save cannot change ${field}`);
      }
    }
    const itemId = requireNonEmptyString(raw.itemId, 'itemId');
    if (!currentIds.has(itemId)) throw new Error(`Unknown observation item ${itemId}`);
    if (updates.has(itemId)) throw new Error(`Duplicate observation item ${itemId}`);
    updates.set(itemId, {
      itemId,
      ...(Object.hasOwn(raw, 'outcome') ? { outcome: raw.outcome } : {}),
      ...(Object.hasOwn(raw, 'evidenceNote') ? { evidenceNote: raw.evidenceNote } : {}),
    });
  }
  return updates;
}

export function saveObservationDraft(
  draftValue: unknown,
  command: { expectedRevision: number; now: number; items: unknown },
) {
  const draft = normalizeObservationDraft(draftValue);
  if (command.expectedRevision !== draft.revision) return { kind: 'revision_conflict' as const };
  const now = requireTimestamp(command.now, 'now');
  const updates = normalizeSaveItems(command.items, draft.items);
  const items = draft.items.map((item) => {
    const update = updates.get(item.itemId);
    if (!update) throw new Error(`Missing observation item ${item.itemId}`);
    return {
      ...item,
      outcome: Object.hasOwn(update, 'outcome')
        ? normalizeObservationOutcome(update.outcome ?? null, { allowNull: true })
        : item.outcome,
      evidenceNote: Object.hasOwn(update, 'evidenceNote')
        ? normalizeEvidenceNote(update.evidenceNote)
        : item.evidenceNote,
    };
  });
  return {
    kind: 'saved' as const,
    draft: { ...draft, revision: draft.revision + 1, updatedAt: now, items },
  };
}

export function discardObservationDraft(
  draftValue: unknown,
  command: { expectedRevision: number; confirmed: boolean },
) {
  const draft = normalizeObservationDraft(draftValue);
  if (command.expectedRevision !== draft.revision) return { kind: 'revision_conflict' as const };
  if (!command.confirmed) return { kind: 'confirmation_required' as const };
  return { kind: 'discarded' as const, draftId: draft.draftId };
}

function normalizedSubmissionContent(draft: ObservationDraft, submissionKey: string) {
  return {
    submissionKey: requireNonEmptyString(submissionKey, 'submissionKey'),
    organizationId: draft.organizationId,
    teacherProfileId: draft.teacherProfileId,
    observerAccountId: draft.observerAccountId,
    observationType: draft.observationType,
    schoolYear: draft.schoolYear,
    sourceVersion: draft.sourceVersion,
    frameworkVersion: draft.frameworkVersion,
    observedAt: draft.observedAt,
    items: [...draft.items]
      .sort((left, right) => compareText(left.itemId, right.itemId))
      .map((item) => ({
        itemId: item.itemId,
        componentId: item.componentId,
        skillId: item.skillId ?? null,
        priorityReason: item.priorityReason ?? null,
        outcome: item.outcome,
        evidenceNote: item.evidenceNote,
      })),
  };
}

/** Return one stable fingerprint for normalized logical submission content. */
export function observationSubmissionFingerprint(draftValue: unknown, submissionKey: string): string {
  const draft = normalizeObservationDraft(draftValue);
  return JSON.stringify(normalizedSubmissionContent(draft, submissionKey));
}

export function resolveObservationIdempotency<T>(
  existing: { key: string; fingerprint: string; receipt: T } | null,
  command: { key: string; fingerprint: string },
) {
  if (!existing || existing.key !== command.key) return { kind: 'new' as const };
  if (existing.fingerprint !== command.fingerprint) {
    return { kind: 'idempotency_conflict' as const };
  }
  return { kind: 'replayed' as const, receipt: cloneValue(existing.receipt) };
}

export function submitObservationDraft(
  draftValue: unknown,
  command: { submissionKey: string; now: number },
) {
  const draft = normalizeObservationDraft(draftValue);
  const incomplete = draft.items
    .filter((item) => item.outcome === null)
    .map((item) => item.itemId);
  if (incomplete.length > 0) {
    return { kind: 'incomplete_items' as const, itemIds: incomplete };
  }
  const submissionKey = requireNonEmptyString(command.submissionKey, 'submissionKey');
  const now = requireTimestamp(command.now, 'now');
  const fingerprint = observationSubmissionFingerprint(draft, submissionKey);
  const observationId = `observation_records:${encodeURIComponent(submissionKey)}`;
  const record: SubmittedObservation = {
    ...cloneValue(draft),
    observationId,
    status: 'submitted',
    updatedAt: now,
    submissionKey,
    submissionFingerprint: fingerprint,
    submittedAt: now,
    publishedAt: now,
  };
  const receipt: ObservationReceipt = {
    observationId,
    submissionKey,
    submittedAt: now,
    publishedAt: now,
    fingerprint,
  };
  return { kind: 'submitted' as const, record, receipt };
}
