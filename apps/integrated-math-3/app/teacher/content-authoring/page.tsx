import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { ClientComposer } from './ClientComposer';
import type { TeacherFacingStatus } from '../../../../convex/teacher/content-authoring';

interface PageProps {
  searchParams: Promise<{ preview?: string }>;
}

const FROM_DTO_CACHE = '__phase3_preview_seed__';

interface PreviewSeed {
  lessonId: string;
  lessonVersionId: string;
  teacherFacingStatus: TeacherFacingStatus;
  rejectionComment?: string;
  draft: unknown;
  teacherId: string;
}

/**
 * Server entry for the teacher content-authoring composer. Requires a
 * teacher or admin session and renders the composer UI in either edit
 * (`?preview` not set) or preview (`?preview=1`) mode.
 *
 * The composer scaffold ships a minimal draft fixture so the route is
 * reachable at `/teacher/content-authoring` for UX browser review. The
 * real draft will hydrate from Phase 2 `saveTeacherDraft` once the
 * composer drive UX lands in a follow-up. This is consistent with the
 * Phase 3 strategy (recommended dev route + `?preview=1` URL).
 */
export default async function TeacherContentAuthoringPage({ searchParams }: PageProps) {
  const claims = await requireTeacherSessionClaims('/auth/login');
  const params = await searchParams;
  const preview = params.preview === '1';

  const seed: PreviewSeed = {
    lessonId: 'lesson_preview_seed',
    lessonVersionId: 'lv_preview_seed',
    teacherFacingStatus: 'draft',
    rejectionComment: undefined,
    draft: createSeedDraft(),
    teacherId: claims.sub ?? 'teacher_seed',
  };

  // Suppress unused warning for the eventual round-trip constant.
  void FROM_DTO_CACHE;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">
          Teacher content authoring
        </h1>
        <p className="text-sm text-muted-foreground">
          Compose a lesson with phases, sections, and schema-validated
          activities. Preview before submitting for review.
        </p>
      </header>
      <ClientComposer seed={seed} preview={preview} />
    </main>
  );
}

function createSeedDraft() {
  return {
    title: 'Quadratic functions — Authored seed',
    phases: [
      {
        title: 'Explore',
        phaseType: 'explore',
        sections: [
          {
            title: 'Graphing a parabola',
            markdown: 'Use the graphing tool to explore y = x^2 + 3x - 4.',
            activities: [
              {
                componentKey: 'graphing-explorer',
                props: { equation: 'x^2 + 3x - 4' },
              },
            ],
          },
        ],
      },
      {
        title: 'Worked example',
        phaseType: 'worked_example',
        sections: [
          {
            title: 'Vertex form',
            callout: 'Remember the vertex form: y = a(x - h)^2 + k.',
            activities: [
              {
                componentKey: 'comprehension-quiz',
                props: {
                  questions: [
                    {
                      id: 'q1',
                      prompt: 'What is the vertex form of a quadratic?',
                      correctAnswer: 'y = a(x - h)^2 + k',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        title: 'Guided practice',
        phaseType: 'guided_practice',
        sections: [
          {
            title: 'Degree of a quadratic',
            activities: [
              {
                componentKey: 'fill-in-the-blank',
                props: {
                  template: 'A quadratic has degree {{blank:degree}}.',
                  blanks: [{ id: 'degree', correctAnswer: '2' }],
                },
              },
            ],
          },
        ],
      },
    ],
  };
}
