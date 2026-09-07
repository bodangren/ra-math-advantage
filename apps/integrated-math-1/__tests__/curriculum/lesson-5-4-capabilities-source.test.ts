import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-5-lesson-4'), 'utf8');
const definitions = [
  ['assess-causal-interpretations-of-described-relationships', 'Assess causal interpretations of described relationships', ['math.im1.example.5.4.018']],
  ['explain-correlation-and-causation-classifications-with-evidence', 'Explain correlation and causation classifications with evidence', ['math.im1.example.5.4.018']],
  ['identify-lurking-variables-or-common-causes', 'Identify lurking variables or common causes', ['math.im1.example.5.4.017']],
  ['explain-why-correlation-alone-does-not-establish-causation', 'Explain why correlation alone does not establish causation', []],
  ['critique-causal-conclusions-from-correlational-evidence', 'Critique causal conclusions from correlational evidence', []],
].map(([slug, title, refs]) => [`math.im1.skill.5.4.${slug}`, title, refs] as const);

describe('Lesson 5-4 source capabilities', () => {
  it('records readable data and causal evidence limits', () => {
    expect(source).toContain('0.9, 1.0, 1.2, 1.1, 1.4, 1.3, 1.4, 1.2');
    expect(source).toContain('7, 9, 12, 17, 30, 50');
    expect(source).toContain('6.5, 8, 12, 13.5, 20');
    expect(source).toContain('12, 153, 215, 27');
    expect(source).toContain('A plausible mechanism does not by itself prove causation.');
    expect(source).toContain('A justified answer can identify that limit instead of asserting causation.');
    expect(source).toContain('Keep the cheese quantity per pizza constant.');
    expect(source).toContain('Keep page size, font size, and spacing constant.');
    expect(source).toContain('The source says `show boots`; the intended term is `snow boots`.');
  });

  it('preserves exact source IDs and reuses Lesson 5-3 scatter-plot skills', () => {
    for (const document of [canonical, draft, graph, standards]) {
      expect(document.nodes.find((node) => node.id === 'math.im1.example.5.4.017')?.title).toBe('Example 1: Analyze Real-World Data with Scatter Plots');
      expect(document.nodes.find((node) => node.id === 'math.im1.example.5.4.018')?.title).toBe('Example 2: Classify Relationships as Correlation or Causation');
      expect(document.nodes.filter((node) => node.id.startsWith('math.im1.skill.5.4.') && /scatter plot|correlation direction/i.test(node.title))).toEqual([]);
    }
    expect(catalog.blueprints.find((row) => row.nodeId === 'math.im1.skill.5.3.construct-scatter-plots-from-paired-data')?.sourceNodeIds).toEqual(['math.im1.example.5.4.017']);
    expect(catalog.blueprints.find((row) => row.nodeId === 'math.im1.skill.5.3.classify-scatter-plot-correlation')?.sourceNodeIds).toEqual(['math.im1.example.5.3.014', 'math.im1.example.5.4.017']);
  });

  it('keeps each new capability draft, inactive, source-only, and contained by Lesson 5-4', () => {
    for (const [id, title, sourceNodeIds] of definitions) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '5', lesson: '4' } });
      const expectedLessons = [
        'math.im1.lesson.5.4',
        ...(id === 'math.im1.skill.5.4.explain-why-correlation-alone-does-not-establish-causation' ? ['math.im1.lesson.5.5'] : []),
      ];
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual(expectedLessons.map((sourceId) => expect.objectContaining({ type: 'contains', sourceId, targetId: id, reviewStatus: 'draft' })));
    }
  });
});
