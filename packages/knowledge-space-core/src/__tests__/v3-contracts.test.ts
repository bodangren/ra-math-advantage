import { describe, expect, it } from 'vitest';

import {
  KNOWLEDGE_SPACE_SCHEMA_VERSION,
  MASTERY_CONFIG_DEFAULT,
  masteryConfigSchema,
  normalizeMasteryConfig,
} from '../index';

describe('kst-srs.v3 engine contracts', () => {
  it('exports the knowledge-space.v2 schema version', () => {
    expect(KNOWLEDGE_SPACE_SCHEMA_VERSION).toBe('knowledge-space.v2');
  });

  it('defines all six normative mastery configuration defaults', () => {
    expect(MASTERY_CONFIG_DEFAULT).toEqual({
      masteryEnter: 0.9,
      masteryExit: 0.7,
      readyThreshold: 0.8,
      nearThreshold: 0.5,
      hardGateThreshold: 1,
      trendThreshold: 3,
    });
  });

  it('normalizes legacy four-field overrides by injecting v3 defaults', () => {
    expect(normalizeMasteryConfig({ masteryEnter: 0.95 })).toEqual({
      ...MASTERY_CONFIG_DEFAULT,
      masteryEnter: 0.95,
    });
  });

  it('validates threshold ordering and the v3 fields', () => {
    expect(masteryConfigSchema.safeParse(MASTERY_CONFIG_DEFAULT).success).toBe(true);
    expect(masteryConfigSchema.safeParse({
      ...MASTERY_CONFIG_DEFAULT,
      masteryExit: 0.9,
      masteryEnter: 0.8,
    }).success).toBe(false);
    expect(masteryConfigSchema.safeParse({
      ...MASTERY_CONFIG_DEFAULT,
      nearThreshold: 0.9,
      readyThreshold: 0.8,
    }).success).toBe(false);
    expect(masteryConfigSchema.safeParse({
      ...MASTERY_CONFIG_DEFAULT,
      hardGateThreshold: 1.01,
    }).success).toBe(false);
    expect(masteryConfigSchema.safeParse({
      ...MASTERY_CONFIG_DEFAULT,
      trendThreshold: 1.5,
    }).success).toBe(false);
  });
});

