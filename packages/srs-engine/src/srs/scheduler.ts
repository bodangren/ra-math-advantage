/**
 * SRS FSRS Scheduler Wrapper
 *
 * Wraps the `ts-fsrs` library with a clean interface for card scheduling.
 * Operates on `SrsCardState` from the SRS product contract.
 *
 * ## FSRS Algorithm Background
 *
 * FSRS (Free Spaced Repetition Scheduler) is a modern spaced repetition
 * algorithm that models memory stability and retrievability to optimize
 * review scheduling.
 */

import {
  fsrs,
  generatorParameters,
  Rating,
  type Card,
  type Grade,
} from 'ts-fsrs';
import type {
  ObjectivePriority,
  SrsCardId,
  SrsCardState,
  SrsRating,
} from './contract';
import {
  BUILTIN_FSRS_PARAMS_VERSION,
  normalizeSchedulerConfig,
  objectivePrioritySchema,
  paramsVersionSchema,
  resolveRequestedRetention,
} from './scheduler-policy-contract';
import {
  scheduleIntervalWithLoadBalancingV3_2,
} from './session-composition';
import type { IntervalLoadBalancingDecisionV3_2 } from './session-composition-contract';

export { BUILTIN_FSRS_PARAMS_VERSION } from './scheduler-policy-contract';

/**
 * Scheduler configuration parameters.
 */
export type SchedulerConfig = {
  /**
   * Target retention probability (0 < r <= 1).
   * Default: 0.9 (90%)
   */
  requestRetention: number;

  /**
   * Optional v3.1 per-priority retention targets. An absent map preserves the
   * scalar requestRetention behavior.
   */
  requestRetentionByPriority?: Partial<Record<ObjectivePriority, number>>;

  /**
   * Maximum interval in days.
   * Default: 365 (one school year)
   */
  maximumInterval: number;

  /**
   * Enable short-term preview mode.
   * Default: false
   */
  enableShortTermPreview: boolean;

  /** Optional future sibling-card reinforcement policy. */
  siblingReinforcement?: boolean;
};

/**
 * Default scheduler configuration optimized for educational content.
 */
export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  requestRetention: 0.9,
  maximumInterval: 365,
  enableShortTermPreview: false,
};

/** Trusted scheduling inputs resolved by server-side policy code. */
export type ReviewSchedulerContext = {
  objectivePriority?: ObjectivePriority;
  config?: Partial<SchedulerConfig>;
};

/** One scheduling decision and its inseparable audit provenance. */
export type ScheduledReview = {
  card: SrsCardState;
  requestedRetention: number;
  paramsVersion: string;
  loadBalancingDecision?: IntervalLoadBalancingDecisionV3_2;
};

export type ScheduleReviewInput = ReviewSchedulerContext & {
  card: SrsCardState;
  rating: SrsRating;
  now?: string;
  loadBalancing?: {
    readonly projectedDayLoads: readonly {
      readonly dayOffset: number;
      readonly load: number;
    }[];
  };
};

/**
 * Map our SrsRating enum to ts-fsrs Grade enum.
 */
export function mapSrsRatingToGrade(rating: SrsRating): Grade {
  switch (rating) {
    case 'Again':
      return Rating.Again;
    case 'Hard':
      return Rating.Hard;
    case 'Good':
      return Rating.Good;
    case 'Easy':
      return Rating.Easy;
  }
}

/**
 * Map ts-fsrs Grade enum back to our SrsRating.
 */
export function mapGradeToSrsRating(grade: Grade): SrsRating {
  switch (grade) {
    case Rating.Again:
      return 'Again';
    case Rating.Hard:
      return 'Hard';
    case Rating.Good:
      return 'Good';
    case Rating.Easy:
      return 'Easy';
    default:
      return 'Again';
  }
}

/**
 * Convert ts-fsrs internal Card to our SrsCardState.
 */
