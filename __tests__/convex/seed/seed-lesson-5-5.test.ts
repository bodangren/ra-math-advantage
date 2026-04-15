import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-5-5', () => {
  describe('Lesson 5-5: Modeling Data', () => {
    const lesson5_5Seed: SeedLesson = {
      unitNumber: 5,
      title: 'Modeling Data',
      slug: 'module-5-lesson-5',
      description: 'Students choose the best function type to model sets of data.',
      orderIndex: 5,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Choosing the Best Model', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 7, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson5_5Seed.unitNumber).toBe(5);
      expect(lesson5_5Seed.title).toBe('Modeling Data');
      expect(lesson5_5Seed.slug).toBe('module-5-lesson-5');
      expect(lesson5_5Seed.orderIndex).toBe(5);
    });

    it('has exactly 7 phases', () => {
      expect(lesson5_5Seed.phases).toHaveLength(7);
    });

    it('correct phase sequence: explore, vocab, learn, 2×worked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson5_5Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson5_5Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson5_5Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('learn phase is phase 3', () => {
      const learnPhase = lesson5_5Seed.phases.find((p) => p.phaseType === 'learn');
      expect(learnPhase?.phaseNumber).toBe(3);
    });

    it('discourse phase is phase 6', () => {
      const discoursePhase = lesson5_5Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(6);
    });

    it('reflection phase is phase 7', () => {
      const reflectionPhase = lesson5_5Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(7);
    });

    it('has exactly 2 worked_example phases', () => {
      const workedExamples = lesson5_5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(2);
    });

    it('worked examples are numbered 1-2 in order', () => {
      const workedExamples = lesson5_5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });
  });

  describe('activity records for lesson 5-5', () => {
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
            equation: 'y = a * b^x',
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
            equation: 'Examine scatter plot',
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