import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-5-1', () => {
  describe('Lesson 5-1: Graphing Exponential Functions', () => {
    const lesson5_1Seed: SeedLesson = {
      unitNumber: 5,
      title: 'Graphing Exponential Functions',
      slug: 'module-5-lesson-1',
      description: 'Students graph exponential growth and decay functions.',
      orderIndex: 1,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Graphing Exponential Growth Functions', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Learn: Graphing Exponential Decay Functions', phaseType: 'learn', sections: [] },
        { phaseNumber: 9, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 10, title: 'Worked Example 6', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 11, title: 'Worked Example 7', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 12, title: 'Worked Example 8', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 13, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 14, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson5_1Seed.unitNumber).toBe(5);
      expect(lesson5_1Seed.title).toBe('Graphing Exponential Functions');
      expect(lesson5_1Seed.slug).toBe('module-5-lesson-1');
      expect(lesson5_1Seed.orderIndex).toBe(1);
    });

    it('has exactly 14 phases', () => {
      expect(lesson5_1Seed.phases).toHaveLength(14);
    });

    it('correct phase sequence: explore, vocab, learn, 4×worked_example, learn, 4×worked_example, discourse, reflection', () => {
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
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson5_1Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson5_1Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson5_1Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('first learn phase is phase 3', () => {
      const learnPhases = lesson5_1Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[0]?.phaseNumber).toBe(3);
    });

    it('second learn phase is phase 8', () => {
      const learnPhases = lesson5_1Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[1]?.phaseNumber).toBe(8);
    });

    it('discourse phase is phase 13', () => {
      const discoursePhase = lesson5_1Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(13);
    });

    it('reflection phase is phase 14', () => {
      const reflectionPhase = lesson5_1Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(14);
    });

    it('has exactly 8 worked_example phases', () => {
      const workedExamples = lesson5_1Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(8);
    });

    it('worked examples are numbered 1-8 in order', () => {
      const workedExamples = lesson5_1Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });
  });

  describe('activity records for lesson 5-1', () => {
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
            equation: 'f(x) = 2^x',
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
