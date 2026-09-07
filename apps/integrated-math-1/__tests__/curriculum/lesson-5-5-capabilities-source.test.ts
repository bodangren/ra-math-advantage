import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import gapQueue from '../../curriculum/skill-graph/generator-gap-queue.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-5-lesson-5'), 'utf8');
const definitions = [
  ['calculate-linear-regression-equations-with-technology', 'Use technology to calculate linear regression equations', ['math.im1.example.5.5.019', 'math.im1.example.5.5.020', 'math.im1.example.5.5.021']],
  ['calculate-correlation-coefficients-with-technology', 'Use technology to calculate correlation coefficients', ['math.im1.example.5.5.019']],
  ['interpret-correlation-direction-and-strength-in-context', 'Interpret correlation direction and strength in context', ['math.im1.example.5.5.019']],
  ['calculate-residuals-from-observed-and-predicted-values', 'Calculate residuals from observed and predicted values', ['math.im1.example.5.5.021']],
  ['construct-residual-plots', 'Construct residual plots', ['math.im1.example.5.5.021']],
  ['assess-linear-model-appropriateness-from-residual-plots', 'Assess linear model appropriateness from residual plots', ['math.im1.example.5.5.021']],
  ['identify-contextual-constraints-on-regression-models', 'Identify contextual constraints on regression models', []],
  ['relate-correlation-sign-and-magnitude-to-linear-model-fit', 'Relate correlation sign and magnitude to linear model fit', []],
  ['compare-student-selected-lines-of-fit-with-regression-models', 'Compare student-selected lines of fit with regression models', []],
  ['evaluate-sample-support-for-population-predictions', 'Evaluate whether sample data support population predictions', []],
].map(([slug, title, refs]) => [`math.im1.skill.5.5.${slug}`, title, refs] as const);

describe('Lesson 5-5 source capabilities', () => {
  it('records readable source data and independently calculated fixtures', () => {
    expect(source).toContain('2010, 2011, 2012, 2013, 2014, 2015');
    expect(source).toContain('48, 52, 50, 46, 48, 42');
    expect(source).toContain('y = -1.3142857x + 50.952381');
    expect(source).toContain('r = -0.713772');
    expect(source).toContain('y = 2100x + 54,960');
    expect(source).toContain('86,460 bottles');
    expect(source).toContain('y = 0.591837x + 1.510204');
    expect(source).toContain('r = 0.892780');
    expect(source).toContain('height values of 0 at 25, 22, and 30 drops');
  });

  it('states the source limits without converting association into causation', () => {
    expect(source).toContain('Random scatter around zero supports a linear model');
    expect(source).toContain('does not prove that the linear model is correct');
    expect(source).toContain('A correlation coefficient of 0.946 can occur when a causal relationship exists or when it does not.');
    expect(source).toContain('The correct classification for the source statement is sometimes true.');
    expect(source).toContain('The equation alone does not determine the magnitude of `r`.');
    expect(source).toContain('6.67 games');
    expect(source).toContain('7.02 games');
  });

  it('preserves and corrects the three worked-example identities', () => {
    for (const document of [canonical, draft, graph, standards]) {
      expect(document.nodes.find((node) => node.id === 'math.im1.example.5.5.019')?.title).toBe('Example 1: Best-Fit Line and Correlation Coefficient');
      expect(document.nodes.find((node) => node.id === 'math.im1.example.5.5.020')?.title).toBe('Example 2: Prediction with Linear Regression');
      expect(document.nodes.find((node) => node.id === 'math.im1.example.5.5.021')?.title).toBe('Example 3: Residual Plot Analysis');
    }
  });

  it('keeps each candidate draft, inactive, source-only, and contained by Lesson 5-5', () => {
    for (const [id, title, sourceNodeIds] of definitions) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '5', lesson: '5' } });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.5.5', targetId: id, reviewStatus: 'draft' })]);
    }
  });

  it('reuses prediction, inverse prediction, extrapolation, and causation capabilities', () => {
    expect(catalog.blueprints.find((row) => row.nodeId === 'math.im1.skill.5.3.predict-response-values-with-lines-of-fit')?.sourceNodeIds).toEqual(['math.im1.example.5.3.015', 'math.im1.example.5.5.020']);
    for (const id of [
      'math.im1.skill.5.3.predict-response-values-with-lines-of-fit',
      'math.im1.skill.5.3.estimate-explanatory-values-with-lines-of-fit',
      'math.im1.skill.5.3.evaluate-extrapolation-reliability-and-assumptions',
      'math.im1.skill.5.4.explain-why-correlation-alone-does-not-establish-causation',
    ]) {
      expect(graph.edges).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.5.5', targetId: id, reviewStatus: 'draft' }));
    }
  });

  it('keeps current artifact totals equal to their arrays', () => {
    expect(gapQueue.meta.totalSkills).toBe(gapQueue.queue.length);
    expect(graph.meta.totalNodes).toBe(graph.nodes.length);
    expect(graph.meta.totalEdges).toBe(graph.edges.length);
  });
});
