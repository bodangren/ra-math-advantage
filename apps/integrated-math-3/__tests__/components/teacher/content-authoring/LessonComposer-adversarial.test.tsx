import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

/**
 * Phase 3 — LessonComposer UI adversarial tests.
 *
 * The Phase 3 Green tests cover sanitization at the JSON-string level
 * and the high-level "save adapter called with sanitized tree" shape.
 * These adversarial tests probe the UI BOUNDARY end-to-end:
 *
 *  - Paste a `<script>` element into the lesson title input via the
 *    actual input element. The Save click must serialize the lesson
 *    tree to the client adapter with the script stripped, and the
 *    rendered title in the DOM must NOT contain a `<script>` node.
 *  - Paste unsafe authored text (script + event-handler +
 *    `javascript:` URL) into a section's callout. The Save payload
 *    callout must be sanitized AND the rendered DOM must NOT contain
 *    a script node or `onerror=` attribute.
 *  - The composer must NOT use `dangerouslySetInnerHTML` for any
 *    authored free-text field. This is a static source guard that
 *    catches a regression where someone re-introduces raw HTML
 *    rendering.
 *  - An invalid prop (empty string) entered through the form fields
 *    must BLOCK the Save button — confirming the form-level field
 *    update path still goes through the canonical validator.
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
            callout: 'Remember the vertex form.',
            activities: [
              {
                componentKey: 'graphing-explorer',
                props: VALID_ACTIVITY_PROPS['graphing-explorer'],
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('Phase 3 adversarial: UI-boundary sanitization', () => {
  beforeEach(() => {
    mockClient.saveTeacherDraft.mockReset();
    mockClient.submitDraftForReview.mockReset();
    mockClient.editRejectedDraft.mockReset();
    mockClient.saveTeacherDraft.mockResolvedValue({
      success: true,
      lessonId: 'lesson_1',
      lessonVersionId: 'lv_1',
      activityIds: [],
      idempotencyKey: 'key-1',
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('paste <script> into the lesson title input — Save payload has script stripped and DOM has no <script>', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />,
    );

    const titleInput = screen.getByLabelText(/lesson title/i) as HTMLInputElement;
    fireEvent.change(titleInput, {
      target: { value: '<script>window.__pwned=true</script>Vertex form lesson' },
    });
    expect(titleInput.value).toContain('<script>window.__pwned=true</script>Vertex form lesson');

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockClient.saveTeacherDraft).toHaveBeenCalled();
    const payload = mockClient.saveTeacherDraft.mock.calls.at(-1)?.[0] as {
      draft: { title: string };
    };
    // The save payload's title is sanitized: no script tag, but the
    // meaningful text survives.
    expect(payload.draft.title).not.toContain('<script>');
    expect(payload.draft.title).toContain('Vertex form lesson');
  });

  it('the rendered composer DOM does not contain a <script> element after paste', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    const { container } = render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />,
    );

    const titleInput = screen.getByLabelText(/lesson title/i) as HTMLInputElement;
    fireEvent.change(titleInput, {
      target: { value: '<script>window.__pwned=true</script>Vertex form' },
    });

    // The composer does not introduce a script element from the title paste.
    // (Note: an <input value="..."> attribute containing "<script>" is fine —
    // browsers escape input values and never interpret them as HTML. The
    // safety property is that NO <script> element exists in the DOM tree.)
    expect(container.querySelectorAll('script').length).toBe(0);
    // The input still contains the user's typed value verbatim — the
    // sanitizer runs at the SAVE boundary (and on the lesson payload
    // going to the client adapter), not on every keystroke. The
    // input's `value` property holds the raw string until save.
    expect(titleInput.value).toContain('<script>window.__pwned=true</script>Vertex form');
  });

  it('unsafe authored callout text is sanitized in BOTH the save payload AND the rendered DOM', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    const draftWithUnsafeCallout = {
      title: 'Sanitize callout',
      phases: [
        {
          title: 'P1',
          phaseType: 'explore',
          sections: [
            {
              title: 'S1',
              callout:
                '<script>window.__pwned=true</script>Remember <img src=x onerror=alert(1)> the <a href="javascript:alert(2)">vertex</a> form.',
              activities: [
                {
                  componentKey: 'graphing-explorer',
                  props: { equation: 'x^2' },
                },
              ],
            },
          ],
        },
      ],
    };

    const { container } = render(
      <LessonComposer
        initialDraft={draftWithUnsafeCallout}
        client={mockClient}
        teacherId="teacher_1"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockClient.saveTeacherDraft).toHaveBeenCalled();
    const payload = mockClient.saveTeacherDraft.mock.calls.at(-1)?.[0] as {
      draft: { phases: Array<{ sections: Array<{ callout?: string }> }> };
    };
    const callout = payload.draft.phases[0].sections[0].callout ?? '';
    expect(callout).not.toContain('<script>');
    expect(callout).not.toMatch(/\bon[a-z]+\s*=/i);
    expect(callout.toLowerCase()).not.toContain('javascript:');
    // The meaningful text is preserved.
    expect(callout).toContain('Remember');
    expect(callout).toContain('the');
    expect(callout).toContain('vertex');
    expect(callout).toContain('form.');

    // DOM safety: no <script>, no on*= attribute, no javascript: URL.
    expect(container.querySelectorAll('script').length).toBe(0);
    expect(container.innerHTML).not.toMatch(/\bon[a-z]+\s*=/i);
    expect(container.innerHTML.toLowerCase()).not.toContain('javascript:');
  });

  it('LessonComposer source does NOT use dangerouslySetInnerHTML for any authored text', async () => {
    // Strip JSDoc / block / line comments before searching so a
    // documentation reference like "* No `dangerouslySetInnerHTML`"
    // does not trip the guard. The actual JSX prop usage we are
    // forbidding is `dangerouslySetInnerHTML=` (with the `=`).
    const fs = await import('fs');
    const path = await import('path');
    const composerPath = path.resolve(
      __dirname,
      '../../../../components/teacher/content-authoring/LessonComposer.tsx',
    );
    const raw = fs.readFileSync(composerPath, 'utf8');
    const stripped = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(stripped).not.toMatch(/dangerouslySetInnerHTML\s*=/);
  });

  it('AuthoredLessonPreview source does NOT use dangerouslySetInnerHTML for any authored text', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const previewPath = path.resolve(
      __dirname,
      '../../../../components/teacher/content-authoring/AuthoredLessonPreview.tsx',
    );
    const raw = fs.readFileSync(previewPath, 'utf8');
    const stripped = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(stripped).not.toMatch(/dangerouslySetInnerHTML\s*=/);
  });

  it('save button is disabled when an empty equation is typed into the graphing-explorer activity field', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />,
    );

    const saveButton = screen.getByRole('button', { name: /save draft/i });
    expect(saveButton).toBeEnabled();

    // Find the equation input by id pattern that ActivityBlock sets.
    const equationInput = document.querySelector(
      'input[name="equation"]',
    ) as HTMLInputElement | null;
    expect(equationInput).toBeTruthy();

    fireEvent.change(equationInput!, { target: { value: '' } });

    expect(screen.getByRole('button', { name: /save draft/i })).toBeDisabled();
    // The form-level validation should also surface a message.
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('Save click on a draft with a single-phase, single-section, single-activity tree is forwarded to the client adapter with all 3 levels', async () => {
    const { LessonComposer } = await import(
      '@/components/teacher/content-authoring/LessonComposer'
    );

    render(
      <LessonComposer
        initialDraft={buildInitialDraft()}
        client={mockClient}
        teacherId="teacher_1"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockClient.saveTeacherDraft).toHaveBeenCalled();
    const payload = mockClient.saveTeacherDraft.mock.calls.at(-1)?.[0] as {
      teacherId: string;
      draft: {
        title: string;
        phases: Array<{
          sections: Array<{ activities: Array<{ componentKey: string; props: Record<string, unknown> }> }>;
        }>;
      };
      idempotencyKey: string;
    };
    expect(payload.teacherId).toBe('teacher_1');
    expect(payload.draft.title).toBe('Authored Quadratic Lesson');
    expect(payload.draft.phases).toHaveLength(1);
    expect(payload.draft.phases[0].sections[0].activities).toHaveLength(1);
    expect(payload.draft.phases[0].sections[0].activities[0]).toEqual({
      componentKey: 'graphing-explorer',
      props: { equation: 'x^2 + 3x - 4' },
    });
    expect(typeof payload.idempotencyKey).toBe('string');
    expect(payload.idempotencyKey.length).toBeGreaterThan(0);
  });
});