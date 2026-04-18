import { describe, it, expect } from 'vitest';
import {
  buildStudentDashboardViewModel,
  type StudentDashboardUnit,
} from '@/lib/student/dashboard';

describe('buildStudentDashboardViewModel', () => {
  describe('estimatedMinutes', () => {
    it('includes estimatedMinutes sum from lessons', () => {
      const units: StudentDashboardUnit[] = [
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Intro to Quadratics',
              slug: 'intro',
              description: null,
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
              estimatedMinutes: 85,
              isLocked: false,
            },
          ],
        },
      ];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.units[0].lessons[0].estimatedMinutes).toBe(85);
    });

    it('sums estimatedMinutes across all phases for a lesson', () => {
      const units: StudentDashboardUnit[] = [
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'lesson-1',
              description: null,
              completedPhases: 3,
              totalPhases: 6,
              progressPercentage: 50,
              estimatedMinutes: 120,
              isLocked: false,
            },
            {
              id: 'l2',
              unitNumber: 1,
              title: 'Lesson 2',
              slug: 'lesson-2',
              description: null,
              completedPhases: 0,
              totalPhases: 4,
              progressPercentage: 0,
              estimatedMinutes: 60,
              isLocked: true,
            },
          ],
        },
      ];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.units[0].lessons[0].estimatedMinutes).toBe(120);
      expect(vm.units[0].lessons[1].estimatedMinutes).toBe(60);
    });

    it('handles missing estimatedMinutes as undefined', () => {
      const units: StudentDashboardUnit[] = [
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'lesson-1',
              description: null,
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
              isLocked: false,
            },
          ],
        },
      ];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.units[0].lessons[0].estimatedMinutes).toBeUndefined();
    });
  });

  describe('lesson lock/unlock state', () => {
    it('marks first lesson as unlocked', () => {
      const units: StudentDashboardUnit[] = [
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'lesson-1',
              description: null,
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
              isLocked: false,
            },
          ],
        },
      ];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.units[0].lessons[0].isLocked).toBe(false);
    });

    it('marks subsequent lessons as locked when prior lesson not complete', () => {
      const units: StudentDashboardUnit[] = [
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'lesson-1',
              description: null,
              completedPhases: 3,
              totalPhases: 6,
              progressPercentage: 50,
              isLocked: false,
            },
            {
              id: 'l2',
              unitNumber: 1,
              title: 'Lesson 2',
              slug: 'lesson-2',
              description: null,
              completedPhases: 0,
              totalPhases: 4,
              progressPercentage: 0,
              isLocked: true,
            },
          ],
        },
      ];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.units[0].lessons[0].isLocked).toBe(false);
      expect(vm.units[0].lessons[1].isLocked).toBe(true);
    });

    it('unlocks lesson when prior lesson assessment phase is complete', () => {
      const units: StudentDashboardUnit[] = [
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'lesson-1',
              description: null,
              completedPhases: 6,
              totalPhases: 6,
              progressPercentage: 100,
              isLocked: false,
            },
            {
              id: 'l2',
              unitNumber: 1,
              title: 'Lesson 2',
              slug: 'lesson-2',
              description: null,
              completedPhases: 0,
              totalPhases: 4,
              progressPercentage: 0,
              isLocked: false,
            },
          ],
        },
      ];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.units[0].lessons[0].isLocked).toBe(false);
      expect(vm.units[0].lessons[1].isLocked).toBe(false);
    });
  });

  describe('continueUrl smart navigation', () => {
    it('provides continueUrl to first lesson phase 1 when no progress', () => {
      const units: StudentDashboardUnit[] = [
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'lesson-1',
              description: null,
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
              isLocked: false,
            },
          ],
        },
      ];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.continueUrl).toBe('/student/lesson/lesson-1?phase=1');
    });

    it('provides continueUrl to in-progress lesson at first incomplete phase', () => {
      const units: StudentDashboardUnit[] = [
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'lesson-1',
              description: null,
              completedPhases: 3,
              totalPhases: 6,
              progressPercentage: 50,
              isLocked: false,
            },
          ],
        },
      ];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.continueUrl).toBe('/student/lesson/lesson-1?phase=4');
    });

    it('provides continueUrl to completion summary when all lessons complete', () => {
      const units: StudentDashboardUnit[] = [
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'lesson-1',
              description: null,
              completedPhases: 6,
              totalPhases: 6,
              progressPercentage: 100,
              isLocked: false,
            },
          ],
        },
      ];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.continueUrl).toBe('/student/dashboard?complete=module-1');
    });

    it('returns null continueUrl when no lessons exist', () => {
      const units: StudentDashboardUnit[] = [];

      const vm = buildStudentDashboardViewModel(units);

      expect(vm.continueUrl).toBeNull();
    });
  });
});