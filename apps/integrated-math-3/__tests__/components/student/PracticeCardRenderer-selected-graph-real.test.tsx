import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { transformDataToCanvas } from "@math-platform/graphing-core/canvas-utils";
import { describe, expect, it, vi } from "vitest";
import { PracticeCardRenderer } from "@/components/student/PracticeCardRenderer";
import { resolveDailyPracticeQueue } from "@/convex/queue/queue";
import { buildIm3GuidedPilotSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import { gradeServerOwnedSubmission } from "@/lib/activities/server-grading";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from "@/lib/practice/learning-evidence-pilot";

vi.mock("@/components/practice-timing", () => ({
  usePracticeTiming: () => ({ getTiming: () => undefined }),
}));

function selectedQueueContext() {
  const generated = buildIm3GuidedPilotSeedDocuments(
    "physical-guided" as never,
    1,
  );
  const activity = {
    _id: "physical-guided",
    ...generated.activity,
    approval: { status: "approved" },
    srsEligible: true,
  };
  const rows = {
    srs_cards: [
      {
        _id: "card",
        studentId: "student",
        objectiveId: IM3_PILOT_NODE,
        variantKey: generated.variant.variantKey,
        stability: 1,
        difficulty: 5,
        state: "review",
        dueDate: "2026-09-07T00:00:00.000Z",
        elapsedDays: 1,
        scheduledDays: 1,
        reps: 1,
        lapses: 0,
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    objective_policies: [
      {
        _id: "policy",
        standardId: "standard",
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ],
    practice_items: [{ _id: "practice-item", ...generated.item }],
  };
  const documents: Record<string, unknown> = {
    standard: { _id: "standard", code: IM3_PILOT_NODE },
    "physical-guided": activity,
  };
  const db = {
    get: vi.fn(async (id: string) => documents[id] ?? null),
    query: vi.fn((table: keyof typeof rows) => ({
      withIndex: vi.fn(
        (
          _name: string,
          apply?: (query: {
            eq: (field: string, value: string) => unknown;
          }) => void,
        ) => {
          let field: string | undefined;
          let value: string | undefined;
          apply?.({
            eq: (nextField, nextValue) => {
              field = nextField;
              value = nextValue;
              return undefined;
            },
          });
          const selected = rows[table].filter(
            (row) =>
              !field || (row as Record<string, unknown>)[field] === value,
          );
          return {
            collect: async () => selected,
            take: async (count: number) => selected.slice(0, count),
            first: async () => selected[0] ?? null,
          };
        },
      ),
    })),
  };
  return { activity, db };
}

describe("selected graph queue and real activity", () => {
  it("preserves the resolver identity, graph response, and Guided assistance", async () => {
    const { activity, db } = selectedQueueContext();
    const queue = await resolveDailyPracticeQueue(
      { db } as never,
      { studentId: "student", asOfDate: "2026-09-07T00:00:00.000Z" },
      {
        nodes: [
          { id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" },
        ],
        blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
      },
    );
    expect(queue).toHaveLength(1);
    expect(queue[0]?.props).toMatchObject({
      equation: "y = x^2 - x - 2",
      responseVariant: "table_graph",
      activityId: "physical-guided",
      stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      practiceMode: "guided_practice",
    });

    const onSubmit = vi.fn();
    render(
      <PracticeCardRenderer
        queueItem={queue[0]!}
        currentIndex={0}
        totalCount={1}
        onSubmit={onSubmit}
        onComplete={vi.fn()}
      />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Show Vertex" }));
    fireEvent.click(screen.getByRole("button", { name: "Show Direction" }));
    const points = [
      { x: -2, y: 4 },
      { x: -1, y: 0 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
      { x: 2, y: 0 },
    ];
    screen
      .getAllByRole("spinbutton")
      .forEach((input, index) =>
        fireEvent.change(input, {
          target: { value: String(points[index]!.y) },
        }),
      );
    const canvas = screen.getByRole("img", { name: /coordinate plane/i });
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 600,
      bottom: 600,
      width: 600,
      height: 600,
      toJSON: () => ({}),
    });
    for (const point of points) {
      const pixel = transformDataToCanvas(
        point.x,
        point.y,
        activity.props.domain as [number, number],
        activity.props.range as [number, number],
        600,
        600,
      );
      fireEvent.click(canvas, {
        clientX: pixel.canvasX,
        clientY: pixel.canvasY,
      });
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const envelope = onSubmit.mock.calls[0][0];
    expect(envelope).toMatchObject({
      contractVersion: "practice.v1",
      activityId: "physical-guided",
      mode: "guided_practice",
    });
    expect(
      envelope.parts.map(
        ({ partId, hintsUsed }: { partId: string; hintsUsed?: number }) => ({
          partId,
          hintsUsed,
        }),
      ),
    ).toEqual([
      { partId: "table_values", hintsUsed: 0 },
      { partId: "placed_points", hintsUsed: 2 },
    ]);
    expect(envelope.parts[1].rawAnswer).toEqual(points);
    expect(
      gradeServerOwnedSubmission({ id: activity._id, ...activity }, envelope),
    ).toMatchObject({ score: 2, maxScore: 2 });
  });
});
