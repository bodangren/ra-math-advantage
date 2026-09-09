import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { database, invoke } from "../../helpers/database";
import { nodeId } from "@/lib/practice/perpendicular-bisector";
const state = vi.hoisted(() => ({ ctx: null as any }));
vi.mock("@/lib/auth/server", () => ({
  requireTeacherSessionClaims: vi.fn(async () => ({
    sub: "profiles:1",
    role: "teacher",
  })),
  requireRequestSessionClaims: vi.fn(async () => ({
    sub: "profiles:1",
    role: "teacher",
  })),
}));
vi.mock("@/lib/convex/server", async () => {
  const teacher = await import("@/convex/teacher");
  const activities = await import("@/convex/activities");
  return {
    internal: {
      teacher: { getStudentEvidence: teacher.getStudentEvidence },
      activities: {
        recordTeacherPerpendicularBisectorExposure:
          activities.recordTeacherPerpendicularBisectorExposure,
      },
    },
    fetchInternalQuery: vi.fn((fn, args) => invoke(fn, state.ctx, args)),
    fetchInternalMutation: vi.fn((fn, args) => {
      if (fn !== activities.recordTeacherPerpendicularBisectorExposure)
        throw new Error("Unexpected mutation route");
      return activities.recordTeacherExposureHandler(state.ctx, args, {
        nodes: [
          {
            id: "math.im2.skill.1.1.perpendicular-bisector-equidistance",
            kind: "skill",
            reviewStatus: "approved",
            independentPracticeReady: true,
          },
          {
            id: "math.im2.skill.1.4.order-triangle-angles-from-side-lengths",
            kind: "skill",
            reviewStatus: "approved",
            independentPracticeReady: true,
          },
        ],
        blueprints: [
          {
            nodeId: "math.im2.skill.1.1.perpendicular-bisector-equidistance",
            reviewStatus: "approved",
            metadata: { independentPracticeReady: true },
          },
          {
            nodeId: "math.im2.skill.1.4.order-triangle-angles-from-side-lengths",
            reviewStatus: "approved",
            metadata: { independentPracticeReady: true },
          },
        ],
      });
    }),
  };
});
import * as activities from "@/convex/activities";
import { submitBoundedPracticeHandler, submitPilotHandler, submitTriangleHandler } from "@/convex/activities";
import { triangleNodeIds } from "@/lib/practice/triangle-ordering";
import Page from "@/app/teacher/students/[id]/page";
import { POST } from "@/app/api/teacher/perpendicular-bisector-exposure/route";
const approved = {
  nodes: [
    {
      id: nodeId,
      kind: "skill",
      reviewStatus: "approved",
      independentPracticeReady: true,
    },
  ],
  blueprints: [
    {
      nodeId,
      reviewStatus: "approved",
      metadata: { independentPracticeReady: true },
    },
  ],
};
async function setup() {
  const m = database();
  state.ctx = m.ctx;
  const teacherId = await m.db.insert("profiles", {
    role: "teacher",
    organizationId: "school",
    username: "teacher",
  });
  const studentId = await m.db.insert("profiles", {
    role: "student",
    organizationId: "school",
    username: "student",
    displayName: "Ada Student",
  });
  await m.db.insert("auth_credentials", {
    profileId: teacherId,
    role: "teacher",
    organizationId: "school",
    username: "teacher",
    isActive: true,
  });
  await m.db.insert("auth_credentials", {
    profileId: studentId,
    role: "student",
    organizationId: "school",
    username: "student",
    isActive: true,
  });
  const classId = await m.db.insert("classes", { teacherId, archived: false });
  await m.db.insert("class_enrollments", {
    classId,
    studentId,
    status: "active",
    enrolledAt: 10,
  });
  const lessonId = await m.db.insert("lessons", { slug: "module-1-lesson-1" });
  await m.db.insert("class_lessons", { classId, lessonId, assignedAt: 20 });
  const activityId = await m.db.insert("activities", {
    stableActivityId: `${nodeId}.guided_practice`,
    masteryNodeId: nodeId,
    learningEvidenceMode: "guided_practice",
    componentKey: "im2-question",
    generatorSeed: 60,
    generatorDifficulty: 1,
    srsEligible: false,
    approval: { status: "approved" },
    displayName: "Perpendicular bisector guided practice",
  });
  const result = await submitPilotHandler(
    m.ctx as never,
    {
      userId: studentId,
      activityId,
      idempotencyKey: "guided-source",
      rawResponse: "4",
      hintsUsed: 0,
      revealStepsSeen: 0,
    } as never,
    approved,
  );
  return {
    ...m,
    teacherId,
    studentId,
    classId,
    activityId,
    submissionId: result.submissionId,
  };
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("composes the real teacher page, route, and exposure handler with loss recovery", async () => {
  const t = await setup();
  vi.spyOn(activities, "isPilotPublished").mockReturnValue(true);
  vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
    "12345678-1234-4123-8123-123456789012",
  );
  const keys: string[] = [];
  let lose = true;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const key = new Headers(init.headers).get("Idempotency-Key")!;
      keys.push(key);
      const response = await POST(
        new Request(
          "http://localhost/api/teacher/perpendicular-bisector-exposure",
          init,
        ),
      );
      if (lose) {
        lose = false;
        throw new Error("result lost");
      }
      return response;
    }),
  );
  render(
    await Page({
      params: Promise.resolve({ id: t.studentId }),
      searchParams: Promise.resolve({ classId: t.classId }),
    }),
  );
  expect(screen.getByText("Answer: 4")).toBeInTheDocument();
  expect(
    screen.getAllByRole("button", { name: "Confirm teacher exposure" }),
  ).toHaveLength(1);
  fireEvent.click(
    screen.getByRole("button", { name: "Confirm teacher exposure" }),
  );
  expect(
    await screen.findByText("Teacher exposure was not recorded."),
  ).toBeInTheDocument();
  expect(
    screen.queryByText("Teacher exposure recorded."),
  ).not.toBeInTheDocument();
  expect(t.tables.learning_evidence).toHaveLength(1);
  await screen.findByRole("button", { name: "Confirm teacher exposure" });
  fireEvent.click(
    screen.getByRole("button", { name: "Confirm teacher exposure" }),
  );
  expect(
    await screen.findByText("Teacher exposure recorded."),
  ).toBeInTheDocument();
  expect(keys).toEqual([keys[0], keys[0]]);
  expect(t.tables.learning_evidence).toHaveLength(1);
});
it("shows the raw answer but no action for malformed source metadata", async () => {
  const t = await setup();
  vi.spyOn(activities, "isPilotPublished").mockReturnValue(true);
  await t.db.patch(t.activityId, { componentKey: "wrong-component" });
  render(
    await Page({
      params: Promise.resolve({ id: t.studentId }),
      searchParams: Promise.resolve({ classId: t.classId }),
    }),
  );
  expect(screen.getByText("Answer: 4")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Confirm teacher exposure" }),
  ).not.toBeInTheDocument();
});

