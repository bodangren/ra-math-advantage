import type { KnowledgeSpace } from '@math-platform/knowledge-space-core';

import {
  processTeacherEvidence,
  type TeacherEvidenceCommit,
  type TeacherProficiencyPort,
  type TeacherState,
} from './processor';

function emptyTeacherState(teacherId: string): TeacherState {
  return {
    teacherId,
    historyComplete: true,
    idempotency: [],
    observationOutcomes: [],
    cards: [],
    reviews: [],
    proficiency: [],
    knowledgeState: [],
    priority: [],
  };
}

function upsertRows(
  rows: Array<Record<string, unknown>>,
  updates: readonly Record<string, unknown>[],
  key: string,
) {
  for (const update of updates) {
    const index = rows.findIndex((row) => row[key] === update[key]);
    if (index >= 0) rows[index] = update;
    else rows.push(update);
  }
}

function applyCommit(state: TeacherState, commit: TeacherEvidenceCommit) {
  state.idempotency.push(commit.idempotency);
  state.observationOutcomes.push(commit.outcome);
  upsertRows(state.cards, commit.cards ?? [], 'objectiveId');
  upsertRows(state.reviews, commit.reviews ?? [], 'reviewId');
  upsertRows(state.proficiency, commit.proficiency ?? [], 'skillId');
  upsertRows(state.knowledgeState, commit.knowledgeState ?? [], 'nodeId');
  upsertRows(state.priority, commit.priority ?? [], 'skillId');
}

function eventOrder(left: unknown, right: unknown): number {
  const leftValue = left as Record<string, unknown>;
  const rightValue = right as Record<string, unknown>;
  const time = String(leftValue.occurredAt ?? leftValue.eventTime ?? '')
    .localeCompare(String(rightValue.occurredAt ?? rightValue.eventTime ?? ''));
  if (time !== 0) return time;
  const source = String(leftValue.sourceRecordId ?? '').localeCompare(String(rightValue.sourceRecordId ?? ''));
  if (source !== 0) return source;
  return String(leftValue.idempotencyKey ?? '').localeCompare(String(rightValue.idempotencyKey ?? ''));
}

/** Replay a bounded effective evidence timeline from an empty teacher state. */
export async function replayTeacherEvidence(input: {
  teacherId: string;
  evidence: readonly unknown[];
  graph: KnowledgeSpace;
  now: string;
}) {
  const state = emptyTeacherState(input.teacherId);
  const commits: TeacherEvidenceCommit[] = [];
  const port: TeacherProficiencyPort = {
    async getTeacherState() {
      return state;
    },
    async commitTeacherEvidence(commit) {
      applyCommit(state, commit);
      commits.push(commit);
    },
  };
  for (const rawEvidence of [...input.evidence].sort(eventOrder)) {
    const evidence = rawEvidence && typeof rawEvidence === 'object'
      ? Object.fromEntries(
          Object.entries(rawEvidence).filter(
            ([field]) => field !== 'scoringEffect' && field !== 'targetEvidence',
          ),
        )
      : rawEvidence;
    const result = await processTeacherEvidence({ evidence, graph: input.graph, now: input.now, port });
    if (result.kind === 'idempotency_conflict') throw new Error('idempotency_conflict');
  }
  return { state: structuredClone(state), commits };
}
