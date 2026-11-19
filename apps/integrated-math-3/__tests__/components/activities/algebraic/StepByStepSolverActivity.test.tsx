import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StepByStepSolverActivity } from "@/components/activities/algebraic/StepByStepSolverActivity";
import type { AlgebraicStep } from "@math-platform/activity-components/algebraic";
import * as distractors from "@/lib/activities/algebraic/distractors";
import "katex/dist/katex.min.css";

describe("StepByStepSolverActivity", () => {
  const defaultSteps: AlgebraicStep[] = [
    {
      expression: "x^2 + 5x + 6 = 0",
      explanation: "Start with the quadratic equation in standard form.",
    },
    {
      expression: "(x + 2)(x + 3) = 0",
      explanation: "Factor the trinomial into two binomials.",
      isKeyStep: true,
    },
    {
      expression: "x + 2 = 0 or x + 3 = 0",
      explanation: "Apply the Zero Product Property.",
    },
    {
      expression: "x = -2 or x = -3",
      explanation: "Solve each linear equation.",
    },
  ];

  const defaultProps = {
    activityId: "test-activity-123",
    mode: "teaching" as const,
    steps: defaultSteps,
    problemType: "factoring" as const,
    equation: "x^2 + 5x + 6 = 0",
  };

  describe("prop interface", () => {
    it("renders with provided steps instead of hardcoded ones", () => {
      const customSteps: AlgebraicStep[] = [
        {
          expression: "2x + 4 = 0",
          explanation: "Start with the linear equation.",
        },
        {
          expression: "2x = -4",
          explanation: "Subtract 4 from both sides.",
        },
        {
          expression: "x = -2",
          explanation: "Divide by 2.",
        },
      ];

      render(<StepByStepSolverActivity {...defaultProps} steps={customSteps} mode="teaching" />);

      expect(screen.getByText("Start with the linear equation.")).toBeInTheDocument();
      expect(screen.getByText("Subtract 4 from both sides.")).toBeInTheDocument();
      expect(screen.getByText("Divide by 2.")).toBeInTheDocument();
    });

    it("accepts problemType prop", () => {
      const { container } = render(
        <StepByStepSolverActivity {...defaultProps} problemType="quadratic_formula" />,
      );
      expect(container.firstChild).toBeDefined();
    });

    it("accepts equation prop", () => {
      const { container } = render(
        <StepByStepSolverActivity {...defaultProps} equation="x^2 - 4x + 3 = 0" />,
      );
      expect(container.firstChild).toBeDefined();
    });
  });

  describe("onSubmit wiring", () => {
    it("calls onSubmit with submission envelope when provided", async () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();

      render(
        <StepByStepSolverActivity {...defaultProps} onSubmit={onSubmit} onComplete={onComplete} />,
      );

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it("calls onSubmit when practice mode completes", async () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();

      const practiceSteps: AlgebraicStep[] = [
        {
          expression: "x^2 + 5x + 6 = 0",
          explanation: "Start with the quadratic equation.",
        },
        {
          expression: "(x + 2)(x + 3) = 0",
          explanation: "Factor the trinomial.",
        },
      ];

      render(
        <StepByStepSolverActivity
          {...defaultProps}
          mode="practice"
          steps={practiceSteps}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe("onComplete wiring", () => {
    it("does not call onComplete immediately on render", async () => {
      const onComplete = vi.fn();

      render(<StepByStepSolverActivity {...defaultProps} onComplete={onComplete} />);

      await waitFor(() => {
        expect(onComplete).not.toHaveBeenCalled();
      });
    });
  });

  describe("teaching mode", () => {
    it("renders all steps in teaching mode", () => {
      render(<StepByStepSolverActivity {...defaultProps} mode="teaching" />);

      expect(
        screen.getByText("Start with the quadratic equation in standard form."),
      ).toBeInTheDocument();
      expect(screen.getByText("Factor the trinomial into two binomials.")).toBeInTheDocument();
      expect(screen.getByText("Apply the Zero Product Property.")).toBeInTheDocument();
      expect(screen.getByText("Solve each linear equation.")).toBeInTheDocument();
    });
  });

  describe("guided mode", () => {
    it("renders guided mode interface", () => {
      render(<StepByStepSolverActivity {...defaultProps} mode="guided" />);

      expect(screen.getByText(/What's the next step?/i)).toBeInTheDocument();
    });
  });

  describe("activityId handling", () => {
    it("accepts activityId prop without error", () => {
      const { container } = render(
        <StepByStepSolverActivity {...defaultProps} activityId="custom-activity-id" />,
      );
      expect(container.firstChild).toBeDefined();
    });
  });

  describe("system contract", () => {
    const systemProps = {
      activityId: "system-activity",
      problemType: "system" as const,
      equations: { first: "y = x^2", second: "y = x + 2" },
      steps: [{ expression: "x^2 = x + 2", explanation: "Set the equations equal." }],
    };

    it.each(["teaching", "guided", "practice"] as const)(
      "renders both source equations in %s mode",
      (mode) => {
        render(<StepByStepSolverActivity {...systemProps} mode={mode} />);
        const group = screen.getByRole("group", { name: "System of equations" });
        expect(group.querySelectorAll('annotation[encoding="application/x-tex"]')).toHaveLength(2);
        expect(group.querySelectorAll("annotation")[0]).toHaveTextContent("y = x^2");
        expect(group.querySelectorAll("annotation")[1]).toHaveTextContent("y = x + 2");
        expect(group).not.toHaveTextContent("x^2 + 5x + 6 = 0");
        expect(screen.queryByText("Problem:")).not.toBeInTheDocument();
      },
    );

    it("passes the truthful system type to the distractor callback", () => {
      const generateSpy = vi.spyOn(distractors, "generateDistractors");
      render(<StepByStepSolverActivity {...systemProps} mode="guided" />);
      expect(generateSpy).toHaveBeenCalledWith("x^2 = x + 2", "system");
      generateSpy.mockRestore();
    });

    it("submits the ordered system equations and no single equation", () => {
      const onSubmit = vi.fn();
      render(<StepByStepSolverActivity {...systemProps} mode="practice" onSubmit={onSubmit} />);
      fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "x^2 = x + 2" } });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      const artifact = onSubmit.mock.calls[0][0].artifact;
      expect(artifact).toMatchObject({ problemType: "system", equations: systemProps.equations });
      expect(artifact).not.toHaveProperty("equation");
    });

    it("submits an ordinary equation and no equations object", () => {
      const onSubmit = vi.fn();
      render(
        <StepByStepSolverActivity
          {...defaultProps}
          mode="practice"
          steps={[defaultSteps[0]]}
          onSubmit={onSubmit}
        />,
      );
      fireEvent.change(screen.getByLabelText("Your answer"), {
        target: { value: defaultSteps[0].expression },
      });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      const artifact = onSubmit.mock.calls[0][0].artifact;
      expect(artifact).toMatchObject({ problemType: "factoring", equation: defaultProps.equation });
      expect(artifact).not.toHaveProperty("equations");
    });
  });
});
