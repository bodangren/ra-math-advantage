import { describe, expect, it } from 'vitest';

const graphModule = () => import('../../lib/proficiency/graph');

const COMMITTED_STANDALONE_TLAC_IDS = [
  'accountable-independent-reading', 'active-observation', 'affirmative-checking', 'all-hands',
  'art-of-consequence', 'art-of-the-sentence', 'batch-process', 'board-paper', 'break-it-down',
  'brighten-the-lines', 'call-and-response', 'change-the-pace', 'circulate', 'cold-call',
  'culture-of-error', 'delivery-moves', 'disciplined-discussion', 'do-it-again', 'do-now',
  'double-plan', 'emotional-constancy', 'engineer-efficiency', 'every-minute-matters',
  'everybody-writes', 'exemplar-planning', 'exit-ticket', 'fase-reading', 'firm-calm-finesse',
  'format-matters', 'front-the-writing', 'habits-of-attention', 'habits-of-discussion', 'joy-factor',
  'knowledge-organizers', 'least-invasive-intervention', 'make-expectations-visible',
  'means-of-participation', 'no-opt-out', 'own-and-track', 'phrasing-fundamentals', 'plan-for-error',
  'positive-framing', 'precise-praise', 'radar-be-seen-looking', 'regular-revision',
  'replace-self-report', 'retrieval-practice', 'right-is-right', 'routine-building', 'show-call',
  'show-me', 'silent-solo', 'standardize-format', 'stretch-it', 'strong-voice', 'take-the-steps',
  'threshold-strong-start', 'turn-and-talk', 'wait-time', 'warm-strict', 'what-to-do',
  'without-apology', 'work-the-clock',
] as const;

describe('Track 2 remediation: graph integrity', () => {
  it('rejects an imported skill when its documented alignment exception is absent', async () => {
    const { buildDanielsonGraph, validateDanielsonGraph } = await graphModule();
    const graph = buildDanielsonGraph().graph;
    const target = graph.nodes.find((node) => node.id === 'danielson.tlac.skill.double-plan');

    expect(target).toBeDefined();
    delete (target as unknown as { exceptions?: unknown }).exceptions;

    expect(validateDanielsonGraph(graph)).toMatchObject({
      valid: false,
      issues: expect.arrayContaining([
        expect.objectContaining({
          code: 'MISSING_REQUIRED_ALIGNMENT',
          nodeId: 'danielson.tlac.skill.double-plan',
        }),
      ]),
    });
  });

  it('keeps the committed standalone source inventory in parity with the build projection', async () => {
    const { buildDanielsonGraph } = await graphModule();
    const { APPROVED_TLAC_SOURCE_INVENTORY } = await import('../../lib/proficiency/source-inventory');
    const result = buildDanielsonGraph();
    const graphInventory = result.graph.nodes
      .filter((node) => node.kind === 'skill')
      .map((node) => {
        const sourceRef = node.sourceRefs.find((reference) => reference.source === 'Teach Like a Champion 3.0');
        return {
          id: node.id.replace('danielson.tlac.skill.', ''),
          source: sourceRef?.source,
          location: sourceRef?.location,
        };
      })
      .sort((left, right) => left.id.localeCompare(right.id));

    expect(graphInventory).toEqual(COMMITTED_STANDALONE_TLAC_IDS.map((id) => ({
      id,
      source: 'Teach Like a Champion 3.0',
      location: `src/data/techniques/${id}.ts`,
    })));
    expect(result.mappings.map((mapping) => mapping.skillId).sort()).toEqual(
      COMMITTED_STANDALONE_TLAC_IDS.map((id) => `danielson.tlac.skill.${id}`),
    );
    expect(result.mappings.sort((left, right) => left.skillId.localeCompare(right.skillId))).toEqual(
      APPROVED_TLAC_SOURCE_INVENTORY.map((row) => ({
        skillId: `danielson.tlac.skill.${row.id}`,
        componentId: `danielson.framework.component.${row.componentId}`,
        reviewStatus: 'approved',
      })).sort((left, right) => left.skillId.localeCompare(right.skillId)),
    );
    expect(result.sourceManifests).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stableId: 'sibling.tlac3.modules',
        source: 'Teach Like a Champion 3.0',
        recordCount: COMMITTED_STANDALONE_TLAC_IDS.length,
        contentHash: '4704ae10511d27c4b3cc7951c0aadfe48558aa86e1148f8ba4f116383fe7cb1b',
      }),
    ]));
  });

  it('preserves mixed runtime provenance for overlapping technique IDs', async () => {
    const { buildDanielsonGraph } = await graphModule();
    const { graph, reviewQueue } = buildDanielsonGraph();
    const coldCall = graph.nodes.find((node) => node.id === 'danielson.tlac.skill.cold-call');
    const turnAndTalk = graph.nodes.find((node) => node.id === 'danielson.tlac.skill.turn-and-talk');

    expect(coldCall?.sourceRefs).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: 'Teach Like a Champion 3.0' }),
      expect.objectContaining({ source: 'Uncommon Schools' }),
    ]));
    expect(turnAndTalk?.sourceRefs).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: 'Teach Like a Champion 3.0' }),
      expect.objectContaining({ source: 'Teaching Channel' }),
    ]));
    expect(reviewQueue.map((row) => row.id)).not.toContain('cold-call');
    expect(reviewQueue.map((row) => row.id)).not.toContain('turn-and-talk');
  });
});
