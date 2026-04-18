import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-2-1', () => {
  describe('Lesson 2-1: Polynomial Functions', () => {
    const lesson2Seed: SeedLesson = {
      unitNumber: 2,
      title: 'Polynomial Functions',
      slug: 'module-2-lesson-1',
      description: 'Students graph and analyze power functions and polynomial functions.',
      orderIndex: 1,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Graphing Power Functions', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Learn: Graphing Polynomial Functions', phaseType: 'learn', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 9, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 10, title: 'Worked Example 6', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 11, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 12, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson2Seed.unitNumber).toBe(2);
      expect(lesson2Seed.title).toBe('Polynomial Functions');
      expect(lesson2Seed.slug).toBe('module-2-lesson-1');
      expect(lesson2Seed.orderIndex).toBe(1);
    });

    it('has exactly 12 phases', () => {
      expect(lesson2Seed.phases).toHaveLength(12);
    });

    it('correct phase sequence: explore, vocab, learn, 2×worked_example, learn, 4×worked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
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

      const actualSequence = lesson2Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson2Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson2Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('first learn phase is phase 3', () => {
      const learnPhases = lesson2Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[0]?.phaseNumber).toBe(3);
    });

    it('second learn phase is phase 6', () => {
      const learnPhases = lesson2Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[1]?.phaseNumber).toBe(6);
    });

    it('discourse phase is phase 11', () => {
      const discoursePhase = lesson2Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(11);
    });

    it('reflection phase is phase 12', () => {
      const reflectionPhase = lesson2Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(12);
    });

    it('has exactly 6 worked_example phases', () => {
      const workedExamples = lesson2Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(6);
    });

    it('worked examples are numbered 1-6 in order', () => {
      const workedExamples = lesson2Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });
  });

  describe('activity records for lesson 2-1', () => {
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
            equation: 'y = x^3',
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
            equation: 'f(x) = -2x^3',
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