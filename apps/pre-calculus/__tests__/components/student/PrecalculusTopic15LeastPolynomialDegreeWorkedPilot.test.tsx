import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { leastPolynomialDegreeSchema } from "@math-platform/math-content";
import { generateTopic15LeastPolynomialDegreeOutput } from "@math-platform/math-content/knowledge-space";

import { PrecalculusTopic15LeastPolynomialDegreeWorkedPilot } from "@/components/student/PrecalculusTopic15LeastPolynomialDegreeWorkedPilot";
import { PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const OUTPUT = generateTopic15LeastPolynomialDegreeOutput(0);
const REVIEW_URL =
  "/api/activities/precalculus-topic-1-5-least-polynomial-degree-worked/submissions";
const SAFE_ERROR = "Unable to save the Topic 1.5 least polynomial degree Worked review.";
const FINAL_ANSWER = "The least possible degree is 5.";
const SOURCE_ANSWERS = { leastDegree: 5 } as const;
const SOURCE_STEPS = [
  "Because f has real coefficients, x = -i√3 is also a zero.",
  "The conjugate pair contributes 2 nonreal zeros, and the graph shows at least 3 real zeros.",
  "Therefore, the least possible degree is 2 + 3 = 5.",
];
const CREATE_RESULT = {
  submissionId: "activity_submissions:topic-1-5-least-polynomial-degree-worked-component",
  attemptOrdinal: 1,
  submittedAt: "2026-08-30T12:00:00.000Z",
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

function collectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, keys));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nested]) => {
      keys.push(key);
      collectKeys(nested, keys);
    });
  }
  return keys;
}

function collectAttributeNames(): string[] {
  return [...document.querySelectorAll("*")].flatMap((element) =>
    [...element.attributes].map((attribute) => attribute.name),
  );
}

function expectNoAuthorityAttributes(): void {
  expect(collectAttributeNames()).not.toEqual(
    expect.arrayContaining([
      "correctanswer",
      "expectedanswer",
      "authority",
      "score",
      "mastery",
      "nodeid",
    ]),
  );
}

