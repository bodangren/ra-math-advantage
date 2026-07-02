import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

/**
 * Phase 3 UX finding remediation — Preview button is a dead control.
 *
 * The composer's "Preview" button has `aria-label="Preview draft"` and
 * `disabled={!previewable}` but NO `onClick` handler — so clicking it
 * does nothing and FR3 (preview as a student sees it) is unreachable
 * from the composer UI. These tests pin the wiring contract:
 *
 *   - When the draft is previewable, clicking the enabled "Preview draft"
 *     button must invoke the `onPreview` callback.
 *   - When the draft is not previewable (e.g. empty phases), the button
 *     is disabled and the callback must NOT fire.
 *
 * This file is a focused sibling of LessonComposer.test.tsx; it does
 * not modify any pre-existing test or test assertion.
 */

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

function buildPreviewableDraft() {
  return {
    title: 'Authored Quadratic Lesson',
    phases: [
      {
        title: 'Explore Phase',
        phaseType: 'explore',
        sections: [
          {
            title: 'Graphing Section',
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
            title: 'Example Section',
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
            title: 'Practice Section',
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

const mockClient = {
  saveTeacherDraft: vi.fn(),
  submitDraftForReview: vi.fn(),
  editRejectedDraft: vi.fn(),
};

describe('LessonComposer Preview button wiring', () => {
  it('invokes the onPreview callback when the enabled Preview button is clicked', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );
    const onPreview = vi.fn();

    render(
      <LessonComposer
        initialDraft={buildPreviewableDraft()}
        client={mockClient}
        teacherId="teacher_1"
        onPreview={onPreview}
      />
    );

    const previewButton = screen.getByRole('button', { name: /preview draft/i });
    expect(previewButton).toBeEnabled();

    fireEvent.click(previewButton);

    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it('does NOT invoke onPreview when the draft is not previewable (button is disabled)', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );
    const onPreview = vi.fn();

    render(
      <LessonComposer
        initialDraft={{
          title: 'Empty lesson',
          phases: [],
        }}
        client={mockClient}
        teacherId="teacher_1"
        onPreview={onPreview}
      />
    );

    const previewButton = screen.getByRole('button', { name: /preview draft/i });
    expect(previewButton).toBeDisabled();

    fireEvent.click(previewButton);

    expect(onPreview).not.toHaveBeenCalled();
  });

  it('does not throw when no onPreview is provided and the button is clicked (back-compat)', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildPreviewableDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />
    );

    const previewButton = screen.getByRole('button', { name: /preview draft/i });
    expect(previewButton).toBeEnabled();

    // Must not throw; onPreview is optional.
    expect(() => fireEvent.click(previewButton)).not.toThrow();
  });
});