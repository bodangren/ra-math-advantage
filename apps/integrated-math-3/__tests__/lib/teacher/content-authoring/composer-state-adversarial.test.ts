import { describe, it, expect } from 'vitest';

/**
 * Phase 3 — Composer state adversarial tests.
 *
 * These tests probe boundary/failure-path cases in the composer reducer
 * that the Phase 3 green tests deliberately leave to this adversarial
 * pass:
 *
 *  - Removing the last phase/section/activity gates save/preview
 *    cleanly (canSave === false, canPreview === false) so the UI
 *    disables save/preview on an empty draft.
 *  - REORDER past array bounds is a safe no-op (no throw, no mutation)
 *    so a malformed call from a stale UI cannot corrupt the tree.
 *  - REORDER / ADD_ACTIVITY never introduce duplicate activity ids
 *    within a section (id uniqueness is a Phase 2 hashing invariant).
 *  - An ADD_ACTIVITY with a placeholder key
 *    (`equation-solver` / `drag-drop-categorization`) is rejected at
 *    the reducer boundary and recorded as a structured error bound to
 *    the offending key.
 *  - UPDATE_ACTIVITY_PROPS that violates the canonical Zod schema
 *    BLOCKS the save path: `canSaveComposerState` returns false AND
 *    the offending activity's prior valid props are kept (no silent
 *    strip-to-pass).
 *  - Save payload is built from the live reducer state (sanitized +
 *    schema-valid props only) — never from raw user input.
 *  - sanitizeComposerState preserves the structural identity of the
 *    tree (phase ids / section ids / activity ids stable) so downstream
 *    Phase 2 hashing sees the same node ids as the un-sanitized draft.
 */

