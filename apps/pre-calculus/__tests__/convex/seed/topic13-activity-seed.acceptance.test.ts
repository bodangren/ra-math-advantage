import { describe, expect, it } from "vitest";

import { ratePatternClassificationSchema } from "@math-platform/math-content";
import {
  generateTopic13RatePatternClassification,
  generateTopic13RatePatternClassificationOutput,
} from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
} from "@/convex/activities";
import { seedLesson1_3 } from "@/convex/seed/seed_lesson_1_3";
import {
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, unknown> & { _id: string };

const TARGET_ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
] as const;
const BANNED_AUTHORITY_KEYS = new Set([
  "correctAnswer",
  "answerKey",
  "hidden",
  "authority",
  "correctClassifications",
  "correctOptionId",
  "expectedAnswer",
  "isCorrect",
  "score",
  "maxScore",
  "gradingMetadata",
  "solutionSteps",
  "finalAnswer",
  "relationship",
  "correctness",
  "classification",
  "correctClassification",
  "solution",
  "steps",
]);

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjectKeys(item, keys));
  } else if (value && typeof value === "object") {
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
  const handler = Reflect.get(seedLesson1_3, "_handler");
  if (typeof handler !== "function") throw new Error("seedLesson1_3 must expose its handler.");
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

describe("Precalculus Topic 1.3 rate-pattern classification activity seed", () => {
  it("upserts the three generated modes without phase attachment", async () => {
    const harness = createHarness();
    const handler = getHandler();

    await handler(harness.context, {});
    const firstTargetRows = targetRows(harness.rows.activities);
    const firstTargetDocumentIds = firstTargetRows.map((row) => row._id);
    const firstTargetInserts = harness.inserts.filter(
      ({ table, document }) =>
        table === "activities" &&
        TARGET_ACTIVITY_IDS.includes(
          document.stableActivityId as (typeof TARGET_ACTIVITY_IDS)[number],
        ),
    );
    expect(firstTargetRows).toHaveLength(3);
    expect(firstTargetRows.map((row) => row.stableActivityId)).toEqual(TARGET_ACTIVITY_IDS);
    expect(firstTargetInserts).toHaveLength(3);

    const secondResult = await handler(harness.context, {});
    const secondTargetRows = targetRows(harness.rows.activities);
    expect(secondTargetRows).toHaveLength(3);
    expect(secondTargetRows.map((row) => row._id)).toEqual(firstTargetDocumentIds);
    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(harness.patches.filter(({ id }) => firstTargetDocumentIds.includes(id))).toHaveLength(3);

    const expectedModes = [
      ["worked", 0, "worked_example"],
      ["guided", 1, "guided_practice"],
      ["independent", 2, "independent_practice"],
    ] as const;
    for (const [mode, seed, presentationMode] of expectedModes) {
      const row = firstTargetRows[seed] as Row;
      expect(row).toMatchObject({
        stableActivityId: TARGET_ACTIVITY_IDS[seed],
        componentKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
      });
      const expectedConfig =
        mode === "worked"
          ? PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG
          : mode === "guided"
            ? PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_GRADING_CONFIG
            : PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_GRADING_CONFIG;
      expect(row.gradingConfig).toEqual(expectedConfig);

      const props = row.props as Record<string, unknown>;
      expect(ratePatternClassificationSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);
      if (mode === "worked") {
        const variant = generateTopic13RatePatternClassification(0);
        const output = generateTopic13RatePatternClassificationOutput(0);
        expect(props).toEqual({
          prompt: variant.prompt,
          cases: variant.cases,
          presentationMode: "worked_example",
          correctClassifications: output.expectedAnswer,
          steps: output.solutionSteps.map((step) => step.description),
          finalAnswer: "a) quadratic; b) linear; c) quadratic.",
        });
      } else if (mode === "guided") {
        const variant = generateTopic13RatePatternClassification(1);
        expect(props).toEqual({
          prompt: variant.prompt,
          cases: variant.cases,
          presentationMode: "guided_practice",
          guidedSteps: [
            "Find each input width.",
            "Divide each output change by its input width.",
            "Compare the average rates and their second divided differences.",
            "Classify each function.",
          ],
          fieldHelp:
            "Compute average rates using the actual input widths. Equal first divided differences fit a line. Equal nonzero second divided differences fit a quadratic.",
        });
        expectNoAuthority(props);
      } else {
        const output = generateTopic13RatePatternClassificationOutput(2);
        expect(props).toEqual(
          (output.data as { rendererProps: Record<string, unknown> }).rendererProps,
        );
        expectNoAuthority(props);
      }
    }

    const phaseReferences = harness.rows.phase_sections.filter((row) =>
      TARGET_ACTIVITY_IDS.includes(
        (row.content as Record<string, unknown> | undefined)
          ?.activityId as (typeof TARGET_ACTIVITY_IDS)[number],
      ),
    );
    expect(phaseReferences).toHaveLength(0);
  });
});
