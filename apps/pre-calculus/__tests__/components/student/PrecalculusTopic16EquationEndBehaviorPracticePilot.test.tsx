import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateTopic16EquationEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";
import { polynomialEquationEndBehaviorSchema } from "@math-platform/math-content/schemas";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";

import { PrecalculusTopic16EquationEndBehaviorPracticePilot } from "@/components/student/PrecalculusTopic16EquationEndBehaviorPracticePilot";
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const CREATE_URL = "/api/activities/precalculus-topic-1-6-equation-end-behavior/submissions";
const EVIDENCE_URL = "/api/learning-evidence/precalculus-pilot";
const IDEMPOTENCY_KEY = "topic16-equation-end-behavior-test-key";
const SAFE_ERROR = "Unable to save the Topic 1.6 polynomial end-behavior practice.";
const SUCCESS_MESSAGE = "Your practice was saved.";
const TEACHER_MESSAGE = "Complete this skill with your teacher before using Mastery Advantage.";
const MASTERY_MESSAGE = "Mastery Advantage updated your practice record.";
const KNOWLEDGE_STATE = {
  nodeId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
  title: "Determine polynomial end behavior from equations",
  status: "in_progress" as const,
  readiness: "ready" as const,
};
const PART_IDS = [
  "a_leftEnd",
  "a_rightEnd",
  "b_leftEnd",
  "b_rightEnd",
  "c_leftEnd",
  "c_rightEnd",
  "d_leftEnd",
  "d_rightEnd",
  "e_leftEnd",
  "e_rightEnd",
  "f_leftEnd",
  "f_rightEnd",
] as const;
type PartId = (typeof PART_IDS)[number];
type Direction = "up" | "down";
type Answers = Record<PartId, Direction>;
type Mode = "guided_practice" | "independent_practice";

type FuturePracticeProps = {
  mode?: Mode;
  knowledgeState?: {
    nodeId: string;
    title: string;
    status: "not_started" | "in_progress" | "mastered" | "decaying";
    readiness: "ready";
  };
};

const PracticePilotWithKnowledgeState =
  PrecalculusTopic16EquationEndBehaviorPracticePilot as unknown as ComponentType<FuturePracticeProps>;

const GUIDED_STEPS = [
  "Identify the leading term for each polynomial.",
  "Use degree parity and the leading coefficient.",
  "Record whether each left and right end goes up or down.",
];
const FIELD_HELP = "Choose Up or Down for the left and right end of each polynomial.";
const SERVER_RESULT = {
  submissionId: "activity_submissions:topic-1-6-equation-end-behavior",
  score: 11,
  maxScore: 12,
  attemptOrdinal: 1,
  feedback: "11/12 polynomial equation end-behavior responses matched the server rubric.",
} as const;
const ZERO_RESULT = {
  ...SERVER_RESULT,
  score: 0,
  feedback: "0/12 polynomial equation end-behavior responses matched the server rubric.",
} as const;
const NODE_NOT_ENABLED_EVIDENCE = {
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
const AWAITING_EXPOSURE_EVIDENCE = {
  ...NODE_NOT_ENABLED_EVIDENCE,
  decision: { ...NODE_NOT_ENABLED_EVIDENCE.decision, reason: "awaiting_teacher_exposure" },
} as const;
const SAVED_EVIDENCE = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: "new",
  decision: {
    idempotency: "new",
    exposureState: "introduced",
    eligible: false,
    reason: "ungraded_evidence",
    masteryBearing: false,
  },
} as const;
const AWAITING_EXPOSURE_UNGRADED_EVIDENCE = {
  ...SAVED_EVIDENCE,
  decision: { ...SAVED_EVIDENCE.decision, exposureState: "awaiting_teacher_exposure" },
} as const;
const MASTERY_EVIDENCE = {
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
  expect(requestBody(call)).toStrictEqual({ submissionId });
}

function expectNoOpaqueSubmissionId(submissionId: string): void {
  expect(document.body.textContent ?? "").not.toContain(submissionId);
}

function outputFor(seed: 1 | 2) {
  return generateTopic16EquationEndBehaviorOutput(seed);
}

function answersFor(seed: 1 | 2, wrong = false): Answers {
  const answers = { ...outputFor(seed).expectedAnswer } as Answers;
  if (wrong) answers.a_leftEnd = answers.a_leftEnd === "up" ? "down" : "up";
  return answers;
}

function renderPractice(mode: Mode) {
  return render(<PrecalculusTopic16EquationEndBehaviorPracticePilot mode={mode} />);
}

