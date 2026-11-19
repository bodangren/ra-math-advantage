import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepByStepper } from "../components/algebraic/StepByStepper";
it("accepts spacing changes in a math answer", async () => {
  const complete = vi.fn();
  const user = userEvent.setup();
  render(
    <StepByStepper
      mode="practice"
      steps={[{ expression: "x = 2", explanation: "Solve." }]}
      onPracticeComplete={complete}
    />,
  );
  await user.type(screen.getByLabelText("Your answer"), "x=2");
  await user.click(screen.getByRole("button", { name: "Submit" }));
  expect(complete).toHaveBeenCalledWith([expect.objectContaining({ isCorrect: true })]);
});
it("completes guided work after the last correct step", async () => {
  const complete = vi.fn();
  const user = userEvent.setup();
  render(
    <StepByStepper
      mode="guided"
      steps={[{ expression: "x=2", explanation: "Solve.", distractors: ["x=3"] }]}
      onPracticeComplete={complete}
    />,
  );
  const buttons = screen.getAllByRole("button");
  const correct = buttons.find((button) => button.textContent?.includes("x=2"))!;
  await user.click(correct);
  await user.click(screen.getByRole("button", { name: "Complete" }));
  expect(complete).toHaveBeenCalledTimes(1);
});
