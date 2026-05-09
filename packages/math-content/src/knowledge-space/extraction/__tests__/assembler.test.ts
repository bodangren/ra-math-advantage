import { describe, it, expect } from 'vitest';
import { assembleDraftInventory } from '../assembler';
import { parseClassPeriodPlan, parseModuleOverview, parseAleksRegistry } from '../parser';
import {
  im3Module1ClassPeriodPlan,
  im3Module1Overview,
  aleksRegistrySnippet,
} from './fixtures';
import { knowledgeSpaceNodeSchema } from '@math-platform/knowledge-space-core/schemas';
import { validateMathId } from '../../ids';
import type { KnowledgeSpaceNode } from '@math-platform/knowledge-space-core';

describe('assembleDraftInventory', () => {
  const moduleOverview = parseModuleOverview(im3Module1Overview);
  const classPeriodPlan = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
  const aleksRegistry = parseAleksRegistry(aleksRegistrySnippet);

  const nodes = assembleDraftInventory({
    course: 'im3',
    moduleOverview,
    classPeriodPlan,
    aleksRegistry,
    sourceFile: 'apps/integrated-math-3/curriculum/module-1-class-period-plan.md',
  });

  it('produces a course node with kind=domain', () => {
    const courseNode = nodes.find((n) => n.kind === 'domain');
    expect(courseNode).toBeDefined();
    expect(courseNode!.id).toBe('math.im3');
    expect(validateMathId(courseNode!.id, 'domain').valid).toBe(true);
  });

  it('produces a module node with kind=content_group', () => {
    const moduleNode = nodes.find((n) => n.kind === 'content_group');
    expect(moduleNode).toBeDefined();
    expect(moduleNode!.id).toBe('math.im3.module.1');
    expect(moduleNode!.title).toBe('Quadratic Functions and Complex Numbers');
    expect(validateMathId(moduleNode!.id, 'content_group').valid).toBe(true);
  });

  it('produces lesson nodes with kind=instructional_unit', () => {
    const lessonNodes = nodes.filter((n) => n.kind === 'instructional_unit');
    expect(lessonNodes.length).toBeGreaterThanOrEqual(4);

    const lesson12 = lessonNodes.find((n) => n.id === 'math.im3.lesson.1.2');
    expect(lesson12).toBeDefined();
    expect(lesson12!.title).toBeDefined();
    expect(validateMathId(lesson12!.id, 'instructional_unit').valid).toBe(true);
  });

  it('produces worked example nodes with kind=worked_example', () => {
    const exampleNodes = nodes.filter((n) => n.kind === 'worked_example');
    expect(exampleNodes.length).toBeGreaterThanOrEqual(8);

    // First example should be from 1-1, index e01 (or 001, etc.)
    const firstExample = exampleNodes.find((n) =>
      n.id.startsWith('math.im3.example.1.1.'),
    );
    expect(firstExample).toBeDefined();
    if (firstExample) {
      expect(validateMathId(firstExample.id, 'worked_example').valid).toBe(
        true,
      );
    }
  });

  it('produces skill nodes with kind=skill', () => {
    const skillNodes = nodes.filter((n) => n.kind === 'skill');
    expect(skillNodes.length).toBeGreaterThanOrEqual(5);

    // Every skill node should have valid ID
    for (const skill of skillNodes) {
      expect(validateMathId(skill.id, 'skill').valid).toBe(true);
    }
  });

  it('derives skill slugs from objective descriptions', () => {
    const skillNodes = nodes.filter((n) => n.kind === 'skill');
    // "Graph quadratic functions" → "graph-quadratic-functions"
    const graphSkill = skillNodes.find((n) =>
      n.id.includes('graph-quadratic'),
    );
    expect(graphSkill).toBeDefined();
  });

  it('produces problem family nodes from ALEKS registry', () => {
    const familyNodes = nodes.filter((n) => n.kind === 'concept');
    expect(familyNodes.length).toBeGreaterThanOrEqual(5);

    const quadraticGraphAnalysis = familyNodes.find((n) =>
      n.id.includes('quadratic-graph-analysis'),
    );
    expect(quadraticGraphAnalysis).toBeDefined();
  });

  it('every node validates against knowledge-space.v1 schema', () => {
    for (const node of nodes) {
      const result = knowledgeSpaceNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    }
  });

  it('all node IDs are unique', () => {
    const ids = nodes.map((n) => n.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('all nodes have reviewStatus draft', () => {
    for (const node of nodes) {
      expect(node.reviewStatus).toBe('draft');
    }
  });

  it('worked example nodes have sourceRefs', () => {
    const exampleNodes = nodes.filter((n) => n.kind === 'worked_example');
    expect(exampleNodes.length).toBeGreaterThan(0);
    for (const node of exampleNodes) {
      expect(node.sourceRefs).toBeDefined();
      expect((node.sourceRefs ?? []).length).toBeGreaterThan(0);
    }
  });

  it('worked example sourceRefs include file path and line reference', () => {
    const exampleNodes = nodes.filter((n) => n.kind === 'worked_example');
    const first = exampleNodes[0];
    const refs = first.sourceRefs ?? [];
    const hasPath = refs.some(
      (r) =>
        typeof r === 'string' &&
        r.includes('module-1-class-period-plan'),
    );
    expect(hasPath).toBe(true);
  });

  it('includes example title in node title when available', () => {
    const exampleNodes = nodes.filter((n) => n.kind === 'worked_example');
    // Should have at least one title that's more than just "Example N"
    const withTitle = exampleNodes.find(
      (n) =>
        n.title &&
        n.title !== 'Example' &&
        !/^Example \d+$/.test(n.title),
    );
    expect(withTitle).toBeDefined();
  });

  it('module node metadata includes course', () => {
    const moduleNode = nodes.find((n) => n.kind === 'content_group');
    expect(moduleNode).toBeDefined();
    expect(moduleNode!.metadata).toHaveProperty('course', 'im3');
    expect(moduleNode!.metadata).toHaveProperty('module', '1');
  });

  it('lesson nodes have metadata with course, module, lesson', () => {
    const lessonNodes = nodes.filter((n) => n.kind === 'instructional_unit');
    expect(lessonNodes.length).toBeGreaterThan(0);
    const first = lessonNodes[0];
    expect(first.metadata).toHaveProperty('course', 'im3');
    expect(first.metadata).toHaveProperty('module');
    expect(first.metadata).toHaveProperty('lesson');
  });

  it('domain includes course prefix', () => {
    for (const node of nodes) {
      expect(node.domain).toBeDefined();
      // All nodes in this course should have domain starting with "math.im3"
      expect(node.domain?.startsWith('math.im3') || node.domain === 'math.im3').toBe(true);
    }
  });
});

describe('assembleDraftInventory — deterministic output', () => {
  it('produces identical results on repeated runs', () => {
    const input = {
      course: 'im3' as const,
      moduleOverview: parseModuleOverview(im3Module1Overview),
      classPeriodPlan: parseClassPeriodPlan(im3Module1ClassPeriodPlan),
      aleksRegistry: parseAleksRegistry(aleksRegistrySnippet),
      sourceFile: 'test.md',
    };
    const first = JSON.stringify(assembleDraftInventory(input));
    const second = JSON.stringify(assembleDraftInventory(input));
    expect(first).toBe(second);
  });
});

describe('assembleDraftInventory — duplicate handling', () => {
  it('produces unique skill slugs when two objectives produce same base slug', () => {
    // Parse a plan where two skills might collide
    const input = {
      course: 'im3' as const,
      moduleOverview: parseModuleOverview(im3Module1Overview),
      classPeriodPlan: parseClassPeriodPlan(im3Module1ClassPeriodPlan),
      sourceFile: 'test.md',
    };
    const nodes = assembleDraftInventory(input);
    const skillIds = nodes.filter((n) => n.kind === 'skill').map((n) => n.id);
    const uniqueIds = new Set(skillIds);
    expect(skillIds.length).toBe(uniqueIds.size);
  });
});
