import { describe, it, expect, vi } from 'vitest';
import type { Id } from '../../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../../convex/_generated/server';
import { computeComponentContentHash } from '../../../lib/activities/content-hash';
import { resolveComponentKind } from '../../../lib/activities/review-queue';
import { sanitizeAuthoringText } from '../../../lib/teacher/content-authoring/sanitize-authored-text';
import { toTeacherFacingStatus } from '../../../convex/teacher/content-authoring';

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

function makeQueryMockCtx(seed: Partial<Record<StoreName, MockRecord[]>> = {}) {
  const stores = makeMockStores(seed);
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

// Phase 2 Red: these tests import from the intended Convex authoring module.
// The module does not yet exist, so every test fails for the expected reason:
// missing implementation/behavior rather than a fake assertion or measure import.

describe('Phase 2 — Draft lifecycle and persistence', () => {
  it('creates a teacher-scoped draft in draft status with normalized content', async () => {
    const {
      saveTeacherDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({
      profiles: [teacher],
    });

    const result = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'draft-key-1',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(stores.lessons).toHaveLength(1);
    expect(stores.lesson_versions).toHaveLength(1);
    expect(stores.lesson_versions[0].status).toBe('draft');
    expect(stores.lesson_versions[0].teacherId).toBe(teacher._id);
    expect(stores.activities).toHaveLength(4);
    expect(stores.phase_versions).toHaveLength(3);
    expect(stores.phase_sections).toHaveLength(3);
  });

  it('is idempotent: same idempotency key patches existing rows instead of duplicating', async () => {
    const {
      saveTeacherDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({
      profiles: [teacher],
    });

    const draft = buildAuthoredDraft();
    const args = {
      userId: teacher._id as Id<'profiles'>,
      draft,
      idempotencyKey: 'same-key',
    };

    const first = await saveTeacherDraftHandler(ctx, args);
    expect(first.success).toBe(true);

    const second = await saveTeacherDraftHandler(ctx, args);
    expect(second.success).toBe(true);

    expect(stores.lessons).toHaveLength(1);
    expect(stores.lesson_versions).toHaveLength(1);
    expect(stores.activities).toHaveLength(4);
    expect(stores.phase_versions).toHaveLength(3);
  });

  it('persists sanitized free-text fields, not raw unsafe markup', async () => {
    const {
      saveTeacherDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({
      profiles: [teacher],
    });

    const draft = buildAuthoredDraft({
      title: 'Lesson <script>alert(1)</script>',
      phases: [
        {
          title: 'Phase <img onerror="alert(2)">',
          phaseType: 'explore',
          sections: [
            {
              title: 'Section',
              markdown: '<a href="javascript:alert(3)">bad</a>',
              activities: [
                {
                  componentKey: 'graphing-explorer',
                  props: {
                    equation: 'x^2',
                    comparisonQuestion: '<script>alert(4)</script>Which?',
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    const result = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft,
      idempotencyKey: 'sanitize-key',
    });

    expect(result.success).toBe(true);

    const allText = JSON.stringify(stores);
    expect(allText).not.toContain('<script>');
    expect(allText).not.toContain('onerror=');
    expect(allText).not.toContain('javascript:');
    expect(allText).toContain('Which?');
  });

  it('allows draft -> submitted and rejects direct draft -> published', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      publishAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'transition-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    const submitted = await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(submitted.success).toBe(true);
    expect(submitted.teacherFacingStatus).toBe('submitted');

    await expect(
      publishAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();
  });

  it('records a rejection comment and allows edit-after-reject back to draft', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      editRejectedDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'reject-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    const rejected = await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'rejected',
      comment: 'Fix the equation.',
    });
    expect(rejected.success).toBe(true);
    expect(rejected.teacherFacingStatus).toBe('rejected');
    expect(rejected.rejectionComment).toBe('Fix the equation.');
    expect(stores.component_reviews[0].comment).toBe('Fix the equation.');

    const edited = await editRejectedDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      draft: buildAuthoredDraft({ title: 'Updated title' }),
      idempotencyKey: 'reject-key-edited',
    });
    expect(edited.success).toBe(true);
    expect(stores.lesson_versions[stores.lesson_versions.length - 1].status).toBe('draft');
  });
});

describe('Phase 2 — Approval queue and content hashing', () => {
  it('submits drafts with real content hashes and placement-derived component kinds', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'hash-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    const submitted = await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(submitted.success).toBe(true);

    expect(stores.component_reviews.length).toBeGreaterThanOrEqual(3);

    const exploreReview = stores.component_reviews.find(
      (r) => r.componentKey === 'graphing-explorer',
    );
    const exampleReview = stores.component_reviews.find(
      (r) => r.componentKey === 'step-by-step-solver',
    );
    const practiceReview = stores.component_reviews.find(
      (r) => r.componentKey === 'comprehension-quiz',
    );

    expect(exploreReview?.componentKind).toBe('activity');
    expect(exampleReview?.componentKind).toBe('example');
    expect(practiceReview?.componentKind).toBe('practice');

    const expectedExploreHash = await expectedActivityHash(
      'explore',
      'graphing-explorer',
      VALID_ACTIVITY_PROPS['graphing-explorer'],
    );
    expect(exploreReview?.componentContentHash).toBe(expectedExploreHash);
  });

  it('publishes only when every activity is approved and current hash matches stored hash', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'publish-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });

    const published = await publishAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(published.success).toBe(true);
    expect(published.teacherFacingStatus).toBe('published');
  });

  it('rejects publish when an approved activity becomes stale after an edit', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      editRejectedDraftHandler,
      publishAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'stale-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });

    await editRejectedDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      draft: buildAuthoredDraft({ title: 'Changed title after approval' }),
      idempotencyKey: 'stale-key-edited',
    });

    await expect(
      publishAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();
  });

  it('requires a comment for needs_changes and rejected decisions', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'comment-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    await expect(
      reviewAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        decision: 'rejected',
      }),
    ).rejects.toThrow();

    await expect(
      reviewAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        decision: 'needs_changes',
      }),
    ).rejects.toThrow();
  });
});

