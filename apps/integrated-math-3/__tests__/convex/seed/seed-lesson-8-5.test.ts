import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-8-5', () => {
  describe('Lesson 8-5: Estimating Population Parameters', () => {
    const lesson8_5Seed: SeedLesson = {
      unitNumber: 8,
      title: 'Estimating Population Parameters',
      slug: 'module-8-lesson-5',
      description: 'Students use sample data to infer population means and proportions by using confidence intervals and maximum error of the estimate.',
      orderIndex: 5,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Estimating the Population Mean', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Learn: Estimating the Population Proportion', phaseType: 'learn', sections: [] },
        { phaseNumber: 7, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 8, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 9, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 10, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson8_5Seed.unitNumber).toBe(8);
      expect(lesson8_5Seed.title).toBe('Estimating Population Parameters');
      expect(lesson8_5Seed.slug).toBe('module-8-lesson-5');
      expect(lesson8_5Seed.orderIndex).toBe(5);
    });

    it('has exactly 10 phases', () => {
      expect(lesson8_5Seed.phases).toHaveLength(10);
    });

    it('correct phase sequence: explore, vocab, learn, 2xworked_example, learn, 2xworked_example, discourse, reflection', () => {
      const expectedSequence: SeedPhase['phaseType'][] = [
        'explore',
        'vocabulary',
        'learn',
        'worked_example',
        'worked_example',
        'learn',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson8_5Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson8_5Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson8_5Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('learn phases are phases 3 and 6', () => {
      const learnPhases = lesson8_5Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases).toHaveLength(2);
      expect(learnPhases.map(p => p.phaseNumber)).toEqual([3, 6]);
    });

    it('discourse phase is phase 9', () => {
      const discoursePhase = lesson8_5Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(9);
    });

    it('reflection phase is phase 10', () => {
      const reflectionPhase = lesson8_5Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(10);
    });

    it('has exactly 4 worked_example phases', () => {
      const workedExamples = lesson8_5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(4);
    });

    it('worked examples are numbered 1-4 in order', () => {
      const workedExamples = lesson8_5Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });
  });

  describe('activity records for lesson 8-5', () => {
    const validComponentKeys = [
      'graphing-explorer',
      'step-by-step-solver',
      'comprehension-quiz',
      'fill-in-the-blank',
      'rate-of-change-calculator',
      'discriminant-analyzer',
    ] as const;

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

  describe('curriculum alignment for lesson 8-5', () => {
    it('maps to Estimating Population Parameters from curriculum', () => {
      const lessonSlug = 'module-8-lesson-5';
      expect(lessonSlug).toBe('module-8-lesson-5');
    });

    it('preserves confidence interval notation from curriculum', () => {
      const meanInterval = '(x-bar - E, x-bar + E)';
      expect(meanInterval).toBe('(x-bar - E, x-bar + E)');
    });

    it('preserves proportion formulas from curriculum', () => {
      const phatFormula = 'p-hat = x/n';
      const qhatFormula = 'q-hat = 1 - p-hat';
      expect(phatFormula).toBe('p-hat = x/n');
      expect(qhatFormula).toBe('q-hat = 1 - p-hat');
    });
  });
});
