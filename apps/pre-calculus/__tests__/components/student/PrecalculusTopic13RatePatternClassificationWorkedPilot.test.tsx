import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  generateTopic13RatePatternClassification,
  generateTopic13RatePatternClassificationOutput,
} from "@math-platform/math-content/knowledge-space";

import { PrecalculusTopic13RatePatternClassificationWorkedPilot } from "@/components/student/PrecalculusTopic13RatePatternClassificationWorkedPilot";

const SOURCE_PROMPT = "Could each function be linear, quadratic, or neither?";
const SOURCE_CASES = [
  { id: "a", functionName: "f", xValues: [1, 2, 3, 4], yValues: [0, 1, 4, 9] },
  { id: "b", functionName: "g", xValues: [1, 2, 5, 10], yValues: [0, 1, 4, 9] },
  { id: "c", functionName: "p", xValues: [1, 1.1, 1.2, 1.3], yValues: [1, 7, 11, 13] },
] as const;
const SOURCE_CLASSIFICATIONS = { a: "quadratic", b: "linear", c: "quadratic" } as const;
const SOURCE_STEPS = [
  "Equal input widths of 1 and constant second differences of 2 show that f could be quadratic (concave up).",
  "The input widths are 1, 3, and 5. The output changes are also 1, 3, and 5. Each average rate is 1, so g could be linear: g(x) = x - 1.",
  "Equal input widths of 0.1 and differences 6, 4, 2 with constant second differences of -2 show that p could be quadratic (concave down).",
];
const FINAL_ANSWER = "a) quadratic; b) linear; c) quadratic.";
const CREATE_URL =
  "/api/activities/precalculus-topic-1-3-rate-pattern-classification-worked/submissions";
const CREATE_RESULT = {
  submissionId: "activity_submissions:rate-pattern-worked-component",
  attemptOrdinal: 1,
  submittedAt: "2026-08-29T11:00:00.000Z",
};
const AUTHORITY_KEYS = [
  "activityId",
  "learnerId",
  "mode",
  "correctness",
  "score",
  "expectedAnswer",
  "correctClassifications",
  "steps",
  "solutionSteps",
  "solution",
  "finalAnswer",
  "attemptNumber",
  "attemptOrdinal",
  "submittedAt",
  "contractVersion",
  "status",
  "parts",
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

function assertSourceTables(): void {
  const tables = screen.getAllByRole("table");
  expect(tables).toHaveLength(3);
  for (const tableCase of SOURCE_CASES) {
    const table = screen.getByRole("table", {
      name: `Case ${tableCase.id}: ${tableCase.functionName}`,
    });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(rows[0]?.textContent).toBe(`x${tableCase.xValues.join("")}`);
    expect(rows[1]?.textContent).toBe(`${tableCase.functionName}(x)${tableCase.yValues.join("")}`);
  }
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

describe("PrecalculusTopic13RatePatternClassificationWorkedPilot", () => {
  it("renders the exact seed-0 source Worked example", () => {
    const variant = generateTopic13RatePatternClassification(0);
    const output = generateTopic13RatePatternClassificationOutput(0);
    render(<PrecalculusTopic13RatePatternClassificationWorkedPilot />);

    expect(variant.prompt).toBe(SOURCE_PROMPT);
    expect(variant.cases).toEqual(SOURCE_CASES);
    expect(output.expectedAnswer).toEqual(SOURCE_CLASSIFICATIONS);
    expect(output.solutionSteps.map((step) => step.description)).toEqual(SOURCE_STEPS);
    expect(
      screen.getByRole("heading", { name: "Worked Example: Classify Rate Patterns" }),
    ).toBeTruthy();
    expect(screen.getByText(SOURCE_PROMPT)).toBeTruthy();
    assertSourceTables();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(12);
    expect(radios.filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(3);
    expect(
      within(screen.getByRole("group", { name: "Classify case a" })).getByRole("radio", {
        name: "Quadratic",
      }),
    ).toHaveProperty("checked", true);
    expect(
      within(screen.getByRole("group", { name: "Classify case b" })).getByRole("radio", {
        name: "Linear",
      }),
    ).toHaveProperty("checked", true);
    expect(
      within(screen.getByRole("group", { name: "Classify case c" })).getByRole("radio", {
        name: "Quadratic",
      }),
    ).toHaveProperty("checked", true);
    for (const radio of radios) expect(radio).toHaveProperty("disabled", true);
    for (const step of SOURCE_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
  });

  it("sends only the raw source classifications and saves the review", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic13RatePatternClassificationWorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );
    const call = fetchMock.mock.calls[0] as unknown[];
    expect(call[0]).toBe(CREATE_URL);
    const init = call[1] as RequestInit;
    expect(init.method).toBe("POST");
    const headers = new Headers(init.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("Idempotency-Key")).toEqual(expect.any(String));
    expect(headers.get("Idempotency-Key")).not.toBe("");
    expect(requestBody(call)).toStrictEqual(SOURCE_CLASSIFICATIONS);
    expect(Object.keys(requestBody(call) as Record<string, unknown>)).toEqual(["a", "b", "c"]);
    assertNoAuthority(requestBody(call));
    expect(
      screen.getByRole("button", { name: "Rate-pattern classification Worked example reviewed" }),
    ).toBeDisabled();
  });

  it("blocks fast duplicate review clicks while saving", async () => {
    let resolveRequest!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    const fetchMock = vi.fn().mockReturnValueOnce(pending);
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic13RatePatternClassificationWorkedPilot />);
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

    render(<PrecalculusTopic13RatePatternClassificationWorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to save the rate-pattern classification Worked example review.",
      ),
    );
    expect(
      screen.getByRole("button", {
        name: "Retry rate-pattern classification Worked example review",
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

    render(<PrecalculusTopic13RatePatternClassificationWorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Mark worked example reviewed" }));
    await screen.findByRole("button", {
      name: "Retry rate-pattern classification Worked example review",
    });
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstInit = firstCall[1] as RequestInit;
    const firstKey = new Headers(firstInit.headers).get("Idempotency-Key");
    const firstBody = firstInit.body;

    fireEvent.click(
      screen.getByRole("button", {
        name: "Retry rate-pattern classification Worked example review",
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    const secondInit = secondCall[1] as RequestInit;
    expect(secondCall[0]).toBe(CREATE_URL);
    expect(new Headers(secondInit.headers).get("Idempotency-Key")).toBe(firstKey);
    expect(secondInit.body).toBe(firstBody);
    expect(requestBody(secondCall)).toStrictEqual({ a: "quadratic", b: "linear", c: "quadratic" });
  });
});
