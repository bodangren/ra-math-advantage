import { describe, expect, it } from "vitest";
import { nodeId, generatePerpendicularBisector } from "@/lib/practice/perpendicular-bisector";
import { getApprovedPilotHandler, recordTeacherExposureHandler, submitPilotHandler } from "@/convex/activities";

const approved = { nodes: [{ id: nodeId, kind: "skill", reviewStatus: "approved", independentPracticeReady: true }], blueprints: [{ nodeId, reviewStatus: "approved", metadata: { independentPracticeReady: true } }] };
function runtime(mode = "independent_practice") {
  const activityId = "activity", userId = "student";
  const tables: Record<string, Array<Record<string, any>>> = { profiles: [{ _id: userId, role: "student", organizationId: "school" }], auth_credentials: [{ _id: "credential", profileId: userId, role: "student", organizationId: "school", isActive: true }], activities: [{ _id: activityId, stableActivityId: `${nodeId}.${mode}`, masteryNodeId: nodeId, learningEvidenceMode: mode, componentKey: "im2-question", generatorSeed: 303, generatorDifficulty: 1, srsEligible: mode === "independent_practice", approval: { status: "approved" } }], activity_submissions: [], learning_evidence: [], srs_cards: [], srs_review_log: [], classes: [], class_enrollments: [], lessons: [{ _id: "lesson", slug: "module-1-lesson-1" }], class_lessons: [] };
  let sequence = 0;
  const db = { get: async (id: string) => Object.values(tables).flat().find(row => row._id === id) ?? null, query: (table: string) => { let selected = [...tables[table]]; const q = { eq(field: string, value: unknown) { selected = selected.filter(row => row[field] === value); return q; } }; const result = { collect: async () => selected, unique: async () => { if (selected.length > 1) throw new Error("Non-unique query"); return selected[0] ?? null; }, first: async () => selected[0] ?? null, order(direction: string) { if (direction === "desc") selected.reverse(); return result; } }; return { collect: async () => { if (table === "learning_evidence") throw new Error("Evidence history must use a scoped index"); return selected; }, withIndex(_name: string, select: (value: typeof q) => unknown) { select(q); return result; } }; }, patch: async (id: string, value: Record<string, unknown>) => { const row = Object.values(tables).flat().find(item => item._id === id); if (row) Object.assign(row, value); }, insert: async (table: string, value: Record<string, unknown>) => { const id = `${table}-${++sequence}`; tables[table].push({ _id: id, ...value }); return id; } };
  return { ctx: { db }, tables, args: { userId, activityId, idempotencyKey: "key", rawResponse: String(generatePerpendicularBisector({ nodeId, seed: 303, difficulty: 1 }).expectedAnswer.response), hintsUsed: 0, revealStepsSeen: 0 } };
}
describe("IM2 perpendicular-bisector pilot", () => {
  it("preserves the perpendicular-bisector node identity", () => {
    expect(nodeId).toBe("math.im2.skill.1.1.perpendicular-bisector-equidistance");
  });
  it("records an authorized exact-source teacher exposure once", async () => {
    const t = runtime("guided_practice");
    t.tables.profiles.push({ _id: "teacher", role: "teacher", organizationId: "school" }, { _id: "other", role: "teacher", organizationId: "school" });
    t.tables.auth_credentials.push({ _id: "teacher-credential", profileId: "teacher", role: "teacher", organizationId: "school", isActive: true });
    t.tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    t.tables.class_enrollments.push({ _id: "enrollment", classId: "class", studentId: "student", status: "active", enrolledAt: 0 });
    t.tables.class_lessons.push({ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 0 });
    t.tables.activity_submissions.push({ _id: "source", userId: "student", activityId: "activity", lessonId: "lesson", attemptOrdinal: 1, gradedAt: 1, submittedAt: 1 });
    t.tables.learning_evidence.push({ _id: "guided-history", learnerId: "student", nodeId: nodeId, submissionId: "source", activityId: "guided", attemptOrdinal: 1, origin: "mastery_advantage", mode: "guided_practice", occurredAt: "2026-01-01T00:00:00.000Z", idempotencyKey: "guided" });
    const input = { teacherId: "teacher", studentId: "student", classId: "class", submissionId: "source", idempotencyKey: "exposure" };
    const first = await recordTeacherExposureHandler(t.ctx as never, input as never, approved);
    expect(await recordTeacherExposureHandler(t.ctx as never, input as never, approved)).toMatchObject({ evidenceId: first.evidenceId, replay: true });
    expect(t.tables.learning_evidence).toHaveLength(2);
    expect(t.tables.learning_evidence[1]).toMatchObject({ nodeId, activityId: `${nodeId}.guided_practice`, masteryBearing: false });
    await expect(recordTeacherExposureHandler(t.ctx as never, { ...input, teacherId: "other", idempotencyKey: "other" } as never, approved)).rejects.toThrow("unauthorized_exposure");
  });
  it.each(["teacher", "student"])("rejects new teacher evidence when the %s credential is disabled", async disabledRole => {
    const t = runtime("guided_practice");
    t.tables.profiles.push({ _id: "teacher", role: "teacher", organizationId: "school" });
    t.tables.auth_credentials.push({ _id: "teacher-credential", profileId: "teacher", role: "teacher", organizationId: "school", isActive: disabledRole !== "teacher" });
    t.tables.auth_credentials[0].isActive = disabledRole !== "student";
    t.tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    t.tables.class_enrollments.push({ _id: "enrollment", classId: "class", studentId: "student", status: "active", enrolledAt: 0 });
    t.tables.class_lessons.push({ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 0 });
    t.tables.activity_submissions.push({ _id: "source", userId: "student", activityId: "activity", lessonId: "lesson", attemptOrdinal: 1, gradedAt: 1, submittedAt: 1 });

    await expect(recordTeacherExposureHandler(t.ctx as never, {
      teacherId: "teacher", studentId: "student", classId: "class",
      submissionId: "source", idempotencyKey: "teacher",
    } as never, approved)).rejects.toThrow("unauthorized_exposure");
    expect(t.tables.learning_evidence).toEqual([]);
  });
  it("fails closed for the current draft curriculum", async () => {
    const t = runtime();
    await expect(submitPilotHandler(t.ctx as never, t.args as never)).rejects.toThrow("unpublished_curriculum");
    expect(await getApprovedPilotHandler(t.ctx as never)).toEqual([]);
  });
  it("rejects a student whose credential identity does not match the profile", async () => {
    const t = runtime();
    t.tables.auth_credentials[0].organizationId = "another-school";
    expect(await getApprovedPilotHandler(t.ctx as never, "student" as never, approved)).toEqual([]);
    await expect(submitPilotHandler(t.ctx as never, t.args as never, approved)).rejects.toThrow("inactive_student");
    expect(t.tables.activity_submissions).toEqual([]);
  });
  it("grades raw responses and writes one exact-node evidence row on replay", async () => {
    const t = runtime();
    t.tables.learning_evidence.push({ _id: "teacher-evidence", learnerId: "student", nodeId, submissionId: "teacher-submission", activityId: "teacher-activity", attemptOrdinal: 1, origin: "teacher_led", mode: "guided_practice", occurredAt: "2026-09-06T00:00:00.000Z", idempotencyKey: "teacher-key", createdAt: 1 });
    const first = await submitPilotHandler(t.ctx as never, t.args as never, approved);
    const replay = await submitPilotHandler(t.ctx as never, t.args as never, approved);
    expect(first).toMatchObject({ kind: "graded", score: 1, evidencePersisted: true });
    expect(replay).toEqual(first);
    expect(t.tables.activity_submissions).toHaveLength(1);
    expect(t.tables.learning_evidence).toHaveLength(2);
    expect(t.tables.learning_evidence[1]).toMatchObject({ learnerId: "student", nodeId, mode: "independent_practice" });
  });
  it("stores guided assistance without mastery evidence", async () => {
    const t = runtime("guided_practice");
    const result = await submitPilotHandler(t.ctx as never, { ...t.args, hintsUsed: 1 } as never, approved);
    expect(result.evidencePersisted).toBe(false);
    expect(t.tables.learning_evidence).toEqual([]);
  });
  it("rejects a conflicting retry", async () => {
    const t = runtime();
    await submitPilotHandler(t.ctx as never, t.args as never, approved);
    await expect(submitPilotHandler(t.ctx as never, { ...t.args, rawResponse: "99" } as never, approved)).rejects.toThrow("idempotency_conflict");
  });
  it("stores a wrong attempt before a corrected attempt and creates evidence only for the correction", async () => {
    const t = runtime();
    t.tables.learning_evidence.push({ _id: "teacher-evidence", learnerId: "student", nodeId, submissionId: "teacher-submission", activityId: "teacher-activity", attemptOrdinal: 1, origin: "teacher_led", mode: "guided_practice", occurredAt: "2026-09-06T00:00:00.000Z", idempotencyKey: "teacher-key", createdAt: 1 });
    const wrong = await submitPilotHandler(t.ctx as never, { ...t.args, rawResponse: "99", idempotencyKey: "wrong" } as never, approved);
    const right = await submitPilotHandler(t.ctx as never, { ...t.args, idempotencyKey: "right" } as never, approved);
    expect(wrong).toMatchObject({ score: 0, evidencePersisted: true });
    expect(right).toMatchObject({ score: 1, evidencePersisted: true });
    expect(t.tables.activity_submissions.map(row => row.attemptOrdinal)).toEqual([1, 2]);
    expect(t.tables.learning_evidence).toHaveLength(3);
  });
});


