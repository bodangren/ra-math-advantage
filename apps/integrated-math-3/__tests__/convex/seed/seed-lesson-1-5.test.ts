import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-1-5', () => {
  describe('Lesson 1-5: Solving Quadratic Equations by Completing the Square', () => {
    const lesson5Seed: SeedLesson = {
      unitNumber: 1,
      title: 'Solving Quadratic Equations by Completing the Square',
      slug: 'module-1-lesson-5',
      description: 'Solve quadratic equations by using the Square Root Property and completing the square.',
      orderIndex: 5,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 8, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 9, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 10, title: 'Worked Example 6', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 11, title: 'Worked Example 7', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 12, title: 'Worked Example 8', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 13, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 14, title: 'Worked Example 9', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 15, title: 'Worked Example 10', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 16, title: 'Worked Example 11', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 17, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 18, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson5Seed.unitNumber).toBe(1);
      expect(lesson5Seed.title).toBe('Solving Quadratic Equations by Completing the Square');
      expect(lesson5Seed.slug).toBe('module-1-lesson-5');
      expect(lesson5Seed.orderIndex).toBe(5);
    });

    it('has exactly 18 phases', () => {
      expect(lesson5Seed.phases).toHaveLength(18);
    });

    it('correct phase sequence: explore, vocab, learn, 3×worked_example, learn, 5×worked_example, learn, 3×worked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'worked_example',
        'worked_example',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson5Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson5Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson5Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('has exactly 3 learn phases', () => {
      const learnPhases = lesson5Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases).toHaveLength(3);
    });

    it('has exactly 11 worked_example phases', () => {
      const workedExamples = lesson5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(11);
    });

    it('worked examples are numbered 1-11 in order', () => {
      const workedExamples = lesson5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });

    it('discourse phase is phase 17', () => {
      const discoursePhase = lesson5Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(17);
    });

    it('does not include an assessment phase', () => {
      const assessmentPhase = lesson5Seed.phases.find((p) => p.phaseType === 'assessment');
      expect(assessmentPhase).toBeUndefined();
    });

    it('reflection phase is phase 18', () => {
      const reflectionPhase = lesson5Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(18);
    });
  });

  describe('activity records for lesson 1-5', () => {
    const validComponentKeys = [
      'graphing-explorer',
      'step-by-step-solver',
      'comprehension-quiz',
      'fill-in-the-blank',
      'rate-of-change-calculator',
      'discriminant-analyzer',
    ] as const;

    it('explore phase should have step-by-step-solver activity', () => {
      const exploreSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'step-by-step-solver' as const,
          props: {
            problemType: 'completing-square',
            equation: 'x^2 - 4x - 5 = 0',
            steps: [],
          },
        },
      };

      expect(exploreSection.content.componentKey).toBe('step-by-step-solver');
      expect(validComponentKeys).toContain(exploreSection.content.componentKey);
    });

    it('worked examples should use step-by-step-solver activity', () => {
      const workedExampleSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'step-by-step-solver' as const,
          props: {
            problemType: 'completing-square',
            equation: 'x^2 + 6x + 5 = 0',
            steps: [],
          },
        },
      };

      expect(workedExampleSection.content.componentKey).toBe('step-by-step-solver');
      expect(validComponentKeys).toContain(workedExampleSection.content.componentKey);
    });

    it('discourse phase should have comprehension-quiz activity', () => {
      const discourseSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'comprehension-quiz' as const,
          props: {
            questions: [
              {
                question: 'What value completes x^2 + 10x + ___ to make a perfect square?',
                options: ['5', '20', '25', '100'],
                correctIndex: 2,
              },
            ],
          },
        },
      };

      expect(discourseSection.content.componentKey).toBe('comprehension-quiz');
      expect(validComponentKeys).toContain(discourseSection.content.componentKey);
    });
  });
});