function mapFsrsCardToSrsCardState(
  fsrsCard: Card,
  metadata: {
    cardId: SrsCardId;
    studentId: string;
    objectiveId: string;
    variantKey: string;
  },
  now: string,
  previousLastReview: string | null,
): SrsCardState {
  return {
    cardId: metadata.cardId,
    studentId: metadata.studentId,
    objectiveId: metadata.objectiveId,
    variantKey: metadata.variantKey,
    stability: fsrsCard.stability,
    difficulty: fsrsCard.difficulty,
    state: mapCardState(fsrsCard.state),
    dueDate: fsrsCard.due.toISOString(),
    // ts-fsrs 6 removed Card.elapsed_days (v6 migration guide: derive elapsed time
    // from actual review timestamps). This keeps the ts-fsrs 5 semantics of the
    // review delta, the same derivation apps/bus-math-v2 uses in review-processor.ts.
    elapsedDays: previousLastReview
      ? Math.floor(
          (new Date(now).getTime() - new Date(previousLastReview).getTime()) / 86400000
        )
      : 0,
    scheduledDays: fsrsCard.scheduled_days,
    reps: fsrsCard.reps,
    lapses: fsrsCard.lapses,
    lastReview: fsrsCard.last_review?.toISOString() ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Map ts-fsrs state number to our card state string.
 */
function mapCardState(state: number): SrsCardState['state'] {
  switch (state) {
    case 0:
      return 'new';
    case 1:
      return 'learning';
    case 2:
      return 'review';
    case 3:
      return 'relearning';
    default:
      return 'new';
  }
}

/**
 * Create a new SRS card initialized with FSRS defaults.
 */
export function createCard(params: {
  studentId: string;
  objectiveId: string;
  variantKey?: string;
  now?: string;
  config?: Partial<SchedulerConfig>;
}): SrsCardState {
  const now = params.now ?? new Date().toISOString();
  const cardId = generateCardId();
  const variantKey = params.variantKey ?? params.objectiveId;

  return {
    cardId,
    studentId: params.studentId,
    objectiveId: params.objectiveId,
    variantKey,
    stability: 0,
    difficulty: 0,
    state: 'new',
    dueDate: now,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    lastReview: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Convert our internal card state to ts-fsrs Card format.
 */
function toFsrsCard(card: SrsCardState): Card {
  return {
    due: new Date(card.dueDate),
    stability: card.stability,
    difficulty: card.difficulty,
    // Card.elapsed_days was removed in ts-fsrs 6 (v6 migration guide); the
    // scheduler derives elapsed time from the review timestamps itself.
    scheduled_days: card.scheduledDays,
    learning_steps: 0,
    reps: card.reps,
    lapses: card.lapses,
    state: mapSrsStateToNumber(card.state),
    last_review: card.lastReview ? new Date(card.lastReview) : undefined,
  };
}

/**
 * Apply a review rating to a card and return the updated state.
 */
export function reviewCard(
  card: SrsCardState,
  rating: SrsRating,
  now?: string,
  config?: Partial<SchedulerConfig>,
  objectivePriority?: ObjectivePriority,
): SrsCardState {
  return scheduleReview({
    card,
    rating,
    now,
    config,
    objectivePriority,
  }).card;
}

/**
 * Apply one review and return the card together with the exact retention and
 * parameter-version decisions that produced it. Keeping these values in one
 * return object prevents a caller from independently reconstructing an audit
 * stamp that can drift from the actual scheduler inputs.
 */
export function scheduleReview(input: ScheduleReviewInput): ScheduledReview {
  const {
    card,
    rating,
    now,
    config,
    objectivePriority,
    loadBalancing,
  } = input;
  const currentTime = now ?? new Date().toISOString();
  const fullConfig = normalizeSchedulerConfig({
    ...DEFAULT_SCHEDULER_CONFIG,
    ...config,
  });
  const parsedPriority = objectivePriority === undefined
    ? undefined
    : objectivePrioritySchema.parse(objectivePriority);
  const requestedRetention = parsedPriority === undefined
    ? fullConfig.requestRetention
    : resolveRequestedRetention(fullConfig, parsedPriority);
  // Fitted releases currently have provenance references but no executable
  // weights bundle. Until that binding exists, claiming any fitted version
  // here would be false attribution, so scheduling is intentionally pinned to
  // the exact installed built-in parameter set.
  const parsedParamsVersion = paramsVersionSchema.parse(BUILTIN_FSRS_PARAMS_VERSION);

  const params = generatorParameters({
    request_retention: requestedRetention,
    maximum_interval: fullConfig.maximumInterval,
    enable_short_term: fullConfig.enableShortTermPreview,
  });

  const scheduler = fsrs(params);
  const fsrsCard = toFsrsCard(card);
  const grade = mapSrsRatingToGrade(rating);
  const result = scheduler.next(fsrsCard, currentTime, grade);

  const scheduledCard = mapFsrsCardToSrsCardState(
    result.card,
    {
      cardId: card.cardId,
      studentId: card.studentId,
      objectiveId: card.objectiveId,
      variantKey: card.variantKey,
    },
    currentTime,
    card.lastReview,
  );
  const updatedCard = scheduledCard.scheduledDays <= fullConfig.maximumInterval
    ? scheduledCard
    : {
        ...scheduledCard,
        scheduledDays: fullConfig.maximumInterval,
        dueDate: new Date(
          Date.parse(currentTime) + fullConfig.maximumInterval * 86_400_000,
        ).toISOString(),
      };

  let finalCard = updatedCard;
  let loadBalancingDecision: IntervalLoadBalancingDecisionV3_2 | undefined;
  if (loadBalancing && updatedCard.scheduledDays > 0) {
    const minimumDayOffset = Math.ceil(updatedCard.scheduledDays * 0.95);
    const maximumDayOffset = Math.max(
      minimumDayOffset,
      Math.min(fullConfig.maximumInterval, Math.floor(updatedCard.scheduledDays * 1.05)),
    );
    const projectedDayLoads = loadBalancing.projectedDayLoads.filter(
      (entry) =>
        entry.dayOffset >= minimumDayOffset && entry.dayOffset <= maximumDayOffset,
    );
    loadBalancingDecision = scheduleIntervalWithLoadBalancingV3_2({
      cardId: updatedCard.cardId,
      reps: updatedCard.reps,
      anchorDate: currentTime,
      baseIntervalDays: updatedCard.scheduledDays,
      maximumIntervalDays: fullConfig.maximumInterval,
      projectedDayLoads,
    });
    finalCard = {
      ...updatedCard,
      scheduledDays: loadBalancingDecision.selectedDayOffset,
      dueDate: loadBalancingDecision.selectedDueDate,
    };
  }

  return {
    card: finalCard,
    requestedRetention,
    paramsVersion: parsedParamsVersion,
    ...(loadBalancingDecision ? { loadBalancingDecision } : {}),
  };
}

/**
 * Filter cards to return only those with dueDate <= now.
 */
export function getDueCards(cards: SrsCardState[], now?: string): SrsCardState[] {
  const currentTime = now ?? new Date().toISOString();
  const nowMs = new Date(currentTime).getTime();

  return cards.filter((card) => {
    const dueMs = new Date(card.dueDate).getTime();
    return dueMs <= nowMs;
  });
}

/**
 * Preview the scheduled interval for a card without mutating its state.
 */
export function previewInterval(
  card: SrsCardState,
  rating: SrsRating,
  now?: string,
  config?: Partial<SchedulerConfig>,
  objectivePriority?: ObjectivePriority,
): number {
  return scheduleReview({
    card,
    rating,
    now,
    config,
    objectivePriority,
  }).card.scheduledDays;
}

/**
 * Map our state string to ts-fsrs state number. ts-fsrs 6 replaced the numeric
 * State enum with a frozen constant object and a numeric union type (v6 migration
 * guide), so the return type is the union, not plain `number`.
 */
function mapSrsStateToNumber(state: SrsCardState['state']): Card['state'] {
  switch (state) {
    case 'new':
      return 0;
    case 'learning':
      return 1;
    case 'review':
      return 2;
    case 'relearning':
      return 3;
  }
}

/**
 * Generate a unique card ID using crypto-safe random bytes.
 */
function generateCardId(): SrsCardId {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `card_${hex}`;
}
