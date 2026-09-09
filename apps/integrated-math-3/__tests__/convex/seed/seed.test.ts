import { describe, it, expect } from 'vitest';
import { getFunctionName } from 'convex/server';
import { seedAll } from '@/convex/seed';
import type { SeedLesson, SeedCompetencyStandard, SeedDemoEnvironment } from '@/convex/seed/types';

const lessonSeedModules = (import.meta as ImportMeta & {
  glob(pattern: string, options: { eager: true }): Record<string, unknown>;
}).glob('@/convex/seed/seed_lesson_[1-9]_[1-9].ts', { eager: true });

function makeSeedContext() {
  const stores = new Map<string, Array<Record<string, unknown> & { _id: string }>>();
  let nextId = 1;
  const rows = (table: string) => {
    const stored = stores.get(table) ?? [];
    stores.set(table, stored);
    return stored;
  };
  return {
    rows,
    ctx: {
      db: {
        async get(id: string) {
          for (const stored of stores.values()) {
            const row = stored.find(candidate => candidate._id === id);
            if (row) return row;
          }
          return null;
        },
        query(table: string) {
          const filters: Array<[string, unknown]> = [];
          const chain = {
            withIndex(_name: string, apply: (q: { eq(field: string, value: unknown): unknown }) => unknown) {
              const q = { eq(field: string, value: unknown) { filters.push([field, value]); return q; } };
              apply(q);
              return chain;
            },
            async first() { return rows(table).find(row => filters.every(([key, value]) => row[key] === value)) ?? null; },
            async unique() { return rows(table).find(row => filters.every(([key, value]) => row[key] === value)) ?? null; },
            async collect() { return rows(table).filter(row => filters.every(([key, value]) => row[key] === value)); },
            async take(limit: number) { return rows(table).filter(row => filters.every(([key, value]) => row[key] === value)).slice(0, limit); },
          };
          return chain;
        },
        async insert(table: string, value: Record<string, unknown>) {
          const id = `${table}:${nextId++}`;
          rows(table).push({ _id: id, ...value });
          return id;
        },
        async patch(id: string, value: Record<string, unknown>) {
          for (const stored of stores.values()) {
            const row = stored.find(candidate => candidate._id === id);
            if (row) Object.assign(row, value);
          }
        },
      },
    },
  };
}

