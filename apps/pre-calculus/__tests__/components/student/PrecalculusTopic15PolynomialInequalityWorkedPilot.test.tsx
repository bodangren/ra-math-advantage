import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { polynomialInequalitySignChartSchema } from "@math-platform/math-content";
import { generateTopic15PolynomialInequalityOutput } from "@math-platform/math-content/knowledge-space";

import { PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const OUTPUT = generateTopic15PolynomialInequalityOutput(0);
const REVIEW_URL = "/api/activities/precalculus-topic-1-5-polynomial-inequality-worked/submissions";
const SAFE_ERROR = "Unable to save the Topic 1.5 polynomial inequality Worked review.";
const FINAL_ANSWER = "The solution is (-4, -1) ∪ (3, ∞).";
const SOURCE_STEPS = [
  "The critical points are x = -4 (odd multiplicity 1), x = -1 (odd multiplicity 1), x = 3 (odd multiplicity 1).",
  "Test points -5, -2, 0, 4 give signs -, +, -, + from left to right.",
  "The inequality is strict, so the roots are not included.",
  `Therefore, the solution is ${OUTPUT.expectedAnswer.solution}.`,
];
const CREATE_RESULT = {
  submissionId: "activity_submissions:topic-1-5-polynomial-inequality-worked-component",
  attemptOrdinal: 1,
  submittedAt: "2026-08-30T12:00:00.000Z",
};

const RENDERER_PROPS = OUTPUT.data.rendererProps as {
  prompt: string;
  expression: string;
  operator: "<" | "<=" | ">" | ">=";
  distinctRootCount: number;
  presentationMode: "independent_practice";
};

const COMPONENT_MODULE = "@/components/student/PrecalculusTopic15PolynomialInequalityWorkedPilot";

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

async function getComponent() {
  const importedModule = await vi.importActual<{
    PrecalculusTopic15PolynomialInequalityWorkedPilot: ComponentType;
  }>(COMPONENT_MODULE);
  return importedModule.PrecalculusTopic15PolynomialInequalityWorkedPilot;
}

function expectNoAuthorityFromEnvelope(body: Record<string, unknown>): void {
  expect(Object.keys(body)).toStrictEqual([
    "contractVersion",
    "activityId",
    "mode",
    "status",
    "attemptNumber",
    "submittedAt",
    "answers",
    "parts",
  ]);
  expect(Object.keys(body.answers as object).sort()).toStrictEqual([
    "intervalSigns",
    "roots",
    "solution",
  ]);
  expect(body.answers as Record<string, unknown>).not.toHaveProperty("correctAnswers");
  expect(body.answers as Record<string, unknown>).not.toHaveProperty("expectedAnswer");
  for (const key of ["score", "maxScore", "mastery", "kst", "nodeId", "evidence", "authority"]) {
    expect(body).not.toHaveProperty(key);
  }
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PrecalculusTopic15PolynomialInequalityWorkedPilot", () => {
  it("renders the exact seed-0 Worked source review without editable controls", async () => {
    const WorkedPilot = await getComponent();
    const workedProps = polynomialInequalitySignChartSchema.parse({
      ...RENDERER_PROPS,
      presentationMode: "worked_example",
      correctAnswers: OUTPUT.expectedAnswer,
      steps: SOURCE_STEPS,
      finalAnswer: FINAL_ANSWER,
    });
    render(<WorkedPilot />);

    expect(
      screen.getByRole("heading", { name: "Worked Example: Polynomial Inequality Sign Chart" }),
    ).toBeTruthy();
    expect(screen.getByText(RENDERER_PROPS.prompt)).toBeTruthy();
    expect(
      screen.getByText(`${RENDERER_PROPS.expression} ${RENDERER_PROPS.operator} 0`),
    ).toBeTruthy();
    expect(SOURCE_STEPS).toStrictEqual(OUTPUT.solutionSteps.map((step) => step.description));
    SOURCE_STEPS.forEach((step) => expect(screen.getByText(step)).toBeTruthy());
    expect(screen.getByText(FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryAllByRole("spinbutton")).toHaveLength(0);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(screen.getAllByRole("button", { name: "Save Worked review" })).toHaveLength(1);
    expect(workedProps).toMatchObject({
      prompt: RENDERER_PROPS.prompt,
      expression: RENDERER_PROPS.expression,
      operator: RENDERER_PROPS.operator,
      distinctRootCount: 3,
      presentationMode: "worked_example",
    });
    expect(document.body.textContent).not.toContain("Server score");
    expect(document.body.textContent).not.toContain("Mastery Advantage");
    expect(document.body.textContent).not.toContain("Knowledge state");
    expect(document.body.textContent).not.toContain("Node ID");
    expect(document.body.textContent).not.toContain("evidence");
  });

  it("shows a short instruction for roots, the sign chart, endpoints, and the interval union", async () => {
    const WorkedPilot = await getComponent();
    render(<WorkedPilot />);

    expect(
      screen.getByText(
        "Review the roots, sign chart, strict endpoint rule, and interval union. Then save this Worked review.",
      ),
    ).toBeTruthy();
  });

  it("posts the exact source envelope and shows the saved attempt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(CREATE_RESULT));
    vi.stubGlobal("fetch", fetchMock);
    const WorkedPilot = await getComponent();
    render(<WorkedPilot />);

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
    const body = requestBody(call);
    expect(call[0]).toBe(REVIEW_URL);
    expect(init.method).toBe("POST");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("Idempotency-Key")).toEqual(expect.any(String));
    expect(headers.get("Idempotency-Key")).toMatch(/\S/);
    expect(body).toStrictEqual({
      contractVersion: "practice.v1",
      activityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: OUTPUT.expectedAnswer,
      parts: [
        { partId: "roots", rawAnswer: OUTPUT.expectedAnswer.roots },
        { partId: "intervalSigns", rawAnswer: OUTPUT.expectedAnswer.intervalSigns },
        { partId: "solution", rawAnswer: OUTPUT.expectedAnswer.solution },
      ],
    });
    expect(body.submittedAt).toBe(new Date(String(body.submittedAt)).toISOString());
    expectNoAuthorityFromEnvelope(body);
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
    const WorkedPilot = await getComponent();
    render(<WorkedPilot />);
    fireEvent.click(screen.getByRole("button", { name: "Save Worked review" }));

    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Saving…" }));
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
    ["noncanonical time", response({ ...CREATE_RESULT, submittedAt: "2026-08-30T12:00:00Z" })],
    ["wrong time type", response({ ...CREATE_RESULT, submittedAt: 1 })],
  ])("shows one safe retry state for %s", async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal("fetch", fetchMock);
    const WorkedPilot = await getComponent();
    render(<WorkedPilot />);

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
    const WorkedPilot = await getComponent();
    render(<WorkedPilot />);

    fireEvent.click(screen.getByRole("button", { name: "Save Worked review" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(SAFE_ERROR);
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstInit = firstCall[1] as RequestInit;
    const firstKey = new Headers(firstInit.headers).get("Idempotency-Key");

    fireEvent.click(screen.getByRole("button", { name: "Retry Worked review" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Worked example review saved (attempt 1).",
      ),
    );
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    const secondInit = secondCall[1] as RequestInit;
    expect(secondInit.body).toBe(firstInit.body);
    expect(new Headers(secondInit.headers).get("Idempotency-Key")).toBe(firstKey);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map((call) => call[0])).toStrictEqual([REVIEW_URL, REVIEW_URL]);
  });
});
