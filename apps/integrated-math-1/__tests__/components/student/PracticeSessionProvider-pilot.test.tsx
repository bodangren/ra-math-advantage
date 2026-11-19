import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  generateIM1VerbalToNumericalOutput,
  projectIM1VerbalToNumerical,
} from "@math-platform/math-content/knowledge-space";
import { describe, expect, it, vi } from "vitest";

import { PracticeSessionProvider } from "@/components/student/PracticeSessionProvider";
import { IM1_TRANSLATION_NODE_ID, submitTranslationPilotHandler } from "@/convex/activities";

const modes = ["worked_example", "guided_practice", "independent_practice"] as const;
const seeds = [1101, 1110, 1103] as const;
const approvedPublication = {
  nodes: [
    {
      id: IM1_TRANSLATION_NODE_ID,
      kind: "skill",
      reviewStatus: "approved",
      independentPracticeReady: true,
    },
  ],
  blueprints: [{ nodeId: IM1_TRANSLATION_NODE_ID, reviewStatus: "approved" }],
};

function testRuntime() {
  const answers = modes.map(
    (_, index) =>
      (
        generateIM1VerbalToNumericalOutput({
          nodeId: IM1_TRANSLATION_NODE_ID,
          seed: seeds[index],
          difficulty: 1,
        }).data.acceptedExpressions as string[]
      )[0],
  );
  const activities = modes.map((mode, index) => ({
    _id: `activity-${index + 1}`,
    activityId: `activity-${index + 1}`,
    stableActivityId: `${IM1_TRANSLATION_NODE_ID}.${mode}`,
    masteryNodeId: IM1_TRANSLATION_NODE_ID,
    mode,
    learningEvidenceMode: mode,
    componentKey: "fill-in-the-blank",
    generatorSeed: seeds[index],
    generatorDifficulty: 1,
    srsEligible: mode === "independent_practice",
    approval: { status: "approved" },
    props: projectIM1VerbalToNumerical(
      { nodeId: IM1_TRANSLATION_NODE_ID, seed: seeds[index], difficulty: 1 },
      mode,
      `${IM1_TRANSLATION_NODE_ID}.${mode}`,
    ).props,
  }));
  const tables: Record<string, Array<Record<string, unknown>>> = {
    profiles: [{ _id: "student-1", role: "student" }],
    auth_credentials: [{ _id: "credential", profileId: "student-1", isActive: true }],
    activities,
    activity_submissions: [],
    learning_evidence: [],
    srs_cards: [],
    srs_review_log: [],
  };
  let sequence = 0;
  const db = {
    get: async (id: string) =>
      Object.values(tables)
        .flat()
        .find((row) => row._id === id) ?? null,
    query: (table: string) => {
      let selected = [...tables[table]];
      const chain = {
        eq(field: string, value: unknown) {
          selected = selected.filter((row) => row[field] === value);
          return chain;
        },
      };
      const result = {
        unique: async () => selected[0] ?? null,
        first: async () => selected[0] ?? null,
        collect: async () => selected,
        order() {
          return result;
        },
      };
      return {
        withIndex(_name: string, select: (q: typeof chain) => unknown) {
          select(chain);
          return result;
        },
      };
    },
    insert: async (table: string, value: Record<string, unknown>) => {
      const id = `${table}_${++sequence}`;
      tables[table].push({ _id: id, ...value });
      return id;
    },
  };
  return { answers, activities, ctx: { db }, tables };
}

