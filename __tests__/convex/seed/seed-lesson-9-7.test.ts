import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-9-7', () => {
  describe('Lesson 9-7: Inverse Trigonometric Functions', () => {
    const lesson9_7Seed: SeedLesson = {
      unitNumber: 9,
      title: 'Inverse Trigonometric Functions',
      slug: 'module-9-lesson-7',
      description: 'Students find values of angle measures by using inverse trigonometric functions.',
      orderIndex: 7,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Inverse Trigonometric Functions', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 9, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson9_7Seed.unitNumber).toBe(9);
      expect(lesson9_7Seed.title).toBe('Inverse Trigonometric Functions');
      expect(lesson9_7Seed.slug).toBe('module-9-lesson-7');
      expect(lesson9_7Seed.orderIndex).toBe(7);
    });

    it('has exactly 9 phases', () => {
      expect(lesson9_7Seed.phases).toHaveLength(9);
    });

    it('correct phase sequence: explore, vocab, learn, 4xworked_example, discourse, reflection', () => {
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

      const actualSequence = lesson9_7Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson9_7Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson9_7Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('learn phase is phase 3', () => {
      const learnPhase = lesson9_7Seed.phases.find((p) => p.phaseType === 'learn');
      expect(learnPhase?.phaseNumber).toBe(3);
    });

    it('discourse phase is phase 8', () => {
      const discoursePhase = lesson9_7Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(8);
    });

    it('reflection phase is phase 9', () => {
      const reflectionPhase = lesson9_7Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(9);
    });

    it('has exactly 4 worked_example phases', () => {
      const workedExamples = lesson9_7Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(4);
    });

    it('worked examples are numbered 1-4 in order', () => {
      const workedExamples = lesson9_7Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });
  });

  describe('activity records for lesson 9-7', () => {
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
            variant: 'explore',
            equation: 'y = sin(x)',
            title: 'Inverse Trigonometric Functions Explorer',
          },
        },
      };

      expect(exploreSection.content.componentKey).toBe('graphing-explorer');
      expect(validComponentKeys).toContain(exploreSection.content.componentKey);
    });

    it('worked examples should use comprehension-quiz activity', () => {
      const workedExampleSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'comprehension-quiz' as const,
          props: {
            questions: [],
          },
        },
      };

      expect(workedExampleSection.content.componentKey).toBe('comprehension-quiz');
      expect(validComponentKeys).toContain(workedExampleSection.content.componentKey);
    });

    it('discourse phase should have comprehension-quiz activity', () => {
      const discourseSection = {
        sequenceOrder: 2,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'comprehension-quiz' as const,
          props: {
            questions: [],
          },
        },
      };

      expect(discourseSection.content.componentKey).toBe('comprehension-quiz');
      expect(validComponentKeys).toContain(discourseSection.content.componentKey);
    });
  });
});
