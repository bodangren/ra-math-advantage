"use client";

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RateOfChangeCalculator } from "@math-platform/activity-components/roc";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";

const defaultProps = {
  activityId: "test-activity",
  mode: "teaching" as const,
  onSubmit: vi.fn(),
  onComplete: vi.fn(),
};

describe("RateOfChangeCalculator", () => {
  describe("teaching mode", () => {
    describe("from_equation", () => {
      it("renders formula for rate of change", () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="function"
            data={{ expression: "y = 2x + 3" }}
            interval={{ start: 0, end: 5 }}
          />,
        );

        expect(screen.getByText("Rate of Change Calculator")).toBeInTheDocument();
        expect(screen.getByText(/formula/i)).toBeInTheDocument();
      });

      it("shows f(a) and f(b) computed and labeled", () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="function"
            data={{ expression: "y = 2x + 3" }}
            interval={{ start: 0, end: 5 }}
          />,
        );

        expect(screen.getByText(/f\(0\)/i)).toBeInTheDocument();
        expect(screen.getByText(/f\(5\)/i)).toBeInTheDocument();
      });

      it("evaluates the authored Example 4 quadratic function", () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="function"
            data={{ expression: "f(x) = -x^2 + 2x - 1" }}
            interval={{ start: -4, end: 4 }}
          />,
        );

        expect(screen.getByText("f(-4) = -25")).toBeInTheDocument();
        expect(screen.getByText("f(4) = -9")).toBeInTheDocument();
        expect(screen.getByText(/= 2$/)).toBeInTheDocument();
      });

      it("keeps function teaching values readable on a light-text parent", () => {
        render(
          <div className="text-white">
            <RateOfChangeCalculator
              {...defaultProps}
              sourceType="function"
              data={{ expression: "f(x) = -x^2 + 2x - 1" }}
              interval={{ start: -4, end: 4 }}
            />
          </div>,
        );

        expect(screen.getByText("Average Rate of Change = (f(b) - f(a)) / (b - a)")).toHaveClass(
          "text-gray-900",
        );
        expect(screen.getByText("f(-4) = -25")).toHaveClass("text-gray-900");
        expect(screen.getByText("f(4) = -9")).toHaveClass("text-gray-900");
        expect(screen.getByText("f(x) = -x^2 + 2x - 1")).toHaveClass("text-gray-900");
        expect(screen.getByText("(-9 - -25) / (4 - -4) = 2")).toHaveClass("text-gray-900");
      });
    });

    describe("from_table", () => {
      it("renders table data", () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="table"
            data={{
              x: [0, 1, 2, 3],
              y: [0, 2, 4, 6],
            }}
            interval={{ start: 0, end: 3 }}
          />,
        );

        expect(screen.getByText("x")).toBeInTheDocument();
        expect(screen.getByText("y")).toBeInTheDocument();
      });

      it("highlights rows within the interval", () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="table"
            data={{
              x: [0, 1, 2, 3],
              y: [0, 2, 4, 6],
            }}
            interval={{ start: 0, end: 3 }}
          />,
        );

        const highlightedElements = screen.getAllByTestId(/highlighted|selected/i);
        expect(highlightedElements.length).toBeGreaterThan(0);
      });

      it("applies rate of change formula", () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="table"
            data={{
              x: [0, 1, 2, 3],
              y: [0, 2, 4, 6],
            }}
            interval={{ start: 0, end: 3 }}
          />,
        );

        expect(screen.getByText(/\(6\s*-\s*0\)\s*\/\s*\(3\s*-\s*0\)/i)).toBeInTheDocument();
      });
    });

    describe("from_graph", () => {
      it("renders graph data points", () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="graph"
            data={{
              points: [
                [0, 1],
                [1, 3],
                [2, 5],
              ],
            }}
            interval={{ start: 0, end: 2 }}
          />,
        );

        expect(screen.getByText(/\(0,\s*1\)/i)).toBeInTheDocument();
        expect(screen.getByText(/\(1,\s*3\)/i)).toBeInTheDocument();
        expect(screen.getByText(/\(2,\s*5\)/i)).toBeInTheDocument();
      });

      it("shows estimation label", () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="graph"
            data={{
              points: [
                [0, 1],
                [1, 3],
                [2, 5],
              ],
            }}
            interval={{ start: 0, end: 2 }}
          />,
        );

        expect(screen.getByText(/Estimation/i)).toBeInTheDocument();
      });

      it("shows exact value label", () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="graph"
            data={{
              points: [
                [0, 1],
                [1, 3],
                [2, 5],
              ],
            }}
            interval={{ start: 0, end: 2 }}
          />,
        );

        expect(screen.getByText(/Exact Value/i)).toBeInTheDocument();
      });
    });
  });

  describe("guided mode", () => {
    it("shows the function expression before Step 1 with readable text", () => {
      render(
        <div className="text-white">
          <RateOfChangeCalculator
            {...defaultProps}
            mode="guided"
            sourceType="function"
            data={{ expression: "f(x) = x^2 - 3x - 4" }}
            interval={{ start: -4, end: -1 }}
          />
        </div>,
      );

      const expression = screen.getByText("f(x) = x^2 - 3x - 4");
      const step = screen.getByText("Use a = -4 as the starting x-value.");
      expect(expression).toHaveClass("text-gray-900");
      expect(expression.compareDocumentPosition(step)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it("keeps the function formula readable on a light-text parent", () => {
      render(
        <div className="text-white">
          <RateOfChangeCalculator
            {...defaultProps}
            mode="guided"
            sourceType="function"
            data={{ expression: "f(x) = x^2 - 3x - 4" }}
            interval={{ start: -4, end: -1 }}
          />
        </div>,
      );

      fireEvent.change(screen.getByRole("textbox", { name: "f(-4)" }), { target: { value: "24" } });
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      fireEvent.change(screen.getByRole("textbox", { name: "f(-1)" }), { target: { value: "0" } });
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      const formula = screen.getByText("(f(b) - f(a)) / (b - a) = (0 - 24) / (-1 - -4)");
      expect(formula).toHaveClass("text-gray-900");
    });

    it("requires f(a), f(b), and the average rate before advancing or submitting", () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="guided"
          sourceType="function"
          data={{ expression: "y = 2x + 3" }}
          interval={{ start: 0, end: 3 }}
        />,
      );

      expect(screen.getAllByRole("textbox")).toHaveLength(1);
      const startValue = screen.getByRole("textbox", { name: "f(0)" });
      const next = screen.getByRole("button", { name: "Next" });
      expect(next).toBeDisabled();

      fireEvent.change(startValue, { target: { value: "3" } });
      expect(next).not.toBeDisabled();
      fireEvent.click(next);

      expect(screen.getAllByRole("textbox")).toHaveLength(1);
      const endValue = screen.getByRole("textbox", { name: "f(3)" });
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
      fireEvent.change(endValue, { target: { value: "9" } });
      expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      expect(screen.getByText(/\(9 - 3\) \/ \(3 - 0\)/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      const rate = screen.getByRole("textbox", { name: "Average rate of change" });
      const submit = screen.getByRole("button", { name: "Submit Answer" });
      expect(submit).toBeDisabled();
      fireEvent.change(rate, { target: { value: "2" } });
      expect(submit).not.toBeDisabled();
    });

    it("emits a raw practice.v1 envelope for the authored Example 4", async () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();

      render(
        <RateOfChangeCalculator
          activityId="activities:im3-rate-guided"
          mode="guided"
          sourceType="function"
          data={{ expression: "f(x) = -x^2 + 2x - 1" }}
          interval={{ start: -4, end: 4 }}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );

      fireEvent.change(screen.getByRole("textbox", { name: "f(-4)" }), {
        target: { value: "-25" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      fireEvent.change(screen.getByRole("textbox", { name: "f(4)" }), { target: { value: "-9" } });
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      fireEvent.change(screen.getByRole("textbox", { name: "Average rate of change" }), {
        target: { value: "2" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Submission recorded for grading.")).toBeInTheDocument();
      });

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const envelope = onSubmit.mock.calls[0][0] as Record<string, unknown>;
      expect(envelope).toMatchObject({
        contractVersion: "practice.v1",
        activityId: "activities:im3-rate-guided",
        mode: "guided_practice",
        status: "submitted",
        attemptNumber: 1,
        answers: { fA: "-25", fB: "-9", rate: "2" },
        parts: [
          { partId: "f_a", rawAnswer: "-25" },
          { partId: "f_b", rawAnswer: "-9" },
          { partId: "rate", rawAnswer: "2" },
        ],
      });
      expect(envelope.submittedAt).toEqual(expect.any(String));
      expect(Number.isNaN(Date.parse(envelope.submittedAt as string))).toBe(false);
      expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
      expect(JSON.stringify(envelope)).not.toMatch(
        /"(correctAnswer|expectedAnswer|solutionSteps|gradingMetadata|partAnswers|identifiedValues|finalAnswer|isCorrect|score|maxScore)"/,
      );
      expect(screen.getByText("Submission recorded for grading.")).toBeInTheDocument();
      expect(screen.queryByText(/Correct answer/i)).not.toBeInTheDocument();
    });

    it("shows one step at a time", () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="guided"
          sourceType="table"
          data={{
            x: [0, 1, 2, 3],
            y: [0, 2, 4, 6],
          }}
          interval={{ start: 0, end: 3 }}
        />,
      );

      const stepIndicator = screen.getByText(/\d+\s+of\s+\d+/i);
      expect(stepIndicator).toBeInTheDocument();
    });

    it("validates each sub-step", () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="guided"
          sourceType="table"
          data={{
            x: [0, 1, 2, 3],
            y: [0, 2, 4, 6],
          }}
          interval={{ start: 0, end: 3 }}
        />,
      );

      const textboxes = screen.getAllByRole("textbox");
      expect(textboxes.length).toBeGreaterThan(0);
    });
  });

  describe("practice mode", () => {
    it("shows answer input field", () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="practice"
          sourceType="table"
          data={{
            x: [0, 1, 2, 3],
            y: [0, 2, 4, 6],
          }}
          interval={{ start: 0, end: 3 }}
        />,
      );

      expect(screen.getAllByRole("textbox")).toHaveLength(3);
    });

    it("requires all three non-whitespace responses before submission", () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="practice"
          sourceType="function"
          data={{ expression: "y = 2x + 3" }}
          interval={{ start: 0, end: 3 }}
        />,
      );

      const startValue = screen.getByRole("textbox", { name: "f(0)" });
      const endValue = screen.getByRole("textbox", { name: "f(3)" });
      const rate = screen.getByRole("textbox", { name: "Average rate of change" });
      const submit = screen.getByRole("button", { name: "Submit" });
      expect(submit).toBeDisabled();

      fireEvent.change(startValue, { target: { value: "  " } });
      expect(submit).toBeDisabled();
      fireEvent.change(startValue, { target: { value: "3" } });
      expect(submit).toBeDisabled();
      fireEvent.change(endValue, { target: { value: "9" } });
      expect(submit).toBeDisabled();
      fireEvent.change(rate, { target: { value: "2" } });
      expect(submit).not.toBeDisabled();
    });

    it("keeps a function expression readable on a light-text parent", () => {
      render(
        <div className="text-white">
          <RateOfChangeCalculator
            {...defaultProps}
            mode="practice"
            sourceType="function"
            data={{ expression: "f(x) = -2x^2 + 2x - 2" }}
            interval={{ start: 0, end: 4 }}
          />
        </div>,
      );

      expect(screen.getByText("f(x) = -2x^2 + 2x - 2")).toHaveClass("text-gray-900");
    });

    it("emits a raw practice.v1 envelope for the seed-0 generated problem", async () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();

      render(
        <div className="text-white">
          <RateOfChangeCalculator
            activityId="activities:im3-rate-practice"
            mode="practice"
            sourceType="function"
            data={{ expression: "f(x) = -2x^2 + x - 2" }}
            interval={{ start: -1, end: 5 }}
            onSubmit={onSubmit}
            onComplete={onComplete}
          />
        </div>,
      );

      fireEvent.change(screen.getByRole("textbox", { name: "f(-1)" }), { target: { value: "-5" } });
      fireEvent.change(screen.getByRole("textbox", { name: "f(5)" }), { target: { value: "-47" } });
      fireEvent.change(screen.getByRole("textbox", { name: "Average rate of change" }), {
        target: { value: "-7" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Submission recorded for grading.")).toBeInTheDocument();
      });

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const envelope = onSubmit.mock.calls[0][0] as Record<string, unknown>;
      expect(envelope).toMatchObject({
        contractVersion: "practice.v1",
        activityId: "activities:im3-rate-practice",
        mode: "independent_practice",
        status: "submitted",
        attemptNumber: 1,
        answers: { fA: "-5", fB: "-47", rate: "-7" },
        parts: [
          { partId: "f_a", rawAnswer: "-5" },
          { partId: "f_b", rawAnswer: "-47" },
          { partId: "rate", rawAnswer: "-7" },
        ],
      });
      expect(envelope.submittedAt).toEqual(expect.any(String));
      expect(Number.isNaN(Date.parse(envelope.submittedAt as string))).toBe(false);
      expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
      expect(JSON.stringify(envelope)).not.toMatch(
        /"(correctAnswer|expectedAnswer|solutionSteps|gradingMetadata|partAnswers|identifiedValues|finalAnswer|isCorrect|score|maxScore)"/,
      );
      expect(screen.getByText("Submission recorded for grading.")).toHaveClass("text-gray-900");
      expect(screen.queryByText(/Correct answer/i)).not.toBeInTheDocument();
    });

    it("waits for async submission success before completing", async () => {
      let resolveSubmission!: () => void;
      const submission = new Promise<void>((resolve) => {
        resolveSubmission = resolve;
      });
      const onSubmit = vi.fn(() => submission);
      const onComplete = vi.fn();

      render(
        <RateOfChangeCalculator
          activityId="activities:im3-rate-deferred"
          mode="practice"
          sourceType="function"
          data={{ expression: "f(x) = -2x^2 + x - 2" }}
          interval={{ start: -1, end: 5 }}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );

      fireEvent.change(screen.getByRole("textbox", { name: "f(-1)" }), { target: { value: "-5" } });
      fireEvent.change(screen.getByRole("textbox", { name: "f(5)" }), { target: { value: "-47" } });
      fireEvent.change(screen.getByRole("textbox", { name: "Average rate of change" }), {
        target: { value: "-7" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onComplete).not.toHaveBeenCalled();
      expect(screen.queryByText("Submission recorded for grading.")).not.toBeInTheDocument();

      await act(async () => {
        resolveSubmission();
        await submission;
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Submission recorded for grading.")).toBeInTheDocument();
    });

    it("keeps the activity incomplete when submission rejects", async () => {
      let rejectSubmission!: (reason?: unknown) => void;
      const submission = new Promise<void>((_, reject) => {
        rejectSubmission = reject;
      });
      submission.catch(() => undefined);
      const onSubmit = vi.fn(() => submission);
      const onComplete = vi.fn();

      render(
        <RateOfChangeCalculator
          activityId="activities:im3-rate-rejected"
          mode="practice"
          sourceType="function"
          data={{ expression: "f(x) = -2x^2 + x - 2" }}
          interval={{ start: -1, end: 5 }}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );

      fireEvent.change(screen.getByRole("textbox", { name: "f(-1)" }), { target: { value: "-5" } });
      fireEvent.change(screen.getByRole("textbox", { name: "f(5)" }), { target: { value: "-47" } });
      fireEvent.change(screen.getByRole("textbox", { name: "Average rate of change" }), {
        target: { value: "-7" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      await act(async () => {
        rejectSubmission(new Error("submission failed"));
        await Promise.resolve();
      });

      expect(onComplete).not.toHaveBeenCalled();
      expect(screen.queryByText("Submission recorded for grading.")).not.toBeInTheDocument();
    });

    it("keeps the activity incomplete when submission throws synchronously", () => {
      const onSubmit = vi.fn(() => {
        throw new Error("submission failed");
      });
      const onComplete = vi.fn();

      render(
        <RateOfChangeCalculator
          activityId="activities:im3-rate-thrown"
          mode="practice"
          sourceType="function"
          data={{ expression: "f(x) = -2x^2 + x - 2" }}
          interval={{ start: -1, end: 5 }}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );

      fireEvent.change(screen.getByRole("textbox", { name: "f(-1)" }), { target: { value: "-5" } });
      fireEvent.change(screen.getByRole("textbox", { name: "f(5)" }), { target: { value: "-47" } });
      fireEvent.change(screen.getByRole("textbox", { name: "Average rate of change" }), {
        target: { value: "-7" },
      });

      expect(() => fireEvent.click(screen.getByRole("button", { name: "Submit" }))).not.toThrow();
      expect(onComplete).not.toHaveBeenCalled();
      expect(screen.queryByText("Submission recorded for grading.")).not.toBeInTheDocument();
    });

    it("does not submit a direct practice response without an activity ID", () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();

      render(
        <RateOfChangeCalculator
          mode="practice"
          sourceType="function"
          data={{ expression: "f(x) = -2x^2 + x - 2" }}
          interval={{ start: -1, end: 5 }}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );

      fireEvent.change(screen.getByRole("textbox", { name: "f(-1)" }), { target: { value: "-5" } });
      fireEvent.change(screen.getByRole("textbox", { name: "f(5)" }), { target: { value: "-47" } });
      fireEvent.change(screen.getByRole("textbox", { name: "Average rate of change" }), {
        target: { value: "-7" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
      expect(screen.queryByText("Submission recorded for grading.")).not.toBeInTheDocument();
    });

    it("has submit button", () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="practice"
          sourceType="table"
          data={{
            x: [0, 1, 2, 3],
            y: [0, 2, 4, 6],
          }}
          interval={{ start: 0, end: 3 }}
        />,
      );

      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });
  });
});
