import { describe, it, expect, vi } from 'vitest';
import type { Id } from '../../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../../convex/_generated/server';

/**
 * Phase 4 adversarial — Convex-handler regressions and authorization edges.
 *
 * This file covers four concrete regressions that the Phase 4 composition
 * seam (`authoring-lifecycle.ts` + `toTeacherDraftPayload`) plus the Phase
 * 2 handler hardening could reintroduce. Each test is structured to fail
 * with a clear, isolated message if a regression lands.
 *
 *   1. Approval-storage split: every activity placement still records an
 *      approval (either inline `activities.approval` for `activity`-kind,
 *      or a `component_approvals` row for `example`/`practice`-kind). A
 *      regression that wires ALL placements through `component_approvals`
 *      (or all through `activities.approval`) would break the split. The
 *      Phase 4 E2E's `>= 2` assertion does not detect that bug — these
 *      tests assert the exact split AND the inline approval shape.
 *   2. Missing `displayName` regression: `normalizeLessonDraft` strips
 *      fields the composer/handler did not register, and the Phase 4
 *      adapter supplies `displayName: componentKey`. If a future change
 *      regressed the adapter (or `normalizeLessonDraft` stops stripping
 *      unknown fields) the persisted `activities.displayName` column
 *      could end up undefined, which the Convex `v.string()` schema
 *      column would reject in production. These tests pin that the
 *      persisted row always has a non-empty `displayName`.
 *   3. Stale-hash escape after editing an approved activity's PROPS:
 *      the existing Phase 2 adversarial suite covers hash tampering and
 *      title-only edits, but a focused props-only edit test is a sharper
 *      probe — it proves the defense fires even when the structural
 *      outline of the lesson is unchanged.
 *   4. Cross-org student visibility (enrolled + class-assigned):
 *      the existing `getAuthoredLessonForStudentHandler` returns null
 *      for the four null cases, but the "cross-org" case in the existing
 *      tests happens to short-circuit on the missing enrollment row. A
 *      student who is genuinely enrolled in the assigned class BUT in a
 *      different org must also get null — this is the case the org check
 *      exists to defend. These tests push the active enrollment for an
 *      other-org student and assert null is still returned.
 */

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

describe('Phase 4 adversarial: approval-storage split (exact, not just >= 2)', () => {
  it('the explore (activity-kind) placement records inline approval; the worked_example/guided_practice primary placements record component_approvals rows — exact split', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'split-key',
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

    // Exact split pinning:
    //   - 4 activities persisted (1 explore + 1 worked_example + 2 guided_practice).
    //   - 3 placements walked by listPlacedActivities (only the section
    //     primary for each phase gets a placement; the secondary guided
    //     practice activity is persisted but is NOT a placement).
    //   - 1 INLINE approval on activities (explore = activity-kind).
    //   - 2 component_approvals ROWS (worked_example + guided_practice
    //     primary = comprehension-quiz, both non-activity kinds).
    //
    // The Phase 4 E2E assertion was `>= 2` to remain tolerant of the
    // existing fill-in-the-blank orphan. This adversarial test pins
    // the EXACT split so a regression that wires all 4 placements
    // through component_approvals (or all through inline approval)
    // would fail with a clear "expected length 2 but got 4" message.
    expect(stores.activities).toHaveLength(4);

    const exploreActivity = stores.activities.find(
      (a) => a.componentKey === 'graphing-explorer',
    );
    expect(exploreActivity).toBeDefined();

    // Inline approval on the explore activity must be present and
    // approved with a non-empty contentHash.
    expect(exploreActivity!.approval).toBeDefined();
    expect(exploreActivity!.approval.status).toBe('approved');
    expect(typeof exploreActivity!.approval.contentHash).toBe('string');
    expect((exploreActivity!.approval.contentHash as string).length).toBeGreaterThan(0);

    // EXACTLY 2 component_approvals rows for the 2 non-activity
    // placements. A regression wiring all placements through this
    // table would produce 3 rows (or 4) and fail this assertion.
    expect(stores.component_approvals).toHaveLength(2);

    const approvalKinds = stores.component_approvals
      .map((a) => a.componentKind)
      .sort();
    expect(approvalKinds).toEqual(['example', 'practice']);

    const approvalKeys = stores.component_approvals
      .map((a) => a.componentKey)
      .sort();
    expect(approvalKeys).toEqual(['comprehension-quiz', 'step-by-step-solver']);

    // Every non-activity placement has its approval recorded as a row,
    // NOT inline on activities. Exactly ONE activity must carry an
    // inline approval (the explore one); the other three must NOT.
    const activitiesWithInlineApproval = stores.activities.filter(
      (a) => a.approval !== undefined,
    );
    expect(activitiesWithInlineApproval).toHaveLength(1);
    expect(activitiesWithInlineApproval[0].componentKey).toBe('graphing-explorer');
  });

  it('the inline approval on the explore activity carries a hash matching computeComponentContentHash for the activity kind', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
    } = await import('../../../convex/teacher/content-authoring');
    const { computeComponentContentHash } = await import(
      '../../../lib/activities/content-hash'
    );
    const { resolveComponentKind } = await import('../../../lib/activities/review-queue');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'inline-hash-key',
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

    const exploreActivity = stores.activities.find(
      (a) => a.componentKey === 'graphing-explorer',
    );
    expect(exploreActivity).toBeDefined();

    const expectedHash = await computeComponentContentHash({
      componentKind: resolveComponentKind('explore'),
      componentKey: exploreActivity!.componentKey,
      props: exploreActivity!.props as Record<string, unknown>,
    });
    expect(exploreActivity!.approval.contentHash).toBe(expectedHash);
  });
});

