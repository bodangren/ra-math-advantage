import { describe, expect, it } from 'vitest';

import nodesDocument from '@/curriculum/skill-graph/nodes.json';
import draftNodesDocument from '@/curriculum/skill-graph/draft-nodes.json';
import blueprintsDocument from '@/curriculum/skill-graph/blueprints.json';
import edgesDocument from '@/curriculum/skill-graph/edges.json';

const missingSkills = [
  'math.im1.skill.3.1.distinguish-independent-and-dependent-variables-in-real-worl',
  'math.im1.skill.3.2.evaluate-functions-using-function-notation-for-numerical-and',
  'math.im1.skill.3.3.determine-whether-a-function-represented-by-an-equation-grap',
  'math.im1.skill.3.4.solve-linear-and-quadratic-equations-by-graphing-and-find-th',
  'math.im1.skill.3.5.locate-relative-maxima-and-minima-on-a-graph-and-describe-th',
  'math.im1.skill.3.6.compare-two-functions-by-interpreting-their-key-features-fro',
] as const;

const exactExampleTitles = new Map([
  ['math.im1.example.3.1.001', 'Example 1: Multiple Representations of a Relation'],
  ['math.im1.example.3.1.002', 'Example 2: Independent and Dependent Variables from Graphs'],
  ['math.im1.example.3.1.003', 'Example 3: Graph Data from a Table'],
  ['math.im1.example.3.1.004', 'Example 4: Graph Data from Ordered Pairs'],
  ['math.im1.example.3.1.005', 'Example 5: Interpret Axes, Scale, and Origin'],
  ['math.im1.example.3.2.006', 'Example 1: Determine Whether a Relation Is a Function'],
  ['math.im1.example.3.2.007', 'Example 2: Domain and Range from Real-World Data'],
  ['math.im1.example.3.2.008', 'Example 3: Evaluate Functions'],
  ['math.im1.example.3.2.009', 'Example 4: Interpret Functions in Context'],
  ['math.im1.example.3.3.010', 'Example 1: Classify Functions from Graphs'],
  ['math.im1.example.3.3.011', 'Example 2: Classify Real-World Functions from Graphs'],
  ['math.im1.example.3.3.012', 'Example 3: Determine Linearity from Equations'],
  ['math.im1.example.3.3.013', 'Example 4: Determine Linearity from Graphs'],
  ['math.im1.example.3.3.014', 'Example 5: Determine Linearity from Tables'],
  ['math.im1.example.3.4.015', 'Example 1: Estimate Intercepts from a Graph'],
  ['math.im1.example.3.4.016', 'Example 2: Estimate Intercepts from a Graph'],
  ['math.im1.example.3.4.017', 'Example 3: Interpret Intercepts in Context'],
  ['math.im1.example.3.4.022', 'Example 4: Find and Interpret Intercepts from a Table'],
  ['math.im1.example.3.4.018', 'Example 5: Solve Equations by Graphing'],
  ['math.im1.example.3.4.019', 'Example 6: Solve Equations by Graphing'],
  ['math.im1.example.3.4.020', 'Example 7: Solve Equations by Graphing'],
  ['math.im1.example.3.4.021', 'Example 8: Find and Interpret the Zero of a Function'],
  ['math.im1.example.3.5.022', 'Example 1: Determine Line Symmetry'],
  ['math.im1.example.3.5.023', 'Example 2: Interpret Symmetry in Context'],
  ['math.im1.example.3.5.024', 'Example 3: Determine Where f(x) Is Increasing and/or Decreasing'],
  ['math.im1.example.3.5.025', 'Example 4: Determine Extrema'],
  ['math.im1.example.3.5.026', 'Example 5: Interpret Extrema in Context'],
  ['math.im1.example.3.5.027', 'Example 6: Determine End Behavior'],
  ['math.im1.example.3.5.028', 'Example 7: Determine End Behavior'],
  ['math.im1.example.3.6.029', 'Example 1: Sketch Linear Functions from Verbal Descriptions'],
  ['math.im1.example.3.6.030', 'Example 2: Sketch Nonlinear Functions and Interpret Key Features'],
  ['math.im1.example.3.6.031', 'Example 3: Sketch and Interpret Real-World Data Trends'],
  ['math.im1.example.3.6.032', 'Example 4: Compare Functions from Descriptions and Graphs'],
]);