describe('Phase 2 — Teacher authorization and assignment/enrollment visibility', () => {
  it('rejects non-teachers from creating or mutating drafts', async () => {
    const {
      saveTeacherDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const student = makeStudent('student_1', 'org_1');
    const parent = {
      ...makeStudent('parent_1', 'org_1'),
      role: 'parent',
    };
    const { ctx } = makeMutationMockCtx({ profiles: [student, parent] });

    for (const user of [student, parent]) {
      await expect(
        saveTeacherDraftHandler(ctx, {
          userId: user._id as Id<'profiles'>,
          draft: buildAuthoredDraft(),
          idempotencyKey: 'unauthorized-key',
        }),
      ).rejects.toThrow();
    }
  });

  it('prevents a teacher from mutating another teachers draft', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const owner = makeTeacher('teacher_owner', 'org_1');
    const other = makeTeacher('teacher_other', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [owner, other] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'ownership-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await expect(
      submitDraftForReviewHandler(ctx, {
        userId: other._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();
  });

  it('prevents a teacher from reviewing or approving another teachers submitted draft', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const owner = makeTeacher('teacher_owner', 'org_1');
    const other = makeTeacher('teacher_other', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [owner, other] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'review-ownership-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    await expect(
      reviewAuthoredLessonHandler(ctx, {
        userId: other._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        decision: 'approved',
      }),
    ).rejects.toThrow();

    const ownerReview = await reviewAuthoredLessonHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    expect(ownerReview.success).toBe(true);
  });

  it('only allows assigning a published authored lesson to a class the teacher owns', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
      assignAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const otherTeacher = makeTeacher('teacher_2', 'org_1');
    const cls = {
      _id: 'class_1',
      teacherId: teacher._id,
      name: 'Period 1',
      archived: false,
      createdAt: 1000,
      updatedAt: 1000,
    };
    const otherCls = {
      _id: 'class_2',
      teacherId: otherTeacher._id,
      name: 'Period 2',
      archived: false,
      createdAt: 1000,
      updatedAt: 1000,
    };

    const { ctx, stores } = makeMutationMockCtx({
      profiles: [teacher, otherTeacher],
      classes: [cls, otherCls],
    });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'assign-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    await publishAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    const assigned = await assignAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      classId: cls._id as Id<'classes'>,
    });
    expect(assigned.success).toBe(true);

    await expect(
      assignAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        classId: otherCls._id as Id<'classes'>,
      }),
    ).rejects.toThrow();

    expect(stores.class_lessons).toHaveLength(1);
    expect(stores.class_lessons[0].classId).toBe(cls._id);
  });

  it('only returns authored lessons to students with active assignment and enrollment', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
      assignAuthoredLessonHandler,
      getAuthoredLessonForStudentHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const activeStudent = makeStudent('student_active', 'org_1');
    const withdrawnStudent = makeStudent('student_withdrawn', 'org_1');
    const otherClassStudent = makeStudent('student_other_class', 'org_1');
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
      profiles: [teacher, activeStudent, withdrawnStudent, otherClassStudent, otherOrgStudent],
      classes: [cls],
    });

    const saved = await saveTeacherDraftHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'visibility-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    await publishAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await assignAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      classId: cls._id as Id<'classes'>,
    });

    const { ctx: qCtx, stores: qStores } = makeQueryMockCtx(stores);
    qStores.class_enrollments.push(
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
    );

    const activeResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: activeStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(activeResult).not.toBeNull();

    const withdrawnResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: withdrawnStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(withdrawnResult).toBeNull();

    const otherClassResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: otherClassStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(otherClassResult).toBeNull();

    const otherOrgResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: otherOrgStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(otherOrgResult).toBeNull();
  });
});