it("uses the real teacher page and route before eligible triangle Independent evidence", async () => {
  const m = database();
  state.ctx = m.ctx;
  const teacherId = await m.db.insert("profiles", { role: "teacher", organizationId: "school", username: "teacher" });
  const studentId = await m.db.insert("profiles", { role: "student", organizationId: "school", username: "student", displayName: "Ada Triangle" });
  await m.db.insert("auth_credentials", { profileId: teacherId, role: "teacher", organizationId: "school", username: "teacher", isActive: true });
  await m.db.insert("auth_credentials", { profileId: studentId, role: "student", organizationId: "school", username: "student", isActive: true });
  const classId = await m.db.insert("classes", { teacherId, archived: false });
  await m.db.insert("class_enrollments", { classId, studentId, status: "active", enrolledAt: 0 });
  const lessonId = await m.db.insert("lessons", { slug: "module-1-lesson-4" });
  await m.db.insert("class_lessons", { classId, lessonId, assignedAt: 0 });
  const node = triangleNodeIds.angles;
  const workedId = await m.db.insert("activities", { stableActivityId: `${node}.worked_example`, masteryNodeId: node, learningEvidenceMode: "worked_example", componentKey: "im2-question", generatorSeed: 6, generatorDifficulty: 1, approval: { status: "approved" } });
  const guidedId = await m.db.insert("activities", { stableActivityId: `${node}.guided_practice`, masteryNodeId: node, learningEvidenceMode: "guided_practice", componentKey: "im2-question", generatorSeed: 8, generatorDifficulty: 1, approval: { status: "approved" } });
  const independentId = await m.db.insert("activities", { stableActivityId: `${node}.independent_practice`, masteryNodeId: node, learningEvidenceMode: "independent_practice", componentKey: "im2-question", generatorSeed: 11, generatorDifficulty: 1, srsEligible: true, approval: { status: "approved" } });
  const publication = { nodes: [{ id: node, kind: "skill", reviewStatus: "approved", independentPracticeReady: true }], blueprints: [{ nodeId: node, reviewStatus: "approved", metadata: { independentPracticeReady: true } }] };
  await submitBoundedPracticeHandler(m.ctx, { userId: studentId, activityId: workedId, idempotencyKey: "worked", answers: {}, hintsUsed: 0, revealStepsSeen: 0 } as never, publication);
  await submitTriangleHandler(m.ctx, { userId: studentId, activityId: guidedId, idempotencyKey: "g1", answers: { measure_order: "choice-1" }, hintsUsed: 0, revealStepsSeen: 0 } as never, publication);
  await submitTriangleHandler(m.ctx, { userId: studentId, activityId: guidedId, idempotencyKey: "g2", answers: { measure_order: "choice-1", opposite_correspondence: "choice-1" }, hintsUsed: 0, revealStepsSeen: 0 } as never, publication);
  const source = await submitTriangleHandler(m.ctx, { userId: studentId, activityId: guidedId, idempotencyKey: "g3", answers: { measure_order: "choice-1", opposite_correspondence: "choice-1", final_order: "choice-1" }, hintsUsed: 0, revealStepsSeen: 0 } as never, publication);
  await submitTriangleHandler(m.ctx, { userId: studentId, activityId: independentId, idempotencyKey: "independent-wrong", answers: { final_order: "choice-2" }, hintsUsed: 0, revealStepsSeen: 0 } as never, publication);
  vi.spyOn(activities, "trianglePublished").mockReturnValue(true);
  vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("12345678-1234-4123-8123-123456789012");
  const keys: string[] = [];
  let lose = true;
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
    keys.push(new Headers(init.headers).get("Idempotency-Key")!);
    const response = await POST(new Request("http://localhost/api/teacher/perpendicular-bisector-exposure", init));
    if (lose) { lose = false; throw new Error("result lost"); }
    return response;
  }));
  render(await Page({ params: Promise.resolve({ id: studentId }), searchParams: Promise.resolve({ classId }) }));
  expect(screen.getAllByRole("button", { name: "Confirm teacher exposure" })).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Confirm teacher exposure" }));
  await screen.findByText("Teacher exposure was not recorded.");
  fireEvent.click(screen.getByRole("button", { name: "Confirm teacher exposure" }));
  await screen.findByText("Teacher exposure recorded.");
  expect(keys).toEqual([keys[0], keys[0]]);
  expect(m.tables.learning_evidence.filter((row) => row.origin === "teacher_led")).toHaveLength(1);
  expect(m.tables.learning_evidence[0].submissionId).toBe(source.submissionId);
  const independent = await submitTriangleHandler(m.ctx, { userId: studentId, activityId: independentId, idempotencyKey: "independent-correct", answers: { final_order: "choice-1" }, hintsUsed: 0, revealStepsSeen: 0 } as never, publication);
  expect(independent).toMatchObject({ complete: true, evidencePersisted: true });
  expect(m.tables.learning_evidence.filter((row) => row.masteryBearing)).toHaveLength(1);
  expect(m.tables.srs_cards).toHaveLength(1);
  expect(m.tables.srs_review_log).toHaveLength(1);
  expect(Date.parse(String(m.tables.learning_evidence[0].occurredAt))).toBeLessThanOrEqual(Date.parse(String(m.tables.learning_evidence[1].occurredAt)));
});
