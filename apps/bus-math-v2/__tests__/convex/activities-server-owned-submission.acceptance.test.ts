import { describe, expect, it, vi } from 'vitest';

import { BM2_PILOT_SOURCE_ACTIVITY_ID } from '@/lib/learning-evidence/bm2-pilot';
import { accountingEquationFamily } from '@/lib/practice/engine/families/accounting-equation';

const LEARNER_ID = 'profiles:bm2-server-owned-generated-student';
const CREATE_KEY = 'bm2-generated-create-key';
const SOURCE_ACTIVITY_DOCUMENT_ID = 'activities:bm2-server-owned-source-row';

type Row = Record<string, unknown> & { _id: string };

type ServerOwnedSubmissionHandler = (ctx: unknown, args: {
  userId: string;
  activityId: string;
  submissionData: Record<string, unknown>;
  idempotencyKey: string;
}) => Promise<{
  submissionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  attemptOrdinal: number;
}>;

async function loadHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createServerOwnedSubmission;
  if (
    (typeof mutation !== 'object' && typeof mutation !== 'function')
    || mutation === null
    || !('_handler' in mutation)
  ) {
    throw new Error('BM2 must export internal createServerOwnedSubmission for generated accounting variants.');
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== 'function') {
    throw new Error('BM2 createServerOwnedSubmission must expose a Convex mutation handler.');
  }
  return handler as ServerOwnedSubmissionHandler;
}

function makePilotSourceActivity(): Row {
  return {
    _id: SOURCE_ACTIVITY_DOCUMENT_ID,
    stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
    componentKey: 'notebook-organizer',
    displayName: 'The Notebook Organizer',
    description: "Help Sarah sort her messy desk into 'What she has' vs 'What she owes'.",
    props: {},
    gradingConfig: {},
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [makePilotSourceActivity()],
    activity_submissions: [],
  };
  const indexCalls: Array<{
    tableName: string;
    indexName: string;
    conditions: Array<[string, unknown]>;
  }> = [];

  const selectedRows = (tableName: string, conditions: ReadonlyMap<string, unknown>) => (
    (rows[tableName] ?? []).filter((row) => (
      [...conditions].every(([field, value]) => row[field] === value)
    ))
  );

  const ctx = {
    db: {
      query: (tableName: string) => {
        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        const result = {
          unique: async () => {
            const matchingRows = selectedRows(tableName, conditions);
            if (tableName === 'activities' && matchingRows.length > 1) {
              throw new Error('Expected one provisioned BM2 pilot source activity');
            }
            return matchingRows[0] ?? null;
          },
          first: async () => selectedRows(tableName, conditions)[0] ?? null,
          order: () => result,
        };
        return {
          withIndex: (indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
            indexCalls.push({ tableName, indexName, conditions: [...conditions] });
            return result;
          },
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        if (tableName !== 'activity_submissions') {
          throw new Error(`Unexpected table insert: ${tableName}`);
        }
        if (document.activityId !== SOURCE_ACTIVITY_DOCUMENT_ID) {
          throw new Error('activity_submissions.activityId must be a real activities document ID');
        }
        const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
        (rows[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
    },
  };

  return { ctx, rows, indexCalls };
}

function makeGeneratedEnvelope(answerOverride?: number): {
  definition: ReturnType<typeof accountingEquationFamily.generate>;
  submissionData: Record<string, unknown>;
} {
  const definition = accountingEquationFamily.generate(7, { mode: 'independent_practice' });
  const hiddenTermId = definition.equation.hiddenTermId;
  const answer = answerOverride ?? definition.equation[hiddenTermId];

  return {
    definition,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: definition.activityId,
      mode: 'independent_practice',
      status: 'submitted',
      // This browser ordinal and these browser grades are deliberately forged.
      attemptNumber: 99,
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: { [hiddenTermId]: answer },
      parts: [{
        partId: hiddenTermId,
        rawAnswer: answer,
        isCorrect: false,
        score: 0,
        maxScore: 99,
      }],
    },
  };
}

describe('BM2 generated accounting-equation server-owned submission', () => {
  it('rejects generated grading while the exact three-mode pilot is not published', async () => {
    const handler = await loadHandler();
    const { ctx, rows, indexCalls } = createHarness();
    const { definition, submissionData } = makeGeneratedEnvelope();
    const hiddenTermId = definition.equation.hiddenTermId;
    const answer = definition.equation[hiddenTermId];

    await expect(handler(ctx, {
      userId: LEARNER_ID,
      activityId: definition.activityId,
      submissionData,
      idempotencyKey: CREATE_KEY,
    })).rejects.toThrow(/not published/i);

    expect(definition.activityId).toMatch(/^accounting-equation-7-(assets|liabilities|equity)$/);
    expect(answer).toBe(definition.equation[hiddenTermId]);
    expect(rows.activity_submissions).toEqual([]);
    expect(indexCalls).toEqual([]);
  });

  it('does not create an idempotency record for an unpublished generated pilot', async () => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();
    const { definition, submissionData } = makeGeneratedEnvelope();

    await expect(handler(ctx, {
      userId: LEARNER_ID,
      activityId: definition.activityId,
      submissionData,
      idempotencyKey: CREATE_KEY,
    })).rejects.toThrow(/not published/i);
    expect(rows.activity_submissions).toEqual([]);
  });

  it.each([
    ['the worked-example mode', { mode: 'worked_example' }],
    ['the guided-practice mode', { mode: 'guided_practice' }],
    ['the assessment mode', { mode: 'assessment' }],
    ['the teaching mode', { mode: 'teaching' }],
    ['the draft status', { status: 'draft' }],
    ['the graded status', { status: 'graded' }],
    ['the returned status', { status: 'returned' }],
  ])('rejects %s before it can create a generated submission', async (_label, override) => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();
    const { definition, submissionData } = makeGeneratedEnvelope();

    await expect(handler(ctx, {
      userId: LEARNER_ID,
      activityId: definition.activityId,
      submissionData: { ...submissionData, ...override },
      idempotencyKey: CREATE_KEY,
    })).rejects.toThrow();
    expect(rows.activity_submissions).toHaveLength(0);
  });
});
