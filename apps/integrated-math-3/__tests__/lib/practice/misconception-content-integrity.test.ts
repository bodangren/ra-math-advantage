/**
 * Phase 2 — Red test for the IM3 misconception content integrity check.
 *
 * Document/artifact contract test (per `measure/tracks/misconception-content-authoring_20260605/test-strategy.md`
 * §"Per-Phase Test Approach › Phase 2"). Loads the authored IM3 taxonomy +
 * remediation-activity registry and verifies the integrity check that the
 * Phase 2 Green role ships:
 *
 *   (a) every misconception in the prioritized skill set (IM3 M1 + common
 *       algebra) has a detection mapping (re-asserted against the
 *       integrity check, not just Phase 1's mapping unit tests),
 *   (b) every misconception has at least one `remediated_by` edge pointing
 *       to a valid remediation activity,
 *   (c) no orphan remediation activities exist (no entry in the
 *       remediation registry without a matching taxonomy slug),
 *   (d) all skill references resolve to known IM3 M1 skill IDs.
 *
 * Plus the edge cases from `test-strategy.md` §"Cross-Phase Edge Cases":
 *   - Empty taxonomy is handled gracefully (vacuously ok).
 *   - Duplicate or unknown affected-skill IDs are flagged.
 *   - Circular `remediated_by` (remediation activity ID equal to the
 *     misconception slug) is detected.
 *   - Unknown remediation-activity IDs (not present in the IM3 M1
 *     curriculum or as a known task_blueprint) are flagged.
 *
 * Source under test (does **not** exist yet at HEAD — this is the Red
 * signal): `apps/integrated-math-3/lib/practice/misconception-remediations.ts`
 * This test file will therefore fail at module-resolution time until the
 * Phase 2 Green role ships the authored remediation registry + the
 * `checkMisconceptionContentIntegrity` implementation.
 *
 * Live-behavior pairing (per the prompt's "artifact assertions must be
 * paired with a live-behavior proof or a later-phase plan note"): this
 * Phase 2 artifact gate is paired with the Phase 3 loop-wiring tests
 * (`misconception-loop-wiring.test.ts` + `misconception-loop.smoke.test.ts`)
 * which exercise the T6 runtime consumer of this authored content. The
 * artifact contract stays in Phase 2; the live runtime gate is owned by
 * Phase 3. See `measure/tracks/misconception-content-authoring_20260605/plan.md`
 * Phase 2 Red Phase Result for the explicit handoff note.
 */

import { describe, expect, it } from 'vitest';

import {
  IM3_M1_SKILL_SET,
  REMEDIATION_ACTIVITY_KINDS,
  makeMisconceptionNode,
  makeRemediationActivity,
} from './misconception-content.fixtures';

import {
  IM3_MISCONCEPTION_TAGS,
  allIm3MisconceptionTagSlugs,
  isCanonicalIm3MisconceptionTag,
} from '@/lib/practice/misconception-taxonomy';

import { getDistractorTypesForMisconception } from '@/lib/practice/misconception-mapping';

import {
  IM3_MISCONCEPTION_REMEDIATIONS,
  getRemediationsForMisconception,
  checkMisconceptionContentIntegrity,
  type RemediationActivityKind,
  type RemediationActivityRef,
  type IntegrityResult,
  type IntegrityError,
} from '@/lib/practice/misconception-remediations';

const VALID_KINDS: ReadonlySet<RemediationActivityKind> = new Set(
  REMEDIATION_ACTIVITY_KINDS as readonly RemediationActivityKind[],
);

function errorCodes(result: IntegrityResult): readonly IntegrityError['code'][] {
  return result.errors.map((e) => e.code);
}

