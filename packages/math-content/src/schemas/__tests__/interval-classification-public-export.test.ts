import { expect, it } from "vitest";
import { intervalClassificationSchema, type IntervalClassificationProps } from "../index";

it("exports the interval classification schema and props type from the public schema barrel", () => {
  const props: IntervalClassificationProps = {
    prompt: "Classify each interval.",
    domain: [0, 3],
    changePoints: [1, 2],
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 0 },
    ],
    presentationMode: "independent_practice",
  };
  expect(intervalClassificationSchema.parse(props)).toEqual(props);
});