describe('IM1 Module 3 source correction', () => {
  it('restores each omitted objective as an inactive draft skill in both node stores', () => {
    for (const id of missingSkills) {
      const node = nodesDocument.nodes.find((row) => row.id === id);
      const draftNode = draftNodesDocument.nodes.find((row) => row.id === id);
      expect(node).toMatchObject({ id, kind: 'skill', reviewStatus: 'draft' });
      expect(draftNode).toEqual(node);
    }
  });

  it('preserves existing example IDs and gives every source example its exact heading', () => {
    for (const [id, title] of exactExampleTitles) {
      const node = nodesDocument.nodes.find((row) => row.id === id);
      const draftNode = draftNodesDocument.nodes.find((row) => row.id === id);
      expect(node).toMatchObject({ id, kind: 'worked_example', title });
      expect(draftNode).toMatchObject({ id, kind: 'worked_example', title });
      expect(node?.sourceRefs[0]).toContain(`curriculum/modules/module-3-lesson-${id.split('.')[4]}`);
      expect(node?.metadata.rawText).toMatch(/^Examples? \d/);
    }
  });

  it('maps each Module 3 capability only to examples that teach that capability', () => {
    const expected = new Map<string, string[]>([
      ['math.im1.skill.3.1.express-a-relation-as-a-table-a-graph-a-mapping-and-a-set-of', ['math.im1.example.3.1.001']],
      [missingSkills[0], ['math.im1.example.3.1.002', 'math.im1.example.3.1.003', 'math.im1.example.3.1.004', 'math.im1.example.3.1.005']],
      ['math.im1.skill.3.2.determine-whether-a-relation-represented-as-a-graph-table-ma', ['math.im1.example.3.2.006', 'math.im1.example.3.2.007']],
      [missingSkills[1], ['math.im1.example.3.2.008', 'math.im1.example.3.2.009']],
      ['math.im1.skill.3.3.determine-whether-a-function-represented-by-a-graph-equation', ['math.im1.example.3.3.010', 'math.im1.example.3.3.011']],
      [missingSkills[2], ['math.im1.example.3.3.012', 'math.im1.example.3.3.013', 'math.im1.example.3.3.014']],
      ['math.im1.skill.3.4.estimate-and-interpret-the-x-and-y-intercepts-of-a-function', ['math.im1.example.3.4.015', 'math.im1.example.3.4.016', 'math.im1.example.3.4.017', 'math.im1.example.3.4.022']],
      [missingSkills[3], ['math.im1.example.3.4.018', 'math.im1.example.3.4.019', 'math.im1.example.3.4.020', 'math.im1.example.3.4.021']],
      ['math.im1.skill.3.5.identify-line-symmetry-in-the-graph-of-a-function-and-determ', ['math.im1.example.3.5.022', 'math.im1.example.3.5.023', 'math.im1.example.3.5.024']],
      [missingSkills[4], ['math.im1.example.3.5.025', 'math.im1.example.3.5.026', 'math.im1.example.3.5.027', 'math.im1.example.3.5.028']],
      ['math.im1.skill.3.6.sketch-graphs-of-real-world-functions-from-verbal-descriptio', ['math.im1.example.3.6.029', 'math.im1.example.3.6.030', 'math.im1.example.3.6.031']],
      [missingSkills[5], ['math.im1.example.3.6.032']],
    ]);
    for (const [nodeId, sourceNodeIds] of expected) {
      expect(blueprintsDocument.blueprints.find((row) => row.nodeId === nodeId)).toMatchObject({
        nodeId,
        sourceNodeIds,
        reviewStatus: 'draft',
      });
    }
  });

  it('does not retain lesson-order edges as inferred prerequisites', () => {
    expect(edgesDocument.edges.filter((edge) => (
      edge.type === 'prerequisite_for'
      && (edge.sourceId.includes('math.im1.skill.3.') || edge.targetId.includes('math.im1.skill.3.'))
      && edge.derivationMethod === 'lesson-sequence-prerequisite-v1'
    ))).toEqual([]);
  });
});