describe('IM3_MISCONCEPTION_REMEDIATIONS — authored registry shape', () => {
  it('exports a non-empty remediation registry', () => {
    expect(IM3_MISCONCEPTION_REMEDIATIONS).toBeDefined();
    expect(Object.keys(IM3_MISCONCEPTION_REMEDIATIONS).length).toBeGreaterThan(
      0,
    );
  });

  it('every taxonomy slug is a key in the remediation registry (FR3 / AC3)', () => {
    for (const slug of allIm3MisconceptionTagSlugs()) {
      expect(IM3_MISCONCEPTION_REMEDIATIONS[slug]).toBeDefined();
    }
  });

  it('every remediation-registry key is a canonical taxonomy slug (no orphans, edge case c)', () => {
    for (const slug of Object.keys(IM3_MISCONCEPTION_REMEDIATIONS)) {
      expect(isCanonicalIm3MisconceptionTag(slug)).toBe(true);
    }
  });

  it('every taxonomy tag has at least one `remediated_by` activity (FR3 / AC3)', () => {
    for (const slug of allIm3MisconceptionTagSlugs()) {
      const remediations = IM3_MISCONCEPTION_REMEDIATIONS[slug];
      expect(Array.isArray(remediations)).toBe(true);
      expect(remediations.length).toBeGreaterThan(0);
    }
  });

  it('every remediation activity has a populated `activityId`, `activityKind`, `label`, and `sourceRef`', () => {
    for (const [slug, remediations] of Object.entries(
      IM3_MISCONCEPTION_REMEDIATIONS,
    )) {
      for (const rem of remediations as readonly RemediationActivityRef[]) {
        expect(typeof rem.activityId, `activityId on ${slug}`).toBe('string');
        expect(rem.activityId.length).toBeGreaterThan(0);

        expect(VALID_KINDS.has(rem.activityKind)).toBe(true);

        expect(typeof rem.label, `label on ${slug}`).toBe('string');
        expect(rem.label.length).toBeGreaterThan(0);

        expect(typeof rem.sourceRef, `sourceRef on ${slug}`).toBe('string');
        expect(rem.sourceRef.length).toBeGreaterThan(0);
      }
    }
  });

  it('no remediation activity self-loops on its parent misconception slug (edge case 3)', () => {
    for (const [slug, remediations] of Object.entries(
      IM3_MISCONCEPTION_REMEDIATIONS,
    )) {
      for (const rem of remediations as readonly RemediationActivityRef[]) {
        expect(
          rem.activityId,
          `remediation for ${slug} must not point back at the misconception slug`,
        ).not.toBe(slug);
      }
    }
  });
});

describe('getRemediationsForMisconception — live behavior', () => {
  it('returns the registry entry for every taxonomy slug', () => {
    for (const slug of allIm3MisconceptionTagSlugs()) {
      const remediations = getRemediationsForMisconception(slug);
      expect(remediations).toEqual(IM3_MISCONCEPTION_REMEDIATIONS[slug]);
    }
  });

  it('returns an empty array for an unknown slug (safe lookup)', () => {
    expect(getRemediationsForMisconception('not-an-im3-tag')).toEqual([]);
  });
});

