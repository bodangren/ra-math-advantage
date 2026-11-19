import { describe, expect, it } from "vitest";

import { polynomialDegreeLeadingCoefficientSchema } from "@math-platform/math-content";
import {
  generateTopic14PolynomialDegreeLeadingCoefficient,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
} from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import { seedLesson1_4 } from "@/convex/seed/seed_lesson_1_4";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, unknown> & { _id: string };

const TARGET_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
] as const;
const EXTREMA_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
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
  "correctAnswer",
  "answerKey",
  "hidden",
  "authority",
  "correctAnswers",
  "expectedAnswer",
  "isCorrect",
  "score",
  "maxScore",
  "gradingMetadata",
  "solutionSteps",
  "finalAnswer",
  "correctness",
  "solution",
  "steps",
  "degree",
  "leadingCoefficient",
]);

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectObjectKeys(item, keys));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nestedValue]) => {
      keys.push(key);
      collectObjectKeys(nestedValue, keys);
    });
  }
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

function targetRows(rows: Row[]): Row[] {
  return rows.filter((row) =>
    TARGET_ACTIVITY_IDS.includes(row.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number]),
  );
}

describe("Precalculus Topic 1.4 degree and leading coefficient activity seed", () => {
  it("upserts three generated modes without phase attachment", async () => {
    const harness = createHarness();
    const handler = getHandler();

    const firstResult = await handler(harness.context, {});
    const firstTargetRows = targetRows(harness.rows.activities);
    const firstTargetDocumentIds = firstTargetRows.map((row) => row._id);
    const firstTargetCreatedAt = firstTargetRows.map((row) => row.createdAt);
    expect(firstTargetRows).toHaveLength(3);
    expect(firstTargetRows.map((row) => row.stableActivityId)).toEqual(TARGET_ACTIVITY_IDS);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          TARGET_ACTIVITY_IDS.includes(
            document.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(3);
    expect((firstResult as { activitiesCreated: number }).activitiesCreated).toBeGreaterThanOrEqual(
      3,
    );

    const secondResult = await handler(harness.context, {});
    const secondTargetRows = targetRows(harness.rows.activities);
    expect(secondTargetRows).toHaveLength(3);
    expect(secondTargetRows.map((row) => row._id)).toEqual(firstTargetDocumentIds);
    expect(secondTargetRows.map((row) => row.createdAt)).toEqual(firstTargetCreatedAt);
    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          TARGET_ACTIVITY_IDS.includes(
            document.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number],
          ),
      ),
    ).toHaveLength(3);
    expect(harness.patches.filter(({ id }) => firstTargetDocumentIds.includes(id))).toHaveLength(3);
    expect(
      harness.patches
        .filter(({ id }) => firstTargetDocumentIds.includes(id))
        .every(({ document }) => !Object.hasOwn(document, "createdAt")),
    ).toBe(true);

    const expectedModes = [
      [
        "worked",
        0,
        "worked_example",
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG,
      ],
      [
        "guided",
        1,
        "guided_practice",
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_GRADING_CONFIG,
      ],
      [
        "independent",
        2,
        "independent_practice",
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_GRADING_CONFIG,
      ],
    ] as const;
    for (const [mode, seed, presentationMode, gradingConfig] of expectedModes) {
      const row = firstTargetRows[seed] as Row;
      expect(row).toMatchObject({
        stableActivityId: TARGET_ACTIVITY_IDS[seed],
        componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
        gradingConfig,
        description: "Identify the degree and leading coefficient of each polynomial.",
      });
      const props = row.props as Record<string, unknown>;
      expect(polynomialDegreeLeadingCoefficientSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);
      if (mode === "worked") {
        const variant = generateTopic14PolynomialDegreeLeadingCoefficient(0);
        const output = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0);
        expect(row.displayName).toBe("Worked Example: Degree and Leading Coefficient");
        expect(props).toEqual({
          prompt: variant.prompt,
          items: variant.items,
          presentationMode: "worked_example",
          correctAnswers: output.expectedAnswer,
          steps: output.solutionSteps.map((step) => step.description),
          finalAnswer:
            "a) degree 4, leading coefficient 3; b) degree 3, leading coefficient -7; c) degree 0, leading coefficient 4.",
        });
      } else if (mode === "guided") {
        const variant = generateTopic14PolynomialDegreeLeadingCoefficient(1);
        expect(row.displayName).toBe("Guided Practice: Degree and Leading Coefficient");
        expect(props).toEqual({
          prompt: variant.prompt,
          items: variant.items,
          presentationMode: "guided_practice",
          guidedSteps: [
            "Find the term with the greatest exponent in each expression.",
            "Use that exponent as the degree.",
            "Use the coefficient of that term as the leading coefficient.",
            "Treat a nonzero constant as a degree-0 polynomial.",
          ],
          fieldHelp: "Inspect exponents before you use the written term order.",
        });
        expectNoAuthority(props);
      } else {
        const output = generateTopic14PolynomialDegreeLeadingCoefficientOutput(2);
        expect(row.displayName).toBe("Independent Practice: Degree and Leading Coefficient");
        expect(props).toEqual(
          (output.data as { rendererProps: Record<string, unknown> }).rendererProps,
        );
        expectNoAuthority(props);
      }
    }

    const targetDocumentIds = new Set(firstTargetDocumentIds);
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
          ) &&
          !EXTREMA_ACTIVITY_IDS.includes(
            row.stableActivityId as (typeof EXTREMA_ACTIVITY_IDS)[number],
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
            !TARGET_ACTIVITY_IDS.includes(
              row.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number],
            ) &&
            !EXTREMA_ACTIVITY_IDS.includes(
              row.stableActivityId as (typeof EXTREMA_ACTIVITY_IDS)[number],
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
  });
});
