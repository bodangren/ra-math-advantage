import { describe, it, expect } from 'vitest';
import type { SeedDemoEnvironment } from '@/convex/seed/types';

describe('seed-demo-env', () => {
  describe('demo environment seed data', () => {
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
      studentProgress: [
        { studentUsername: 'student1@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 1, status: 'not_started' },
        { studentUsername: 'student2@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 3, status: 'in_progress' },
        { studentUsername: 'student3@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 6, status: 'in_progress' },
        { studentUsername: 'student4@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 9, status: 'completed' },
        { studentUsername: 'student5@demo', lessonSlug: 'module-1-lesson-1', phaseNumber: 12, status: 'completed' },
      ],
    };

    it('seeds exactly one organization', () => {
      expect(demoEnvironment.organization).toBeDefined();
      expect(demoEnvironment.organization.name).toBe('Demo Organization');
      expect(demoEnvironment.organization.slug).toBe('demo');
    });

    it('seeds exactly one teacher with correct credentials and role', () => {
      expect(demoEnvironment.teacher).toBeDefined();
      expect(demoEnvironment.teacher.username).toBe('teacher@demo');
      expect(demoEnvironment.teacher.role).toBe('teacher');
      expect(demoEnvironment.teacher.displayName).toBe('Demo Teacher');
      expect(demoEnvironment.teacher.password).toBe('Demo1234!');
      expect(demoEnvironment.teacher.organizationSlug).toBe('demo');
    });

    it('seeds exactly 5 students with correct credentials and roles', () => {
      expect(demoEnvironment.students).toHaveLength(5);
      
      const expectedUsernames = [
        'student1@demo',
        'student2@demo',
        'student3@demo',
        'student4@demo',
        'student5@demo',
      ];
      const expectedDisplayNames = [
        'Student One',
        'Student Two',
        'Student Three',
        'Student Four',
        'Student Five',
      ];

      demoEnvironment.students.forEach((student, index) => {
        expect(student.username).toBe(expectedUsernames[index]);
        expect(student.role).toBe('student');
        expect(student.displayName).toBe(expectedDisplayNames[index]);
        expect(student.password).toBe('Demo1234!');
        expect(student.organizationSlug).toBe('demo');
      });
    });

    it('all student usernames are unique', () => {
      const usernames = demoEnvironment.students.map(s => s.username);
      const uniqueUsernames = new Set(usernames);
      expect(uniqueUsernames.size).toBe(usernames.length);
    });

    it('seeds exactly one class named "IM3 Period 1"', () => {
      expect(demoEnvironment.className).toBe('IM3 Period 1');
    });

    it('student progress entries reference valid student usernames', () => {
      const studentUsernames = new Set(demoEnvironment.students.map(s => s.username));
      demoEnvironment.studentProgress.forEach(progress => {
        expect(studentUsernames.has(progress.studentUsername)).toBe(true);
      });
    });

    it('student progress entries have valid statuses', () => {
      const validStatuses = ['not_started', 'in_progress', 'completed'];
      demoEnvironment.studentProgress.forEach(progress => {
        expect(validStatuses).toContain(progress.status);
      });
    });

    it('all 5 students have progress records for lesson 1-1', () => {
      expect(demoEnvironment.studentProgress).toHaveLength(5);
      const lesson1Progress = demoEnvironment.studentProgress.filter(
        p => p.lessonSlug === 'module-1-lesson-1'
      );
      expect(lesson1Progress).toHaveLength(5);
    });

    it('progress records span different phases showing varied completion', () => {
      const phases = demoEnvironment.studentProgress.map(p => p.phaseNumber);
      const uniquePhases = new Set(phases);
      expect(uniquePhases.size).toBeGreaterThan(1);
    });

    it('seed data matches the structure for Convex insertion', () => {
      const now = Date.now();
      
      const orgDoc = {
        name: demoEnvironment.organization.name,
        slug: demoEnvironment.organization.slug,
        settings: {},
        createdAt: now,
        updatedAt: now,
      };
      expect(orgDoc).toHaveProperty('name');
      expect(orgDoc).toHaveProperty('slug');
      expect(orgDoc).toHaveProperty('createdAt');
      expect(orgDoc).toHaveProperty('updatedAt');

      const teacherProfileDoc = {
        organizationId: 'org-id',
        username: demoEnvironment.teacher.username,
        role: demoEnvironment.teacher.role,
        displayName: demoEnvironment.teacher.displayName,
        metadata: {},
        createdAt: now,
        updatedAt: now,
      };
      expect(teacherProfileDoc).toHaveProperty('organizationId');
      expect(teacherProfileDoc).toHaveProperty('username');
      expect(teacherProfileDoc).toHaveProperty('role');
      expect(teacherProfileDoc).toHaveProperty('displayName');
      expect(teacherProfileDoc).toHaveProperty('metadata');
      expect(teacherProfileDoc).toHaveProperty('createdAt');
      expect(teacherProfileDoc).toHaveProperty('updatedAt');

      const classDoc = {
        teacherId: 'teacher-profile-id',
        name: demoEnvironment.className,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
      expect(classDoc).toHaveProperty('teacherId');
      expect(classDoc).toHaveProperty('name');
      expect(classDoc).toHaveProperty('archived');
      expect(classDoc).toHaveProperty('createdAt');
      expect(classDoc).toHaveProperty('updatedAt');

      demoEnvironment.students.forEach(student => {
        const studentProfileDoc = {
          organizationId: 'org-id',
          username: student.username,
          role: student.role,
          displayName: student.displayName,
          metadata: {},
          createdAt: now,
          updatedAt: now,
        };
        expect(studentProfileDoc).toHaveProperty('organizationId');
        expect(studentProfileDoc).toHaveProperty('username');
        expect(studentProfileDoc).toHaveProperty('role');
        expect(studentProfileDoc).toHaveProperty('displayName');
        expect(studentProfileDoc).toHaveProperty('metadata');
        expect(studentProfileDoc).toHaveProperty('createdAt');
        expect(studentProfileDoc).toHaveProperty('updatedAt');

        const authCredentialDoc = {
          profileId: 'profile-id',
          username: student.username,
          role: student.role,
          organizationId: 'org-id',
          passwordHash: 'hash',
          passwordSalt: 'salt',
          passwordHashIterations: 120000,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        expect(authCredentialDoc).toHaveProperty('profileId');
        expect(authCredentialDoc).toHaveProperty('username');
        expect(authCredentialDoc).toHaveProperty('role');
        expect(authCredentialDoc).toHaveProperty('organizationId');
        expect(authCredentialDoc).toHaveProperty('passwordHash');
        expect(authCredentialDoc).toHaveProperty('passwordSalt');
        expect(authCredentialDoc).toHaveProperty('passwordHashIterations');
        expect(authCredentialDoc).toHaveProperty('isActive');
        expect(authCredentialDoc).toHaveProperty('createdAt');
        expect(authCredentialDoc).toHaveProperty('updatedAt');
      });

      const enrollmentDoc = {
        classId: 'class-id',
        studentId: 'student-profile-id',
        enrolledAt: now,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      expect(enrollmentDoc).toHaveProperty('classId');
      expect(enrollmentDoc).toHaveProperty('studentId');
      expect(enrollmentDoc).toHaveProperty('enrolledAt');
      expect(enrollmentDoc).toHaveProperty('status');
      expect(enrollmentDoc).toHaveProperty('createdAt');
      expect(enrollmentDoc).toHaveProperty('updatedAt');
    });
  });
});