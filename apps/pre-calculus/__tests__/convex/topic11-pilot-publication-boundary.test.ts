import { describe, expect, it, vi } from "vitest";

import {
  createServerOwnedSubmission,
  getApprovedPrecalculusPilotHandler,
  isPrecalculusPilotPublished,
  PRECALCULUS_PILOT_ACTIVITY_ID,
} from "@/convex/activities";

const PRECALCULUS_PILOT_NODE_ID =
  "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs";
const approvedPublication = {
  nodes: [{ id: PRECALCULUS_PILOT_NODE_ID, kind: "skill", reviewStatus: "approved" }],
  blueprints: [{ nodeId: PRECALCULUS_PILOT_NODE_ID, reviewStatus: "approved" }],
};

describe("Topic 1.1 canonical publication boundary", () => {
  it("accepts only an approved canonical skill and blueprint fixture", () => {
    expect(isPrecalculusPilotPublished(approvedPublication)).toBe(true);
    expect(isPrecalculusPilotPublished({ ...approvedPublication, blueprints: [] })).toBe(false);
    expect(isPrecalculusPilotPublished({ ...approvedPublication, nodes: [] })).toBe(false);
  });

  it("returns no approved activities for the current draft graph without reading storage", async () => {
    const query = vi.fn();
    await expect(getApprovedPrecalculusPilotHandler({ db: { query } } as never)).resolves.toEqual(
      [],
    );
    expect(query).not.toHaveBeenCalled();
  });

  it("returns the exact approved modes for an approved publication fixture", async () => {
    const rows = ["worked_example", "guided_practice", "independent_practice"].map((mode) => ({
      _id: `activities:${mode}`,
      stableActivityId:
        mode === "worked_example"
          ? `${PRECALCULUS_PILOT_NODE_ID}.worked_example`
          : `${PRECALCULUS_PILOT_NODE_ID}.${mode}`,
      componentKey:
        mode === "worked_example"
          ? "precalculus-topic-1-1-daily-curriculum"
          : "precalculus-mastery-advantage-pilot",
      props: {
        nodeId: PRECALCULUS_PILOT_NODE_ID,
        mode,
        ...(mode === "worked_example" ? { source: "teacher_led" } : {}),
      },
      approval: { status: "approved" },
    }));
    const query = vi.fn(() => ({
      withIndex: (
        _name: string,
        configure: (value: { eq: (_field: string, value: string) => unknown }) => unknown,
      ) => {
        let stableActivityId = "";
        configure({
          eq: (_field, value) => {
            stableActivityId = value;
          },
        });
        return {
          unique: async () => rows.find((row) => row.stableActivityId === stableActivityId) ?? null,
        };
      },
    }));

    const result = await getApprovedPrecalculusPilotHandler(
      { db: { query } } as never,
      approvedPublication,
    );
    expect(result.map((row) => [row.stableActivityId, row.mode])).toEqual([
      [`${PRECALCULUS_PILOT_NODE_ID}.worked_example`, "worked_example"],
      [`${PRECALCULUS_PILOT_NODE_ID}.guided_practice`, "guided_practice"],
      [`${PRECALCULUS_PILOT_NODE_ID}.independent_practice`, "independent_practice"],
    ]);
    expect(
      JSON.stringify(result.find((row) => row.mode === "independent_practice")?.props),
    ).not.toMatch(/answer|solution|hint/i);
  });

  it("rejects direct submission for the current draft graph before reading storage", async () => {
    const handler = (
      createServerOwnedSubmission as unknown as {
        _handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
      }
    )._handler;
    const query = vi.fn();
    await expect(
      handler(
        { db: { query } },
        {
          userId: "profiles:student",
          activityId: PRECALCULUS_PILOT_ACTIVITY_ID,
          submissionData: {},
          idempotencyKey: "draft-boundary",
        },
      ),
    ).rejects.toThrow(/curriculum is not approved/i);
    expect(query).not.toHaveBeenCalled();
  });
});
