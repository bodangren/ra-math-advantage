import { describe, it, expect } from 'vitest';

const VALID_PROPS_BY_KEY: Record<string, Record<string, unknown>> = {
  'graphing-explorer': {
    equation: 'x^2 + 3x - 4',
  },
  'step-by-step-solver': {
    problemType: 'factoring',
    equation: 'x^2 + 3x - 4 = 0',
    steps: [
      {
        id: 's1',
        description: 'Set up',
        expression: 'x^2 + 3x - 4 = 0',
      },
    ],
  },
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
  'discriminant-analyzer': {
    equation: 'x^2 + 3x - 4 = 0',
  },
};

describe('validateActivityConfig', () => {
  it('accepts valid configs for each canonical activity key', async () => {
    const { validateActivityConfig } = await import(
      '../../../lib/teacher/content-authoring/activity-config-validation'
    );

    for (const [key, props] of Object.entries(VALID_PROPS_BY_KEY)) {
      const result = validateActivityConfig(key, props);
      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error(`Expected ${key} to pass: ${JSON.stringify(result.errors)}`);
      }
    }
  });

  it('rejects a config missing a required field with structured error', async () => {
    const { validateActivityConfig } = await import(
      '../../../lib/teacher/content-authoring/activity-config-validation'
    );

    const result = validateActivityConfig('graphing-explorer', {});

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].componentKey).toBe('graphing-explorer');
    expect(result.errors[0].path.length).toBeGreaterThan(0);
    expect(result.errors[0].message.length).toBeGreaterThan(0);
  });

  it('rejects empty arrays where the schema disallows them', async () => {
    const { validateActivityConfig } = await import(
      '../../../lib/teacher/content-authoring/activity-config-validation'
    );

    const result = validateActivityConfig('comprehension-quiz', { questions: [] });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.some((e: { path: string[] }) => e.path.includes('questions'))).toBe(true);
  });

  it('rejects a valid props object paired with the wrong component key', async () => {
    const { validateActivityConfig } = await import(
      '../../../lib/teacher/content-authoring/activity-config-validation'
    );

    const quizProps = VALID_PROPS_BY_KEY['comprehension-quiz'];
    const result = validateActivityConfig('graphing-explorer', quizProps);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors[0].componentKey).toBe('graphing-explorer');
  });

  it('rejects placeholder keys with no schema', async () => {
    const { validateActivityConfig } = await import(
      '../../../lib/teacher/content-authoring/activity-config-validation'
    );

    for (const key of ['equation-solver', 'drag-drop-categorization']) {
      const result = validateActivityConfig(key, {});
      expect(result.success).toBe(false);
      if (result.success) continue;
      expect(result.errors[0].componentKey).toBe(key);
      expect(result.errors[0].message.toLowerCase()).toContain('schema');
    }
  });

  it('rejects an unknown component key', async () => {
    const { validateActivityConfig } = await import(
      '../../../lib/teacher/content-authoring/activity-config-validation'
    );

    const result = validateActivityConfig('not-a-real-key', { equation: 'x' });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors[0].componentKey).toBe('not-a-real-key');
  });

  it('does not mutate the input props object', async () => {
    const { validateActivityConfig } = await import(
      '../../../lib/teacher/content-authoring/activity-config-validation'
    );

    const props = { equation: 'x^2' };
    const before = JSON.stringify(props);
    validateActivityConfig('graphing-explorer', props);
    expect(JSON.stringify(props)).toBe(before);
  });
});
