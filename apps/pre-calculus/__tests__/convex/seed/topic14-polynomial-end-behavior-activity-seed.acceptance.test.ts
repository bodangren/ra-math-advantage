import { describe, expect, it } from "vitest";

import { polynomialEndBehaviorSchema } from "@math-platform/math-content";
import { generateTopic14PolynomialEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import { seedLesson1_4 } from "@/convex/seed/seed_lesson_1_4";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, unknown> & { _id: string };

const END_BEHAVIOR_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
] as const;

const PREEXISTING_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
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

describe("Precalculus Topic 1.4 polynomial end behavior activity seed", () => {
  it("seeds exact generated modes and patches them without phase attachment", async () => {
    const harness = createHarness();
    const handler = getHandler();

    const firstResult = await handler(harness.context, {});
    const firstRows = rowsForIds(harness.rows.activities, END_BEHAVIOR_ACTIVITY_IDS);
    expect((firstResult as { activitiesCreated: number }).activitiesCreated).toBe(12);
    expect(harness.rows.activities).toHaveLength(12);
    expect(firstRows).toHaveLength(3);
    expect(firstRows.map((row) => row.stableActivityId)).toEqual(END_BEHAVIOR_ACTIVITY_IDS);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          END_BEHAVIOR_ACTIVITY_IDS.includes(
            document.stableActivityId as (typeof END_BEHAVIOR_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(3);

    const expectedModes = [
      [
        "worked",
        0,
        "worked_example",
        PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
      ],
      [
        "guided",
        1,
        "guided_practice",
        PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
      ],
      [
        "independent",
        2,
        "independent_practice",
        PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
      ],
    ] as const;

    for (const [mode, seed, presentationMode, gradingConfig] of expectedModes) {
      const row = firstRows[seed]!;
      const props = row.props as Record<string, unknown>;
      const output = generateTopic14PolynomialEndBehaviorOutput(seed);
      const publicProps = (output.data as { rendererProps: Record<string, unknown> }).rendererProps;

      expect(row).toMatchObject({
        stableActivityId: END_BEHAVIOR_ACTIVITY_IDS[seed],
        componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
        description: "Determine polynomial end behavior from the leading term.",
        gradingConfig,
      });
      expect(polynomialEndBehaviorSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);

      if (mode === "worked") {
        expect(row.displayName).toBe("Worked Example: Polynomial End Behavior");
        expect(props).toEqual({
          ...publicProps,
          presentationMode: "worked_example",
          correctAnswers: output.expectedAnswer,
          steps: output.solutionSteps.map((step) => step.description),
          finalAnswer:
            "As x approaches negative infinity, f(x) approaches negative infinity. As x approaches positive infinity, f(x) approaches negative infinity.",
        });
        expect(props.prompt).toBe(
          "Determine the end behavior of f(x) = -3x^4 from its leading term.",
        );
      } else if (mode === "guided") {
        expect(row.displayName).toBe("Guided Practice: Polynomial End Behavior");
        expect(props).toEqual({
          ...publicProps,
          presentationMode: "guided_practice",
          guidedSteps: [
            "Identify whether the degree is even or odd.",
            "Identify whether the leading coefficient is positive or negative.",
            "Use the degree parity and leading-coefficient sign to determine both ends.",
          ],
          fieldHelp:
            "An even degree sends both ends in the same direction. An odd degree sends them in opposite directions. The leading coefficient determines the right end.",
        });
        expectNoAuthority(props);
      } else {
        expect(row.displayName).toBe("Independent Practice: Polynomial End Behavior");
        expect(props).toEqual(publicProps);
        expectNoAuthority(props);
      }
    }

    const firstDocumentIds = firstRows.map((row) => row._id);
    const firstCreatedAt = firstRows.map((row) => row.createdAt);
    const secondResult = await handler(harness.context, {});
    const secondRows = rowsForIds(harness.rows.activities, END_BEHAVIOR_ACTIVITY_IDS);
    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(secondRows).toHaveLength(3);
    expect(secondRows.map((row) => row._id)).toEqual(firstDocumentIds);
    expect(secondRows.map((row) => row.createdAt)).toEqual(firstCreatedAt);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          END_BEHAVIOR_ACTIVITY_IDS.includes(
            document.stableActivityId as (typeof END_BEHAVIOR_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(3);
    expect(harness.patches.filter(({ id }) => firstDocumentIds.includes(id))).toHaveLength(3);
    expect(
      harness.patches
        .filter(({ id }) => firstDocumentIds.includes(id))
        .every(({ document }) => !Object.hasOwn(document, "createdAt")),
    ).toBe(true);
    expect(rowsForIds(harness.rows.activities, END_BEHAVIOR_ACTIVITY_IDS)).toHaveLength(3);

    const targetDocumentIds = new Set(firstDocumentIds);
    const phaseReferences = harness.rows.phase_sections.filter((row) => {
      const activityId = (row.content as Record<string, unknown> | undefined)?.activityId;
      return (
        END_BEHAVIOR_ACTIVITY_IDS.includes(
          activityId as (typeof END_BEHAVIOR_ACTIVITY_IDS)[number],
        ) || targetDocumentIds.has(activityId as string)
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

    for (const activityId of PREEXISTING_ACTIVITY_IDS) {
      expect(rowsForIds(harness.rows.activities, [activityId])).toHaveLength(1);
    }
    const preexistingRows = harness.rows.activities.filter(
      (row) =>
        !END_BEHAVIOR_ACTIVITY_IDS.includes(
          row.stableActivityId as (typeof END_BEHAVIOR_ACTIVITY_IDS)[number],
        ),
    );
    expect(preexistingRows).toHaveLength(9);
    expect(
      preexistingRows.filter((row) => !row.stableActivityId).map((row) => row.componentKey),
    ).toEqual([]);
  });
});