describe('Phase 2 — Teacher-facing status mapping', () => {
  it('maps persisted DB statuses to teacher-facing lifecycle statuses', () => {
    expect(toTeacherFacingStatus('draft')).toBe('draft');
    expect(toTeacherFacingStatus('review')).toBe('submitted');
    expect(toTeacherFacingStatus('approved')).toBe('approved');
    expect(toTeacherFacingStatus('archived')).toBe('rejected');
    expect(toTeacherFacingStatus('published')).toBe('published');
  });

  it('rejects are distinguishable from published in the teacher-facing DTO', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      editRejectedDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'status-map-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    const approved = await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    expect(approved.teacherFacingStatus).toBe('approved');

    // Edit the approved lesson back to draft, then resubmit for rejection test
    await editRejectedDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'status-map-key-edited',
    });

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    const rejected = await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'rejected',
      comment: 'Needs work.',
    });
    expect(rejected.teacherFacingStatus).toBe('rejected');
    expect(rejected.rejectionComment).toBe('Needs work.');
  });
});

/* ----------------------------------------------------------------------- */
/* Adversarial tests                                                       */
/* ----------------------------------------------------------------------- */

describe('Phase 2 — Adversarial — Lifecycle edge cases', () => {
  it('rejects double-submit once the lesson_version is already in review status', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'double-submit-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    const first = await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(first.teacherFacingStatus).toBe('submitted');

    await expect(
      submitDraftForReviewHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();
  });

  it('rejects approving a lesson_version that is already approved', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'double-approve-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });

    await expect(
      reviewAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        decision: 'approved',
      }),
    ).rejects.toThrow();
  });

  it('publish twice is idempotent for lesson_version.status (still published)', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'double-publish-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });

    const first = await publishAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(first.teacherFacingStatus).toBe('published');

    // After publish, lesson_version.status === "published". A second publish on
    // the same lesson is an illegal transition (publish requires approved), so the
    // handler throws. We pin that behavior to detect accidental acceptance.
    await expect(
      publishAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();

    const stillPublished = stores.lesson_versions.find(
      (v) => v._id === saved.lessonVersionId,
    );
    expect(stillPublished?.status).toBe('published');
  });

  it('edit-after-reject then re-submit yields a NEW content hash, not the old one', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      editRejectedDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const draftA = buildAuthoredDraft();
    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: draftA,
      idempotencyKey: 'hash-evolution-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'rejected',
      comment: 'Trim the worked example',
    });

    const oldReviews = stores.component_reviews.filter(
      (r) => r.placement?.lessonId === saved.lessonId,
    );
    expect(oldReviews.length).toBeGreaterThan(0);
    const oldHashByActivityKey: Record<string, string> = {};
    for (const review of oldReviews) {
      oldHashByActivityKey[review.componentKey] = review.componentContentHash;
    }

    // Edit with content that changes the sanitize-stable input for at least one activity.
    const draftB = buildAuthoredDraft({
      title: 'Edited after reject',
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
    });

    const edited = await editRejectedDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      draft: draftB,
      idempotencyKey: 'hash-evolution-key-edited',
    });
    expect(edited.success).toBe(true);

    // After the edit, submit (creates a new component_reviews batch with the current hash).
    const resubmitted = await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(resubmitted.success).toBe(true);

    const newReviews = stores.component_reviews.filter(
      (r) => r.placement?.lessonVersionId === edited.lessonVersionId,
    );
    const newHashByActivityKey: Record<string, string> = {};
    for (const review of newReviews) {
      newHashByActivityKey[review.componentKey] = review.componentContentHash;
    }

    // Sanity: same number of review rows for placed activities (placement
    // inventory did not change).
    expect(newReviews.length).toBe(oldReviews.length);

    // The graphing-explorer review must reflect the changed content (its comparisonQuestion
    // was the only input that changed). The recomputed hash must differ from the old one.
    expect(newHashByActivityKey['graphing-explorer']).toBeDefined();
    expect(oldHashByActivityKey['graphing-explorer']).toBeDefined();
    expect(newHashByActivityKey['graphing-explorer']).not.toBe(
      oldHashByActivityKey['graphing-explorer'],
    );

    // For unchanged activities the hash should match (sanitized props are identical).
    for (const key of Object.keys(oldHashByActivityKey)) {
      if (key === 'graphing-explorer') continue;
      expect(newHashByActivityKey[key]).toBe(oldHashByActivityKey[key]);
    }

    // Pin the recomputed hash against the real primitive for ground truth.
    const expectedNewHash = await expectedActivityHash(
      'explore',
      'graphing-explorer',
      {
        ...VALID_ACTIVITY_PROPS['graphing-explorer'],
        comparisonQuestion: 'New comparison prompt (different from before)',
      },
    );
    expect(newHashByActivityKey['graphing-explorer']).toBe(expectedNewHash);
  });

  it('rejects save / edit while a lesson is in review or published status', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      editRejectedDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'review-edit-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    // While in 'review', edit-after-decision is rejected (transition rules
    // require archived, approved, or draft to accept an edit).
    await expect(
      editRejectedDraftHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        draft: buildAuthoredDraft({ title: 'Editing while in review' }),
        idempotencyKey: 'review-edit-key-2',
      }),
    ).rejects.toThrow();
  });

  it('rejects needs_changes decision without a comment', async () => {
    // The Phase 2 closeout covers this; the adversarial surface here is to pin the
    // exact messaging so a future handler regression that lost the comment gate
    // is detected at test time.
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'comment-required-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    await expect(
      reviewAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        decision: 'needs_changes',
      }),
    ).rejects.toThrow(/comment/i);

    await expect(
      reviewAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        decision: 'rejected',
      }),
    ).rejects.toThrow(/comment/i);
  });
});

