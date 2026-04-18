import { describe, it, expect } from 'vitest';
import { OBJECTIVE_POLICIES } from '@/convex/seed/objective-policies';
import { objectivePolicySchema } from '@/lib/practice/objective-policy';

const ALL_STANDARD_CODES = [
  'HSA-SSE.B.3',
  'HSA-REI.B.4',
  'HSA-APR.A.1',
  'HSA-APR.B.2',
  'HSA-APR.B.3',
  'HSA-CED.A.1',
  'N-CN.A.1',
  'N-CN.C.7',
  'N-RN.A.1',
  'N-RN.A.2',
  'HSF-IF.B.4',
  'HSF-BF.A.1',
  'HSF-BF.B.3',
  'HSF-BF.B.4',
  'HSF-BF.B.5',
  'HSF-LE.A.4',
  'HSF-IF.C.7e',
  'HSF-LE.A.1',
  'HSA-CED.A.2',
  'HSA-APR.D.6',
  'HSF-IF.C.7d',
  'HSA-REI.A.2',
  'HSS-ID.A.1',
  'HSS-ID.A.2',
  'HSS-ID.A.3',
  'HSS-ID.B.6',
  'HSS-IC.A.1',
  'HSS-IC.B.3',
  'HSS-IC.B.4',
  'HSS-IC.B.5',
  'HSS-IC.B.6',
  'HSF-TF.A.1',
  'HSF-TF.A.2',
  'HSF-TF.A.4',
  'HSF-TF.B.5',
  'HSA-CED.A.3',
  'HSA-REI.C.7',
  'HSF-IF.C.7c',
  'HSF-IF.A.2',
  'HSA-APR.C.4',
  'HSF-IF.C.7a',
  'HSF-BF.A.1a',
  'HSF-LE.A.2',
  'HSF-LE.B.5',
];

describe('objective-policies seed data', () => {
  it('has an assignment for every competency standard', () => {
    const assignedCodes = OBJECTIVE_POLICIES.map((p) => p.standardId);
    for (const code of ALL_STANDARD_CODES) {
      expect(assignedCodes).toContain(code);
    }
  });

  it('has no duplicate standardIds', () => {
    const codes = OBJECTIVE_POLICIES.map((p) => p.standardId);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('uses valid ObjectivePracticePolicy values', () => {
    const validPolicies = ['essential', 'supporting', 'extension', 'triaged'] as const;
    for (const policy of OBJECTIVE_POLICIES) {
      expect(validPolicies).toContain(policy.policy);
    }
  });

  it('uses the integrated-math-3 course key for all policies', () => {
    for (const policy of OBJECTIVE_POLICIES) {
      expect(policy.courseKey).toBe('integrated-math-3');
    }
  });

  it('assigns priority 1 to essential policies', () => {
    const essential = OBJECTIVE_POLICIES.filter((p) => p.policy === 'essential');
    for (const policy of essential) {
      expect(policy.priority).toBe(1);
    }
  });

  it('assigns priority 2 to supporting policies', () => {
    const supporting = OBJECTIVE_POLICIES.filter((p) => p.policy === 'supporting');
    for (const policy of supporting) {
      expect(policy.priority).toBe(2);
    }
  });

  it('assigns priority 3 to extension policies', () => {
    const extension = OBJECTIVE_POLICIES.filter((p) => p.policy === 'extension');
    for (const policy of extension) {
      expect(policy.priority).toBe(3);
    }
  });

  it('has no triaged policies', () => {
    const triaged = OBJECTIVE_POLICIES.filter((p) => p.policy === 'triaged');
    expect(triaged).toHaveLength(0);
  });

  it('every record passes the Zod schema validation', () => {
    for (const policy of OBJECTIVE_POLICIES) {
      const result = objectivePolicySchema.safeParse(policy);
      expect(result.success).toBe(true);
    }
  });

  it('counts 44 total policy assignments', () => {
    expect(OBJECTIVE_POLICIES).toHaveLength(44);
  });
});
