import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

describe('sanitizeAuthoringText', () => {
  it('strips script tags and their content', async () => {
    const { sanitizeAuthoringText } = await import(
      '../../../lib/teacher/content-authoring/sanitize-authored-text'
    );

    const out = sanitizeAuthoringText('Hello <script>alert("x")</script>world');

    expect(out).toContain('Hello');
    expect(out).toContain('world');
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('alert');
  });

  it('neutralizes event-handler attributes', async () => {
    const { sanitizeAuthoringText } = await import(
      '../../../lib/teacher/content-authoring/sanitize-authored-text'
    );

    const out = sanitizeAuthoringText('<img src="x" onerror="alert(1)">');

    expect(out).not.toContain('onerror');
    expect(out).not.toContain('alert(1)');
  });

  it('neutralizes javascript: URLs', async () => {
    const { sanitizeAuthoringText } = await import(
      '../../../lib/teacher/content-authoring/sanitize-authored-text'
    );

    const out = sanitizeAuthoringText(
      '<a href="javascript:alert(1)">click</a>',
    );

    expect(out).not.toContain('javascript:');
    expect(out).not.toContain('alert(1)');
  });

  it('preserves math notation and markdown', async () => {
    const { sanitizeAuthoringText } = await import(
      '../../../lib/teacher/content-authoring/sanitize-authored-text'
    );

    const markdown = 'The vertex is **(h, k)** and the equation is $y = ax^2 + bx + c$.';
    const out = sanitizeAuthoringText(markdown);

    expect(out).toContain('**');
    expect(out).toContain('$');
    expect(out).toContain('y = ax^2 + bx + c');
  });

  it('sanitizes free-text fields throughout a lesson draft', async () => {
    const { sanitizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/sanitize-authored-text'
    );

    const draft = {
      title: 'Lesson <script>evil</script>',
      phases: [
        {
          title: 'Phase <img src="x" onerror="alert(1)">',
          sections: [
            {
              title: 'Section <a href="javascript:alert(2)">bad</a>',
              markdown: '**Note:** <script>alert(3)</script>',
              callout: '<img onload="alert(4)">',
              activities: [
                {
                  componentKey: 'comprehension-quiz',
                  props: {
                    questions: [
                      {
                        id: 'q1',
                        prompt: '<script>alert(5)</script>What?',
                        correctAnswer: 'ok',
                        explanation: '<img onerror="alert(6)">Because.',
                      },
                    ],
                  },
                },
                {
                  componentKey: 'fill-in-the-blank',
                  props: {
                    template: 'Solve {{blank:a}} <script>alert(7)</script>',
                    blanks: [
                      {
                        id: 'a',
                        correctAnswer: '<img onerror="alert(8)">x',
                      },
                    ],
                  },
                },
                {
                  componentKey: 'step-by-step-solver',
                  props: {
                    problemType: 'factoring',
                    equation: 'x^2 + 1 = 0',
                    steps: [
                      {
                        id: 's1',
                        description: '<script>alert(9)</script>Step',
                        expression: 'x^2 + 1',
                        explanation: '<img onerror="alert(10)">Why',
                      },
                    ],
                    hints: ['<script>alert(11)</script>hint'],
                  },
                },
                {
                  componentKey: 'rate-of-change-calculator',
                  props: {
                    sourceType: 'function',
                    data: { expression: '<script>alert(12)</script>x^2' },
                    interval: { start: 0, end: 1 },
                  },
                },
                {
                  componentKey: 'graphing-explorer',
                  props: {
                    equation: 'x^2',
                    comparisonQuestion: '<script>alert(13)</script>Which?',
                  },
                },
                {
                  componentKey: 'discriminant-analyzer',
                  props: {
                    equation: 'x^2 + 3x - 4 = 0',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const sanitized = sanitizeLessonDraft(draft);

    const allText = JSON.stringify(sanitized);
    expect(allText).not.toContain('<script>');
    expect(allText).not.toContain('onerror=');
    expect(allText).not.toContain('onload=');
    expect(allText).not.toContain('javascript:');
    expect(allText).toContain('x^2');
  });

  it('renders sanitized text without dangerouslySetInnerHTML', async () => {
    const { SanitizedText } = await import(
      '../../../lib/teacher/content-authoring/sanitize-authored-text'
    );

    const { container } = render(
      React.createElement(SanitizedText, {
        html: '<script>alert("x")</script><b>Safe math</b>',
      }),
    );

    expect(container.innerHTML).not.toContain('<script>');
    expect(container.innerHTML).not.toContain('alert');
    expect(container.innerHTML).not.toContain('dangerouslySetInnerHTML');
    expect(container.textContent).toContain('Safe math');
  });
});
