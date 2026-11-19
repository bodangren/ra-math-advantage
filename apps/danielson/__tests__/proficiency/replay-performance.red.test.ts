import { describe, expect, it } from "vitest";

import { replayTeacherEvidence } from "../../lib/proficiency/replay";
import {
  FIXED_NOW,
  SKILL_IDS,
  TEACHER_ID,
  createFixtureGraph,
  createRatedEvidence,
} from "./fixtures";

describe("teacher evidence replay capacity", () => {
  it("replays 2,000 weekly events as one bounded operation", async () => {
    const start = Date.parse("2021-01-01T00:00:00.000Z");
    const evidence = Array.from({ length: 2_000 }, (_, index) =>
      createRatedEvidence({
        idempotencyKey: `weekly-${index}`,
        sourceRecordId: `observation_records:weekly-${index}`,
        sourceType: "walkthrough",
        formalObservationId: undefined,
        provenanceGroupId: `provenance:weekly-${index}`,
        targetSkillIds: [SKILL_IDS[1]],
        occurredAt: new Date(start + index * 7 * 86_400_000).toISOString(),
        rating: ((index % 4) + 1) as 1 | 2 | 3 | 4,
      }),
    );

    const replay = await replayTeacherEvidence({
      teacherId: TEACHER_ID,
      evidence,
      graph: createFixtureGraph(),
      now: FIXED_NOW,
    });
    expect(replay.commits).toHaveLength(2_000);
    expect(replay.state.observationOutcomes).toHaveLength(2_000);
  }, 15_000);
});
