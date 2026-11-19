import { describe, expect, it } from "vitest";

import { authorizeDanielsonAction } from "../../lib/foundation/authorization";
import { buildObservationEvidenceCommands } from "../../lib/observations/evidence-adapter";
import { submitObservationDraft } from "../../lib/observations/lifecycle";
import { getComponentSkillIds } from "../../lib/proficiency/graph";
import { createFixtureGraph } from "../proficiency/fixtures";
import {
  OBSERVATION_NOW_MS,
  OBSERVER_ACCOUNT_ID,
  ORGANIZATION_A,
  TEACHER_ACCOUNT_ID,
  formalDraft,
} from "./fixtures";

function access(role: "hod" | "coach" | "school_head" | "slt") {
  return {
    actor: {
      accountId: OBSERVER_ACCOUNT_ID,
      organizationId: ORGANIZATION_A,
      isActive: true,
      organizationIsActive: true,
    },
    subject: {
      accountId: TEACHER_ACCOUNT_ID,
      organizationId: ORGANIZATION_A,
      departmentIds: ["departments:math"],
      isActive: true,
    },
    roleAssignments: [
      {
        accountId: OBSERVER_ACCOUNT_ID,
        organizationId: ORGANIZATION_A,
        role,
        status: "active" as const,
      },
    ],
    hodDepartmentAssignments:
      role === "hod"
        ? [
            {
              accountId: OBSERVER_ACCOUNT_ID,
              organizationId: ORGANIZATION_A,
              departmentId: "departments:math",
              status: "active" as const,
            },
          ]
        : [],
    coachTeacherAssignments:
      role === "coach"
        ? [
            {
              accountId: OBSERVER_ACCOUNT_ID,
              organizationId: ORGANIZATION_A,
              teacherAccountId: TEACHER_ACCOUNT_ID,
              status: "active" as const,
            },
          ]
        : [],
  };
}

describe("formal observation contract", () => {
  it.each(["hod", "coach", "school_head", "slt"] as const)(
    "permits %s to submit Q1 in current scope",
    (role) => {
      expect(authorizeDanielsonAction(access(role), "q1_observation:submit")).toEqual({
        allowed: true,
        reason: null,
      });
    },
  );

  it("permits only a school head or SLT member to submit Q4", () => {
    expect(authorizeDanielsonAction(access("hod"), "q4_observation:submit")).toEqual({
      allowed: false,
      reason: "capability_not_granted",
    });
    expect(authorizeDanielsonAction(access("coach"), "q4_observation:submit")).toEqual({
      allowed: false,
      reason: "capability_not_granted",
    });
    expect(authorizeDanielsonAction(access("school_head"), "q4_observation:submit")).toEqual({
      allowed: true,
      reason: null,
    });
    expect(authorizeDanielsonAction(access("slt"), "q4_observation:submit")).toEqual({
      allowed: true,
      reason: null,
    });
  });

  it("keeps Q1 and Q4 as separate official records and builds their required evidence commands", () => {
    const q1 = submitObservationDraft(formalDraft("formal_q1"), {
      submissionKey: "formal-q1-2026",
      now: OBSERVATION_NOW_MS,
    });
    const q4 = submitObservationDraft(formalDraft("formal_q4"), {
      submissionKey: "formal-q4-2026",
      now: OBSERVATION_NOW_MS + 1,
    });
    if (q1.kind !== "submitted" || q4.kind !== "submitted") {
      throw new Error("Expected submitted formal records");
    }
    const q1Commands = buildObservationEvidenceCommands(q1.record);
    const q4Commands = buildObservationEvidenceCommands(q4.record);

    expect(q1.record.observationType).toBe("formal_q1");
    expect(q4.record.observationType).toBe("formal_q4");
    expect(q1.record.observationId).not.toBe(q4.record.observationId);
    expect(q1Commands).toEqual([
      expect.objectContaining({
        idempotencyKey: "formal-q1-2026:component:danielson.framework.component.1e",
        sourceType: "formal_q1",
        targetSkillIds: [],
        provenanceGroupId: expect.any(String),
      }),
    ]);
    expect(getComponentSkillIds(createFixtureGraph(), q1Commands[0].componentId)).toHaveLength(3);
    expect(q4Commands).toEqual([
      expect.objectContaining({
        idempotencyKey: "formal-q4-2026:component:danielson.framework.component.1e",
        sourceType: "formal_q4",
        targetSkillIds: [],
      }),
    ]);
  });
});
