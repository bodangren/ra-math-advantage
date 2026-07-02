import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

/**
 * Phase 3 — AuthoredLessonPreview adversarial tests.
 *
 * The Phase 3 Green tests cover a single activity type
 * (`graphing-explorer`) through the preview path. These adversarial
 * tests probe gaps that would let FR3 regressions sneak in:
 *
 *  - PREVIEW-FR3 EXTENSION: register the preview component for MORE
 *    THAN ONE canonical activity type (`comprehension-quiz` and
 *    `fill-in-the-blank`) and prove that each one receives its OWN
 *    authored props. A regression where the preview only forwards the
 *    `equation` field for every activity (or only renders the first
 *    activity type) would slip past the single-type assertion in the
 *    green tests.
 *  - DOM SAFETY: authored free-text containing `<script>`,
 *    event-handler attributes, and `javascript:` URLs never reaches
 *    the rendered DOM as live HTML. The preview must use the same
 *    `SanitizedText` path the lesson renderer uses.
 *  - Phase placement-to-mode mapping: `independent_practice` and
 *    `assessment` map to `practice` mode (not just `guided_practice`).
 *  - Schema-invalid activities in ONE phase do not crash the OTHER
 *    phases' preview; only that phase renders the accessible error.
 *  - Multiple valid activities in the same section all render in order.
 */

import { registerActivity, clearActivityRegistry } from '../../../../lib/activities/registry';
import type { AuthoredDraft } from '@/components/teacher/content-authoring/AuthoredLessonPreview';

interface CapturedActivity {
  activityId: string;
  mode: string;
  equation?: unknown;
  questions?: unknown;
  template?: unknown;
  blanks?: unknown;
  // Spreads any other authored prop for inspection.
  [key: string]: unknown;
}

const GraphingExplorerProbe = vi.fn(({ activityId, mode, ...rest }: CapturedActivity) => (
  <div
    data-testid={`probe-graphing-${activityId}`}
    data-mode={mode}
    data-equation={String(rest.equation ?? '')}
  >
    graphing-probe
  </div>
));

const ComprehensionQuizProbe = vi.fn(({ activityId, mode, ...rest }: CapturedActivity) => (
  <div
    data-testid={`probe-quiz-${activityId}`}
    data-mode={mode}
    data-questions-count={Array.isArray(rest.questions) ? String(rest.questions.length) : '0'}
  >
    quiz-probe
  </div>
));

const FillInTheBlankProbe = vi.fn(({ activityId, mode, ...rest }: CapturedActivity) => (
  <div
    data-testid={`probe-blank-${activityId}`}
    data-mode={mode}
    data-template={String(rest.template ?? '')}
  >
    blank-probe
  </div>
));

const VALID_PROPS: Record<string, Record<string, unknown>> = {
  'graphing-explorer': { equation: 'x^2 + 3x - 4' },
  'comprehension-quiz': {
    questions: [
      {
        id: 'q1',
        prompt: 'What is the vertex form of a quadratic?',
        correctAnswer: 'y = a(x - h)^2 + k',
      },
      {
        id: 'q2',
        prompt: 'What does the discriminant tell us?',
        correctAnswer: 'Number of real roots',
      },
    ],
  },
  'fill-in-the-blank': {
    template: 'A quadratic has degree {{blank:degree}}.',
    blanks: [{ id: 'degree', correctAnswer: '2' }],
  },
};

