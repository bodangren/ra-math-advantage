import type { QueryCtx, MutationCtx } from '../../convex/_generated/server';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { SrsCardState, SrsReviewLogEntryV31 } from '@math-platform/srs-engine';

import {
  applyTeacherEvidenceCommitToState,
  type TeacherEvidenceCommit,
  type TeacherEvidenceSnapshot,
  type TeacherProficiencyPort,
  type TeacherState,
} from './processor';

const MAX_TEACHER_ROWS = 200;
const MAX_REBUILD_OUTCOMES = 2_000;

type ReaderDb = QueryCtx['db'];
type WriterDb = MutationCtx['db'];
type StateRows = {
  idempotency: Doc<'teacher_proficiency_idempotency'>[];
  outcomes: Doc<'teacher_observation_outcomes'>[];
  cards: Doc<'teacher_srs_cards'>[];
  proficiency: Doc<'teacher_proficiency'>[];
  knowledgeState: Doc<'teacher_knowledge_state'>[];
  priority: Doc<'teacher_priority'>[];
  supersessions: Doc<'teacher_evidence_supersessions'>[];
};

function stateDefaults(teacherId: string): TeacherState {
  return {
    teacherId,
    idempotency: [],
    observationOutcomes: [],
    cards: [],
    reviews: [],
    proficiency: [],
    knowledgeState: [],
    priority: [],
  };
}

