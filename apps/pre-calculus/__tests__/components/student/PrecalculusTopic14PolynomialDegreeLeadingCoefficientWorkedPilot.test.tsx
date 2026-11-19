import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  generateTopic14PolynomialDegreeLeadingCoefficient,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
} from "@math-platform/math-content/knowledge-space";

import { PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot } from "@/components/student/PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot";

const SOURCE_FINAL_ANSWER =
  "a) degree 4, leading coefficient 3; b) degree 3, leading coefficient -7; c) degree 0, leading coefficient 4.";
const REVIEW_URL =
  "/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient-worked/submissions";
const CREATE_RESULT = {
  submissionId: "activity_submissions:polynomial-worked-component",
  attemptOrdinal: 1,
  submittedAt: "2026-08-29T11:00:00.000Z",
};
const AUTHORITY_KEYS = [
  "activityId",
  "learnerId",
  "mode",
  "correctAnswers",
  "correctAnswer",
  "expectedAnswer",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "grading",
  "gradingMetadata",
  "score",
  "evidence",
];

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function malformedJsonResponse(): Response {
  return new Response("{", { status: 200, headers: { "content-type": "application/json" } });
}

function requestBody(call: unknown[]): unknown {
  return JSON.parse(String((call[1] as RequestInit).body)) as unknown;
}

function assertNoAuthority(value: unknown): void {
  const keys = new Set<string>();
  const collect = (current: unknown) => {
    if (Array.isArray(current)) {
      current.forEach(collect);
      return;
    }
    if (!current || typeof current !== "object") return;
    Object.entries(current).forEach(([key, child]) => {
      keys.add(key);
      collect(child);
    });
  };
  collect(value);
  for (const key of AUTHORITY_KEYS) expect(keys).not.toContain(key);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot", () => {
  it("renders the exact source Worked example without practice controls", () => {
    const variant = generateTopic14PolynomialDegreeLeadingCoefficient(0);
    const output = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0);
    render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot />);

    expect(variant.prompt).toBe("Find the leading coefficient and degree.");
    expect(variant.items).toEqual([
      {
        id: "a",
        functionName: "f",
        terms: [
          { coefficient: 3, exponent: 4 },
          { coefficient: 2, exponent: 1 },
          { coefficient: -7, exponent: 0 },
        ],
      },
      {
        id: "b",
        functionName: "y",
        terms: [
          { coefficient: 0.5, exponent: 1 },
          { coefficient: -7, exponent: 3 },
          { coefficient: 11, exponent: 0 },
        ],
      },
      { id: "c", functionName: "g", terms: [{ coefficient: 4, exponent: 0 }] },
    ]);
    expect(
      screen.getByRole("heading", { name: "Worked Example: Degree and Leading Coefficient" }),
    ).toBeTruthy();
    expect(screen.getByText("Find the leading coefficient and degree.")).toBeTruthy();
    expect(screen.getByLabelText("a polynomial").textContent).toBe("f(x) = 3x4 + 2x - 7");
    expect(screen.getByLabelText("b polynomial").textContent).toBe("y = 0.5x - 7x3 + 11");
    expect(screen.getByLabelText("c polynomial").textContent).toBe("g(x) = 4");
    expect(screen.getByLabelText("a polynomial").querySelector("sup")?.textContent).toBe("4");
    expect(screen.getByLabelText("b polynomial").querySelector("sup")?.textContent).toBe("3");
    expect(screen.getByText("Degree: 4")).toBeTruthy();
    expect(screen.getByText("Leading coefficient: 3")).toBeTruthy();
    expect(screen.getByText("Degree: 3")).toBeTruthy();
    expect(screen.getByText("Leading coefficient: -7")).toBeTruthy();
    expect(screen.getByText("Degree: 0")).toBeTruthy();
    expect(screen.getByText("Leading coefficient: 4")).toBeTruthy();
    for (const step of output.solutionSteps.map((item) => item.description)) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
  });

  it("sends only the six raw source answers and saves the review", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );
    const call = fetchMock.mock.calls[0] as unknown[];
    expect(call[0]).toBe(REVIEW_URL);
    const init = call[1] as RequestInit;
    expect(init.method).toBe("POST");
    const headers = new Headers(init.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("Idempotency-Key")).toEqual(expect.any(String));
    expect(headers.get("Idempotency-Key")).not.toBe("");
    expect(requestBody(call)).toStrictEqual({
      a_degree: "4",
      a_leading_coefficient: "3",
      b_degree: "3",
      b_leading_coefficient: "-7",
      c_degree: "0",
      c_leading_coefficient: "4",
    });
    expect(Object.keys(requestBody(call) as Record<string, unknown>)).toEqual([
      "a_degree",
      "a_leading_coefficient",
      "b_degree",
      "b_leading_coefficient",
      "c_degree",
      "c_leading_coefficient",
    ]);
    assertNoAuthority(requestBody(call));
    expect(screen.getByRole("button", { name: "Worked example reviewed" })).toBeDisabled();
  });

  it("blocks fast duplicate clicks while saving", async () => {
    let resolveRequest!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    const fetchMock = vi.fn().mockReturnValueOnce(pending);
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot />);
    const review = screen.getByRole("button", { name: "Mark worked example reviewed" });
    fireEvent.click(review);
    fireEvent.click(review);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveRequest(response(CREATE_RESULT));
    await waitFor(() => expect(screen.getByRole("status")).toBeTruthy());
  });

  it.each([
    ["HTTP error", response({ error: "private backend detail" }, 500)],
    ["malformed JSON", malformedJsonResponse()],
    ["non-object JSON", response(["submission-id"])],
    [
      "missing response field",
      response({ submissionId: CREATE_RESULT.submissionId, attemptOrdinal: 1 }),
    ],
    ["extra response field", response({ ...CREATE_RESULT, score: 1 })],
    ["blank submission ID", response({ ...CREATE_RESULT, submissionId: " " })],
    ["invalid ordinal", response({ ...CREATE_RESULT, attemptOrdinal: 0 })],
    ["non-integer ordinal", response({ ...CREATE_RESULT, attemptOrdinal: 1.5 })],
    ["invalid time", response({ ...CREATE_RESULT, submittedAt: "not-a-date" })],
  ])("shows a safe retry state for %s", async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to save the Topic 1.4 degree and leading coefficient Worked example review.",
      ),
    );
    expect(
      screen.getByRole("button", {
        name: "Retry degree and leading coefficient Worked example review",
      }),
    ).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain("private backend detail");
  });

  it("reuses the same key and body on retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "temporary failure" }, 500))
      .mockResolvedValueOnce(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));
    await screen.findByRole("button", {
      name: "Retry degree and leading coefficient Worked example review",
    });
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstInit = firstCall[1] as RequestInit;
    const firstKey = new Headers(firstInit.headers).get("Idempotency-Key");
    const firstBody = firstInit.body;

    fireEvent.click(
      screen.getByRole("button", {
        name: "Retry degree and leading coefficient Worked example review",
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    const secondInit = secondCall[1] as RequestInit;
    expect(secondCall[0]).toBe(REVIEW_URL);
    expect(new Headers(secondInit.headers).get("Idempotency-Key")).toBe(firstKey);
    expect(secondInit.body).toBe(firstBody);
    expect(requestBody(secondCall)).toStrictEqual({
      a_degree: "4",
      a_leading_coefficient: "3",
      b_degree: "3",
      b_leading_coefficient: "-7",
      c_degree: "0",
      c_leading_coefficient: "4",
    });
  });
});