describe('Phase 4 adversarial: displayName fallback', () => {
  it('every persisted activities row carries a non-empty displayName even when the adapter is bypassed (handler fallback path)', async () => {
    // Simulate a regression where the Phase 4 adapter
    // (`toTeacherDraftPayload`) is no longer wired in front of the
    // handler — the handler then receives a draft whose activity
    // entries carry only `componentKey` + `props` (no `displayName`).
    // The handler's `displayName || componentKey` fallback (commit
    // 705e0cc3) must still populate the column.
    const { saveTeacherDraftHandler } = await import(
      '../../../convex/teacher/content-authoring'
    );

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    // The draft below deliberately OMITS `displayName` per activity to
    // simulate the regression where the adapter is bypassed.
    const draftWithoutDisplayName = {
      title: 'No displayName draft',
      phases: [
        {
          title: 'Explore',
          phaseType: 'explore',
          sections: [
            {
              title: 'Graphing',
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
              title: 'Solving',
              activities: [
                {
                  componentKey: 'step-by-step-solver',
                  props: VALID_ACTIVITY_PROPS['step-by-step-solver'],
                },
              ],
            },
          ],
        },
      ],
    };

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: draftWithoutDisplayName,
      idempotencyKey: 'no-display-name-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    // Every persisted activities row must carry a non-empty
    // `displayName`. The fallback path populates it with
    // `componentKey`. The Convex schema requires `v.string()` so an
    // undefined displayName would fail in production.
    expect(stores.activities.length).toBeGreaterThan(0);
    for (const activity of stores.activities) {
      expect(typeof activity.displayName).toBe('string');
      expect((activity.displayName as string).length).toBeGreaterThan(0);
      // The fallback must equal the componentKey.
      expect(activity.displayName).toBe(activity.componentKey);
    }
  });

  it('every persisted activities row carries a non-empty displayName via the normal adapter-supplied path', async () => {
    // This is the "happy path" — the Phase 4 adapter supplies
    // `displayName: componentKey` per activity, the handler persists
    // it, and the column is populated.
    const { saveTeacherDraftHandler } = await import(
      '../../../convex/teacher/content-authoring'
    );

    const teacher = makeTeacher('teacher_1', 'org_1');
    const { ctx, stores } = makeMutationMockCtx({ profiles: [teacher] });

    const saved = await saveTeacherDraftHandler(ctx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'happy-display-name-key',
    });
    expect(saved.success).toBe(true);
    if (!saved.success) return;

    expect(stores.activities.length).toBe(4);
    for (const activity of stores.activities) {
      expect(typeof activity.displayName).toBe('string');
      expect((activity.displayName as string).length).toBeGreaterThan(0);
      expect(activity.displayName).toBe(activity.componentKey);
    }
  });
});

