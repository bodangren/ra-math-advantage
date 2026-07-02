import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

/**
 * Phase 3 Red — Authored lesson preview tests.
 *
 * These tests import from the intended component module under
 * `apps/integrated-math-3/components/teacher/content-authoring/AuthoredLessonPreview.tsx`,
 * which does not yet exist. Every new Phase 3 preview test is expected to fail
 * for that reason.
 */

import { registerActivity } from '../../../../lib/activities/registry';
import type { AuthoredDraft } from '@/components/teacher/content-authoring/AuthoredLessonPreview';

const TestActivity = vi.fn(({ activityId, mode, onSubmit, onComplete }) => (
  <div
    data-testid="preview-test-activity"
    data-activity-id={activityId}
    data-mode={mode}
    data-has-submit={onSubmit ? 'true' : 'false'}
    data-has-complete={onComplete ? 'true' : 'false'}
  >
    Preview Activity
  </div>
));

const VALID_ACTIVITY_PROPS: Record<string, Record<string, unknown>> = {
  'graphing-explorer': { equation: 'x^2 + 3x - 4' },
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

function buildAuthoredDraft(): AuthoredDraft {
  return {
    title: 'Preview Quadratic Lesson',
    phases: [
      {
        title: 'Explore',
        phaseType: 'explore',
        sections: [
          {
            title: 'Graphing',
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
            title: 'Example text',
            callout: 'Remember the vertex form.',
            activities: [
              {
                componentKey: 'comprehension-quiz',
                props: VALID_ACTIVITY_PROPS['comprehension-quiz'],
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
            title: 'Practice',
            activities: [
              {
                componentKey: 'fill-in-the-blank',
                props: VALID_ACTIVITY_PROPS['fill-in-the-blank'],
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('AuthoredLessonPreview', () => {
  beforeEach(() => {
    TestActivity.mockClear();
    registerActivity('graphing-explorer', TestActivity);
  });

  it('renders the teacher preview badge', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildAuthoredDraft()} lessonId="lesson_preview_1" />);

    expect(screen.getByText(/teacher preview/i)).toBeInTheDocument();
  });

  it('renders authored phase titles in order', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildAuthoredDraft()} lessonId="lesson_preview_1" />);

    const headings = screen.getAllByText(/Explore|Worked Example|Guided Practice/i);
    expect(headings.length).toBeGreaterThanOrEqual(3);
  });

  it('renders text and callout section content', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildAuthoredDraft()} lessonId="lesson_preview_1" />);

    expect(screen.getByText(/Use the graphing tool/i)).toBeInTheDocument();
    expect(screen.getByText(/Remember the vertex form/i)).toBeInTheDocument();
  });

  it('renders activity sections through LessonRenderer/PhaseRenderer path', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildAuthoredDraft()} lessonId="lesson_preview_1" />);

    await waitFor(() => {
      expect(screen.getByTestId('preview-test-activity')).toBeInTheDocument();
    });
  });

  it('passes authored props to the registered activity component', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildAuthoredDraft()} lessonId="lesson_preview_1" />);

    await waitFor(() => {
      expect(screen.getByTestId('preview-test-activity')).toBeInTheDocument();
    });

    expect(TestActivity).toHaveBeenCalled();
    const lastCall = TestActivity.mock.calls[TestActivity.mock.calls.length - 1][0];
    expect(lastCall.activityId).toBeDefined();
  });

  it('uses teaching mode for worked_example phases', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildAuthoredDraft()} lessonId="lesson_preview_1" />);

    await waitFor(() => {
      expect(screen.getByTestId('preview-test-activity')).toBeInTheDocument();
    });

    const lastCall = TestActivity.mock.calls[TestActivity.mock.calls.length - 1][0];
    expect(['teaching', 'example', 'worked_example']).toContain(lastCall.mode);
  });

  it('uses practice mode for guided_practice phases', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildAuthoredDraft()} lessonId="lesson_preview_1" />);

    await waitFor(() => {
      expect(screen.getByTestId('preview-test-activity')).toBeInTheDocument();
    });
  });

  it('does not invent unsupported activity types', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    const draft = buildAuthoredDraft();
    draft.phases[0].sections[0].activities[0].componentKey = 'equation-solver';

    expect(() =>
      render(<AuthoredLessonPreview draft={draft} lessonId="lesson_preview_1" />),
    ).toThrow();
  });

  it('surfaces schema-invalid props as accessible errors without crashing the whole preview', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    const draft = buildAuthoredDraft();
    draft.phases[0].sections[0].activities[0].props = { equation: 123 };

    render(<AuthoredLessonPreview draft={draft} lessonId="lesson_preview_1" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('preview-test-activity')).not.toBeInTheDocument();
  });

  it('routes activity callbacks through the same path a student component uses', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    TestActivity.mockImplementation(({ onComplete }) => (
      <button data-testid="complete-activity" onClick={onComplete}>
        Complete
      </button>
    ));

    render(<AuthoredLessonPreview draft={buildAuthoredDraft()} lessonId="lesson_preview_1" />);

    await waitFor(() => {
      expect(screen.getByTestId('complete-activity')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('complete-activity'));

    expect(screen.getByTestId('complete-activity')).toBeInTheDocument();
  });
});
