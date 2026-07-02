'use client';

/**
 * Client-side composer shell for `/teacher/content-authoring`. Splits
 * the load between LessonComposer (edit) and AuthoredLessonPreview so
 * the route serves both modes. Wires the Phase 2 client adapter to
 * no-op stubs at this stage; the actual Convex handlers will land in a
 * follow-up phase. This makes the route reachable for UX browser
 * review while the Phase 3 tests gate composer + preview behavior in
 * isolation.
 */

import { LessonComposer } from '@/components/teacher/content-authoring/LessonComposer';
import { AuthoredLessonPreview, type AuthoredDraft } from '@/components/teacher/content-authoring/AuthoredLessonPreview';
import type { TeacherFacingStatus } from '../../../../convex/teacher/content-authoring';

export interface ComposerSeed {
  lessonId: string;
  lessonVersionId: string;
  teacherFacingStatus: TeacherFacingStatus;
  rejectionComment?: string;
  draft: unknown;
  teacherId: string;
}

interface ClientComposerProps {
  seed: ComposerSeed;
  preview: boolean;
}

const NOOP = async () => ({
  success: true,
  lessonId: 'noop',
  lessonVersionId: 'noop',
  activityIds: [],
  idempotencyKey: 'noop',
});

export function ClientComposer({ seed, preview }: ClientComposerProps) {
  if (preview) {
    return (
      <AuthoredLessonPreview
        draft={seedDraft(seed)}
        lessonId={seed.lessonId}
      />
    );
  }
  return (
    <LessonComposer
      initialDraft={seedDraft(seed)}
      teacherId={seed.teacherId}
      client={{
        saveTeacherDraft: NOOP,
        submitDraftForReview: NOOP,
        editRejectedDraft: NOOP,
      }}
      initialStatus={{
        teacherFacingStatus: seed.teacherFacingStatus,
        rejectionComment: seed.rejectionComment,
        lessonId: seed.lessonId,
        lessonVersionId: seed.lessonVersionId,
      }}
    />
  );
}

function seedDraft(seed: ComposerSeed): AuthoredDraft {
  if (seed.draft && typeof seed.draft === 'object') {
    return seed.draft as AuthoredDraft;
  }
  return {
    title: 'Empty lesson',
    phases: [],
  };
}
