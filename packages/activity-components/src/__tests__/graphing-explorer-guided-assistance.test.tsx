import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GraphingExplorerActivity } from "../components/graphing/GraphingExplorerActivity";

describe("table-and-graph assistance telemetry", () => {
  it.each(["guided", "practice"] as const)("records assistance in %s mode", async (mode) => {
    const onSubmit = vi.fn(async (_payload: unknown) => undefined);
    render(
      <GraphingExplorerActivity
        activityId="graph-assistance"
        mode={mode}
        responseVariant="table_graph"
        equation="y = -x^2 - 1"
        onSubmit={onSubmit}
      />,
    );

    if (mode === "guided") {
      fireEvent.click(screen.getByRole("button", { name: "Show Vertex" }));
      fireEvent.click(screen.getByRole("button", { name: "Show Direction" }));
      expect(screen.getByRole("button", { name: "Show Vertex" })).toHaveProperty("disabled", true);
    } else {
      expect(screen.queryByRole("button", { name: "Show Vertex" })).toBeNull();
    }
    const values = [-5, -2, -1, -2, -5];
    screen.getAllByRole("spinbutton").forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(values[index]) } });
    });
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
    fireEvent.click(canvas, { clientX: 300, clientY: 330 });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const envelope = onSubmit.mock.calls[0][0] as unknown as {
      parts: Array<{ partId: string; hintsUsed?: number }>;
    };
    expect(envelope.parts.map(({ partId, hintsUsed }) => ({ partId, hintsUsed }))).toEqual([
      { partId: "table_values", hintsUsed: 0 },
      { partId: "placed_points", hintsUsed: mode === "guided" ? 2 : 0 },
    ]);
  });
});
