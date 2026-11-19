import { describe, expect, it } from "vitest";

import { seedLesson1_2 } from "@/convex/seed/seed_lesson_1_2";
import {
  graphAverageRateChoiceSchema,
  negativeRateContextChoiceSchema,
  quadraticNegativeRateIntervalChoiceSchema,
  pointwiseRateOrderingSchema,
  pointwiseLeastRateChoiceSchema,
  tableAverageRateChoiceSchema,
} from "@math-platform/math-content";
import {
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";
import {
  generateTopic12GraphAverageRateChoice,
  generateTopic12GraphAverageRateChoiceOutput,
  generateTopic12NegativeRateContextChoice,
  generateTopic12NegativeRateContextChoiceOutput,
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
  generateTopic12PointwiseLeastRateChoice,
  generateTopic12PointwiseLeastRateChoiceOutput,
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
  generateTopic12TableAverageRateChoice,
  generateTopic12TableAverageRateChoiceOutput,
} from "@math-platform/math-content/knowledge-space";

type Row = Record<string, unknown> & { _id: string };

const NODE_ID = "math.precalc.skill.1.2.compare-rates-of-change-across-intervals";
const COMPONENT_KEY = "table-average-rate-choice";
const GENERATOR_KEY = "topic12-table-average-rate-choice";
const ACTIVITY_IDS = {
  worked: `${NODE_ID}.worked_example`,
  guided: `${NODE_ID}.guided_practice`,
  independent: `${NODE_ID}.independent_practice`,
} as const;
const GRAPH_COMPONENT_KEY = "graph-average-rate-choice";
const GRAPH_GENERATOR_KEY = "topic12-graph-average-rate-choice";
const GRAPH_ACTIVITY_IDS = {
  worked: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
  guided: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  independent: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
} as const;
const POINTWISE_ACTIVITY_IDS = {
  worked: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
  guided: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  independent: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
} as const;
const POINTWISE_COMPONENT_KEY = "pointwise-least-rate-choice";
const POINTWISE_GENERATOR_KEY = "topic12-pointwise-least-rate-choice";
const ORDERING_ACTIVITY_IDS = {
  worked: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
  guided: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
  independent: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
} as const;
const ORDERING_COMPONENT_KEY = "pointwise-rate-ordering";
const ORDERING_GENERATOR_KEY = "topic12-pointwise-rate-ordering";
const NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS = {
  worked: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
  guided: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  independent: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
} as const;
const NEGATIVE_RATE_CONTEXT_COMPONENT_KEY = "negative-rate-context-choice";
const NEGATIVE_RATE_CONTEXT_GENERATOR_KEY = "topic12-negative-rate-context-choice";
const QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS = {
  worked: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
  guided: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  independent: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
} as const;
const QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY = "quadratic-negative-rate-interval-choice";
const QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY =
  "topic12-quadratic-negative-rate-interval-choice";

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

function getHandler() {
  const handler = Reflect.get(seedLesson1_2, "_handler");
  if (typeof handler !== "function") throw new Error("seedLesson1_2 must expose its handler.");
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
    },
  };

  return { context: { db }, inserts, rows };
}

