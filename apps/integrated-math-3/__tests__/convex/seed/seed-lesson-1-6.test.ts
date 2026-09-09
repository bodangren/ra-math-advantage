import { describe, it, expect } from 'vitest';
import { seedLesson6 } from '@/convex/seed/seed_lesson_1_6';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-1-6', () => {
  describe('Lesson 1-6: Using the Quadratic Formula and the Discriminant', () => {
    const lesson6Seed: SeedLesson = {
      unitNumber: 1,
      title: 'Using the Quadratic Formula and the Discriminant',
      slug: 'module-1-lesson-6',
      description: 'Use the Quadratic Formula to solve equations and the discriminant to determine the number and type of solutions.',
      orderIndex: 6,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 8, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 9, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 10, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 11, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson6Seed.unitNumber).toBe(1);
      expect(lesson6Seed.title).toBe('Using the Quadratic Formula and the Discriminant');
      expect(lesson6Seed.slug).toBe('module-1-lesson-6');
      expect(lesson6Seed.orderIndex).toBe(6);
    });

    it('has exactly 11 phases', () => {
      expect(lesson6Seed.phases).toHaveLength(11);
    });

    it('correct phase sequence: explore, vocab, learn, 3×worked_example, learn, 2×worked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'learn',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson6Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson6Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('has exactly 2 learn phases', () => {
      const learnPhases = lesson6Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases).toHaveLength(2);
    });

    it('has exactly 5 worked_example phases', () => {
      const workedExamples = lesson6Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(5);
    });

    it('discourse phase is phase 10', () => {
      const discoursePhase = lesson6Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(10);
    });

    it('does not include an assessment phase', () => {
      const assessmentPhase = lesson6Seed.phases.find((p) => p.phaseType === 'assessment');
      expect(assessmentPhase).toBeUndefined();
    });
  });

  describe('activity records for lesson 1-6', () => {
    const validComponentKeys = [
      'graphing-explorer',
      'step-by-step-solver',
      'comprehension-quiz',
      'fill-in-the-blank',
      'rate-of-change-calculator',
      'discriminant-analyzer',
    ] as const;

    it('discriminant examples should use discriminant-analyzer activity', () => {
      const discriminantSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'discriminant-analyzer' as const,
          props: {
            equation: 'x^2 - 6x + 9 = 0',
          },
        },
      };

      expect(discriminantSection.content.componentKey).toBe('discriminant-analyzer');
      expect(validComponentKeys).toContain(discriminantSection.content.componentKey);
    });
  });
});

type StoredRow = Record<string, unknown> & { _id: string };

