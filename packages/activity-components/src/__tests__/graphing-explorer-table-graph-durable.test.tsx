import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const graphingCanvasProps = vi.hoisted(() => vi.fn());

vi.mock("../components/graphing/GraphingCanvas", () => ({
  GraphingCanvas: (props: {
    functions: unknown[];
    onPointAdd?: (point: { x: number; y: number }) => void;
  }) => {
    graphingCanvasProps(props);
    return (
      <div data-testid="mock-graphing-canvas">
        <button type="button" onClick={() => props.onPointAdd?.({ x: -2, y: -3 })}>
          Place point
        </button>
      </div>
    );
  },
}));

vi.mock("../components/graphing/InteractiveTableOfValues", () => ({
  InteractiveTableOfValues: (props: {
    onTableComplete: (points: Array<{ x: number; y: number }>) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        props.onTableComplete([
          { x: -2, y: -3 },
          { x: -1, y: -4 },
          { x: 0, y: -3 },
          { x: 1, y: 0 },
          { x: 2, y: 5 },
        ])
      }
    >
      Complete table
    </button>
  ),
}));

import { GraphingExplorerActivity } from "../components/graphing/GraphingExplorerActivity";

describe("table graph durable submission", () => {
  it.each(["guided", "practice"] as const)(
    "waits for storage and permits retry in %s mode",
    async (mode) => {
      let resolveSave!: () => void;
      let rejectSave!: (error: Error) => void;
      const onSubmit = vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<void>((resolve, reject) => {
              resolveSave = resolve;
              rejectSave = reject;
            }),
        )
        .mockImplementationOnce(
          () =>
            new Promise<void>((resolve) => {
              resolveSave = resolve;
            }),
        );
      const onComplete = vi.fn();
      render(
        <GraphingExplorerActivity
          activityId="durable-graph"
          mode={mode}
          responseVariant="table_graph"
          equation="y = -x^2 - 1"
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Complete table" }));
      fireEvent.click(screen.getByRole("button", { name: "Place point" }));
      const button = screen.getByRole("button", { name: "Submit" });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(button).toHaveProperty("disabled", true);
      expect(screen.queryByTestId("deferred-submission-recorded")).toBeNull();
      expect(onComplete).not.toHaveBeenCalled();
      await act(async () => rejectSave(new Error("storage unavailable")));
      expect(screen.getByRole("alert").textContent).toContain("could not be saved");
      expect(button).toHaveProperty("disabled", false);
      expect(onComplete).not.toHaveBeenCalled();
      fireEvent.click(button);
      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(onSubmit.mock.calls[1][0].parts).toEqual(onSubmit.mock.calls[0][0].parts);
      await act(async () => resolveSave());
      await waitFor(() => expect(screen.getByTestId("deferred-submission-recorded")).toBeTruthy());
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(graphingCanvasProps.mock.lastCall![0].functions).toEqual([]);
    },
  );

  it("does not claim storage without a submission handler", async () => {
    render(
      <GraphingExplorerActivity
        activityId="missing-writer"
        mode="practice"
        responseVariant="table_graph"
        equation="y = -x^2 - 1"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Complete table" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.queryByTestId("deferred-submission-recorded")).toBeNull();
  });
});
