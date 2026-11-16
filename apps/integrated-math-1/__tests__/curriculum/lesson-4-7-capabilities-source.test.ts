import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import blueprintCatalog from '../../curriculum/skill-graph/blueprints.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-4-lesson-7'), 'utf8');
const examples = [
  ['math.im1.example.4.7.034', 1, 'Example 1: Describe Translations'],
  ['math.im1.example.4.7.035', 2, 'Example 2: Write the Equation from a Graph'],
  ['math.im1.example.4.7.036', 3, 'Example 3: Describe Dilations'],
  ['math.im1.example.4.7.037', 4, 'Example 4: Describe Combined Transformations'],
  ['math.im1.example.4.7.038', 5, 'Example 5: Graph Absolute Value Functions and State Domain and Range'],
  ['math.im1.example.4.7.039', 2, 'Example 2: Write the Equation from a Graph'],
  ['math.im1.example.4.7.040', 6, 'Example 6: Model with Absolute Value Functions'],
] as const;
const skills = [
  ['math.im1.skill.4.7.describe-translations-of-absolute-value-functions-from-equations', 'Describe translations of absolute value functions from equations', ['math.im1.example.4.7.034']],
  ['math.im1.skill.4.7.write-absolute-value-equations-from-graphs', 'Write absolute value equations from graphs', ['math.im1.example.4.7.035']],
  ['math.im1.skill.4.7.describe-dilations-of-absolute-value-functions-from-equations', 'Describe dilations of absolute value functions from equations', ['math.im1.example.4.7.036']],
  ['math.im1.skill.4.7.describe-reflections-of-absolute-value-functions-from-equations', 'Describe reflections of absolute value functions from equations', ['math.im1.example.4.7.037']],
  ['math.im1.skill.4.7.describe-combined-transformations-of-absolute-value-functions', 'Describe combined transformations of absolute value functions', ['math.im1.example.4.7.037']],
  ['math.im1.skill.4.7.graph-absolute-value-functions', 'Graph absolute value functions', ['math.im1.example.4.7.038']],
  ['math.im1.skill.4.7.identify-the-domain-and-range-of-absolute-value-functions', 'Identify the domain and range of absolute value functions', ['math.im1.example.4.7.038']],
  ['math.im1.skill.4.7.model-real-world-situations-with-absolute-value-functions', 'Model real-world situations with absolute value functions', ['math.im1.example.4.7.040']],
] as const;

describe('Lesson 4-7 source capabilities', () => {
  it('uses the inside coefficient and explains absolute-value reflection symmetry', () => {
    expect(source).toContain('A coefficient [ b ] inside the absolute value');
    expect(source).not.toContain('**Horizontal stretch/compression:** [ |a|');
    expect(source).toContain('For the parent [ f(x) = |x| ], this y-axis reflection has the same graph because the parent is even.');
  });

  it('keeps Example 15 graph modeling separate from tolerance exercises', () => {
    const example6 = source.slice(source.indexOf('## Example 6'), source.indexOf('## Mixed Exercises'));
    expect(example6).toContain('Use each provided situation graph');
    expect(example6).toContain('escalator');
    expect(example6).toContain('travel');
    expect(example6).not.toContain('bag should contain 16 ounces');
  });

  it('corrects retained titles while preserving the duplicate Example 2 identity', () => {
    for (const document of [canonical, draft, graph, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.4.7.'));
      expect(examples.map(([id]) => rows.find((node) => node.id === id))
        .map((node) => [node?.id, node?.metadata.exampleNumber, node?.title])).toEqual(examples);
      expect(rows).toHaveLength(examples.length);
    }
  });

  it('adds draft inactive rows with exact source-only blueprints and containment', () => {
    for (const [id, title, sourceNodeIds] of skills) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1).every((node) => JSON.stringify(node) === JSON.stringify(copies[0]))).toBe(true);
      expect(blueprintCatalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '4', lesson: '7' } });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.4.7', targetId: id, reviewStatus: 'draft' })]);
    }
  });
});
