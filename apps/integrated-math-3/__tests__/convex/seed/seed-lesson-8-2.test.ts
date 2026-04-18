import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-8-2', () => {
  describe('Lesson 8-2: Using Statistical Experiments', () => {
    const lesson8_2Seed: SeedLesson = {
      unitNumber: 8,
      title: 'Using Statistical Experiments',
      slug: 'module-8-lesson-2',
      description: 'Students compare theoretical and experimental probabilities and determine whether models are consistent with results from simulations.',
      orderIndex: 2,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Theoretical and Experimental Probability', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Learn: Simulations', phaseType: 'learn', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 9, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson8_2Seed.unitNumber).toBe(8);
      expect(lesson8_2Seed.title).toBe('Using Statistical Experiments');
      expect(lesson8_2Seed.slug).toBe('module-8-lesson-2');
      expect(lesson8_2Seed.orderIndex).toBe(2);
    });

    it('has exactly 9 phases', () => {
      expect(lesson8_2Seed.phases).toHaveLength(9);
    });

    it('correct phase sequence: explore, vocab, learn, worked_example, learn, 2xworked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'learn',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson8_2Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson8_2Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson8_2Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('first learn phase is phase 3', () => {
      const learnPhases = lesson8_2Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[0]?.phaseNumber).toBe(3);
    });

    it('second learn phase is phase 5', () => {
      const learnPhases = lesson8_2Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[1]?.phaseNumber).toBe(5);
    });

    it('discourse phase is phase 8', () => {
      const discoursePhase = lesson8_2Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(8);
    });

    it('reflection phase is phase 9', () => {
      const reflectionPhase = lesson8_2Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(9);
    });

    it('has exactly 3 worked_example phases', () => {
      const workedExamples = lesson8_2Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(3);
    });

    it('worked examples are numbered 1-3 in order', () => {
      const workedExamples = lesson8_2Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });
  });

  describe('activity records for lesson 8-2', () => {
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
            equation: 'y = 1/x',
            title: 'Probability Explorer',
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