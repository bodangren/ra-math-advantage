import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PerpendicularBisectorPilot } from "@/components/student/PerpendicularBisectorPilot";

describe("PerpendicularBisectorPilot", () => {
  it("reveals Guided hints only after a checked attempt", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ kind: "graded", score: 0, maxScore: 1, feedback: "Try again." }),
            { status: 200 },
          ),
        ),
    );
    render(
      <PerpendicularBisectorPilot
        items={[
          {
            activityId: "guided",
            mode: "guided_practice",
            prompt: "Guided",
            stepPrompts: ["Step 1", "Step 2", "Step 3"],
            hints: ["Hint 1", "Hint 2", "Hint 3"],
            revealPolicy: "after_attempt",
          },
        ]}
      />,
    );
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "3" } });
    expect(screen.getByRole("button", { name: "Show next hint" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    await screen.findByText("Try again.");
    fireEvent.click(screen.getByRole("button", { name: "Show next hint" }));
    expect(await screen.findByText("Hint 1")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("retries a failed Worked acknowledgement with the same key", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("failure", { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "acknowledged" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PerpendicularBisectorPilot
        items={[{ activityId: "worked", mode: "worked_example", prompt: "Worked", answer: 4 }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByText(/not saved/i);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByText("Practice complete.");
    expect((fetchMock.mock.calls[0][1] as RequestInit).headers).toEqual(
      (fetchMock.mock.calls[1][1] as RequestInit).headers,
    );
    vi.unstubAllGlobals();
  });

  it("completes three modes and uses a new key after a wrong answer", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "acknowledged" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "graded", score: 1, maxScore: 1 }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ kind: "graded", score: 0, maxScore: 1, feedback: "Try again." }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "graded", score: 1, maxScore: 1 }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PerpendicularBisectorPilot
        items={[
          {
            activityId: "worked",
            mode: "worked_example",
            prompt: "Worked",
            answer: 4,
            solutionSteps: [],
          },
          {
            activityId: "guided",
            mode: "guided_practice",
            prompt: "Guided",
            hint: "Set the distances equal.",
          },
          { activityId: "independent", mode: "independent_practice", prompt: "Independent" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByText("Guided");
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    await screen.findByText("Independent");
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "99" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    await screen.findByText("Try again.");
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    await screen.findByText("Practice complete.");
    const firstIndependent = fetchMock.mock.calls[2][1] as RequestInit;
    const corrected = fetchMock.mock.calls[3][1] as RequestInit;
    expect((firstIndependent.headers as Record<string, string>)["Idempotency-Key"]).not.toBe(
      (corrected.headers as Record<string, string>)["Idempotency-Key"],
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    vi.unstubAllGlobals();
  });
  it("does not skip Guided practice after repeated pending Worked clicks", async () => {
    let finish!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PerpendicularBisectorPilot
        items={[
          { activityId: "worked", mode: "worked_example", prompt: "Worked", answer: 4 },
          { activityId: "guided", mode: "guided_practice", prompt: "Guided" },
          { activityId: "independent", mode: "independent_practice", prompt: "Independent" },
        ]}
      />,
    );
    const button = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    await act(async () =>
      finish(new Response(JSON.stringify({ kind: "acknowledged" }), { status: 200 })),
    );
    expect(await screen.findByText("Guided")).toBeInTheDocument();
    expect(screen.queryByText("Independent")).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("uses a new request key when the student edits an answer after a failed save", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("failure", { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "graded", score: 1, maxScore: 1 }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PerpendicularBisectorPilot
        items={[{ activityId: "independent", mode: "independent_practice", prompt: "Independent" }]}
      />,
    );
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "99" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    await screen.findByText(/not saved/i);
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    await screen.findByText("Practice complete.");
    const first = fetchMock.mock.calls[0][1] as RequestInit;
    const second = fetchMock.mock.calls[1][1] as RequestInit;
    expect((first.headers as Record<string, string>)["Idempotency-Key"]).not.toBe(
      (second.headers as Record<string, string>)["Idempotency-Key"],
    );
    expect(JSON.parse(second.body as string).rawResponse).toBe("4");
    vi.unstubAllGlobals();
  });
});
