import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Id } from '@/convex/_generated/dataModel';
import type { MutationCtx } from '@/convex/_generated/server';

const { createHandlerMock, processMock } = vi.hoisted(() => ({
  createHandlerMock: vi.fn(),
  processMock: vi.fn(),
}));

vi.mock('@/convex/learningEvidence', () => ({
  createIm3ConvexLearningEvidenceHandler: createHandlerMock,
}));

import { completePhase } from '@/convex/student';

const STUDENT_ID = 'student-1' as Id<'profiles'>;
const LESSON_ID = 'lesson-1' as Id<'lessons'>;
const LESSON_VERSION_ID = 'lesson-version-1' as Id<'lesson_versions'>;
const PHASE_ID = 'phase-1' as Id<'phase_versions'>;
const STANDARD_ID = 'standard-1' as Id<'competency_standards'>;

type CompletePhaseArgs = {
  userId: Id<'profiles'>;
  lessonId: string;
  phaseNumber: number;
  timeSpent: number;
  idempotencyKey: string;
  linkedStandardId?: string;
};

type CompletePhaseHandler = (
  ctx: MutationCtx,
  args: CompletePhaseArgs,
) => Promise<unknown>;

type QueryCall = { table: string; index: string };

type ContextHarness = {
  ctx: MutationCtx;
  queryCalls: QueryCall[];
  inserts: Array<{ table: string; document: Record<string, unknown> }>;
  patches: Array<{ id: string; document: Record<string, unknown> }>;
};

const completePhaseHandler = (
  completePhase as unknown as { _handler: CompletePhaseHandler }
)._handler;

function createContextHarness({
  lessonSlug,
  phaseNumber,
}: {
  lessonSlug: string;
  phaseNumber: number;
}): ContextHarness {
  const queryCalls: QueryCall[] = [];
  const inserts: ContextHarness['inserts'] = [];
  const patches: ContextHarness['patches'] = [];
  const lesson = {
    _id: LESSON_ID,
    slug: lessonSlug,
    title: 'Lesson',
    unitNumber: 1,
    orderIndex: 1,
  };
  const lessonVersion = {
    _id: LESSON_VERSION_ID,
    lessonId: LESSON_ID,
    version: 1,
    status: 'published',
    createdAt: 1,
  };
  const phase = {
    _id: PHASE_ID,
    lessonVersionId: LESSON_VERSION_ID,
    phaseNumber,
    phaseType: 'worked_example',
    createdAt: 1,
  };
  const standard = {
    _id: STANDARD_ID,
    code: 'CCSS.MATH.HSF.IF.C.7',
    description: 'Standard',
    isActive: true,
    createdAt: 1,
  };

  const query = vi.fn((table: string) => ({
    withIndex: vi.fn((index: string, _configure: (query: unknown) => unknown) => {
      queryCalls.push({ table, index });

      return {
        unique: vi.fn(async () => {
          if (table === 'lessons' && index === 'by_slug') return lesson;
          if (table === 'phase_versions' && index === 'by_lesson_version_and_phase') {
            return phase;
          }
          if (table === 'competency_standards' && index === 'by_code') return standard;
          return null;
        }),
        collect: vi.fn(async () => {
          if (table === 'lesson_versions') return [lessonVersion];
          return [];
        }),
      };
    }),
  }));

  const db = {
    get: vi.fn(async () => null),
    query,
    insert: vi.fn(async (table: string, document: Record<string, unknown>) => {
      inserts.push({ table, document });
      return `${table}-new`;
    }),
    patch: vi.fn(async (id: string, document: Record<string, unknown>) => {
      patches.push({ id, document });
    }),
  };

  return {
    ctx: { db } as unknown as MutationCtx,
    queryCalls,
    inserts,
    patches,
  };
}

async function runCompletion(
  harness: ContextHarness,
  lessonSlug: string,
  phaseNumber: number,
) {
  return completePhaseHandler(harness.ctx, {
    userId: STUDENT_ID,
    lessonId: lessonSlug,
    phaseNumber,
    timeSpent: 60,
    idempotencyKey: `completion-${lessonSlug}-${phaseNumber}`,
    linkedStandardId: 'CCSS.MATH.HSF.IF.C.7',
  });
}

describe('student completePhase linked-standard handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    processMock.mockResolvedValue({
      persisted: true,
      masteryApplied: false,
      decision: { idempotency: 'new', reason: 'teacher_led' },
    });
    createHandlerMock.mockReturnValue({ process: processMock });
  });

  it('resolves phase 4 and does not write student_competency for the IM3 teacher-led exposure', async () => {
    const harness = createContextHarness({
      lessonSlug: 'module-1-lesson-1',
      phaseNumber: 4,
    });

    await expect(runCompletion(harness, 'module-1-lesson-1', 4)).resolves.toEqual({
      success: true,
      nextPhaseUnlocked: true,
    });

    expect(harness.queryCalls).toContainEqual({
      table: 'phase_versions',
      index: 'by_lesson_version_and_phase',
    });
    expect(harness.inserts.map(({ table }) => table)).toEqual(['student_progress']);
    expect(harness.inserts).not.toContainEqual(expect.objectContaining({
      table: 'student_competency',
    }));
    expect(harness.patches).toHaveLength(0);
    expect(createHandlerMock).toHaveBeenCalledTimes(1);
    expect(processMock).toHaveBeenCalledTimes(1);
  });

  it('writes student_competency for module-1-lesson-1 phase 3 with a linked standard', async () => {
    const harness = createContextHarness({
      lessonSlug: 'module-1-lesson-1',
      phaseNumber: 3,
    });

    await expect(runCompletion(harness, 'module-1-lesson-1', 3)).resolves.toEqual({
      success: true,
      nextPhaseUnlocked: true,
    });

    expect(harness.queryCalls).toContainEqual({
      table: 'competency_standards',
      index: 'by_code',
    });
    expect(harness.inserts.map(({ table }) => table)).toEqual(['student_progress', 'student_competency']);
    expect(createHandlerMock).not.toHaveBeenCalled();
  });
});
