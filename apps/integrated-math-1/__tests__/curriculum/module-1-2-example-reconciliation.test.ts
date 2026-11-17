import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import nodesDocument from '../../curriculum/skill-graph/nodes.json';
import draftNodesDocument from '../../curriculum/skill-graph/draft-nodes.json';
import edgesDocument from '../../curriculum/skill-graph/edges.json';
import blueprintsDocument from '../../curriculum/skill-graph/blueprints.json';

const curriculumRoot = resolve(import.meta.dirname, '../../curriculum');
const duplicateIds = [
  'math.im1.example.1.4.022',
  'math.im1.example.1.5.028',
  'math.im1.example.2.3.014',
  'math.im1.example.2.6.025',
];

function sourceExamples() {
  const examples = new Map<string, { title: string; sourcePath: string }>();
  for (const moduleNumber of [1, 2]) {
    const lessonCount = moduleNumber === 1 ? 6 : 7;
    for (let lesson = 1; lesson <= lessonCount; lesson += 1) {
      const sourcePath = `apps/integrated-math-1/curriculum/modules/module-${moduleNumber}-lesson-${lesson}`;
      const lines = readFileSync(resolve(curriculumRoot, `modules/module-${moduleNumber}-lesson-${lesson}`), 'utf8').split('\n');
      lines.forEach((line, index) => {
        const match = /^## Examples? ([\d, -]+(?:and \d+)?) — (.+)$/.exec(line);
        if (!match) return;
        const numberText = match[1].replace(/and/g, ',');
        const numbers = numberText.includes('-')
          ? (() => {
              const [start, end] = numberText.split('-').map(Number);
              return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
            })()
          : numberText.split(',').map(value => value.trim()).filter(Boolean).map(Number);
        for (const exampleNumber of numbers) {
          examples.set(`${moduleNumber}-${lesson}-${exampleNumber}`, {
            title: `Example ${exampleNumber}: ${match[2]}`,
            sourcePath: `${sourcePath} (heading at line ${index + 1})`,
          });
        }
      });
    }
  }
  return examples;
}

describe('IM1 Modules 1 and 2 stored example reconciliation', () => {
  it('stores every actual lesson example once with its exact heading location', () => {
    const expected = sourceExamples();
    expect(expected.size).toBe(67);
    for (const document of [nodesDocument, draftNodesDocument, edgesDocument]) {
      const rows = document.nodes.filter(node =>
        node.kind === 'worked_example' && ['1', '2'].includes(String(node.metadata?.module)),
      );
      expect(rows).toHaveLength(expected.size);
      for (const [identity, source] of expected) {
        const [moduleNumber, lesson, exampleNumber] = identity.split('-');
        const matches = rows.filter(node =>
          String(node.metadata?.module) === moduleNumber &&
          String(node.metadata?.lesson) === lesson &&
          Number(node.metadata?.exampleNumber) === Number(exampleNumber),
        );
        expect(matches, identity).toHaveLength(1);
        expect(matches[0]?.title).toBe(source.title);
        expect(matches[0]?.sourceRefs).toContain(source.sourcePath);
      }
    }
  });

  it('removes duplicate IDs and leaves no owned reference dangling', () => {
    const nodeIds = new Set(nodesDocument.nodes.map(node => node.id));
    for (const id of duplicateIds) {
      expect(nodeIds.has(id), id).toBe(false);
      expect(JSON.stringify(draftNodesDocument)).not.toContain(id);
      expect(JSON.stringify(edgesDocument)).not.toContain(id);
      expect(JSON.stringify(blueprintsDocument)).not.toContain(id);
    }
    for (const edge of edgesDocument.edges) {
      expect(nodeIds.has(edge.sourceId), edge.id).toBe(true);
      expect(nodeIds.has(edge.targetId), edge.id).toBe(true);
    }
  });

  it('links each corrected source only to capabilities that its lesson body teaches', () => {
    const sources = (nodeId: string) =>
      blueprintsDocument.blueprints.find(row => row.nodeId === nodeId)?.sourceNodeIds ?? [];

    expect(sources('math.im1.skill.1.4.apply-the-distributive-property-to-rewrite-and-evaluate-nume')).not.toContain('math.im1.example.1.4.021');
    expect(sources('math.im1.skill.1.4.use-the-distributive-property-to-simplify-algebraic-expressi')).toContain('math.im1.example.1.4.021');

    expect(sources('math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista')).not.toContain('math.im1.example.1.5.027');
    expect(sources('math.im1.skill.1.5.evaluate-absolute-value-expressions-by-substituting-given-va')).toContain('math.im1.example.1.5.027');

    expect(sources('math.im1.skill.2.3.solve-literal-equations-for-a-specified-variable-and-solve-e')).not.toContain('math.im1.example.2.3.013');
    expect(sources('math.im1.skill.2.3.solve-literal-equations-for-a-specified-variable-and-solve-e')).toContain('math.im1.example.2.3.015');

    expect(sources('math.im1.skill.2.5.solve-absolute-value-equations-of-the-form')).toEqual([
      'math.im1.example.2.5.022',
      'math.im1.example.2.5.023',
      'math.im1.example.2.5.020',
    ]);
    expect(sources('math.im1.skill.2.5.graph-the-solution-set-of-an-absolute-value-equation-on-a-nu')).toEqual([
      'math.im1.example.2.5.022',
    ]);

    expect(sources('math.im1.skill.2.6.solve-proportions-algebraically-including-those-with-variabl')).toContain('math.im1.example.2.6.024');
    expect(sources('math.im1.skill.2.6.apply-proportions-to-percent-situations-scaling-problems-and')).toContain('math.im1.example.2.6.024');
  });
});
