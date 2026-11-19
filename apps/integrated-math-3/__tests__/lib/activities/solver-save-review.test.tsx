import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepByStepSolverActivity } from "@/components/activities/algebraic/StepByStepSolverActivity";
it("keeps completion pending when the server rejects the answer", async () => {
  const submit = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
  const complete = vi.fn();
  const user = userEvent.setup();
  render(
    <StepByStepSolverActivity
      activityId="activity"
      mode="practice"
      steps={[{ expression: "x=2", explanation: "Solve." }]}
      onSubmit={submit}
      onComplete={complete}
    />,
  );
  await user.type(screen.getByLabelText("Your answer"), "x=2");
  await user.click(screen.getByRole("button", { name: "Submit" }));
  expect(complete).not.toHaveBeenCalled();
  await user.click(await screen.findByRole("button", { name: "Retry save" }));
  expect(complete).toHaveBeenCalledTimes(1);
});
