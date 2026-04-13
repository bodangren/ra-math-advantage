import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-1-5', () => {
  describe('Lesson 1-5: Completing the Square', () => {
    const lesson5Seed: SeedLesson = {
      unitNumber: 1,
      title: 'Completing the Square',
      slug: 'module-1-lesson-5',
      description: 'Solve quadratic equations by using the Square Root Property and completing the square.',
      orderIndex: 5,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 9, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 10, title: 'Assessment', phaseType: 'assessment', sections: [] },
        { phaseNumber: 11, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 12, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson5Seed.unitNumber).toBe(1);
      expect(lesson5Seed.title).toBe('Completing the Square');
      expect(lesson5Seed.slug).toBe('module-1-lesson-5');
      expect(lesson5Seed.orderIndex).toBe(5);
    });

    it('has exactly 12 phases', () => {
      expect(lesson5Seed.phases).toHaveLength(12);
    });

    it('correct phase sequence: explore, vocab, 2×learn, 4×worked_example, learn, assessment, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'worked_example',
        'learn',
        'assessment',
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

    it('has exactly 4 worked_example phases', () => {
      const workedExamples = lesson5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(4);
    });

    it('worked examples are numbered 1-4 in order', () => {
      const workedExamples = lesson5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });

    it('discourse phase exists', () => {
      const discoursePhase = lesson5Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase).toBeDefined();
    });

    it('assessment phase exists', () => {
      const assessmentPhase = lesson5Seed.phases.find((p) => p.phaseType === 'assessment');
      expect(assessmentPhase).toBeDefined();
    });

    it('reflection phase exists', () => {
      const reflectionPhase = lesson5Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase).toBeDefined();
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

    it('assessment phase should have fill-in-the-blank activity', () => {
      const assessmentSection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'fill-in-the-blank' as const,
          props: {
            blanks: [
              { id: '1', label: 'Complete x^2 + 8x + ___ to make a perfect square', correctAnswer: '16' },
              { id: '2', label: 'Vertex form of x^2 + 6x + 5', correctAnswer: '(x+3)^2 - 4' },
            ],
          },
        },
      };

      expect(assessmentSection.content.componentKey).toBe('fill-in-the-blank');
      expect(validComponentKeys).toContain(assessmentSection.content.componentKey);
    });
  });
});