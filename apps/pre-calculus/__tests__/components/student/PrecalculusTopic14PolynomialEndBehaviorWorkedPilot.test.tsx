import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { generateTopic14PolynomialEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";

import { PrecalculusTopic14PolynomialEndBehaviorWorkedPilot } from "@/components/student/PrecalculusTopic14PolynomialEndBehaviorWorkedPilot";
import { PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const OUTPUT = generateTopic14PolynomialEndBehaviorOutput(0);
const VARIANT = OUTPUT.data.rendererProps as {
  prompt: string;
  functionName: string;
  leadingTerm: { coefficient: number; exponent: number };
};
const ANSWERS = OUTPUT.expectedAnswer as { leftEnd: string; rightEnd: string };
const REVIEW_URL =
  "/api/activities/precalculus-topic-1-4-polynomial-end-behavior-worked/submissions";
const SAFE_ERROR = "Unable to save the Topic 1.4 polynomial end behavior Worked review.";
const CREATE_RESULT = {
  submissionId: "activity_submissions:end-behavior-worked-component",
  attemptOrdinal: 1,
  submittedAt: "2026-08-29T11:00:00.000Z",
};

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

function expectNoAuthority(value: unknown): void {
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

describe("PrecalculusTopic14PolynomialEndBehaviorWorkedPilot", () => {
  it("renders the live Worked source with answers, reasoning, and no learner controls", () => {
    const { container } = render(<PrecalculusTopic14PolynomialEndBehaviorWorkedPilot />);

    expect(
      screen.getByRole("heading", { name: "Worked Example: Polynomial End Behavior" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Review the leading term, answers, and reasoning. Then save this Worked review.",
      ),
    ).toBeTruthy();
    expect(screen.getByText(VARIANT.prompt)).toBeTruthy();
    expect(screen.getByLabelText("Leading term -3x^4")).toBeTruthy();
    expect(screen.getByLabelText("Leading term -3x^4").querySelector("sup")?.textContent).toBe("4");
    expect(screen.getAllByText("Negative infinity")).toHaveLength(2);
    for (const step of OUTPUT.solutionSteps.map((item) => item.description)) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(
      screen.getByText(
        "As x approaches negative infinity, f(x) approaches negative infinity. As x approaches positive infinity, f(x) approaches negative infinity.",
      ),
    ).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(screen.getByRole("button", { name: "Save Worked review" })).toBeEnabled();
    expect(collectAttributeNames()).not.toEqual(
      expect.arrayContaining(["correctanswers", "expectedanswer", "authority", "score", "mastery"]),
    );
    expect(container.textContent).not.toContain("Server score");
  });

  it("sends the exact eight-field source review and saves it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic14PolynomialEndBehaviorWorkedPilot />);

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
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: {
        leftEnd: ANSWERS.leftEnd,
        rightEnd: ANSWERS.rightEnd,
      },
      parts: [
        { partId: "leftEnd", rawAnswer: ANSWERS.leftEnd },
        { partId: "rightEnd", rawAnswer: ANSWERS.rightEnd },
      ],
    });
    expect(Number.isFinite(Date.parse(String(body.submittedAt)))).toBe(true);
    expectNoAuthority(body);
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
    render(<PrecalculusTopic14PolynomialEndBehaviorWorkedPilot />);
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
    ["non-string submission ID", response({ ...CREATE_RESULT, submissionId: 1 })],
    ["zero ordinal", response({ ...CREATE_RESULT, attemptOrdinal: 0 })],
    ["fractional ordinal", response({ ...CREATE_RESULT, attemptOrdinal: 1.5 })],
    ["non-string ordinal", response({ ...CREATE_RESULT, attemptOrdinal: "1" })],
    ["invalid timestamp", response({ ...CREATE_RESULT, submittedAt: "not-a-date" })],
    ["noncanonical timestamp", response({ ...CREATE_RESULT, submittedAt: "2026-08-29" })],
    ["non-string timestamp", response({ ...CREATE_RESULT, submittedAt: 1 })],
  ])("shows one safe retry state for %s", async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic14PolynomialEndBehaviorWorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Save Worked review" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(SAFE_ERROR));
    expect(screen.getByRole("button", { name: "Retry Worked review" })).toBeEnabled();
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("private backend detail");
    expect(screen.queryByText(/Server score/)).toBeNull();
  });

  it("reuses the same frozen envelope and key on retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "temporary failure" }, 500))
      .mockResolvedValueOnce(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic14PolynomialEndBehaviorWorkedPilot />);

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
    expectNoAuthority(requestBody(secondCall));
  });
});
