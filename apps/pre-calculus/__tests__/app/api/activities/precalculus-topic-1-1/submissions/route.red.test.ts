import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), auth: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({ requireStudentRequestClaims: mocks.auth }));
vi.mock("@/curriculum/skill-graph/nodes.json", async (importOriginal) => {
  const original: any = await importOriginal();
  const value = structuredClone(original.default);
  value.nodes.find(
    (node: any) =>
      node.id === "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
  ).reviewStatus = "approved";
  return { default: value };
});
vi.mock("@/curriculum/skill-graph/blueprints.json", async (importOriginal) => {
  const original: any = await importOriginal();
  const value = structuredClone(original.default);
  value.blueprints.find(
    (blueprint: any) =>
      blueprint.nodeId ===
      "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
  ).reviewStatus = "approved";
  return { default: value };
});
vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mocks.fetch,
  internal: { activities: { createTopic11DailySubmission: "create" } },
}));

import {
  POST,
  createPrecalculusTopic11DailyRoute,
} from "@/app/api/activities/precalculus-topic-1-1/submissions/route";
import { createTopic11DailySubmission } from "@/convex/activities";

const handler = Reflect.get(createTopic11DailySubmission as object, "_handler") as (
  ctx: any,
  args: any,
) => Promise<any>;

const request = (body: unknown = {}, key = "key") =>
  new Request("http://x", {
    method: "POST",
    headers: { "content-type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(body),
  });
const receipt = {
  submissionId: "submission",
  attemptOrdinal: 1,
  submittedAt: "2026-09-07T00:00:00.000Z",
};

describe("Topic 1.1 student acknowledgement route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ sub: "student", role: "student" });
    mocks.fetch.mockResolvedValue(receipt);
  });

  it("stores the canonical six-field empty acknowledgement and preserves opaque key bytes", async () => {
    const response = await POST(request({}, "key  bytes"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(receipt);
    expect(mocks.fetch).toHaveBeenCalledWith("create", {
      userId: "student",
      activityId:
        "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.worked_example",
      idempotencyKey: "key  bytes",
      submissionData: {
        contractVersion: "practice.v1",
        activityId:
          "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.worked_example",
        mode: "worked_example",
        status: "submitted",
        answers: {},
        parts: [],
      },
    });
  });

  it.each(["", "   ", "x".repeat(257)])("rejects an empty or oversized key", async (key) => {
    expect((await POST(request({}, key))).status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("accepts a 256-character key", async () => {
    expect((await POST(request({}, "x".repeat(256)))).status).toBe(200);
  });

  it("preserves the exact bytes returned by headers.get", async () => {
    const createSourceSubmission = vi.fn().mockResolvedValue(receipt);
    const route = createPrecalculusTopic11DailyRoute({
      requireStudentSession: async () => ({ sub: "student", role: "student" }),
      createSourceSubmission,
    });
    const shaped = {
      headers: { get: () => " key " },
      json: async () => ({}),
    } as unknown as Request;
    expect((await route.POST(shaped)).status).toBe(200);
    expect(createSourceSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: " key " }),
    );
  });

  it.each([
    { origin: "teacher_led" },
    { increasingIntervals: "[0,3]" },
    { score: 1 },
    { parts: [{}] },
    null,
    [],
    1,
  ])("rejects client authority or answer fields", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON, an auth response, and a teacher session", async () => {
    const invalid = new Request("http://x", {
      method: "POST",
      headers: { "Idempotency-Key": "key" },
      body: "{",
    });
    expect((await POST(invalid)).status).toBe(400);
    mocks.auth.mockResolvedValueOnce(new Response(null, { status: 401 }));
    expect((await POST(request())).status).toBe(401);
    mocks.auth.mockResolvedValueOnce({ sub: "teacher", role: "teacher" });
    expect((await POST(request())).status).toBe(403);
  });

  it.each([
    { ...receipt, extra: true },
    { ...receipt, submissionId: "" },
    { ...receipt, attemptOrdinal: 0 },
    { ...receipt, attemptOrdinal: 1.5 },
    { ...receipt, submittedAt: "2026-09-07" },
  ])("rejects a malformed or noncanonical receipt without exposing it", async (value) => {
    mocks.fetch.mockResolvedValueOnce(value);
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Unable to record the Topic 1.1 daily submission",
    });
  });

  it.each([
    new Error("idempotency_conflict"),
    new Error("[CONVEX M(activities:create)] idempotency_conflict"),
  ])("maps direct and wrapped conflicts to 409", async (error) => {
    mocks.fetch.mockRejectedValueOnce(error);
    expect((await POST(request())).status).toBe(409);
  });

  it("passes the authenticated learner identity through the injected production contract", async () => {
    const createSourceSubmission = vi.fn().mockResolvedValue(receipt);
    const route = createPrecalculusTopic11DailyRoute({
      requireStudentSession: async () => ({ sub: "learner:real", role: "student" }),
      createSourceSubmission,
    });
    expect((await route.POST(request())).status).toBe(200);
    expect(createSourceSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "learner:real" }),
    );
  });

  it("routes to the real writer and replays one canonical ungraded acknowledgement", async () => {
    vi.spyOn(Date, "now").mockReturnValue(2);
    const rows: Record<string, any[]> = {
      profiles: [{ _id: "student", username: "student", role: "student", organizationId: "org" }],
      auth_credentials: [
        {
          _id: "credential",
          profileId: "student",
          username: "student",
          role: "student",
          organizationId: "org",
          isActive: true,
        },
      ],
      lessons: [{ _id: "lesson", unitNumber: 1, orderIndex: 1 }],
      lesson_versions: [
        { _id: "version", lessonId: "lesson", version: 1, status: "published", createdAt: 1 },
      ],
      phase_versions: [
        {
          _id: "phase",
          lessonVersionId: "version",
          phaseNumber: 4,
          phaseType: "worked_example",
          createdAt: 1,
        },
      ],
      phase_sections: [
        {
          _id: "section",
          phaseVersionId: "phase",
          sequenceOrder: 2,
          sectionType: "activity",
          createdAt: 1,
          content: {
            activityId: "physical",
            componentKey: "precalculus-topic-1-1-daily-curriculum",
          },
        },
      ],
      activities: [
        {
          _id: "physical",
          stableActivityId:
            "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.worked_example",
          componentKey: "precalculus-topic-1-1-daily-curriculum",
          displayName: "Topic 1.1: Identify Graph Intervals with Your Teacher",
          description:
            "Worked-example source activity for classifying increasing, decreasing, and constant intervals.",
          approval: { status: "approved", reviewedAt: 1 },
          createdAt: 1,
          props: {
            nodeId: "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
            mode: "worked_example",
            source: "teacher_led",
          },
          gradingConfig: { variantSeed: 0 },
        },
      ],
      activity_submissions: [],
      learning_evidence: [],
      learning_evidence_receipts: [],
      srs_cards: [],
      srs_review_log: [],
    };
    const db: any = {
      get: async (_table: string, id: string) =>
        Object.values(rows)
          .flat()
          .find((row: any) => row._id === id) ?? null,
      insert: async (table: string, value: any) => {
        const id = `${table}:${rows[table].length + 1}`;
        rows[table].push({ _id: id, ...value });
        return id;
      },
      query: (table: string) => {
        let values = [...rows[table]];
        const query: any = {
          eq(field: string, value: unknown) {
            values = values.filter((row) => row[field] === value);
            return query;
          },
        };
        const result: any = {
          unique: async () => {
            if (values.length > 1) throw new Error("duplicate");
            return values[0] ?? null;
          },
          collect: async () => values,
          first: async () => values[0] ?? null,
          order: () => result,
          take: async (n: number) => values.slice(0, n),
        };
        return {
          withIndex: (_name: string, apply: any) => {
            apply(query);
            return result;
          },
        };
      },
    };
    const route = createPrecalculusTopic11DailyRoute({
      requireStudentSession: async () => ({ sub: "student", role: "student" }),
      createSourceSubmission: (input) => handler({ db }, input),
    });
    const first = await route.POST(request({}, "real-key"));
    const firstReceipt = await first.json();
    expect(first.status).toBe(200);
    expect(firstReceipt).toEqual({
      submissionId: "activity_submissions:1",
      attemptOrdinal: 1,
      submittedAt: "1970-01-01T00:00:00.002Z",
    });
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.activity_submissions[0].submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId:
        "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.worked_example",
      mode: "worked_example",
      status: "submitted",
      answers: {},
      parts: [],
    });
    expect(rows.activity_submissions[0]).not.toMatchObject({
      score: expect.anything(),
      grade: expect.anything(),
    });
    expect(rows.learning_evidence).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const replay = await route.POST(request({}, "real-key"));
    expect(await replay.json()).toEqual(firstReceipt);
    expect(rows.activity_submissions).toHaveLength(1);

    rows.auth_credentials[0].isActive = false;
    expect((await route.POST(request({}, "inactive-key"))).status).toBe(500);
    rows.auth_credentials[0].isActive = true;
    rows.activities[0].approval.status = "needs_changes";
    expect((await route.POST(request({}, "withdrawn-key"))).status).toBe(500);
    rows.activities[0].approval.status = "approved";
    rows.activities[0].props = { ...rows.activities[0].props, source: "changed" };
    expect((await route.POST(request({}, "changed-key"))).status).toBe(500);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
  });
});
