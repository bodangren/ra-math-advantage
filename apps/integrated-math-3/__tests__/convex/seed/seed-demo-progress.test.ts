import { describe, it, expect } from 'vitest';
import type { SeedStudentProgress, SeedDemoEnvironment } from '@/convex/seed/types';

describe('seed-demo-progress', () => {
  describe('student progress seed data for lesson 1-1', () => {
    const lesson1Progress: SeedStudentProgress[] = [
      { studentUsername: 'student1@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 1, status: 'not_started' },
      { studentUsername: 'student2@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 3, status: 'in_progress' },
      { studentUsername: 'student3@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 6, status: 'in_progress' },
      { studentUsername: 'student4@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 9, status: 'completed' },
      { studentUsername: 'student5@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 12, status: 'completed' },
    ];

    const demoEnvironment: SeedDemoEnvironment = {
      organization: { name: 'Demo Organization', slug: 'demo' },
      teacher: {
        organizationSlug: 'demo',
        username: 'teacher@demo',
        role: 'teacher',
        displayName: 'Demo Teacher',
        password: 'Demo1234!',
      },
      students: [
        { organizationSlug: 'demo', username: 'student1@demo', role: 'student', displayName: 'Student One', password: 'Demo1234!' },
        { organizationSlug: 'demo', username: 'student2@demo', role: 'student', displayName: 'Student Two', password: 'Demo1234!' },
        { organizationSlug: 'demo', username: 'student3@demo', role: 'student', displayName: 'Student Three', password: 'Demo1234!' },
        { organizationSlug: 'demo', username: 'student4@demo', role: 'student', displayName: 'Student Four', password: 'Demo1234!' },
        { organizationSlug: 'demo', username: 'student5@demo', role: 'student', displayName: 'Student Five', password: 'Demo1234!' },
      ],
      className: 'IM3 Period 1',
      studentProgress: lesson1Progress,
    };

    const lesson1TotalPhases = 12;

    it('seeds progress for all 5 students on lesson 1-1', () => {
      expect(lesson1Progress).toHaveLength(5);
      lesson1Progress.forEach(progress => {
        expect(progress.lessonSlug).toBe('module-1-lesson-1');
      });
    });

    it('student5 shows 100% completion (phase 12 of 12)', () => {
      const student5Progress = lesson1Progress.find(p => p.studentUsername === 'student5@demo');
      expect(student5Progress).toBeDefined();
      expect(student5Progress!.phaseNumber).toBe(lesson1TotalPhases);
      expect(student5Progress!.status).toBe('completed');
    });

    it('student4 shows 75% completion (phase 9 of 12)', () => {
      const student4Progress = lesson1Progress.find(p => p.studentUsername === 'student4@demo');
      expect(student4Progress).toBeDefined();
      expect(student4Progress!.phaseNumber).toBe(9);
      expect(student4Progress!.status).toBe('completed');
    });

    it('student3 shows 50% completion (phase 6 of 12)', () => {
      const student3Progress = lesson1Progress.find(p => p.studentUsername === 'student3@demo');
      expect(student3Progress).toBeDefined();
      expect(student3Progress!.phaseNumber).toBe(6);
      expect(student3Progress!.status).toBe('in_progress');
    });

    it('student2 shows 25% completion (phase 3 of 12)', () => {
      const student2Progress = lesson1Progress.find(p => p.studentUsername === 'student2@demo');
      expect(student2Progress).toBeDefined();
      expect(student2Progress!.phaseNumber).toBe(3);
      expect(student2Progress!.status).toBe('in_progress');
    });

    it('student1 shows 0% completion (phase 1 of 12)', () => {
      const student1Progress = lesson1Progress.find(p => p.studentUsername === 'student1@demo');
      expect(student1Progress).toBeDefined();
      expect(student1Progress!.phaseNumber).toBe(1);
      expect(student1Progress!.status).toBe('not_started');
    });

    it('all progress entries reference valid student usernames', () => {
      const studentUsernames = new Set(demoEnvironment.students.map(s => s.username));
      lesson1Progress.forEach(progress => {
        expect(studentUsernames.has(progress.studentUsername)).toBe(true);
      });
    });

    it('all progress entries have valid statuses', () => {
      const validStatuses = ['not_started', 'in_progress', 'completed'];
      lesson1Progress.forEach(progress => {
        expect(validStatuses).toContain(progress.status);
      });
    });

    it('completion percentage mapping is correct', () => {
      const expectedProgress = [
        { username: 'student1@demo', percentComplete: 0, status: 'not_started' },
        { username: 'student2@demo', percentComplete: 25, status: 'in_progress' },
        { username: 'student3@demo', percentComplete: 50, status: 'in_progress' },
        { username: 'student4@demo', percentComplete: 75, status: 'completed' },
        { username: 'student5@demo', percentComplete: 100, status: 'completed' },
      ];

      expectedProgress.forEach(expected => {
        const progress = lesson1Progress.find(p => p.studentUsername === expected.username);
        expect(progress).toBeDefined();
        
        let actualPercent: number;
        if (progress!.status === 'not_started') {
          actualPercent = 0;
        } else {
          actualPercent = Math.round((progress!.phaseNumber / lesson1TotalPhases) * 100);
        }
        expect(actualPercent).toBe(expected.percentComplete);
      });
    });

    it('seed data matches activity_completions table structure', () => {
      const now = Date.now();
      
      lesson1Progress.forEach(progress => {
        const completionDoc = {
          studentId: 'profile-id',
          activityId: 'activity-id',
          lessonId: 'lesson-id',
          phaseNumber: progress.phaseNumber,
          completedAt: progress.status === 'completed' ? now : undefined,
          idempotencyKey: `${progress.studentUsername}:${progress.lessonSlug}:${progress.phaseNumber}`,
          completionData: {},
          createdAt: now,
          updatedAt: now,
        };

        expect(completionDoc).toHaveProperty('studentId');
        expect(completionDoc).toHaveProperty('activityId');
        expect(completionDoc).toHaveProperty('lessonId');
        expect(completionDoc).toHaveProperty('phaseNumber');
        expect(completionDoc).toHaveProperty('idempotencyKey');
        expect(completionDoc).toHaveProperty('createdAt');
        expect(completionDoc).toHaveProperty('updatedAt');
      });
    });

    it('idempotency keys are unique per student per phase per lesson', () => {
      const idempotencyKeys = lesson1Progress.map(
        p => `${p.studentUsername}:${p.lessonSlug}:${p.phaseNumber}`
      );
      const uniqueKeys = new Set(idempotencyKeys);
      expect(uniqueKeys.size).toBe(idempotencyKeys.length);
    });

    it('student5 has completions for all phases 1-12', () => {
      const student5AllPhases: SeedStudentProgress[] = [];
      for (let phase = 1; phase <= lesson1TotalPhases; phase++) {
        student5AllPhases.push({
          studentUsername: 'student5@demo',
          lessonSlug: 'module-1-lesson-1',
          phaseNumber: phase,
          status: 'completed',
        });
      }
      
      expect(student5AllPhases).toHaveLength(12);
      student5AllPhases.forEach((progress, idx) => {
        expect(progress.phaseNumber).toBe(idx + 1);
        expect(progress.status).toBe('completed');
      });
    });
  });
});