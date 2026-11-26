import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InteractiveTableOfValues } from "@math-platform/activity-components/graphing";

describe("InteractiveTableOfValues", () => {
  const defaultProps = {
    xValues: [-2, -1, 0, 1, 2],
    functionExpression: "x^2 + 2x - 3",
    onTableComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial rendering", () => {
    it("renders table with x and f(x) headers", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      expect(screen.getByText("x")).toBeInTheDocument();
      expect(screen.getByText("f(x)")).toBeInTheDocument();
    });

    it("pre-populates table with x-values", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      expect(screen.getByText("-2")).toBeInTheDocument();
      expect(screen.getByText("-1")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("renders empty input fields for f(x) values", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBe(5);

      inputs.forEach((input) => {
        expect((input as HTMLInputElement).value).toBe("");
      });
    });

    it("disables all inputs when readonly", () => {
      render(<InteractiveTableOfValues {...defaultProps} readonly={true} />);

      const inputs = screen.getAllByRole("spinbutton");
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe("row validation on entry", () => {
    it("validates entered value against function expression", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      const firstInput = inputs[0];

      fireEvent.change(firstInput, { target: { value: "-3" } });

      const firstRow = firstInput.closest("tr");
      expect(firstRow).not.toHaveClass("bg-red-100");
    });

    it("shows error styling for incorrect values", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      const firstInput = inputs[0];

      fireEvent.change(firstInput, { target: { value: "999" } });

      const firstRow = firstInput.closest("tr");
      expect(firstRow).toHaveClass("bg-red-100");
    });

    it("shows success styling for correct values", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      const firstInput = inputs[0];

      fireEvent.change(firstInput, { target: { value: "-3" } });

      const firstRow = firstInput.closest("tr");
      expect(firstRow).toHaveClass("bg-green-100");
    });

    it("handles decimal values correctly", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      const secondInput = inputs[1];

      fireEvent.change(secondInput, { target: { value: "-4" } });

      const secondRow = secondInput.closest("tr");
      expect(secondRow).toHaveClass("bg-green-100");
    });

    it("clears error styling when corrected", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      const firstInput = inputs[0];

      fireEvent.change(firstInput, { target: { value: "999" } });
      let firstRow = firstInput.closest("tr");
      expect(firstRow).toHaveClass("bg-red-100");

      fireEvent.change(firstInput, { target: { value: "-3" } });
      firstRow = firstInput.closest("tr");
      expect(firstRow).not.toHaveClass("bg-red-100");
      expect(firstRow).toHaveClass("bg-green-100");
    });
  });

  describe("table completion", () => {
    it("calls onTableComplete when all rows are correctly filled", async () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");

      const correctValues = [-3, -4, -3, 0, 5];
      correctValues.forEach((value, index) => {
        fireEvent.change(inputs[index], { target: { value: String(value) } });
      });

      await waitFor(() => {
        expect(defaultProps.onTableComplete).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ x: -2, y: -3 }),
            expect.objectContaining({ x: -1, y: -4 }),
            expect.objectContaining({ x: 0, y: -3 }),
            expect.objectContaining({ x: 1, y: 0 }),
            expect.objectContaining({ x: 2, y: 5 }),
          ]),
        );
      });
    });

    it("does not call onTableComplete when some rows are incorrect", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      fireEvent.change(inputs[0], { target: { value: "-3" } });
      fireEvent.change(inputs[1], { target: { value: "999" } });

      expect(defaultProps.onTableComplete).not.toHaveBeenCalled();
    });

    it("does not call onTableComplete when some rows are empty", () => {
      render(<InteractiveTableOfValues {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      fireEvent.change(inputs[0], { target: { value: "-3" } });
      fireEvent.change(inputs[1], { target: { value: "-4" } });

      expect(defaultProps.onTableComplete).not.toHaveBeenCalled();
    });

    it("passes computed points to onTableComplete callback", async () => {
      const onComplete = vi.fn();
      render(<InteractiveTableOfValues {...defaultProps} onTableComplete={onComplete} />);

      const inputs = screen.getAllByRole("spinbutton");
      const correctValues = [-3, -4, -3, 0, 5];

      correctValues.forEach((value, index) => {
        fireEvent.change(inputs[index], { target: { value: String(value) } });
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith([
          { x: -2, y: -3 },
          { x: -1, y: -4 },
          { x: 0, y: -3 },
          { x: 1, y: 0 },
          { x: 2, y: 5 },
        ]);
      });
    });
  });

  describe("deferred assessment mode", () => {
    it("completes with wrong finite values without grading them", async () => {
      const onComplete = vi.fn();
      render(
        <InteractiveTableOfValues
          {...defaultProps}
          assessmentMode="deferred"
          onTableComplete={onComplete}
        />,
      );

      screen.getAllByRole("spinbutton").forEach((input) => {
        fireEvent.change(input, { target: { value: "999" } });
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(6);
      });
    });

    it("does not show correctness styling for finite values", () => {
      const onComplete = vi.fn();
      render(
        <InteractiveTableOfValues
          {...defaultProps}
          assessmentMode="deferred"
          onTableComplete={onComplete}
        />,
      );

      const firstInput = screen.getAllByRole("spinbutton")[0];
      fireEvent.change(firstInput, { target: { value: "999" } });

      const firstRow = firstInput.closest("tr");
      expect(firstRow).not.toHaveClass("bg-red-100");
      expect(firstRow).not.toHaveClass("bg-green-100");
    });

    it("passes the exact raw numeric rows to onTableComplete", async () => {
      const onComplete = vi.fn();
      render(
        <InteractiveTableOfValues
          {...defaultProps}
          assessmentMode="deferred"
          onTableComplete={onComplete}
        />,
      );

      const values = [1.5, -2.25, 0, 7, -8];
      screen.getAllByRole("spinbutton").forEach((input, index) => {
        fireEvent.change(input, { target: { value: String(values[index]) } });
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith([
          { x: -2, y: 1.5 },
          { x: -1, y: -2.25 },
          { x: 0, y: 0 },
          { x: 1, y: 7 },
          { x: 2, y: -8 },
        ]);
      });
    });

    it("does not complete for empty or non-finite values", () => {
      const onComplete = vi.fn();
      render(
        <InteractiveTableOfValues
          {...defaultProps}
          assessmentMode="deferred"
          onTableComplete={onComplete}
        />,
      );

      const inputs = screen.getAllByRole("spinbutton");
      inputs.slice(0, -1).forEach((input) => {
        fireEvent.change(input, { target: { value: "1" } });
      });
      fireEvent.change(inputs[0], { target: { value: "" } });
      expect(onComplete).toHaveBeenCalledTimes(6);
      expect(onComplete).toHaveBeenLastCalledWith([]);

      fireEvent.change(inputs[0], { target: { value: "1" } });
      fireEvent.change(inputs[1], { target: { value: "Infinity" } });
      expect(onComplete).toHaveBeenCalledTimes(8);
      expect(onComplete).toHaveBeenLastCalledWith([]);
    });

    it("keeps immediate correctness behavior as the default", () => {
      const onComplete = vi.fn();
      render(<InteractiveTableOfValues {...defaultProps} onTableComplete={onComplete} />);

      const firstInput = screen.getAllByRole("spinbutton")[0];
      fireEvent.change(firstInput, { target: { value: "999" } });

      expect(firstInput.closest("tr")).toHaveClass("bg-red-100");
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe("integration with canvas plotting", () => {
    it("provides points array that can be used for canvas plotting", async () => {
      let capturedPoints: Array<{ x: number; y: number }> = [];

      render(
        <InteractiveTableOfValues
          {...defaultProps}
          onTableComplete={(points) => {
            capturedPoints = points;
          }}
        />,
      );

      const inputs = screen.getAllByRole("spinbutton");
      const correctValues = [-3, -4, -3, 0, 5];

      correctValues.forEach((value, index) => {
        fireEvent.change(inputs[index], { target: { value: String(value) } });
      });

      await waitFor(() => {
        expect(capturedPoints).toHaveLength(5);
        expect(capturedPoints[0]).toEqual({ x: -2, y: -3 });
        expect(capturedPoints[4]).toEqual({ x: 2, y: 5 });
      });
    });
  });

  describe("edge cases", () => {
    it("handles empty x-values array", () => {
      render(<InteractiveTableOfValues {...defaultProps} xValues={[]} />);

      expect(screen.getByText("x")).toBeInTheDocument();
      expect(screen.getByText("f(x)")).toBeInTheDocument();

      const inputs = screen.queryAllByRole("spinbutton");
      expect(inputs.length).toBe(0);
    });

    it("handles single row table", () => {
      render(<InteractiveTableOfValues {...defaultProps} xValues={[0]} />);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBe(1);

      fireEvent.change(inputs[0], { target: { value: "-3" } });

      expect(defaultProps.onTableComplete).toHaveBeenCalledWith([{ x: 0, y: -3 }]);
    });

    it("handles large x-values", () => {
      render(<InteractiveTableOfValues {...defaultProps} xValues={[10, 20, 30]} />);

      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("handles negative x-values", () => {
      render(<InteractiveTableOfValues {...defaultProps} xValues={[-5, -10, -15]} />);

      expect(screen.getByText("-5")).toBeInTheDocument();
      expect(screen.getByText("-10")).toBeInTheDocument();
      expect(screen.getByText("-15")).toBeInTheDocument();
    });
  });
});