function buildMultiTypeDraft(): AuthoredDraft {
  return {
    title: 'Multi-type preview',
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
                props: { equation: 'x^2 + 3x - 4' },
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
            title: 'Example',
            callout: 'Remember the vertex form.',
            activities: [
              {
                componentKey: 'comprehension-quiz',
                props: VALID_PROPS['comprehension-quiz'],
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
                props: VALID_PROPS['fill-in-the-blank'],
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('Phase 3 adversarial: preview forwards authored props for multiple activity types', () => {
  beforeEach(() => {
    clearActivityRegistry();
    GraphingExplorerProbe.mockClear();
    ComprehensionQuizProbe.mockClear();
    FillInTheBlankProbe.mockClear();
    registerActivity('graphing-explorer', GraphingExplorerProbe as never);
    registerActivity('comprehension-quiz', ComprehensionQuizProbe as never);
    registerActivity('fill-in-the-blank', FillInTheBlankProbe as never);
  });

  afterEach(() => {
    cleanup();
    clearActivityRegistry();
  });

  it('renders every activity in the draft through its registered preview component', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildMultiTypeDraft()} lessonId="lesson_adv_1" />);

    await waitFor(() => {
      expect(GraphingExplorerProbe).toHaveBeenCalled();
      expect(ComprehensionQuizProbe).toHaveBeenCalled();
      expect(FillInTheBlankProbe).toHaveBeenCalled();
    });

    // Each registered component is invoked at least once with a distinct
    // activityId.
    const graphIds = GraphingExplorerProbe.mock.calls.map((c) => c[0].activityId);
    const quizIds = ComprehensionQuizProbe.mock.calls.map((c) => c[0].activityId);
    const blankIds = FillInTheBlankProbe.mock.calls.map((c) => c[0].activityId);

    expect(graphIds).toHaveLength(1);
    expect(quizIds).toHaveLength(1);
    expect(blankIds).toHaveLength(1);
    expect(new Set([...graphIds, ...quizIds, ...blankIds]).size).toBe(3);
  });

  it('comprehension-quiz preview receives its OWN authored questions (not graphing-explorer equation)', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildMultiTypeDraft()} lessonId="lesson_adv_2" />);

    await waitFor(() => expect(ComprehensionQuizProbe).toHaveBeenCalled());

    const lastQuizCall = ComprehensionQuizProbe.mock.calls.at(-1)![0] as CapturedActivity;
    expect(lastQuizCall.questions).toBeDefined();
    expect(Array.isArray(lastQuizCall.questions)).toBe(true);
    expect((lastQuizCall.questions as unknown[]).length).toBe(2);
    // The first question's prompt and correctAnswer match the authored fixture.
    const q0 = (lastQuizCall.questions as Array<{ prompt: string; correctAnswer: string }>)[0];
    expect(q0.prompt).toBe('What is the vertex form of a quadratic?');
    expect(q0.correctAnswer).toBe('y = a(x - h)^2 + k');
    // The graphing-explorer `equation` must NOT be smuggled in as a quiz prop.
    expect(lastQuizCall.equation).toBeUndefined();
  });

  it('fill-in-the-blank preview receives its OWN authored template + blanks', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildMultiTypeDraft()} lessonId="lesson_adv_3" />);

    await waitFor(() => expect(FillInTheBlankProbe).toHaveBeenCalled());

    const lastBlankCall = FillInTheBlankProbe.mock.calls.at(-1)![0] as CapturedActivity;
    expect(lastBlankCall.template).toBe('A quadratic has degree {{blank:degree}}.');
    expect(Array.isArray(lastBlankCall.blanks)).toBe(true);
    expect((lastBlankCall.blanks as Array<{ id: string; correctAnswer: string }>)[0]).toEqual({
      id: 'degree',
      correctAnswer: '2',
    });
    // Cross-key props from the other activities must not leak in.
    expect(lastBlankCall.equation).toBeUndefined();
    expect(lastBlankCall.questions).toBeUndefined();
  });

  it('graphing-explorer preview receives its OWN equation (not questions/template from other activities)', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    render(<AuthoredLessonPreview draft={buildMultiTypeDraft()} lessonId="lesson_adv_4" />);

    await waitFor(() => expect(GraphingExplorerProbe).toHaveBeenCalled());

    const lastGraphCall = GraphingExplorerProbe.mock.calls.at(-1)![0] as CapturedActivity;
    expect(lastGraphCall.equation).toBe('x^2 + 3x - 4');
    expect(lastGraphCall.questions).toBeUndefined();
    expect(lastGraphCall.template).toBeUndefined();
  });
});

