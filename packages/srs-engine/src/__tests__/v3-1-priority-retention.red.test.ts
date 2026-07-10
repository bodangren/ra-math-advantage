/**
 * Intentional Red — v3.1 per-priority retention behavior (§12.3).
 *
 * The additive fifth argument is the objective priority for this scheduling
 * decision. Existing four-argument calls remain the legacy scalar API.
 */
import { describe, expect, it } from 'vitest';

import type {
  ObjectivePriority,
  SrsCardState,
  SrsRating,
} from '../srs/contract';
import {
  reviewCard,
  type SchedulerConfig,
} from '../srs/scheduler';

type PriorityAwareReviewCard = (
  card: SrsCardState,
  rating: SrsRating,
  now?: string,
  config?: Partial<SchedulerConfig>,
  objectivePriority?: ObjectivePriority,
) => SrsCardState;

const reviewCardForPriority: PriorityAwareReviewCard = reviewCard;

const NOW = '2026-07-10T00:00:00.000Z';

// A mature review-state card makes requested retention observable in the
// FSRS interval. New/learning cards can use learning steps that mask it.
const CARD: SrsCardState = {
  cardId: 'card_priority_retention',
  studentId: 'student_priority_retention',
  objectiveId: 'objective_priority_retention',
  variantKey: 'variant_priority_retention',
  stability: 10,
  difficulty: 5,
  state: 'review',
  dueDate: NOW,
  elapsedDays: 10,
  scheduledDays: 10,
  reps: 5,
  lapses: 0,
  lastReview: '2026-06-30T00:00:00.000Z',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-30T00:00:00.000Z',
};

const SCALAR_CONFIG: SchedulerConfig = {
  requestRetention: 0.87,
  maximumInterval: 365,
  enableShortTermPreview: false,
};

function scheduleWithScalarTarget(requestRetention: number): SrsCardState {
  return reviewCard(CARD, 'Good', NOW, {
    ...SCALAR_CONFIG,
    requestRetention,
  });
}

function schedulePriority(
  priority: ObjectivePriority,
  requestRetentionByPriority: SchedulerConfig['requestRetentionByPriority'],
): SrsCardState {
  return reviewCardForPriority(
    CARD,
    'Good',
    NOW,
    { ...SCALAR_CONFIG, requestRetentionByPriority },
    priority,
  );
}

describe('v3.1 scheduler priority retention', () => {
  it.each<ObjectivePriority>([
    'essential',
    'supporting',
    'extension',
    'triaged',
  ])('keeps an absent priority map exactly scalar-equivalent for %s', (priority) => {
    const legacy = reviewCard(CARD, 'Good', NOW, SCALAR_CONFIG);
    const priorityAware = reviewCardForPriority(
      CARD,
      'Good',
      NOW,
      SCALAR_CONFIG,
      priority,
    );

    expect(priorityAware).toEqual(legacy);
  });

  it('applies the opted-in normative defaults to the actual FSRS schedule', () => {
    const targets = {
      essential: 0.95,
      supporting: 0.9,
      extension: 0.8,
    } as const;

    for (const [priority, target] of Object.entries(targets) as Array<
      ['essential' | 'supporting' | 'extension', number]
    >) {
      expect(schedulePriority(priority, {})).toEqual(
        scheduleWithScalarTarget(target),
      );
    }
  });

  it('applies explicit per-priority overrides to the actual FSRS schedule', () => {
    const overrides = {
      essential: 0.97,
      supporting: 0.86,
      extension: 0.75,
    } as const;

    for (const [priority, target] of Object.entries(overrides) as Array<
      ['essential' | 'supporting' | 'extension', number]
    >) {
      expect(schedulePriority(priority, overrides)).toEqual(
        scheduleWithScalarTarget(target),
      );
    }
  });

  it('schedules essential no later than supporting and supporting no later than extension', () => {
    const essential = schedulePriority('essential', {});
    const supporting = schedulePriority('supporting', {});
    const extension = schedulePriority('extension', {});

    expect(essential.scheduledDays).toBeLessThanOrEqual(supporting.scheduledDays);
    expect(supporting.scheduledDays).toBeLessThanOrEqual(extension.scheduledDays);
    expect(Date.parse(essential.dueDate)).toBeLessThanOrEqual(Date.parse(supporting.dueDate));
    expect(Date.parse(supporting.dueDate)).toBeLessThanOrEqual(Date.parse(extension.dueDate));
  });

  it('uses scalar retention for triaged unless triaged is explicitly overridden', () => {
    expect(schedulePriority('triaged', {})).toEqual(
      scheduleWithScalarTarget(SCALAR_CONFIG.requestRetention),
    );

    expect(schedulePriority('triaged', { triaged: 0.72 })).toEqual(
      scheduleWithScalarTarget(0.72),
    );
  });
});
