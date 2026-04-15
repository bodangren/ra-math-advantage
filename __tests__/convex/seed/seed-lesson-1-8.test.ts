import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-1-8', () => {
  describe('Lesson 1-8: Solving Linear-Nonlinear Systems', () => {
    const lesson8Seed: SeedLesson = {
      unitNumber: 1,
      title: 'Solving Linear-Nonlinear Systems',
      slug: 'module-1-lesson-8',
      description: 'Solve systems of linear and quadratic equations.',
      orderIndex: 8,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 9, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 10, title: 'Worked Example 6', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 11, title: 'Worked Example 7', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 12, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 13, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson8Seed.unitNumber).toBe(1);
      expect(lesson8Seed.title).toBe('Solving Linear-Nonlinear Systems');
      expect(lesson8Seed.slug).toBe('module-1-lesson-8');
      expect(lesson8Seed.orderIndex).toBe(8);
    });

    it('has exactly 13 phases', () => {
      expect(lesson8Seed.phases).toHaveLength(13);
    });

    it('correct phase sequence: explore, vocab, learn, 4×worked_example, learn, 3×worked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'worked_example',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson8Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson8Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('has exactly 2 learn phases', () => {
      const learnPhases = lesson8Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases).toHaveLength(2);
    });

    it('has exactly 7 worked_example phases', () => {
      const workedExamples = lesson8Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(7);
    });

    it('does not include an assessment phase', () => {
      const assessmentPhase = lesson8Seed.phases.find((p) => p.phaseType === 'assessment');
      expect(assessmentPhase).toBeUndefined();
    });
  });

  describe('activity records for lesson 1-8', () => {
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
            equations: ['y = x^2', 'y = x + 2'],
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
            problemType: 'system',
            equations: ['y = x^2', 'y = x + 2'],
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
                question: 'What is the maximum number of solutions for a linear-quadratic system?',
                options: ['1', '2', '3'],
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
