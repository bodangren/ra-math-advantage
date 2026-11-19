import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { FillInTheBlank } from "../components/blanks/FillInTheBlank";
import { DiscriminantAnalyzer } from "../components/discriminant/DiscriminantAnalyzer";
import { RateOfChangeCalculator } from "../components/roc/RateOfChangeCalculator";
import { StepByStepper } from "../components/algebraic/StepByStepper";
import { ComprehensionQuiz } from "../components/quiz/ComprehensionQuiz";

describe("FillInTheBlank", () => {
  it("renders teaching mode with answers shown", () => {
    render(
      <FillInTheBlank
        activityId="test"
        mode="teaching"
        template="The answer is {{blank:1}} and then {{blank:2}}"
        blanks={[
          { id: "1", correctAnswer: "first" },
          { id: "2", correctAnswer: "second" },
        ]}
      />,
    );
    expect(screen.getByText("Fill in the Blank")).toBeTruthy();
    expect(screen.getByText("first")).toBeTruthy();
    expect(screen.getByText("second")).toBeTruthy();
  });
});

describe("DiscriminantAnalyzer", () => {
  it("renders teaching mode with equation", () => {
    render(
      <DiscriminantAnalyzer
        mode="teaching"
        equation="x^2 + 5x + 6 = 0"
        coefficients={{ a: 1, b: 5, c: 6 }}
      />,
    );
    expect(screen.getByText("Discriminant Analyzer")).toBeTruthy();
    expect(screen.getByText(/x\^2 \+ 5x \+ 6 = 0/)).toBeTruthy();
  });
});

describe("RateOfChangeCalculator", () => {
  it("renders teaching mode with function data", () => {
    render(
      <RateOfChangeCalculator
        mode="teaching"
        sourceType="function"
        data={{ expression: "y = x^2" }}
        interval={{ start: 1, end: 3 }}
      />,
    );
    expect(screen.getByText("Rate of Change Calculator")).toBeTruthy();
  });
});

describe("StepByStepper", () => {
  it("renders teaching mode with steps", () => {
    const steps = [
      { expression: "x^2 + 5x + 6 = 0", explanation: "Start" },
      { expression: "(x + 2)(x + 3) = 0", explanation: "Factor" },
    ];
    render(<StepByStepper mode="teaching" steps={steps} />);
    expect(screen.getByText(/x\^2 \+ 5x \+ 6 = 0/)).toBeTruthy();
  });

  it("renders empty state when no steps", () => {
    const { container } = render(<StepByStepper mode="teaching" steps={[]} />);
    expect(container.firstChild).toBeTruthy();
  });
});

describe("ComprehensionQuiz", () => {
  it("renders teaching mode with questions", () => {
    const questions = [
      {
        id: "q1",
        type: "multiple_choice" as const,
        prompt: "What is 2+2?",
        options: ["3", "4", "5"],
        correctAnswer: "4",
      },
    ];
    render(<ComprehensionQuiz activityId="test" mode="teaching" questions={questions} />);
    expect(screen.getByText("Comprehension Quiz")).toBeTruthy();
    expect(screen.getByText("What is 2+2?")).toBeTruthy();
  });
});
