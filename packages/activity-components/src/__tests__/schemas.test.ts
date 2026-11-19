import { describe, it, expect } from "vitest";
import {
  comprehensionQuizSchema,
  fillInTheBlankSchema,
  rateOfChangeCalculatorSchema,
  discriminantAnalyzerSchema,
  graphingExplorerSchema,
  intervalClassificationSchema,
  getPropsSchema,
  SCHEMA_REGISTRY,
  ActivityComponentKey,
} from "../schemas";

describe("intervalClassificationSchema", () => {
  it("accepts a finite graph with a real constant interval", () => {
    expect(
      intervalClassificationSchema.safeParse({
        prompt: "Classify all intervals.",
        domain: [0, 8],
        changePoints: [2, 4],
        points: [
          { x: 0, y: 5 },
          { x: 2, y: 8 },
          { x: 4, y: 8 },
          { x: 8, y: 6 },
        ],
        presentationMode: "independent_practice",
      }).success,
    ).toBe(true);
  });
});

describe("comprehensionQuizSchema", () => {
  it("should validate a valid quiz", () => {
    const result = comprehensionQuizSchema.safeParse({
      questions: [
        {
          id: "q1",
          prompt: "What is 2+2?",
          correctAnswer: "4",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty questions array", () => {
    const result = comprehensionQuizSchema.safeParse({ questions: [] });
    expect(result.success).toBe(false);
  });

  it("should reject question without prompt", () => {
    const result = comprehensionQuizSchema.safeParse({
      questions: [{ id: "q1", correctAnswer: "4" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("fillInTheBlankSchema", () => {
  it("should validate a valid template with matching blanks", () => {
    const result = fillInTheBlankSchema.safeParse({
      template: "Hello {{blank:name}}, you are {{blank:age}} years old.",
      blanks: [
        { id: "name", correctAnswer: "World" },
        { id: "age", correctAnswer: "25" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject template without matching blank markers", () => {
    const result = fillInTheBlankSchema.safeParse({
      template: "Hello world",
      blanks: [{ id: "name", correctAnswer: "World" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a blank without a client-visible answer", () => {
    const result = fillInTheBlankSchema.safeParse({
      template: "Hello {{blank:name}}",
      blanks: [{ id: "name" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("rateOfChangeCalculatorSchema", () => {
  it("should validate table data with matching arrays", () => {
    const result = rateOfChangeCalculatorSchema.safeParse({
      sourceType: "table",
      data: { x: [1, 2, 3], y: [4, 5, 6] },
      interval: { start: 1, end: 3 },
    });
    expect(result.success).toBe(true);
  });

  it("should reject interval where start >= end", () => {
    const result = rateOfChangeCalculatorSchema.safeParse({
      sourceType: "table",
      data: { x: [1, 2], y: [3, 4] },
      interval: { start: 5, end: 3 },
    });
    expect(result.success).toBe(false);
  });

  it("should reject table data with mismatched array lengths", () => {
    const result = rateOfChangeCalculatorSchema.safeParse({
      sourceType: "table",
      data: { x: [1, 2, 3], y: [4, 5] },
      interval: { start: 1, end: 3 },
    });
    expect(result.success).toBe(false);
  });
});

describe("discriminantAnalyzerSchema", () => {
  it("should validate a quadratic equation", () => {
    const result = discriminantAnalyzerSchema.safeParse({
      equation: "2x^2 + 3x - 5 = 0",
    });
    expect(result.success).toBe(true);
  });

  it("should reject non-quadratic equation", () => {
    const result = discriminantAnalyzerSchema.safeParse({
      equation: "3x + 5 = 0",
    });
    expect(result.success).toBe(false);
  });

  it("should reject equation with zero x^2 coefficient", () => {
    const result = discriminantAnalyzerSchema.safeParse({
      equation: "0x^2 + 3x - 5 = 0",
    });
    expect(result.success).toBe(false);
  });
});

describe("SCHEMA_REGISTRY", () => {
  it("should contain the exact 25 activity keys", () => {
    expect(Object.keys(SCHEMA_REGISTRY)).toEqual([
      "graphing-explorer",
      "step-by-step-solver",
      "comprehension-quiz",
      "fill-in-the-blank",
      "rate-of-change-calculator",
      "discriminant-analyzer",
      "interval-classification",
      "physical-context-graph-choice",
      "table-average-rate-choice",
      "graph-average-rate-choice",
      "pointwise-least-rate-choice",
      "pointwise-rate-ordering",
      "negative-rate-context-choice",
      "quadratic-negative-rate-interval-choice",
      "rate-pattern-classification",
      "concavity-from-rate-change",
      "polynomial-degree-leading-coefficient",
      "polynomial-extrema-from-graph",
      "rate-sign-and-trend-from-graph",
      "polynomial-end-behavior",
      "polynomial-limit-notation-end-behavior",
      "real-zeros-and-multiplicities",
      "least-polynomial-degree",
      "polynomial-inequality-sign-chart",
      "polynomial-equation-end-behavior",
    ]);
  });

  it("should have zod schemas for each key", () => {
    const keys: ActivityComponentKey[] = [
      "graphing-explorer",
      "step-by-step-solver",
      "comprehension-quiz",
      "fill-in-the-blank",
      "rate-of-change-calculator",
      "discriminant-analyzer",
      "interval-classification",
      "physical-context-graph-choice",
      "table-average-rate-choice",
      "graph-average-rate-choice",
      "pointwise-least-rate-choice",
      "pointwise-rate-ordering",
      "negative-rate-context-choice",
      "quadratic-negative-rate-interval-choice",
      "rate-pattern-classification",
      "concavity-from-rate-change",
      "polynomial-degree-leading-coefficient",
      "polynomial-extrema-from-graph",
      "rate-sign-and-trend-from-graph",
      "polynomial-end-behavior",
      "polynomial-limit-notation-end-behavior",
      "real-zeros-and-multiplicities",
      "least-polynomial-degree",
      "polynomial-inequality-sign-chart",
      "polynomial-equation-end-behavior",
    ];
    keys.forEach((key) => {
      expect(SCHEMA_REGISTRY[key]).toBeDefined();
      expect(typeof SCHEMA_REGISTRY[key].safeParse).toBe("function");
    });
  });
});

describe("getPropsSchema", () => {
  it("should return schema for valid key", () => {
    const schema = getPropsSchema("comprehension-quiz");
    expect(schema).toBeDefined();
  });

  it("should return undefined for invalid key", () => {
    const schema = getPropsSchema("nonexistent");
    expect(schema).toBeUndefined();
  });
});

describe("graphingExplorerSchema Example 3 response props", () => {
  it("accepts estimated root interval renderer props but rejects answer fields", () => {
    const rendererProps = {
      equation: "f(x) = -x^2 + 3x + 7",
      variant: "plot_from_equation" as const,
      responseVariant: "estimated_root_intervals",
      originalEquation: "-x^2 + 3x + 7 = 0",
      points: [
        [-2, -3],
        [-1, 3],
        [0, 7],
        [1, 9],
        [2, 9],
        [3, 7],
        [4, 3],
        [5, -3],
      ] as [number, number][],
    };

    expect(graphingExplorerSchema.safeParse(rendererProps).success).toBe(true);
    expect(
      graphingExplorerSchema.safeParse({
        ...rendererProps,
        root_intervals: [
          [-2, -1],
          [4, 5],
        ],
      }).success,
    ).toBe(false);
  });
});
