import { describe, expect, it } from 'vitest';
import {
  FSRS_FITTING_CONTRACT_VERSION as SUBPATH_FITTING_VERSION,
  evaluateFsrsFitLifecycle as evaluateFsrsFitLifecycleFromSubpath,
} from '@math-platform/srs-engine/fsrs-fitting';

import {
  EVALUATION_CONTRACT_VERSION,
  FSRS_FITTING_CONTRACT_VERSION,
  SCHEDULER_POLICY_VERSION,
  assignAbilityTercile,
  evaluateFsrsFitLifecycle,
  isFsrsFitArtifactV31,
  isReplayEvaluationResultV31,
  isSchedulerConfigV31,
  resolveReleasedFsrsParameters,
  stratifyCalibrationByAbility,
} from '../index';
import type {
  SchedulerConfig,
  SrsReviewLogEntryV31,
} from '../index';

describe('v3.1 public contract exports', () => {
  it('publishes the scheduler, fitting, and evaluation contracts at the package root', () => {
    expect(SCHEDULER_POLICY_VERSION).toBe('scheduler-policy.v3.1');
    expect(FSRS_FITTING_CONTRACT_VERSION).toBe('fsrs-fitting.v3.1');
    expect(EVALUATION_CONTRACT_VERSION).toBe('evaluation.v3.1');
    expect(typeof isSchedulerConfigV31).toBe('function');
    expect(typeof isFsrsFitArtifactV31).toBe('function');
    expect(typeof isReplayEvaluationResultV31).toBe('function');
    expect(typeof evaluateFsrsFitLifecycle).toBe('function');
    expect(typeof resolveReleasedFsrsParameters).toBe('function');
    expect(typeof assignAbilityTercile).toBe('function');
    expect(typeof stratifyCalibrationByAbility).toBe('function');
    expect(SUBPATH_FITTING_VERSION).toBe(FSRS_FITTING_CONTRACT_VERSION);
    expect(evaluateFsrsFitLifecycleFromSubpath).toBe(evaluateFsrsFitLifecycle);
  });

  it('keeps priority retention additive while requiring parameter provenance in v3.1 logs', () => {
    const config: SchedulerConfig = {
      requestRetention: 0.9,
      requestRetentionByPriority: { essential: 0.95 },
      maximumInterval: 365,
      enableShortTermPreview: false,
    };
    type ParamsVersionIsRequired = SrsReviewLogEntryV31 extends {
      paramsVersion: string;
    } ? true : false;
    const paramsVersionIsRequired: ParamsVersionIsRequired = true;

    expect(config.requestRetentionByPriority?.essential).toBe(0.95);
    expect(paramsVersionIsRequired).toBe(true);
  });
});
