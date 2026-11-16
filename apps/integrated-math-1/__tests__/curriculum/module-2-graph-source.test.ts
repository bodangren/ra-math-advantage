import { describe, expect, it } from 'vitest';
import nodesDocument from '../../curriculum/skill-graph/nodes.json';
import draftNodesDocument from '../../curriculum/skill-graph/draft-nodes.json';
import edgesDocument from '../../curriculum/skill-graph/edges.json';
import blueprintsDocument from '../../curriculum/skill-graph/blueprints.json';

const newSkills = [
  ['math.im1.skill.2.1.translate-algebraic-equations-and-formulas-into-complete-ver', '1', '2b: Translate algebraic equations and formulas into complete verbal sentences and interpret formulas in context'],
  ['math.im1.skill.2.2.write-and-solve-one-step-equations-to-model-real-world-situa', '2', '2d: Write and solve one-step equations to model real-world situations and apply the correct Property of Equality to verify solutions'],
  ['math.im1.skill.2.3.solve-literal-equations-for-a-specified-variable-and-solve-e', '3', '2f: Solve literal equations for a specified variable and solve equations requiring the Distributive Property'],
  ['math.im1.skill.2.4.determine-whether-an-equation-has-one-solution-no-solution-o', '4', '2h: Determine whether an equation has one solution, no solution, or is an identity and apply equations to geometric situations'],
  ['math.im1.skill.2.6.apply-proportions-to-percent-situations-scaling-problems-and', '6', '2l: Apply proportions to percent situations, scaling problems, and mixture contexts'],
  ['math.im1.skill.2.7.use-dimensional-analysis-to-convert-between-units-of-measure', '7', '2n: Use dimensional analysis to convert between units of measurement and apply formulas to solve real-world problems'],
] as const;

const legacy2i = 'math.im1.skill.2.5.solve-absolute-value-equations-of-the-form';

