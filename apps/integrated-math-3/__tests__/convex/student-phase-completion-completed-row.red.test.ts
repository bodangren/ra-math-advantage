import { describe, expect, it } from 'vitest';

import { completePhase } from '@/convex/student';

const LEARNER_ID = 'profiles:completed-phase-student';
const LESSON_ID = 'lessons:module-1-lesson-1';
const LESSON_VERSION_ID = 'lesson_versions:module-1-lesson-1:published';
const PHASE_ID = 'phase_versions:module-1-lesson-1:4';
const SOURCE_ACTIVITY_ID = 'activities:module-1-lesson-1:phase-4-source';
const COMPLETED_PROGRESS_ID = 'student_progress:completed-row';

type Row = Record<string, unknown> & { _id: string };

type CompletionHandler = (
  context: { db: Record<string, unknown> },
  args: {
    userId: string;
    lessonId: string;
    phaseNumber: number;
    timeSpent: number;
    idempotencyKey: string;
  },
) => Promise<Record<string, unknown>>;

const completePhaseHandler = (completePhase as unknown as {
  _handler: CompletionHandler;
})._handler;

function createCompletedPhaseHarness() {
  const rows: Record<string, Row[]> = {
    lessons: [{
      _id: LESSON_ID,
      slug: 'module-1-lesson-1',
      title: 'Graph quadratic functions',
      unitNumber: 1,
      orderIndex: 1,
    }],
    lesson_versions: [{
      _id: LESSON_VERSION_ID,
      lessonId: LESSON_ID,
      version: 1,
      status: 'published',
      createdAt: 1,
    }],
    phase_versions: [{
      _id: PHASE_ID,
      lessonVersionId: LESSON_VERSION_ID,
      phaseNumber: 4,
      phaseType: 'worked_example',
      createdAt: 1,
    }],
    phase_sections: [{
      _id: 'phase_sections:module-1-lesson-1:4:3',
      phaseVersionId: PHASE_ID,
      sequenceOrder: 3,
      sectionType: 'activity',
      content: { componentKey: 'graphing-explorer', activityId: SOURCE_ACTIVITY_ID },
    }],
    activities: [{
      _id: SOURCE_ACTIVITY_ID,
      stableActivityId: 'math.im3.skill.1.1.graph-quadratic-functions.worked_example',
      masteryNodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
      componentKey: 'graphing-explorer',
      learningEvidenceMode: 'worked_example',
      srsEligible: false,
    }],
    student_progress: [{
      _id: COMPLETED_PROGRESS_ID,
      userId: LEARNER_ID,
      phaseId: PHASE_ID,
      status: 'completed',
      completedAt: 100,
      timeSpentSeconds: 60,
      idempotencyKey: 'existing-completed-phase-key',
      createdAt: 100,
      updatedAt: 100,
    }],
  };
  const inserts: Array<{ table: string; document: Record<string, unknown> }> = [];
  const patches: Array<{ id: string; document: Record<string, unknown> }> = [];

  function select(table: string, conditions: ReadonlyMap<string, unknown>) {
    return (rows[table] ?? []).filter((row) => (
      [...conditions].every(([field, value]) => row[field] === value)
    ));
  }

  const db = {
    get: async (id: string) => Object.values(rows).flat().find((row) => row._id === id) ?? null,
    query: (table: string) => ({
      withIndex: (
        _index: string,
        configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
      ) => {
        const conditions = new Map<string, unknown>();
        const query = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return query;
          },
        };
        configure(query);
        const result = {
          unique: async () => select(table, conditions)[0] ?? null,
          first: async () => select(table, conditions)[0] ?? null,
          collect: async () => select(table, conditions),
          order: () => result,
        };
        return result;
      },
    }),
    insert: async (table: string, document: Record<string, unknown>) => {
      inserts.push({ table, document });
      return `${table}:unexpected-insert`;
    },
    patch: async (id: string, document: Record<string, unknown>) => {
      patches.push({ id, document });
      const row = Object.values(rows).flat().find((candidate) => candidate._id === id);
      if (row) Object.assign(row, document);
    },
  };

  return { context: { db }, rows, inserts, patches };
}

describe('student completePhase completed-row handling', () => {
  it('rejects a new key after an already completed phase', async () => {
    const harness = createCompletedPhaseHarness();

    await expect(completePhaseHandler(harness.context, {
      userId: LEARNER_ID,
      lessonId: 'module-1-lesson-1',
      phaseNumber: 4,
      timeSpent: 60,
      idempotencyKey: 'new-key-after-completed-phase',
    })).rejects.toThrow(/^phase_already_completed$/);

    expect(harness.inserts).toEqual([]);
    expect(harness.patches).toEqual([]);
    expect(harness.rows.student_progress).toStrictEqual([expect.objectContaining({
      _id: COMPLETED_PROGRESS_ID,
      status: 'completed',
      idempotencyKey: 'existing-completed-phase-key',
    })]);
  });
});
