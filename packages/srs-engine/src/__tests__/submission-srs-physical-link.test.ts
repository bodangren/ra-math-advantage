import { describe, expect, it } from "vitest";
import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core";

import { InMemorySubmissionSrsAdapter } from "../srs/submission-srs-adapter";

describe("submission SRS physical linkage", () => {
  it("uses the caller timestamp and physical submission ID for the stored transition", async () => {
    const adapter = new InMemorySubmissionSrsAdapter();
    adapter.getResolver().register("activity-1", {
      variantKey: "variant-1",
      objectiveId: "objective-1",
    });
    const now = "2026-09-07T10:11:12.000Z";
    const submissionId = "submission_physical_123";
    const submission = {
      ...buildPracticeSubmissionEnvelope({
        activityId: "activity-1",
        mode: "independent_practice",
        answers: { q1: 4 },
      }),
      parts: [
        {
          partId: "q1",
          rawAnswer: 4,
          isCorrect: true,
          hintsUsed: 0,
          revealStepsSeen: 0,
        },
      ],
    };

    const result = await adapter.processSubmission({
      submission,
      studentId: "student-1",
      activityId: "activity-1",
      now,
      submissionId,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.card).toMatchObject({
      createdAt: now,
      updatedAt: now,
    });
    expect(result.reviewLog).toMatchObject({
      reviewedAt: now,
      submissionId,
    });
    await expect(
      adapter.getCardStore().getCardByStudentAndVariant("student-1", "variant-1"),
    ).resolves.toEqual(result.card);
    await expect(adapter.getReviewLogStore().getReviewsByStudent("student-1")).resolves.toEqual([
      result.reviewLog,
    ]);
  });
});
