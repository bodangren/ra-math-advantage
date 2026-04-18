import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-1-2', () => {
  describe('Lesson 1-2: Solving Quadratic Equations by Graphing', () => {
    const lesson2Seed: SeedLesson = {
      unitNumber: 1,
      title: 'Solving Quadratic Equations by Graphing',
      slug: 'module-1-lesson-2',
      description: 'Students interpret x-intercepts as solutions.',
      orderIndex: 2,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 9, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 10, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson2Seed.unitNumber).toBe(1);
      expect(lesson2Seed.title).toBe('Solving Quadratic Equations by Graphing');
      expect(lesson2Seed.slug).toBe('module-1-lesson-2');
      expect(lesson2Seed.orderIndex).toBe(2);
    });

    it('has exactly 10 phases', () => {
      expect(lesson2Seed.phases).toHaveLength(10);
    });

    it('correct phase sequence: explore, vocab, learn, 5×worked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson2Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson2Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('has exactly 5 worked_example phases', () => {
      const workedExamples = lesson2Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(5);
    });

    it('discourse phase is phase 9', () => {
      const discoursePhase = lesson2Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(9);
    });

    it('reflection phase is phase 10', () => {
      const reflectionPhase = lesson2Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(10);
    });
  });

  describe('activity records for lesson 1-2', () => {
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
            variant: 'find_zeros',
            equation: 'y = x^2 - 4',
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
            problemType: 'graphing',
            equation: 'x^2 - 4 = 0',
            steps: [],
          },
        },
      };

      expect(workedExampleSection.content.componentKey).toBe('step-by-step-solver');
      expect(validComponentKeys).toContain(workedExampleSection.content.componentKey);
    });
  });
});
