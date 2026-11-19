import { expect, it } from "vitest";
import { createPrecalculusPilotRoute } from "@/app/api/learning-evidence/precalculus-pilot/route";

const independent = {
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

it.each([
  {
    ...independent,
    masteryApplied: false,
    decision: {
      idempotency: "conflict",
      exposureState: "awaiting_teacher_exposure",
      eligible: false,
      reason: "eligible",
      masteryBearing: false,
    },
  },
  {
    ...independent,
    masteryApplied: false,
    decision: { ...independent.decision, reason: "ungraded_evidence" },
  },
  { ...independent, masteryApplied: false },
  {
    ...independent,
    masteryApplied: false,
    decision: {
      idempotency: "new",
      exposureState: "awaiting_teacher_exposure",
      eligible: false,
      reason: "awaiting_teacher_exposure",
      masteryBearing: false,
    },
  },
  {
    ...independent,
    delivery: "replay",
    decision: { ...independent.decision, idempotency: "replay" },
  },
])("rejects an inconsistent selected receipt %j", async (result) => {
  const route = createPrecalculusPilotRoute({
    getServerSession: async () => ({ user: { id: "student", role: "student" } }),
    submitLearningEvidence: async () => result,
  });
  const response = await route.POST(
    new Request("http://local/api/learning-evidence/precalculus-pilot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ submissionId: "physical-submission" }),
    }),
  );
  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toEqual({ error: "Unable to record learning evidence" });
});
