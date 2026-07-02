import { describe, it, expect } from 'vitest';

/**
 * Phase 3 — Status-view adversarial tests.
 *
 * The Phase 3 Green tests cover the basic status mapping
 * (draft, submitted, rejected, approved, published). These adversarial
 * tests probe failure paths and consistency:
 *
 *  - Every `teacherFacingStatus` value renders a DISTINCT label so a
 *    teacher can never mistake one lifecycle state for another in the
 *    status strip.
 *  - The rejection comment bound to a `rejected` DTO is surfaced
 *    verbatim and survives strings that look like sanitization probes
 *    (e.g. an empty string vs. absent).
 *  - The edit-after-reject state is a first-class bit on the view:
 *    `canEditAfterReject === true` only when the status is `rejected`,
 *    and is `false` for every other status.
 *  - Persisted Phase 2 lifecycle strings that are NOT teacher-facing
 *    names (`review`, `archived`) throw — the UI must never silently
 *    cast them to a default view. This is the safety property that
 *    prevents the persisted vs. teacher-facing naming drift from
 *    leaking into the composer.
 *  - The view object contains no extra `canX` bits that contradict the
 *    documented status semantics (no ghost edit affordance for
 *    submitted / approved / published).
 */

describe('Phase 3 adversarial: status labels are distinct', () => {
  it('every teacherFacingStatus maps to a distinct, non-empty label', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const states = ['draft', 'submitted', 'rejected', 'approved', 'published'] as const;
    const labels = states.map((s) =>
      getTeacherAuthoringStatusView({
        teacherFacingStatus: s,
        lessonId: 'lesson_x',
        lessonVersionId: 'lv_x',
      }).label,
    );

    expect(new Set(labels).size).toBe(states.length);
    for (const l of labels) {
      expect(typeof l).toBe('string');
      expect(l.length).toBeGreaterThan(0);
    }
  });

  it('every teacherFacingStatus view echoes the canonical teacherFacingStatus back', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const states = ['draft', 'submitted', 'rejected', 'approved', 'published'] as const;
    for (const s of states) {
      const view = getTeacherAuthoringStatusView({
        teacherFacingStatus: s,
        lessonId: 'l',
        lessonVersionId: 'lv',
      });
      expect(view.teacherFacingStatus).toBe(s);
    }
  });
});

describe('Phase 3 adversarial: rejection comment surfacing', () => {
  it('a rejected DTO surfaces the rejection comment verbatim', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const comment = 'Fix equation on line 2 — see reviewer note #17';
    const view = getTeacherAuthoringStatusView({
      teacherFacingStatus: 'rejected',
      rejectionComment: comment,
      lessonId: 'l',
      lessonVersionId: 'lv',
    });

    expect(view.label).toBe('Rejected');
    expect(view.rejectionComment).toBe(comment);
    expect(view.canEditAfterReject).toBe(true);
  });

  it('a rejected DTO without rejectionComment has rejectionComment === undefined (not empty string)', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const view = getTeacherAuthoringStatusView({
      teacherFacingStatus: 'rejected',
      lessonId: 'l',
      lessonVersionId: 'lv',
    });

    expect(view.label).toBe('Rejected');
    expect(view.rejectionComment).toBeUndefined();
    expect('rejectionComment' in view).toBe(false);
  });

  it('an empty-string rejectionComment is treated as no comment (not surfaced as "")', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const view = getTeacherAuthoringStatusView({
      teacherFacingStatus: 'rejected',
      rejectionComment: '',
      lessonId: 'l',
      lessonVersionId: 'lv',
    });

    // Empty rejection is a meaningful "no comment yet" signal that the
    // composer renders as "no message" — never as a literal empty
    // string in the UI strip.
    expect(view.rejectionComment).toBeUndefined();
  });
});

