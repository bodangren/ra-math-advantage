import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  generateTopic14RateSignAndTrend,
  generateTopic14RateSignAndTrendOutput,
} from "@math-platform/math-content/knowledge-space";

import { PrecalculusTopic14RateSignAndTrendWorkedPilot } from "@/components/student/PrecalculusTopic14RateSignAndTrendWorkedPilot";
import { PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const OUTPUT = generateTopic14RateSignAndTrendOutput(0);
const VARIANT = generateTopic14RateSignAndTrend(0);
const ANSWERS = OUTPUT.expectedAnswer as { rateSign: string; rateTrend: string };
const REVIEW_URL = "/api/activities/precalculus-topic-1-4-rate-sign-and-trend-worked/submissions";
const CREATE_RESULT = {
  submissionId: "activity_submissions:rate-sign-worked-component",
  attemptOrdinal: 1,
  submittedAt: "2026-08-29T11:00:00.000Z",
};
const ANSWER_IDS = ["rateSign", "rateTrend"] as const;

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function malformedJsonResponse(): Response {
  return new Response("{", { status: 200, headers: { "content-type": "application/json" } });
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function collectAttributeNames(): string[] {
  return [...document.querySelectorAll("*")].flatMap((element) =>
    [...element.attributes].map((attribute) => attribute.name),
  );
}

function expectNoRequestAuthority(value: unknown): void {
  const forbidden = new Set([
    "score",
    "maxScore",
    "correctness",
    "isCorrect",
    "correctAnswer",
    "correctAnswers",
    "expectedAnswer",
    "answerKey",
    "solution",
    "solutions",
    "solutionSteps",
    "steps",
    "finalAnswer",
    "grading",
    "gradingMetadata",
    "normalizedAnswer",
    "authority",
    "mastery",
  ]);
  const visit = (entry: unknown): void => {
    if (Array.isArray(entry)) {
      entry.forEach(visit);
      return;
    }
    if (!entry || typeof entry !== "object") return;
    Object.entries(entry).forEach(([key, child]) => {
      expect(forbidden.has(key)).toBe(false);
      visit(child);
    });
  };
  visit(value);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PrecalculusTopic14RateSignAndTrendWorkedPilot", () => {
  it("renders the live seed-0 graph, source answers, reasoning, and no student controls", () => {
    const { container } = render(<PrecalculusTopic14RateSignAndTrendWorkedPilot />);

    expect(
      screen.getByRole("heading", { name: "Worked Example: Rate Sign and Trend" }),
    ).toBeTruthy();
    expect(screen.getByText(VARIANT.prompt)).toBeTruthy();
    expect(screen.getByText("Open interval: (3, 4)")).toBeTruthy();
    expect(screen.getByRole("img", { name: /Graph of h.*interval \(3, 4\)/ })).toBeTruthy();
    const table = screen.getByRole("table", { name: "Graph data for h" });
    for (const point of VARIANT.points) {
      expect(table.textContent).toContain(String(point.x));
      expect(table.textContent).toContain(String(point.y));
    }
    expect(screen.getByText(ANSWERS.rateSign)).toBeTruthy();
    expect(screen.getByText(ANSWERS.rateTrend)).toBeTruthy();
    for (const step of OUTPUT.solutionSteps.map((item) => item.description)) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(
      screen.getByText("The rate of change is positive and decreasing on (3, 4)."),
    ).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(collectAttributeNames()).not.toEqual(
      expect.arrayContaining(["correctanswers", "expectedanswer", "authority", "score", "mastery"]),
    );
    expect(container.textContent).not.toContain("Server score");
  });

  it("sends the exact eight-field raw envelope and saves the review", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic14RateSignAndTrendWorkedPilot />);

    fireEvent.click(screen.getByRole("button", { name: "Save Worked review" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );

    const call = fetchMock.mock.calls[0] as unknown[];
    const init = call[1] as RequestInit;
    const body = requestBody(call);
    expect(call[0]).toBe(REVIEW_URL);
    expect(init.method).toBe("POST");
    const headers = new Headers(init.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("Idempotency-Key")).toEqual(expect.any(String));
    expect(headers.get("Idempotency-Key")).not.toBe("");
    expect(Object.keys(body)).toEqual([
      "contractVersion",
      "activityId",
      "mode",
      "status",
      "attemptNumber",
      "submittedAt",
      "answers",
      "parts",
    ]);
    expect(body).toStrictEqual({
      contractVersion: "practice.v1",
      activityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: {
        rateSign: String(ANSWERS.rateSign),
        rateTrend: String(ANSWERS.rateTrend),
      },
      parts: ANSWER_IDS.map((partId) => ({ partId, rawAnswer: String(ANSWERS[partId]) })),
    });
    expectNoRequestAuthority(body);
    expect(screen.getByRole("button", { name: "Worked review saved" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Worked review saved" }));
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("blocks duplicate clicks while saving", async () => {
    let resolveRequest!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    const fetchMock = vi.fn().mockReturnValueOnce(pending);
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic14RateSignAndTrendWorkedPilot />);
    const button = screen.getByRole("button", { name: "Save Worked review" });

    fireEvent.click(button);
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveRequest(response(CREATE_RESULT));
    await waitFor(() => expect(screen.getByRole("status")).toBeTruthy());
  });

  it.each([
    ["HTTP error", response({ error: "private backend detail" }, 500)],
    ["malformed JSON", malformedJsonResponse()],
    ["non-object JSON", response(["submission-id"])],
    ["missing field", response({ submissionId: CREATE_RESULT.submissionId, attemptOrdinal: 1 })],
    ["extra field", response({ ...CREATE_RESULT, score: 1 })],
    ["blank submission ID", response({ ...CREATE_RESULT, submissionId: " " })],
    ["invalid ordinal", response({ ...CREATE_RESULT, attemptOrdinal: 0 })],
    ["fractional ordinal", response({ ...CREATE_RESULT, attemptOrdinal: 1.5 })],
    ["invalid timestamp", response({ ...CREATE_RESULT, submittedAt: "not-a-date" })],
    ["noncanonical timestamp", response({ ...CREATE_RESULT, submittedAt: "2026-08-29" })],
  ])("shows one safe retry state for %s", async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic14RateSignAndTrendWorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Save Worked review" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to save the Topic 1.4 rate sign and trend Worked review.",
      ),
    );
    expect(screen.getByRole("button", { name: "Retry Worked review" })).toBeEnabled();
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("private backend detail");
  });

  it("reuses the same frozen envelope and key on retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "temporary failure" }, 500))
      .mockResolvedValueOnce(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic14RateSignAndTrendWorkedPilot />);

    fireEvent.click(screen.getByRole("button", { name: "Save Worked review" }));
    await screen.findByRole("button", { name: "Retry Worked review" });
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstInit = firstCall[1] as RequestInit;
    const firstKey = new Headers(firstInit.headers).get("Idempotency-Key");
    const firstBody = firstInit.body;

    fireEvent.click(screen.getByRole("button", { name: "Retry Worked review" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    const secondInit = secondCall[1] as RequestInit;
    expect(new Headers(secondInit.headers).get("Idempotency-Key")).toBe(firstKey);
    expect(secondInit.body).toBe(firstBody);
    expectNoRequestAuthority(requestBody(secondCall));
  });
});
