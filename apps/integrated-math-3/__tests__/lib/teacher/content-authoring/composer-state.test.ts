import { describe, it, expect } from 'vitest';

/**
 * Phase 3 Red — Composer state, schema-driven field derivation, and validation surfacing.
 *
 * These tests import from the intended implementation modules under
 * `apps/integrated-math-3/lib/teacher/content-authoring/`, which do not yet exist.
 * Every new Phase 3 test is expected to fail for that reason.
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
  'rate-of-change-calculator': {
    sourceType: 'table',
    data: { x: [1, 2, 3], y: [2, 4, 6] },
    interval: { start: 1, end: 3 },
  },
};

function buildMinimalDraft() {
  return {
    title: 'Authored Quadratic Lesson',
    phases: [
      {
        title: 'Explore',
        phaseType: 'explore',
        sections: [
          {
            title: 'Graphing a parabola',
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

describe('composer state reducer', () => {
  it('creates a composer state from a normalized draft', async () => {
    const { createComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());

    expect(state.lesson.title).toBe('Authored Quadratic Lesson');
    expect(state.lesson.phases).toHaveLength(1);
    expect(state.lesson.phases[0].sections).toHaveLength(1);
    expect(state.lesson.phases[0].sections[0].activities).toHaveLength(1);
    expect(state.errors).toHaveLength(0);
    expect(state.dirty).toBe(false);
  });

  it('adds a phase while preserving existing phase order and IDs', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const firstPhaseId = state.lesson.phases[0].id;

    const next = composerReducer(state, {
      type: 'ADD_PHASE',
      payload: { title: 'New Phase', phaseType: 'worked_example' },
    });

    expect(next.lesson.phases).toHaveLength(2);
    expect(next.lesson.phases[0].id).toBe(firstPhaseId);
    expect(next.lesson.phases[1].title).toBe('New Phase');
    expect(next.lesson.phases[1].sections).toHaveLength(0);
    expect(next.dirty).toBe(true);
  });

  it('removes a phase by id and re-normalizes the draft', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;

    const next = composerReducer(state, {
      type: 'REMOVE_PHASE',
      payload: { phaseId },
    });

    expect(next.lesson.phases).toHaveLength(0);
    expect(next.errors.length).toBeGreaterThan(0);
  });

  it('reorders phases without mutating arrays in place', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState({
      title: 'Ordered',
      phases: [
        { title: 'Phase A', sections: [{ title: 'S1', activities: [{ componentKey: 'graphing-explorer', props: {} }] }] },
        { title: 'Phase B', sections: [{ title: 'S2', activities: [{ componentKey: 'graphing-explorer', props: {} }] }] },
      ],
    });

    const originalIds = state.lesson.phases.map((p: { id: string }) => p.id);
    const next = composerReducer(state, {
      type: 'REORDER_PHASES',
      payload: { fromIndex: 0, toIndex: 1 },
    });

    expect(next.lesson.phases.map((p: { title: string }) => p.title)).toEqual(['Phase B', 'Phase A']);
    expect(next.lesson.phases.map((p: { id: string }) => p.id)).toEqual([originalIds[1], originalIds[0]]);
    expect(state.lesson.phases.map((p: { title: string }) => p.title)).toEqual(['Phase A', 'Phase B']);
  });

  it('adds a section to an existing phase', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;

    const next = composerReducer(state, {
      type: 'ADD_SECTION',
      payload: { phaseId, title: 'New Section' },
    });

    expect(next.lesson.phases[0].sections).toHaveLength(2);
    expect(next.lesson.phases[0].sections[1].title).toBe('New Section');
  });

  it('removes a section by id', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;
    const sectionId = state.lesson.phases[0].sections[0].id;

    const next = composerReducer(state, {
      type: 'REMOVE_SECTION',
      payload: { phaseId, sectionId },
    });

    expect(next.lesson.phases[0].sections).toHaveLength(0);
  });

  it('reorders sections within a phase', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState({
      title: 'Ordered',
      phases: [
        {
          title: 'P1',
          sections: [
            { title: 'Section A', activities: [{ componentKey: 'graphing-explorer', props: {} }] },
            { title: 'Section B', activities: [{ componentKey: 'graphing-explorer', props: {} }] },
          ],
        },
      ],
    });

    const phaseId = state.lesson.phases[0].id;
    const next = composerReducer(state, {
      type: 'REORDER_SECTIONS',
      payload: { phaseId, fromIndex: 0, toIndex: 1 },
    });

    expect(next.lesson.phases[0].sections.map((s: { title: string }) => s.title)).toEqual(['Section B', 'Section A']);
  });

  it('adds an activity to a section with a canonical component key', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;
    const sectionId = state.lesson.phases[0].sections[0].id;

    const next = composerReducer(state, {
      type: 'ADD_ACTIVITY',
      payload: {
        phaseId,
        sectionId,
        componentKey: 'comprehension-quiz',
        props: VALID_ACTIVITY_PROPS['comprehension-quiz'],
      },
    });

    expect(next.lesson.phases[0].sections[0].activities).toHaveLength(2);
    expect(next.lesson.phases[0].sections[0].activities[1].componentKey).toBe('comprehension-quiz');
  });

  it('rejects adding an activity with an unknown component key', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;
    const sectionId = state.lesson.phases[0].sections[0].id;

    const next = composerReducer(state, {
      type: 'ADD_ACTIVITY',
      payload: { phaseId, sectionId, componentKey: 'equation-solver', props: {} },
    });

    expect(next.errors.length).toBeGreaterThan(0);
    expect(next.errors.some((e: { message: string }) => e.message.includes('equation-solver'))).toBe(true);
    expect(next.lesson.phases[0].sections[0].activities).toHaveLength(1);
  });

  it('updates activity props and re-validates the config', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    const next = composerReducer(state, {
      type: 'UPDATE_ACTIVITY_PROPS',
      payload: {
        activityId,
        props: { equation: '' },
      },
    });

    expect(next.errors.length).toBeGreaterThan(0);
    expect(next.errors[0].path.length).toBeGreaterThan(0);
  });

  it('preserves nested activity props during reorder', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState({
      title: 'Reorder',
      phases: [
        {
          title: 'P1',
          sections: [
            {
              title: 'S1',
              activities: [
                { componentKey: 'graphing-explorer', props: { equation: 'x^2' } },
                { componentKey: 'comprehension-quiz', props: VALID_ACTIVITY_PROPS['comprehension-quiz'] },
              ],
            },
          ],
        },
      ],
    });

    const phaseId = state.lesson.phases[0].id;
    const sectionId = state.lesson.phases[0].sections[0].id;

    const next = composerReducer(state, {
      type: 'REORDER_ACTIVITIES',
      payload: { phaseId, sectionId, fromIndex: 0, toIndex: 1 },
    });

    const activities = next.lesson.phases[0].sections[0].activities;
    expect(activities[0].componentKey).toBe('comprehension-quiz');
    expect(activities[1].props.equation).toBe('x^2');
  });

  it('does not permit empty phases, sections, or activities', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;
    const sectionId = state.lesson.phases[0].sections[0].id;
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    const removedActivity = composerReducer(state, {
      type: 'REMOVE_ACTIVITY',
      payload: { phaseId, sectionId, activityId },
    });

    expect(removedActivity.errors.length).toBeGreaterThan(0);
  });
});

describe('schema-driven field derivation', () => {
  it('derives required string fields from getPropsSchema', async () => {
    const { deriveActivityFormFields } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const fields = deriveActivityFormFields('graphing-explorer');
    const fieldNames = fields.map((f: { name: string }) => f.name);

    expect(fieldNames).toContain('equation');
  });

  it('derives enum fields for canonical keys', async () => {
    const { deriveActivityFormFields } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const fields = deriveActivityFormFields('graphing-explorer');
    const variantField = fields.find((f: { name: string }) => f.name === 'variant');

    expect(variantField).toBeDefined();
    expect(variantField?.kind).toBe('enum');
    expect(variantField?.options).toContain('plot_from_equation');
  });

  it('derives nested array object fields for comprehension-quiz', async () => {
    const { deriveActivityFormFields } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const fields = deriveActivityFormFields('comprehension-quiz');
    const questionsField = fields.find((f: { name: string }) => f.name === 'questions');

    expect(questionsField).toBeDefined();
    expect(questionsField?.kind).toBe('array');
    expect(questionsField?.itemFields?.map((f: { name: string }) => f.name)).toContain('prompt');
    expect(questionsField?.itemFields?.map((f: { name: string }) => f.name)).toContain('correctAnswer');
  });

  it('derives object fields for rate-of-change-calculator', async () => {
    const { deriveActivityFormFields } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const fields = deriveActivityFormFields('rate-of-change-calculator');
    const fieldNames = fields.map((f: { name: string }) => f.name);

    expect(fieldNames).toContain('sourceType');
    expect(fieldNames).toContain('data');
    expect(fieldNames).toContain('interval');
  });

  it('fails closed for unknown or placeholder keys', async () => {
    const { deriveActivityFormFields } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    expect(() => deriveActivityFormFields('equation-solver')).toThrow();
    expect(() => deriveActivityFormFields('drag-drop-categorization')).toThrow();
    expect(() => deriveActivityFormFields('not-a-real-key')).toThrow();
  });

  it('does not mock or hard-code SCHEMA_REGISTRY', async () => {
    const { deriveActivityFormFields } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const fields = deriveActivityFormFields('fill-in-the-blank');
    const fieldNames = fields.map((f: { name: string }) => f.name);

    expect(fieldNames).toContain('template');
    expect(fieldNames).toContain('blanks');
  });
});

describe('validation and sanitization surfacing', () => {
  it('surfaces structured validation errors at field/path level', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    const next = composerReducer(state, {
      type: 'UPDATE_ACTIVITY_PROPS',
      payload: { activityId, props: { equation: 123 } },
    });

    expect(next.errors.length).toBeGreaterThan(0);
    expect(next.errors[0].componentKey).toBe('graphing-explorer');
    expect(next.errors[0].path).toContain('equation');
  });

  it('prevents save/preview/submit while validation errors exist', async () => {
    const { createComposerState, composerReducer, canSaveComposerState, canPreviewComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    const invalid = composerReducer(state, {
      type: 'UPDATE_ACTIVITY_PROPS',
      payload: { activityId, props: { equation: '' } },
    });

    expect(canSaveComposerState(invalid)).toBe(false);
    expect(canPreviewComposerState(invalid)).toBe(false);
  });

  it('leaves the prior valid draft intact when props are invalid', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    const next = composerReducer(state, {
      type: 'UPDATE_ACTIVITY_PROPS',
      payload: { activityId, props: { equation: '' } },
    });

    expect(next.lesson.phases[0].sections[0].activities[0].props.equation).toBe('x^2 + 3x - 4');
  });

  it('sanitizes unsafe authored free text before it reaches preview/save state', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    const next = composerReducer(state, {
      type: 'UPDATE_ACTIVITY_PROPS',
      payload: {
        activityId,
        props: { comparisonQuestion: '<script>alert(1)</script>Which?' },
      },
    });

    const text = JSON.stringify(next);
    expect(text).not.toContain('<script>');
    expect(text).not.toContain('onerror=');
    expect(text).not.toContain('javascript:');
    expect(text).toContain('Which?');
  });
});
