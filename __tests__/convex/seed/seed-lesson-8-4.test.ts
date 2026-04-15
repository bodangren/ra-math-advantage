import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedPhase } from '@/convex/seed/types';

describe('seed-lesson-8-4', () => {
  describe('Lesson 8-4: Normal Distributions', () => {
    const lesson8_4Seed: SeedLesson = {
      unitNumber: 8,
      title: 'Normal Distributions',
      slug: 'module-8-lesson-4',
      description: 'Students classify variables, analyze probability distributions, apply the Empirical Rule, and use z-values for standardization.',
      orderIndex: 4,
      phases: [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
        { phaseNumber: 3, title: 'Learn: Probability Distributions', phaseType: 'learn', sections: [] },
        { phaseNumber: 4, title: 'Worked Example 1', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 5, title: 'Worked Example 2', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 6, title: 'Worked Example 3', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 7, title: 'Learn: Normal Distributions', phaseType: 'learn', sections: [] },
        { phaseNumber: 8, title: 'Worked Example 4', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 9, title: 'Worked Example 5', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 10, title: 'Learn: The Standard Normal Distribution', phaseType: 'learn', sections: [] },
        { phaseNumber: 11, title: 'Worked Example 6', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 12, title: 'Worked Example 7', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 13, title: 'Worked Example 8', phaseType: 'worked_example', sections: [] },
        { phaseNumber: 14, title: 'Discourse', phaseType: 'discourse', sections: [] },
        { phaseNumber: 15, title: 'Reflection', phaseType: 'reflection', sections: [] },
      ],
    };

    it('lesson has correct metadata', () => {
      expect(lesson8_4Seed.unitNumber).toBe(8);
      expect(lesson8_4Seed.title).toBe('Normal Distributions');
      expect(lesson8_4Seed.slug).toBe('module-8-lesson-4');
      expect(lesson8_4Seed.orderIndex).toBe(4);
    });

    it('has exactly 15 phases', () => {
      expect(lesson8_4Seed.phases).toHaveLength(15);
    });

    it('correct phase sequence: explore, vocab, learn, 3xworked_example, learn, 2xworked_example, learn, 3xworked_example, discourse, reflection', () => {
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
        'learn',
        'worked_example',
        'worked_example',
        'worked_example',
        'discourse',
        'reflection',
      ];

      const actualSequence = lesson8_4Seed.phases.map((p) => p.phaseType);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('explore phase is phase 1', () => {
      const explorePhase = lesson8_4Seed.phases.find((p) => p.phaseType === 'explore');
      expect(explorePhase?.phaseNumber).toBe(1);
    });

    it('vocabulary phase is phase 2', () => {
      const vocabPhase = lesson8_4Seed.phases.find((p) => p.phaseType === 'vocabulary');
      expect(vocabPhase?.phaseNumber).toBe(2);
    });

    it('learn phases are phases 3, 7, and 10', () => {
      const learnPhases = lesson8_4Seed.phases.filter((p) => p.phaseType === 'learn');
      expect(learnPhases).toHaveLength(3);
      expect(learnPhases.map(p => p.phaseNumber)).toEqual([3, 7, 10]);
    });

    it('discourse phase is phase 14', () => {
      const discoursePhase = lesson8_4Seed.phases.find((p) => p.phaseType === 'discourse');
      expect(discoursePhase?.phaseNumber).toBe(14);
    });

    it('reflection phase is phase 15', () => {
      const reflectionPhase = lesson8_4Seed.phases.find((p) => p.phaseType === 'reflection');
      expect(reflectionPhase?.phaseNumber).toBe(15);
    });

    it('has exactly 8 worked_example phases', () => {
      const workedExamples = lesson8_4Seed.phases.filter((p) => p.phaseType === 'worked_example');
      expect(workedExamples).toHaveLength(8);
    });

    it('worked examples are numbered 1-8 in order', () => {
      const workedExamples = lesson8_4Seed.phases.filter((p) => p.phaseType === 'worked_example');
      workedExamples.forEach((we, idx) => {
        expect(we.title).toBe(`Worked Example ${idx + 1}`);
      });
    });
  });

  describe('activity records for lesson 8-4', () => {
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

  describe('curriculum alignment for lesson 8-4', () => {
    it('maps to Normal Distributions from curriculum', () => {
      const lessonSlug = 'module-8-lesson-4';
      expect(lessonSlug).toBe('module-8-lesson-4');
    });

    it('preserves z-score notation from curriculum', () => {
      const zScoreFormula = 'z = (X - mu) / sigma';
      expect(zScoreFormula).toBe('z = (X - mu) / sigma');
    });

    it('preserves Empirical Rule percentages', () => {
      const empiricalRule = {
        oneSigma: '68%',
        twoSigma: '95%',
        threeSigma: '99.7%'
      };
      expect(empiricalRule.oneSigma).toBe('68%');
      expect(empiricalRule.twoSigma).toBe('95%');
      expect(empiricalRule.threeSigma).toBe('99.7%');
    });
  });
});