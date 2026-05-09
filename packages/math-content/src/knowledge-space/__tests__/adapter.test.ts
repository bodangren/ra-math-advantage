import { describe, it, expect } from 'vitest';
import {
  validateMathId,
  buildSkillId,
  buildWorkedExampleId,
  buildLessonId,
  buildModuleId,
  buildCourseId,
  buildStandardId,
  MATH_COURSES,
  ID_PATTERNS,
} from '../ids';
import {
  validateMathNodeMetadata,
  validateMathEdgeMetadata,
} from '../metadata';
import { getGenerator, GENERATOR_KEYS } from '../generators/registry';
import { getRenderer, RENDERER_KEYS } from '../renderers/registry';
import { evidenceToPracticeV1 } from '../practice-v1-adapter';
import { mathDomainAdapter } from '../adapter';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';

// ---------------------------------------------------------------------------
// Task 1.1 — ID validation tests
// ---------------------------------------------------------------------------

describe('ids — valid math IDs', () => {
  it('accepts valid skill IDs', () => {
    const id = buildSkillId('im3', '1', '2', 'solve-quadratic-by-factoring');
    expect(id).toBe('math.im3.skill.1.2.solve-quadratic-by-factoring');
    expect(validateMathId(id, 'skill').valid).toBe(true);
  });

  it('accepts valid worked example IDs', () => {
    const id = buildWorkedExampleId('im3', '1', '2', '1');
    expect(id).toBe('math.im3.example.1.2.1');
    expect(validateMathId(id, 'worked_example').valid).toBe(true);
  });

  it('accepts valid lesson IDs', () => {
    const id = buildLessonId('im3', '1', '2');
    expect(id).toBe('math.im3.lesson.1.2');
    expect(validateMathId(id, 'instructional_unit').valid).toBe(true);
  });

  it('accepts valid module IDs', () => {
    const id = buildModuleId('im3', '1');
    expect(id).toBe('math.im3.module.1');
    expect(validateMathId(id, 'content_group').valid).toBe(true);
  });

  it('accepts valid course IDs', () => {
    const id = buildCourseId('im3');
    expect(id).toBe('math.im3');
    expect(validateMathId(id, 'domain').valid).toBe(true);
  });

  it('accepts valid standard IDs', () => {
    const id = buildStandardId('ccss', 'hsa.rei.b.4b');
    expect(id).toBe('math.standard.ccss.hsa.rei.b.4b');
    expect(validateMathId(id, 'standard').valid).toBe(true);
  });

  it('accepts all supported courses', () => {
    for (const course of MATH_COURSES) {
      const id = buildCourseId(course);
      expect(validateMathId(id, 'domain').valid).toBe(true);
    }
  });
});