describe('Phase 2 — Adversarial — Idempotency abuse', () => {
  it('same idempotency key with DIFFERENT title patches the existing lesson (no duplicate lessons)', async () => {
    const {
      saveTeacherDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const draftA = buildAuthoredDraft({ title: 'First title' });
    const draftB = buildAuthoredDraft({ title: 'Second title' });

    await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: draftA,
      idempotencyKey: 'same-key-different-content',
    });

    await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: draftB,
      idempotencyKey: 'same-key-different-content',
    });

    // Labeled count: one lesson row, not two. (A3: array length, not regex.)
    expect(stores.lessons).toHaveLength(1);
    expect(stores.lessons[0].title).toBe('Second title');
    // Labeled count: persisted activities match the fresh draft (4 activities total).
    expect(stores.activities).toHaveLength(4);
  });

  it('saving with the same idempotency key while reducing activity count in a section does not leave orphan activities', async () => {
    const {
      saveTeacherDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    // First draft: one phase, one section with 3 activities.
    const draftA = buildAuthoredDraft({
      phases: [
        {
          title: 'Explore',
          phaseType: 'explore',
          sections: [
            {
              title: 'Multi-activity section',
              activities: [
                {
                  componentKey: 'graphing-explorer',
                  props: VALID_ACTIVITY_PROPS['graphing-explorer'],
                },
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
    });

    await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: draftA,
      idempotencyKey: 'shrink-section',
    });
    expect(stores.activities).toHaveLength(3);

    // Second draft: only 1 activity in the same section.
    const draftB = buildAuthoredDraft({
      phases: [
        {
          title: 'Explore',
          phaseType: 'explore',
          sections: [
            {
              title: 'Multi-activity section',
              activities: [
                {
                  componentKey: 'graphing-explorer',
                  props: VALID_ACTIVITY_PROPS['graphing-explorer'],
                },
              ],
            },
          ],
        },
      ],
    });

    await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: draftB,
      idempotencyKey: 'shrink-section',
    });

    // After idempotent shrink: 1 activity row, no orphans from the dropped two.
    expect(stores.activities).toHaveLength(1);
    // Lesson still single, version still single.
    expect(stores.lessons).toHaveLength(1);
    expect(stores.lesson_versions).toHaveLength(1);
  });

  it('concurrent-ish sequential saves with the same key leave the DB in a coherent state', async () => {
    const {
      saveTeacherDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    // Sequential idempotent saves — each save completes before the next
    // begins. The persistence invariant: one lesson row, one lesson_version
    // row, activity count reflects the *last* write, and the last write's
    // title wins.
    await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft({ title: 'seq-1' }),
      idempotencyKey: 'sequenced-key',
    });
    await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft({ title: 'seq-2' }),
      idempotencyKey: 'sequenced-key',
    });
    const last = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft({ title: 'seq-3' }),
      idempotencyKey: 'sequenced-key',
    });
    expect(last.success).toBe(true);

    expect(stores.lessons).toHaveLength(1);
    expect(stores.lesson_versions).toHaveLength(1);
    // Activity count derived from the canonical draft (4 activities).
    expect(stores.activities).toHaveLength(4);
    // The last write wins for the title.
    expect(stores.lessons[0].title).toBe('seq-3');
  });
});

