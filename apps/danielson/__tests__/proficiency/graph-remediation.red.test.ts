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
    expect(graphInventory.map((row) => row.id)).toEqual(
      APPROVED_TLAC_SOURCE_INVENTORY.map((row) => row.id).sort(),
    );
  });
});
