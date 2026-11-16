import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-5-lesson-2'), 'utf8');
const examples = [
  ['math.im1.example.5.2.007', 1, 'Example 1: Write Point-Slope Form Given a Point and Slope'],
  ['math.im1.example.5.2.008', 2, 'Example 2: Write Point-Slope Form Given Two Points'],
  ['math.im1.example.5.2.009', 3, 'Example 3: Convert Point-Slope Form to Slope-Intercept Form'],
  ['math.im1.example.5.2.source-004', 4, 'Example 4: Model Real-World Situations in Point-Slope Form'],
  ['math.im1.example.5.2.010', 5, 'Example 5: Convert Equations to Standard Form'],
  ['math.im1.example.5.2.source-006', 6, 'Example 6: Write Standard Form Given Two Points'],
  ['math.im1.example.5.2.011', 7, 'Example 7 and 8: Write Parallel and Perpendicular Lines Through a Point'],
  ['math.im1.example.5.2.012', 8, 'Example 7 and 8: Write Parallel and Perpendicular Lines Through a Point'],
  ['math.im1.example.5.2.013', 9, 'Example 9: Determine Parallel, Perpendicular, or Neither'],
] as const;
const skills = [
  ['write-point-slope-equations-from-a-point-and-slope', 'Write point-slope equations from a point and slope', ['math.im1.example.5.2.007']],
  ['write-point-slope-equations-from-two-points', 'Write point-slope equations from two points', ['math.im1.example.5.2.008']],
  ['convert-point-slope-form-to-slope-intercept-form', 'Convert point-slope form to slope-intercept form', ['math.im1.example.5.2.009']],
  ['model-contexts-in-point-slope-form', 'Model real-world contexts in point-slope form', ['math.im1.example.5.2.source-004']],
  ['convert-linear-equations-to-standard-form', 'Convert linear equations to standard form', ['math.im1.example.5.2.010']],
  ['write-standard-form-equations-from-two-points', 'Write standard-form equations from two points', ['math.im1.example.5.2.source-006']],
  ['write-parallel-line-equations-through-a-point', 'Write parallel-line equations through a point', ['math.im1.example.5.2.011', 'math.im1.example.5.2.012']],
  ['write-perpendicular-line-equations-through-a-point', 'Write perpendicular-line equations through a point', ['math.im1.example.5.2.011', 'math.im1.example.5.2.012']],
  ['classify-lines-as-parallel-perpendicular-or-neither', 'Classify lines as parallel, perpendicular, or neither', ['math.im1.example.5.2.013']],
  ['graph-lines-from-point-slope-information', 'Graph lines from point-slope information', ['math.im1.example.5.2.007']],
  ['write-standard-form-equations-from-intercepts', 'Write standard-form equations from intercepts', []],
  ['find-a-missing-coordinate-for-collinear-points', 'Find a missing coordinate for collinear points', []],
].map(([slug, title, refs]) => [`math.im1.skill.5.2.${slug}`, title, refs] as const);

describe('Lesson 5-2 source capabilities', () => {
  it('uses the plotted cricket points and preserves valid worked mathematics', () => {
    expect(source).toContain('point [ (20, 60) ] and slope [ m = 1 ]');
    expect(source).toContain('y - 60 = 1(x - 20)');
    expect(source).toContain('2x + 3y = -13');
    expect(source).toContain('y = x - 5');
    expect(source).toContain('y = -x + 1');
    expect(source).toContain('[ A ] and [ B ] are not both zero');
    expect(source).toContain('Vertical parallel lines are a separate case.');
    expect(source).toContain('A horizontal line and a vertical line are perpendicular.');
    expect(source).toContain('The worksheet uses one combined heading for Examples 7 and 8.');
  });

  it('preserves prior example IDs and restores the two missing source examples', () => {
    for (const document of [canonical, draft, graph, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.5.2.'));
      expect(examples.map(([id]) => rows.find((node) => node.id === id)).map((node) => [node?.id, node?.metadata.exampleNumber, node?.title])).toEqual(examples);
    }
  });

  it('keeps each new capability draft, inactive, source-only, and contained by Lesson 5-2', () => {
    for (const [id, title, sourceNodeIds] of skills) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '5', lesson: '2' } });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.5.2', targetId: id, reviewStatus: 'draft' })]);
    }
  });
});
