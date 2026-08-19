import {
  buildKstState,
  type KnowledgeSpace,
  type KnowledgeStateEntry,
} from '@math-platform/knowledge-space-core';
import {
  createCard,
  scheduleReview,
  stabilityToRetention,
  type SrsCardState,
  type SrsReviewLogEntry,
  type SrsReviewLogEntryV31,
} from '@math-platform/srs-engine';

import {
  normalizeObservationEvidence,
  observationFingerprint,
  type NoEvidenceObservation,
  type RatedObservationEvidence,
} from './evidence';
import { getComponentSkillIds } from './graph';
import { adaptDanielsonRating, isDanielsonRating } from './rating';

export type TargetEvidence = {
  skillId: string;
  componentId: string;
  rawRating: 1 | 2 | 3 | 4;
  points: 70 | 80 | 90 | 100;
  passes: boolean;
  srsRating: 'Again' | 'Hard' | 'Good' | 'Easy';
  idempotencyKey: string;
  sourceRecordId: string;
  formalObservationId?: string;
  provenanceGroupId: string;
  sourceType: RatedObservationEvidence['sourceType'];
  occurredAt: string;
};

export type PriorityProjection = {
  teacherId: string;
  skillId: string;
  componentId?: string;
  due: boolean;
  overdueDays: number;
  currentProficiency: {
    rawRating: number | null;
    points: number | null;
    passes: boolean;
  };
  evidenceGaps: string[];
  approvedPriorityInputs: string[];
};

export type TeacherEvidenceResult = {
  kind: 'applied' | 'replayed' | 'idempotency_conflict';
  targetEvidence: TargetEvidence[];
  knowledgeState: KnowledgeStateEntry[];
  priority: PriorityProjection[];
};

export type TeacherEvidenceSnapshot = Omit<TeacherEvidenceResult, 'kind'>;

export type TeacherState = {
  teacherId: string;
  historyComplete?: boolean;
  idempotency: Array<{
    key: string;
    fingerprint: string;
    result: TeacherEvidenceSnapshot;
  }>;
  observationOutcomes: Array<Record<string, unknown>>;
  cards: Array<Record<string, unknown>>;
  reviews: Array<Record<string, unknown>>;
  proficiency: Array<Record<string, unknown>>;
  knowledgeState: Array<Record<string, unknown>>;
  priority: Array<Record<string, unknown>>;
};

export type TeacherEvidenceCommit = {
  teacherId: string;
  committedAt: number;
  idempotency: {
    key: string;
    fingerprint: string;
    result: TeacherEvidenceSnapshot;
  };
  outcome: Record<string, unknown>;
  cards?: Array<Record<string, unknown>>;
  reviews?: Array<Record<string, unknown>>;
  proficiency?: Array<Record<string, unknown>>;
  knowledgeState?: Array<Record<string, unknown>>;
  priority?: Array<Record<string, unknown>>;
};

export interface TeacherProficiencyPort {
  getTeacherState(teacherId: string): Promise<TeacherState>;
  commitTeacherEvidence(commit: TeacherEvidenceCommit): Promise<void>;
}

const MAX_INTERVAL_DAYS = 180;
const APPROVED_PRIORITY_INPUTS = [
  'due_status',
  'overdue_duration',
  'current_proficiency',
  'evidence_gap',
] as const;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function asCard(value: Record<string, unknown>): SrsCardState | null {
  if (
    typeof value.cardId !== 'string'
    || typeof value.studentId !== 'string'
    || typeof value.objectiveId !== 'string'
    || typeof value.variantKey !== 'string'
    || typeof value.dueDate !== 'string'
  ) return null;
  return value as unknown as SrsCardState;
}

function deterministicCardId(teacherId: string, skillId: string): string {
  return `teacher_srs_cards:${teacherId}:${skillId}`;
}

function stateBefore(card: SrsCardState): SrsReviewLogEntry['stateBefore'] {
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    state: card.state,
    reps: card.reps,
    lapses: card.lapses,
  };
}

