import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildPublishedCurriculumManifest,
  type PublishedActivity,
} from '@/lib/curriculum/published-manifest';
import {
  BM2_LEARNING_EVIDENCE_PILOT,
  BM2_PILOT_SOURCE_ACTIVITY_ID,
} from '@/lib/learning-evidence/bm2-pilot';

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  fetchInternalQuery: vi.fn(),
  requireActiveStudentRequestClaims: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  requireActiveStudentRequestClaims: mocks.requireActiveStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  fetchInternalQuery: mocks.fetchInternalQuery,
  internal: {
    apiRateLimits: {
      checkAndIncrementApiRateLimit: 'internal.apiRateLimits.checkAndIncrementApiRateLimit',
    },
    activities: {
      getActivityById: 'internal.activities.getActivityById',
      submitAssessment: 'internal.activities.submitAssessment',
    },
    learningEvidence: {
      submit: 'internal.learningEvidence.submit',
    },
  },
}));

import { POST } from '@/app/api/progress/assessment/route';

const LEARNER_ID = 'profiles:bm2-real-source-student';
const SOURCE_DOCUMENT_ID = 'activities:bm2-real-unit-1-lesson-1-source';
const SUBMISSION_ID = 'activity_submissions:bm2-real-source';
const SERVER_NOW = Date.parse('2026-08-19T10:00:00.000Z');
const PILOT_SOURCE_ACTIVITY_KEY = BM2_LEARNING_EVIDENCE_PILOT.mappings[0].source.activityKey;

type NotebookItem = {
  id: string;
  category: string;
};

type StoredRow = Record<string, unknown> & { _id: string };

type InternalMutationHandler = (context: unknown, args: unknown) => Promise<unknown>;

type IndexBuilder = {
  eq(field: string, value: unknown): IndexBuilder;
  lte(field: string, value: unknown): IndexBuilder;
};

