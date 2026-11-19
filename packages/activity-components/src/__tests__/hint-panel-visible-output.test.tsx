import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HintPanel, type HintData } from "../components/graphing/HintPanel";

describe("HintPanel visible output", () => {
  it("shows and preserves computed quadratic hint results", () => {
    const onHintUsed = vi.fn<(hint: HintData) => void>();
    const now = vi.spyOn(Date, "now").mockReturnValue(1_757_200_000_000);

    try {
      render(<HintPanel functionExpression="f(x) = x^2 + 2x - 3" onHintUsed={onHintUsed} />);

      const axisButton = screen.getByRole("button", { name: "Show Axis of Symmetry" });
      const vertexButton = screen.getByRole("button", { name: "Show Vertex" });
      const directionButton = screen.getByRole("button", { name: "Show Direction" });

      fireEvent.click(axisButton);
      expect(screen.getByText("Axis of symmetry: x = -1")).toBeTruthy();
      expect((axisButton as HTMLButtonElement).disabled).toBe(true);
      expect(onHintUsed).toHaveBeenNthCalledWith(1, {
        type: "axis_of_symmetry",
        data: { x: -1 },
        timestamp: 1_757_200_000_000,
      });

      fireEvent.click(vertexButton);
      expect(screen.getByText("Axis of symmetry: x = -1")).toBeTruthy();
      expect(screen.getByText("Vertex: (-1, -4)")).toBeTruthy();
      expect((vertexButton as HTMLButtonElement).disabled).toBe(true);
      expect(onHintUsed).toHaveBeenNthCalledWith(2, {
        type: "vertex",
        data: { x: -1, y: -4 },
        timestamp: 1_757_200_000_000,
      });

      fireEvent.click(directionButton);
      expect(screen.getByText("Axis of symmetry: x = -1")).toBeTruthy();
      expect(screen.getByText("Vertex: (-1, -4)")).toBeTruthy();
      expect(screen.getByText("The parabola opens upward.")).toBeTruthy();
      expect((directionButton as HTMLButtonElement).disabled).toBe(true);
      expect(onHintUsed).toHaveBeenNthCalledWith(3, {
        type: "direction",
        data: { opens: "up" },
        timestamp: 1_757_200_000_000,
      });
    } finally {
      now.mockRestore();
    }
  });
});