describe("Precalculus Topic 1.2 table activity seed", () => {
  it("upserts the three generated mode activities without attaching them to lesson phases", async () => {
    const harness = createHarness();

    await getHandler()(harness.context, {});
    await getHandler()(harness.context, {});

    const targetRows = harness.rows.activities.filter((row) =>
      Object.values(ACTIVITY_IDS).includes(
        row.stableActivityId as (typeof ACTIVITY_IDS)[keyof typeof ACTIVITY_IDS],
      ),
    );
    expect(targetRows).toHaveLength(3);
    expect(new Set(targetRows.map((row) => row._id)).size).toBe(3);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          Object.values(ACTIVITY_IDS).includes(
            document.stableActivityId as (typeof ACTIVITY_IDS)[keyof typeof ACTIVITY_IDS],
          ),
      ),
    ).toHaveLength(3);

    const expectedModes = [
      ["worked", 0, "worked_example"],
      ["guided", 1, "guided_practice"],
      ["independent", 2, "independent_practice"],
    ] as const;
    for (const [mode, seed, presentationMode] of expectedModes) {
      const row = targetRows.find((candidate) => candidate.stableActivityId === ACTIVITY_IDS[mode]);
      expect(row).toBeDefined();
      expect(row).toMatchObject({
        stableActivityId: ACTIVITY_IDS[mode],
        componentKey: COMPONENT_KEY,
        gradingConfig: { generatorKey: GENERATOR_KEY, variantSeed: seed },
      });
      expect(row?.gradingConfig).toEqual({ generatorKey: GENERATOR_KEY, variantSeed: seed });

      const props = row?.props as Record<string, unknown>;
      expect(tableAverageRateChoiceSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);
      const variant = generateTopic12TableAverageRateChoice(seed);
      expect(props.prompt).toBe(variant.prompt);
      expect(props.inputLabel).toBe(variant.inputLabel);
      expect(props.outputLabel).toBe(variant.outputLabel);
      expect(props.rows).toEqual(variant.rows);
      expect(props.options).toEqual(variant.options);
      if (mode === "worked") {
        expect(props.correctOptionId).toBe(variant.correctOptionId);
        expect(props.steps).toEqual(variant.solutionSteps);
        expect(props.finalAnswer).toEqual(expect.stringContaining(variant.correctOptionId));
      } else {
        for (const key of [
          "correctOptionId",
          "finalAnswer",
          "steps",
          "expectedAnswer",
          "gradingMetadata",
        ]) {
          expect(props).not.toHaveProperty(key);
        }
      }
      if (mode === "independent") {
        const output = generateTopic12TableAverageRateChoiceOutput(seed);
        expect(props).toEqual(
          (output.data as { rendererProps: Record<string, unknown> }).rendererProps,
        );
      }
    }

    expect(
      harness.rows.phase_sections.filter((row) =>
        Object.values(ACTIVITY_IDS).includes(
          (row.content as Record<string, unknown> | undefined)
            ?.activityId as (typeof ACTIVITY_IDS)[keyof typeof ACTIVITY_IDS],
        ),
      ),
    ).toHaveLength(0);
  });

  it("upserts the three graph activities from their shared generated variants", async () => {
    const harness = createHarness();

    await getHandler()(harness.context, {});
    await getHandler()(harness.context, {});

    const graphRows = harness.rows.activities.filter((row) =>
      Object.values(GRAPH_ACTIVITY_IDS).includes(
        row.stableActivityId as (typeof GRAPH_ACTIVITY_IDS)[keyof typeof GRAPH_ACTIVITY_IDS],
      ),
    );
    expect(graphRows).toHaveLength(3);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          Object.values(GRAPH_ACTIVITY_IDS).includes(
            document.stableActivityId as (typeof GRAPH_ACTIVITY_IDS)[keyof typeof GRAPH_ACTIVITY_IDS],
          ),
      ),
    ).toHaveLength(3);

    const expectedModes = [
      ["worked", 0, "worked_example"],
      ["guided", 1, "guided_practice"],
      ["independent", 2, "independent_practice"],
    ] as const;
    for (const [mode, seed, presentationMode] of expectedModes) {
      const row = graphRows.find(
        (candidate) => candidate.stableActivityId === GRAPH_ACTIVITY_IDS[mode],
      );
      expect(row).toBeDefined();
      expect(row).toMatchObject({
        stableActivityId: GRAPH_ACTIVITY_IDS[mode],
        componentKey: GRAPH_COMPONENT_KEY,
        gradingConfig: { generatorKey: GRAPH_GENERATOR_KEY, variantSeed: seed },
      });
      expect(row?.gradingConfig).toEqual({ generatorKey: GRAPH_GENERATOR_KEY, variantSeed: seed });

      const props = row?.props as Record<string, unknown>;
      expect(graphAverageRateChoiceSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);

      const variant = generateTopic12GraphAverageRateChoice(seed);
      expect(props).toMatchObject({
        prompt: variant.prompt,
        domain: variant.domain,
        range: variant.range,
        xLabel: variant.xLabel,
        yLabel: variant.yLabel,
        graphPoints: variant.graphPoints,
        options: variant.options,
      });
      if (mode === "worked") {
        expect(props).toMatchObject({
          correctOptionId: variant.correctOptionId,
          steps: variant.solutionSteps,
          finalAnswer: expect.stringContaining("5 to 7"),
        });
        expect(props.correctOptionId).toBe("C");
      } else {
        for (const key of [
          "correctOptionId",
          "finalAnswer",
          "solutionSteps",
          "expectedAnswer",
          "gradingMetadata",
        ]) {
          expect(props).not.toHaveProperty(key);
        }
      }
      if (mode === "guided") {
        expect(props.guidedSteps).toEqual([
          "Calculate (change in output)/(change in input) for each interval.",
          "Compare the four average rates and select the greatest.",
        ]);
        expect(props.fieldHelp).toBe("Use the endpoint values for each option.");
      }
      if (mode === "independent") {
        const { seed: outputSeed, ...publicData } = generateTopic12GraphAverageRateChoiceOutput(
          seed,
        ).data as Record<string, unknown>;
        expect(outputSeed).toBe(seed);
        expect(props).toEqual({ ...publicData, presentationMode: "independent_practice" });
        expect(props).not.toHaveProperty("seed");
      }
    }

    expect(
      harness.rows.activities.filter(
        (row) =>
          row.stableActivityId === ACTIVITY_IDS.worked ||
          row.stableActivityId === ACTIVITY_IDS.guided ||
          row.stableActivityId === ACTIVITY_IDS.independent,
      ),
    ).toHaveLength(3);
    expect(
      harness.rows.phase_sections.some((row) =>
        Object.values(GRAPH_ACTIVITY_IDS).includes(
          (row.content as Record<string, unknown> | undefined)
            ?.activityId as (typeof GRAPH_ACTIVITY_IDS)[keyof typeof GRAPH_ACTIVITY_IDS],
        ),
      ),
    ).toBe(false);
  });

  it("upserts the three negative-rate context activities from their shared generated variants", async () => {
    const harness = createHarness();

    await getHandler()(harness.context, {});
    const secondResult = await getHandler()(harness.context, {});

    const negativeRateRows = harness.rows.activities.filter((row) =>
      Object.values(NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS).includes(
        row.stableActivityId as (typeof NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS)[keyof typeof NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS],
      ),
    );
    expect(negativeRateRows).toHaveLength(3);
    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          Object.values(NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS).includes(
            document.stableActivityId as (typeof NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS)[keyof typeof NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS],
          ),
      ),
    ).toHaveLength(3);

    const sourceVariant = generateTopic12NegativeRateContextChoice(0);
    const sourceOutput = generateTopic12NegativeRateContextChoiceOutput(0);
    const sourceExpectedAnswer = sourceOutput.expectedAnswer as { selectedOptionId: string };
    expect(sourceVariant.prompt).toBe(
      "The graph of the function y = f(x) in the xy-plane always has a negative rate of change. Which of the following definitions for the variables x and y would best model the function f?",
    );
    expect(sourceVariant.options).toEqual([
      {
        id: "A",
        label: "A",
        xDefinition: "the age, in years, of a young child",
        yDefinition: "the height, in inches, of the young child",
      },
      {
        id: "B",
        label: "B",
        xDefinition: "the total number of points scored in a basketball game",
        yDefinition: "the time remaining, in seconds, in the game",
      },
      {
        id: "C",
        label: "C",
        xDefinition: "the time, in seconds, since a ball was thrown straight up in the air",
        yDefinition: "the height, in feet, of the ball",
      },
      {
        id: "D",
        label: "D",
        xDefinition: "the radius, in meters, of a circle",
        yDefinition: "the area, in square inches, of the circle",
      },
    ]);
    expect(sourceExpectedAnswer.selectedOptionId).toBe("B");

    const expectedModes = [
      ["worked", 0, "worked_example"],
      ["guided", 1, "guided_practice"],
      ["independent", 2, "independent_practice"],
    ] as const;
    for (const [mode, seed, presentationMode] of expectedModes) {
      const row = negativeRateRows.find(
        (candidate) => candidate.stableActivityId === NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS[mode],
      );
      expect(row).toBeDefined();
      expect(row).toMatchObject({
        stableActivityId: NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS[mode],
        componentKey: NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
        gradingConfig: { generatorKey: NEGATIVE_RATE_CONTEXT_GENERATOR_KEY, variantSeed: seed },
      });
      expect(row?.gradingConfig).toEqual({
        generatorKey: NEGATIVE_RATE_CONTEXT_GENERATOR_KEY,
        variantSeed: seed,
      });

      const props = row?.props as Record<string, unknown>;
      expect(negativeRateContextChoiceSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);
      if (mode === "worked") {
        expect(props.prompt).toBe(sourceVariant.prompt);
        expect(props.options).toEqual(sourceVariant.options);
        expect(props.correctOptionId).toBe(sourceExpectedAnswer.selectedOptionId);
        expect(props.steps).toEqual(sourceOutput.solutionSteps.map((step) => step.description));
        expect(props.finalAnswer).toBe(
          "Option B is correct because x increases while y decreases.",
        );
      } else if (mode === "guided") {
        const variant = generateTopic12NegativeRateContextChoice(seed);
        expect(props).toMatchObject({
          prompt: variant.prompt,
          options: variant.options,
          guidedSteps: [
            "Determine how y changes as x increases in each option.",
            "Select the option in which y always decreases as x increases.",
          ],
          fieldHelp: "A negative rate of change means y decreases as x increases.",
        });
        expect(
          collectObjectKeys(props).filter((key) =>
            [
              "correctAnswer",
              "answerKey",
              "hidden",
              "authority",
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
              "solution",
              "steps",
            ].includes(key),
          ),
        ).toEqual([]);
      } else {
        const { seed: outputSeed, rendererProps } = generateTopic12NegativeRateContextChoiceOutput(
          seed,
        ).data as {
          seed: number;
          rendererProps: Record<string, unknown>;
        };
        expect(outputSeed).toBe(seed);
        expect(props).toEqual(rendererProps);
        expect(
          collectObjectKeys(props).filter((key) =>
            [
              "correctAnswer",
              "answerKey",
              "hidden",
              "authority",
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
              "solution",
              "steps",
            ].includes(key),
          ),
        ).toEqual([]);
      }
    }

    expect(
      harness.rows.phase_sections.some((row) =>
        Object.values(NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS).includes(
          (row.content as Record<string, unknown> | undefined)
            ?.activityId as (typeof NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS)[keyof typeof NEGATIVE_RATE_CONTEXT_ACTIVITY_IDS],
        ),
      ),
    ).toBe(false);
  });

  it("upserts the three quadratic negative-rate interval activities from their shared generated variants", async () => {
    const harness = createHarness();

    const firstResult = await getHandler()(harness.context, {});
    const secondResult = await getHandler()(harness.context, {});

    const quadraticRows = harness.rows.activities.filter((row) =>
      Object.values(QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS).includes(
        row.stableActivityId as (typeof QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS)[keyof typeof QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS],
      ),
    );
    expect(quadraticRows).toHaveLength(3);
    expect(new Set(quadraticRows.map((row) => row._id)).size).toBe(3);
    expect((firstResult as { activitiesCreated: number }).activitiesCreated).toBeGreaterThanOrEqual(
      3,
    );
    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          Object.values(QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS).includes(
            document.stableActivityId as (typeof QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS)[keyof typeof QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS],
          ),
      ),
    ).toHaveLength(3);

    const sourceVariant = generateTopic12QuadraticNegativeRateIntervalChoice(0);
    const sourceOutput = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0);
    const sourceExpectedAnswer = sourceOutput.expectedAnswer as { selectedOptionId: string };
    expect(sourceVariant.prompt).toBe(
      "The function k is defined by k(x) = 3.16 + 4.2x - 0.85x^2 for -10 <= x <= 10. Which statement about k is correct?",
    );
    expect(sourceVariant.options).toEqual([
      { id: "A", label: "A", rateSign: "positive", startInput: -10, endInput: 8.348 },
      { id: "B", label: "B", rateSign: "positive", startInput: -0.663, endInput: 5.605 },
      { id: "C", label: "C", rateSign: "negative", startInput: -10, endInput: 2.47 },
      { id: "D", label: "D", rateSign: "negative", startInput: 2.47, endInput: 10 },
    ]);
    expect(sourceExpectedAnswer.selectedOptionId).toBe("D");
    expect(sourceOutput.solutionSteps.map((step) => step.description)).toEqual([
      "The quadratic opens downward.",
      "The vertex is at x = 2.470.",
      "The rate is negative to the right of the vertex, so option D is correct.",
    ]);

    const expectedModes = [
      ["worked", 0, "worked_example"],
      ["guided", 1, "guided_practice"],
      ["independent", 2, "independent_practice"],
    ] as const;
    for (const [mode, seed, presentationMode] of expectedModes) {
      const row = quadraticRows.find(
        (candidate) =>
          candidate.stableActivityId === QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS[mode],
      );
      expect(row).toBeDefined();
      expect(row).toMatchObject({
        stableActivityId: QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS[mode],
        componentKey: QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
        gradingConfig: {
          generatorKey: QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY,
          variantSeed: seed,
        },
      });
      expect(row?.gradingConfig).toEqual({
        generatorKey: QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY,
        variantSeed: seed,
      });

      const props = row?.props as Record<string, unknown>;
      expect(quadraticNegativeRateIntervalChoiceSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);
      const variant = generateTopic12QuadraticNegativeRateIntervalChoice(seed);
      expect(props).toMatchObject({
        prompt: variant.prompt,
        functionName: variant.functionName,
        constantTerm: variant.constantTerm,
        linearCoefficient: variant.linearCoefficient,
        quadraticCoefficient: variant.quadraticCoefficient,
        domain: variant.domain,
        options: variant.options,
      });
      if (mode === "worked") {
        expect(props.correctOptionId).toBe(sourceExpectedAnswer.selectedOptionId);
        expect(props.steps).toEqual(sourceOutput.solutionSteps.map((step) => step.description));
        expect(props.finalAnswer).toBe(
          "Option D is correct because the rate is negative to the right of the vertex.",
        );
      } else if (mode === "guided") {
        expect(props.guidedSteps).toEqual([
          "Identify that the negative quadratic coefficient makes the parabola open downward.",
          "Find the vertex with x = -b/(2a).",
          "Use the right side of the vertex as the negative-rate interval.",
          "Select the one true statement.",
        ]);
        expect(props.fieldHelp).toBe(
          "A downward-opening quadratic has a negative rate of change to the right of its vertex.",
        );
        expect(
          collectObjectKeys(props).filter((key) =>
            [
              "correctAnswer",
              "answerKey",
              "hidden",
              "authority",
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
              "solution",
              "steps",
              "vertexX",
            ].includes(key),
          ),
        ).toEqual([]);
      } else {
        const { seed: outputSeed, rendererProps } =
          generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed).data as {
            seed: number;
            rendererProps: Record<string, unknown>;
          };
        expect(outputSeed).toBe(seed);
        expect(props).toEqual(rendererProps);
        expect(props).not.toHaveProperty("seed");
        expect(
          collectObjectKeys(props).filter((key) =>
            [
              "correctAnswer",
              "answerKey",
              "hidden",
              "authority",
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
              "solution",
              "steps",
              "vertexX",
            ].includes(key),
          ),
        ).toEqual([]);
      }
    }

    expect(
      harness.rows.phase_sections.some((row) =>
        Object.values(QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS).includes(
          (row.content as Record<string, unknown> | undefined)
            ?.activityId as (typeof QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS)[keyof typeof QUADRATIC_NEGATIVE_RATE_INTERVAL_ACTIVITY_IDS],
        ),
      ),
    ).toBe(false);
  });

  it("upserts the three pointwise least-rate activities from their shared generated variants", async () => {
    const harness = createHarness();

    await getHandler()(harness.context, {});
    const secondResult = await getHandler()(harness.context, {});

    const pointwiseRows = harness.rows.activities.filter((row) =>
      Object.values(POINTWISE_ACTIVITY_IDS).includes(
        row.stableActivityId as (typeof POINTWISE_ACTIVITY_IDS)[keyof typeof POINTWISE_ACTIVITY_IDS],
      ),
    );
    expect(pointwiseRows).toHaveLength(3);
    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          Object.values(POINTWISE_ACTIVITY_IDS).includes(
            document.stableActivityId as (typeof POINTWISE_ACTIVITY_IDS)[keyof typeof POINTWISE_ACTIVITY_IDS],
          ),
      ),
    ).toHaveLength(3);

    const expectedModes = [
      ["worked", 0, "worked_example"],
      ["guided", 1, "guided_practice"],
      ["independent", 2, "independent_practice"],
    ] as const;
    for (const [mode, seed, presentationMode] of expectedModes) {
      const row = pointwiseRows.find(
        (candidate) => candidate.stableActivityId === POINTWISE_ACTIVITY_IDS[mode],
      );
      expect(row).toBeDefined();
      expect(row).toMatchObject({
        stableActivityId: POINTWISE_ACTIVITY_IDS[mode],
        componentKey: POINTWISE_COMPONENT_KEY,
        gradingConfig: { generatorKey: POINTWISE_GENERATOR_KEY, variantSeed: seed },
      });
      expect(row?.gradingConfig).toEqual({
        generatorKey: POINTWISE_GENERATOR_KEY,
        variantSeed: seed,
      });

      const props = row?.props as Record<string, unknown>;
      expect(pointwiseLeastRateChoiceSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);
      const variant = generateTopic12PointwiseLeastRateChoice(seed);
      expect(props).toMatchObject({
        prompt: variant.prompt,
        domain: variant.domain,
        range: variant.range,
        xLabel: variant.xLabel,
        yLabel: variant.yLabel,
        graphPoints: variant.graphPoints,
        labeledPoints: variant.labeledPoints,
        options: variant.options,
      });
      if (mode === "worked") {
        expect(props).toMatchObject({
          correctOptionId: variant.correctOptionId,
          steps: variant.solutionSteps,
          finalAnswer: "Point D has the least rate of change (option D).",
        });
        expect(props.correctOptionId).toBe("D");
        expect(props.labeledPoints).toEqual([
          { id: "A", label: "A", pointIndex: 2, x: -3.5, y: -1.2 },
          { id: "B", label: "B", pointIndex: 4, x: -1, y: 1 },
          { id: "C", label: "C", pointIndex: 8, x: 2.3, y: 2.3 },
          { id: "D", label: "D", pointIndex: 11, x: 4, y: -1 },
        ]);
      } else {
        for (const key of [
          "correctOptionId",
          "finalAnswer",
          "steps",
          "expectedAnswer",
          "gradingMetadata",
          "solutionSteps",
          "correctAnswer",
          "score",
          "isCorrect",
        ]) {
          expect(props).not.toHaveProperty(key);
        }
      }
      if (mode === "guided") {
        expect(props.guidedSteps).toEqual([
          "Compare whether the graph is rising or falling at each labeled point.",
          "Among the falling points, compare steepness and select the most negative rate.",
        ]);
        expect(props.fieldHelp).toBe("A steeper downward graph has a smaller rate of change.");
      }
      if (mode === "independent") {
        const { seed: outputSeed, ...publicData } = generateTopic12PointwiseLeastRateChoiceOutput(
          seed,
        ).data as Record<string, unknown>;
        expect(outputSeed).toBe(seed);
        expect(props).toEqual({ ...publicData, presentationMode: "independent_practice" });
        expect(props).not.toHaveProperty("seed");
      }
    }

    expect(
      harness.rows.phase_sections.some((row) =>
        Object.values(POINTWISE_ACTIVITY_IDS).includes(
          (row.content as Record<string, unknown> | undefined)
            ?.activityId as (typeof POINTWISE_ACTIVITY_IDS)[keyof typeof POINTWISE_ACTIVITY_IDS],
        ),
      ),
    ).toBe(false);
  });

  it("upserts the three pointwise rate-ordering activities from their shared generated variants", async () => {
    const harness = createHarness();

    await getHandler()(harness.context, {});
    const secondResult = await getHandler()(harness.context, {});

    const orderingRows = harness.rows.activities.filter((row) =>
      Object.values(ORDERING_ACTIVITY_IDS).includes(
        row.stableActivityId as (typeof ORDERING_ACTIVITY_IDS)[keyof typeof ORDERING_ACTIVITY_IDS],
      ),
    );
    expect(orderingRows).toHaveLength(3);
    expect((secondResult as { activitiesCreated: number }).activitiesCreated).toBe(0);
    expect(
      harness.inserts.filter(
        ({ table, document }) =>
          table === "activities" &&
          Object.values(ORDERING_ACTIVITY_IDS).includes(
            document.stableActivityId as (typeof ORDERING_ACTIVITY_IDS)[keyof typeof ORDERING_ACTIVITY_IDS],
          ),
      ),
    ).toHaveLength(3);

    const expectedModes = [
      ["worked", 0, "worked_example"],
      ["guided", 1, "guided_practice"],
      ["independent", 2, "independent_practice"],
    ] as const;
    for (const [mode, seed, presentationMode] of expectedModes) {
      const row = orderingRows.find(
        (candidate) => candidate.stableActivityId === ORDERING_ACTIVITY_IDS[mode],
      );
      expect(row).toBeDefined();
      expect(row).toMatchObject({
        stableActivityId: ORDERING_ACTIVITY_IDS[mode],
        componentKey: ORDERING_COMPONENT_KEY,
        gradingConfig: { generatorKey: ORDERING_GENERATOR_KEY, variantSeed: seed },
      });
      expect(row?.gradingConfig).toEqual({
        generatorKey: ORDERING_GENERATOR_KEY,
        variantSeed: seed,
      });

      const props = row?.props as Record<string, unknown>;
      expect(pointwiseRateOrderingSchema.safeParse(props).success).toBe(true);
      expect(props.presentationMode).toBe(presentationMode);
      const variant = generateTopic12PointwiseRateOrdering(seed);
      expect(props).toMatchObject({
        prompt: variant.prompt,
        domain: variant.domain,
        range: variant.range,
        xLabel: variant.xLabel,
        yLabel: variant.yLabel,
        graphPoints: variant.graphPoints,
        labeledPoints: variant.labeledPoints,
      });
      if (mode === "worked") {
        expect(props).toMatchObject({
          orderedPointIds: ["B", "C", "A"],
          steps: variant.solutionSteps,
          finalAnswer: "The least-to-greatest order is B < C < A.",
        });
        expect(props.labeledPoints).toEqual([
          { id: "A", label: "A", pointIndex: 2, x: -3, y: 0 },
          { id: "B", label: "B", pointIndex: 5, x: -1, y: 1 },
          { id: "C", label: "C", pointIndex: 8, x: 2.3, y: -2.1 },
        ]);
        expect(props.orderedPointIds).toEqual(["B", "C", "A"]);
      } else {
        for (const key of [
          "orderedPointIds",
          "expectedAnswer",
          "gradingMetadata",
          "steps",
          "solutionSteps",
          "finalAnswer",
          "correctOptionId",
          "correctAnswer",
          "score",
          "isCorrect",
        ]) {
          expect(props).not.toHaveProperty(key);
        }
      }
      if (mode === "guided") {
        expect(props.guidedSteps).toEqual([
          "Compare local direction and steepness at each labeled point.",
          "Order the rates from least to greatest.",
        ]);
        expect(props.fieldHelp).toBe("A steeper downward graph has a smaller rate of change.");
      }
      if (mode === "independent") {
        const { seed: outputSeed, ...publicData } = generateTopic12PointwiseRateOrderingOutput(seed)
          .data as Record<string, unknown>;
        expect(outputSeed).toBe(seed);
        expect(props).toEqual({ ...publicData, presentationMode: "independent_practice" });
        expect(props).not.toHaveProperty("seed");
        expect(props).not.toHaveProperty("guidedSteps");
        expect(props).not.toHaveProperty("fieldHelp");
      }
    }

    expect(
      harness.rows.phase_sections.some((row) =>
        Object.values(ORDERING_ACTIVITY_IDS).includes(
          (row.content as Record<string, unknown> | undefined)
            ?.activityId as (typeof ORDERING_ACTIVITY_IDS)[keyof typeof ORDERING_ACTIVITY_IDS],
        ),
      ),
    ).toBe(false);
  });
});
