import { describe, it, expect } from 'vitest';

const CANONICAL_ACTIVITY_KEYS = [
  'graphing-explorer',
  'step-by-step-solver',
  'comprehension-quiz',
  'fill-in-the-blank',
  'rate-of-change-calculator',
  'discriminant-analyzer',
] as const;

const PLACEHOLDER_ACTIVITY_KEYS = ['equation-solver', 'drag-drop-categorization'] as const;

function buildMinimalActivity(componentKey: string, props?: Record<string, unknown>) {
  return {
    componentKey,
    props: props ?? {},
  };
}

function buildMinimalDraft(overrides?: Record<string, unknown>) {
  return {
    title: 'Quadratic Functions',
    phases: [
      {
        title: 'Explore',
        sections: [
          {
            title: 'Graphing a parabola',
            activities: [buildMinimalActivity('graphing-explorer', { equation: 'x^2' })],
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe('normalizeLessonDraft', () => {
  it('accepts an ordered lesson with phases, sections, and activities', async () => {
    const { normalizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/authoring-model'
    );

    const result = normalizeLessonDraft(buildMinimalDraft());

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.title).toBe('Quadratic Functions');
    expect(result.data.phases).toHaveLength(1);
    expect(result.data.phases[0].title).toBe('Explore');
    expect(result.data.phases[0].sections).toHaveLength(1);
    expect(result.data.phases[0].sections[0].title).toBe('Graphing a parabola');
    expect(result.data.phases[0].sections[0].activities).toHaveLength(1);
    expect(result.data.phases[0].sections[0].activities[0].componentKey).toBe(
      'graphing-explorer',
    );
  });

  it('preserves order of phases, sections, and activities in normalized output', async () => {
    const { normalizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/authoring-model'
    );

    const result = normalizeLessonDraft({
      title: 'Ordered Lesson',
      phases: [
        {
          title: 'Phase A',
          sections: [
            {
              title: 'Section 1',
              activities: [
                buildMinimalActivity('graphing-explorer', { equation: 'x^2' }),
                buildMinimalActivity('discriminant-analyzer', { equation: 'x^2 + 1 = 0' }),
              ],
            },
            {
              title: 'Section 2',
              activities: [buildMinimalActivity('comprehension-quiz')],
            },
          ],
        },
        {
          title: 'Phase B',
          sections: [
            {
              title: 'Section 3',
              activities: [buildMinimalActivity('step-by-step-solver')],
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.phases.map((p: { title: string }) => p.title)).toEqual([
      'Phase A',
      'Phase B',
    ]);
    expect(result.data.phases[0].sections.map((s: { title: string }) => s.title)).toEqual([
      'Section 1',
      'Section 2',
    ]);
    expect(
      result.data.phases[0].sections[0].activities.map(
        (a: { componentKey: string }) => a.componentKey,
      ),
    ).toEqual(['graphing-explorer', 'discriminant-analyzer']);
  });

  it('assigns stable IDs to normalized phases, sections, and activities', async () => {
    const { normalizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/authoring-model'
    );

    const input = buildMinimalDraft();
    const first = normalizeLessonDraft(input);
    const second = normalizeLessonDraft(input);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    if (!first.success || !second.success) return;

    expect(first.data.id).toBe(second.data.id);
    expect(first.data.phases[0].id).toBe(second.data.phases[0].id);
    expect(first.data.phases[0].sections[0].id).toBe(
      second.data.phases[0].sections[0].id,
    );
    expect(first.data.phases[0].sections[0].activities[0].id).toBe(
      second.data.phases[0].sections[0].activities[0].id,
    );
  });

  it('rejects a lesson with no phases', async () => {
    const { normalizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/authoring-model'
    );

    const result = normalizeLessonDraft({ title: 'Empty', phases: [] });

    expect(result.success).toBe(false);
  });

  it('rejects a phase with no sections', async () => {
    const { normalizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/authoring-model'
    );

    const result = normalizeLessonDraft({
      title: 'Bad Phase',
      phases: [{ title: 'No Sections', sections: [] }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects a section with no activities', async () => {
    const { normalizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/authoring-model'
    );

    const result = normalizeLessonDraft({
      title: 'Bad Section',
      phases: [{ title: 'P1', sections: [{ title: 'No Activities', activities: [] }] }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects placeholder activity keys that have no schema', async () => {
    const { normalizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/authoring-model'
    );

    for (const key of PLACEHOLDER_ACTIVITY_KEYS) {
      const result = normalizeLessonDraft({
        title: 'Placeholder',
        phases: [
          {
            title: 'P1',
            sections: [
              {
                title: 'S1',
                activities: [buildMinimalActivity(key)],
              },
            ],
          },
        ],
      });

      expect(result.success).toBe(false);
      if (result.success) continue;
      expect(result.errors.some((e: { message: string }) => e.message.includes(key))).toBe(true);
    }
  });

  it('rejects unknown activity keys', async () => {
    const { normalizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/authoring-model'
    );

    const result = normalizeLessonDraft({
      title: 'Unknown',
      phases: [
        {
          title: 'P1',
          sections: [
            {
              title: 'S1',
              activities: [buildMinimalActivity('totally-unknown-key')],
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('supports all six canonical activity keys', async () => {
    const { normalizeLessonDraft } = await import(
      '../../../lib/teacher/content-authoring/authoring-model'
    );

    for (const key of CANONICAL_ACTIVITY_KEYS) {
      const result = normalizeLessonDraft({
        title: `${key} lesson`,
        phases: [
          {
            title: 'P1',
            sections: [
              {
                title: 'S1',
                activities: [buildMinimalActivity(key)],
              },
            ],
          },
        ],
      });

      expect(result.success).toBe(true);
      if (!result.success) continue;
      expect(result.data.phases[0].sections[0].activities[0].componentKey).toBe(key);
    }
  });
});
