import { describe, expect, it } from 'vitest';
import { seedDemoProgress } from '@/convex/seed/seed_demo_progress';

type Row = Record<string, unknown> & { _id: string };

function makeFixture(options: { omitStudent5?: boolean; existingStudent4Phase4?: Row } = {}) {
  const tables = new Map<string, Row[]>();
  let nextId = 1;
  const rows = (table: string) => {
    const value = tables.get(table) ?? [];
    tables.set(table, value);
    return value;
  };
  const add = (table: string, row: Row) => rows(table).push(row);

  add('lessons', { _id: 'lessons:1', slug: 'module-1-lesson-1' });
  add('lesson_versions', { _id: 'lesson_versions:1', lessonId: 'lessons:1' });
  for (let phase = 1; phase <= 12; phase += 1) {
    add('phase_versions', {
      _id: `phase_versions:${phase}`,
      lessonVersionId: 'lesson_versions:1',
      phaseNumber: phase,
      phaseType: phase % 2 === 0 ? 'guided_practice' : 'learn',
    });
    if (phase % 2 === 0) {
      add('activities', { _id: `activities:${phase}`, componentKey: 'test-activity' });
      add('phase_sections', {
        _id: `phase_sections:${phase}`,
        phaseVersionId: `phase_versions:${phase}`,
        sectionType: 'activity',
        content: { activityId: `activities:${phase}` },
      });
      if (phase === 2) {
        add('phase_sections', {
          _id: 'phase_sections:invalid-table-id',
          phaseVersionId: 'phase_versions:2',
          sectionType: 'activity',
          content: { activityId: 'lesson_versions:1' },
        });
        add('phase_sections', {
          _id: 'phase_sections:missing-activity',
          phaseVersionId: 'phase_versions:2',
          sectionType: 'activity',
          content: { activityId: 'activities:missing' },
        });
      }
    } else {
      add('phase_sections', {
        _id: `phase_sections:${phase}`,
        phaseVersionId: `phase_versions:${phase}`,
        sectionType: 'text',
        content: { text: `Phase ${phase}` },
      });
    }
  }
  for (let student = 1; student <= 5; student += 1) {
    if (options.omitStudent5 && student === 5) continue;
    add('profiles', { _id: `profiles:${student}`, username: `student${student}@demo` });
  }
  if (options.existingStudent4Phase4) add('student_progress', options.existingStudent4Phase4);

  const ctx = {
    db: {
      get: async (id: string) => {
        for (const stored of tables.values()) {
          const row = stored.find((candidate) => candidate._id === id);
          if (row) return row;
        }
        return null;
      },
      normalizeId: (table: string, id: unknown) =>
        typeof id === 'string' && id.startsWith(`${table}:`) ? id : null,
      query(table: string) {
        const filters: Array<[string, unknown]> = [];
        const chain = {
          withIndex(_name: string, apply: (q: { eq(field: string, value: unknown): unknown }) => unknown) {
            const q = { eq(field: string, value: unknown) { filters.push([field, value]); return q; } };
            apply(q);
            return chain;
          },
          async first() { return rows(table).find((row) => filters.every(([key, value]) => row[key] === value)) ?? null; },
          async unique() {
            const matches = rows(table).filter((row) => filters.every(([key, value]) => row[key] === value));
            if (matches.length > 1) throw new Error('not unique');
            return matches[0] ?? null;
          },
          async collect() { return rows(table).filter((row) => filters.every(([key, value]) => row[key] === value)); },
        };
        return chain;
      },
      async insert(table: string, value: Record<string, unknown>) {
        const id = `${table}:new-${nextId++}`;
        add(table, { _id: id, ...value });
        return id;
      },
    },
  };

  return { ctx, rows };
}

const handler = seedDemoProgress as unknown as {
  _handler(ctx: unknown): Promise<Array<{ studentUsername: string; completionsCreated: number }>>;
};

