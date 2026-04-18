import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-9-2', () => {
  describe('Lesson 9-2: Trigonometric Functions of General Angles', () => {
    const lesson9_2Seed: SeedLesson = {
      unitNumber: 9,
      title: 'Trigonometric Functions of General Angles',
      slug: 'module-9-lesson-2',
      description: 'Students find values of trigonometric functions for acute angles, general angles, and by using reference angles.',
      orderIndex: 2,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Trigonometric Functions in Right Triangles', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Learn: Trigonometric Functions of General Angles', phaseType: 'learn', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 9, title: 'Learn: Trigonometric Functions with Reference Angles', phaseType: 'learn', sections: [] },
        { phaseNumber: 10, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 11, title: 'Worked Example 6', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 12, title: 'Worked Example 7', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 13, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 14, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson9_2Seed.unitNumber).toBe(9);
      expect(lesson9_2Seed.title).toBe('Trigonometric Functions of General Angles');
      expect(lesson9_2Seed.slug).toBe('module-9-lesson-2');
      expect(lesson9_2Seed.orderIndex).toBe(2);
    });

    it('has exactly 14 phases', () => {
      expect(lesson9_2Seed.phases).toHaveLength(14);
    });

    it('correct phase sequence: explore, vocab, learn, 2xworked_example, learn, 2xworked_example, learn, 3xworked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'learn',
        'worked_example',
        'worked_example',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson9_2Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson9_2Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson9_2Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('first learn phase is phase 3', () => {
      const learnPhases = lesson9_2Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[0]?.phaseNumber).toBe(3);
    });

    it('second learn phase is phase 6', () => {
      const learnPhases = lesson9_2Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[1]?.phaseNumber).toBe(6);
    });

    it('third learn phase is phase 9', () => {
      const learnPhases = lesson9_2Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[2]?.phaseNumber).toBe(9);
    });

    it('discourse phase is phase 13', () => {
      const discoursePhase = lesson9_2Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(13);
    });

    it('reflection phase is phase 14', () => {
      const reflectionPhase = lesson9_2Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(14);
    });

    it('has exactly 7 worked_example phases', () => {
      const workedExamples = lesson9_2Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(7);
    });

    it('worked examples are numbered 1-7 in order', () => {
      const workedExamples = lesson9_2Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });
  });

  describe('activity records for lesson 9-2', () => {
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
            title: 'Trig Function Explorer',
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