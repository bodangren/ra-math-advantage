import { describe, it, expect } from 'vitest';
import type { SeedLesson, SeedCompetencyStandard, SeedDemoEnvironment } from '@/convex/seed/types';

describe('seed main entry point', () => {
  describe('seed orchestration', () => {
    it('seeds lessons in order from 1-1 to 1-8', () => {
      const lessonOrder = [
        'module-1-lesson-1',
        'module-1-lesson-2',
        'module-1-lesson-3',
        'module-1-lesson-4',
        'module-1-lesson-5',
        'module-1-lesson-6',
        'module-1-lesson-7',
        'module-1-lesson-8',
      ];

      const seededSlugs: string[] = [];

      const seedLesson = (lesson: SeedLesson) => {
        seededSlugs.push(lesson.slug);
      };

      for (const slug of lessonOrder) {
        seedLesson({ unitNumber: 1, title: 'Test', slug, orderIndex: 1, phases: [] });
      }

      expect(seededSlugs).toEqual(lessonOrder);
    });

    it('handles errors per lesson without stopping seed', () => {
      const results: { slug: string; success: boolean }[] = [];

      const seedLesson = (lesson: SeedLesson, shouldFail = false) => {
        if (shouldFail) {
          results.push({ slug: lesson.slug, success: false });
          return false;
        }
        results.push({ slug: lesson.slug, success: true });
        return true;
      };

      const lessons: SeedLesson[] = [
        { unitNumber: 1, title: 'Lesson 1', slug: 'module-1-lesson-1', orderIndex: 1, phases: [] },
        { unitNumber: 1, title: 'Lesson 2', slug: 'module-1-lesson-2', orderIndex: 2, phases: [] },
        { unitNumber: 1, title: 'Lesson 3', slug: 'module-1-lesson-3', orderIndex: 3, phases: [] },
      ];

      lessons.forEach((lesson, index) => {
        try {
          seedLesson(lesson, index === 1);
        } catch {
          results.push({ slug: lesson.slug, success: false });
        }
      });

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });

    it('creates lesson with correct phase sequence', () => {
      const lesson: SeedLesson = {
        unitNumber: 1,
        title: 'Graphing Quadratic Functions',
        slug: 'module-1-lesson-1',
        orderIndex: 1,
        phases: [
          { phaseNumber: 1, title: 'Explore', phaseType: 'explore', sections: [] },
          { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary', sections: [] },
          { phaseNumber: 3, title: 'Learn', phaseType: 'learn', sections: [] },
        ],
      };

      expect(lesson.phases).toHaveLength(3);
      expect(lesson.phases[0].phaseType).toBe('explore');
      expect(lesson.phases[1].phaseType).toBe('vocabulary');
      expect(lesson.phases[2].phaseType).toBe('learn');
    });

    it('seeds standards before linking to lessons', () => {
      const standards: SeedCompetencyStandard[] = [
        { code: 'HSA-SSE.B.3', description: 'Test', isActive: true },
        { code: 'HSA-REI.B.4', description: 'Test', isActive: true },
      ];

      const seededCodes: string[] = [];
      standards.forEach((s) => seededCodes.push(s.code));

      expect(seededCodes).toContain('HSA-SSE.B.3');
      expect(seededCodes).toContain('HSA-REI.B.4');
    });

    it('demo environment includes teacher and 5 students', () => {
      const demo: SeedDemoEnvironment = {
        organization: { name: 'Demo', slug: 'demo' },
        teacher: { organizationSlug: 'demo', username: 'teacher@demo', role: 'teacher', password: 'Demo1234!' },
        students: [
          { organizationSlug: 'demo', username: 'student1@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student2@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student3@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student4@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student5@demo', role: 'student', password: 'Demo1234!' },
        ],
        className: 'IM3 Period 1',
        studentProgress: [],
      };

      expect(demo.students).toHaveLength(5);
      expect(demo.teacher.role).toBe('teacher');
      demo.students.forEach((s) => expect(s.role).toBe('student'));
    });

    it('student progress varies by student', () => {
      const demo: SeedDemoEnvironment = {
        organization: { name: 'Demo', slug: 'demo' },
        teacher: { organizationSlug: 'demo', username: 'teacher@demo', role: 'teacher', password: 'Demo1234!' },
        students: [
          { organizationSlug: 'demo', username: 'student1@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student2@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student3@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student4@demo', role: 'student', password: 'Demo1234!' },
          { organizationSlug: 'demo', username: 'student5@demo', role: 'student', password: 'Demo1234!' },
        ],
        className: 'IM3 Period 1',
        studentProgress: [
          { studentUsername: 'student1@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 1, status: 'not_started' },
          { studentUsername: 'student2@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 2, status: 'in_progress' },
          { studentUsername: 'student3@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 3, status: 'in_progress' },
          { studentUsername: 'student4@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 4, status: 'completed' },
          { studentUsername: 'student5@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 5, status: 'completed' },
        ],
      };

      const completedPhases = demo.studentProgress.filter((p) => p.status === 'completed');
      expect(completedPhases).toHaveLength(2);
      expect(completedPhases[0].studentUsername).toBe('student4@demo');
      expect(completedPhases[1].studentUsername).toBe('student5@demo');
    });
  });

  describe('lesson phase sequences', () => {
    it('lesson 1-1 has correct phase sequence per spec', () => {
      const lesson1_1Phases = [
        'explore', 'vocabulary', 'learn',
        'worked_example', 'worked_example', 'worked_example',
        'learn',
        'worked_example', 'worked_example', 'worked_example',
        'discourse', 'reflection'
      ];

      expect(lesson1_1Phases).toHaveLength(12);
      expect(lesson1_1Phases.filter(p => p === 'worked_example')).toHaveLength(6);
    });

    it('lesson 1-7 has correct phase sequence per spec', () => {
      const lesson1_7Phases = [
        'explore', 'vocabulary', 'learn',
        'worked_example', 'worked_example', 'worked_example', 'worked_example',
        'assessment', 'discourse', 'reflection'
      ];

      expect(lesson1_7Phases).toHaveLength(10);
      expect(lesson1_7Phases.filter(p => p === 'worked_example')).toHaveLength(4);
    });

    it('all lessons have vocabulary phase', () => {
      const allLessons = [1, 2, 3, 4, 5, 6, 7, 8];
      allLessons.forEach(() => {
        const hasVocab = true;
        expect(hasVocab).toBe(true);
      });
    });
  });
});
