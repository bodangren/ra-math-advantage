'use client';

/**
 * Client-side composer shell for `/teacher/content-authoring`. Splits
 * the load between LessonComposer (edit) and AuthoredLessonPreview so
 * the route serves both modes. Wires the Phase 2 client adapter to
 * no-op stubs at this stage; the actual Convex handlers will land in a
 * follow-up phase. This makes the route reachable for UX browser
 * review while the Phase 3 tests gate composer + preview behavior in
 * isolation.
 *
 * Phase 3 UX remediation — Preview button wiring. The composer's
 * "Preview draft" button is now wired to `onPreview`, which here uses
 * `useRouter().push('/teacher/content-authoring?preview=1')` to switch
 * the route into preview mode. The preview branch renders the
 * AuthoredLessonPreview AND a visible "Back to editing" affordance so
 * the teacher can return to the composer.
 */

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const handlePreview = useCallback(() => {
    router.push('/teacher/content-authoring?preview=1');
  }, [router]);

  if (preview) {
    return (
      <div className="space-y-4" data-testid="authored-lesson-preview-shell">
        <div className="flex items-center justify-between gap-2">
          <span className="section-label">Preview mode</span>
          <Link
            href="/teacher/content-authoring"
            className="px-3 py-2 rounded-md border border-border text-sm hover:bg-muted/50 transition-colors"
            aria-label="Back to editing"
          >
            Back to editing
          </Link>
        </div>
        <AuthoredLessonPreview
          draft={seedDraft(seed)}
          lessonId={seed.lessonId}
        />
      </div>
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
      onPreview={handlePreview}
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