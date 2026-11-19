import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  generateTopic12NegativeRateContextChoice,
  generateTopic12NegativeRateContextChoiceOutput,
} from "@math-platform/math-content/knowledge-space";

import { PrecalculusTopic12NegativeRateContextWorkedPilot } from "@/components/student/PrecalculusTopic12NegativeRateContextWorkedPilot";

const sourceVariant = generateTopic12NegativeRateContextChoice(0);
const sourceOutput = generateTopic12NegativeRateContextChoiceOutput(0);
const sourceAnswer = (sourceOutput.expectedAnswer as { selectedOptionId: string }).selectedOptionId;
const SOURCE_PROMPT =
  "The graph of the function y = f(x) in the xy-plane always has a negative rate of change. Which of the following definitions for the variables x and y would best model the function f?";
const SOURCE_OPTIONS = [
  {
    id: "A",
    label: "A",
    xDefinition: "the age, in years, of a young child",
    yDefinition: "the height, in inches, of the young child",
  },
  {
    id: "B",
    label: "B",
    xDefinition: "the total number of points scored in a basketball game",
    yDefinition: "the time remaining, in seconds, in the game",
  },
  {
    id: "C",
    label: "C",
    xDefinition: "the time, in seconds, since a ball was thrown straight up in the air",
    yDefinition: "the height, in feet, of the ball",
  },
  {
    id: "D",
    label: "D",
    xDefinition: "the radius, in meters, of a circle",
    yDefinition: "the area, in square inches, of the circle",
  },
] as const;
const SOURCE_STEPS = [
  "For an always-negative rate, x increases while y decreases.",
  "Option B models this: as points scored increase, time remaining in the game decreases.",
  "Options A and D increase, and option C does not always decrease. Therefore, option B is correct.",
];
const FINAL_ANSWER =
  "Option B is correct: x is the total number of points scored in a basketball game, and y is the time remaining, in seconds, in the game.";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function malformedJsonResponse() {
  return new Response("{", {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function expectNoAuthorityKeys(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const key of [
    "activityId",
    "learnerId",
    "mode",
    "correctOptionId",
    "correctAnswer",
    "expectedAnswer",
    "gradingMetadata",
    "score",
    "correctness",
    "steps",
    "solutionSteps",
    "xDefinition",
    "yDefinition",
  ]) {
    expect(serialized).not.toContain(`"${key}"`);
  }
}

describe("PrecalculusTopic12NegativeRateContextWorkedPilot", () => {
  it("renders the exact source Worked activity and sends only the raw B selection", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        response({ submissionId: "activity_submissions:negative-rate-worked-component" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic12NegativeRateContextWorkedPilot />);

    expect(sourceAnswer).toBe("B");
    expect(sourceVariant.prompt).toBe(SOURCE_PROMPT);
    expect(sourceVariant.options).toStrictEqual(SOURCE_OPTIONS);
    expect(sourceOutput.solutionSteps.map((step) => step.description)).toStrictEqual(SOURCE_STEPS);
    expect(
      screen.getByRole("heading", { name: "Worked Example: Model a Negative Rate Context" }),
    ).toBeTruthy();
    expect(screen.getByText(SOURCE_PROMPT)).toBeTruthy();
    for (const option of SOURCE_OPTIONS) {
      expect(screen.getByText(`x = ${option.xDefinition}`)).toBeTruthy();
      expect(screen.getByText(`y = ${option.yDefinition}`)).toBeTruthy();
    }
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    expect(radios.filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(1);
    expect(radios.find((radio) => (radio as HTMLInputElement).value === "B")).toBeChecked();
    expect(radios.filter((radio) => !(radio as HTMLInputElement).disabled)).toHaveLength(0);
    for (const step of SOURCE_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Negative-rate context Worked example review saved.",
      ),
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "/api/activities/precalculus-topic-1-2-negative-rate-context-worked/submissions",
    );
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("content-type")).toBe("application/json");
    const key = new Headers(init.headers).get("Idempotency-Key");
    expect(key).toEqual(expect.any(String));
    expect(key).not.toBe("");
    expect(JSON.parse(String(init.body))).toStrictEqual({ selectedOptionId: "B" });
    expectNoAuthorityKeys(JSON.parse(String(init.body)));
    expect(
      screen.getByRole("button", { name: "Negative-rate context Worked example reviewed" }),
    ).toBeDisabled();
  });

  it("prevents duplicate clicks and reuses the same key after a failed request", async () => {
    let resolveFirst!: (value: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(
        response({ submissionId: "activity_submissions:negative-rate-worked-retry" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic12NegativeRateContextWorkedPilot />);
    const reviewButton = screen.getByRole("button", { name: "Mark worked example reviewed" });
    fireEvent.click(reviewButton);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Saving…" }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveFirst(response({ error: "Temporary failure." }, 500));
    const retryButton = await screen.findByRole("button", {
      name: "Retry negative-rate context Worked example review",
    });
    const firstKey = new Headers((fetchMock.mock.calls[0] as [string, RequestInit])[1].headers).get(
      "Idempotency-Key",
    );
    fireEvent.click(retryButton);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Negative-rate context Worked example reviewed" }),
      ).toBeDisabled(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondKey = new Headers(
      (fetchMock.mock.calls[1] as [string, RequestInit])[1].headers,
    ).get("Idempotency-Key");
    expect(secondKey).toBe(firstKey);
    expect((fetchMock.mock.calls[1] as [string, RequestInit])[1].body).toBe(
      JSON.stringify({ selectedOptionId: "B" }),
    );
  });

  it.each([
    ["an HTTP error", response({ error: "private server detail" }, 500)],
    ["a non-object JSON response", response(["submission-id"])],
    ["a blank submission ID", response({ submissionId: " " })],
    ["malformed JSON", malformedJsonResponse()],
  ])("shows a safe retry state for %s", async (_label, serverResponse) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(serverResponse));

    render(<PrecalculusTopic12NegativeRateContextWorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to record the negative-rate context Worked example review.",
    );
    expect(
      screen.getByRole("button", { name: "Retry negative-rate context Worked example review" }),
    ).toBeEnabled();
    expect(screen.getByRole("alert")).not.toHaveTextContent("private server detail");
  });
});
