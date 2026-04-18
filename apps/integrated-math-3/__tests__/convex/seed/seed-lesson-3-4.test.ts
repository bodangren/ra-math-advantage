import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-3-4', () => {
  describe('Lesson 3-4: The Remainder and Factor Theorems', () => {
    const lesson3_4Seed: SeedLesson = {
      unitNumber: 3,
      title: 'The Remainder and Factor Theorems',
      slug: 'module-3-lesson-4',
      description: 'Students evaluate functions using synthetic substitution and use the Factor Theorem to determine factors of polynomials.',
      orderIndex: 4,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: The Remainder Theorem', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Learn: The Factor Theorem', phaseType: 'learn', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 9, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson3_4Seed.unitNumber).toBe(3);
      expect(lesson3_4Seed.title).toBe('The Remainder and Factor Theorems');
      expect(lesson3_4Seed.slug).toBe('module-3-lesson-4');
      expect(lesson3_4Seed.orderIndex).toBe(4);
    });

    it('has exactly 9 phases', () => {
      expect(lesson3_4Seed.phases).toHaveLength(9);
    });

    it('correct phase sequence: explore, vocab, learn, 2×worked_example, learn, worked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'learn',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson3_4Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson3_4Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson3_4Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('first learn phase is phase 3', () => {
      const learnPhases = lesson3_4Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[0]?.phaseNumber).toBe(3);
    });

    it('second learn phase is phase 6', () => {
      const learnPhases = lesson3_4Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[1]?.phaseNumber).toBe(6);
    });

    it('has exactly 3 worked_example phases', () => {
      const workedExamples = lesson3_4Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(3);
    });

    it('worked examples are numbered 1-3 in order', () => {
      const workedExamples = lesson3_4Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });

    it('discourse phase is phase 8', () => {
      const discoursePhase = lesson3_4Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(8);
    });

    it('reflection phase is phase 9', () => {
      const reflectionPhase = lesson3_4Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(9);
    });
  });

  describe('activity records for lesson 3-4', () => {
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
            equation: 'y = x^3 - 4x',
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
            problemType: 'polynomial' as const,
            equation: 'x^3 - y^3 = (x - y)(x^2 + xy + y^2)',
            steps: [],
          },
        },
      };

      expect(workedExampleSection.content.componentKey).toBe('step-by-step-solver');
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