describe('checkMisconceptionContentIntegrity — live behavior on authored content', () => {
  it('returns ok=true with no errors against the live IM3 taxonomy + remediation registry (AC3)', () => {
    const result = checkMisconceptionContentIntegrity();
    expect(result.ok, `integrity errors: ${JSON.stringify(result.errors)}`).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('confirms (a): every prioritized-skill-set tag has a non-empty detection mapping', () => {
    // Re-asserts Phase 1's mapping coverage from inside the integrity check
    // so a Phase 2 regression that breaks the mapping surface is caught
    // here, not just in the Phase 1 mapping unit tests.
    const taxonomyEntries = Object.values(IM3_MISCONCEPTION_TAGS);
    for (const skillId of IM3_M1_SKILL_SET) {
      const covering = taxonomyEntries.filter((e) =>
        e.affectedSkills.includes(skillId),
      );
      expect(
        covering.length,
        `prioritized skill ${skillId} has no taxonomy entry`,
      ).toBeGreaterThan(0);
      for (const entry of covering) {
        expect(
          getDistractorTypesForMisconception(entry.slug).length,
          `taxonomy entry ${entry.slug} has no detection signals`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('confirms (b): every taxonomy slug has at least one remediation activity', () => {
    for (const slug of allIm3MisconceptionTagSlugs()) {
      expect(
        getRemediationsForMisconception(slug).length,
        `taxonomy entry ${slug} has no remediated_by edges`,
      ).toBeGreaterThan(0);
    }
  });

  it('confirms (d): every affectedSkills entry resolves to a known IM3 M1 skill ID', () => {
    const result = checkMisconceptionContentIntegrity();
    const skillErrors = result.errors.filter(
      (e) => e.code === 'unknown-skill-reference',
    );
    expect(skillErrors).toEqual([]);
  });

  it('flags `missing-remediation` when a taxonomy tag has zero remediations (synthetic registry)', () => {
    const taxonomy = {
      'sample-tag': makeMisconceptionNode({ slug: 'sample-tag' }),
    };
    const remediations = { 'sample-tag': [] };
    const result = checkMisconceptionContentIntegrity({
      taxonomy,
      remediations,
    });
    expect(result.ok).toBe(false);
    expect(errorCodes(result)).toContain('missing-remediation');
  });

  it('flags `orphan-remediation` when the registry has a slug not in the taxonomy (edge case c, synthetic registry)', () => {
    const taxonomy = {
      'sample-tag': makeMisconceptionNode({ slug: 'sample-tag' }),
    };
    const remediations = {
      'sample-tag': [
        makeRemediationActivity('math.im3.example.1.1.001'),
      ],
      'orphan-tag': [
        makeRemediationActivity('math.im3.example.1.1.002'),
      ],
    };
    const result = checkMisconceptionContentIntegrity({
      taxonomy,
      remediations,
      knownWorkedExampleIds: new Set([
        'math.im3.example.1.1.001',
        'math.im3.example.1.1.002',
      ]),
      knownSkillIds: new Set(IM3_M1_SKILL_SET),
    });
    expect(result.ok).toBe(false);
    expect(errorCodes(result)).toContain('orphan-remediation');
  });

  it('flags `unknown-skill-reference` when affectedSkills contains an unknown skill ID (edge case d, synthetic registry)', () => {
    const taxonomy = {
      'sample-tag': makeMisconceptionNode({
        slug: 'sample-tag',
        affectedSkills: ['math.im3.skill.NONEXISTENT'],
      }),
    };
    const remediations = {
      'sample-tag': [makeRemediationActivity('math.im3.example.1.1.001')],
    };
    const result = checkMisconceptionContentIntegrity({
      taxonomy,
      remediations,
      knownWorkedExampleIds: new Set(['math.im3.example.1.1.001']),
      knownSkillIds: new Set(IM3_M1_SKILL_SET),
    });
    expect(result.ok).toBe(false);
    expect(errorCodes(result)).toContain('unknown-skill-reference');
  });

  it('flags `unknown-activity-id` when a remediation points at an ID not in the known curriculum (synthetic registry)', () => {
    const taxonomy = {
      'sample-tag': makeMisconceptionNode({ slug: 'sample-tag' }),
    };
    const remediations = {
      'sample-tag': [
        makeRemediationActivity('math.im3.example.UNKNOWN', {
          activityKind: 'worked_example',
        }),
      ],
    };
    const result = checkMisconceptionContentIntegrity({
      taxonomy,
      remediations,
      knownWorkedExampleIds: new Set(['math.im3.example.1.1.001']),
      knownSkillIds: new Set(IM3_M1_SKILL_SET),
    });
    expect(result.ok).toBe(false);
    expect(errorCodes(result)).toContain('unknown-activity-id');
  });

  it('flags `circular-remediated-by` when a remediation activity ID equals its parent misconception slug (edge case 3, synthetic registry)', () => {
    const taxonomy = {
      'sample-tag': makeMisconceptionNode({ slug: 'sample-tag' }),
    };
    const remediations = {
      'sample-tag': [
        makeRemediationActivity('sample-tag', { activityKind: 'skill' }),
      ],
    };
    const result = checkMisconceptionContentIntegrity({
      taxonomy,
      remediations,
      knownWorkedExampleIds: new Set<string>(),
      knownSkillIds: new Set<string>(['sample-tag']),
    });
    expect(result.ok).toBe(false);
    expect(errorCodes(result)).toContain('circular-remediated-by');
  });

  it('handles an empty taxonomy + remediation registry gracefully (vacuously ok, edge case 1)', () => {
    const result = checkMisconceptionContentIntegrity({
      taxonomy: {},
      remediations: {},
      knownWorkedExampleIds: new Set<string>(),
      knownSkillIds: new Set<string>(),
    });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('taxonomy ↔ remediation ↔ skill-set coherence', () => {
  it('every prioritized IM3 M1 skill is reachable through a tag with at least one remediation', () => {
    const taxonomyEntries = Object.values(IM3_MISCONCEPTION_TAGS);
    for (const skillId of IM3_M1_SKILL_SET) {
      const covering = taxonomyEntries.filter((e) =>
        e.affectedSkills.includes(skillId),
      );
      expect(
        covering.length,
        `prioritized skill ${skillId} has no taxonomy entry`,
      ).toBeGreaterThan(0);
      for (const entry of covering) {
        expect(
          getRemediationsForMisconception(entry.slug).length,
          `taxonomy entry ${entry.slug} covers ${skillId} but has no remediation`,
        ).toBeGreaterThan(0);
      }
    }
  });
});
