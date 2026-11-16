import { describe, expect, it } from 'vitest';

import { polynomialEquationEndBehaviorSchema } from '@math-platform/math-content/schemas';
import { generateTopic16EquationEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import { seedLesson1_6 } from '@/convex/seed/seed_lesson_1_6';
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type Row = Record<string, unknown> & { _id: string };

const TARGET_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
] as const;
const AUTHORITY_KEYS = new Set([
  'answer',
  'answerKey',
  'correctAnswer',
  'correctAnswers',
  'expectedAnswer',
  'grading',
  'gradingMetadata',
  'isCorrect',
  'maxScore',
  'normalizedAnswer',
  'score',
  'solution',
  'solutionSteps',
  'steps',
  'finalAnswer',
  'authority',
]);
const DESCRIPTION = 'Determine the left and right polynomial end behavior from equations.';

function collectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, keys));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, nested]) => {
    keys.push(key);
    collectKeys(nested, keys);
  });
  return keys;
}

function expectNoAuthority(value: unknown): void {
  expect(collectKeys(value).filter((key) => AUTHORITY_KEYS.has(key))).toEqual([]);
}

function getHandler() {
  const handler = Reflect.get(seedLesson1_6, '_handler');
  if (typeof handler !== 'function') throw new Error('seedLesson1_6 must expose its handler.');
  return handler as (context: { db: Record<string, unknown> }, args: Record<string, never>) => Promise<unknown>;
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    lessons: [],
    lesson_versions: [],
    phase_versions: [],
    phase_sections: [],
    activities: [],
  };
  const inserts: Array<{ table: string; document: Row }> = [];
  const patches: Array<{ id: string; document: Record<string, unknown> }> = [];

  const db = {
    query: (table: string) => ({
      withIndex: (
        _indexName: string,
        configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
      ) => {
        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        configure(index);
        const select = () => (rows[table] ?? []).filter((row) => (
          [...conditions].every(([field, value]) => row[field] === value)
        ));
        return {
          first: async () => select()[0] ?? null,
          unique: async () => {
            const matches = select();
            if (matches.length > 1) throw new Error(`Duplicate ${table} rows`);
            return matches[0] ?? null;
          },
        };
      },
    }),
    insert: async (table: string, document: Record<string, unknown>) => {
      const tableRows = rows[table] ?? (rows[table] = []);
      const row = { _id: `${table}:${tableRows.length + 1}`, ...document };
      tableRows.push(row);
      inserts.push({ table, document: row });
      return row._id;
    },
    patch: async (id: string, document: Record<string, unknown>) => {
      const row = Object.values(rows).flat().find((candidate) => candidate._id === id);
      if (!row) throw new Error(`Unknown patch target ${id}`);
      Object.assign(row, document);
      patches.push({ id, document });
    },
  };

  return { context: { db }, inserts, patches, rows };
}

function rowsForIds(rows: Row[], ids: readonly string[]): Row[] {
  return rows.filter((row) => ids.includes(row.stableActivityId as string));
}

describe('Precalculus Topic 1.6 equation-end-behavior activity seed', () => {
  it('seeds exact generated modes and patches them without phase attachment', async () => {
    const harness = createHarness();
    const handler = getHandler();
    const firstResult = await handler(harness.context, {});
    const firstRows = rowsForIds(harness.rows.activities, TARGET_ACTIVITY_IDS);

    expect(firstRows).toHaveLength(3);
    expect((firstResult as { activitiesCreated: number }).activitiesCreated).toBe(3);
    expect(harness.rows.activities).toHaveLength(3);
    expect(firstRows.map((row) => row.stableActivityId)).toEqual(TARGET_ACTIVITY_IDS);
    expect(new Set(firstRows.map((row) => row.stableActivityId)).size).toBe(3);
    expect(harness.inserts.filter(({ table, document }) => (
      table === 'activities' && TARGET_ACTIVITY_IDS.includes(
        document.stableActivityId as typeof TARGET_ACTIVITY_IDS[number],
      )
    ))).toHaveLength(3);

    const expectedModes = [
      ['worked', 0, 'worked_example', PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG],
      ['guided', 1, 'guided_practice', PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG],
      ['independent', 2, 'independent_practice', PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG],
    ] as const;

    for (const [mode, seed, presentationMode, gradingConfig] of expectedModes) {
      const row = firstRows[seed]!;
      const output = generateTopic16EquationEndBehaviorOutput(seed);
      const publicProps = output.data.rendererProps as Record<string, unknown>;
      const props = mode === 'worked'
        ? {
            ...publicProps,
            presentationMode: 'worked_example',
            correctAnswers: output.expectedAnswer,
            steps: output.solutionSteps.map((step) => step.description),
            finalAnswer: 'The six polynomial end behaviors are shown above.',
          }
        : mode === 'guided'
          ? {
              ...publicProps,
              presentationMode: 'guided_practice',
              guidedSteps: [
                'Identify the leading term for each polynomial.',
                'Use degree parity and the leading coefficient.',
                'Record whether each left and right end goes up or down.',
              ],
              fieldHelp: 'Choose Up or Down for the left and right end of each polynomial.',
            }
          : publicProps;

      expect(row).toMatchObject({
        stableActivityId: TARGET_ACTIVITY_IDS[seed],
        componentKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
        displayName: `${mode === 'worked' ? 'Worked Example' : mode === 'guided' ? 'Guided Practice' : 'Independent Practice'}: Polynomial Equation End Behavior`,
        description: DESCRIPTION,
        gradingConfig,
      });
      expect(row.props).toEqual(props);
      expect(polynomialEquationEndBehaviorSchema.safeParse(row.props).success).toBe(true);
      expect((row.props as Record<string, unknown>).presentationMode).toBe(presentationMode);
      if (mode !== 'worked') expectNoAuthority(row.props);
    }

    const firstDocumentIds = firstRows.map((row) => row._id);
    const firstCreatedAt = firstRows.map((row) => row.createdAt);
    const secondResult = await handler(harness.context, {});
    const secondRows = rowsForIds(harness.rows.activities, TARGET_ACTIVITY_IDS);

    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(secondRows.map((row) => row._id)).toEqual(firstDocumentIds);
    expect(secondRows.map((row) => row.createdAt)).toEqual(firstCreatedAt);
    expect(harness.inserts.filter(({ table, document }) => (
      table === 'activities' && TARGET_ACTIVITY_IDS.includes(
        document.stableActivityId as typeof TARGET_ACTIVITY_IDS[number],
      )
    ))).toHaveLength(3);
    expect(harness.patches.filter(({ id }) => firstDocumentIds.includes(id))).toHaveLength(3);
    expect(harness.patches
      .filter(({ id }) => firstDocumentIds.includes(id))
      .every(({ document }) => !Object.hasOwn(document, 'createdAt'))).toBe(true);

    expect(harness.rows.activities.filter((row) => !TARGET_ACTIVITY_IDS.includes(
      row.stableActivityId as typeof TARGET_ACTIVITY_IDS[number],
    ))).toHaveLength(0);
    expect(harness.rows.phase_versions).toHaveLength(7);
    expect(harness.rows.phase_sections).toHaveLength(7);
    const targetPhysicalIds = new Set(firstDocumentIds);
    const phaseReferences = harness.rows.phase_sections.filter((row) => {
      const activityId = (row.content as Record<string, unknown> | undefined)?.activityId;
      return TARGET_ACTIVITY_IDS.includes(activityId as typeof TARGET_ACTIVITY_IDS[number])
        || targetPhysicalIds.has(activityId as string);
    });
    expect(phaseReferences).toHaveLength(0);
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toContain(
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
    );
  });
});
