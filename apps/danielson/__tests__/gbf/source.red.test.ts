import { describe, expect, it } from 'vitest';

import { buildDanielsonGraph } from '../../lib/proficiency/graph';
import {
  GBF_ACTION_STEPS,
  GBF_MAPPINGS,
  GBF_PHASES,
  GBF_SOURCES,
  GBF_UNSEQUENCED_SKILL_IDS,
} from '../../lib/gbf/source';

describe('GBF source sequence', () => {
  it('records the supplied sources and the five source phases', () => {
    expect(GBF_SOURCES).toEqual(expect.arrayContaining([
      expect.objectContaining({
        filename: 'get-better-faster-scope-sequence.pdf',
        pageCount: 5,
      }),
      expect.objectContaining({
        filename: 'Classroom-Insights-Handbook_25-26-1.pdf',
        pageCount: 5,
      }),
      expect.objectContaining({
        siblingCommit: '4ad319e57022ab8e334a594ee12c84a7a8886be7',
        recordCount: 63,
      }),
    ]));
    expect(GBF_PHASES).toEqual([
      expect.objectContaining({ phaseId: 'phase_1', sourcePage: 1 }),
      expect.objectContaining({ phaseId: 'phase_2', sourcePage: 2 }),
      expect.objectContaining({ phaseId: 'phase_3', sourcePage: 3 }),
      expect.objectContaining({ phaseId: 'phase_4', sourcePage: 4 }),
      expect.objectContaining({ phaseId: 'stretch_it', sourcePage: 5 }),
    ]);
  });

  it('preserves both parallel paths, source order, and preview status', () => {
    const steps = GBF_ACTION_STEPS;
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
    const mappings = GBF_MAPPINGS;
    const requiredMappings = mappings.filter((mapping) => (
      GBF_ACTION_STEPS.find((step) => step.actionStepId === mapping.actionStepId)
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
        actionStepId: expect.any(String),
        skillId: expect.any(String),
        role: expect.stringMatching(/^(primary|support)$/),
        classification: expect.stringMatching(/^(direct|inferred)$/),
        rationale: expect.any(String),
      });
    }
    for (const skillId of GBF_UNSEQUENCED_SKILL_IDS) {
      expect(approvedSkillIds.has(skillId)).toBe(true);
      expect(mappings.some((mapping) => mapping.skillId === skillId)).toBe(false);
    }
  });
});