/** Load only the bounded mutable scoring state used by processing. */
async function readStateRows(
  db: ReaderDb,
  organizationId: Id<'organizations'>,
  teacherId: string,
): Promise<StateRows> {
  const [idempotency, outcomes, cards, proficiency, knowledgeState, priority, supersessions] = await Promise.all([
    db.query('teacher_proficiency_idempotency')
      .withIndex('by_organizationId_and_teacherId', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherId', teacherId))
      .order('asc')
      .take(MAX_TEACHER_ROWS),
    db.query('teacher_observation_outcomes')
      .withIndex('by_organizationId_and_teacherId_and_occurredAt', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherId', teacherId))
      .order('desc')
      .take(MAX_REBUILD_OUTCOMES + 1),
    db.query('teacher_srs_cards')
      .withIndex('by_organizationId_and_teacherId', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherId', teacherId))
      .order('asc')
      .take(MAX_TEACHER_ROWS),
    db.query('teacher_proficiency')
      .withIndex('by_organizationId_and_teacherId', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherId', teacherId))
      .order('asc')
      .take(MAX_TEACHER_ROWS),
    db.query('teacher_knowledge_state')
      .withIndex('by_organizationId_and_teacherId', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherId', teacherId))
      .order('asc')
      .take(MAX_TEACHER_ROWS),
    db.query('teacher_priority')
      .withIndex('by_organizationId_and_teacherId', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherId', teacherId))
      .order('asc')
      .take(MAX_TEACHER_ROWS),
    db.query('teacher_evidence_supersessions')
      .withIndex('by_org_teacher_occurred', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherProfileId', teacherId as Id<'teacher_profiles'>))
      .order('asc')
      .take(MAX_REBUILD_OUTCOMES + 1),
  ]);
  return { idempotency, outcomes, cards, proficiency, knowledgeState, priority, supersessions };
}

function stateFromRows(teacherId: string, rows: StateRows): TeacherState {
  const supersededKeys = new Set(rows.supersessions.map((row) => row.supersededEvidenceKey));
  return {
    ...stateDefaults(teacherId),
    historyComplete: rows.outcomes.length <= MAX_REBUILD_OUTCOMES,
    idempotency: rows.idempotency.map((row) => ({
      key: row.idempotencyKey,
      fingerprint: row.fingerprint,
      result: row.result as unknown as TeacherEvidenceSnapshot,
    })),
    observationOutcomes: rows.outcomes
      .slice(0, MAX_REBUILD_OUTCOMES)
      .filter((row) => !supersededKeys.has(row.idempotencyKey))
      .sort((left, right) => left.occurredAt - right.occurredAt)
      .map((row) => ({ ...row.outcome })),
    cards: rows.cards.map((row) => ({ ...row.card })),
    reviews: [],
    proficiency: rows.proficiency.map((row) => ({ ...row.projection })),
    knowledgeState: rows.knowledgeState.map((row) => ({ ...row.state })),
    priority: rows.priority.map((row) => ({ ...row.projection })),
  };
}

function asCard(value: Record<string, unknown>): SrsCardState {
  return value as unknown as SrsCardState;
}

function asReview(value: Record<string, unknown>): SrsReviewLogEntryV31 {
  return value as unknown as SrsReviewLogEntryV31;
}

function projectionState(value: Record<string, unknown>) {
  return {
    nodeId: String(value.nodeId),
    mastery: Number(value.mastery ?? 0),
    retention: Number(value.retention ?? 0),
    isProficient: value.isProficient === true,
    state: value.state as 'mastered' | 'decaying' | 'inProgress' | 'untouched',
    ...(typeof value.lastUpdated === 'number' ? { lastUpdated: value.lastUpdated } : {}),
  };
}

/** Create a transaction-backed teacher proficiency port for one organization. */
export function createDanielsonTeacherProficiencyPort(
  ctx: Pick<MutationCtx, 'db'>,
  organizationId: Id<'organizations'>,
): TeacherProficiencyPort {
  const db = ctx.db as WriterDb;
  let cachedTeacherId: string | null = null;
  let cachedRows: StateRows | null = null;
  let cachedState: TeacherState | null = null;

  return {
    async getTeacherState(teacherId) {
      if (cachedTeacherId === teacherId && cachedState) return structuredClone(cachedState);
      const rows = await readStateRows(db, organizationId, teacherId);
      cachedTeacherId = teacherId;
      cachedRows = rows;
      cachedState = stateFromRows(teacherId, rows);
      return structuredClone(cachedState);
    },

    async commitTeacherEvidence(commit: TeacherEvidenceCommit) {
      const occurredAtValue = commit.outcome.occurredAt;
      const normalizedEventTime = typeof occurredAtValue === 'string'
        ? Date.parse(occurredAtValue)
        : Number.NaN;
      if (!Number.isFinite(normalizedEventTime)) throw new Error('invalid_event_time');
      if (!Number.isFinite(commit.committedAt)) throw new Error('invalid_commit_time');
      const occurredAt = normalizedEventTime;
      const now = commit.committedAt;
      const outcomeId = `teacher_observation_outcomes:${commit.teacherId}:${commit.idempotency.key}`;

      const existingKey = await db.query('teacher_proficiency_idempotency')
        .withIndex('by_organizationId_and_idempotencyKey', (query) => query
          .eq('organizationId', organizationId)
          .eq('idempotencyKey', commit.idempotency.key))
        .unique();
      if (existingKey) {
        if (existingKey.fingerprint !== commit.idempotency.fingerprint) {
          throw new Error('idempotency_conflict');
        }
        return;
      }

      const rows = cachedTeacherId === commit.teacherId && cachedRows
        ? cachedRows
        : await readStateRows(db, organizationId, commit.teacherId);
      cachedTeacherId = commit.teacherId;
      cachedRows = rows;
      const cardBySkill = new Map(rows.cards.map((row) => [row.skillId, row]));
      const proficiencyBySkill = new Map(rows.proficiency.map((row) => [row.skillId, row]));
      const stateByNode = new Map(rows.knowledgeState.map((row) => [row.nodeId, row]));
      const priorityBySkill = new Map(rows.priority.map((row) => [row.skillId, row]));

      await db.insert('teacher_proficiency_idempotency', {
        organizationId,
        teacherId: commit.teacherId,
        idempotencyKey: commit.idempotency.key,
        fingerprint: commit.idempotency.fingerprint,
        result: commit.idempotency.result as never,
        outcomeId,
        createdAt: now,
      });
      await db.insert('teacher_observation_outcomes', {
        organizationId,
        teacherId: commit.teacherId,
        idempotencyKey: commit.idempotency.key,
        outcome: commit.outcome as never,
        occurredAt,
        createdAt: now,
      });

      for (const rawCard of commit.cards ?? []) {
        const card = asCard(rawCard);
        const existing = cardBySkill.get(card.objectiveId);
        const row = {
          organizationId,
          teacherId: commit.teacherId,
          skillId: card.objectiveId,
          variantKey: card.variantKey,
          card,
          updatedAt: now,
        };
        if (existing) await db.patch(existing._id, row);
        else {
          const id = await db.insert('teacher_srs_cards', row);
          cardBySkill.set(card.objectiveId, {
            ...row,
            _id: id,
            _creationTime: now,
          } as Doc<'teacher_srs_cards'>);
        }
      }

      for (const rawReview of commit.reviews ?? []) {
        const review = asReview(rawReview);
        const logicalReviewId = typeof rawReview.logicalReviewId === 'string'
          ? rawReview.logicalReviewId
          : review.reviewId;
        const isCorrection = rawReview.isCorrection === true;
        const row = {
          organizationId,
          teacherId: commit.teacherId,
          cardId: review.cardId,
          reviewId: review.reviewId,
          logicalReviewId,
          isCorrection,
          ...(typeof rawReview.correctionIdempotencyKey === 'string'
            ? { correctionIdempotencyKey: rawReview.correctionIdempotencyKey }
            : {}),
          ...(typeof rawReview.correctionSourceRecordId === 'string'
            ? { correctionSourceRecordId: rawReview.correctionSourceRecordId }
            : {}),
          sourceRecordId: review.submissionId,
          reviewedAt: review.reviewedAt,
          review: {
            reviewId: review.reviewId,
            cardId: review.cardId,
            studentId: review.studentId,
            rating: review.rating,
            submissionId: review.submissionId,
            paramsVersion: review.paramsVersion,
            reviewedAt: review.reviewedAt,
            evidence: review.evidence,
            stateBefore: review.stateBefore,
            stateAfter: review.stateAfter,
          },
          createdAt: now,
        };
        await db.insert('teacher_srs_reviews', row);
      }

      for (const projection of commit.proficiency ?? []) {
        const skillId = String(projection.skillId);
        const existing = proficiencyBySkill.get(skillId);
        const row = {
          organizationId,
          teacherId: commit.teacherId,
          skillId,
          projection: projection as never,
          updatedAt: now,
        };
        if (existing) await db.patch(existing._id, row);
        else {
          const id = await db.insert('teacher_proficiency', row);
          proficiencyBySkill.set(skillId, { ...row, _id: id, _creationTime: now } as Doc<'teacher_proficiency'>);
        }
      }

      for (const rawState of commit.knowledgeState ?? []) {
        const state = projectionState(rawState);
        const existing = stateByNode.get(state.nodeId);
        const row = { organizationId, teacherId: commit.teacherId, nodeId: state.nodeId, state, updatedAt: now };
        if (existing) await db.patch(existing._id, row);
        else {
          const id = await db.insert('teacher_knowledge_state', row);
          stateByNode.set(state.nodeId, { ...row, _id: id, _creationTime: now } as Doc<'teacher_knowledge_state'>);
        }
      }

      for (const projection of commit.priority ?? []) {
        const skillId = String(projection.skillId);
        const existing = priorityBySkill.get(skillId);
        const row = {
          organizationId,
          teacherId: commit.teacherId,
          skillId,
          projection: projection as never,
          updatedAt: now,
        };
        if (existing) await db.patch(existing._id, row);
        else {
          const id = await db.insert('teacher_priority', row);
          priorityBySkill.set(skillId, { ...row, _id: id, _creationTime: now } as Doc<'teacher_priority'>);
        }
      }
      if (cachedTeacherId === commit.teacherId && cachedState) {
        cachedState = applyTeacherEvidenceCommitToState(cachedState, commit);
      }
    },
  };
}

export { readStateRows };
