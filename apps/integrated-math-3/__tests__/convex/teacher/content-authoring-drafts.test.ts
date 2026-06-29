import { describe, it, expect, vi } from 'vitest';
import type { Id } from '../../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../../convex/_generated/server';
import { computeComponentContentHash } from '../../../lib/activities/content-hash';
import { resolveComponentKind } from '../../../lib/activities/review-queue';
import { sanitizeAuthoringText } from '../../../lib/teacher/content-authoring/sanitize-authored-text';

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

    const { ctx: mutCtx } = makeMutationMockCtx({
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

    const { ctx: qCtx } = makeQueryMockCtx(stores);
    qCtx.stores.class_enrollments.push(
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
