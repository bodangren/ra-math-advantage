import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import { QuadraticFormulaActivity } from "../index";

const base = {
  activityId: "quadratic-formula:one",
  prompt: "Solve by using the Quadratic Formula.",
  equation: "x^2 + 4x - 17 = 0",
  attemptOrdinal: 2,
} as const;

async function enterRequiredAnswers() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Discriminant"), "84");
  await user.type(screen.getByLabelText("First root"), "-2 + sqrt(21)");
  return user;
}

describe("QuadraticFormulaActivity", () => {
  it.each([undefined, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "fails closed for invalid editable ordinal %s",
    (attemptOrdinal) => {
      render(
        <QuadraticFormulaActivity
          {...base}
          attemptOrdinal={attemptOrdinal}
          mode="practice"
          presentationMode="independent"
        />,
      );
      expect(screen.getByRole("alert").textContent).toContain("attempt is not available");
      expect(screen.queryByLabelText("Discriminant")).toBeNull();
    },
  );
  it("shows source steps only in Worked mode", () => {
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="teaching"
        presentationMode="worked"
        workedSteps={[
          { description: "Substitute the coefficients.", expression: "x = (-4 ± √84)/2" },
        ]}
      />,
    );
    expect(screen.getByText("Substitute the coefficients.")).toBeTruthy();
    expect(screen.queryByLabelText("Discriminant")).toBeNull();
  });

  it("always shows three labeled answer fields and hides hints before request", () => {
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="guided"
        presentationMode="guided"
        fieldHelp={{ discriminant: "Compute b squared minus 4ac." }}
      />,
    );
    expect(screen.getByLabelText("Discriminant")).toBeTruthy();
    expect(screen.getByLabelText("First root")).toBeTruthy();
    expect(screen.getByLabelText("Second root")).toBeTruthy();
    expect(screen.queryByText("Compute b squared minus 4ac.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show hint for Discriminant" }));
    expect(screen.getByText("Compute b squared minus 4ac.")).toBeTruthy();
  });

  it("does not submit blank required fields but permits a blank second root", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="practice"
        presentationMode="independent"
        onSubmit={onSubmit}
      />,
    );
    fireEvent.submit(screen.getByRole("form", { name: "Quadratic Formula response" }));
    expect(onSubmit).not.toHaveBeenCalled();
    await enterRequiredAnswers();
    await userEvent.setup().click(screen.getByRole("button", { name: "Submit answer" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const envelope = onSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
    expect(envelope.attemptNumber).toBe(2);
    expect(envelope.parts.map((part) => [part.partId, part.rawAnswer])).toEqual([
      ["discriminant", "84"],
      ["x1", "-2 + sqrt(21)"],
      ["x2", ""],
    ]);
    for (const part of envelope.parts) {
      expect(part).not.toHaveProperty("isCorrect");
      expect(part).not.toHaveProperty("score");
      expect(part).not.toHaveProperty("maxScore");
    }
  });

  it("uses native Enter submission and prevents a same-event duplicate", async () => {
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="practice"
        presentationMode="independent"
        onSubmit={onSubmit}
      />,
    );
    const user = await enterRequiredAnswers();
    await user.type(screen.getByLabelText("Second root"), "-2 - sqrt(21)");
    fireEvent.submit(screen.getByRole("form", { name: "Quadratic Formula response" }));
    fireEvent.submit(screen.getByRole("form", { name: "Quadratic Formula response" }));
    expect(onSubmit).toHaveBeenCalledOnce();
    resolveSubmit();
    await waitFor(() =>
      expect(
        (screen.getByRole("button", { name: "Answer saved" }) as HTMLButtonElement).disabled,
      ).toBe(true),
    );
  });

  it("freezes one envelope across an ambiguous failure and retry", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error("lost response"))
      .mockResolvedValueOnce(undefined);
    const onComplete = vi.fn();
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="guided"
        presentationMode="guided"
        fieldHelp={{ discriminant: "Compute the discriminant." }}
        onCheckDiscriminant={async () => true}
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show hint for Discriminant" }));
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Discriminant"), "84");
    await user.click(screen.getByRole("button", { name: "Check discriminant" }));
    await screen.findByText("The discriminant is correct. Enter the roots.");
    await user.type(screen.getByLabelText("First root"), "-2 + sqrt(21)");
    await user.type(screen.getByLabelText("Second root"), "-2 - sqrt(21)");
    await user.click(screen.getByRole("button", { name: "Submit answer" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("button", { name: "Submission failed" })).toBeTruthy();
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(true);
    const first = onSubmit.mock.calls[0][0];
    await user.click(screen.getByRole("button", { name: "Try submit again" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][0]).toBe(first);
    expect((first as PracticeSubmissionEnvelope).parts[0].hintsUsed).toBe(1);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("locks Guided roots until the current discriminant is accepted and clears roots after an edit", async () => {
    const check = vi.fn().mockResolvedValue(true);
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="guided"
        presentationMode="guided"
        onCheckDiscriminant={check}
        onSubmit={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(true);
    await user.type(screen.getByLabelText("Discriminant"), "84");
    await user.click(screen.getByRole("button", { name: "Check discriminant" }));
    await screen.findByText("The discriminant is correct. Enter the roots.");
    await user.type(screen.getByLabelText("First root"), "2");
    await user.clear(screen.getByLabelText("Discriminant"));
    await user.type(screen.getByLabelText("Discriminant"), "85");
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByLabelText("First root") as HTMLInputElement).value).toBe("");
    expect(
      (screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("does not unlock Guided roots from a stale response after an edit away and back", async () => {
    let resolve!: (value: boolean) => void;
    const check = vi.fn(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        }),
    );
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="guided"
        presentationMode="guided"
        onCheckDiscriminant={check}
        onSubmit={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const discriminant = screen.getByLabelText("Discriminant");
    await user.type(discriminant, "84");
    await user.click(screen.getByRole("button", { name: "Check discriminant" }));
    await user.clear(discriminant);
    await user.type(discriminant, "85");
    await user.clear(discriminant);
    await user.type(discriminant, "84");
    resolve(true);
    await waitFor(() =>
      expect(
        (screen.getByRole("button", { name: "Check discriminant" }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(true);
    expect(screen.queryByText("The discriminant is correct. Enter the roots.")).toBeNull();
  });

  it("keeps Guided roots locked without a check callback and after incorrect or failed checks", async () => {
    const { rerender } = render(
      <QuadraticFormulaActivity
        {...base}
        mode="guided"
        presentationMode="guided"
        onSubmit={vi.fn()}
      />,
    );
    expect(
      (screen.getByRole("button", { name: "Check discriminant" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(true);

    const check = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(true);
    rerender(
      <QuadraticFormulaActivity
        {...base}
        mode="guided"
        presentationMode="guided"
        onCheckDiscriminant={check}
        onSubmit={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Discriminant"), "84");
    await user.click(screen.getByRole("button", { name: "Check discriminant" }));
    expect((await screen.findByRole("alert")).textContent).toContain("not correct");
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Check discriminant" }));
    expect((await screen.findByRole("alert")).textContent).toContain("could not be checked");
    await user.click(screen.getByRole("button", { name: "Check discriminant" }));
    await screen.findByText("The discriminant is correct. Enter the roots.");
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(false);
  });

  it("keeps the newest Guided check accepted when an older check settles later", async () => {
    const resolvers: Array<(value: boolean) => void> = [];
    const check = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolvers.push(resolve);
        }),
    );
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="guided"
        presentationMode="guided"
        onCheckDiscriminant={check}
        onSubmit={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const discriminant = screen.getByLabelText("Discriminant");
    await user.type(discriminant, "84");
    await user.click(screen.getByRole("button", { name: "Check discriminant" }));
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(true);
    await user.clear(discriminant);
    await user.type(discriminant, "85");
    await user.click(screen.getByRole("button", { name: "Check discriminant" }));
    resolvers[1](true);
    await screen.findByText("The discriminant is correct. Enter the roots.");
    resolvers[0](false);
    await waitFor(() =>
      expect(screen.getByText("The discriminant is correct. Enter the roots.")).toBeTruthy(),
    );
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(false);
  });

  it("does not clear Independent roots when the discriminant changes", async () => {
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="practice"
        presentationMode="independent"
        onSubmit={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("First root"), "2");
    await user.type(screen.getByLabelText("Second root"), "-2");
    await user.type(screen.getByLabelText("Discriminant"), "16");
    expect((screen.getByLabelText("First root") as HTMLInputElement).value).toBe("2");
    expect((screen.getByLabelText("Second root") as HTMLInputElement).value).toBe("-2");
  });

  it("locks an accepted Guided result when the check callback disappears", async () => {
    const check = vi.fn().mockResolvedValue(true);
    const onSubmit = vi.fn();
    const { rerender } = render(
      <QuadraticFormulaActivity
        {...base}
        mode="guided"
        presentationMode="guided"
        onCheckDiscriminant={check}
        onSubmit={onSubmit}
      />,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Discriminant"), "84");
    await user.click(screen.getByRole("button", { name: "Check discriminant" }));
    await screen.findByText("The discriminant is correct. Enter the roots.");
    rerender(
      <QuadraticFormulaActivity
        {...base}
        mode="guided"
        presentationMode="guided"
        onSubmit={onSubmit}
      />,
    );
    expect((screen.getByLabelText("First root") as HTMLInputElement).disabled).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.queryByText("The discriminant is correct. Enter the roots.")).toBeNull();
  });

  it("does not report a save when no submission handler is connected", async () => {
    const onComplete = vi.fn();
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="practice"
        presentationMode="independent"
        onComplete={onComplete}
      />,
    );
    expect(
      (screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("gives two mounted activities unique input IDs and associates requested help", () => {
    render(
      <>
        <QuadraticFormulaActivity
          {...base}
          activityId="one"
          mode="guided"
          presentationMode="guided"
        />
        <QuadraticFormulaActivity
          {...base}
          activityId="two"
          mode="guided"
          presentationMode="guided"
        />
      </>,
    );
    const inputs = screen.getAllByLabelText("Discriminant") as HTMLInputElement[];
    expect(inputs[0].id).not.toBe(inputs[1].id);
    fireEvent.click(screen.getAllByRole("button", { name: "Show hint for Discriminant" })[0]);
    const helpId = inputs[0].getAttribute("aria-describedby");
    expect(helpId).toBeTruthy();
    const describedIds = helpId!.split(" ");
    expect(describedIds.every((id) => document.getElementById(id))).toBe(true);
    expect(describedIds).toHaveLength(2);
    expect(inputs[1].getAttribute("aria-describedby")?.split(" ")).toHaveLength(1);
  });

  it("rejects a runtime mode that does not match the public presentation mode", () => {
    const onSubmit = vi.fn();
    render(
      <QuadraticFormulaActivity
        {...base}
        mode="practice"
        presentationMode="worked"
        workedSteps={[{ description: "Private future step.", expression: "x = 2" }]}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByRole("alert").textContent).toContain("not available");
    expect(screen.queryByText("Private future step.")).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables retry if the submission handler disappears", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("lost response"));
    const { rerender } = render(
      <QuadraticFormulaActivity
        {...base}
        mode="practice"
        presentationMode="independent"
        onSubmit={handler}
      />,
    );
    const user = await enterRequiredAnswers();
    await user.click(screen.getByRole("button", { name: "Submit answer" }));
    await screen.findByRole("alert");
    rerender(<QuadraticFormulaActivity {...base} mode="practice" presentationMode="independent" />);
    expect(
      (screen.getByRole("button", { name: "Try submit again" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("renders the equation and Worked expressions as math", () => {
    const { container } = render(
      <QuadraticFormulaActivity
        {...base}
        mode="teaching"
        presentationMode="worked"
        workedSteps={[{ description: "Substitute.", expression: "x = (-4 \pm \sqrt{84})/2" }]}
      />,
    );
    expect(container.querySelectorAll(".katex")).toHaveLength(2);
  });
});
