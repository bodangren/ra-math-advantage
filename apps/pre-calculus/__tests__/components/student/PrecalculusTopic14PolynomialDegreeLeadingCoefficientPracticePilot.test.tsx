import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { generateTopic14PolynomialDegreeLeadingCoefficient } from "@math-platform/math-content/knowledge-space";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";

import { PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot } from "@/components/student/PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const guidedVariant = generateTopic14PolynomialDegreeLeadingCoefficient(1);
const independentVariant = generateTopic14PolynomialDegreeLeadingCoefficient(2);
const GUIDED_STEPS = [
  "Find the term with the greatest exponent in each expression.",
  "Use that exponent as the degree.",
  "Use the coefficient of that term as the leading coefficient.",
  "Treat a nonzero constant as a degree-0 polynomial.",
];
const FIELD_HELP = "Inspect exponents before you use the written term order.";
const CREATE_URL =
  "/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions";
const EVIDENCE_URL = "/api/learning-evidence/precalculus-pilot";
const KNOWLEDGE_STATE = {
  nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
  title: "Identify polynomial degree and leading coefficient",
  status: "in_progress" as const,
  readiness: "ready" as const,
};
const eligibleEvidence = {
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
};
const awaitingEvidence = {
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
};
const savedEvidence = {
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
};
const RAW_ANSWERS = {
  a_degree: " 4 ",
  a_leading_coefficient: "3.0",
  b_degree: "3",
  b_leading_coefficient: "-7",
  c_degree: "0",
  c_leading_coefficient: "4.",
};
const ANSWER_IDS = [
  "a_degree",
  "a_leading_coefficient",
  "b_degree",
  "b_leading_coefficient",
  "c_degree",
  "c_leading_coefficient",
] as const;

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function fillAnswers(values: Record<string, string> = RAW_ANSWERS): void {
  for (const answerId of ANSWER_IDS) {
    fireEvent.change(screen.getByLabelText(answerId.replaceAll("_", " ")), {
      target: { value: values[answerId] },
    });
  }
}

function expectNoAuthority(value: unknown): void {
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
  for (const key of [
    "answerKey",
    "correctAnswer",
    "correctAnswers",
    "expectedAnswer",
    "gradingMetadata",
    "solution",
    "solutionSteps",
    "steps",
    "finalAnswer",
    "correctness",
    "isCorrect",
    "score",
    "maxScore",
    "degree",
    "leadingCoefficient",
  ])
    expect(keys).not.toContain(key);
}

function createResult(score = 6) {
  return {
    submissionId: "activity_submissions:polynomial-practice",
    score,
    maxScore: 6,
    attemptOrdinal: 1,
    feedback: `${score}/6 degree and leading coefficient responses matched the server rubric.`,
  };
}

