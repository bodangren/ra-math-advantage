import { describe, expect, it } from 'vitest';

import { polynomialInequalitySignChartSchema } from '@math-platform/math-content';
import { generateTopic15PolynomialInequalityOutput } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import { seedLesson1_5 } from '@/convex/seed/seed_lesson_1_5';
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type Row = Record<string, unknown> & { _id: string };

const TARGET_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
] as const;

const EXAMPLE_1_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
] as const;
const EXAMPLE_2_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
] as const;
const EXAMPLE_1_AND_2_ACTIVITY_IDS = new Set<string>([
  ...EXAMPLE_1_ACTIVITY_IDS,
  ...EXAMPLE_2_ACTIVITY_IDS,
]);

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

function expectNoAuthority(value: unknown, path: string[] = []): void {
  if (Array.isArray(value)) {
    value.forEach((item) => expectNoAuthority(item, path));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    const isInstructionalFieldHelp = path.length === 1
      && path[0] === 'fieldHelp'
      && key === 'solution';
    if (!isInstructionalFieldHelp) expect(AUTHORITY_KEYS).not.toContain(key);
    expectNoAuthority(nested, [...path, key]);
  }
}

function getHandler() {
  const handler = Reflect.get(seedLesson1_5, '_handler');
  if (typeof handler !== 'function') throw new Error('seedLesson1_5 must expose its handler.');
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

describe('Precalculus Topic 1.5 polynomial-inequality activity seed', () => {
  it('seeds exact generated modes and patches them without phase attachment', async () => {
    const harness = createHarness();
    const handler = getHandler();
    const firstResult = await handler(harness.context, {});
    const firstRows = rowsForIds(harness.rows.activities, TARGET_ACTIVITY_IDS);

    expect(firstRows).toHaveLength(3);
    expect((firstResult as { activitiesCreated: number }).activitiesCreated).toBe(9);
    expect(harness.rows.activities).toHaveLength(9);
    expect(firstRows.map((row) => row.stableActivityId)).toEqual(TARGET_ACTIVITY_IDS);
    expect(new Set(harness.rows.activities
      .map((row) => row.stableActivityId)
      .filter((stableActivityId): stableActivityId is string => typeof stableActivityId === 'string')).size)
      .toBe(harness.rows.activities.filter((row) => typeof row.stableActivityId === 'string').length);
    expect(harness.inserts.filter(({ table, document }) => (
      table === 'activities' && TARGET_ACTIVITY_IDS.includes(
        document.stableActivityId as typeof TARGET_ACTIVITY_IDS[number],
      )
    ))).toHaveLength(3);

    const expectedModes = [
      ['worked', 0, 'worked_example', PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG],
      ['guided', 1, 'guided_practice', PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG],
      ['independent', 2, 'independent_practice', PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG],
    ] as const;

    for (const [mode, seed, presentationMode, gradingConfig] of expectedModes) {
      const row = firstRows[seed]!;
      const props = row.props as Record<string, unknown>;
      const output = generateTopic15PolynomialInequalityOutput(seed);
      const publicProps = (output.data as { rendererProps: Record<string, unknown> }).rendererProps;

      expect(row).toMatchObject({
        stableActivityId: TARGET_ACTIVITY_IDS[seed],
        componentKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
        description: 'Find the real zeros, test the sign on each interval, and write the solution to a polynomial inequality in interval notation.',
        gradingConfig,
      });
      expect(polynomialInequalitySignChartSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);

      if (mode === 'worked') {
        expect(row.displayName).toBe('Worked Example: Polynomial Inequality Sign Chart');
        expect(props).toEqual({
          ...publicProps,
          presentationMode: 'worked_example',
          correctAnswers: output.expectedAnswer,
          steps: output.solutionSteps.map((step) => step.description),
          finalAnswer: 'The solution is (-4, -1) ∪ (3, ∞).',
        });
      } else if (mode === 'guided') {
        expect(row.displayName).toBe('Guided Practice: Polynomial Inequality Sign Chart');
        expect(props).toEqual({
          ...publicProps,
          presentationMode: 'guided_practice',
          guidedSteps: [
            'Find and sort the distinct real roots.',
            'Test one value in each interval and record the sign.',
            'Use the inequality operator to write the interval union.',
          ],
          fieldHelp: {
            roots: 'Enter the sorted distinct real roots.',
            intervalSigns: 'Enter one sign for each interval from left to right.',
            solution: 'Write the solution as an interval union.',
          },
        });
        expectNoAuthority(props);
      } else {
        expect(row.displayName).toBe('Independent Practice: Polynomial Inequality Sign Chart');
        expect(props).toEqual(publicProps);
        expectNoAuthority(props);
      }
    }

    const firstDocumentIds = firstRows.map((row) => row._id);
    const firstCreatedAt = firstRows.map((row) => row.createdAt);
    const secondResult = await handler(harness.context, {});
    const secondRows = rowsForIds(harness.rows.activities, TARGET_ACTIVITY_IDS);
    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(secondRows).toHaveLength(3);
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

    expect(rowsForIds(harness.rows.activities, EXAMPLE_1_ACTIVITY_IDS)).toHaveLength(3);
    expect(rowsForIds(harness.rows.activities, EXAMPLE_2_ACTIVITY_IDS)).toHaveLength(3);
    expect(harness.rows.phase_versions).toHaveLength(7);
    expect(harness.rows.phase_versions.map((row) => row.title)).toEqual([
      'Explore',
      'Vocabulary',
      'Learn',
      'Worked Example',
      'Guided Practice',
      'Independent Practice',
      'Reflection',
    ]);
    expect(harness.rows.phase_sections).toHaveLength(7);
    expect(harness.rows.phase_sections.map((row) => row.sectionType)).toEqual(Array(7).fill('text'));

    const targetDocumentIds = new Set(firstDocumentIds);
    const phaseReferences = harness.rows.phase_sections.filter((row) => {
      const activityId = (row.content as Record<string, unknown> | undefined)?.activityId;
      return TARGET_ACTIVITY_IDS.includes(activityId as typeof TARGET_ACTIVITY_IDS[number])
        || targetDocumentIds.has(activityId as string);
    });
    expect(phaseReferences).toHaveLength(0);

    const genericActivities = harness.rows.activities
      .filter((row) => !TARGET_ACTIVITY_IDS.includes(row.stableActivityId as typeof TARGET_ACTIVITY_IDS[number]))
      .filter((row) => !EXAMPLE_1_AND_2_ACTIVITY_IDS.has(row.stableActivityId as string));
    expect(genericActivities).toHaveLength(0);
    expect(genericActivities.map((row) => row.componentKey)).toEqual([]);
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toContain(
      PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
    );
  });
});
