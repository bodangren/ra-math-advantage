import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import blueprintCatalog from '../../curriculum/skill-graph/blueprints.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-4-lesson-6'), 'utf8');
const lessonId = 'math.im1.lesson.4.6';
const examples = [
  ['math.im1.example.4.6.031', 1, 'Example 1: Graph Piecewise-Defined Functions'],
  ['math.im1.example.4.6.032', 2, 'Example 2: Graph Step Functions'],
  ['math.im1.example.4.6.033', 3, 'Example 3: Model Real-World Situations with Step Functions'],
] as const;
const skills = [
  ['math.im1.skill.4.6.graph-piecewise-defined-functions', 'Graph piecewise-defined functions', ['math.im1.example.4.6.031']],
  ['math.im1.skill.4.6.identify-the-domain-and-range-of-piecewise-defined-functions', 'Identify the domain and range of piecewise-defined functions', ['math.im1.example.4.6.031']],
  ['math.im1.skill.4.6.graph-greatest-integer-step-functions', 'Graph greatest integer step functions', ['math.im1.example.4.6.032']],
  ['math.im1.skill.4.6.identify-the-domain-and-range-of-step-functions', 'Identify the domain and range of step functions', ['math.im1.example.4.6.032']],
  ['math.im1.skill.4.6.model-real-world-situations-with-piecewise-linear-functions', 'Model real-world situations with piecewise-linear functions', []],
  ['math.im1.skill.4.6.model-real-world-situations-with-step-functions', 'Model real-world situations with step functions', ['math.im1.example.4.6.033']],
  ['math.im1.skill.4.6.write-piecewise-functions-from-tables', 'Write piecewise functions from tables', []],
  ['math.im1.skill.4.6.write-piecewise-functions-from-graphs', 'Write piecewise functions from graphs', []],
  ['math.im1.skill.4.6.write-piecewise-functions-from-verbal-descriptions', 'Write piecewise functions from verbal descriptions', []],
  ['math.im1.skill.4.6.write-step-functions-from-tables', 'Write step functions from tables', []],
  ['math.im1.skill.4.6.write-step-functions-from-graphs', 'Write step functions from graphs', []],
  ['math.im1.skill.4.6.write-step-functions-from-verbal-descriptions', 'Write step functions from verbal descriptions', []],
] as const;

describe('Lesson 4-6 source capabilities', () => {
  it('states the distinct domains and boundaries for the two Example 3 models', () => {
    expect(source).toContain('At exactly 0.5 hour, the earnings are $4.');
    expect(source).toContain('Immediately after 0.5 hour, the earnings are $8.');
    expect(source).toContain('For the boxes model, `n` is a nonnegative integer.');
    expect(source).toContain('0 boxes require 0 cases.');
    expect(source).toContain('1 through 12 boxes require 1 case.');
    expect(source).toContain('13 through 24 boxes require 2 cases.');
    expect(source).not.toContain('positive step interval');
  });

  it('records the mismatch between the Problem 17 prompt and figure', () => {
    expect(source).toContain('The Problem 17 figure has two sloped rays. It is not a step-function graph.');
  });

  it('corrects each retained worked-example title without changing its identity', () => {
    for (const document of [canonical, draft, graph, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.4.6.'));
      expect(examples.map(([id]) => rows.find((node) => node.id === id))
        .map((node) => [node?.id, node?.metadata.exampleNumber, node?.title])).toEqual(examples);
      expect(rows).toHaveLength(examples.length);
    }
  });

  it('adds identical draft and inactive source-capability rows to all node catalogs', () => {
    for (const [id, title] of skills) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft')).toBe(true);
      expect(copies.every((node) => node?.independentPracticeReady === false)).toBe(true);
      expect(copies[1]).toEqual(copies[0]);
      expect(copies[2]).toEqual(copies[0]);
      expect(copies[3]).toEqual(copies[0]);
    }
  });

  it('uses only direct source sections and adds only lesson containment', () => {
    for (const [id, _title, sourceNodeIds] of skills) {
      expect(blueprintCatalog.blueprints.find((row) => row.nodeId === id)).toEqual({
        nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft',
        metadata: { course: 'im1', module: '4', lesson: '6' },
      });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([
        expect.objectContaining({ type: 'contains', sourceId: lessonId, targetId: id, reviewStatus: 'draft' }),
      ]);
    }
  });
});
