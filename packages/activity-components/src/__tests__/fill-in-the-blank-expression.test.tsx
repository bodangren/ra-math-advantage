import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FillInTheBlank } from "../components/blanks/FillInTheBlank";
import { fillInTheBlankSchema } from "../schemas/fill-in-the-blank.schema";

describe("FillInTheBlank expression responses", () => {
  it("retains reveal assistance after the learner corrects the response and reports a failed Guided save", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((_payload: unknown) => Promise.reject(new Error("save failed")));
    const onComplete = vi.fn();
    render(
      <FillInTheBlank
        activityId="guided-correct-after-reveal"
        mode="guided"
        template="Translate the phrase: {{blank:expression}}"
        blanks={[{ id: "expression", correctAnswer: "20 - 4 * 3", isMath: true }]}
        guidedSupport={{ feedback: "on_check", hints: [], revealAfterAttempts: 1 }}
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );
    await user.type(screen.getByRole("textbox"), "8");
    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(screen.getByRole("button", { name: "Reveal Answer" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "20 - 4 * 3");
    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(screen.getByRole("button", { name: "Finish" }));
    const envelope = onSubmit.mock.calls[0]?.[0] as { parts: Array<{ revealStepsSeen: number }> };
    expect(envelope.parts[0].revealStepsSeen).toBe(1);
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Your response was not saved. Submit it again.",
    );
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("20 - 4 * 3");
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("uses the supported typed math notation without removing spaces from text answers", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <FillInTheBlank
        activityId="guided-notation"
        mode="guided"
        template="Translate: {{blank:expression}}"
        blanks={[{ id: "expression", correctAnswer: "3 * (11 - 4)", isMath: true }]}
      />,
    );
    await user.type(screen.getByRole("textbox"), "3 \\times \\left(11 - 4\\right)");
    expect(screen.getByText("Correct!")).toBeTruthy();
    unmount();
    render(
      <FillInTheBlank
        activityId="guided-text"
        mode="guided"
        template="Term: {{blank:term}}"
        blanks={[{ id: "term", correctAnswer: "net income" }]}
      />,
    );
    await user.type(screen.getByRole("textbox"), "netincome");
    expect(screen.queryByText("Correct!")).toBeNull();
  });

  it("shows Worked reasoning with the preserved expression structure", () => {
    render(
      <FillInTheBlank
        activityId="translation-worked"
        mode="teaching"
        template="Write the expression: {{blank:expression}}"
        blanks={[{ id: "expression", correctAnswer: "5 + 3 * 4", isMath: true }]}
        reasoningSteps={[
          { description: "Identify the inner product.", expression: "3 × 4" },
          { description: "Write the full expression.", expression: "5 + 3 × 4" },
        ]}
      />,
    );

    expect(screen.getByText("Identify the inner product.")).toBeTruthy();
    expect(screen.getByText("3 × 4")).toBeTruthy();
    expect(screen.getByText("5 + 3 × 4")).toBeTruthy();
  });

  it("waits for Check, then records Guided hint and reveal assistance", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((_payload: unknown) => Promise.resolve());
    render(
      <FillInTheBlank
        activityId="translation-guided-support"
        mode="guided"
        template="Write the expression: {{blank:expression}}"
        blanks={[{ id: "expression", correctAnswer: "20 - 4 * 3", isMath: true }]}
        guidedSupport={{
          feedback: "on_check",
          hints: ["Find the product before you subtract."],
          revealAfterAttempts: 1,
        }}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByRole("textbox"), "8");
    expect(screen.queryByText(/Correct answer:/)).toBeNull();
    expect(screen.queryByText("Try again.")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByText("Try again.")).toBeTruthy();
    expect(screen.queryByText(/Correct answer:/)).toBeNull();

    await user.click(screen.getByRole("button", { name: "Show Hint" }));
    expect(screen.getByText("Find the product before you subtract.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Reveal Answer" }));
    expect(screen.getByText("Correct answer: 20 - 4 * 3")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Finish" }));

    const envelope = onSubmit.mock.calls[0]?.[0] as {
      parts: Array<{ hintsUsed?: number; revealStepsSeen?: number }>;
    };
    expect(envelope.parts[0]).toMatchObject({ hintsUsed: 1, revealStepsSeen: 1 });
  });

  it("accepts Independent props without client-visible answers", () => {
    expect(
      fillInTheBlankSchema.parse({
        activityId: "translation-1",
        template: "Write the expression: {{blank:expression}}",
        blanks: [{ id: "expression", isMath: true }],
      }),
    ).toBeDefined();
  });

  it("accepts a finite notation variant and rejects the evaluated scalar", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const props = {
      activityId: "translation-guided",
      mode: "guided" as const,
      template: "Write the expression: {{blank:expression}}",
      blanks: [
        {
          id: "expression",
          correctAnswer: "20 - 4 * 3",
          acceptedAnswers: ["20 - 4 * 3", "20 - (4 * 3)"],
          isMath: true,
        },
      ],
      onSubmit,
    };

    const { rerender } = render(<FillInTheBlank {...props} />);
    await user.type(screen.getByRole("textbox"), "20 − (4 × 3)");
    expect(screen.getByText("Correct!")).toBeTruthy();

    rerender(<FillInTheBlank {...props} activityId="translation-scalar" />);
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "8");
    expect(screen.queryByText("Correct!")).toBeNull();
    expect(screen.getByText(/Correct answer:/)).toBeTruthy();
  });

  it("submits only the raw Independent response and waits for persistence", async () => {
    const user = userEvent.setup();
    let finishSave: (() => void) | undefined;
    const onSubmit = vi.fn(
      (_payload: unknown) =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        }),
    );
    const onComplete = vi.fn();

    render(
      <FillInTheBlank
        activityId="translation-independent"
        mode="practice"
        template="Write the expression: {{blank:expression}}"
        blanks={[{ id: "expression", isMath: true }]}
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    await user.type(screen.getByRole("textbox"), "20 - 4 * 3");
    await user.click(screen.getByRole("button", { name: "Submit All Answers" }));

    const envelope = onSubmit.mock.calls[0]?.[0] as {
      answers: Record<string, unknown>;
      parts: Array<Record<string, unknown>>;
    };
    expect(envelope.answers).toEqual({
      expression: { answer: "20 - 4 * 3", usedWordBank: false },
    });
    expect(envelope.parts[0]).not.toHaveProperty("isCorrect");
    expect(envelope.parts[0]).not.toHaveProperty("score");
    expect(onComplete).not.toHaveBeenCalled();

    finishSave?.();
    await vi.waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  it("preserves the Independent response when persistence rejects it", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <FillInTheBlank
        activityId="translation-rejected"
        mode="practice"
        template="Write the expression: {{blank:expression}}"
        blanks={[{ id: "expression", isMath: true }]}
        onSubmit={() => Promise.reject(new Error("save failed"))}
        onComplete={onComplete}
      />,
    );

    await user.type(screen.getByRole("textbox"), "20 - 4 * 3");
    await user.click(screen.getByRole("button", { name: "Submit All Answers" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Your response was not saved. Submit it again.",
    );
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("20 - 4 * 3");
    expect(onComplete).not.toHaveBeenCalled();
  });
});