function statusByPhase(rows: Row[], userId: string) {
  return Object.fromEntries(rows
    .filter((row) => row.userId === userId)
    .map((row) => [Number(String(row.phaseId).split(':')[1]), row.status]));
}

describe('seedDemoProgress actual handler', () => {
  it('writes the five declared phase states and only real completed activities', async () => {
    const fixture = makeFixture();
    const result = await handler._handler(fixture.ctx);
    const progress = fixture.rows('student_progress');
    const completions = fixture.rows('activity_completions');

    expect(result.map((row) => row.studentUsername)).toEqual([
      'student1@demo', 'student2@demo', 'student3@demo', 'student4@demo', 'student5@demo',
    ]);
    expect(statusByPhase(progress, 'profiles:1')).toEqual({});
    expect(statusByPhase(progress, 'profiles:2')).toEqual({ 1: 'completed', 2: 'completed', 3: 'in_progress' });
    expect(statusByPhase(progress, 'profiles:3')).toEqual({
      1: 'completed', 2: 'completed', 3: 'completed', 4: 'completed', 5: 'completed', 6: 'in_progress',
    });
    expect(statusByPhase(progress, 'profiles:4')).toEqual(Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, 'completed'])));
    expect(statusByPhase(progress, 'profiles:5')).toEqual(Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 'completed'])));

    expect(completions.every((row) => fixture.rows('activities').some((activity) => activity._id === row.activityId))).toBe(true);
    expect(completions.every((row) => !String(row.activityId).startsWith('lesson_versions:') && !String(row.activityId).startsWith('phase_versions:'))).toBe(true);
    expect(completions.some((row) => row.activityId === 'activities:missing')).toBe(false);
    expect(completions.some((row) => row.studentId === 'profiles:2' && row.phaseNumber === 3)).toBe(false);
    expect(completions.some((row) => row.studentId === 'profiles:3' && row.phaseNumber === 6)).toBe(false);
    expect(completions.every((row) => Number(row.phaseNumber) % 2 === 0)).toBe(true);
    for (const item of result) {
      expect(item.completionsCreated).toBe(completions.filter((row) => row.studentId === `profiles:${Number(item.studentUsername[7])}`).length);
    }
  });

  it('is idempotent and preserves an existing phase and its absent completion', async () => {
    const existing = {
      _id: 'student_progress:existing', userId: 'profiles:4', phaseId: 'phase_versions:4',
      status: 'in_progress', startedAt: 17, timeSpentSeconds: 29, idempotencyKey: 'learner-value',
      createdAt: 11, updatedAt: 19,
    };
    const fixture = makeFixture({ existingStudent4Phase4: existing });
    await handler._handler(fixture.ctx);
    expect(fixture.rows('student_progress').find((row) => row._id === existing._id)).toEqual(existing);
    expect(fixture.rows('activity_completions').some((row) => row.studentId === 'profiles:4' && row.phaseNumber === 4)).toBe(false);

    const before = JSON.parse(JSON.stringify({
      progress: fixture.rows('student_progress'), completions: fixture.rows('activity_completions'),
    }));
    const rerun = await handler._handler(fixture.ctx);
    expect({ progress: fixture.rows('student_progress'), completions: fixture.rows('activity_completions') }).toEqual(before);
    expect(rerun.every((row) => row.completionsCreated === 0)).toBe(true);
  });

  it('returns no writes without the lesson and reports a missing profile', async () => {
    const missingLesson = makeFixture();
    missingLesson.rows('lessons').splice(0);
    expect(await handler._handler(missingLesson.ctx)).toEqual([]);

    const missingProfile = makeFixture({ omitStudent5: true });
    const result = await handler._handler(missingProfile.ctx);
    expect(result.at(-1)).toMatchObject({ studentUsername: 'student5@demo', completionsCreated: 0 });
    expect(missingProfile.rows('student_progress').some((row) => row.userId === 'profiles:5')).toBe(false);
  });
});
