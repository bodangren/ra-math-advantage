import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PrecalculusTopic12PointwiseOrderingWorkedPilot } from "@/components/student/PrecalculusTopic12PointwiseOrderingWorkedPilot";
import { PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";
import {
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
} from "@math-platform/math-content/knowledge-space";

const sourceVariant = generateTopic12PointwiseRateOrdering(0);
const sourceOrder = (
  generateTopic12PointwiseRateOrderingOutput(0).expectedAnswer as {
    orderedPointIds: string[];
  }
).orderedPointIds;

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("PrecalculusTopic12PointwiseOrderingWorkedPilot", () => {
  it("renders the source Worked graph and sends only the raw source ordering", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ submissionId: "submission-1" }));
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic12PointwiseOrderingWorkedPilot />);

    expect(sourceOrder).toStrictEqual(["B", "C", "A"]);
    expect(screen.getByText(sourceVariant.prompt)).toBeTruthy();
    expect(
      screen.getByRole("img", {
        name: /A\(-3, 0\).*B\(-1, 1\).*C\(2\.3, -2\.1\).*Order the rates of change from least to greatest/i,
      }),
    ).toBeTruthy();
    expect(screen.getByTestId("pointwise-ordering-axes").getAttribute("d")).toBe(
      "M42 80H346M194 146V14",
    );
    expect(screen.getByText("x")).toBeTruthy();
    expect(screen.getByText("y")).toBeTruthy();
    for (const point of sourceVariant.labeledPoints) {
      const label = screen.getByTestId(`pointwise-ordering-label-${point.label}`);
      expect(label).toHaveAttribute("data-point-x", String(point.x));
      expect(label).toHaveAttribute("data-point-y", String(point.y));
    }
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.getByText("Least to greatest: B, C, A")).toBeTruthy();
    for (const step of sourceVariant.solutionSteps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText("The least-to-greatest order is B < C < A.")).toBeTruthy();
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /submit answer/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Pointwise ordering Worked example reviewed" }),
      ).toBeDisabled(),
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/activities/precalculus-topic-1-2-pointwise-ordering-worked/submissions");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("content-type")).toBe("application/json");
    const key = new Headers(init.headers).get("Idempotency-Key");
    expect(key).toEqual(expect.any(String));
    expect(key).not.toBe("");
    expect(init.body).toBe(JSON.stringify({ orderedPointIds: ["B", "C", "A"] }));
    expect(JSON.stringify(init.body)).not.toMatch(
      /activityId|learnerId|mode|score|maxScore|correct|answerKey|steps|graphPoints|slope|derivative/i,
    );
    expect(PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID).toContain(
      ".worked_example",
    );
  });

  it("disables duplicate clicks and reuses the same idempotency key on retry", async () => {
    let resolveFirst!: (value: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(response({ submissionId: "submission-2" }));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic12PointwiseOrderingWorkedPilot />);

    const reviewButton = screen.getByRole("button", { name: "Mark worked example reviewed" });
    fireEvent.click(reviewButton);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Saving…" }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveFirst(response({ error: "Temporary failure." }, 500));
    const retryButton = await screen.findByRole("button", {
      name: "Retry pointwise ordering Worked example review",
    });
    const firstKey = new Headers((fetchMock.mock.calls[0] as [string, RequestInit])[1].headers).get(
      "Idempotency-Key",
    );
    fireEvent.click(retryButton);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Pointwise ordering Worked example reviewed" }),
      ).toBeDisabled(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondKey = new Headers(
      (fetchMock.mock.calls[1] as [string, RequestInit])[1].headers,
    ).get("Idempotency-Key");
    expect(secondKey).toBe(firstKey);
    expect((fetchMock.mock.calls[1] as [string, RequestInit])[1].body).toBe(
      JSON.stringify({ orderedPointIds: sourceOrder }),
    );
  });

  it.each([
    ["an HTTP error", response({ error: "Internal detail." }, 500)],
    ["a non-object JSON response", response(["submission-3"])],
    ["a blank submission ID", response({ submissionId: " " })],
    [
      "a malformed response",
      new Response("{", { status: 200, headers: { "content-type": "application/json" } }),
    ],
  ])("shows a safe retry state for %s", async (_label, serverResponse) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(serverResponse));
    render(<PrecalculusTopic12PointwiseOrderingWorkedPilot />);

    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to record the pointwise ordering Worked example review.",
    );
    expect(
      screen.getByRole("button", { name: "Retry pointwise ordering Worked example review" }),
    ).toBeEnabled();
  });
});
