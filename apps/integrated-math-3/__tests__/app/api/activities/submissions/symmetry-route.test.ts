import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { IM3_SYMMETRY_NODE } from "@/lib/practice/learning-evidence-pilot";

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  requireStudentRequestClaims: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  requireStudentRequestClaims: mocks.requireStudentRequestClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  internal: {
    activities: {
      createServerOwnedSubmission: "internal.activities.createServerOwnedSubmission",
    },
  },
}));

const symmetryGenerator = getGenerator("quadratic-graph-analysis");
const guidedOutput = symmetryGenerator.generate({
  nodeId: IM3_SYMMETRY_NODE,
  seed: 0,
  difficulty: 0.5,
});
const independentOutput = symmetryGenerator.generate({
  nodeId: IM3_SYMMETRY_NODE,
  seed: 8,
  difficulty: 0.5,
});

type SymmetryOutput = typeof guidedOutput;
type SymmetryMode = "guided_practice" | "independent_practice";
type Point = { x: number; y: number };
type SymmetryRendererProps = {
  equation: string;
  vertex: [number, number];
  yIntercept: [number, number];
  domain: number[];
  range: number[];
};
type SymmetryEnvelope = {
  contractVersion: "practice.v1";
  activityId: string;
  mode: SymmetryMode;
  status: "submitted";
  attemptNumber: number;
  submittedAt: string;
  answers: Record<string, unknown>;
  parts: Array<Record<string, unknown>>;
  artifact: Record<string, unknown>;
};

const guidedPoints = guidedOutput.expectedAnswer.placed_points as Point[];

const SERVER_LEARNER_ID = "authenticated-im3-learner";
const SERVER_SUBMISSION_ID = "server-owned-im3-submission";

function makeEnvelope(
  output: SymmetryOutput,
  activityId: string,
  mode: SymmetryMode,
  points: Point[] = output.expectedAnswer.placed_points as Point[],
): SymmetryEnvelope {
  const props = output.data.rendererProps as SymmetryRendererProps;
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-09-03T10:00:00.000Z",
    answers: { placed_points: points },
    parts: [
      {
        partId: "placed_points",
        rawAnswer: points,
        hintsUsed: 1,
        changedCount: 3,
      },
    ],
    artifact: {
      graphState: {
        equation: props.equation,
        vertex: props.vertex,
        yIntercept: props.yIntercept,
        placedPoints: points,
        domain: props.domain,
        range: props.range,
      },
    },
  };
}

