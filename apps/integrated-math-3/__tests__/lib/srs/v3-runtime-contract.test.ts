import { describe, expect, it } from 'vitest';
import {
  createDualWriteCardIdentity,
  resolveCanonicalVariantKey,
} from '@/lib/srs/v3-runtime-contract';

describe('resolveCanonicalVariantKey', () => {
  it('uses the v3.2 variantKey when old and new representations agree', () => {
    expect(resolveCanonicalVariantKey({
      variantKey: 'linear.solve.v1',
      legacyProblemFamilyId: 'linear.solve.v1',
      problemFamilyId: 'linear.solve.v1',
    })).toEqual({
      variantKey: 'linear.solve.v1',
      source: 'v3_2',
    });
  });

  it('reads a legacy-only card during the rollback window', () => {
    expect(resolveCanonicalVariantKey({
      problemFamilyId: 'quadratic.graph.v1',
    })).toEqual({
      variantKey: 'quadratic.graph.v1',
      source: 'legacy',
    });
  });

  it('rejects contradictory dual representations instead of scheduling the wrong activity', () => {
    expect(() => resolveCanonicalVariantKey({
      variantKey: 'linear.solve.v1',
      legacyProblemFamilyId: 'quadratic.graph.v1',
    })).toThrow('contradictory variant identity');
  });

  it('rejects a card with no usable identity', () => {
    expect(() => resolveCanonicalVariantKey({})).toThrow('missing variant identity');
  });
});

describe('createDualWriteCardIdentity', () => {
  it('writes canonical and rollback fields with an explicit version marker', () => {
    expect(createDualWriteCardIdentity('linear.solve.v1')).toEqual({
      variantKey: 'linear.solve.v1',
      legacyProblemFamilyId: 'linear.solve.v1',
      migrationVersion: 'kst-srs.v3.2',
    });
  });

  it('rejects blank identifiers so no unresolvable card can be persisted', () => {
    expect(() => createDualWriteCardIdentity('  ')).toThrow('variantKey must be non-blank');
  });
});