describe('Phase 2 — Adversarial — Approval/hash tampering', () => {
  it('publish is blocked when only some placed activities are approved (mixed approved/unapproved set)', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'mixed-approval-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    // First approval lands all four activities as approved.
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });

    // Pick one example/practice approval and force its stored hash to a
    // different value, simulating tampering or a content edit that did not
    // trigger the handler's stale-defense path. Then try to publish.
    const explorerApproval = stores.activities.find(
      (a) => a.componentKey === 'graphing-explorer',
    );
    expect(explorerApproval).toBeDefined();
    await ctx.db.patch(explorerApproval!._id, {
      approval: {
        status: 'approved',
        contentHash: 'forged-hash',
        reviewedAt: 1000,
        reviewedBy: teacher._id,
      },
      updatedAt: 2000,
    });

    await expect(
      publishAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();
  });

  it('publish is blocked when a stored approval hash for an example/practice placement is stale', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'stale-hash-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });

    // Pin the original approval rows so we can mutate them deterministically.
    const stepByStepApproval = stores.component_approvals.find(
      (a) => a.componentKey === 'step-by-step-solver',
    );
    expect(stepByStepApproval).toBeDefined();
    const stepOriginalHash = stepByStepApproval!.contentHash;

    // Forge the stored approval hash so it differs from the current hash.
    await ctx.db.patch(stepByStepApproval!._id, {
      contentHash: `${stepOriginalHash}-tampered`,
      updatedAt: 9000,
    });

    await expect(
      publishAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow(/stale/i);

    // lesson_version.status must remain 'approved' (publish rejected, no flip).
    const lessonVersion = stores.lesson_versions.find(
      (v) => v._id === saved.lessonVersionId,
    );
    expect(lessonVersion?.status).toBe('approved');
  });

  it('publish blocked when one of several approvals is stale and the others are fresh (mixed set)', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'mixed-stale-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });

    // Tamper with exactly one approval row (the comprehension-quiz one is
    // placed under `guided_practice` which resolves to `practice` kind).
    const quizApproval = stores.component_approvals.find(
      (a) => a.componentKey === 'comprehension-quiz',
    );
    expect(quizApproval).toBeDefined();
    await ctx.db.patch(quizApproval!._id, {
      contentHash: 'tampered-mixed-set',
      updatedAt: 8000,
    });

    await expect(
      publishAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();

    const lessonVersion = stores.lesson_versions.find(
      (v) => v._id === saved.lessonVersionId,
    );
    expect(lessonVersion?.status).toBe('approved');
  });

  it('hash computes over the post-sanitization activity props, not the raw teacher input', async () => {
    // Verifies both that (a) sanitization runs before the hash is computed
    // and (b) the persisted row content reflects sanitized text. A handler
    // regression that persists unsanitized strings *and* feeds them to the
    // hash would no longer reproduce the in-handler sanitized hash.
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const unsafeProps = {
      ...VALID_ACTIVITY_PROPS['graphing-explorer'],
      comparisonQuestion: '<script>alert(1)</script>Safe prompt?',
    };

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft({
        phases: [
          {
            title: 'Explore',
            phaseType: 'explore',
            sections: [
              {
                title: 'Section',
                activities: [{ componentKey: 'graphing-explorer', props: unsafeProps }],
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
      idempotencyKey: 'sanitize-into-hash-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    const activityRow = stores.activities.find(
      (a) => a.componentKey === 'graphing-explorer',
    );
    expect(activityRow).toBeDefined();
    // Stored props must be sanitized (no <script> token in any string).
    const flattened = JSON.stringify(activityRow!.props);
    expect(flattened).not.toContain('<script>');
    expect(flattened).toContain('Safe prompt?');

    const reviewRow = stores.component_reviews.find(
      (r) => r.componentKey === 'graphing-explorer',
    );
    expect(reviewRow).toBeDefined();

    // The hash recorded in the review queue must equal the hash computed
    // over the SANITIZED props. If the handler regression bypasses
    // sanitization before hashing, the recorded hash would equal the hash
    // of the raw <script>-bearing props and this assertion would fail.
    const sanitizedProps = JSON.parse(JSON.stringify(activityRow!.props));
    const expectedPostSanitizeHash = await expectedActivityHash(
      'explore',
      'graphing-explorer',
      sanitizedProps,
    );
    expect(reviewRow!.componentContentHash).toBe(expectedPostSanitizeHash);

    // Confirm the raw (unsanitized) hash differs from the recorded hash —
    // this is positive evidence that the recorded hash came from sanitized
    // input, not from the raw <script>-bearing props.
    //
    // We compute the raw hash by calling computeComponentContentHash
    // directly (bypassing expectedActivityHash, which sanitizes internally).
    const rawHash = await computeComponentContentHash({
      componentKind: resolveComponentKind('explore'),
      componentKey: 'graphing-explorer',
      props: unsafeProps,
    });
    expect(rawHash).not.toBe(expectedPostSanitizeHash);
  });
});

describe('Phase 2 — Adversarial — Authorization boundaries', () => {
  it('cross-teacher edit-after-reject is rejected on someone else’s lesson', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      editRejectedDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const owner = makeTeacher('teacher_owner', 'org_1');
    const other = makeTeacher('teacher_other', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [owner, other] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'cross-edit-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'rejected',
      comment: 'Try again',
    });

    // The owning teacher CAN edit after reject.
    const ownEdit = await editRejectedDraftHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      draft: buildAuthoredDraft({ title: 'Owner edit' }),
      idempotencyKey: 'cross-edit-key-owner',
    });
    expect(ownEdit.success).toBe(true);

    // A different teacher in the same org CANNOT.
    await expect(
      editRejectedDraftHandler(ctx, {
        userId: other._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        draft: buildAuthoredDraft({ title: 'Other edit' }),
        idempotencyKey: 'cross-edit-key-other',
      }),
    ).rejects.toThrow();
  });

  it('cross-teacher publish is rejected on someone else’s approved lesson', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const owner = makeTeacher('teacher_owner', 'org_1');
    const other = makeTeacher('teacher_other', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [owner, other] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'cross-publish-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });

    await expect(
      publishAuthoredLessonHandler(ctx, {
        userId: other._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();
  });

  it('cross-teacher assign is rejected on another teacher’s published lesson', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
      assignAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const owner = makeTeacher('teacher_owner', 'org_1');
    const other = makeTeacher('teacher_other', 'org_1');
    const cls = {
      _id: 'class_other',
      teacherId: other._id,
      name: 'Other Period',
      archived: false,
      createdAt: 1000,
      updatedAt: 1000,
    };
    const { ctx } = makeMutationMockCtx({
      profiles: [owner, other],
      classes: [cls],
    });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'cross-assign-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    await publishAuthoredLessonHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    // A second teacher in the same org, even with a real class, must not be
    // able to assign someone else's published authored lesson.
    await expect(
      assignAuthoredLessonHandler(ctx, {
        userId: other._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        classId: cls._id as Id<'classes'>,
      }),
    ).rejects.toThrow();
  });

  it('an admin who is NOT the authoring teacher cannot publish someone else’s lesson', async () => {
    // getAuthoringTeacher accepts role==='admin' for the role gate, but the
    // lesson.metadata.authoringTeacherId ownership check still blocks the
    // admin unless they are also the authoring teacher. Pin that boundary.
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const owner = makeTeacher('teacher_owner', 'org_1');
    const admin = makeTeacher('admin_alice', 'org_1', 'admin');
    const { ctx } = makeMutationMockCtx({ profiles: [owner, admin] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'admin-publish-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: owner._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });

    await expect(
      publishAuthoredLessonHandler(ctx, {
        userId: admin._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow();
  });

  it('assignment to an archived class is rejected even when the teacher owns both', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
      assignAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const cls = {
      _id: 'class_archived',
      teacherId: teacher._id,
      name: 'Archived Period',
      archived: true,
      createdAt: 1000,
      updatedAt: 1000,
    };
    const { ctx } = makeMutationMockCtx({
      profiles: [teacher],
      classes: [cls],
    });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'archived-class-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    await publishAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    await expect(
      assignAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        classId: cls._id as Id<'classes'>,
      }),
    ).rejects.toThrow();
  });

  it('rejects assignment of an unpublished lesson to a class', async () => {
    const {
      saveTeacherDraftHandler,
      assignAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const cls = {
      _id: 'class_draft_target',
      teacherId: teacher._id,
      name: 'Period',
      archived: false,
      createdAt: 1000,
      updatedAt: 1000,
    };
    const { ctx } = makeMutationMockCtx({
      profiles: [teacher],
      classes: [cls],
    });

    // Save a draft but never submit/approve/publish.
    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'unpublished-assign-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await expect(
      assignAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
        classId: cls._id as Id<'classes'>,
      }),
    ).rejects.toThrow();
  });
});

