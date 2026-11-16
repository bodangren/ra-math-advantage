import { describe, expect, it, vi } from 'vitest';

import type { MutationCtx } from '@/convex/_generated/server';
import { createIm3ServerOwnedSubmissionHandler } from '@/convex/learningEvidence';
import {
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from '@/lib/practice/learning-evidence-pilot';

const LEARNER_ID = 'profiles:large-attempt-history';
const ACTIVITY_ID = 'activities:large-attempt-history';
const SUBMISSION_ID = 'activity_submissions:attempt-1001';
const MASTERY_ACTIVITY_ID = `${IM3_PILOT_NODE}.independent_practice`;

type Row = Record<string, unknown> & { _id: string };

function createContext() {
  const teacherExposure: Row = {
    _id: 'learning_evidence:teacher-exposure',
    learnerId: LEARNER_ID,
    contractVersion: 'learning-evidence.v1',
    nodeId: IM3_PILOT_NODE,
    activityId: `${IM3_PILOT_NODE}.worked_example`,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'worked_example',
    occurredAt: Date.parse('2026-08-19T08:00:00.000Z'),
    idempotencyKey: 'im3-large-history-teacher-exposure',
    createdAt: 1,
  };
  const acceptedMasteryAttempts = Array.from({ length: 1000 }, (_, index): Row => {
    const attemptOrdinal = index + 2;
    return {
      _id: `learning_evidence:mastery-${attemptOrdinal}`,
      learnerId: LEARNER_ID,
      contractVersion: 'learning-evidence.v1',
      nodeId: IM3_PILOT_NODE,
      activityId: MASTERY_ACTIVITY_ID,
      attemptOrdinal,
      origin: 'mastery_advantage',
      mode: 'independent_practice',
      occurredAt: Date.parse('2026-08-19T09:00:00.000Z') + attemptOrdinal,
      gradedEvidence: { isCorrect: false, score: 0, maxScore: 6 },
      idempotencyKey: `im3-large-history-mastery-${attemptOrdinal}`,
      createdAt: attemptOrdinal,
    };
  });
  const rows: Record<string, Row[]> = {
    learning_evidence: [teacherExposure, ...acceptedMasteryAttempts],
    learning_evidence_receipts: [],
    activity_submissions: [{
      _id: SUBMISSION_ID,
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      masteryContractVersion: 'learning-evidence.v1',
      attemptOrdinal: 1001,
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: MASTERY_ACTIVITY_ID,
        mode: 'independent_practice',
        status: 'graded',
        attemptNumber: 1001,
        submittedAt: '2026-08-19T10:00:00.000Z',
        answers: {},
        parts: [],
      },
      score: 0,
      maxScore: 6,
      submittedAt: Date.parse('2026-08-19T10:00:00.000Z'),
      gradedAt: Date.parse('2026-08-19T10:01:00.000Z'),
    }],
    activities: [{
      _id: ACTIVITY_ID,
      stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
      learningEvidenceMode: 'independent_practice',
    }],
  };
  const inserts: string[] = [];

  const query = (tableName: string) => ({
    withIndex: (
      _indexName: string,
      configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
    ) => {
      const conditions = new Map<string, unknown>();
      const index = {
        eq(field: string, value: unknown) {
          conditions.set(field, value);
          return index;
        },
      };
      configure(index);
      const selected = () => (rows[tableName] ?? []).filter((row) => (
        [...conditions].every(([field, value]) => row[field] === value)
      ));
      let direction: 'asc' | 'desc' | undefined;
      const ordered = () => {
        const selectedRows = selected();
        if (!direction) return selectedRows;
        return [...selectedRows].sort((left, right) => {
          const leftOccurredAt = Number(left.occurredAt ?? left.createdAt ?? 0);
          const rightOccurredAt = Number(right.occurredAt ?? right.createdAt ?? 0);
          const comparison = leftOccurredAt - rightOccurredAt;
          return direction === 'desc' ? -comparison : comparison;
        });
      };
      const result = {
        unique: async () => ordered()[0] ?? null,
        first: async () => ordered()[0] ?? null,
        collect: async () => ordered(),
        take: async (limit: number) => ordered().slice(0, limit),
        order: (nextDirection: 'asc' | 'desc') => {
          direction = nextDirection;
          return result;
        },
      };
      return result;
    },
  });
  const get = async (...args: string[]) => {
    const id = args.at(-1);
    return Object.values(rows).flat().find((row) => row._id === id) ?? null;
  };
  const insert = async (tableName: string, document: Record<string, unknown>) => {
    const id = `${tableName}:inserted-${inserts.length + 1}`;
    (rows[tableName] ??= []).push({ _id: id, ...document });
    inserts.push(tableName);
    return id;
  };

  return {
    ctx: {
      db: { query, get, insert },
      auth: { getUserIdentity: async () => null },
    } as unknown as MutationCtx,
    inserts,
  };
}

describe('IM3 opaque submission attempt ordering', () => {
  it('rejects a reused ordinal after more than 1,000 accepted records', async () => {
    const { ctx, inserts } = createContext();
    const masteryBridge = vi.fn(async () => undefined);
    const handler = createIm3ServerOwnedSubmissionHandler({
      ctx,
      learnerId: LEARNER_ID,
      masteryBridge,
    });

    const result = await handler.process({ submissionId: SUBMISSION_ID });

    expect(result).toEqual({
      accepted: false,
      reason: 'attempt_ordinal_conflict',
      latestAttemptOrdinal: 1001,
      receivedAttemptOrdinal: 1001,
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(inserts).toEqual([]);
  });
});