type QueryResult = {
  collect(): Promise<StoredRow[]>;
  first(): Promise<StoredRow | null>;
  order(direction: 'asc' | 'desc'): QueryResult;
  unique(): Promise<StoredRow | null>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNotebookItem(value: unknown): value is NotebookItem {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.category === 'string';
}

function getNotebookItems(source: PublishedActivity): NotebookItem[] {
  if (!isRecord(source.props) || !Array.isArray(source.props.items)) {
    throw new Error('The authored BM2 pilot source must provide notebook items.');
  }

  const items: NotebookItem[] = [];
  for (const item of source.props.items) {
    if (!isNotebookItem(item)) {
      throw new Error('Each authored BM2 notebook item must have an id and category.');
    }
    items.push(item);
  }
  if (items.length === 0) {
    throw new Error('The authored BM2 pilot source must include notebook items.');
  }
  return items;
}

function isInternalMutationHandler(value: unknown): value is InternalMutationHandler {
  return typeof value === 'function';
}

async function loadInternalMutationHandler(
  modulePath: string,
  exportName: string,
): Promise<InternalMutationHandler> {
  const source = await vi.importActual<Record<string, unknown>>(modulePath);
  const mutation = Reflect.get(source, exportName);
  if (
    (typeof mutation !== 'object' && typeof mutation !== 'function')
    || mutation === null
  ) {
    throw new Error(`${exportName} must be an exported Convex mutation.`);
  }

  const handler = Reflect.get(mutation, '_handler');
  if (!isInternalMutationHandler(handler)) {
    throw new Error(`${exportName} must expose its Convex mutation handler.`);
  }
  return handler;
}

function getPublishedSource(): PublishedActivity {
  const lesson = buildPublishedCurriculumManifest().lessons.find(
    (entry) => entry.slug === 'unit-1-lesson-1',
  );
  const source = lesson?.activities.find(
    (activity) => activity.key === PILOT_SOURCE_ACTIVITY_KEY,
  );
  if (!source) {
    throw new Error('The authored BM2 Unit 1 Lesson 1 pilot source is missing.');
  }
  return source;
}

function createProductionHarness(source: PublishedActivity) {
  const rows: Record<string, StoredRow[]> = {
    activities: [{
      _id: SOURCE_DOCUMENT_ID,
      stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
      componentKey: source.componentKey,
      displayName: source.displayName,
      description: source.description ?? null,
      props: source.props,
      gradingConfig: source.gradingConfig ?? null,
      standardId: null,
      createdAt: SERVER_NOW,
      updatedAt: SERVER_NOW,
    }],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };

  const ctx = {
    db: {
      get: async (...args: unknown[]) => {
        const id = args.length === 2 ? args[1] : args[0];
        if (typeof id !== 'string') return null;
        return Object.values(rows).flat().find((row) => row._id === id) ?? null;
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const table = rows[tableName] ?? (rows[tableName] = []);
        const id = `${tableName}:${table.length + 1}`;
        table.push({ _id: id, ...document });
        return id;
      },
      query: (tableName: string) => {
        const conditions: Array<{ field: string; kind: 'eq' | 'lte'; value: unknown }> = [];
        const index: IndexBuilder = {
          eq(field, value) {
            conditions.push({ field, kind: 'eq', value });
            return index;
          },
          lte(field, value) {
            conditions.push({ field, kind: 'lte', value });
            return index;
          },
        };
        let direction: 'asc' | 'desc' = 'asc';
        const matchingRows = () => (rows[tableName] ?? [])
          .filter((row) => conditions.every(({ field, kind, value }) => {
            const candidate = row[field];
            return kind === 'eq'
              ? candidate === value
              : typeof candidate === 'number' && typeof value === 'number' && candidate <= value;
          }))
          .sort((left, right) => Number(left.attemptOrdinal ?? left.occurredAt ?? 0)
            - Number(right.attemptOrdinal ?? right.occurredAt ?? 0));
        const result: QueryResult = {
          collect: async () => {
            const matches = matchingRows();
            return direction === 'desc' ? [...matches].reverse() : matches;
          },
          first: async () => {
            const matches = matchingRows();
            return direction === 'desc'
              ? matches.at(-1) ?? null
              : matches[0] ?? null;
          },
          order(nextDirection) {
            direction = nextDirection;
            return result;
          },
          unique: async () => {
            const matches = matchingRows();
            if (matches.length > 1) {
              throw new Error(`Expected one ${tableName} row for the indexed lookup.`);
            }
            return matches[0] ?? null;
          },
        };
        return {
          withIndex: (_indexName: string, configure: (query: IndexBuilder) => unknown) => {
            configure(index);
            return result;
          },
        };
      },
    },
  };

  return { ctx, rows };
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/progress/assessment', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('BM2 public daily producer with the authored notebook-organizer source', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveStudentRequestClaims.mockResolvedValue({
      sub: LEARNER_ID,
      role: 'student',
    });

    mocks.fetchInternalMutation.mockImplementation(async (reference: unknown) => {
      if (reference === 'internal.apiRateLimits.checkAndIncrementApiRateLimit') {
        return { allowed: true, remaining: 59, windowExpiresAt: Date.now() + 60_000 };
      }
      if (reference === 'internal.activities.submitAssessment') {
        return { id: SUBMISSION_ID };
      }
      if (reference === 'internal.learningEvidence.submit') {
        return {
          persisted: true,
          masteryApplied: false,
          kstApplied: false,
          delivery: 'new',
          decision: {
            idempotency: 'new',
            exposureState: 'introduced',
            eligible: false,
            reason: 'teacher_led',
            masteryBearing: false,
          },
        };
      }
      throw new Error(`Unexpected mutation: ${String(reference)}`);
    });
  });

  it.each([
    ['missing', undefined],
  ] as const)(
    'rejects a %s Idempotency-Key before it writes the exact authored pilot submission',
    async (_label, idempotencyKey) => {
      const source = getPublishedSource();
      const items = getNotebookItems(source);
      const answers = Object.fromEntries(items.map((item) => [item.id, item.category]));
      mocks.fetchInternalQuery.mockImplementation(async (reference: unknown) => {
        if (reference === 'internal.activities.getActivityById') {
          return {
            id: SOURCE_DOCUMENT_ID,
            stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
            componentKey: source.componentKey,
            displayName: source.displayName,
            description: source.description ?? null,
            props: source.props,
            gradingConfig: source.gradingConfig ?? null,
            standardId: null,
            createdAt: SERVER_NOW,
            updatedAt: SERVER_NOW,
          };
        }
        throw new Error(`Unexpected query: ${String(reference)}`);
      });
      const request = makeRequest({
        contractVersion: 'practice.v1',
        activityId: SOURCE_DOCUMENT_ID,
        mode: 'guided_practice',
        status: 'submitted',
        attemptNumber: 999,
        submittedAt: '1999-01-01T00:00:00.000Z',
        answers,
        parts: items.map((item) => ({
          partId: item.id,
          rawAnswer: item.category,
          isCorrect: false,
          score: 0,
          maxScore: 999,
        })),
      });
      if (idempotencyKey !== undefined) {
        request.headers.set('Idempotency-Key', idempotencyKey);
      }

      const response = await POST(request);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual(expect.objectContaining({
        error: expect.stringMatching(/idempotency-key/i),
      }));
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalledWith(
        'internal.activities.submitAssessment',
        expect.anything(),
      );
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalledWith(
        'internal.learningEvidence.submit',
        expect.anything(),
      );
    },
  );

  it('grades the authored source by its notebook items and preserves its physical identity and mode', async () => {
    const source = getPublishedSource();
    const items = getNotebookItems(source);
    const answers = Object.fromEntries(items.map((item) => [item.id, item.category]));
    const submittedAt = '1999-01-01T00:00:00.000Z';
    const parts = items.map((item) => ({
      partId: item.id,
      rawAnswer: item.category,
      isCorrect: false,
      score: 0,
      maxScore: 999,
    }));

    mocks.fetchInternalQuery.mockImplementation(async (reference: unknown) => {
      if (reference === 'internal.activities.getActivityById') {
        return {
          id: SOURCE_DOCUMENT_ID,
          stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
          componentKey: source.componentKey,
          displayName: source.displayName,
          description: source.description ?? null,
          props: source.props,
          gradingConfig: source.gradingConfig ?? null,
          standardId: null,
          createdAt: '2026-08-19T10:00:00.000Z',
          updatedAt: '2026-08-19T10:00:00.000Z',
        };
      }
      throw new Error(`Unexpected query: ${String(reference)}`);
    });

    const request = makeRequest({
      contractVersion: 'practice.v1',
      activityId: SOURCE_DOCUMENT_ID,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 999,
      submittedAt,
      answers,
      parts,
    });
    request.headers.set('Idempotency-Key', submittedAt);
    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      score: items.length,
      maxScore: items.length,
      percentage: 100,
      submissionId: SUBMISSION_ID,
    });
    expect(mocks.fetchInternalQuery).toHaveBeenCalledWith(
      'internal.activities.getActivityById',
      { activityId: SOURCE_DOCUMENT_ID },
    );
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.submitAssessment',
      expect.objectContaining({
        userId: LEARNER_ID,
        activityId: SOURCE_DOCUMENT_ID,
        score: items.length,
        maxScore: items.length,
      }),
    );
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalledWith(
      'internal.learningEvidence.submit', expect.anything(),
    );
  });

  it('reduces the server score for one wrong authored notebook category without changing the source identity', async () => {
    const source = getPublishedSource();
    const items = getNotebookItems(source);
    const wrongItem = items[0];
    if (!wrongItem) {
      throw new Error('The authored notebook source must include one item.');
    }
    const answers = Object.fromEntries(items.map((item) => [item.id, item.category]));
    answers[wrongItem.id] = `${wrongItem.category}-incorrect`;
    const submittedAt = '1999-01-01T00:00:00.000Z';
    const parts = items.map((item) => ({
      partId: item.id,
      rawAnswer: answers[item.id],
      isCorrect: true,
      score: items.length,
      maxScore: items.length,
    }));

    mocks.fetchInternalQuery.mockImplementation(async (reference: unknown) => {
      if (reference === 'internal.activities.getActivityById') {
        return {
          id: SOURCE_DOCUMENT_ID,
          stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
          componentKey: source.componentKey,
          displayName: source.displayName,
          description: source.description ?? null,
          props: source.props,
          gradingConfig: source.gradingConfig ?? null,
          standardId: null,
          createdAt: '2026-08-19T10:00:00.000Z',
          updatedAt: '2026-08-19T10:00:00.000Z',
        };
      }
      throw new Error(`Unexpected query: ${String(reference)}`);
    });

    const request = makeRequest({
      contractVersion: 'practice.v1',
      activityId: SOURCE_DOCUMENT_ID,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 999,
      submittedAt,
      answers,
      parts,
    });
    request.headers.set('Idempotency-Key', submittedAt);
    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      score: items.length - 1,
      maxScore: items.length,
      submissionId: SUBMISSION_ID,
    });
    expect(mocks.fetchInternalQuery).toHaveBeenCalledWith(
      'internal.activities.getActivityById',
      { activityId: SOURCE_DOCUMENT_ID },
    );
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.submitAssessment',
      expect.objectContaining({
        userId: LEARNER_ID,
        activityId: SOURCE_DOCUMENT_ID,
        score: items.length - 1,
        maxScore: items.length,
      }),
    );
  });

  it('replays one authored notebook-organizer submission and rejects a changed same-key request without KST or SRS effects', async () => {
    const source = getPublishedSource();
    const items = getNotebookItems(source);
    const answers = Object.fromEntries(items.map((item) => [item.id, item.category]));
    const parts = items.map((item) => ({
      partId: item.id,
      rawAnswer: item.category,
      isCorrect: false,
      score: 0,
      maxScore: 999,
    }));
    const submission = {
      contractVersion: 'practice.v1' as const,
      activityId: SOURCE_DOCUMENT_ID,
      mode: 'guided_practice' as const,
      status: 'submitted' as const,
      attemptNumber: 999,
      submittedAt: '1999-01-01T00:00:00.000Z',
      answers,
      parts,
    };
    const idempotencyKey = submission.submittedAt;
    const changedItem = items[0];
    if (!changedItem) {
      throw new Error('The authored notebook source must include one item.');
    }
    const changedAnswer = `${changedItem.category}-incorrect`;
    const { ctx, rows } = createProductionHarness(source);
    const submitAssessment = await loadInternalMutationHandler('@/convex/activities', 'submitAssessment');
    const submitLearningEvidence = await loadInternalMutationHandler('@/convex/learningEvidence', 'submit');
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);

    try {
      mocks.fetchInternalQuery.mockImplementation(async (reference: unknown) => {
        if (reference === 'internal.activities.getActivityById') {
          return {
            id: SOURCE_DOCUMENT_ID,
            stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
            componentKey: source.componentKey,
            displayName: source.displayName,
            description: source.description ?? null,
            props: source.props,
            gradingConfig: source.gradingConfig ?? null,
            standardId: null,
            createdAt: SERVER_NOW,
            updatedAt: SERVER_NOW,
          };
        }
        throw new Error(`Unexpected query: ${String(reference)}`);
      });
      mocks.fetchInternalMutation.mockImplementation(async (reference: unknown, input: unknown) => {
        if (reference === 'internal.apiRateLimits.checkAndIncrementApiRateLimit') {
          return { allowed: true, remaining: 59, windowExpiresAt: SERVER_NOW + 60_000 };
        }
        if (reference === 'internal.activities.submitAssessment') {
          return submitAssessment(ctx, input);
        }
        if (reference === 'internal.learningEvidence.submit') {
          return submitLearningEvidence(ctx, input);
        }
        throw new Error(`Unexpected mutation: ${String(reference)}`);
      });

      const firstRequest = makeRequest(submission);
      firstRequest.headers.set('Idempotency-Key', idempotencyKey);
      const firstResponse = await POST(firstRequest);

      const replayRequest = makeRequest({
        ...submission,
        parts: [...parts].reverse(),
      });
      replayRequest.headers.set('Idempotency-Key', idempotencyKey);
      const replayResponse = await POST(replayRequest);

      const changedRequest = makeRequest({
        ...submission,
        answers: { ...answers, [changedItem.id]: changedAnswer },
        parts: parts.map((part) => (
          part.partId === changedItem.id
            ? { ...part, rawAnswer: changedAnswer }
            : part
        )),
      });
      changedRequest.headers.set('Idempotency-Key', idempotencyKey);
      const changedResponse = await POST(changedRequest);

      const changedModeRequest = makeRequest({
        ...submission,
        mode: 'independent_practice',
      });
      changedModeRequest.headers.set('Idempotency-Key', idempotencyKey);
      const changedModeResponse = await POST(changedModeRequest);

      expect(source.componentKey).toBe('notebook-organizer');
      expect(source.key).toBe(PILOT_SOURCE_ACTIVITY_KEY);
      expect(idempotencyKey.trim()).not.toBe('');
      expect(firstResponse.status).toBe(200);
      const payload = await firstResponse.json();
      expect(payload).toMatchObject({
        score: items.length,
        maxScore: items.length,
        percentage: 100,
        submissionId: 'activity_submissions:1',
      });
      expect(replayResponse.status).toBe(200);
      await expect(replayResponse.json()).resolves.toEqual(payload);
      expect(changedResponse.status).toBe(409);
      await expect(changedResponse.json()).resolves.toEqual({
        error: 'Idempotency key was already used for a different submission.',
      });
      expect(changedModeResponse.status).toBe(409);
      await expect(changedModeResponse.json()).resolves.toEqual({
        error: 'Idempotency key was already used for a different submission.',
      });
      expect(mocks.fetchInternalQuery).toHaveBeenCalledWith(
        'internal.activities.getActivityById',
        { activityId: SOURCE_DOCUMENT_ID },
      );

      const assessmentCalls = mocks.fetchInternalMutation.mock.calls.filter(([reference]) => (
        reference === 'internal.activities.submitAssessment'
      ));
      expect(assessmentCalls).toEqual([
        ['internal.activities.submitAssessment', expect.objectContaining({ idempotencyKey })],
        ['internal.activities.submitAssessment', expect.objectContaining({ idempotencyKey })],
        ['internal.activities.submitAssessment', expect.objectContaining({ idempotencyKey })],
        ['internal.activities.submitAssessment', expect.objectContaining({ idempotencyKey })],
      ]);

      expect(rows.activity_submissions).toHaveLength(1);
      const storedSubmission = rows.activity_submissions[0];
      expect(storedSubmission).toEqual(expect.objectContaining({
        _id: 'activity_submissions:1',
        userId: LEARNER_ID,
        activityId: SOURCE_DOCUMENT_ID,
        stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
        masteryContractVersion: 'learning-evidence.v1',
        attemptOrdinal: 1,
        submittedAt: SERVER_NOW,
        gradedAt: SERVER_NOW,
      }));
      expect(storedSubmission?.submissionData).toEqual(expect.objectContaining({
        activityId: SOURCE_DOCUMENT_ID,
        mode: 'guided_practice',
        status: 'graded',
        attemptNumber: 1,
        submittedAt: new Date(SERVER_NOW).toISOString(),
        answers,
      }));

      expect(mocks.fetchInternalMutation.mock.calls.filter(([reference]) => (
        reference === 'internal.learningEvidence.submit'
      ))).toHaveLength(0);
      expect(rows.learning_evidence).toEqual([]);
      expect(rows.learning_evidence_receipts).toEqual([]);
      expect(rows.srs_cards).toEqual([]);
      expect(rows.srs_review_log).toEqual([]);
    } finally {
      nowSpy.mockRestore();
    }
  });
});
