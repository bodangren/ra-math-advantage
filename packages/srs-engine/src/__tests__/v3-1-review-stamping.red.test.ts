import { describe, expect, it } from "vitest";
import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core";

import { InMemoryCardStore, InMemoryReviewLogStore } from "../srs/adapters";
import type { SrsCardState, SrsReviewLogEntry, SrsReviewLogEntryV31 } from "../srs/contract";
import { createMockSrsCard, createMockSrsReviewLog } from "../srs/fixtures";
import { processReview } from "../srs/review-processor";
import { BUILTIN_FSRS_PARAMS_VERSION } from "../srs/scheduler";
import {
  InMemoryPracticeVariantResolver,
  SubmissionSrsAdapter,
} from "../srs/submission-srs-adapter";

const NOW = "2026-07-10T00:00:00.000Z";

function submission() {
  return {
    ...buildPracticeSubmissionEnvelope({
      activityId: "activity-stamped",
      mode: "independent_practice",
      submittedAt: NOW,
      answers: { q1: 4 },
    }),
    parts: [
      {
        partId: "q1",
        rawAnswer: 4,
        normalizedAnswer: "4",
        isCorrect: true,
        hintsUsed: 0,
        revealStepsSeen: 0,
        misconceptionTags: [],
      },
    ],
  };
}

class NullBaselineResolver {
  async getBaseline() {
    return null;
  }
}

class SplitCardStore extends InMemoryCardStore {
  savedCards: SrsCardState[] = [];

  override async saveCard(card: SrsCardState): Promise<void> {
    this.savedCards.push(structuredClone(card));
    await super.saveCard(card);
  }
}

class AtomicCardStore extends InMemoryCardStore {
  atomicSave?: { card: SrsCardState; reviewLog: SrsReviewLogEntryV31 };

  async saveCardAndReview(card: SrsCardState, reviewLog: SrsReviewLogEntryV31): Promise<void> {
    this.atomicSave = {
      card: structuredClone(card),
      reviewLog: structuredClone(reviewLog),
    };
    await super.saveCard(card);
  }
}

class CanonicalIdAtomicCardStore extends InMemoryCardStore {
  persisted?: { card: SrsCardState; reviewLog: SrsReviewLogEntryV31 };

  async saveCardAndReview(
    card: SrsCardState,
    reviewLog: SrsReviewLogEntryV31,
  ): Promise<{ cardId: string; reviewId: string }> {
    const cardId = "convex_card_canonical";
    const reviewId = "convex_review_canonical";
    const canonicalCard = { ...card, cardId };
    const canonicalReview = { ...reviewLog, cardId, reviewId };
    this.persisted = {
      card: structuredClone(canonicalCard),
      reviewLog: structuredClone(canonicalReview),
    };
    await super.saveCard(canonicalCard);
    return { cardId, reviewId };
  }
}

