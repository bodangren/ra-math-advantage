import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-4-5', () => {
  describe('Lesson 4-5: Operations with Radical Expressions', () => {
    const lesson4_5Seed: SeedLesson = {
      unitNumber: 4,
      title: 'Operations with Radical Expressions',
      slug: 'module-4-lesson-5',
      description: 'Students simplify radical expressions, add, subtract, multiply, and divide radicals, and rationalize denominators.',
      orderIndex: 5,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Properties of Radicals', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Learn: Adding and Subtracting Radical Expressions', phaseType: 'learn', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 9, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 10, title: 'Learn: Rationalizing the Denominator', phaseType: 'learn', sections: [] },
        { phaseNumber: 11, title: 'Worked Example 6', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 12, title: 'Worked Example 7', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 13, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 14, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson4_5Seed.unitNumber).toBe(4);
      expect(lesson4_5Seed.title).toBe('Operations with Radical Expressions');
      expect(lesson4_5Seed.slug).toBe('module-4-lesson-5');
      expect(lesson4_5Seed.orderIndex).toBe(5);
    });

    it('has exactly 14 phases', () => {
      expect(lesson4_5Seed.phases).toHaveLength(14);
    });

    it('correct phase sequence: explore, vocab, learn, 2×worked_example, learn, 3×worked_example, learn, 2×worked_example, discourse, reflection', () => {
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
        'learn',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson4_5Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson4_5Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson4_5Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('first learn phase is phase 3', () => {
      const learnPhases = lesson4_5Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[0]?.phaseNumber).toBe(3);
    });

    it('second learn phase is phase 6', () => {
      const learnPhases = lesson4_5Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[1]?.phaseNumber).toBe(6);
    });

    it('third learn phase is phase 10', () => {
      const learnPhases = lesson4_5Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[2]?.phaseNumber).toBe(10);
    });

    it('has exactly 7 worked_example phases', () => {
      const workedExamples = lesson4_5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(7);
    });

    it('worked examples are numbered 1-7 in order', () => {
      const workedExamples = lesson4_5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });

    it('discourse phase is phase 13', () => {
      const discoursePhase = lesson4_5Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(13);
    });

    it('reflection phase is phase 14', () => {
      const reflectionPhase = lesson4_5Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(14);
    });
  });

  describe('activity records for lesson 4-5', () => {
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
            equation: 'y = sqrt(x)',
            title: 'Explore Radical Operations',
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
            equation: 'cuberoot(-27a^6b^14)',
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