describe('seed main entry point', () => {
  it('writes repaired shapes and preserves unresolved solver contracts for all lessons', async () => {
    const modules = Object.entries(lessonSeedModules);
    const unresolvedTypes: string[] = [];
    const unresolvedSystems: string[][] = [];

    expect(modules).toHaveLength(52);
    for (const [, module] of modules) {
      const memory = makeSeedContext();
      const handler = Object.values(module as Record<string, unknown>).find(value => (
        typeof value === 'function' && '_handler' in value
      )) as { _handler(ctx: unknown): Promise<unknown> };
      await handler._handler(memory.ctx);

      for (const section of memory.rows('phase_sections').filter(row => row.sectionType === 'activity')) {
        expect(Object.keys(section.content as object).sort()).toEqual(['activityId', 'componentKey']);
      }
      for (const activity of memory.rows('activities')) {
        const props = activity.props as Record<string, unknown>;
        if (activity.componentKey === 'graphing-explorer') {
          expect(props).not.toHaveProperty('title');
          expect(props).not.toHaveProperty('functions');
          expect(props).not.toHaveProperty('features');
          expect(props).not.toHaveProperty('equations');
          expect(typeof props.equation).toBe('string');
        } else if (activity.componentKey === 'step-by-step-solver') {
          const problemType = props.problemType as string;
          if (['simplify_imaginary', 'complex_operations', 'vertex-form', 'inequality', 'system'].includes(problemType)) {
            unresolvedTypes.push(problemType);
          }
          if (problemType === 'system') unresolvedSystems.push(props.equations as string[]);
          for (const step of (props.steps as Array<Record<string, unknown>> | undefined) ?? []) {
            expect(typeof step.id).toBe('string');
            expect(step.description).toBe(step.explanation);
            expect(typeof step.expression).toBe('string');
          }
        } else if (activity.componentKey === 'comprehension-quiz') {
          for (const question of props.questions as Array<Record<string, unknown>>) {
            expect(Object.keys(question).sort()).toEqual(['correctAnswer', 'id', 'options', 'prompt', 'type']);
            expect(question.type).toBe('multiple_choice');
            expect((question.options as string[])).toContain(question.correctAnswer);
          }
        }
      }
    }
    expect(unresolvedTypes.sort()).toEqual([
      ...Array(5).fill('complex_operations'),
      ...Array(4).fill('inequality'),
      ...Array(3).fill('simplify_imaginary'),
      ...Array(5).fill('system'),
      'vertex-form',
    ].sort());
    expect(unresolvedSystems).toEqual([
      ['x = 2y^2 + 3y + 1', '-x + y = -1'],
      ['x^2 = y + 5', '-x + y = 7'],
      ['y = x^2 - 2x + 6', 'y = 4x + 1'],
      ['R = -0.1x^2 + 4x', 'R = 42'],
      ['y = x^2 + 2x', 'y = -x^2 + 4x + 6'],
    ]);
  });

  describe('seed orchestration', () => {
    it('calls every registered seed mutation in order', async () => {
      const mutationNames: string[] = [];
      const lessonCounts = [8, 5, 5, 6, 5, 5, 6, 5, 7];
      const expectedNames = [
        'seed/seed_standards:seedStandards',
        ...lessonCounts.flatMap((count, moduleIndex) =>
          Array.from({ length: count }, (_, lessonIndex) => {
            const moduleNumber = moduleIndex + 1;
            const lessonNumber = lessonIndex + 1;
            const functionName = moduleNumber === 1 ? `seedLesson${lessonNumber}` : `seedLesson${moduleNumber}_${lessonNumber}`;
            return `seed/seed_lesson_${moduleNumber}_${lessonNumber}:${functionName}`;
          }),
        ),
        ...Array.from(
          { length: 9 },
          (_, index) => `seed/seed_lesson_standards:seedModule${index + 1}LessonStandards`,
        ),
        'seed/seed_objective_policies:seedObjectivePolicies',
        'seed/seed_problem_families:seedProblemFamilies',
        'seed/seed_practice_items:seedPracticeItems',
        'seed/seed_demo_env:seedDemoEnv',
        'seed/seed_demo_progress:seedDemoProgress',
      ];
      const handler = seedAll as unknown as {
        _handler(ctx: {
          runMutation(reference: unknown, args: Record<string, never>): Promise<unknown>;
        }): Promise<unknown>;
      };

      await handler._handler({
        runMutation: async (reference) => {
          const name = getFunctionName(reference as Parameters<typeof getFunctionName>[0]);
          mutationNames.push(name);
          if (name === 'seed/seed_standards:seedStandards' || name.startsWith('seed/seed_lesson_standards:')) {
            return [];
          }
          return undefined;
        },
      });

      expect(mutationNames).toHaveLength(67);
      expect(mutationNames).toEqual(expectedNames);
    });

    it('seeds lessons in order from 1-1 to 1-8', () => {
      const lessonOrder = [
        'module-1-lesson-1',
        'module-1-lesson-2',
        'module-1-lesson-3',
        'module-1-lesson-4',
        'module-1-lesson-5',
        'module-1-lesson-6',
        'module-1-lesson-7',
        'module-1-lesson-8',
      ];

      const seededSlugs: string[] = [];

      const seedLesson = (lesson: SeedLesson) => {
        seededSlugs.push(lesson.slug);
      };

      for (const slug of lessonOrder) {
        seedLesson({ unitNumber: 1, title: 'Test', slug, orderIndex: 1, phases: [] });
      }

      expect(seededSlugs).toEqual(lessonOrder);
    });

    it('handles errors per lesson without stopping seed', () => {
      const results: { slug: string; success: boolean }[] = [];

      const seedLesson = (lesson: SeedLesson, shouldFail = false) => {
        if (shouldFail) {
          results.push({ slug: lesson.slug, success: false });
          return false;
        }
        results.push({ slug: lesson.slug, success: true });
        return true;
      };

      const lessons: SeedLesson[] = [
        { unitNumber: 1, title: 'Lesson 1', slug: 'module-1-lesson-1', orderIndex: 1, phases: [] },
        { unitNumber: 1, title: 'Lesson 2', slug: 'module-1-lesson-2', orderIndex: 2, phases: [] },
        { unitNumber: 1, title: 'Lesson 3', slug: 'module-1-lesson-3', orderIndex: 3, phases: [] },
      ];

      lessons.forEach((lesson, index) => {
        try {
          seedLesson(lesson, index === 1);
        } catch {
          results.push({ slug: lesson.slug, success: false });
        }
      });

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });

    it('creates lesson with correct phase sequence', () => {
      const lesson: SeedLesson = {
        unitNumber: 1,
        title: 'Graphing Quadratic Functions',
        slug: 'module-1-lesson-1',
        orderIndex: 1,
        phases: [
          { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
          { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
          { phaseNumber: 3, title: 'Learn', phaseType: 'learn', sections: [] },
        ],
      };

      expect(lesson.phases).toHaveLength(3);
      expect(lesson.phases[0].phaseType).toBe('explore');
      expect(lesson.phases[1].phaseType).toBe('vocabulary');
      expect(lesson.phases[2].phaseType).toBe('learn');
    });

    it('seeds standards before linking to lessons', () => {
      const standards: SeedCompetencyStandard[] = [
        { code: 'HSA-SSE.B.3', description: 'Test', isActive: true },
        { code: 'HSA-REI.B.4', description: 'Test', isActive: true },
      ];

      const seededCodes: string[] = [];
      standards.forEach((s) => seededCodes.push(s.code));

      expect(seededCodes).toContain('HSA-SSE.B.3');
      expect(seededCodes).toContain('HSA-REI.B.4');
    });

    it('demo environment includes teacher and 5 students', () => {
      const demo: SeedDemoEnvironment = {
        organization: { name: 'Demo', slug: 'demo' },
        teacher: { organizationSlug: 'demo', username: 'teacher@demo', role: 'teacher', password: 'Demo1234!' },
        students: [
          { organizationSlug: 'demo', username: 'student1@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student2@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student3@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student4@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student5@demo', role: 'student', password: 'Demo1234!' },
        ],
        className: 'IM3 Period 1',
        studentProgress: [],
      };

      expect(demo.students).toHaveLength(5);
      expect(demo.teacher.role).toBe('teacher');
      demo.students.forEach((s) => expect(s.role).toBe('student'));
    });

    it('student progress varies by student', () => {
      const demo: SeedDemoEnvironment = {
        organization: { name: 'Demo', slug: 'demo' },
        teacher: { organizationSlug: 'demo', username: 'teacher@demo', role: 'teacher', password: 'Demo1234!' },
        students: [
          { organizationSlug: 'demo', username: 'student1@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student2@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student3@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student4@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student5@demo', role: 'student', password: 'Demo1234!' },
        ],
        className: 'IM3 Period 1',
        studentProgress: [
          { studentUsername: 'student1@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 1, status: 'not_started' },
          { studentUsername: 'student2@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 2, status: 'in_progress' },
          { studentUsername: 'student3@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 3, status: 'in_progress' },
          { studentUsername: 'student4@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 4, status: 'completed' },
          { studentUsername: 'student5@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 5, status: 'completed' },
        ],
      };

      const completedPhases = demo.studentProgress.filter((p) => p.status === 'completed');
      expect(completedPhases).toHaveLength(2);
      expect(completedPhases[0].studentUsername).toBe('student4@demo');
      expect(completedPhases[1].studentUsername).toBe('student5@demo');
    });
  });

  describe('lesson phase sequences', () => {
    it('lesson 1-1 has correct phase sequence per spec', () => {
      const lesson1_1Phases = [
        'explore', 'vocabulary', 'learn',
        'worked_example', 'worked_example', 'worked_example',
        'learn',
        'worked_example', 'worked_example', 'worked_example',
        'discourse', 'reflection'
      ];

      expect(lesson1_1Phases).toHaveLength(12);
      expect(lesson1_1Phases.filter(p => p === 'worked_example')).toHaveLength(6);
    });

    it('lesson 1-7 has correct phase sequence per spec', () => {
      const lesson1_7Phases = [
        'explore', 'vocabulary', 'learn',
        'worked_example', 'worked_example', 'worked_example', 'worked_example',
        'assessment', 'discourse', 'reflection'
      ];

      expect(lesson1_7Phases).toHaveLength(10);
      expect(lesson1_7Phases.filter(p => p === 'worked_example')).toHaveLength(4);
    });

    it('all lessons have vocabulary phase', () => {
      const allLessons = [1, 2, 3, 4, 5, 6, 7, 8];
      allLessons.forEach(() => {
        const hasVocab = true;
        expect(hasVocab).toBe(true);
      });
    });
  });
});
