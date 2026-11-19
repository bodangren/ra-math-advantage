import { describe, expect, it } from "vitest";

import { polynomialExtremaFromGraphSchema } from "@math-platform/math-content";
import { generateTopic14PolynomialExtremaFromGraphOutput } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
} from "@/convex/activities";
import { seedLesson1_4 } from "@/convex/seed/seed_lesson_1_4";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, unknown> & { _id: string };

const EXTREMA_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
] as const;

const DEGREE_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
] as const;
const RATE_SIGN_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
] as const;
const END_BEHAVIOR_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
] as const;

const BANNED_AUTHORITY_KEYS = new Set([
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "isCorrect",
  "maxScore",
  "normalizedAnswer",
  "score",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
]);

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectObjectKeys(item, keys));
  else if (value && typeof value === "object")
    Object.entries(value).forEach(([key, nested]) => {
      keys.push(key);
      collectObjectKeys(nested, keys);
    });
  return keys;
}

function expectNoAuthority(value: unknown): void {
  expect(collectObjectKeys(value).filter((key) => BANNED_AUTHORITY_KEYS.has(key))).toEqual([]);
}

function getHandler() {
  const handler = Reflect.get(seedLesson1_4, "_handler");
  if (typeof handler !== "function") throw new Error("seedLesson1_4 must expose its handler.");
  return handler as (
    context: { db: Record<string, unknown> },
    args: Record<string, never>,
  ) => Promise<unknown>;
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
        const select = () =>
          (rows[table] ?? []).filter((row) =>
            [...conditions].every(([field, value]) => row[field] === value),
          );
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
      const row = Object.values(rows)
        .flat()
        .find((candidate) => candidate._id === id);
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

describe("Precalculus Topic 1.4 polynomial extrema activity seed", () => {
  it("seeds exact generated modes and patches them without phase attachment", async () => {
    const harness = createHarness();
    const handler = getHandler();

    const firstResult = await handler(harness.context, {});
    const firstExtremaRows = rowsForIds(harness.rows.activities, EXTREMA_ACTIVITY_IDS);
    const firstDegreeRows = rowsForIds(harness.rows.activities, DEGREE_ACTIVITY_IDS);
    expect(firstExtremaRows).toHaveLength(3);
    expect(firstExtremaRows.map((row) => row.stableActivityId)).toEqual(EXTREMA_ACTIVITY_IDS);
    expect(firstDegreeRows).toHaveLength(3);
    expect(firstDegreeRows.map((row) => row.stableActivityId)).toEqual(DEGREE_ACTIVITY_IDS);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          EXTREMA_ACTIVITY_IDS.includes(
            document.stableActivityId as (typeof EXTREMA_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(3);
    expect((firstResult as { activitiesCreated: number }).activitiesCreated).toBeGreaterThanOrEqual(
      6,
    );

    const firstDocumentIds = firstExtremaRows.map((row) => row._id);
    const firstCreatedAt = firstExtremaRows.map((row) => row.createdAt);
    const expectedModes = [
      [
        "worked",
        0,
        "worked_example",
        PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG,
      ],
      [
        "guided",
        1,
        "guided_practice",
        PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_GRADING_CONFIG,
      ],
      [
        "independent",
        2,
        "independent_practice",
        PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_GRADING_CONFIG,
      ],
    ] as const;

    for (const [mode, seed, presentationMode, gradingConfig] of expectedModes) {
      const row = firstExtremaRows[seed]!;
      const props = row.props as Record<string, unknown>;
      expect(row).toMatchObject({
        stableActivityId: EXTREMA_ACTIVITY_IDS[seed],
        componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
        description: "Identify relative and absolute extrema from a polynomial graph.",
        gradingConfig,
      });
      expect(polynomialExtremaFromGraphSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);

      if (mode === "worked") {
        const output = generateTopic14PolynomialExtremaFromGraphOutput(0);
        const publicProps = (output.data as { rendererProps: Record<string, unknown> })
          .rendererProps;
        expect(row.displayName).toBe("Worked Example: Identify Extrema from a Graph");
        expect(props).toEqual({
          ...publicProps,
          presentationMode: "worked_example",
          correctAnswers: output.expectedAnswer,
          steps: output.solutionSteps.map((step) => step.description),
          finalAnswer:
            "x = 1 is a relative minimum and the absolute minimum; x = 4 is a relative maximum.",
        });
      } else if (mode === "guided") {
        const output = generateTopic14PolynomialExtremaFromGraphOutput(1);
        const publicProps = (output.data as { rendererProps: Record<string, unknown> })
          .rendererProps;
        expect(row.displayName).toBe("Guided Practice: Identify Extrema from a Graph");
        expect(props).toEqual({
          ...publicProps,
          presentationMode: "guided_practice",
          guidedSteps: [
            "Find where the graph changes from decreasing to increasing.",
            "Find where the graph changes from increasing to decreasing.",
            "Compare the displayed y-values to identify the absolute minimum.",
          ],
          fieldHelp:
            "A relative extremum occurs where the graph changes direction. The absolute minimum is the lowest displayed value.",
        });
        expectNoAuthority(props);
      } else {
        const output = generateTopic14PolynomialExtremaFromGraphOutput(2);
        expect(row.displayName).toBe("Independent Practice: Identify Extrema from a Graph");
        expect(props).toEqual(
          (output.data as { rendererProps: Record<string, unknown> }).rendererProps,
        );
        expectNoAuthority(props);
      }
    }

    const secondResult = await handler(harness.context, {});
    const secondExtremaRows = rowsForIds(harness.rows.activities, EXTREMA_ACTIVITY_IDS);
    expect(secondExtremaRows).toHaveLength(3);
    expect(secondExtremaRows.map((row) => row._id)).toEqual(firstDocumentIds);
    expect(secondExtremaRows.map((row) => row.createdAt)).toEqual(firstCreatedAt);
    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          EXTREMA_ACTIVITY_IDS.includes(
            document.stableActivityId as (typeof EXTREMA_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(3);
    expect(harness.patches.filter(({ id }) => firstDocumentIds.includes(id))).toHaveLength(3);
    expect(
      harness.patches
        .filter(({ id }) => firstDocumentIds.includes(id))
        .every(({ document }) => !Object.hasOwn(document, "createdAt")),
    ).toBe(true);

    const targetDocumentIds = new Set(firstDocumentIds);
    const phaseReferences = harness.rows.phase_sections.filter((row) => {
      const activityId = (row.content as Record<string, unknown> | undefined)?.activityId;
      return (
        EXTREMA_ACTIVITY_IDS.includes(activityId as (typeof EXTREMA_ACTIVITY_IDS)[number]) ||
        targetDocumentIds.has(activityId as string)
      );
    });
    expect(phaseReferences).toHaveLength(0);
    expect(harness.rows.phase_versions).toHaveLength(7);
    expect(harness.rows.phase_versions.map((row) => row.title)).toEqual([
      "Explore",
      "Vocabulary",
      "Learn",
      "Worked Example",
      "Guided Practice",
      "Independent Practice",
      "Reflection",
    ]);
    expect(harness.rows.phase_sections).toHaveLength(7);
    expect(harness.rows.phase_sections.map((row) => row.sectionType)).toEqual(
      Array(7).fill("text"),
    );
    expect(rowsForIds(harness.rows.activities, DEGREE_ACTIVITY_IDS)).toHaveLength(3);
    expect(
      harness.rows.activities.filter(
        (row) =>
          !EXTREMA_ACTIVITY_IDS.includes(
            row.stableActivityId as (typeof EXTREMA_ACTIVITY_IDS)[number],
          ) &&
          !DEGREE_ACTIVITY_IDS.includes(
            row.stableActivityId as (typeof DEGREE_ACTIVITY_IDS)[number],
          ) &&
          !RATE_SIGN_ACTIVITY_IDS.includes(
            row.stableActivityId as (typeof RATE_SIGN_ACTIVITY_IDS)[number],
          ) &&
          !END_BEHAVIOR_ACTIVITY_IDS.includes(
            row.stableActivityId as (typeof END_BEHAVIOR_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(0);
    expect(
      harness.rows.activities
        .filter(
          (row) =>
            !EXTREMA_ACTIVITY_IDS.includes(
              row.stableActivityId as (typeof EXTREMA_ACTIVITY_IDS)[number],
            ) &&
            !DEGREE_ACTIVITY_IDS.includes(
              row.stableActivityId as (typeof DEGREE_ACTIVITY_IDS)[number],
            ) &&
            !RATE_SIGN_ACTIVITY_IDS.includes(
              row.stableActivityId as (typeof RATE_SIGN_ACTIVITY_IDS)[number],
            ) &&
            !END_BEHAVIOR_ACTIVITY_IDS.includes(
              row.stableActivityId as (typeof END_BEHAVIOR_ACTIVITY_IDS)[number],
            ),
        )
        .map((row) => row.componentKey),
    ).toEqual([]);
    expect(
      firstDegreeRows.every(
        (row) =>
          row.componentKey ===
          PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
      ),
    ).toBe(true);
  });
});