function stateAfter(card: SrsCardState): SrsReviewLogEntry['stateAfter'] {
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    state: card.state,
    reps: card.reps,
    lapses: card.lapses,
  };
}

function targetIdsForEvidence(
  evidence: RatedObservationEvidence,
  graph: KnowledgeSpace,
): string[] {
  if (evidence.sourceType === 'formal_q1') {
    return getComponentSkillIds(graph, evidence.componentId);
  }
  if (evidence.sourceType === 'formal_q4') return [];
  return evidence.targetSkillIds;
}

function currentCardForSkill(
  cards: readonly SrsCardState[],
  teacherId: string,
  skillId: string,
  now: string,
): SrsCardState {
  const existing = cards.find((card) => (
    card.studentId === teacherId
    && (card.variantKey === skillId || card.objectiveId === skillId)
  ));
  if (existing) {
    return {
      ...existing,
      studentId: teacherId,
      objectiveId: skillId,
      variantKey: skillId,
    };
  }
  return {
    ...createCard({ studentId: teacherId, objectiveId: skillId, variantKey: skillId, now }),
    cardId: deterministicCardId(teacherId, skillId),
  };
}

function previousProficiency(
  records: readonly Record<string, unknown>[],
  skillId: string,
): Record<string, unknown> | undefined {
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (records[index].skillId === skillId) return records[index];
  }
  return undefined;
}

/** Project priority for rated and unobserved skills at the supplied clock. */
export function projectTeacherPriority(
  teacherId: string,
  cards: readonly SrsCardState[],
  proficiency: readonly Record<string, unknown>[],
  graph: KnowledgeSpace,
  skillIds: readonly string[],
  nowMs: number,
): PriorityProjection[] {
  const componentBySkill = new Map(
    graph.edges
      .filter((edge) => edge.type === 'contains')
      .filter((edge) => graph.nodes.find((node) => node.id === edge.targetId)?.kind === 'skill')
      .map((edge) => [edge.targetId, edge.sourceId]),
  );
  return skillIds.map((skillId) => {
    const card = cards.find((item) => item.objectiveId === skillId || item.variantKey === skillId);
    const current = previousProficiency(proficiency, skillId);
    const dueAt = card ? Date.parse(card.dueDate) : nowMs;
    const due = !card || !Number.isFinite(dueAt) || dueAt <= nowMs;
    const rating = isDanielsonRating(current?.rawRating)
      ? adaptDanielsonRating(current.rawRating)
      : null;
    return {
      teacherId,
      skillId,
      componentId: typeof current?.componentId === 'string'
        ? current.componentId
        : componentBySkill.get(skillId),
      due,
      overdueDays: due && Number.isFinite(dueAt)
        ? Math.max(0, Math.floor((nowMs - dueAt) / 86_400_000))
        : 0,
      currentProficiency: rating
        ? {
            rawRating: rating.rawRating,
            points: rating.points,
            passes: rating.passes,
          }
        : { rawRating: null, points: null, passes: false },
      evidenceGaps: rating ? [] : ['no_valid_rated_evidence'],
      approvedPriorityInputs: [...APPROVED_PRIORITY_INPUTS],
    };
  });
}

function elapsedDaysAt(card: SrsCardState, nowMs: number): number {
  const reference = card.lastReview ?? card.createdAt;
  const referenceMs = Date.parse(reference);
  if (!Number.isFinite(referenceMs)) return 0;
  return Math.max(0, (nowMs - referenceMs) / 86_400_000);
}

