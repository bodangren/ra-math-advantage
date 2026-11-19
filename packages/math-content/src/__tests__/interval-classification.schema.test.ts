import { describe, expect, it } from "vitest";

import { intervalClassificationSchema, SCHEMA_REGISTRY } from "../index";

const commonProps = {
  prompt: "Identify the intervals where the graph increases, decreases, and stays constant.",
  domain: [0, 9],
  changePoints: [3, 7],
  points: [
    { x: 0, y: 1 },
    { x: 3, y: 5 },
    { x: 7, y: 2 },
    { x: 9, y: 6 },
  ],
};

const workedProps = {
  ...commonProps,
  presentationMode: "worked_example" as const,
  steps: [
    {
      description: "Read the graph from left to right.",
      expression: "x = 0 to x = 9",
      result: "Track each segment.",
    },
    { description: "Read the first segment.", expression: "0 < x < 3", result: "The graph rises." },
  ],
  finalAnswer: "[0,3] U [7,9]",
};

const titledWorkedProps = {
  ...workedProps,
  title: "Worked Example: Find Increasing Intervals",
};

const guidedProps = {
  ...commonProps,
  presentationMode: "guided_practice" as const,
  guidedSteps: [
    "Mark the domain endpoints and change points.",
    "Read each segment from left to right.",
    "Write each interval.",
  ],
  fieldHelp: {
    increasingIntervals: "Find every segment that rises.",
    decreasingIntervals: "Find every segment that falls.",
    constantIntervals: "Check whether any segment stays flat.",
  },
};

const independentProps = {
  ...commonProps,
  presentationMode: "independent_practice" as const,
};

describe("intervalClassificationSchema", () => {
  it("accepts each strict presentation mode", () => {
    expect(intervalClassificationSchema.safeParse(workedProps).success).toBe(true);
    expect(intervalClassificationSchema.safeParse(titledWorkedProps).success).toBe(true);
    expect(intervalClassificationSchema.safeParse(guidedProps).success).toBe(true);
    expect(intervalClassificationSchema.safeParse(independentProps).success).toBe(true);
    expect(SCHEMA_REGISTRY["interval-classification"]).toBe(intervalClassificationSchema);
  });

  it("rejects an empty optional title", () => {
    expect(intervalClassificationSchema.safeParse({ ...workedProps, title: "" }).success).toBe(
      false,
    );
  });

  it("does not include answer or solution fields in Guided or Independent props", () => {
    for (const props of [guidedProps, independentProps]) {
      expect(JSON.stringify(props)).not.toMatch(/"(?:answer|finalAnswer|workedExample|solution)"/);
    }
  });

  it("rejects unusable graph geometry", () => {
    expect(
      intervalClassificationSchema.safeParse({
        ...workedProps,
        points: workedProps.points.slice(0, 3),
      }).success,
    ).toBe(false);
    expect(intervalClassificationSchema.safeParse({ ...workedProps, domain: [0, 0] }).success).toBe(
      false,
    );
    expect(
      intervalClassificationSchema.safeParse({ ...workedProps, changePoints: [7, 3] }).success,
    ).toBe(false);
    expect(
      intervalClassificationSchema.safeParse({
        ...workedProps,
        points: workedProps.points.map((point, index) => ({
          ...point,
          x: index === 1 ? 4 : point.x,
        })),
      }).success,
    ).toBe(false);
    expect(
      intervalClassificationSchema.safeParse({
        ...workedProps,
        points: workedProps.points.map((point, index) => ({ ...point, y: [5, 5, 5, 5][index] })),
      }).success,
    ).toBe(false);
  });
  it("rejects non-finite graph values", () => {
    expect(
      intervalClassificationSchema.safeParse({
        ...workedProps,
        points: [{ x: 0, y: Number.NaN }],
      }).success,
    ).toBe(false);
  });
});
