import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrecalculusMasteryAdvantagePilot } from "@/components/student/PrecalculusMasteryAdvantagePilot";
import { PrecalculusTopic11DailyCurriculumPilot } from "@/components/student/PrecalculusTopic11DailyCurriculumPilot";
import { generateTopic11IntervalGraph } from "@/lib/practice/topic11-interval-graph";
import { PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const worked = generateTopic11IntervalGraph(0);

describe("Topic 1.1 generated student graph", () => {
  it("renders the seed-0 graph in both student components", () => {
    render(
      <>
        <PrecalculusTopic11DailyCurriculumPilot
          stableActivityId={PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID}
          activityProps={{
            title: "Worked Example: Classify Graph Intervals",
            prompt: "Classify the intervals.",
            domain: [...worked.domain] as [number, number],
            changePoints: [...worked.changePoints] as [number, number],
            points: worked.points.map(({ x, y }) => ({ x, y })),
            presentationMode: "worked_example",
            steps: [{ description: "Read the graph.", expression: "x=0 to x=9" }],
            finalAnswer: "Increasing, decreasing, and constant intervals.",
          }}
        />
        <PrecalculusMasteryAdvantagePilot />
      </>,
    );

    const graphs = screen.getAllByRole("img", {
      name: /interval graph/i,
    });
    expect(graphs).toHaveLength(2);

    for (const graph of graphs) {
      expect(Array.from(graph.querySelectorAll("text"), (text) => text.textContent)).toEqual([
        "0",
        "3",
        "7",
        "9",
      ]);
      expect(graph).toHaveAttribute("aria-labelledby", expect.stringContaining("-description"));
      expect(graph.querySelector("desc")).toHaveTextContent(
        /domain 0 to 9.*\(0, 1\), \(3, 7\), \(7, 2\), \(9, 6\)/i,
      );
      expect(graph).not.toHaveTextContent("-3");
      expect(graph).not.toHaveTextContent("-1");
      expect(graph).not.toHaveTextContent("5");
    }
  });
});