/** Project live KST state at the supplied clock without changing stored cards. */
export function projectTeacherKnowledgeState(
  cards: readonly SrsCardState[],
  proficiency: readonly Record<string, unknown>[],
  graph: KnowledgeSpace,
  skillIds: readonly string[],
  nowMs: number,
): KnowledgeStateEntry[] {
  const cardIds = new Set(skillIds);
  const targetCards = cards.filter((card) => cardIds.has(card.objectiveId) || cardIds.has(card.variantKey));
  const targetProficiency = proficiency
    .filter((item) => typeof item.skillId === 'string' && cardIds.has(item.skillId))
    .map((item) => {
      const rating = adaptDanielsonRating(item.rawRating);
      const card = targetCards.find((candidate) => candidate.objectiveId === item.skillId);
      const retention = card && card.reps >= 1
        ? stabilityToRetention(card.stability, elapsedDaysAt(card, nowMs))
        : rating.points / 100;
      return {
        objectiveId: item.skillId as string,
        retentionStrength: Math.max(0, Math.min(1, retention)),
        practiceCoverage: 1,
        isProficient: rating.passes,
      };
    });

  const state = buildKstState(
    targetCards,
    targetProficiency,
    graph,
    nowMs,
  ).state;
  return skillIds
    .map((skillId) => state.get(skillId))
    .filter((entry): entry is KnowledgeStateEntry => entry !== undefined)
    .map((entry) => ({ ...entry }));
}

function asTargetEvidence(value: unknown): TargetEvidence | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.skillId !== 'string'
    || typeof item.componentId !== 'string'
    || (item.rawRating !== 1 && item.rawRating !== 2 && item.rawRating !== 3 && item.rawRating !== 4)
    || typeof item.points !== 'number'
    || typeof item.passes !== 'boolean'
    || (item.srsRating !== 'Again' && item.srsRating !== 'Hard'
      && item.srsRating !== 'Good' && item.srsRating !== 'Easy')
    || typeof item.idempotencyKey !== 'string'
    || typeof item.sourceRecordId !== 'string'
    || typeof item.provenanceGroupId !== 'string'
    || (item.sourceType !== 'walkthrough' && item.sourceType !== 'formal_q1'
      && item.sourceType !== 'formal_q4')
    || typeof item.occurredAt !== 'string'
  ) return null;
  return item as unknown as TargetEvidence;
}

function historicTargetEvidence(outcomes: readonly Record<string, unknown>[]): TargetEvidence[] {
  const items: TargetEvidence[] = [];
  for (const outcome of outcomes) {
    if (!Array.isArray(outcome.targetEvidence)) continue;
    for (const value of outcome.targetEvidence) {
      const item = asTargetEvidence(value);
      if (item) items.push(item);
    }
  }
  return items;
}

function compareTargetEvidence(left: TargetEvidence, right: TargetEvidence): number {
  const time = left.occurredAt.localeCompare(right.occurredAt);
  if (time !== 0) return time;
  const source = left.sourceRecordId.localeCompare(right.sourceRecordId);
  if (source !== 0) return source;
  const command = left.idempotencyKey.localeCompare(right.idempotencyKey);
  if (command !== 0) return command;
  return left.skillId.localeCompare(right.skillId);
}

function reviewFromSchedule(input: {
  before: SrsCardState;
  after: SrsCardState;
  scheduled: ReturnType<typeof scheduleReview>;
  evidence: TargetEvidence;
  teacherId: string;
  correctionIdempotencyKey?: string;
  correctionSourceRecordId?: string;
}): SrsReviewLogEntryV31 & {
  logicalReviewId: string;
  isCorrection: boolean;
  correctionIdempotencyKey?: string;
  correctionSourceRecordId?: string;
} {
  const logicalReviewId = `teacher_srs_reviews:${input.evidence.idempotencyKey}:${input.evidence.skillId}`;
  const reviewId = input.correctionIdempotencyKey
    ? `${logicalReviewId}:correction:${input.correctionIdempotencyKey}`
    : logicalReviewId;
  return {
    reviewId,
    logicalReviewId,
    isCorrection: input.correctionIdempotencyKey !== undefined,
    ...(input.correctionIdempotencyKey
      ? { correctionIdempotencyKey: input.correctionIdempotencyKey }
      : {}),
    ...(input.correctionSourceRecordId
      ? { correctionSourceRecordId: input.correctionSourceRecordId }
      : {}),
    cardId: input.after.cardId,
    studentId: input.teacherId,
    rating: input.evidence.srsRating,
    submissionId: input.evidence.sourceRecordId,
    evidence: {
      baseRating: input.evidence.srsRating,
      timingAdjusted: false,
      reasons: ['danielson_observation'],
    },
    stateBefore: stateBefore(input.before),
    stateAfter: stateAfter(input.after),
    paramsVersion: input.scheduled.paramsVersion,
    reviewedAt: input.evidence.occurredAt,
  };
}

