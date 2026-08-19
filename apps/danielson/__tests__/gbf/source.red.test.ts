import { describe, expect, it } from 'vitest';

import { buildDanielsonGraph } from '../../lib/proficiency/graph';
import {
  GBF_MAPPING_RELEASE,
  GBF_SEQUENCE_RELEASE,
  GBF_SOURCE_MANIFESTS,
  GBF_UNSEQUENCED_SKILL_IDS,
  validateGbfSourceRelease,
} from '../../lib/gbf/source';

describe('GBF source release', () => {
  it('freezes the supplied sources and the five source phases', () => {
    expect(GBF_SOURCE_MANIFESTS).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourceId: 'gbf.scope-sequence.2018',
        filename: 'get-better-faster-scope-sequence.pdf',
        sha256: 'cf34c7ed03fd63fb0c89cb378b1fcacde4c6dc5a7238fc1b9cb059ddf733de64',
        pageCount: 5,
      }),
      expect.objectContaining({
        sourceId: 'classroom-insights.2025-2026',
        filename: 'Classroom-Insights-Handbook_25-26-1.pdf',
        sha256: '9de9a26d9acdea6fd134c50fec300822fb652f385cd1fe5cbff6b518ee311828',
        pageCount: 5,
      }),
      expect.objectContaining({
        sourceId: 'sibling.tlac3.modules',
        sha256: '4704ae10511d27c4b3cc7951c0aadfe48558aa86e1148f8ba4f116383fe7cb1b',
        siblingCommit: '4ad319e57022ab8e334a594ee12c84a7a8886be7',
        recordCount: 63,
      }),
    ]));
    expect(GBF_SEQUENCE_RELEASE.releaseId).toBe('danielson.gbf.sequence.2026-08-19.v1');
    expect(GBF_SEQUENCE_RELEASE.phases).toEqual([
      expect.objectContaining({ phaseId: 'phase_1', sourcePage: 1 }),
      expect.objectContaining({ phaseId: 'phase_2', sourcePage: 2 }),
      expect.objectContaining({ phaseId: 'phase_3', sourcePage: 3 }),
      expect.objectContaining({ phaseId: 'phase_4', sourcePage: 4 }),
      expect.objectContaining({ phaseId: 'stretch_it', sourcePage: 5 }),
    ]);
  });

  it('preserves both parallel paths, source order, and preview status', () => {
    const steps = GBF_SEQUENCE_RELEASE.actionSteps;
    const required = steps.filter((step) => step.status === 'required');
    const previews = steps.filter((step) => step.status === 'preview');
    const management = required.filter((step) => step.trajectory === 'management');
    const rigor = required.filter((step) => step.trajectory === 'rigor');

    expect(steps).toHaveLength(30);
    expect(management).toHaveLength(12);
    expect(rigor).toHaveLength(13);
    expect(previews).toHaveLength(5);
    expect(management.map((step) => step.trajectoryOrder)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
    expect(rigor.map((step) => step.trajectoryOrder)).toEqual(
      Array.from({ length: 13 }, (_, index) => index + 1),
    );
    expect(previews.every((step) => step.phaseId === 'phase_1')).toBe(true);
    expect(previews.every((step) => step.trajectory === 'management')).toBe(true);
  });

  it('maps 50 approved TLAC skills and keeps the 13 unsupported skills unsequenced', () => {
    const approvedSkillIds = new Set(buildDanielsonGraph().graph.nodes
      .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
      .map((node) => node.id));
    const mappings = GBF_MAPPING_RELEASE.mappings;
    const requiredMappings = mappings.filter((mapping) => (
      GBF_SEQUENCE_RELEASE.actionSteps.find((step) => step.actionStepId === mapping.actionStepId)
        ?.status === 'required'
    ));

    expect(mappings).toHaveLength(78);
    expect(new Set(mappings.map((mapping) => mapping.skillId)).size).toBe(50);
    expect(requiredMappings.filter((mapping) => mapping.role === 'primary')).toHaveLength(25);
    expect(requiredMappings.filter((mapping) => mapping.role === 'support')).toHaveLength(46);
    expect(GBF_UNSEQUENCED_SKILL_IDS).toHaveLength(13);
    for (const mapping of mappings) {
      expect(approvedSkillIds.has(mapping.skillId)).toBe(true);
      expect(mapping).toMatchObject({
        mappingId: expect.any(String),
        actionStepId: expect.any(String),
        skillId: expect.any(String),
        role: expect.stringMatching(/^(primary|support)$/),
        classification: expect.stringMatching(/^(direct|inferred)$/),
        rationale: expect.any(String),
        confidence: expect.stringMatching(/^(low|medium|high)$/),
        reviewAuthor: expect.any(String),
        reviewDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        reviewStatus: expect.stringMatching(/^(reviewed|approved)$/),
      });
    }
    for (const skillId of GBF_UNSEQUENCED_SKILL_IDS) {
      expect(approvedSkillIds.has(skillId)).toBe(true);
      expect(mappings.some((mapping) => mapping.skillId === skillId)).toBe(false);
    }
    expect(validateGbfSourceRelease({
      sequence: GBF_SEQUENCE_RELEASE,
      mapping: GBF_MAPPING_RELEASE,
    })).toEqual({ valid: true, issues: [] });
  });

  it('rejects changed hashes, missing provenance, duplicate mappings, and unknown endpoints', () => {
    const changedHash = structuredClone(GBF_SEQUENCE_RELEASE);
    changedHash.sourceManifestHashes[0] = '0'.repeat(64);
    expect(validateGbfSourceRelease({ sequence: changedHash, mapping: GBF_MAPPING_RELEASE }).valid)
      .toBe(false);

    const missingRationale = structuredClone(GBF_MAPPING_RELEASE);
    missingRationale.mappings[0].rationale = '';
    expect(validateGbfSourceRelease({ sequence: GBF_SEQUENCE_RELEASE, mapping: missingRationale }).valid)
      .toBe(false);

    const duplicate = structuredClone(GBF_MAPPING_RELEASE);
    duplicate.mappings.push(structuredClone(duplicate.mappings[0]));
    expect(validateGbfSourceRelease({ sequence: GBF_SEQUENCE_RELEASE, mapping: duplicate }).valid)
      .toBe(false);

    const unknown = structuredClone(GBF_MAPPING_RELEASE);
    unknown.mappings[0].skillId = 'danielson.tlac.skill.not-real';
    expect(validateGbfSourceRelease({ sequence: GBF_SEQUENCE_RELEASE, mapping: unknown }).valid)
      .toBe(false);
  });
});