describe("v3.1 review parameter stamping", () => {
  it("makes every newly processed review a mandatory v3.1 stamped log", () => {
    const card = createMockSrsCard({ dueDate: NOW, createdAt: NOW, updatedAt: NOW });
    const result = processReview({ card, submission: submission(), now: NOW });
    const typed: SrsReviewLogEntryV31 = result.reviewLog;

    expect(typed.paramsVersion).toBe(BUILTIN_FSRS_PARAMS_VERSION);
  });

  it("uses the same trusted scheduler context for scheduling and the audit stamp", () => {
    const card = createMockSrsCard({
      state: "review",
      stability: 10,
      difficulty: 5,
      elapsedDays: 10,
      scheduledDays: 10,
      reps: 5,
      lastReview: "2026-06-30T00:00:00.000Z",
      dueDate: NOW,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-30T00:00:00.000Z",
    });
    const schedulerContext = {
      objectivePriority: "essential" as const,
      config: {
        requestRetention: 0.87,
        requestRetentionByPriority: { essential: 0.96 },
        maximumInterval: 30,
        enableShortTermPreview: false,
      },
    };
    const originalContext = structuredClone(schedulerContext);

    const result = processReview({
      card,
      submission: submission(),
      now: NOW,
      schedulerContext,
    });

    expect(result.reviewLog.paramsVersion).toBe(BUILTIN_FSRS_PARAMS_VERSION);
    expect(result.updatedCard.scheduledDays).toBeLessThanOrEqual(30);
    expect(card.reps).toBe(5);
    expect(schedulerContext).toEqual(originalContext);
  });

  it("keeps legacy unstamped stored rows readable next to stamped rows", async () => {
    const store = new InMemoryReviewLogStore();
    const legacy: SrsReviewLogEntry = createMockSrsReviewLog({
      reviewedAt: "2026-07-10T00:00:00.000Z",
      paramsVersion: undefined,
    });
    const current: SrsReviewLogEntryV31 = {
      ...createMockSrsReviewLog({ reviewedAt: "2026-07-11T00:00:00.000Z" }),
      paramsVersion: BUILTIN_FSRS_PARAMS_VERSION,
    };

    await store.saveReview(legacy);
    await store.saveReview(current);

    await expect(store.getReviewsByCard(legacy.cardId)).resolves.toEqual([legacy, current]);
  });

  it("takes priority, config, and version only from the trusted variant resolver", async () => {
    const cardStore = new SplitCardStore();
    const reviewLogStore = new InMemoryReviewLogStore();
    const resolver = new InMemoryPracticeVariantResolver();
    resolver.register("activity-stamped", {
      variantKey: "variant-stamped",
      objectiveId: "objective-stamped",
      schedulerContext: {
        objectivePriority: "essential",
        config: {
          requestRetention: 0.87,
          requestRetentionByPriority: { essential: 0.96 },
          maximumInterval: 365,
          enableShortTermPreview: false,
        },
      },
    });
    const adapter = new SubmissionSrsAdapter({
      cardStore,
      reviewLogStore,
      resolver,
      baselineResolver: new NullBaselineResolver(),
    });

    const hostileInput = {
      submission: submission(),
      studentId: "student-stamped",
      activityId: "activity-stamped",
      schedulerContext: {
        objectivePriority: "extension",
        paramsVersion: "attacker-controlled",
      },
    };
    const result = await adapter.processSubmission(hostileInput);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reviewLog.paramsVersion).toBe(BUILTIN_FSRS_PARAMS_VERSION);
    await expect(reviewLogStore.getReviewsByCard(result.card.cardId)).resolves.toEqual([
      result.reviewLog,
    ]);
  });

  it("preserves one identical stamp in the atomic card-and-review path", async () => {
    const cardStore = new AtomicCardStore();
    const reviewLogStore = new InMemoryReviewLogStore();
    const resolver = new InMemoryPracticeVariantResolver();
    resolver.register("activity-stamped", {
      variantKey: "variant-stamped",
      objectiveId: "objective-stamped",
      schedulerContext: {
        objectivePriority: "supporting",
      },
    });
    const adapter = new SubmissionSrsAdapter({
      cardStore,
      reviewLogStore,
      resolver,
      baselineResolver: new NullBaselineResolver(),
    });

    const result = await adapter.processSubmission({
      submission: submission(),
      studentId: "student-stamped",
      activityId: "activity-stamped",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(cardStore.atomicSave?.reviewLog.paramsVersion).toBe(result.reviewLog.paramsVersion);
    expect(cardStore.atomicSave?.reviewLog).toEqual(result.reviewLog);
    await expect(reviewLogStore.getReviewsByStudent("student-stamped")).resolves.toEqual([]);
  });

  it("returns canonical IDs assigned by an atomic persistence adapter", async () => {
    const cardStore = new CanonicalIdAtomicCardStore();
    const reviewLogStore = new InMemoryReviewLogStore();
    const resolver = new InMemoryPracticeVariantResolver();
    resolver.register("activity-stamped", {
      variantKey: "variant-stamped",
      objectiveId: "objective-stamped",
    });
    const adapter = new SubmissionSrsAdapter({
      cardStore,
      reviewLogStore,
      resolver,
      baselineResolver: new NullBaselineResolver(),
      requireAtomicPersistence: true,
    });

    const result = await adapter.processSubmission({
      submission: submission(),
      studentId: "student-stamped",
      activityId: "activity-stamped",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.card.cardId).toBe("convex_card_canonical");
    expect(result.reviewLog).toMatchObject({
      cardId: "convex_card_canonical",
      reviewId: "convex_review_canonical",
      paramsVersion: BUILTIN_FSRS_PARAMS_VERSION,
    });
    expect(cardStore.persisted).toEqual({
      card: result.card,
      reviewLog: result.reviewLog,
    });
  });

  it("fails closed before a split write when atomic persistence is required", async () => {
    const cardStore = new SplitCardStore();
    const reviewLogStore = new InMemoryReviewLogStore();
    const resolver = new InMemoryPracticeVariantResolver();
    resolver.register("activity-stamped", {
      variantKey: "variant-stamped",
      objectiveId: "objective-stamped",
    });
    const adapter = new SubmissionSrsAdapter({
      cardStore,
      reviewLogStore,
      resolver,
      baselineResolver: new NullBaselineResolver(),
      requireAtomicPersistence: true,
    });

    const result = await adapter.processSubmission({
      submission: submission(),
      studentId: "student-stamped",
      activityId: "activity-stamped",
    });

    expect(result).toMatchObject({
      ok: false,
      skipped: false,
      error: expect.stringMatching(/atomic persistence/i),
    });
    expect(cardStore.savedCards).toHaveLength(0);
    await expect(reviewLogStore.getReviewsByStudent("student-stamped")).resolves.toEqual([]);
  });

  it("fails before persistence when trusted scheduling values are invalid", async () => {
    const cardStore = new SplitCardStore();
    const reviewLogStore = new InMemoryReviewLogStore();
    const resolver = new InMemoryPracticeVariantResolver();
    resolver.register("activity-stamped", {
      variantKey: "variant-stamped",
      objectiveId: "objective-stamped",
      schedulerContext: {
        objectivePriority: "essential",
        config: { requestRetention: 2 },
      },
    });
    const adapter = new SubmissionSrsAdapter({
      cardStore,
      reviewLogStore,
      resolver,
      baselineResolver: new NullBaselineResolver(),
    });

    const result = await adapter.processSubmission({
      submission: submission(),
      studentId: "student-stamped",
      activityId: "activity-stamped",
    });

    expect(result).toMatchObject({ ok: false, skipped: false });
    expect(cardStore.savedCards).toHaveLength(0);
    await expect(reviewLogStore.getReviewsByStudent("student-stamped")).resolves.toEqual([]);
  });
});
