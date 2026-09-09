// @vitest-environment jsdom
import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Id } from "@/convex/_generated/dataModel";
import { createServerOwnedSubmissionHandler } from "@/convex/activities";
import { seedLesson1 } from "@/convex/seed/seed_lesson_1_1";
import { getLessonProgress, completePhase } from "@/convex/student";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { submitIm3PublishedEvidenceHandler } from "@/convex/learningEvidence";
import { IM3_MASTERY_ADVANTAGE_ACTIVITY_ID, IM3_PILOT_NODE, IM3_TEACHER_LED_ACTIVITY_ID } from "@/lib/practice/learning-evidence-pilot";


const { createServerOwnedActivitySubmission, graphNode, graphBlueprint } = vi.hoisted(() => ({
  createServerOwnedActivitySubmission: vi.fn(),
  graphNode: { id: "math.im3.skill.1.1.graph-quadratic-functions", kind: "skill", reviewStatus: "approved" },
  graphBlueprint: { nodeId: "math.im3.skill.1.1.graph-quadratic-functions", reviewStatus: "approved" },
}));
vi.mock("@/lib/activities/submission", () => ({
  createServerOwnedActivitySubmission,
  getSelectedWorkedAcknowledgement: vi.fn().mockResolvedValue(false),
  submitActivity: vi.fn(),
}));
vi.mock("@/components/textbook/LessonPageLayout", () => ({ LessonPageLayout: ({ children }: { children: ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/lesson/LessonStepper", () => ({ LessonStepper: () => null }));
vi.mock("@/components/student/LessonChatbot", () => ({ LessonChatbot: () => null }));
vi.mock("@/components/lesson/PhaseCompleteButton", () => ({ PhaseCompleteButton: ({ disabled }: { disabled: boolean }) => <button disabled={disabled}>Mark complete</button> }));
vi.mock("@/curriculum/skill-graph/nodes.json", () => ({ default: { nodes: [graphNode] } }));
vi.mock("@/curriculum/skill-graph/blueprints.json", () => ({ default: { blueprints: [graphBlueprint] } }));

function memoryContext() {
  const rows: Record<string, Array<Record<string, any>>> = {};
  let nextId = 1;
  const table = (name: string) => (rows[name] ??= []);
  const db = {
    async get(first: string, second?: string) { const id = second ?? first; return Object.values(rows).flat().find((row) => row._id === id) ?? null; },
    normalizeId: (name: string, id: string) => id.startsWith(`${name}:`) ? id : null,
    query(name: string) {
      return { withIndex(_index: string, configure: (query: { eq(field: string, value: unknown): unknown }) => unknown) {
        const conditions = new Map<string, unknown>();
        const query = { eq(field: string, value: unknown) { conditions.set(field, value); return query; } };
        configure(query);
        const selected = () => table(name).filter((row) => [...conditions].every(([field, value]) => row[field] === value));
        return {
          unique: async () => { const matches = selected(); if (matches.length > 1) throw new Error("Non-unique test query"); return matches[0] ?? null; },
          first: async () => selected()[0] ?? null, collect: async () => selected(), take: async (count: number) => selected().slice(0, count),
          order: (_direction: string) => ({ first: async () => selected().at(-1) ?? null }),
        };
      } };
    },
    async insert(name: string, document: Record<string, unknown>) { const id = `${name}:${nextId++}`; table(name).push({ _id: id, ...document }); return id; },
    async patch(id: string, update: Record<string, unknown>) { const row = Object.values(rows).flat().find((candidate) => candidate._id === id); if (!row) throw new Error(`Missing row ${id}`); Object.assign(row, update); },
  };
  return { ctx: { db, scheduler: { runAfter: async () => undefined } }, rows, table };
}

async function seededFixture() {
  const store = memoryContext();
  const seed = seedLesson1 as unknown as { _handler(ctx: unknown): Promise<unknown> };
  await seed._handler(store.ctx);
  const studentId = "profiles:student";
  store.table("profiles").push({ _id: studentId, username: "student", role: "student", organizationId: "org" });
  store.table("auth_credentials").push({ _id: "credential:1", profileId: studentId, username: "student", role: "student", organizationId: "org", isActive: true });
  const worked = store.table("activities").find((row) => row.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID)!;
  worked.approval = { status: "approved" };
  return { ...store, studentId, worked };
}

const progressHandler = (getLessonProgress as unknown as { _handler(ctx: unknown, args: unknown): Promise<any> })._handler;
const completionHandler = (completePhase as unknown as { _handler(ctx: unknown, args: unknown): Promise<any> })._handler;
const completionArgs = (studentId: string) => ({ userId: studentId, lessonId: "module-1-lesson-1", phaseNumber: 4, timeSpent: 60, idempotencyKey: "complete-phase-4" });

describe("selected Worked lesson consumer", () => {
  beforeEach(() => {
    graphNode.reviewStatus = "approved";
    graphBlueprint.reviewStatus = "approved";
    createServerOwnedActivitySubmission.mockReset();
  });

  it("passes the seeded query projection to the real LessonRenderer acknowledgement client", async () => {
    const { ctx, table, studentId, worked } = await seededFixture();
    for (const phase of table("phase_versions").filter((row) => row.phaseNumber < 4)) {
      table("student_progress").push({ _id: `progress:${phase.phaseNumber}`, userId: studentId, phaseId: phase._id, status: "completed", startedAt: 1, completedAt: 2, timeSpentSeconds: 1 });
    }
    const phase4 = table("phase_versions").find((row) => row.phaseNumber === 4)!;
    table("student_progress").push({ _id: "progress:4", userId: studentId, phaseId: phase4._id, status: "in_progress", startedAt: 3, completedAt: null, timeSpentSeconds: 0 });
    const result = await progressHandler(ctx, { userId: studentId, lessonIdentifier: "module-1-lesson-1" });
    createServerOwnedActivitySubmission.mockResolvedValue({ success: true });
    render(<LessonRenderer lessonId="module-1-lesson-1" lessonTitle={result.lessonTitle} moduleLabel="Module 1" lessonNumber={result.lessonNumber} phases={result.phases} />);
    expect(await screen.findByRole("heading", { name: "Step 1: Analyze the function" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Step 2: Graph the function" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /check/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("heading", { name: "Step 2: Graph the function" }));
    expect(screen.getByRole("button", { name: "I reviewed this worked example" })).toBeInTheDocument();
    expect(createServerOwnedActivitySubmission).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));
    await waitFor(() => expect(createServerOwnedActivitySubmission).toHaveBeenCalledTimes(1));
    expect(createServerOwnedActivitySubmission).toHaveBeenCalledWith(expect.objectContaining({
      activityId: worked._id,
      mode: "worked_example",
      answers: {},
      parts: [],
      idempotencyKey: `worked-example:${worked._id}`,
    }));
  });

  it("projects the exact selected activity from the real seeded section", async () => {
    const { ctx, studentId, worked } = await seededFixture();
    const result = await progressHandler(ctx, { userId: studentId, lessonIdentifier: "module-1-lesson-1" });
    const phase = result.phases.find((candidate: any) => candidate.phaseNumber === 4);
    const section = phase.sections.find((candidate: any) => candidate.sectionType === "activity");
    expect(section.content).toMatchObject({ activityId: worked._id, componentKey: "graphing-explorer", stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID, masteryNodeId: IM3_PILOT_NODE, learningEvidenceMode: "worked_example", srsEligible: false, activityProps: { variant: "plot_from_equation", equation: "f(x) = x^2" } });
  });

  it("uses the verified activity component when stored section metadata is stale", async () => {
    const { ctx, table, studentId } = await seededFixture();
    const section = table("phase_sections").find((candidate) => (
      candidate.sectionType === "activity"
      && candidate.content.activityId
      && table("activities").some((activity) => activity._id === candidate.content.activityId
        && activity.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID)
    ));
    expect(section).toBeDefined();
    if (!section) throw new Error("Selected Worked section was not seeded");
    section.content.componentKey = "step-by-step-solver";
    const result = await progressHandler(ctx, { userId: studentId, lessonIdentifier: "module-1-lesson-1" });
    const phase = result.phases.find((candidate: any) => candidate.phaseNumber === 4);
    const projected = phase.sections.find((candidate: any) => candidate.content.activityId === section.content.activityId);
    expect(projected.content.componentKey).toBe("graphing-explorer");
  });

  it.each([
    ["missing physical activity", (table: (name: string) => Array<Record<string, any>>, worked: Record<string, any>) => {
      const activities = table("activities");
      activities.splice(activities.indexOf(worked), 1);
    }],
    ["changed physical stable ID", (_table: (name: string) => Array<Record<string, any>>, worked: Record<string, any>) => {
      worked.stableActivityId = "stale.other.activity";
    }],
  ])("makes the normal selected source unavailable for %s", async (_label, change) => {
    const { ctx, table, studentId, worked } = await seededFixture();
    change(table, worked);
    for (const phase of table("phase_versions").filter((row) => row.phaseNumber < 4)) {
      table("student_progress").push({ _id: `progress:${phase.phaseNumber}`, userId: studentId, phaseId: phase._id, status: "completed", startedAt: 1, completedAt: 2, timeSpentSeconds: 1 });
    }
    const phase4 = table("phase_versions").find((row) => row.phaseNumber === 4)!;
    table("student_progress").push({ _id: "progress:4", userId: studentId, phaseId: phase4._id, status: "in_progress", startedAt: 3, completedAt: null, timeSpentSeconds: 0 });
    const result = await progressHandler(ctx, { userId: studentId, lessonIdentifier: "module-1-lesson-1" });
    const selectedSection = result.phases.find((candidate: any) => candidate.phaseNumber === 4).sections.find((candidate: any) => candidate.sequenceOrder === 2);
    expect(selectedSection.content).toEqual({ activityId: worked._id, componentKey: "unavailable" });
    render(<LessonRenderer lessonId="module-1-lesson-1" lessonTitle={result.lessonTitle} moduleLabel="Module 1" lessonNumber={result.lessonNumber} phases={result.phases} />);
    expect(screen.getByText("This activity is not available.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Graph the Function" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /submit/i })).not.toBeInTheDocument();
    expect(createServerOwnedActivitySubmission).not.toHaveBeenCalled();
  });

  it("removes cached selected identity when physical approval is withdrawn", async () => {
    const { ctx, table, studentId, worked } = await seededFixture();
    const section = table("phase_sections").find((candidate) => candidate.content.activityId === worked._id)!;
    Object.assign(section.content, { stableActivityId: "stale.other.activity", masteryNodeId: IM3_PILOT_NODE, learningEvidenceMode: "worked_example", srsEligible: false, activityProps: worked.props });
    worked.approval = { status: "draft" };
    for (const phase of table("phase_versions").filter((row) => row.phaseNumber < 4)) {
      table("student_progress").push({ _id: `progress:${phase.phaseNumber}`, userId: studentId, phaseId: phase._id, status: "completed", startedAt: 1, completedAt: 2, timeSpentSeconds: 1 });
    }
    const phase4 = table("phase_versions").find((row) => row.phaseNumber === 4)!;
    table("student_progress").push({ _id: "progress:4", userId: studentId, phaseId: phase4._id, status: "in_progress", startedAt: 3, completedAt: null, timeSpentSeconds: 0 });
    const result = await progressHandler(ctx, { userId: studentId, lessonIdentifier: "module-1-lesson-1" });
    const projected = result.phases.find((candidate: any) => candidate.phaseNumber === 4).sections.find((candidate: any) => candidate.content.activityId === worked._id);
    expect(projected.content).toMatchObject({ componentKey: "unavailable", activityId: worked._id });
    expect(projected.content).not.toHaveProperty("stableActivityId");
    render(<LessonRenderer lessonId="module-1-lesson-1" lessonTitle={result.lessonTitle} moduleLabel="Module 1" lessonNumber={result.lessonNumber} phases={result.phases} />);
    expect(screen.getByText("This activity is not available.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Graph the Function" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /submit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "I reviewed this worked example" })).not.toBeInTheDocument();
    expect(createServerOwnedActivitySubmission).not.toHaveBeenCalled();
  });

  it("makes the normal seeded source unavailable when graph publication is withdrawn", async () => {
    const { ctx, table, studentId, worked } = await seededFixture();
    graphBlueprint.reviewStatus = "draft";
    for (const phase of table("phase_versions").filter((row) => row.phaseNumber < 4)) {
      table("student_progress").push({ _id: `progress:${phase.phaseNumber}`, userId: studentId, phaseId: phase._id, status: "completed", startedAt: 1, completedAt: 2, timeSpentSeconds: 1 });
    }
    const phase4 = table("phase_versions").find((row) => row.phaseNumber === 4)!;
    table("student_progress").push({ _id: "progress:4", userId: studentId, phaseId: phase4._id, status: "in_progress", startedAt: 3, completedAt: null, timeSpentSeconds: 0 });
    const result = await progressHandler(ctx, { userId: studentId, lessonIdentifier: "module-1-lesson-1" });
    const progressCount = table("student_progress").length;
    await expect(completionHandler(ctx, completionArgs(studentId))).rejects.toThrow("Selected Worked acknowledgement is required");
    expect(table("student_progress")).toHaveLength(progressCount);
    expect(table("student_progress").find((row) => row.phaseId === phase4._id)).toMatchObject({ status: "in_progress" });
    const projected = result.phases.find((candidate: any) => candidate.phaseNumber === 4).sections.find((candidate: any) => candidate.content.activityId === worked._id);
    expect(projected.content).toEqual({ activityId: worked._id, componentKey: "unavailable" });
    render(<LessonRenderer lessonId="module-1-lesson-1" lessonTitle={result.lessonTitle} moduleLabel="Module 1" lessonNumber={result.lessonNumber} phases={result.phases} />);
    expect(screen.getByText("This activity is not available.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /submit/i })).not.toBeInTheDocument();
    expect(createServerOwnedActivitySubmission).not.toHaveBeenCalled();
  });

  it("rejects direct phase completion without the exact acknowledgement and has no effects", async () => {
    const { ctx, rows, studentId } = await seededFixture();
    await expect(completionHandler(ctx, completionArgs(studentId))).rejects.toThrow("Selected Worked acknowledgement is required");
    expect(rows.student_progress ?? []).toHaveLength(0);
    expect(rows.learning_evidence ?? []).toHaveLength(0);
    expect(rows.srs_cards ?? []).toHaveLength(0);
    expect(rows.srs_review_log ?? []).toHaveLength(0);
  });

  it("completes after the real acknowledgement without creating teacher or SRS evidence", async () => {
    const { ctx, rows, studentId, worked } = await seededFixture();
    await createServerOwnedSubmissionHandler(ctx as never, { userId: studentId as Id<"profiles">, activityId: worked._id, idempotencyKey: `worked-example:${worked._id}`, submissionData: { contractVersion: "practice.v1", activityId: worked._id, mode: "worked_example", status: "submitted", attemptNumber: 1, submittedAt: "2026-09-08T00:00:00.000Z", answers: {}, parts: [] } } as never);
    await expect(completionHandler(ctx, completionArgs(studentId))).resolves.toMatchObject({ success: true });
    expect(rows.student_progress).toHaveLength(1);
    expect(rows.learning_evidence ?? []).toHaveLength(0);
    expect(rows.srs_cards ?? []).toHaveLength(0);
    expect(rows.srs_review_log ?? []).toHaveLength(0);
  });

  it("replays a completed phase after source withdrawal without new effects", async () => {
    const { ctx, rows, studentId, worked } = await seededFixture();
    await createServerOwnedSubmissionHandler(ctx as never, { userId: studentId as Id<"profiles">, activityId: worked._id, idempotencyKey: `worked-example:${worked._id}`, submissionData: { contractVersion: "practice.v1", activityId: worked._id, mode: "worked_example", status: "submitted", attemptNumber: 1, submittedAt: "2026-09-08T00:00:00.000Z", answers: {}, parts: [] } } as never);
    await completionHandler(ctx, completionArgs(studentId));
    const before = { progress: rows.student_progress.length, submissions: rows.activity_submissions.length, evidence: (rows.learning_evidence ?? []).length };
    worked.approval = { status: "draft" };
    await expect(completionHandler(ctx, completionArgs(studentId))).resolves.toEqual({ success: true, alreadyCompleted: true });
    expect({ progress: rows.student_progress.length, submissions: rows.activity_submissions.length, evidence: (rows.learning_evidence ?? []).length }).toEqual(before);
  });

  it("keeps later Independent evidence awaiting teacher exposure after phase completion", async () => {
    const { ctx, rows, table, studentId, worked } = await seededFixture();
    await createServerOwnedSubmissionHandler(ctx as never, { userId: studentId as Id<"profiles">, activityId: worked._id, idempotencyKey: `worked-example:${worked._id}`, submissionData: { contractVersion: "practice.v1", activityId: worked._id, mode: "worked_example", status: "submitted", attemptNumber: 1, submittedAt: "2026-09-08T00:00:00.000Z", answers: {}, parts: [] } } as never);
    await completionHandler(ctx, completionArgs(studentId));
    const independent = table("activities").find((row) => row.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID)!;
    independent.approval = { status: "approved" };
    independent.srsEligible = true;
    const points = [{ x: -2, y: -5 }, { x: -1, y: -2 }, { x: 0, y: -1 }, { x: 1, y: -2 }, { x: 2, y: -5 }];
    const stored = await createServerOwnedSubmissionHandler(ctx as never, { userId: studentId, activityId: independent._id, idempotencyKey: "independent-after-worked", submissionData: { contractVersion: "practice.v1", activityId: independent._id, mode: "independent_practice", status: "submitted", attemptNumber: 1, submittedAt: "2026-09-08T00:01:00.000Z", answers: { table_values: points, placed_points: points }, parts: [{ partId: "table_values", rawAnswer: points }, { partId: "placed_points", rawAnswer: points }] } } as never);
    const evidence = await submitIm3PublishedEvidenceHandler(ctx as never, { learnerId: studentId, submissionId: stored.submissionId } as never, { nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }], blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }] });
    expect(evidence).toMatchObject({ persisted: false, masteryApplied: false, decision: { exposureState: "awaiting_teacher_exposure", reason: "awaiting_teacher_exposure" } });
    expect(rows.learning_evidence ?? []).toHaveLength(0);
    expect(rows.srs_cards ?? []).toHaveLength(0);
    expect(rows.srs_review_log ?? []).toHaveLength(0);
  });

});
