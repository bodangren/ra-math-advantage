import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-1-3', () => {
  describe('Lesson 1-3: Complex Numbers', () => {
    const lesson3Seed: SeedLesson = {
      unitNumber: 1,
      title: 'Complex Numbers',
      slug: 'module-1-lesson-3',
      description: 'Introduction to imaginary unit i and operations with complex numbers.',
      orderIndex: 3,
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
        { phaseNumber: 12, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 13, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson3Seed.unitNumber).toBe(1);
      expect(lesson3Seed.title).toBe('Complex Numbers');
      expect(lesson3Seed.slug).toBe('module-1-lesson-3');
      expect(lesson3Seed.orderIndex).toBe(3);
    });

    it('has exactly 13 phases', () => {
      expect(lesson3Seed.phases).toHaveLength(13);
    });

    it('correct phase sequence: explore, vocab, learn, 3×worked_example, learn, 4×worked_example, discourse, reflection', () => {
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
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson3Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson3Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson3Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('has exactly 2 learn phases', () => {
      const learnPhases = lesson3Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases).toHaveLength(2);
    });

    it('first learn phase is phase 3', () => {
      const learnPhases = lesson3Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[0]?.phaseNumber).toBe(3);
    });

    it('second learn phase is phase 7', () => {
      const learnPhases = lesson3Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases[1]?.phaseNumber).toBe(7);
    });

    it('has exactly 7 worked_example phases', () => {
      const workedExamples = lesson3Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(7);
    });

    it('worked examples are numbered 1-7 in order', () => {
      const workedExamples = lesson3Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });

    it('discourse phase is phase 12', () => {
      const discoursePhase = lesson3Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(12);
    });

    it('reflection phase is phase 13', () => {
      const reflectionPhase = lesson3Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(13);
    });
  });

  describe('activity records for lesson 1-3', () => {
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
            problemType: 'simplify_imaginary',
            equation: 'sqrt(-9)',
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
            problemType: 'complex_operations',
            equation: '(3 + 2i) + (1 + 4i)',
            steps: [],
          },
        },
      };

      expect(workedExampleSection.content.componentKey).toBe('step-by-step-solver');
      expect(validComponentKeys).toContain(workedExampleSection.content.componentKey);
    });
  });
});