describe("PracticeSessionProvider pilot flow", () => {
  it("prepends the first exposure and preserves the existing queue", async () => {
    const runtime = testRuntime();
    const queue = [
      {
        activityId: "activity-3",
        componentKey: "fill-in-the-blank",
        props: {},
        card: { objectiveId: "duplicate-pilot-objective" },
      },
      {
        activityId: "queue-activity",
        componentKey: "queue-component",
        props: {},
        card: { objectiveId: "queue-objective" },
      },
    ] as never;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "acknowledged" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "graded", score: 1, maxScore: 1 }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "graded", score: 1, maxScore: 1 }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PracticeSessionProvider
        session={{ sessionId: "session-1" } as never}
        queue={queue}
        studentId="student-1"
        pilotActivities={runtime.activities as never}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue to guided practice" }));
    await screen.findByRole("textbox");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: runtime.answers[1] } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Finish" }));
    await screen.findByText(/product of 17 and the difference/);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: runtime.answers[2] } });
    fireEvent.click(screen.getByRole("button", { name: "Submit All Answers" }));
    await screen.findByTestId("first-objective-id");
    expect(screen.getByTestId("first-objective-id")).toHaveTextContent("queue-objective");
    vi.unstubAllGlobals();
  });
  it("keeps Worked visible after a save failure and retries the same acknowledgement", async () => {
    const runtime = testRuntime();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "acknowledged" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PracticeSessionProvider
        session={{ sessionId: "session-1" } as never}
        queue={[]}
        studentId="student-1"
        pilotActivities={runtime.activities as never}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue to guided practice" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save the practice response",
    );
    expect(screen.getByText(/sum of 16 and 17, divided by 12/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue to guided practice" }));
    await screen.findByRole("textbox");
    expect(fetchMock.mock.calls[0][1].headers["Idempotency-Key"]).toBe(
      fetchMock.mock.calls[1][1].headers["Idempotency-Key"],
    );
    vi.unstubAllGlobals();
  });

  it("uses durable server results through all modes and gives a correction a new key", async () => {
    const runtime = testRuntime();
    let releaseFirst!: () => void;
    const firstRequest = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      if (fetchMock.mock.calls.length === 1) await firstRequest;
      const activityId = url.split("/").at(-2)!;
      const body = JSON.parse(init.body as string) as {
        rawResponse: string;
        hintsUsed: number;
        revealStepsSeen: number;
      };
      const result = await submitTranslationPilotHandler(
        runtime.ctx as never,
        {
          userId: "student-1",
          activityId,
          idempotencyKey: (init.headers as Record<string, string>)["Idempotency-Key"],
          ...body,
        } as never,
        approvedPublication,
      );
      return new Response(JSON.stringify(result), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PracticeSessionProvider
        session={{ sessionId: "session-1" } as never}
        queue={[]}
        studentId="student-1"
        pilotActivities={runtime.activities as never}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue to guided practice" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/sum of 16 and 17, divided by 12/)).toBeInTheDocument();
    releaseFirst();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Continue to guided practice" }),
      ).not.toBeInTheDocument(),
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: runtime.answers[1] } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Finish" }));
    expect((await screen.findAllByText(/product of 17 and the difference/)).length).toBeGreaterThan(
      0,
    );

    const independentInput = screen.getByRole("textbox");
    fireEvent.change(independentInput, { target: { value: "wrong grouping" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit All Answers" }));
    await screen.findByRole("alert");
    fireEvent.change(independentInput, { target: { value: runtime.answers[2] } });
    fireEvent.click(screen.getByRole("button", { name: "Submit All Answers" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

    const wrongRequest = fetchMock.mock.calls[2][1] as RequestInit;
    const correctedRequest = fetchMock.mock.calls[3][1] as RequestInit;
    expect((wrongRequest.headers as Record<string, string>)["Idempotency-Key"]).not.toBe(
      (correctedRequest.headers as Record<string, string>)["Idempotency-Key"],
    );
    expect(runtime.tables.activity_submissions).toHaveLength(4);
    expect(runtime.tables.activity_submissions[0]).not.toHaveProperty("score");
    expect(runtime.tables.activity_submissions.slice(1).map((row) => row.score)).toEqual([1, 0, 1]);
    expect(
      runtime.tables.activity_submissions
        .slice(1)
        .map((row) => (row.submissionData as { rawResponse: string }).rawResponse),
    ).toEqual([runtime.answers[1], "wrong grouping", runtime.answers[2]]);
    expect(await screen.findByText("Practice complete.")).toBeInTheDocument();
    expect(runtime.tables.learning_evidence).toHaveLength(3);
    expect(runtime.tables.learning_evidence.map((row) => row.mode)).toEqual([
      "guided_practice",
      "independent_practice",
      "independent_practice",
    ]);
    expect(
      runtime.tables.learning_evidence.map(
        (row) => (row.gradedEvidence as { score: number }).score,
      ),
    ).toEqual([1, 0, 1]);
    expect(
      runtime.tables.learning_evidence.every(
        (row) =>
          row.learnerId === "student-1" &&
          row.nodeId === IM1_TRANSLATION_NODE_ID &&
          row.masteryBearing === false,
      ),
    ).toBe(true);
    vi.unstubAllGlobals();
  });
});