describe("IM2 real pilot evidence flow", () => {
  it.each(["guided_practice", "independent_practice"])("does not invent evidence on replay for %s", async mode => {
    const t = runtime(mode);
    const first = await submitPilotHandler(t.ctx as never, t.args as never, approved);
    expect(first.evidencePersisted).toBe(false);
    expect(t.tables.learning_evidence).toEqual([]);
    const replay = await submitPilotHandler(t.ctx as never, t.args as never, approved);
    expect(replay).toEqual(first);
    expect(t.tables.learning_evidence).toEqual([]);
    expect(t.tables.srs_review_log).toEqual([]);
  });

  it("uses actual writers and literal mathematics through teacher confirmation and SRS replay", async () => {
    const t = runtime("worked_example");
    t.tables.activities[0].generatorSeed = 60;
    t.tables.activities.push(...["guided_practice", "independent_practice"].map(mode => ({
      ...t.tables.activities[0], _id: mode, stableActivityId: `${nodeId}.${mode}`,
      learningEvidenceMode: mode, srsEligible: mode === "independent_practice",
    })));
    t.tables.profiles.push({ _id: "teacher", role: "teacher", organizationId: "school" });
    t.tables.auth_credentials.push({ _id: "teacher-credential", profileId: "teacher", role: "teacher", organizationId: "school", isActive: true });
    t.tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    t.tables.class_enrollments.push({ _id: "enrollment", classId: "class", studentId: "student", status: "active", enrolledAt: 0 });
    t.tables.class_lessons.push({ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 0 });
    const ackArgs = { ...t.args, rawResponse: "", idempotencyKey: "worked" };
    const ack = await submitPilotHandler(t.ctx as never, ackArgs as never, approved);
    expect(ack.kind).toBe("acknowledged");
    expect(t.tables.learning_evidence).toEqual([]);
    expect(await submitPilotHandler(t.ctx as never, ackArgs as never, approved)).toEqual(ack);
    // DA = 3x + 2, DB = 5x - 6. Equal distances give x = 4 and DA = DB = 14 cm.
    const guidedArgs = { ...t.args, activityId: "guided_practice", idempotencyKey: "guided", rawResponse: "4" };
    const guided = await submitPilotHandler(t.ctx as never, guidedArgs as never, approved);
    expect(guided).toMatchObject({ score: 1, maxScore: 1, evidencePersisted: false });
    const teacherArgs = { teacherId: "teacher", studentId: "student", classId: "class", submissionId: guided.submissionId, idempotencyKey: "teacher" };
    const teacher = await recordTeacherExposureHandler(t.ctx as never, teacherArgs as never, approved);
    expect(await recordTeacherExposureHandler(t.ctx as never, teacherArgs as never, approved)).toEqual({ ...teacher, replay: true });
    expect(await submitPilotHandler(t.ctx as never, guidedArgs as never, approved)).toEqual(guided);
    const independentArgs = { ...t.args, activityId: "independent_practice", idempotencyKey: "independent-wrong", rawResponse: "5" };
    const wrong = await submitPilotHandler(t.ctx as never, independentArgs as never, approved);
    expect(wrong).toMatchObject({ score: 0, maxScore: 1, evidencePersisted: true });
    expect(await submitPilotHandler(t.ctx as never, independentArgs as never, approved)).toEqual(wrong);
    await expect(submitPilotHandler(t.ctx as never, { ...independentArgs, rawResponse: "4" } as never, approved)).rejects.toThrow("idempotency_conflict");
    const correctArgs = { ...independentArgs, rawResponse: "4", idempotencyKey: "independent-correct" };
    const correct = await submitPilotHandler(t.ctx as never, correctArgs as never, approved);
    expect(correct).toMatchObject({ score: 1, maxScore: 1, evidencePersisted: true });
    expect(await submitPilotHandler(t.ctx as never, correctArgs as never, approved)).toEqual(correct);
    expect(t.tables.activity_submissions).toHaveLength(4);
    expect(t.tables.learning_evidence.map(row => row.origin)).toEqual(["teacher_led", "mastery_advantage", "mastery_advantage"]);
    expect(t.tables.srs_cards).toHaveLength(1);
    expect(t.tables.srs_cards[0]).toMatchObject({ studentId: "student", objectiveId: nodeId, reps: 2 });
    expect(t.tables.srs_review_log).toHaveLength(2);
  });

  it("keeps practice available until a correct Independent submission has accepted exact evidence", async () => {
    const t = runtime("worked_example");
    t.tables.activities[0].generatorSeed = 60;
    t.tables.activities.push(...["guided_practice", "independent_practice"].map(mode => ({
      ...t.tables.activities[0], _id: mode, stableActivityId: `${nodeId}.${mode}`,
      learningEvidenceMode: mode, srsEligible: mode === "independent_practice",
    })));

    const early = await submitPilotHandler(t.ctx as never, {
      ...t.args, activityId: "independent_practice", idempotencyKey: "early", rawResponse: "4",
    } as never, approved);
    expect(early).toMatchObject({ score: 1, evidencePersisted: false });
    t.tables.learning_evidence.push({
      _id: "malformed", learnerId: "student", submissionId: early.submissionId,
      nodeId: "wrong-node", activityId: `${nodeId}.independent_practice`, attemptOrdinal: 1,
      origin: "mastery_advantage", mode: "guided_practice", occurredAt: new Date().toISOString(),
      idempotencyKey: "malformed", masteryBearing: true, createdAt: 1,
    });
    expect(await getApprovedPilotHandler(t.ctx as never, "student" as never, approved)).toHaveLength(3);

    t.tables.profiles.push({ _id: "teacher", role: "teacher", organizationId: "school" });
    t.tables.auth_credentials.push({ _id: "teacher-credential", profileId: "teacher", role: "teacher", organizationId: "school", isActive: true });
    t.tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    t.tables.class_enrollments.push({ _id: "enrollment", classId: "class", studentId: "student", status: "active", enrolledAt: 0 });
    t.tables.class_lessons.push({ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 0 });
    const guided = await submitPilotHandler(t.ctx as never, {
      ...t.args, activityId: "guided_practice", idempotencyKey: "guided", rawResponse: "4",
    } as never, approved);
    await recordTeacherExposureHandler(t.ctx as never, {
      teacherId: "teacher", studentId: "student", classId: "class",
      submissionId: guided.submissionId, idempotencyKey: "teacher",
    } as never, approved);
    const accepted = await submitPilotHandler(t.ctx as never, {
      ...t.args, activityId: "independent_practice", idempotencyKey: "accepted", rawResponse: "4",
    } as never, approved);
    expect(accepted).toMatchObject({ score: 1, evidencePersisted: true });
    expect(await getApprovedPilotHandler(t.ctx as never, "student" as never, approved)).toEqual([]);
  });
});