function noEvidenceCommit(
  evidence: NoEvidenceObservation,
  fingerprint: string,
  committedAt: number,
): TeacherEvidenceCommit {
  const result = emptyEvidenceSnapshot();
  return {
    teacherId: evidence.teacherId,
    committedAt,
    idempotency: { key: evidence.idempotencyKey, fingerprint, result },
    outcome: { ...evidence },
    // These arrays document that the event has no downstream scoring effect.
    // The persistence adapter treats them as no-op projections.
    cards: [],
    reviews: [],
    proficiency: [],
    knowledgeState: [],
    priority: [],
  };
}

function emptyEvidenceSnapshot(): TeacherEvidenceSnapshot {
  return { targetEvidence: [], knowledgeState: [], priority: [] };
}

/**
 * Normalize one observation and commit its logical effect exactly once.
 * The port is the transaction boundary; this function owns no persistence.
 */
export async function processTeacherEvidence(input: {
  evidence: unknown;
  graph: KnowledgeSpace;
  now: string;
  port: TeacherProficiencyPort;
  annotations?: {
    publicComment?: string;
    privateComment?: string;
    teacherResponse?: string;
  };
}): Promise<TeacherEvidenceResult> {
  const evidence = normalizeObservationEvidence(input.evidence, input.graph);
  const nowMs = Date.parse(input.now);
  if (!Number.isFinite(nowMs)) throw new Error('now must be an ISO timestamp');
  const fingerprint = observationFingerprint(evidence);
  const current = await input.port.getTeacherState(evidence.teacherId);
  const prior = current.idempotency.find((entry) => entry.key === evidence.idempotencyKey);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      return { kind: 'idempotency_conflict', ...emptyEvidenceSnapshot() };
    }
    return {
      kind: 'replayed',
      ...clone(prior.result),
    };
  }

  if (evidence.kind === 'not_enough_evidence') {
    await input.port.commitTeacherEvidence(noEvidenceCommit(evidence, fingerprint, nowMs));
    return { kind: 'applied', targetEvidence: [], knowledgeState: [], priority: [] };
  }

  const targetSkillIds = targetIdsForEvidence(evidence, input.graph);
  // Keep an official Q1 observation even when the component has no imported
  // child skills. Such an outcome has no proficiency, KST, or SRS effect.
  if (targetSkillIds.length === 0) {
    const result = emptyEvidenceSnapshot();
    await input.port.commitTeacherEvidence({
      teacherId: evidence.teacherId,
      committedAt: nowMs,
      idempotency: { key: evidence.idempotencyKey, fingerprint, result },
      outcome: { ...evidence, targetEvidence: [] },
      cards: [],
      reviews: [],
      proficiency: [],
      knowledgeState: [],
      priority: [],
    });
    return { kind: 'applied', targetEvidence: [], knowledgeState: [], priority: [] };
  }
  const projection = adaptDanielsonRating(evidence.rating);
  const existingCards = current.cards
    .map(asCard)
    .filter((card): card is SrsCardState => card !== null);
  const cards = [...existingCards];
  const reviews: Array<SrsReviewLogEntryV31 & {
    logicalReviewId: string;
    isCorrection: boolean;
    correctionIdempotencyKey?: string;
    correctionSourceRecordId?: string;
  }> = [];
  const targetEvidence: TargetEvidence[] = [];
  const updatedProficiency = [...current.proficiency];
  const history = historicTargetEvidence(current.observationOutcomes);

  for (const skillId of targetSkillIds) {
    const item: TargetEvidence = {
      skillId,
      componentId: evidence.componentId,
      rawRating: projection.rawRating,
      points: projection.points,
      passes: projection.passes,
      srsRating: projection.srsRating,
      idempotencyKey: evidence.idempotencyKey,
      sourceRecordId: evidence.sourceRecordId,
      ...(evidence.formalObservationId ? { formalObservationId: evidence.formalObservationId } : {}),
      provenanceGroupId: evidence.provenanceGroupId,
      sourceType: evidence.sourceType,
      occurredAt: evidence.occurredAt,
    };
    targetEvidence.push(item);
    const existingSkillHistory = history.filter((candidate) => candidate.skillId === skillId);
    const currentProjection = previousProficiency(updatedProficiency, skillId);
    const parsedCurrent = asTargetEvidence(currentProjection);
    const isOutOfOrder = parsedCurrent !== null && compareTargetEvidence(item, parsedCurrent) < 0;
    if (isOutOfOrder && current.historyComplete === false) {
      throw new Error('out_of_order_history_capacity_exceeded');
    }
    const effectiveHistory = isOutOfOrder
      ? [...existingSkillHistory, item].sort(compareTargetEvidence)
      : [item];
    let before = isOutOfOrder
      ? {
          ...createCard({
            studentId: evidence.teacherId,
            objectiveId: skillId,
            variantKey: skillId,
            now: effectiveHistory[0].occurredAt,
          }),
          cardId: deterministicCardId(evidence.teacherId, skillId),
        }
      : currentCardForSkill(cards, evidence.teacherId, skillId, evidence.occurredAt);
    for (const effective of effectiveHistory) {
      const scheduled = scheduleReview({
        card: before,
        rating: effective.srsRating,
        now: effective.occurredAt,
        config: { maximumInterval: MAX_INTERVAL_DAYS },
      });
      const after = scheduled.card;
      const review = reviewFromSchedule({
        before,
        after,
        scheduled,
        evidence: effective,
        teacherId: evidence.teacherId,
      });
      if (
        effective.idempotencyKey === item.idempotencyKey
        && effective.skillId === item.skillId
      ) {
        reviews.push(review);
      } else if (isOutOfOrder && compareTargetEvidence(effective, item) > 0) {
        reviews.push(reviewFromSchedule({
          before,
          after,
          scheduled,
          evidence: effective,
          teacherId: evidence.teacherId,
          correctionIdempotencyKey: item.idempotencyKey,
          correctionSourceRecordId: item.sourceRecordId,
        }));
      }
      before = after;
    }
    const cardIndex = cards.findIndex((card) => card.objectiveId === skillId);
    if (cardIndex >= 0) cards[cardIndex] = before;
    else cards.push(before);

    const latest = effectiveHistory.at(-1) ?? item;
    const existingIndex = updatedProficiency.findIndex((record) => record.skillId === skillId);
    if (existingIndex >= 0) updatedProficiency[existingIndex] = { ...latest };
    else updatedProficiency.push({ ...latest });
  }

  const knowledgeState = projectTeacherKnowledgeState(
    cards,
    updatedProficiency,
    input.graph,
    targetSkillIds,
    nowMs,
  );
  const priority = projectTeacherPriority(
    evidence.teacherId,
    cards,
    updatedProficiency,
    input.graph,
    targetSkillIds,
    nowMs,
  );
  const result = { targetEvidence, knowledgeState, priority };
  const outcome = {
    ...evidence,
    targetEvidence: clone(targetEvidence),
  };
  const changedSkillIds = new Set(targetSkillIds);
  await input.port.commitTeacherEvidence({
    teacherId: evidence.teacherId,
    committedAt: nowMs,
    idempotency: { key: evidence.idempotencyKey, fingerprint, result: clone(result) },
    outcome,
    cards: cards
      .filter((card) => changedSkillIds.has(card.objectiveId))
      .map((card) => ({ ...card })),
    reviews: reviews.map((review) => ({ ...review })),
    proficiency: updatedProficiency
      .filter((item) => typeof item.skillId === 'string' && changedSkillIds.has(item.skillId)),
    knowledgeState: knowledgeState.map((entry) => ({ ...entry })) as Array<Record<string, unknown>>,
    priority,
  });
  return { kind: 'applied', ...result };
}
