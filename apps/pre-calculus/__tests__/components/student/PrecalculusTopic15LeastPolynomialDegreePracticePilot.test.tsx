import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateTopic15LeastPolynomialDegreeOutput } from "@math-platform/math-content/knowledge-space";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";

import {
  PrecalculusTopic15LeastPolynomialDegreePracticePilot,
  type PrecalculusTopic15LeastPolynomialDegreeKnowledgeState,
} from "@/components/student/PrecalculusTopic15LeastPolynomialDegreePracticePilot";
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const GUIDED_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID;
const CREATE_URL = "/api/activities/precalculus-topic-1-5-least-polynomial-degree/submissions";
const EVIDENCE_URL = "/api/learning-evidence/precalculus-pilot";
const PRACTICE_ERROR = "Unable to save the Topic 1.5 least polynomial degree practice.";
const GUIDED_PROMPT =
  "The zero x = 1 + i is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?";
const INDEPENDENT_PROMPT =
  "The zero x = 2 + 2i is given for a real-coefficient polynomial f. Its graph shows at least 2 real zeros. What is the least possible degree of f?";
const GUIDED_STEPS = [
  "Identify the conjugate zero.",
  "Count the conjugate pair and the real zeros.",
];
const FIELD_HELP = "Add 2 for the conjugate pair to the number of real zeros.";
const GUIDED_ANSWER = { leastDegree: 6 } as const;
const INDEPENDENT_ANSWER = { leastDegree: 4 } as const;
const KNOWLEDGE_STATE: PrecalculusTopic15LeastPolynomialDegreeKnowledgeState = {
  nodeId: "math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs",
  title: "Determine least polynomial degree from zeros and conjugate pairs",
  status: "in_progress",
  readiness: "ready",
};
const WRONG_RESULT = {
  submissionId: "activity_submissions:topic-1-5-least-polynomial-degree",
  score: 0,
  maxScore: 1,
  attemptOrdinal: 1,
  feedback: "0/1 least-polynomial-degree response matched the server rubric.",
} as const;
const CORRECT_RESULT = {
  ...WRONG_RESULT,
  score: 1,
  feedback: "1/1 least-polynomial-degree response matched the server rubric.",
} as const;
const EVIDENCE_SAVED = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: "new",
  decision: {
    idempotency: "new",
    exposureState: "introduced",
    eligible: false,
    reason: "node_not_enabled",
    masteryBearing: false,
  },
} as const;
const EVIDENCE_MASTERED = {
  persisted: true,
  masteryApplied: true,
  kstApplied: false,
  delivery: "new",
  decision: {
    idempotency: "new",
    exposureState: "introduced",
    eligible: true,
    reason: "eligible",
    masteryBearing: true,
  },
} as const;
const EVIDENCE_AWAITING = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: "new",
  decision: {
    idempotency: "new",
    exposureState: "awaiting_teacher_exposure",
    eligible: false,
    reason: "awaiting_teacher_exposure",
    masteryBearing: false,
  },
} as const;
const EVIDENCE_REPLAY_WITH_NEW_IDEMPOTENCY = {
  ...EVIDENCE_MASTERED,
  delivery: "replay",
  decision: { ...EVIDENCE_MASTERED.decision, idempotency: "new" },
} as const;
const EVIDENCE_NEW_WITH_REPLAY_IDEMPOTENCY = {
  ...EVIDENCE_MASTERED,
  decision: { ...EVIDENCE_MASTERED.decision, idempotency: "replay" },
} as const;
const AUTHORITY_KEYS = new Set([
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "normalizedAnswer",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
  "score",
  "maxScore",
  "isCorrect",
  "correctness",
]);

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function expectEvidenceCall(call: unknown[], submissionId: string): void {
  expect(call[0]).toBe(EVIDENCE_URL);
  const init = call[1] as RequestInit;
  expect(init.method).toBe("POST");
  expect(new Headers(init.headers).get("content-type")).toBe("application/json");
  const body = requestBody(call);
  expect(body).toStrictEqual({ submissionId });
  expect(body).not.toHaveProperty("activityId");
  expect(body).not.toHaveProperty("answers");
  expect(body).not.toHaveProperty("score");
  expect(body).not.toHaveProperty("nodeId");
  expectNoAuthority(body);
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    expect(AUTHORITY_KEYS).not.toContain(key);
    expectNoAuthority(child);
  }
}

