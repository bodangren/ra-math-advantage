import { describe, expect, it } from "vitest";

import { realZerosAndMultiplicitiesSchema } from "@math-platform/math-content";
import { generateTopic15RealZerosAndMultiplicitiesOutput } from "@math-platform/math-content/knowledge-space";

import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import { seedLesson1_5 } from "@/convex/seed/seed_lesson_1_5";
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, unknown> & { _id: string };

const TARGET_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
] as const;

const AUTHORITY_KEYS = new Set([
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

function collectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, keys));
  else if (value && typeof value === "object")
    Object.entries(value).forEach(([key, nested]) => {
      keys.push(key);
      collectKeys(nested, keys);
    });
  return keys;
}

function expectNoAuthority(value: unknown): void {
  expect(collectKeys(value).filter((key) => AUTHORITY_KEYS.has(key))).toEqual([]);
}

function getHandler() {
  const handler = Reflect.get(seedLesson1_5, "_handler");
  if (typeof handler !== "function") throw new Error("seedLesson1_5 must expose its handler.");
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

describe("Precalculus Topic 1.5 real zeros and multiplicities activity seed", () => {
  it("seeds exact generated modes and patches them without phase attachment", async () => {
    const harness = createHarness();
    const handler = getHandler();
    const firstResult = await handler(harness.context, {});
    const firstRows = rowsForIds(harness.rows.activities, TARGET_ACTIVITY_IDS);

    expect((firstResult as { activitiesCreated: number }).activitiesCreated).toBe(9);
    expect(harness.rows.activities).toHaveLength(9);
    expect(firstRows).toHaveLength(3);
    expect(firstRows.map((row) => row.stableActivityId)).toEqual(TARGET_ACTIVITY_IDS);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          TARGET_ACTIVITY_IDS.includes(
            document.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(3);

    const expectedModes = [
      [
        "worked",
        0,
        "worked_example",
        PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG,
      ],
      [
        "guided",
        1,
        "guided_practice",
        PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG,
      ],
      [
        "independent",
        2,
        "independent_practice",
        PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG,
      ],
    ] as const;

    for (const [mode, seed, presentationMode, gradingConfig] of expectedModes) {
      const row = firstRows[seed]!;
      const props = row.props as Record<string, unknown>;
      const output = generateTopic15RealZerosAndMultiplicitiesOutput(seed);
      const publicProps = (output.data as { rendererProps: Record<string, unknown> }).rendererProps;

      expect(row).toMatchObject({
        stableActivityId: TARGET_ACTIVITY_IDS[seed],
        componentKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
        description:
          "Find the real zeros and their multiplicities from a factored polynomial expression.",
        gradingConfig,
      });
      expect(realZerosAndMultiplicitiesSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);

      if (mode === "worked") {
        expect(row.displayName).toBe("Worked Example: Real Zeros and Multiplicities");
        expect(props.items).toEqual([
          { id: "a", functionName: "f", expression: "-2x^3(x+1)(x-4)^2" },
          { id: "b", functionName: "g", expression: "3(x^2 - 4)(x - 2)^4" },
        ]);
        expect(props.correctAnswers).toEqual({
          a: [
            { zero: -1, multiplicity: 1 },
            { zero: 0, multiplicity: 3 },
            { zero: 4, multiplicity: 2 },
          ],
          b: [
            { zero: -2, multiplicity: 1 },
            { zero: 2, multiplicity: 5 },
          ],
        });
        expect(props.steps).toEqual([
          "For f(x) = -2x^3(x+1)(x-4)^2, the real zeros are x = 0 (multiplicity 3), x = -1 (multiplicity 1), and x = 4 (multiplicity 2).",
          "For g(x) = 3(x^2 - 4)(x - 2)^4, factor x^2 - 4 as (x - 2)(x + 2).",
          "Then g(x) = 3(x - 2)^5(x + 2), so x = 2 has multiplicity 5 and x = -2 has multiplicity 1.",
        ]);
        expect(props).toEqual({
          ...publicProps,
          presentationMode: "worked_example",
          correctAnswers: output.expectedAnswer,
          steps: output.solutionSteps.map((step) => step.description),
          finalAnswer:
            "For f, the real zeros are x = -1 (multiplicity 1), x = 0 (multiplicity 3), and x = 4 (multiplicity 2). For g, x = -2 (multiplicity 1) and x = 2 (multiplicity 5).",
        });
      } else if (mode === "guided") {
        expect(row.displayName).toBe("Guided Practice: Real Zeros and Multiplicities");
        expect(props).toEqual({
          ...publicProps,
          presentationMode: "guided_practice",
          guidedSteps: [
            "Identify each factor that can make the function equal zero.",
            "Count the repeated factors for each zero.",
          ],
          fieldHelp: "List the zeros in ascending order and give the multiplicity of each zero.",
        });
        expectNoAuthority(props);
      } else {
        expect(row.displayName).toBe("Independent Practice: Real Zeros and Multiplicities");
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
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          TARGET_ACTIVITY_IDS.includes(
            document.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(3);
    expect(harness.patches.filter(({ id }) => firstDocumentIds.includes(id))).toHaveLength(3);
    expect(
      harness.patches
        .filter(({ id }) => firstDocumentIds.includes(id))
        .every(({ document }) => !Object.hasOwn(document, "createdAt")),
    ).toBe(true);
    expect(rowsForIds(harness.rows.activities, TARGET_ACTIVITY_IDS)).toHaveLength(3);

    const targetDocumentIds = new Set(firstDocumentIds);
    const phaseReferences = harness.rows.phase_sections.filter((row) => {
      const activityId = (row.content as Record<string, unknown> | undefined)?.activityId;
      return (
        TARGET_ACTIVITY_IDS.includes(activityId as (typeof TARGET_ACTIVITY_IDS)[number]) ||
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
    expect(
      harness.rows.activities.filter(
        (row) =>
          !TARGET_ACTIVITY_IDS.includes(
            row.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(6);
    expect(
      harness.rows.activities
        .filter(
          (row) =>
            !TARGET_ACTIVITY_IDS.includes(
              row.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number],
            ),
        )
        .map((row) => row.componentKey),
    ).toEqual([
      ...Array(3).fill("least-polynomial-degree"),
      ...Array(3).fill("polynomial-inequality-sign-chart"),
    ]);
  });
});