const VALID_ACTIVITY_PROPS: Record<string, Record<string, unknown>> = {
  'graphing-explorer': { equation: 'x^2 + 3x - 4' },
  'comprehension-quiz': {
    questions: [
      {
        id: 'q1',
        prompt: 'What is the vertex form of a quadratic?',
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

function buildTwoPhaseDraft() {
  return {
    title: 'Two-phase',
    phases: [
      {
        title: 'P1',
        phaseType: 'explore',
        sections: [
          {
            title: 'S1',
            activities: [
              { componentKey: 'graphing-explorer', props: VALID_ACTIVITY_PROPS['graphing-explorer'] },
            ],
          },
        ],
      },
      {
        title: 'P2',
        phaseType: 'worked_example',
        sections: [
          {
            title: 'S2',
            activities: [
              { componentKey: 'comprehension-quiz', props: VALID_ACTIVITY_PROPS['comprehension-quiz'] },
            ],
          },
        ],
      },
    ],
  };
}

describe('Phase 3 adversarial: empty-state gates', () => {
  it('removing the last phase blocks both save and preview', async () => {
    const { createComposerState, composerReducer, canSaveComposerState, canPreviewComposerState } =
      await import('../../../../lib/teacher/content-authoring/composer-state');

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;

    const next = composerReducer(state, {
      type: 'REMOVE_PHASE',
      payload: { phaseId },
    });

    expect(next.lesson.phases).toHaveLength(0);
    expect(canSaveComposerState(next)).toBe(false);
    expect(canPreviewComposerState(next)).toBe(false);
    expect(next.errors.length).toBeGreaterThan(0);
  });

  it('removing the last section from a phase blocks both save and preview', async () => {
    const { createComposerState, composerReducer, canSaveComposerState, canPreviewComposerState } =
      await import('../../../../lib/teacher/content-authoring/composer-state');

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;
    const sectionId = state.lesson.phases[0].sections[0].id;

    const next = composerReducer(state, {
      type: 'REMOVE_SECTION',
      payload: { phaseId, sectionId },
    });

    expect(next.lesson.phases[0].sections).toHaveLength(0);
    expect(canSaveComposerState(next)).toBe(false);
    expect(canPreviewComposerState(next)).toBe(false);
  });

  it('removing the last activity from a section blocks both save and preview', async () => {
    const { createComposerState, composerReducer, canSaveComposerState, canPreviewComposerState } =
      await import('../../../../lib/teacher/content-authoring/composer-state');

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;
    const sectionId = state.lesson.phases[0].sections[0].id;
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    const next = composerReducer(state, {
      type: 'REMOVE_ACTIVITY',
      payload: { phaseId, sectionId, activityId },
    });

    expect(next.lesson.phases[0].sections[0].activities).toHaveLength(0);
    expect(canSaveComposerState(next)).toBe(false);
    expect(canPreviewComposerState(next)).toBe(false);
  });

  it('a fresh empty composer state (zero phases) cannot be saved or previewed', async () => {
    const { createComposerState, canSaveComposerState, canPreviewComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState({});
    expect(state.lesson.phases).toHaveLength(0);
    expect(canSaveComposerState(state)).toBe(false);
    expect(canPreviewComposerState(state)).toBe(false);
  });
});

describe('Phase 3 adversarial: reducer robustness', () => {
  it('REORDER_PHASES with an out-of-bounds fromIndex is a safe no-op', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildTwoPhaseDraft());
    const originalIds = state.lesson.phases.map((p) => p.id);

    // From index beyond end (-1 or +N) must not throw and must not mutate
    // the original state or the order.
    const nextNeg = composerReducer(state, {
      type: 'REORDER_PHASES',
      payload: { fromIndex: -1, toIndex: 0 },
    });
    expect(nextNeg.lesson.phases.map((p) => p.id)).toEqual(originalIds);

    const nextLarge = composerReducer(state, {
      type: 'REORDER_PHASES',
      payload: { fromIndex: 99, toIndex: 0 },
    });
    expect(nextLarge.lesson.phases.map((p) => p.id)).toEqual(originalIds);
    // The pre-existing state must remain untouched.
    expect(state.lesson.phases.map((p) => p.id)).toEqual(originalIds);
  });

  it('REORDER_PHASES with an out-of-bounds toIndex is a safe no-op', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildTwoPhaseDraft());
    const originalIds = state.lesson.phases.map((p) => p.id);

    const next = composerReducer(state, {
      type: 'REORDER_PHASES',
      payload: { fromIndex: 0, toIndex: 99 },
    });
    expect(next.lesson.phases.map((p) => p.id)).toEqual(originalIds);
  });

  it('REORDER_ACTIVITIES keeps section activity ids unique after reordering', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState({
      title: 'Multi-activity',
      phases: [
        {
          title: 'P1',
          phaseType: 'explore',
          sections: [
            {
              title: 'S1',
              activities: [
                { componentKey: 'graphing-explorer', props: { equation: 'x^2' } },
                { componentKey: 'comprehension-quiz', props: VALID_ACTIVITY_PROPS['comprehension-quiz'] },
                { componentKey: 'fill-in-the-blank', props: VALID_ACTIVITY_PROPS['fill-in-the-blank'] },
              ],
            },
          ],
        },
      ],
    });

    const phaseId = state.lesson.phases[0].id;
    const sectionId = state.lesson.phases[0].sections[0].id;
    const beforeIds = state.lesson.phases[0].sections[0].activities.map((a) => a.id);

    // Cycle: move first -> last, then last -> middle, then middle -> first.
    let next = composerReducer(state, {
      type: 'REORDER_ACTIVITIES',
      payload: { phaseId, sectionId, fromIndex: 0, toIndex: 2 },
    });
    let afterIds = next.lesson.phases[0].sections[0].activities.map((a) => a.id);
    expect(new Set(afterIds).size).toBe(afterIds.length);
    expect(afterIds.length).toBe(beforeIds.length);

    next = composerReducer(next, {
      type: 'REORDER_ACTIVITIES',
      payload: { phaseId, sectionId, fromIndex: 2, toIndex: 1 },
    });
    afterIds = next.lesson.phases[0].sections[0].activities.map((a) => a.id);
    expect(new Set(afterIds).size).toBe(afterIds.length);

    next = composerReducer(next, {
      type: 'REORDER_ACTIVITIES',
      payload: { phaseId, sectionId, fromIndex: 1, toIndex: 0 },
    });
    afterIds = next.lesson.phases[0].sections[0].activities.map((a) => a.id);
    expect(new Set(afterIds).size).toBe(afterIds.length);
    // The original state must remain untouched.
    expect(state.lesson.phases[0].sections[0].activities.map((a) => a.id)).toEqual(beforeIds);
  });

  it('ADD_ACTIVITY always emits a fresh id; no duplicate activity ids within a section', async () => {
    const { createComposerState, composerReducer } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const phaseId = state.lesson.phases[0].id;
    const sectionId = state.lesson.phases[0].sections[0].id;

    let next = state;
    for (let i = 0; i < 5; i += 1) {
      next = composerReducer(next, {
        type: 'ADD_ACTIVITY',
        payload: {
          phaseId,
          sectionId,
          componentKey: 'graphing-explorer',
          props: { equation: `x^${i}` },
        },
      });
    }
    const ids = next.lesson.phases[0].sections[0].activities.map((a) => a.id);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  });

  it('rejects ADD_ACTIVITY with placeholder key drag-drop-categorization with a structured error bound to the key', async () => {
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
        componentKey: 'drag-drop-categorization',
        props: {},
      },
    });

    // Activity list is unchanged (no phantom insertion).
    expect(next.lesson.phases[0].sections[0].activities).toHaveLength(1);
    // The error is bound to the offending key so the UI can render a
    // targeted message rather than a generic "invalid".
    const offending = next.errors.find(
      (e: { componentKey?: string; message: string }) =>
        e.componentKey === 'drag-drop-categorization',
    );
    expect(offending).toBeDefined();
    expect(offending!.message).toContain('drag-drop-categorization');
  });

  it('rejects ADD_ACTIVITY with placeholder key equation-solver with a structured error bound to the key', async () => {
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
        componentKey: 'equation-solver',
        props: { equation: '2+2' },
      },
    });

    expect(next.lesson.phases[0].sections[0].activities).toHaveLength(1);
    const offending = next.errors.find(
      (e: { componentKey?: string; message: string }) =>
        e.componentKey === 'equation-solver',
    );
    expect(offending).toBeDefined();
  });
});

