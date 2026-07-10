import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { objectiveStateEvidenceSchema } from '../index';

const ROOT = resolve(__dirname, '../../../../');

describe('kst-srs.v3 package ownership', () => {
  it('accepts already-aggregated objective evidence at the core boundary', () => {
    expect(objectiveStateEvidenceSchema.parse({
      objectiveId: 'math.im3.skill-a',
      retention: 0.86,
      retentionStrength: 0.81,
      isProficient: true,
      hasReviewHistory: true,
      evidenceRefs: ['card:one', 'card:two'],
    })).toEqual({
      objectiveId: 'math.im3.skill-a',
      retention: 0.86,
      retentionStrength: 0.81,
      isProficient: true,
      hasReviewHistory: true,
      evidenceRefs: ['card:one', 'card:two'],
    });
  });

  it('rejects raw FSRS card fields at the core boundary', () => {
    expect(objectiveStateEvidenceSchema.safeParse({
      objectiveId: 'math.im3.skill-a',
      retention: 0.86,
      retentionStrength: 0.81,
      isProficient: true,
      hasReviewHistory: true,
      evidenceRefs: [],
      stability: 15,
      lastReview: '2026-07-10T00:00:00.000Z',
    }).success).toBe(false);
  });

  it('documents Appendix A ownership and v2 compatibility', () => {
    const architecture = readFileSync(resolve(ROOT, 'measure/knowledge-space.md'), 'utf8');
    const coreReadme = readFileSync(resolve(ROOT, 'packages/knowledge-space-core/README.md'), 'utf8');
    const srsReadme = readFileSync(resolve(ROOT, 'packages/srs-engine/README.md'), 'utf8');
    const compatibility = readFileSync(
      resolve(ROOT, 'measure/archive/kst-srs-v3-core-correctness_20260710/compatibility.md'),
      'utf8',
    );

    expect(architecture).toMatch(/srs-engine[\s\S]*retention[\s\S]*placement/i);
    expect(architecture).toMatch(/knowledge-space-core[\s\S]*edge calibration/i);
    expect(coreReadme).toMatch(/knowledge-space\.v2/);
    expect(coreReadme).toMatch(/already-aggregated objective evidence/i);
    expect(srsReadme).toMatch(/FSRS retention/i);
    expect(srsReadme).toMatch(/placement/i);
    expect(compatibility).toMatch(/intentionally breaking/i);
    expect(compatibility).toMatch(/stabilityToRetention/i);
  });
});
