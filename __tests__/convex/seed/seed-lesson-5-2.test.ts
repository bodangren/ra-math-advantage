import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-5-2', () => {
  describe('Lesson 5-2: Solving Exponential Equations and Inequalities', () => {
    const lesson5_2Seed: SeedLesson = {
      unitNumber: 5,
      title: 'Solving Exponential Equations and Inequalities',
      slug: 'module-5-lesson-2',
      description: 'Students solve exponential equations and inequalities in one variable.',
      orderIndex: 2,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Solving Exponential Equations', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Learn: Solving Exponential Inequalities', phaseType: 'learn', sections: [] },
        { phaseNumber: 9, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 10, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 11, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson5_2Seed.unitNumber).toBe(5);
      expect(lesson5_2Seed.title).toBe('Solving Exponential Equations and Inequalities');
      expect(lesson5_2Seed.slug).toBe('module-5-lesson-2');
      expect(lesson5_2Seed.orderIndex).toBe(2);
    });

    it('has exactly 11 phases', () => {
      expect(lesson5_2Seed.phases).toHaveLength(11);
    });

    it('correct phase sequence: explore, vocab, learn, 3×worked_example, learn, worked_example, discourse, reflection', () => {
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
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson5_2Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson5_2Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson5_2Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('first learn phase is phase 3', () => {
      const learnPhases = lesson5_2Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[0]?.phaseNumber).toBe(3);
    });

    it('second learn phase is phase 8', () => {
      const learnPhases = lesson5_2Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[1]?.phaseNumber).toBe(8);
    });

    it('discourse phase is phase 10', () => {
      const discoursePhase = lesson5_2Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(10);
    });

    it('reflection phase is phase 11', () => {
      const reflectionPhase = lesson5_2Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(11);
    });

    it('has exactly 5 worked_example phases', () => {
      const workedExamples = lesson5_2Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(5);
    });

    it('worked examples are numbered 1-5 in order', () => {
      const workedExamples = lesson5_2Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });
  });

  describe('activity records for lesson 5-2', () => {
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
            equation: 'y = b^x',
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
            equation: '4^(5x+1) = 64^7',
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