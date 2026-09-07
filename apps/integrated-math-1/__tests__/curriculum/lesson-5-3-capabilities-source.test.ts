import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import gapQueue from '../../curriculum/skill-graph/generator-gap-queue.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-5-lesson-3'), 'utf8');
const definitions = [
  ['classify-scatter-plot-correlation', 'Classify scatter-plot correlation', ['math.im1.example.5.3.014', 'math.im1.example.5.4.017']],
  ['interpret-scatter-plot-correlation-in-context', 'Interpret scatter-plot correlation in context', ['math.im1.example.5.3.014']],
  ['construct-scatter-plots-from-paired-data', 'Construct scatter plots from paired data', ['math.im1.example.5.4.017']],
  ['draw-reasonable-lines-of-fit', 'Draw reasonable lines of fit', []],
  ['write-line-of-fit-equations-from-specified-points', 'Write line-of-fit equations from specified points', ['math.im1.example.5.3.015']],
  ['write-equations-from-student-selected-fit-points', 'Write equations from student-selected fit points', []],
  ['predict-response-values-with-lines-of-fit', 'Predict response values with lines of fit', ['math.im1.example.5.3.015', 'math.im1.example.5.5.020']],
  ['estimate-explanatory-values-with-lines-of-fit', 'Estimate explanatory values with lines of fit', []],
  ['evaluate-extrapolation-reliability-and-assumptions', 'Evaluate extrapolation reliability and assumptions', []],
  ['interpret-line-of-fit-intercepts-in-context', 'Interpret line-of-fit intercepts in context', []],
  ['compare-lines-of-fit-and-justify-model-choice', 'Compare lines of fit and justify model choice', []],
  ['create-contexts-with-specified-correlation-patterns', 'Create contexts with specified correlation patterns', []],
].map(([slug, title, refs]) => [`math.im1.skill.5.3.${slug}`, title, refs] as const);

describe('Lesson 5-3 source capabilities', () => {
  it('keeps current artifact totals equal to their arrays', () => {
    expect(gapQueue.meta.totalSkills).toBe(gapQueue.queue.length);
    expect(graph.meta.totalNodes).toBe(graph.nodes.length);
    expect(graph.meta.totalEdges).toBe(graph.edges.length);
  });

  it('records complete source mathematics and visible content', () => {
    expect(source).toContain('y = -328.275x + 3142.15');
    expect(source).toContain('187.675 million CDs');
    expect(source).toContain('y = 16.1x + 210.8');
    expect(source).toContain('$452,300');
    expect(source).toContain('Problems 1 through 4 show positive, no, negative, and positive correlation');
    expect(source).toContain('Problem 18 contains four readable situations');
  });

  it('preserves the worked IDs and does not use repeated Example 2 as separate evidence', () => {
    for (const document of [canonical, draft, graph, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.5.3.'));
      expect(rows.find((node) => node.id === 'math.im1.example.5.3.014')?.metadata.exampleNumber).toBe(1);
      expect(rows.find((node) => node.id === 'math.im1.example.5.3.015')?.metadata.exampleNumber).toBe(2);
      expect(rows.find((node) => node.id === 'math.im1.example.5.3.016')?.metadata.exampleNumber).toBe(2);
    }
    expect(catalog.blueprints.filter((row) => row.sourceNodeIds.includes('math.im1.example.5.3.016'))).toEqual([]);
  });

  it('keeps each candidate draft, inactive, source-only, and contained by Lesson 5-3', () => {
    for (const [id, title, sourceNodeIds] of definitions) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '5', lesson: '3' } });
      const expectedLessons = [
        'math.im1.lesson.5.3',
        ...(['math.im1.skill.5.3.classify-scatter-plot-correlation', 'math.im1.skill.5.3.construct-scatter-plots-from-paired-data'].includes(id) ? ['math.im1.lesson.5.4'] : []),
        ...(['math.im1.skill.5.3.predict-response-values-with-lines-of-fit', 'math.im1.skill.5.3.estimate-explanatory-values-with-lines-of-fit', 'math.im1.skill.5.3.evaluate-extrapolation-reliability-and-assumptions'].includes(id) ? ['math.im1.lesson.5.5'] : []),
      ];
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual(expectedLessons.map((sourceId) => expect.objectContaining({ type: 'contains', sourceId, targetId: id, reviewStatus: 'draft' })));
    }
  });
});
