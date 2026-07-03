import { describe, it, expect } from 'vitest';

/**
 * Phase 4 adversarial — `toTeacherDraftPayload` deep-clone integrity.
 *
 * The Phase 4 thin composition adapter (`authoring-lifecycle.ts`) is the
 * single seam between the Phase 3 composer state and the Phase 2 handler
 * plus the Phase 3 preview surface. Its `toTeacherDraftPayload(state)`
 * contract has two non-negotiable invariants:
 *
 *   1. The returned payload's nested fields are independent of the
 *      composer's source `props`. A shallow `{...activity.props}` would
 *      alias nested objects/arrays, allowing downstream sanitization
 *      (in the handler) or future preview mutations to leak back into
 *      the composer's state — silently corrupting an in-flight draft.
 *   2. Mutating the returned payload's nested fields must NOT mutate
 *      the composer's source state. Otherwise an in-flight preview
 *      re-render or a future handler change could rewrite the draft
 *      a teacher is still editing.
 *
 * The implementation in commit 15e5154a uses `structuredClone(activity.props)`
 * to satisfy both. These tests pin that contract: if anyone reverts to a
 * shallow spread or returns the props reference directly, the tests fail
 * with a clear, isolated message.
 */

// NOTE: buildNestedPropsDraft() must return a fresh nested structure for
// every call. `normalizeLessonDraft` performs a SHALLOW copy of activity
// `props` (line 226 of authoring-model.ts: `{ ...rawProps }`), so
// `state.lesson.phases[i].sections[j].activities[k].props.questions`
// aliases the original `questions` array. Sharing a module-level constant
// across tests would let one test's mutation leak into the next test's
// "before" snapshot. Always rebuild the fixture inside the test.

