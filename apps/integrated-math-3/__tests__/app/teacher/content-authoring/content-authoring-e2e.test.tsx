import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { Id } from '../../../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../../../convex/_generated/server';
import { computeComponentContentHash } from '../../../../lib/activities/content-hash';
import { resolveComponentKind } from '../../../../lib/activities/review-queue';
import { registerActivity } from '../../../../lib/activities/registry';
import { sanitizeAuthoringText } from '../../../../lib/teacher/content-authoring/sanitize-authored-text';
import { toTeacherFacingStatus } from '../../../../convex/teacher/content-authoring';
import {
  createComposerState,
  composerReducer,
  canSaveComposerState,
} from '../../../../lib/teacher/content-authoring/composer-state';
import { getTeacherAuthoringStatusView } from '../../../../lib/teacher/content-authoring/get-teacher-authoring-status-view';
import { AuthoredLessonPreview } from '../../../../components/teacher/content-authoring/AuthoredLessonPreview';

/**
 * Phase 4 — End-to-end lifecycle verification.
 *
 * This test exercises the full author -> preview -> submit -> approve ->
 * publish -> assignable -> student-visibility lifecycle in ONE ordered flow
 * over a shared mock store. It reuses the shipped Phase 1/2/3 surfaces and
 * binds them through a thin composition adapter that does not yet exist:
 *
 *   toTeacherDraftPayload(state: ComposerState)
 *
 * The expected Red failure is therefore a module-not-found for the missing
 * adapter, not a fake assertion. Jr Green implements the adapter using the
 * existing composer-state and handler surfaces; no parallel logic is added.
 *
 * Labeled counts (parsed by evidence):
 *   e2e_lifecycle_steps:6
 *   e2e_activity_count:4
 *   e2e_phase_count:3
 *   e2e_section_count:3
 *   e2e_approval_row_count:3
 *   e2e_student_null_cases:4
 */
import { toTeacherDraftPayload } from '../../../../lib/teacher/content-authoring/authoring-lifecycle';

type StoreName =
  | 'profiles'
  | 'classes'
  | 'lessons'
  | 'lesson_versions'
  | 'phase_versions'
  | 'phase_sections'
  | 'activities'
  | 'component_reviews'
  | 'component_approvals'
  | 'class_lessons'
  | 'class_enrollments';

interface MockRecord {
  _id: string;
  [key: string]: any;
}

function makeMockStores(
  seed: Partial<Record<StoreName, MockRecord[]>> = {},
): Record<StoreName, MockRecord[]> {
  return {
    profiles: seed.profiles ? [...seed.profiles] : [],
    classes: seed.classes ? [...seed.classes] : [],
    lessons: seed.lessons ? [...seed.lessons] : [],
    lesson_versions: seed.lesson_versions ? [...seed.lesson_versions] : [],
    phase_versions: seed.phase_versions ? [...seed.phase_versions] : [],
    phase_sections: seed.phase_sections ? [...seed.phase_sections] : [],
    activities: seed.activities ? [...seed.activities] : [],
    component_reviews: seed.component_reviews ? [...seed.component_reviews] : [],
    component_approvals: seed.component_approvals ? [...seed.component_approvals] : [],
    class_lessons: seed.class_lessons ? [...seed.class_lessons] : [],
    class_enrollments: seed.class_enrollments ? [...seed.class_enrollments] : [],
  };
}