describe('Phase 3 adversarial: edit-after-reject is only true for rejected', () => {
  it('canEditAfterReject is true ONLY for the rejected status', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const states: Array<{
      s: 'draft' | 'submitted' | 'rejected' | 'approved' | 'published';
      expected: boolean;
    }> = [
      { s: 'draft', expected: false },
      { s: 'submitted', expected: false },
      { s: 'rejected', expected: true },
      { s: 'approved', expected: false },
      { s: 'published', expected: false },
    ];

    for (const { s, expected } of states) {
      const view = getTeacherAuthoringStatusView({
        teacherFacingStatus: s,
        lessonId: 'l',
        lessonVersionId: 'lv',
      });
      expect(view.canEditAfterReject).toBe(expected);
    }
  });
});

describe('Phase 3 adversarial: persisted vs teacher-facing naming', () => {
  it('persisted status "review" (Phase 2 internal) THROWS — UI must not silently render it', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    expect(() =>
      getTeacherAuthoringStatusView({
        teacherFacingStatus: 'review' as unknown as 'submitted',
        lessonId: 'l',
        lessonVersionId: 'lv',
      }),
    ).toThrow();
  });

  it('persisted status "archived" (Phase 2 internal for needs_changes/rejected) THROWS', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    expect(() =>
      getTeacherAuthoringStatusView({
        teacherFacingStatus: 'archived' as unknown as 'rejected',
        rejectionComment: 'needs changes',
        lessonId: 'l',
        lessonVersionId: 'lv',
      }),
    ).toThrow();
  });

  it('an unknown status string (e.g. "drafty") THROWS — no default cast to success', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    expect(() =>
      getTeacherAuthoringStatusView({
        teacherFacingStatus: 'drafty' as unknown as 'draft',
        lessonId: 'l',
        lessonVersionId: 'lv',
      }),
    ).toThrow();
  });

  it('a non-string teacherFacingStatus (null / undefined / number) THROWS', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const fixtures: unknown[] = [null, undefined, 42, {}, []];
    for (const fixture of fixtures) {
      expect(() =>
        getTeacherAuthoringStatusView({
          teacherFacingStatus: fixture as never,
          lessonId: 'l',
          lessonVersionId: 'lv',
        }),
      ).toThrow();
    }
  });
});

describe('Phase 3 adversarial: action availability matches spec', () => {
  it('submitted/approved/published are read-only and cannot be saved or submitted', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    for (const s of ['submitted', 'approved', 'published'] as const) {
      const view = getTeacherAuthoringStatusView({
        teacherFacingStatus: s,
        lessonId: 'l',
        lessonVersionId: 'lv',
      });
      expect(view.canSave).toBe(false);
      expect(view.canSubmit).toBe(false);
      expect(view.canEdit).toBe(false);
      expect(view.canEditAfterReject).toBe(false);
    }
  });

  it('only approved and published are publish-ready', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const states: Array<{
      s: 'draft' | 'submitted' | 'rejected' | 'approved' | 'published';
      expected: boolean;
    }> = [
      { s: 'draft', expected: false },
      { s: 'submitted', expected: false },
      { s: 'rejected', expected: false },
      { s: 'approved', expected: true },
      { s: 'published', expected: true },
    ];

    for (const { s, expected } of states) {
      const view = getTeacherAuthoringStatusView({
        teacherFacingStatus: s,
        lessonId: 'l',
        lessonVersionId: 'lv',
      });
      expect(view.isPublishReady).toBe(expected);
    }
  });

  it('draft is the only status that allows save+submit together', async () => {
    const { getTeacherAuthoringStatusView } = await import(
      '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view'
    );

    const states = ['draft', 'submitted', 'rejected', 'approved', 'published'] as const;
    let saveAndSubmitCount = 0;
    for (const s of states) {
      const view = getTeacherAuthoringStatusView({
        teacherFacingStatus: s,
        lessonId: 'l',
        lessonVersionId: 'lv',
      });
      if (view.canSave && view.canSubmit) saveAndSubmitCount += 1;
    }
    expect(saveAndSubmitCount).toBe(1);
  });
});