describe('ids — malformed math IDs', () => {
  it('rejects IDs with wrong domain prefix', () => {
    const result = validateMathId('english.im3.skill.1.2.slug', 'skill');
    expect(result.valid).toBe(false);
    expect(result.errors?.[0]).toContain('prefix');
  });

  it('rejects IDs with unsupported course', () => {
    const result = validateMathId('math.im4.skill.1.2.slug', 'skill');
    expect(result.valid).toBe(false);
    expect(result.errors?.[0]).toContain('course');
  });

  it('rejects skill IDs with missing segments', () => {
    const result = validateMathId('math.im3.skill.1', 'skill');
    expect(result.valid).toBe(false);
  });

  it('rejects IDs with empty slug', () => {
    const result = validateMathId('math.im3.skill.1.2.', 'skill');
    expect(result.valid).toBe(false);
  });

  it('rejects lesson IDs with wrong segment count', () => {
    const result = validateMathId('math.im3.lesson.1.2.3', 'instructional_unit');
    expect(result.valid).toBe(false);
  });

  it('rejects standard IDs without authority', () => {
    const result = validateMathId('math.standard..hsa.rei.b.4b', 'standard');
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Task 1.2 — Metadata validation tests
// ---------------------------------------------------------------------------

describe('metadata — node metadata', () => {
  it('accepts valid skill metadata', () => {
    const node: KnowledgeSpaceNode = {
      id: 'math.im3.skill.1.2.solve-quadratic',
      kind: 'skill',
      title: 'Solve quadratics',
      domain: 'math.im3',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '01',
        lesson: '02',
        componentKey: 'step-by-step-solver',
        generatorKey: 'quadratic-factoring',
        difficulty: 0.5,
        familyKey: 'quadratic-equations',
      },
    };
    const result = validateMathNodeMetadata(node);
    expect(result.valid).toBe(true);
  });

  it('rejects skill metadata missing required fields', () => {
    const node: KnowledgeSpaceNode = {
      id: 'math.im3.skill.1.2.solve-quadratic',
      kind: 'skill',
      title: 'Solve quadratics',
      domain: 'math.im3',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        // missing module, lesson
      },
    };
    const result = validateMathNodeMetadata(node);
    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.includes('module'))).toBe(true);
    expect(result.errors?.some((e) => e.includes('lesson'))).toBe(true);
  });

  it('accepts valid worked_example metadata', () => {
    const node: KnowledgeSpaceNode = {
      id: 'math.im3.example.1.2.1',
      kind: 'worked_example',
      title: 'Example',
      domain: 'math.im3',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '01',
        lesson: '02',
        componentKey: 'step-by-step-solver',
      },
    };
    const result = validateMathNodeMetadata(node);
    expect(result.valid).toBe(true);
  });

  it('accepts valid standard metadata', () => {
    const node: KnowledgeSpaceNode = {
      id: 'math.standard.ccss.hsa.rei.b.4b',
      kind: 'standard',
      title: 'CCSS Standard',
      domain: 'math.im3',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {
        framework: 'CCSS',
        code: 'HSA.REI.B.4b',
      },
    };
    const result = validateMathNodeMetadata(node);
    expect(result.valid).toBe(true);
  });

  it('rejects invalid edge metadata', () => {
    const edge: KnowledgeSpaceEdge = {
      id: 'edge.test',
      type: 'prerequisite_for',
      sourceId: 'a',
      targetId: 'b',
      weight: 0.5,
      confidence: 'medium',
      sourceRefs: ['test'],
      reviewStatus: 'draft',
      metadata: {
        lessonOrder: 'not-a-number',
      },
    };
    const result = validateMathEdgeMetadata(edge);
    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.includes('lessonOrder'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Task 1.3 — Registry round-trip tests
// ---------------------------------------------------------------------------

describe('generator registry', () => {
  it('returns a generator stub for known keys', () => {
    for (const key of GENERATOR_KEYS) {
      const gen = getGenerator(key);
      expect(gen).toBeDefined();
      expect(gen.key).toBe(key);
      expect(typeof gen.generate).toBe('function');
    }
  });

  it('throws typed error for unknown generator key', () => {
    expect(() => getGenerator('unknown-generator')).toThrow('Unknown generator key');
  });
});

describe('renderer registry', () => {
  it('returns a renderer descriptor for known keys', () => {
    for (const key of RENDERER_KEYS) {
      const renderer = getRenderer(key);
      expect(renderer).toBeDefined();
      expect(renderer.key).toBe(key);
      expect(renderer.propsSchema).toBeDefined();
    }
  });

  it('throws typed error for unknown renderer key', () => {
    expect(() => getRenderer('unknown-renderer')).toThrow('Unknown renderer key');
  });
});

// ---------------------------------------------------------------------------
// Task 1.4 — practice.v1 evidence bridge tests
// ---------------------------------------------------------------------------

describe('practice-v1-adapter', () => {
  it('converts generic evidence to PracticeSubmissionPart[]', () => {
    const evidence = {
      parts: [
        { partId: 'p1', answer: 'x = 3', correct: true },
        { partId: 'p2', answer: 'x = -2', correct: true },
      ],
      timing: { wallClockMs: 45000, activeTimeMs: 42000 },
    };
    const parts = evidenceToPracticeV1(evidence);
    expect(parts).toHaveLength(2);
    expect(parts[0].partId).toBe('p1');
    expect(parts[0].rawAnswer).toBe('x = 3');
    expect(parts[0].isCorrect).toBe(true);
    expect(parts[0].wallClockMs).toBe(45000);
    expect(parts[0].activeMs).toBe(42000);
    expect(parts[1].wallClockMs).toBe(45000);
  });

  it('handles single-part evidence', () => {
    const evidence = {
      parts: [{ partId: 'q1', answer: 42, correct: false }],
    };
    const parts = evidenceToPracticeV1(evidence);
    expect(parts).toHaveLength(1);
    expect(parts[0].partId).toBe('q1');
    expect(parts[0].isCorrect).toBe(false);
  });

  it('handles empty evidence', () => {
    const parts = evidenceToPracticeV1({ parts: [] });
    expect(parts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Adapter integration
// ---------------------------------------------------------------------------

describe('mathDomainAdapter', () => {
  it('exposes the correct domain prefix', () => {
    expect(mathDomainAdapter.domain).toBe('math');
  });

  it('validates node metadata via adapter', () => {
    const node: KnowledgeSpaceNode = {
      id: 'math.im3.skill.1.2.solve-quadratic',
      kind: 'skill',
      title: 'Solve quadratics',
      domain: 'math.im3',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '01', lesson: '02' },
    };
    const result = mathDomainAdapter.validateNodeMetadata(node);
    expect(result.valid).toBe(true);
  });

  it('rejects invalid node metadata via adapter', () => {
    const node: KnowledgeSpaceNode = {
      id: 'math.im3.skill.1.2.solve-quadratic',
      kind: 'skill',
      title: 'Solve quadratics',
      domain: 'math.im3',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {}, // missing required fields
    };
    const result = mathDomainAdapter.validateNodeMetadata(node);
    expect(result.valid).toBe(false);
  });

  it('validates edge metadata via adapter', () => {
    const edge: KnowledgeSpaceEdge = {
      id: 'edge.test',
      type: 'prerequisite_for',
      sourceId: 'a',
      targetId: 'b',
      weight: 0.5,
      confidence: 'medium',
      sourceRefs: ['test'],
      reviewStatus: 'draft',
      metadata: { lessonOrder: 1 },
    };
    const result = mathDomainAdapter.validateEdgeMetadata(edge);
    expect(result.valid).toBe(true);
  });

  it('exposes generator registry', () => {
    expect(mathDomainAdapter.getGenerator).toBeDefined();
    const gen = mathDomainAdapter.getGenerator('algebraic-step-solver');
    expect(gen.key).toBe('algebraic-step-solver');
  });

  it('exposes renderer registry', () => {
    expect(mathDomainAdapter.getRenderer).toBeDefined();
    const renderer = mathDomainAdapter.getRenderer('step-by-step-solver');
    expect(renderer.key).toBe('step-by-step-solver');
  });

  it('exposes evidence bridge', () => {
    expect(mathDomainAdapter.evidenceToPracticeV1).toBeDefined();
    const parts = mathDomainAdapter.evidenceToPracticeV1({
      parts: [{ partId: 'q1', answer: '42', correct: true }],
    });
    expect(parts).toHaveLength(1);
  });

  it('exposes idPatterns matching all supported kinds', () => {
    expect(mathDomainAdapter.idPatterns).toBe(ID_PATTERNS);
    expect(mathDomainAdapter.idPatterns.skill).toBeInstanceOf(RegExp);
    expect(mathDomainAdapter.idPatterns.skill.test('math.im3.skill.1.2.slug')).toBe(true);
    expect(mathDomainAdapter.idPatterns.skill.test('bad-id')).toBe(false);
  });

  it('validates a correct ID via adapter.validateId', () => {
    const id = buildSkillId('im3', '1', '2', 'solve-quadratic');
    const result = mathDomainAdapter.validateId(id, 'skill');
    expect(result.valid).toBe(true);
  });

  it('rejects a malformed ID via adapter.validateId', () => {
    const result = mathDomainAdapter.validateId('english.gse.skill.b1.slug', 'skill');
    expect(result.valid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });
});
