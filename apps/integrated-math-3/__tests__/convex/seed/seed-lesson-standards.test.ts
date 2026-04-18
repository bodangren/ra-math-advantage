import { describe, it, expect } from 'vitest';
import type { SeedLessonStandard } from '@/convex/seed/types';

describe('seed-lesson-standards', () => {
  describe('Module 6 lesson-standard links', () => {
    const module6LessonStandards: SeedLessonStandard[] = [
      { lessonSlug: 'module-6-lesson-1', standardCode: 'HSF-BF.B.5', isPrimary: true },
      { lessonSlug: 'module-6-lesson-1', standardCode: 'HSF-IF.C.7e', isPrimary: true },
      { lessonSlug: 'module-6-lesson-2', standardCode: 'HSF-BF.B.5', isPrimary: true },
      { lessonSlug: 'module-6-lesson-3', standardCode: 'HSF-LE.A.4', isPrimary: true },
      { lessonSlug: 'module-6-lesson-3', standardCode: 'HSF-BF.B.5', isPrimary: false },
      { lessonSlug: 'module-6-lesson-4', standardCode: 'HSF-LE.A.4', isPrimary: true },
      { lessonSlug: 'module-6-lesson-4', standardCode: 'HSF-IF.C.7e', isPrimary: false },
      { lessonSlug: 'module-6-lesson-5', standardCode: 'HSF-LE.A.4', isPrimary: true },
    ];

    it('seeds 8 lesson-standard links for Module 6', () => {
      expect(module6LessonStandards).toHaveLength(8);
    });

    it('every Module 6 lesson has at least one standard', () => {
      const lessonSlugs = ['module-6-lesson-1', 'module-6-lesson-2', 'module-6-lesson-3', 'module-6-lesson-4', 'module-6-lesson-5'];
      lessonSlugs.forEach((slug) => {
        const links = module6LessonStandards.filter((ls) => ls.lessonSlug === slug);
        expect(links.length).toBeGreaterThan(0);
      });
    });

    it('uses valid standard codes for logarithmic functions', () => {
      const validCodes = ['HSF-BF.B.5', 'HSF-LE.A.4', 'HSF-IF.C.7e'];
      module6LessonStandards.forEach((ls) => {
        expect(validCodes).toContain(ls.standardCode);
      });
    });

    it('marks at least one standard per lesson as primary', () => {
      const lessonSlugs = Array.from(new Set(module6LessonStandards.map((ls) => ls.lessonSlug)));
      lessonSlugs.forEach((slug) => {
        const hasPrimary = module6LessonStandards.some(
          (ls) => ls.lessonSlug === slug && ls.isPrimary
        );
        expect(hasPrimary).toBe(true);
      });
    });

    it('links HSF-BF.B.5 to lessons about inverse relationships and properties', () => {
      const inverseLessons = module6LessonStandards
        .filter((ls) => ls.standardCode === 'HSF-BF.B.5')
        .map((ls) => ls.lessonSlug);
      expect(inverseLessons).toContain('module-6-lesson-1');
      expect(inverseLessons).toContain('module-6-lesson-2');
      expect(inverseLessons).toContain('module-6-lesson-3');
    });

    it('links HSF-LE.A.4 to lessons about solving with logarithms', () => {
      const solvingLessons = module6LessonStandards
        .filter((ls) => ls.standardCode === 'HSF-LE.A.4')
        .map((ls) => ls.lessonSlug);
      expect(solvingLessons).toContain('module-6-lesson-3');
      expect(solvingLessons).toContain('module-6-lesson-4');
      expect(solvingLessons).toContain('module-6-lesson-5');
    });

    it('links HSF-IF.C.7e to graphing lessons', () => {
      const graphingLessons = module6LessonStandards
        .filter((ls) => ls.standardCode === 'HSF-IF.C.7e')
        .map((ls) => ls.lessonSlug);
      expect(graphingLessons).toContain('module-6-lesson-1');
      expect(graphingLessons).toContain('module-6-lesson-4');
    });
  });

  describe('Module 9 lesson-standard links', () => {
    const module9LessonStandards: SeedLessonStandard[] = [
      { lessonSlug: 'module-9-lesson-1', standardCode: 'HSF-TF.A.1', isPrimary: true },
      { lessonSlug: 'module-9-lesson-2', standardCode: 'HSF-TF.A.1', isPrimary: true },
      { lessonSlug: 'module-9-lesson-2', standardCode: 'HSF-TF.A.2', isPrimary: true },
      { lessonSlug: 'module-9-lesson-3', standardCode: 'HSF-TF.A.2', isPrimary: true },
      { lessonSlug: 'module-9-lesson-3', standardCode: 'HSF-TF.A.4', isPrimary: false },
      { lessonSlug: 'module-9-lesson-4', standardCode: 'HSF-TF.B.5', isPrimary: true },
      { lessonSlug: 'module-9-lesson-4', standardCode: 'HSF-TF.A.2', isPrimary: false },
      { lessonSlug: 'module-9-lesson-5', standardCode: 'HSF-TF.B.5', isPrimary: true },
      { lessonSlug: 'module-9-lesson-6', standardCode: 'HSF-TF.B.5', isPrimary: true },
      { lessonSlug: 'module-9-lesson-7', standardCode: 'HSF-TF.A.2', isPrimary: true },
    ];

    it('seeds 10 lesson-standard links for Module 9', () => {
      expect(module9LessonStandards).toHaveLength(10);
    });

    it('every Module 9 lesson has at least one standard', () => {
      const lessonSlugs = [
        'module-9-lesson-1',
        'module-9-lesson-2',
        'module-9-lesson-3',
        'module-9-lesson-4',
        'module-9-lesson-5',
        'module-9-lesson-6',
        'module-9-lesson-7',
      ];
      lessonSlugs.forEach((slug) => {
        const links = module9LessonStandards.filter((ls) => ls.lessonSlug === slug);
        expect(links.length).toBeGreaterThan(0);
      });
    });

    it('uses valid trigonometric function standard codes', () => {
      const validCodes = ['HSF-TF.A.1', 'HSF-TF.A.2', 'HSF-TF.A.4', 'HSF-TF.B.5'];
      module9LessonStandards.forEach((ls) => {
        expect(validCodes).toContain(ls.standardCode);
      });
    });

    it('marks at least one standard per lesson as primary', () => {
      const lessonSlugs = Array.from(new Set(module9LessonStandards.map((ls) => ls.lessonSlug)));
      lessonSlugs.forEach((slug) => {
        const hasPrimary = module9LessonStandards.some(
          (ls) => ls.lessonSlug === slug && ls.isPrimary
        );
        expect(hasPrimary).toBe(true);
      });
    });

    it('links HSF-TF.B.5 to graphing and modeling lessons', () => {
      const graphingLessons = module9LessonStandards
        .filter((ls) => ls.standardCode === 'HSF-TF.B.5')
        .map((ls) => ls.lessonSlug);
      expect(graphingLessons).toContain('module-9-lesson-4');
      expect(graphingLessons).toContain('module-9-lesson-5');
      expect(graphingLessons).toContain('module-9-lesson-6');
    });

    it('links HSF-TF.A.2 to unit circle and inverse function lessons', () => {
      const unitCircleLessons = module9LessonStandards
        .filter((ls) => ls.standardCode === 'HSF-TF.A.2')
        .map((ls) => ls.lessonSlug);
      expect(unitCircleLessons).toContain('module-9-lesson-2');
      expect(unitCircleLessons).toContain('module-9-lesson-3');
      expect(unitCircleLessons).toContain('module-9-lesson-7');
    });

    it('links HSF-TF.A.1 to angle measure lessons', () => {
      const angleLessons = module9LessonStandards
        .filter((ls) => ls.standardCode === 'HSF-TF.A.1')
        .map((ls) => ls.lessonSlug);
      expect(angleLessons).toContain('module-9-lesson-1');
      expect(angleLessons).toContain('module-9-lesson-2');
    });
  });
});
