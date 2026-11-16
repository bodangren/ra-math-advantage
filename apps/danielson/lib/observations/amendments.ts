import {
  cloneValue,
  compareText,
  isRecord,
  normalizeEvidenceNote,
  normalizeObservationOutcome,
  requireNonEmptyString,
  requireTimestamp,
  type EvidenceSupersession,
  type ObservationAmendment,
  type ObservationItemChange,
  type SubmittedObservation,
} from './contracts';

export type ObservationAmendmentCommand = {
  idempotencyKey: string;
  expectedVersion: number;
  authorAccountId: string;
  reason: string;
  changedItems: ObservationItemChange[];
};

function normalizeChangedItems(value: unknown): ObservationItemChange[] {
  if (!Array.isArray(value)) throw new Error('changedItems must be an array');
  const seen = new Set<string>();
  return value.map((raw) => {
    if (!isRecord(raw)) throw new Error('Each changed item must be an object');
    for (const field of Object.keys(raw)) {
      if (field !== 'itemId' && field !== 'outcome' && field !== 'evidenceNote') {
        throw new Error(`An amendment cannot change item field ${field}`);
      }
    }
    const itemId = requireNonEmptyString(raw.itemId, 'itemId');
    if (seen.has(itemId)) throw new Error(`Duplicate changed item ${itemId}`);
    seen.add(itemId);
    const hasOutcome = Object.hasOwn(raw, 'outcome');
    const hasEvidenceNote = Object.hasOwn(raw, 'evidenceNote');
    if (!hasOutcome && !hasEvidenceNote) throw new Error(`Changed item ${itemId} has no changes`);
    return {
      itemId,
      ...(hasOutcome ? { outcome: normalizeObservationOutcome(raw.outcome) ?? undefined } : {}),
      ...(hasEvidenceNote ? { evidenceNote: normalizeEvidenceNote(raw.evidenceNote) } : {}),
    };
  });
}

function normalizeCommand(value: unknown): ObservationAmendmentCommand {
  if (!isRecord(value)) throw new Error('Amendment command must be an object');
  if (!Number.isInteger(value.expectedVersion) || Number(value.expectedVersion) < 0) {
    throw new Error('expectedVersion must be a non-negative integer');
  }
  return {
    idempotencyKey: requireNonEmptyString(value.idempotencyKey, 'idempotencyKey'),
    expectedVersion: Number(value.expectedVersion),
    authorAccountId: requireNonEmptyString(value.authorAccountId, 'authorAccountId'),
    reason: typeof value.reason === 'string' ? value.reason.trim() : '',
    changedItems: normalizeChangedItems(value.changedItems),
  };
}

/** Return one stable fingerprint for normalized amendment content. */
export function observationAmendmentFingerprint(value: unknown): string {
  const command = normalizeCommand(value);
  return JSON.stringify({
    idempotencyKey: command.idempotencyKey,
    expectedVersion: command.expectedVersion,
    authorAccountId: command.authorAccountId,
    reason: command.reason,
    changedItems: [...command.changedItems]
      .sort((left, right) => compareText(left.itemId, right.itemId)),
  });
}

/** Overlay ordered amendment fields without changing the submitted record. */
export function projectEffectiveObservation(
  original: SubmittedObservation,
  amendments: readonly ObservationAmendment[],
): SubmittedObservation {
  const effective = cloneValue(original);
  const itemById = new Map(effective.items.map((item) => [item.itemId, item]));
  for (const amendment of [...amendments].sort((left, right) => left.version - right.version)) {
    if (amendment.observationId !== original.observationId) continue;
    for (const change of amendment.changedItems) {
      const item = itemById.get(change.itemId);
      if (!item) throw new Error(`Unknown observation item ${change.itemId}`);
      if (change.outcome !== undefined) item.outcome = cloneValue(change.outcome);
      if (Object.hasOwn(change, 'evidenceNote')) item.evidenceNote = change.evidenceNote ?? null;
    }
  }
  return effective;
}

function evidenceKey(record: SubmittedObservation, item: SubmittedObservation['items'][number]): string {
  if (record.observationType === 'walkthrough') {
    if (!item.skillId) throw new Error(`Walkthrough item ${item.itemId} has no skill`);
    return `${record.submissionKey}:skill:${item.skillId}`;
  }
  return `${record.submissionKey}:component:${item.componentId}`;
}