function selectAnswers(answers: Answers, count: number = PART_IDS.length): void {
  for (const [index, partId] of PART_IDS.entries()) {
    if (index >= count) break;
    const side = partId.endsWith("leftEnd") ? "Left" : "Right";
    const direction = answers[partId] === "up" ? "Up" : "Down";
    fireEvent.click(screen.getByRole("radio", { name: `${partId[0]} ${side} end ${direction}` }));
  }
}

function expectNoAuthorityText(): void {
  const text = document.body.textContent ?? "";
  for (const field of [
    "correctAnswers",
    "expectedAnswer",
    "solutionSteps",
    "finalAnswer",
    "gradingMetadata",
    "answerKey",
    "normalizedAnswer",
    "authority",
    "correctness",
    "maxScore",
  ]) {
    expect(text).not.toContain(field);
  }
}

function expectEnvelope(call: unknown[], activityId: string, mode: Mode, answers: Answers): string {
  expect(call[0]).toBe(CREATE_URL);
  const init = call[1] as RequestInit;
  expect(init.method).toBe("POST");
  const headers = new Headers(init.headers);
  expect(headers.get("content-type")).toBe("application/json");
  expect(headers.get("Idempotency-Key")).toBe(IDEMPOTENCY_KEY);
  const body = requestBody(call);
  expect(Object.keys(body).sort()).toEqual([
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ]);
  expect(body).toEqual({
    contractVersion: "practice.v1",
    activityId,
    mode,
    status: "submitted",
    attemptNumber: 1,
    submittedAt: expect.any(String),
    answers,
    parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
  });
  expect(practiceSubmissionEnvelopeSchema.safeParse(body).success).toBe(true);
  expect(Number.isFinite(Date.parse(String(body.submittedAt)))).toBe(true);
  return String(init.body);
}

function expectGeneratedItems(seed: 1 | 2): void {
  const output = outputFor(seed);
  const props = output.data.rendererProps as {
    items: readonly { id: string; functionName: string; expression: string }[];
  };
  for (const item of props.items) {
    expect(screen.getByText(item.expression, { exact: true })).toBeTruthy();
  }
}