describe('Phase 4 adversarial: stale-hash defense on inline (activity-kind) approval', () => {
  it('publish is blocked when the inline approval hash on the explore (activity-kind) activity is forged to a stale value', async () => {
    // The Phase 4 E2E and the existing Phase 2 adversarial suite
    // already cover:
    //   - publish blocked when only some approvals are stale (mixed set);
    //   - publish blocked when an example/practice component_approvals
    //     row has a forged hash;
    //   - publish blocked when one of several component_approvals is
    //     stale and others are fresh.
    //
    // This adversarial test focuses on the INLINE approval path —
    // the explore (activity-kind) placement — which is unique to the
    // Phase 4 split. If `publishAuthoredLessonHandler` regresses the
    // inline hash check (or wires it through `component_approvals`),
    // this test must catch it.
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
      idempotencyKey: 'inline-stale-key',
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

    const exploreActivity = stores.activities.find(
      (a) => a.componentKey === 'graphing-explorer',
    );
    expect(exploreActivity).toBeDefined();
    expect(exploreActivity!.approval).toBeDefined();
    const originalHash = exploreActivity!.approval.contentHash as string;
    expect(typeof originalHash).toBe('string');

    // Forge the inline approval hash so it differs from the current
    // hash. This simulates either:
    //   (a) tampering on the stored row, OR
    //   (b) the activity's props were edited in a way that did NOT
    //       trigger the handler's stale-defense refresh path.
    await ctx.db.patch(exploreActivity!._id, {
      approval: {
        status: 'approved',
        contentHash: `${originalHash}-forged`,
        reviewedAt: 2000,
        reviewedBy: teacher._id,
      },
      updatedAt: 2000,
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

  it('publish is blocked when the inline approval is missing entirely (no approval object)', async () => {
    // Defense in depth: if the inline `approval` field is removed
    // (e.g. by a regression that drops the activity patch), publish
    // must throw the explicit "is not approved" message, NOT silently
    // pass.
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
      idempotencyKey: 'inline-missing-key',
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

    const exploreActivity = stores.activities.find(
      (a) => a.componentKey === 'graphing-explorer',
    );
    expect(exploreActivity).toBeDefined();

    // Strip the inline approval entirely. The handler must refuse to
    // publish because there is no approval on record.
    await ctx.db.patch(exploreActivity!._id, {
      approval: undefined,
      updatedAt: 3000,
    });

    await expect(
      publishAuthoredLessonHandler(ctx, {
        userId: teacher._id as Id<'profiles'>,
        lessonId: saved.lessonId,
      }),
    ).rejects.toThrow(/not approved/i);
  });
});

describe('Phase 4 adversarial: cross-org student visibility (enrolled + class-assigned)', () => {
  it('a student enrolled in the assigned class BUT in a different org from the teacher gets null', async () => {
    const {
      saveTeacherDraftHandler,
      submitDraftForReviewHandler,
      reviewAuthoredLessonHandler,
      publishAuthoredLessonHandler,
      assignAuthoredLessonHandler,
      getAuthoredLessonForStudentHandler,
    } = await import('../../../convex/teacher/content-authoring');

    const teacher = makeTeacher('teacher_1', 'org_1');
    const sameOrgActiveStudent = makeStudent('student_active', 'org_1');
    const otherOrgEnrolledStudent = makeStudent('student_other_org_enrolled', 'org_2');

    const cls = {
      _id: 'class_1',
      teacherId: teacher._id,
      name: 'Period 1',
      archived: false,
      createdAt: 1000,
      updatedAt: 1000,
    };

    const { ctx: mutCtx, stores } = makeMutationMockCtx({
      profiles: [teacher, sameOrgActiveStudent, otherOrgEnrolledStudent],
      classes: [cls],
    });

    const saved = await saveTeacherDraftHandler(mutCtx, {
      userId: teacher._id as Id<'profiles'>,
      draft: buildAuthoredDraft(),
      idempotencyKey: 'cross-org-enrolled-key',
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

    // Both students are ACTIVELY enrolled in the assigned class. The
    // ONLY difference is organizationId. The same-org student must
    // see the lesson; the cross-org student must see null.
    stores.class_enrollments.push(
      {
        _id: 'enrollment_active_same_org',
        classId: cls._id,
        studentId: sameOrgActiveStudent._id,
        status: 'active',
        enrolledAt: 1000,
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        _id: 'enrollment_active_other_org',
        classId: cls._id,
        studentId: otherOrgEnrolledStudent._id,
        status: 'active',
        enrolledAt: 1000,
        createdAt: 1000,
        updatedAt: 1000,
      },
    );

    const { ctx: qCtx } = makeQueryMockCtx(stores);

    const sameOrgResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: sameOrgActiveStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(sameOrgResult).not.toBeNull();
    expect(sameOrgResult?.lessonId).toBe(saved.lessonId);

    // The adversarial case: actively enrolled, in the assigned class,
    // but in a different organization from the teacher. Must be null.
    const otherOrgResult = await getAuthoredLessonForStudentHandler(qCtx, {
      userId: otherOrgEnrolledStudent._id as Id<'profiles'>,
      lessonId: saved.lessonId,
    });
    expect(otherOrgResult).toBeNull();
  });
});