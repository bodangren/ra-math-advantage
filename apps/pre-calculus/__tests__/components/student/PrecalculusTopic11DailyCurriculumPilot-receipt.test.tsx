import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));

import { PrecalculusTopic11DailyCurriculumPilot } from "@/components/student/PrecalculusTopic11DailyCurriculumPilot";

const props = {
  title: "Worked Example: Classify Graph Intervals",
  prompt: "Classify the intervals.",
  domain: [0, 9] as [number, number],
  changePoints: [3, 7] as [number, number],
  points: [
    { x: 0, y: 1 },
    { x: 3, y: 7 },
    { x: 7, y: 2 },
    { x: 9, y: 6 },
  ],
  presentationMode: "worked_example" as const,
  steps: [{ description: "Read the graph.", expression: "x=0 to x=9" }],
  finalAnswer: "Increasing, decreasing, and constant intervals.",
};
const receipt = {
  submissionId: "activity_submissions:worked",
  attemptOrdinal: 1,
  submittedAt: "2026-09-08T00:00:00.000Z",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function renderPilot() {
  render(
    <PrecalculusTopic11DailyCurriculumPilot
      stableActivityId="math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.worked_example"
      activityProps={props}
    />,
  );
}

function reviewButton() {
  return screen.getByRole("button", { name: /worked example review/i });
}

describe("Topic 1.1 Worked acknowledgement receipt", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.refresh.mockReset();
  });

  it("saves only after an exact safe receipt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(receipt));
    vi.stubGlobal("fetch", fetchMock);
    renderPilot();
    fireEvent.click(reviewButton());
    await expect(screen.findByRole("status")).resolves.toHaveTextContent(
      "Your worked-example acknowledgement was saved.",
    );
    expect(reviewButton()).toBeDisabled();
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/activities/precalculus-topic-1-1/submissions",
      expect.objectContaining({ method: "POST", body: "{}" }),
    );
  });

  it.each([
    { ...receipt, extra: true },
    { ...receipt, submissionId: " " },
    { ...receipt, attemptOrdinal: 0 },
    { ...receipt, attemptOrdinal: 1.5 },
    { ...receipt, submittedAt: "2026-09-08" },
  ])("keeps retry state for malformed HTTP 200 receipt %#", async (malformed) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(malformed))
      .mockResolvedValueOnce(response(receipt));
    vi.stubGlobal("fetch", fetchMock);
    renderPilot();
    fireEvent.click(reviewButton());
    const retry = await screen.findByRole("button", { name: "Retry worked example review" });
    expect(mocks.refresh).not.toHaveBeenCalled();
    const first = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(String(first.body)).toBe("{}");
    fireEvent.click(retry);
    await screen.findByRole("status");
    const second = fetchMock.mock.calls[1]![1] as RequestInit;
    expect(String(second.body)).toBe("{}");
    expect(new Headers(second.headers).get("Idempotency-Key")).toBe(
      new Headers(first.headers).get("Idempotency-Key"),
    );
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("keeps the same empty request and opaque key after a network failure", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("private transport detail"))
      .mockResolvedValueOnce(response(receipt));
    vi.stubGlobal("fetch", fetchMock);
    renderPilot();
    fireEvent.click(reviewButton());
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Unable to save the Topic 1.1 daily attempt.");
    expect(alert).not.toHaveTextContent("private transport detail");
    const first = fetchMock.mock.calls[0]![1] as RequestInit;
    fireEvent.click(reviewButton());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const second = fetchMock.mock.calls[1]![1] as RequestInit;
    expect(String(first.body)).toBe("{}");
    expect(String(second.body)).toBe("{}");
    expect(new Headers(second.headers).get("Idempotency-Key")).toBe(
      new Headers(first.headers).get("Idempotency-Key"),
    );
  });

  it("uses a generic error for an unsuccessful server response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ error: "private server detail" }, 500)),
    );
    renderPilot();
    fireEvent.click(reviewButton());
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Unable to save the Topic 1.1 daily attempt.");
    expect(alert).not.toHaveTextContent("private server detail");
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
