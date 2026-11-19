import projection from "@/curriculum/skill-graph/projection/practice-v1-activity-map.json";
import type { ComponentType, ReactElement } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const dashboardMocks = vi.hoisted(() => ({
  requireStudentSessionClaims: vi.fn(),
  fetchInternalQuery: vi.fn(),
  workedProps: null as Record<string, unknown> | null,
  deliveryState: "needs_acknowledgement" as string | null,
}));

vi.mock("@/lib/auth/server", () => ({
  requireStudentSessionClaims: dashboardMocks.requireStudentSessionClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: (ref: unknown, args: unknown) =>
    ref === "student:getDashboardData"
      ? Promise.resolve({ assignments: [], dueReviews: [] })
      : ref === "activities:getApprovedPrecalculusPilot"
        ? // Hypothetical approved query result. Current draft publication is tested separately.
          Promise.resolve(
            projection.activities.filter(
              (row) =>
                row.nodeId ===
                  "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs" &&
                row.mode !== "worked_example",
            ),
          )
        : ref === "activities:getApprovedTopic11WorkedSource"
          ? Promise.resolve({
              ...projection.activities.find(
                (row) =>
                  row.nodeId ===
                    "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs" &&
                  row.mode === "worked_example",
              ),
              stableActivityId: "projected-worked-source",
            })
          : ref === "activities:getTopic11LearnerDeliveryState"
            ? Promise.resolve(dashboardMocks.deliveryState)
            : dashboardMocks.fetchInternalQuery(ref, args),
  internal: {
    activities: {
      getApprovedPrecalculusPilot: "activities:getApprovedPrecalculusPilot",
      getApprovedTopic11WorkedSource: "activities:getApprovedTopic11WorkedSource",
      getTopic11LearnerDeliveryState: "activities:getTopic11LearnerDeliveryState",
    },
    student: { getDashboardData: "student:getDashboardData" },
    learningEvidence: {
      getPrecalculusPilotKnowledgeState: "learningEvidence:getPrecalculusPilotKnowledgeState",
    },
  },
}));

vi.mock("@/components/student/PrecalculusTopic11DailyCurriculumPilot", () => ({
  PrecalculusTopic11DailyCurriculumPilot: (props: Record<string, unknown>) => {
    dashboardMocks.workedProps = props;
    return <div data-testid="precalc-topic-1-1-daily" />;
  },
}));

vi.mock("@/components/student/PrecalculusMasteryAdvantagePilot", () => ({
  PrecalculusMasteryAdvantagePilot: () => <div data-testid="precalc-mastery-advantage" />,
}));

async function loadDailyProducer(): Promise<
  ComponentType<{ stableActivityId: string; activityProps: typeof worked.props }>
> {
  try {
    const loadedModule = await vi.importActual<Record<string, unknown>>(
      "@/components/student/PrecalculusTopic11DailyCurriculumPilot",
    );
    if (typeof loadedModule.PrecalculusTopic11DailyCurriculumPilot !== "function") {
      throw new Error("PrecalculusTopic11DailyCurriculumPilot is not exported");
    }
    return loadedModule.PrecalculusTopic11DailyCurriculumPilot as ComponentType<{
      stableActivityId: string;
      activityProps: typeof worked.props;
    }>;
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : "";
    throw new Error(
      "Missing AP Precalculus Topic 1.1 daily component at " +
        `components/student/PrecalculusTopic11DailyCurriculumPilot.tsx.${detail}`,
    );
  }
}

const worked = projection.activities.find(
  (row) =>
    row.nodeId === "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs" &&
    row.mode === "worked_example",
)!;

function renderDaily(
  DailyProducer: ComponentType<{ stableActivityId: string; activityProps: typeof worked.props }>,
) {
  return render(
    <DailyProducer stableActivityId={worked.stableActivityId} activityProps={worked.props} />,
  );
}