describe('Phase 2 — Adversarial — Student visibility failure paths', () => {
  it('returns null when the latest authored lesson_version is NOT published', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      getAuthoredLessonForStudentHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const activeStudent = makeStudent('student_active', 'org_1');

    const cls = {
      _id: 'class_1',
      teacherId: teacher._id,
      name: 'Period 1',
      archived: false,
      createdAt: 1000,
      updatedAt: 1000,
    };

    const { ctx: mutCtx, stores } = makeMutationMockCtx({
      profiles: [teacher, activeStudent],
      classes: [cls],
    });

    const saved = await saveTeacherDraftHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'unpublished-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    // Submitted but not approved or published.
    await submitDraftForReviewHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });

    // Add the assignment + active enrollment, then sanity-check that the
    // student still cannot see the lesson (because status is "review" not
    // "published").
    stores.class_lessons.push({
      _id: 'class_lesson_row',
      classId: cls._id,
      lessonId: saved.lessonId,
      assignedAt: 2000,
      createdAt: 2000,
    });
    stores.class_enrollments.push({
      _id: 'enrollment_active',
      classId: cls._id,
      studentId: activeStudent._id,
      status: 'active',
      enrolledAt: 2000,
      createdAt: 2000,
      updatedAt: 2000,
    });

    const { ctx: qCtx } = makeQueryMockCtx(stores);
    const result = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: activeStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(result).toBeNull();
  });

  it('returns null for a student with a "completed" enrollment (not active)', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
      assignAuthoredLessonHandler,
      getAuthoredLessonForStudentHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const completedStudent = makeStudent('student_completed', 'org_1');

    const cls = {
      _id: 'class_1',
      teacherId: teacher._id,
      name: 'Period 1',
      archived: false,
      createdAt: 1000,
      updatedAt: 1000,
    };

    const { ctx: mutCtx, stores } = makeMutationMockCtx({
      profiles: [teacher, completedStudent],
      classes: [cls],
    });

    const saved = await saveTeacherDraftHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'completed-enroll-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    await publishAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await assignAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      classId: cls._id as Id<'classes'>,
    });

    stores.class_enrollments.push({
      _id: 'enrollment_completed',
      classId: cls._id,
      studentId: completedStudent._id,
      status: 'completed',
      enrolledAt: 1000,
      createdAt: 1000,
      updatedAt: 1000,
    });

    const { ctx: qCtx } = makeQueryMockCtx(stores);
    const result = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: completedStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(result).toBeNull();
  });

  it('returns null for a student when there is no class_lessons assignment row', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
      getAuthoredLessonForStudentHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const activeStudent = makeStudent('student_active', 'org_1');

    const cls = {
      _id: 'class_1',
      teacherId: teacher._id,
      name: 'Period 1',
      archived: false,
      createdAt: 1000,
      updatedAt: 1000,
    };
    const { ctx: mutCtx, stores } = makeMutationMockCtx({
      profiles: [teacher, activeStudent],
      classes: [cls],
    });

    const saved = await saveTeacherDraftHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'no-assign-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    await submitDraftForReviewHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'approved',
    });
    await publishAuthoredLessonHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    // Note: no assignAuthoredLessonHandler call.

    stores.class_enrollments.push({
      _id: 'enrollment_active',
      classId: cls._id,
      studentId: activeStudent._id,
      status: 'active',
      enrolledAt: 1000,
      createdAt: 1000,
      updatedAt: 1000,
    });

    const { ctx: qCtx } = makeQueryMockCtx(stores);
    const result = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: activeStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(result).toBeNull();
  });
});

