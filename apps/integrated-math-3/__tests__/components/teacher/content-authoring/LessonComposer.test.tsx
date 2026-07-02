import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

/**
 * Phase 3 Red — Lesson composer React component tests.
 *
 * These tests import from the intended component module under
 * `apps/integrated-math-3/components/teacher/content-authoring/LessonComposer.tsx`,
 * which does not yet exist. Every new Phase 3 component test is expected to fail
 * for that reason.
 */

const mockClient = {
  saveTeacherDraft: vi.fn(),
  submitDraftForReview: vi.fn(),
  editRejectedDraft: vi.fn(),
};

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

function buildInitialDraft() {
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

describe('LessonComposer', () => {
  it('renders the lesson title input and phase headings', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />
    );

    expect(screen.getByLabelText(/lesson title/i)).toHaveValue('Authored Quadratic Lesson');
    expect(screen.getByText('Explore Phase')).toBeInTheDocument();
    expect(screen.getByText('Worked Example')).toBeInTheDocument();
    expect(screen.getByText('Guided Practice')).toBeInTheDocument();
  });

  it('renders section titles and activity component keys', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />
    );

    expect(screen.getByText('Graphing Section')).toBeInTheDocument();
    expect(screen.getByText('Example Section')).toBeInTheDocument();
    expect(screen.getByText('Practice Section')).toBeInTheDocument();
    expect(screen.getAllByText(/graphing-explorer/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/comprehension-quiz/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/fill-in-the-blank/i).length).toBeGreaterThan(0);
  });

  it('has keyboard-operable add/remove/reorder controls with accessible names', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />
    );

    expect(screen.getByRole('button', { name: /add phase/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add activity/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /remove/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /reorder/i }).length).toBeGreaterThan(0);
  });

  it('disables save and preview when the draft has validation errors', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={{
          title: 'Invalid',
          phases: [
            {
              title: 'P1',
              phaseType: 'explore',
              sections: [
                {
                  title: 'S1',
                  activities: [{ componentKey: 'graphing-explorer', props: { equation: '' } }],
                },
              ],
            },
          ],
        }}
        client={mockClient}
        teacherId="teacher_1"
      />
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /preview/i })).toBeDisabled();
  });

  it('enables save when the draft satisfies real schemas', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });

  it('calls the client save adapter with the full sanitized lesson tree', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    mockClient.saveTeacherDraft.mockResolvedValue({
      success: true,
      lessonId: 'lesson_1',
      lessonVersionId: 'lv_1',
      activityIds: [],
      idempotencyKey: 'key-1',
    });

    render(
      <LessonComposer
        initialDraft={{
          title: 'Sanitize save payload',
          phases: [
            {
              title: 'Explore Phase',
              phaseType: 'explore',
              sections: [
                {
                  title: 'Graphing Section',
                  markdown: '<script>alert(1)</script>Graph y = x^2.',
                  callout: '<img src=x onerror=alert(1)>Remember the vertex.',
                  activities: [
                    {
                      componentKey: 'graphing-explorer',
                      props: { equation: 'x^2 + 3x - 4' },
                    },
                  ],
                },
              ],
            },
          ],
        }}
        client={mockClient}
        teacherId="teacher_1"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockClient.saveTeacherDraft).toHaveBeenCalled();
    const payload = mockClient.saveTeacherDraft.mock.calls.at(-1)?.[0] as {
      draft: { phases: Array<{ sections: Array<{ markdown?: string; callout?: string; activities: Array<{ componentKey: string; props: Record<string, unknown> }> }> }> };
    };
    expect(payload.draft.phases[0].sections[0].markdown).toBe('Graph y = x^2.');
    expect(payload.draft.phases[0].sections[0].callout).not.toContain('onerror=');
    expect(payload.draft.phases[0].sections[0].activities[0]).toEqual({
      componentKey: 'graphing-explorer',
      props: { equation: 'x^2 + 3x - 4' },
    });
  });

  it('renders field-level validation errors for invalid props', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={{
          title: 'Bad',
          phases: [
            {
              title: 'P1',
              phaseType: 'explore',
              sections: [
                {
                  title: 'S1',
                  activities: [{ componentKey: 'comprehension-quiz', props: { questions: [] } }],
                },
              ],
            },
          ],
        }}
        client={mockClient}
        teacherId="teacher_1"
      />
    );

    expect(screen.getByText(/questions/i)).toBeInTheDocument();
  });

  it('follows responsive card-workbook layout hooks', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    const { container } = render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />
    );

    expect(container.querySelector('.card-workbook')).toBeInTheDocument();
  });
});

describe('LessonComposer status strip', () => {
  it('shows Draft status and save/submit actions for a draft DTO', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
        initialStatus={{
          teacherFacingStatus: 'draft',
          lessonId: 'lesson_1',
          lessonVersionId: 'lv_1',
        }}
      />
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
  });

  it('disables editing and submission for submitted status', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
        initialStatus={{
          teacherFacingStatus: 'submitted',
          lessonId: 'lesson_1',
          lessonVersionId: 'lv_1',
        }}
      />
    );

    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('shows rejection comment and an Edit draft action for rejected status', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
        initialStatus={{
          teacherFacingStatus: 'rejected',
          rejectionComment: 'Fix the equation.',
          lessonId: 'lesson_1',
          lessonVersionId: 'lv_1',
        }}
      />
    );

    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Fix the equation.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit draft/i })).toBeInTheDocument();
  });

  it('shows publish-ready messaging for approved status', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
        initialStatus={{
          teacherFacingStatus: 'approved',
          lessonId: 'lesson_1',
          lessonVersionId: 'lv_1',
        }}
      />
    );

    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText(/publish-ready|ready to publish/i)).toBeInTheDocument();
  });

  it('disables edits for published status', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
        initialStatus={{
          teacherFacingStatus: 'published',
          lessonId: 'lesson_1',
          lessonVersionId: 'lv_1',
        }}
      />
    );

    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('calls the edit-rejected client adapter when Edit draft is clicked', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    mockClient.editRejectedDraft.mockResolvedValue({
      success: true,
      lessonId: 'lesson_1',
      lessonVersionId: 'lv_2',
      activityIds: [],
      idempotencyKey: 'key-2',
    });

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
        initialStatus={{
          teacherFacingStatus: 'rejected',
          rejectionComment: 'Fix it.',
          lessonId: 'lesson_1',
          lessonVersionId: 'lv_1',
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /edit draft/i }));

    expect(mockClient.editRejectedDraft).toHaveBeenCalled();
  });
});