describe("PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot", () => {
  it("renders Guided seed 1, optional state, and the exact raw create flow", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(createResult(6)))
      .mockResolvedValueOnce(response(eligibleEvidence));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot
        knowledgeState={KNOWLEDGE_STATE}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Degree and Leading Coefficient" }),
    ).toBeTruthy();
    expect(screen.getByText(guidedVariant.prompt)).toBeTruthy();
    expect(screen.getByText(KNOWLEDGE_STATE.title)).toBeTruthy();
    expect(screen.getByText("Mastery state: in progress")).toBeTruthy();
    expect(screen.getByText("Readiness: Ready")).toBeTruthy();
    for (const item of guidedVariant.items) {
      expect(screen.getByLabelText(`${item.id} polynomial`)).toBeTruthy();
    }
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    const submit = screen.getByRole("button", { name: "Submit answer" });
    expect(submit).toBeDisabled();
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    expectNoAuthority(guidedVariant);

    fillAnswers();
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText("Server score: 6/6")).toBeTruthy());
    expect(screen.getByRole("status")).toHaveTextContent(
      "6/6 degree and leading coefficient responses matched the server rubric.",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Mastery Advantage updated your practice record.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const call = fetchMock.mock.calls[0] as unknown[];
    expect(call[0]).toBe(CREATE_URL);
    const init = call[1] as RequestInit;
    expect(new Headers(init.headers).get("content-type")).toBe("application/json");
    expect(new Headers(init.headers).get("Idempotency-Key")).toEqual(expect.any(String));
    expect(new Headers(init.headers).get("Idempotency-Key")).not.toBe("");
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
    expect(envelope.activityId).toBe(
      PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
    );
    expect(envelope.mode).toBe("guided_practice");
    expect(envelope.answers).toStrictEqual(RAW_ANSWERS);
    expect(envelope.parts).toStrictEqual(
      ANSWER_IDS.map((partId) => ({
        partId,
        rawAnswer: RAW_ANSWERS[partId],
      })),
    );
    expect(() => practiceSubmissionEnvelopeSchema.parse(envelope)).not.toThrow();
    expectNoAuthority(envelope);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: "activity_submissions:polynomial-practice",
    });
    expect(Object.keys(requestBody(fetchMock.mock.calls[1] as unknown[]))).toEqual([
      "submissionId",
    ]);
  });

  it("renders Independent seed 2 with no Guided or Worked content and displays a zero score", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(createResult(0)))
      .mockResolvedValueOnce(response(awaitingEvidence));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot mode="independent_practice" />,
    );

    expect(
      screen.getByRole("heading", { name: "Independent Practice: Degree and Leading Coefficient" }),
    ).toBeTruthy();
    expect(screen.getByText(independentVariant.prompt)).toBeTruthy();
    for (const item of independentVariant.items) {
      expect(screen.getByLabelText(`${item.id} polynomial`)).toBeTruthy();
    }
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expect(screen.queryByText(/Degree:|Leading coefficient:|Answer:/)).toBeNull();
    expectNoAuthority(independentVariant);

    fillAnswers();
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    await waitFor(() => expect(screen.getByText("Server score: 0/6")).toBeTruthy());
    expect(screen.getByRole("status")).toHaveTextContent(
      "Complete this skill with your teacher before using Mastery Advantage.",
    );
    const envelope = requestBody(fetchMock.mock.calls[0] as unknown[]);
    expect(envelope.activityId).toBe(
      PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
    );
    expect(envelope.mode).toBe("independent_practice");
    expectNoAuthority(envelope);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: "activity_submissions:polynomial-practice",
    });
  });

  it("keeps the default Guided mode and omits the optional state display", () => {
    render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot />);

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Degree and Leading Coefficient" }),
    ).toBeTruthy();
    expect(screen.queryByText(KNOWLEDGE_STATE.title)).toBeNull();
    expect(screen.queryByText("Mastery state: in progress")).toBeNull();
    expect(screen.queryByText("Readiness: Ready")).toBeNull();
  });

  it("retries with the same body and key after a create failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "private detail" }, 500))
      .mockResolvedValueOnce(response(createResult(6)))
      .mockResolvedValueOnce(response({ error: "private evidence detail" }, 500))
      .mockResolvedValueOnce(response(savedEvidence));
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot />);
    fillAnswers();
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save the Topic 1.4 degree and leading coefficient practice.",
    );
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get("Idempotency-Key");
    const firstBody = (firstCall[1] as RequestInit).body;

    fireEvent.click(screen.getByRole("button", { name: "Retry submission" }));
    await screen.findByRole("button", { name: "Retry evidence delivery" });
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get("Idempotency-Key")).toBe(
      firstKey,
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({
      submissionId: "activity_submissions:polynomial-practice",
    });

    fireEvent.click(screen.getByRole("button", { name: "Retry evidence delivery" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Your practice was saved."),
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[3] as unknown[])).toStrictEqual({
      submissionId: "activity_submissions:polynomial-practice",
    });
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain("private detail");
  });

  it("blocks duplicate clicks while the create request is saving", async () => {
    let resolveCreate!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveCreate = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(response(eligibleEvidence));
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot />);
    fillAnswers();
    const submit = screen.getByRole("button", { name: "Submit answer" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveCreate(response(createResult(6)));
    await waitFor(() => expect(screen.getByText("Server score: 6/6")).toBeTruthy());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it.each([
    ["non-object JSON", response(["submission"])],
    ["extra result field", response({ ...createResult(), hidden: true })],
    ["blank submission ID", response({ ...createResult(), submissionId: " " })],
    ["invalid score", response({ ...createResult(), score: 7 })],
    ["invalid maximum", response({ ...createResult(), maxScore: 5 })],
    ["invalid attempt ordinal", response({ ...createResult(), attemptOrdinal: 0 })],
    ["blank feedback", response({ ...createResult(), feedback: " " })],
  ])("rejects %s and shows a safe retry", async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal("fetch", fetchMock);

    render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot />);
    fillAnswers();
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save the Topic 1.4 degree and leading coefficient practice.",
    );
    expect(screen.getByRole("button", { name: "Retry submission" })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain("private");
  });

  it.each([
    ["non-object JSON", response(["evidence"])],
    ["extra evidence field", response({ ...eligibleEvidence, hidden: true })],
    ["wrong boolean type", response({ ...eligibleEvidence, masteryApplied: "yes" })],
    [
      "missing decision field",
      response({
        ...eligibleEvidence,
        decision: { ...eligibleEvidence.decision, reason: undefined },
      }),
    ],
    [
      "extra decision field",
      response({ ...eligibleEvidence, decision: { ...eligibleEvidence.decision, extra: true } }),
    ],
    [
      "unknown reason",
      response({
        ...eligibleEvidence,
        decision: { ...eligibleEvidence.decision, reason: "unknown" },
      }),
    ],
    [
      "unknown exposure state",
      response({
        ...eligibleEvidence,
        decision: { ...eligibleEvidence.decision, exposureState: "pending" },
      }),
    ],
    ["invalid delivery value", response({ ...eligibleEvidence, delivery: "invalid" })],
    ["non-OK response", response({ error: "private evidence detail" }, 500)],
  ])(
    "keeps the opaque submission and retries only evidence for malformed evidence: %s",
    async (_label, malformedEvidence) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response(createResult(6)))
        .mockResolvedValueOnce(
          malformedEvidence instanceof Response ? malformedEvidence : response(malformedEvidence),
        )
        .mockResolvedValueOnce(response(savedEvidence));
      vi.stubGlobal("fetch", fetchMock);

      render(<PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot />);
      fillAnswers();
      fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
      await screen.findByRole("button", { name: "Retry evidence delivery" });
      fireEvent.click(screen.getByRole("button", { name: "Retry evidence delivery" }));

      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent("Your practice was saved."),
      );
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
      expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
      expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
      expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({
        submissionId: "activity_submissions:polynomial-practice",
      });
      expect(JSON.stringify(fetchMock.mock.calls[2])).not.toContain("private evidence detail");
    },
  );
});