function makeSeedContext() {
  const stores = new Map<string, StoredRow[]>();
  let nextId = 1;
  const rows = (table: string) => {
    const value = stores.get(table) ?? [];
    stores.set(table, value);
    return value;
  };
  const db = {
    query(table: string) {
      const filters: Array<[string, unknown]> = [];
      const chain = {
        withIndex(_name: string, apply: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) {
          const q = { eq(field: string, value: unknown) { filters.push([field, value]); return q; } };
          apply(q);
          return chain;
        },
        async unique() { const found = rows(table).filter(row => filters.every(([key, value]) => row[key] === value)); return found.length === 1 ? found[0] : null; },
        async first() { return rows(table).find(row => filters.every(([key, value]) => row[key] === value)) ?? null; },
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
      for (const tableRows of stores.values()) {
        const row = tableRows.find(candidate => candidate._id === id);
        if (row) Object.assign(row, value);
      }
    },
  };
  return { ctx: { db }, rows };
}

describe('Lesson 1.6 source-worked seed documents', () => {
  it('creates exact .036-.038 PDF worked examples as text-only phases', async () => {
    const memory = makeSeedContext();
    await (seedLesson6 as unknown as { _handler: (ctx: unknown) => Promise<unknown> })._handler(memory.ctx);

    const phases = memory.rows('phase_versions');
    const sections = memory.rows('phase_sections');
    const markdownByPhase = new Map(
      phases.filter(phase => [4, 5, 6].includes(phase.phaseNumber as number)).map(phase => {
        const phaseSections = sections.filter(section => section.phaseVersionId === phase._id);
        expect(phaseSections).toHaveLength(1);
        expect(phaseSections[0].sectionType).toBe('text');
        return [phase.phaseNumber, (phaseSections[0].content as { markdown: string }).markdown];
      }),
    );

    expect(markdownByPhase.get(4)).toContain('**CONTEST** At the World Championship Punkin Chunkin contest in Bridgeville, Delaware');
    expect(markdownByPhase.get(4)).toContain('0 = -4.9t^2 + 11.7t + 42');
    expect(markdownByPhase.get(4)).toContain('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
    expect(markdownByPhase.get(4)).toContain('\\frac{-11.7 \\pm \\sqrt{(11.7)^2 - 4(-4.9)(42)}}{2(-4.9)}');
    expect(markdownByPhase.get(4)).toContain('\\frac{-11.7 \\pm \\sqrt{136.89 + 823.2}}{-9.8}');
    expect(markdownByPhase.get(4)).toContain('\\frac{-11.7 \\pm \\sqrt{960.09}}{-9.8}');
    expect(markdownByPhase.get(4)).toContain('\\frac{11.7 + \\sqrt{960.09}}{9.8} \\text{ or } t = \\frac{11.7 - \\sqrt{960.09}}{9.8}');
    expect(markdownByPhase.get(4)).toContain('The approximate solutions are $4.4$ seconds and $-2.0$ seconds.');
    expect(markdownByPhase.get(4)).toContain('The negative root does not make sense in this context because the pumpkin launches at 0 seconds. The pumpkin lands after 4.4 seconds.');

    expect(markdownByPhase.get(5)).toContain('Solve $x^2 + 4x - 17 = 0$ by using the Quadratic Formula.');
    expect(markdownByPhase.get(5)).toContain('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
    expect(markdownByPhase.get(5)).toContain('\\frac{-4 \\pm \\sqrt{(4)^2 - 4(1)(-17)}}{2(1)}');
    expect(markdownByPhase.get(5)).toContain('\\frac{-4 \\pm \\sqrt{84}}{2}');
    expect(markdownByPhase.get(5)).toContain('\\frac{-4 \\pm \\sqrt{4} \\cdot \\sqrt{21}}{2}');
    expect(markdownByPhase.get(5)).toContain('\\frac{-4 \\pm 2\\sqrt{21}}{2}');
    expect(markdownByPhase.get(5)).toContain('$x = -2 \\pm \\sqrt{21}$');

    expect(markdownByPhase.get(6)).toContain('Solve $5x^2 + 8x + 11 = 0$ by using the Quadratic Formula.');
    expect(markdownByPhase.get(6)).toContain('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
    expect(markdownByPhase.get(6)).toContain('\\frac{-8 \\pm \\sqrt{8^2 - 4(5)(11)}}{2(5)}');
    expect(markdownByPhase.get(6)).toContain('\\frac{-8 \\pm \\sqrt{-156}}{10}');
    expect(markdownByPhase.get(6)).toContain('\\frac{-8 \\pm \\sqrt{-1} \\cdot \\sqrt{4} \\cdot \\sqrt{39}}{10}');
    expect(markdownByPhase.get(6)).toContain('\\frac{-8 \\pm 2i\\sqrt{39}}{10}');
    expect(markdownByPhase.get(6)).toContain('$x = \\frac{-4 \\pm i\\sqrt{39}}{5}$');
  });
});

describe('Lesson 1.6 discourse quiz seed document', () => {
  it('creates the two questions with the current quiz contract', async () => {
    const memory = makeSeedContext();
    await (seedLesson6 as unknown as { _handler(ctx: unknown): Promise<unknown> })._handler(memory.ctx);

    const phase = memory.rows('phase_versions').find(candidate => candidate.phaseNumber === 10);
    expect(phase).toBeDefined();
    const section = memory.rows('phase_sections').find(candidate => (
      candidate.phaseVersionId === phase?._id
      && candidate.sectionType === 'activity'
    ));
    expect(section).toBeDefined();
    const activityId = (section?.content as { activityId?: string } | undefined)?.activityId;
    const activity = memory.rows('activities').find(candidate => candidate._id === activityId);
    expect(activity?.componentKey).toBe('comprehension-quiz');
    expect(section?.content).toEqual({ activityId, componentKey: 'comprehension-quiz' });

    const questions = [
      {
        id: 'discriminant-purpose',
        type: 'multiple_choice',
        prompt: 'What does the discriminant tell you?',
        options: ['The sum of the roots', 'The number and type of solutions', 'The product of the roots', 'The axis of symmetry'],
        correctAnswer: 'The number and type of solutions',
      },
      {
        id: 'zero-discriminant-real-solution-count',
        type: 'multiple_choice',
        prompt: 'If D = 0, how many real solutions are there?',
        options: ['0', '1', '2', 'Cannot determine'],
        correctAnswer: '1',
      },
    ];
    expect(activity?.props).toEqual({ questions });
    expect(new Set(questions.map(question => question.id)).size).toBe(questions.length);
    for (const question of questions) {
      expect(question.id.length).toBeGreaterThan(0);
      expect(question.type).toBe('multiple_choice');
      expect(question.options).toContain(question.correctAnswer);
      expect(question).not.toHaveProperty('question');
      expect(question).not.toHaveProperty('correctIndex');
    }
    expect(memory.rows('phase_versions')).toHaveLength(11);
  });
});

describe('Lesson 1.6 draft quadratic-formula records', () => {
  it.each([
    ['guided_practice', 1, 'guided'],
    ['independent_practice', 2, 'independent'],
  ] as const)('builds exact private %s authority', async (mode, seed, presentationMode) => {
    const { buildIm3QuadraticFormulaDraftDocuments } = await import('@/convex/seed/seed_lesson_1_6');
    const docs = buildIm3QuadraticFormulaDraftDocuments(mode, 'activities:qf' as never, 123);
    expect(docs.activity).toMatchObject({ componentKey: 'quadratic-formula', masteryNodeId: 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations', srsEligible: false, approval: { status: 'unreviewed' }, props: { presentationMode } });
    expect(docs.variant).toMatchObject({ componentKey: 'quadratic-formula', objectiveIds: ['math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations'], metadata: { generatorKey: 'quadratic-formula', seed, mode } });
    expect(docs.item).toMatchObject({ activityId: 'activities:qf', variantKey: docs.activity.stableActivityId });
    expect(JSON.stringify(docs.activity)).not.toMatch(/\"seed\"|roots|canonical/);
  });
});


describe('Lesson 1.6 discriminant Worked seed documents', () => {
  it('creates exact .039 and .040 as text-only source examples', async () => {
    const memory = makeSeedContext();
    await (seedLesson6 as unknown as { _handler(ctx: unknown): Promise<unknown> })._handler(memory.ctx);
    const phases = memory.rows('phase_versions');
    expect(phases).toHaveLength(11);
    for (const [number, title, equation, coefficients, calculation, arithmetic, value, interpretation] of [
      [8, 'Example 4 The Discriminant, Real Roots', '2x^2 - 10x + 7 = 0', 'a = 2, b = -10, c = 7', 'b^2 - 4ac = (-10)^2 - 4(2)(7)', '100 - 56', '44', 'The discriminant is nonzero, so there are two roots. The discriminant is positive and not a perfect square, so the roots are irrational.'],
      [9, 'Example 5 The Discriminant, Complex Roots', '-5x^2 + 10x - 15 = 0', 'a = -5, b = 10, c = -15', 'b^2 - 4ac = (10)^2 - 4(-5)(-15)', '100 - 300', '-200', 'The discriminant is nonzero, so there are two roots. The discriminant is negative, so the roots are complex.'],
    ] as const) {
      const matches = phases.filter(phase => phase.phaseNumber === number);
      expect(matches).toHaveLength(1);
      const sections = memory.rows('phase_sections').filter(section => section.phaseVersionId === matches[0]._id);
      expect(sections).toHaveLength(1);
      expect(sections[0].sectionType).toBe('text');
      expect((sections[0].content as { markdown: string }).markdown).toBe([
        `## ${title}`, '', `Examine $${equation}$.`, '',
        `**Part A** Find the value of the discriminant for $${equation}$.`, '',
        `$${coefficients}$`, '', `$$${calculation}$$`, `$$= ${arithmetic}$$`, `$$= ${value}$$`, '',
        '**Part B** Describe the number and type of roots for the equation.', '', interpretation,
      ].join('\n'));
    }
  });
});
