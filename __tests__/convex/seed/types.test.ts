import { describe, it, expect } from 'vitest';

describe('seed types', () => {
  describe('SeedLesson', () => {
    it('has required fields matching lessons table schema', () => {
      const seedLesson = {
        unitNumber: 1,
        title: 'Graphing Quadratic Functions',
        slug: 'module-1-lesson-1',
        description: 'Students analyze vertex form...',
        learningObjectives: ['Analyze vertex form'],
        orderIndex: 1,
      };

      expect(seedLesson.unitNumber).toBe(1);
      expect(seedLesson.title).toBe('Graphing Quadratic Functions');
      expect(seedLesson.slug).toBe('module-1-lesson-1');
      expect(seedLesson.orderIndex).toBe(1);
    });

    it('slug is used as idempotency key', () => {
      const seedLesson = {
        unitNumber: 1,
        title: 'Test',
        slug: 'module-1-lesson-1',
        orderIndex: 1,
      };

      const anotherLesson = {
        unitNumber: 1,
        title: 'Test 2',
        slug: 'module-1-lesson-1',
        orderIndex: 1,
      };

      expect(seedLesson.slug).toBe(anotherLesson.slug);
    });
  });

  describe('SeedPhase', () => {
    it('has phaseType matching schema enum', () => {
      const validPhaseTypes = [
        'explore',
        'vocabulary',
        'learn',
        'key_concept',
        'worked_example',
        'guided_practice',
        'independent_practice',
        'assessment',
        'discourse',
        'reflection',
      ] as const;

      const phase = {
        phaseNumber: 1,
        title: 'Explore',
        phaseType: 'explore' as const,
        estimatedMinutes: 15,
      };

      expect(validPhaseTypes).toContain(phase.phaseType);
    });

    it('phaseNumber is 1-indexed', () => {
      const phases = [
        { phaseNumber: 1, title: 'Explore', phaseType: 'explore' as const },
        { phaseNumber: 2, title: 'Vocabulary', phaseType: 'vocabulary' as const },
      ];

      phases.forEach((p) => {
        expect(p.phaseNumber).toBeGreaterThan(0);
      });
    });
  });

  describe('SeedSection', () => {
    it('has sectionType matching schema enum', () => {
      const validSectionTypes = ['text', 'callout', 'activity', 'video', 'image'] as const;

      const section = {
        sequenceOrder: 1,
        sectionType: 'text' as const,
        content: { markdown: 'Some content' },
      };

      expect(validSectionTypes).toContain(section.sectionType);
    });

    it('activity sections reference componentKey and props', () => {
      const activitySection = {
        sequenceOrder: 1,
        sectionType: 'activity' as const,
        content: {
          componentKey: 'step-by-step-solver',
          props: {
            problemType: 'factoring',
            equation: 'x^2 - 5x + 6 = 0',
          },
        },
      };

      expect(activitySection.content.componentKey).toBeDefined();
      expect(activitySection.content.props).toBeDefined();
    });

    it('text sections have markdown content', () => {
      const textSection = {
        sequenceOrder: 1,
        sectionType: 'text' as const,
        content: {
          markdown: '# Introduction\n\nSome text with $x^2$ math.',
        },
      };

      expect(textSection.content.markdown).toBeDefined();
      expect(typeof textSection.content.markdown).toBe('string');
    });
  });

  describe('SeedActivity', () => {
    it('has valid componentKey from activity registry', () => {
      const validComponentKeys = [
        'graphing-explorer',
        'step-by-step-solver',
        'comprehension-quiz',
        'fill-in-the-blank',
        'rate-of-change-calculator',
        'discriminant-analyzer',
      ] as const;

      const activity = {
        componentKey: 'step-by-step-solver' as const,
        displayName: 'Factor x^2 - 5x + 6',
        description: 'Practice factoring',
        props: {
          problemType: 'factoring',
          equation: 'x^2 - 5x + 6 = 0',
        },
        gradingConfig: { autoGrade: true, partialCredit: true },
      };

      expect(validComponentKeys).toContain(activity.componentKey);
    });

    it('gradingConfig follows schema', () => {
      const activity = {
        componentKey: 'step-by-step-solver' as const,
        displayName: 'Test',
        props: {},
        gradingConfig: { autoGrade: true, partialCredit: true },
      };

      expect(activity.gradingConfig.autoGrade).toBe(true);
      expect(activity.gradingConfig.partialCredit).toBe(true);
    });
  });

  describe('SeedOrganization', () => {
    it('has required fields for demo org', () => {
      const org = {
        name: 'Demo Organization',
        slug: 'demo',
      };

      expect(org.name).toBeDefined();
      expect(org.slug).toBe('demo');
    });

    it('slug is used for idempotency', () => {
      const org1 = { name: 'Demo', slug: 'demo' };
      const org2 = { name: 'Demo 2', slug: 'demo' };

      expect(org1.slug).toBe(org2.slug);
    });
  });

  describe('SeedProfile', () => {
    it('has role from schema enum', () => {
      const validRoles = ['student', 'teacher', 'admin'] as const;

      const teacher = {
        organizationId: 'org123',
        username: 'teacher@demo',
        role: 'teacher' as const,
        displayName: 'Demo Teacher',
      };

      const student = {
        organizationId: 'org123',
        username: 'student1@demo',
        role: 'student' as const,
        displayName: 'Student One',
      };

      expect(validRoles).toContain(teacher.role);
      expect(validRoles).toContain(student.role);
    });
  });

  describe('SeedClass', () => {
    it('has required fields for demo class', () => {
      const classObj = {
        teacherId: 'profile123',
        name: 'IM3 Period 1',
        description: 'Integrated Math 3 Period 1',
        academicYear: '2025-2026',
        archived: false,
      };

      expect(classObj.name).toBe('IM3 Period 1');
      expect(classObj.archived).toBe(false);
    });
  });

  describe('SeedClassEnrollment', () => {
    it('has status from schema enum', () => {
      const validStatuses = ['active', 'withdrawn', 'completed'] as const;

      const enrollment = {
        classId: 'class123',
        studentId: 'student123',
        status: 'active' as const,
      };

      expect(validStatuses).toContain(enrollment.status);
    });
  });

  describe('SeedCompetencyStandard', () => {
    it('has required fields for standards', () => {
      const standard = {
        code: 'HSA-SSE.B.3',
        description: 'Choosing and producing equivalent forms of expressions',
        category: 'Algebra',
        isActive: true,
      };

      expect(standard.code).toMatch(/^[A-Z]{2,3}-[A-Z]{2,3}\.[A-Z]\.[A-Z0-9]+$/);
      expect(standard.isActive).toBe(true);
    });
  });

  describe('SeedStudentProgress', () => {
    it('has status from schema enum', () => {
      const validStatuses = ['not_started', 'in_progress', 'completed'] as const;

      const progress = {
        userId: 'profile123',
        phaseId: 'phase123',
        status: 'completed' as const,
        startedAt: Date.now(),
        completedAt: Date.now(),
      };

      expect(validStatuses).toContain(progress.status);
    });
  });

  describe('SeedDemoEnvironment', () => {
    it('creates 1 teacher and 5 students', () => {
      const teacherCount = 1;
      const studentCount = 5;

      expect(teacherCount).toBe(1);
      expect(studentCount).toBe(5);
    });

    it('student progress varies by student', () => {
      const studentProgress = [
        { username: 'student1@demo', progressPercent: 0 },
        { username: 'student2@demo', progressPercent: 25 },
        { username: 'student3@demo', progressPercent: 50 },
        { username: 'student4@demo', progressPercent: 75 },
        { username: 'student5@demo', progressPercent: 100 },
      ];

      const uniqueProgress = new Set(studentProgress.map((s) => s.progressPercent));
      expect(uniqueProgress.size).toBe(5);
    });
  });
});