describe("PrecalculusTopic16EquationEndBehaviorPracticePilot", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(crypto, "randomUUID").mockReturnValue(IDEMPOTENCY_KEY);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the exact optional knowledge state without fetching on render", () => {
    const fetchMock = vi.mocked(fetch);
    render(<PracticePilotWithKnowledgeState knowledgeState={KNOWLEDGE_STATE} />);

    expect(
      screen.getByText("Determine polynomial end behavior from equations", { exact: true }),
    ).toBeTruthy();
    expect(screen.getByText("Mastery state: in progress", { exact: true })).toBeTruthy();
    expect(screen.getByText("Readiness: Ready", { exact: true })).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders Guided seed 1 with source-backed help and generated expressions", () => {
    const output = outputFor(1);
    const rendererProps = output.data.rendererProps as Record<string, unknown>;
    const props = polynomialEquationEndBehaviorSchema.parse({
      ...rendererProps,
      presentationMode: "guided_practice",
      guidedSteps: GUIDED_STEPS,
      fieldHelp: FIELD_HELP,
    });
    expect(props.presentationMode).toBe("guided_practice");
    renderPractice("guided_practice");

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Polynomial Equation End Behavior" }),
    ).toBeTruthy();
    expectGeneratedItems(1);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step, { exact: true })).toBeTruthy();
    expect(screen.getByText(FIELD_HELP, { exact: true })).toBeTruthy();
    for (const step of output.solutionSteps)
      expect(screen.queryByText(step.description, { exact: true })).toBeNull();
    expect(screen.getAllByRole("radio")).toHaveLength(24);
    expect(
      screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true);
    expectNoAuthorityText();
  });

  it("renders Independent seed 2 without Guided help or answer authority", () => {
    const output = outputFor(2);
    const rendererProps = output.data.rendererProps as Record<string, unknown>;
    const props = polynomialEquationEndBehaviorSchema.parse({
      ...rendererProps,
      presentationMode: "independent_practice",
    });
    expect(props.presentationMode).toBe("independent_practice");
    renderPractice("independent_practice");

    expect(
      screen.getByRole("heading", {
        name: "Independent Practice: Polynomial Equation End Behavior",
      }),
    ).toBeTruthy();
    expectGeneratedItems(2);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step, { exact: true })).toBeNull();
    expect(screen.queryByText(FIELD_HELP, { exact: true })).toBeNull();
    for (const step of output.solutionSteps)
      expect(screen.queryByText(step.description, { exact: true })).toBeNull();
    expect(screen.getAllByRole("radio")).toHaveLength(24);
    expect(
      screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true);
    expectNoAuthorityText();
  });

  it.each([
    [
      "guided",
      "guided_practice",
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
      1,
    ],
    [
      "independent",
      "independent_practice",
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
      2,
    ],
  ] as const)(
    "keeps Submit answer disabled until all 12 %s responses exist",
    (_label, mode, _activityId, seed) => {
      renderPractice(mode);
      const submit = screen.getByRole("button", { name: "Submit answer" });
      expect(submit).toBeDisabled();
      selectAnswers(answersFor(seed), 11);
      expect(submit).toBeDisabled();
      selectAnswers(answersFor(seed));
      expect(submit).toBeEnabled();
    },
  );

  it.each([
    [
      "Guided node-not-enabled",
      "guided_practice",
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
      1,
      NODE_NOT_ENABLED_EVIDENCE,
      TEACHER_MESSAGE,
    ],
    [
      "Guided awaiting reason",
      "guided_practice",
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
      1,
      AWAITING_EXPOSURE_EVIDENCE,
      TEACHER_MESSAGE,
    ],
    [
      "Independent awaiting state",
      "independent_practice",
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
      2,
      AWAITING_EXPOSURE_UNGRADED_EVIDENCE,
      TEACHER_MESSAGE,
    ],
  ] as const)(
    "forwards the exact raw %s practice.v1 envelope and opaque evidence request, including one wrong answer",
    async (_label, mode, activityId, seed, evidence, expectedMessage) => {
      const fetchMock = vi
        .mocked(fetch)
        .mockResolvedValueOnce(response(SERVER_RESULT))
        .mockResolvedValueOnce(response(evidence));
      const answers = answersFor(seed, true);
      renderPractice(mode);
      selectAnswers(answers);
      fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

      await waitFor(() => expect(screen.getByText(expectedMessage, { exact: true })).toBeTruthy());
      expect(screen.getByText("Server score: 11/12", { exact: true })).toBeTruthy();
      expect(screen.getByText(SERVER_RESULT.feedback, { exact: true })).toBeTruthy();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expectEnvelope(fetchMock.mock.calls[0] as unknown[], activityId, mode, answers);
      expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], SERVER_RESULT.submissionId);
      expectNoOpaqueSubmissionId(SERVER_RESULT.submissionId);
    },
  );

  it("accepts a valid score-0 server result with evidence delivery", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(ZERO_RESULT))
      .mockResolvedValueOnce(response(SAVED_EVIDENCE));
    const answers = answersFor(1);
    renderPractice("guided_practice");
    selectAnswers(answers);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() => expect(screen.getByText(SUCCESS_MESSAGE, { exact: true })).toBeTruthy());
    expect(screen.getByText("Server score: 0/12", { exact: true })).toBeTruthy();
    expect(screen.getByText(ZERO_RESULT.feedback, { exact: true })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], ZERO_RESULT.submissionId);
    expectNoOpaqueSubmissionId(ZERO_RESULT.submissionId);
  });

  it("allows one create request while pending and blocks another after success", async () => {
    let resolveCreate!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveCreate = resolve;
    });
    const fetchMock = vi
      .mocked(fetch)
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(response(SAVED_EVIDENCE));
    renderPractice("guided_practice");
    selectAnswers(answersFor(1));
    const submit = screen.getByRole("button", { name: "Submit answer" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveCreate(response(SERVER_RESULT));
    await waitFor(() => expect(screen.getByText(SUCCESS_MESSAGE, { exact: true })).toBeTruthy());
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], SERVER_RESULT.submissionId);
    expectNoOpaqueSubmissionId(SERVER_RESULT.submissionId);
  });

  it("retries a failed create with the same byte-identical body and key", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockRejectedValueOnce(new Error("private transport detail"))
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(NODE_NOT_ENABLED_EVIDENCE));
    renderPractice("guided_practice");
    selectAnswers(answersFor(1));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(SAFE_ERROR);
    expect(alert.textContent).not.toContain("private transport detail");
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstBody = expectEnvelope(
      firstCall,
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
      "guided_practice",
      answersFor(1),
    );
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get("Idempotency-Key");

    fireEvent.click(screen.getByRole("button", { name: "Retry submission" }));
    await waitFor(() => expect(screen.getByText(TEACHER_MESSAGE, { exact: true })).toBeTruthy());
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get("Idempotency-Key")).toBe(
      firstKey,
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expectEvidenceCall(fetchMock.mock.calls[2] as unknown[], SERVER_RESULT.submissionId);
    expectNoOpaqueSubmissionId(SERVER_RESULT.submissionId);
  });

  it("shows the mastery-updated message after evidence delivery", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(MASTERY_EVIDENCE));
    renderPractice("guided_practice");
    selectAnswers(answersFor(1));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() => expect(screen.getByText(MASTERY_MESSAGE, { exact: true })).toBeTruthy());
    expect(screen.getByText("Server score: 11/12", { exact: true })).toBeTruthy();
    expect(screen.getByText(SERVER_RESULT.feedback, { exact: true })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], SERVER_RESULT.submissionId);
    expectNoOpaqueSubmissionId(SERVER_RESULT.submissionId);
  });

  it("retains the server result and retries evidence with the same opaque body", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockRejectedValueOnce(new Error("private evidence detail"))
      .mockResolvedValueOnce(response(MASTERY_EVIDENCE));
    renderPractice("guided_practice");
    selectAnswers(answersFor(1));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(SAFE_ERROR);
    expect(alert.textContent).not.toContain("private evidence detail");
    expect(screen.getByText("Server score: 11/12", { exact: true })).toBeTruthy();
    expect(screen.getByText(SERVER_RESULT.feedback, { exact: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry evidence delivery" })).toBeEnabled();
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], SERVER_RESULT.submissionId);
    expectNoOpaqueSubmissionId(SERVER_RESULT.submissionId);

    fireEvent.click(screen.getByRole("button", { name: "Retry evidence delivery" }));
    await waitFor(() => expect(screen.getByText(MASTERY_MESSAGE, { exact: true })).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expectEvidenceCall(fetchMock.mock.calls[2] as unknown[], SERVER_RESULT.submissionId);
    expectNoOpaqueSubmissionId(SERVER_RESULT.submissionId);
  });

  it("blocks duplicate evidence calls while evidence is pending and after save", async () => {
    let resolveEvidence!: (value: Response) => void;
    const pendingEvidence = new Promise<Response>((resolve) => {
      resolveEvidence = resolve;
    });
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockReturnValueOnce(pendingEvidence);
    renderPractice("guided_practice");
    selectAnswers(answersFor(1));
    const submit = screen.getByRole("button", { name: "Submit answer" });
    fireEvent.click(submit);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    resolveEvidence(response(SAVED_EVIDENCE));
    await waitFor(() => expect(screen.getByText(SUCCESS_MESSAGE, { exact: true })).toBeTruthy());
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], SERVER_RESULT.submissionId);
  });

  it.each([
    ["non-OK response", () => response({ error: "private evidence detail" }, 500)],
    ["invalid JSON", () => new Response("{", { status: 200 })],
  ] as const)(
    "preserves the server result when evidence delivery fails for %s",
    async (_label, makeResponse) => {
      const fetchMock = vi
        .mocked(fetch)
        .mockResolvedValueOnce(response(SERVER_RESULT))
        .mockResolvedValueOnce(makeResponse());
      renderPractice("guided_practice");
      selectAnswers(answersFor(1));
      fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(SAFE_ERROR);
      expect(alert.textContent).not.toContain("private evidence detail");
      expect(screen.getByText("Server score: 11/12", { exact: true })).toBeTruthy();
      expect(screen.getByText(SERVER_RESULT.feedback, { exact: true })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Retry evidence delivery" })).toBeEnabled();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], SERVER_RESULT.submissionId);
      expectNoOpaqueSubmissionId(SERVER_RESULT.submissionId);
    },
  );

  it.each([
    [
      "missing outer field",
      Object.fromEntries(
        Object.entries(NODE_NOT_ENABLED_EVIDENCE).filter(([key]) => key !== "persisted"),
      ),
    ],
    ["extra outer field", { ...NODE_NOT_ENABLED_EVIDENCE, hidden: true }],
    ["wrong outer boolean", { ...NODE_NOT_ENABLED_EVIDENCE, persisted: "false" }],
    ["wrong masteryApplied boolean", { ...NODE_NOT_ENABLED_EVIDENCE, masteryApplied: "false" }],
    ["wrong kstApplied boolean", { ...NODE_NOT_ENABLED_EVIDENCE, kstApplied: 0 }],
    ["invalid delivery", { ...NODE_NOT_ENABLED_EVIDENCE, delivery: "later" }],
    [
      "missing decision field",
      {
        ...NODE_NOT_ENABLED_EVIDENCE,
        decision: Object.fromEntries(
          Object.entries(NODE_NOT_ENABLED_EVIDENCE.decision).filter(([key]) => key !== "reason"),
        ),
      },
    ],
    [
      "extra decision field",
      {
        ...NODE_NOT_ENABLED_EVIDENCE,
        decision: { ...NODE_NOT_ENABLED_EVIDENCE.decision, hidden: true },
      },
    ],
    [
      "invalid decision idempotency",
      {
        ...NODE_NOT_ENABLED_EVIDENCE,
        decision: { ...NODE_NOT_ENABLED_EVIDENCE.decision, idempotency: "conflict" },
      },
    ],
    [
      "invalid decision exposure state",
      {
        ...NODE_NOT_ENABLED_EVIDENCE,
        decision: { ...NODE_NOT_ENABLED_EVIDENCE.decision, exposureState: "pending" },
      },
    ],
    [
      "invalid decision reason",
      {
        ...NODE_NOT_ENABLED_EVIDENCE,
        decision: { ...NODE_NOT_ENABLED_EVIDENCE.decision, reason: "unknown" },
      },
    ],
    [
      "non-boolean eligible",
      {
        ...NODE_NOT_ENABLED_EVIDENCE,
        decision: { ...NODE_NOT_ENABLED_EVIDENCE.decision, eligible: "no" },
      },
    ],
    [
      "non-boolean masteryBearing",
      {
        ...NODE_NOT_ENABLED_EVIDENCE,
        decision: { ...NODE_NOT_ENABLED_EVIDENCE.decision, masteryBearing: 0 },
      },
    ],
  ] as const)("fails safely for malformed evidence response: %s", async (_label, evidence) => {
    const fetchMock = vi
      .mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(evidence));
    renderPractice("guided_practice");
    selectAnswers(answersFor(1));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(SAFE_ERROR);
    expect(alert.textContent).not.toContain("private");
    expect(screen.getByText("Server score: 11/12", { exact: true })).toBeTruthy();
    expect(screen.getByText(SERVER_RESULT.feedback, { exact: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry evidence delivery" })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], SERVER_RESULT.submissionId);
    expectNoOpaqueSubmissionId(SERVER_RESULT.submissionId);
  });

  it.each([
    ["non-OK response", () => response({ error: "private server detail" }, 500)],
    ["invalid JSON", () => new Response("{", { status: 200 })],
    ["non-object result", () => response(null)],
    ["extra result field", () => response({ ...SERVER_RESULT, hidden: true })],
    [
      "missing result field",
      () =>
        response(
          Object.fromEntries(Object.entries(SERVER_RESULT).filter(([key]) => key !== "feedback")),
        ),
    ],
    ["non-string submission ID", () => response({ ...SERVER_RESULT, submissionId: 1 })],
    ["blank submission ID", () => response({ ...SERVER_RESULT, submissionId: " " })],
    ["negative score", () => response({ ...SERVER_RESULT, score: -1 })],
    ["fractional score", () => response({ ...SERVER_RESULT, score: 1.5 })],
    ["unsafe score", () => response({ ...SERVER_RESULT, score: Number.MAX_SAFE_INTEGER + 1 })],
    ["score above maximum", () => response({ ...SERVER_RESULT, score: 13 })],
    ["wrong maxScore", () => response({ ...SERVER_RESULT, maxScore: 11 })],
    ["zero attempt ordinal", () => response({ ...SERVER_RESULT, attemptOrdinal: 0 })],
    ["fractional attempt ordinal", () => response({ ...SERVER_RESULT, attemptOrdinal: 1.5 })],
    [
      "unsafe attempt ordinal",
      () => response({ ...SERVER_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 }),
    ],
    ["non-string attempt ordinal", () => response({ ...SERVER_RESULT, attemptOrdinal: "1" })],
    ["blank feedback", () => response({ ...SERVER_RESULT, feedback: " " })],
    ["non-string feedback", () => response({ ...SERVER_RESULT, feedback: 1 })],
  ] as const)(
    "shows one safe error and no evidence request for %s",
    async (_label, makeResponse) => {
      const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(makeResponse());
      renderPractice("guided_practice");
      selectAnswers(answersFor(1));
      fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(SAFE_ERROR);
      expect(alert.textContent).not.toContain("private");
      expect(screen.queryByText(/Server score:/)).toBeNull();
      expect(screen.getByRole("button", { name: "Retry submission" })).toBeEnabled();
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock.mock.calls.some((call) => call[0] === EVIDENCE_URL)).toBe(false);
    },
  );
});