function makeMockDb(stores: Record<StoreName, MockRecord[]>) {
  const counters: Record<StoreName, number> = {
    profiles: 0,
    classes: 0,
    lessons: 0,
    lesson_versions: 0,
    phase_versions: 0,
    phase_sections: 0,
    activities: 0,
    component_reviews: 0,
    component_approvals: 0,
    class_lessons: 0,
    class_enrollments: 0,
  };
  const idToTable = new Map<string, StoreName>();

  const applyFilters = (rows: MockRecord[], filters: Record<string, unknown>) =>
    rows.filter((row) =>
      Object.entries(filters).every(([field, value]) => row[field] === value),
    );

  const db = {
    get: vi.fn(async (table: StoreName, id: string) => {
      const rows = stores[table] ?? [];
      return rows.find((row) => row._id === id) ?? null;
    }),
    query: vi.fn((table: StoreName) => ({
      withIndex: vi.fn((indexName: string, fn?: (q: unknown) => void) => {
        const filters: Record<string, unknown> = {};
        const q: { eq: (field: string, value: unknown) => typeof q } = {
          eq: vi.fn((field: string, value: unknown) => {
            filters[field] = value;
            return q;
          }),
        };
        if (fn) fn(q);
        const rows = stores[table] ?? [];
        const filtered = applyFilters(rows, filters);
        return {
          collect: vi.fn(async () => filtered),
          first: vi.fn(async () => filtered[0] ?? null),
          unique: vi.fn(async () => filtered[0] ?? null),
          take: vi.fn(async (n: number) => filtered.slice(0, n)),
        };
      }),
      collect: vi.fn(async () => stores[table] ?? []),
      take: vi.fn(async (n: number) => (stores[table] ?? []).slice(0, n)),
    })),
    insert: vi.fn(async (table: StoreName, doc: Record<string, unknown>) => {
      counters[table] += 1;
      const id = `${table}__${counters[table]}`;
      idToTable.set(id, table);
      const row = { ...doc, _id: id };
      stores[table].push(row);
      return id as unknown as Id<typeof table>;
    }),
    patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const table = idToTable.get(id);
      if (!table) throw new Error(`Unknown id ${id}`);
      const row = stores[table].find((r) => r._id === id);
      if (!row) throw new Error(`Row ${id} not found`);
      Object.assign(row, patch);
    }),
    delete: vi.fn(async (id: string) => {
      const table = idToTable.get(id);
      if (!table) return;
      stores[table] = stores[table].filter((r) => r._id !== id);
    }),
  };

  return { db, stores };
}

function makeMutationMockCtx(seed: Partial<Record<StoreName, MockRecord[]>> = {}) {
  const stores = makeMockStores(seed);
  const { db } = makeMockDb(stores);
  const ctx = { db } as unknown as MutationCtx;
  return { ctx, stores, db };
}

function makeQueryMockCtx(stores: Record<StoreName, MockRecord[]>) {
  const { db } = makeMockDb(stores);
  const ctx = { db } as unknown as QueryCtx;
  return { ctx, stores, db };
}

const VALID_ACTIVITY_PROPS: Record<string, Record<string, unknown>> = {
  'graphing-explorer': { equation: 'x^2 + 3x - 4' },
  'step-by-step-solver': {
    problemType: 'factoring',
    equation: 'x^2 + 3x - 4 = 0',
    steps: [
      {
        id: 's1',
        description: 'Factor the quadratic.',
        expression: 'x^2 + 3x - 4 = 0',
      },
    ],
  },
  'comprehension-quiz': {
    questions: [
      {
        id: 'q1',
        prompt: 'What is the vertex form?',
        correctAnswer: 'y = a(x - h)^2 + k',
      },
    ],
  },
  'fill-in-the-blank': {
    template: 'A quadratic has degree {{blank:degree}}.',
    blanks: [{ id: 'degree', correctAnswer: '2' }],
  },
};

