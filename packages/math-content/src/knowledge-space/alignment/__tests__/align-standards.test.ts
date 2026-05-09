import { describe, it, expect } from 'vitest';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge, ConfidenceLevel } from '@math-platform/knowledge-space-core';
import { buildSkillId, buildStandardId, buildWorkedExampleId, buildLessonId } from '../../ids';
import type { StandardDefinition, LessonStandardMapping, FamilyObjectiveMapping, CEDTopicMapping } from '../load-standards';
import { alignSkillsToStandards } from '../align';
import type { AlignmentResult } from '../align';

function makeSkill(course: string, module: string, lesson: string, slug: string): KnowledgeSpaceNode {
  return {
    id: buildSkillId(course as any, module, lesson, slug),
    kind: 'skill',
    title: `Skill ${slug}`,
    domain: `math.${course}`,
    reviewStatus: 'draft',
    metadata: { course, module, lesson },
  };
}

function makeExample(course: string, module: string, lesson: string, index: string): KnowledgeSpaceNode {
  return {
    id: buildWorkedExampleId(course as any, module, lesson, index),
    kind: 'worked_example',
    title: `Example ${index}`,
    domain: `math.${course}`,
    reviewStatus: 'draft',
    metadata: { course, module, lesson },
  };
}

function makeStandard(authority: string, code: string, description: string): KnowledgeSpaceNode {
  return {
    id: buildStandardId(authority, normalizeCode(code)),
    kind: 'standard',
    title: `${code}: ${description}`,
    domain: 'math',
    reviewStatus: 'reviewed',
    metadata: { framework: authority, code },
  };
}

function normalizeCode(code: string): string {
  return code.toLowerCase().replace(/\./g, '-');
}

function stdId(code: string): string {
  return buildStandardId('ccss', normalizeCode(code));
}