function supersessionsFor(
  original: SubmittedObservation,
  effectiveBefore: SubmittedObservation,
  amendment: ObservationAmendment,
  priorAmendments: readonly ObservationAmendment[] = [],
): EvidenceSupersession[] {
  const beforeById = new Map(effectiveBefore.items.map((item) => [item.itemId, item]));
  const originalById = new Map(original.items.map((item) => [item.itemId, item]));
  const supersessions: EvidenceSupersession[] = [];
  for (const change of amendment.changedItems) {
    if (change.outcome === undefined) continue;
    const before = beforeById.get(change.itemId);
    const source = originalById.get(change.itemId);
    if (!before || !source) throw new Error(`Unknown observation item ${change.itemId}`);
    if (JSON.stringify(before.outcome) === JSON.stringify(change.outcome)) continue;
    const priorOutcomeAmendment = [...priorAmendments]
      .sort((left, right) => right.version - left.version)
      .find((candidate) => candidate.changedItems.some((item) => (
        item.itemId === change.itemId && item.outcome !== undefined
      )));
    const targetKind = original.observationType === 'walkthrough' ? 'skill' : 'component';
    const targetId = original.observationType === 'walkthrough' ? source.skillId : source.componentId;
    const supersededEvidenceKey = priorOutcomeAmendment
      ? `${priorOutcomeAmendment.idempotencyKey}:${targetKind}:${targetId}`
      : evidenceKey(original, source);
    supersessions.push({
      supersessionId: `teacher_evidence_supersessions:${encodeURIComponent(amendment.idempotencyKey)}:${encodeURIComponent(change.itemId)}`,
      observationId: original.observationId,
      amendmentId: amendment.amendmentId,
      teacherProfileId: original.teacherProfileId,
      itemId: change.itemId,
      supersededEvidenceKey,
      replacementEvidenceKey: `${amendment.idempotencyKey}:${targetKind}:${targetId}`,
      replacementOutcome: cloneValue(change.outcome),
      occurredAt: amendment.occurredAt,
    });
  }
  return supersessions;
}

export function applyObservationAmendment(input: {
  original: SubmittedObservation;
  priorAmendments: readonly ObservationAmendment[];
  command: unknown;
  now: number;
}) {
  const command = normalizeCommand(input.command);
  const prior = [...input.priorAmendments].sort((left, right) => left.version - right.version);
  const fingerprint = observationAmendmentFingerprint(command);
  const replay = prior.find((amendment) => amendment.idempotencyKey === command.idempotencyKey);
  if (replay) {
    if (replay.fingerprint !== fingerprint) return { kind: 'idempotency_conflict' as const };
    const effectiveBefore = projectEffectiveObservation(
      input.original,
      prior.filter((amendment) => amendment.version < replay.version),
    );
    return {
      kind: 'replayed' as const,
      amendment: cloneValue(replay),
      supersessions: supersessionsFor(
        input.original,
        effectiveBefore,
        replay,
        prior.filter((amendment) => amendment.version < replay.version),
      ),
      receipt: { amendmentId: replay.amendmentId, version: replay.version },
    };
  }
  const latestVersion = prior.at(-1)?.version ?? 0;
  if (command.expectedVersion !== latestVersion) {
    return { kind: 'version_conflict' as const, latestVersion };
  }
  if (command.reason.length === 0) return { kind: 'invalid_reason' as const };
  if (command.changedItems.length === 0) return { kind: 'no_changes' as const };
  const originalIds = new Set(input.original.items.map((item) => item.itemId));
  for (const change of command.changedItems) {
    if (!originalIds.has(change.itemId)) throw new Error(`Unknown observation item ${change.itemId}`);
  }
  const effectiveBefore = projectEffectiveObservation(input.original, prior);
  const effectiveById = new Map(effectiveBefore.items.map((item) => [item.itemId, item]));
  const effectiveChanges = command.changedItems.flatMap((change) => {
    const current = effectiveById.get(change.itemId);
    if (!current) throw new Error(`Unknown observation item ${change.itemId}`);
    const outcomeChanged = change.outcome !== undefined
      && JSON.stringify(change.outcome) !== JSON.stringify(current.outcome);
    const noteChanged = Object.hasOwn(change, 'evidenceNote')
      && change.evidenceNote !== current.evidenceNote;
    if (!outcomeChanged && !noteChanged) return [];
    return [{
      itemId: change.itemId,
      ...(outcomeChanged ? { outcome: change.outcome } : {}),
      ...(noteChanged ? { evidenceNote: change.evidenceNote ?? null } : {}),
    }];
  });
  if (effectiveChanges.length === 0) return { kind: 'no_changes' as const };
  const version = latestVersion + 1;
  const occurredAt = requireTimestamp(input.now, 'now');
  const amendmentId = `observation_amendments:${encodeURIComponent(input.original.observationId)}:${version}`;
  const amendment: ObservationAmendment = {
    amendmentId,
    observationId: input.original.observationId,
    organizationId: input.original.organizationId,
    teacherProfileId: input.original.teacherProfileId,
    authorAccountId: command.authorAccountId,
    idempotencyKey: command.idempotencyKey,
    fingerprint,
    version,
    reason: command.reason,
    changedItems: cloneValue(effectiveChanges),
    occurredAt,
  };
  return {
    kind: 'amended' as const,
    amendment,
    supersessions: supersessionsFor(input.original, effectiveBefore, amendment, prior),
    receipt: { amendmentId, version },
  };
}