function buildNestedPropsDraft() {
  return {
    title: 'Nested Props Lesson',
    phases: [
      {
        title: 'Explore',
        phaseType: 'explore',
        sections: [
          {
            title: 'Explore Section',
            activities: [
              {
                componentKey: 'comprehension-quiz',
                props: {
                  questions: [
                    {
                      id: 'q1',
                      prompt: 'What is the vertex form?',
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
        title: 'Worked Example',
        phaseType: 'worked_example',
        sections: [
          {
            title: 'Worked Section',
            activities: [
              {
                componentKey: 'step-by-step-solver',
                props: {
                  problemType: 'factoring',
                  equation: 'x^2 + 3x - 4 = 0',
                  steps: [
                    {
                      id: 's1',
                      description: 'Factor the quadratic.',
                      expression: 'x^2 + 3x - 4 = 0',
                    },
                  ],
                },
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

describe('Phase 4 adversarial: toTeacherDraftPayload deep-clone integrity', () => {
  it('mutating a NESTED field on the composer state after projection does NOT affect the returned payload', async () => {
    const { createComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );
    const { toTeacherDraftPayload } = await import(
      '../../../../lib/teacher/content-authoring/authoring-lifecycle'
    );

    const state = createComposerState(buildNestedPropsDraft());
    const payload = toTeacherDraftPayload(state);

    // Snapshot the nested field BEFORE the composer mutation.
    const nestedBefore =
      payload.phases[0].sections[0].activities[0].props.questions[0].prompt;
    expect(nestedBefore).toBe('What is the vertex form?');

    // Mutate the NESTED field on the composer's source state. If the
    // adapter shallow-copied (`{...props}` or returned the reference),
    // the payload's nested field would also change because arrays and
    // objects inside `props` would be aliased.
    state.lesson.phases[0].sections[0].activities[0].props.questions[0].prompt =
      'INJECTED-AFTER-PROJECTION';

    const nestedAfter =
      payload.phases[0].sections[0].activities[0].props.questions[0].prompt;
    expect(nestedAfter).toBe('What is the vertex form?');
  });

  it('mutating a NESTED array on the composer state after projection does NOT affect the returned payload', async () => {
    const { createComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );
    const { toTeacherDraftPayload } = await import(
      '../../../../lib/teacher/content-authoring/authoring-lifecycle'
    );

    const state = createComposerState(buildNestedPropsDraft());
    const payload = toTeacherDraftPayload(state);

    const stepsBefore = payload.phases[1].sections[0].activities[0].props.steps;
    expect(Array.isArray(stepsBefore)).toBe(true);
    expect((stepsBefore as unknown[]).length).toBe(1);

    // Replace the entire nested array on the source.
    state.lesson.phases[1].sections[0].activities[0].props.steps = [
      {
        id: 's2-injected',
        description: 'INJECTED step after projection',
        expression: 'different',
      },
    ];

    const stepsAfter = payload.phases[1].sections[0].activities[0].props.steps;
    expect((stepsAfter as unknown[]).length).toBe(1);
    expect((stepsAfter as Array<{ id: string }>)[0].id).toBe('s1');
  });

  it('mutating a NESTED field on the returned payload does NOT affect the composer state', async () => {
    const { createComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );
    const { toTeacherDraftPayload } = await import(
      '../../../../lib/teacher/content-authoring/authoring-lifecycle'
    );

    const state = createComposerState(buildNestedPropsDraft());
    const payload = toTeacherDraftPayload(state);

    const composerPromptBefore =
      state.lesson.phases[0].sections[0].activities[0].props.questions[0].prompt;
    expect(composerPromptBefore).toBe('What is the vertex form?');

    // Simulate a future preview re-render or handler sanitization
    // rewriting a nested prop on the returned payload.
    payload.phases[0].sections[0].activities[0].props.questions[0].prompt =
      'MUTATED-BY-PREVIEW';

    const composerPromptAfter =
      state.lesson.phases[0].sections[0].activities[0].props.questions[0].prompt;
    expect(composerPromptAfter).toBe('What is the vertex form?');
  });

  it('mutating a NESTED array on the returned payload does NOT affect the composer state', async () => {
    const { createComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );
    const { toTeacherDraftPayload } = await import(
      '../../../../lib/teacher/content-authoring/authoring-lifecycle'
    );

    const state = createComposerState(buildNestedPropsDraft());
    const payload = toTeacherDraftPayload(state);

    // Push a new step onto the payload's nested array — if the adapter
    // shallow-copied, this would leak into the composer's source state.
    (payload.phases[1].sections[0].activities[0].props.steps as Array<unknown>).push({
      id: 'injected-step',
      description: 'injected via payload',
      expression: '0',
    });

    const composerSteps = state.lesson.phases[1].sections[0].activities[0].props.steps;
    expect(Array.isArray(composerSteps)).toBe(true);
    expect((composerSteps as unknown[]).length).toBe(1);
    expect((composerSteps as Array<{ id: string }>)[0].id).toBe('s1');
  });

  it('repeated projections are independent — payload A mutating its nested props does not bleed into payload B', async () => {
    const { createComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );
    const { toTeacherDraftPayload } = await import(
      '../../../../lib/teacher/content-authoring/authoring-lifecycle'
    );

    const state = createComposerState(buildNestedPropsDraft());
    const payloadA = toTeacherDraftPayload(state);
    const payloadB = toTeacherDraftPayload(state);

    payloadA.phases[0].sections[0].activities[0].props.questions[0].prompt =
      'MUTATED-IN-A';

    expect(payloadB.phases[0].sections[0].activities[0].props.questions[0].prompt).toBe(
      'What is the vertex form?',
    );
  });

  it('every nested props object across all activities is independent of the composer state', async () => {
    const { createComposerState } = await import(
      '../../../../lib/teacher/content-authoring/composer-state'
    );
    const { toTeacherDraftPayload } = await import(
      '../../../../lib/teacher/content-authoring/authoring-lifecycle'
    );

    const state = createComposerState(buildNestedPropsDraft());
    const payload = toTeacherDraftPayload(state);

    // Mutate EVERY nested props reference on the composer state.
    state.lesson.phases[0].sections[0].activities[0].props.questions = [];
    state.lesson.phases[1].sections[0].activities[0].props.steps = [];
    state.lesson.phases[2].sections[0].activities[0].props.blanks = [];

    // Payload must still carry the original nested arrays — every one
    // of them must have been deep-cloned, not aliased.
    expect(
      (payload.phases[0].sections[0].activities[0].props.questions as unknown[]).length,
    ).toBe(1);
    expect(
      (payload.phases[1].sections[0].activities[0].props.steps as unknown[]).length,
    ).toBe(1);
    expect(
      (payload.phases[2].sections[0].activities[0].props.blanks as unknown[]).length,
    ).toBe(1);
  });
});