import { describe, expect, it } from "vitest";

import {
  applyObservationAmendment,
  observationAmendmentFingerprint,
  projectEffectiveObservation,
} from "../../lib/observations/amendments";
import {
  resolveObservationIdempotency,
  submitObservationDraft,
} from "../../lib/observations/lifecycle";
import { OBSERVATION_NOW_MS, walkthroughDraft } from "./fixtures";

function submittedRecord() {
  const draft = walkthroughDraft({
    items: walkthroughDraft().items.map((item, index) => ({
      ...item,
      outcome: index === 0 ? { kind: "rated", rating: 2 } : { kind: "not_enough_evidence" },
      evidenceNote: index === 0 ? "Original note." : null,
    })),
  });
  const result = submitObservationDraft(draft, {
    submissionKey: "submission-to-amend",
    now: OBSERVATION_NOW_MS,
  });
  if (result.kind !== "submitted") throw new Error("Expected submitted observation");
  return result.record;
}

describe("observation amendments", () => {
  it("preserves the original bytes and overlays only existing item fields", () => {
    const original = submittedRecord();
    const originalBytes = JSON.stringify(original);
    const result = applyObservationAmendment({
      original,
      priorAmendments: [],
      command: {
        idempotencyKey: "amendment-1",
        expectedVersion: 0,
        authorAccountId: "accounts:amender",
        reason: "Correct the recorded rating.",
        changedItems: [
          {
            itemId: "item-a",
            outcome: { kind: "rated", rating: 4 },
            evidenceNote: "Corrected note.",
          },
        ],
      },
      now: OBSERVATION_NOW_MS + 10_000,
    });

    expect(JSON.stringify(original)).toBe(originalBytes);
    expect(result).toMatchObject({ kind: "amended", amendment: { version: 1 } });
    if (result.kind !== "amended") throw new Error("Expected an amendment");
    expect(projectEffectiveObservation(original, [result.amendment]).items[0]).toMatchObject({
      skillId: original.items[0].skillId,
      componentId: original.items[0].componentId,
      outcome: { kind: "rated", rating: 4 },
      evidenceNote: "Corrected note.",
    });
    expect(result.supersessions).toEqual([
      expect.objectContaining({
        supersededEvidenceKey: `submission-to-amend:skill:${original.items[0].skillId}`,
        replacementOutcome: { kind: "rated", rating: 4 },
      }),
    ]);
  });

  it("creates no scoring supersession for a note-only change", () => {
    const original = submittedRecord();
    const result = applyObservationAmendment({
      original,
      priorAmendments: [],
      command: {
        idempotencyKey: "note-only-amendment",
        expectedVersion: 0,
        authorAccountId: "accounts:amender",
        reason: "Clarify the evidence note.",
        changedItems: [{ itemId: "item-a", evidenceNote: "Clarified note." }],
      },
      now: OBSERVATION_NOW_MS + 10_000,
    });

    expect(result).toMatchObject({ kind: "amended", supersessions: [] });
  });

  it("supersedes rated evidence with no evidence and no evidence with rated evidence", () => {
    const original = submittedRecord();
    const result = applyObservationAmendment({
      original,
      priorAmendments: [],
      command: {
        idempotencyKey: "outcome-transitions",
        expectedVersion: 0,
        authorAccountId: "accounts:amender",
        reason: "Correct both outcomes.",
        changedItems: [
          { itemId: "item-a", outcome: { kind: "not_enough_evidence" } },
          { itemId: "item-b", outcome: { kind: "rated", rating: 3 } },
        ],
      },
      now: OBSERVATION_NOW_MS + 10_000,
    });

    expect(result).toMatchObject({ kind: "amended" });
    if (result.kind !== "amended") throw new Error("Expected an amendment");
    expect(result.supersessions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          supersededEvidenceKey: `submission-to-amend:skill:${original.items[0].skillId}`,
          replacementOutcome: { kind: "not_enough_evidence" },
        }),
        expect.objectContaining({
          supersededEvidenceKey: `submission-to-amend:skill:${original.items[1].skillId}`,
          replacementOutcome: { kind: "rated", rating: 3 },
        }),
      ]),
    );
  });

  it("returns the first amendment receipt for equal normalized content and conflicts on change", () => {
    const command = {
      idempotencyKey: "amendment-replay",
      expectedVersion: 0,
      authorAccountId: "accounts:amender",
      reason: "Correct two items.",
      changedItems: [
        { itemId: "item-a", outcome: { kind: "rated", rating: 4 } },
        { itemId: "item-b", evidenceNote: "Clarified." },
      ],
    };
    const fingerprint = observationAmendmentFingerprint(command);
    const receipt = { amendmentId: "observation_amendments:one", version: 1 };
    const existing = { key: command.idempotencyKey, fingerprint, receipt };

    expect(
      observationAmendmentFingerprint({
        ...command,
        changedItems: [...command.changedItems].reverse(),
      }),
    ).toBe(fingerprint);
    expect(
      resolveObservationIdempotency(existing, {
        key: command.idempotencyKey,
        fingerprint,
      }),
    ).toEqual({ kind: "replayed", receipt });
    expect(
      resolveObservationIdempotency(existing, {
        key: command.idempotencyKey,
        fingerprint: observationAmendmentFingerprint({ ...command, reason: "Changed reason." }),
      }),
    ).toEqual({ kind: "idempotency_conflict" });
  });

  it("rejects stale versions, empty reasons, target changes, and changed replays", () => {
    const original = submittedRecord();
    const base = {
      original,
      priorAmendments: [],
      now: OBSERVATION_NOW_MS + 10_000,
    };
    expect(
      applyObservationAmendment({
        ...base,
        command: {
          idempotencyKey: "stale",
          expectedVersion: 1,
          authorAccountId: "accounts:amender",
          reason: "Correction.",
          changedItems: [],
        },
      }),
    ).toEqual({ kind: "version_conflict", latestVersion: 0 });
    expect(
      applyObservationAmendment({
        ...base,
        command: {
          idempotencyKey: "no-reason",
          expectedVersion: 0,
          authorAccountId: "accounts:amender",
          reason: " ",
          changedItems: [],
        },
      }),
    ).toEqual({ kind: "invalid_reason" });
    expect(() =>
      applyObservationAmendment({
        ...base,
        command: {
          idempotencyKey: "changed-target",
          expectedVersion: 0,
          authorAccountId: "accounts:amender",
          reason: "Correction.",
          changedItems: [{ itemId: "unknown-item", evidenceNote: "No." }],
        },
      }),
    ).toThrow(/item/i);
  });
});
