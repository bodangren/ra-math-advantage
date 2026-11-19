import { describe, expect, it } from "vitest";

import {
  discardObservationDraft,
  observationSubmissionFingerprint,
  resolveObservationIdempotency,
  saveObservationDraft,
  submitObservationDraft,
} from "../../lib/observations/lifecycle";
import { OBSERVATION_NOW_MS, walkthroughDraft } from "./fixtures";

describe("observation draft lifecycle", () => {
  it("saves only outcomes and evidence notes and enforces the draft revision", () => {
    const draft = walkthroughDraft();
    const saved = saveObservationDraft(draft, {
      expectedRevision: 1,
      now: OBSERVATION_NOW_MS + 1_000,
      items: [
        {
          itemId: "item-a",
          outcome: { kind: "rated", rating: 3 },
          evidenceNote: "Students used the routine.",
        },
        { itemId: "item-b", outcome: { kind: "not_enough_evidence" }, evidenceNote: null },
        { itemId: "item-c", outcome: { kind: "rated", rating: 2 }, evidenceNote: "" },
      ],
    });

    expect(saved).toMatchObject({ kind: "saved", draft: { status: "draft", revision: 2 } });
    if (saved.kind !== "saved") throw new Error("Expected a saved draft");
    expect(saved.draft).toMatchObject({
      teacherProfileId: draft.teacherProfileId,
      observerAccountId: draft.observerAccountId,
      observationType: draft.observationType,
      schoolYear: draft.schoolYear,
    });
    expect(saved.draft.items[0]).toMatchObject({
      skillId: draft.items[0].skillId,
      componentId: draft.items[0].componentId,
      priorityReason: draft.items[0].priorityReason,
      evidenceNote: "Students used the routine.",
    });
    expect(
      saveObservationDraft(saved.draft, {
        expectedRevision: 1,
        now: OBSERVATION_NOW_MS + 2_000,
        items: [],
      }),
    ).toEqual({ kind: "revision_conflict" });
  });

  it("submits all completed items and publishes them at the same server time", () => {
    const draft = walkthroughDraft({
      items: walkthroughDraft().items.map((item, index) => ({
        ...item,
        outcome: index === 0 ? { kind: "rated", rating: 4 } : { kind: "not_enough_evidence" },
        evidenceNote: index === 0 ? "Clear evidence." : null,
      })),
    });
    const before = structuredClone(draft);
    const result = submitObservationDraft(draft, {
      submissionKey: "submit-walkthrough-1",
      now: OBSERVATION_NOW_MS + 5_000,
    });

    expect(result).toMatchObject({
      kind: "submitted",
      receipt: {
        submissionKey: "submit-walkthrough-1",
        submittedAt: OBSERVATION_NOW_MS + 5_000,
        publishedAt: OBSERVATION_NOW_MS + 5_000,
      },
      record: { status: "submitted" },
    });
    if (result.kind !== "submitted") throw new Error("Expected a submitted record");
    expect(result.record.items[0]).toMatchObject({
      outcome: { kind: "rated", rating: 4 },
      evidenceNote: "Clear evidence.",
    });
    expect(result.record.observedAt).toBe(draft.observedAt);
    expect(draft).toEqual(before);
  });

  it("uses the observed event time for evidence instead of the later submission time", async () => {
    const { buildObservationEvidenceCommands } =
      await import("../../lib/observations/evidence-adapter");
    const draft = walkthroughDraft({
      observedAt: "2026-09-15T07:45:00.000Z",
      items: walkthroughDraft().items.map((item) => ({
        ...item,
        outcome: { kind: "rated", rating: 3 },
      })),
    });
    const result = submitObservationDraft(draft, {
      submissionKey: "submit-with-event-time",
      now: OBSERVATION_NOW_MS + 30_000,
    });
    if (result.kind !== "submitted") throw new Error("Expected a submitted record");

    expect(result.record.submittedAt).toBe(OBSERVATION_NOW_MS + 30_000);
    expect(
      buildObservationEvidenceCommands(result.record).map((command) => command.eventTime),
    ).toEqual([draft.observedAt, draft.observedAt, draft.observedAt]);
  });

  it("returns the first receipt for an equal retry and rejects changed content with the same key", () => {
    const receipt = { observationId: "observations:one", publishedAt: OBSERVATION_NOW_MS };
    const existing = { key: "submission-key", fingerprint: "same-content", receipt };

    expect(
      resolveObservationIdempotency(existing, {
        key: "submission-key",
        fingerprint: "same-content",
      }),
    ).toEqual({ kind: "replayed", receipt });
    expect(
      resolveObservationIdempotency(existing, {
        key: "submission-key",
        fingerprint: "changed-content",
      }),
    ).toEqual({ kind: "idempotency_conflict" });
  });

  it("creates one stable fingerprint from normalized submission content", () => {
    const draft = walkthroughDraft({
      items: walkthroughDraft().items.map((item) => ({
        ...item,
        outcome: { kind: "rated", rating: 3 },
      })),
    });
    const first = observationSubmissionFingerprint(draft, "submission-key");
    const reordered = observationSubmissionFingerprint(
      {
        ...draft,
        items: [...draft.items].reverse(),
      },
      "submission-key",
    );
    const changed = observationSubmissionFingerprint(
      {
        ...draft,
        items: draft.items.map((item, index) =>
          index === 0 ? { ...item, evidenceNote: "Changed note." } : item,
        ),
      },
      "submission-key",
    );

    expect(reordered).toBe(first);
    expect(changed).not.toBe(first);
  });

  it("rejects an incomplete submission and requires confirmed, current-revision discard", () => {
    const draft = walkthroughDraft();
    expect(
      submitObservationDraft(draft, {
        submissionKey: "submit-incomplete",
        now: OBSERVATION_NOW_MS,
      }),
    ).toEqual({ kind: "incomplete_items", itemIds: ["item-a", "item-b", "item-c"] });
    expect(discardObservationDraft(draft, { expectedRevision: 0, confirmed: true })).toEqual({
      kind: "revision_conflict",
    });
    expect(discardObservationDraft(draft, { expectedRevision: 1, confirmed: false })).toEqual({
      kind: "confirmation_required",
    });
    expect(discardObservationDraft(draft, { expectedRevision: 1, confirmed: true })).toEqual({
      kind: "discarded",
      draftId: draft.draftId,
    });
  });

  it("records an all-not-enough-evidence visit without scoring commands", async () => {
    const { buildObservationEvidenceCommands } =
      await import("../../lib/observations/evidence-adapter");
    const draft = walkthroughDraft({
      items: walkthroughDraft().items.map((item) => ({
        ...item,
        outcome: { kind: "not_enough_evidence" },
      })),
    });
    const result = submitObservationDraft(draft, {
      submissionKey: "submit-no-evidence",
      now: OBSERVATION_NOW_MS,
    });
    if (result.kind !== "submitted") throw new Error("Expected a submitted record");
    const commands = buildObservationEvidenceCommands(result.record);

    expect(result.record.status).toBe("submitted");
    expect(commands).toHaveLength(3);
    expect(commands.every((command) => command.outcome.kind === "not_enough_evidence")).toBe(true);
    expect(commands.every((command) => command.scoringEffect === false)).toBe(true);
  });
});

it("rejects publication of future observed evidence", () => {
  const draft = walkthroughDraft({
    observedAt: new Date(OBSERVATION_NOW_MS + 60_000).toISOString(),
    items: walkthroughDraft().items.map((item) => ({
      ...item,
      outcome: { kind: "rated", rating: 3 },
    })),
  });
  expect(
    submitObservationDraft(draft, { submissionKey: "future", now: OBSERVATION_NOW_MS }),
  ).toEqual({ kind: "future_observed_at" });
});
