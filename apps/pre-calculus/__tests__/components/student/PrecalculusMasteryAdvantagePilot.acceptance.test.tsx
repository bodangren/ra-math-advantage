import projection from "@/curriculum/skill-graph/projection/practice-v1-activity-map.json";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PRECALCULUS_PILOT_NODE_ID } from "@/lib/learning-evidence/precalc-pilot";
import { generateTopic11IntervalGraph } from "@/lib/practice/topic11-interval-graph";

const dashboardMocks = vi.hoisted(() => ({
  requireStudentSessionClaims: vi.fn(),
  fetchInternalQuery: vi.fn(),
  pilotKnowledgeStateQuery:
    "learningEvidence:getPrecalculusPilotKnowledgeState",
  approvedTopic11PilotQuery: "activities:getApprovedPrecalculusPilot",
  approvedTopic11WorkedQuery: "activities:getApprovedTopic11WorkedSource",
  topic11DeliveryStateQuery: "activities:getTopic11LearnerDeliveryState",
}));

vi.mock("@/lib/auth/server", () => ({
  requireStudentSessionClaims: dashboardMocks.requireStudentSessionClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: (ref: unknown, args: unknown) =>
    ref === "student:getDashboardData"
      ? Promise.resolve({ assignments: [], dueReviews: [] })
      : ref === dashboardMocks.approvedTopic11PilotQuery
        ? // Hypothetical approved query result. Current draft publication is tested separately.
          Promise.resolve(
            projection.activities.filter(
              (row) =>
                row.nodeId ===
                "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
            ),
          )
        : ref === dashboardMocks.approvedTopic11WorkedQuery
          ? Promise.resolve({
              stableActivityId:
                "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.worked_example",
              props: {},
            })
          : ref === dashboardMocks.topic11DeliveryStateQuery
            ? Promise.resolve("ready_for_practice")
            : dashboardMocks.fetchInternalQuery(ref, args),
  internal: {
    activities: {
      getApprovedPrecalculusPilot: dashboardMocks.approvedTopic11PilotQuery,
      getApprovedTopic11WorkedSource: dashboardMocks.approvedTopic11WorkedQuery,
      getTopic11LearnerDeliveryState: dashboardMocks.topic11DeliveryStateQuery,
    },
    learningEvidence: {
      getPrecalculusPilotKnowledgeState:
        dashboardMocks.pilotKnowledgeStateQuery,
    },
    student: {
      getDashboardData: "student:getDashboardData",
    },
  },
}));