function expectNoAuthority(value: unknown): void {
  const forbidden = new Set([
    "answer",
    "answerKey",
    "correctAnswer",
    "correctAnswers",
    "expectedAnswer",
    "grading",
    "gradingMetadata",
    "normalizedAnswer",
    "solution",
    "solutions",
    "solutionSteps",
    "steps",
    "finalAnswer",
    "authority",
    "score",
    "maxScore",
    "correctness",
    "isCorrect",
    "mastery",
    "kst",
    "nodeId",
  ]);
  expect(collectKeys(value).filter((key) => forbidden.has(key))).toEqual([]);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PrecalculusTopic15LeastPolynomialDegreeWorkedPilot", () => {
  it("renders the exact seed-0 Worked source review without editable controls", () => {
    const { container } = render(<PrecalculusTopic15LeastPolynomialDegreeWorkedPilot />);
    const publicProps = leastPolynomialDegreeSchema.parse(OUTPUT.data.rendererProps);

    expect(
      screen.getByRole("heading", { name: "Worked Example: Least Polynomial Degree" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "The zero x = i√3 is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Given nonreal zero: x = i√3")).toBeTruthy();
    expect(screen.getByText("Real zeros shown by the graph: At least 3")).toBeTruthy();
    expect(screen.getByText("Least possible degree: 5")).toBeTruthy();
    SOURCE_STEPS.forEach((step) => expect(screen.getByText(step)).toBeTruthy());
    expect(screen.getByText("Answer:")).toBeTruthy();
    expect(screen.getByText(FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryAllByRole("spinbutton")).toHaveLength(0);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(screen.getByRole("button", { name: "Save Worked review" })).toBeEnabled();
    expect(publicProps).toStrictEqual(OUTPUT.data.rendererProps);
    expect(container.textContent).not.toContain("Server score");
    expectNoAuthorityAttributes();
    expect(container.textContent).not.toContain("Mastery Advantage");
    expect(container.textContent).not.toContain("Knowledge state");
    expect(container.textContent).not.toContain("Node ID");
  });

  it("shows the review instruction with the source reasoning terms", () => {
    render(<PrecalculusTopic15LeastPolynomialDegreeWorkedPilot />);

    expect(
      screen.getByText(
        "Review the nonreal zero i√3, its conjugate pair, the 3 real zeros, and the reasoning. Then save this Worked review.",
      ),
    ).toBeTruthy();
  });

  it("posts the exact source envelope and shows the saved attempt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic15LeastPolynomialDegreeWorkedPilot />);

    fireEvent.click(screen.getByRole("button", { name: "Save Worked review" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    const call = fetchMock.mock.calls[0] as unknown[];
    const init = call[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(call[0]).toBe(REVIEW_URL);
    expect(init.method).toBe("POST");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("Idempotency-Key")).toEqual(expect.any(String));
    expect(headers.get("Idempotency-Key")).not.toBe("");
    const body = requestBody(call);
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
      activityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: SOURCE_ANSWERS,
      parts: [{ partId: "leastDegree", rawAnswer: 5 }],
    });
    expect(Number.isFinite(Date.parse(String(body.submittedAt)))).toBe(true);
    expect(new Date(String(body.submittedAt)).toISOString()).toBe(body.submittedAt);
    expectNoAuthority(body);
    expect(screen.getByRole("button", { name: "Worked review saved" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Worked review saved" }));
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("shows Saving and blocks duplicate clicks while the request is pending", async () => {
    let resolveRequest!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    const fetchMock = vi.fn().mockReturnValueOnce(pending);
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic15LeastPolynomialDegreeWorkedPilot />);
    const save = screen.getByRole("button", { name: "Save Worked review" });

    fireEvent.click(save);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    fireEvent.click(save);
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveRequest(response(CREATE_RESULT));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );
  });

  it.each([
    ["HTTP error", response({ error: "private backend detail" }, 500)],
    ["invalid JSON", malformedJsonResponse()],
    ["non-object result", response([])],
    ["extra result field", response({ ...CREATE_RESULT, score: 1 })],
    [
      "missing result field",
      response({ submissionId: CREATE_RESULT.submissionId, attemptOrdinal: 1 }),
    ],
    ["blank submission ID", response({ ...CREATE_RESULT, submissionId: " " })],
    ["wrong submission ID type", response({ ...CREATE_RESULT, submissionId: 1 })],
    ["zero ordinal", response({ ...CREATE_RESULT, attemptOrdinal: 0 })],
    ["fractional ordinal", response({ ...CREATE_RESULT, attemptOrdinal: 1.5 })],
    ["unsafe ordinal", response({ ...CREATE_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 })],
    ["wrong ordinal type", response({ ...CREATE_RESULT, attemptOrdinal: "1" })],
    ["invalid time", response({ ...CREATE_RESULT, submittedAt: "not-a-date" })],
    ["noncanonical time", response({ ...CREATE_RESULT, submittedAt: "2026-08-30" })],
    ["wrong time type", response({ ...CREATE_RESULT, submittedAt: 1 })],
  ])("shows one safe retry state for %s", async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic15LeastPolynomialDegreeWorkedPilot />);

    fireEvent.click(screen.getByRole("button", { name: "Save Worked review" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(SAFE_ERROR);
    expect(alert.textContent).not.toContain("private backend detail");
    expect(screen.getByRole("button", { name: "Retry Worked review" })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("retries with the identical serialized body and idempotency key", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "private temporary detail" }, 500))
      .mockResolvedValueOnce(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic15LeastPolynomialDegreeWorkedPilot />);

    fireEvent.click(screen.getByRole("button", { name: "Save Worked review" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(SAFE_ERROR);
    expect(alert.textContent).not.toContain("private temporary detail");
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstInit = firstCall[1] as RequestInit;
    const firstBody = firstInit.body;
    const firstKey = new Headers(firstInit.headers).get("Idempotency-Key");

    fireEvent.click(screen.getByRole("button", { name: "Retry Worked review" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    const secondInit = secondCall[1] as RequestInit;
    expect(secondInit.body).toBe(firstBody);
    expect(new Headers(secondInit.headers).get("Idempotency-Key")).toBe(firstKey);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([REVIEW_URL, REVIEW_URL]);
  });
});