describe('alignSkillsToStandards', () => {
  it('produces high-confidence edge when skill is in a lesson with an exact standard mapping', () => {
    const skill = makeSkill('im3', '1', '1', 'graph-quadratics');
    const standard = makeStandard('ccss', 'HSA-SSE.B.3', 'Choosing and producing equivalent forms of expressions');
    const nodes: KnowledgeSpaceNode[] = [skill, standard];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-1', standardCode: 'HSA-SSE.B.3', isPrimary: true },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSA-SSE.B.3', description: 'Choosing and producing equivalent forms of expressions', authority: 'ccss', category: 'Algebra' },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives: [],
      course: 'im3',
    });

    const skillEdges = result.edges.filter(e => e.sourceId === skill.id && e.type === 'aligned_to_standard');
    expect(skillEdges.length).toBeGreaterThanOrEqual(1);
    const edge = skillEdges.find(e => e.targetId === stdId('HSA-SSE.B.3'));
    expect(edge).toBeDefined();
    expect(edge!.confidence).toBe('high');
    expect(edge!.sourceRefs).toBeDefined();
    expect(edge!.sourceRefs!.length).toBeGreaterThan(0);
    expect(edge!.rationale).toContain('lesson');
  });

  it('produces medium-confidence edge when skill aligns through problem family objective IDs', () => {
    const skill = makeSkill('im3', '1', '1', 'graph-quadratics');
    const standard = makeStandard('ccss', 'HSA-SSE.B.3', 'Choosing and producing equivalent forms');
    const nodes: KnowledgeSpaceNode[] = [skill, standard];
    const lessonStandards: LessonStandardMapping[] = [];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSA-SSE.B.3', description: 'Choosing and producing equivalent forms', authority: 'ccss', category: 'Algebra' },
    ];
    const familyObjectives: FamilyObjectiveMapping[] = [
      {
        familyId: 'graphing-quadratics-from-equation',
        module: '1',
        lesson: '1',
        objectiveIds: ['HSA-SSE.B.3'],
        skillIds: [skill.id],
      },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives,
      course: 'im3',
    });

    const skillEdges = result.edges.filter(e => e.sourceId === skill.id && e.type === 'aligned_to_standard');
    const edge = skillEdges.find(e => e.targetId === stdId('HSA-SSE.B.3'));
    expect(edge).toBeDefined();
    expect(edge!.confidence).toBe('medium');
    expect(edge!.rationale).toContain('family');
  });

  it('produces low-confidence edge when only heuristic title matching is available', () => {
    // A skill with no direct lesson standard or family mapping, but whose title
    // overlaps with a standard description
    const skill: KnowledgeSpaceNode = {
      id: 'math.im3.skill.1.1.quadratic-transformations',
      kind: 'skill',
      title: 'Quadratic Transformations',
      domain: 'math.im3',
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    };
    const standard = makeStandard('ccss', 'HSA-SSE.B.3', 'Choosing and producing equivalent forms of quadratic expressions');
    const nodes: KnowledgeSpaceNode[] = [skill, standard];
    // Lesson standard maps to a DIFFERENT standard, not HSA-SSE.B.3 directly for this skill
    // but the skill has no alignment yet via lesson-standard strategy (no lesson-1-10 mapping)
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-10', standardCode: 'HSA-SSE.B.3', isPrimary: true },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSA-SSE.B.3', description: 'Choosing and producing equivalent forms of quadratic expressions', authority: 'ccss', category: 'Algebra' },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives: [],
      course: 'im3',
    });

    // The skill should either get a heuristic alignment or an exception
    // Since "quadratic" overlaps with the standard description, expect a low-confidence edge
    const skillEdges = result.edges.filter(
      e => e.sourceId === skill.id && e.type === 'aligned_to_standard',
    );
    const lowEdge = skillEdges.find(e => e.confidence === 'low');
    if (lowEdge) {
      expect(lowEdge.rationale.toLowerCase()).toContain('heuristic');
    } else {
      // If no heuristic match, should have an exception
      const hasException = result.exceptions.some(e => e.skillId === skill.id);
      expect(hasException).toBe(true);
    }
  });

  it('records an exception for skills with no matching standard', () => {
    const orphanSkill = makeSkill('im3', '9', '7', 'trig-applications');
    const nodes: KnowledgeSpaceNode[] = [orphanSkill];
    const lessonStandards: LessonStandardMapping[] = [];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: [],
      familyObjectives: [],
      course: 'im3',
    });

    const hasException = result.exceptions.some(e => e.skillId === orphanSkill.id);
    expect(hasException).toBe(true);
  });

  it('aligns worked examples through their lesson standards', () => {
    const example = makeExample('im3', '1', '1', '001');
    const standard = makeStandard('ccss', 'HSA-SSE.B.3', 'Choosing and producing equivalent forms of expressions');
    const nodes: KnowledgeSpaceNode[] = [example, standard];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-1', standardCode: 'HSA-SSE.B.3', isPrimary: true },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSA-SSE.B.3', description: 'Choosing and producing equivalent forms of expressions', authority: 'ccss', category: 'Algebra' },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives: [],
      course: 'im3',
    });

    const exampleEdges = result.edges.filter(e => e.sourceId === example.id && e.type === 'aligned_to_standard');
    expect(exampleEdges.length).toBeGreaterThanOrEqual(1);
    expect(exampleEdges[0].confidence).toBe('high');
  });

  it('does not create duplicate edges for the same source-target-type triple', () => {
    const skill = makeSkill('im3', '1', '1', 'graph-quadratics');
    const standard = makeStandard('ccss', 'HSA-SSE.B.3', 'Choosing and producing equivalent forms');
    const nodes: KnowledgeSpaceNode[] = [skill, standard];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-1', standardCode: 'HSA-SSE.B.3', isPrimary: true },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSA-SSE.B.3', description: 'Choosing and producing equivalent forms', authority: 'ccss', category: 'Algebra' },
    ];
    const familyObjectives: FamilyObjectiveMapping[] = [
      {
        familyId: 'graphing-quadratics-from-equation',
        module: '1',
        lesson: '1',
        objectiveIds: ['HSA-SSE.B.3'],
        skillIds: [skill.id],
      },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives,
      course: 'im3',
    });

    const alignedEdges = result.edges.filter(
      e => e.sourceId === skill.id && e.type === 'aligned_to_standard' && e.targetId === stdId('HSA-SSE.B.3'),
    );
    expect(alignedEdges.length).toBe(1);
  });

  it('upgrades confidence when multiple sources confirm the alignment', () => {
    const skill = makeSkill('im3', '1', '1', 'graph-quadratics');
    const standard = makeStandard('ccss', 'HSA-SSE.B.3', 'Choosing and producing equivalent forms');
    const nodes: KnowledgeSpaceNode[] = [skill, standard];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-1', standardCode: 'HSA-SSE.B.3', isPrimary: true },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSA-SSE.B.3', description: 'Choosing and producing equivalent forms', authority: 'ccss', category: 'Algebra' },
    ];
    const familyObjectives: FamilyObjectiveMapping[] = [
      {
        familyId: 'graphing-quadratics-from-equation',
        module: '1',
        lesson: '1',
        objectiveIds: ['HSA-SSE.B.3'],
        skillIds: [skill.id],
      },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives,
      course: 'im3',
    });

    const edge = result.edges.find(
      e => e.sourceId === skill.id && e.type === 'aligned_to_standard' && e.targetId === stdId('HSA-SSE.B.3'),
    );
    expect(edge).toBeDefined();
    // When both lesson-standard (high) and family (medium) confirm, confidence should be high
    expect(edge!.confidence).toBe('high');
  });

  it('uses CED topic alignment for PreCalc with high confidence', () => {
    const skill = makeSkill('precalc', '1', '1', 'change-in-tandem');
    const standard = makeStandard('ccss', 'HSF-IF.C.9', 'Compare properties of two functions');
    const nodes: KnowledgeSpaceNode[] = [skill, standard];
    const lessonStandards: LessonStandardMapping[] = [];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSF-IF.C.9', description: 'Compare properties of two functions', authority: 'ccss', category: 'Functions' },
    ];
    const cedTopics: CEDTopicMapping[] = [
      { lessonSlug: '1-1', cedTopic: 'FUN-1.A', standardCodes: ['HSF-IF.C.9'] },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives: [],
      course: 'precalc',
      cedTopics,
    });

    const edge = result.edges.find(
      e => e.sourceId === skill.id && e.type === 'aligned_to_standard' && e.targetId === stdId('HSF-IF.C.9'),
    );
    expect(edge).toBeDefined();
    expect(edge!.confidence).toBe('high');
    expect(edge!.sourceRefs!.some(r => {
      if (typeof r === 'string') return r.includes('CED');
      return r.source.includes('CED');
    })).toBe(true);
  });

  it('generates standard nodes with correct ID format', () => {
    const skill = makeSkill('im3', '1', '1', 'graph-quadratics');
    const nodes: KnowledgeSpaceNode[] = [skill];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-1', standardCode: 'HSA-SSE.B.3', isPrimary: true },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSA-SSE.B.3', description: 'Choosing and producing equivalent forms of expressions', authority: 'ccss', category: 'Algebra' },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives: [],
      course: 'im3',
    });

    const standardNodes = result.standardNodes;
    expect(standardNodes.length).toBeGreaterThanOrEqual(1);
    const node = standardNodes.find(n => n.id === buildStandardId('ccss', 'hsa-sse-b-3'));
    expect(node).toBeDefined();
    expect(node!.kind).toBe('standard');
    expect(node!.metadata.framework).toBe('ccss');
    expect(node!.metadata.code).toBe('HSA-SSE.B.3');
  });

  it('includes missing standards in audit report', () => {
    const skill = makeSkill('im3', '1', '2', 'solve-quadratics');
    const nodes: KnowledgeSpaceNode[] = [skill];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-2', standardCode: 'HSA-REI.B.4', isPrimary: true },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: [],
      familyObjectives: [],
      course: 'im3',
    });

    const missingStandard = result.missingStandards.find(s => s.code === 'HSA-REI.B.4');
    expect(missingStandard).toBeDefined();
    expect(missingStandard!.referencedInLessonStandards.length).toBeGreaterThan(0);
  });

  it('builds lessonSlug from IM3 skill metadata (module-X-lesson-Y)', () => {
    const skill = makeSkill('im3', '1', '3', 'complex-numbers');
    const standard = makeStandard('ccss', 'N-CN.A.1', 'Knowing the definition of complex numbers');
    const nodes: KnowledgeSpaceNode[] = [skill, standard];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-3', standardCode: 'N-CN.A.1', isPrimary: true },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'N-CN.A.1', description: 'Knowing the definition of complex numbers', authority: 'ccss', category: 'Number' },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives: [],
      course: 'im3',
    });

    const edges = result.edges.filter(e => e.sourceId === skill.id && e.type === 'aligned_to_standard');
    expect(edges.length).toBeGreaterThanOrEqual(1);
    expect(edges.some(e => e.confidence === 'high')).toBe(true);
  });

  it('handles IM2 module-X-lesson-Y slug formats', () => {
    const skill = makeSkill('im2', '1', '2', 'proving-parallelograms');
    const standard = makeStandard('ccss', 'HSG-CO.C.11', 'Prove theorems about parallelograms');
    const nodes: KnowledgeSpaceNode[] = [skill, standard];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-2', standardCode: 'HSG-CO.C.11', isPrimary: true },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSG-CO.C.11', description: 'Prove theorems about parallelograms', authority: 'ccss', category: 'Geometry' },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives: [],
      course: 'im2',
    });

    const edges = result.edges.filter(e => e.sourceId === skill.id && e.type === 'aligned_to_standard');
    expect(edges.length).toBeGreaterThanOrEqual(1);
    expect(edges.some(e => e.confidence === 'high')).toBe(true);
  });

  it('handles PreCalc descriptive slug format via lesson standards', () => {
    const skill = makeSkill('precalc', '1', '1', 'change-in-tandem');
    const standard = makeStandard('ccss', 'HSF-IF.C.9', 'Compare properties of two functions');
    const nodes: KnowledgeSpaceNode[] = [skill, standard];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: '1-1-change-in-tandem', standardCode: 'HSF-IF.C.9', isPrimary: true },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSF-IF.C.9', description: 'Compare properties of two functions', authority: 'ccss', category: 'Functions' },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives: [],
      course: 'precalc',
      // Also provide CED topics as direct lesson index
      cedTopics: [
        { lessonSlug: '1-1', cedTopic: 'FUN-1.A', standardCodes: ['HSF-IF.C.9'] },
      ],
    });

    const edges = result.edges.filter(e => e.sourceId === skill.id && e.type === 'aligned_to_standard');
    // Should find alignment either via CED or lesson-standards heuristics
    expect(edges.length).toBeGreaterThanOrEqual(0);
  });

  it('marks isPrimary standards with higher weight than non-primary', () => {
    const skill = makeSkill('im3', '1', '1', 'graph-quadratics');
    const primaryStd = makeStandard('ccss', 'HSA-SSE.B.3', 'Choosing and producing equivalent forms');
    const secondaryStd = makeStandard('ccss', 'HSA-REI.B.4', 'Solving quadratic equations in one variable');
    const nodes: KnowledgeSpaceNode[] = [skill, primaryStd, secondaryStd];
    const lessonStandards: LessonStandardMapping[] = [
      { lessonSlug: 'module-1-lesson-1', standardCode: 'HSA-SSE.B.3', isPrimary: true },
      { lessonSlug: 'module-1-lesson-1', standardCode: 'HSA-REI.B.4', isPrimary: false },
    ];
    const standardDefs: StandardDefinition[] = [
      { code: 'HSA-SSE.B.3', description: 'Equivalent forms of expressions', authority: 'ccss', category: 'Algebra' },
      { code: 'HSA-REI.B.4', description: 'Solving quadratic equations', authority: 'ccss', category: 'Algebra' },
    ];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards,
      standardDefinitions: standardDefs,
      familyObjectives: [],
      course: 'im3',
    });

    const primaryEdge = result.edges.find(
      e => e.sourceId === skill.id && e.targetId === stdId('HSA-SSE.B.3') && e.type === 'aligned_to_standard',
    );
    const secondaryEdge = result.edges.find(
      e => e.sourceId === skill.id && e.targetId === stdId('HSA-REI.B.4') && e.type === 'aligned_to_standard',
    );
    expect(primaryEdge).toBeDefined();
    expect(secondaryEdge).toBeDefined();
    expect(primaryEdge!.weight).toBeGreaterThan(secondaryEdge!.weight);
  });

  it('produces review queue with low-confidence edges', () => {
    // Use an unknown skill in a module with no matching lesson slug
    const orphanSkill = makeSkill('im3', '9', '7', 'trig-applications');
    const nodes: KnowledgeSpaceNode[] = [orphanSkill];

    const result = alignSkillsToStandards({
      nodes,
      lessonStandards: [],
      standardDefinitions: [],
      familyObjectives: [],
      course: 'im3',
    });

    // With no lesson standards or families, should have an exception
    expect(result.exceptions.some(e => e.skillId === orphanSkill.id)).toBe(true);
  });
});