const PILOT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
const INDEPENDENT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`;
const SERVER_SUBMISSION_ID = "activity_submissions:precalc-pilot-opaque";
const SAFE_SERVER_FEEDBACK =
  "3/3 interval classifications matched the server rubric.";
const PILOT_TITLE =
  "Identify intervals of increase, decrease, and constant behavior from graphs";
const SEED_ZERO_GRAPH = generateTopic11IntervalGraph(0);
const SEED_TWO_GRAPH = generateTopic11IntervalGraph(2);
const SOURCE_CORRECT_ANSWERS = {
  increasingIntervals: SEED_ZERO_GRAPH.increasingIntervals
    .map(([start, end]) => `[${start},${end}]`)
    .join(" U "),
  decreasingIntervals: SEED_ZERO_GRAPH.decreasingIntervals
    .map(([start, end]) => `[${start},${end}]`)
    .join(" U "),
  constantIntervals: "none",
};

type PilotComponent = React.ComponentType<{
  mode?: "guided_practice" | "independent_practice";
  stableActivityId: string;
  activityProps: import("@math-platform/math-content/schemas").IntervalClassificationProps;
  savedResult?: { mode: "guided_practice" | "independent_practice"; submissionId: string; attemptOrdinal: number; submittedAt: number; score: number; maxScore: number; feedback: string; deliveryState: "delivered" | "needs_delivery" | "invalid_receipt" } | null;
}>;

function projectedProps(
  mode: "guided_practice" | "independent_practice" = "guided_practice",
) {
  const graph = mode === "guided_practice" ? SEED_ZERO_GRAPH : SEED_TWO_GRAPH;
  const common = {
    prompt:
      "Identify the intervals where the graph increases, decreases, and stays constant.",
    domain: [...graph.domain] as [number, number],
    changePoints: [...graph.changePoints] as [number, number],
    points: graph.points.map(({ x, y }) => ({ x, y })),
  };
  return mode === "guided_practice"
    ? {
        ...common,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          `Mark the domain endpoints and the change points x=${graph.changePoints[0]} and x=${graph.changePoints[1]}.`,
          "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
          "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
        ],
        fieldHelp: {
          increasingIntervals: "Find every segment that rises.",
          decreasingIntervals: "Find every segment that falls.",
          constantIntervals: "Check whether any segment stays flat.",
        },
      }
    : { ...common, presentationMode: "independent_practice" as const };
}

function pilotProps(
  mode: "guided_practice" | "independent_practice" = "guided_practice",
) {
  return {
    mode,
    stableActivityId:
      mode === "guided_practice" ? PILOT_ACTIVITY_ID : INDEPENDENT_ACTIVITY_ID,
    activityProps: projectedProps(mode),
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function requestBody(call: readonly unknown[]): Record<string, unknown> {
  const options = call[1] as RequestInit;
  return JSON.parse(String(options.body)) as Record<string, unknown>;
}

function requestHeader(call: readonly unknown[], name: string): string | null {
  const options = call[1] as RequestInit;
  return new Headers(options.headers).get(name);
}

async function loadPilot(): Promise<PilotComponent> {
  try {
    const importedModule = await vi.importActual<Record<string, unknown>>(
      "@/components/student/PrecalculusMasteryAdvantagePilot",
    );
    if (typeof importedModule.PrecalculusMasteryAdvantagePilot !== "function") {
      throw new Error("PrecalculusMasteryAdvantagePilot is not exported");
    }
    return importedModule.PrecalculusMasteryAdvantagePilot as PilotComponent;
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : "";
    throw new Error(
      "Missing AP Precalculus student pilot component. Export PrecalculusMasteryAdvantagePilot from " +
        `apps/pre-calculus/components/student/PrecalculusMasteryAdvantagePilot.tsx.${detail}`,
    );
  }
}

function completeTopicOnePointOne() {
  fireEvent.change(
    screen.getByRole("textbox", { name: /increasing intervals/i }),
    {
      target: { value: SOURCE_CORRECT_ANSWERS.increasingIntervals },
    },
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: /decreasing intervals/i }),
    {
      target: { value: SOURCE_CORRECT_ANSWERS.decreasingIntervals },
    },
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: /constant intervals/i }),
    {
      target: { value: SOURCE_CORRECT_ANSWERS.constantIntervals },
    },
  );
  fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));
}

describe("PrecalculusMasteryAdvantagePilot acceptance", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    dashboardMocks.requireStudentSessionClaims.mockReset();
    dashboardMocks.requireStudentSessionClaims.mockResolvedValue({
      sub: "profiles:authenticated-precalc-student",
      role: "student",
    });
    dashboardMocks.fetchInternalQuery.mockReset();
    dashboardMocks.fetchInternalQuery
      .mockResolvedValueOnce({
        nodeId: PRECALCULUS_PILOT_NODE_ID,
        title: PILOT_TITLE,
        status: "in_progress",
        readiness: "ready",
        rawAnswer: SOURCE_CORRECT_ANSWERS.increasingIntervals,
        cardId: "srs_cards:private",
        reviewId: "srs_review_log:private",
        edge: "private-graph-edge",
        otherNodeId:
          "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change",
      })
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows a saved result without a write and starts a blank new attempt", async () => {
    const Pilot = await loadPilot();
    render(<Pilot {...pilotProps()} savedResult={{ mode: "guided_practice", submissionId: SERVER_SUBMISSION_ID, attemptOrdinal: 4, submittedAt: 10, score: 2, maxScore: 3, feedback: "Stored feedback.", deliveryState: "delivered" }} />);
    expect(screen.getByText("Saved score: 2/3")).toBeInTheDocument();
    expect(screen.getByText("Stored feedback.")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /increasing intervals/i })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Start new attempt" }));
    expect(screen.getByRole("textbox", { name: /increasing intervals/i })).toHaveValue("");
    expect(screen.getByText("Saved score: 2/3")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retries a missing receipt with only the saved submission ID", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ persisted: true, masteryApplied: false, kstApplied: false, delivery: "replay", decision: { idempotency: "new", exposureState: "introduced", eligible: false, reason: "ungraded_evidence", masteryBearing: false } }));
    const Pilot = await loadPilot();
    render(<Pilot {...pilotProps()} savedResult={{ mode: "guided_practice", submissionId: SERVER_SUBMISSION_ID, attemptOrdinal: 4, submittedAt: 10, score: 2, maxScore: 3, feedback: "Stored feedback.", deliveryState: "needs_delivery" }} />);
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retry evidence delivery" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/learning-evidence/precalculus-pilot");
    expect(requestBody(fetchMock.mock.calls[0] ?? [])).toStrictEqual({ submissionId: SERVER_SUBMISSION_ID });
  });

  it("keeps saved delivery separate from a fresh attempt and guards a double click", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ persisted: true, masteryApplied: false, kstApplied: false, delivery: "replay", decision: { idempotency: "new", exposureState: "introduced", eligible: false, reason: "ungraded_evidence", masteryBearing: false } }))
      .mockResolvedValueOnce(jsonResponse({ submissionId: "activity_submissions:fresh", score: 3, maxScore: 3, attemptOrdinal: 5, feedback: SAFE_SERVER_FEEDBACK }))
      .mockResolvedValueOnce(jsonResponse({ persisted: true, masteryApplied: false, kstApplied: false, delivery: "new", decision: { idempotency: "new", exposureState: "introduced", eligible: false, reason: "ungraded_evidence", masteryBearing: false } }));
    const Pilot = await loadPilot();
    render(<Pilot {...pilotProps()} savedResult={{ mode: "guided_practice", submissionId: SERVER_SUBMISSION_ID, attemptOrdinal: 4, submittedAt: 10, score: 2, maxScore: 3, feedback: "Stored feedback.", deliveryState: "needs_delivery" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Start new attempt" }));
    const retry = screen.getByRole("button", { name: "Retry evidence delivery" });
    fireEvent.click(retry);
    fireEvent.click(retry);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    completeTopicOnePointOne();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/activities/precalculus-pilot/submissions");
    expect(requestBody(fetchMock.mock.calls[1] ?? [])).toMatchObject({ activityId: PILOT_ACTIVITY_ID, status: "submitted" });
    expect(requestBody(fetchMock.mock.calls[2] ?? [])).toStrictEqual({ submissionId: "activity_submissions:fresh" });
  });

  it("keeps a malformed saved delivery response available for an explicit retry", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ persisted: true }));
    const Pilot = await loadPilot();
    render(<Pilot {...pilotProps()} savedResult={{ mode: "guided_practice", submissionId: SERVER_SUBMISSION_ID, attemptOrdinal: 4, submittedAt: 10, score: 2, maxScore: 3, feedback: "Stored feedback.", deliveryState: "needs_delivery" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry evidence delivery" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Evidence delivery failed. Please retry.");
    expect(screen.getByRole("button", { name: "Retry evidence delivery" })).toBeInTheDocument();
  });

  it("keeps a teacher-blocked saved receipt undelivered", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
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
    }));
    const Pilot = await loadPilot();
    render(<Pilot {...pilotProps()} savedResult={{ mode: "guided_practice", submissionId: SERVER_SUBMISSION_ID, attemptOrdinal: 4, submittedAt: 10, score: 2, maxScore: 3, feedback: "Stored feedback.", deliveryState: "needs_delivery" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry evidence delivery" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/teacher.*retry evidence delivery/i);
    expect(screen.getByText("Evidence delivery is required.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry evidence delivery" })).toBeInTheDocument();
  });

  it("replaces saved delivery state when the saved submission changes", async () => {
    const Pilot = await loadPilot();
    const view = render(<Pilot {...pilotProps()} savedResult={{ mode: "guided_practice", submissionId: "submission:old", attemptOrdinal: 4, submittedAt: 10, score: 2, maxScore: 3, feedback: "Old feedback.", deliveryState: "needs_delivery" }} />);
    expect(screen.getByText("Evidence delivery is required.")).toBeInTheDocument();
    view.rerender(<Pilot {...pilotProps()} savedResult={{ mode: "guided_practice", submissionId: "submission:new", attemptOrdinal: 5, submittedAt: 20, score: 3, maxScore: 3, feedback: "New feedback.", deliveryState: "delivered" }} />);
    expect(screen.getByText("Attempt 5")).toBeInTheDocument();
    expect(screen.getByText("Saved score: 3/3")).toBeInTheDocument();
    expect(screen.getByText("Evidence delivered.")).toBeInTheDocument();
    expect(screen.queryByText("Evidence delivery is required.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry evidence delivery" })).not.toBeInTheDocument();
  });

  it("does not offer delivery retry for an invalid saved receipt", async () => {
    const Pilot = await loadPilot();
    render(<Pilot {...pilotProps()} savedResult={{ mode: "guided_practice", submissionId: SERVER_SUBMISSION_ID, attemptOrdinal: 4, submittedAt: 10, score: 2, maxScore: 3, feedback: "Stored feedback.", deliveryState: "invalid_receipt" }} />);
    expect(screen.getByText("The saved evidence receipt is invalid.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry evidence delivery" })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends all three raw Topic 1.1 classifications to the producer, then only an opaque ID to evidence", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          submissionId: SERVER_SUBMISSION_ID,
          score: 3,
          maxScore: 3,
          feedback: SAFE_SERVER_FEEDBACK,
          attemptOrdinal: 4,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          persisted: true,
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
        }),
      );
    const Pilot = await loadPilot();

    render(<Pilot {...pilotProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "Show hint for Increasing intervals" }));
    fireEvent.click(screen.getByRole("button", { name: "Reveal answer for Decreasing intervals" }));
    completeTopicOnePointOne();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const createCall = fetchMock.mock.calls[0] ?? [];
    expect(createCall[0]).toBe("/api/activities/precalculus-pilot/submissions");
    const createEnvelope = requestBody(createCall);
    expect(createEnvelope).toMatchObject({
      contractVersion: "practice.v1",
      activityId: PILOT_ACTIVITY_ID,
      mode: "guided_practice",
      status: "submitted",
    });
    expect(createEnvelope.answers).toStrictEqual({
      increasingIntervals: SOURCE_CORRECT_ANSWERS.increasingIntervals,
      decreasingIntervals: SOURCE_CORRECT_ANSWERS.decreasingIntervals,
      constantIntervals: SOURCE_CORRECT_ANSWERS.constantIntervals,
    });
    expect(createEnvelope.parts).toStrictEqual([
      { partId: "increasingIntervals", rawAnswer: SOURCE_CORRECT_ANSWERS.increasingIntervals, hintsUsed: 1, revealStepsSeen: 0, changedCount: 1 },
      { partId: "decreasingIntervals", rawAnswer: SOURCE_CORRECT_ANSWERS.decreasingIntervals, hintsUsed: 0, revealStepsSeen: 1, changedCount: 1 },
      { partId: "constantIntervals", rawAnswer: SOURCE_CORRECT_ANSWERS.constantIntervals, hintsUsed: 0, revealStepsSeen: 0, changedCount: 1 },
    ]);
    expect(requestHeader(createCall, "Idempotency-Key")).toEqual(
      expect.any(String),
    );
    expect(createEnvelope).not.toHaveProperty("submissionId");
    expect(createEnvelope).not.toHaveProperty("score");
    expect(createEnvelope).not.toHaveProperty("maxScore");
    expect(createEnvelope).not.toHaveProperty("isCorrect");
    expect(createEnvelope).not.toHaveProperty("attemptOrdinal");

    const evidenceCall = fetchMock.mock.calls[1] ?? [];
    expect(evidenceCall[0]).toBe("/api/learning-evidence/precalculus-pilot");
    const evidenceBody = requestBody(evidenceCall);
    expect(evidenceBody).toStrictEqual({ submissionId: SERVER_SUBMISSION_ID });
    expect(JSON.stringify(evidenceBody)).not.toContain("increasingIntervals");
    expect(JSON.stringify(evidenceBody)).not.toContain("decreasingIntervals");
    expect(JSON.stringify(evidenceBody)).not.toContain("constantIntervals");
    expect(JSON.stringify(evidenceBody)).not.toContain("score");
    expect(JSON.stringify(evidenceBody)).not.toContain("maxScore");
    expect(await screen.findByText("Server score: 3/3")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("status")
        .some((status) => status.textContent?.includes(SAFE_SERVER_FEEDBACK)),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Start new attempt" }));
    expect(screen.queryByText("Find every segment that rises.")).toBeNull();
    expect(screen.getByRole("textbox", { name: /increasing intervals/i })).toHaveValue("");
    expect(screen.getByRole("button", { name: "Show hint for Increasing intervals" })).toBeEnabled();
  });

  it("retries only opaque evidence delivery after a producer result already exists", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          submissionId: SERVER_SUBMISSION_ID,
          score: 3,
          maxScore: 3,
          feedback: SAFE_SERVER_FEEDBACK,
          attemptOrdinal: 4,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ error: "Evidence delivery failed" }, 500),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          persisted: true,
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
        }),
      );
    const Pilot = await loadPilot();

    render(<Pilot {...pilotProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "Show hint for Increasing intervals" }));
    completeTopicOnePointOne();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/evidence delivery failed|retry/i);
    const retryButton = screen.getByRole("button", {
      name: /retry evidence delivery/i,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(requestBody(fetchMock.mock.calls[1] ?? [])).toStrictEqual({
      submissionId: SERVER_SUBMISSION_ID,
    });

    fireEvent.click(retryButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      "/api/learning-evidence/precalculus-pilot",
    );
    const retryEvidenceBody = requestBody(fetchMock.mock.calls[2] ?? []);
    expect(retryEvidenceBody).toStrictEqual({
      submissionId: SERVER_SUBMISSION_ID,
    });
    expect(JSON.stringify(retryEvidenceBody)).not.toContain(
      "increasingIntervals",
    );
    expect(JSON.stringify(retryEvidenceBody)).not.toContain(
      "decreasingIntervals",
    );
    expect(JSON.stringify(retryEvidenceBody)).not.toContain(
      "constantIntervals",
    );
    expect(JSON.stringify(retryEvidenceBody)).not.toContain("score");
    expect(JSON.stringify(retryEvidenceBody)).not.toContain("maxScore");
    expect(
      fetchMock.mock.calls.filter(
        ([url]) => url === "/api/activities/precalculus-pilot/submissions",
      ),
    ).toHaveLength(1);
  });

  it("shows the authoritative server score and the teacher-first result for awaiting exposure", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          submissionId: SERVER_SUBMISSION_ID,
          score: 3,
          maxScore: 3,
          feedback: SAFE_SERVER_FEEDBACK,
          attemptOrdinal: 4,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
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
        }),
      );
    const Pilot = await loadPilot();

    render(<Pilot {...pilotProps()} />);
    completeTopicOnePointOne();

    expect(await screen.findByText("Server score: 3/3")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("status")
        .some((status) => status.textContent?.includes(SAFE_SERVER_FEEDBACK)),
    ).toBe(true);
    await waitFor(() => {
      expect(
        screen
          .getAllByRole("status")
          .some((status) =>
            /complete.*teacher.*before.*mastery advantage/i.test(
              status.textContent ?? "",
            ),
          ),
      ).toBe(true);
    });
  });

  it("retries a failed create with the identical envelope and Idempotency-Key before opaque evidence delivery", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ error: "Unable to save the practice submission." }, 500),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          submissionId: SERVER_SUBMISSION_ID,
          score: 3,
          maxScore: 3,
          feedback: SAFE_SERVER_FEEDBACK,
          attemptOrdinal: 1,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          persisted: true,
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
        }),
      );
    const Pilot = await loadPilot();

    render(<Pilot {...pilotProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "Show hint for Increasing intervals" }));
    completeTopicOnePointOne();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/unable to save|retry/i);
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const originalCreateCall = fetchMock.mock.calls[0] ?? [];
    const originalEnvelope = requestBody(originalCreateCall);
    const originalKey = requestHeader(originalCreateCall, "Idempotency-Key");
    expect(originalKey).toEqual(expect.any(String));
    expect((originalEnvelope.parts as Array<Record<string, unknown>>)[0]).toMatchObject({
      hintsUsed: 1,
      revealStepsSeen: 0,
      changedCount: 1,
    });
    expect(screen.getByRole("textbox", { name: /increasing intervals/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reveal answer for Decreasing intervals" })).toBeDisabled();

    fireEvent.click(retryButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    const retryCreateCall = fetchMock.mock.calls[1] ?? [];
    expect(retryCreateCall[0]).toBe(
      "/api/activities/precalculus-pilot/submissions",
    );
    expect(requestBody(retryCreateCall)).toStrictEqual(originalEnvelope);
    expect(requestHeader(retryCreateCall, "Idempotency-Key")).toBe(originalKey);

    const evidenceCall = fetchMock.mock.calls[2] ?? [];
    expect(evidenceCall[0]).toBe("/api/learning-evidence/precalculus-pilot");
    expect(requestBody(evidenceCall)).toStrictEqual({
      submissionId: SERVER_SUBMISSION_ID,
    });
  });

  it("renders Guided Practice scaffolding with accessible help and the generated graph", async () => {
    const Pilot = await loadPilot();

    render(<Pilot {...pilotProps()} />);

    expect(
      screen.getByRole("heading", {
        name: "Guided Practice: Classify Graph Intervals",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Mark the domain endpoints and the change points x=3 and x=7.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
      ),
    ).toBeInTheDocument();
    const graph = screen.getByRole("img", { name: /interval graph/i });
    const firstStep = screen.getByText(
      "Mark the domain endpoints and the change points x=3 and x=7.",
    );
    const inputs = [
      screen.getByRole("textbox", { name: /increasing intervals/i }),
      screen.getByRole("textbox", { name: /decreasing intervals/i }),
      screen.getByRole("textbox", { name: /constant intervals/i }),
    ];
    expect(
      graph.compareDocumentPosition(firstStep) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      firstStep.compareDocumentPosition(inputs[0]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    const help = [
      "Find every segment that rises.",
      "Find every segment that falls.",
      "Check whether any segment stays flat.",
    ];
    inputs.forEach((input) => expect(input.getAttribute("aria-describedby")).toBeNull());
    ["Increasing intervals", "Decreasing intervals", "Constant intervals"].forEach((label) => {
      fireEvent.click(screen.getByRole("button", { name: `Show hint for ${label}` }));
    });
    inputs.forEach((input, index) => {
      const helpId = input.getAttribute("aria-describedby");
      expect(helpId).toBeTruthy();
      expect(helpId ? document.getElementById(helpId) : null).toHaveTextContent(
        help[index],
      );
    });
  });

  it("does not make practice actionable without a server-projected identity and props", async () => {
    const Pilot = await loadPilot();

    render(
      React.createElement(
        Pilot as unknown as React.ComponentType<Record<string, never>>,
        {},
      ),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "This practice activity is not available.",
    );
    expect(
      screen.queryByRole("button", { name: /submit answer/i }),
    ).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders Independent Practice from seed 2 without Guided scaffolding and submits its exact envelope", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          submissionId: SERVER_SUBMISSION_ID,
          score: 3,
          maxScore: 3,
          feedback: SAFE_SERVER_FEEDBACK,
          attemptOrdinal: 1,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
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
        }),
      );
    const Pilot = await loadPilot();
    const independentAnswers = {
      increasingIntervals: SEED_TWO_GRAPH.increasingIntervals
        .map(([start, end]) => `[${start},${end}]`)
        .join(" U "),
      decreasingIntervals: SEED_TWO_GRAPH.decreasingIntervals
        .map(([start, end]) => `[${start},${end}]`)
        .join(" U "),
      constantIntervals: "none",
    };

    render(<Pilot {...pilotProps("independent_practice")} />);

    expect(
      screen.getByRole("heading", {
        name: "Independent Practice: Classify Graph Intervals",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /interval graph/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Mark the domain endpoints and the change points x=3 and x=7.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Find every segment that rises."),
    ).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("textbox", { name: /increasing intervals/i }),
      {
        target: { value: independentAnswers.increasingIntervals },
      },
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: /decreasing intervals/i }),
      {
        target: { value: independentAnswers.decreasingIntervals },
      },
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: /constant intervals/i }),
      {
        target: { value: independentAnswers.constantIntervals },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const createCall = fetchMock.mock.calls[0] ?? [];
    expect(requestBody(createCall)).toMatchObject({
      activityId: INDEPENDENT_ACTIVITY_ID,
      mode: "independent_practice",
      status: "submitted",
      answers: independentAnswers,
    });
    expect(requestBody(createCall)).not.toHaveProperty("score");
    expect(requestBody(createCall)).not.toHaveProperty("isCorrect");
    expect(requestBody(createCall)).not.toHaveProperty("maxScore");
    const graph = screen.getByRole("img", { name: /interval graph/i });
    const firstInput = screen.getByRole("textbox", {
      name: /increasing intervals/i,
    });
    expect(
      graph.compareDocumentPosition(firstInput) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("gives separate mode instances unique heading and help IDs", async () => {
    const Pilot = await loadPilot();

    render(
      <>
        <Pilot {...pilotProps()} />
        <Pilot {...pilotProps("independent_practice")} />
      </>,
    );

    const headings = screen.getAllByRole("heading", {
      name: /Practice: Classify Graph Intervals/,
    });
    expect(new Set(headings.map((heading) => heading.id)).size).toBe(2);
    const inputs = screen.getAllByRole("textbox");
    ["Increasing intervals", "Decreasing intervals", "Constant intervals"].forEach((label) => {
      fireEvent.click(screen.getAllByRole("button", { name: `Show hint for ${label}` })[0]!);
    });
    expect(
      new Set(
        inputs
          .slice(0, 3)
          .map((input) => input.getAttribute("aria-describedby")),
      ).size,
    ).toBe(3);
    expect(
      inputs.slice(3).every((input) => !input.hasAttribute("aria-describedby")),
    ).toBe(true);
  });
});
