import { describe, expect, it, vi } from 'vitest';

import type { MutationCtx } from '@/convex/_generated/server';
import { verifyTeacherExposure } from '@/convex/learningEvidence';
import { BM2_LEARNING_EVIDENCE_PILOT } from '@/lib/learning-evidence/bm2-pilot';

type Row = Record<string, unknown> & { _id: string };
type VerifyHandler = (
  ctx: MutationCtx,
  args: { teacherId: string; learnerId: string; submissionId: string },
) => Promise<unknown>;

const mapping = BM2_LEARNING_EVIDENCE_PILOT.mappings[0];
const submittedAt = 1_000;

function makeContext() {
  const rows: Record<string, Row[]> = {
    profiles: [
      { _id: 'profiles:teacher', role: 'teacher', organizationId: 'org:one' },
      { _id: 'profiles:student', role: 'student', organizationId: 'org:one' },
    ],
    classes: [{
      _id: 'classes:one',
      teacherId: 'profiles:teacher',
      archived: false,
    }],
    class_enrollments: [{
      _id: 'class_enrollments:one',
      classId: 'classes:one',
      studentId: 'profiles:student',
      status: 'active',
      enrolledAt: submittedAt - 20,
    }],
    lessons: [{ _id: 'lessons:one', slug: mapping.source.lessonSlug }],
    lesson_versions: [{
      _id: 'lesson_versions:one',
      lessonId: 'lessons:one',
      status: 'published',
    }],
    phase_versions: [{
      _id: 'phase_versions:one',
      lessonVersionId: 'lesson_versions:one',
    }],
    phase_sections: [{
      _id: 'phase_sections:one',
      phaseVersionId: 'phase_versions:one',
      sectionType: 'activity',
      content: { activityId: 'activities:source' },
    }],
    student_progress: [{
      _id: 'student_progress:one',
      userId: 'profiles:student',
      phaseId: 'phase_versions:one',
      startedAt: submittedAt - 10,
      createdAt: submittedAt - 10,
    }],
    activities: [{
      _id: 'activities:source',
      stableActivityId: mapping.source.activityId,
    }],
    activity_submissions: [{
      _id: 'activity_submissions:source',
      userId: 'profiles:student',
      activityId: 'activities:source',
      stableActivityId: mapping.source.activityId,
      submittedAt,
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: 'activities:source',
        mode: mapping.source.mode,
        status: 'graded',
      },
    }],
  };
  const patch = vi.fn();
  const insert = vi.fn();
  const get = async (...args: string[]) => {
    const id = args.at(-1);
    return Object.values(rows).flat().find((row) => row._id === id) ?? null;
  };
  const query = (table: string) => ({
    withIndex: (
      _name: string,
      configure: (builder: { eq(field: string, value: unknown): unknown }) => unknown,
    ) => {
      const filters: Array<[string, unknown]> = [];
      const builder = {
        eq(field: string, value: unknown) {
          filters.push([field, value]);
          return builder;
        },
      };
      configure(builder);
      const selected = () => (rows[table] ?? []).filter((row) => (
        filters.every(([field, value]) => row[field] === value)
      ));
      return {
        collect: async () => selected(),
        take: async (count: number) => selected().slice(0, count),
        unique: async () => {
          const matches = selected();
          if (matches.length > 1) throw new Error('Non-unique test query');
          return matches[0] ?? null;
        },
      };
    },
  });
  return {
    ctx: { db: { get, query, patch, insert } } as unknown as MutationCtx,
    patch,
    insert,
  };
}

describe('BM2 removed source mapping teacher boundary', () => {
  it('rejects the formerly mapped notebook before teacher or evidence writes', async () => {
    const { ctx, patch, insert } = makeContext();
    const handler = (verifyTeacherExposure as unknown as { _handler: VerifyHandler })._handler;

    await expect(handler(ctx, {
      teacherId: 'profiles:teacher',
      learnerId: 'profiles:student',
      submissionId: 'activity_submissions:source',
    })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });

    expect(patch).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });
});