describe("AP Precalculus Topic 1.1 daily curriculum producer", () => {
  afterEach(() => {
    dashboardMocks.deliveryState = "needs_acknowledgement";
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows the completed Worked example and saves only an acknowledgement", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          submissionId: "activity_submissions:precalc-daily-source",
          attemptOrdinal: 1,
          submittedAt: "2026-09-08T00:00:00.000Z",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const DailyProducer = await loadDailyProducer();

    renderDaily(DailyProducer);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(
      screen.getByRole("heading", { name: "Worked Example: Classify Graph Intervals" }),
    ).toBeInTheDocument();
    const prompt = screen.getByText(
      /find all intervals where f is increasing, decreasing, and constant/i,
    );
    expect(prompt).toBeInTheDocument();
    expect(
      screen.getAllByText("Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none.").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("State all interval classifications.")).toBeInTheDocument();
    const graph = screen.getByRole("img", {
      name: /interval graph/i,
    });
    const reasoning = screen.getByRole("list");
    expect(prompt.compareDocumentPosition(graph) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      graph.compareDocumentPosition(reasoning) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /mark worked example reviewed/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/activities/precalculus-topic-1-1/submissions");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Idempotency-Key")).toEqual(expect.any(String));
    const body = JSON.parse(String(init.body));
    expect(body).toEqual({});
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Your worked-example acknowledgement was saved.",
      ),
    );
    expect(body).not.toHaveProperty("mode");
    expect(body).not.toHaveProperty("attemptNumber");
    expect(body).not.toHaveProperty("submittedAt");
    expect(body).not.toHaveProperty("score");
  });

  it("renders the daily producer before Mastery Advantage on the student dashboard", async () => {
    dashboardMocks.requireStudentSessionClaims.mockResolvedValue({
      sub: "profiles:authenticated-precalc-student",
      role: "student",
    });
    dashboardMocks.fetchInternalQuery.mockResolvedValue({
      nodeId: "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
      title: "Identify intervals from graphs",
      status: "not_started",
      readiness: "ready",
    });
    const { default: StudentDashboard } = await vi.importActual<Record<string, unknown>>(
      "@/app/student/dashboard/page",
    );
    const dashboard = await (StudentDashboard as () => Promise<ReactElement>)();

    render(dashboard);
    const daily = screen.getByTestId("precalc-topic-1-1-daily");
    expect(dashboardMocks.workedProps).toMatchObject({
      stableActivityId: "projected-worked-source",
    });
    expect(daily).toBeInTheDocument();
    expect(screen.queryByTestId("precalc-mastery-advantage")).not.toBeInTheDocument();
  });

  it("shows Guided and Independent practice only after teacher confirmation", async () => {
    dashboardMocks.deliveryState = "ready_for_practice";
    dashboardMocks.requireStudentSessionClaims.mockResolvedValue({
      sub: "profiles:authenticated-precalc-student",
      role: "student",
    });
    dashboardMocks.fetchInternalQuery.mockResolvedValue({
      nodeId: "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
      title: "Identify intervals from graphs",
      status: "not_started",
      readiness: "ready",
    });
    const { default: StudentDashboard } = await vi.importActual<Record<string, unknown>>(
      "@/app/student/dashboard/page",
    );
    const dashboard = await (StudentDashboard as () => Promise<ReactElement>)();

    render(dashboard);
    expect(screen.queryByTestId("precalc-topic-1-1-daily")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("precalc-mastery-advantage")).toHaveLength(2);
  });

  it("shows the pending teacher message on the dashboard without selected activities", async () => {
    dashboardMocks.deliveryState = "awaiting_teacher_confirmation";
    dashboardMocks.requireStudentSessionClaims.mockResolvedValue({
      sub: "profiles:authenticated-precalc-student",
      role: "student",
    });
    dashboardMocks.fetchInternalQuery.mockResolvedValue({
      nodeId: "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
      title: "Identify intervals from graphs",
      status: "not_started",
      readiness: "ready",
    });
    const { default: StudentDashboard } = await vi.importActual<Record<string, unknown>>(
      "@/app/student/dashboard/page",
    );

    render(await (StudentDashboard as () => Promise<ReactElement>)());
    expect(screen.getByText(/wait for your teacher/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Check lesson status" })).toHaveAttribute(
      "href",
      "/student/lessons/1.1",
    );
    expect(screen.queryByTestId("precalc-topic-1-1-daily")).not.toBeInTheDocument();
    expect(screen.queryByTestId("precalc-mastery-advantage")).not.toBeInTheDocument();
  });

  it("relabels the Worked review action as the only retry and freezes one raw request and key after failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Temporary daily failure" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            submissionId: "activity_submissions:precalc-daily-source",
            attemptOrdinal: 1,
            submittedAt: "2026-09-08T00:00:00.000Z",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const DailyProducer = await loadDailyProducer();

    renderDaily(DailyProducer);
    fireEvent.click(screen.getByRole("button", { name: /mark worked example reviewed/i }));

    const alert = await screen.findByRole("alert");
    const retry = screen.getByRole("button", { name: /^retry worked example review$/i });
    expect(retry).toBeEnabled();
    expect(
      screen.getAllByRole("button", {
        name: /mark worked example reviewed|retry worked example review/i,
      }),
    ).toStrictEqual([retry]);
    expect(alert.querySelector("button")).toBeNull();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);

    const firstCall = fetchMock.mock.calls[0];
    if (!firstCall) throw new Error("Expected the initial daily request");
    const firstHeaders = new Headers((firstCall[1] as RequestInit).headers);
    const firstBody = String((firstCall[1] as RequestInit).body);
    fireEvent.click(retry);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const retryCall = fetchMock.mock.calls[1];
    if (!retryCall) throw new Error("Expected the retried daily request");
    expect(retryCall[0]).toBe(firstCall[0]);
    expect(String((retryCall[1] as RequestInit).body)).toBe(firstBody);
    expect(new Headers((retryCall[1] as RequestInit).headers).get("Idempotency-Key")).toBe(
      firstHeaders.get("Idempotency-Key"),
    );
  });

  it("disables daily submission after a successful source delivery", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          submissionId: "activity_submissions:precalc-daily-source",
          attemptOrdinal: 1,
          submittedAt: "2026-09-08T00:00:00.000Z",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const DailyProducer = await loadDailyProducer();

    renderDaily(DailyProducer);
    fireEvent.click(screen.getByRole("button", { name: /mark worked example reviewed/i }));

    await screen.findByRole("status");
    const submit = screen.getByRole("button", { name: /worked example reviewed/i });
    expect(submit).toBeDisabled();
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
