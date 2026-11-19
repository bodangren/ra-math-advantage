import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { realZerosAndMultiplicitiesSchema } from "@math-platform/math-content";
import { generateTopic15RealZerosAndMultiplicitiesOutput } from "@math-platform/math-content/knowledge-space";

import { PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot } from "@/components/student/PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot";
import { PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const OUTPUT = generateTopic15RealZerosAndMultiplicitiesOutput(0);
const REVIEW_URL =
  "/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities-worked/submissions";
const SAFE_ERROR = "Unable to save the Topic 1.5 real zeros and multiplicities Worked review.";
const FINAL_ANSWER =
  "For f, the real zeros are x = -1 (multiplicity 1), x = 0 (multiplicity 3), and x = 4 (multiplicity 2). For g, x = -2 (multiplicity 1) and x = 2 (multiplicity 5).";
const SOURCE_ANSWERS = {
  a: [
    { zero: -1, multiplicity: 1 },
    { zero: 0, multiplicity: 3 },
    { zero: 4, multiplicity: 2 },
  ],
  b: [
    { zero: -2, multiplicity: 1 },
    { zero: 2, multiplicity: 5 },
  ],
} as const;
const SOURCE_STEPS = [
  "For f(x) = -2x^3(x+1)(x-4)^2, the real zeros are x = 0 (multiplicity 3), x = -1 (multiplicity 1), and x = 4 (multiplicity 2).",
  "For g(x) = 3(x^2 - 4)(x - 2)^4, factor x^2 - 4 as (x - 2)(x + 2).",
  "Then g(x) = 3(x - 2)^5(x + 2), so x = 2 has multiplicity 5 and x = -2 has multiplicity 1.",
];
const CREATE_RESULT = {
  submissionId: "activity_submissions:topic-1-5-real-zeros-and-multiplicities-worked-component",
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

describe("PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot", () => {
  it("renders the exact seed-0 source review without editable controls", () => {
    const { container } = render(<PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot />);
    const publicProps = realZerosAndMultiplicitiesSchema.parse(OUTPUT.data.rendererProps);

    expect(
      screen.getByRole("heading", { name: "Worked Example: Real Zeros and Multiplicities" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Review the factored forms, real zeros, multiplicities, and reasoning. Then save this Worked review.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Find all real zeros with multiplicity.")).toBeTruthy();
    expect(screen.getByLabelText("f(x) = -2x^3(x+1)(x-4)^2")).toBeTruthy();
    expect(screen.getByLabelText("g(x) = 3(x^2 - 4)(x - 2)^4")).toBeTruthy();
    expect(screen.getAllByText("x = -1 (multiplicity 1)")).toHaveLength(1);
    expect(screen.getAllByText("x = 0 (multiplicity 3)")).toHaveLength(1);
    expect(screen.getAllByText("x = 4 (multiplicity 2)")).toHaveLength(1);
    expect(screen.getAllByText("x = -2 (multiplicity 1)")).toHaveLength(1);
    expect(screen.getAllByText("x = 2 (multiplicity 5)")).toHaveLength(1);
    SOURCE_STEPS.forEach((step) => expect(screen.getByText(step)).toBeTruthy());
    expect(screen.getByText(FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryAllByRole("spinbutton")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(screen.getByRole("button", { name: "Save Worked review" })).toBeEnabled();
    expect(publicProps).toStrictEqual(OUTPUT.data.rendererProps);
    expect(container.textContent).not.toContain("Server score");
    expect(collectAttributeNames()).not.toEqual(
      expect.arrayContaining([
        "correctanswers",
        "expectedanswer",
        "authority",
        "score",
        "mastery",
        "nodeid",
      ]),
    );
  });

  it("posts the exact source envelope and shows the saved attempt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot />);

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
      activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: SOURCE_ANSWERS,
      parts: [
        { partId: "a", rawAnswer: SOURCE_ANSWERS.a },
        { partId: "b", rawAnswer: SOURCE_ANSWERS.b },
      ],
    });
    expect(Number.isFinite(Date.parse(String(body.submittedAt)))).toBe(true);
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
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot />);
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
    ["wrong ordinal type", response({ ...CREATE_RESULT, attemptOrdinal: "1" })],
    ["invalid time", response({ ...CREATE_RESULT, submittedAt: "not-a-date" })],
    ["noncanonical time", response({ ...CREATE_RESULT, submittedAt: "2026-08-30" })],
    ["wrong time type", response({ ...CREATE_RESULT, submittedAt: 1 })],
  ])("shows one safe retry state for %s", async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot />);

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
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot />);

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
  });
});
