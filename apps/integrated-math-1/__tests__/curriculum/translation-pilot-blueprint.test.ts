import { describe, expect, it } from 'vitest';
import { knowledgeBlueprintSchema, projectActivityMap, projectSrsInputs, projectTeacherEvidence } from '@math-platform/knowledge-space-practice';
import { projectIM1VerbalToNumerical } from '@math-platform/math-content/knowledge-space';
import blueprints from '../../curriculum/skill-graph/blueprints.json';
import draftNodes from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import nodes from '../../curriculum/skill-graph/nodes.json';
import saved from '../../curriculum/skill-graph/projection/practice-v1-activity-map.json';
import srs from '../../curriculum/skill-graph/projection/srs-input.json';
import teacher from '../../curriculum/skill-graph/projection/teacher-evidence-map.json';
import standardGraph from '../../curriculum/skill-graph/standard-edges.json';

const nodeId = 'math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express';
const modes = ['worked_example', 'guided_practice', 'independent_practice'] as const;
const seeds = [1101, 1110, 1103] as const;
const blueprint = blueprints.blueprints.find(row => row.nodeId === nodeId)!;

describe('IM1 translation catalog and runtime agreement', () => {
  it('assesses the expression instead of its numeric value', () => {
    const parsed = knowledgeBlueprintSchema.parse(blueprint);
    expect(Object.keys(parsed.workedExampleSpec!.target)).toEqual(['expression']);
    expect(parsed.independentPracticeSpec!.answerSchema).toEqual({ expression: 'string' });
    expect(parsed.independentPracticeSpec!.gradingRules).toEqual([
      { partId: 'expression', ruleType: 'custom', maxScore: 1 },
    ]);
    expect(parsed.reviewStatus).toBe('draft');
  });

  it('projects all three exact-node modes with the same public props as the seed adapter', () => {
    const parsed = knowledgeBlueprintSchema.parse(blueprint);
    const node = nodes.nodes.find(row => row.id === nodeId)!;
    const rows = projectActivityMap([node as Parameters<typeof projectActivityMap>[0][number]], graph.edges as Parameters<typeof projectActivityMap>[1], [parsed]);
    expect(rows.map(row => row.mode)).toEqual([...modes]);
    for (const [index, mode] of modes.entries()) {
      const id = `${nodeId}.${mode}`;
      const expected = projectIM1VerbalToNumerical({ nodeId, seed: seeds[index], difficulty: 1 }, mode, id);
      const row = rows.find(row => row.mode === mode)!;
      expect(row.alignmentNodeIds).toEqual([]);
      expect(row.rendererKey).toBe(expected.componentKey);
      expect(row.props).toEqual(expected.props);
      expect(row.srsEligible).toBe(false);
      const persisted = saved.activities.find(row => row.stableActivityId === id)!;
      expect(persisted.props).toEqual(expected.props);
      expect(persisted.rendererKey).toBe(expected.componentKey);
      expect(persisted.sourceNodeIds).toEqual(parsed.sourceNodeIds);
      expect(persisted.srsEligible).toBe(false);
    }
    expect(parsed.guidedPracticeSpec!.rendererProps).toMatchObject({
      template: expect.stringContaining('the sum of 9 and 11, divided by 10'),
      blanks: [{ correctAnswer: '(9 + 11) / 10' }],
    });
  });

  it('keeps the selected node draft, inactive, and free of unsupported direct alignments', () => {
    const copies = [nodes.nodes, draftNodes.nodes, graph.nodes, standardGraph.nodes]
      .map(rows => rows.find(row => row.id === nodeId));
    expect(copies[0]).toBeDefined();
    for (const copy of copies) {
      expect(copy).toEqual(copies[0]);
      expect(copy?.reviewStatus).toBe('draft');
    }

    expect(blueprint.alignmentNodeIds).toEqual([]);
    const currentNodes = nodes.nodes as Parameters<typeof projectActivityMap>[0];
    const currentEdges = graph.edges as Parameters<typeof projectActivityMap>[1];
    expect(projectSrsInputs(currentNodes, currentEdges, [knowledgeBlueprintSchema.parse(blueprint)]).find(row => row.nodeId === nodeId)?.standards).toEqual([]);
    expect(projectTeacherEvidence(currentNodes, currentEdges).skills.find(row => row.nodeId === nodeId)?.standardsCovered).toEqual([]);
    const selectedActivities = saved.activities.filter(row => row.nodeId === nodeId);
    expect(selectedActivities).toHaveLength(3);
    expect(selectedActivities.every(row => row.alignmentNodeIds.length === 0)).toBe(true);
    expect(selectedActivities.every(row => !row.srsEligible)).toBe(true);

    const srsRow = srs.srsInputs.find(row => row.nodeId === nodeId)!;
    expect(srsRow).toMatchObject({
      standards: [],
      rendererKey: 'fill-in-the-blank',
      generatorKey: '1-1-verbal-to-numerical',
      generatorReady: false,
    });
    const teacherRow = teacher.skills.find(row => row.nodeId === nodeId)!;
    expect(teacherRow).toMatchObject({
      standardsCovered: [],
      independentPracticeReady: false,
    });
    for (const standardId of [
      'math.standard.ccss.6-ee-a-1',
      'math.standard.ccss.6-ee-a-2',
    ]) {
      const standard = teacher.standards.find(row => row.standardId === standardId)!;
      expect(standard.nodeIds).not.toContain(nodeId);
    }

    const alignmentIds = [
      'math.alignment.im1-skill-1-1-translate-verbal-descriptions-into-correct-numerical-express-to-ccss-6-ee-a-1',
      'math.alignment.im1-skill-1-1-translate-verbal-descriptions-into-correct-numerical-express-to-ccss-6-ee-a-2',
    ];
    for (const data of [graph, standardGraph]) {
      const selectedEdges = data.edges.filter(edge => alignmentIds.includes(edge.id));
      expect(selectedEdges.map(edge => edge.id).sort()).toEqual([...alignmentIds].sort());
      expect(selectedEdges.every(edge => edge.reviewStatus === 'rejected')).toBe(true);
      expect(selectedEdges.every(edge => edge.rationale.toLowerCase().includes('not assess'))).toBe(true);
    }
  });
});