describe('Phase 3 adversarial: preview DOM safety', () => {
  beforeEach(() => {
    clearActivityRegistry();
    GraphingExplorerProbe.mockClear();
    ComprehensionQuizProbe.mockClear();
    FillInTheBlankProbe.mockClear();
    registerActivity('graphing-explorer', GraphingExplorerProbe as never);
    registerActivity('comprehension-quiz', ComprehensionQuizProbe as never);
    registerActivity('fill-in-the-blank', FillInTheBlankProbe as never);
  });

  afterEach(() => {
    cleanup();
    clearActivityRegistry();
  });

  it('does not insert a <script> element into the DOM for unsafe authored callout', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    const draft: AuthoredDraft = {
      title: 'Unsafe callout',
      phases: [
        {
          title: 'P1',
          phaseType: 'explore',
          sections: [
            {
              title: 'S1',
              callout: '<script>window.__pwned=true</script>Remember the vertex form.',
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
      <AuthoredLessonPreview draft={draft} lessonId="lesson_adv_unsafe_1" />,
    );

    // No <script> element was injected by the authored callout.
    expect(container.querySelectorAll('script').length).toBe(0);
    // The meaningful text survives.
    expect(container.textContent).toContain('Remember the vertex form.');
    // The hostile fragment does not appear as a literal node attribute.
    expect(container.innerHTML).not.toContain('window.__pwned');
  });

  it('does not insert event-handler attributes for unsafe authored markdown', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    const draft: AuthoredDraft = {
      title: 'Unsafe markdown',
      phases: [
        {
          title: 'P1',
          phaseType: 'explore',
          sections: [
            {
              title: 'S1',
              markdown:
                'Walk through <img src=x onerror="window.__pwned=true"> the steps.',
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
      <AuthoredLessonPreview draft={draft} lessonId="lesson_adv_unsafe_2" />,
    );

    // The DOM must not contain any `on*=` attribute string.
    expect(container.innerHTML).not.toMatch(/\bon[a-z]+\s*=/i);
    expect(container.textContent).toContain('Walk through');
    expect(container.textContent).toContain('the steps.');
  });

  it('does not insert javascript: URLs into the DOM for authored callout', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    const draft: AuthoredDraft = {
      title: 'Unsafe URL',
      phases: [
        {
          title: 'P1',
          phaseType: 'explore',
          sections: [
            {
              title: 'S1',
              callout:
                'See <a href="javascript:window.__pwned=true()">this</a> for details.',
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
      <AuthoredLessonPreview draft={draft} lessonId="lesson_adv_unsafe_3" />,
    );

    expect(container.innerHTML.toLowerCase()).not.toContain('javascript:');
    expect(container.textContent).toContain('See');
    expect(container.textContent).toContain('this');
    expect(container.textContent).toContain('for details.');
  });
});

describe('Phase 3 adversarial: phase placement-to-mode coverage', () => {
  beforeEach(() => {
    clearActivityRegistry();
    GraphingExplorerProbe.mockClear();
    registerActivity('graphing-explorer', GraphingExplorerProbe as never);
  });

  afterEach(() => {
    cleanup();
    clearActivityRegistry();
  });

  it('independent_practice and assessment phases both map to practice mode', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    const draft: AuthoredDraft = {
      title: 'Practice mode coverage',
      phases: [
        {
          title: 'Independent Practice',
          phaseType: 'independent_practice',
          sections: [
            {
              title: 'S1',
              activities: [
                { componentKey: 'graphing-explorer', props: { equation: 'x^2' } },
              ],
            },
          ],
        },
        {
          title: 'Assessment',
          phaseType: 'assessment',
          sections: [
            {
              title: 'S2',
              activities: [
                { componentKey: 'graphing-explorer', props: { equation: 'x^3' } },
              ],
            },
          ],
        },
      ],
    };

    render(<AuthoredLessonPreview draft={draft} lessonId="lesson_adv_mode" />);

    await waitFor(() => expect(GraphingExplorerProbe).toHaveBeenCalledTimes(2));

    const modes = GraphingExplorerProbe.mock.calls.map((c) => c[0].mode);
    expect(modes).toEqual(['practice', 'practice']);
  });

  it('vocabulary / learn / key_concept phases all map to teaching mode', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    const draft: AuthoredDraft = {
      title: 'Teaching mode coverage',
      phases: [
        {
          title: 'Vocab',
          phaseType: 'vocabulary',
          sections: [
            {
              title: 'S1',
              activities: [
                { componentKey: 'graphing-explorer', props: { equation: 'x^2' } },
              ],
            },
          ],
        },
        {
          title: 'Learn',
          phaseType: 'learn',
          sections: [
            {
              title: 'S2',
              activities: [
                { componentKey: 'graphing-explorer', props: { equation: 'x^3' } },
              ],
            },
          ],
        },
        {
          title: 'Key concept',
          phaseType: 'key_concept',
          sections: [
            {
              title: 'S3',
              activities: [
                { componentKey: 'graphing-explorer', props: { equation: 'x^4' } },
              ],
            },
          ],
        },
      ],
    };

    render(<AuthoredLessonPreview draft={draft} lessonId="lesson_adv_mode_teaching" />);

    await waitFor(() => expect(GraphingExplorerProbe).toHaveBeenCalledTimes(3));

    const modes = GraphingExplorerProbe.mock.calls.map((c) => c[0].mode);
    expect(modes).toEqual(['teaching', 'teaching', 'teaching']);
  });
});

describe('Phase 3 adversarial: per-phase error isolation', () => {
  beforeEach(() => {
    clearActivityRegistry();
    GraphingExplorerProbe.mockClear();
    registerActivity('graphing-explorer', GraphingExplorerProbe as never);
  });

  afterEach(() => {
    cleanup();
    clearActivityRegistry();
  });

  it('one invalid phase does not crash the rendering of valid sibling phases', async () => {
    const { AuthoredLessonPreview } = await import(
      '@/components/teacher/content-authoring/AuthoredLessonPreview'
    );

    const draft: AuthoredDraft = {
      title: 'Isolation',
      phases: [
        {
          title: 'Broken phase',
          phaseType: 'explore',
          sections: [
            {
              title: 'Broken',
              activities: [
                {
                  // Wrong type: equation must be a string.
                  componentKey: 'graphing-explorer',
                  props: { equation: 123 },
                },
              ],
            },
          ],
        },
        {
          title: 'Healthy phase',
          phaseType: 'worked_example',
          sections: [
            {
              title: 'Healthy',
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
    };

    render(<AuthoredLessonPreview draft={draft} lessonId="lesson_adv_isolation" />);

    await waitFor(() => expect(GraphingExplorerProbe).toHaveBeenCalled());

    // The accessible error from the broken phase is visible.
    expect(screen.getByRole('alert')).toBeInTheDocument();
    // The healthy phase's activity still renders through the registered
    // component (the broken phase did not poison the rest of the preview).
    // Match only the phase sections, not the per-phase error indicators.
    const phaseSections = screen.getAllByTestId(/^preview-phase-\d+$/);
    expect(phaseSections).toHaveLength(2);
    // The healthy phase's probe DID receive its authored equation.
    const probeCalls = GraphingExplorerProbe.mock.calls;
    const healthyCall = probeCalls.find(
      (c) => (c[0] as CapturedActivity).equation === 'x^2 + 3x - 4',
    );
    expect(healthyCall).toBeDefined();
  });
});