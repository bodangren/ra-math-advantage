import { describe, it, expect } from 'vitest';

/**
 * Phase 3 Red — Teacher-facing status view mapping tests.
 *
 * These tests import from the intended implementation module under
 * `apps/integrated-math-3/lib/teacher/content-authoring/get-teacher-authoring-status-view.ts`,
 * which does not yet exist.
 */

describe('getTeacherAuthoringStatusView', () => {
  it('maps draft status to save/submit availability', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const view = getTeacherAuthoringStatusView({
      teacherFacingStatus: 'draft',
      lessonId: 'lesson_1',
      lessonVersionId: 'lv_1',
    });

    expect(view.label).toBe('Draft');
    expect(view.canSave).toBe(true);
    expect(view.canSubmit).toBe(true);
    expect(view.canEdit).toBe(true);
    expect(view.rejectionComment).toBeUndefined();
  });

  it('maps submitted status to read-only', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const view = getTeacherAuthoringStatusView({
      teacherFacingStatus: 'submitted',
      lessonId: 'lesson_1',
      lessonVersionId: 'lv_1',
    });

    expect(view.label).toBe('Submitted');
    expect(view.canSave).toBe(false);
    expect(view.canSubmit).toBe(false);
    expect(view.canEdit).toBe(false);
  });

  it('maps rejected status with rejection comment and edit action', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const view = getTeacherAuthoringStatusView({
      teacherFacingStatus: 'rejected',
      rejectionComment: 'Fix the equation.',
      lessonId: 'lesson_1',
      lessonVersionId: 'lv_1',
    });

    expect(view.label).toBe('Rejected');
    expect(view.rejectionComment).toBe('Fix the equation.');
    expect(view.canEditAfterReject).toBe(true);
  });

  it('maps approved status to publish-ready messaging', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const view = getTeacherAuthoringStatusView({
      teacherFacingStatus: 'approved',
      lessonId: 'lesson_1',
      lessonVersionId: 'lv_1',
    });

    expect(view.label).toBe('Approved');
    expect(view.isPublishReady).toBe(true);
  });

  it('maps published status to assignment pointer', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const view = getTeacherAuthoringStatusView({
      teacherFacingStatus: 'published',
      lessonId: 'lesson_1',
      lessonVersionId: 'lv_1',
    });

    expect(view.label).toBe('Published');
    expect(view.canEdit).toBe(false);
  });

  it('rejects unknown persisted statuses instead of casting to success', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    expect(() =>
      getTeacherAuthoringStatusView({
        teacherFacingStatus: 'review' as any,
        lessonId: 'lesson_1',
        lessonVersionId: 'lv_1',
      }),
    ).toThrow();
  });

  it('does not hide a missing rejection comment', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const view = getTeacherAuthoringStatusView({
      teacherFacingStatus: 'rejected',
      lessonId: 'lesson_1',
      lessonVersionId: 'lv_1',
    });

    expect(view.label).toBe('Rejected');
    expect(view.rejectionComment).toBeUndefined();
  });
});
