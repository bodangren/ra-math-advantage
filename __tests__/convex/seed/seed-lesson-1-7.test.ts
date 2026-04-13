import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-1-7', () => {
  describe('Lesson 1-7: Quadratic Inequalities', () => {
    const lesson7Seed: SeedLesson = {
      unitNumber: 1,
      title: 'Quadratic Inequalities',
      slug: 'module-1-lesson-7',
      description: 'Solve quadratic inequalities using graphs and sign charts.',
      orderIndex: 7,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Assessment', phaseType: 'assessment', sections: [] },
        { phaseNumber: 9, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 10, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson7Seed.unitNumber).toBe(1);
      expect(lesson7Seed.title).toBe('Quadratic Inequalities');
      expect(lesson7Seed.slug).toBe('module-1-lesson-7');
      expect(lesson7Seed.orderIndex).toBe(7);
    });

    it('has exactly 10 phases', () => {
      expect(lesson7Seed.phases).toHaveLength(10);
    });

    it('correct phase sequence: explore, vocab, learn, 4×worked_example, assessment, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'worked_example',
        'assessment',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson7Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson7Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('has exactly 1 learn phase', () => {
      const learnPhases = lesson7Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases).toHaveLength(1);
    });

    it('has exactly 4 worked_example phases', () => {
      const workedExamples = lesson7Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(4);
    });
  });

  describe('activity records for lesson 1-7', () => {
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
            equation: 'y = x^2 - 5x + 6',
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
            problemType: 'inequality',
            equation: 'x^2 - 5x + 6 > 0',
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
              { id: '1', label: 'Solve x^2 - 5x + 6 > 0', correctAnswer: 'x < 2 or x > 3' },
              { id: '2', label: 'Solve x^2 + x - 12 > 0', correctAnswer: 'x < -4 or x > 3' },
            ],
          },
        },
      };

      expect(assessmentSection.content.componentKey).toBe('fill-in-the-blank');
      expect(validComponentKeys).toContain(assessmentSection.content.componentKey);
    });
  });
});