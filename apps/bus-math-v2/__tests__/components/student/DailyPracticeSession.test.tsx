import { beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DailyPracticeSession } from "@/components/student/DailyPracticeSession";
const fetchMock = vi.fn();
vi.mock("@/lib/practice/engine/family-registry", () => ({
  getPracticeFamily: () => ({ generate: () => ({}) }),
}));
vi.mock("@/lib/srs/answer-inputs/registry", () => ({
  dailyPracticeInputRegistry: {
    "normal-balance": function Input({ onSubmit }: { onSubmit: (value: unknown) => void }) {
      const [submitted, setSubmitted] = useState(false);
      return (
        <button
          disabled={submitted}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ activityId: "normal-balance-1", answers: { account: "debit" }, parts: [] });
          }}
        >
          Submit answer
        </button>
      );
    },
  },
}));
const card = (id: string, family = "normal-balance") => ({
  cardId: id,
  studentId: "student",
  problemFamilyId: family,
  reps: 0,
});
const response = (value: unknown, ok = true) => ({ ok, json: async () => value });
const start = async (cards = [card("one")]) => {
  fetchMock.mockResolvedValueOnce(response(cards));
  render(<DailyPracticeSession studentId="student" />);
  await screen.findByRole("button", { name: "Submit answer" });
};
describe("DailyPracticeSession server boundary", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  it("shows loading while the queue request is pending", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<DailyPracticeSession studentId="student" />);
    expect(screen.getByText(/Loading your practice queue/)).toBeInTheDocument();
  });
  it("shows an empty session", async () => {
    fetchMock.mockResolvedValue(response([]));
    render(<DailyPracticeSession studentId="student" />);
    expect(await screen.findByText("No Problems Due")).toBeInTheDocument();
  });
  it("reports a queue failure", async () => {
    fetchMock.mockResolvedValue(response(null, false));
    render(<DailyPracticeSession studentId="student" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load daily practice");
  });
  it("loads the current account queue without sending a client-selected user ID", async () => {
    await start();
    expect(fetchMock.mock.calls[0]).toEqual(["/api/srs", { cache: "no-store" }]);
    expect(screen.getByText("Problem 1 of 1")).toBeInTheDocument();
  });
  it("sends answers without a client grade or schedule", async () => {
    await start();
    fetchMock.mockResolvedValue(response({ success: true }));
    await userEvent.click(screen.getByText("Submit answer"));
    await screen.findByTestId("next-problem-button");
    const [url, options] = fetchMock.mock.calls[1];
    const body = JSON.parse(options.body);
    expect(url).toBe("/api/srs");
    expect(body).toEqual({
      cardId: "one",
      activityId: "normal-balance-1",
      answers: { account: "debit" },
      idempotencyKey: expect.any(String),
    });
  });
  it("resets the answer input and moves focus on the next card", async () => {
    await start([card("one"), card("two")]);
    fetchMock.mockResolvedValue(response({ success: true }));
    await userEvent.click(screen.getByText("Submit answer"));
    await userEvent.click(await screen.findByTestId("next-problem-button"));
    expect(screen.getByText("Problem 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Submit answer")).toBeEnabled();
    await waitFor(() => expect(screen.getByTestId("practice-card")).toHaveFocus());
  });
  it("finishes after the last saved card", async () => {
    await start();
    fetchMock.mockResolvedValue(response({ success: true }));
    await userEvent.click(screen.getByText("Submit answer"));
    await userEvent.click(await screen.findByTestId("next-problem-button"));
    expect(await screen.findByText("No Problems Due")).toBeInTheDocument();
  });
  it("explains a queue with no supported inputs", async () => {
    fetchMock.mockResolvedValue(response([card("unsupported", "missing")]));
    render(<DailyPracticeSession studentId="student" />);
    expect(await screen.findByText("Practice inputs unavailable")).toBeInTheDocument();
    expect(screen.queryByText("No Problems Due")).not.toBeInTheDocument();
  });
  it("filters unsupported cards without blocking later supported cards", async () => {
    await start([card("unsupported", "missing"), card("one")]);
    expect(screen.getByText("Problem 1 of 1")).toBeInTheDocument();
  });
  it("keeps the same request identity when a save fails", async () => {
    await start();
    fetchMock
      .mockResolvedValueOnce(response(null, false))
      .mockResolvedValueOnce(response({ success: true }));
    await userEvent.click(screen.getByText("Submit answer"));
    await userEvent.click(await screen.findByText("Retry submission"));
    await screen.findByTestId("next-problem-button");
    expect(fetchMock.mock.calls[2]).toEqual(fetchMock.mock.calls[1]);
  });
  it("shows saving state until the server confirms the review", async () => {
    await start();
    let finish: (value: unknown) => void = () => {};
    fetchMock.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    await userEvent.click(screen.getByText("Submit answer"));
    expect(screen.getByText("Saving result...")).toBeInTheDocument();
    finish(response({ success: true }));
    await screen.findByTestId("next-problem-button");
  });
});
