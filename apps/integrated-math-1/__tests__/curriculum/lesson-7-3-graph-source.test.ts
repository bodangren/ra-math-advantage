import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import activityMap from '../../curriculum/skill-graph/projection/practice-v1-activity-map.json';
import standaloneSrs from '../../curriculum/skill-graph/projection/srs-input.json';
import teacherEvidence from '../../curriculum/skill-graph/projection/teacher-evidence-map.json';

const lessonId = 'math.im1.lesson.7.3';
const legacyId = 'math.im1.skill.7.3.solve-systems-of-linear-equations-using-elimination-by-addit';
const nextId = 'math.im1.skill.7.4.solve-systems-of-linear-equations-using-elimination-when-mul';
const newIds = [
  'math.im1.skill.7.3.choose-addition-or-subtraction-for-direct-elimination',
  'math.im1.skill.7.3.solve-one-solution-systems-by-direct-elimination',
];
const reusedIds = [
  'math.im1.skill.7.1.write-a-two-equation-system-from-a-context',
  'math.im1.skill.7.1.solve-and-interpret-a-contextual-system',
  'math.im1.skill.7.1.determine-a-system-solution-from-a-graph',
  'math.im1.skill.7.1.classify-a-linear-system-by-its-solution-set',
  'math.im1.skill.7.1.construct-systems-with-a-specified-number-of-solutions',
];

describe('Lesson 7-3 graph source repair', () => {
  it('keeps the corrected source identities consistent in all node catalogs', () => {
    for (const document of [canonical, draft, graph, standards]) {
      expect(document.nodes.find(node => node.id === 'math.im1.example.7.3.010')).toMatchObject({
        title: 'Examples 1 and 3: Solve systems by direct elimination', reviewStatus: 'draft',
      });
      expect(document.nodes.find(node => node.id === 'math.im1.example.7.3.011')).toMatchObject({
        title: 'Example 2: Model number relationships with a system and solve by elimination', reviewStatus: 'draft',
      });
      expect(document.nodes.find(node => node.id === 'math.im1.example.7.3.012')).toMatchObject({
        reviewStatus: 'rejected', independentPracticeReady: false, sourceRefs: [],
      });
      expect(document.nodes.find(node => node.id === 'math.im1.example.7.3.013')).toMatchObject({
        title: 'Example 4: Model and solve contextual systems by elimination', reviewStatus: 'draft',
      });
    }
  });

  it('adds only draft inactive source-only blueprints for the two atomic skills', () => {
    for (const id of newIds) {
      for (const document of [canonical, draft, graph, standards]) {
        expect(document.nodes.find(node => node.id === id)).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
      }
      const blueprint = catalog.blueprints.find(row => row.nodeId === id);
      expect(blueprint).toMatchObject({ sourceNodeIds: ['math.im1.example.7.3.010'], alignmentNodeIds: [], reviewStatus: 'draft' });
      expect(blueprint).not.toHaveProperty('workedExampleSpec');
      expect(standaloneSrs.srsInputs.find(row => row.nodeId === id)).toMatchObject({ standards: [], prerequisites: [], rendererKey: null, generatorReady: false });
      expect(teacherEvidence.skills.find(row => row.nodeId === id)).toMatchObject({ standardsCovered: [], independentPracticeReady: false });
      expect(activityMap.activities.filter(row => row.nodeId === id)).toEqual([]);
    }
  });

  it('adds the exact atomic and reuse containment relations', () => {
    for (const id of [...newIds, ...reusedIds]) {
      expect(graph.edges).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: lessonId, targetId: id, reviewStatus: 'draft' }));
    }
    for (const id of newIds) {
      expect(graph.edges.filter(edge => (edge.sourceId === id || edge.targetId === id) && edge.type !== 'contains')).toEqual([]);
    }
  });

  it('keeps the legacy aggregate inactive and removes its placeholder activities', () => {
    for (const document of [canonical, draft, graph, standards]) {
      expect(document.nodes.find(node => node.id === legacyId)).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
    }
    expect(activityMap.activities.filter(row => row.nodeId === legacyId)).toEqual([]);
    expect(catalog.blueprints.find(row => row.nodeId === legacyId)).not.toHaveProperty('rendererKey');
    expect(standaloneSrs.srsInputs.find(row => row.nodeId === legacyId)).toMatchObject({ generatorReady: false });
    expect(activityMap.srsInputs.find(row => row.nodeId === legacyId)).toMatchObject({ generatorReady: false });
  });

  it('removes the unsupported sequence prerequisite from the edge and SRS copies', () => {
    expect(graph.edges.some(edge => edge.id === 'math.im1.edge.1262')).toBe(false);
    expect(standaloneSrs.srsInputs.find(row => row.nodeId === nextId)?.prerequisites).not.toContain(legacyId);
    expect(activityMap.srsInputs.find(row => row.nodeId === nextId)?.prerequisites).not.toContain(legacyId);
  });

  it('does not transfer source or evidence from the rejected duplicate', () => {
    const duplicateId = 'math.im1.example.7.3.012';
    expect(catalog.blueprints.some(row => row.sourceNodeIds.includes(duplicateId))).toBe(false);
    expect(activityMap.teacherEvidence.standards.flatMap(row => row.nodeIds)).not.toContain(duplicateId);
    expect(graph.edges.some(edge => edge.id === 'math.im1.edge.0346' || edge.id === 'math.im1.edge.1011')).toBe(false);
  });
});
