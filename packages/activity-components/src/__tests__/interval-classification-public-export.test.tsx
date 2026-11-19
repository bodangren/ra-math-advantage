import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { IntervalClassificationActivity, type IntervalClassificationProps } from "../index";

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

it("exports the interval classification component and props type from the public package", () => {
  render(
    <IntervalClassificationActivity {...props} activityId="public-export-test" mode="practice" />,
  );
  expect(screen.getByText("Classify each interval.")).toBeTruthy();
});