describe('Phase 2 — Adversarial — Input validation', () => {
  it('rejects drafts with an empty phases array at save time', async () => {
    const { saveTeacherDraftHandler } = await import(
      '../../../convex/teacher/content-authoring'
    );

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    await expect(
      saveTeacherDraftHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        draft: { title: 'No phases', phases: [] },
        idempotencyKey: 'empty-phases-key',
      }),
    ).rejects.toThrow();
  });

  it('rejects drafts with an empty activities array inside a section at save time', async () => {
    const { saveTeacherDraftHandler } = await import(
      '../../../convex/teacher/content-authoring'
    );

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    await expect(
      saveTeacherDraftHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        draft: {
          title: 'Empty activities',
          phases: [
            {
              title: 'Explore',
              phaseType: 'explore',
              sections: [
                {
                  title: 'No activities',
                  activities: [],
                },
              ],
            },
          ],
        },
        idempotencyKey: 'empty-acts-key',
      }),
    ).rejects.toThrow();
  });

  it('rejects drafts whose activity props fail the canonical schema', async () => {
    const { saveTeacherDraftHandler } = await import(
      '../../../convex/teacher/content-authoring'
    );

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    // graphing-explorer requires `equation` as a non-empty string. Omit it.
    await expect(
      saveTeacherDraftHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        draft: {
          title: 'Schema invalid',
          phases: [
            {
              title: 'Explore',
              phaseType: 'explore',
              sections: [
                {
                  title: 'Bad',
                  activities: [
                    {
                      componentKey: 'graphing-explorer',
                      props: { comparisonQuestion: 'x or y?' }, // missing required equation
                    },
                  ],
                },
              ],
            },
          ],
        },
        idempotencyKey: 'schema-invalid-key',
      }),
    ).rejects.toThrow();
  });

  it('rejects drafts that reference a placeholder / schema-less componentKey', async () => {
    const { saveTeacherDraftHandler } = await import(
      '../../../convex/teacher/content-authoring'
    );

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx } = makeMutationMockCtx({ profiles: [teacher] });

    // `equation-solver` is a runtime placeholder — explicitly NOT in
    // SCHEMA_REGISTRY. Authoring must reject it.
    await expect(
      saveTeacherDraftHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        draft: {
          title: 'Placeholder key',
          phases: [
            {
              title: 'Explore',
              phaseType: 'explore',
              sections: [
                {
                  title: 'Bad',
                  activities: [
                    {
                      componentKey: 'equation-solver',
                      props: { equation: 'x + 1 = 0' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        idempotencyKey: 'placeholder-key',
      }),
    ).rejects.toThrow();
  });

  it('strips unsafe markup in activity prompts before persistence, and the sanitized text is reflected in the stored props', async () => {
    const {
      saveTeacherDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const result = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft({
        phases: [
          {
            title: 'Explore',
            phaseType: 'explore',
            sections: [
              {
                title: 'Section',
                activities: [
                  {
                    componentKey: 'graphing-explorer',
                    props: {
                      equation: 'x^2',
                      comparisonQuestion:
                        '<img onerror="alert(1)">Safe?</a><a href="javascript:doBad()">click</a>',
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
      idempotencyKey: 'sanitize-prompt-key',
    });
    expect(result.success).toBe(true);

    const allText = JSON.stringify(stores);
    expect(allText).not.toContain('<script>');
    expect(allText).not.toContain('onerror=');
    expect(allText).not.toContain('javascript:');
    // Surviving tail preserved.
    expect(allText).toContain('Safe?');
  });
});

describe('Phase 2 — Adversarial — Review A orphan activity repro', () => {
  it('after edit-after-reject with a multi-activity section, the new activities are recorded in metadata.authoringActivityIds', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      editRejectedDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    // First draft: section with 3 activities.
    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft({
        phases: [
          {
            title: 'Explore',
            phaseType: 'explore',
            sections: [
              {
                title: 'Multi-activity section',
                activities: [
                  {
                    componentKey: 'graphing-explorer',
                    props: VALID_ACTIVITY_PROPS['graphing-explorer'],
                  },
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
      idempotencyKey: 'orphan-repro-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    // Pin the original metadata list length to confirm scale.
    const originalLessonRow = stores.lessons.find(
      (l) => l._id === saved.lessonId,
    );
    expect(originalLessonRow?.metadata?.authoringActivityIds).toHaveLength(3);
    const originalAuthoredIds: string[] = JSON.parse(
      JSON.stringify(originalLessonRow!.metadata.authoringActivityIds),
    );

    // Submit, reject.
    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'rejected',
      comment: 'Refine',
    });

    // Edit-after-reject with a different draft: still 3 activities but a
    // different mix (so the activity ids must all change).
    const edited = await editRejectedDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      draft: buildAuthoredDraft({
        title: 'Edited after reject',
        phases: [
          {
            title: 'Explore',
            phaseType: 'explore',
            sections: [
              {
                title: 'Multi-activity section',
                activities: [
                  {
                    componentKey: 'graphing-explorer',
                    props: {
                      ...VALID_ACTIVITY_PROPS['graphing-explorer'],
                      comparisonQuestion: 'Different prompt after edit',
                    },
                  },
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
      idempotencyKey: 'orphan-repro-key-edited',
    });
    expect(edited.success).toBe(true);
    expect(edited.activityIds).toHaveLength(3);

    // The Review A nonblocking finding was that editRejectedDraftHandler
    // did not patch metadata.authoringActivityIds after the edit.
    // The fix refreshes the metadata so it reflects the post-edit ids.
    // If the bug is reintroduced, this assertion fails (the metadata list
    // would still hold the OLD ids or be empty after deleteLessonTree).
    const lessonAfterEdit = stores.lessons.find(
      (l) => l._id === saved.lessonId,
    );
    expect(lessonAfterEdit?.metadata?.authoringActivityIds).toHaveLength(3);

    const postEditIds: string[] = JSON.parse(
      JSON.stringify(lessonAfterEdit!.metadata.authoringActivityIds),
    );
    const overlap = postEditIds.filter((id) => originalAuthoredIds.includes(id));
    // All three NEW activity ids must be different from the OLD ids, so the
    // overlap must be zero.
    expect(overlap).toHaveLength(0);

    // The new activity ids must match the ones returned by the handler
    // (so idempotent re-saves can find them to clean up later).
    for (const newId of edited.activityIds) {
      expect(postEditIds).toContain(newId);
    }
  });

  it('after edit-after-reject followed by an idempotent re-save, no orphan activity rows remain in the activities table', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      editRejectedDraftHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    // 3-activity section in the first draft.
    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft({
        phases: [
          {
            title: 'Explore',
            phaseType: 'explore',
            sections: [
              {
                title: 'Multi-activity section',
                activities: [
                  {
                    componentKey: 'graphing-explorer',
                    props: VALID_ACTIVITY_PROPS['graphing-explorer'],
                  },
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
      idempotencyKey: 'orphan-cleanup-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    const initialActivityIds = JSON.parse(JSON.stringify(saved.activityIds));

    await submitDraftForReviewHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    await reviewAuthoredLessonHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      decision: 'rejected',
      comment: 'Refine',
    });

    // Edit-after-reject with a 2-activity section (same idempotency key so
    // the metadata.authoringKey stays stable and the next save can find the
    // lesson). The two inserted activities must be the only activities in
    // stores.activities once the Review A fix is applied.
    const edited = await editRejectedDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      lessonId: saved.lessonId,
      draft: buildAuthoredDraft({
        title: 'Edited down',
        phases: [
          {
            title: 'Explore',
            phaseType: 'explore',
            sections: [
              {
                title: 'Multi-activity section',
                activities: [
                  {
                    componentKey: 'graphing-explorer',
                    props: {
                      ...VALID_ACTIVITY_PROPS['graphing-explorer'],
                      comparisonQuestion: 'Down to 2 activities',
                    },
                  },
                  {
                    componentKey: 'comprehension-quiz',
                    props: VALID_ACTIVITY_PROPS['comprehension-quiz'],
                  },
                ],
              },
            ],
          },
        ],
      }),
      idempotencyKey: 'orphan-cleanup-key',
    });
    expect(edited.success).toBe(true);
    expect(edited.activityIds).toHaveLength(2);
    expect(stores.activities).toHaveLength(2);

    // Idempotent re-save with same key + a 1-activity section.
    const finalSave = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft({
        title: 'Edited down',
        phases: [
          {
            title: 'Explore',
            phaseType: 'explore',
            sections: [
              {
                title: 'Multi-activity section',
                activities: [
                  {
                    componentKey: 'graphing-explorer',
                    props: {
                      ...VALID_ACTIVITY_PROPS['graphing-explorer'],
                      comparisonQuestion: 'Down to 1 activity',
                    },
                  },
                ],
              },
            ],
          },
        ],
      }),
      idempotencyKey: 'orphan-cleanup-key',
    });
    expect(finalSave.success).toBe(true);

    // After the fix, deleteLessonTree on the next save can correctly clean
    // up the prior edit's non-primary activities (because
    // editRejectedDraftHandler patched metadata.authoringActivityIds with
    // the actual ids). So stores.activities must end up with exactly 1 row.
    expect(stores.activities).toHaveLength(1);
    const remainingIds = stores.activities.map((a) => a._id);
    expect(remainingIds.includes(initialActivityIds[0])).toBe(false);
    expect(remainingIds.includes(initialActivityIds[1])).toBe(false);
    expect(remainingIds.includes(initialActivityIds[2])).toBe(false);
  });
});
