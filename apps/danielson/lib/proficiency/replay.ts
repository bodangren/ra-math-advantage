import type { KnowledgeSpace } from '@math-platform/knowledge-space-core';

import {
  applyTeacherEvidenceCommitToState,
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
  let state = emptyTeacherState(input.teacherId);
  const commits: TeacherEvidenceCommit[] = [];
  const port: TeacherProficiencyPort = {
    async getTeacherState() {
      return structuredClone(state);
    },
    async commitTeacherEvidence(commit) {
      state = applyTeacherEvidenceCommitToState(state, commit);
      commits.push(structuredClone(commit));
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
    await processTeacherEvidence({ evidence, graph: input.graph, now: input.now, port });
  }
  return { state: structuredClone(state), commits };
}
