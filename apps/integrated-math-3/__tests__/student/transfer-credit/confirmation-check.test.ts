import { describe, it, expect } from 'vitest';
import {
  shouldRequireConfirmationCheck,
  grantSkipAfterCheck,
  TRANSFER_SKIP_POLICY_DEFAULT,
} from '@math-platform/knowledge-space-core';
import type { ConfirmationCheckResult } from '@math-platform/knowledge-space-core';

describe('shouldRequireConfirmationCheck', () => {
  it('returns true when componentMastery is below the confirmation threshold', () => {
    const policy = { ...TRANSFER_SKIP_POLICY_DEFAULT, confirmationThreshold: 0.85 };
    expect(shouldRequireConfirmationCheck(policy, 0.84)).toBe(true);
  });

  it('returns false when componentMastery is at the confirmation threshold', () => {
    const policy = { ...TRANSFER_SKIP_POLICY_DEFAULT, confirmationThreshold: 0.85 };
    expect(shouldRequireConfirmationCheck(policy, 0.85)).toBe(false);
  });

  it('returns false when componentMastery is above the confirmation threshold', () => {
    const policy = { ...TRANSFER_SKIP_POLICY_DEFAULT, confirmationThreshold: 0.85 };
    expect(shouldRequireConfirmationCheck(policy, 0.95)).toBe(false);
  });
});

describe('grantSkipAfterCheck', () => {
  it('grants skip when the check passed', () => {
    const result: ConfirmationCheckResult = {
      skillId: 'math.im3.skill.solve-quadratic',
      passed: true,
      confidence: 'medium',
    };
    expect(grantSkipAfterCheck(result)).toEqual({ granted: true });
  });

  it('does not grant skip when the check failed', () => {
    const result: ConfirmationCheckResult = {
      skillId: 'math.im3.skill.solve-quadratic',
      passed: false,
      confidence: 'low',
    };
    const outcome = grantSkipAfterCheck(result);
    expect(outcome.granted).toBe(false);
    expect(outcome.reason).toBeDefined();
  });

  it('grants skip on a low-confidence pass (the check itself is the gate)', () => {
    const result: ConfirmationCheckResult = {
      skillId: 'math.im3.skill.solve-quadratic',
      passed: true,
      confidence: 'low',
    };
    expect(grantSkipAfterCheck(result)).toEqual({ granted: true });
  });
});