function buildAuthoredDraft(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Authored Quadratic Lesson',
    phases: [
      {
        title: 'Explore',
        phaseType: 'explore',
        sections: [
          {
            title: 'Graphing a parabola',
            markdown: 'Use the graphing tool.',
            activities: [
              {
                componentKey: 'graphing-explorer',
                props: VALID_ACTIVITY_PROPS['graphing-explorer'],
              },
            ],
          },
        ],
      },
      {
        title: 'Worked Example',
        phaseType: 'worked_example',
        sections: [
          {
            title: 'Solving by factoring',
            activities: [
              {
                componentKey: 'step-by-step-solver',
                props: VALID_ACTIVITY_PROPS['step-by-step-solver'],
              },
            ],
          },
        ],
      },
      {
        title: 'Guided Practice',
        phaseType: 'guided_practice',
        sections: [
          {
            title: 'Check for understanding',
            activities: [
              {
                componentKey: 'comprehension-quiz',
                props: VALID_ACTIVITY_PROPS['comprehension-quiz'],
              },
              {
                componentKey: 'fill-in-the-blank',
                props: VALID_ACTIVITY_PROPS['fill-in-the-blank'],
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  };
}

function makeTeacher(id: string, organizationId: string, role: 'teacher' | 'admin' = 'teacher') {
  return {
    _id: id,
    username: id,
    role,
    organizationId,
    displayName: id,
    createdAt: 1000,
    updatedAt: 1000,
  };
}

function makeStudent(id: string, organizationId: string) {
  return {
    _id: id,
    username: id,
    role: 'student',
    organizationId,
    displayName: id,
    createdAt: 1000,
    updatedAt: 1000,
  };
}

async function expectedActivityHash(
  phaseType: string,
  componentKey: string,
  props: Record<string, unknown>,
) {
  const sanitized = JSON.parse(JSON.stringify(props));
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeAuthoringText(sanitized[key]);
    }
  }
  return computeComponentContentHash({
    componentKind: resolveComponentKind(phaseType),
    componentKey,
    props: sanitized,
  });
}

const TestActivity = vi.fn(({ activityId, mode, onSubmit, onComplete, equation }) => (
  <div
    data-testid="e2e-test-activity"
    data-activity-id={activityId}
    data-mode={mode}
    data-has-submit={onSubmit ? 'true' : 'false'}
    data-has-complete={onComplete ? 'true' : 'false'}
    data-equation={equation}
  >
    E2E Preview Activity
  </div>
));

describe('Phase 4 — End-to-end lifecycle', () => {
  beforeEach(() => {
    TestActivity.mockClear();
    registerActivity('graphing-explorer', TestActivity);
  });

  it('author -> preview -> submit -> approve -> publish -> assignable -> student visibility', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      editRejectedDraftHandler,
      publishAuthoredLessonHandler,
      assignAuthoredLessonHandler,
      getAuthoredLessonForStudentHandler,
    } = await import('../../../../convex/teacher/content-authoring');

    // --- fixtures ---------------------------------------------------------
    const teacher = makeTeacher('teacher_1', 'org_1');
    const activeStudent = makeStudent('student_active', 'org_1');
    const withdrawnStudent = makeStudent('student_withdrawn', 'org_1');
    const unassignedClassStudent = makeStudent('student_unassigned_class', 'org_1');
    const otherOrgStudent = makeStudent('student_other_org', 'org_2');

    const cls = {
      _id: 'class_1',
      teacherId: teacher._id,
      name: 'Period 1',
      archived: false,
      createdAt: 1000,
      updatedAt: 1000,
    };

    const { ctx: mutCtx, stores } = makeMutationMockCtx({
      profiles: [
        teacher,
        activeStudent,
        withdrawnStudent,
        unassignedClassStudent,
        otherOrgStudent,
      ],
      classes: [cls],
    });

    // --- 1. Author via composer state ------------------------------------
    const state = createComposerState(buildAuthoredDraft());

    // Composer state must carry the full non-empty fixture.
    expect(state.lesson.phases).toHaveLength(3);
    expect(state.lesson.phases.flatMap((p) => p.sections)).toHaveLength(3);
    expect(
      state.lesson.phases.flatMap((p) => p.sections.flatMap((s) => s.activities)),
    ).toHaveLength(4);

    // Validation gate: valid state is saveable.
    expect(canSaveComposerState(state)).toBe(true);

    // Validation gate: injecting an invalid activity flips saveable to false.
    const invalidState = composerReducer(state, {
      type: 'ADD_ACTIVITY',
      payload: {
        phaseId: state.lesson.phases[0].id,
        sectionId: state.lesson.phases[0].sections[0].id,
        componentKey: 'graphing-explorer',
        props: { equation: 123 },
      },
    });
    expect(canSaveComposerState(invalidState)).toBe(false);

    // Bind Phase 3 composer output to Phase 2 handler input via the thin
    // composition adapter (expected Red failure: module not found).
    const draftPayload = toTeacherDraftPayload(state);

    // --- 2. Persist and assert durable row counts -------------------------
    const saved = await saveTeacherDraftHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      draft: draftPayload,
      idempotencyKey: 'e2e-lifecycle-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    expect(stores.lessons).toHaveLength(1);
    expect(stores.lesson_versions).toHaveLength(1);
    expect(stores.lesson_versions[0].status).toBe('draft');
    expect(toTeacherFacingStatus(stores.lesson_versions[0].status)).toBe('draft');
    expect(stores.phase_versions).toHaveLength(3);
    expect(stores.phase_sections).toHaveLength(3);
    expect(stores.activities).toHaveLength(4);

    // --- 3. Preview -------------------------------------------------------
    render(<AuthoredLessonPreview draft={draftPayload} lessonId={saved.lessonId} />);

    await waitFor(() => {
      expect(screen.getByTestId('authored-lesson-preview')).toBeInTheDocument();
    });
    expect(screen.getByText(/teacher preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore/i)).toBeInTheDocument();
    expect(screen.getByText(/Worked Example/i)).toBeInTheDocument();
    expect(screen.getByText(/Guided Practice/i)).toBeInTheDocument();
    expect(screen.getByText(/Use the graphing tool/i)).toBeInTheDocument();

    // Authored props reach the registered activity through ActivityRenderer.
    await waitFor(() => {
      expect(screen.getByTestId('e2e-test-activity')).toBeInTheDocument();
    });
    expect(TestActivity).toHaveBeenCalled();
    const lastCall = TestActivity.mock.calls[TestActivity.mock.calls.length - 1][0];
    expect(lastCall.equation).toBe('x^2 + 3x - 4');

    // Unsafe authored text must be inert in the DOM.
    expect(document.body.innerHTML).not.toContain('<script>');
    expect(document.body.innerHTML).not.toContain('onerror=');
    expect(document.body.innerHTML).not.toContain('javascript:');

    // --- 4. Submit --------------------------------------------------------
    const submitted = await submitDraftForReviewHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(submitted.success).toBe(true);
    expect(submitted.teacherFacingStatus).toBe('submitted');

    // Skip-the-queue defense: publish from submitted throws.
    await expect(
      publishAuthoredLessonHandler(mutCtx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();

    // Not-yet-published student visibility is null.
    const { ctx: qCtxEarly } = makeQueryMockCtx(stores);
    const notPublishedResult = await getAuthoredLessonForStudentHandler(qCtxEarly, {
      userId: activeStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(notPublishedResult).toBeNull();

    // --- 5. Reject path ---------------------------------------------------
    await expect(
      reviewAuthoredLessonHandler(mutCtx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        decision: 'rejected',
      }),
    ).rejects.toThrow();

    const rejected = await reviewAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'rejected',
      comment: 'Fix the equation.',
    });
    expect(rejected.success).toBe(true);
    expect(rejected.teacherFacingStatus).toBe('rejected');
    expect(rejected.rejectionComment).toBe('Fix the equation.');

    const rejectedView = getTeacherAuthoringStatusView({
      teacherFacingStatus: rejected.teacherFacingStatus,
      rejectionComment: rejected.rejectionComment,
      lessonId: saved.lessonId,
      lessonVersionId: rejected.lessonVersionId,
    });
    expect(rejectedView.canEditAfterReject).toBe(true);
    expect(rejectedView.rejectionComment).toBe('Fix the equation.');

    // Edit-after-reject returns to draft.
    const edited = await editRejectedDraftHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      draft: buildAuthoredDraft({ title: 'Edited after reject' }),
      idempotencyKey: 'e2e-lifecycle-key-edited',
    });
    expect(edited.success).toBe(true);
    expect(stores.lesson_versions[stores.lesson_versions.length - 1].status).toBe('draft');

    // --- 6. Approve -------------------------------------------------------
    const resubmitted = await submitDraftForReviewHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(resubmitted.success).toBe(true);
    expect(resubmitted.teacherFacingStatus).toBe('submitted');

    const approved = await reviewAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    expect(approved.success).toBe(true);
    expect(approved.teacherFacingStatus).toBe('approved');

    // Every placed example/practice activity has a component_approvals row
    // with the placement-derived kind and a fresh content hash.
    const placedActivities = stores.activities;
    expect(placedActivities).toHaveLength(4);

    const approvalRows = stores.component_approvals;
    expect(approvalRows.length).toBeGreaterThanOrEqual(3);

    for (const approval of approvalRows) {
      const activity = stores.activities.find((a) => a._id === approval.componentId);
      expect(activity).toBeDefined();
      const phaseSection = stores.phase_sections.find(
        (s) => s.content && (s.content as { activityId?: string }).activityId === activity!._id,
      );
      const phaseVersion = stores.phase_versions.find(
        (p) => p._id === phaseSection?.phaseVersionId,
      );
      const expectedKind = resolveComponentKind(phaseVersion?.phaseType ?? 'explore');
      expect(approval.componentKind).toBe(expectedKind);

      const expectedHash = await expectedActivityHash(
        phaseVersion?.phaseType ?? 'explore',
        activity!.componentKey,
        activity!.props as Record<string, unknown>,
      );
      expect(approval.contentHash).toBe(expectedHash);
    }

    // --- 7. Publish -------------------------------------------------------
    const published = await publishAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(published.success).toBe(true);
    expect(published.teacherFacingStatus).toBe('published');

    // Stale-hash defense: edit an approved activity then publish throws.
    await editRejectedDraftHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      draft: buildAuthoredDraft({
        title: 'Changed after approval',
        phases: [
          {
            title: 'Explore',
            phaseType: 'explore',
            sections: [
              {
                title: 'Graphing a parabola',
                activities: [
                  {
                    componentKey: 'graphing-explorer',
                    props: {
                      ...VALID_ACTIVITY_PROPS['graphing-explorer'],
                      comparisonQuestion: 'New comparison prompt (different from before)',
                    },
                  },
                ],
              },
            ],
          },
          {
            title: 'Worked Example',
            phaseType: 'worked_example',
            sections: [
              {
                title: 'Solving by factoring',
                activities: [
                  {
                    componentKey: 'step-by-step-solver',
                    props: VALID_ACTIVITY_PROPS['step-by-step-solver'],
                  },
                ],
              },
            ],
          },
          {
            title: 'Guided Practice',
            phaseType: 'guided_practice',
            sections: [
              {
                title: 'Check for understanding',
                activities: [
                  {
                    componentKey: 'comprehension-quiz',
                    props: VALID_ACTIVITY_PROPS['comprehension-quiz'],
                  },
                  {
                    componentKey: 'fill-in-the-blank',
                    props: VALID_ACTIVITY_PROPS['fill-in-the-blank'],
                  },
                ],
              },
            ],
          },
        ],
      }),
      idempotencyKey: 'e2e-lifecycle-key-stale',
    });

    await expect(
      publishAuthoredLessonHandler(mutCtx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();

    // Restore the published version for assignment by re-approving the edited content.
    await submitDraftForReviewHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    const republished = await publishAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(republished.teacherFacingStatus).toBe('published');

    // --- 8. Assign --------------------------------------------------------
    const assigned = await assignAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      classId: cls._id as Id<'classes'>,
    });
    expect(assigned.success).toBe(true);
    expect(stores.class_lessons).toHaveLength(1);

    // Assignment guards.
    await expect(
      assignAuthoredLessonHandler(mutCtx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        classId: 'class_nonexistent' as Id<'classes'>,
      }),
    ).rejects.toThrow();

    // --- 9. Student visibility --------------------------------------------
    stores.class_enrollments.push(
      {
        _id: 'enrollment_active',
        classId: cls._id,
        studentId: activeStudent._id,
        status: 'active',
        enrolledAt: 1000,
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        _id: 'enrollment_withdrawn',
        classId: cls._id,
        studentId: withdrawnStudent._id,
        status: 'withdrawn',
        enrolledAt: 1000,
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        _id: 'enrollment_unassigned_class',
        classId: 'class_other',
        studentId: unassignedClassStudent._id,
        status: 'active',
        enrolledAt: 1000,
        createdAt: 1000,
        updatedAt: 1000,
      },
    );

    const { ctx: qCtx } = makeQueryMockCtx(stores);

    const activeResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: activeStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(activeResult).not.toBeNull();
    expect(activeResult?.lessonId).toBe(saved.lessonId);

    const withdrawnResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: withdrawnStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(withdrawnResult).toBeNull();

    const unassignedClassResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: unassignedClassStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(unassignedClassResult).toBeNull();

    const otherOrgResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: otherOrgStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(otherOrgResult).toBeNull();

    // --- labeled counts ---------------------------------------------------
    console.info('e2e_lifecycle_steps:6');
    console.info(`e2e_phase_count:${stores.phase_versions.length}`);
    console.info(`e2e_section_count:${stores.phase_sections.length}`);
    console.info(`e2e_activity_count:${stores.activities.length}`);
    console.info(`e2e_approval_row_count:${stores.component_approvals.length}`);
    console.info('e2e_student_null_cases:4');
  });
});