describe('IM1 Module 2 graph source coverage', () => {
  it('adds the six source capabilities as inactive draft rows in all node copies', () => {
    for (const [id, lesson, title] of newSkills) {
      const expected = {
        id,
        kind: 'skill',
        title,
        domain: 'math.im1',
        description: `${title.slice(4)}.`,
        sourceRefs: [
          'apps/integrated-math-1/curriculum/module-2-class-period-plan.md',
          `apps/integrated-math-1/curriculum/modules/module-2-lesson-${lesson}`,
        ],
        reviewStatus: 'draft',
        metadata: { course: 'im1', module: '2', lesson },
      };
      const canonical = nodesDocument.nodes.filter((node) => node.id === id);
      const draft = draftNodesDocument.nodes.filter((node) => node.id === id);
      const embedded = edgesDocument.nodes.filter((node) => node.id === id);
      expect(canonical).toEqual([expected]);
      expect(draft).toEqual(canonical);
      expect(embedded).toEqual(canonical);
      expect(canonical[0]).not.toMatchObject({ independentPracticeReady: true });
    }
  });

  it('preserves the 2i identity and restores its complete source meaning', () => {
    const expectedText = 'Solve absolute value equations of the form |expression| = constant and recognize when no solution exists.';
    for (const document of [nodesDocument, draftNodesDocument, edgesDocument]) {
      const rows = document.nodes.filter((node) => node.id === legacy2i);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        title: `2i: ${expectedText.slice(0, -1)}`,
        description: expectedText,
      });
    }
    expect(nodesDocument.nodes.some((node) => node.id === 'math.im1.skill.2.5.solve-absolute-value-equations-of-the-form-expression-consta')).toBe(false);
  });

  it('adds exact lesson containment and no inferred relationship', () => {
    for (const [id, lesson] of newSkills) {
      expect(edgesDocument.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([
        expect.objectContaining({
          type: 'contains',
          sourceId: `math.im1.lesson.2.${lesson}`,
          targetId: id,
          reviewStatus: 'draft',
        }),
      ]);
    }
  });

  it('maps each Module 2 capability only to unambiguous current source examples', () => {
    const expected = new Map<string, string[]>([
      ['math.im1.skill.2.1.translate-verbal-sentences-and-real-world-situations-into-al', ['math.im1.example.2.1.001', 'math.im1.example.2.1.002', 'math.im1.example.2.1.003']],
      [newSkills[0][0], ['math.im1.example.2.1.004', 'math.im1.example.2.1.005', 'math.im1.example.2.1.006']],
      ['math.im1.skill.2.2.solve-one-step-equations-involving-addition-subtraction-mult', ['math.im1.example.2.2.007', 'math.im1.example.2.2.008']],
      [newSkills[1][0], ['math.im1.example.2.2.009', 'math.im1.example.2.2.010', 'math.im1.example.2.2.011']],
      ['math.im1.skill.2.3.solve-multi-step-linear-equations-using-properties-of-equali', ['math.im1.example.2.3.012', 'math.im1.example.2.3.013', 'math.im1.example.10.3.010', 'math.im1.lesson.10.3']],
      [newSkills[2][0], ['math.im1.example.2.3.015']],
      ['math.im1.skill.2.4.solve-linear-equations-that-have-the-variable-on-both-sides', ['math.im1.example.2.4.016', 'math.im1.example.2.4.017', 'math.im1.example.10.3.010', 'math.im1.example.10.3.011', 'math.im1.example.10.3.028', 'math.im1.lesson.10.3']],
      [newSkills[3][0], ['math.im1.example.2.4.018', 'math.im1.example.2.4.019']],
      [legacy2i, ['math.im1.example.2.5.source-001', 'math.im1.example.2.5.source-002', 'math.im1.example.2.5.020']],
      ['math.im1.skill.2.5.graph-the-solution-set-of-an-absolute-value-equation-on-a-nu', ['math.im1.example.2.5.source-001']],
      ['math.im1.skill.2.6.solve-proportions-algebraically-including-those-with-variabl', ['math.im1.example.2.6.022', 'math.im1.example.2.6.023', 'math.im1.example.2.6.024']],
      [newSkills[4][0], ['math.im1.example.2.6.024', 'math.im1.example.2.6.026']],
      ['math.im1.skill.2.7.solve-literal-equations-and-formulas-for-a-specified-variabl', ['math.im1.example.2.7.027', 'math.im1.example.2.7.028', 'math.im1.example.2.7.029', 'math.im1.example.2.7.030']],
      [newSkills[5][0], ['math.im1.example.2.7.031', 'math.im1.example.2.7.032', 'math.im1.example.2.7.033']],
    ]);
    for (const [nodeId, sourceNodeIds] of expected) {
      expect(blueprintsDocument.blueprints.find((row) => row.nodeId === nodeId)?.sourceNodeIds).toEqual(sourceNodeIds);
      for (const sourceNodeId of sourceNodeIds) {
        const source = nodesDocument.nodes.find((node) => node.id === sourceNodeId);
        if (sourceNodeId.startsWith('math.im1.example.2.')) expect(source).toMatchObject({ kind: 'worked_example', metadata: { lesson: nodeId.split('.')[4] } });
        else expect(source).toMatchObject({ metadata: { lesson: '3', module: '10' } });
        const exampleNumber = source?.metadata.exampleNumber;
        if (sourceNodeId.startsWith('math.im1.example.2.')) expect(source?.title).toMatch(new RegExp(`^Example ${exampleNumber}:`));
      }
    }

    const intendedTitle = new Map<string, RegExp>([
      ['math.im1.skill.2.1.translate-verbal-sentences-and-real-world-situations-into-al', /Write an Equation|Translate Sentences/],
      [newSkills[0][0], /Write a Sentence|Interpret Formulas/],
      ['math.im1.skill.2.2.solve-one-step-equations-involving-addition-subtraction-mult', /Solve Addition|Solve Multiplication/],
      [newSkills[1][0], /Real-World Equations|Fractions|Percentages/],
      ['math.im1.skill.2.3.solve-multi-step-linear-equations-using-properties-of-equali', /Solve Linear Equations|Word Problems/],
      [newSkills[2][0], /Solve Literal Equations/],
      ['math.im1.skill.2.4.solve-linear-equations-that-have-the-variable-on-both-sides', /Variables on Both Sides|Word Problems/],
      [newSkills[3][0], /Geometry Applications|Classify Equations/],
      ['math.im1.skill.2.5.graph-the-solution-set-of-an-absolute-value-equation-on-a-nu', /Solve and Graph Simple Absolute Value Equations/],
      ['math.im1.skill.2.6.solve-proportions-algebraically-including-those-with-variabl', /Basic Proportions|Linear Expressions|Real-World Proportion Problems/],
      [newSkills[4][0], /Real-World Proportion Problems|Percent and Mixture Problems/],
      ['math.im1.skill.2.7.solve-literal-equations-and-formulas-for-a-specified-variabl', /Solve for a Specified Variable|Apply Formulas|Constraints/],
      [newSkills[5][0], /Dimensional Analysis and Unit Conversion/],
    ]);
    for (const [nodeId, titlePattern] of intendedTitle) {
      const sourceIds = blueprintsDocument.blueprints.find((row) => row.nodeId === nodeId)?.sourceNodeIds ?? [];
      for (const sourceId of sourceIds.filter((id) => id.startsWith('math.im1.example.2.'))) {
        expect(nodesDocument.nodes.find((node) => node.id === sourceId)?.title).toMatch(titlePattern);
      }
    }

    const unresolvedDuplicateOccurrences = new Set([
      'math.im1.example.2.3.014',
      'math.im1.example.2.6.025',
    ]);
    const moduleTwoLinks = blueprintsDocument.blueprints
      .filter((row) => row.nodeId.startsWith('math.im1.skill.2.'))
      .flatMap((row) => row.sourceNodeIds);
    for (const unresolvedId of unresolvedDuplicateOccurrences) {
      expect(moduleTwoLinks).not.toContain(unresolvedId);
    }
  });
});