function makeRequest(body: unknown, idempotencyKey: string): Request {
  return new Request("http://localhost/api/activities/submissions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}

async function loadPost(): Promise<(request: Request) => Promise<Response>> {
  const route = await vi.importActual<Record<string, unknown>>(
    "@/app/api/activities/submissions/route",
  );
  if (typeof route.POST !== "function") throw new Error("POST is not exported");
  return route.POST as (request: Request) => Promise<Response>;
}

describe("POST /api/activities/submissions symmetry envelope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({
      sub: SERVER_LEARNER_ID,
      role: "student",
    });
    mocks.fetchInternalMutation.mockResolvedValue({
      submissionId: SERVER_SUBMISSION_ID,
      score: 1,
      maxScore: 1,
    });
  });

  it.each([
    ["Guided", guidedOutput, "activities:symmetry-guided-route", "guided_practice"],
    [
      "Independent",
      independentOutput,
      "activities:symmetry-independent-route",
      "independent_practice",
    ],
  ] as const)(
    "accepts the exact %s symmetry renderer envelope",
    async (_label, output, activityId, mode) => {
      const POST = await loadPost();
      const envelope = makeEnvelope(output, activityId, mode);
      const idempotencyKey = `im3-symmetry-${mode}-route-key`;
      const response = await POST(makeRequest(envelope, idempotencyKey));

      expect(response.status).toBe(200);
      expect(envelope).not.toHaveProperty("score");
      expect(envelope).not.toHaveProperty("maxScore");
      expect(envelope).not.toHaveProperty("isCorrect");
      expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
        "internal.activities.createServerOwnedSubmission",
        {
          userId: SERVER_LEARNER_ID,
          activityId,
          submissionData: envelope,
          idempotencyKey,
        },
      );
    },
  );

  it("accepts structurally valid wrong points and leaves grading to the server", async () => {
    const POST = await loadPost();
    const points = guidedPoints;
    const wrongPoints = points.map((point) => ({ x: point.x + 100, y: point.y + 100 }));
    const envelope = makeEnvelope(
      guidedOutput,
      "activities:symmetry-guided-wrong-answer-route",
      "guided_practice",
      wrongPoints,
    );
    const response = await POST(makeRequest(envelope, "im3-symmetry-wrong-answer-route-key"));

    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it("rejects an answer and raw part mismatch before the internal mutation", async () => {
    const POST = await loadPost();
    const points = guidedPoints;
    const envelope = makeEnvelope(
      guidedOutput,
      "activities:symmetry-guided-mismatch-route",
      "guided_practice",
      points,
    );
    envelope.parts[0] = {
      ...envelope.parts[0],
      rawAnswer: points.map((point) => ({ x: point.x + 1, y: point.y })),
    };
    const response = await POST(makeRequest(envelope, "im3-symmetry-mismatch-route-key"));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "wrong point count",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        answers: { placed_points: guidedPoints.slice(0, 2) },
      }),
    ],
    [
      "non-finite coordinate",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        answers: { placed_points: [{ x: null, y: 0 }, ...guidedPoints.slice(1)] },
        parts: [{ ...envelope.parts[0], rawAnswer: [{ x: null, y: 0 }, ...guidedPoints.slice(1)] }],
      }),
    ],
    [
      "non-number coordinate",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        answers: { placed_points: [{ x: "0", y: 0 }, ...guidedPoints.slice(1)] },
        parts: [{ ...envelope.parts[0], rawAnswer: [{ x: "0", y: 0 }, ...guidedPoints.slice(1)] }],
      }),
    ],
    [
      "extra point field",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        answers: { placed_points: guidedPoints.map((point) => ({ ...point, label: "extra" })) },
        parts: [
          {
            ...envelope.parts[0],
            rawAnswer: guidedPoints.map((point) => ({ ...point, label: "extra" })),
          },
        ],
      }),
    ],
    [
      "wrong answer key",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        answers: { placedPoints: guidedPoints },
      }),
    ],
    [
      "wrong part ID",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        parts: [{ ...envelope.parts[0], partId: "wrong_part" }],
      }),
    ],
    [
      "duplicate part",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        parts: [envelope.parts[0], envelope.parts[0]],
      }),
    ],
    ["missing part", (envelope: ReturnType<typeof makeEnvelope>) => ({ ...envelope, parts: [] })],
    [
      "extra part",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        parts: [...envelope.parts, { partId: "extra", rawAnswer: guidedPoints }],
      }),
    ],
    [
      "missing answer key",
      (envelope: ReturnType<typeof makeEnvelope>) => ({ ...envelope, answers: {} }),
    ],
    [
      "extra answer key",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        answers: { ...envelope.answers, extra: guidedOutput.expectedAnswer.placed_points },
      }),
    ],
    [
      "wrong mode",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        mode: "worked_example" as const,
      }),
    ],
    [
      "wrong status",
      (envelope: ReturnType<typeof makeEnvelope>) => ({ ...envelope, status: "graded" }),
    ],
  ] as const)("rejects %s before the internal mutation", async (_label, change) => {
    const POST = await loadPost();
    const envelope = change(
      makeEnvelope(guidedOutput, "activities:symmetry-guided-guard-route", "guided_practice"),
    );
    const response = await POST(makeRequest(envelope, `im3-symmetry-guard-${_label}`));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });
});