describe('Phase 3 adversarial: schema-driven save gating', () => {
  it('UPDATE_ACTIVITY_PROPS with a schema-invalid value BLOCKS save AND preserves the prior valid props', async () => {
    const { createComposerState, composerReducer, canSaveComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    // graphing-explorer requires equation: z.string().min(1).
    // Empty string is schema-invalid.
    const next = composerReducer(state, {
      type: 'UPDATE_ACTIVITY_PROPS',
      payload: { activityId, props: { equation: '' } },
    });

    expect(canSaveComposerState(next)).toBe(false);
    // The prior valid `equation` is preserved verbatim (no silent strip-to-pass).
    expect(next.lesson.phases[0].sections[0].activities[0].props.equation).toBe('x^2 + 3x - 4');
  });

  it('UPDATE_ACTIVITY_PROPS with the wrong type for a schema field BLOCKS save with a structured path error', async () => {
    const { createComposerState, composerReducer, canSaveComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    // graphing-explorer.equation must be a string; a number is wrong type.
    const next = composerReducer(state, {
      type: 'UPDATE_ACTIVITY_PROPS',
      payload: { activityId, props: { equation: 123 } },
    });

    expect(canSaveComposerState(next)).toBe(false);
    const offending = next.errors.find(
      (e: { componentKey?: string; path: string[]; message: string }) =>
        e.componentKey === 'graphing-explorer' && e.path.includes('equation'),
    );
    expect(offending).toBeDefined();
  });

  it('UPDATE_ACTIVITY_PROPS with cross-key props (comprehension-quiz questions on graphing-explorer) BLOCKS save', async () => {
    const { createComposerState, composerReducer, canSaveComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildMinimalDraft());
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    // graphing-explorer schema is `.strict()` so cross-key props fail validation.
    const next = composerReducer(state, {
      type: 'UPDATE_ACTIVITY_PROPS',
      payload: {
        activityId,
        props: {
          equation: 'x^2',
          questions: [{ id: 'q1', prompt: 'p', correctAnswer: 'a' }],
        },
      },
    });

    expect(canSaveComposerState(next)).toBe(false);
  });

  it('sanitizeComposerState yields a tree whose every activity validates against the canonical schema', async () => {
    const { createComposerState, composerReducer, sanitizeComposerState, canSaveComposerState } =
      await import('../../../../lib/teacher/content-authoring/composer-state');

    const state = createComposerState(buildTwoPhaseDraft());
    const activityId = state.lesson.phases[0].sections[0].activities[0].id;

    // Authoring text containing executable markup. Sanitizer must strip
    // it before the save payload reaches Phase 2 hashing.
    const dirty = composerReducer(state, {
      type: 'UPDATE_ACTIVITY_PROPS',
      payload: {
        activityId,
        props: {
          equation: 'y = x^2',
          comparisonQuestion:
            '<script>alert(1)</script>Which? <img src=x onerror=alert(2)> Pick the <a href="javascript:alert(3)">first</a>.',
        },
      },
    });

    expect(canSaveComposerState(dirty)).toBe(true);
    const sanitized = sanitizeComposerState(dirty);
    const json = JSON.stringify(sanitized);
    expect(json).not.toContain('<script>');
    expect(json).not.toContain('onerror=');
    expect(json).not.toContain('javascript:');
    // The preserved math notation and the meaningful text are intact.
    expect(json).toContain('Which?');
    expect(json).toContain('Pick the');
    expect(json).toContain('first');
  });

  it('sanitizeComposerState preserves structural ids so Phase 2 hashing is stable', async () => {
    const { createComposerState, sanitizeComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );

    const state = createComposerState(buildTwoPhaseDraft());
    const beforePhaseIds = state.lesson.phases.map((p) => p.id);
    const beforeSectionIds = state.lesson.phases.flatMap((p) => p.sections.map((s) => s.id));
    const beforeActivityIds = state.lesson.phases.flatMap((p) =>
      p.sections.flatMap((s) => s.activities.map((a) => a.id)),
    );

    const sanitized = sanitizeComposerState(state);
    const afterPhaseIds = sanitized.lesson.phases.map((p) => p.id);
    const afterSectionIds = sanitized.lesson.phases.flatMap((p) => p.sections.map((s) => s.id));
    const afterActivityIds = sanitized.lesson.phases.flatMap((p) =>
      p.sections.flatMap((s) => s.activities.map((a) => a.id)),
    );

    expect(afterPhaseIds).toEqual(beforePhaseIds);
    expect(afterSectionIds).toEqual(beforeSectionIds);
    expect(afterActivityIds).toEqual(beforeActivityIds);
  });
});