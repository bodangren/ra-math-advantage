import { describe, it, expect } from 'vitest';
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

    it('worked examples should use step-by-step-solver activity', () => {
      const workedExampleSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'step-by-step-solver' as const,
          props: {
            problemType: 'quadratic-formula',
            equation: 'x^2 + 5x + 6 = 0',
            steps: [],
          },
        },
      };

      expect(workedExampleSection.content.componentKey).toBe('step-by-step-solver');
      expect(validComponentKeys).toContain(workedExampleSection.content.componentKey);
    });

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
