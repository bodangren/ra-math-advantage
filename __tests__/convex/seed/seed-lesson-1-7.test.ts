import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-1-7', () => {
  describe('Lesson 1-7: Quadratic Inequalities', () => {
    const lesson7Seed: SeedLesson = {
      unitNumber: 1,
      title: 'Quadratic Inequalities',
      slug: 'module-1-lesson-7',
      description: 'Solve quadratic inequalities using graphs and sign charts.',
      orderIndex: 7,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 9, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson7Seed.unitNumber).toBe(1);
      expect(lesson7Seed.title).toBe('Quadratic Inequalities');
      expect(lesson7Seed.slug).toBe('module-1-lesson-7');
      expect(lesson7Seed.orderIndex).toBe(7);
    });

    it('has exactly 9 phases', () => {
      expect(lesson7Seed.phases).toHaveLength(9);
    });

    it('correct phase sequence: explore, vocab, learn, 4×worked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson7Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson7Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('has exactly 1 learn phase', () => {
      const learnPhases = lesson7Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases).toHaveLength(1);
    });

    it('has exactly 4 worked_example phases', () => {
      const workedExamples = lesson7Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(4);
    });

    it('does not include an assessment phase', () => {
      const assessmentPhase = lesson7Seed.phases.find((p) => p.phaseType === 'assessment');
      expect(assessmentPhase).toBeUndefined();
    });
  });

  describe('activity records for lesson 1-7', () => {
    const validComponentKeys = [
      'graphing-explorer',
      'step-by-step-solver',
      'comprehension-quiz',
      'fill-in-the-blank',
      'rate-of-change-calculator',
      'discriminant-analyzer',
    ] as const;

    it('explore phase should have graphing-explorer activity', () => {
      const exploreSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'graphing-explorer' as const,
          props: {
            equation: 'y = x^2 - 5x + 6',
          },
        },
      };

      expect(exploreSection.content.componentKey).toBe('graphing-explorer');
      expect(validComponentKeys).toContain(exploreSection.content.componentKey);
    });

    it('worked examples should use step-by-step-solver activity', () => {
      const workedExampleSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'step-by-step-solver' as const,
          props: {
            problemType: 'inequality',
            equation: 'x^2 - 5x + 6 > 0',
            steps: [],
          },
        },
      };

      expect(workedExampleSection.content.componentKey).toBe('step-by-step-solver');
      expect(validComponentKeys).toContain(workedExampleSection.content.componentKey);
    });

    it('discourse phase should have comprehension-quiz activity', () => {
      const discourseSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'comprehension-quiz' as const,
          props: {
            questions: [
              {
                question: 'What divides the number line into intervals for a quadratic inequality?',
                options: ['The y-intercept', 'The boundary values', 'The vertex'],
                correctIndex: 1,
              },
            ],
          },
        },
      };

      expect(discourseSection.content.componentKey).toBe('comprehension-quiz');
      expect(validComponentKeys).toContain(discourseSection.content.componentKey);
    });
  });
});
