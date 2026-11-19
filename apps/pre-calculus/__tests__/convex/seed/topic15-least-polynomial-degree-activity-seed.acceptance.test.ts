import { describe, expect, it } from "vitest";

import { leastPolynomialDegreeSchema } from "@math-platform/math-content";
import { generateTopic15LeastPolynomialDegreeOutput } from "@math-platform/math-content/knowledge-space";

import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import { seedLesson1_5 } from "@/convex/seed/seed_lesson_1_5";
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, unknown> & { _id: string };

const TARGET_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
] as const;

const EXAMPLE_1_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
] as const;
const EXAMPLE_1_ACTIVITY_ID_SET = new Set(EXAMPLE_1_ACTIVITY_IDS);

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

describe("Precalculus Topic 1.5 least polynomial degree activity seed", () => {
  it("seeds exact generated modes and patches them without phase attachment", async () => {
    const harness = createHarness();
    const handler = getHandler();
    const firstResult = await handler(harness.context, {});
    const firstRows = rowsForIds(harness.rows.activities, TARGET_ACTIVITY_IDS);

    expect(firstRows).toHaveLength(3);
    expect((firstResult as { activitiesCreated: number }).activitiesCreated).toBe(9);
    expect(harness.rows.activities).toHaveLength(9);
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
        PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
      ],
      [
        "guided",
        1,
        "guided_practice",
        PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG,
      ],
      [
        "independent",
        2,
        "independent_practice",
        PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG,
      ],
    ] as const;

    for (const [mode, seed, presentationMode, gradingConfig] of expectedModes) {
      const row = firstRows[seed]!;
      const props = row.props as Record<string, unknown>;
      const output = generateTopic15LeastPolynomialDegreeOutput(seed);
      const publicProps = (output.data as { rendererProps: Record<string, unknown> }).rendererProps;

      expect(row).toMatchObject({
        stableActivityId: TARGET_ACTIVITY_IDS[seed],
        componentKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
        description:
          "Determine the least possible degree of a real-coefficient polynomial by counting given zeros, multiplicities, and required conjugate zeros.",
        gradingConfig,
      });
      expect(leastPolynomialDegreeSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);

      if (mode === "worked") {
        expect(row.displayName).toBe("Worked Example: Least Polynomial Degree");
        expect(props).toEqual({
          ...publicProps,
          presentationMode: "worked_example",
          correctAnswer: 5,
          steps: [
            "Because f has real coefficients, x = -i√3 is also a zero.",
            "The conjugate pair contributes 2 nonreal zeros, and the graph shows at least 3 real zeros.",
            "Therefore, the least possible degree is 2 + 3 = 5.",
          ],
          finalAnswer: "The least possible degree is 5.",
        });
      } else if (mode === "guided") {
        expect(row.displayName).toBe("Guided Practice: Least Polynomial Degree");
        expect(props.prompt).toBe(
          "The zero x = 1 + i is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?",
        );
        expect(props.givenNonrealZero).toBe("1 + i");
        expect(props.realZeroCount).toBe(3);
        expect(props).toEqual({
          ...publicProps,
          presentationMode: "guided_practice",
          guidedSteps: [
            "Identify the conjugate zero.",
            "Count the conjugate pair and the real zeros.",
          ],
          fieldHelp: "Add 2 for the conjugate pair to the number of real zeros.",
        });
        expectNoAuthority(props);
      } else {
        expect(row.displayName).toBe("Independent Practice: Least Polynomial Degree");
        expect(props.prompt).toBe(
          "The zero x = 2 + 2i is given for a real-coefficient polynomial f. Its graph shows at least 2 real zeros. What is the least possible degree of f?",
        );
        expect(props.givenNonrealZero).toBe("2 + 2i");
        expect(props.realZeroCount).toBe(2);
        expect(props).toEqual(publicProps);
        expectNoAuthority(props);
      }
    }

    expect((firstRows[0]!.props as Record<string, unknown>).prompt).toBe(
      "The zero x = i√3 is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?",
    );
    expect((firstRows[0]!.props as Record<string, unknown>).givenNonrealZero).toBe("i√3");
    expect((firstRows[0]!.props as Record<string, unknown>).realZeroCount).toBe(3);
    expect((firstRows[0]!.props as Record<string, unknown>).correctAnswer).toBe(5);
    expect((firstRows[0]!.props as Record<string, unknown>).steps).toEqual([
      "Because f has real coefficients, x = -i√3 is also a zero.",
      "The conjugate pair contributes 2 nonreal zeros, and the graph shows at least 3 real zeros.",
      "Therefore, the least possible degree is 2 + 3 = 5.",
    ]);
    expect((firstRows[0]!.props as Record<string, unknown>).finalAnswer).toBe(
      "The least possible degree is 5.",
    );

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
    expect(rowsForIds(harness.rows.activities, EXAMPLE_1_ACTIVITY_IDS)).toHaveLength(3);

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
    const genericActivities = harness.rows.activities
      .filter(
        (row) =>
          !TARGET_ACTIVITY_IDS.includes(
            row.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number],
          ),
      )
      .filter(
        (row) =>
          !EXAMPLE_1_ACTIVITY_ID_SET.has(
            row.stableActivityId as (typeof EXAMPLE_1_ACTIVITY_IDS)[number],
          ),
      );
    expect(genericActivities).toHaveLength(3);
    expect(genericActivities.map((row) => row.componentKey)).toEqual(
      Array(3).fill("polynomial-inequality-sign-chart"),
    );
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toContain(
      PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
    );
  });
});
