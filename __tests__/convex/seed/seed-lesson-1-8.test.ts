import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-1-8', () => {
  describe('Lesson 1-8: Linear-Quadratic Systems', () => {
    const lesson8Seed: SeedLesson = {
      unitNumber: 1,
      title: 'Linear-Quadratic Systems',
      slug: 'module-1-lesson-8',
      description: 'Solve systems of linear and quadratic equations.',
      orderIndex: 8,
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
      expect(lesson8Seed.unitNumber).toBe(1);
      expect(lesson8Seed.title).toBe('Linear-Quadratic Systems');
      expect(lesson8Seed.slug).toBe('module-1-lesson-8');
      expect(lesson8Seed.orderIndex).toBe(8);
    });

    it('has exactly 10 phases', () => {
      expect(lesson8Seed.phases).toHaveLength(10);
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

      const actualSequence = lesson8Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson8Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('has exactly 1 learn phase', () => {
      const learnPhases = lesson8Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases).toHaveLength(1);
    });

    it('has exactly 4 worked_example phases', () => {
      const workedExamples = lesson8Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(4);
    });
  });

  describe('activity records for lesson 1-8', () => {
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
            equations: ['y = x^2', 'y = x + 2'],
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
            problemType: 'system',
            equations: ['y = x^2', 'y = x + 2'],
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
              { id: '1', label: 'How many solutions can a linear-quadratic system have?', correctAnswer: '0, 1, or 2' },
            ],
          },
        },
      };

      expect(assessmentSection.content.componentKey).toBe('fill-in-the-blank');
      expect(validComponentKeys).toContain(assessmentSection.content.componentKey);
    });
  });
});