function expectNoAuthorityAttributes(): void {
  const attributeNames = Array.from(document.body.querySelectorAll("*")).flatMap((element) =>
    element.getAttributeNames(),
  );
  for (const attributeName of attributeNames) {
    expect(AUTHORITY_KEYS).not.toContain(attributeName);
  }
}

function fillAnswer(value: number): void {
  fireEvent.change(screen.getByRole("spinbutton", { name: "Least possible degree" }), {
    target: { value: String(value) },
  });
}

function expectEnvelope(
  call: unknown[],
  activityId: string,
  mode: "guided_practice" | "independent_practice",
  leastDegree: number,
): void {
  const envelope = requestBody(call);
  expect(Object.keys(envelope).sort()).toEqual([
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ]);
  expect(envelope).toEqual({
    contractVersion: "practice.v1",
    activityId,
    mode,
    status: "submitted",
    attemptNumber: 1,
    submittedAt: expect.any(String),
    answers: { leastDegree },
    parts: [{ partId: "leastDegree", rawAnswer: leastDegree }],
  });
  expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
  expect(Number.isFinite(Date.parse(String(envelope.submittedAt)))).toBe(true);
  expectNoAuthority(envelope);
}

describe("PrecalculusTopic15LeastPolynomialDegreePracticePilot", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the exact optional knowledge state block", () => {
    render(
      <PrecalculusTopic15LeastPolynomialDegreePracticePilot knowledgeState={KNOWLEDGE_STATE} />,
    );

    expect(
      screen.getByText("Determine least polynomial degree from zeros and conjugate pairs"),
    ).toBeTruthy();
    expect(screen.getByText("Mastery state: in progress")).toBeTruthy();
    expect(screen.getByText("Readiness: Ready")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Guided Practice: Least Polynomial Degree" }),
    ).toBeTruthy();
  });

  it("omits the knowledge state block when the prop is absent", () => {
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);

    expect(
      screen.queryByText("Determine least polynomial degree from zeros and conjugate pairs"),
    ).toBeNull();
    expect(screen.queryByText("Mastery state: in progress")).toBeNull();
    expect(screen.queryByText("Readiness: Ready")).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Guided Practice: Least Polynomial Degree" }),
    ).toBeTruthy();
  });

  it("renders Guided seed 1 and creates the exact raw envelope for a wrong answer", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(WRONG_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    const output = generateTopic15LeastPolynomialDegreeOutput(1);
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Least Polynomial Degree" }),
    ).toBeTruthy();
    expect(screen.getByText(GUIDED_PROMPT)).toBeTruthy();
    expect(screen.getByText("Given nonreal zero: x = 1 + i")).toBeTruthy();
    expect(screen.getByText("Real zeros shown by the graph: At least 3")).toBeTruthy();
    expect(output.data.rendererProps).toMatchObject({
      givenNonrealZero: "1 + i",
      realZeroCount: 3,
    });
    expect(screen.getByText(GUIDED_STEPS[0]!)).toBeTruthy();
    expect(screen.getByText(GUIDED_STEPS[1]!)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Least possible degree" })).toBeTruthy();
    expectNoAuthority(output.data.rendererProps);
    expectNoAuthorityAttributes();
    expect(screen.queryByText("Least possible degree: 5")).toBeNull();
    expect(screen.queryByText("Answer:")).toBeNull();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit).toBeDisabled();

    fillAnswer(4.5);
    expect(submit).toBeDisabled();
    fillAnswer(GUIDED_ANSWER.leastDegree);
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText("Server score: 0/1")).toBeTruthy());
    expect(screen.getByText(WRONG_RESULT.feedback)).toBeTruthy();
    expect(screen.getByText("Your practice was saved.")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const call = fetchMock.mock.calls[0] as unknown[];
    expect(call[0]).toBe(CREATE_URL);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(new Headers((call[1] as RequestInit).headers).get("content-type")).toBe(
      "application/json",
    );
    expect(new Headers((call[1] as RequestInit).headers).get("Idempotency-Key")).toEqual(
      expect.any(String),
    );
    expect(new Headers((call[1] as RequestInit).headers).get("Idempotency-Key")).not.toBe("");
    expectEnvelope(call, GUIDED_ID, "guided_practice", GUIDED_ANSWER.leastDegree);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], WRONG_RESULT.submissionId);
    expect(fetchMock.mock.calls.map((entry) => entry[0])).toEqual([CREATE_URL, EVIDENCE_URL]);
  });

  it("renders Independent seed 2 without guidance and creates the exact raw envelope", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(CORRECT_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_MASTERED));
    const output = generateTopic15LeastPolynomialDegreeOutput(2);
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot mode="independent_practice" />);

    expect(
      screen.getByRole("heading", { name: "Independent Practice: Least Polynomial Degree" }),
    ).toBeTruthy();
    expect(screen.getByText(INDEPENDENT_PROMPT)).toBeTruthy();
    expect(screen.getByText("Given nonreal zero: x = 2 + 2i")).toBeTruthy();
    expect(screen.getByText("Real zeros shown by the graph: At least 2")).toBeTruthy();
    expect(output.data.rendererProps).toMatchObject({
      givenNonrealZero: "2 + 2i",
      realZeroCount: 2,
    });
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expectNoAuthority(output.data.rendererProps);
    expectNoAuthorityAttributes();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit).toBeDisabled();

    fillAnswer(INDEPENDENT_ANSWER.leastDegree);
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText("Server score: 1/1")).toBeTruthy());
    expect(screen.getByText(CORRECT_RESULT.feedback)).toBeTruthy();
    expect(screen.getByText("Mastery Advantage updated your practice record.")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEnvelope(
      fetchMock.mock.calls[0] as unknown[],
      INDEPENDENT_ID,
      "independent_practice",
      INDEPENDENT_ANSWER.leastDegree,
    );
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], CORRECT_RESULT.submissionId);
    expect(fetchMock.mock.calls.map((entry) => entry[0])).toEqual([CREATE_URL, EVIDENCE_URL]);
  });

  it("retries a failed create with the identical body and key", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response({ error: "private create detail" }, 500))
      .mockResolvedValueOnce(response(WRONG_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);
    fillAnswer(GUIDED_ANSWER.leastDegree);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain("private create detail");
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstBody = (firstCall[1] as RequestInit).body;
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get("Idempotency-Key");

    fireEvent.click(screen.getByRole("button", { name: "Retry submission" }));
    await waitFor(() => expect(screen.getByText("Your practice was saved.")).toBeTruthy());
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get("Idempotency-Key")).toBe(
      firstKey,
    );
    expectEvidenceCall(fetchMock.mock.calls[2] as unknown[], WRONG_RESULT.submissionId);
    expect(fetchMock.mock.calls.map((entry) => entry[0])).toEqual([
      CREATE_URL,
      CREATE_URL,
      EVIDENCE_URL,
    ]);
  });

  it("blocks duplicate clicks while create is pending and after save", async () => {
    let resolveCreate!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveCreate = resolve;
    });
    const fetchMock = vi
      .mocked(fetch)
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);
    fillAnswer(GUIDED_ANSWER.leastDegree);
    const submit = screen.getByRole("button", { name: "Submit answer" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveCreate(response(WRONG_RESULT));
    await waitFor(() => expect(screen.getByText("Your practice was saved.")).toBeTruthy());
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("blocks duplicate clicks while evidence is pending", async () => {
    let resolveEvidence!: (value: Response) => void;
    const pendingEvidence = new Promise<Response>((resolve) => {
      resolveEvidence = resolve;
    });
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(WRONG_RESULT))
      .mockReturnValueOnce(pendingEvidence);
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);
    fillAnswer(GUIDED_ANSWER.leastDegree);
    const submit = screen.getByRole("button", { name: "Submit answer" });
    fireEvent.click(submit);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    resolveEvidence(response(EVIDENCE_SAVED));
    await waitFor(() => expect(screen.getByText("Your practice was saved.")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], WRONG_RESULT.submissionId);
  });

  it("shows the awaiting-teacher message for a valid evidence response", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(WRONG_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_AWAITING));
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);
    fillAnswer(GUIDED_ANSWER.leastDegree);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() =>
      expect(
        screen.getByText("Complete this skill with your teacher before using Mastery Advantage."),
      ).toBeTruthy(),
    );
    expect(screen.getByText("Server score: 0/1")).toBeTruthy();
    expect(screen.getByText(WRONG_RESULT.feedback)).toBeTruthy();
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], WRONG_RESULT.submissionId);
  });

  it.each([
    ["replay delivery with new decision idempotency", EVIDENCE_REPLAY_WITH_NEW_IDEMPOTENCY],
    ["new delivery with replay decision idempotency", EVIDENCE_NEW_WITH_REPLAY_IDEMPOTENCY],
  ] as const)("accepts %s as a valid evidence response", async (_label, evidenceResult) => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(WRONG_RESULT))
      .mockResolvedValueOnce(response(evidenceResult));
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);
    fillAnswer(GUIDED_ANSWER.leastDegree);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() =>
      expect(screen.getByText("Mastery Advantage updated your practice record.")).toBeTruthy(),
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], WRONG_RESULT.submissionId);
  });

  it("retries evidence only after delivery failure and preserves the opaque submission", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(WRONG_RESULT))
      .mockResolvedValueOnce(response({ error: "private evidence detail" }, 500))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);
    fillAnswer(GUIDED_ANSWER.leastDegree);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain("private evidence detail");
    expect(screen.getByText("Server score: 0/1")).toBeTruthy();
    expect(screen.getByText(WRONG_RESULT.feedback)).toBeTruthy();
    const firstEvidenceCall = fetchMock.mock.calls[1] as unknown[];
    const firstEvidenceBody = (firstEvidenceCall[1] as RequestInit).body;
    expectEvidenceCall(firstEvidenceCall, WRONG_RESULT.submissionId);

    fireEvent.click(screen.getByRole("button", { name: "Retry evidence delivery" }));
    await waitFor(() => expect(screen.getByText("Your practice was saved.")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBe(firstEvidenceBody);
    expectEvidenceCall(fetchMock.mock.calls[2] as unknown[], WRONG_RESULT.submissionId);
  });

  it.each([
    ["non-object evidence", () => response([])],
    ["invalid evidence JSON", () => new Response("{", { status: 200 })],
    ["extra outer evidence field", () => response({ ...EVIDENCE_SAVED, hidden: true })],
    [
      "missing outer evidence field",
      () =>
        response(
          Object.fromEntries(Object.entries(EVIDENCE_SAVED).filter(([key]) => key !== "persisted")),
        ),
    ],
    ["wrong persisted boolean type", () => response({ ...EVIDENCE_SAVED, persisted: "true" })],
    ["wrong mastery boolean type", () => response({ ...EVIDENCE_SAVED, masteryApplied: 1 })],
    ["wrong KST boolean type", () => response({ ...EVIDENCE_SAVED, kstApplied: null })],
    [
      "extra decision field",
      () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, hidden: true } }),
    ],
    ["non-record decision", () => response({ ...EVIDENCE_SAVED, decision: null })],
    [
      "missing decision field",
      () =>
        response({
          ...EVIDENCE_SAVED,
          decision: Object.fromEntries(
            Object.entries(EVIDENCE_SAVED.decision).filter(([key]) => key !== "reason"),
          ),
        }),
    ],
    [
      "wrong eligible boolean type",
      () =>
        response({
          ...EVIDENCE_SAVED,
          decision: { ...EVIDENCE_SAVED.decision, eligible: "false" },
        }),
    ],
    [
      "wrong mastery-bearing boolean type",
      () =>
        response({
          ...EVIDENCE_SAVED,
          decision: { ...EVIDENCE_SAVED.decision, masteryBearing: 1 },
        }),
    ],
    ["unknown delivery", () => response({ ...EVIDENCE_SAVED, delivery: "unknown" })],
    [
      "unknown decision idempotency",
      () =>
        response({
          ...EVIDENCE_SAVED,
          decision: { ...EVIDENCE_SAVED.decision, idempotency: "unknown" },
        }),
    ],
    [
      "unknown reason",
      () =>
        response({
          ...EVIDENCE_SAVED,
          decision: { ...EVIDENCE_SAVED.decision, reason: "private" },
        }),
    ],
    [
      "unknown exposure state",
      () =>
        response({
          ...EVIDENCE_SAVED,
          decision: { ...EVIDENCE_SAVED.decision, exposureState: "unknown" },
        }),
    ],
  ] as const)(
    "keeps the opaque ID and retries evidence for %s",
    async (_label, makeEvidenceResponse) => {
      const fetchMock = vi
        .mocked(fetch)
        .mockResolvedValueOnce(response(WRONG_RESULT))
        .mockResolvedValueOnce(makeEvidenceResponse())
        .mockResolvedValueOnce(response(EVIDENCE_SAVED));
      render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);
      fillAnswer(GUIDED_ANSWER.leastDegree);
      fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(PRACTICE_ERROR);
      expect(alert.textContent).not.toContain("private");
      expect(screen.getByText("Server score: 0/1")).toBeTruthy();
      expect(screen.getByText(WRONG_RESULT.feedback)).toBeTruthy();
      const firstEvidenceCall = fetchMock.mock.calls[1] as unknown[];
      const firstEvidenceBody = (firstEvidenceCall[1] as RequestInit).body;
      fireEvent.click(screen.getByRole("button", { name: "Retry evidence delivery" }));
      await waitFor(() => expect(screen.getByText("Your practice was saved.")).toBeTruthy());

      expect(fetchMock.mock.calls.map((entry) => entry[0])).toEqual([
        CREATE_URL,
        EVIDENCE_URL,
        EVIDENCE_URL,
      ]);
      expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBe(firstEvidenceBody);
      expectEvidenceCall(firstEvidenceCall, WRONG_RESULT.submissionId);
      expectEvidenceCall(fetchMock.mock.calls[2] as unknown[], WRONG_RESULT.submissionId);
    },
  );

  it.each([
    ["non-OK response", () => response({ error: "private detail" }, 500)],
    ["invalid JSON", () => new Response("{", { status: 200 })],
    ["non-object result", () => response([])],
    ["extra result field", () => response({ ...WRONG_RESULT, privateDetail: true })],
    [
      "missing result field",
      () =>
        response(
          Object.fromEntries(Object.entries(WRONG_RESULT).filter(([key]) => key !== "feedback")),
        ),
    ],
    ["blank submission ID", () => response({ ...WRONG_RESULT, submissionId: " " })],
    ["non-string submission ID", () => response({ ...WRONG_RESULT, submissionId: 1 })],
    ["invalid score", () => response({ ...WRONG_RESULT, score: 2 })],
    ["fractional score", () => response({ ...WRONG_RESULT, score: 0.5 })],
    ["unsafe score", () => response({ ...WRONG_RESULT, score: Number.MAX_SAFE_INTEGER + 1 })],
    ["invalid max score", () => response({ ...WRONG_RESULT, maxScore: 2 })],
    ["invalid ordinal", () => response({ ...WRONG_RESULT, attemptOrdinal: 0 })],
    ["fractional ordinal", () => response({ ...WRONG_RESULT, attemptOrdinal: 1.5 })],
    [
      "unsafe ordinal",
      () => response({ ...WRONG_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 }),
    ],
    ["blank feedback", () => response({ ...WRONG_RESULT, feedback: " " })],
    ["invalid feedback", () => response({ ...WRONG_RESULT, feedback: 1 })],
  ] as const)("shows one safe error for %s", async (_label, makeResponse) => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(makeResponse());
    render(<PrecalculusTopic15LeastPolynomialDegreePracticePilot />);
    fillAnswer(GUIDED_ANSWER.leastDegree);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain("private detail");
    expect(screen.queryByText(/Server score:/)).toBeNull();
    expect(screen.getByRole("button", { name: "Retry submission" })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls.some((entry) => entry[0] === EVIDENCE_URL)).toBe(false);
  });
});
