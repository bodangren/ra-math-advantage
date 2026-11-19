import { describe, expect, it } from "vitest";

import { buildIm3StoredEvidence } from "@/convex/learningEvidence";
import {
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
  IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
} from "@/lib/practice/learning-evidence-pilot";

describe("IM3 domain-range Worked trust boundary", () => {
  it("does not convert a student acknowledgement into teacher evidence", () => {
    const submittedAt = Date.UTC(2026, 8, 7, 8, 0, 0);

    const result = buildIm3StoredEvidence(
      {
        submissionId: "submission:domain-range-worked",
        userId: "student:1",
        activityId: "activity:domain-range-worked",
        activity: {
          stableActivityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
          masteryNodeId: IM3_DOMAIN_RANGE_NODE,
          componentKey: "graphing-explorer",
          learningEvidenceMode: "worked_example",
          srsEligible: false,
        },
        masteryContractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        attemptOrdinal: 1,
        submittedAt,
        submissionData: {
          contractVersion: "practice.v1",
          activityId: "activity:domain-range-worked",
          attemptNumber: 1,
          mode: "worked_example",
          status: "submitted",
          submittedAt: new Date(submittedAt).toISOString(),
          answers: {},
          parts: [],
        },
      },
      "student:1",
      "submission:domain-range-worked",
    );

    expect(result).toBeNull();
  });
});