describe("IM2 teacher source revalidation", () => {
  it.each(["organization", "component"])("rejects invalid %s state after an actual Guided submission", async invalid => {
    const t = runtime("guided_practice");
    t.tables.profiles[0].organizationId = "school";
    t.tables.profiles.push({ _id: "teacher", role: "teacher", organizationId: invalid === "organization" ? "another-school" : "school" });
    t.tables.auth_credentials.push({ _id: "teacher-credential", profileId: "teacher", role: "teacher", organizationId: invalid === "organization" ? "another-school" : "school", isActive: true });
    t.tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    t.tables.class_enrollments.push({ _id: "enrollment", classId: "class", studentId: "student", status: "active", enrolledAt: 0 });
    t.tables.class_lessons.push({ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 0 });
    const source = await submitPilotHandler(t.ctx as never, t.args as never, approved);
    if (invalid === "component") t.tables.activities[0].componentKey = "different-component";
    await expect(recordTeacherExposureHandler(t.ctx as never, { teacherId: "teacher", studentId: "student", classId: "class", submissionId: source.submissionId, idempotencyKey: "teacher" } as never, approved)).rejects.toThrow(invalid === "organization" ? "unauthorized_exposure" : "invalid_source_submission");
    expect(t.tables.learning_evidence).toEqual([]);
  });

  it("rejects publication withdrawal after an actual Guided submission", async () => {
    const t = runtime("guided_practice");
    t.tables.profiles.push({ _id: "teacher", role: "teacher", organizationId: "school" });
    t.tables.auth_credentials.push({ _id: "teacher-credential", profileId: "teacher", role: "teacher", organizationId: "school", isActive: true });
    t.tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    t.tables.class_enrollments.push({ _id: "enrollment", classId: "class", studentId: "student", status: "active", enrolledAt: 0 });
    t.tables.class_lessons.push({ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 0 });
    const source = await submitPilotHandler(t.ctx as never, t.args as never, approved);
    const withdrawn = { ...approved, blueprints: [{ ...approved.blueprints[0], reviewStatus: "draft" }] };
    await expect(recordTeacherExposureHandler(t.ctx as never, {
      teacherId: "teacher", studentId: "student", classId: "class",
      submissionId: source.submissionId, idempotencyKey: "teacher",
    } as never, withdrawn as never)).rejects.toThrow("unpublished_curriculum");
    expect(t.tables.learning_evidence).toEqual([]);
  });

  it("rejects teacher evidence for a Guided submission linked to another lesson", async () => {
    const t = runtime("guided_practice");
    t.tables.profiles.push({ _id: "teacher", role: "teacher", organizationId: "school" });
    t.tables.auth_credentials.push({ _id: "teacher-credential", profileId: "teacher", role: "teacher", organizationId: "school", isActive: true });
    t.tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    t.tables.class_enrollments.push({ _id: "enrollment", classId: "class", studentId: "student", status: "active", enrolledAt: 0 });
    t.tables.class_lessons.push({ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 0 });
    const source = await submitPilotHandler(t.ctx as never, t.args as never, approved);
    t.tables.activity_submissions[0].lessonId = "another-lesson";

    await expect(recordTeacherExposureHandler(t.ctx as never, {
      teacherId: "teacher", studentId: "student", classId: "class",
      submissionId: source.submissionId, idempotencyKey: "teacher",
    } as never, approved)).rejects.toThrow("invalid_source_assignment");
    expect(t.tables.learning_evidence).toEqual([]);
  });

  it.each([
    ["nodeId", "wrong-node"], ["activityId", "wrong-activity"], ["attemptOrdinal", 2],
    ["mode", "worked_example"], ["masteryBearing", true],
  ])("rejects a same-source replay with a noncanonical %s", async (field, value) => {
    const t = runtime("guided_practice");
    t.tables.profiles.push({ _id: "teacher", role: "teacher", organizationId: "school" });
    t.tables.auth_credentials.push({ _id: "teacher-credential", profileId: "teacher", role: "teacher", organizationId: "school", isActive: true });
    t.tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    t.tables.class_enrollments.push({ _id: "enrollment", classId: "class", studentId: "student", status: "active", enrolledAt: 0 });
    t.tables.class_lessons.push({ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 0 });
    const source = await submitPilotHandler(t.ctx as never, t.args as never, approved);
    t.tables.learning_evidence.push({
      _id: "bad-teacher", learnerId: "student", submissionId: source.submissionId,
      nodeId, activityId: `${nodeId}.guided_practice`, attemptOrdinal: 1,
      origin: "teacher_led", mode: "guided_practice", occurredAt: new Date().toISOString(),
      idempotencyKey: "teacher", masteryBearing: false, createdAt: 1, [field]: value,
    });
    await expect(recordTeacherExposureHandler(t.ctx as never, {
      teacherId: "teacher", studentId: "student", classId: "class",
      submissionId: source.submissionId, idempotencyKey: "teacher",
    } as never, approved)).rejects.toThrow("idempotency_conflict");
  });

  it("rejects a reused idempotency key before a valid same-source replay", async () => {
    const t = runtime("guided_practice");
    t.tables.profiles.push({ _id: "teacher", role: "teacher", organizationId: "school" });
    t.tables.auth_credentials.push({ _id: "teacher-credential", profileId: "teacher", role: "teacher", organizationId: "school", isActive: true });
    t.tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    t.tables.class_enrollments.push({ _id: "enrollment", classId: "class", studentId: "student", status: "active", enrolledAt: 0 });
    t.tables.class_lessons.push({ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 0 });
    const source = await submitPilotHandler(t.ctx as never, t.args as never, approved);
    t.tables.learning_evidence.push(
      { _id: "valid-teacher", learnerId: "student", submissionId: source.submissionId, nodeId, activityId: `${nodeId}.guided_practice`, attemptOrdinal: 1, origin: "teacher_led", mode: "guided_practice", occurredAt: new Date().toISOString(), idempotencyKey: "original", masteryBearing: false, createdAt: 1 },
      { _id: "other-source", learnerId: "student", submissionId: "another-submission", nodeId, activityId: `${nodeId}.guided_practice`, attemptOrdinal: 1, origin: "teacher_led", mode: "guided_practice", occurredAt: new Date().toISOString(), idempotencyKey: "reused", masteryBearing: false, createdAt: 1 },
    );
    await expect(recordTeacherExposureHandler(t.ctx as never, {
      teacherId: "teacher", studentId: "student", classId: "class",
      submissionId: source.submissionId, idempotencyKey: "reused",
    } as never, approved)).rejects.toThrow("idempotency_conflict");
  });
});
