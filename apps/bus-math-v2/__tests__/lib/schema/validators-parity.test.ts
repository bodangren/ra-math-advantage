import { describe, expect, it } from 'vitest';

import {
  insertActivitySchema,
  insertActivitySubmissionSchema,
  insertClassEnrollmentSchema,
  insertClassSchema,
  insertContentRevisionSchema,
  insertLiveResponseSchema,
  insertLiveSessionSchema,
  insertOrganizationSchema,
  insertPhaseSchema,
  insertProfileSchema,
  insertResourceSchema,
  insertSessionLeaderboardEntrySchema,
  insertStudentProgressSchema,
  selectActivitySchema,
  selectProfileSchema,
} from '@/lib/schemas/validators';

describe('validators parity — insert schemas', () => {
  it('insertLessonSchema parses a valid lesson', () => {
    const result = insertPhaseSchema.safeParse({
      id: 'phase-1',
      lessonId: 'lesson-1',
      phaseNumber: 1,
      title: 'Test Phase',
      contentBlocks: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('insertActivitySchema parses a valid activity', () => {
    const result = insertActivitySchema.safeParse({
      id: 'activity-1',
      componentKey: 'spreadsheet',
      displayName: 'Test Activity',
      props: { template: 'trial-balance' },
      gradingConfig: { autoGrade: true, partialCredit: false },
      standardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('insertActivitySchema rejects invalid props for known component', () => {
    const result = insertActivitySchema.safeParse({
      id: 'activity-1',
      componentKey: 'spreadsheet',
      displayName: 'Test Activity',
      props: { template: 'invalid-template' },
    });
    expect(result.success).toBe(false);
  });

  it('insertResourceSchema parses a valid resource', () => {
    const result = insertResourceSchema.safeParse({
      id: 'resource-1',
      lessonId: 'lesson-1',
      phaseId: null,
      title: 'Test Resource',
      description: null,
      resourceType: 'pdf',
      filePath: null,
      externalUrl: null,
      metadata: null,
    });
    expect(result.success).toBe(true);
  });

  it('insertProfileSchema parses a valid profile', () => {
    const result = insertProfileSchema.safeParse({
      id: 'profile-1',
      organizationId: 'org-1',
      username: 'testuser',
      role: 'student',
      displayName: null,
      avatarUrl: null,
      metadata: null,
    });
    expect(result.success).toBe(true);
  });

  it('insertStudentProgressSchema parses valid progress', () => {
    const result = insertStudentProgressSchema.safeParse({
      id: 'progress-1',
      userId: 'user-1',
      phaseId: 'phase-1',
      status: 'in_progress',
      startedAt: new Date(),
      completedAt: null,
      timeSpentSeconds: 120,
      idempotencyKey: null,
    });
    expect(result.success).toBe(true);
  });

  it('insertActivitySubmissionSchema parses valid submission', () => {
    const result = insertActivitySubmissionSchema.safeParse({
      id: 'submission-1',
      userId: 'user-1',
      activityId: 'activity-1',
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: 'activity-1',
        mode: 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date().toISOString(),
        answers: { q1: 'a1' },
        parts: [{
          partId: 'p1',
          rawAnswer: 'answer',
          isCorrect: true,
          score: 1,
          maxScore: 1,
        }],
      },
      score: 85,
      maxScore: 100,
      feedback: null,
      submittedAt: new Date(),
      gradedAt: null,
      gradedBy: null,
    });
    expect(result.success).toBe(true);
  });

  it('insertClassSchema parses a valid class', () => {
    const result = insertClassSchema.safeParse({
      id: 'class-1',
      teacherId: 'teacher-1',
      name: 'Test Class',
      description: null,
      academicYear: null,
      archived: false,
      metadata: null,
    });
    expect(result.success).toBe(true);
  });

  it('insertClassEnrollmentSchema parses valid enrollment', () => {
    const result = insertClassEnrollmentSchema.safeParse({
      id: 'enrollment-1',
      classId: 'class-1',
      studentId: 'student-1',
      enrolledAt: new Date(),
      status: 'active',
    });
    expect(result.success).toBe(true);
  });

  it('insertLiveSessionSchema parses valid session', () => {
    const result = insertLiveSessionSchema.safeParse({
      id: 'session-1',
      activityId: 'activity-1',
      classId: 'class-1',
      hostId: 'host-1',
      status: 'waiting',
      startedAt: null,
      endedAt: null,
      settings: null,
    });
    expect(result.success).toBe(true);
  });

  it('insertLiveResponseSchema parses valid response', () => {
    const result = insertLiveResponseSchema.safeParse({
      id: 'response-1',
      sessionId: 'session-1',
      userId: 'user-1',
      questionId: 'q-1',
      answer: { text: 'answer' },
      isCorrect: true,
      responseTimeMs: 5000,
      respondedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('insertSessionLeaderboardEntrySchema parses valid entry', () => {
    const result = insertSessionLeaderboardEntrySchema.safeParse({
      id: 'entry-1',
      sessionId: 'session-1',
      userId: 'user-1',
      score: 100,
      totalQuestions: 10,
      avgResponseTimeMs: null,
      rank: null,
    });
    expect(result.success).toBe(true);
  });

  it('insertContentRevisionSchema parses valid revision', () => {
    const result = insertContentRevisionSchema.safeParse({
      id: 'revision-1',
      entityType: 'lesson',
      entityId: 'lesson-1',
      proposedChanges: {},
      validationStatus: 'pending',
      validationErrors: null,
      proposedBy: 'user-1',
      reviewedBy: null,
      reviewedAt: null,
      comment: null,
    });
    expect(result.success).toBe(true);
  });

  it('insertOrganizationSchema parses valid organization', () => {
    const result = insertOrganizationSchema.safeParse({
      id: 'org-1',
      name: 'Test Org',
      slug: 'test-org',
      settings: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('validators parity — select schemas', () => {
  it('select schemas require all fields', () => {
    const result = selectActivitySchema.safeParse({
      id: 'activity-1',
      componentKey: 'spreadsheet',
      displayName: 'Test',
      description: null,
      props: { template: 'trial-balance' },
      gradingConfig: null,
      standardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('select schemas reject missing required fields', () => {
    const result = selectProfileSchema.safeParse({
      id: 'profile-1',
      organizationId: 'org-1',
      username: 'testuser',
      // role is missing
    });
    expect(result.success).toBe(false);
  });
});
